// src/app/api/og/route.jsx
// Generates OG image 1200x630 per article
// Params: ?title=...&tags=...&date=...&img=...

import { ImageResponse } from 'next/og';

export const runtime = 'edge';

const BLOCKED = ['alternative.me', 'tradingview.com', 'investing.com', 's.tradingview.com'];

async function fetchBase64(url, timeout = 4000) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; OGBot/1.0)' },
      signal: AbortSignal.timeout(timeout),
    });
    if (!res.ok) return null;
    const buf  = await res.arrayBuffer();
    const b64  = Buffer.from(buf).toString('base64');
    const mime = res.headers.get('content-type') || 'image/png';
    return `data:${mime};base64,${b64}`;
  } catch {
    return null;
  }
}

export async function GET(request) {
  const { searchParams, protocol, host } = new URL(request.url);
  const baseUrl = `${protocol}//${host}`;

  const title  = searchParams.get('title') || 'FOSHT Blog';
  const tags   = searchParams.get('tags')  || '';
  const date   = searchParams.get('date')  || '';
  const imgUrl = searchParams.get('img')   || '';
  const tagArr = tags.split(',').filter(Boolean).slice(0, 3);

  // ── Fetch logo (/fosht.png dari domain sendiri — selalu berhasil)
  const logoData = await fetchBase64(`${baseUrl}/fosht.png`);

  // ── Fetch article image
  // Jika URL diblokir / kosong / gagal → fallback ke /fosht.png
  let imgData = null;
  const isBlocked = !imgUrl || BLOCKED.some(d => imgUrl.includes(d));

  if (!isBlocked) {
    imgData = await fetchBase64(imgUrl);
  }

  // Fallback: pakai fosht.png sebagai gambar kanan
  if (!imgData) {
    imgData = logoData;
  }

  const hasImg   = !!imgData;
  const isFallback = !imgUrl || isBlocked || imgData === logoData;
  const fontSize = title.length > 60 ? '40px' : title.length > 40 ? '48px' : '56px';

  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '630px',
        display: 'flex',
        backgroundColor: '#050505',
        fontFamily: 'monospace',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(0,243,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,243,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          display: 'flex',
        }} />

        {/* Glow top-left */}
        <div style={{
          position: 'absolute', top: '-100px', left: '-100px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,243,255,0.08) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Glow bottom-right */}
        <div style={{
          position: 'absolute', bottom: '-120px', right: hasImg ? '300px' : '-80px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,80,255,0.05) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* ── LEFT CONTENT ── */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1, padding: '52px 56px',
          zIndex: 1,
        }}>

          {/* Top — logo + branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {logoData && (
              <img
                src={logoData}
                width={52} height={52}
                style={{ borderRadius: '8px', objectFit: 'contain', imageRendering: 'crisp-edges' }}
              />
            )}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '2px',
            }}>
              <span style={{ color: '#00f3ff', fontSize: '18px', letterSpacing: '4px', fontWeight: 900 }}>
                FOSHT
              </span>
              <span style={{ color: '#1a4a4a', fontSize: '10px', letterSpacing: '3px' }}>
                BLOG
              </span>
            </div>
            {date && (
              <span style={{ color: '#1e1e1e', fontSize: '12px', letterSpacing: '2px', marginLeft: '8px' }}>
                {date}
              </span>
            )}
          </div>

          {/* Middle — title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              width: '52px', height: '3px',
              background: 'linear-gradient(90deg, #00f3ff, transparent)',
              display: 'flex',
            }} />
            <div style={{
              color: '#ffffff',
              fontSize,
              fontWeight: 900,
              lineHeight: 1.18,
              letterSpacing: '-0.5px',
              maxWidth: hasImg ? '530px' : '950px',
              display: 'flex',
            }}>
              {title}
            </div>
          </div>

          {/* Bottom — tags + domain */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {tagArr.map((tag, i) => (
                <div key={i} style={{
                  color: '#00f3ff', fontSize: '12px', letterSpacing: '1.5px',
                  padding: '5px 14px',
                  border: '1px solid rgba(0,243,255,0.2)',
                  borderRadius: '3px',
                  background: 'rgba(0,243,255,0.06)',
                  display: 'flex',
                }}>
                  #{tag}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#ffffff', fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}>
                fosht.vercel.app
              </span>
              <span style={{ color: '#111', fontSize: '10px', letterSpacing: '3px' }}>
                · BY FEBRI OSHT
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT — article image or fosht logo centered ── */}
        <div style={{
          width: '400px', height: '630px',
          position: 'relative', display: 'flex',
          flexShrink: 0, overflow: 'hidden',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Fade left edge */}
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: '140px', zIndex: 2,
            background: 'linear-gradient(90deg, #050505, transparent)',
            display: 'flex',
          }} />

          {isFallback ? (
            // Fallback: logo centered dengan glow
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', height: '100%',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                width: '300px', height: '300px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,243,255,0.06) 0%, transparent 70%)',
                display: 'flex',
              }} />
              {logoData && (
                <img
                  src={logoData}
                  width={180} height={180}
                  style={{ objectFit: 'contain', opacity: 0.15, imageRendering: 'crisp-edges' }}
                />
              )}
            </div>
          ) : (
            // Article image
            <img
              src={imgData}
              style={{ width: '400px', height: '630px', objectFit: 'cover', opacity: 0.7 }}
            />
          )}
        </div>

        {/* Bottom glow line */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, #00f3ff 40%, transparent)',
          display: 'flex',
        }} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}