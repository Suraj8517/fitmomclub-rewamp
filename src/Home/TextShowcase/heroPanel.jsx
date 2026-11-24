import React from "react";
import { C, MONO, LINE_BASE, HERO_SIZE, wipeStyle } from "./constants";

export default function HeroPanel({ heroImage, heroLines, heroSub }) {
  return (
    <div data-panel data-stop className="relative h-full w-screen shrink-0">
      <div className="absolute inset-y-0 left-0 w-[85%] md:w-[58%]">
        {heroImage ? (
          <img
            src={heroImage}
            alt=""
            className="h-full w-full object-cover object-center"
            draggable={false}
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `radial-gradient(ellipse at 35% 60%, rgba(127,224,210,.16), transparent 55%),
                radial-gradient(ellipse at 30% 100%, rgba(243,238,224,.12), transparent 50%),
                linear-gradient(180deg, #1c1814, #110f0d)`,
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, transparent 30%, ${C.bg} 100%), linear-gradient(0deg, rgba(17,15,13,.7), transparent 40%)`,
          }}
        />
      </div>

      <div className="absolute left-[6vw] top-[44%] -translate-y-1/2 md:left-[50vw]">
        <h2 className="m-0 font-normal">
          {heroLines.map((line, i) => (
            <span
              key={line}
              data-intro
              className={`${LINE_BASE} ${HERO_SIZE}`}
              style={{
                ...wipeStyle,
                color: i === 0 ? C.cream : C.teal,
                paddingLeft: i === 2 ? "0.45em" : 0,
              }}
            >
              {line}
            </span>
          ))}
        </h2>
        <p
          data-sub
          className="mt-6 text-[11px] uppercase leading-[1.7] tracking-[0.2em] text-white/50"
          style={{ fontFamily: MONO }}
        >
          {heroSub.map((s) => (
            <span key={s} className="block">
              {s}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}