import React from "react";
import BookingButton from "../components/bookingButton";
import { C, MONO, SANS } from "./constants";

export default function FeatureCard({ feature }) {
  const { tag, title, subtitle, body, image } = feature;
  return (
    <article
      data-card
      className="relative aspect-[4/4.2] w-[min(78vw,31rem)] overflow-hidden border border-white/15 bg-[#1a1612] md:aspect-[4/3.4]"
    >
      {image ? (
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 70% 20%, rgba(127,224,210,.28), transparent 55%),
              radial-gradient(circle at 20% 90%, rgba(43,181,165,.18), transparent 50%),
              repeating-linear-gradient(45deg, rgba(255,255,255,.05) 0 2px, transparent 2px 7px),
              linear-gradient(160deg, #2a241e, #15120f)`,
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-black/55" />

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <div
          className="flex items-center justify-between border-b border-white/15 pb-2 text-[10px] uppercase tracking-[0.2em] text-white/55"
          style={{ fontFamily: MONO }}
        >
          <span className="font-bold text-teal-500">{tag}</span>
          <span className="font-bold text-teal-500">6 / 9 / 12 months</span>
        </div>
        <h3
          className="mt-3 text-2xl font-bold uppercase tracking-tight sm:text-[1.7rem]"
          style={{ fontFamily: MONO, color: C.cream }}
        >
          {title}
        </h3>
        <span className="text-teal-500">{subtitle}</span>
        <p
          data-copy
          className="mt-2 max-w-[48ch] text-[13px] leading-relaxed text-white/80"
          style={{ fontFamily: SANS }}
        >
          {body}
        </p>
        <BookingButton />
      </div>
    </article>
  );
}