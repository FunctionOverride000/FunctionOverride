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
      max_results: 5,
      topic: 'news',
    }),
  });
  if (!res.ok) throw new Error(`Tavily error: ${res.status}`);
  return res.json();
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function safeParseJSON(text) {
  let raw = text.replace(/```json|```/g, '').trim();
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object found in response');
  let jsonStr = match[0];
  try { return JSON.parse(jsonStr); } catch (_) {}
  jsonStr = jsonStr
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\t/g, ' ');
  try { return JSON.parse(jsonStr); } catch (_) {}
  let open  = (jsonStr.match(/\{/g) || []).length;
  let close = (jsonStr.match(/\}/g) || []).length;
  while (close < open) { jsonStr += '}'; close++; }
  return JSON.parse(jsonStr);
}

// ── Generate image URL via Pollinations (langsung, tanpa upload Cloudinary)
function generateImageUrl(prompt, seed) {
  const encodedPrompt = encodeURIComponent(
    `${prompt}, dark background, cyan neon accent, futuristic tech, cinematic lighting, ultra detailed, 16:9`
  );
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=630&nologo=true&model=flux&seed=${seed || Date.now()}`;
}

async function generateArticle({ topic, searchResults }, retries = 2) {
  const sourceSummaries = searchResults.results
    .slice(0, 5)
    .map((r, i) => `[${i + 1}] ${r.title}: ${r.content?.slice(0, 300) || r.snippet || ''}`)
    .join(' | ');

  const systemPrompt = `Kamu adalah jurnalis profesional senior di FOSHT (fosht.vercel.app) yang menulis tentang teknologi, crypto, market global, dan ekonomi Indonesia. WAJIB menulis artikel SANGAT PANJANG minimal 1200 kata dengan analisis mendalam dan data konkret. WAJIB menyertakan widget TradingView jika topik berkaitan dengan aset keuangan apapun. Response HARUS JSON valid satu baris tanpa newline dalam value string.`;

  const userPrompt = `TOPIK: ${topic}
BERITA TERKINI: ${sourceSummaries}

Tulis artikel blog SANGAT PANJANG dan MENDALAM minimal 1200 kata dalam Bahasa Indonesia.

PANDUAN WAJIB:
1. Intro panjang 3-4 paragraf dengan konteks global dan lokal yang kuat
2. WAJIB minimal 6 section dengan <h2>, setiap section WAJIB minimal 3 paragraf panjang
3. Sertakan data/angka/statistik spesifik dari berita
4. Analisis mendalam: sebab-akibat, dampak jangka pendek dan panjang
5. Gunakan elemen visual HTML:

STAT BOXES (gunakan untuk angka penting):
<div style="display:flex;gap:12px;flex-wrap:wrap;margin:1.5em 0;"><div style="flex:1;min-width:140px;background:#0a0f1e;border:1px solid rgba(0,243,255,0.2);border-radius:6px;padding:16px;text-align:center;"><div style="font-size:2em;font-weight:900;color:#00f3ff;">ANGKA</div><div style="font-size:11px;color:#666;margin-top:4px;">LABEL</div></div><div style="flex:1;min-width:140px;background:#0a0f1e;border:1px solid rgba(0,243,255,0.2);border-radius:6px;padding:16px;text-align:center;"><div style="font-size:2em;font-weight:900;color:#00f3ff;">ANGKA</div><div style="font-size:11px;color:#666;margin-top:4px;">LABEL</div></div></div>

INSIGHT BOX:
<div style="background:#0a0f1e;border-left:3px solid #00f3ff;border-radius:0 6px 6px 0;padding:16px 20px;margin:1.5em 0;"><strong style="color:#00f3ff;font-size:11px;letter-spacing:2px;">💡 INSIGHT</strong><p style="margin:8px 0 0;color:#ccc;font-size:14px;">ISI INSIGHT MENDALAM</p></div>

WARNING BOX:
<div style="background:#1a0a0a;border-left:3px solid #ff6b6b;border-radius:0 6px 6px 0;padding:16px 20px;margin:1.5em 0;"><strong style="color:#ff6b6b;font-size:11px;letter-spacing:2px;">⚠ PERHATIAN</strong><p style="margin:8px 0 0;color:#ccc;font-size:14px;">ISI WARNING</p></div>

PROGRESS BAR:
<div style="margin:1.5em 0;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#666;margin-bottom:6px;"><span>LABEL</span><span style="color:#00f3ff;">NILAI%</span></div><div style="background:#111;border-radius:3px;height:6px;"><div style="background:linear-gradient(90deg,#00f3ff,#0080ff);height:6px;border-radius:3px;width:NILAI%;"></div></div></div>

6. WAJIB placeholder gambar {{IMAGE_1}} dan {{IMAGE_2}} di tengah artikel (di section ke-2 dan ke-4), diikuti caption:
<p style="text-align:center;font-size:12px;color:#555;margin-top:-1em;">CAPTION</p>

7. WAJIB Widget TradingView jika topik keuangan — gunakan template ini dan ganti SYMBOL:

Single quote widget:
<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:180px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22SYMBOL%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>

Chart weekly widget:
<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:450px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=SYMBOL&interval=W&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>

DAFTAR SYMBOL:
Bitcoin=BINANCE:BTCUSDT | Ethereum=BINANCE:ETHUSDT | BNB=BINANCE:BNBUSDT | Solana=BINANCE:SOLUSDT | XRP=BINANCE:XRPUSDT | S&P500=FOREXCOM:SPXUSD | Nasdaq=FOREXCOM:NSXUSD | DowJones=FOREXCOM:DJI | Gold=OANDA:XAUUSD | Silver=OANDA:XAGUSD | OilWTI=OANDA:WTICOUSD | OilBrent=OANDA:BCOUSD | EURUSD=FOREXCOM:EURUSD | USDIDR=FOREXCOM:USDIDR | IHSG=IDX:COMPOSITE | BTCDominance=CRYPTOCAP:BTC.D | Shanghai=SSE:000001 | Nikkei=TVC:NI225 | FTSE=TVC:UKX

8. Akhiri dengan kesimpulan panjang + outlook + blockquote

FORMAT JSON WAJIB (SATU BARIS, NO NEWLINE DALAM VALUE):
{"title":"Judul SEO max 80 karakter","excerpt":"Ringkasan 1-2 kalimat menarik max 160 karakter","tags":["tag1","tag2","tag3","tag4"],"content":"KONTEN HTML SANGAT PANJANG MINIMAL 1200 KATA dengan semua elemen di atas. NO newline. Satu baris.","coverImagePrompt":"Detailed cinematic English prompt for cover image related to topic","imagePrompt2":"Detailed English prompt for 2nd inline image (different angle/focus)","hasRealtimeData":false}

INGAT: Minimal 1200 kata. Widget TradingView WAJIB jika ada aset keuangan. Response hanya JSON.`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.75,
      max_tokens: 8192,
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

async function slugExists(db, slug) {
  const snap = await db.collection('posts').where('slug', '==', slug).limit(1).get();
  return !snap.empty;
}

async function publishArticle(db, article, coverImage, img2) {
  const slug = slugify(article.title);
  if (await slugExists(db, slug)) return { skipped: true, reason: 'duplicate slug', slug };

  let content = article.content || '';

  // Replace placeholders
  if (img2) {
    content = content.replace(
      /\{\{IMAGE_1\}\}/g,
      `<img src="${img2}" alt="Ilustrasi artikel" style="width:100%;max-width:100%;border-radius:8px;border:1px solid rgba(0,243,255,0.1);margin:1.5em 0;" />`
    );
  }
  // Generate IMAGE_2 dengan seed berbeda
  const img2b = generateImageUrl(article.imagePrompt2 || article.coverImagePrompt || 'futuristic technology', Date.now() + 999);
  content = content.replace(
    /\{\{IMAGE_2\}\}/g,
    `<img src="${img2b}" alt="Ilustrasi artikel" style="width:100%;max-width:100%;border-radius:8px;border:1px solid rgba(0,243,255,0.1);margin:1.5em 0;" />`
  );
  // Hapus placeholder yang tidak terganti
  content = content.replace(/\{\{IMAGE_[123]\}\}/g, '');

  const doc = {
    title:      article.title,
    slug,
    excerpt:    article.excerpt,
    content,
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

        const seed = Date.now();
        const coverImage = generateImageUrl(article.coverImagePrompt || topic, seed);
        const img2       = generateImageUrl(article.imagePrompt2 || article.coverImagePrompt || topic, seed + 500);

        const publishResult = await publishArticle(db, article, coverImage, img2);
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