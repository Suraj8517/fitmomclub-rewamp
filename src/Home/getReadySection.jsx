import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const LIGHT = "#e3f4f0"; // pale teal floor

const INK = "#14110f";
const ACCENT = "#1fb3a5"; // teal, a touch deeper than #2ec4b6 so it reads on the pale floor

const font = {
  display: { fontFamily: "'Anton', Impact, 'Bebas Neue', sans-serif" },
  mono: { fontFamily: "'Space Mono', ui-monospace, monospace" },
};

const css = `

.gr-stage {
  --d1: 0; --d2: 0; --c: 0; --h: 0; --s1: 0; --s2: 0; --r: 0;
  /* mobile defaults */
  --bw: min(48vw, 36svh);     /* bag width (bigger) */
  --bt: 62%;                  /* vertical center of the bag (50% = exact center) */
  --sx0: 27vw;                /* starting half-gap from center */
  --fs: min(15vw, 7svh);
  --ht: 19%;
}
@media (min-width: 1024px) {
  .gr-stage {
    --bw: min(20vw, 36svh);   /* bag width (bigger) */
    --bt: 62%;
    --sx0: 19vw;
    --fs: min(8.2vw, 17svh);
    --ht: 15%;
  }
}

/* horizontal offset: starts at --sx0, ends at exactly half a bag width,
   so the two bags sit side by side, centered as a pair on the page */
.gr-stage { --sx: calc(var(--sx0) * (1 - var(--c)) + var(--bw) * 0.5 * var(--c)); }

/* anchored to the vertical center (--bt shifts it: 50% = exact center) */
.gr-bag {
  position: absolute; left: 50%; top: var(--bt);
  width: var(--bw);
  will-change: transform; backface-visibility: hidden;
}
.gr-l {
  transform:
    translate3d(calc(-50% - var(--sx)), calc(-50% + (1 - var(--d1)) * -110svh), 0)
    rotate(calc(-2deg * (1 - var(--c)) - (1 - var(--d1)) * 12deg));
}
.gr-r {
  transform:
    translate3d(calc(-50% + var(--sx)), calc(-50% + (1 - var(--d2)) * -110svh), 0)
    rotate(calc(2deg * (1 - var(--c)) + (1 - var(--d2)) * 12deg));
}
.gr-bag img { display: block; width: 100%; height: auto; user-select: none; -webkit-user-drag: none; }

/* soft shadow: gradient only, no filter (blur on animated layers is costly) */
.gr-shadow {
  position: absolute; left: 4%; right: 4%; bottom: -4%; height: 8%;
  background: radial-gradient(closest-side, rgba(40,60,56,.4), transparent);
}
.gr-l .gr-shadow { opacity: var(--s1); }
.gr-r .gr-shadow { opacity: var(--s2); }

.gr-veil { opacity: calc((1 - var(--r)) * .5); }
.gr-stage[data-revealed="1"] .gr-veil { display: none; }

.gr-head { top: var(--ht); font-size: var(--fs); opacity: var(--h); }
.gr-cta { opacity: var(--c); transform: translateY(calc((1 - var(--c)) * 24px)); }

/* static grain on its own layer: no blend mode, never repainted while scrolling */
.gr-grain { transform: translateZ(0); }

@media (prefers-reduced-motion: reduce) {
  .gr-bag { will-change: auto; }
}
`;

/**
 * runway : extra scroll (in svh) after the testimonials are gone, during which
 *          the bags drop. Bigger = slower drop.
 * scrub  : GSAP smoothing in seconds. Use `true` for an exact 1:1 scroll feel.
 */
export default function GetReadySection({
  leftSrc,
  rightSrc,
  ctaHref = "#",
  ctaLabel = "Order the pair",
  eyebrow = "Your complete fitness companion",
  runway = 160,
  scrub = 0.5,
}) {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const R = runway / 100; // runway in "screens"
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + window.innerHeight * (1 + R),
          scrub: reduce ? true : scrub,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // once the testimonials are fully gone, the veil is removed from rendering
            const revealed = self.progress >= 1 / (1 + R) ? "1" : "0";
            if (stage.dataset.revealed !== revealed) stage.dataset.revealed = revealed;
          },
        },
      });

      // timeline length = 1 (testimonials leave) + R (bags play)
      tl.fromTo(stage, { "--r": 0 }, { "--r": 1, duration: 1 }, 0);

      // left bag drops, right bag a beat later
      tl.fromTo(stage, { "--d1": 0 }, { "--d1": 1, ease: "power3.out", duration: 0.6 * R }, 1);
      tl.fromTo(
        stage,
        { "--d2": 0 },
        { "--d2": 1, ease: "power3.out", duration: 0.6 * R },
        1 + 0.08 * R
      );

      // shadows appear as each bag lands
      tl.fromTo(stage, { "--s1": 0 }, { "--s1": 1, duration: 0.2 * R }, 1 + 0.3 * R);
      tl.fromTo(stage, { "--s2": 0 }, { "--s2": 1, duration: 0.2 * R }, 1 + 0.38 * R);

      // headline fades in while the bags fall
      tl.fromTo(stage, { "--h": 0 }, { "--h": 1, duration: 0.5 * R }, 1);

      // bags converge to the exact center + button appears
      tl.fromTo(
        stage,
        { "--c": 0 },
        { "--c": 1, ease: "power1.inOut", duration: 0.35 * R },
        1 + 0.65 * R
      );
    }, section);

    return () => ctx.revert();
  }, [runway, scrub]);

  return (
    <section 
      ref={sectionRef}
      className="relative z-0"
      style={{
        height: `calc(200svh + ${runway}svh)`,
        marginTop: "-100svh",
        pointerEvents: "none", // never block the section above
      }}
    >
      <style>{css}</style>

      <div
        ref={stageRef}
        className="gr-stage sticky top-0 h-[100svh] w-full overflow-hidden bg-white"
        style={{
          pointerEvents: "auto",
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 z-10 flex flex-col items-center text-center"
          style={{ top: "calc(var(--ht) - 4.5%)" }}
        >
          <p
            style={{ ...font.mono, color: ACCENT, opacity: "var(--h)" }}
            className="text-[11px] uppercase tracking-[0.3em] sm:text-xs lg:text-[0.85vw]"
          >
            {eyebrow}
          </p>
        </div>

        <h2
          style={{ ...font.display, color: INK }}
          className="gr-head pointer-events-none absolute inset-x-0 z-10 m-0 whitespace-nowrap text-center uppercase leading-[0.9] tracking-[-0.01em] "
        >
          <span style={{ color: ACCENT }}>FitMom Club </span> App
        </h2>

        {/* bags */}
        <div className="gr-bag gr-l z-20">
          <img
            src={leftSrc}
            alt="White crew socks in a clear pouch"
            draggable={false}
            decoding="async"
            onLoad={() => ScrollTrigger.refresh()}
          />
          <span className="gr-shadow" aria-hidden />
        </div>
        <div className="gr-bag gr-r z-20 " >
          <img
            src={rightSrc}
            alt="Black crew socks in a clear pouch"
            draggable={false}
            decoding="async"
            onLoad={() => ScrollTrigger.refresh()}
          />
          <span className="gr-shadow" aria-hidden />
        </div>

     
        {/* darkening veil: fades away as the testimonials slide off, for depth */}
        <div aria-hidden className="gr-veil pointer-events-none absolute inset-0 z-[45] bg-black" />

        {/* paper grain: static, normal blend (no mix-blend-mode) */}
        <div
          aria-hidden
          className="gr-grain pointer-events-none absolute inset-0 z-40"
        />
      </div>
    </section>
  );
}