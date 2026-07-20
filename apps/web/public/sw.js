const CACHE_NAME = "sparapan-static-v2";
const CACHE_PREFIX = "sparapan-";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function podeCachear(request) {
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return false;
  if (request.mode === "navigate") return false;
  if (url.pathname.startsWith("/api/")) return false;
  if (url.pathname.startsWith("/_next/") && !url.pathname.startsWith("/_next/static/")) {
    return false;
  }

  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    ["/manifest.json", "/logo.svg", "/favicon.ico"].includes(url.pathname)
  );
}

// Cache apenas de assets estaticos. Paginas autenticadas, RSC e APIs sempre vao
// para a rede para evitar telas quebradas apos deploy ou troca de sessao.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!podeCachear(event.request)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response.ok) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
