export interface Court {
  id: string;
  name: string;
  neighborhood: string;
  /** 0 = ruined, 1 = pristine. Seeded from field observation. */
  condition: number;
  lat: number;
  lng: number;
  /** Short note shown on the detail page. */
  note: { ro: string; en: string; hu: string };
  /** Which side of the inequality this court sits on. */
  side: 'central' | 'peripheral';
}

/** Approximate coords for Târgu Mureș courts referenced in the brief.
 *  Refine in the field — these are starting positions for the map. */
export const COURTS: Court[] = [
  {
    id: 'cornesti',
    name: 'Platoul Cornești',
    neighborhood: 'Cornești',
    condition: 0.85,
    lat: 46.5598,
    lng: 24.5732,
    side: 'central',
    note: {
      ro: 'Spațiu sportiv întreținut pe platou. Punctul de referință al inegalității.',
      en: 'Well-kept sports space on the plateau. The reference point for the inequality.',
      hu: 'Jól karbantartott sportterület a fennsíkon. A különbség viszonyítási pontja.',
    },
  },
  {
    id: 'sportcomplex',
    name: 'Sportcomplex (Complex Național)',
    neighborhood: 'Centru',
    condition: 0.72,
    lat: 46.5494,
    lng: 24.5688,
    side: 'central',
    note: {
      ro: 'Complex central, în general bine întreținut, dar adesea închis pentru public.',
      en: 'Central complex, generally maintained but often closed to the public.',
      hu: 'Központi komplexum, általában karbantartva, de gyakran zárva a közönség elől.',
    },
  },
  {
    id: 'tudor',
    name: 'Cartier Tudor',
    neighborhood: 'Tudor Vladimirescu',
    condition: 0.22,
    lat: 46.5388,
    lng: 24.5475,
    side: 'peripheral',
    note: {
      ro: 'Terenul de baschet din Tudor. Fisuri în asfalt, panou îndoit, plasa lipsă.',
      en: 'The basketball court in Tudor. Cracked asphalt, bent backboard, missing net.',
      hu: 'Tudor kosárlabdapálya. Repedezett aszfalt, hajlott palánk, hiányzó háló.',
    },
  },
  {
    id: 'auchan',
    name: 'În spatele Auchan',
    neighborhood: 'Mureșeni',
    condition: 0.18,
    lat: 46.5219,
    lng: 24.5391,
    side: 'peripheral',
    note: {
      ro: 'Teren improvizat lângă magazin, iluminat slab, fără mentenanță.',
      en: 'Improvised court next to the store, dim lighting, no maintenance.',
      hu: 'Rögtönzött pálya a bolt mellett, gyenge világítás, gondozás nélkül.',
    },
  },
  {
    id: 'dambu',
    name: 'Dâmbu Pietros',
    neighborhood: 'Dâmbu Pietros',
    condition: 0.31,
    lat: 46.5667,
    lng: 24.5912,
    side: 'peripheral',
    note: {
      ro: 'Suprafață cu denivelări, dar comunitate activă care își dorește schimbarea.',
      en: 'Uneven surface, but an active community pushing for change.',
      hu: 'Egyenetlen felület, de aktív közösség, amely változást szeretne.',
    },
  },
  {
    id: 'unirii',
    name: 'Liceul Unirea',
    neighborhood: 'Centru',
    condition: 0.55,
    lat: 46.5471,
    lng: 24.5613,
    side: 'central',
    note: {
      ro: 'Acces limitat orelor de școală, dar funcțional.',
      en: 'Restricted to school hours, but functional.',
      hu: 'Csak iskolaidőben hozzáférhető, de használható.',
    },
  },
  {
    id: '7noiembrie',
    name: '7 Noiembrie',
    neighborhood: '7 Noiembrie',
    condition: 0.28,
    lat: 46.5512,
    lng: 24.5851,
    side: 'peripheral',
    note: {
      ro: 'Teren cu inele rupte, dar mereu copii care încearcă să joace.',
      en: 'Court with broken rims, but kids keep trying to play here.',
      hu: 'Törött karikák, de a gyerekek mindig próbálkoznak itt.',
    },
  },
  {
    id: 'aleea-savinesti',
    name: 'Aleea Săvinești',
    neighborhood: 'Aleea Săvinești',
    condition: 0.15,
    lat: 46.5301,
    lng: 24.5398,
    side: 'peripheral',
    note: {
      ro: 'Cel mai degradat teren documentat. Necesită intervenție urgentă.',
      en: 'The most degraded court documented. Needs urgent attention.',
      hu: 'A legrosszabb állapotú dokumentált pálya. Sürgős beavatkozást igényel.',
    },
  },
];

export const TGM_CENTER: [number, number] = [46.5455, 24.5586];
