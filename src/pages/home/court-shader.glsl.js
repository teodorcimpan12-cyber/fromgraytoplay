/* === Home opener: association name + message + three equal buttons, then one line of why. Honest status: being established. === */
/* === Opener court (Nov 2026): one hand-written WebGL fragment shader, no library. A ray is cast per pixel onto the
   ground plane; the court is drawn twice in the shader (cracked grey asphalt / freshly painted) and blended by a paint
   mask. The mask is a small 2D canvas: the bouncing ball and the visitor's pointer stamp paint into it, and it slowly
   decays, so the grey creeps back unless someone keeps playing. Static single frame under reduced motion / no-fx. === */
export const COURT_FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uT, uTan;
uniform vec3 uRo, uR, uU, uF, uBall;
uniform sampler2D uMask;
const vec2 HALF = vec2(14., 7.5);
const vec2 FIELD = vec2(17., 10.5);
const vec3 L = vec3(.5015, .6218, -.6017);
const vec3 SUN = vec3(1.3, 1.16, .98);
const vec3 AMB = vec3(.3, .36, .48);
float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h21(i), h21(i + vec2(1., 0.)), f.x), mix(h21(i + vec2(0., 1.)), h21(i + vec2(1., 1.)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 4; i++) { s += a * vn(p); p = p * 2.03 + 17.; a *= .5; } return s; }
float crack(vec2 p){ vec2 i = floor(p), f = fract(p); float d1 = 8., d2 = 8.;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y)); vec2 o = vec2(h21(i + g), h21(i + g + 7.7));
    float d = length(g + o - f); if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
  return d2 - d1; }
float sdBox(vec2 p, vec2 b){ vec2 d = abs(p) - b; return length(max(d, 0.)) + min(max(d.x, d.y), 0.); }
float sdSeg(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0., 1.)); }
float lines(vec2 q){
  float d = abs(sdBox(q, HALF));
  d = min(d, max(abs(q.x), abs(q.y) - HALF.y));
  d = min(d, abs(length(q) - 1.8));
  vec2 a = vec2(abs(q.x), q.y);
  d = min(d, abs(sdBox(a - vec2(HALF.x - 2.9, 0.), vec2(2.9, 2.45))));
  d = min(d, max(abs(length(a - vec2(HALF.x - 5.8, 0.)) - 1.8), a.x - (HALF.x - 5.8)));
  vec2 b = a - vec2(HALF.x - 1.575, 0.);
  d = min(d, max(abs(length(b) - 6.75), b.x + 1.416));
  d = min(d, max(abs(abs(a.y) - 6.6), max(b.x - 1.575, -1.416 - b.x)));
  return d; }
float paintAt(vec2 q){
  vec2 muv = q / FIELD * .5 + .5;
  float m = texture2D(uMask, muv).r * step(abs(muv.x - .5), .5) * step(abs(muv.y - .5), .5);
  float pm = smoothstep(.36, .5, m + (fbm(q * 1.3 + 3.) - .5) * .4);
  return max(pm, smoothstep(.84, .9, vn(q * 3.7 + 11.)) * smoothstep(.25, .33, m)); }
vec3 sky(vec3 d){ return mix(vec3(.05, .07, .12), vec3(.3, .46, .62), pow(max(d.y, 0.), .45)) + SUN * pow(max(dot(d, L), 0.), 90.) * 1.5; }
float capI(vec3 ro, vec3 rd, vec3 pa, vec3 pb, float r){
  vec3 ba = pb - pa, oa = ro - pa; float baba = dot(ba, ba), bard = dot(ba, rd), baoa = dot(ba, oa), rdoa = dot(rd, oa), oaoa = dot(oa, oa);
  float a = baba - bard * bard, b = baba * rdoa - baoa * bard, c = baba * oaoa - baoa * baoa - r * r * baba, h = b * b - a * c;
  if (h >= 0.) { float t = (-b - sqrt(h)) / a; float y = baoa + t * bard; if (y > 0. && y < baba) return t;
    vec3 oc = y <= 0. ? oa : ro - pb; b = dot(rd, oc); c = dot(oc, oc) - r * r; h = b * b - c; if (h > 0.) return -b - sqrt(h); }
  return -1.; }
