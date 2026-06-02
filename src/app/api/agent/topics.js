// src/app/api/agent/topics.js

// ─────────────────────────────────────────────────────────────
// PANDUAN TOPIK:
// - Spesifik: sebut nama aset, institusi, event, atau angka
// - Berbasis berita: harus ada kemungkinan berita terbaru 2-3 hari
// - Hindari topik terlalu luas ("crypto news today") → Tavily tidak fokus
// - Rotasi otomatis — semua topik akan dipakai sebelum diulang
// ─────────────────────────────────────────────────────────────

export const AGENT_TOPICS = [

  // ── Bitcoin & Ethereum
  'Bitcoin price surge or drop latest news',
  'Bitcoin ETF BlackRock Fidelity inflow outflow',
  'Bitcoin halving impact price analysis',
  'Ethereum price ETF staking latest news',
  'Ethereum layer 2 upgrade news',
  'Bitcoin dominance altcoin season signal',
  'Bitcoin whale accumulation on-chain data',
  'MicroStrategy Bitcoin purchase holdings update',

  // ── Altcoin Spesifik
  'Solana SOL price network upgrade news',
  'BNB Binance latest news regulation',
  'XRP Ripple SEC lawsuit court update',
  'Cardano ADA development update price',
  'Avalanche AVAX ecosystem news',
  'Chainlink LINK oracle integration news',
  'Polkadot DOT parachain update',
  'Sui Aptos Move blockchain ecosystem news',

  // ── DeFi & DEX
  'Uniswap Aave Compound DeFi TVL update',
  'DeFi protocol hack exploit latest',
  'Ethereum gas fee trend DeFi activity',
  'liquid staking Lido EigenLayer news',

  // ── Crypto Regulasi & Institusi
  'SEC crypto enforcement action latest',
  'US crypto regulation Congress bill update',
  'Coinbase Binance regulatory news latest',
  'crypto ETF approval rejection SEC CFTC',
  'stablecoin regulation USDT USDC latest',
  'crypto OJK Indonesia regulasi terbaru',
  'crypto exchange hack security breach',

  // ── NFT & Web3
  'NFT market OpenSea Blur volume trend',
  'Web3 gaming play-to-earn latest news',
  'Bored Ape Pudgy Penguins NFT price floor',

  // ── Market Sessions
  'Tokyo Nikkei Japan stock market today news',
  'London FTSE Europe market open news',
  'New York S&P 500 Nasdaq open today news',
  'ASX Australia market session news',
  'Asia Pacific market risk-on risk-off today',

  // ── Makro Ekonomi Global
  'Federal Reserve interest rate decision Powell',
  'US CPI inflation data market reaction',
  'US dollar DXY index trend today',
  'US Treasury yield curve inversion update',
  'US GDP growth recession risk latest',
  'China PBoC stimulus economy latest news',
  'China property market Evergrande update',
  'Japan BOJ monetary policy yen news',
  'ECB Europe rate decision inflation news',
  'OPEC oil production cut price reaction',
  'gold price XAU safe haven demand news',
  'geopolitical risk Middle East market impact',
  'trade war tariff US China latest news',

  // ── Saham & Indeks AS
  'S&P 500 Nasdaq earnings season results',
  'Apple Microsoft Nvidia earnings stock news',
  'Tesla stock price analyst target update',
  'semiconductor chip TSMC Intel AMD news',
  'AI chip demand Nvidia H100 B200 update',

  // ── Indonesia Ekonomi & Pasar
  'IHSG Bursa Efek Indonesia pergerakan hari ini',
  'Rupiah Dollar kurs Bank Indonesia intervensi',
  'Bank Indonesia suku bunga keputusan terbaru',
  'saham BBCA BBRI TLKM pergerakan terkini',
  'ekonomi Indonesia PDB inflasi data terbaru',
  'investasi asing FDI Indonesia sektor terbaru',
  'BUMN IPO saham Indonesia terbaru',
  'harga emas Antam Pegadaian hari ini',
  'harga minyak Pertamina BBM terbaru',
  'startup Indonesia pendanaan unicorn berita',

  // ── Teknologi & AI
  'OpenAI GPT model release update news',
  'Google DeepMind Gemini AI breakthrough',
  'Anthropic Claude AI model update news',
  'Meta Llama open source AI news',
  'AI regulation EU US policy latest',
  'Nvidia GPU AI data center demand news',
  'semiconductor export ban US China chip',
  'Apple AI features iOS update news',
  'Microsoft Copilot Azure AI enterprise news',
  'autonomous vehicle Tesla Waymo news',
  'quantum computing IBM Google breakthrough',
  'cybersecurity ransomware attack latest',
  'data breach personal data leak news',
  'SpaceX Starlink launch update news',

];

// Jumlah artikel per run — 1 untuk menghindari timeout Vercel free
// Naikkan ke 2 jika upgrade ke Vercel Pro
export const ARTICLES_PER_RUN = 1;

export const ARTICLE_LANGUAGE = 'Indonesian';
export const MIN_WORD_COUNT = 800;
