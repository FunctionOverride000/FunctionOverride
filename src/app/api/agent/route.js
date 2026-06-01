// src/app/api/agent/route.js
import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { AGENT_TOPICS, ARTICLES_PER_RUN } from './topics';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ─────────────────────────────────────────────
// DB
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80);
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function generateImageUrl(prompt, seed) {
  const clean = (prompt || 'technology news futuristic')
    .replace(/[^\w\s,.-]/g, '')
    .slice(0, 200);
  const encodedPrompt = encodeURIComponent(
    `${clean}, dark background, cyan neon accent, cinematic lighting, ultra detailed, 16:9 aspect ratio`
  );
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=630&nologo=true&model=flux&seed=${seed || Date.now()}`;
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

// ─────────────────────────────────────────────
// TOPIC TRACKING
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// SEARCH
// ─────────────────────────────────────────────
async function deepSearch(query, maxResults = 8) {
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
      include_domains: [
        'bloomberg.com', 'reuters.com', 'cnbc.com', 'ft.com',
        'wsj.com', 'economist.com', 'businessinsider.com',
        'coindesk.com', 'cointelegraph.com', 'decrypt.co',
        'techcrunch.com', 'theverge.com', 'wired.com',
        'bisnis.com', 'kontan.co.id', 'detik.com', 'kompas.com',
        'investing.com', 'marketwatch.com', 'finance.yahoo.com',
        'theblock.co', 'blockworks.co', 'cryptoslate.com',
        'apnews.com', 'bbc.com', 'theguardian.com',
      ],
      days: 2,
    }),
  });
  if (!res.ok) throw new Error(`Tavily error: ${res.status}`);
  return res.json();
}

async function dataSearch(topic) {
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: `${topic} data statistics numbers analysis 2025`,
        search_depth: 'basic',
        include_answer: false,
        include_raw_content: false,
        max_results: 3,
        topic: 'news',
        days: 7,
      }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function validateSearchResults(searchData) {
  const results = searchData.results || [];
  if (results.length < 2) return { valid: false, reason: 'Kurang dari 2 sumber' };
  const hasContent = results.some(r => (r.content || r.snippet || '').length > 150);
  if (!hasContent) return { valid: false, reason: 'Konten terlalu dangkal' };
  if (!searchData.answer || searchData.answer.length < 50) return { valid: false, reason: 'Tidak ada ringkasan' };
  return { valid: true };
}

// ─────────────────────────────────────────────
// POST-PROCESSING VALIDATOR
// Cek artikel sebelum publish — tangkap placeholder kosong
// ─────────────────────────────────────────────
function validateArticle(article) {
  const content = article.content || '';
  const wordCount = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').length;

  // Cek placeholder template yang belum diganti
  const hasEmptyStatBox = />DATA<\/div>/.test(content) || />LABEL</.test(content);
  const hasEmptyInsight = /ANALISIS MENDALAM/.test(content);
  const hasEmptyWarning = /RISIKO YANG PERLU DIPERHATIKAN/.test(content);
  const hasEmptyTable   = /KOLOM1|KOLOM2/.test(content);
  const hasEmptyCaption = /CAPTION DESKRIPTIF/.test(content);

  const errors = [];
  if (wordCount < 400) errors.push(`Terlalu pendek: ${wordCount} kata`);
  if (hasEmptyStatBox) errors.push('Stat box masih template kosong');
  if (hasEmptyInsight) errors.push('Insight box masih template kosong');
  if (hasEmptyWarning) errors.push('Warning box masih template kosong');
  if (hasEmptyTable)   errors.push('Tabel masih template kosong');
  if (hasEmptyCaption) errors.push('Caption gambar masih template kosong');
  if (!article.title || article.title.length < 10) errors.push('Judul terlalu pendek');
  if (!article.excerpt || article.excerpt.length < 20) errors.push('Excerpt terlalu pendek');

  return { valid: errors.length === 0, errors, wordCount };
}

// ─────────────────────────────────────────────
// LLM CALL — Gemini primary, Groq fallback
// ─────────────────────────────────────────────

// Gemini Flash 2.0 — gratis 1500 req/hari, output 8192 token
async function callGemini(systemPrompt, userPrompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('No GEMINI_API_KEY');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',  // paksa output JSON langsung
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini empty response');
  return text;
}

// Groq fallback
async function callGroq(systemPrompt, userPrompt, retries = 2) {
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
      temperature: 0.85,
      max_tokens: 8192,
    }),
  });

  if (!res.ok) {
    if (res.status === 429 && retries > 0) {
      console.log('[Agent] Groq 429, retry in 10s...');
      await sleep(10000);
      return callGroq(systemPrompt, userPrompt, retries - 1);
    }
    throw new Error(`Groq error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq empty response');
  return text;
}

