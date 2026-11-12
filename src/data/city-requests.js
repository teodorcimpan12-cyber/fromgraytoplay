/* === Official requests to City Hall (Law 544/2001), shown in public with their registration numbers.
   The law gives 10 days from registration to answer (or to announce an extension to at most 30 days).
   When an answer arrives: set `answeredAt`, and add what it says to SOURCES as a new source. === */
export const CITY_REQUESTS = [
  { city: "tgm", to: "Primăria Târgu Mureș", regNo: "51941", reg: "2026-10-26", answeredAt: null,
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
