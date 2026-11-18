import * as THREE from 'three';
import { CARDS } from './cards';

const rr3 = (w, h, r) => {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2, P = Math.PI;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -P / 2, 0); s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, P / 2); s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, P / 2, P);
  s.lineTo(x, y + r); s.absarc(x + r, y + r, r, P, 1.5 * P); return s;
};

function cardCanvas(name, c1, c2) {
  const c = document.createElement('canvas'); c.width = 480; c.height = 320; // landscape 3:2
  const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 480, 320);
  g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, 480, 320);
  x.fillStyle = 'rgba(0,0,0,.35)'; x.beginPath(); x.arc(330, 120, 44, 0, 7); x.fill();
  x.beginPath(); x.ellipse(330, 310, 100, 110, 0, 0, 7); x.fill();
  x.fillStyle = 'rgba(246,247,243,.9)'; x.font = '800 44px "Barlow Condensed",sans-serif'; x.fillText(name.toUpperCase(), 24, 292);
  return c;
}

/** Three.js phone + orbiting cards. Particles stay separate (see particles.js). */
export function createPhoneScene(canvas, art, images = []) {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const geos = [], mats = [], texs = [], cardMats = [];
  let camHW = 2, camHH = 1.5;
  // dot-matrix reveal: phone materialises bottom-up from a dot grid (uR 0..1)
  const uni = { uR: { value: 0 }, uY0: { value: 0.2 }, uY1: { value: 0.8 }, uRes: { value: new THREE.Vector2(1, 1) }, uPR: { value: 1 } };
  const patch = (m) => {
    m.onBeforeCompile = (s) => {
      Object.assign(s.uniforms, uni);
      s.fragmentShader = 'uniform float uR,uY0,uY1,uPR;uniform vec2 uRes;float rvK;\n' + s.fragmentShader
        .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n{float p=(gl_FragCoord.y/uRes.y-uY0)/(uY1-uY0);rvK=uR*1.6-p;if(rvK<0.0)discard;if(rvK<.28){vec2 f=fract(gl_FragCoord.xy/(7.0*uPR))-.5;if(length(f)>.36*rvK/.28)discard;}}')
        .replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(.3,.8,.7),(1.0-smoothstep(0.0,.28,rvK))*.85);');
    };
    mats.push(m); return m;
  };

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);

  // procedural studio environment for the metal frame
  const pm = new THREE.PMREMGenerator(renderer), es = new THREE.Scene();
  es.add(new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshBasicMaterial({ color: 0x1b2a26, side: THREE.BackSide })));
  [[-8, 6, 8, 6, 12, 0xffffff], [9, 2, 6, 3, 10, 0xffffff], [0, -9, 0, 14, 2, 0x4DB8A5], [0, 10, 2, 16, 3, 0xffffff]].forEach(([x, y, z, w, h, c]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(6), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m);
  });
  const envRT = pm.fromScene(es, 0.03); scene.environment = envRT.texture; pm.dispose();
  es.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
  const key = new THREE.DirectionalLight(0xfff3e0, 2.4); key.position.set(1.5, 5, 3); scene.add(key);
  const rim = new THREE.PointLight(0x4DB8A5, 25); rim.position.set(-3, 1, -2); scene.add(rim);

  // phone
  const phone = new THREE.Group();
  const frame = patch(new THREE.MeshStandardMaterial({ color: 0x9aa5a1, metalness: 1, roughness: 0.26 }));
  const body = new THREE.ExtrudeGeometry(rr3(1, 2.05, 0.17), { depth: 0.07, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 5, curveSegments: 24 });
  body.translate(0, 0, -0.035); geos.push(body); phone.add(new THREE.Mesh(body, frame));
  const bez = new THREE.ShapeGeometry(rr3(1, 2.06, 0.165), 24); geos.push(bez);
  const bm = new THREE.Mesh(bez, patch(new THREE.MeshStandardMaterial({ color: 0x050807, roughness: 0.4, metalness: 0.2 }))); bm.position.z = 0.0556; phone.add(bm);
  const sg = new THREE.ShapeGeometry(rr3(0.93, 1.98, 0.14), 24); geos.push(sg);
  const p = sg.attributes.position, uv = sg.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 0.93 + 0.5, p.getY(i) / 1.98 + 0.5);
  const tex = new THREE.CanvasTexture(art); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy(); texs.push(tex);
  const sc = new THREE.Mesh(sg, patch(new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }))); sc.position.z = 0.0562; phone.add(sc);
  [[0.515, 0.3, 0.34], [-0.515, 0.5, 0.2], [-0.515, 0.2, 0.2], [-0.515, 0.72, 0.09]].forEach(([x, y, h]) => {
    const g = new THREE.BoxGeometry(0.03, h, 0.05); geos.push(g); const m = new THREE.Mesh(g, frame); m.position.set(x, y, 0); phone.add(m);
  });
  scene.add(phone);

  // cards (landscape; plane size follows the photo's aspect when real images are supplied)
  const orbit = new THREE.Group(); scene.add(orbit);
  const unit = new THREE.PlaneGeometry(1, 1); geos.push(unit);
  CARDS.forEach(([name, c1, c2], i) => {
    const sz = [1, 0.85, 1.1, 0.9, 1][i];
    const t = new THREE.CanvasTexture(cardCanvas(name, c1, c2)); t.colorSpace = THREE.SRGBColorSpace; texs.push(t);
    const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, side: THREE.DoubleSide, toneMapped: false }); cardMats.push(m);
    const mesh = new THREE.Mesh(unit, m); mesh.userData = { w: 1.08 * sz, h: 0.72 * sz }; orbit.add(mesh);
    if (images[i]) new THREE.TextureLoader().load(images[i], (tt) => {
      tt.colorSpace = THREE.SRGBColorSpace; texs.push(tt); m.map = tt; m.needsUpdate = true;
      mesh.userData.w = mesh.userData.h * (tt.image.width / tt.image.height);
    });
  });

  // cards spiral up around the phone: enter below the viewport, orbit while rising, leave through the top.
  // S.extra keeps them turning while the section scrolls away after the pin; t adds a slow idle drift so they never freeze.
  const A0 = [0, 2.2, 4.3, 1.1, 3.2];
  function updateCards(S, t) {
    const n = orbit.children.length, Rx = Math.min(1.6, camHW * 0.6) * (1 + 0.4 * (1 - S.cards)), Y = camHH + 0.9;
    const pos = S.orbit + (S.extra || 0) + t * 0.01;
    orbit.children.forEach((c, i) => {
      const f = (((i / n + pos * 1.5) % 1) + 1) % 1, a = A0[i] + f * Math.PI * 2, s = Math.sin(a), co = Math.cos(a);
      const { w, h } = c.userData, k = (0.8 + 0.2 * S.cards) * 0.95;
      c.position.set(s * Rx, -Y + f * 2 * Y, co * 1.2 - 0.2);
      c.rotation.set((0.5 - f) * 0.35, -s * 0.55, s * 0.07);
      c.material.opacity = S.cards * Math.min(1, f * 40, (1 - f) * 40); // only fades while still off-screen
      c.scale.set(w * k, h * k, 1);
    });
  }

  return {
    resize(L) {
      uni.uY0.value = L.y0; uni.uY1.value = L.y1; uni.uRes.value.set(L.W * L.dpr, L.H * L.dpr); uni.uPR.value = L.dpr;
      renderer.setPixelRatio(L.dpr); renderer.setSize(L.W, L.H, false);
      const visH = (2.09 * L.H) / L.phH; camera.aspect = L.W / L.H; camHW = (visH / 2) * camera.aspect; camHH = visH / 2;
      camera.position.set(0, (-(L.cy - L.H / 2) / L.H) * visH, visH / 2 / Math.tan(THREE.MathUtils.degToRad(17.5)));
      camera.lookAt(0, camera.position.y, 0); camera.updateProjectionMatrix();
    },
    render(S, t) {
      if (S.pa <= 0) { canvas.style.visibility = 'hidden'; return; }
      canvas.style.visibility = 'visible'; uni.uR.value = S.pa;
      const sway = RM ? 0 : Math.sin(t * 0.8) * 0.02;
      // limited motion: +/-30deg turn and a few degrees of pitch, both scroll-driven
      phone.rotation.set(Math.sin(S.spin * Math.PI * 4) * 0.1 + sway * 0.5, Math.sin(S.spin * Math.PI * 2) * (Math.PI / 6) + sway, 0);
      updateCards(S, t);
      camera.position.x = Math.sin(S.spin * Math.PI) * 0.6; camera.lookAt(0, camera.position.y, 0);
      renderer.render(scene, camera);
    },
    dispose() {
      geos.forEach((g) => g.dispose()); mats.concat(cardMats).forEach((m) => m.dispose());
      texs.forEach((x) => x.dispose()); envRT.dispose(); renderer.dispose();
    },
  };
}
