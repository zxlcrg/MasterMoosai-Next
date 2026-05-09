// Lightweight PWA service worker.
// - Marks the app installable (Chrome requires a registered SW with a fetch handler)
// - Caches the static Next.js shell ( /_next/static/* ) so reloads feel instant
// - Network-first for everything else, with a tiny fallback to the cached shell
//   so an HTML refresh on flaky network still hands back something quickly.
//
// Intentionally NOT offline-capable: server actions, Prisma queries, and admin
// data must always hit the network. Don't expand caching to /admin/* unless
// you also build a sync queue for writes.

const CACHE = "mims-shell-v1";
const SHELL_ASSETS = ["/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL_ASSETS)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Cache-first for the Next.js immutable static bundle
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const fresh = await fetch(req);
        if (fresh.ok) cache.put(req, fresh.clone());
        return fresh;
      })
    );
    return;
  }

  // Network-first for everything else
  event.respondWith(fetch(req).catch(() => caches.match(req) as Promise<Response>));
});
