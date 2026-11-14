import { ACTIVE_CITY, db, useApp } from "../app/core.js";
import { ANAF_GUIDE_URL, G2P_EMAIL, SITE } from "../data/constants.js";
import { useState } from "../lib/react.js";
import { copyText } from "../lib/src-by-id.js";

export function Redirect35Card() {
  const { lang, toast } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro; // TODO: HU review (falls back to RO)
  const [tax, setTax] = useState("");
  // "Tell me when I can redirect": a real in-page signup (a mailto: link silently does nothing on phones without a mail app).
  // Stored in partnerRequests/ (write-once, readable only by the admin) so it works with the rules already deployed.
  const [sub, setSub] = useState(() => { try { return localStorage.getItem("g2p_r35") === "1" ? "done" : ""; } catch (e) { return ""; } });
  const [subMail, setSubMail] = useState("");
  const [subOk, setSubOk] = useState(false);
  const [subBusy, setSubBusy] = useState(false);
  const subValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(subMail.trim()) && subMail.trim().length <= 120;
  const subSend = e => {
    if (e && e.preventDefault) e.preventDefault();
    if (subBusy) return;
    if (!subValid || !subOk) { toast(L3("Scrie o adresă de e-mail validă și bifează acordul.", "Enter a valid e-mail address and tick the consent box.")); return; }
    setSubBusy(true);
    db.ref("partnerRequests").push({ company: "3,5%: anunță-mă", email: subMail.trim().slice(0, 120), offer: "redirect35", message: "", consent: true, lang: lang, city: ACTIVE_CITY, date: new Date().toISOString() })
      .then(() => { try { localStorage.setItem("g2p_r35", "1"); } catch (e2) {} setSub("done"); setSubBusy(false); toast(L3("Gata, te anunțăm.", "Done, we will let you know.")); },
        () => { setSubBusy(false); toast(L3("Nu s-a trimis. Încearcă din nou sau scrie-ne la ", "It was not sent. Try again or write to us at ") + G2P_EMAIL); });
  };
  const n = parseFloat(String(tax).replace(/\s/g, "").replace(",", "."));
  const ok = isFinite(n) && n > 0 && n < 10000000;
  const loc = lang === "en" ? "en-GB" : lang === "hu" ? "hu-HU" : "ro-RO";
  const fmt = v => v.toLocaleString(loc, { maximumFractionDigits: 2 });
  const mine = ok ? n * 0.035 : 0;
  const msg = L3(
    "Din primăvara viitoare poți decide unde ajunge 3,5% din impozitul tău pe venit, fără să plătești nimic în plus. Un grup de tineri din Târgu Mureș se înființează ca asociație ca să readucă la viață terenurile de sport din oraș. Te anunțăm când putem primi redirecționări. Detalii: " + SITE + "/#association",
    "From next spring you can decide where 3.5% of your income tax goes, at no extra cost. A group of young people in Târgu Mureș is setting up an association to bring the city's sports courts back to life. We will tell you when we can receive redirections. Details: " + SITE + "/#association");
  const steps = [
    [L3("Verifică dacă poți", "Check that you can"), L3("Ai avut în anul fiscal venituri din salarii sau asimilate (inclusiv pensionari cu venituri salariale) și ai plătit impozit pe ele? Impozitul îl vezi în fișa fiscală sau în adeverința de venit. Pentru PFA și alte venituri, citește ghidul ANAF: regulile s-au schimbat în 2024.", "Did you have salary or salary-like income in the tax year (including pensioners with salary income) and pay income tax on it? You can see the tax on your tax record or income certificate. For self-employed and other income, read the ANAF guide: the rules changed in 2024.")],
    [L3("Completează Formularul 230", "Fill in Form 230"), L3("Până la 25 mai, sub sancțiunea decăderii. Alegi procentul (maximum 3,5%) și poți opta pentru doi ani deodată.", "By 25 May, otherwise the right lapses. You choose the percentage (3.5% at most) and may opt for two years at once.")],
    [L3("Scrie datele asociației", "Write the association's details"), L3("Denumirea, codul de identificare fiscală și contul bancar. Le publicăm aici abia când le avem; nu le inventăm și nu le colectăm înainte.", "The name, tax ID and bank account. We publish them here only once we have them; we do not invent them or collect anything before.")],
    [L3("Atât", "That is all"), L3("Banii merg de la ANAF direct către asociație. Nu trec prin noi și nu trec prin tine, iar tu nu pierzi nimic.", "The money goes from ANAF straight to the association. It does not pass through us or through you, and you lose nothing.")]
  ];
  const needs = [
    L3("personalitate juridică (înscrierea în Registrul asociațiilor și fundațiilor)", "legal personality (entry in the Register of Associations and Foundations)"),
    L3("cod de identificare fiscală și cont bancar", "tax ID and a bank account"),
    L3("înscrierea în Registrul entităților pentru care se acordă deduceri fiscale, prin formularul 163 la ANAF", "entry in ANAF's register of entities eligible for tax deductions, via form 163"),
    L3("raportul anual către ANAF, la termen", "the annual report to ANAF, on time")
  ];
  return React.createElement("section", { className: "r35", "aria-labelledby": "r35-h" },
    React.createElement("span", { className: "badge badge-green" }, "Formularul 230"),
    React.createElement("div", { className: "r35-big", "aria-hidden": "true" }, "3,5%"),
    React.createElement("h3", { id: "r35-h", className: "r35-h" }, L3("3,5% din impozitul tău. 0 lei din buzunarul tău.", "3.5% of your income tax. 0 lei from your pocket.")),
    React.createElement("p", { className: "r35-lead" }, L3(
      "Impozitul pe venit îl plătești oricum. Formularul 230 îți lasă să alegi unde ajunge 3,5% din el. Nu te costă nimic în plus, durează câteva minute o dată pe an și poate însemna, an de an, vopsea, coșuri și mingi pe un teren care ți-a lipsit.",
      "You pay income tax anyway. Form 230 lets you choose where 3.5% of it goes. It costs nothing extra, takes a few minutes once a year, and can mean paint, hoops and balls, year after year, on a court you were missing.")),
    React.createElement("div", { className: "r35-calc" },
      React.createElement("label", { htmlFor: "r35-in", className: "text-sm" }, L3("Impozitul tău pe venit pe un an, în lei (din fișa fiscală)", "Your income tax for one year, in lei (from your tax record)")),
      React.createElement("input", { id: "r35-in", type: "text", inputMode: "decimal", autoComplete: "off", placeholder: "ex. 4800", value: tax, onChange: e => setTax(e.target.value.slice(0, 12)) }),
      React.createElement("div", { className: "r35-out", "aria-live": "polite" }, ok
        ? React.createElement("span", null, L3("3,5% din asta = ", "3.5% of that = "), React.createElement("b", null, fmt(mine) + " lei"),
            React.createElement("span", { className: "text-xs", style: { display: "block", color: "var(--textSec)" } }, L3("Doar aritmetică: dacă 20 de oameni fac la fel, sunt ", "Arithmetic only: if 20 people did the same, that is ") + fmt(mine * 20) + L3(" lei; 100 de oameni, ", " lei; 100 people, ") + fmt(mine * 100) + " lei."))
        : React.createElement("span", { className: "text-sm", style: { color: "var(--textSec)" } }, L3("Scrie suma și vezi cât ai putea redirecționa.", "Enter the amount to see what you could redirect.")))),
    React.createElement("ol", { className: "r35-steps" }, steps.map(([h, p], i) => React.createElement("li", { key: i },
      React.createElement("span", { className: "r35-n", "aria-hidden": "true" }, i + 1),
      React.createElement("div", null, React.createElement("strong", null, h), React.createElement("div", { className: "text-sm", style: { color: "var(--textSec)" } }, p))))),
    React.createElement("div", { className: "r35-honest" },
      React.createElement("strong", null, L3("Cinstit, ce ne lipsește încă", "Honestly, what we still lack")),
      React.createElement("p", { className: "text-sm", style: { margin: ".3rem 0 .4rem" } }, L3("Nu putem primi nimic acum și nu strângem nimic. Ca să primim redirecționări avem nevoie de:", "We cannot receive anything now and we collect nothing. To receive redirections we need:")),
      React.createElement("ul", { className: "text-sm", style: { margin: 0, paddingLeft: "1.1rem" } }, needs.map((x, i) => React.createElement("li", { key: i }, x))),
      React.createElement("p", { className: "text-xs", style: { margin: ".5rem 0 0", color: "var(--textSec)" } }, L3("Nu promitem un an anume: verificăm la ANAF data-limită pentru înscrierea în registru. Sursa regulilor: ", "We promise no specific year: we are checking ANAF's deadline for entering the register. Rules from: "),
        React.createElement("a", { href: ANAF_GUIDE_URL, target: "_blank", rel: "noopener", style: { color: "var(--green)" } }, L3("ghidul ANAF pentru 3,5%", "the ANAF 3.5% guide") + " \u2197"))),
    React.createElement("div", { className: "flex gap-2 mt-2", style: { flexWrap: "wrap" } },
      sub === "done"
        ? React.createElement("div", { className: "r35-sub-done", role: "status" }, "\u2705 " + L3("Ești pe listă. Îți scriem când putem primi redirecționări, nu înainte.", "You are on the list. We will write when we can receive redirections, not before."))
        : sub === "open"
          ? React.createElement("form", { className: "r35-sub", onSubmit: subSend, noValidate: true },
              React.createElement("label", { htmlFor: "r35-mail", className: "text-sm" }, L3("Adresa ta de e-mail", "Your e-mail address")),
              React.createElement("input", { id: "r35-mail", type: "email", inputMode: "email", autoComplete: "email", autoFocus: true, placeholder: "nume@exemplu.ro", value: subMail, maxLength: 120, onChange: e => setSubMail(e.target.value) }),
              React.createElement("label", { className: "r35-consent text-xs" },
                React.createElement("input", { type: "checkbox", checked: subOk, onChange: e => setSubOk(e.target.checked) }),
                React.createElement("span", null, L3("Sunt de acord să primesc un singur e-mail când asociația poate primi redirecționări. Adresa nu e dată nimănui și o ștergem la cerere (" + G2P_EMAIL + ").", "I agree to receive a single e-mail when the association can receive redirections. The address is shared with no one and deleted on request (" + G2P_EMAIL + ")."))),
              React.createElement("div", { className: "flex gap-2", style: { flexWrap: "wrap" } },
                React.createElement("button", { type: "submit", className: "btn btn-green", disabled: subBusy || !subValid || !subOk }, subBusy ? "…" : L3("Trimite", "Send")),
                React.createElement("button", { type: "button", className: "btn btn-ghost", onClick: () => setSub("") }, L3("Renunț", "Cancel"))))
          : React.createElement("button", { type: "button", className: "btn btn-green", onClick: () => setSub("open") }, L3("Anunță-mă când pot redirecționa", "Tell me when I can redirect")),
      React.createElement("button", { type: "button", className: "btn", onClick: () => copyText(msg).then(okc => { if (okc) toast(L3("Mesaj copiat", "Message copied")); }) }, L3("Copiază mesajul pentru un prieten", "Copy a message for a friend"))));
}
