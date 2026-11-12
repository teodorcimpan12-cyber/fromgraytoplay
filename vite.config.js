import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { cpSync, readFileSync, writeFileSync } from "node:fs";

// The build still ships ONE index.html (app code and CSS inlined), exactly like the hand-written file it replaces:
// the service worker caches "/" and the whole app works offline, and a deploy is atomic.
// React, Firebase and Leaflet stay on their CDN <script> tags (globals), so the bundle is only our own code.

// Keep the document order of the original page: styles in <head> right after the Leaflet stylesheet,
// the app script at the end of <body> after the CDN libraries it needs.
const keepDocumentOrder = () => ({
  name: "g2p-document-order",
  apply: "build",
  enforce: "post",
  closeBundle() {
    const file = "dist/index.html";
    let html = readFileSync(file, "utf8");
    const cut = (open, close) => {
      const a = html.indexOf(open); if (a < 0) throw new Error("build output is missing " + open);
      const b = html.indexOf(close, a) + close.length;
      const block = html.slice(a, b); html = html.slice(0, a) + html.slice(b); return block;
    };
    const put = (marker, block, after) => {
      const at = html.lastIndexOf(marker); if (at < 0) throw new Error("build output is missing " + marker);
      const pos = after ? at + marker.length : at;
      html = html.slice(0, pos) + "\n" + block + "\n" + html.slice(pos);
    };
    const style = cut("<style rel=\"stylesheet\" crossorigin>", "</style>");
    const app = cut("<script type=\"module\">", "</script>");
    put("leaflet.css\"/></noscript>", style.replace(" rel=\"stylesheet\" crossorigin", ""), true);
    put("<!-- app:end -->", app, false);
    writeFileSync(file, html);
    // The repo root used to be the publish folder; these public links are printed on the pitch sheet.
    cpSync("docs/pitch", "dist/docs/pitch", { recursive: true });
  }
});

export default defineConfig({
  plugins: [viteSingleFile({ removeViteModuleLoader: true }), keepDocumentOrder()],
  build: {
    target: "es2020",
    cssMinify: false, // keep hand-tuned fallbacks (100vh/100dvh pairs, vendor prefixes) exactly as written
    sourcemap: false,
    chunkSizeWarningLimit: 4000
  },
  server: { port: 5173 }
});
