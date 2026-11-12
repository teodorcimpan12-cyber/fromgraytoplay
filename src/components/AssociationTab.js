import { useApp } from "../app/core.js";
import { Redirect35Card } from "./Redirect35Card.js";
import { G2P_EMAIL } from "../data/constants.js";

/* === Association tab (About). Honest status: the association is being set up, not registered yet.
   Founders = the three adults. Nothing here claims a legal body, a bank account or any funds. === */
export function AssociationTab({ onFunding }) {
  const { lang, setPage } = useApp();
  const L3 = (ro, en, hu) => lang === "en" ? en : lang === "hu" ? (hu || ro) : ro; // TODO: HU review (falls back to RO)
  const founders = [
    { i: "CT", name: "Cîmpan Teodor", role: L3("Coordonare", "Coordination"), color: "var(--green)" },
    { i: "TM", name: "Trofin Matei", role: L3("Relații publice și financiar", "Public relations and finance"), color: "var(--teal)" },
    { i: "DG", name: "Drăgan Gabriel", role: L3("Activități externe și derularea proiectelor", "External activities and project delivery"), color: "var(--coral)" }
  ];
  const steps = [
    { st: "done", h: L3("Platforma este publică și funcționează", "The platform is public and running"), p: L3("Hartă, petiție, rapoarte și imagini satelit, deschise oricui.", "Map, petition, reports and satellite imagery, open to anyone.") },
    { st: "done", h: L3("Datele sunt deschise, cu sursă", "The data is open, with sources"), p: L3("Licență CC BY 4.0. Fiecare cifră trimite la sursa ei din fila Surse.", "CC BY 4.0 licence. Every number points to its source in the Sources tab.") },
    { st: "doing", h: L3("Act constitutiv și statut", "Founding act and statute"), p: L3("Le pregătim cu cei trei fondatori majori; proiectul de statut e mai jos. Se semnează în formă autentică sau atestată de avocat, altfel actul este nul.", "Being drafted with the three adult founders; the draft statute is below. Signed in notarised form or attested by a lawyer, otherwise the act is void.") },
    { st: "next", h: L3("Rezervarea denumirii", "Name reservation"), p: L3("Dovada disponibilității numelui, de la Ministerul Justiției.", "Proof that the name is available, from the Ministry of Justice.") },
    { st: "next", h: L3("Patrimoniul inițial", "Initial assets"), p: L3("Legea cere o sumă minimă, depusă în cont. Verificăm valoarea în vigoare și o împărțim între fondatori; rămâne fondul asociației.", "The law requires a minimum sum, paid into an account. We check the current value and split it between the founders; it stays the association's fund.") },
    { st: "next", h: L3("Sediul", "Registered office"), p: L3("Contract de comodat sau chirie, plus extras de carte funciară.", "A loan-for-use or rental contract, plus a land-registry extract.") },
    { st: "next", h: L3("Dosarul la judecătorie", "Court filing"), p: L3("Depunere la judecătoria din raza sediului, plus taxele. Personalitatea juridică apare la înscrierea în Registrul asociațiilor și fundațiilor (OG 26/2000).", "Filed at the court covering the office, plus fees. Legal personality starts when we are entered in the Register of Associations and Foundations (OG 26/2000).") },
    { st: "next", h: L3("CIF, cont bancar, contabilitate", "Tax ID, bank account, bookkeeping"), p: L3("Abia după aceea putem primi bani, și atunci îi arătăm public.", "Only after that can we receive money, and then we show it publicly.") },
    { st: "next", h: L3("Înscriere în registrul pentru 3,5%", "Entry in the 3.5% register"), p: L3("Formularul 163 la ANAF: de aici încolo oamenii pot redirecționa 3,5% din impozit prin Formularul 230.", "Form 163 at ANAF: from then on people can redirect 3.5% of their income tax through Form 230.") }
  ];
  const prep = [
    L3("Numele „Asociația From Grey to Play”, verificat și scris la fel peste tot", "The name “Asociația From Grey to Play”, checked and written the same everywhere"),
    L3("Cei trei fondatori confirmă în scris numele și rolurile", "The three founders confirm names and roles in writing"),
    L3("Statutul completat și vizat de un avocat sau de o asociație gazdă", "The statute completed and reviewed by a lawyer or a host association"),
    L3("Decizia despre aportul la patrimoniu: cât, de la cine, în ce cont", "The decision on the initial contribution: how much, from whom, into which account"),
    L3("Cine pune la dispoziție adresa sediului și cu ce contract", "Who provides the office address, and under which contract"),
    L3("Declarație de intenție semnată de cei trei (nu constituie asociația, dar arată angajamentul)", "A declaration of intent signed by the three (it does not create the association, but shows commitment)")
  ];
  const statute = [
    [L3("Scop", "Purpose"), L3("Reducerea inegalității de acces la infrastructura sportivă publică în orașele României, prin documentare, transparență și implicarea tinerilor. Asociația este apolitică, nonprofit și nu distribuie profit.", "Reducing unequal access to public sports infrastructure in Romanian cities through documentation, transparency and youth involvement. The association is apolitical, non-profit and distributes no profit.")],
    [L3("Obiective", "Objectives"), L3("Documentarea stării terenurilor sportive publice și publicarea datelor deschise; sprijinirea cetățenilor în exercitarea dreptului de petiționare și de acces la informații publice; acțiuni sportive și civice în comunitate; colaborare cu autorități, școli și mediul privat pentru renovarea și întreținerea terenurilor.", "Documenting the condition of public sports courts and publishing open data; helping citizens use their right to petition and to access public information; community sports and civic actions; working with authorities, schools and private partners to renovate and maintain courts.")],
    [L3("Organe", "Bodies"), L3("Adunarea Generală (toți membrii) și Consiliul Director de 3 membri, cu mandat de 2 ani și cel mult două mandate consecutive. Cenzor sau comisie de cenzori, obligatoriu când sunt peste 15 asociați.", "The General Assembly (all members) and a Board of 3, with 2-year terms and at most two consecutive terms. An auditor or audit committee, mandatory above 15 members.")],
    [L3("Resurse", "Resources"), L3("Cotizații, donații, sponsorizări, redirecționări din impozit, finanțări nerambursabile și venituri din activități economice accesorii, în limitele legii.", "Membership fees, donations, sponsorships, income-tax redirections, grants and income from ancillary economic activity, within the law.")],
    [L3("Transparență", "Transparency"), L3("Raport anual de activitate și financiar, publicat pe acest site.", "An annual activity and financial report, published on this site.")],
    [L3("Dizolvare", "Dissolution"), L3("Bunurile rămase merg la o entitate nonprofit cu scop similar, conform OG 26/2000.", "Remaining assets go to a non-profit with a similar purpose, as OG 26/2000 requires.")]
  ];
  const ladder = [
    ["🧑‍🤝‍🧑", L3("Aportul fondatorilor", "Founders' contribution"), L3("Ziua 0", "Day 0"), L3("Patrimoniul inițial și o cotizație simbolică. Cerut de lege.", "The initial assets and a symbolic fee. Required by law.")],
    ["🏷️", L3("„Adoptă un teren”", "“Adopt a court”"), L3("Lunile 1–6", "Months 1–6"), L3("Firme locale: logo pe panou după renovare, echipament în natură sau o zi de voluntariat. Începem cu scrisori de intenție.", "Local firms: a logo on the board after renovation, equipment in kind or a volunteering day. We start with letters of intent.")],
    ["🧾", L3("3,5% din impozit (Formularul 230)", "3.5% income tax (Form 230)"), L3("După înscriere", "After registration"), L3("Prima sursă recurentă, fără cost pentru donator. Intră în joc doar după înscrierea în registrul ANAF (formularul 163); verificăm data-limită, termenul oamenilor e 25 mai.", "The first recurring source, at no cost to the donor. It only starts after we are entered in ANAF's register (form 163); we check the deadline, people's own deadline is 25 May.")],
    ["🏛️", L3("Finanțări locale (Legea 350/2005)", "Local funding (Law 350/2005)"), L3("Anul 2", "Year 2"), L3("Țintim activități, nu renovări: multe regulamente exclud infrastructura solicitantului.", "We aim at activities, not renovations: many rules exclude the applicant's own infrastructure.")],
    ["🇪🇺", L3("Granturi UE", "EU grants"), L3("Anii 2–3", "Years 2–3"), L3("Erasmus+ Youth, European Youth Together, Erasmus+ Sport, ca partener într-un consorțiu, nu ca lider.", "Erasmus+ Youth, European Youth Together, Erasmus+ Sport, as a partner in a consortium, not as lead.")],
    ["🎓", L3("Venituri accesorii", "Ancillary income"), L3("Anul 2", "Year 2"), L3("Ateliere și dosare PDF pentru școli și ONG-uri. Mici, în limitele legii.", "Workshops and PDF dossiers for schools and NGOs. Small, within the law.")]
  ];
  const risks = [
    [L3("Fondatorii au program încărcat și pot pleca din oraș", "The founders have a busy schedule and may move away"), L3("Sunt studenți în anul I și, după facultate, pot ajunge în alt oraș. De aceea fiecare formează un succesor din primul an, mandatele sunt de 2 ani, iar un manual intern predă în scris procedurile, conturile și accesul.", "They are first-year university students and may end up in another city after graduating. So each trains a successor from year one, terms are 2 years, and an internal handbook hands over procedures, accounts and access in writing.")],
    [L3("Costul platformei crește", "Platform costs rise"), L3("Datele sunt deschise și exportabile (CC BY 4.0), avem alertă la 70% din cota gratuită și o rezervă pentru planurile plătite.", "The data is open and exportable (CC BY 4.0), we get an alert at 70% of the free quota and keep a reserve for paid plans.")],
    [L3("Date personale și minori", "Personal data and minors"), L3("Ne angajăm la consimțământ explicit, ștergere la cerere și fețe și plăcuțe estompate în fotografii.", "We commit to explicit consent, deletion on request, and blurred faces and plates in photos.")],
    [L3("Acuzații de partizanat", "Accusations of partisanship"), L3("Clauză „apolitică” în statut, același ton față de orice administrație și fiecare cifră cu sursă.", "An “apolitical” clause in the statute, the same tone toward any administration, and every figure sourced.")],
    [L3("Erori ale AI-ului", "AI errors"), L3("Scorul AI e etichetat „estimare” și devine „verificat” doar după confirmarea comunității.", "The AI score is labelled “estimate” and becomes “verified” only after community confirmation.")],
    [L3("O singură sursă de bani", "A single source of money"), L3("Regula de 40% și raport anual public.", "The 40% rule and a public annual report.")]
  ];
  const journal = [
    [L3("ziua", "day"), L3("Platformă adaptată pentru telefon: marginile sigure ale ecranului, hover doar unde există mouse, câmpuri de 16 px, bara de stare a browserului", "Platform made phone-ready: screen safe areas, hover only where a mouse exists, 16 px inputs, browser status-bar colour")],
    [L3("ziua", "day"), L3("Cardul investițiilor CSM testat cu date extreme (nume lungi, zero, cifre mari) și reparat", "The CSM investments card stress-tested with extreme data (long names, zero, huge numbers) and fixed")],
    [L3("ziua", "day"), L3("Meniul de sus corectat la zoom 200%: nu mai depășește pagina nici cu contul deschis", "Top menu fixed at 200% zoom: it no longer overflows the page, even when signed in")],
    ["16:35", L3("Versiunea cu răspunsurile oficiale (Legea 544/2001) și pachetul de animații integrată în site", "The version with the official replies (Law 544/2001) and the animation pack merged into the site")],
    ["21:27", L3("Fila „Asociația” în Despre, cu statut „în constituire”; numele corectat: Drăgan Gabriel", "“Association” tab in About, marked “being established”; name corrected: Drăgan Gabriel")],
    ["21:32", L3("Încercare: Sigiliul G2P, lanț de hash pentru semnături", "Attempt: the G2P Seal, a hash chain for signatures")],
    ["21:48", L3("Sigiliul retras, la cererea lui Cîmpan Teodor", "The Seal withdrawn, at Cîmpan Teodor's request")],
    ["21:53", L3("Prima pagină: titlul asociației și mesajul „Din gri, în joc.”", "Home page: the association's name and the message “From grey, to play.”")],
    ["22:27", L3("Pagină proprie Asociația, buton Raportează, rolurile fondatorilor", "A page of its own for the Association, a Report button, the founders' roles")],
    ["23:04", L3("Linii fade, hero 3D cu scroll pe telefon, fișa terenului stil Instagram", "Faded lines, 3D hero that scrolls on phones, an Instagram-style court sheet")],
    ["23:24", L3("Pașii legali, proiect de statut, scara de venituri, riscuri", "Legal steps, draft statute, income ladder, risks")],
    ["23:30", L3("Formularul 230: calculator pentru 3,5% din impozit și statusul cinstit", "Form 230: a 3.5% income-tax calculator and the honest status")],
    ["23:39", L3("Metadate corectate, text de contact, bara fișei de teren, pastila „în constituire” portocalie cu rotițe", "Corrected metadata, contact text, court-sheet bar, orange “being established” pill with gears")],
    ["23:51", L3("Banda de activitate arată fiecare tip de acțiune; ambele rotițe se rotesc", "The activity band shows every kind of action; both gears turn")]
  ];
  const stIc = { done: "✓", doing: "●", next: "○" };
  const stTx = { done: L3("făcut", "done"), doing: L3("în lucru", "in progress"), next: L3("urmează", "next") };
  const stCol = { done: "var(--green)", doing: "var(--coral)", next: "var(--textSec)" };
  const rule = (ic, k, v, note) => React.createElement("div", { className: "fund-row" },
    React.createElement("span", { className: "fund-ic", "aria-hidden": "true" }, ic),
    React.createElement("div", null, React.createElement("div", { className: "fund-k" }, k), note && React.createElement("div", { className: "fund-note" }, note)),
    React.createElement("div", { className: "fund-v" }, v));
  return React.createElement("div", null,
    React.createElement("div", { className: "card", style: { borderLeft: "6px solid var(--coral)" } },
      React.createElement("span", { className: "badge badge-coral" }, L3("În constituire", "Being established")),
      React.createElement("h3", { className: "mt-1" }, "🏛️ " + L3("Asociația From Grey to Play", "The From Grey to Play Association")),
      React.createElement("p", null, L3(
        "Platforma a pornit de la un teren cu coșul îndoit. Acum o ducem mai departe ca asociație, ca terenurile să fie urmărite pe termen lung și să nu depindă de trei oameni.",
        "The platform started from a court with a bent hoop. We are now taking it forward as an association, so courts are tracked for the long term and do not depend on three people.")),
      React.createElement("p", { className: "text-sm", style: { color: "var(--textSec)" } }, L3(
        "Ce nu spunem: nu suntem încă o persoană juridică înregistrată și nu avem cont bancar. Spunem ce e gata și ce urmează.",
        "What we do not say: we are not yet a registered legal entity and we have no bank account. We say what is done and what comes next."))),
    React.createElement("div", { className: "mt-3" }, React.createElement(Redirect35Card, null)),
    React.createElement("h3", { className: "mt-3 mb-1" }, "👥 " + L3("Fondatori", "Founders")),
    React.createElement("div", { className: "about-team-grid" }, founders.map((m, idx) => React.createElement("div", { key: idx, className: "about-member", style: { "--mc": m.color } },
      React.createElement("div", { className: "about-avatar" }, m.i),
      React.createElement("strong", null, m.name),
      React.createElement("span", null, m.role)))),
    React.createElement("p", { className: "text-xs mt-1", style: { color: "var(--textSec)" } }, L3("Fondatorii sunt cei trei membri majori. Ceilalți tineri din echipă rămân voluntari.", "The founders are the three adult members. The other young people on the team stay volunteers.")),
    React.createElement("h3", { className: "mt-3 mb-1" }, "🧭 " + L3("Unde suntem", "Where we are")),
    React.createElement("ol", { className: "assoc-steps", style: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: ".6rem" } }, steps.map((s, i) => React.createElement("li", { key: i, className: "card", style: { display: "flex", gap: ".8rem", alignItems: "flex-start", padding: ".8rem 1rem" } },
      React.createElement("span", { "aria-hidden": "true", style: { color: stCol[s.st], fontWeight: 700, fontSize: "1.2rem", lineHeight: 1.2, minWidth: "1.4rem" } }, stIc[s.st]),
      React.createElement("div", null,
        React.createElement("strong", null, s.h),
        React.createElement("span", { className: "text-xs", style: { color: stCol[s.st], marginLeft: ".5rem" } }, stTx[s.st]),
        React.createElement("div", { className: "text-sm", style: { color: "var(--textSec)" } }, s.p))))),
    React.createElement("div", { className: "card fund-transp mt-3" },
      React.createElement("h3", { className: "mb-1" }, "♻️ " + L3("Cum rămâne asociația în picioare", "How the association stays afloat")),
      rule("💻", L3("Cost de funcționare", "Running cost"), "≈ 0 lei", L3("Găzduire gratuită, bază de date pe plan gratuit, muncă voluntară.", "Free hosting, database on a free plan, volunteer work.")),
      rule("⚖️", L3("Nicio sursă peste 40%", "No source above 40%"), L3("regula noastră", "our rule"), L3("Dacă o singură sursă ar trece de 40% din venituri, o reducem sau căutăm alta.", "If one source would pass 40% of income, we reduce it or find another.")),
      rule("🔐", L3("Bani doar prin asociație", "Money only through the association"), L3("după înregistrare", "after registration"), L3("Nu strângem bani de la nimeni până nu avem persoană juridică și cont.", "We collect no money from anyone until we have a legal entity and an account.")),
      rule("📖", L3("Rapoarte publice", "Public reports"), L3("venituri și cheltuieli", "income and spending"), L3("Publicăm fiecare leu primit și cheltuit, pe acest site, cu sursă.", "We publish every leu received and spent, on this site, with its source."))),
    React.createElement("h3", { className: "mt-3 mb-1" }, "📝 " + L3("Pregătim acum", "What we are preparing now")),
    React.createElement("ul", { className: "assoc-prep", style: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: ".35rem" } }, prep.map((x, i) => React.createElement("li", { key: i, style: { display: "flex", gap: ".6rem" } },
      React.createElement("span", { "aria-hidden": "true", style: { color: "var(--textSec)" } }, "○"), React.createElement("span", null, x)))),
    React.createElement("details", { className: "card mt-2 assoc-statute" },
      React.createElement("summary", { style: { cursor: "pointer", fontWeight: 700 } }, "📜 " + L3("Proiect de statut (se adaptează după sfatul avocatului)", "Draft statute (adapted after a lawyer's advice)")),
      React.createElement("div", { style: { marginTop: ".6rem" } }, statute.map(([k, v], i) => React.createElement("div", { key: i, className: i < statute.length - 1 ? "fade-b" : undefined, style: { padding: ".5rem 0" } },
        React.createElement("strong", null, k + ". "), React.createElement("span", { className: "text-sm", style: { color: "var(--textSec)" } }, v))))),
    React.createElement("h3", { className: "mt-3 mb-1" }, "💶 " + L3("Cum devine sustenabilă", "How it becomes sustainable")),
    React.createElement("p", { className: "text-sm", style: { color: "var(--textSec)", marginTop: 0 } }, L3(
      "Asociația nu renovează terenuri cu banii ei. Documentează, cere, urmărește și face intervenții mici (vopsea, mural, coșuri) cu acordul Primăriei. Renovarea rămâne pe bugetul public, iar noi o facem imposibil de ignorat.",
      "The association does not renovate courts with its own money. It documents, asks, follows up and makes small interventions (paint, mural, hoops) with the city's consent. Renovation stays on the public budget, and we make it impossible to ignore.")),
    React.createElement("div", { className: "card" }, ladder.map(([ic, k, v, note], i) => React.createElement("div", { key: i, className: "fund-row" },
      React.createElement("span", { className: "fund-ic", "aria-hidden": "true" }, ic),
      React.createElement("div", null, React.createElement("div", { className: "fund-k" }, k), React.createElement("div", { className: "fund-note" }, note)),
      React.createElement("div", { className: "fund-v" }, v)))),
    React.createElement("p", { className: "text-xs mt-1", style: { color: "var(--textSec)" } }, L3("Nu promitem sume și nu avem încă bani. Este un plan pe trei ani, nu un angajament. Publicăm cifre doar când avem o sursă.", "We promise no amounts and do not hold any money yet. This is a three-year plan, not a commitment. We publish figures only when we have a source.")),
    React.createElement("h3", { className: "mt-3 mb-1" }, "🛡️ " + L3("Riscuri și cum le acoperim", "Risks and how we cover them")),
    React.createElement("div", { className: "card" }, risks.map(([k, v], i) => React.createElement("div", { key: i, className: i < risks.length - 1 ? "fade-b" : undefined, style: { padding: ".55rem 0" } },
      React.createElement("strong", null, k), React.createElement("div", { className: "text-sm", style: { color: "var(--textSec)" } }, v)))),
    React.createElement("h3", { className: "mt-3 mb-1" }, "🕒 " + L3("Jurnal de progres, 6 noiembrie", "Progress log, 6 November")),
    React.createElement("div", { className: "card" }, journal.map(([h, x], i) => React.createElement("div", { key: i, className: i < journal.length - 1 ? "fade-b" : undefined, style: { display: "flex", gap: ".75rem", padding: ".45rem 0" } },
      React.createElement("span", { style: { fontFamily: "'Space Mono',monospace", color: "var(--green)", flex: "none", width: "3.2rem" } }, h),
      React.createElement("span", { className: "text-sm" }, x)))),
    React.createElement("p", { className: "text-xs mt-1", style: { color: "var(--textSec)" } }, L3("Orele sunt cele ale commit-urilor din istoricul proiectului, nu estimări. La rândurile „ziua” istoricul nu păstrează ora exactă.", "The times are those of the commits in the project history, not estimates. For “day” rows the history keeps no exact hour.")),
    React.createElement("div", { className: "flex gap-2 mt-2", style: { flexWrap: "wrap" } },
      React.createElement("button", { className: "btn btn-green", onClick: onFunding }, "🤝 " + L3("Parteneriate și finanțare", "Partnerships and funding")),
      React.createElement("button", { className: "btn", onClick: () => { setPage("petition"); window.scrollTo(0, 0); } }, "✍️ " + L3("Semnează petiția", "Sign the petition")),
      React.createElement("a", { className: "btn btn-ghost", href: "mailto:" + G2P_EMAIL }, "✉️ " + L3("Scrie-ne", "Write to us"))));
}
