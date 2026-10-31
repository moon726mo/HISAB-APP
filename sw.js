// Service Worker — Expense Tracker PWA
// v9: বাজার হিসাব (bazar-hisab.html) অ্যাপ শেলে যোগ — iframe-এ অফলাইনে খুলবে।
// v8: BASE PATH DYNAMIC — যেকোনো repo name এ কাজ করবে।
//     sw.js যে ফোল্ডারে থাকবে, সেটাই স্বয়ংক্রিয়ভাবে base path হিসেবে নেবে।

const CACHE_VERSION = 'v24';
const CACHE_NAME    = 'expense-tracker-' + CACHE_VERSION;
const FONT_CACHE    = 'expense-tracker-fonts-v1';

// sw.js এর location থেকে base path বের করো।
// যেমন: sw.js আছে "/MY-APP/sw.js" → BASE = "/MY-APP"
// যেমন: sw.js আছে "/sw.js"         → BASE = ""  (root deploy এ)
const BASE = self.location.pathname.replace(/\/sw\.js$/, '');

const APP_SHELL = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/bazar-hisab.html',
  BASE + '/manifest.json',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png',
];

// ══════════════════════════════════════════════════════════════════════════════
// INSTALL — প্রতিটি asset আলাদাভাবে cache, একটি fail করলে বাকিগুলো ঠিক থাকে
// ══════════════════════════════════════════════════════════════════════════════
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        APP_SHELL.map(url =>
          cache.add(url).catch(err =>
            console.warn('[SW v9] Install cache skipped:', url, err)
          )
        )
      )
    ).then(() =>
      caches.open(FONT_CACHE).then(fc =>
        Promise.all([
          'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap',
          // বাজার হিসাব পেজের ফন্ট
          'https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@500;700;800&family=Hind+Siliguri:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap'
        ].map(u => fc.add(u).catch(() => console.warn('[SW v9] Font cache skipped:', u))))
      )
    ).then(() => {
      console.log('[SW v9] Install complete, BASE:', BASE);
      return self.skipWaiting();
    })
  );
});

// ══════════════════════════════════════════════════════════════════════════════
// ACTIVATE — পুরনো cache মুছো
// ══════════════════════════════════════════════════════════════════════════════
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== FONT_CACHE)
          .map(k => {
            console.log('[SW v9] Removing old cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => {
      console.log('[SW v9] Activated');
      return self.clients.claim();
    })
  );
});

// ══════════════════════════════════════════════════════════════════════════════
// FETCH
// ══════════════════════════════════════════════════════════════════════════════
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // ── ① Google Apps Script — Network Only ───────────────────────────────────
  if (url.includes('script.google.com')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(
          JSON.stringify({ ok: false, msg: 'Offline' }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // ── ② Google Fonts — Cache First ──────────────────────────────────────────
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(FONT_CACHE).then(fc =>
        fc.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request)
            .then(resp => {
              if (resp && resp.status === 200) fc.put(event.request, resp.clone());
              return resp;
            })
            .catch(() => new Response('', { status: 408 }));
        })
      )
    );
    return;
  }

  // ── ③ App Shell — Cache First + Background Revalidate ────────────────────
  // Cache hit → সাথে সাথে serve, offline এ blank screen নেই
  // Background এ network থেকে quietly update
  if (
    event.request.mode === 'navigate' ||
    url.includes(self.location.origin + BASE + '/')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {

          const networkFetch = fetch(event.request)
            .then(resp => {
              if (resp && resp.status === 200) cache.put(event.request, resp.clone());
              return resp;
            })
            .catch(() => null);

          if (cached) return cached;

          return networkFetch.then(resp => {
            if (resp) return resp;
            return cache.match(BASE + '/index.html')
              .then(fb => fb || cache.match(BASE + '/'));
          });
        })
      )
    );
    return;
  }

  // ── ④ অন্য সব — Network First, cache fallback ────────────────────────────
  event.respondWith(
    fetch(event.request)
      .then(resp => {
        if (resp && resp.status === 200) {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resp.clone()));
        }
        return resp;
      })
      .catch(() =>
        caches.match(event.request).then(cached =>
          cached || caches.match(BASE + '/index.html')
        )
      )
  );
});
