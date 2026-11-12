/* === Official requests to City Hall (Law 544/2001), shown in public with their registration numbers.
   The law gives 10 days from registration to answer (or to announce an extension to at most 30 days).
   When an answer arrives: set `answeredAt`, and add what it says to SOURCES as a new source. === */
export const CITY_REQUESTS = [
  { city: "tgm", to: "Primăria Târgu Mureș", regNo: "51941", reg: "2026-10-26", answeredAt: "2026-11-11", answerNo: "51941/11.11.2026",
    // City Hall reply nr. 51941/11.11.2026 (signed by the mayor and the secretary general), received by email on 12.11.2026.
    answer: {
      ro: ["Buget: compartimentul de sport gestionează doar pozițiile din cap. 67.02.05.01 Sport: premierea sportivilor, două sesiuni de concurs de proiecte sportive și acțiuni neprevăzute/parteneriate. Total pe 2026: 5.915.289 lei.",
        "Proiecte în derulare (DALI): amenajare teren de sport pe str. Busuiocului, pe str. Budai Nagy Antal și pe str. Plopilor.",
        "Proiect aprobat: studiu de fezabilitate pentru un skatepark în parcul sportiv municipal (HCL nr. 345 din 19.12.2024, singura hotărâre indicată pentru 2022–2025).",
        "În ședința de Consiliu Local din 24 septembrie, proiectele de pe str. Busuiocului și str. Budai Nagy Antal au fost amânate: consilierii au cerut reducerea costurilor.",
        "Str. Plopilor: documentația DALI este în curs.",
        "SIDU 2021–2030: infrastructura sportivă este la paginile 396–404 din strategia publicată pe site-ul primăriei."],
      en: ["Budget: the sports office only manages the lines of chapter 67.02.05.01 Sport: awards for athletes, two sessions of the sports project contest and unforeseen actions/partnerships. Total for 2026: 5,915,289 lei.",
        "Projects under way (DALI design stage): sports court on Busuiocului St., on Budai Nagy Antal St. and on Plopilor St.",
        "Approved project: feasibility study for a skatepark in the municipal sports park (Council Decision 345 of 19.12.2024, the only decision named for 2022–2025).",
        "At the Local Council meeting of 24 September the Busuiocului St. and Budai Nagy Antal St. projects were postponed: councillors asked for lower costs.",
        "Plopilor St.: the DALI documentation is in progress.",
        "SIDU 2021–2030: sports infrastructure is on pages 396–404 of the strategy published on the City Hall website."],
      hu: null }, // TODO: HU review (falls back to RO)
    asked: {
      ro: ["Bugetul detaliat pe sport și spații publice 2025 (cap. 67)", "Proiectele de investiții 2022–2025 pentru terenuri sportive", "Extrasul din SIDU 2021–2030 despre infrastructura sportivă", "Hotărârile de Consiliu Local 2022–2025 despre terenuri sportive", "Stadiul terenului multisport din str. Plopilor (HCL ian. 2025)"],
      en: ["Detailed 2025 budget for sport and public spaces (chapter 67)", "2022–2025 investment projects for sports courts", "The SIDU 2021–2030 section on sports infrastructure", "2022–2025 City Council decisions on sports courts", "Status of the multi-sport court on Plopilor St. (Jan 2025 decision)"],
      hu: ["A sport és közterek 2025-ös részletes költségvetése (67. fejezet)", "Sportpálya-beruházások 2022–2025", "A SIDU 2021–2030 sportinfrastruktúra-része", "Helyi tanácsi határozatok 2022–2025 a sportpályákról", "A Plopilor utcai multisport pálya állapota (2025. jan. határozat)"] } }, // TODO: HU review
  { city: "sibiu", to: "Primăria Sibiu", regNo: "86747", reg: "2026-10-26", answeredAt: null,
    asked: {
      ro: ["Bugetul pe sport și spații publice pentru anul curent (cap. 67)", "Lista terenurilor sportive publice administrate de municipiu și starea lor", "Proiectele de investiții din ultimii 3 ani pentru terenuri sportive"],
      en: ["This year's budget for sport and public spaces (chapter 67)", "The list of public sports courts run by the city and their condition", "Investment projects for sports courts in the last 3 years"],
      hu: ["Az idei sport- és köztér-költségvetés (67. fejezet)", "A város által kezelt közpályák listája és állapotuk", "Az elmúlt 3 év sportpálya-beruházásai"] } } // TODO: HU review
];
