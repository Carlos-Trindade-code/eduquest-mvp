// Studdo service worker — conservador, assets-only.
// Estratégia: HTML e /api/* SEMPRE pela rede. Só cacheia assets imutáveis
// (Next.js static, ícones, fontes). Isso evita o bug histórico onde HTML
// cacheado apontava para chunks que não existiam mais após deploy.

const CACHE_VERSION = 'studdo-v2-2026-04-17';
const STATIC_CACHE = `${CACHE_VERSION}-static`;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

function isCacheableAsset(url) {
  if (url.pathname.startsWith('/_next/static/')) return true;
  if (url.pathname.startsWith('/icons/')) return true;
  return /\.(png|jpg|jpeg|svg|webp|ico|woff|woff2|ttf|otf)$/i.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  if (!isCacheableAsset(url)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      } catch (err) {
        return cached || Response.error();
      }
    })()
  );
});
