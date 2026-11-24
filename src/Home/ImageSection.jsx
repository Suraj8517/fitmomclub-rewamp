import React, { useMemo, useRef } from "react";
import img from "../assets/hero111.webp";
import EdgeFade from "./EdgeFade";
import { C, DEFAULT_FEATURES, makeZigzag } from "./TextShowcase/constants";
import useNarrow from "./TextShowcase/useNarrow";
import useFonts from "./TextShowcase/useFonts";
import useShowcaseScroll from "./TextShowcase/useShowcaseScroll";
import useDust from "./TextShowcase/useDust";
import useAmbient from "./TextShowcase/useAmbient";
import useStepNext from "./TextShowcase/useStepNext";
import HeroPanel from "./TextShowcase/heroPanel";
import FeaturesPanel from "./TextShowcase/featuresPanel";
import ClosingPanel from "./TextShowcase/closingPanel";
import NextSection from "./TextShowcase/nextSection";
import ExitStrips from "./TextShowcase/exitStrips";

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
  badgeAt = { x: 0.62, y: 0.42 }, // (unused, kept for API compatibility)
  labels = ["The game", "The tech", "Your team", "Fit mom"],
}) {
  const narrow = useNarrow();
  const zigzag = useMemo(() => makeZigzag(narrow ? 6 : 12, narrow ? 14 : 20), [narrow]);
  const tooth = narrow ? 14 : 20;

  const nextRef = useRef(null);
  const sectionRef = useRef(null);
  const pinRef = useRef(null);
  const trackRef = useRef(null);
  const canvasRef = useRef(null);
  const stRef = useRef(null);
  const progressRef = useRef(0);
  const hiddenRef = useRef(false); // true once the first section is fully covered
  const lastUiRef = useRef(""); // de-dupes scoreboard events

  const { ambientRef, barsRef } = useAmbient(); // barsRef: used by the commented-out toggle button below

  useFonts();
  useShowcaseScroll({
    refs: { nextRef, sectionRef, pinRef, trackRef, stRef, progressRef, hiddenRef, lastUiRef },
    labels,
  });
  useDust({ canvasRef, progressRef, hiddenRef, ambientRef });
  useStepNext({ stRef, trackRef });

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
          <HeroPanel heroImage={heroImage} heroLines={heroLines} heroSub={heroSub} />
          <FeaturesPanel features={features} />
          <ClosingPanel closingLines={closingLines} />
        </div>

        <NextSection
          nextRef={nextRef}
          narrow={narrow}
          bgImage={bgImage}
          subjectSrc={subjectSrc}
          subjectAlt={subjectAlt}
          preTitle={preTitle}
          impactTitle={impactTitle}
          postTitle={postTitle}
          badgeText={badgeText}
        />

        <ExitStrips stripColors={stripColors} zigzag={zigzag} tooth={tooth} />

        {/* Ambient-motion toggle (bottom-left), currently disabled. To re-enable, use
            useAmbient's setAmbient / ambient and attach barsRef to the four bars:

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
        */}
      </div>
    </section>
  );
}