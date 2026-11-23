import React from "react";


const ACCENT = "#2dd4bf"; // teal accent (buttons, links, page bottom)
const PANEL = "#0f2a28"; // dark panel
const MUTED = "#3aa89a"; // muted teal used for the serif words

const pageLinks = ["Home", "On Track", "Off Track", "Calendar"];
const socialLinks = ["TikTok", "Instagram", "YouTube", "Twitch"];

const TIGHT = "font-['Inter_Tight']";
const SERIF = "font-['Playfair_Display']";
const COND = "font-['Archivo_Narrow']";


function LinkColumn({ title, links, accentLink }) {
  return (
    <nav aria-label={title} className="flex flex-col items-center text-center">
      <span className="mb-[1.1vw] font-['Inter'] text-[10px] font-semibold uppercase text-white/55 lg:mb-[0.9vw] lg:text-[max(10px,0.6vw)]">
        {title}
      </span>
      <ul className="flex flex-col items-center">
        {links.map((l) => (
          <li key={l}>
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
          className={`${COND} mt-5 block text-[clamp(26px,7vw,40px)] font-bold uppercase leading-none text-[#2dd4bf] hover:underline lg:mt-[1.9vw] lg:text-[clamp(24px,1.95vw,64px)]`}
        >
          {accentLink}
        </a>
      )}
    </nav>
  );
}

export default function Footer({
  personImage = "/person.png",
  logo = { serif: "Lando", sans: "Norris" },
  ownerName = "Lando Norris",
}) {
  return (
    <section
      className="relative w-full overflow-hidden px-3 pb-0 lg:px-[1.15vw]"
      style={{
        "--n": "clamp(28px,2.5vw,72px)", // notch height
        "--s": "clamp(30px,1.9vw,60px)", // bottom strip height (desktop)
        paddingTop: "var(--n)",
        background: `linear-gradient(180deg,#ffffff 0,${ACCENT} 6vw,${ACCENT} 100%)`,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700;800&family=Inter:wght@500;600&family=Playfair+Display:wght@500&family=Archivo+Narrow:wght@600;700&display=swap');
        @keyframes footer-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .footer-marquee { animation: footer-marquee 26s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .footer-marquee { animation: none; } }
      `}</style>

      {/* ───────── Wrapper: panel + bottom strip ───────── */}
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
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full opacity-[0.16]"
            viewBox="0 0 1000 520"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            stroke={ACCENT}
            strokeWidth="0.9"
          >
            <path d="M-30 120 C60 40 170 90 230 170 S300 330 210 380 20 330 -30 250" />
            <path d="M-30 160 C50 90 150 120 200 180 S260 310 200 345 40 310 -30 240" />
            <path d="M330 -20 C380 70 330 130 410 190 S560 230 540 330 440 420 380 540" />
            <path d="M700 -20 C640 60 720 120 800 130 S960 90 1040 160" />
            <path d="M720 40 C680 100 740 150 810 160 S950 130 1040 190" />
            <path d="M620 540 C660 440 760 430 820 360 S900 220 1040 250" />
            <path d="M660 540 C700 460 790 450 850 390 S930 270 1040 300" />
            <path d="M80 520 C120 450 200 470 260 430 S330 340 420 350" />
          </svg>
        </div>

        {/* Bottom "tongue": panel continues down between the two corner tabs (desktop) */}
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

        {/* ───────── Content (flow on mobile, absolute on desktop) ───────── */}
        <div className="relative flex flex-col items-center pb-6 pt-24 lg:static lg:block lg:pb-0 lg:pt-0">
        

          

          {/* Headline: sans + serif mix, signature over the top */}
          <h2 className="relative z-0 px-3 text-center text-[clamp(40px,12.5vw,76px)] uppercase leading-[0.88] text-white lg:absolute lg:inset-x-0 lg:top-[17.5%] lg:px-0 lg:text-[5vw]">
          
            <span className={`${TIGHT} font-bold tracking-[-0.045em]`}>Always </span>
            <span className={`${SERIF} font-medium tracking-[-0.04em]`} style={{ color: MUTED }}>Bringing</span>
            <br />
            <span className={`${TIGHT} font-bold tracking-[-0.045em]`}>The </span>
            <span className={`${SERIF} font-medium tracking-[-0.04em]`} style={{ color: MUTED }}>Fight</span>
            <span className={`${TIGHT} font-bold`}>.</span>
          </h2>

          {/* Person image */}
          <img
            src={personImage}
            alt=""
            className="pointer-events-none relative z-10 -mt-2 h-[330px] w-auto max-w-none object-contain object-bottom [mask-image:linear-gradient(to_bottom,#000_82%,transparent)] sm:h-[420px] lg:absolute lg:bottom-0 lg:left-1/2 lg:mt-0 lg:h-[68%] lg:-translate-x-1/2 lg:[mask-image:none]"
          />

          {/* Links */}
          <div className="relative z-20 mt-6 grid w-full grid-cols-2 gap-4 px-4 lg:static lg:mt-0 lg:block lg:w-auto lg:gap-0 lg:px-0">
            <div className="lg:absolute lg:left-[17%] lg:top-[48%] lg:-translate-x-1/2">
              <LinkColumn title="Pages" links={pageLinks} accentLink="Store" />
            </div>
            <div className="lg:absolute lg:left-[83%] lg:top-[48%] lg:-translate-x-1/2">
              <LinkColumn title="Follow on" links={socialLinks} />
            </div>
          </div>

      

         

          {/* Business enquiries */}
          <a
            href="#"
            className={`${COND} relative z-30 mt-8 inline-flex items-center gap-3 rounded-lg px-5 py-3.5 text-lg font-bold uppercase text-[#0f2a28] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:absolute lg:bottom-[1.6vw] lg:left-1/2 lg:mt-0 lg:-translate-x-1/2 lg:gap-[0.7vw] lg:rounded-[0.6vw] lg:px-[1.1vw] lg:py-0 lg:text-[clamp(14px,1.05vw,28px)] lg:h-[clamp(40px,2.85vw,72px)]`}
            style={{ backgroundColor: ACCENT }}
          >
            Business enquiries
            <svg viewBox="0 0 24 24" className="h-[1em] w-[1em]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
          </a>
        </div>

        {/* Desktop bottom strip text (sits in the two corner tabs) */}
        <p className="absolute bottom-0 left-[0.7vw] z-20 hidden h-[var(--s)] items-center font-['Inter'] text-[max(11px,0.68vw)] font-medium text-[#0f2a28] lg:flex">
          <span>© 2026&nbsp;<strong className="font-semibold">{ownerName}</strong>. All rights reserved</span>
        </p>
        <div className={`${COND} absolute bottom-0 right-[0.5vw] z-20 hidden h-[var(--s)] items-center gap-[1.2vw] text-[clamp(13px,0.95vw,26px)] font-bold uppercase text-[#0f2a28] lg:flex`}>
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