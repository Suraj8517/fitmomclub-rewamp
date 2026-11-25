import { useState, useEffect } from "react";
import logo from "../assets/fitmom.webp"

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "On-Field", href: "/on-field" },
  { label: "Off-Field", href: "/off-field" },
  { label: "Foundation", href: "/foundation" },
  { label: "Partnerships", href: "/partnerships" },
  { label: "Journal", href: "/journal" },
  { label: "Inquiries", href: "/inquiries" },
];
const SOCIALS = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-full w-full">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
        <path d="M13.5 22v-8.2h2.8l.5-3.4h-3.3V8.3c0-1 .3-1.6 1.7-1.6h1.7V3.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.5H7.3v3.4h2.9V22h3.3Z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
        <path
          fillRule="evenodd"
          d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z"
        />
      </svg>
    ),
  },
];
export default function Navbar({
  name = "FitMom Club",
  currentPath = "/",
  logo1 = logo,
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* ───────── Top bar (stays above the overlay so the hamburger can morph into a cross) ───────── */}
      <header
        className={`fixed inset-x-0 top-0 z-[60] grid grid-cols-3 items-start px-6 pt-8 transition-colors duration-500 md:px-[60px] ${
          open ? "text-teal-50" : "text-teal-950"
        }`}
      >
        {/* Logo – cross-fades between dark and light versions */}
        <a href="/" aria-label="Home" className="relative block h-[58px] w-[52px] justify-self-start">
          <img
            src={logo1}
            alt=""
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <img
            src={logo1}
            alt=""
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${
              open ? "opacity-100" : "opacity-0"
            }`}
          />
        </a>

        <h1
          className={`justify-self-center font-display text-2xl text-teal-600 uppercase tracking-wide transition-opacity duration-300 md:text-[26px] ${
            open ? "opacity-0" : "opacity-100"
          }`}
        >
         
        </h1>

        {/* Hamburger -> cross */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="relative h-10 w-10 justify-self-end"
        >
          {/* Top bar: horizontal parallelogram, nudged right */}
          <span
            className={`absolute left-[4px] top-[16px] bg-teal-600 block h-[5px] w-8 bg-current transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)] ${
              open
                ? "translate-x-0 translate-y-[3px] rotate-45 skew-x-0"
                : "translate-x-[3px] -translate-y-[4px] -skew-x-[35deg]"
            }`}
          />
          {/* Bottom bar: same shape, nudged left */}
          <span
            className={`absolute left-[4px] top-[16px] bg-teal-500 block h-[5px] w-8 bg-current transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)] ${
              open
                ? "translate-x-0 translate-y-[3px] -rotate-45 skew-x-0"
                : "-translate-x-[3px] translate-y-[5px] -skew-x-[35deg]"
            }`}
          />
        </button>
      </header>

      {/* ───────── Full-screen overlay menu ───────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
        className={`fixed inset-0 z-50 flex flex-col bg-teal-950 text-teal-50 transition-all duration-500 ease-out ${
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-4 opacity-0"
        }`}
      >
        <div className="flex flex-1 flex-col items-center justify-center gap-12 px-6">
          <nav aria-label="Primary">
            <ul className="mx-auto flex max-w-[1150px] flex-wrap items-center justify-center gap-x-14 gap-y-1 md:gap-y-3">
              {NAV_LINKS.map(({ label, href }) => {
                const active = href === currentPath;
                return (
                  <li key={label}>
                    <a
                      href={href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`font-display text-6xl uppercase leading-[1.05] transition-colors duration-200 md:text-[88px] ${
                        active ? "text-teal-50" : "text-teal-700 hover:text-teal-300"
                      }`}
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <ul className="flex items-center gap-8">
            {SOCIALS.map(({ label, href, icon }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noreferrer"
                  className="block h-[50px] w-[50px] text-teal-500 transition-colors duration-200 hover:text-teal-200"
                >
                  {icon}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <footer className="grid grid-cols-1 items-center gap-3 px-6 pb-8 font-body text-sm text-teal-300/80 md:grid-cols-3 md:px-[60px]">
          <div className="flex gap-6 justify-self-center md:justify-self-start">
            <span>© {name}</span>
           
          </div>
          <div className="flex gap-6 justify-self-center">
            <a href="/privacy" className="hover:text-white">Privacy</a>
            <a href="/terms" className="hover:text-white">Terms</a>
          </div>
          <div className="justify-self-center md:justify-self-end">
            <a href="#" className="hover:text-white">#1 Fitness and Wellness Community for Women</a>
          </div>
        </footer>
      </div>
    </>
  );
}