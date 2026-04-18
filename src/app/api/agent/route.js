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

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── Topic tracking — pilih topik yang belum dipakai hari ini
async function pickUnusedTopic(db, topics) {
  const today = new Date().toISOString().slice(0, 10);
  const docRef = db.collection('agent_state').doc(`used_topics_${today}`);
  const snap = await docRef.get();
  const used = snap.exists ? (snap.data().topics || []) : [];
  const available = topics.filter(t => !used.includes(t));
  const pool = available.length > 0 ? available : topics;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  await docRef.set({
    topics: [...new Set([...used, chosen])],
    date: today,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  return chosen;
}

// ── Deep search — ambil dari berbagai sumber berita besar
async function deepSearch(query, maxResults = 7) {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: 'advanced',
      include_answer: true,
      include_raw_content: false,
      max_results: maxResults,
      topic: 'news',
      // Prioritas sumber berita besar dan terpercaya
      include_domains: [
        'bloomberg.com', 'reuters.com', 'cnbc.com', 'ft.com',
        'wsj.com', 'economist.com', 'businessinsider.com',
        'coindesk.com', 'cointelegraph.com', 'decrypt.co',
        'techcrunch.com', 'theverge.com', 'wired.com',
        'bisnis.com', 'kontan.co.id', 'detik.com', 'kompas.com',
        'investing.com', 'marketwatch.com', 'yahoo.finance.com',
        'theblock.co', 'blockworks.co', 'cryptoslate.com',
      ],
      days: 3, // Max 3 hari terakhir — berita yang masih hangat
    }),
  });
  if (!res.ok) throw new Error(`Tavily error: ${res.status}`);
  return res.json();
}

// ── Validasi apakah berita cukup valid dan fresh untuk ditulis
function validateSearchResults(searchData, topic) {
  const results = searchData.results || [];

  // Minimal 2 sumber
  if (results.length < 2) {
    return { valid: false, reason: 'Kurang dari 2 sumber ditemukan' };
  }

  // Cek apakah ada konten yang cukup panjang (bukan stub/snippet saja)
  const hasSubstantialContent = results.some(r =>
    (r.content || r.snippet || '').length > 150
  );
  if (!hasSubstantialContent) {
    return { valid: false, reason: 'Konten berita terlalu dangkal' };
  }

  // Cek apakah Tavily punya answer (artinya berita cukup jelas)
  if (!searchData.answer || searchData.answer.length < 50) {
    return { valid: false, reason: 'Tidak ada ringkasan berita yang jelas' };
  }

  return { valid: true };
}

