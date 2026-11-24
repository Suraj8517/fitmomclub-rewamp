import React from "react";
import { ACCENT, topoPaths } from "./constants";

export default function TopoLines() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full opacity-[0.16]"
      viewBox="0 0 1000 520"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      stroke={ACCENT}
      strokeWidth="0.9"
    >
      {topoPaths.map((d, i) => (
        <path key={i} d={d} pathLength="1" className="fm-line" style={{ "--d": 300 + i * 150 }} />
      ))}
    </svg>
  );
}