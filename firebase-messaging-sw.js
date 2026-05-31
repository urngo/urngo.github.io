// ╔══════════════════════════════════════════════════════════╗
// ║  firebase-messaging-sw.js  —  Kiss Ping Service Worker  ║
// ║  Утас хаалттай үед ч мэдэгдэл ирдэг!                  ║
// ╚══════════════════════════════════════════════════════════╝
//
// ⚠️  ТОХИРУУЛАХ: Доорх YOUR_... утгуудыг өөрийн Firebase
//     config-ийн утгаар солино уу!

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// ── Өөрийн Firebase config оруулах ──────────────────────
const FB_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  databaseURL:       "https://YOUR_PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "YOUR_PROJECT",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
// ─────────────────────────────────────────────────────────

firebase.initializeApp(FB_CONFIG);
const messaging = firebase.messaging();

// Background мэдэгдэл — апп хаалттай үед ажиллана
messaging.onBackgroundMessage(function(payload) {
  console.log('[SW] Background message:', payload);

  var data = payload.data || {};
  var title = data.title || 'Kiss Ping 💋';
  var body  = data.body  || 'Хайрт чинь чамайг санаж байна! 💕';
  var icon  = data.icon  || 'icon-192.png';

  return self.registration.showNotification(title, {
    body:    body,
    icon:    icon,
    badge:   'icon-192.png',
    tag:     'kissping-notif',
    renotify: true,
    vibrate: [200, 100, 200, 100, 200],
    data:    { url: data.url || './' },
    actions: [
      { action: 'open',    title: '💋 Нээх'   },
      { action: 'dismiss', title: 'Хаах'       }
    ]
  });
});

// Мэдэгдэлд дарахад апп нээх
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'dismiss') return;

  var url = (event.notification.data && event.notification.data.url) || './';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Аль хэдийн нээлттэй tab байвал focus хийнэ
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.includes('index.html') || client.url.endsWith('/')) {
          return client.focus();
        }
      }
      // Байхгүй бол шинэ tab нээнэ
      return clients.openWindow(url);
    })
  );
});

// Service Worker install & activate
self.addEventListener('install', function(event) {
  console.log('[SW] Kiss Ping Service Worker installed ✅');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[SW] Kiss Ping Service Worker activated ✅');
  event.waitUntil(clients.claim());
});
