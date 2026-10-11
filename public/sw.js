/* global self, caches, fetch, URL */
const CACHE = 'life-os-shell-v1'
const base = new URL('./', self.location.href)
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const response = await fetch(base.href)
    if (!response.ok || response.redirected) throw new Error('App shell unavailable')
    const html = await response.clone().text()
    const assets = [...html.matchAll(/(?:src|href)="([^"]*assets\/[^" ]+)"/g)].map(match => new URL(match[1], base).href)
    const cache = await caches.open(CACHE)
    await cache.put(base.href, response)
    await cache.addAll([...assets, new URL('manifest.webmanifest', base).href, new URL('icon-192.png', base).href])
  })())
  self.skipWaiting()
})
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('life-os-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok && !response.redirected) {
        const copy = response.clone()
        event.waitUntil(caches.open(CACHE).then(cache => cache.put(base.href, copy)))
      }
      return response
    }).catch(() => caches.match(base.href)))
  } else if (url.pathname.startsWith(`${base.pathname}assets/`)) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy))) }
      return response
    })))
  }
})
