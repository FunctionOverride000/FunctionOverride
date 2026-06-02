export default function sitemap() {
  const baseUrl = 'https://fosht.vercel.app';

  // 1. Daftar halaman utama website kamu
  const routes = [
    '',
    '/blog',
    // '/portfolio', // <-- hapus tanda // jika kamu punya halaman portfolio terpisah
    // '/about',     // <-- hapus tanda // jika kamu punya halaman about
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0], // Menghasilkan tanggal hari ini
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Daftar artikel blog (Saya ambil dari log server kamu sebelumnya)
  const blogs = [
    '/blog/bitcoin-halving-memahami-siklus-4-tahun-dan-proyeksi-menuju-2028',
    '/blog/era-depin-2026-saatnya-blockchain-membangun-infrastruktur-fisik-dunia-nyata',
    '/blog/era-vibecoding-2026-mengapa-skill-coding-saja-tidak-lagi-cukup',
    '/blog/geopolitik-teknologi-2026-dampak-perang-ai-terhadap-ekosistem-web3-dan-cybersecurity',
    '/blog/dari-mahasiswa-it-ke-web-developer-perjalanan-saya-membangun-fosht'
  ].map((slug) => ({
    url: `${baseUrl}${slug}`,
    lastModified: new Date().toISOString().split('T')[0],
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Gabungkan rute utama dan blog menjadi satu sitemap utuh
  return [...routes, ...blogs];
}