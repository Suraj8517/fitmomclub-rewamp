import { useEffect, useRef, useState } from "react";
import bg from "../assets/testbg.jpg";
import EdgeFade from "./EdgeFade";

const BG_IMAGE = bg; // dark textured bg (stays fixed while you scroll)

const TESTIMONIALS = [
  {
    name: "",
    meta: "",
    video: "https://res.cloudinary.com/q1vba78b/video/upload/v1783062275/04-04-2026_Transformation__1080X1920_yxwger.mp4",
    poster: "https://res.cloudinary.com/q1vba78b/image/upload/v1783062275/04-04-2026_Transformation__1080X1920_yxwger.jpg",
    quote: ["Every mom  ", "has a story.", " Here are the transformations that inspire us"], // middle part = accent colour
  },
  {
    name: "",
    meta: "",
    video: "https://res.cloudinary.com/q1vba78b/video/upload/v1783062396/TR_4_vb92li.mp4",
    poster: "https://res.cloudinary.com/q1vba78b/image/upload/v1783062396/TR_4_vb92li.jpg",
    quote: ["“These socks really form in your feet and help you move a lot ", "better", ".”"],
  },
  // add more…
];

/* one entry per clip, so the big video and the peek can never be the same file */
const CLIPS = TESTIMONIALS.filter(
  (t, i, arr) => arr.findIndex((x) => x.video === t.video) === i
);

const ORANGE = "#2ec4b6"; // accent (teal)
const CREAM = "#f4efe3";
const INK = "#14110f";
const font = {
  display: { fontFamily: "'Anton', Impact, 'Bebas Neue', sans-serif" },
  hand: { fontFamily: "'Caveat', 'Segoe Script', cursive" },
  mono: { fontFamily: "'Space Mono', ui-monospace, monospace" },
};

/* Desktop layout is drawn on a 1913 × 1450 canvas (your reference size)
   and converted to % so it scales perfectly with the viewport.        */
const W = 1913;
const H = 1450;
const place = (l, t, w) => ({
  "--l": `${((l / W) * 100).toFixed(3)}%`,
  "--t": `${((t / H) * 100).toFixed(3)}%`,
  ...(w ? { "--w": `${((w / W) * 100).toFixed(3)}%` } : {}),
});
const AT = "lg:absolute lg:left-[var(--l)] lg:top-[var(--t)]";

const pad = (n) => String(n).padStart(2, "0");
const timecode = (s) => `00:${pad(Math.floor(s / 60))}:${pad(Math.floor(s % 60))}`;

/* ------------------------------------------------------------------ */
/*  2. SMALL PIECES                                                    */
/* ------------------------------------------------------------------ */
function Handles() {
  const dot = "absolute h-[6px] w-[6px] bg-white";
  return (
    <>
      <span className={`${dot} -left-[3px] -top-[3px]`} />
      <span className={`${dot} -right-[3px] -top-[3px]`} />
      <span className={`${dot} -bottom-[3px] -left-[3px]`} />
      <span className={`${dot} -bottom-[3px] -right-[3px]`} />
    </>
  );
}

function Crosshair({ style }) {
  return (
    <span aria-hidden style={style} className="pointer-events-none absolute hidden h-4 w-4 lg:block lg:left-[var(--l)] lg:top-[var(--t)]">
      <span className="absolute left-1/2 top-0 h-full w-px bg-white/30" />
      <span className="absolute left-0 top-1/2 h-px w-full bg-white/30" />
    </span>
  );
}

function Corner({ className = "" }) {
  return <span aria-hidden className={`pointer-events-none absolute h-10 w-10 border-white/40 ${className}`} />;
}

