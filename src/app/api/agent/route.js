// src/app/api/agent/route.js
// AI Agent — otomatis cari berita, tulis artikel, publish ke Firestore
// Trigger: Vercel Cron setiap 6 jam ATAU manual GET /api/agent?secret=...

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// ── Firebase Admin init (server-side)
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

// ── Slug generator
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

// ── Pick random topics for this run
function pickTopics(topics, count) {
  const shuffled = [...topics].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ── Search berita via Tavily
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
      max_results: 5,
      topic: 'news',
    }),
  });
  if (!res.ok) throw new Error(`Tavily error: ${res.status}`);
  return res.json();
}

// ── Sleep helper
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── Generate artikel via Gemini (dengan retry)
async function generateArticle({ topic, searchResults }, retries = 3) {
  const sourceSummaries = searchResults.results
    .slice(0, 4)
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.content?.slice(0, 400) || r.snippet || ''}`)
    .join('\n\n');

  const prompt = `Kamu adalah jurnalis teknologi dan keuangan senior yang menulis untuk blog FOSHT (fosht.vercel.app).

KONTEKS BLOG:
- Tema: teknologi, crypto, market global, ekonomi Indonesia, analisis keuangan
- Gaya: profesional tapi mudah dipahami, analitis, berbasis data
- Target pembaca: investor pemula-menengah, tech enthusiast, profesional muda Indonesia

TOPIK ARTIKEL: ${topic}

DATA BERITA TERKINI:
${sourceSummaries}

INSTRUKSI:
Tulis artikel blog lengkap dalam Bahasa Indonesia berdasarkan data berita di atas.

WAJIB mengikuti format JSON berikut (HANYA JSON, tidak ada teks lain):
{
  "title": "Judul artikel menarik dan SEO-friendly (max 80 karakter)",
  "excerpt": "Ringkasan artikel 1-2 kalimat yang menarik untuk preview (max 160 karakter)",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "content": "Konten artikel lengkap dalam format HTML. Gunakan: <h2> untuk subheading, <p> untuk paragraf, <strong> untuk highlight, <ul><li> untuk list. MINIMUM 600 kata. JANGAN gunakan markdown.",
  "coverImagePrompt": "Prompt bahasa Inggris untuk generate gambar cover artikel (deskriptif, artistic, futuristic style)",
  "hasRealtimeData": true/false
}

PENTING:
- Artikel harus fresh, relevan dengan berita hari ini
- Analisis mendalam, bukan hanya rangkuman
- Sertakan data/angka dari berita jika ada
- Judul harus clickbait tapi tidak sensasional
- Tags maksimal 5, relevan dan spesifik
- hasRealtimeData: true jika artikel membahas harga/chart realtime (crypto, saham, komoditas)`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!res.ok) {
    if (res.status === 429 && retries > 0) {
      console.log(`[Agent] Gemini 429 — retrying in 30s... (${retries} retries left)`);
      await sleep(30000);
      return generateArticle({ topic, searchResults }, retries - 1);
    }
    throw new Error(`Gemini error: ${res.status}`);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned empty response');

  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// ── Generate image via Pollinations.ai (gratis, no API key)
async function generateCoverImage(prompt) {
  const encodedPrompt = encodeURIComponent(
    `${prompt}, dark background, cyan accent, futuristic, professional, high quality, 16:9`
  );
  // Pollinations generates image from URL — return URL langsung
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=630&nologo=true&seed=${Date.now()}`;

  // Verify image accessible
  try {
    const check = await fetch(imageUrl, { method: 'HEAD', signal: AbortSignal.timeout(8000) });
    if (check.ok) return imageUrl;
  } catch {
    // fallback: return null, artikel tetap publish tanpa cover
  }
  return null;
}

// ── Check apakah artikel dengan slug ini sudah ada
async function slugExists(db, slug) {
  const snap = await db.collection('posts').where('slug', '==', slug).limit(1).get();
  return !snap.empty;
}

// ── Publish artikel ke Firestore
async function publishArticle(db, article, coverImage) {
  const slug = slugify(article.title);

  // Cek duplikat
  if (await slugExists(db, slug)) {
    return { skipped: true, reason: 'duplicate slug', slug };
  }

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

// ── Main handler
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const isCron = request.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`;

  // Auth check — hanya cron atau manual dengan secret
  if (!isCron && secret !== process.env.AGENT_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Lazy import topics (avoid top-level import issues)
  const { AGENT_TOPICS, ARTICLES_PER_RUN } = await import('./topics.js');

  const db = getAdminDb();
  const results = [];
  const topics  = pickTopics(AGENT_TOPICS, ARTICLES_PER_RUN);

  for (const topic of topics) {
    try {
      console.log(`[Agent] Processing topic: ${topic}`);

      // 1. Search berita
      const searchData = await searchNews(topic);
      if (!searchData.results?.length) {
        results.push({ topic, error: 'No search results' });
        continue;
      }

      // 2. Generate artikel
      const article = await generateArticle({ topic, searchResults: searchData });

      // 3. Generate atau ambil cover image
      let coverImage = null;
      if (article.hasRealtimeData) {
        // Pakai image dari hasil search jika ada
        const imgResult = searchData.results.find(r => r.url?.match(/\.(jpg|png|webp)/i));
        coverImage = imgResult?.url || null;
      }
      if (!coverImage && article.coverImagePrompt) {
        coverImage = await generateCoverImage(article.coverImagePrompt);
      }

      // 4. Publish ke Firestore
      const publishResult = await publishArticle(db, article, coverImage);
      results.push({ topic, ...publishResult });

      // Delay antar artikel supaya tidak hit rate limit
      await new Promise(r => setTimeout(r, 2000));

    } catch (err) {
      console.error(`[Agent] Error on topic "${topic}":`, err.message);
      results.push({ topic, error: err.message });
    }
  }

  return Response.json({
    success: true,
    timestamp: new Date().toISOString(),
    processed: topics.length,
    results,
  });
}