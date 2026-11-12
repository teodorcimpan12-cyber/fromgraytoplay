// jsPDF (~350 KB) is only needed when someone exports a PDF, so it is fetched on the first click, not on every visit.
// The service worker still precaches the same pinned file, so a PDF works offline once the app is installed.
const JSPDF_URL = "https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js";
let pending = null;
export function loadJsPDF() {
  if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  if (!pending) pending = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = JSPDF_URL; s.async = true;
    s.onload = () => (window.jspdf && window.jspdf.jsPDF ? resolve(window.jspdf.jsPDF) : reject(new Error("jspdf")));
    s.onerror = () => { pending = null; s.remove(); reject(new Error("jspdf")); };
    document.head.appendChild(s);
  });
  return pending;
}
