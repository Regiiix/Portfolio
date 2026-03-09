// Service Worker for Portfolio - Efficient Cache Lifetimes
const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `portfolio-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `portfolio-dynamic-${CACHE_VERSION}`;

// Assets to precache for faster LCP
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/main.js',
    '/assets/portfolio_profile.jpg',
    '/assets/ico.ico'
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Precaching critical assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName.startsWith('portfolio-') &&
                                   cacheName !== STATIC_CACHE &&
                                   cacheName !== DYNAMIC_CACHE;
                        })
                        .map((cacheName) => caches.delete(cacheName))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - cache-first for static, network-first for HTML
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip cross-origin requests (fonts are handled by browser)
    if (url.origin !== location.origin) return;

    // Cache strategies based on resource type
    if (isStaticAsset(url.pathname)) {
        // Cache-first for static assets (images, CSS, JS)
        event.respondWith(cacheFirst(request));
    } else {
        // Stale-while-revalidate for HTML pages
        event.respondWith(staleWhileRevalidate(request));
    }
});

// Determine if request is for static asset
function isStaticAsset(pathname) {
    return /\.(css|js|jpg|jpeg|png|gif|webp|ico|pdf|woff|woff2|ttf|svg)$/i.test(pathname) ||
           pathname.startsWith('/assets/');
}

// Cache-first strategy - best for static assets
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Return offline fallback if available
        return new Response('Offline', { status: 503 });
    }
}

// Stale-while-revalidate - best for HTML
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    const networkPromise = fetch(request)
        .then(async (networkResponse) => {
            if (networkResponse.ok) {
                const cache = await caches.open(DYNAMIC_CACHE);
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch(() => {
            // Return cached version on network failure
            return cachedResponse;
        });

    // Return cached version immediately, update in background
    return cachedResponse || networkPromise;
}
