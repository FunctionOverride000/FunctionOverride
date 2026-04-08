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

function generateImageUrl(prompt, seed) {
  const encodedPrompt = encodeURIComponent(
    `${prompt}, dark background, cyan neon accent, futuristic tech, cinematic lighting, ultra detailed, 16:9`
  );
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=630&nologo=true&model=flux&seed=${seed || Date.now()}`;
}

async function generateArticle({ topic, searchResults }, retries = 2) {
  const sourceSummaries = searchResults.results
    .slice(0, 5)
    .map((r, i) => `[${i + 1}] ${r.title}: ${r.content?.slice(0, 400) || r.snippet || ''}`)
    .join('\n');

  const tavily_answer = searchResults.answer || '';

  const systemPrompt = `Kamu adalah jurnalis profesional senior FOSHT yang menulis tentang teknologi, crypto, market global, dan ekonomi Indonesia. WAJIB menulis artikel SANGAT PANJANG minimal 1200 kata dengan analisis mendalam. WAJIB gunakan data dari berita yang diberikan, bukan dari memori training. WAJIB sertakan widget realtime jika topik berkaitan dengan keuangan. Response HARUS JSON valid satu baris tanpa newline dalam value.`;

  const userPrompt = `TOPIK: ${topic}

RINGKASAN BERITA (dari Tavily, data terkini):
${tavily_answer}

DETAIL BERITA TERKINI:
${sourceSummaries}

INSTRUKSI KRITIS - BACA BAIK-BAIK:
1. WAJIB gunakan angka/data PERSIS dari berita di atas. Jangan gunakan data dari memorimu yang mungkin sudah outdated.
2. Jika berita menyebut harga/kurs/angka spesifik, WAJIB pakai angka itu.
3. Jika tidak ada angka spesifik di berita, tulis analisis tanpa menyebut angka pasti.

Tulis artikel SANGAT PANJANG minimal 1200 kata dalam Bahasa Indonesia.

STRUKTUR WAJIB:
- Intro 3-4 paragraf panjang dengan konteks global dan lokal
- Minimal 6 section <h2>, masing-masing minimal 3 paragraf
- Kesimpulan + outlook + blockquote

ELEMEN INTERAKTIF WAJIB (copy paste HTML ini, isi dengan data dari berita):

STAT BOX (untuk angka penting dari berita):
<div style="display:flex;gap:12px;flex-wrap:wrap;margin:1.5em 0;"><div style="flex:1;min-width:140px;background:#0a0f1e;border:1px solid rgba(0,243,255,0.2);border-radius:6px;padding:16px;text-align:center;"><div style="font-size:2em;font-weight:900;color:#00f3ff;">ANGKA</div><div style="font-size:11px;color:#666;margin-top:4px;">LABEL</div></div><div style="flex:1;min-width:140px;background:#0a0f1e;border:1px solid rgba(0,243,255,0.2);border-radius:6px;padding:16px;text-align:center;"><div style="font-size:2em;font-weight:900;color:#00f3ff;">ANGKA</div><div style="font-size:11px;color:#666;margin-top:4px;">LABEL</div></div><div style="flex:1;min-width:140px;background:#0a0f1e;border:1px solid rgba(0,243,255,0.2);border-radius:6px;padding:16px;text-align:center;"><div style="font-size:2em;font-weight:900;color:#00f3ff;">ANGKA</div><div style="font-size:11px;color:#666;margin-top:4px;">LABEL</div></div></div>

INSIGHT BOX:
<div style="background:#0a0f1e;border-left:3px solid #00f3ff;border-radius:0 6px 6px 0;padding:16px 20px;margin:1.5em 0;"><strong style="color:#00f3ff;font-size:11px;letter-spacing:2px;">💡 INSIGHT</strong><p style="margin:8px 0 0;color:#ccc;font-size:14px;">ISI INSIGHT</p></div>

WARNING BOX:
<div style="background:#1a0a0a;border-left:3px solid #ff6b6b;border-radius:0 6px 6px 0;padding:16px 20px;margin:1.5em 0;"><strong style="color:#ff6b6b;font-size:11px;letter-spacing:2px;">⚠ PERHATIAN</strong><p style="margin:8px 0 0;color:#ccc;font-size:14px;">ISI WARNING</p></div>

PLACEHOLDER GAMBAR (taruh di section ke-2 dan ke-4):
{{IMAGE_1}}
<p style="text-align:center;font-size:12px;color:#555;margin-top:-1em;">CAPTION GAMBAR 1</p>
{{IMAGE_2}}
<p style="text-align:center;font-size:12px;color:#555;margin-top:-1em;">CAPTION GAMBAR 2</p>

WIDGET REALTIME — PILIH SESUAI TOPIK DAN GUNAKAN SATU ATAU LEBIH:

TradingView single quote (ganti SYMBOL):
<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:180px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22SYMBOL%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>

TradingView chart weekly (ganti SYMBOL):
<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:450px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=SYMBOL&interval=W&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>

CoinGecko crypto price chart (ganti COIN-ID misal bitcoin/ethereum/solana):
<div style="margin:2em 0;"><script src="https://widgets.coingecko.com/coingecko-coin-price-chart-widget.js"></script><coingecko-coin-price-chart-widget coin-id="COIN-ID" currency="usd" height="300" locale="id" background-color="#050505"></coingecko-coin-price-chart-widget></div>

CoinGecko market cap (untuk overview crypto market):
<div style="margin:2em 0;"><script src="https://widgets.coingecko.com/coingecko-coin-list-widget.js"></script><coingecko-coin-list-widget coin-ids="bitcoin,ethereum,solana,bnb,ripple" currency="usd" locale="id" background-color="#050505"></coingecko-coin-list-widget></div>

Investing.com economic calendar (untuk topik makro ekonomi):
<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:350px;"><iframe src="https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=3&features=datepicker,timezone&theme=dark&lang=56&timezone=28" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>

SYMBOL TradingView lengkap:
Bitcoin=BINANCE:BTCUSDT | Ethereum=BINANCE:ETHUSDT | BNB=BINANCE:BNBUSDT | Solana=BINANCE:SOLUSDT | XRP=BINANCE:XRPUSDT | DOGE=BINANCE:DOGEUSDT | S&P500=FOREXCOM:SPXUSD | Nasdaq=FOREXCOM:NSXUSD | DowJones=FOREXCOM:DJI | Gold=OANDA:XAUUSD | Silver=OANDA:XAGUSD | OilWTI=OANDA:WTICOUSD | OilBrent=OANDA:BCOUSD | EURUSD=FOREXCOM:EURUSD | GBPUSD=FOREXCOM:GBPUSD | USDIDR=FOREXCOM:USDIDR | IHSG=IDX:COMPOSITE | BTCDominance=CRYPTOCAP:BTC.D | Shanghai=SSE:000001 | Nikkei=TVC:NI225 | FTSE=TVC:UKX | HangSeng=TVC:HSI

FORMAT JSON WAJIB (SATU BARIS, NO NEWLINE DALAM VALUE):
{"title":"Judul SEO max 80 karakter","excerpt":"Ringkasan 1-2 kalimat max 160 karakter","tags":["tag1","tag2","tag3","tag4"],"content":"KONTEN HTML SANGAT PANJANG. Gunakan data dari berita. Sertakan widget. Taruh IMAGE_1 dan IMAGE_2. NO newline.","coverImagePrompt":"Cinematic English prompt for cover image","imagePrompt2":"Different angle English prompt for 2nd image","hasRealtimeData":false}`;

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

  if (img2) {
    content = content.replace(
      /\{\{IMAGE_1\}\}/g,
      `<img src="${img2}" alt="Ilustrasi artikel" style="width:100%;max-width:100%;border-radius:8px;border:1px solid rgba(0,243,255,0.1);margin:1.5em 0;" />`
    );
  }
  const img2b = generateImageUrl(article.imagePrompt2 || article.coverImagePrompt || 'futuristic finance technology', Date.now() + 999);
  content = content.replace(
    /\{\{IMAGE_2\}\}/g,
    `<img src="${img2b}" alt="Ilustrasi artikel" style="width:100%;max-width:100%;border-radius:8px;border:1px solid rgba(0,243,255,0.1);margin:1.5em 0;" />`
  );
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

export async function GET(request) {
  return POST(request);
}