/* UNDR Actualités — service-worker.js — v4 */
const CACHE_NAME = "undr-actu-v4-" + Date.now();

self.addEventListener("install", function(e) {
    self.skipWaiting();
});

self.addEventListener("activate", function(e) {
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(keys.map(function(k) { return caches.delete(k); }));
        }).then(function() { return self.clients.claim(); })
    );
});

/* Ne pas mettre en cache — toujours aller chercher le serveur */
self.addEventListener("fetch", function(e) {
    e.respondWith(fetch(e.request).catch(function() {
        return caches.match(e.request);
    }));
});
