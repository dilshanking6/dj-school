const CACHE_NAME = 'dj-study-hub-v3';
const OFFLINE_FALLBACK = './index.html';

// Precache: chhoti core files + har class ka bundle.
// Bade data files (allquestions.js, class9/11/12 json) runtime me cache hote hain.
const ASSETS = [
  './',
  './index.html',
  './quiz.html',
  './notes.html',
  './formulas.html',
  './subjects.html',
  './subject.html',
  './analysis.html',
  './periodic.html',
  './mathlab.html',
  './css/style.css',
  './js/hub.js',
  './js/common.js',
  './js/data.js',
  './js/notes.js',
  './js/quiz.js',
  './js/explain.js',
  './js/lang.js',
  './js/hub/subjects.json',
  './manifest.json'
];

const CLASS_BUNDLES = [9, 11, 12].flatMap((cls) =>
  ['hindi', 'english', 'maths', 'physics', 'chemistry', 'biology', 'history', 'geography', 'civics', 'economics']
    .map((subject) => `./js/hub/class${cls}/${subject}.json`)
);

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      // addAll poora fail ho jaata hai agar ek bhi 404 ho, isliye
      // ek-ek karke cache karo.
      .then((cache) => Promise.all(ASSETS.map((url) => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/** Server ka content hamesha pehle try karo, phir cache (offline ke liye). */
const networkFirst = async (request, fallback) => {
  const cache = await caches.open(CACHE_NAME);
  try {
    const fresh = await fetch(request);
    if (fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallback) {
      const fb = await cache.match(fallback);
      if (fb) return fb;
    }
    throw e;
  }
};

/** Pages ke liye cache-first + background update. */
const staleWhileRevalidate = async (request, fallback) => {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    // background update (awaited nahi - page ko waiting na karaye)
    fetch(request)
      .then((res) => { if (res.ok) cache.put(request, res.clone()); })
      .catch(() => {});
    return cached;
  }
  try {
    const fresh = await fetch(request);
    if (fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (e) {
    if (fallback) {
      const fb = await cache.match(fallback);
      if (fb) return fb;
    }
    throw e;
  }
};

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Study API /study page ke bina bhi aati hai — pehle use hi judge karo,
  // kyunki /api/study/* par pathname.startsWith('/study') guard fail ho jata hai.
  if (url.pathname.startsWith('/api/study/')) {
    // API sirf online chahiye; offline par index.html fallback DENA galat hai
    // (JSON me HTML parse hoga). Isliye network-first + cache, HTML fallback nahi.
    e.respondWith(networkFirst(request));
    return;
  }

  // Portal ke baaki hisse ko touch nahi karte
  if (!url.pathname.startsWith('/study')) return;

  if (CLASS_BUNDLES.includes(url.pathname.replace(/^\/study\//, './'))) {
    e.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Navigation pages offline par index.html dikhao
  if (request.mode === 'navigate') {
    e.respondWith(staleWhileRevalidate(request, OFFLINE_FALLBACK));
    return;
  }

  e.respondWith(staleWhileRevalidate(request));
});
