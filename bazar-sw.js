// বাজার হিসাব — Service Worker
// অ্যাপ শেল (HTML/manifest/icons) ক্যাশ করে রাখে যাতে ইন্টারনেট ছাড়াও অ্যাপটা খোলা ও ব্যবহার করা যায়।
// localStorage-এ থাকা ডেটা (priceList, priceHistory, shoppingLog) এমনিতেই অফলাইনে কাজ করে —
// এই ফাইলটা শুধু নিশ্চিত করে যে পেজটা নিজেই (HTML/CSS/JS/icons) অফলাইনে লোড হবে।

const CACHE_VERSION = 'v4';
const CACHE_NAME = 'bazar-hisab-cache-' + CACHE_VERSION;

const APP_SHELL = [
  './',
  './bazar-hisab.html',
  './bazar-manifest.json',
  './bazar-icons/icon-192.png',
  './bazar-icons/icon-512.png',
  './bazar-icons/icon-512-maskable.png',
  './bazar-icons/apple-touch-icon.png',
  './bazar-icons/favicon-32.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // শুধু GET রিকোয়েস্ট হ্যান্ডল করবে। Google Apps Script সিঙ্ক কল (POST বা GET,
  // অন্য domain) এখানে ছোঁয়া হবে না — সরাসরি নেটওয়ার্কে যাবে, অ্যাপের নিজস্ব
  // fetch()/catch() লজিক সেটা সামলাবে। শুধু same-origin ফাইল আর Google Fonts
  // (যাতে কাস্টম ফন্টও অফলাইনে কাজ করে) ক্যাশ করা হয়।
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  const isSameOrigin = url.origin === self.location.origin;
  const isFontHost = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!isSameOrigin && !isFontHost) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => cached); // পুরো অফলাইনে থাকলে ক্যাশ থেকে দেখাবে

      // ক্যাশ থাকলে সেটা সাথে সাথে দেখায় (দ্রুত + অফলাইন-প্রুফ),
      // পেছনে পেছনে নেটওয়ার্ক থেকে নতুন ভার্সন এনে ক্যাশ আপডেট করে রাখে
      return cached || networkFetch;
    })
  );
});