/** Vertical 9:16 video with camera HUD */
function VideoFrame({ item, cam, inView, muted, onEnded, loop = false, preview = false }) {
  const ref = useRef(null);
  const [t, setT] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (inView) v.play().catch(() => setPaused(true));
    else v.pause();
  }, [inView]);

  return (
    <div className="relative aspect-[9/16] w-full border border-white/70 bg-black">
      <Handles />
      <video
        ref={ref}
        src={item.video}
        poster={item.poster}
        muted={preview ? true : muted}
        loop={preview || loop}
        playsInline
        preload="metadata"
        autoPlay
        onEnded={onEnded}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onTimeUpdate={(e) => !preview && setT(e.currentTarget.currentTime)}
        className="h-full w-full object-cover"
      />

      {/* dark overlay over the video (change /40 to make it lighter or darker) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black/40"
      />

      <div
        style={font.mono}
        className="pointer-events-none absolute inset-x-0 top-0 flex justify-between bg-gradient-to-b from-black/55 to-transparent px-3 py-2 text-[10px] tracking-widest text-white"
      >
        <span className="flex items-center gap-1.5">
          <i className="h-1.5 w-1.5 rounded-full bg-white/30" /> Rec
        </span>
        <span>{timecode(t)}</span>
      </div>
      <div
        style={font.mono}
        className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/55 to-transparent px-3 py-2 text-[10px] tracking-widest text-white/80"
      >
        <span>Cam {cam}</span>
        <span>9:16 · 60fps</span>
      </div>
      {!preview && paused && inView && (
        <button
          onClick={() => ref.current?.play()}
          style={font.mono}
          className="absolute right-3 top-1/2 flex items-center gap-1.5 rounded-full bg-[#f4efe3] px-2.5 py-1 text-[9px] uppercase tracking-widest text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <i className="h-1.5 w-1.5 rounded-full" style={{ background: ORANGE }} /> Play
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  3. SECTION                                                         */
/* ------------------------------------------------------------------ */
export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  const total = CLIPS.length;
  const next = (active + 1) % total;
  const go = (i) => setActive((i + total) % total);
  const item = CLIPS[active];

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 });
    if (sectionRef.current) io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  const headline = "relative z-20 uppercase text-[19vw] leading-[0.84] tracking-[-0.01em] sm:text-[17vw] lg:text-[13.5vw] lg:leading-[0.8]";

  return (
    <section id="testimonials"
      ref={sectionRef}
      className="relative isolate z-10 min-h-[100svh] overflow-x-clip bg-[#14110f] py-12 text-white"
      /* clip-path (not overflow) so the fixed bg is cut to this section AND sticky children still work */
      style={{ clipPath: "inset(0)" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&family=Caveat:wght@500&family=Space+Mono:wght@400;700&display=swap');`}</style>

      <EdgeFade top />

      {/* FIXED BACKGROUND */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(14,11,9,.5),rgba(14,11,9,.65)), url(${BG_IMAGE})` }}
      />

      {/* section chrome */}
      <Corner className="left-4 top-4 border-l border-t sm:left-9 sm:top-9" />
      <Corner className="right-4 top-4 border-r border-t sm:right-9 sm:top-9" />
      <span aria-hidden className="pointer-events-none absolute right-[2.9%] top-[135px] hidden h-[14px] w-[8px] lg:block" style={{ background: ORANGE }} />
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-[6.5%] hidden w-px bg-white/[0.06] lg:block" />
      <span aria-hidden className="pointer-events-none absolute inset-y-0 right-[2.6%] hidden w-px bg-white/[0.06] lg:block" />

      {/* STAGE */}
      <div className="relative flex flex-col px-5 pb-10 pt-20 sm:px-8 lg:block lg:aspect-[1913/1450] lg:px-0 lg:pb-0 lg:pt-0">
        {/* court lines (desktop) */}
        <svg
          aria-hidden
          viewBox={`0 0 ${W} ${H}`}
          className="pointer-events-none absolute inset-0 hidden h-full w-full text-white/[0.09] lg:block"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="130" cy="540" r="215" />
          <circle cx="1960" cy="420" r="300" strokeDasharray="6 8" />
          <rect x="1455" y="1190" width="405" height="243" />
          <circle cx="1825" cy="1310" r="20" />
          <path d="M1455 1190 A 150 150 0 0 1 1455 1433" />
        </svg>
        <Crosshair style={place(950, 141)} />
        <Crosshair style={place(119, 532)} />
        <Crosshair style={place(950, 532)} />

        {/* HEADLINE — sits ABOVE the videos, like the reference */}
        <h2
          style={{ ...font.display, color: CREAM }}
          className="pointer-events-none relative z-20 lg:absolute lg:inset-0"
        >
          <span style={place(135, 48)} className={`${headline} block ${AT}`}>Word</span>
          <span style={place(325, 293)} className={`${headline} block ml-[6%] lg:ml-0 ${AT}`}>
            From <span className="text-[#2EC4B6]">the</span>
          </span>
          <span style={place(440, 713)} className={`${headline} block ml-[10%] whitespace-nowrap lg:ml-0 ${AT}`}>
            Members
            <span
              aria-hidden
              className="ml-[0.04em] inline-block h-[0.17em] w-[0.117em] align-baseline"
              style={{ background: ORANGE }}
            />
          </span>
        </h2>

        {/* ACTIVE VIDEO */}
        <figure
          style={place(1212, 70, 395)}
          className={`relative z-10 mx-auto mt-8 w-[68vw] max-w-[300px] lg:mt-0 lg:w-[var(--w)] lg:max-w-none ${AT}`}
        >
          <VideoFrame
            key={active}
            item={item}
            cam={pad(active + 1)}
            inView={inView}
            muted={muted}
            loop={total === 1}
            onEnded={() => go(active + 1)}
          />
          <figcaption style={font.mono} className="mt-4 text-xs uppercase tracking-[0.2em] lg:text-[0.8vw]">
            <p className="font-bold text-white">{item.name}</p>
            <p className="mt-1 text-white/45">{item.meta}</p>
          </figcaption>
        </figure>

        {/* NEXT VIDEO PEEK (desktop): only when there is a different clip to show */}
        {total > 1 && (
          <button
            style={place(395, 797, 347)}
            onClick={() => go(next)}
            aria-label={`Play testimonial from ${CLIPS[next].name}`}
            className={`z-10 hidden text-left lg:block lg:w-[var(--w)] ${AT}`}
          >
            <VideoFrame key={`peek-${next}`} item={CLIPS[next]} cam={pad(next + 1)} inView={inView} preview />
          </button>
        )}

        {/* QUOTE — above the video, overlapping it like the reference */}
        <blockquote
          key={`q-${active}`}
          style={{ ...font.hand, ...place(877, 578) }}
          className={`relative z-30 mt-8 max-w-md text-[24px] italic leading-[1.35] sm:text-3xl lg:mt-0 lg:max-w-[25vw] lg:text-[1.85vw] ${AT}`}
        >
          <span className="mb-5 block h-px w-[74px]" style={{ background: ORANGE }} />
          {item.quote[0]}
          <span style={{ color: ORANGE }}>{item.quote[1]}</span>
          {item.quote[2]}
        </blockquote>
      </div>
    </section>
  );
}