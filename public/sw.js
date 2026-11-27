// Zelthia service worker: offline shell + cache-first static assets.
// API calls and auth are never cached.
const VERSION = "zelthia-v3";
const SHELL = ["/offline.html", "/icons/icon-192.png", "/icons/icon-96.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // Pages: network first, offline page as fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/offline.html").then((res) => res || Response.error()),
      ),
    );
    return;
  }

  // Only content-hashed build files are safe to serve from cache forever.
  // Other /_next/static files keep the same name across builds and must
  // always come from the network, or old code runs against new pages.
  if (url.pathname.startsWith("/_next/static/immutable/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request)
            .then((res) => {
              if (res.ok) {
                const copy = res.clone();
                caches
                  .open(VERSION)
                  .then((cache) => cache.put(request, copy))
                  .catch(() => {
                    /* Storage full or unavailable: serve without caching. */
                  });
              }
              return res;
            })
            .catch(() => Response.error()),
      ),
    );
  }
});
