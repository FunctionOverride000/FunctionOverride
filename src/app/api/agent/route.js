// src/app/api/agent/route.js
import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { AGENT_TOPICS, ARTICLES_PER_RUN } from './topics';

export const dynamic = 'force-dynamic'; 
export const maxDuration = 60; 

function getAdminDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80);
}

function pickTopics(topics, count) {
  const shuffled = [...topics].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function searchNews(query) {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: 'advanced',
      include_answer: true,
      include_raw_content: false,
      max_results: 3, // LEAD DEV FIX: Turunkan dari 5 ke 3 agar lebih cepat
      topic: 'news',
    }),
  });
  if (!res.ok) throw new Error(`Tavily error: ${res.status}`);
  return res.json();
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function generateArticle({ topic, searchResults }, retries = 2) {
  const sourceSummaries = searchResults.results
    .slice(0, 3)
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.content?.slice(0, 300) || r.snippet || ''}`)
    .join('\n\n');

  const prompt = `Kamu jurnalis FOSHT (fosht.vercel.app). Tema: teknologi/crypto/market. Target: investor pemula-menengah.
TOPIK: ${topic}
BERITA TERKINI: ${sourceSummaries}

Tulis artikel min 500 kata. WAJIB HANYA format JSON:
{
  "title": "Judul SEO (max 80 char)",
  "excerpt": "Ringkasan 2 kalimat",
  "tags": ["tag1", "tag2"],
  "content": "Konten HTML lengkap (<h2>, <p>, <strong>, <ul><li>). Tanpa markdown.",
  "coverImagePrompt": "Prompt Inggris untuk gambar (futuristic style)",
  "hasRealtimeData": true
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7, // Kurangi dikit agar lebih cepat dan deterministik
          maxOutputTokens: 2048, // LEAD DEV FIX: Jangan 8192, terlalu berat
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!res.ok) {
    if (res.status === 429 && retries > 0) {
      console.log(`[Agent] Gemini 429. Retrying in 2s...`);
      await sleep(2000); // LEAD DEV FIX: Ubah tidur dari 30 DETIK menjadi 2 DETIK saja
      return generateArticle({ topic, searchResults }, retries - 1);
    }
    throw new Error(`Gemini error: ${res.status}`);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned empty response');

  let clean = text.replace(/```json|```/g, '').trim();
  try { return JSON.parse(clean); } catch {
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {
        let fixed = match[0];
        let open = (fixed.match(/\{/g) || []).length;
        let close = (fixed.match(/\}/g) || []).length;
        while (close < open) { fixed += '}'; close++; }
        return JSON.parse(fixed);
      }
    }
    throw new Error('Failed to parse JSON');
  }
}

async function generateCoverImage(prompt) {
  const encodedPrompt = encodeURIComponent(`${prompt}, cyan accent, futuristic, 16:9`);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=630&nologo=true&seed=${Date.now()}`;
  try {
    // LEAD DEV FIX: Timeout dipersingkat jadi 4 detik (jangan 8 detik)
    const check = await fetch(imageUrl, { method: 'HEAD', signal: AbortSignal.timeout(4000) });
    if (check.ok) return imageUrl;
  } catch { }
  return null;
}

async function slugExists(db, slug) {
  const snap = await db.collection('posts').where('slug', '==', slug).limit(1).get();
  return !snap.empty;
}

async function publishArticle(db, article, coverImage) {
  const slug = slugify(article.title);
  if (await slugExists(db, slug)) return { skipped: true, reason: 'duplicate slug', slug };

  const doc = {
    title:      article.title,
    slug,
    excerpt:    article.excerpt,
    content:    article.content,
    tags:       article.tags || [],
    coverImage: coverImage || null,
    published:  true,
    views:      0,
    source:     'ai-agent',
    createdAt:  FieldValue.serverTimestamp(),
    updatedAt:  FieldValue.serverTimestamp(),
  };

  const ref = await db.collection('posts').add(doc);
  return { success: true, id: ref.id, slug, title: article.title };
}

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const isCron = request.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`;

    if (!isCron && secret !== process.env.AGENT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getAdminDb();
    const results = [];
    const topics  = pickTopics(AGENT_TOPICS, ARTICLES_PER_RUN);

    for (const topic of topics) {
      try {
        console.log(`[Agent] Processing: ${topic}`);
        const searchData = await searchNews(topic);
        if (!searchData.results?.length) {
          results.push({ topic, error: 'No search results' });
          continue;
        }

        const article = await generateArticle({ topic, searchResults: searchData });
        
        let coverImage = null;
        if (article.hasRealtimeData) {
          const imgResult = searchData.results.find(r => r.url?.match(/\.(jpg|png|webp)/i));
          coverImage = imgResult?.url || null;
        }
        if (!coverImage && article.coverImagePrompt) {
          coverImage = await generateCoverImage(article.coverImagePrompt);
        }

        const publishResult = await publishArticle(db, article, coverImage);
        results.push({ topic, ...publishResult });

        // LEAD DEV FIX: Hapus sleep(2000) di sini. Tidak perlu delay jika cuma 1 artikel

      } catch (err) {
        console.error(`[Agent] Error on "${topic}":`, err.message);
        results.push({ topic, error: err.message });
      }
    }

    return NextResponse.json({ status: "success", processed: topics.length, results }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Alias GET → POST supaya cron-job.org bisa trigger via GET
export async function GET(request) {
  return POST(request);
}