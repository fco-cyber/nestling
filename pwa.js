/* Nestling on your devices: an offline copy, installing, sharing and updates.
   The publishing step adds this file to the hosted app only; the single-file
   version opened straight from a folder works exactly as before without it. */
(function () {
  "use strict";
  if (!/^https?:$/.test(location.protocol)) return;
  var D = document, R = D.documentElement;

  function meta(n) { var m = D.querySelector('meta[name="' + n + '"]'); return m ? m.getAttribute("content") || "" : ""; }
  function get(k, d) { try { var v = localStorage.getItem("nl:" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem("nl:" + k, JSON.stringify(v)); } catch (e) {} }
  function all(s) { return Array.prototype.slice.call(D.querySelectorAll(s)); }

  var VER = meta("app-version"), BUILD = meta("app-sw"), PUB = meta("app-published");
  var ua = navigator.userAgent || "";
  var iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var mac = /Macintosh/.test(ua) && !iOS;
  var safari = /Safari\//.test(ua) && !/Chrome\/|Chromium\/|CriOS\/|FxiOS\/|EdgiOS\/|Edg\/|OPR\/|Firefox\//.test(ua);
  var firefox = /Firefox\/|FxiOS\//.test(ua);
  var deferred = null;
  function installed() { try { return matchMedia("(display-mode: standalone)").matches || navigator.standalone === true; } catch (e) { return false; } }

  /* ---------- look: built from the app's own colour tokens, so it follows every palette ---------- */
  var css = ".pwa-sec{display:flex;flex-direction:column;gap:9px}" +
    ".pwa-status{display:flex;align-items:center;gap:9px;margin:0;font-size:.9rem;color:var(--ink-2)}" +
    ".pwa-dot{width:9px;height:9px;border-radius:50%;flex:none;background:var(--line-2)}" +
    ".pwa-dot.ok{background:var(--good);box-shadow:0 0 0 3px var(--good-soft)}" +
    ".motion .pwa-dot:not(.ok){animation:pwaPulse 1.6s ease-in-out infinite}" +
    ".pwa-acts{display:flex;flex-wrap:wrap;gap:8px}" +
    ".pwa-how{margin:0;font-size:.88rem;color:var(--ink-2);line-height:1.5}" +
    ".pwa-card{display:grid!important;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;column-gap:18px;row-gap:12px}" +
    ".pwa-card .pwa-ic{width:52px;height:52px;border-radius:13px;box-shadow:var(--shadow)}" +
    ".pwa-card .pwa-txt{min-width:0;display:flex;flex-direction:column;gap:4px}" +
    "@media (max-width:700px){.pwa-card{grid-template-columns:auto minmax(0,1fr);column-gap:14px}.pwa-card .pwa-ic{width:44px;height:44px;border-radius:11px;align-self:start}.pwa-card .pwa-acts{grid-column:1 / -1}}" +
    ".pwa-card h3,.pwa-card p{margin:0}" +
    ".pwa-bar{position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:75;display:flex;align-items:center;gap:10px;width:max-content;max-width:calc(100vw - 32px);background:var(--ink);color:var(--paper);padding:8px 8px 8px 18px;border-radius:999px;box-shadow:var(--shadow-lg);font-weight:700;font-size:.92rem}" +
    ".pwa-bar.solo{padding:10px 18px}" +
    ".pwa-bar span{min-width:0;overflow-wrap:anywhere}" +
    ".pwa-bar button{font:inherit;font-size:.86rem;font-weight:700;border:0;border-radius:999px;padding:8px 14px;background:var(--paper);color:var(--ink);cursor:pointer;flex:none}" +
    ".pwa-bar .pwa-x{background:transparent;color:var(--paper);padding:8px 10px;font-size:1.05rem;line-height:1}" +
    ".motion .pwa-bar:not([hidden]){animation:toastIn .4s var(--ease)}" +
    "@keyframes pwaPulse{0%,100%{opacity:.45}50%{opacity:1}}" +
    "@media print{.pwa-card,.pwa-bar{display:none!important}}";
  var st = D.createElement("style"); st.textContent = css; D.head.appendChild(st);

  /* ---------- the panel section and the start-page card ---------- */
  function fmt(iso) {
    try { return new Date(iso + "T12:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return iso; }
  }
  function addStudio() {
    var s = D.getElementById("studio"); if (!s || s.querySelector(".pwa-sec")) return;
    var h = D.createElement("h5"); h.textContent = "On this device";
    var box = D.createElement("div"); box.className = "pwa-sec";
    box.innerHTML = '<p class="pwa-status" role="status"><i class="pwa-dot" aria-hidden="true"></i><span>Saving a copy for offline use…</span></p>' +
      '<div class="pwa-acts"><button type="button" class="btn sm primary" data-pwa-install hidden>Install app</button>' +
      '<button type="button" class="btn sm" data-pwa-share>Share this app</button></div>' +
      '<p class="pwa-how" data-pwa-how hidden></p>' +
      (VER ? '<p class="st-note">Version ' + VER + (PUB ? ", published " + fmt(PUB) : "") + ". Updates arrive by themselves.</p>" : "");
    var last = s.lastElementChild;
    s.insertBefore(h, last); s.insertBefore(box, last);
  }
  function addCard() {
    var v = D.getElementById("v-start"); if (!v || v.querySelector(".pwa-card")) return;
    var c = D.createElement("section"); c.className = "card pwa-card"; c.setAttribute("aria-labelledby", "h-pwa"); c.hidden = true;
    c.innerHTML = '<img class="pwa-ic" src="icons/icon-192.png" alt="" width="52" height="52">' +
      '<div class="pwa-txt"><h3 id="h-pwa">Keep Nestling on this device</h3>' +
      '<p class="small muted">Install it to open it like an app, even without internet. It updates itself whenever a new version is published.</p>' +
      '<p class="pwa-how" data-pwa-how hidden></p></div>' +
      '<div class="pwa-acts"><button type="button" class="btn sm primary" data-pwa-install hidden>Install</button>' +
      '<button type="button" class="btn sm primary" data-pwa-howbtn aria-expanded="false" hidden>How to install</button>' +
      '<button type="button" class="btn sm ghost" data-pwa-later>Not now</button></div>';
    var mine = D.getElementById("babyCard");
    if (mine && mine.parentNode) mine.parentNode.insertBefore(c, mine.nextSibling); else v.appendChild(c);
  }
  function howText() {
    if (iOS) return "On iPhone or iPad: tap the Share button (the square with an arrow pointing up), then choose Add to Home Screen.";
    if (mac && safari) return "In Safari on a Mac: open the File menu and choose Add to Dock.";
    if (firefox) return "In Firefox, look in the browser menu for Install or Add to Home screen. If it isn't there, bookmark this page: once opened, it keeps working without internet in this browser.";
    return "";
  }
  function render() {
    var inst = installed(), how = howText();
    all("[data-pwa-install]").forEach(function (b) { b.hidden = !deferred || inst; });
    all(".pwa-sec [data-pwa-how]").forEach(function (p) { p.textContent = how; p.hidden = !how || !!deferred || inst; });
    var c = D.querySelector(".pwa-card");
    if (c) {
      var hb = c.querySelector("[data-pwa-howbtn]"), ht = c.querySelector("[data-pwa-how]");
      var canHow = !deferred && (iOS || (mac && safari));
      hb.hidden = !canHow; if (!canHow) ht.hidden = true; else ht.textContent = how;
      c.hidden = inst || get("pwaLater", false) || !(deferred || canHow);
    }
    status();
  }
  function setStatus(txt, ok) {
    all(".pwa-status").forEach(function (p) { p.querySelector("span").textContent = txt; p.querySelector(".pwa-dot").classList.toggle("ok", !!ok); });
  }
  function status() {
    if (!("serviceWorker" in navigator) || !("caches" in window)) { setStatus("This browser can't keep an offline copy.", false); return; }
    caches.match("./", { ignoreSearch: true }).then(function (hit) {
      if (installed()) setStatus(hit ? "Installed. Opens without internet." : "Installed. Saving a copy for offline use…", !!hit);
      else setStatus(hit ? "Saved on this device. Opens without internet." : "Saving a copy for offline use…", !!hit);
    }, function () { setStatus("This browser can't keep an offline copy.", false); });
  }

  /* ---------- a small bar for updates and copied links ---------- */
  var bar = null, barT = 0;
  function say(msg, act, fn, ms) {
    if (!bar) { bar = D.createElement("div"); bar.className = "pwa-bar"; bar.setAttribute("role", "status"); bar.hidden = true; D.body.appendChild(bar); }
    clearTimeout(barT); bar.textContent = ""; bar.classList.toggle("solo", !act);
    var s = D.createElement("span"); s.textContent = msg; bar.appendChild(s);
    if (act) {
      var b = D.createElement("button"); b.type = "button"; b.textContent = act; b.addEventListener("click", fn); bar.appendChild(b);
      var x = D.createElement("button"); x.type = "button"; x.className = "pwa-x"; x.setAttribute("aria-label", "Dismiss"); x.textContent = "×";
      x.addEventListener("click", function () { bar.hidden = true; }); bar.appendChild(x);
    }
    bar.hidden = false;
    if (ms) barT = setTimeout(function () { bar.hidden = true; }, ms);
  }

  /* ---------- actions ---------- */
  function share() {
    var url = location.origin + location.pathname;
    var data = { title: "Nestling", text: "Nestling: the first year, gently understood. A calm guide to your baby's first year, with every claim graded.", url: url };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { say("Link copied: " + url, null, null, 3800); }, function () { say(url, null, null, 8000); });
      return;
    }
    say(url, null, null, 8000);
  }
  D.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-pwa-install],[data-pwa-share],[data-pwa-howbtn],[data-pwa-later]") : null;
    if (!t) return;
    if (t.hasAttribute("data-pwa-install")) {
      if (!deferred) return;
      var d = deferred; deferred = null; d.prompt();
      (d.userChoice || Promise.resolve()).then(function () { render(); }, function () { render(); });
    } else if (t.hasAttribute("data-pwa-share")) share();
    else if (t.hasAttribute("data-pwa-howbtn")) {
      var how = t.closest(".pwa-card").querySelector("[data-pwa-how]"); how.hidden = !how.hidden;
      t.setAttribute("aria-expanded", how.hidden ? "false" : "true");
    } else if (t.hasAttribute("data-pwa-later")) { set("pwaLater", true); render(); }
  });
  addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; render(); });
  addEventListener("appinstalled", function () { deferred = null; render(); });

  /* ---------- the title bar follows the chosen palette when installed ---------- */
  var tc = D.querySelector('meta[name="theme-color"]');
  function syncBar() { if (!tc) return; var c = getComputedStyle(R).getPropertyValue("--paper").trim(); if (c) tc.setAttribute("content", c); }
  try { new MutationObserver(syncBar).observe(R, { attributes: true, attributeFilter: ["data-palette", "data-theme"] }); } catch (e) {}
  try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", syncBar); } catch (e) {}

  /* ---------- offline copy and updates ---------- */
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", function (e) {
      var d = e.data || {};
      if (d.type === "cached") status();
      if (d.type === "latest" && d.version && BUILD && d.version !== BUILD)
        say("A new version of Nestling is ready", "Refresh", function () { location.reload(); }, 0);
    });
    navigator.serviceWorker.addEventListener("controllerchange", status);
    navigator.serviceWorker.register("sw.js").then(function (reg) {
      var checked = Date.now();
      D.addEventListener("visibilitychange", function () {
        if (D.visibilityState === "visible" && Date.now() - checked > 30 * 60 * 1000) { checked = Date.now(); reg.update().catch(function () {}); }
      });
      return navigator.serviceWorker.ready;
    }).then(status, function () { setStatus("This browser can't keep an offline copy.", false); });
  }
  if (VER) {
    var seen = get("appver", null);
    if (seen && seen !== VER) setTimeout(function () { say("Nestling has been updated to version " + VER, null, null, 4500); }, 800);
    set("appver", VER);
  }
  addStudio(); addCard(); syncBar(); render();
})();
