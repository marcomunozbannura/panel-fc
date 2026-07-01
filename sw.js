/* Service Worker · Panel de Gestión · Grupo Progestión
   Cache del "shell" para que la app abra offline. Los datos van cifrados en
   payload.enc.js (tambien cacheado) y se descifran en memoria tras el login. */
const CACHE = "gp-fc-20260701162256";
const SHELL = [
  "./",
  "index.html",
  "facturacion.html",
  "cobranza.html",
  "factoring.html",
  "payload.enc.js",
  "manifest.webmanifest",
  "publicado.css",
  "_shared/gpcrypto.js",
  "_shared/store.js",
  "_shared/boot.js",
  "_Aplicaciones/_assets/core.css",
  "_Aplicaciones/_assets/core.js",
  "_Aplicaciones/_assets/icons.js",
  "icons/app-192.png",
  "icons/app-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first para GET del mismo origen (incluye logos, que se cachean al usarse)
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req)
          .then((res) => {
            if (res && res.status === 200 && res.type === "basic") {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => caches.match("index.html"))
    )
  );
});
