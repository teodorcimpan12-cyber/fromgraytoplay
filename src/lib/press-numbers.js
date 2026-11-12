import { ACTIVE_CITY, COURTS, PRESS_URL, SAT_N, SAT_RECENT, STADIUM_N, loadQRious } from "../app/core.js";
import { G2P_EMAIL, G2P_PRESS_PHONE, SITE } from "../data/constants.js";
import { cityName } from "./city-name.js";
import { srcById, srcCite, srcList } from "./src-by-id.js";

// Key numbers: each has a source (or is live data from the site itself).
export function pressNumbers(lang, d) {
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const live = L3("live, din site", "live, from the site", "élő, az oldalról");
  const city = ACTIVE_CITY === "sibiu" ? [
    { n: String(d.courts), l: L3("terenuri publice în Sibiu", "public courts in Sibiu", "közpálya Szebenben") + (STADIUM_N ? " (" + L3("dintre care ", "incl. ", "ebből ") + STADIUM_N + " " + L3("stadioane", "stadiums", "stadion") + ")" : ""), src: "osm" },
    { n: d.checked + " / " + d.courts, l: L3("verificate de comunitate", "checked by the community", "ellenőrizte a közösség"), live: live },
    { n: SAT_RECENT + " / " + SAT_N, l: L3("terenuri cu ultima imagine din satelit din 2021–2022", "courts whose latest satellite image is from 2021–2022", "pálya legfrissebb műholdképe 2021–2022-es"), src: "sbt1" },
    { n: "12 mil. lei", l: L3("Agenda Sportivă 2024, Primăria Sibiu", "2024 Sports Agenda, Sibiu City Hall", "2024-es Sportprogram, Szeben"), src: "zsn-12m" }
  ] : [
    { n: "12 / 15", l: L3("rezidenți nu folosesc terenul cel mai apropiat", "residents don't use their nearest court", "lakos nem használja a legközelebbi pályát"), src: "survey" },
    { n: "5 mil. lei", l: L3("blocați de o eroare în acte (baza Insulei)", "frozen by a paperwork error (Insulei base)", "befagyasztva egy irathiba miatt (Insulei bázis)"), src: "punctul-5m" },
    { n: "0%", l: L3("terenuri periferice renovate", "peripheral courts renovated", "felújított peremkerületi pálya"), src: "sidu" },
    { n: "~70%", l: L3("cât era gata patinoarul abandonat în 2013", "how far the rink got before it was abandoned in 2013", "ennyire készült el a 2013-ban abbahagyott jégpálya"), src: "agerpres-rink" }
  ];
  return city.concat([
    { n: String(d.votes), l: L3("semnături pe petiție", "petition signatures", "aláírás a petíción"), live: live },
    d.reports > 0 && { n: String(d.reports), l: L3("sesizări trimise de oameni", "reports sent by people", "bejelentés"), live: live },
    { n: "28%", l: L3("dintre adolescenții români (11–15 ani) fac destulă mișcare", "of Romanian adolescents (11–15) get enough exercise", "a romániai serdülők (11–15) közül mozog eleget"), src: "mediafax-28" },
    { n: "81%", l: L3("dintre adolescenții lumii (11–17 ani) nu fac destulă mișcare", "of adolescents worldwide (11–17) are not active enough", "a serdülők (11–17) közül világszerte nem mozog eleget"), src: "who-81" }
  ].filter(Boolean));
}
export function pressRelease(lang, d) {
  const date = new Date().toLocaleDateString(lang === "en" ? "en-GB" : "ro-RO", { day: "numeric", month: "long", year: "numeric" });
  if (ACTIVE_CITY === "sibiu") {
    if (lang === "en") return [
      "Sibiu, " + date + " — From Grey to Play, a civic platform built by five young people from Romania, maps the " + d.courts + " public neighbourhood courts in Sibiu (OpenStreetMap). So far the community has checked " + d.checked + " of them on the spot, and " + d.votes + " people have signed the petition for better courts.",
      "Why it matters: only 28% of Romanian adolescents aged 11–15 get the minimum recommended physical activity (WHO report, Mediafax, Jan 2025). For 34 of Sibiu's 35 neighbourhood courts, the newest satellite image is from 2021–2022, so nobody has a current picture of their condition.",
      "Sibiu City Hall allocated 12 million lei to sport through its 2024 Sports Agenda (Zile și Nopți, Feb 2024). The platform asks for a share of that effort to reach the neighbourhood courts, and lets anyone check a court from their phone in 20 seconds.",
      "Every number on the site has a public source: " + SITE + "/#about. The data is live: " + SITE
    ];
    return [
      "Sibiu, " + date + " — From Grey to Play, o platformă civică făcută de cinci tineri din România, cartografiază cele " + d.courts + " de terenuri publice de cartier din Sibiu (OpenStreetMap). Până acum, comunitatea a verificat pe teren " + d.checked + " dintre ele, iar " + d.votes + " de oameni au semnat petiția pentru terenuri mai bune.",
      "De ce contează: doar 28% dintre adolescenții români de 11–15 ani fac minimul de mișcare recomandat (raport OMS, Mediafax, ian. 2025). Pentru 34 din cele 35 de terenuri de cartier din Sibiu, cea mai nouă imagine din satelit este din 2021–2022, deci nimeni nu are o imagine actuală a stării lor.",
      "Primăria Sibiu a alocat 12 milioane de lei pentru sport prin Agenda Sportivă 2024 (Zile și Nopți, feb. 2024). Platforma cere ca o parte din acest efort să ajungă și la terenurile din cartiere și îi lasă pe oameni să verifice un teren din telefon în 20 de secunde.",
      "Fiecare cifră de pe site are o sursă publică: " + SITE + "/#about. Datele sunt live: " + SITE
    ];
  }
  if (lang === "en") return [
    "Târgu Mureș, " + date + " — From Grey to Play, a civic platform built by five young people from Târgu Mureș, documents the condition of the city's " + d.courts + " public sports courts. So far " + d.votes + " people have signed the petition to renovate the courts in the outer neighbourhoods" + (d.reports > 0 ? ", and residents have sent " + d.reports + " reports." : "."),
    "Why it matters: only 28% of Romanian adolescents aged 11–15 get the minimum recommended physical activity (WHO report, Mediafax, Jan 2025). In Târgu Mureș, 12 of 15 residents polled by the team say they don't use their nearest court because it is too run-down. A 5-million-lei paperwork error froze the renovation of the Insulei Street sports base (Punctul.ro, Oct 2025).",
    "The proposals: Flip-the-Court (resurface three of the worst courts and add an equipment cabinet opened from the app) and Street Canvas (ground murals painted by local artists and neighbours).",
    "Every number on the site has a public source: " + SITE + "/#about. The data is live: " + SITE
  ];
  return [
    "Târgu Mureș, " + date + " — From Grey to Play, o platformă civică făcută de cinci tineri din Târgu Mureș, documentează starea celor " + d.courts + " de terenuri sportive publice din oraș. Până azi, " + d.votes + " de oameni au semnat petiția pentru renovarea terenurilor din cartierele periferice" + (d.reports > 0 ? ", iar locuitorii au trimis " + d.reports + " sesizări." : "."),
    "De ce contează: doar 28% dintre adolescenții români de 11–15 ani fac minimul de mișcare recomandat (raport OMS, Mediafax, ian. 2025). În Târgu Mureș, 12 din 15 rezidenți întrebați de echipă spun că nu folosesc terenul cel mai apropiat, pentru că e prea degradat. O eroare în acte de 5 milioane de lei a blocat renovarea bazei sportive de pe str. Insulei (Punctul.ro, oct. 2025).",
    "Propunerile: Flip-the-Court (refacerea a trei dintre cele mai degradate terenuri, cu un dulap de echipament deschis din aplicație) și Street Canvas (murale pe teren, pictate de artiști locali și vecini).",
    "Fiecare cifră de pe site are o sursă publică: " + SITE + "/#about. Datele sunt live: " + SITE
  ];
}
// jsPDF's built-in fonts only cover Latin-1: drop diacritics and swap typographic punctuation.
export function pdfTxt(s) {
  return String(s == null ? "" : s).normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[–—]/g, "-").replace(/[“”„]/g, "\"").replace(/[‘’]/g, "'").replace(/…/g, "...").replace(/≈/g, "~")
    .replace(/[^\x00-\xFF]/g, "").replace(/\s+$/, "");
}
export function imgToDataUrl(src) {
  return fetch(src).then(r => r.ok ? r.blob() : Promise.reject(new Error("img"))).then(b => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(b); }));
}
export function qrDataUrl(value, size) {
  return loadQRious().then(() => new QRious({ value: value, size: size || 600, level: "M", background: "#ffffff", foreground: "#1A1A2E" }).toDataURL("image/png"));
}
export async function buildPressPdf(lang, d) {
  const JsPDF = window.jspdf && window.jspdf.jsPDF;
  if (!JsPDF) throw new Error("jspdf");
  const doc = new JsPDF({ unit: "mm", format: "a4" });
  const W = 210, M = 18, maxW = W - M * 2;
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro;
  const city = cityName(lang);
  let y = 0;
  const need = h => { if (y + h > 282) { doc.addPage(); y = 20; } };
  const para = (txt, size, style, color) => {
    doc.setFont("helvetica", style || "normal"); doc.setFontSize(size || 10); doc.setTextColor.apply(doc, color || [30, 30, 40]);
    doc.splitTextToSize(pdfTxt(txt), maxW).forEach(line => { need(5.2); doc.text(line, M, y); y += (size || 10) * .45; });
  };
  const head = txt => { y += 4; need(12); doc.setFillColor(16, 185, 129); doc.rect(M, y - 4.2, 2, 6, "F"); doc.setFont("helvetica", "bold"); doc.setFontSize(12.5); doc.setTextColor(26, 26, 46); doc.text(pdfTxt(txt), M + 4.5, y); y += 7; };
  // Cover band
  doc.setFillColor(26, 26, 46); doc.rect(0, 0, W, 46, "F");
  doc.setFillColor(16, 185, 129); doc.rect(0, 46, W, 1.6, "F");
  try { const logo = await imgToDataUrl("/icons/icon-192.png"); doc.addImage(logo, "PNG", W - M - 26, 10, 26, 26); } catch (e) {}
  doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.text("FROM GREY TO PLAY", M, 21);
  doc.setFontSize(11.5); doc.setFont("helvetica", "normal"); doc.text(pdfTxt(L3("Kit de presă", "Press kit", "Sajtócsomag") + " · " + city), M, 29);
  doc.setFontSize(8.5); doc.setTextColor(180, 190, 200);
  doc.text(pdfTxt(L3("Date live la ", "Live data as of ", "Élő adatok: ") + new Date().toLocaleString("ro-RO") + " · " + SITE.replace("https://", "")), M, 37);
  y = 58;
  head(L3("Pe scurt", "In short", "Röviden"));
  para(L3("Platformă civică ce documentează terenurile sportive publice din " + city + ": hartă, stare, sesizări trimise la Primărie, petiție. Fiecare cifră are sursă publică.",
    "A civic platform documenting public sports courts in " + city + ": map, condition, reports sent to City Hall, petition. Every number has a public source.",
    "Civil platform, amely " + city + " közpályáit dokumentálja: térkép, állapot, bejelentések, petíció. Minden számnak nyilvános forrása van."), 10.5);
  head(L3("Cifre cheie", "Key numbers", "Kulcsszámok"));
  pressNumbers(lang, d).forEach(k => {
    const s = k.src && srcById(k.src);
    need(13);
    doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(16, 150, 110); doc.text(pdfTxt(k.n), M, y);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(30, 30, 40);
    const lw = doc.splitTextToSize(pdfTxt(k.l), maxW - 40); doc.text(lw, M + 40, y);
    y += Math.max(5.5, lw.length * 4.6);
    doc.setFontSize(7.8); doc.setTextColor(110, 115, 125);
    const st = s ? L3("Sursa: ", "Source: ", "Forrás: ") + s.pub + (s.d ? ", " + s.d : "") + (s.url ? " - " + s.url : "") : L3("Sursa: ", "Source: ", "Forrás: ") + k.live + " (" + SITE.replace("https://", "") + ")";
    doc.splitTextToSize(pdfTxt(st), maxW - 40).forEach(l => { need(4); doc.text(l, M + 40, y); y += 3.4; });
    y += 2.6;
  });
  head("Comunicat de presă (RO)");
  pressRelease("ro", d).forEach(p => { para(p, 10); y += 2; });
  head("Press release (EN)");
  pressRelease("en", d).forEach(p => { para(p, 10); y += 2; });
  if (d.photos && d.photos.length) {
    head(L3("Fotografii trimise de oameni", "Photos sent by people", "Beküldött fotók"));
    let x = M;
    for (const r of d.photos.slice(0, 3)) {
      try {
        need(48);
        doc.addImage(r.photoDataUrl, "JPEG", x, y, 54, 40);
        const c = COURTS.find(cc => cc.id === r.courtId);
        doc.setFontSize(7); doc.setTextColor(110, 115, 125);
        doc.text(pdfTxt((c ? c.name : "") + " - " + L3("sesizare pe site", "report on the site", "bejelentés") + (r.timestamp ? ", " + new Date(r.timestamp).toLocaleDateString("ro-RO") : "")).slice(0, 48), x, y + 44);
        x += 58;
      } catch (e) {}
    }
    y += 50;
  }
  head(L3("Imagini", "Images", "Képek"));
  para(L3("Pe " + PRESS_URL + " găsiți: imaginea din satelit a unui teren în doi ani diferiți (Esri World Imagery Wayback), logo-ul și capturi din site. Sursa e trecută sub fiecare imagine.",
    "At " + PRESS_URL + ": a satellite image of one court in two different years (Esri World Imagery Wayback), the logo and screenshots of the site. The source is under every image.",
    "A " + PRESS_URL + " oldalon: egy pálya műholdképe két különböző évben (Esri Wayback), a logó és képernyőképek. A forrás minden kép alatt."), 9.5);
  head(L3("Contact", "Contact", "Kapcsolat"));
  need(40);
  const cy = y;
  para("From Grey to Play · " + L3("coordonare: ", "coordination: ", "koordináció: ") + "Cîmpan Teodor", 10.5, "bold");
  para("Email: " + G2P_EMAIL, 10.5);
  para(L3("Telefon: ", "Phone: ", "Telefon: ") + G2P_PRESS_PHONE, 10.5);
  para("Web: " + SITE.replace("https://", "") + " · " + L3("presă: ", "press: ", "sajtó: ") + PRESS_URL.replace("https://", ""), 10.5);
  try { const q = await qrDataUrl(PRESS_URL, 400); doc.addImage(q, "PNG", W - M - 30, cy - 5, 30, 30); doc.setFontSize(7); doc.setTextColor(110, 115, 125); doc.text(pdfTxt(L3("scanează: kit de presă", "scan: press kit", "szkenneld: sajtócsomag")), W - M - 30, cy + 28.5); } catch (e) {}
  // Sources page
  doc.addPage(); y = 20;
  head(L3("Surse", "Sources", "Források"));
  srcList().forEach((s, i) => { para((i + 1) + ". " + srcCite(s, lang), 8.2, "normal", [60, 64, 72]); y += 1.2; });
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) { doc.setPage(i); doc.setFontSize(7.5); doc.setTextColor(150, 150, 160); doc.text("From Grey to Play · " + PRESS_URL.replace("https://", "") + " · " + i + "/" + pages, W / 2, 292, { align: "center" }); }
  doc.save("from-grey-to-play_press_" + ACTIVE_CITY + "_" + new Date().toISOString().slice(0, 10) + ".pdf");
}
