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

// ── Topic tracking — pilih topik yang belum dipakai hari ini
async function pickUnusedTopic(db, topics) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const docRef = db.collection('agent_state').doc(`used_topics_${today}`);
  const snap = await docRef.get();
  const used = snap.exists ? (snap.data().topics || []) : [];

  // Filter topik yang belum dipakai hari ini
  const available = topics.filter(t => !used.includes(t));

  // Kalau semua sudah dipakai hari ini, reset (pakai semua lagi)
  const pool = available.length > 0 ? available : topics;

  // Pilih random dari pool
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  // Simpan topik yang dipilih
  await docRef.set({
    topics: [...new Set([...used, chosen])],
    date: today,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  return chosen;
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

// ── Inject widget berdasarkan topik (programatik, tidak bergantung AI)
function injectWidgets(content, topic) {
  const t = topic.toLowerCase();
  let widgets = '';

  // Tentukan widget berdasarkan kata kunci topik
  if (t.includes('bitcoin') || t.includes('btc')) {
    widgets += `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:180px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22BINANCE%3ABTCUSDT%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>`;
    widgets += `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:450px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=BINANCE%3ABTCUSDT&interval=W&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>`;
  } else if (t.includes('ethereum') || t.includes('eth')) {
    widgets += `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:180px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22BINANCE%3AETHUSDT%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>`;
    widgets += `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:450px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=BINANCE%3AETHUSDT&interval=W&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>`;
  } else if (t.includes('crypto') || t.includes('web3') || t.includes('blockchain') || t.includes('defi') || t.includes('altcoin')) {
    widgets += `<div style="margin:2em 0;"><script src="https://widgets.coingecko.com/coingecko-coin-list-widget.js"></script><coingecko-coin-list-widget coin-ids="bitcoin,ethereum,solana,bnb,ripple" currency="usd" locale="id" background-color="#050505"></coingecko-coin-list-widget></div>`;
    widgets += `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:180px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22CRYPTOCAP%3ABTC.D%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>`;
  } else if (t.includes('gold') || t.includes('emas')) {
    widgets += `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:180px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22OANDA%3AXAUUSD%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>`;
    widgets += `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:450px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=OANDA%3AXAUUSD&interval=W&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>`;
  } else if (t.includes('oil') || t.includes('minyak') || t.includes('opec')) {
    widgets += `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:180px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22OANDA%3AWTICOUSD%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>`;
    widgets += `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:450px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=OANDA%3AWTICOUSD&interval=W&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>`;
  } else if (t.includes('s&p') || t.includes('nasdaq') || t.includes('stock') || t.includes('wall street') || t.includes('nyse')) {
    widgets += `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:180px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22FOREXCOM%3ASPXUSD%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>`;
    widgets += `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:450px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=FOREXCOM%3ASPXUSD&interval=W&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>`;
  } else if (t.includes('rupiah') || t.includes('idr') || t.includes('kurs') || t.includes('dollar') || t.includes('ihsg') || t.includes('indonesia market') || t.includes('bursa')) {
    widgets += `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:180px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22FOREXCOM%3AUSDIDR%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>`;
    widgets += `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:450px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=IDX%3ACOMPOSITE&interval=D&theme=dark&style=1&timezone=Asia%2FJakarta&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>`;
  } else if (t.includes('federal reserve') || t.includes('fed') || t.includes('inflation') || t.includes('cpi') || t.includes('macro') || t.includes('ekonomi global') || t.includes('global economic')) {
    widgets += `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:350px;"><iframe src="https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=3&features=datepicker,timezone&theme=dark&lang=56&timezone=28" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>`;
    widgets += `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:180px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/embed-widget/single-quote/?locale=id#%7B%22symbol%22%3A%22FOREXCOM%3ASPXUSD%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%7D" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>`;
  } else if (t.includes('nikkei') || t.includes('japan') || t.includes('tokyo')) {
    widgets += `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:450px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=TVC%3ANI225&interval=D&theme=dark&style=1&timezone=Asia%2FTokyo&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>`;
  } else if (t.includes('china') || t.includes('shanghai') || t.includes('hang seng')) {
    widgets += `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:450px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=SSE%3A000001&interval=D&theme=dark&style=1&timezone=Asia%2FShanghai&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>`;
  } else if (t.includes('london') || t.includes('ftse') || t.includes('europe')) {
    widgets += `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:450px;background:#0d0d0d;"><iframe src="https://s.tradingview.com/widgetembed/?symbol=TVC%3AUKX&interval=D&theme=dark&style=1&timezone=Europe%2FLondon&locale=id" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>`;
  } else {
    // Default: kalender ekonomi untuk topik makro/umum
    widgets += `<div style="margin:2em 0;border-radius:8px;overflow:hidden;border:1px solid rgba(0,243,255,0.15);height:350px;"><iframe src="https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=3&features=datepicker,timezone&theme=dark&lang=56&timezone=28" width="100%" height="100%" frameborder="0" allowtransparency="true" scrolling="no"></iframe></div>`;
  }

  // Inject widget setelah h2 pertama yang ada di konten
  const firstH2 = content.indexOf('</h2>');
  if (firstH2 !== -1 && widgets) {
    const insertPos = firstH2 + 5;
    content = content.slice(0, insertPos) + widgets + content.slice(insertPos);
  }

  return content;
}

async function generateArticle({ topic, searchResults }, retries = 2) {
  const sourceSummaries = searchResults.results
    .slice(0, 5)
    .map((r, i) => `[${i + 1}] JUDUL: ${r.title} | ISI: ${r.content?.slice(0, 400) || r.snippet || ''}`)
    .join('\n');

  const tavily_answer = searchResults.answer ? `RINGKASAN OTOMATIS: ${searchResults.answer}` : '';

  const systemPrompt = `Kamu adalah jurnalis profesional FOSHT. Tugas: riset berita → tulis artikel panjang berbasis fakta dari berita yang diberikan. WAJIB: artikel minimal 1200 kata, gunakan data dari berita (bukan memori lama), jangan repetitif. Response: JSON valid satu baris.`;

  const userPrompt = `TOPIK RISET: ${topic}

${tavily_answer}

HASIL RISET TERBARU:
${sourceSummaries}

TULIS ARTIKEL berdasarkan riset di atas. WAJIB:
1. Gunakan fakta/angka PERSIS dari berita di atas — jangan pakai data dari memorimu
2. Minimal 1200 kata, 6 section berbeda (JANGAN repetitif)
3. Setiap section punya sudut pandang berbeda
4. Sisipkan {{IMAGE_1}} di section ke-2 dan {{IMAGE_2}} di section ke-4

ELEMEN HTML INTERAKTIF (copy paste, isi dengan data dari berita):

Stat box 3 kolom:
<div style="display:flex;gap:12px;flex-wrap:wrap;margin:1.5em 0;"><div style="flex:1;min-width:120px;background:#0a0f1e;border:1px solid rgba(0,243,255,0.2);border-radius:6px;padding:16px;text-align:center;"><div style="font-size:1.8em;font-weight:900;color:#00f3ff;">ANGKA</div><div style="font-size:11px;color:#666;margin-top:4px;">LABEL</div></div><div style="flex:1;min-width:120px;background:#0a0f1e;border:1px solid rgba(0,243,255,0.2);border-radius:6px;padding:16px;text-align:center;"><div style="font-size:1.8em;font-weight:900;color:#00f3ff;">ANGKA</div><div style="font-size:11px;color:#666;margin-top:4px;">LABEL</div></div><div style="flex:1;min-width:120px;background:#0a0f1e;border:1px solid rgba(0,243,255,0.2);border-radius:6px;padding:16px;text-align:center;"><div style="font-size:1.8em;font-weight:900;color:#00f3ff;">ANGKA</div><div style="font-size:11px;color:#666;margin-top:4px;">LABEL</div></div></div>

Insight box: <div style="background:#0a0f1e;border-left:3px solid #00f3ff;border-radius:0 6px 6px 0;padding:16px 20px;margin:1.5em 0;"><strong style="color:#00f3ff;font-size:11px;letter-spacing:2px;">💡 INSIGHT</strong><p style="margin:8px 0 0;color:#ccc;font-size:14px;">ISI</p></div>

Warning box: <div style="background:#1a0a0a;border-left:3px solid #ff6b6b;border-radius:0 6px 6px 0;padding:16px 20px;margin:1.5em 0;"><strong style="color:#ff6b6b;font-size:11px;letter-spacing:2px;">⚠ PERHATIAN</strong><p style="margin:8px 0 0;color:#ccc;font-size:14px;">ISI</p></div>

Progress bar: <div style="margin:1em 0;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#666;margin-bottom:4px;"><span>LABEL</span><span style="color:#00f3ff;">XX%</span></div><div style="background:#111;border-radius:3px;height:6px;"><div style="background:linear-gradient(90deg,#00f3ff,#0080ff);height:6px;border-radius:3px;width:XX%;"></div></div></div>

FORMAT JSON (satu baris, NO newline dalam value):
{"title":"Judul max 80 karakter","excerpt":"Ringkasan max 160 karakter","tags":["tag1","tag2","tag3","tag4"],"content":"HTML PANJANG, semua dalam satu baris, gunakan elemen di atas, sisipkan IMAGE_1 dan IMAGE_2","coverImagePrompt":"Cinematic English prompt cover image","imagePrompt2":"Different English prompt 2nd image","hasRealtimeData":false}`;

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

async function publishArticle(db, article, coverImage, img2, topic) {
  const slug = slugify(article.title);
  if (await slugExists(db, slug)) return { skipped: true, reason: 'duplicate slug', slug };

  let content = article.content || '';

  // Replace image placeholders
  content = content.replace(
    /\{\{IMAGE_1\}\}/g,
    `<img src="${img2}" alt="Ilustrasi artikel" style="width:100%;max-width:100%;border-radius:8px;border:1px solid rgba(0,243,255,0.1);margin:1.5em 0;" />`
  );
  const img2b = generateImageUrl(article.imagePrompt2 || article.coverImagePrompt || topic, Date.now() + 999);
  content = content.replace(
    /\{\{IMAGE_2\}\}/g,
    `<img src="${img2b}" alt="Ilustrasi artikel" style="width:100%;max-width:100%;border-radius:8px;border:1px solid rgba(0,243,255,0.1);margin:1.5em 0;" />`
  );
  content = content.replace(/\{\{IMAGE_[123]\}\}/g, '');

  // Inject widget programatik
  content = injectWidgets(content, topic);

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
        // Pilih topik yang belum dipakai hari ini
        const topic = await pickUnusedTopic(db, AGENT_TOPICS);
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

        const publishResult = await publishArticle(db, article, coverImage, img2, topic);
        results.push({ topic, ...publishResult });

      } catch (err) {
        console.error(`[Agent] Error:`, err.message);
        results.push({ error: err.message });
      }
    }

    return NextResponse.json({ status: 'success', processed: ARTICLES_PER_RUN, results }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  return POST(request);
}