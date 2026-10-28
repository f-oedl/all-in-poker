// Installable shell, deliberately online-only. Never cache private club records,
// authentication responses, or mutations; existing realtime behavior stays intact.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
