/* UNDR Actualités — service-worker.js — v6 */
/* Vide TOUS les anciens caches sans exception */
self.addEventListener("install", function(e) {
    self.skipWaiting();
});
self.addEventListener("activate", function(e) {
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(keys.map(function(k) {
                console.log("Cache supprimé:", k);
                return caches.delete(k);
            }));
        }).then(function() {
            return self.clients.claim();
        })
    );
});
/* Aucun cache — réseau direct uniquement */
self.addEventListener("fetch", function(e) {
    e.respondWith(
        fetch(e.request, { cache: "no-store" }).catch(function() {
            return new Response("Hors ligne", { status: 503 });
        })
    );
});
