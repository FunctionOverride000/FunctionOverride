import { NextResponse } from 'next/server';

// Bot spam / mencurigakan yang di-block
const BLOCKED_BOTS = [
  'ahrefsbot', 'semrushbot', 'dotbot', 'blexbot', 'mj12bot',
  'petalbot', 'serpstatbot', 'seokicks', 'opensiteexplorer',
  'yandexbot', 'baiduspider', 'bytespider', 'claudebot',
  'scrapy', 'python-requests', 'go-http-client', 'curl/',
  'wget/', 'libwww', 'jakarta', 'okhttp', 'zgrab', 'perplexitybot',
];

// AI/crawler baik yang BOLEH masuk
const ALLOWED_BOTS = [
  'googlebot', 'bingbot', 'slurp', 'duckduckbot',
  'facebot', 'ia_archiver', 'twitterbot', 'linkedinbot',
  'whatsapp', 'telegrambot', 'discordbot',
  'gptbot', 'chatgpt-user', 'oai-searchbot',
  'anthropic-ai', 'claude-web', 'cohere-ai',
  'perplexitybot', 'youbot',
];

export function middleware(request) {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  const ip = request.headers.get('x-forwarded-for') || request.ip || '';

  // Kalau tidak ada UA sama sekali → block (bot primitif)
  if (!ua || ua.length < 10) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Cek allowed dulu — kalau masuk whitelist, langsung lolos
  const isAllowed = ALLOWED_BOTS.some(b => ua.includes(b));
  if (isAllowed) return NextResponse.next();

  // Cek blocked list
  const isBlocked = BLOCKED_BOTS.some(b => ua.includes(b));
  if (isBlocked) {
    return new NextResponse('Forbidden — Bot not allowed', { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)'],
};