vec3 capN(vec3 p, vec3 a, vec3 b){ vec3 ba = b - a; return normalize(p - a - ba * clamp(dot(p - a, ba) / dot(ba, ba), 0., 1.)); }
// Shadow cast on a ground point by the two hoops and the ball (analytic, soft edges).
float shadow(vec3 P){
  float s = 0.;
  vec2 g = P.xz, lo = L.xz / L.y;
  for (int i = 0; i < 2; i++) { float sx = i == 0 ? 1. : -1.;
    float t = (sx * 12.8 - P.x) / L.x;
    if (t > 0.) { vec3 hp = P + L * t; s = max(s, smoothstep(.12, 0., max(abs(hp.y - 3.42) - .52, abs(hp.z) - .9))); }
    s = max(s, smoothstep(.2, .07, sdSeg(g, vec2(sx * 15.1, 0.), vec2(sx * 15.1, 0.) - lo * 3.6)));
    s = max(s, smoothstep(.16, .05, sdSeg(g, vec2(sx * 15.1, 0.) - lo * 3.4, vec2(sx * 12.8, 0.) - lo * 3.4)));
    vec3 rp = P + L * (3.05 / L.y);
    s = max(s, .8 * smoothstep(.07, .02, abs(length(rp.xz - vec2(sx * 12.4, 0.)) - .23))); }
  vec3 bc = vec3(uBall.x, uBall.z + .62, uBall.y) - P;
  float along = dot(bc, L);
  if (along > 0.) { float d = length(bc - L * along); s = max(s, smoothstep(.62 + along * .06, .62 - along * .1 - .12, d) / (1. + along * .05)); }
  return 1. - .72 * s; }
