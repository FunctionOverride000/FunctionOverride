// src/app/api/og/route.jsx
// Generates OG image 1200x630 per article
// Params: ?title=...&tags=...&date=...&img=...&logo=...

import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title   = searchParams.get('title')  || 'FOSHT Blog';
  const tags    = searchParams.get('tags')   || '';
  const date    = searchParams.get('date')   || '';
  const imgUrl  = searchParams.get('img')    || '';
  const logoUrl = searchParams.get('logo')   || '';
  const tagArr  = tags.split(',').filter(Boolean).slice(0, 3);

  // Pre-fetch images as base64 so edge runtime can render them
  let logoData = null;
  let imgData  = null;

  if (logoUrl) {
    try {
      const res  = await fetch(logoUrl);
      const buf  = await res.arrayBuffer();
      const b64  = Buffer.from(buf).toString('base64');
      const mime = res.headers.get('content-type') || 'image/png';
      logoData   = `data:${mime};base64,${b64}`;
    } catch {}
  }

  if (imgUrl) {
    try {
      const res  = await fetch(imgUrl);
      const buf  = await res.arrayBuffer();
      const b64  = Buffer.from(buf).toString('base64');
      const mime = res.headers.get('content-type') || 'image/jpeg';
      imgData    = `data:${mime};base64,${b64}`;
    } catch {}
  }

  const hasImg   = !!imgData;
  const titleMax = hasImg ? 520 : 900;
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
          background: 'radial-gradient(circle, rgba(0,243,255,0.07) 0%, transparent 70%)',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {logoData && (
              <img
                src={logoData}
                width={36} height={36}
                style={{ borderRadius: '6px', objectFit: 'contain' }}
              />
            )}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              border: '1px solid rgba(0,243,255,0.22)',
              padding: '7px 16px', borderRadius: '4px',
              background: 'rgba(0,243,255,0.04)',
            }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00f3ff', display: 'flex' }} />
              <span style={{ color: '#00f3ff', fontSize: '13px', letterSpacing: '4px', fontWeight: 700 }}>
                FOSHT BLOG
              </span>
            </div>
            {date && (
              <span style={{ color: '#2a2a2a', fontSize: '12px', letterSpacing: '2px' }}>{date}</span>
            )}
          </div>

          {/* Middle — title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              width: '44px', height: '3px',
              background: 'linear-gradient(90deg, #00f3ff, transparent)',
              display: 'flex',
            }} />
            <div style={{
              color: '#ffffff',
              fontSize,
              fontWeight: 900,
              lineHeight: 1.18,
              letterSpacing: '-0.5px',
              maxWidth: `${titleMax}px`,
              display: 'flex',
            }}>
              {title}
            </div>
          </div>

          {/* Bottom — tags + domain */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Tags */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {tagArr.map((tag, i) => (
                <div key={i} style={{
                  color: '#00f3ff', fontSize: '12px', letterSpacing: '1.5px',
                  padding: '4px 12px',
                  border: '1px solid rgba(0,243,255,0.18)',
                  borderRadius: '3px',
                  background: 'rgba(0,243,255,0.05)',
                  display: 'flex',
                }}>
                  #{tag}
                </div>
              ))}
            </div>

            {/* Domain */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ color: '#ffffff', fontSize: '15px', fontWeight: 700, letterSpacing: '1px' }}>
                fosht.vercel.app
              </span>
              <span style={{ color: '#1a1a1a', fontSize: '10px', letterSpacing: '3px' }}>
                BY FEBRI OSHT
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT — article image ── */}
        {hasImg && (
          <div style={{
            width: '420px', height: '630px',
            position: 'relative', display: 'flex', flexShrink: 0,
          }}>
            {/* Fade left edge */}
            <div style={{
              position: 'absolute', top: 0, left: 0, bottom: 0, width: '120px', zIndex: 2,
              background: 'linear-gradient(90deg, #050505, transparent)',
              display: 'flex',
            }} />
            <img
              src={imgData}
              style={{ width: '420px', height: '630px', objectFit: 'cover', opacity: 0.75 }}
            />
          </div>
        )}

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