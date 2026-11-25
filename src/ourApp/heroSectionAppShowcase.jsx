import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OBB } from "three/examples/jsm/math/OBB.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * PhoneShowcase
 * Scroll-driven hero: giant wordmark + floating 3D phones that fly in from outside
 * the screen on load, tumble on scroll, then settle into a 5-phone carousel.
 * Dark mode: black base, teal hero, per-feature colour slides.
 *
 * Deps: react, three, tailwindcss
 * Usage: put your screenshots in `features` (any URL or imported asset).
 *        Without `image`, a generated placeholder screen is used.
 */

// dark mode: black base; hero blobs are a teal tint, carousel slides use each feature colour
const BG_COLOR = "#000";
const HERO_TINT = "#14b8a6";

const DEFAULT_FEATURES = [
  { title: "Home", color: "#65a30d", description: "Everything you need today, front and centre. Open the app and pick up right where you left off." },
  { title: "Explore", color: "#0284c7", description: "Find new routines, recipes and ideas picked around how you move." },
  { title: "Track", color: "#0d9488", description: "See your progress at a glance, with simple charts that show what is working." },
  { title: "Chat", color: "#ea580c", description: "Ask questions and get answers from people who have been where you are." },
  { title: "Profile", color: "#db2777", description: "Your goals, your history and your settings, all in one place." },
];

// phone geometry (world units)
const W = 1, H = 2.1, R = 0.17, D = 0.07, BEV = 0.025;

// hero poses per phone: x, y, z, scale, rotX, rotY, rotZ
const HERO = [
  [-3.7, -1.5, 0, 1.7, 0.1, 0.5, 0.38],
  [0.5, 2.3, 0.5, 1.7, 0.2, 0.3, 2.7],
  [4.3, -0.5, 0.2, 1.6, -0.3, -0.4, -1.1],
  [-7.4, -0.2, -1, 1.4, 0, 0.4, 0.1],
  [7.6, -2.2, -1, 1.4, 0, -0.5, -0.2],
];

// mobile hero poses: x is a fraction of half the visible width, then y, z, scale, rotX, rotY, rotZ
const HERO_M = [
  [-2.6, -3.2, 0, 1.1, 0, 0.3, 0.3],
  [-0.82, -2.75, -0.3, 1.2, 0, 0.35, 0.28],
  [0, -2.45, 0.3, 1.3, 0, 0, 0],
  [0.82, -2.85, -0.3, 1.2, 0, -0.35, -0.3],
  [2.6, -3.2, 0, 1.1, 0, -0.3, -0.3],
];

const DURATION = 0.6; // seconds for hero -> carousel
const DURATION2 = 0.5; // seconds for carousel -> feature detail (titles hide, phone moves, copy appears)
const SPIN_DUR = 0.9; // seconds for the spin when switching feature in the detail view

// entrance animation
const INTRO_DUR = 1.5; // seconds each phone takes to fly in
const STAGGER = 0.12; // delay between phones

