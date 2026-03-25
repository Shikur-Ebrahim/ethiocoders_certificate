/* eslint-disable no-restricted-globals */
const CACHE_VERSION = "v1";
const STATIC_CACHE = `static-${CACHE_VERSION}`;

// Keep the install lightweight. Next assets are cached on-demand.
const CORE_ASSETS = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (!key.startsWith("static-")) return caches.delete(key);
          if (key === STATIC_CACHE) return Promise.resolve(false);
          return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

function isSameOrigin(request) {
  return request.url.startsWith(self.location.origin);
}

function getCacheKey(request) {
  // Keep cache keys stable (strip query parameters for GET assets)
  const url = new URL(request.url);
  url.search = "";
  return url.toString();
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(getCacheKey(request));
  if (cachedResponse) return cachedResponse;

  const response = await fetch(request);
  if (!response || !response.ok) return response;

  // Only cache successful GET responses.
  await cache.put(getCacheKey(request), response.clone());
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const response = await fetch(request);
    if (!response || !response.ok) throw new Error("Network response was not ok");
    return response;
  } catch (err) {
    const cached = await cache.match("/");
    return cached || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;
  if (!isSameOrigin(request)) return;

  const url = new URL(request.url);
  const isNavigation = request.mode === "navigate";

  // HTML navigations: network-first so users get fresh pages when online.
  if (isNavigation) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache common static file types.
  const destination = request.destination || "";
  const shouldCache =
    url.pathname.startsWith("/_next/") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".ttf") ||
    url.pathname.endsWith(".eot") ||
    destination === "image" ||
    destination === "style" ||
    destination === "script" ||
    destination === "font";

  if (!shouldCache) return;

  event.respondWith(cacheFirst(request));
});

