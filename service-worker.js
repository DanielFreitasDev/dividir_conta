const CACHE_NAME = 'divisor-conta-v2';
const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.webmanifest',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

// Instala o service worker e faz cache dos arquivos básicos
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    // força o novo SW a assumir logo
    self.skipWaiting();
});

// Ativa o service worker e limpa caches antigos
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
    // faz o novo SW controlar todas as abas imediatamente
    self.clients.claim();
});

// Estratégia de fetch:
// - Para navegações/HTML: network-first (tenta buscar da rede e atualiza cache)
// - Para outros arquivos: cache-first com fallback pra rede
self.addEventListener('fetch', event => {
    const req = event.request;

    // Trata navegações (HTML)
    if (
        req.mode === 'navigate' ||
        (req.method === 'GET' &&
            req.headers.get('accept') &&
            req.headers.get('accept').includes('text/html'))
    ) {
        event.respondWith(
            fetch(req)
                .then(res => {
                    const resClone = res.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
                    return res;
                })
                .catch(() => {
                    return caches.match(req).then(cached => cached || caches.match('./'));
                })
        );
        return;
    }

    // Para outros requests: cache-first
    event.respondWith(
        caches.match(req).then(cached => {
            if (cached) return cached;
            return fetch(req).then(res => {
                const resClone = res.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
                return res;
            });
        })
    );
});
