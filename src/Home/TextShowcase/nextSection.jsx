import React from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Silhouette from "./Silhouette";
import { C, DISPLAY, TITLE_LAYOUT } from "./constants";

/* Sits under the strips, swapped in once they cover the screen */
export default function NextSection({
  nextRef,
  narrow,
  bgImage,
  subjectSrc,
  subjectAlt,
  preTitle,
  impactTitle,
  postTitle,
  badgeText,
}) {
  return (
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
  );
}