// Wrapper — coba Gemini dulu, fallback ke Groq
async function callLLM(systemPrompt, userPrompt) {
  try {
    console.log('[Agent] Trying Gemini... key:', !!process.env.GEMINI_API_KEY);
    const text = await callGemini(systemPrompt, userPrompt);
    console.log('[Agent] Gemini OK');
    return text;
  } catch (e) {
    console.warn(`[Agent] Gemini failed: ${e.message} — fallback to Groq`);
    const text = await callGroq(systemPrompt, userPrompt);
    console.log('[Agent] Groq OK');
    return text;
  }
}

// ─────────────────────────────────────────────
// GENERATE ARTICLE — 2-call strategy
//
// CALL 1: Minta "blueprint" artikel — outline + semua data yang akan dipakai
//         Output kecil (~600 token), hemat kuota
//
// CALL 2: Expand blueprint jadi artikel HTML penuh
//         Model fokus nulis, tidak perlu "cari data" lagi
// ─────────────────────────────────────────────
async function generateArticle({ topic, searchResults, extraData }) {
  const results = searchResults.results || [];

  // Format sumber — 1000 karakter per sumber (cukup tanpa boros token)
  const sources = results.slice(0, 6).map((r, i) => {
    const domain = r.url ? new URL(r.url).hostname.replace('www.', '') : 'unknown';
    const date = r.published_date ? ` | ${r.published_date}` : '';
    return `[S${i+1}] ${domain}${date}\nJUDUL: ${r.title}\nKONTEN: ${(r.content || r.snippet || '').slice(0, 1000)}`;
  }).join('\n\n---\n\n');

  const extraSources = (extraData?.results || []).slice(0, 3).map((r, i) => {
    const domain = r.url ? new URL(r.url).hostname.replace('www.', '') : 'unknown';
    return `[D${i+1}] ${domain}: ${r.title} — ${(r.content || r.snippet || '').slice(0, 400)}`;
  }).join('\n');

  const tavilyAnswer = searchResults.answer || '';
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // ── CALL 1: Blueprint
  const blueprintSystem = `Kamu adalah editor berita senior. Tugasmu membuat blueprint artikel berdasarkan sumber yang diberikan. Output HANYA JSON valid.`;

  const blueprintUser = `TANGGAL: ${today}
TOPIK: ${topic}
RINGKASAN: ${tavilyAnswer}

SUMBER:
${sources}

${extraSources ? `DATA TAMBAHAN:\n${extraSources}` : ''}

Buat blueprint artikel dalam JSON:
{
  "title": "Judul SEO max 80 karakter — spesifik, ada angka jika memungkinkan",
  "excerpt": "Hook 1-2 kalimat max 160 karakter",
  "tags": ["tag1","tag2","tag3","tag4","tag5"],
  "coverImagePrompt": "Cinematic English prompt untuk cover image — spesifik ke topik",
  "imagePrompt2": "English prompt untuk gambar kedua — sudut berbeda dari cover",
  "hasFinancialData": true/false,
  "keyFacts": [
    "Fakta/angka penting 1 dari sumber (tulis persis)",
    "Fakta/angka penting 2 dari sumber",
    "Fakta/angka penting 3 dari sumber",
    "Fakta/angka penting 4 dari sumber",
    "Fakta/angka penting 5 dari sumber"
  ],
  "sections": [
    {"h2": "Judul section spesifik", "points": ["poin utama 1", "poin utama 2", "poin utama 3"]},
    {"h2": "Judul section spesifik", "points": ["poin utama 1", "poin utama 2"]},
    {"h2": "Judul section spesifik", "points": ["poin utama 1", "poin utama 2"]},
    {"h2": "Judul section spesifik — Dampak ke Indonesia", "points": ["poin utama 1", "poin utama 2"]},
    {"h2": "Judul section spesifik — Ke Depan", "points": ["poin utama 1", "poin utama 2"]}
  ],
  "statBox": [
    {"value": "angka persis dari sumber", "label": "label singkat"},
    {"value": "angka persis dari sumber", "label": "label singkat"},
    {"value": "angka persis dari sumber", "label": "label singkat"}
  ],
  "insightText": "Analisis unik 2-3 kalimat yang tidak ada di sumber — perspektif editor",
  "warningText": "Risiko konkret 2-3 kalimat berdasarkan data dari sumber",
  "tableData": {
    "headers": ["Kolom1", "Kolom2", "Kolom3"],
    "rows": [
      ["data nyata", "data nyata", "data nyata"],
      ["data nyata", "data nyata", "data nyata"],
      ["data nyata", "data nyata", "data nyata"]
    ]
  },
  "blockquote": "Kutipan atau insight paling kuat dari artikel"
}

ATURAN:
- keyFacts HARUS berisi angka/data persis dari sumber, bukan parafrase umum
- statBox HARUS diisi angka nyata — jika tidak ada angka di sumber, kosongkan array
- hasFinancialData = true HANYA jika ada harga aset (crypto/saham/komoditas/forex)`;

  console.log('[Agent] Call 1: generating blueprint...');
  const blueprintText = await callLLM(blueprintSystem, blueprintUser);
  const blueprint = safeParseJSON(blueprintText);
  console.log('[Agent] Blueprint OK:', blueprint.title);

  // ── CALL 2: Expand blueprint jadi artikel HTML penuh
  const articleSystem = `Kamu adalah jurnalis senior FOSHT (fosht.vercel.app). Tugasmu mengembangkan blueprint menjadi artikel HTML penuh yang tajam, berbasis data, dan bernilai tinggi.

LARANGAN KERAS — JANGAN gunakan frase ini:
- "dalam konteks ini", "perlu dicatat", "hal ini menunjukkan", "sangat penting"
- "tidak mengherankan", "secara keseluruhan", "lebih jauh lagi", "dengan demikian"
- "di tengah ketidakpastian", "lanskap yang terus berkembang", "tentunya", "pastinya"
- Jangan buka paragraf dengan "Ini " atau "Hal ini"
- Jangan ulangi angka yang sudah disebut di section sebelumnya

GAYA: Tajam seperti Bloomberg Indonesia. Kutip sumber secara natural. Tiap section buka dengan fakta konkret.
OUTPUT: Hanya HTML murni — tidak ada markdown, tidak ada kode blok, tidak ada penjelasan.`;

  // Siapkan elemen HTML dari blueprint (sudah tervalidasi datanya)
  const statBoxHtml = blueprint.statBox?.length
    ? `<div style="display:flex;gap:12px;flex-wrap:wrap;margin:1.5em 0;">${
        blueprint.statBox.map(s =>
          `<div style="flex:1;min-width:130px;background:#0a0f1e;border:1px solid rgba(0,243,255,0.2);border-radius:6px;padding:16px;text-align:center;"><div style="font-size:1.9em;font-weight:900;color:#00f3ff;line-height:1;">${s.value}</div><div style="font-size:10px;color:#555;margin-top:6px;letter-spacing:1px;">${s.label}</div></div>`
        ).join('')
      }</div>`
    : '';

  const insightBoxHtml = blueprint.insightText
    ? `<div style="background:#0a0f1e;border-left:3px solid #00f3ff;border-radius:0 6px 6px 0;padding:16px 20px;margin:1.5em 0;"><strong style="color:#00f3ff;font-size:10px;letter-spacing:2px;">💡 INSIGHT ANALIS</strong><p style="margin:8px 0 0;color:#bbb;font-size:14px;line-height:1.7;">${blueprint.insightText}</p></div>`
    : '';

  const warningBoxHtml = blueprint.warningText
    ? `<div style="background:#1a0a0a;border-left:3px solid #ff6b6b;border-radius:0 6px 6px 0;padding:16px 20px;margin:1.5em 0;"><strong style="color:#ff6b6b;font-size:10px;letter-spacing:2px;">⚠ RISIKO</strong><p style="margin:8px 0 0;color:#bbb;font-size:14px;line-height:1.7;">${blueprint.warningText}</p></div>`
    : '';

  const tableHtml = blueprint.tableData?.rows?.length
    ? `<div class="table-wrap"><table><thead><tr>${blueprint.tableData.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${blueprint.tableData.rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
    : '';

  const blockquoteHtml = blueprint.blockquote
    ? `<blockquote>${blueprint.blockquote}</blockquote>`
    : '';

  const sectionsText = (blueprint.sections || []).map((s, i) =>
    `Section ${i+1} — H2: "${s.h2}"\nPoin yang HARUS ada: ${(s.points || []).join(' | ')}`
  ).join('\n\n');

  const articleUser = `TUGAS: Tulis artikel HTML penuh berdasarkan blueprint ini. Minimal 800 kata konten teks (di luar HTML tag).

JUDUL: ${blueprint.title}
TOPIK: ${topic}
TANGGAL: ${today}

FAKTA KUNCI (gunakan semua ini di artikel):
${(blueprint.keyFacts || []).map((f, i) => `${i+1}. ${f}`).join('\n')}

STRUKTUR SECTIONS:
${sectionsText}

ELEMEN SIAP PAKAI (copy persis, taruh di posisi yang tepat):

STAT BOX (taruh setelah opening atau section 1):
${statBoxHtml || '<!-- tidak ada stat box -->'}

IMAGE_1 (taruh di section 2):
{{IMAGE_1}}
<p style="text-align:center;font-size:11px;color:#444;margin-top:-0.5em;font-style:italic;">Ilustrasi ${blueprint.title}</p>

INSIGHT BOX (taruh di section 3):
${insightBoxHtml || '<!-- tidak ada insight box -->'}

IMAGE_2 (taruh di section 4):
{{IMAGE_2}}
<p style="text-align:center;font-size:11px;color:#444;margin-top:-0.5em;font-style:italic;">Visualisasi data terkait ${topic}</p>

WARNING BOX (taruh di section 4 atau 5):
${warningBoxHtml || '<!-- tidak ada warning box -->'}

TABEL (taruh di section 4 atau 5):
${tableHtml || '<!-- tidak ada tabel -->'}

BLOCKQUOTE (taruh di akhir):
${blockquoteHtml || '<!-- tidak ada blockquote -->'}

FORMAT OUTPUT:
- Hanya HTML murni, mulai langsung dari paragraf pertama
- Gunakan <h2> untuk section headers
- Gunakan <p> untuk paragraf
- Taruh elemen siap pakai di posisi yang logis
- JANGAN ubah isi elemen siap pakai — copy persis
- JANGAN tambah widget TradingView`;

  console.log('[Agent] Call 2: expanding to full article...');
  const htmlContent = await callLLM(articleSystem, articleUser);

  // Bersihkan markdown jika ada yang bocor
  const cleanHtml = htmlContent
    .replace(/```html|```/g, '')
    .replace(/^#+\s/gm, '')
    .trim();

  // Gabungkan jadi artikel final
  const article = {
    title: blueprint.title,
    excerpt: blueprint.excerpt,
    tags: blueprint.tags,
    coverImagePrompt: blueprint.coverImagePrompt,
    imagePrompt2: blueprint.imagePrompt2,
    hasFinancialData: blueprint.hasFinancialData,
    content: cleanHtml,
  };

  // Validasi hasil
  const validation = validateArticle(article);
  console.log(`[Agent] Article validation: ${validation.valid ? 'PASS' : 'FAIL'} | ${validation.wordCount} kata`);
  if (!validation.valid) {
    console.warn('[Agent] Validation errors:', validation.errors);
    // Tetap publish tapi log errornya — jangan block kalau hanya minor
    const isFatal = validation.errors.some(e => e.includes('Terlalu pendek') && validation.wordCount < 200);
    if (isFatal) throw new Error(`Article failed validation: ${validation.errors.join(', ')}`);
  }

  return article;
}

// ─────────────────────────────────────────────
// WIDGET INJECT
// ─────────────────────────────────────────────
function injectWidget(content, topic) {
  const t = topic.toLowerCase();
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
  } else if (t.includes('crypto market') || t.includes('altcoin') || t.includes('stablecoin')) {
    widget = `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.12);background:#0d0d0d;">
      <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;color:#4a5568;letter-spacing:2px;">CRYPTO MARKET OVERVIEW</div>
      <div style="padding:12px;"><script src="https://widgets.coingecko.com/coingecko-coin-list-widget.js"></script><coingecko-coin-list-widget coin-ids="bitcoin,ethereum,solana,bnb,ripple,cardano" currency="usd" locale="id" background-color="#0d0d0d"></coingecko-coin-list-widget></div>
    </div>`;
  } else if ((t.includes('gold') && t.includes('market')) || t.includes('harga emas')) {
    widget = `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.12);background:#0d0d0d;">
      <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;color:#4a5568;letter-spacing:2px;">HARGA EMAS LIVE (XAU/USD)</div>
      <div style="height:180px;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22OANDA%3AXAUUSD%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
      <div style="height:380px;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=OANDA%3AXAUUSD&interval=D&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
    </div>`;
  } else if (t.includes('oil') || t.includes('harga minyak') || t.includes('opec')) {
    widget = `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.12);background:#0d0d0d;">
      <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;color:#4a5568;letter-spacing:2px;">HARGA MINYAK LIVE (WTI)</div>
      <div style="height:180px;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22OANDA%3AWTICOUSD%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
      <div style="height:380px;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=OANDA%3AWTICOUSD&interval=D&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
    </div>`;
  } else if (t.includes('s&p') || t.includes('nasdaq') || t.includes('us stock') || (t.includes('new york') && t.includes('market'))) {
    widget = `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.12);background:#0d0d0d;">
      <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;color:#4a5568;letter-spacing:2px;">US MARKET LIVE</div>
      <div style="height:180px;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22FOREXCOM%3ASPXUSD%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
      <div style="height:380px;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=FOREXCOM%3ASPXUSD&interval=D&theme=dark&style=1&timezone=America%2FNew_York&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
    </div>`;
  } else if (t.includes('rupiah') || t.includes('ihsg') || t.includes('bursa efek')) {
    widget = `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.12);background:#0d0d0d;">
      <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;color:#4a5568;letter-spacing:2px;">USD/IDR & IHSG LIVE</div>
      <div style="height:180px;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22FOREXCOM%3AUSDIDR%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
      <div style="height:380px;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=IDX%3ACOMPOSITE&interval=D&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
    </div>`;
  } else if (t.includes('federal reserve') || t.includes('fed rate') || t.includes('inflation cpi')) {
    widget = `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.12);">
      <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;color:#4a5568;letter-spacing:2px;">ECONOMIC CALENDAR</div>
      <div style="height:350px;"><iframe src="https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=3&features=datepicker,timezone&theme=dark&lang=56&timezone=28" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
    </div>`;
  } else if (t.includes('nikkei') || (t.includes('tokyo') && t.includes('market'))) {
    widget = `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.12);background:#0d0d0d;">
      <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;color:#4a5568;letter-spacing:2px;">NIKKEI 225 LIVE</div>
      <div style="height:380px;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=TVC%3ANI225&interval=D&theme=dark&style=1&timezone=Asia%2FTokyo&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
    </div>`;
  } else if (t.includes('china') || t.includes('shanghai')) {
    widget = `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.12);background:#0d0d0d;">
      <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:10px;color:#4a5568;letter-spacing:2px;">SHANGHAI COMPOSITE LIVE</div>
      <div style="height:380px;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=SSE%3A000001&interval=D&theme=dark&style=1&timezone=Asia%2FShanghai&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>
    </div>`;
  }

  if (!widget) return content;

  let count = 0;
  const injected = content.replace(/<\/h2>/g, (match) => {
    count++;
    if (count === 2) return `</h2>${widget}`;
    return match;
  });
  if (count < 2) return content.replace('</h2>', `</h2>${widget}`);
  return injected;
}

// ─────────────────────────────────────────────
// PUBLISH
// ─────────────────────────────────────────────
async function slugExists(db, slug) {
  const snap = await db.collection('posts').where('slug', '==', slug).limit(1).get();
  return !snap.empty;
}

async function publishArticle(db, article, coverImage, img2, topic) {
  const slug = slugify(article.title);
  if (await slugExists(db, slug)) return { skipped: true, reason: 'duplicate slug', slug };

  let content = article.content || '';

  content = content.replace(
    /\{\{IMAGE_1\}\}/g,
    `<img src="${coverImage}" alt="${article.title}" style="width:100%;max-width:100%;border-radius:8px;border:1px solid rgba(0,243,255,0.08);margin:1.5em 0;display:block;" loading="lazy" />`
  );
  content = content.replace(
    /\{\{IMAGE_2\}\}/g,
    `<img src="${img2}" alt="${article.title}" style="width:100%;max-width:100%;border-radius:8px;border:1px solid rgba(0,243,255,0.08);margin:1.5em 0;display:block;" loading="lazy" />`
  );
  content = content.replace(/\{\{IMAGE_[123]\}\}/g, '');
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

// ─────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────
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
        console.log(`[Agent] Topic: ${topic}`);

        // Primary search
        const searchData = await deepSearch(topic, 8);
        const validation = validateSearchResults(searchData);
        if (!validation.valid) {
          console.log(`[Agent] Skipped "${topic}": ${validation.reason}`);
          results.push({ topic, skipped: true, reason: validation.reason });
          continue;
        }

        console.log(`[Agent] ${searchData.results.length} sources found`);

        // Secondary search untuk data tambahan
        const extraData = await dataSearch(topic);

        // Generate artikel (2 calls)
        const article = await generateArticle({ topic, searchResults: searchData, extraData });

        // Generate gambar
        const seed = Date.now();
        const coverImage = generateImageUrl(article.coverImagePrompt || topic, seed);
        const img2 = generateImageUrl(article.imagePrompt2 || article.coverImagePrompt || topic, seed + 777);

        const publishResult = await publishArticle(db, article, coverImage, img2, topic);
        results.push({ topic, ...publishResult });
        console.log(`[Agent] Done: ${publishResult.slug}`);

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
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  return POST(request);
}
