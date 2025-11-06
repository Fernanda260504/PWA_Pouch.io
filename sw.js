const cacheName = 'offline-cache-v1';

// 🚨 IMPORTANTE: Define el nombre de tu repositorio aquí
const REPO_NAME = '/PWA_Pouch.io';

const WC = [
    // La raíz '/' falla en GitHub Pages, debe ser reemplazada por el nombre del repositorio
    `${REPO_NAME}/`,
    
    // Las rutas locales deben incluir el nombre del repositorio
    `${REPO_NAME}/index.html`,
    `${REPO_NAME}/app.js`,
    `${REPO_NAME}/manifest.json`,
    
    // Las URLs de CDN (Bootstrap y PouchDB) están correctas
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/pouchdb@9.0.0/dist/pouchdb.min.js',
    
    // Si tienes un main.js u otros archivos, agrégalos así:
    // `${REPO_NAME}/main.js`,
    // `${REPO_NAME}/img/192.png` 
]

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => {
                // El error 'Request failed' ocurre aquí si las rutas no existen
                console.log('Cache abierto, añadiendo activos...');
                return cache.addAll(
                    WC
                );
            })
            .then(() => {
                console.log('Todos los activos añadidos a la caché con éxito.');
            })
            .catch(err => {
                console.error('Fallo en cache.addAll, revisa las rutas:', err);
            })
    );
});

// Nota: Tu estrategia de caché es muy simple (Cache-only para navegación si falla la red).
// Esto funciona, pero puede ser mejor usar 'Cache, then Network' o 'Network fallback to Cache'.
self.addEventListener('fetch', event => {
    // Si la solicitud es para la página principal (navegación), intenta la red primero.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                // Si la red falla (está offline), busca en la caché.
                .catch(() => {
                    return caches.match(`${REPO_NAME}/index.html`); // Aseguramos que cargue index.html si está offline
                })
        );
    } 
    // Para todos los demás activos (CSS, JS, imágenes), podrías usar otra estrategia.
    else {
        // Estrategia simple: Cache-only para los assets que ya tienes en la caché.
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    return response || fetch(event.request);
                })
        );
    }
});