import React from "react";

/* Placeholder figure shown until you pass `subjectSrc` (a transparent PNG) */
export default function Silhouette() {
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