// ── Inject widget HANYA untuk topik keuangan/market yang benar-benar relevan
function injectWidget(content, topic) {
  const t = topic.toLowerCase();

  // Widget berdasarkan topik — sangat spesifik, tidak ada default fallback
  let widget = '';

  if (t.includes('bitcoin') || t.includes('btc price') || t.includes('bitcoin price') || t.includes('bitcoin etf')) {
    widget = `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.12);background:#0d0d0d;">
      <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;color:#4a5568;letter-spacing:2px;">BITCOIN LIVE PRICE</div>
      <div style="height:180px;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22BINANCE%3ABTCUSDT%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
      <div style="height:380px;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=BINANCE%3ABTCUSDT&interval=D&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
    </div>`;

  } else if (t.includes('ethereum') || t.includes('eth price')) {
    widget = `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.12);background:#0d0d0d;">
      <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;color:#4a5568;letter-spacing:2px;">ETHEREUM LIVE PRICE</div>
      <div style="height:180px;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22BINANCE%3AETHUSDT%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
      <div style="height:380px;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=BINANCE%3AETHUSDT&interval=D&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
    </div>`;

  } else if (t.includes('crypto market') || t.includes('altcoin trending') || t.includes('crypto price') || t.includes('stablecoin usdt')) {
    widget = `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.12);background:#0d0d0d;">
      <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;color:#4a5568;letter-spacing:2px;">CRYPTO MARKET OVERVIEW</div>
      <div style="padding:12px;"><script src="https://widgets.coingecko.com/coingecko-coin-list-widget.js"></script><coingecko-coin-list-widget coin-ids="bitcoin,ethereum,solana,bnb,ripple,cardano" currency="usd" locale="id" background-color="#0d0d0d"></coingecko-coin-list-widget></div>
    </div>`;

  } else if (t.includes('harga emas') || t.includes('gold price') || (t.includes('gold') && t.includes('market'))) {
    widget = `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.12);background:#0d0d0d;">
      <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;color:#4a5568;letter-spacing:2px;">HARGA EMAS LIVE (XAU/USD)</div>
      <div style="height:180px;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22OANDA%3AXAUUSD%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
      <div style="height:380px;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=OANDA%3AXAUUSD&interval=D&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
    </div>`;

  } else if (t.includes('oil price') || t.includes('harga minyak') || t.includes('opec')) {
    widget = `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.12);background:#0d0d0d;">
      <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;color:#4a5568;letter-spacing:2px;">HARGA MINYAK LIVE (WTI)</div>
      <div style="height:180px;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22OANDA%3AWTICOUSD%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
      <div style="height:380px;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=OANDA%3AWTICOUSD&interval=D&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
    </div>`;

  } else if (t.includes('s&p 500') || t.includes('nasdaq') || t.includes('us stock market') || t.includes('wall street') || t.includes('new york') && t.includes('market')) {
    widget = `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.12);background:#0d0d0d;">
      <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;color:#4a5568;letter-spacing:2px;">US MARKET LIVE</div>
      <div style="height:180px;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22FOREXCOM%3ASPXUSD%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
      <div style="height:380px;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=FOREXCOM%3ASPXUSD&interval=D&theme=dark&style=1&timezone=America%2FNew_York&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
    </div>`;

  } else if (t.includes('rupiah dollar') || t.includes('kurs rupiah') || t.includes('ihsg') || t.includes('bursa efek indonesia')) {
    widget = `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.12);background:#0d0d0d;">
      <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;color:#4a5568;letter-spacing:2px;">USD/IDR & IHSG LIVE</div>
      <div style="height:180px;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22FOREXCOM%3AUSDIDR%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
      <div style="height:380px;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=IDX%3ACOMPOSITE&interval=D&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
    </div>`;

  } else if (t.includes('federal reserve') || t.includes('fed rate') || t.includes('us inflation') || t.includes('inflation cpi')) {
    widget = `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.12);">
      <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;color:#4a5568;letter-spacing:2px;">ECONOMIC CALENDAR</div>
      <div style="height:350px;"><iframe src="https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=3&features=datepicker,timezone&theme=dark&lang=56&timezone=28" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
    </div>`;

  } else if (t.includes('nikkei') || (t.includes('tokyo') && t.includes('market'))) {
    widget = `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.12);background:#0d0d0d;">
      <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;color:#4a5568;letter-spacing:2px;">NIKKEI 225 LIVE</div>
      <div style="height:380px;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=TVC%3ANI225&interval=D&theme=dark&style=1&timezone=Asia%2FTokyo&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
    </div>`;

  } else if ((t.includes('china') || t.includes('shanghai')) && t.includes('market')) {
    widget = `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.12);background:#0d0d0d;">
      <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;color:#4a5568;letter-spacing:2px;">SHANGHAI COMPOSITE LIVE</div>
      <div style="height:380px;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=SSE%3A000001&interval=D&theme=dark&style=1&timezone=Asia%2FShanghai&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
    </div>`;
  }
  // Topik non-keuangan (AI, tech, regulasi, dll) → tidak ada widget

  if (!widget) return content;

  // Inject setelah h2 kedua (bukan pertama) supaya tidak langsung di atas
  let count = 0;
  const injected = content.replace(/<\/h2>/g, (match) => {
    count++;
    if (count === 2) return `</h2>${widget}`;
    return match;
  });

  // Kalau tidak ada h2 kedua, inject setelah h2 pertama
  if (count < 2) {
    return content.replace('</h2>', `</h2>${widget}`);
  }

  return injected;
}

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
  const clean = (prompt || 'technology news futuristic')
    .replace(/[^\w\s,.-]/g, '')
    .slice(0, 200);
  const encodedPrompt = encodeURIComponent(
    `${clean}, dark background, cyan neon accent, cinematic lighting, ultra detailed, 16:9 aspect ratio`
  );
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=630&nologo=true&model=flux&seed=${seed || Date.now()}`;
}

async function generateArticle({ topic, searchResults }, retries = 2) {
  const results = searchResults.results || [];

  // Format sumber dengan label domain untuk konteks
  const sources = results.slice(0, 6).map((r, i) => {
    const domain = r.url ? new URL(r.url).hostname.replace('www.', '') : 'unknown';
    const date = r.published_date || '';
    return `[${i+1}] [${domain}] ${date ? `(${date})` : ''}\nJUDUL: ${r.title}\nISI: ${r.content?.slice(0, 500) || r.snippet || ''}`;
  }).join('\n\n');

  const tavilyAnswer = searchResults.answer || '';

  const systemPrompt = `Kamu adalah jurnalis senior berpengalaman yang menulis untuk blog teknologi, crypto, ekonomi, dan pasar global bernama FOSHT (fosht.vercel.app). Kamu menulis artikel yang mendalam, berbasis fakta nyata, dan memberikan insight berharga kepada pembaca.

