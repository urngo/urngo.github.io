const V = 'kp-v4'; // Хувилбарыг v4 болгож шинэчлэв (энэ нь кэшийг цэвэрлэнэ)
const F = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(F)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Зөвхөн Firebase биш, үндсэн файлуудаа кэшээс унших логик
  if (e.request.url.includes('firebaseio.com') || e.request.url.includes('googleapis.com')) {
    return; // Firebase-ийн realtime датаг кэшлэхгүй, шууд сүлжээнээс авна
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('/index.html')))
  );
});
