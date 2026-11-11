/* Service worker de l'espace pro ADET (portée : /espace)
 * - page « hors connexion » quand le réseau manque (aucune page de l'équipe n'est mise en cache) ;
 * - notifications push, même application fermée ;
 * - un toucher sur une notification ouvre la bonne page.
 */
const CACHE = 'adet-espace-v1'
const HORS_LIGNE = '/espace/hors-ligne'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([HORS_LIGNE, '/brand/adet-logo.png', '/brand/icon-192.png']))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cles) => Promise.all(cles.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(HORS_LIGNE)))
    return
  }
  // Le logo et l'icône de la page hors connexion
  if (/\/brand\/(adet-logo\.png|icon-192\.png)$/.test(new URL(request.url).pathname)) {
    event.respondWith(caches.match(request).then((enCache) => enCache || fetch(request)))
  }
})

self.addEventListener('push', (event) => {
  let donnees = {}
  try {
    donnees = event.data ? event.data.json() : {}
  } catch {
    donnees = { titre: 'ADET', texte: event.data ? event.data.text() : '' }
  }
  event.waitUntil(
    self.registration.showNotification(donnees.titre || 'ADET', {
      body: donnees.texte || '',
      icon: '/brand/icon-192.png',
      badge: '/brand/icon-192.png',
      lang: 'fr',
      data: { lien: donnees.lien || '/espace/notifications' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const cible = new URL((event.notification.data && event.notification.data.lien) || '/espace/notifications', self.location.origin).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((fenetres) => {
      for (const fenetre of fenetres) {
        if (fenetre.url.startsWith(self.location.origin) && 'focus' in fenetre) {
          return fenetre.navigate(cible).then((f) => (f || fenetre).focus())
        }
      }
      return self.clients.openWindow(cible)
    }),
  )
})
