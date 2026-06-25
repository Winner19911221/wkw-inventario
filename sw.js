const CACHE_NAME = 'wkw-inventario-cache-v1';
const urlsToCache = [
  '/wkw-inventario/',
  '/wkw-inventario/index.html',
  '/wkw-inventario/css/style.css', // Asegúrate de que esta ruta sea correcta
  '/wkw-inventario/js/app.js',
  '/wkw-inventario/manifest.json',
  '/wkw-inventario/logo.png', // Asegúrate de que esta ruta sea correcta
  // Agrega aquí todas las rutas de tus recursos estáticos (imágenes, CSS, JS, etc.)
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

