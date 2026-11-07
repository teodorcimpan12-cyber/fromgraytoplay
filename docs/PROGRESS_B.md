# Progres sesiunea B — „Coaja mobilă” (branch claude/astra-shell)

## P0 (PR #1)
- `#raporteaza`: onboarding-ul nu apare și nu scrie `g2p_ob` (App, `useState` inițial).
- `isPhone()` = `matchMedia("(max-width:600px), (pointer:coarse)")`.
- Pe telefon: `HeroLite` (static, minge SVG, fără three.js, fără particule) în loc de `Hero3D`;
  `Mascot` (3D, încărca și ea three.js) nu se mai montează; aurora ascunsă; ticker-ul nu mai
  rulează, rândul duplicat e ascuns, se glisează cu degetul. Verificat: 0 cereri three.js pe iPhone 13 / Pixel 5.
- String nou `heroLiteSub` (ro/en/hu, HU de revizuit).
- CSS: bloc „Astra mobile shell” la finalul `<style>`. `sw.js` → `g2p-v12`.

## P1 (PR #2)
- `HeroLite`: buton mare „Raportează o problemă” (`t.reportProblem`, ro/en/hu) → `location.hash = "raporteaza"`,
  vizibil fără scroll la 375 px. Cât timp e pe ecran, `.fab` e ascuns (`body.hl-cta-vis`, IntersectionObserver).
- Hamburger: `aria-label` + `aria-expanded`, țintă 44×44.
- Scutul admin (navbar + meniul mobil) se arată doar pentru `isAdmin`.
- Contrast: paragraful din hero `#9CA3AF` → `#C7CBD1`; „From Grey” din HeroLite la fel.

## Fix 1 (după feedback Teo)
- Lupă (căutare / ⌘K) vizibilă pe telefon, în stânga hamburgerului, 44×44 (`.nav-cmd-m`, ≤1240px).
- Popup-uri care „săreau” la scroll: scriptul drag-to-dismiss lua swipe-ul în sus când derula
  overlay-ul sau un element interior, nu `.modal` → preventDefault + rubber-band. Acum doar tragerea în
  jos de sus de tot mută foaia; `scrolledAncestor` verifică și overlay-ul. Pagina din spate nu mai
  derulează cât e deschis un popup (`body:has(.modal-overlay)`), scroll-ul se oprește ferm la margini.
- Merge cu live (PR #34 al sesiunii A): păstrat `ReportHashListener` + `!isPhone() && Mascot`.

## Fix 2
- `relTime`: timestamp-urile ISO (sesizări vechi) dădeau „acum 20763 zile” (Number(ISO)=NaN→1970). Acum parsează ISO, secunde și ms; necunoscut → gol.
