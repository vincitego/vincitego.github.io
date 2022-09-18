const version = '0.13';

self.addEventListener("install", e => {
    e.waitUntil((async () => {
        await caches.delete('static-bj');
        
        const cache = await caches.open('static-bj');

        return cache.addAll([
            './init.js',
            './blackjack.html',
            './blackjack.css',
            './settings.html',
            './settings.js',
            './settings.css',
            './counting.html',
            './counting.js',
            './counting.css',
            './info.html',
            './info.js',
            './info.css',
            './game.html',
            './game.js',
            './game.css',
            './images/card_back.png',
            './icons/manifest-icon-192.maskable.png',
            './icons/manifest-icon-512.maskable.png',
            './icons/apple-icon-180.png',
            './icons/apple-splash-640-1136.jpg',
            './icons/apple-splash-750-1334.jpg',
            './icons/apple-splash-828-1792.jpg',
            './icons/apple-splash-1125-2436.jpg',
            './icons/apple-splash-1136-640.jpg',
            './icons/apple-splash-1170-2532.jpg',
            './icons/apple-splash-1242-2208.jpg',
            './icons/apple-splash-1242-2688.jpg',
            './icons/apple-splash-1284-2778.jpg',
            './icons/apple-splash-1334-750.jpg',
            './icons/apple-splash-1536-2048.jpg',
            './icons/apple-splash-1620-2160.jpg',
            './icons/apple-splash-1668-2224.jpg',
            './icons/apple-splash-1668-2388.jpg',
            './icons/apple-splash-1792-828.jpg',
            './icons/apple-splash-2048-1536.jpg',
            './icons/apple-splash-2048-2732.jpg',
            './icons/apple-splash-2160-1620.jpg',
            './icons/apple-splash-2208-1242.jpg',
            './icons/apple-splash-2224-1668.jpg',
            './icons/apple-splash-2388-1668.jpg',
            './icons/apple-splash-2436-1125.jpg',
            './icons/apple-splash-2532-1170.jpg',
            './icons/apple-splash-2688-1242.jpg',
            './icons/apple-splash-2732-2048.jpg',
            './icons/apple-splash-2778-1284.jpg',
        ]);
    })())
});


self.addEventListener('activate', e => {
    // clean up from old version of service worker
    e.waitUntil(caches.delete('static'));
});


self.addEventListener('fetch', e => {
    e.respondWith((async () => {
        const cache = await caches.open('static-bj');
        const response = await cache.match(e.request.url);
        return response || fetch(e.request.url);
    })())
});