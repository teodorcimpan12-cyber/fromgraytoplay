import { ACTIVE_CITY, CITY_HALL, COURTS, LETTER_AREAS, db, useApp } from "../../app/core.js";
import { SITE } from "../../data/constants.js";
import { cityName } from "../../lib/city-name.js";
import { logActivity } from "../../lib/log-activity.js";
import { useState } from "../../lib/react.js";

export function LetterModal({
  onClose,
  total
}) {
  const {
    t,
    lang,
    toast
  } = useApp();
  const [n, setN] = useState("");
  const [a, setA] = useState("");
  const [area, setArea] = useState(LETTER_AREAS[0].k);
  const [why, setWhy] = useState("");
  const buildLetter = () => {
    const areaObj = LETTER_AREAS.find(x => x.k === area) || LETTER_AREAS[0];
    const areaLabel = areaObj[lang];
    const court = COURTS.find(c => c.neighbourhood === area && c.status === "degraded") || COURTS.find(c => c.neighbourhood === area) || COURTS[0];
    const web = SITE.replace("https://", "");
    if (ACTIVE_CITY !== "tgm") {
      const nC = COURTS.length;
      if (lang === "ro") return `CĂTRE: ${CITY_HALL.ro}\n${CITY_HALL.address}\n\nSubsemnatul/a ${n || "___"}, domiciliat/ă în ${a || areaLabel},\n\nÎn calitate de locuitor al zonei ${areaLabel}, solicit un audit public al stării terenurilor sportive din municipiu, în special "${court.name}".\n${why ? "\nDe ce contează pentru mine: " + why + "\n" : ""}\nContext:\n- ${nC} terenuri sportive publice sunt cartografiate în OpenStreetMap pentru ${cityName("ro")}; starea lor nu este publicată oficial\n- ${total} cetățeni au semnat petiția online (${web})\n\nSolicit:\n1. Publicarea stării și a programului de întreținere pentru fiecare teren\n2. Includerea terenurilor degradate în bugetul de investiții\n\nCu stimă,\n${n || "___"}\nData: ${new Date().toLocaleDateString("ro-RO")}`;
      // TODO: HU review
      if (lang === "hu") return `CÍMZETT: ${CITY_HALL.hu}\n${CITY_HALL.address}\n\nAlulírott ${n || "___"}, lakcím: ${a || areaLabel},\n\na(z) ${areaLabel} környék lakójaként kérem a város sportpályái állapotának nyilvános felmérését, különösen a(z) "${court.name}" pályáét.\n${why ? "\nMiért fontos ez nekem: " + why + "\n" : ""}\nHáttér:\n- ${nC} nyilvános sportpálya szerepel az OpenStreetMap térképen (${cityName("hu")}); állapotukat hivatalosan nem teszik közzé\n- ${total} polgár írta alá az online petíciót (${web})\n\nKérem:\n1. Minden pálya állapotának és karbantartási tervének közzétételét\n2. A leromlott pályák felvételét a beruházási költségvetésbe\n\nTisztelettel,\n${n || "___"}\nDátum: ${new Date().toLocaleDateString("hu-HU")}`;
      return `TO: ${CITY_HALL.en}\n${CITY_HALL.address}\n\nI, ${n || "___"}, residing at ${a || areaLabel},\n\nas a resident of the ${areaLabel} area, I request a public audit of the condition of the city's sports courts, in particular "${court.name}".\n${why ? "\nWhy this matters to me: " + why + "\n" : ""}\nContext:\n- ${nC} public sports courts are mapped in OpenStreetMap for ${cityName("en")}; their condition is not officially published\n- ${total} citizens signed the online petition (${web})\n\nI request:\n1. Publication of the condition and maintenance schedule of each court\n2. Inclusion of degraded courts in the investment budget\n\nSincerely,\n${n || "___"}\nDate: ${new Date().toLocaleDateString("en-GB")}`;
    }
    if (lang === "ro") return `CĂTRE: Consiliul Local și Primăria Municipiului Târgu Mureș\n\nSubsemnatul/a ${n || "___"}, domiciliat/ă în ${a || areaLabel},\n\nÎn calitate de locuitor al zonei ${areaLabel}, solicit renovarea terenurilor sportive din cartierele periferice, în special "${court.name}".\n${why ? "\nDe ce contează pentru mine: " + why + "\n" : ""}\nArgumente:\n- ${total} cetățeni au semnat petiția online (${web})\n- 12 din 15 rezidenți întrebați într-un sondaj informal nu folosesc terenul cel mai apropiat, pentru că e prea degradat\n- Răspunsul CSM Târgu Mureș nr. 2692/03.11.2026: 1,86 mil. lei investiți în 4 ani, din care 49,5% pentru omologarea Liga 3 și platforma Sălii Polivalente; bugetul CSM a crescut cu 70%, iar cheltuielile cu terenurile au scăzut cu 65% (2022-2025)\n- Fișa terenului, cu poze și sesizări: ${SITE}/#court-${court.id}\n\nPropuneri concrete:\n1. Flip-the-Court — renovarea terenurilor existente\n2. Street Canvas — mural comunitar ales prin vot\n\nCu stimă,\n${n || "___"}\nData: ${new Date().toLocaleDateString("ro-RO")}`;
    // TODO: HU review — draft translation, verify with a native speaker
    if (lang === "hu") return `CÍMZETT: Marosvásárhely Helyi Tanácsa és Polgármesteri Hivatala\n\nAlulírott ${n || "___"}, lakcím: ${a || areaLabel},\n\na(z) ${areaLabel} környék lakójaként kérem a peremkerületi sportpályák felújítását, különösen a(z) "${court.name}" pályáét.\n${why ? "\nMiért fontos ez nekem: " + why + "\n" : ""}\nÉrvek:\n- ${total} polgár írta alá az online petíciót (${web})\n- Egy informális felmérésben 15 megkérdezett lakosból 12 nem használja a legközelebbi pályát, mert túl rossz állapotú\n- A CSM Marosvásárhely 2692/03.11.2026 sz. válasza: 4 év alatt 1,86 millió lej beruházás, ennek 49,5%-a a Liga 3 homologálására és a Sportcsarnok platformjára; a CSM költségvetése 70%-kal nőtt, a pályákra fordított kiadás 65%-kal csökkent (2022-2025)\n- A pálya adatlapja fotókkal és bejelentésekkel: ${SITE}/#court-${court.id}\n\nKonkrét javaslatok:\n1. Flip-the-Court — meglévő pályák felújítása\n2. Street Canvas — közösségi szavazással választott falfestmény\n\nTisztelettel,\n${n || "___"}\nDátum: ${new Date().toLocaleDateString("hu-HU")}`;
    return `TO: Târgu Mureș City Council and City Hall\n\nI, ${n || "___"}, residing at ${a || areaLabel},\n\nas a resident of the ${areaLabel} area, I request the renovation of peripheral sports courts, in particular "${court.name}".\n${why ? "\nWhy this matters to me: " + why + "\n" : ""}\nArguments:\n- ${total} citizens signed the online petition (${web})\n- In an informal poll, 12 of 15 residents asked do not use their nearest court because it is too degraded\n- CSM Târgu Mureș reply no. 2692/03.11.2026: 1.86M lei invested in 4 years, 49.5% of it on Liga 3 homologation and the Sala Polivalentă platform; the CSM budget rose 70% while spending on the grounds fell 65% (2022-2025)\n- The court's page, with photos and reports: ${SITE}/#court-${court.id}\n\nConcrete proposals:\n1. Flip-the-Court — renovate existing courts\n2. Street Canvas — community-voted mural\n\nSincerely,\n${n || "___"}\nDate: ${new Date().toLocaleDateString("en-GB")}`;
  };
  const dl = () => {
    const text = buildLetter();
    /* S4-F3: increment letter counter */
    db.ref("letterCount/total").transaction(v => (v || 0) + 1);
    logActivity("letter", "Cetățean", null);
    const JsPDF = window.jspdf && window.jspdf.jsPDF;
    if (!JsPDF) {
      const b = new Blob([text], { type: "text/plain" });
      const el = document.createElement("a");
      el.href = URL.createObjectURL(b);
      el.download = "scrisoare_g2p.txt";
      el.click();
      return;
    }
    const doc = new JsPDF({ unit: "mm", format: "a4" });
    const W = 210, M = 20, maxW = W - M * 2;
    // Brand header bar
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, W, 16, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("FROM GREY TO PLAY", M, 10.5);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(SITE.replace("https://", ""), W - M, 10.5, { align: "right" });
    // Body
    doc.setTextColor(30, 30, 40);
    doc.setFontSize(10.5);
    let y = 28;
    text.split("\n").forEach(line => {
      const wrapped = doc.splitTextToSize(line || " ", maxW);
      wrapped.forEach(w => {
        if (y > 280) { doc.addPage(); y = 22; }
        doc.text(w, M, y);
        y += 5.4;
      });
    });
    // Footer
    doc.setDrawColor(220, 220, 225);
    doc.line(M, 288, W - M, 288);
    doc.setFontSize(7.5);
    doc.setTextColor(140, 140, 150);
    doc.text("Generat prin From Grey to Play · " + new Date().toLocaleDateString("ro-RO"), M, 293);
    doc.save("scrisoare_consiliu_g2p.pdf");
    toast(t.success);
  };
  const email = () => {
    const subj = lang === "ro" ? "Renovarea terenurilor sportive — " + cityName(lang) : lang === "hu" ? "Sportpályák felújítása — " + cityName(lang) : "Renovation of sports courts — " + cityName(lang);
    window.location.href = `mailto:${CITY_HALL.mail}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(buildLetter())}`;
    toast(t.success);
  };
  // Fallback when no mail app opens: copy the letter text.
  const copyText = () => {
    const txt = buildLetter();
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast(lang === "en" ? "Text copied" : lang === "hu" ? "Szöveg másolva" : "Text copiat")).catch(() => toast(t.error)); // TODO: HU review
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "modal-overlay",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "modal",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("h2", {
    className: "mb-2"
  }, t.generateLetter), /*#__PURE__*/React.createElement("input", {
    placeholder: lang === "ro" ? "Numele tău" : lang === "hu" ? "Neved" : "Your name",
    value: n,
    onChange: e => setN(e.target.value),
    className: "mb-1"
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: t.address,
    value: a,
    onChange: e => setA(e.target.value),
    className: "mb-1"
  }), /*#__PURE__*/React.createElement("label", {
    className: "text-xs font-bold",
    style: { color: "var(--textSec)" }
  }, t.letterArea), /*#__PURE__*/React.createElement("select", {
    value: area,
    onChange: e => setArea(e.target.value),
    className: "mb-1"
  }, LETTER_AREAS.map(x => /*#__PURE__*/React.createElement("option", {
    key: x.k,
    value: x.k
  }, x[lang]))), /*#__PURE__*/React.createElement("label", {
    className: "text-xs font-bold",
    style: { color: "var(--textSec)" }
  }, t.letterWhy), /*#__PURE__*/React.createElement("textarea", {
    placeholder: t.letterWhyPh,
    value: why,
    onChange: e => setWhy(e.target.value),
    className: "mb-2",
    rows: 2
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1",
    style: { flexWrap: "wrap" }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-green",
    onClick: email
  }, "✉️ ", t.emailLetter), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-outline",
    onClick: copyText
  }, "📋 ", lang === "en" ? "Copy the text" : lang === "hu" ? "Szöveg másolása" : "Copiază textul"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-outline",
    onClick: dl
  }, "📥 ", t.downloadPDF), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: onClose
  }, t.cancel))));
}
