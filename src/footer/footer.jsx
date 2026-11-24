import React from "react";
import "../css/footer.css";
import { ACCENT, PANEL, COND, pageLinks, socialLinks } from "./constants";
import useInView from "./useInView";
import LinkColumn from "./LinkColumn";
import Headline from "./Headline";
import TopoLines from "./TopoLines";

export default function Footer({
  personImage ,
  ownerName = "FiitMom Club",
}) {
  const { ref, armed, inView } = useInView(0.2);

  return (
    <section
      ref={ref}
      className={`relative w-full overflow-hidden px-3 pb-0 lg:px-[1.15vw] ${armed ? "fm-armed" : ""} ${inView ? "fm-in" : ""}`}
      style={{
        "--n": "clamp(28px,2.5vw,72px)", // notch height
        "--s": "clamp(30px,1.9vw,60px)", // bottom strip height (desktop)
        paddingTop: "var(--n)",
        background: `linear-gradient(180deg,#ffffff 0,${ACCENT} 6vw,${ACCENT} 100%)`,
      }}
    >
      <div className="relative lg:h-[48vw]">
        {/* Top notch */}
        <svg
          aria-hidden="true"
          viewBox="0 0 450 48"
          preserveAspectRatio="none"
          className="absolute left-1/2 z-0 w-[200px] -translate-x-1/2 sm:w-[260px] lg:w-[23.5vw]"
          style={{ top: "calc(var(--n) * -1 + 1px)", height: "var(--n)" }}
          fill={PANEL}
        >
          <path d="M0 48 C60 48 80 0 150 0 H300 C370 0 390 48 450 48 Z" />
        </svg>

        {/* Panel background + topographic lines */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[22px] lg:bottom-[var(--s)] lg:rounded-[1.4vw]"
          style={{ backgroundColor: PANEL }}
        >
          <TopoLines />
        </div>

        {/* Bottom tongue (desktop) */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1000 40"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-1/2 z-0 hidden -translate-x-1/2 lg:block"
          style={{ width: "72%", height: "calc(var(--s) + 1px)" }}
          fill={PANEL}
        >
          <path d="M0 0 C45 0 55 40 105 40 H895 C945 40 955 0 1000 0 Z" />
        </svg>

        {/* Content (flow on mobile, absolute on desktop) */}
        <div className="relative flex flex-col items-center pb-6 pt-24 lg:static lg:block lg:pb-0 lg:pt-0">
          <Headline />

          <img
            src={personImage}
            alt=""
            className="fm-person pointer-events-none relative z-10 -mt-2 h-[330px] w-auto max-w-none object-contain object-bottom [mask-image:linear-gradient(to_bottom,#000_82%,transparent)] sm:h-[420px] lg:absolute lg:bottom-0 lg:left-1/2 lg:mt-0 lg:h-[68%] lg:-translate-x-1/2 lg:[mask-image:none]"
          />

          <div className="relative z-20 mt-6 grid w-full grid-cols-2 gap-4 px-4 lg:static lg:mt-0 lg:block lg:w-auto lg:gap-0 lg:px-0">
            <div className="lg:absolute lg:left-[17%] lg:top-[48%] lg:-translate-x-1/2">
              <LinkColumn title="Pages" links={pageLinks} accentLink="Store" delay={900} />
            </div>
            <div className="lg:absolute lg:left-[83%] lg:top-[48%] lg:-translate-x-1/2">
              <LinkColumn title="Follow on" links={socialLinks} delay={1000} />
            </div>
          </div>

          <a
            href="#"
            className={`${COND} fm-pop relative z-30 mt-8 inline-flex items-center gap-3 rounded-lg px-5 py-3.5 text-lg font-bold uppercase text-[#0f2a28] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:absolute lg:bottom-[1.6vw] lg:left-1/2 lg:mt-0 lg:-translate-x-1/2 lg:gap-[0.7vw] lg:rounded-[0.6vw] lg:px-[1.1vw] lg:py-0 lg:text-[clamp(14px,1.05vw,28px)] lg:h-[clamp(40px,2.85vw,72px)]`}
            style={{ backgroundColor: ACCENT, "--d": 1500 }}
          >
            Business enquiries
            <svg viewBox="0 0 24 24" className="h-[1em] w-[1em]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
          </a>
        </div>

        {/* Desktop bottom strip text */}
        <p className="fm-up absolute bottom-0 left-[0.7vw] z-20 hidden h-[var(--s)] items-center font-['Inter'] text-[max(11px,0.68vw)] font-medium text-[#0f2a28] lg:flex" style={{ "--d": 1700 }}>
          <span>© 2026&nbsp;<strong className="font-semibold">{ownerName}</strong>. All rights reserved</span>
        </p>
        <div className={`${COND} fm-up absolute bottom-0 right-[0.5vw] z-20 hidden h-[var(--s)] items-center gap-[1.2vw] text-[clamp(13px,0.95vw,26px)] font-bold uppercase text-[#0f2a28] lg:flex`} style={{ "--d": 1700 }}>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms</a>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="flex flex-col items-center justify-between gap-2 py-4 font-['Inter'] text-xs font-medium text-[#0f2a28] sm:flex-row lg:hidden">
        <p>
          © 2026 <strong className="font-semibold">{ownerName}</strong>. All rights reserved
        </p>
        <div className={`${COND} flex gap-5 text-sm font-bold uppercase`}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms</a>
        </div>
      </div>
    </section>
  );
}