// Stepped scrolling. The section is 200vh and the sticky layer is 100vh, so the page
// stays pinned for exactly 1 viewport height of scroll. Every stop MUST sit inside that
// range (last stop <= pinned range), otherwise pinned() turns false at the last stop and
// scrolling back gets stuck.
const SECTION_VH = 200;
const SNAP = [0, 0.5, 1]; // scroll position (in viewport heights) of each stop
const STEP_LOCK = 800; // ms a step animation locks further steps (fixed, never extended)

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const sm = (x, a, b) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  // absarc() draws the straight edge to each arc's start itself; extra lineTo calls
  // would add zero-length segments that make the bevel spike at the corners.
  s.moveTo(x + r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

function placeholderCanvas(feature) {
  const title = feature.title;
  const c = document.createElement("canvas");
  c.width = 540;
  c.height = 1134;
  const g = c.getContext("2d");
  g.fillStyle = feature.color || "#14b8a6";
  g.fillRect(0, 0, c.width, c.height);
  const shade = g.createLinearGradient(0, 0, 0, c.height);
  shade.addColorStop(0, "rgba(0,0,0,.35)");
  shade.addColorStop(1, "rgba(0,0,0,.92)");
  g.fillStyle = shade;
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = "rgba(255,255,255,.92)";
  g.font = "700 54px sans-serif";
  g.fillText(title, 40, 170);
  g.fillStyle = "rgba(255,255,255,.14)";
  for (let k = 0; k < 4; k++) {
    g.beginPath();
    g.roundRect(40, 240 + k * 170, 460, 140, 28);
    g.fill();
  }
  g.fillStyle = "rgba(255,255,255,.5)";
  g.font = "500 22px sans-serif";
  g.fillText("Replace with your screenshot", 40, 1070);
  return c;
}

function placeholderTexture(feature) {
  const t = new THREE.CanvasTexture(placeholderCanvas(feature));
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const CACHE = {};
const memo = (k, f) => (CACHE[k] ??= f());

function buildPhone(feature, i, renderer) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    memo("bodyG", () =>
      new THREE.ExtrudeGeometry(roundedRect(W, H, R), {
        depth: D,
        bevelEnabled: true,
        bevelSize: BEV,
        bevelThickness: BEV,
        bevelSegments: 3,
        curveSegments: 16,
      }).center()
    ),
    memo("bodyM", () => new THREE.MeshStandardMaterial({ color: "#16201f", metalness: 0.9, roughness: 0.28 }))
  );
  group.add(body);

  const zf = D / 2 + BEV + 0.002;
  const sw = W - 0.05, sh = H - 0.05;
  const sg = memo("screenG", () => {
    const g = new THREE.ShapeGeometry(roundedRect(sw, sh, R - 0.025), 16);
    const uv = g.attributes.uv, pos = g.attributes.position;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, pos.getX(k) / sw + 0.5, pos.getY(k) / sh + 0.5);
    return g;
  });

  let map;
  const screenMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  if (feature.image) {
    map = new THREE.TextureLoader().load(feature.image, (t) => {
      const ia = t.image.width / t.image.height, sa = sw / sh;
      if (ia > sa) {
        t.repeat.x = sa / ia;
        t.offset.x = (1 - t.repeat.x) / 2;
      } else {
        t.repeat.y = ia / sa;
        t.offset.y = (1 - t.repeat.y) / 2;
      }
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      screenMat.needsUpdate = true;
    });
    map.colorSpace = THREE.SRGBColorSpace;
  } else {
    map = placeholderTexture(feature);
  }
  screenMat.map = map;
  const screen = new THREE.Mesh(sg, screenMat);
  screen.position.z = zf;
  group.add(screen);

  // glass glare (one shared material)
  const glareMat = memo("glareM", () => {
    const gc = document.createElement("canvas");
    gc.width = 64;
    gc.height = 128;
    const gg = gc.getContext("2d");
    const gl = gg.createLinearGradient(0, 0, 64, 128);
    gl.addColorStop(0, "rgba(255,255,255,.22)");
    gl.addColorStop(0.42, "rgba(255,255,255,0)");
    gg.fillStyle = gl;
    gg.fillRect(0, 0, 64, 128);
    return new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(gc),
      transparent: true,
      depthWrite: false,
      toneMapped: false,
    });
  });
  const glare = new THREE.Mesh(sg, glareMat);
  glare.position.z = zf + 0.004;
  group.add(glare);

  // side buttons
  const btnMat = memo("btnM", () => new THREE.MeshStandardMaterial({ color: "#2b3a38", metalness: 0.9, roughness: 0.3 }));
  const bx = W / 2 + BEV;
  [
    [-bx, 0.62, 0.06],
    [-bx, 0.42, 0.12],
    [-bx, 0.24, 0.12],
    [bx, 0.4, 0.2],
  ].forEach(([x, y, len]) => {
    const b = new THREE.Mesh(memo("btnG" + len, () => new THREE.BoxGeometry(0.012, len, 0.022)), btnMat);
    b.position.set(x + Math.sign(x) * 0.002, y, 0);
    group.add(b);
  });

  const island = new THREE.Mesh(
    memo("islandG", () => new THREE.ShapeGeometry(roundedRect(0.3, 0.08, 0.04), 8)),
    memo("islandM", () => new THREE.MeshBasicMaterial({ color: "#000" }))
  );
  island.position.set(0, H / 2 - 0.12, zf + 0.002);
  group.add(island);

  // back camera module
  const back = new THREE.Group();
  back.rotation.y = Math.PI;
  back.position.z = -zf;
  const mod = new THREE.Mesh(
    memo("modG", () => new THREE.ShapeGeometry(roundedRect(0.44, 0.44, 0.1), 8)),
    memo("modM", () => new THREE.MeshStandardMaterial({ color: "#050b0b", metalness: 0.6, roughness: 0.2 }))
  );
  mod.position.set(0.22, H / 2 - 0.3, 0.003);
  back.add(mod);
  [[-0.08, 0.08], [0.08, 0.08], [0, -0.09]].forEach(([x, y]) => {
    const lens = new THREE.Mesh(
      memo("lensG", () => new THREE.CircleGeometry(0.065, 16)),
      memo("lensM", () => new THREE.MeshStandardMaterial({ color: "#0F0F0F", metalness: 0.2, roughness: 0.1 }))
    );
    lens.position.set(0.22 + x, H / 2 - 0.3 + y, 0.006);
    back.add(lens);
  });
  group.add(back);

  group.userData.screenMat = screenMat;
  group.userData.map = map;
  return group;
}

