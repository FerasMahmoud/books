const CACHE_NAME = 'books-library-v10';

// Files to pre-cache on install
const PRECACHE_URLS = [
  '/books/',
  '/books/css/app.css',
  '/books/css/reader.css',
  '/books/css/fonts.css',
  '/books/js/db.js',
  '/books/js/sync.js',
  '/books/js/app.js',
  '/books/js/book-reader.js',
  '/books/manifest.json',
  '/books/icon-192.png',
  '/books/icon-512.png',
  // Self-hosted fonts (Tajawal)
  '/books/fonts/tajawal-Iura6YBj_oCad4k1rzY.ttf',
  '/books/fonts/tajawal-Iurf6YBj_oCad4k1l4qkLrY.ttf',
  '/books/fonts/tajawal-Iurf6YBj_oCad4k1l5anLrY.ttf',
  '/books/fonts/tajawal-Iurf6YBj_oCad4k1l5qjLrY.ttf',
  '/books/fonts/tajawal-Iurf6YBj_oCad4k1l7KmLrY.ttf',
  '/books/fonts/tajawal-Iurf6YBj_oCad4k1l8KiLrY.ttf',
  // Self-hosted fonts (Noto Naskh Arabic)
  '/books/fonts/notonaskharabic-RrQ5bpV-9Dd1b1OAGA6M9PkyDuVBePeKNaxcsss0Y7bwWslkrA.ttf',
  '/books/fonts/notonaskharabic-RrQ5bpV-9Dd1b1OAGA6M9PkyDuVBePeKNaxcsss0Y7bwY8lkrA.ttf',
  '/books/fonts/notonaskharabic-RrQ5bpV-9Dd1b1OAGA6M9PkyDuVBePeKNaxcsss0Y7bwj85krA.ttf',
  '/books/fonts/notonaskharabic-RrQ5bpV-9Dd1b1OAGA6M9PkyDuVBePeKNaxcsss0Y7bwvc5krA.ttf',
  // Self-hosted fonts (Amiri)
  '/books/fonts/amiri-J7aRnpd8CGxBHqUp.ttf',
  '/books/fonts/amiri-J7acnpd8CGxBHp2VkZY4.ttf',
  // Book HTML files - Productivity & Balance
  '/books/%D8%A7%D9%84%D8%A5%D9%86%D8%AA%D8%A7%D8%AC%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B2%D9%86/4-hour-workweek-summary.html',
  '/books/%D8%A7%D9%84%D8%A5%D9%86%D8%AA%D8%A7%D8%AC%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B2%D9%86/deep-work-summary.html',
  '/books/%D8%A7%D9%84%D8%A5%D9%86%D8%AA%D8%A7%D8%AC%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B2%D9%86/die-with-zero-summary.html',
  '/books/%D8%A7%D9%84%D8%A5%D9%86%D8%AA%D8%A7%D8%AC%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B2%D9%86/essentialism-summary.html',
  '/books/%D8%A7%D9%84%D8%A5%D9%86%D8%AA%D8%A7%D8%AC%D9%8A%D8%A9-%D9%88%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B2%D9%86/rest-book-summary.html',
  // Book HTML files - Money & Investment
  '/books/%D8%A7%D9%84%D9%85%D8%A7%D9%84-%D9%88%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D8%AB%D9%85%D8%A7%D8%B1/psychology-of-money-summary.html',
  // Book HTML files - Biographies
  '/books/%D8%A7%D9%84%D8%B3%D9%8A%D8%B1-%D8%A7%D9%84%D8%B0%D8%A7%D8%AA%D9%8A%D8%A9/steve-jobs-summary.html',
  '/books/%D8%A7%D9%84%D8%B3%D9%8A%D8%B1-%D8%A7%D9%84%D8%B0%D8%A7%D8%AA%D9%8A%D8%A9/elon-musk-summary.html',
  '/books/%D8%A7%D9%84%D8%B3%D9%8A%D8%B1-%D8%A7%D9%84%D8%B0%D8%A7%D8%AA%D9%8A%D8%A9/leonardo-da-vinci-summary.html',
  '/books/%D8%A7%D9%84%D8%B3%D9%8A%D8%B1-%D8%A7%D9%84%D8%B0%D8%A7%D8%AA%D9%8A%D8%A9/einstein-summary.html',
  '/books/%D8%A7%D9%84%D8%B3%D9%8A%D8%B1-%D8%A7%D9%84%D8%B0%D8%A7%D8%AA%D9%8A%D8%A9/benjamin-franklin-summary.html',
  '/books/%D8%A7%D9%84%D8%B3%D9%8A%D8%B1-%D8%A7%D9%84%D8%B0%D8%A7%D8%AA%D9%8A%D8%A9/shoe-dog-summary.html',
  '/books/%D8%A7%D9%84%D8%B3%D9%8A%D8%B1-%D8%A7%D9%84%D8%B0%D8%A7%D8%AA%D9%8A%D8%A9/ride-of-a-lifetime-summary.html',
  '/books/%D8%A7%D9%84%D8%B3%D9%8A%D8%B1-%D8%A7%D9%84%D8%B0%D8%A7%D8%AA%D9%8A%D8%A9/titan-summary.html',
  '/books/%D8%A7%D9%84%D8%B3%D9%8A%D8%B1-%D8%A7%D9%84%D8%B0%D8%A7%D8%AA%D9%8A%D8%A9/when-breath-becomes-air-summary.html',
  '/books/%D8%A7%D9%84%D8%B3%D9%8A%D8%B1-%D8%A7%D9%84%D8%B0%D8%A7%D8%AA%D9%8A%D8%A9/greenlights-summary.html',
  '/books/%D8%A7%D9%84%D8%B3%D9%8A%D8%B1-%D8%A7%D9%84%D8%B0%D8%A7%D8%AA%D9%8A%D8%A9/caged-bird-sings-summary.html',
];

