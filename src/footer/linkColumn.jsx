import React from "react";
import { COND } from "./constants";

export default function LinkColumn({ title, links, accentLink, delay = 0 }) {
  return (
    <nav aria-label={title} className="flex flex-col items-center text-center">
      <span
        className="fm-up mb-[1.1vw] font-['Inter'] text-[10px] font-semibold uppercase text-white/55 lg:mb-[0.9vw] lg:text-[max(10px,0.6vw)]"
        style={{ "--d": delay }}
      >
        {title}
      </span>
      <ul className="flex flex-col items-center">
        {links.map((l, i) => (
          <li key={l} className="fm-up" style={{ "--d": delay + 90 + i * 80 }}>
            <a
              href="#"
              className={`${COND} block text-[clamp(26px,7vw,40px)] font-bold uppercase leading-[1.08] tracking-[-0.01em] text-white transition-colors hover:text-[#2dd4bf] focus-visible:text-[#2dd4bf] focus-visible:outline-none lg:text-[clamp(24px,1.95vw,64px)]`}
            >
              {l}
            </a>
          </li>
        ))}
      </ul>
      {accentLink && (
        <a
          href="#"
          className={`${COND} fm-up mt-5 block text-[clamp(26px,7vw,40px)] font-bold uppercase leading-none text-[#2dd4bf] hover:underline lg:mt-[1.9vw] lg:text-[clamp(24px,1.95vw,64px)]`}
          style={{ "--d": delay + 90 + links.length * 80 }}
        >
          {accentLink}
        </a>
      )}
    </nav>
  );
}