// Background layers -------------------------------------------------------
// Aurora: three big soft colour orbs that drift slowly (keyframes live in the <style> tag below).
function Aurora({ colors, strength = 1 }) {
  const orbs = [
    { left: "-18%", top: "-25%", size: "65vmax", anim: "psDriftA 24s", a: 0.75 },
    { right: "-22%", top: "-5%", size: "55vmax", anim: "psDriftB 29s", a: 0.55 },
    { left: "22%", bottom: "-45%", size: "70vmax", anim: "psDriftC 33s", a: 0.7 },
  ];
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {orbs.map((o, i) => {
        const { size, anim, a, ...pos } = o;
        return (
          <div
            key={i}
            className="ps-orb absolute rounded-full"
            style={{
              ...pos,
              width: size,
              height: size,
              opacity: a * strength,
              background: `radial-gradient(circle at 50% 50%, ${colors[i]} 0%, transparent 62%)`,
              animation: `${anim} ease-in-out infinite alternate`,
              willChange: "transform",
            }}
          />
        );
      })}
    </div>
  );
}

// Hero background: dark mesh gradient tinted by the selected feature colour; one layer for every section (the selected feature colour in five shades).
// A deep base gradient plus five soft orbs that drift slowly.
const MESH = [
  { c: "var(--ps-c)", left: "-15%", top: "-20%", size: "62vmax", anim: "psDriftA 26s", a: 0.7 }, // teal, top-left
  { c: "color-mix(in srgb, var(--ps-c) 65%, black)", left: "-10%", top: "25%", size: "48vmax", anim: "psDriftB 31s", a: 0.5 }, // cyan-teal, mid-left
  { c: "color-mix(in srgb, var(--ps-c) 70%, white)", right: "-15%", top: "-25%", size: "58vmax", anim: "psDriftC 28s", a: 0.65 }, // aqua, top-right
  { c: "color-mix(in srgb, var(--ps-c) 75%, black)", left: "20%", bottom: "-40%", size: "62vmax", anim: "psDriftA 34s", a: 0.6 }, // deep teal, bottom
  { c: "color-mix(in srgb, var(--ps-c) 45%, white)", right: "-18%", bottom: "-30%", size: "50vmax", anim: "psDriftB 30s", a: 0.55 }, // mint, bottom-right
];

function HeroMesh() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      style={{ background: "linear-gradient(115deg, color-mix(in srgb, var(--ps-c) 8%, #000) 0%, color-mix(in srgb, var(--ps-c) 16%, #000) 40%, color-mix(in srgb, var(--ps-c) 12%, #000) 100%)" }}
    >
      {MESH.map(({ c, size, anim, a, ...pos }, i) => (
        <div
          key={i}
          className="ps-orb absolute rounded-full"
          style={{
            ...pos,
            width: size,
            height: size,
            opacity: a,
            background: `radial-gradient(circle at 50% 50%, ${c} 0%, transparent 62%)`,
            animation: `${anim} ease-in-out infinite alternate`,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}

// Fine film grain + vignette: kills gradient banding and gives the flat colour some texture.
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

function Finish() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: GRAIN, opacity: 0.06 }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 45%, transparent 45%, rgba(0,0,0,.2) 100%)" }}
      />
    </>
  );
}

function ArrowButton({ dir, onClick, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="group absolute p-3 text-white transition-transform duration-200 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      style={{
        [dir < 0 ? "right" : "left"]: "calc(50% + var(--arrow-x, 160px))",
        top: "var(--arrow-y, 50%)",
        transform: `translateY(-50%)`,
        opacity: "var(--arrow-o, 1)",
        visibility: "var(--arrow-v, visible)",
      }}
    >
      <svg
        width="34"
        height="34"
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        style={{ transform: dir < 0 ? "scaleX(-1)" : undefined }}
      >
        <path d="M3 3L29 16L3 29L9 16Z" />
      </svg>
    </button>
  );
}