// Install event - pre-cache all static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching static assets');
        // Cache files individually to handle failures gracefully
        return Promise.allSettled(
          PRECACHE_URLS.map(url => {
            return cache.add(url).catch(err => {
              console.warn(`[Service Worker] Failed to cache ${url}:`, err);
              // Continue caching other files even if one fails
              return Promise.resolve();
            });
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Pre-caching complete');
        // Force the waiting service worker to become active
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[Service Worker] Pre-caching failed:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Cache cleanup complete');
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - cache-first strategy with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Skip Turso API requests (cloud sync)
  if (request.url.includes('turso.io')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log(`[Service Worker] Serving from cache: ${request.url}`);

          // Return cached response immediately, but update cache in background
          // This ensures users get the latest version on next visit
          event.waitUntil(
            fetch(request)
              .then((networkResponse) => {
                // Only cache successful responses
                if (networkResponse && networkResponse.status === 200) {
                  return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(request, networkResponse.clone());
                    return networkResponse;
                  });
                }
                return networkResponse;
              })
              .catch((err) => {
                // Network update failed, but that's okay - we have cache
                console.log(`[Service Worker] Background fetch failed for ${request.url}:`, err);
              })
          );

          return cachedResponse;
        }

        // Not in cache - fetch from network
        console.log(`[Service Worker] Fetching from network: ${request.url}`);
        return fetch(request)
          .then((networkResponse) => {
            // Check if valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
              return networkResponse;
            }

            // Clone the response (can only be consumed once)
            const responseToCache = networkResponse.clone();

            // Cache the fetched response for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Don't cache POST requests or opaque responses
                if (request.method === 'GET' && networkResponse.type !== 'opaque') {
                  cache.put(request, responseToCache);
                }
              })
              .catch((err) => {
                console.warn(`[Service Worker] Failed to cache ${request.url}:`, err);
              });

            return networkResponse;
          })
          .catch((err) => {
            console.error(`[Service Worker] Fetch failed for ${request.url}:`, err);

            // If offline and requesting HTML, return offline page
            if (request.headers.get('accept').includes('text/html')) {
              return new Response(
                `<!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>غير متصل بالإنترنت</title>
                  <style>
                    body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Tajawal', sans-serif;
                      background: #0f0f1a;
                      color: #e8e8f0;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      min-height: 100vh;
                      margin: 0;
                      padding: 20px;
                      text-align: center;
                    }
                    .offline-container {
                      max-width: 400px;
                    }
                    h1 {
                      font-size: 4rem;
                      margin: 0 0 1rem 0;
                    }
                    p {
                      font-size: 1.2rem;
                      line-height: 1.6;
                      color: #a8a8b8;
                    }
                  </style>
                </head>
                <body>
                  <div class="offline-container">
                    <h1>📡</h1>
                    <h2>غير متصل بالإنترنت</h2>
                    <p>عذراً، هذه الصفحة غير متوفرة حالياً بدون اتصال بالإنترنت.</p>
                    <p>الرجاء التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.</p>
                  </div>
                </body>
                </html>`,
                {
                  headers: {
                    'Content-Type': 'text/html; charset=utf-8',
                  }
                }
              );
            }

            // For non-HTML requests, return a generic error
            return new Response('Network error occurred', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME)
        .then(() => {
          console.log('[Service Worker] Cache cleared');
          return self.clients.claim();
        })
    );
  }
});
