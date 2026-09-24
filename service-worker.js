/* UNDR Actualités — service-worker.js — PWA Builder compatible */
const CACHE_NAME = "undr-actu-v8";
const RESSOURCES = [
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./logo.png"
];

self.addEventListener("message", function(event) {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(RESSOURCES);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(k) { return k !== CACHE_NAME; })
                    .map(function(k) { return caches.delete(k); })
            );
        }).then(function() { return self.clients.claim(); })
    );
});

self.addEventListener("fetch", function(event) {
    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request).catch(function() {
                return caches.match("./index.html");
            })
        );
        return;
    }
    event.respondWith(
        caches.match(event.request).then(function(cached) {
            return cached || fetch(event.request);
        })
    );
});
