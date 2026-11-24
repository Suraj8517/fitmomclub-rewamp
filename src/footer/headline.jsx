import React from "react";
import { MUTED, TIGHT, SERIF, headlineLines } from "./constants";

export default function Headline() {
  let wordIndex = 0;
  return (
    <h2 className="relative z-0 px-3 text-center text-[clamp(40px,12.5vw,76px)] uppercase leading-[0.88] text-white lg:absolute lg:inset-x-0 lg:top-[17.5%] lg:px-0 lg:text-[5vw]">
      {headlineLines.map((line, li) => (
        <span
          key={li}
          className="block overflow-hidden"
          style={{ paddingBottom: "0.08em", marginBottom: "-0.08em" }}
        >
          {line.map((w, wi) => {
            const d = 250 + wordIndex++ * 140;
            return (
              <React.Fragment key={w.t}>
                <span
                  className={`fm-word ${w.serif ? `${SERIF} font-medium tracking-[-0.04em]` : `${TIGHT} font-bold tracking-[-0.045em]`}`}
                  style={{ "--d": d, ...(w.serif ? { color: MUTED } : {}) }}
                >
                  {w.t}
                  {w.dot && <span className={`${TIGHT} font-bold`} style={{ color: "#fff" }}>.</span>}
                </span>
                {wi < line.length - 1 && " "}
              </React.Fragment>
            );
          })}
        </span>
      ))}
    </h2>
  );
}