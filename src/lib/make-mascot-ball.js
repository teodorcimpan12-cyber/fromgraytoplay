// One textured ball with eyes and a mouth. Shared by the corner mascot and the celebration.
export function makeMascotBall(THREE, r) {
  const cv = document.createElement("canvas"); cv.width = 512; cv.height = 256;
  const g = cv.getContext("2d");
  // gold = the reward for finding every secret.
  const paint = gold => {
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, gold ? "#FFE58A" : "#F58A2E"); grd.addColorStop(1, gold ? "#D9A400" : "#D9621A");
    g.fillStyle = grd; g.fillRect(0, 0, 512, 256);
    g.fillStyle = gold ? "rgba(255,255,255,.22)" : "rgba(120,40,0,.18)";
    for (let i = 0; i < 2600; i++) g.fillRect(Math.random() * 512, Math.random() * 256, 1.4, 1.4);
    g.strokeStyle = gold ? "#6B4A00" : "#1b1209"; g.lineWidth = 6; g.lineCap = "round";
    const line = (pts) => { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); };
    line([[0, 128], [512, 128]]);
    line([[128, 0], [128, 256]]); line([[384, 0], [384, 256]]);
    [0, 256, 512].forEach(s => [1, -1].forEach(k => { const p = []; for (let y = 0; y <= 256; y += 8) p.push([s + k * 70 * Math.sin(Math.PI * y / 256), y]); line(p); }));
  };
  paint(false);
  const tex = new THREE.CanvasTexture(cv);
  const root = new THREE.Group(), body = new THREE.Group();
  root.add(body);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 28), new THREE.MeshStandardMaterial({ map: tex, roughness: .62, metalness: .02 }));
  ball.rotation.y = -Math.PI / 2;
  body.add(ball);
  const face = new THREE.Group(); body.add(face);
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .3 });
  const black = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const eyes = [], pupils = [];
  [-1, 1].forEach(s => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(r * .21, 20, 14), white);
    e.position.set(s * r * .34, r * .22, r * .9); e.scale.z = .55;
    const p = new THREE.Mesh(new THREE.SphereGeometry(r * .1, 14, 10), black);
    p.position.set(0, 0, r * .16); e.add(p);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(r * .035, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    shine.position.set(r * .04, r * .05, r * .09); p.add(shine);
    face.add(e); eyes.push(e); pupils.push(p);
  });
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(r * .2, r * .035, 8, 24, Math.PI), black);
  mouth.position.set(0, -r * .12, r * .97); mouth.rotation.z = Math.PI;
  face.add(mouth);
  const gild = () => { paint(true); tex.needsUpdate = true; ball.material.metalness = .45; ball.material.roughness = .28; };
  return { root, body, ball, eyes, pupils, mouth, gild, dispose() { root.traverse(o => { o.geometry && o.geometry.dispose(); }); tex.dispose(); } };
}
