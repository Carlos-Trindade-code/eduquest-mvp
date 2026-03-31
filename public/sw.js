// Self-destroying service worker — unregisters itself and clears all caches
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', async () => {
  const keys = await caches.keys();
  await Promise.all(keys.map((k) => caches.delete(k)));
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) => client.navigate(client.url));
  await self.registration.unregister();
});