PRINSIP UTAMA:
- Selalu gunakan data PERSIS dari sumber yang diberikan — jangan mengarang angka
- Tulis dengan sudut pandang analis profesional, bukan sekedar ringkuman
- Artikel harus memberi nilai lebih: analisis sebab-akibat, dampak ke depan, konteks global vs lokal
- Bahasa Indonesia yang mengalir natural, tidak kaku
- Response HANYA JSON valid satu baris`;

  const userPrompt = `TOPIK: ${topic}

RINGKASAN TAVILY: ${tavilyAnswer}

SUMBER BERITA (dari ${results.length} sumber terverifikasi):
${sources}

TULIS ARTIKEL MENDALAM minimal 1200 kata berdasarkan data di atas.

STRUKTUR ARTIKEL:
1. Opening yang menarik — konteks kenapa topik ini penting sekarang (2-3 paragraf)
2. Section 1: Apa yang terjadi — fakta dan data dari berita (gunakan angka persis dari sumber)
3. Section 2: Analisis mendalam — kenapa ini terjadi, siapa yang terdampak
4. Section 3: Konteks global vs Indonesia — dampak ke pasar atau kehidupan lokal
5. Section 4: Data dan statistik — buat tabel atau stat box dari angka di berita
6. Section 5: Perspektif ke depan — apa yang mungkin terjadi, apa yang harus diperhatikan
7. Kesimpulan — takeaway utama untuk pembaca

ELEMEN INTERAKTIF (gunakan sesuai data yang ada):

STAT BOX dengan data nyata dari berita:
<div style="display:flex;gap:12px;flex-wrap:wrap;margin:1.5em 0;"><div style="flex:1;min-width:130px;background:#0a0f1e;border:1px solid rgba(0,243,255,0.2);border-radius:6px;padding:16px;text-align:center;"><div style="font-size:1.9em;font-weight:900;color:#00f3ff;line-height:1;">DATA</div><div style="font-size:10px;color:#555;margin-top:6px;letter-spacing:1px;">LABEL</div></div></div>

INSIGHT BOX:
<div style="background:#0a0f1e;border-left:3px solid #00f3ff;border-radius:0 6px 6px 0;padding:16px 20px;margin:1.5em 0;"><strong style="color:#00f3ff;font-size:10px;letter-spacing:2px;">💡 INSIGHT ANALIS</strong><p style="margin:8px 0 0;color:#bbb;font-size:14px;line-height:1.7;">ANALISIS MENDALAM</p></div>

WARNING BOX:
<div style="background:#1a0a0a;border-left:3px solid #ff6b6b;border-radius:0 6px 6px 0;padding:16px 20px;margin:1.5em 0;"><strong style="color:#ff6b6b;font-size:10px;letter-spacing:2px;">⚠ RISIKO</strong><p style="margin:8px 0 0;color:#bbb;font-size:14px;line-height:1.7;">RISIKO YANG PERLU DIPERHATIKAN</p></div>

TABEL DATA (jika ada perbandingan):
<div class="table-wrap"><table><thead><tr><th>KOLOM1</th><th>KOLOM2</th></tr></thead><tbody><tr><td>DATA</td><td>DATA</td></tr></tbody></table></div>

PLACEHOLDER GAMBAR (taruh di section 2 dan section 4):
{{IMAGE_1}}
<p style="text-align:center;font-size:11px;color:#444;margin-top:-0.5em;font-style:italic;">CAPTION DESKRIPTIF</p>

{{IMAGE_2}}
<p style="text-align:center;font-size:11px;color:#444;margin-top:-0.5em;font-style:italic;">CAPTION DESKRIPTIF</p>

