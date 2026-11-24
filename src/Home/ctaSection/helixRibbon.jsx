import React from "react";
import { BRANDS, CARD_COUNT } from "./constants";

const MASK = "linear-gradient(to bottom, transparent 0, #000 6%, #000 94%, transparent 100%)";

export default function HelixRibbon({ stageRef, cardsRef }) {
  return (
    <div
      className="relative order-last h-[440px] sm:h-[560px] lg:order-none lg:col-span-4 lg:h-[780px]"
      style={{ WebkitMaskImage: MASK, maskImage: MASK }}
      aria-hidden="true"
    >
      <div ref={stageRef} className="absolute inset-0">
        {Array.from({ length: CARD_COUNT }).map((_, i) => {
          const b = BRANDS[i % BRANDS.length];
          return (
            <div
              key={i}
              ref={(el) => (cardsRef.current[i] = el)}
              className="absolute left-1/2 top-1/2 overflow-hidden rounded-xl bg-slate-800 shadow-xl will-change-transform"
            >
              <img
                src={b.image}
                alt=""
                loading="lazy"
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* dark gradient so the label stays readable */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-center px-3 pb-[8%]">
                {b.logo ? (
                  <img src={b.logo} alt="" className="max-h-[14%] max-w-[70%] object-contain" />
                ) : (
                  <span className="text-center text-[1.15em] font-semibold leading-tight tracking-tight text-white">
                    {b.name}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}