export default function PhoneShowcase({
  brand = "FITMOM",
  tagline = "One app for everything you do daily. Fast to open, simple to use, built around you.",
  cta = "See the features",
  heading = "Many features. 1 app.",
  features = DEFAULT_FEATURES,
}) {
  const sectionRef = useRef(null);
  const rootRef = useRef(null);
  const heroBgRef = useRef(null);
  const detailRef = useRef(null);
  const titleRef = useRef(null);
  const mountRef = useRef(null);
  const wordRef = useRef(null);
  const heroUiRef = useRef(null);
  const tealRef = useRef(null);
  const carouselRef = useRef(null);
  const headingRef = useRef(null);
  const goStepRef = useRef(null); // lets the CTA button use the same stepping as wheel/touch/keys
  const activeRef = useRef(2);
  const [active, setActive] = useState(2);
  const [entered, setEntered] = useState(false); // false on first load -> teal hero; true after the first scroll stop
  const enteredRef = useRef(false);
  const count = features.length;
  const thumbs = useMemo(
    () => features.map((f) => f.image || placeholderCanvas(f).toDataURL("image/jpeg", 0.7)),
    [features]
  );

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const mount = mountRef.current;
    const devDpr = window.devicePixelRatio || 1;
    let dpr = Math.min(devDpr, mount.clientWidth < 768 ? 1.5 : 2);
    let slow = 1 / 60, frames = 0; // smoothed frame time -> adaptive resolution
    const renderer = new THREE.WebGLRenderer({
      antialias: devDpr < 2, // at 2x+ the pixel density already hides jaggies
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    const sun = new THREE.DirectionalLight("#9ffcf0", 1.4);
    sun.position.set(-4, 6, 6);
    scene.add(sun);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.z = 10;

    const phones = features.slice(0, 5).map((f, i) => {
      const g = buildPhone(f, i, renderer);
      scene.add(g);
      return g;
    });
    const cur = phones.map(() => null);

    // Which feature each phone currently shows. Carousel order uses this, and in the detail view the
    // big phone swaps screens with the phone that owns the next feature while it spins.
    const fmaps = phones.map((ph) => ph.userData.map);
    const shown = phones.map((_, i) => i);
    const side = [], rank = [];
    let host = -1, spinT = 1, spinDir = 1, spinTarget = 0, swapped = true;

    // --- collision guard -------------------------------------------------
    // Every phone is an oriented box. Each frame, any pair whose boxes overlap is
    // pushed apart along the camera axis (z) until they no longer intersect, so one
    // phone can never pass through another. Pairs may still touch.
    const push = phones.map(() => 0);
    const obbs = phones.map(() => new OBB());
    const rotM = new THREE.Matrix4();
    const half = new THREE.Vector3(W / 2 + BEV + 0.03, H / 2 + BEV + 0.03, D / 2 + BEV + 0.03);
    const sync = (i) => {
      const ph = phones[i];
      ph.position.z = cur[i].z + push[i];
      const o = obbs[i];
      o.center.copy(ph.position);
      o.halfSize.copy(half).multiplyScalar(ph.scale.x);
      o.rotation.setFromMatrix4(rotM.makeRotationFromEuler(ph.rotation));
    };
    const resolveCollisions = (dt) => {
      const decay = Math.exp(-dt * 2.5);
      phones.forEach((_, i) => {
        push[i] *= decay; // relax smoothly; re-pushed instantly below if still overlapping
        sync(i);
      });
      for (let it = 0; it < 24; it++) {
        let hit = false;
        for (let i = 0; i < phones.length; i++) {
          for (let j = i + 1; j < phones.length; j++) {
            if (!obbs[i].intersectsOBB(obbs[j])) continue;
            hit = true;
            const zi = cur[i].z + push[i], zj = cur[j].z + push[j];
            const front = zi >= zj ? i : j;
            const back = front === i ? j : i;
            push[front] = Math.min(push[front] + 0.06, 3);
            push[back] = Math.max(push[back] - 0.06, -3);
            sync(front);
            sync(back);
          }
        }
        if (!hit) break;
      }
    };

    let aspect = 1;
    const resize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h);
      aspect = w / h;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // gentle mouse parallax so the phones feel alive in the carousel
    const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    const onMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    const clock = new THREE.Clock();

    // scroll progress is read on scroll/resize only, not every frame
    let scrollVh = 0; // scroll distance into the section, in viewport heights
    let step = 0, lockUntil = 0; // 0 hero, 1 carousel, 2 detail: each scroll gesture moves exactly one step
    const LAST = SNAP.length - 1;
    // thresholds sit midway between stops
    const T1 = (SNAP[0] + SNAP[1]) / 2;
    const T2 = (SNAP[1] + SNAP[2]) / 2;
    const readScroll = () => {
      const r = sectionRef.current.getBoundingClientRect();
      scrollVh = clamp(-r.top / window.innerHeight, 0, 10);
      // scrollbar / programmatic scroll: derive the step (ignored while a step is animating)
      if (performance.now() > lockUntil) step = scrollVh > T2 ? 2 : scrollVh > T1 ? 1 : 0;
    };
    readScroll();

    // --- stepped scrolling: the page pins at each stop and one gesture moves exactly one stop ---
    // pinned = the sticky layer currently fills the viewport (tolerance for subpixel rounding)
    const pinned = () => {
      const r = sectionRef.current.getBoundingClientRect();
      return r.top <= 2 && r.bottom >= window.innerHeight - 2;
    };
    const goStep = (n) => {
      step = clamp(n, 0, LAST);
      lockUntil = performance.now() + STEP_LOCK; // fixed lock, never extended
      const top = sectionRef.current.getBoundingClientRect().top + window.scrollY + SNAP[step] * window.innerHeight;
      window.scrollTo({ top, behavior: "auto" });
    };
    goStepRef.current = (dir) => goStep(step + dir);

    // wheel: only a *new* gesture may trigger a step. Inertia tails are swallowed (so the page
    // doesn't creep) but never extend the lock, so the next deliberate scroll always works.
    let lastWheelT = 0, lastAbs = 0;
    const onWheel = (e) => {
      const abs = Math.abs(e.deltaY);
      if (abs < 4) return;
      const now = performance.now();
      const dir = e.deltaY > 0 ? 1 : -1;
      const n = step + dir;
      const fresh = now - lastWheelT > 120 || abs > lastAbs * 1.5 + 10;
      lastWheelT = now;
      lastAbs = abs;
      if (!pinned() || n < 0 || n > LAST) return; // let the page scroll normally
      e.preventDefault();
      if (now >= lockUntil && fresh) goStep(n);
    };

    const onKey = (e) => {
      if (e.target.closest?.("button, input, textarea, select")) return;
      const down = ["ArrowDown", "PageDown", " "].includes(e.key);
      const up = ["ArrowUp", "PageUp"].includes(e.key);
      if (!down && !up) return;
      const n = step + (down ? 1 : -1);
      if (!pinned() || n < 0 || n > LAST) return;
      e.preventDefault();
      if (performance.now() >= lockUntil) goStep(n);
    };

    // touch: one step per swipe (reset on touchstart)
    let ty = 0, tx = 0, swiped = false;
    const onTS = (e) => {
      ty = e.touches[0].clientY;
      tx = e.touches[0].clientX;
      swiped = false;
    };
    const onTM = (e) => {
      const dy = ty - e.touches[0].clientY, dx = tx - e.touches[0].clientX;
      if (Math.abs(dy) < 24 || Math.abs(dy) < Math.abs(dx)) return;
      const n = step + (dy > 0 ? 1 : -1);
      if (!pinned() || n < 0 || n > LAST) return;
      e.preventDefault();
      if (!swiped && performance.now() >= lockUntil) {
        swiped = true;
        goStep(n);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTS, { passive: true });
    window.addEventListener("touchmove", onTM, { passive: false });
    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", readScroll);

    // DOM writes only when a value actually changed
    const last = {};
    const set = (k, el, prop, val) => {
      if (el && last[k] !== val) {
        last[k] = val;
        el.style[prop] = val;
      }
    };
    let running = true;
    // introT drives the fly-in entrance
    let raf, smoothP = 0, smoothP2 = 0, introT = 0;

    const tick = () => {
      const rdt = clock.getDelta();
      const dt = Math.min(rdt, 0.05);
      slow = slow * 0.95 + rdt * 0.05;
      if (++frames > 90 && slow > 1 / 40 && dpr > 1) {
        dpr = Math.max(1, dpr - 0.25); // running slow: render fewer pixels
        renderer.setPixelRatio(dpr);
        resize();
        frames = 0;
        slow = 1 / 60;
      }
      const time = clock.elapsedTime;
      introT += dt;
      // each stop plays its animation (and stepping back reverses it)
      const goal = step >= 1 ? 1 : 0;
      if ((step >= 1) !== enteredRef.current) {
        enteredRef.current = step >= 1;
        setEntered(enteredRef.current);
      }
      smoothP += clamp(goal - smoothP, -dt / DURATION, dt / DURATION);
      const p = smoothP;
      // stage 2: further scroll moves the chosen phone to the right and shows its details
      const goal2 = step >= 2 ? 1 : 0;
      smoothP2 += clamp(goal2 - smoothP2, -dt / DURATION2, dt / DURATION2);
      const hide = sm(smoothP2, 0, 0.2); // 1) top and bottom titles hide
      const u = sm(smoothP2, 0.2, 0.7); // 2) phone moves to the right
      const u2 = sm(smoothP2, 0.65, 0.95); // 3) details fade in

      const k = Math.min(1, aspect / 2.2);
      const kr = Math.max(k, 0.75); // keep carousel spacing wide on narrow screens
      const sc = clamp(aspect / 1.6, 0.55, 1);
      const t = sm(p, 0.04, 0.82);
      const mid = Math.sin(t * Math.PI); // 0 at hero and carousel, 1 mid-transition
      const a = activeRef.current;
      mouse.sx += (mouse.x - mouse.sx) * (1 - Math.exp(-dt * 4));
      mouse.sy += (mouse.y - mouse.sy) * (1 - Math.exp(-dt * 4));
      const mobile = mount.clientWidth < 768;
      const half = 3.15 * aspect; // half of the visible width at z = 0

      // detail view bookkeeping: pick the host phone, then spin it and swap its screen on switching
      if (u > 0.001 && host < 0) {
        host = shown.indexOf(a);
        phones.forEach((_, i) => {
          const o0 = ((shown[i] - a + 2 + 50) % 5) - 2;
          side[i] = Math.sign(o0) || 1;
          rank[i] = Math.abs(o0);
        });
      } else if (u <= 0.001) host = -1;
      if (host >= 0) {
        if (spinT >= 1 && u > 0.5 && shown[host] !== a) {
          spinT = 0;
          swapped = false;
          spinTarget = a;
          spinDir = (a - shown[host] + 5) % 5 <= 2 ? 1 : -1;
        }
        if (spinT < 1) {
          spinT = Math.min(1, spinT + dt / SPIN_DUR);
          if (!swapped && spinT >= 0.5) {
            // screen is facing away at half-spin: swap it with the phone that owns the next feature
            const P = shown.indexOf(spinTarget);
            const old = shown[host];
            shown[host] = spinTarget;
            shown[P] = old;
            phones[host].userData.screenMat.map = fmaps[shown[host]];
            phones[P].userData.screenMat.map = fmaps[shown[P]];
            swapped = true;
          }
        }
      }

      const par = mobile || reduce ? 0 : 0.35 + 0.65 * t;
      phones.forEach((ph, i) => {
        const h = mobile ? HERO_M[i] : HERO[i];
        const hx = mobile ? h[0] * half : h[0] * k;
        const hs = mobile ? h[3] : h[3] * sc;
        let o = ((shown[i] - a + 2 + 5 * 10) % 5) - 2;
        const dir = i % 2 ? -1 : 1;
        const row = mobile
          ? [
              o * 1.2 * half, // neighbours peek in from the sides
              0.1,
              -Math.abs(o) * 1.0,
              o === 0 ? 1.45 : Math.abs(o) === 1 ? 1 : 0.8,
              0,
              -o * 0.2 + dir * Math.PI * 2,
              0,
            ]
          : [
              (o * 1.9 + Math.sign(o) * 0.5) * kr,
              -0.1,
              -Math.abs(o) * 1.0,
              (o === 0 ? 1.65 : Math.abs(o) === 1 ? 1.4 : 1.1) * sc,
              0,
              -o * 0.12 + dir * Math.PI * 2,
              0,
            ];
        // stage 2 pose: active phone big on the right (desktop) or centred up top (mobile); others leave
        const isA = i === host;
        const away = host >= 0 ? side[i] * (half + 3 + rank[i] * 2) : 0;
        const kd = clamp(aspect / 1.7, 0.7, 1);
        const spinKeep = dir * Math.PI * 2;
        const det = mobile
          ? isA
            ? [0, 1.0, 0.5, 1.1, 0.05, -0.3 + spinKeep, -0.2]
            : [away, 0.1, -1, 0.8, 0, row[5], 0]
          : isA
            ? [half * 0.5, -0.1, 0.5, 2.5 * kd, 0.05, -0.3 + spinKeep, -0.2]
            : [away, -0.1, -1, 1.1 * sc, 0, row[5], 0];
        const R = u > 0.001 ? row.map((v, k) => lerp(v, det[k], u)) : row;
        const bob = reduce ? 0 : Math.sin(time * 0.9 + i * 1.7) * 0.08 * (1 - t * 0.6);
        const tgt = {
          x: lerp(hx, R[0], t),
          y: lerp(h[1], R[1], t) + bob,
          z: lerp(h[2], R[2], t) + (i - 2) * 1.5 * mid, // each phone gets its own depth lane so they never intersect
          s: lerp(hs, R[3], t) * (1 - 0.3 * mid),
          rx: lerp(h[4], R[4], t) + Math.sin(t * Math.PI) * 0.9 * dir - mouse.sy * 0.1 * par,
          ry: lerp(h[5], R[5], t) + mouse.sx * 0.18 * par,
          rz: lerp(h[6], R[6], t) + Math.sin(t * Math.PI) * 0.6 * dir + bob * 0.4,
        };
        if (!cur[i]) cur[i] = { ...tgt };
        const e = 1 - Math.exp(-dt * 8);
        for (const key in tgt) cur[i][key] += (tgt[key] - cur[i][key]) * e;
        const c = cur[i];

        // --- entrance: fly in from outside the screen ---
        const lim = mobile ? 0.5 : 1;
        const fromSide = Math.abs(h[0]) > lim;
        const q = reduce ? 1 : clamp((introT - i * STAGGER) / INTRO_DUR, 0, 1);
        // easeOutBack: overshoots slightly, then settles
        const c1 = 1.4, c3 = c1 + 1;
        const eased = 1 + c3 * Math.pow(q - 1, 3) + c1 * Math.pow(q - 1, 2);
        const out = 1 - eased; // 1 = fully off-screen, 0 = in place
        const offX = fromSide ? Math.sign(h[0]) * (half + 4) : 0;
        const offY = fromSide ? 0 : Math.sign(h[1] || 1) * 7;
        const spin = (1 - q) * (1 - q) * dir * 2.2;

        ph.position.set(c.x + offX * out, c.y + offY * out, c.z);
        const spinning = i === host && spinT < 1;
        const spinY = spinning ? easeInOut(spinT) * Math.PI * 2 * spinDir : 0;
        const pulse = spinning ? 1 - 0.1 * Math.sin(Math.PI * spinT) : 1;
        ph.scale.setScalar(c.s * pulse);
        ph.rotation.set(c.rx, c.ry + spinY, c.rz + spin);
      });

      resolveCollisions(dt);

      // DOM layers driven by scroll progress
      const heroOut = (1 - sm(p, 0.04, 0.28)) * (reduce ? 1 : sm(introT, 0.6, 1.6));
      const tealV = sm(p, 0.5, 0.72);
      const v = sm(p, 0.72, 0.9);
      set("hero", heroUiRef.current, "opacity", heroOut.toFixed(3));
      set("heroPE", heroUiRef.current, "pointerEvents", heroOut < 0.2 ? "none" : "auto");
      set("wordO", wordRef.current, "opacity", (1 - sm(p, 0.25, 0.6)).toFixed(3));
      set("wordT", wordRef.current, "transform", `scale(${(1 + sm(p, 0, 0.6) * 0.08).toFixed(4)})`);
      set("teal", tealRef.current, "opacity", tealV.toFixed(3));
      set("tealVis", tealRef.current, "visibility", tealV > 0 ? "visible" : "hidden");
      if (carouselRef.current) {
        const unit = mount.clientHeight / 6.3; // px per world unit at z = 0
        const edgeC = mobile ? 1.45 * 0.525 : 1.85 * sc * 0.525;
        const edgeN = mobile
          ? 1.2 * half - 0.525 * 0.91
          : 2.4 * kr - 1.4 * sc * 0.525 * 0.91;
        const axC = ((edgeC + edgeN) / 2) * unit - 34;
        const axM = 0.38 * mount.clientWidth - 29; // mobile detail: arrows at the screen edges
        [
          ["--arrow-x", `${Math.round(mobile ? lerp(axC, axM, u) : axC)}px`],
          ["--arrow-y", `${mobile ? lerp(50, 33, u).toFixed(2) : 50}%`],
          ["--arrow-o", mobile ? "1" : (1 - hide).toFixed(3)],
          ["--arrow-v", !mobile && hide >= 1 ? "hidden" : "visible"],
        ].forEach(([k, val]) => {
          if (last[k] !== val) {
            last[k] = val;
            carouselRef.current.style.setProperty(k, val);
          }
        });
        set("head", headingRef.current, "transform", `translateY(${((1 - v) * 28).toFixed(1)}px)`);
        set("car", carouselRef.current, "opacity", v.toFixed(3));
        set("carVis", carouselRef.current, "visibility", v > 0 ? "visible" : "hidden");
        set("headO", headingRef.current, "opacity", (1 - hide).toFixed(3));
        set("titleO", titleRef.current, "opacity", (1 - hide).toFixed(3));
        set("det", detailRef.current, "opacity", u2.toFixed(3));
        set("detVis", detailRef.current, "visibility", u2 > 0 ? "visible" : "hidden");
        set("carPE", carouselRef.current, "pointerEvents", v > 0.5 ? "auto" : "none");
      }

      renderer.render(scene, camera);
      if (running) raf = requestAnimationFrame(tick);
    };
    tick();

    // stop rendering (and pause the CSS drift) while the section is off screen
    const io = new IntersectionObserver(([en]) => {
      const on = en.isIntersecting;
      if (rootRef.current) rootRef.current.dataset.off = on ? "" : "1";
      if (on && !running) {
        running = true;
        clock.getDelta();
        readScroll();
        raf = requestAnimationFrame(tick);
      } else if (!on) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(sectionRef.current);

    return () => {
      goStepRef.current = null;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTS);
      window.removeEventListener("touchmove", onTM);
      window.removeEventListener("resize", readScroll);
      io.disconnect();
      ro.disconnect();
      scene.traverse((o) => {
        o.geometry?.dispose();
        if (o.material) {
          o.material.map?.dispose();
          o.material.dispose();
        }
      });
      fmaps.forEach((m) => m?.dispose());
      pmrem.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [features]);

  const touchX = useRef(null);
  const onTouchStart = (e) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };
  const go = (d) => setActive((a) => (a + d + count) % count);
  // CTA uses the same stepping as wheel/touch/keys so the step state never desyncs
  const scrollToNext = () => goStepRef.current?.(1);

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${SECTION_VH}vh`, background: BG_COLOR }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bagel+Fat+One&family=Outfit:wght@400;600;700&display=swap');
        @property --ps-c { syntax: '<color>'; inherits: true; initial-value: #14b8a6; }
        @keyframes psDriftA { from { transform: translate(0,0) scale(1); } to { transform: translate(12vw,8vh) scale(1.15); } }
        @keyframes psDriftB { from { transform: translate(0,0) scale(1.1); } to { transform: translate(-10vw,12vh) scale(0.95); } }
        @keyframes psDriftC { from { transform: translate(0,0) scale(1); } to { transform: translate(-8vw,-10vh) scale(1.2); } }
        @media (prefers-reduced-motion: reduce) { .ps-orb { animation: none !important; } }
        [data-off="1"] .ps-orb { animation-play-state: paused !important; }`}</style>

      <div ref={rootRef} className="sticky top-0 h-screen w-full overflow-hidden font-['Outfit']">
        {/* background: one dark mesh for every section, tinted by the selected mockup */}
        <div
          ref={heroBgRef}
          className="absolute inset-0"
          style={{ "--ps-c": entered ? features[active]?.color || HERO_TINT : HERO_TINT, transition: "--ps-c 700ms ease" }}
        >
          <HeroMesh />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(120% 90% at 50% 45%, transparent 40%, rgba(0,0,0,.45) 100%)" }}
          />
        </div>

        <Finish />

        {/* giant wordmark behind the phones */}
        <div
          ref={wordRef}
          aria-hidden
          className="absolute inset-0 flex items-start justify-center pt-[7vh] select-none md:items-center md:pt-0"
        >
          <span className="font-['Bagel_Fat_One'] text-[34vw] leading-none tracking-tight text-white/20 sm:text-[28vw]">
            {brand}
          </span>
        </div>

        {/* 3D canvas */}
        <div ref={mountRef} className="pointer-events-none absolute inset-0 z-10" />

        {/* hero UI */}
        <div ref={heroUiRef} className="absolute inset-0 z-20">
          <div className="absolute inset-x-6 top-[30vh] flex flex-col gap-5 md:inset-x-[8vw] md:bottom-12 md:top-auto md:flex-row md:items-end md:justify-between">
            <p className="max-w-md text-xl font-semibold leading-snug text-white md:ml-[24vw] md:text-2xl">
              {tagline}
            </p>
            <button
              onClick={scrollToNext}
              className="w-fit rounded-full bg-white px-8 py-3 text-xl font-semibold text-black transition hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              {cta} →
            </button>
          </div>
        </div>

        {/* carousel UI */}
        <div
          ref={carouselRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="absolute inset-0 z-20 opacity-0"
        >
          <h2 ref={headingRef} className="pt-[9vh] text-center font-['Bagel_Fat_One'] text-[9vw] leading-none text-white md:text-[5.5vw]">
            {heading}
          </h2>
          <ArrowButton dir={-1} onClick={() => go(-1)} label="Previous feature" />
          <ArrowButton dir={1} onClick={() => go(1)} label="Next feature" />
          <div ref={titleRef} className="absolute inset-x-0 bottom-[7vh]">
            <p
              key={active}
              aria-live="polite"
              className="text-center font-['Bagel_Fat_One'] text-3xl text-white md:text-5xl"
            >
              {features[active]?.title}
            </p>
          </div>
        </div>

        {/* detail UI (stage 2): copy on the left for desktop; title, copy and button for mobile */}
        <div ref={detailRef} className="pointer-events-none absolute inset-0 z-20 opacity-0" style={{ visibility: "hidden" }}>
          <div className="absolute left-[7vw] top-1/2 hidden w-[36vw] max-w-xl -translate-y-1/2 flex-col gap-6 md:flex">
            <h3 className="font-['Bagel_Fat_One'] text-[4.2vw] leading-none text-white">{features[active]?.title}</h3>
            <p className="max-w-md text-lg font-semibold leading-snug text-white">{features[active]?.description}</p>
            <button className="pointer-events-auto w-fit rounded-full bg-white px-6 py-2 text-lg font-semibold text-black transition hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Learn more →
            </button>
            <p className="mt-8 font-['Bagel_Fat_One'] text-base text-white">Choose the flavor</p>
            <div className="-mt-3 flex gap-2">
              {features.map((f, i) => (
                <button
                  key={f.title}
                  onClick={() => setActive(i)}
                  aria-label={f.title}
                  aria-pressed={i === active}
                  className={`pointer-events-auto rounded-2xl p-1.5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${i === active ? "scale-110 bg-white/25" : "opacity-75 hover:bg-white/10 hover:opacity-100"}`}
                >
                  <span className="block h-[68px] w-[33px] rounded-[8px] bg-[#16201f] p-[2px] shadow-md ring-1 ring-white/25">
                    <span
                      className="block h-full w-full rounded-[6px] bg-cover bg-center"
                      style={{ backgroundImage: `url(${thumbs[i]})` }}
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <h3 className="absolute inset-x-0 top-[5vh] px-4 text-center font-['Bagel_Fat_One'] text-[11vw] leading-none text-white md:hidden">
            {features[active]?.title}
          </h3>
          <div className="absolute inset-x-5 bottom-[8vh] flex flex-col gap-7 md:hidden">
            <p className="text-center text-lg font-semibold leading-snug text-white">{features[active]?.description}</p>
            <button className="pointer-events-auto w-full rounded-full bg-white py-4 text-xl font-semibold text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Learn more →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}