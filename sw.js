const CACHE = "pulllookup-v1";
const ASSETS = [
  "./pull_lookup.html",
  "./tesseract.min.js",
  "./worker.min.js",
  "./manifest.webmanifest",
  // core files are large; skip pre-cache to keep first load fast.
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Cache-first for app shell
  if (ASSETS.some(p => url.pathname.endsWith(p.replace("./","/")))) {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
    return;
  }
  // Network-first for everything else (e.g., core files)
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});