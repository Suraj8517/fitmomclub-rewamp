// TealLightTransition.jsx
// Goes INSIDE the sticky wrapper of the section (see TestimonialsSection).
// The section stays pinned while you scroll through the "runway"; only this
// teal light moves, rising slowly from the bottom of the screen.
// The next section should use background: LIGHT so the join is invisible.

import { useEffect, useRef } from "react";

export const LIGHT = "#e3f4f0"; // pale teal-cream floor (use as next section's bg)
const BEAM = "150,238,224"; // teal light colour (r,g,b)
const GLOW = "46,196,182"; // deeper teal for the glow

export const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

const fadeDown = "linear-gradient(to bottom, transparent 0%, #000 55%)";

const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const smooth = (p) => p * p * (3 - 2 * p); // smoothstep easing

/**
 * height : size of the light layer in vh (95 = almost the whole screen)
 * runway : how much extra scroll (in vh) the pinned section stays put while
 *          the light rises. Bigger = slower. Must match the spacer in the section.
 */
export default function TealLightTransition({ height = 101, runway = 120 }) {
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const section = wrap?.closest("section");
    if (!wrap || !section) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const h = (height / 100) * vh;
      const R = (runway / 100) * vh;
      const bottom = section.getBoundingClientRect().bottom;

      // 0 when the section first pins, 1 when the pin releases
      const p = smooth(clamp((vh + R - bottom) / R));

      wrap.style.transform = `translate3d(0, ${(1 - p) * h}px, 0)`;
      wrap.style.opacity = String(p);
      // by the end the whole layer is flat LIGHT, so nothing dark shows through
      // while the section scrolls away and the seam with the next section vanishes
      const solid = smooth(clamp((p - 0.8) / 0.2));
      wrap.style.setProperty("--solid", solid.toFixed(3));
      wrap.style.visibility = p <= 0 ? "hidden" : "visible";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [height, runway]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[40] will-change-transform"
      style={{ height: `${height}vh`, opacity: 0, visibility: "hidden" }}
    >
      <style>{`
        @keyframes tl-drift-a { from { transform: translateX(-3%) scaleX(1.35); } to { transform: translateX(3%) scaleX(1.35); } }
        @keyframes tl-drift-b { from { transform: translateX(3%) scaleX(1.5); }  to { transform: translateX(-3%) scaleX(1.5); } }
        @media (prefers-reduced-motion: reduce) { .tl-beam { animation: none !important; } }
      `}</style>

      {/* 1. base fade: transparent -> solid light */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom,
            rgba(227,244,240,0) 0%,
            rgba(227,244,240,.18) 22%,
            rgba(227,244,240,.55) 48%,
            rgba(227,244,240,.92) 72%,
            ${LIGHT} 88%,
            ${LIGHT} 100%)`,
        }}
      />

      {/* 2. wide soft beams */}
      <div
        className="tl-beam absolute -inset-x-[15%] inset-y-0"
        style={{
          background: `repeating-linear-gradient(104deg,
            rgba(${BEAM},0) 0px, rgba(${BEAM},0) 40px,
            rgba(${BEAM},.75) 130px,
            rgba(${BEAM},0) 250px, rgba(${BEAM},0) 340px)`,
          filter: "blur(16px)",
          WebkitMaskImage: fadeDown,
          maskImage: fadeDown,
          mixBlendMode: "screen",
          animation: "tl-drift-a 14s ease-in-out infinite alternate",
          transformOrigin: "top center",
        }}
      />

      {/* 3. thinner, brighter beams for depth */}
      <div
        className="tl-beam absolute -inset-x-[20%] inset-y-0"
        style={{
          background: `repeating-linear-gradient(98deg,
            rgba(255,255,255,0) 0px, rgba(255,255,255,0) 70px,
            rgba(235,255,250,.7) 120px,
            rgba(255,255,255,0) 175px, rgba(255,255,255,0) 260px)`,
          filter: "blur(9px)",
          WebkitMaskImage: fadeDown,
          maskImage: fadeDown,
          mixBlendMode: "screen",
          opacity: 0.8,
          animation: "tl-drift-b 18s ease-in-out infinite alternate",
          transformOrigin: "top center",
        }}
      />

      {/* 4. teal glow pooling toward the bottom */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(70% 50% at 50% 88%, rgba(${GLOW},.28), transparent 70%)`,
        }}
      />

      {/* 5. flat floor: bottom edge is exactly LIGHT; fills the whole layer at the end */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, transparent 80%, ${LIGHT} 100%)`,
        }}
      />
      {/* veil: reaches far ABOVE the layer and is feathered at its own top,
          so it never shows a hard horizontal edge on screen */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "260%",
          background: `linear-gradient(to bottom, rgba(227,244,240,0) 0%, ${LIGHT} 40%, ${LIGHT} 100%)`,
          opacity: "var(--solid, 0)",
        }}
      />

      {/* 6. film grain (the textured paper look) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: GRAIN,
          opacity: 0.22,
          mixBlendMode: "multiply",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 25%, #000 70%)",
          maskImage: "linear-gradient(to bottom, transparent 25%, #000 70%)",
        }}
      />
    </div>
  );
}