self.addEventListener('install', event => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  clients.claim()
})

self.addEventListener('fetch', event => {
  // Basic network-first for app shell (dev convenience)
  try {
    if (event.request && event.request.mode === 'navigate'){
      event.respondWith(
        fetch(event.request).catch(() => caches.match('/index.html') || fetch('/index.html'))
      )
    }
  } catch (e){
    // swallow errors in the service worker to avoid breaking navigation
  }
})