// Layout audit — paste into the browser console on the site (or the local server).
// Opens the app in iframes at phone/tablet/laptop widths, walks every page and tab,
// and reports horizontal overflow, squeezed controls, clipped button text and broken images.
// Run before every UI push; the result must be {}.
(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const report = {};
  for (const city of ["tgm", "sibiu"]) for (const width of [390, 870, 1000, 1280]) {
    const f = document.createElement("iframe");
    f.style.cssText = "position:fixed;top:0;left:0;width:" + width + "px;height:800px;z-index:2147483647;background:#fff";
    f.src = location.pathname + "?c=" + city + "&audit=" + width + "#home";
    document.body.appendChild(f);
    let d, w;
    for (let i = 0; i < 40; i++) { await wait(500); d = f.contentDocument; w = f.contentWindow; if (d && d.querySelector(".nav-logo")) break; }
    const skip = [...d.querySelectorAll("button")].find(b => /Treci peste|Skip/.test(b.textContent)); if (skip) { skip.click(); await wait(600); }
    const vis = el => { const r = el.getBoundingClientRect(), s = w.getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
    const add = (k, v) => { const key = city + " " + width + "px " + k; (report[key] = report[key] || new Set()).add(v); };
    const scan = where => {
      const vw = d.documentElement.clientWidth;
      if (d.documentElement.scrollWidth > vw + 1) add("horizontal-overflow", where + " +" + (d.documentElement.scrollWidth - vw) + "px");
      d.querySelectorAll("select,input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=range]):not([type=color])").forEach(e => { if (vis(e) && e.getBoundingClientRect().width < 60) add("squeezed-control", where + ": " + (e.getAttribute("aria-label") || e.name || e.tagName)); });
      d.querySelectorAll("button,.btn,[role=button]").forEach(e => {
        if (!vis(e) || e.classList.contains("leaflet-marker-icon")) return;
        const rg = d.createRange(); rg.selectNodeContents(e); const tr = rg.getBoundingClientRect(), br = e.getBoundingClientRect();
        if (tr.width && (tr.left < br.left - 2 || tr.right > br.right + 2)) add("clipped-button-text", where + ": " + e.textContent.trim().slice(0, 30));
      });
      d.querySelectorAll("img").forEach(e => { if (e.complete && e.naturalWidth === 0 && vis(e)) add("broken-image", where + ": " + e.src.slice(0, 60)); });
    };
    for (const p of ["home", "courts", "reports", "petition", "community", "impact", "help", "about", "profile"]) {
      w.location.hash = "#" + p; await wait(1300); scan(p);
      const tabs = () => [...d.querySelectorAll("main .tabs button")];
      for (let i = 0; i < tabs().length; i++) { const b = tabs()[i]; if (b) { b.click(); await wait(500); scan(p + "/" + i); } }
    }
    f.remove();
  }
  const out = Object.fromEntries(Object.entries(report).map(([k, v]) => [k, [...v]]));
  window.__layoutAudit = out;
  console.log("layout audit " + JSON.stringify(out));
  return out;
})();
