import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------
   EDIT THIS: one entry per section of your site, in page order.
   `id` must match the id="" you put on that section's root element.
------------------------------------------------------------------- */
const DEFAULT_SECTIONS = [
  { id: "tip-off", label: "Tip-off" },
  { id: "programs", label: "Programs" },
  { id: "the-tech", label: "The tech" },
  { id: "branding", label: "Branding" },
  { id: "testimonials", label: "Testimonials" },
  { id: "join-fmc", label: "Join FitMom Club" },
  { id: "our-app", label: "Our App" },
];

const C = { cream: "#f3eee0", teal: "#2bb5a5", tealSoft: "#7fe0d2" };
const MONO = "'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace";
const TICKS = 28;
const COUNT_FROM = 22;
const COUNT_TO = 10;

/* 5x7 dot-matrix glyphs for the LED counter */
const GLYPHS = {
  0: "01110 10001 10011 10101 11001 10001 01110",
  1: "00100 01100 00100 00100 00100 00100 01110",
  2: "01110 10001 00001 00010 00100 01000 11111",
  3: "11110 00001 00001 01110 00001 00001 11110",
  4: "00010 00110 01010 10010 11111 00010 00010",
  5: "11111 10000 11110 00001 00001 10001 01110",
  6: "00110 01000 10000 11110 10001 10001 01110",
  7: "11111 00001 00010 00100 01000 01000 01000",
  8: "01110 10001 10001 01110 10001 10001 01110",
  9: "01110 10001 10001 01111 00001 00010 01100",
};

function LedDigit({ value }) {
  const rows = GLYPHS[value].split(" ");
  return (
    <div className="grid grid-cols-5 gap-[2px] rounded-[2px] bg-white/[0.03] p-[3px]" aria-hidden="true">
      {rows.flatMap((row, r) =>
        row.split("").map((bit, c) => (
          <span
            key={`${r}-${c}`}
            className="h-[3px] w-[3px] rounded-[0.5px]"
            style={
              bit === "1"
                ? { background: C.teal, boxShadow: `0 0 5px ${C.teal}` }
                : { background: "rgba(43,181,165,0.12)" }
            }
          />
        ))
      )}
    </div>
  );
}

const pad = (n) => String(n).padStart(2, "0");

export default function Scoreboard({ sections = DEFAULT_SECTIONS }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 of the whole page
  const rootRef = useRef(null);

  /* ---- which section is on screen + overall page progress ---- */
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.5; // section that crosses the middle of the screen
      let current = 0;
      sections.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = i;
      });
      setActive((prev) => (prev === current ? prev : current));

      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setProgress((prev) => (Math.abs(prev - p) < 0.002 ? prev : p));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  /* ---- close on outside click / Escape ---- */
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const goTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: "smooth" });
    setOpen(false);
  }, []);

  const count = Math.round(COUNT_FROM + (COUNT_TO - COUNT_FROM) * progress);
  const tick = Math.round(progress * TICKS);
  const label = sections[active]?.label ?? "";

  return (
    <div
      ref={rootRef}
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-[100] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
    >
      {/* ---------------- section menu ---------------- */}
      <nav
        id="scoreboard-menu"
        aria-label="Sections"
        aria-hidden={!open}
        className={`flex flex-col items-end gap-[10px] ${open ? "" : "pointer-events-none"}`}
      >
        {sections.map((s, i) => {
          const isActive = i === active;
          return (
            <button
              key={s.id}
              type="button"
              tabIndex={open ? 0 : -1}
              onClick={() => goTo(s.id)}
              aria-current={isActive ? "true" : undefined}
              className={`flex items-center gap-3 border bg-[#0d0b0a]/85 px-3 py-[9px] text-[11px] font-bold uppercase tracking-[0.18em] backdrop-blur transition-all duration-300 hover:border-[#2bb5a5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7fe0d2] ${
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              } ${isActive ? "border-[#2bb5a5]" : "border-white/15"}`}
              style={{
                fontFamily: MONO,
                color: C.cream,
                /* items rise in from the bottom one after another */
                transitionDelay: open ? `${(sections.length - 1 - i) * 30}ms` : "0ms",
              }}
            >
              <span style={{ color: C.teal }}>{pad(i + 1)}</span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ---------------- scoreboard ---------------- */}
      <div
        className="relative w-[calc(100vw-2rem)] max-w-[21rem] border border-white/15 bg-[#0d0b0a]/80 px-3 pb-2 pt-3 text-[#f3eee0] backdrop-blur sm:w-[min(21rem,calc(100vw-3rem))] sm:px-4"
        role="status"
        aria-live="off"
      >
        <span className="absolute -left-[3px] -top-[3px] h-[6px] w-[6px] bg-[#f3eee0]" />
        <span className="absolute -bottom-[3px] -right-[3px] h-[6px] w-[6px] bg-[#f3eee0]" />

        <div className="flex items-center gap-3">
          <div className="flex gap-[6px]">
            <LedDigit value={Math.floor(count / 10)} />
            <LedDigit value={count % 10} />
          </div>

          <div className="min-w-0 flex-1" style={{ fontFamily: MONO }}>
            <div className="truncate text-[11px] font-bold uppercase tracking-[0.18em] text-[#f3eee0]/90">
              {label}
            </div>
            <div className="mt-1 text-[11px] tracking-[0.14em] text-white/40">
              {pad(active + 1)} / {pad(sections.length)}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="scoreboard-menu"
            aria-label={open ? "Close section menu" : "Open section menu"}
            className="grid h-10 w-10 place-items-center transition-colors hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7fe0d2]"
            style={{ background: C.teal, color: "#0d0b0a" }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              aria-hidden="true"
              className={`transition-transform duration-300 ${open ? "rotate-0" : "rotate-180"}`}
            >
              <path d="M6 2l5 8H1z" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* tick ruler: progress through the whole page */}
        <div className="mt-2 flex h-3 items-end justify-between" aria-hidden="true">
          {Array.from({ length: TICKS }).map((_, i) => (
            <span
              key={i}
              className="w-px transition-colors duration-200"
              style={{
                height: i % 4 === 0 ? 10 : 6,
                background: i <= tick ? C.cream : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}