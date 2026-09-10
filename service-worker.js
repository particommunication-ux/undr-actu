/* ============================================================
   UNDR Actualités — service-worker.js
   Gère : cache PWA + notifications push
   ============================================================ */
const CACHE_NAME = "undr-actu-v3";
const FICHIERS_CACHE = ["./", "./index.html", "./style.css", "./script.js", "./chat.js", "./manifest.json", "./logo.png"];

self.addEventListener("install", function(e) {
    e.waitUntil(caches.open(CACHE_NAME).then(function(c){ return c.addAll(FICHIERS_CACHE); }));
    self.skipWaiting();
});

self.addEventListener("activate", function(e) {
    e.waitUntil(caches.keys().then(function(keys){
        return Promise.all(keys.filter(function(k){ return k!==CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    }));
    e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function(e) {
    e.respondWith(caches.match(e.request).then(function(r){ return r || fetch(e.request); }));
});

/* ===== NOTIFICATION PUSH ===== */
self.addEventListener("push", function(e) {
    const data = e.data ? e.data.json() : { titre:"UNDR Actualités", corps:"Nouvelle publication !", url:"./" };
    e.waitUntil(
        self.registration.showNotification(data.titre || "UNDR Actualités", {
            body: data.corps || "Nouvelle publication disponible !",
            icon: "./logo.png",
            badge: "./logo.png",
            tag: "undr-notif",
            data: { url: data.url || "./" },
            vibrate: [200, 100, 200]
        })
    );
});

self.addEventListener("notificationclick", function(e) {
    e.notification.close();
    e.waitUntil(clients.openWindow(e.notification.data.url || "./"));
});
