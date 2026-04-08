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
      max_results: 3,
      topic: 'news',
    }),
  });
  if (!res.ok) throw new Error(`Tavily error: ${res.status}`);
  return res.json();
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function safeParseJSON(text) {
  // Step 1: remove markdown fences
  let raw = text.replace(/```json|```/g, '').trim();

  // Step 2: extract JSON object
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object found in response');
  let jsonStr = match[0];

  // Step 3: try direct parse first
  try { return JSON.parse(jsonStr); } catch (_) {}

  // Step 4: replace literal newlines/tabs INSIDE string values only
  // We do this by replacing all raw \n \r \t with space (safe for HTML content)
  jsonStr = jsonStr
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip bad control chars
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\t/g, ' ');

  try { return JSON.parse(jsonStr); } catch (_) {}

  // Step 5: fix unclosed braces
  let open  = (jsonStr.match(/\{/g) || []).length;
  let close = (jsonStr.match(/\}/g) || []).length;
  while (close < open) { jsonStr += '}'; close++; }

  return JSON.parse(jsonStr);
}

async function generateArticle({ topic, searchResults }, retries = 2) {
  const sourceSummaries = searchResults.results
    .slice(0, 3)
    .map((r, i) => `[${i + 1}] ${r.title}: ${r.content?.slice(0, 250) || r.snippet || ''}`)
    .join(' | ');

const prompt = `Kamu adalah jurnalis senior FOSHT (fosht.vercel.app). Tema: teknologi, crypto, market global, ekonomi Indonesia.

TOPIK: ${topic}
BERITA TERKINI: ${sourceSummaries}

Tulis artikel blog PANJANG dan MENDALAM min 800 kata dalam Bahasa Indonesia. Response HARUS berupa JSON valid satu baris tanpa newline di dalam value string.

PANDUAN KONTEN:
- Mulai dengan intro yang menarik dan kontekstual
- Bagi artikel menjadi minimal 5 section dengan <h2>
- Setiap section minimal 2-3 paragraf panjang
- Sertakan data/angka/statistik yang relevan dari berita
- Tambahkan analisis mendalam, bukan hanya rangkuman
- Jika topik crypto/saham/komoditas: tambahkan widget TradingView menggunakan iframe
- Jika topik ekonomi global: tambahkan tabel perbandingan data
- Akhiri dengan kesimpulan dan outlook ke depan

WIDGET REALTIME (gunakan jika relevan):
- Bitcoin/crypto price: <div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:180px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22BINANCE%3ABTCUSDT%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
- S&P 500: ganti symbol ke FOREXCOM:SPXUSD
- Gold: ganti symbol ke OANDA:XAUUSD
- Chart mingguan BTC: <div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:450px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=BINANCE%3ABTCUSDT&interval=W&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>

FORMAT JSON WAJIB (satu baris, NO newline dalam value):
{"title":"Judul artikel SEO-friendly max 80 karakter","excerpt":"Ringkasan 1-2 kalimat menarik","tags":["tag1","tag2","tag3"],"content":"Konten HTML lengkap PANJANG. JANGAN ada newline atau tab di dalam string. Semua dalam satu baris.","coverImagePrompt":"Detailed English prompt for futuristic dark themed cover image","hasRealtimeData":false}

PENTING: Response hanya JSON. Tidak ada teks lain. Tidak ada newline di dalam value string.`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    if (res.status === 429 && retries > 0) {
      console.log(`[Agent] Groq 429. Retrying in 5s...`);
      await sleep(5000);
      return generateArticle({ topic, searchResults }, retries - 1);
    }
    throw new Error(`Groq error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq returned empty response');

  return safeParseJSON(text);
}

async function generateCoverImage(prompt) {
  try {
    const encodedPrompt = encodeURIComponent(`${prompt}, dark background, cyan accent, futuristic, 16:9`);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=630&nologo=true&seed=${Date.now()}`;
    
    // Upload ke Cloudinary supaya gambar tersimpan permanen
    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: pollinationsUrl,
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
          folder: 'fosht-blog/ai-agent',
        }),
      }
    );
    
    if (cloudinaryRes.ok) {
      const data = await cloudinaryRes.json();
      return data.secure_url;
    }
  } catch {}
  
  // Fallback: langsung pakai pollinations URL
  const encodedPrompt = encodeURIComponent(`${prompt}, dark background, cyan accent, futuristic, 16:9`);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=630&nologo=true`;
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
    const topics = pickTopics(AGENT_TOPICS, ARTICLES_PER_RUN);

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

      } catch (err) {
        console.error(`[Agent] Error on "${topic}":`, err.message);
        results.push({ topic, error: err.message });
      }
    }

    return NextResponse.json({ status: 'success', processed: topics.length, results }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Alias GET → POST supaya cron-job.org bisa trigger via GET
export async function GET(request) {
  return POST(request);
}