/* Maktab Vazifa — service worker (qo'lda yozilgan, qo'shimcha paketsiz)
 *
 * Strategiya:
 *  - Sahifa (navigatsiya):   avval tarmoq, internet yo'q bo'lsa — keshdagi ilova qobig'i
 *  - /assets/* (hash'li):    avval kesh (fayl nomi o'zgarsa, yangisi yuklanadi)
 *  - Shriftlar (Google):     stale-while-revalidate
 *  - API (/api, /media) va boshqa domenlar: HECH QACHON keshlanmaydi
 *
 * Yangi versiyani chiqarganda CACHE_VERSION ni oshiring.
 */
const CACHE_VERSION = "v2";
const SHELL_CACHE = `shell-${CACHE_VERSION}`;
const ASSET_CACHE = `assets-${CACHE_VERSION}`;
const FONT_CACHE = `fonts-${CACHE_VERSION}`;
const KNOWN = [SHELL_CACHE, ASSET_CACHE, FONT_CACHE];

const SHELL_URLS = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .catch(() => {}) // bitta fayl topilmasa ham o'rnatish to'xtab qolmasin
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => !KNOWN.includes(n)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })()
  );
});

// Ilova "Yangilash" tugmasini bosganda yangi versiya darhol ishga tushadi
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Google Fonts
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(staleWhileRevalidate(req, FONT_CACHE));
    return;
  }

  // Boshqa domenlar (masalan, backend API boshqa portda) — tegmaymiz
  if (url.origin !== self.location.origin) return;

  // Xavfsizlik uchun API va yuklangan fayllarni keshlamaymiz
  if (url.pathname.startsWith("/api") || url.pathname.startsWith("/media")) return;

  // Sahifalar (SPA)
  if (req.mode === "navigate") {
    event.respondWith(handleNavigation(req));
    return;
  }

  // Vite hash'li fayllari
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(cacheFirst(req, ASSET_CACHE));
    return;
  }

  // Ikonka, manifest va boshqa statik fayllar
  event.respondWith(staleWhileRevalidate(req, SHELL_CACHE));
});

async function handleNavigation(req) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const res = await fetch(req);
    // SPA: barcha yo'llar bitta index.html ni qaytaradi
    if (res.ok) cache.put("/", res.clone());
    return res;
  } catch {
    return (await cache.match("/")) || (await cache.match("/offline.html")) || Response.error();
  }
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res.ok || res.type === "opaque") cache.put(req, res.clone());
      return res;
    })
    .catch(() => null);
  return hit || (await network) || Response.error();
}
