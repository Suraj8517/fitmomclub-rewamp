import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import img from "../assets/hero111.png";
import EdgeFade from "./EdgeFade";
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
import prental from "../assets/programs/prenatal.jpg";
import postnatal from "../assets/programs/postnatal.png";
import healthcondition from "../assets/programs/withhealthconditions.jpg";
import toneup from "../assets/programs/toneup.jpg";
import nohealth from "../assets/programs/nocondition.jpg";


/* ------------------------------- tokens ------------------------------- */
const C = {
  bg: "#110f0d",
  cream: "#f3eee0",
  teal: "#2bb5a5",
  tealSoft: "#7fe0d2",
  deepTeal: "#0b2624", // dark teal used for the next section background
};
const DISPLAY = "'Anton', 'Bebas Neue', Impact, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace";
const SANS = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;700&display=swap";

/* Vertical offsets (px) so the cards sit staggered, like the reference */
const CARD_OFFSETS = [-50, 90, -30, 80];

/* Per-line layout for the "Get / Stronger / With" stack.
   left/top: position of each line (vw / svh).
   size: font-size (vw).
   dx/dy: parallax travel during the grow phase (vw / svh). Different values
   per line give the depth effect; negative dx moves left, positive moves right. */
const TITLE_LAYOUT = {
  get: {
    desktop: { left: "5vw", top: "7svh", size: "2.4vw", dx: "2vw", dy: "1svh" },
    mobile: { left: "6vw", top: "5svh", size: "6vw", dx: "-4vw", dy: "-1svh" },
  },
  main: {
    desktop: { left: "4vw", top: "12svh", size: "14vw", dx: "5vw", dy: "6svh" },
    mobile: { left: "4vw", top: "9svh", size: "22vw", dx: "4vw", dy: "0svh" },
  },
  with: {
    desktop: { right: "34vw", top: "39svh", size: "16vw", dx: "40vw", dy: "3svh" },
    mobile: { left: "5vw", top: "19svh", size: "18vw", dx: "0vw", dy: "1svh" },
  },
};

const DEFAULT_FEATURES = [
  {
    tag: "Blossom",
    title: "Prenatal Care",
    subtitle: "Weight Management",
    body: "Complete prenatal wellness support with expert nutrition and fitness consultations, customised diet plans, twice-monthly reviews, WhatsApp meal tracking, 36+ live group workouts, and exclusive access to our recipe vault.",
    image: prental,
  },
  {
    tag: "Queen",
    title: "Postnatal Care",
    subtitle: "Weight Management",
    body: "Comprehensive postnatal wellness support with expert nutrition and fitness consultations, customised diet plans with monthly revisions, 41+ live postnatal & DR workout sessions, twice-monthly reviews, WhatsApp meal tracking, and exclusive recipe vault access.",
    image: postnatal,
  },
  {
    tag: "Pro",
    title: "No Health Conditions",
    subtitle: "Weight Management",
    body: "Personalised nutrition and fitness support with expert consultations, customised diet plans, 23+ live group workout sessions, twice-monthly diet reviews, daily WhatsApp meal tracking, and exclusive recipe vault access.",
    image: nohealth,
  },
  {
    tag: "Elite",
    title: "With Health Conditions",
    subtitle: "Weight Management",
    body: "Complete personalised fitness and nutrition coaching with expert consultations, customised diet and workout plans, 41+ live group workout sessions, twice-monthly reviews, daily WhatsApp meal tracking, and exclusive recipe vault access.",
    image: healthcondition,
  },
  {
    tag: "Tone Up",
    title: "Fitness-Based Body Toning Program",
    subtitle: "Body Toning",
    body: "Personalised wellness coaching with smart nutrition guidance, exclusive 1:1 expert consultations, guided fitness training, and continuous progress monitoring.",
    image: toneup,
  },
];

/* values the scroll code uses to drive the global Scoreboard */
const TICKS = 28;
const COUNT_FROM = 22;
const COUNT_TO = 10;

/* Exit transition: horizontal strips with a zig-zag lower edge sweep in
   (alternating left / right) until the first section is covered, the next
   section is swapped in underneath, then the strips retract to reveal it. */
