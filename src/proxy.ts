// src/proxy.ts
// Next.js 16 menggunakan "proxy" bukan "middleware"
// https://nextjs.org/docs/messages/middleware-to-proxy

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BLOCKED_BOTS = [
  'ahrefsbot', 'semrushbot', 'dotbot', 'blexbot', 'mj12bot',
  'petalbot', 'serpstatbot', 'seokicks', 'opensiteexplorer',
  'baiduspider', 'bytespider',
  'scrapy', 'python-requests', 'go-http-client',
  'wget/', 'libwww', 'jakarta', 'okhttp', 'zgrab',
  'perplexitybot',
];

const ALLOWED_BOTS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot',
  'facebot', 'ia_archiver', 'twitterbot', 'linkedinbot',
  'whatsapp', 'telegrambot', 'discordbot',
  'gptbot', 'chatgpt-user', 'oai-searchbot',
  'anthropic-ai', 'claude-web', 'cohere-ai',
  'youbot', 'applebot',
];

// ← nama export HARUS "proxy" di Next.js 16
export function proxy(request: NextRequest) {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();

  if (!ua || ua.length < 10) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const isAllowed = ALLOWED_BOTS.some(b => ua.includes(b));
  if (isAllowed) return NextResponse.next();

  const isBlocked = BLOCKED_BOTS.some(b => ua.includes(b));
  if (isBlocked) {
    return new NextResponse('Forbidden — Bot not allowed', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|.*\\.webp).*)',
  ],
};