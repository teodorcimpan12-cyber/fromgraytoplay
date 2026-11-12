/* Sibiu stadiums: two OSM pitches sit inside rebuilt stadiums, so they become those stadiums (status "excellent").
   sb21 = Stadionul Municipal (OSM way 1123069978), sb8 = Baza Voința / Academia Alma (OSM way 177522036). */
export const STADIUMS_SIBIU = {
  sb21: { name: "Stadionul Municipal Sibiu", address: "Aleea Mihai Eminescu (Parcul Sub Arini), Sibiu", lat: 45.78332, lng: 24.1438, category: "football",
    src: "https://www.romania-insider.com/sibiu-stadium-opening-dec-2022",
    desc: { ro: "Stadion de fotbal reconstruit, redeschis pe 10 decembrie 2022: 12.363 locuri, gazon natural, pistă de atletism nouă, nocturnă. Din august 2026, după retragerea FC Hermannstadt, aici joacă Inter Sibiu (Liga 3).",
      en: "Rebuilt football stadium, reopened on 10 December 2022: 12,363 seats, natural grass, new athletics track, floodlights. Since August 2026, after FC Hermannstadt withdrew, Inter Sibiu (Liga 3) plays here.",
      hu: "Újjáépített labdarúgó-stadion, 2022. december 10-én nyílt meg: 12 363 ülőhely, természetes gyep, új atlétikapálya, világítás. 2026 augusztusától, az FC Hermannstadt visszalépése után itt játszik az Inter Sibiu (Liga 3)." } }, // TODO: HU review
  sb8: { name: "Baza Sportivă Voința (Academia Alma)", address: "Strada Poet Vasile Cârlova, Sibiu", lat: 45.79125, lng: 24.13266, category: "football",
    src: "https://www.oradesibiu.ro/2025/07/11/ai-vazut-noul-stadion-din-sibiu-arena-de-sapte-sute-mii-de-euro-aproape-terminata-si-arata-superb-video-foto/",
    desc: { ro: "Bază modernizată în 2024–2025 (peste 1 milion de euro): gazon sintetic nou, nocturnă, vestiare, teren omologabil Liga 3. Se poate închiria seara, după ora 21.",
      en: "Base modernised in 2024–2025 (over 1 million euro): new synthetic turf, floodlights, changing rooms, a pitch fit for Liga 3. Can be rented in the evening, after 9 pm.",
      hu: "2024–2025-ben korszerűsített bázis (több mint 1 millió euró): új műfű, világítás, öltözők, Liga 3-ra alkalmas pálya. Este 21 óra után bérelhető." } } // TODO: HU review
};
