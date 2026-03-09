// src/app/api/og/route.jsx
// Generates OG image 1200x630 for each article
// Usage: /api/og?title=...&tags=...&date=...

import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const title  = searchParams.get('title')  || 'FOSHT Blog';
  const tags   = searchParams.get('tags')   || '';
  const date   = searchParams.get('date')   || '';
  const tagArr = tags.split(',').filter(Boolean).slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#050505',
          padding: '60px 72px',
          fontFamily: 'monospace',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background grid lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(0,243,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,243,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          display: 'flex',
        }} />

        {/* Glow top-left */}
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,243,255,0.08) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Glow bottom-right */}
        <div style={{
          position: 'absolute', bottom: '-100px', right: '-60px',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,100,255,0.06) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Top bar — FOSHT BLOG branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 1 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            border: '1px solid rgba(0,243,255,0.25)',
            padding: '8px 18px',
            borderRadius: '4px',
            background: 'rgba(0,243,255,0.04)',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f3ff', display: 'flex' }} />
            <span style={{ color: '#00f3ff', fontSize: '14px', letterSpacing: '4px', fontWeight: 700 }}>
              FOSHT BLOG
            </span>
          </div>
          {date && (
            <span style={{ color: '#333', fontSize: '13px', letterSpacing: '2px' }}>{date}</span>
          )}
        </div>

        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', zIndex: 1, flex: 1, justifyContent: 'center' }}>
          <div style={{
            width: '48px', height: '3px',
            background: 'linear-gradient(90deg, #00f3ff, transparent)',
            display: 'flex',
          }} />
          <div style={{
            color: '#ffffff',
            fontSize: title.length > 60 ? '42px' : title.length > 40 ? '50px' : '58px',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.5px',
            maxWidth: '900px',
            display: 'flex',
          }}>
            {title}
          </div>
        </div>

        {/* Bottom — tags + domain */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', zIndex: 1 }}>
          {/* Tags */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', maxWidth: '700px' }}>
            {tagArr.map((tag, i) => (
              <div key={i} style={{
                color: '#00f3ff',
                fontSize: '13px',
                letterSpacing: '2px',
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

          {/* Domain */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px',
          }}>
            <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 700, letterSpacing: '1px' }}>
              fosht.vercel.app
            </span>
            <span style={{ color: '#222', fontSize: '11px', letterSpacing: '3px' }}>
              BY FEBRI OSHT
            </span>
          </div>
        </div>

        {/* Bottom border glow */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #00f3ff, transparent)',
          display: 'flex',
        }} />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}