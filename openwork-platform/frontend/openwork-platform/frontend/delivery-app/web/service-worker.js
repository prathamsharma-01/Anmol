self.addEventListener('install', event => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  clients.claim()
})

self.addEventListener('fetch', event => {
  // Basic network-first for app shell (dev convenience)
  if (event.request.mode === 'navigate'){
    event.respondWith(fetch(event.request).catch(() => caches.match('/index.html')))
  }
})