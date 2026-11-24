import { PROGRAM_IMAGES } from "../../config"; // adjust if your config lives elsewhere

/* ------------------------------- tokens ------------------------------- */
export const C = {
  bg: "#110f0d",
  cream: "#f3eee0",
  teal: "#2bb5a5",
  tealSoft: "#7fe0d2",
  deepTeal: "#0b2624", // dark teal used for the next section background
};
export const DISPLAY = "'Anton', 'Bebas Neue', Impact, sans-serif";
export const MONO = "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace";
export const SANS = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

export const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;700&display=swap";

/* shared class strings */
export const LINE_BASE =
  "block whitespace-nowrap uppercase leading-[0.92] tracking-[-0.01em] will-change-transform";
export const HERO_SIZE = "text-[9.2vw] md:text-[clamp(2.2rem,5.6vw,6rem)]";
export const CLOSE_SIZE = "text-[12vw] md:text-[clamp(2.4rem,7vw,7rem)]";

/* Vertical offsets (px) so the cards sit staggered, like the reference */
export const CARD_OFFSETS = [-50, 90, -30, 80];

export const TITLE_LAYOUT = {
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

export const DEFAULT_FEATURES = [
  {
    tag: "Blossom",
    title: "Prenatal Care",
    subtitle: "Weight Management",
    body: "Complete prenatal wellness support with expert nutrition and fitness consultations, customised diet plans, twice-monthly reviews, WhatsApp meal tracking, 36+ live group workouts, and exclusive access to our recipe vault.",
    image: PROGRAM_IMAGES[0],
  },
  {
    tag: "Queen",
    title: "Postnatal Care",
    subtitle: "Weight Management",
    body: "Comprehensive postnatal wellness support with expert nutrition and fitness consultations, customised diet plans with monthly revisions, 41+ live postnatal & DR workout sessions, twice-monthly reviews, WhatsApp meal tracking, and exclusive recipe vault access.",
    image: PROGRAM_IMAGES[1],
  },
  {
    tag: "Pro",
    title: "No Health Conditions",
    subtitle: "Weight Management",
    body: "Personalised nutrition and fitness support with expert consultations, customised diet plans, 23+ live group workout sessions, twice-monthly diet reviews, daily WhatsApp meal tracking, and exclusive recipe vault access.",
    image: PROGRAM_IMAGES[4],
  },
  {
    tag: "Elite",
    title: "With Health Conditions",
    subtitle: "Weight Management",
    body: "Complete personalised fitness and nutrition coaching with expert consultations, customised diet and workout plans, 41+ live group workout sessions, twice-monthly reviews, daily WhatsApp meal tracking, and exclusive recipe vault access.",
    image: PROGRAM_IMAGES[2],
  },
  {
    tag: "Tone Up",
    title: "Fitness-Based Body Toning Program",
    subtitle: "Body Toning",
    body: "Personalised wellness coaching with smart nutrition guidance, exclusive 1:1 expert consultations, guided fitness training, and continuous progress monitoring.",
    image: PROGRAM_IMAGES[3],
  },
];

/* values the scroll code uses to drive the global Scoreboard */
export const TICKS = 28;
export const COUNT_FROM = 22;
export const COUNT_TO = 10;

/* Exit transition: horizontal strips with a zig-zag lower edge sweep in
   (alternating left / right) until the first section is covered, the next
   section is swapped in underneath, then the strips retract to reveal it. */
export const STRIPS = 14; // rows
/* timeline units for the exit (scrubbed by scroll) */
export const EXIT = {
  swap: 1.2, // moment the strips fully cover the screen
  retract: 1.2, // strips start leaving
  grow: 2.45, // after the strips are gone: subject grows, title drifts, vertical text scales down
  total: 4.3,
};
export const makeZigzag = (teeth, tooth) => {
  const pts = ["0% 0%", "100% 0%"];
  for (let k = teeth; k >= 0; k--) {
    const x = (k / teeth) * 100;
    pts.push(`${x}% ${k % 2 === 0 ? "100%" : `calc(100% - ${tooth}px)`}`);
  }
  return `polygon(${pts.join(",")})`;
};
export const HIDDEN_L = "inset(0% 100% 0% 0%)";
export const HIDDEN_R = "inset(0% 0% 0% 100%)";
export const SHOWN = "inset(0% 0% 0% 0%)";

/* Gradient mask: --p goes 100 -> 0 to wipe a line in from the right,
   fading through its own colour (cream/teal) into the dark background. */
export const wipeStyle = {
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