vec3 tone(vec3 x){ x = max(x, 0.); return pow(clamp((x * (2.51 * x + .03)) / (x * (2.43 * x + .59) + .14), 0., 1.), vec3(.4545)); }
void main(){
  vec2 p = (gl_FragCoord.xy * 2. - uRes) / uRes.y;
  vec3 rd = normalize(uR * p.x * uTan + uU * p.y * uTan + uF);
  vec3 col = vec3(0.); float al = 0., tHit = 1e5;
  if (rd.y < -.001) {
    float t = -uRo.y / rd.y; vec3 P = uRo + rd * t; vec2 q = P.xz;
    float px = t * uTan * 2. / uRes.y, aa = px * 1.2 / max(-rd.y, .2);
    float sd = sdBox(q, HALF);
    float pm = paintAt(q);
    float gr = fbm(q * 2.7), st = fbm(q * .45 + 9.);
    float ln = smoothstep(.055 + aa, .055 - aa * .3, lines(q)) * step(sd, .12);
    // micro relief, shared by both surfaces
    vec2 e = vec2(.05, 0.);
    float b0 = vn(q * 7.) + .5 * vn(q * 15.);
    vec2 gradb = vec2(vn((q + e) * 7.) + .5 * vn((q + e) * 15.) - b0, vn((q + e.yx) * 7.) + .5 * vn((q + e.yx) * 15.) - b0) / e.x;
    // grey: worn asphalt, cracks, puddles, weeds, faded lines
    float ck = crack(q * .55 + fbm(q * .8) * .6);
    float cw = smoothstep(.075 + aa * .4, 0., ck) * smoothstep(.28, .55, st);
    float pud = smoothstep(.58, .66, fbm(q * .33 + 21.)) * (1. - cw);
    vec3 gAlb = vec3(.052, .055, .062) * (.6 + .9 * gr) * (.7 + .6 * st);
    gAlb = mix(gAlb, vec3(.3, .3, .28), ln * .55 * smoothstep(.3, .62, fbm(q * 1.7 + 5.)));
    gAlb = mix(gAlb, vec3(.02, .06, .018), smoothstep(.8, .92, vn(q * 6.)) * smoothstep(.5, .7, st) * .7);
    gAlb *= 1. - .85 * cw;
    gAlb = mix(gAlb, vec3(.012, .014, .018), pud * .8);
    // play: fresh acrylic, brand colours, crisp lines
    vec2 a = vec2(abs(q.x), q.y); vec2 bb = a - vec2(HALF.x - 1.575, 0.);
    float in3 = bb.x <= -1.416 ? smoothstep(aa, -aa, length(bb) - 6.75) : smoothstep(aa, -aa, abs(a.y) - 6.6);
    float key = smoothstep(aa, -aa, sdBox(a - vec2(HALF.x - 2.9, 0.), vec2(2.9, 2.45)));
    vec3 pAlb = mix(vec3(.004, .2, .2), vec3(.006, .42, .2), in3);
    pAlb = mix(pAlb, vec3(.72, .115, .008), max(key, smoothstep(aa, -aa, length(q) - 1.8)));
    pAlb = mix(vec3(.004, .07, .075), pAlb, smoothstep(aa, -aa, sd));
    pAlb *= .93 + .14 * gr;
    pAlb = mix(pAlb, vec3(.92), ln);
    vec3 alb = mix(gAlb, pAlb, pm);
    float bump = mix(mix(.3, .0, pud), .05, pm);
    vec3 n = normalize(vec3(-gradb.x * bump, 1., -gradb.y * bump));
    float sh = shadow(P);
    float dif = max(dot(n, L), 0.);
    vec3 rf = reflect(rd, n);
    float fr = pow(1. - max(dot(-rd, n), 0.), 5.);
    float gloss = mix(mix(.04, .45, pud), .2, pm);
    col = alb * (AMB + SUN * dif * sh);
    col += sky(rf) * (gloss * (.25 + .75 * fr)) * mix(1., sh, .6);
    col += SUN * pow(max(dot(rf, L), 0.), mix(24., 90., pm)) * (.1 + .5 * pm + .8 * pud) * sh;
    // wet paint edge: a thin darker lip and a soft mint bloom
    float edge = pm * (1. - pm) * 4.;
    col = col * (1. - .3 * edge) + vec3(.1, .55, .38) * edge * .35;
    al = 1. - smoothstep(0., 5., sdBox(q, FIELD - 1.));
    col = mix(vec3(.004, .006, .012), col, al);
    tHit = t;
  }
  // hoops
  for (int i = 0; i < 2; i++) { float sx = i == 0 ? 1. : -1.;
    float fresh = paintAt(vec2(sx * 11.1, 0.));
    vec3 metal = mix(vec3(.11, .075, .055), vec3(.05, .055, .065), fresh);
    vec3 pa = vec3(sx * 15.1, 0., 0.), pb = vec3(sx * 15.1, 3.6, 0.), pc = vec3(sx * 15.1, 3.4, 0.), pd = vec3(sx * 12.8, 3.4, 0.);
    float t = capI(uRo, rd, pa, pb, .09);
    if (t > 0. && t < tHit) { vec3 n = capN(uRo + rd * t, pa, pb); col = metal * (AMB + SUN * max(dot(n, L), 0.)) + SUN * pow(max(dot(reflect(rd, n), L), 0.), 30.) * .25; al = 1.; tHit = t; }
    t = capI(uRo, rd, pc, pd, .06);
    if (t > 0. && t < tHit) { vec3 n = capN(uRo + rd * t, pc, pd); col = metal * (AMB + SUN * max(dot(n, L), 0.)); al = 1.; tHit = t; }
    t = (sx * 12.8 - uRo.x) / rd.x;
    if (t > 0. && t < tHit) { vec3 hp = uRo + rd * t; vec2 bq = vec2(hp.z, hp.y - 3.42);
      float px = t * uTan * 2. / uRes.y;
      float inb = smoothstep(px, -px, sdBox(bq, vec2(.9, .52)));
      if (inb > .01) {
        vec3 bcol = mix(vec3(.22, .2, .18), vec3(.8, .82, .84), fresh) * (AMB + SUN * (.25 + .5 * abs(L.x)));
        float sq = smoothstep(.035 + px, .035, abs(sdBox(bq - vec2(0., -.14), vec2(.3, .22))));
        float brd = smoothstep(.04 + px, .04, abs(sdBox(bq, vec2(.86, .48))));
        bcol = mix(bcol, mix(vec3(.2, .09, .04), vec3(.9, .17, .01), fresh) * 1.2, max(sq, brd));
        col = mix(col, bcol, inb * .94); al = max(al, inb); tHit = mix(tHit, t, step(.5, inb)); } }
    t = (3.05 - uRo.y) / rd.y;
    if (t > 0. && t < tHit) { vec3 hp = uRo + rd * t; float px = t * uTan * 2. / uRes.y;
      float ring = smoothstep(.035 + px * 1.5, .035, abs(length(hp.xz - vec2(sx * 12.4, 0.)) - .23));
      col = mix(col, mix(vec3(.2, .08, .03), vec3(1., .22, .02), fresh) * 1.3, ring); al = max(al, ring); } }
  // ball
  vec3 bc = vec3(uBall.x, uBall.z + .62, uBall.y);
  vec3 oc = uRo - bc; float bq2 = dot(oc, rd); float h = bq2 * bq2 - (dot(oc, oc) - .3844);
  if (h > 0. && -bq2 - sqrt(h) < tHit) {
    vec3 nn = normalize(oc + rd * (-bq2 - sqrt(h)));
    float sp = uT * 2.6 + uBall.x * .8, cs = cos(sp), sn = sin(sp);
    vec3 s = vec3(nn.x * cs - nn.y * sn, nn.x * sn + nn.y * cs, nn.z);
    float peb = .92 + .16 * vn(s.xy * 38. + s.z * 21.);
    vec3 bcol = vec3(.82, .2, .025) * peb * (AMB * 1.2 + SUN * max(dot(nn, L), 0.));
    float seam = min(min(abs(s.x), abs(s.z)), abs(length(s.xy) - .72));
    bcol = mix(vec3(.012, .008, .006), bcol, smoothstep(.022, .05, seam));
    bcol += SUN * pow(max(dot(reflect(rd, nn), L), 0.), 28.) * .3;
    bcol += vec3(.3, .46, .62) * pow(1. - max(dot(-rd, nn), 0.), 3.) * .35;
    float e = smoothstep(0., .028, h);
    col = mix(col, bcol, e); al = max(al, e);
  }
  col = tone(col * 1.08) + (h21(gl_FragCoord.xy + fract(uT) * 91.) - .5) * .022;
  gl_FragColor = vec4(col * al, al);
}`;