const STRIPS = 14; // rows
/* timeline units for the exit (scrubbed by scroll) */
const EXIT = {
  swap: 1.2, // moment the strips fully cover the screen
  retract: 1.2, // strips start leaving
  grow: 2.45, // after the strips are gone: subject grows, title drifts, vertical text scales down
  total: 4.3,
};
const makeZigzag = (teeth, tooth) => {
  const pts = ["0% 0%", "100% 0%"];
  for (let k = teeth; k >= 0; k--) {
    const x = (k / teeth) * 100;
    pts.push(`${x}% ${k % 2 === 0 ? "100%" : `calc(100% - ${tooth}px)`}`);
  }
  return `polygon(${pts.join(",")})`;
};
const HIDDEN_L = "inset(0% 100% 0% 0%)";
const HIDDEN_R = "inset(0% 0% 0% 100%)";
const SHOWN = "inset(0% 0% 0% 0%)";

/* Gradient mask: --p goes 100 -> 0 to wipe a line in from the right,
   fading through its own colour (cream/teal) into the dark background. */
const wipeStyle = {
  "--p": 0,
  WebkitMaskImage:
    "linear-gradient(90deg, #000 0%, #000 33.33%, transparent 66.66%, transparent 100%)",
  maskImage:
    "linear-gradient(90deg, #000 0%, #000 33.33%, transparent 66.66%, transparent 100%)",
  WebkitMaskSize: "300% 100%",
  maskSize: "300% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "calc(var(--p) * 1%) 0",
  maskPosition: "calc(var(--p) * 1%) 0",
  fontFamily: DISPLAY,
};

/* ------------------------------ sub-parts ------------------------------ */

