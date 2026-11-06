# Progres sesiunea B — „Coaja mobilă” (branch claude/astra-shell)

## P0 (PR #1)
- `#raporteaza`: onboarding-ul nu apare și nu scrie `g2p_ob` (App, `useState` inițial).
- `isPhone()` = `matchMedia("(max-width:600px), (pointer:coarse)")`.
- Pe telefon: `HeroLite` (static, minge SVG, fără three.js, fără particule) în loc de `Hero3D`;
  `Mascot` (3D, încărca și ea three.js) nu se mai montează; aurora ascunsă; ticker-ul nu mai
  rulează, rândul duplicat e ascuns, se glisează cu degetul. Verificat: 0 cereri three.js pe iPhone 13 / Pixel 5.
- String nou `heroLiteSub` (ro/en/hu, HU de revizuit).
- CSS: bloc „Astra mobile shell” la finalul `<style>`. `sw.js` → `g2p-v12`.
