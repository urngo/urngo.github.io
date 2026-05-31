// ╔══════════════════════════════════════════════════════════╗
// ║  sw.js  —  Kiss Ping Cache Service Worker               ║
// ║  Офлайн ажиллах + хурдан ачааллах                      ║
// ╚══════════════════════════════════════════════════════════╝

var CACHE_NAME = 'kissping-v3';
var CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install — cache хийнэ
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CACHE_FILES);
    }).then(function() {
      console.log('[SW] Cache installed');
      return self.skipWaiting();
    })
  );
});

// Activate — хуучин cache устгана
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return clients.claim();
    })
  );
});

// Fetch — cache-first, fallback to network
self.addEventListener('fetch', function(event) {
  // Realtime Database (firebaseio.com) болон Google/Firebase-ийн бүх хүсэлтийг кэшлэхгүй, ШУУД алгасна! ✅
  if (event.request.url.includes('firebaseio.com') ||
      event.request.url.includes('googleapis') ||
      event.request.url.includes('gstatic') ||
      event.request.url.includes('firebase') ||
      event.request.url.includes('youtube')) {
    return; // Эндээс шууд гарч, сүлжээ рүү чөлөөтэй нэвтрүүлнэ
  }

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        if (!response || response.status !== 200) return response;
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(function() {
        // Офлайн үед index.html буцаана
        return caches.match('./index.html');
      });
    })
  );
});
