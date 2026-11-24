import React from "react";
import { STRIPS, HIDDEN_L, HIDDEN_R } from "./constants";

/* Sit above the track + next section, below the fixed chrome */
export default function ExitStrips({ stripColors, zigzag, tooth }) {
  return (
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
  );
}