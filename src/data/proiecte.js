export const PROIECTE = [
  {
    id: "p1", icon: "✅", status: "done",
    name: { ro: "Parcul Tudor Vladimirescu", en: "Tudor Vladimirescu Park", hu: "Tudor Vladimirescu park" },
    address: { ro: "cartierul Tudor Vladimirescu", en: "Tudor Vladimirescu neighbourhood", hu: "Tudor Vladimirescu negyed" },
    amount: "14.500.000 lei",
    funding: { ro: "Fonduri UE — POR 2014-2020 Axa 4 (ADR Centru) + buget local", en: "EU funds — POR 2014-2020 Axis 4 (ADR Centru) + local budget", hu: "EU-alap — POR 2014-2020 4. tengely (ADR Centru) + helyi keret" },
    year: "2023",
    desc: { ro: "Parc complet cu terenuri sport, pistă alergare, zone fitness. Demonstrează că Târgu Mureș poate accesa fonduri europene pentru sport de cartier.", en: "Full park with sport courts, running track, fitness zones. Proves TGM can access EU funds for neighbourhood sport.", hu: "Teljes park: sportpályák, futópálya, fitneszterületek. Bizonyítja, hogy TGM EU-forrásokhoz tud hozzáférni." },
    note: { ro: "Același tip de finanțare (POR) funcționează și pentru terenuri autonome de cartier.", en: "The same type of funding (POR) works for standalone neighbourhood courts.", hu: "Ugyanez a finanszírozási forma (POR) önálló kerületi pályákra is működik." },
    noteColor: "var(--teal)"
  },
  {
    id: "p2", icon: "🔨", status: "approved",
    name: { ro: "Teren Multisport Str. Plopilor", en: "Plopilor St Multisport Court", hu: "Plopilor u. többcélú pálya" },
    address: { ro: "cartierul Unirii, Târgu Mureș", en: "Unirii neighbourhood, Târgu Mureș", hu: "Unirii negyed, Marosvásárhely" },
    amount: "80.000 lei",
    funding: { ro: "Buget local TGM — HCL ian. 2025, propus de consilierii Mașca + Veress (POL)", en: "TGM local budget — HCL Jan 2025, proposed by councillors Mașca + Veress (POL)", hu: "TGM helyi keret — HCL 2025 jan., Mașca + Veress tanácsosok (POL)" },
    year: "2025",
    desc: { ro: "Teren multisport (baschet, fotbal, volei), cartierul Unirii. Aprobat prin Hotărâre a Consiliului Local în ianuarie 2025 — cel mai recent precedent direct.", en: "Multisport court (basketball, football, volleyball), Unirii neighbourhood. Approved by City Council in January 2025 — the most recent direct precedent.", hu: "Többcélú pálya (kosárlabda, foci, röplabda), Unirii negyed. 2025 januárban hagyta jóvá a képviselő-testület." },
    note: { ro: "PRECEDENT CHEIE: cerem aceeași abordare pentru celelalte 4 cartiere periferice. Consilierii Mașca + Veress sunt aliați naturali.", en: "KEY PRECEDENT: we ask for the same approach for the other 4 peripheral neighbourhoods. Councillors Mașca + Veress are natural allies.", hu: "KULCSPRECEDENS: ugyanezt kérjük a másik 4 peremkerületben. Mașca + Veress tanácsosok természetes szövetségesek." },
    noteColor: "var(--green)"
  },
  {
    id: "p3", icon: "🏗️", status: "inProgress",
    name: { ro: "Sală Polivalentă TGM (fost Patinoar)", en: "TGM Multipurpose Arena (ex-Ice Rink)", hu: "TGM Multifunkcionális csarnok (egykori jégpálya)" },
    address: { ro: "centrul orașului, Târgu Mureș", en: "city center, Târgu Mureș", hu: "városközpont, Marosvásárhely" },
    amount: "55.000.000 lei",
    funding: { ro: "CNI — Compania Națională de Investiții (finanțare națională, fără UE)", en: "CNI — National Investment Company (national funding, no EU)", hu: "CNI — Nemzeti Beruházási Társaság (nemzeti alap, EU nélkül)" },
    year: "2025–2027",
    desc: { ro: "Fostul patinoar transformat în sală polivalentă 3.000+ locuri. Investiție majoră în centru, în timp ce cartierele periferice nu au terenuri funcționale.", en: "Former ice rink converted to 3000+ seat multipurpose arena. Major central investment while peripheral neighbourhoods lack functional courts.", hu: "Az egykori jégpálya 3000+ személyes multifunkcionális csarnokká alakul, miközben a peremkerületek pályái leromlottak." },
    note: { ro: "Context: 55.000.000 lei pentru o sală centrală vs 80.000 lei pentru terenuri de cartier — disparitate de 687×.", en: "Context: 55,000,000 lei for a central arena vs 80,000 lei for neighbourhood courts — 687× disparity.", hu: "Kontextus: 55 000 000 lej egy központi csarnoknak vs 80 000 lej kerületi pályáknak — 687-szeres különbség." },
    noteColor: "var(--coral)"
  },
  {
    id: "p4", icon: "🌟", status: "model",
    name: { ro: "Baza Sport \u201ELa Terenuri\u201D — Cluj-Napoca, Mănăștur", en: "\u201CLa Terenuri\u201D Sport Base — Cluj-Napoca, Mănăștur", hu: "\u201ELa Terenuri\u201D sportbázis — Kolozsvár, Mănăștur" },
    address: { ro: "cartier muncitoresc de periferie — similar cu Tudor Vladimirescu", en: "working-class peripheral neighbourhood — similar to Tudor Vladimirescu", hu: "munkásnegyed — hasonló a Tudor Vladimirescu-hoz" },
    amount: "26.500.000 lei",
    funding: { ro: "Buget local Cluj-Napoca, după ani de presiune civică pe Declic.ro", en: "Cluj-Napoca local budget, after years of civic pressure on Declic.ro", hu: "Kolozsvár helyi keret, több éves polgári nyomást követően" },
    year: "2024",
    desc: { ro: "Terenuri exterioare (tenis, baschet, fotbal, 3×3, volei, badminton), pistă alergare, skate park, zone fitness. Acces gratuit. Utilizare 100% în weekend.", en: "Outdoor courts (tennis, basketball, football, 3×3, volleyball, badminton), running track, skate park, fitness zones. Free access. 100% used on weekends.", hu: "Kültéri pályák (tenisz, kosár, foci, 3×3, röplabda, tollaslabda), futópálya, gördeszkás park, fitnesszterület. Ingyenes. Hétvégén telt ház." },
    note: { ro: "Model direct aplicabil: petiție civică online → presă locală → alocare bugetară municipală. 5 terenuri TGM ar costa ~5% din investiția Cluj.", en: "Directly applicable model: online civic petition → local press → municipal budget allocation. 5 TGM courts would cost ~5% of the Cluj investment.", hu: "Közvetlenül alkalmazható modell: online petíció → sajtó → önkormányzati forrás. 5 TGM pálya ~5%-a lenne a kolozsvári beruházásnak." },
    noteColor: "var(--green)"
  }
];
