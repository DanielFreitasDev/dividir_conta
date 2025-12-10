const CACHE_NAME = 'divisor-conta-v1';
const URLS_TO_CACHE = [
    './',
    './index.html',
    './manifest.webmanifest'
    // Se publicar em um subdiretório, ajuste os caminhos conforme necessário.
];

// Instala o service worker e faz cache dos arquivos básicos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(URLS_TO_CACHE);
        })
    );
});

// Atualiza service worker e limpa caches antigos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            )
        )
    );
});

// Responde requisições usando cache primeiro, depois rede (offline básico)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