BLOCKQUOTE di akhir:
<blockquote>Quote menarik atau insight utama dari artikel</blockquote>

FORMAT JSON (satu baris, NO newline dalam value):
{"title":"Judul artikel SEO-friendly, spesifik, max 80 karakter","excerpt":"Ringkasan menarik 1-2 kalimat yang membuat orang ingin baca, max 160 karakter","tags":["tag1","tag2","tag3","tag4","tag5"],"content":"KONTEN HTML LENGKAP MINIMAL 1200 KATA. Gunakan data dari sumber. Taruh IMAGE_1 dan IMAGE_2. Satu baris tanpa newline.","coverImagePrompt":"Detailed cinematic English prompt describing the cover image visually — specific to the article topic","imagePrompt2":"Different visual angle English prompt for the 2nd inline image","hasFinancialData":BOOLEAN}

ATURAN:
- hasFinancialData = true HANYA jika artikel membahas harga aset (crypto/saham/komoditas/forex)
- Jangan tambahkan widget TradingView di konten — akan di-inject otomatis oleh sistem
- Gunakan angka/data PERSIS dari sumber, bukan perkiraan
- Response hanya JSON, tidak ada teks lain`;

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
      temperature: 0.7,
      max_tokens: 8192,
    }),
  });

  if (!res.ok) {
    if (res.status === 429 && retries > 0) {
      console.log('[Agent] Groq 429, retry in 8s...');
      await sleep(8000);
      return generateArticle({ topic, searchResults }, retries - 1);
    }
    throw new Error(`Groq error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq empty response');
  return safeParseJSON(text);
}

async function slugExists(db, slug) {
  const snap = await db.collection('posts').where('slug', '==', slug).limit(1).get();
  return !snap.empty;
}

async function publishArticle(db, article, coverImage, img2, topic) {
  const slug = slugify(article.title);
  if (await slugExists(db, slug)) return { skipped: true, reason: 'duplicate slug', slug };

  let content = article.content || '';

  // Replace image placeholders
  content = content.replace(
    /\{\{IMAGE_1\}\}/g,
    `<img src="${coverImage}" alt="${article.title}" style="width:100%;max-width:100%;border-radius:8px;border:1px solid rgba(0,243,255,0.08);margin:1.5em 0;display:block;" loading="lazy" />`
  );
  content = content.replace(
    /\{\{IMAGE_2\}\}/g,
    `<img src="${img2}" alt="${article.title}" style="width:100%;max-width:100%;border-radius:8px;border:1px solid rgba(0,243,255,0.08);margin:1.5em 0;display:block;" loading="lazy" />`
  );
  content = content.replace(/\{\{IMAGE_[123]\}\}/g, '');

  // Inject widget hanya untuk topik keuangan yang relevan
  content = injectWidget(content, topic);

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

    for (let i = 0; i < ARTICLES_PER_RUN; i++) {
      try {
        const topic = await pickUnusedTopic(db, AGENT_TOPICS);
        console.log(`[Agent] Researching: ${topic}`);

        // Deep research dari berbagai sumber berita terpercaya
        const searchData = await deepSearch(topic, 7);

        // Validasi — apakah berita cukup valid dan fresh?
        const validation = validateSearchResults(searchData, topic);
        if (!validation.valid) {
          console.log(`[Agent] Skipped "${topic}": ${validation.reason}`);
          results.push({ topic, skipped: true, reason: validation.reason });
          continue;
        }

        console.log(`[Agent] Valid — ${searchData.results.length} sources found. Generating...`);

        const article = await generateArticle({ topic, searchResults: searchData });

        // Generate gambar — pakai prompt yang spesifik dari AI
        const seed = Date.now();
        const coverImage = generateImageUrl(article.coverImagePrompt || topic, seed);
        const img2 = generateImageUrl(article.imagePrompt2 || article.coverImagePrompt || topic, seed + 777);

        const publishResult = await publishArticle(db, article, coverImage, img2, topic);
        results.push({ topic, ...publishResult });
        console.log(`[Agent] Published: ${publishResult.slug}`);

      } catch (err) {
        console.error(`[Agent] Error:`, err.message);
        results.push({ error: err.message });
      }
    }

    return NextResponse.json({
      status: 'success',
      processed: ARTICLES_PER_RUN,
      results,
      timestamp: new Date().toISOString(),
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  return POST(request);
}