function FeatureCard({ feature, index, total }) {
  const { tag, title, subtitle, body, image } = feature;
  return (
    <article
      data-card
      className="relative aspect-[4/4.2] w-[min(78vw,31rem)] overflow-hidden border border-white/15 bg-[#1a1612] md:aspect-[4/3.4]"
    >
      {image ? (
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        /* knit-texture placeholder until real photography is supplied */
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 70% 20%, rgba(127,224,210,.28), transparent 55%),
              radial-gradient(circle at 20% 90%, rgba(43,181,165,.18), transparent 50%),
              repeating-linear-gradient(45deg, rgba(255,255,255,.05) 0 2px, transparent 2px 7px),
              linear-gradient(160deg, #2a241e, #15120f)`,
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-black/55" />

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <div
          className="flex items-center justify-between border-b border-white/15 pb-2 text-[10px] uppercase tracking-[0.2em] text-white/55"
          style={{ fontFamily: MONO }}
        >
          <span className="font-bold text-teal-500">{tag}</span>
          <span className="font-bold text-teal-500">
            6 / 9 / 12 months
          </span>
        </div>
        <h3
          className="mt-3 text-2xl font-bold uppercase tracking-tight sm:text-[1.7rem]"
          style={{ fontFamily: MONO, color: C.cream }}
        >
          {title}
        </h3>
        <span className="text-teal-500">{subtitle}</span>
        <p
          data-copy
          className="mt-2 max-w-[48ch] text-[13px] leading-relaxed text-white/80"
          style={{ fontFamily: SANS }}
        >
          {body}
        </p>
      </div>
    </article>
  );
}

/* true below the `md` breakpoint (768px) */
function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return narrow;
}

/* Placeholder figure shown until you pass `subjectSrc` (a transparent PNG) */
function Silhouette() {
  return (
    <svg
      viewBox="0 0 300 700"
      className="h-full w-auto"
      role="img"
      aria-label="Placeholder figure. Pass a transparent PNG as subjectSrc."
    >
      <defs>
        <linearGradient id="fm-sil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3eee0" />
          <stop offset="1" stopColor="#a99d86" />
        </linearGradient>
      </defs>
      <g fill="url(#fm-sil)">
        <ellipse cx="150" cy="68" rx="32" ry="38" />
        <path d="M172 42c40-6 66 24 52 66-6 18-16 30-20 46 4-30-4-56-36-60z" />
        <rect x="138" y="100" width="24" height="36" rx="8" />
        <path d="M100 140c30-12 70-12 100 0l10 150c-34 14-86 14-120 0z" />
        <path d="M100 142c-24 10-36 40-40 80l-10 80c-2 14 14 18 18 6l20-76 20-60z" />
        <path d="M200 142c24 10 36 40 40 80l10 80c2 14-14 18-18 6l-20-76-20-60z" />
        <path d="M92 288c40 16 86 16 126 0l8 84c-20 10-44 14-64 10-20 4-44 0-64-10z" />
        <path d="M96 368c16 8 38 10 54 6l-6 248c-1 14-6 26-14 42h-34c-6-12-4-24-2-38z" />
        <path d="M214 368c-16 8-38 10-54 6l6 248c1 14 6 26 14 42h34c6-12 4-24 2-38z" />
      </g>
    </svg>
  );
}

/* ------------------------------ main component ------------------------------ */

export default function TextShowcase({
  heroImage = img,
  features = DEFAULT_FEATURES,
  heroLines = ["FitMom Club ", "Plans for Every Mom."],
  heroSub = ["Customized. Effective. Nurturing., ", "Expert-backed solutions to fit your lifestyle."],
  closingLines = ["Everything a Mom's", "Wellness Journey", "actually needs."],
  /* two alternating tints for the exit strips; make the first one match the
     top of whatever section follows so the hand-off is seamless */
  stripColors = ["#15211F", "#121C19"],
  /* ---- the section revealed after the exit strips ---- */
  bgImage = "", // full-bleed photo (court, gym, park...)
  subjectSrc = img, // TRANSPARENT PNG cut-out placed over the title (e.g. the fit mom)
  subjectAlt = "",
  preTitle = "Get", // small line above the main word
  impactTitle = "Stronger.",
  postTitle = "With", // large line below the main word
  badgeText = "Fitmom Club", // vertical badge printed on the subject's clothing
  badgeAt = { x: 0.62, y: 0.42 }, // where the badge sits on the PNG (fractions of its width / height)
  labels = ["The game", "The tech", "Your team", "Fit mom"],
}) {
  const narrow = useNarrow();
  const zigzag = useMemo(
    () => makeZigzag(narrow ? 6 : 12, narrow ? 14 : 20),
    [narrow]
  );
  const tooth = narrow ? 14 : 20;
  const nextRef = useRef(null);
  const sectionRef = useRef(null);
  const pinRef = useRef(null);
  const trackRef = useRef(null);
  const canvasRef = useRef(null);
  const stRef = useRef(null);
  const progressRef = useRef(0);
  const hiddenRef = useRef(false); // true once the first section is fully covered
  const ambientRef = useRef(true);
  const barsRef = useRef([]);
  const lastUiRef = useRef(""); // de-dupes scoreboard events

  const [ambient, setAmbient] = useState(true);

  /* load fonts once */
  useEffect(() => {
    if (document.querySelector(`link[href="${FONT_HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }, []);

  /* ---------------- GSAP: pin, horizontal run, strip exit, next-section reveal ---------------- */
  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ScrollTrigger.config({ ignoreMobileResize: true }); // stop mobile URL-bar jitter

    const offFns = [];
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const next = nextRef.current;
      const dist = () => Math.max(1, track.scrollWidth - window.innerWidth);
      const panels = Array.from(track.querySelectorAll("[data-panel]"));

      /* scroll distance reserved after the horizontal run for the exit + reveal */
      const extra = () => Math.round(window.innerHeight * (reduce ? 0.6 : 3.3));

      /* 1) the pin: holds the section for run + exit + reveal */
      const pinTrigger = ScrollTrigger.create({
        trigger: pinRef.current,
        pin: true,
        anticipatePin: 1,
        start: "top top",
        end: () => "+=" + (dist() + extra()),
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const s = Math.max(0, self.scroll() - self.start);
          const total = dist() + extra();
          const p = gsap.utils.clamp(0, 1, s / total);
          const ph = gsap.utils.clamp(0, 1, s / dist());
          progressRef.current = ph;
          const mid = ph * dist() + window.innerWidth * 0.5;
          let panel = panels.length - 1;
          for (let i = 0; i < panels.length; i++) {
            const el = panels[i];
            if (mid >= el.offsetLeft && mid < el.offsetLeft + el.offsetWidth) {
              panel = i;
              break;
            }
          }
          const swapAt = reduce ? dist() : dist() + extra() * (EXIT.swap / EXIT.total);
          if (s > swapAt) panel = panels.length; // the revealed section
          hiddenRef.current = s > swapAt;

          /* send the numbers to the global <Scoreboard /> */
          const nextUi = {
            tick: Math.round(p * TICKS),
            count: Math.round(gsap.utils.mapRange(0, 1, COUNT_FROM, COUNT_TO, p)),
            panel,
            label: labels[panel] ?? labels[0],
            total: labels.length,
          };
          const key = `${nextUi.tick}|${nextUi.count}|${nextUi.panel}`;
          if (key !== lastUiRef.current) {
            lastUiRef.current = key;
            window.dispatchEvent(new CustomEvent("scoreboard:update", { detail: nextUi }));
          }
        },
      });
      stRef.current = pinTrigger;

      /* 2) the horizontal run: first `dist` pixels of scrolling */
      const scrollTween = gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => "+=" + dist(),
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      if (reduce) {
        /* no strips / no motion: just show the next section once reached */
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: () => "top+=" + dist() + " top",
          onEnter: () => gsap.set(next, { autoAlpha: 1 }),
          onLeaveBack: () => gsap.set(next, { autoAlpha: 0 }),
        });
        return;
      }

      /* hero headline: plays once on load */
      gsap.fromTo(
        "[data-intro]",
        { "--p": 100, x: 80 },
        { "--p": 0, x: 0, duration: 1.5, stagger: 0.18, ease: "power3.out", delay: 0.25 }
      );
      gsap.from("[data-sub]", { opacity: 0, duration: 1, delay: 1.2 });

      /* feature cards: slide up/left into place as the track moves */
      gsap.utils.toArray("[data-slot]", track).forEach((slot, i) => {
        const card = slot.querySelector("[data-card]");
        const copy = slot.querySelector("[data-copy]");
        const off = CARD_OFFSETS[i % CARD_OFFSETS.length];
        gsap.fromTo(
          card,
          { x: 160, y: off + 150, opacity: 0 },
          {
            x: 0,
            y: off,
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: slot,
              containerAnimation: scrollTween,
              start: "left 108%",
              end: "left 52%",
              scrub: true,
            },
          }
        );
        gsap.fromTo(
          copy,
          { opacity: 0 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: slot,
              containerAnimation: scrollTween,
              start: "left 75%",
              end: "left 45%",
              scrub: true,
            },
          }
        );
      });

      /* closing headline: wipe in, line by line */
      const closing = track.querySelector("[data-closing]");
      if (closing) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: closing,
              containerAnimation: scrollTween,
              start: "left 100%",
              end: "left 30%",
              scrub: true,
            },
          })
          .fromTo(
            closing.querySelectorAll("[data-line]"),
            { "--p": 100, x: 80 },
            { "--p": 0, x: 0, ease: "none", stagger: 0.3 }
          );
      }

      /* 3) the exit, one scrubbed timeline:
            a. strips sweep in and cover the first section
            b. next section is swapped in underneath
            c. strips retract (same stagger) revealing it
            d. title lines reveal one by one, then subject grows, title lines
               drift at different speeds (parallax), and the vertical badge
               moves in and settles on the subject */
      const strips = gsap.utils.toArray("[data-strip]", pinRef.current);
      const exitTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: () => "top+=" + dist() + " top",
          end: () => "+=" + extra(),
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      strips.forEach((el, i) => {
        const fromLeft = i % 2 === 0;
        exitTl.fromTo(
          el,
          { clipPath: fromLeft ? HIDDEN_L : HIDDEN_R },
          { clipPath: SHOWN, ease: "none", duration: 0.45 },
          i * 0.055
        );
      });

      exitTl.set(next, { autoAlpha: 1 }, EXIT.swap);

      strips.forEach((el, i) => {
        const fromLeft = i % 2 === 0;
        exitTl.fromTo(
          el,
          { clipPath: SHOWN },
          {
            clipPath: fromLeft ? HIDDEN_L : HIDDEN_R,
            ease: "none",
            duration: 0.45,
            immediateRender: false,
          },
          EXIT.retract + i * 0.055
        );
      });

      const gd = EXIT.total - EXIT.grow;
      exitTl.fromTo(
        "[data-subject]",
        { scale: 1, xPercent: 0 },
        {
          scale: 1.14,
          xPercent: -3,
          transformOrigin: "50% 100%",
          ease: "power1.inOut",
          duration: gd,
          immediateRender: false,
        },
        EXIT.grow
      );

      /* title lines: staggered reveal as the strips leave, then per-line parallax */
      const tLines = gsap.utils.toArray("[data-tline]", pinRef.current);
      tLines.forEach((el, i) => {
        const inner = el.querySelector("[data-tline-in]");

        /* reveal: slides up out of its mask with a slight skew, one line after another */
        exitTl.fromTo(
          inner,
          { yPercent: 110, skewY: 6 },
          { yPercent: 0, skewY: 0, ease: "power3.out", duration: 0.6 },
          EXIT.retract + 0.5 + i * 0.12
        );

        /* parallax: each line drifts a different distance during the grow phase */
        exitTl.fromTo(
          el,
          { x: 0, y: 0 },
          {
            x: el.dataset.dx,
            y: el.dataset.dy,
            ease: "none",
            duration: gd,
            immediateRender: false,
          },
          EXIT.grow
        );
      });

      /* badge: ONE continuous curve (no stop between the two stages).
         It starts big at the right edge, passes a mid waypoint, and lands on the
         subject at 50% opacity. Position and scale follow a quadratic Bezier that
         goes exactly through the waypoint; scale is interpolated in log space so
         the shrink feels even. The text is rendered at its LARGEST size and only
         ever scaled DOWN, so it stays crisp and the GPU just moves one layer. */
      const badge = pinRef.current.querySelector("[data-badge]");
      const box = pinRef.current.querySelector("[data-subject-box]");
      const geo = { S: null, M: null, E: null };
      const proxy = { t: 0 };

      const remeasure = () => {
        const pin = pinRef.current;
        const W = pin.clientWidth;
        const H = pin.clientHeight;
        const narrowNow = W < 768;

        badge.style.fontSize = "100px";
        const lenEm = badge.offsetHeight / 100; // text length in em
        /* FINAL SIZE: text is 84% of the screen height (62% on phones) */
        const fontEnd = (H * (narrowNow ? 0.62 : 0.84)) / lenEm;
        badge.style.fontSize = fontEnd + "px";

        const column = badge.offsetWidth;
        /* FINAL POSITION: must match left-[72.9%] / max-md:left-[90%] on the badge in the JSX */
        const endX = W * (narrowNow ? 0.9 : 0.729);
        const startX = W * 0.985 - column / 2; // starts at the right edge

        geo.S = { x: startX - endX, y: 0, ls: 0 };
        geo.M = { x: (startX - endX) * 0.5, y: 0, ls: 0 }; // straight line, no resizing
        geo.E = { x: 0, y: 0, ls: 0 };
      };

      const bez = (a, c, b, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;
      const smooth01 = (v) => {
        const k = Math.min(1, Math.max(0, v));
        return k * k * (3 - 2 * k);
      };
      const apply = () => {
        if (!geo.S) return;
        const t = proxy.t;
        const { S, M, E } = geo;
        const ctrl = (k) => 2 * M[k] - (S[k] + E[k]) / 2; // passes through M at t = 0.5
        const x = bez(S.x, ctrl("x"), E.x, t);
        const y = bez(S.y, ctrl("y"), E.y, t);
        const sc = Math.exp(bez(S.ls, ctrl("ls"), E.ls, t));
        const o = 1 - 0.2 * smooth01((t - 0.4) / 0.6); // full opacity, settles at 80%
        badge.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${sc.toFixed(4)})`;
        badge.style.opacity = o.toFixed(3);
      };

      remeasure();
      apply();
      const onRefresh = () => {
        remeasure();
        apply();
      };
      ScrollTrigger.addEventListener("refresh", onRefresh);
      offFns.push(() => ScrollTrigger.removeEventListener("refresh", onRefresh));

      exitTl.fromTo(
        proxy,
        { t: 0 },
        { t: 1, ease: "sine.inOut", duration: gd, onUpdate: apply },
        EXIT.grow
      );

      /* fonts change text length: re-measure once they are ready */
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    }, pinRef);

    return () => {
      offFns.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  /* ---------------- Three.js: drifting dust, parallaxed by scroll ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    } catch {
      return; // WebGL unavailable: the section works fine without the dust
    }
    const lowPower = window.innerWidth < 768;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
    camera.position.z = 6;

    const N = lowPower ? 320 : 650;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const speed = new Float32Array(N);
    const phase = new Float32Array(N);
    const cream = new THREE.Color(C.cream);
    const teal = new THREE.Color(C.tealSoft);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7.4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      speed[i] = 0.03 + Math.random() * 0.12;
      phase[i] = Math.random() * Math.PI * 2;
      const c = cream.clone().lerp(teal, Math.random() < 0.3 ? Math.random() : 0);
      col.set([c.r, c.g, c.b], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas.parentElement;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let smooth = 0;
    const clock = new THREE.Clock();

    const frame = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      if (ambientRef.current) {
        for (let i = 0; i < N; i++) {
          let y = pos[i * 3 + 1] + speed[i] * dt;
          if (y > 3.7) y = -3.7;
          pos[i * 3 + 1] = y;
          pos[i * 3] += Math.sin(t * 0.4 + phase[i]) * 0.0006;
        }
        geo.attributes.position.needsUpdate = true;
      }
      smooth += (progressRef.current - smooth) * 0.06;
      points.position.x = -smooth * 6;
      if (!hiddenRef.current) renderer.render(scene, camera); // no GPU work while covered
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, []);

  /* ---------------- equalizer icon + ambient toggle ---------------- */
  useEffect(() => {
    ambientRef.current = ambient;
    const bars = barsRef.current.filter(Boolean);
    gsap.killTweensOf(bars);
    if (ambient && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      bars.forEach((b, i) =>
        gsap.to(b, {
          scaleY: gsap.utils.random(0.35, 1),
          duration: gsap.utils.random(0.35, 0.7),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.08,
          transformOrigin: "50% 100%",
        })
      );
    } else {
      gsap.set(bars, { scaleY: 0.25, transformOrigin: "50% 100%" });
    }
    return () => gsap.killTweensOf(bars);
  }, [ambient]);

  /* ---------------- play button: step to the next stop ---------------- */
  const goNext = () => {
    const st = stRef.current;
    const track = trackRef.current;
    if (!st || !track) return;
    const dist = Math.max(1, track.scrollWidth - window.innerWidth);
    const pos = gsap.utils.clamp(0, dist, st.scroll() - st.start);
    const stops = Array.from(track.querySelectorAll("[data-stop]")).map((el) =>
      gsap.utils.clamp(0, dist, el.offsetLeft + el.offsetWidth / 2 - window.innerWidth / 2)
    );
    const target = stops.find((s) => s > pos + 12) ?? 0; // wraps to the start
    gsap.to(window, {
      scrollTo: { y: st.start + target, autoKill: true },
      duration: 1.4,
      ease: "power2.inOut",
    });
  };

  /* the global <Scoreboard /> play button asks this section to step forward */
  useEffect(() => {
    const handler = () => goNext();
    window.addEventListener("scoreboard:next", handler);
    return () => window.removeEventListener("scoreboard:next", handler);
  }, []);

  const lineBase =
    "block whitespace-nowrap uppercase leading-[0.92] tracking-[-0.01em] will-change-transform";
  const heroSize = "text-[9.2vw] md:text-[clamp(2.2rem,5.6vw,6rem)]";
  const closeSize = "text-[12vw] md:text-[clamp(2.4rem,7vw,7rem)]";

  return (
    <section
    id="programs"
      ref={sectionRef}
      aria-label="Product technology"
      className="relative w-full text-[#f3eee0]"
      style={{ background: C.bg }}
    >
      <EdgeFade top bottom />
      <div ref={pinRef} className="relative h-[100svh] w-full overflow-hidden">
        {/* Three.js dust */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>

        {/* Horizontal track */}
        <div ref={trackRef} className="relative z-10 flex h-full w-max items-center">
          {/* Panel 1: hero */}
          <div data-panel data-stop className="relative h-full w-screen shrink-0">
            <div className="absolute inset-y-0 left-0 w-[85%] md:w-[58%]">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt=""
                  className="h-full w-full object-cover object-center"
                  draggable={false}
                />
              ) : (
                <div
                  className="h-full w-full"
                  style={{
                    background: `radial-gradient(ellipse at 35% 60%, rgba(127,224,210,.16), transparent 55%),
                      radial-gradient(ellipse at 30% 100%, rgba(243,238,224,.12), transparent 50%),
                      linear-gradient(180deg, #1c1814, #110f0d)`,
                  }}
                />
              )}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(90deg, transparent 30%, ${C.bg} 100%), linear-gradient(0deg, rgba(17,15,13,.7), transparent 40%)`,
                }}
              />
            </div>

            <div className="absolute left-[6vw] top-[44%] -translate-y-1/2 md:left-[50vw]">
              <h2 className="m-0 font-normal">
                {heroLines.map((line, i) => (
                  <span
                    key={line}
                    data-intro
                    className={`${lineBase} ${heroSize}`}
                    style={{
                      ...wipeStyle,
                      color: i === 0 ? C.cream : C.teal,
                      paddingLeft: i === 2 ? "0.45em" : 0,
                    }}
                  >
                    {line}
                  </span>
                ))}
              </h2>
              <p
                data-sub
                className="mt-6 text-[11px] uppercase leading-[1.7] tracking-[0.2em] text-white/50"
                style={{ fontFamily: MONO }}
              >
                {heroSub.map((s) => (
                  <span key={s} className="block">
                    {s}
                  </span>
                ))}
              </p>
            </div>
          </div>

          {/* Panel 2: feature cards */}
          <div
            data-panel
            className="flex h-full shrink-0 items-center gap-[10vw] px-[12vw]"
          >
            {features.map((f, i) => (
              <div key={f.title} data-slot data-stop className="shrink-0">
                <FeatureCard feature={f} index={i} total={features.length} />
              </div>
            ))}
          </div>

          {/* Panel 3: closing headline */}
          <div data-panel data-stop className="relative h-full w-screen shrink-0">
            <div
              data-closing
              className="absolute left-[6vw] top-1/2 -translate-y-1/2 md:left-[22vw]"
            >
              <h2 className="m-0 font-normal">
                {closingLines.map((line, i) => (
                  <span
                    key={line}
                    data-line
                    className={`${lineBase} ${closeSize}`}
                    style={{
                      ...wipeStyle,
                      color: i === 0 ? C.cream : C.teal,
                    }}
                  >
                    {line}
                  </span>
                ))}
              </h2>
            </div>
          </div>
        </div>

        {/* Next section: sits under the strips, swapped in once they cover the screen */}
        <div
          ref={nextRef}
          className="absolute inset-0 z-[15] overflow-hidden"
          style={{ opacity: 0, visibility: "hidden", background: C.bg }}
        >
          {/* background: dark teal. A photo, if given, is turned into a teal duotone
              so warm colours (orange courts etc.) never leak through. */}
          <div className="absolute inset-0" style={{ background: C.deepTeal }}>
            {bgImage ? (
              <>
                <img
                  src={bgImage}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ filter: "grayscale(1) contrast(1.08) brightness(0.9)" }}
                  draggable={false}
                />
                {/* colour the greyscale photo teal, then deepen it */}
                <div
                  className="absolute inset-0"
                  style={{ background: "#1f9e92", mixBlendMode: "color", opacity: 0.9 }}
                />
                <div className="absolute inset-0" style={{ background: "rgba(6,22,21,.55)" }} />
              </>
            ) : (
              <div
                className="h-full w-full"
                style={{
                  background: `radial-gradient(ellipse at 20% 0%, rgba(43,181,165,.30), transparent 55%),
                    radial-gradient(ellipse at 85% 100%, rgba(43,181,165,.18), transparent 50%),
                    linear-gradient(180deg, #06100f 0%, #0b2624 45%, #11403c 100%)`,
                }}
              />
            )}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* title lines sit BEHIND the subject; each one is positioned and animated on its own.
              Edit TITLE_LAYOUT (top of file) to move them or change their parallax. */}
          {[
            { k: "get", text: preTitle, color: C.cream, tracking: "0.18em" },
            { k: "main", text: impactTitle, color: C.teal, tracking: "0" },
            { k: "with", text: postTitle, color: C.cream, tracking: "0" },
          ].map(({ k, text, color, tracking }) => {
            const L = TITLE_LAYOUT[k][narrow ? "mobile" : "desktop"];
            return (
              <div
                key={k}
                data-tline
                data-dx={L.dx}
                data-dy={L.dy}
                className="absolute z-[1] will-change-transform"
                style={{ left: L.left, top: L.top }}
              >
                {/* mask: the line slides up from below this box */}
                <div className="overflow-hidden px-[0.04em] pb-[0.08em]">
                  <span
                    data-tline-in
                    className="block whitespace-nowrap font-normal uppercase leading-[0.85] will-change-transform"
                    style={{
                      fontFamily: DISPLAY,
                      fontSize: L.size,
                      color,
                      letterSpacing: tracking,
                    }}
                  >
                    {text}
                  </span>
                </div>
              </div>
            );
          })}

          {/* subject: transparent PNG placed OVER the title */}
          <div
            data-subject-box
            className="absolute bottom-0 left-[58%] z-[2] h-[66svh] -translate-x-1/2 md:left-[44%] md:h-[90svh]"
          >
            <div data-subject className="relative h-full will-change-transform">
              {subjectSrc ? (
                <img
                  src={subjectSrc}
                  alt={subjectAlt}
                  className="h-full w-auto max-w-none object-contain"
                  draggable={false}
                  onLoad={() => ScrollTrigger.refresh()}
                />
              ) : (
                <Silhouette />
              )}
            </div>
          </div>
          {/* vertical badge: outside the subject so its zoom can't move it.
              Rests at left 72.9% / top 47.6%, 84% of the screen height tall. */}
          <span
            data-badge
            className="absolute left-[72.9%] top-[47.6%] z-[3] whitespace-nowrap text-[15svh] font-normal uppercase leading-none tracking-[0.02em] will-change-[transform,opacity] max-md:left-[90%] max-md:top-[50%] max-md:text-[10svh]"
            style={{
              fontFamily: DISPLAY,
              color: C.cream,
              writingMode: "vertical-rl",
              /* static fallback (reduced motion); the scroll animation overrides these */
              transform: "translate(-50%, -50%)",
              opacity: 0.8,
              backfaceVisibility: "hidden",
            }}
          >
            {badgeText}
          </span>
        </div>

        {/* Exit strips: sit above the track + next section, below the fixed chrome */}
        <div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
          {Array.from({ length: STRIPS }).map((_, i) => (
            <div
              key={i}
              data-strip
              className="absolute inset-x-0"
              style={{
                top: `calc(${i} * 100% / ${STRIPS})`,
                height: `calc(100% / ${STRIPS} + ${tooth}px)`,
                clipPath: i % 2 === 0 ? HIDDEN_L : HIDDEN_R,
                willChange: "clip-path",
              }}
            >
              <div
                className="h-full w-full"
                style={{
                  background: stripColors[i % stripColors.length],
                  clipPath: zigzag,
                }}
              />
            </div>
          ))}
        </div>

        {/* Ambient-motion toggle (bottom-left) */}
        <button
          type="button"
          onClick={() => setAmbient((v) => !v)}
          aria-pressed={ambient}
          aria-label={ambient ? "Pause ambient motion" : "Resume ambient motion"}
          className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-4 z-30 grid size-11 place-items-center rounded-full border border-white/15 bg-black/40 backdrop-blur focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7fe0d2] sm:bottom-6 sm:left-6"
        >
          <span className="flex h-4 items-end gap-[3px]" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                ref={(el) => (barsRef.current[i] = el)}
                className="h-full w-[3px] bg-[#f3eee0]/80"
                style={{ transform: "scaleY(0.25)" }}
              />
            ))}
          </span>
        </button>

        {/* Scoreboard moved out: render <Scoreboard /> once in App.jsx */}
      </div>
    </section>
  );
}