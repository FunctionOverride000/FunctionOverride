export const AGENT_TOPICS = [
  // ── Crypto & Bitcoin
  'Bitcoin price today breaking news',
  'Ethereum price analysis today',
  'crypto market crash or pump today',
  'altcoin trending today crypto',
  'DeFi protocol news today',
  'Solana BNB trending crypto news',
  'Bitcoin ETF institutional news',
  'crypto regulation news latest',
  'stablecoin USDT USDC news',
  'NFT Web3 news today',

  // ── Market Sessions (wajib jika ada berita)
  'Sydney ASX market open news today',
  'Tokyo Nikkei Japan market news today',
  'London FTSE Europe market news today',
  'New York NYSE market open news today',
  'Asia Pacific market session news today',

  // ── Macro Economy
  'US Federal Reserve interest rate decision',
  'US dollar index DXY market today',
  'inflation CPI data market impact today',
  'US stock market S&P 500 Nasdaq today',
  'gold silver oil price market today',
  'China economy market news today',
  'global recession risk economic outlook',
  'geopolitical risk market impact today',

  // ── Indonesia
  'IHSG Bursa Efek Indonesia hari ini',
  'Rupiah Dollar kurs hari ini',
  'ekonomi Indonesia berita terkini',
  'Bank Indonesia kebijakan moneter terbaru',
  'crypto Indonesia OJK regulasi terbaru',

  // ── Technology & AI
  'artificial intelligence AI breakthrough today',
  'ChatGPT OpenAI Google AI news today',
  'semiconductor chip tech news today',
  'Web3 blockchain technology latest news',
  'cybersecurity hack breach news today',
  'quantum computing tech news today',
];

// 1 artikel per run — hindari timeout Vercel free plan
export const ARTICLES_PER_RUN = 1;

export const ARTICLE_LANGUAGE = 'Indonesian';
export const MIN_WORD_COUNT = 800;