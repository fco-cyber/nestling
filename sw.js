/* Nestling service worker.
   Keeps a copy of the app on the device so it opens without internet, and picks up
   new versions by itself: when online, the latest published page is always used;
   offline (or on a very slow connection) the saved copy opens instead.
   tools/build_site.py fills in VERSION below with the version and build. */
const VERSION = "v3.3-2460003";
const CACHE = "nestling-" + VERSION;
const PAGE = new URL("./", self.location).href;
const CORE = ["./", "manifest.webmanifest", "pwa.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-touch-icon.png"];
const SLOW_MS = 3500;

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(CORE.map((u) => new Request(u, { cache: "reload" })));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("nestling-") && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
    await tell({ type: "cached" });
    await tell({ type: "latest", version: VERSION });
  })());
});

self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "version" && e.source) e.source.postMessage({ type: "latest", version: VERSION });
});

self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin) return;          // links to other websites are left alone
  if (r.mode === "navigate") {
    const net = fetch(r.url, { cache: "no-cache", credentials: "same-origin" }).then(async (res) => {
      if (res.ok) await (await caches.open(CACHE)).put(PAGE, plain(res.clone()));
      return res;
    });
    e.waitUntil(net.then(() => {}, () => {}));
    e.respondWith(page(net));
    return;
  }
  const net = fetch(r).then(async (res) => {
    if (res.ok && res.type === "basic") await (await caches.open(CACHE)).put(r, res.clone());
    return res;
  });
  e.waitUntil(net.then(() => {}, () => {}));
  e.respondWith(asset(r, net));
});

async function page(net) {
  const saved = await caches.match(PAGE, { cacheName: CACHE }) || await caches.match(PAGE);
  if (!saved) return net.then(plain, () => Response.error());   // first visit: nothing saved yet
  let timer;
  const slow = new Promise((ok) => { timer = setTimeout(() => ok(null), SLOW_MS); });
  try {
    const res = await Promise.race([net, slow]);
    clearTimeout(timer);
    if (res && res.ok) return plain(res);
  } catch (err) {
    clearTimeout(timer);
  }
  // offline or slow: open the saved copy, and if a newer version arrives later, say so
  net.then(async (res) => {
    if (!res || !res.ok) return;
    const m = /name="app-sw" content="([^"]+)"/.exec(await res.clone().text());
    if (m) await tell({ type: "latest", version: m[1] });
  }).catch(() => {});
  return saved;
}

async function asset(r, net) {
  const hit = await caches.match(r, { ignoreSearch: true });
  if (hit) return hit;                                        // saved copy now, refreshed in the background
  return net.catch(() => Response.error());
}

function plain(res) {
  // a redirected response cannot be handed to a page navigation, so pass on a clean copy
  return res.redirected ? new Response(res.body, { status: res.status, statusText: res.statusText, headers: res.headers }) : res;
}

async function tell(msg) {
  for (const c of await self.clients.matchAll({ type: "window", includeUncontrolled: true })) c.postMessage(msg);
}
