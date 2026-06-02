// FOSHT PWA Service Worker
const CACHE_NAME = 'fosht-v1';

// File yang di-cache saat install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/fosht.png',
];

// ── Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ── Activate: hapus cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: Network first, fallback ke cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET dan request ke API / Firebase / Cloudinary
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isExternal =
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('cloudinary.com') ||
    url.hostname.includes('emailjs.com') ||
    url.hostname.includes('firestore.googleapis.com');

  if (isExternal) return;

  // Untuk API routes — network only
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache response yang berhasil
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback ke cache kalau offline
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Fallback ke homepage kalau halaman tidak ada di cache
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});