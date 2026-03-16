// src/app/api/agent/topics.js
// Topik yang dicari agent setiap run
// Edit file ini untuk mengubah konteks artikel yang digenerate

export const AGENT_TOPICS = [
  // Crypto & Bitcoin
  'Bitcoin price analysis latest news',
  'Ethereum crypto market update',
  'crypto market global today',
  'DeFi blockchain technology news',

  // Global Market
  'S&P 500 stock market today',
  'gold price market analysis',
  'oil price global market',
  'US Federal Reserve interest rate news',
  'global economic outlook',

  // Technology
  'artificial intelligence AI breakthrough news',
  'tech industry latest developments',
  'semiconductor chip industry news',

  // Indonesia Market
  'Indonesia ekonomi market terkini',
  'IHSG Rupiah market Indonesia',
  'crypto Indonesia regulasi terbaru',

  // Trending Global
  'trending global finance news today',
  'geopolitical impact market economy',
];

// Berapa artikel yang digenerate per run
export const ARTICLES_PER_RUN = 1

// Bahasa artikel
export const ARTICLE_LANGUAGE = 'Indonesian'; // atau 'English'

// Minimal panjang artikel (kata)
export const MIN_WORD_COUNT = 600;