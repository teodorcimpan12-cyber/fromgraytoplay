/* From Grey to Play — service worker (registered from index.html).
   Strategy:
   - App shell ("/", manifest, icons): network-first so deploys propagate,
     cached copy serves offline.
   - CDN assets (unpkg, jsDelivr, cdnjs, gstatic, Google Fonts): stale-while-revalidate.
   - Everything the pitch needs (libraries, 3D, data files, QR) is precached on
     install, so after one online visit the demo runs without internet.
   - OpenStreetMap tiles: cached as they are viewed (never prefetched), capped.
     Esri satellite tiles are not stored (Esri terms), so the satellite needs a connection.
   - Firebase Realtime Database traffic is never intercepted (live data).
   Bump CACHE on breaking changes to invalidate old caches. */
const CACHE = "g2p-v8";
const TILES = "g2p-tiles";
const TILE_MAX = 800;
const SHELL = ["/", "/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/qr-sibiu.svg", "/icons/qr-tgm.svg",
  "/data/timemachine.json", "/data/wayback.json", "/data/sat_findings.json",
  "https://unpkg.com/react@18.3.1/umd/react.production.min.js",
  "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js",
  "https://cdn.jsdelivr.net/npm/firebase@9.23.0/firebase-app-compat.js",
  "https://cdn.jsdelivr.net/npm/firebase@9.23.0/firebase-database-compat.js",
  "https://cdn.jsdelivr.net/npm/firebase@9.23.0/firebase-auth-compat.js",
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js"];
const CDN_HOSTS = ["unpkg.com", "cdn.jsdelivr.net", "cdnjs.cloudflare.com", "www.gstatic.com", "fonts.googleapis.com", "fonts.gstatic.com"];
const TILE_HOST = /^[abc]\.tile\.openstreetmap\.org$/;

// keep the tile cache small: drop the oldest entries past TILE_MAX
function trimTiles() {
  return caches.open(TILES).then(c => c.keys().then(k => Promise.all(k.slice(0, Math.max(0, k.length - TILE_MAX)).map(r => c.delete(r)))));
}

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      // add() individually — a single missing icon must not fail the install
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== TILES).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.protocol !== "https:" && url.protocol !== "http:") return;
  // Never touch realtime data channels.
  if (url.hostname.endsWith("firebaseio.com") || url.hostname.endsWith("firebasedatabase.app")) return;

  // Navigations: network-first, offline fallback to the cached shell.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put("/", copy));
        return res;
      }).catch(() => caches.match("/"))
    );
    return;
  }

  // Map tiles: cache-first, stored only as they are viewed.
  if (TILE_HOST.test(url.hostname)) {
    e.respondWith(
      // fetched with CORS (OSM allows it): an opaque copy would count ~7 MB each against the quota
      caches.open(TILES).then(c => c.match(req.url).then(hit => hit || fetch(req.url, { mode: "cors", credentials: "omit" }).then(res => {
        if (res && res.ok) { c.put(req.url, res.clone()).then(trimTiles); }
        return res;
      }, () => fetch(req))))
    );
    return;
  }

  // Static assets (same origin + known CDNs): stale-while-revalidate.
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && CDN_HOSTS.indexOf(url.hostname) < 0) return;
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(res => {
        if (res && (res.ok || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
