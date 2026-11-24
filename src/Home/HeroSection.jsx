import { useMemo, useState } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';

const btn = 'inline-flex min-h-11 items-center gap-3 px-4 py-2 font-mono text-[11px] uppercase tracking-[.18em] min-[800px]:px-5 min-[800px]:py-3.5 min-[800px]:text-[12px] min-[800px]:tracking-[.2em]';
const clip = 'bg-clip-text text-transparent';

/** Cinematic hero: teal-graded photo, headline BEHIND the subject cut-out, light rays + dust OVER both.
 *  js-* classes are GSAP hooks used by useScrollTimeline. */
export default function HeroSection({ heroSrc, subjectSrc, children }) {
  const [calm, setCalm] = useState(false);
  const dust = useMemo(() => Array.from({ length: typeof innerWidth !== 'undefined' && innerWidth < 800 ? 26 : 56 }, () => ({
    x: Math.random() * 100, y: Math.random() * 100, s: 1 + Math.random() * 3.2,
    d: 5 + Math.random() * 9, dx: (Math.random() - 0.5) * 50, del: -Math.random() * 10,
  })), []);

  return (
    <>
      {/* dark stage that the hero lifts away from */}
      <div className="js-dark absolute inset-0 bg-[radial-gradient(75%_65%_at_50%_42%,#1b2b26,#0a100e_72%)] overflow-hidden" />

      {/* everything in here travels up together (driven by scroll in useScrollTimeline) */}
      <div className="js-hero absolute inset-0 z-1 overflow-hidden will-change-transform">
      {/* 1 · graded background */}
      <div className="js-hero-img hero-bg absolute inset-0">
        {heroSrc && (
          <>
            <img src={heroSrc} alt="" className="size-full object-cover [filter:grayscale(1)_contrast(1.08)_brightness(.85)]" />
            <div className="absolute inset-0 bg-[#1f9e92] opacity-80 mix-blend-color" />
            <div className="absolute inset-0 bg-[#06161a]/45" />
          </>
        )}
      </div>

      {/* 2 · headline, subject, copy */}
      <div className="js-hero-copy absolute inset-0 z-1">
        <h1 className={`${clip} absolute left-[4vw] top-[17svh] z-1 m-0 min-[800px]:top-[25svh] font-display text-[14vw] font-normal uppercase leading-[.9] tracking-[-.01em] bg-[linear-gradient(90deg,rgba(243,238,224,.3),rgba(243,238,224,.5)_38%,#f3eee0_64%,#bff7ee)] min-[800px]:whitespace-nowrap min-[800px]:text-[clamp(48px,8vw,160px)]`}>
          <span className="block min-[800px]:inline">Her journey.</span>{' '}
          <span className="block min-[800px]:inline">Her strength.</span>
        </h1>

        {subjectSrc && (
          <img src={subjectSrc} alt="Pritika, founder of FitMom Club" draggable={false}
            className="absolute bottom-0 right-[-14vw] z-2 h-[74svh] w-auto max-w-none object-contain object-bottom min-[800px]:right-[6vw] min-[800px]:h-[96svh]" />
        )}

        <div className="absolute left-[4vw] z-3 max-w-[90vw] bottom-[calc(var(--pvh,200px)+6vh)] min-[800px]:bottom-auto min-[800px]:top-[44svh]">
          <p className={`${clip} m-0 absolute right-1 -top-8 md:static font-display text-[10vw] uppercase leading-[.95] bg-[linear-gradient(90deg,#9ff0e2,#2bb5a5_60%,#1b8c80)] min-[800px]:text-[clamp(40px,6vw,120px)] `}>Her story.</p>
          <p className="mt-4 max-w-[36ch] text-[clamp(13px,1.3vw,18px)] text-warm/75 min-[800px]:max-w-[44ch] [@media(max-height:700px)_and_(max-width:799px)]:hidden">
            One woman’s journey to rediscover herself became a movement empowering women across the world.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 min-[800px]:mt-6 min-[800px]:gap-3">
            <button type="button" className={`${btn} bg-warm text-ink`}>
              Join the club <span className="grid size-7 place-items-center bg-ink text-warm"><ArrowRight size={14} /></span>
            </button>
            <button type="button" className={`${btn} border border-warm/25 text-warm hover:border-teal hover:text-teal`}>Explore the app</button>
          </div>
        </div>
      </div>

      {/* 3 · light + atmosphere OVER the subject */}
      <div className={`js-shade pointer-events-none absolute inset-0 z-0 ${calm ? 'calm' : ''}`}>
        <div className=" absolute inset-0" />
        <div className="floor-glare absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_85%,transparent_45%,rgba(5,14,13,.75)_100%),linear-gradient(90deg,rgba(8,20,18,.65),transparent_42%)]" />
        {dust.map((d, i) => (
          <i key={i} className="dust" style={{ left: d.x + '%', top: d.y + '%', width: d.s, height: d.s, '--d': d.d + 's', '--dx': d.dx + 'px', animationDelay: d.del + 's' }} />
        ))}
      </div>

      {/* black gradient that feathers the hero's bottom edge as it lifts */}
      <div className="absolute bottom-[max(22px,3.5vh)] left-[calc(4vw+64px)] z-4 flex h-[52px] items-center gap-3 font-mono text-[10px] uppercase tracking-[.2em] min-[800px]:left-[calc(4vw+68px)] min-[800px]:gap-4 min-[800px]:text-[12px] min-[800px]:tracking-[.24em]">
        <span className="h-6 w-px bg-warm/20" /><span className="text-warm/80"><span className="min-[800px]:hidden">Scroll</span><span className="max-[799px]:hidden">Scroll to explore</span></span><ArrowDown size={14} className="text-teal" />
      </div>
      {/* feather on the hero's own bottom border (travels with the hero edge) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-3 h-[22vh] bg-gradient-to-t from-[#0a100e] via-[#0a100ecc] to-transparent" />
      {children}
      </div>

      {/* black gradient at the bottom: STATIC (does not travel with the hero), fades in as you start scrolling */}
      <div className="js-skirt pointer-events-none absolute inset-x-0 bottom-0 z-2 h-[34vh] opacity-0 bg-[linear-gradient(to_bottom,transparent,rgba(10,16,14,.85)_60%,#0a100e)]" />

      {/* soft black under the nav + top border */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-9 h-[16vh] bg-gradient-to-b from-black/60 to-transparent" />

      {/* chrome (stays put) */}
      <header className="absolute inset-x-[4vw] top-[max(22px,3vh)] z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5 whitespace-nowrap font-display text-[22px] max-[359px]:gap-2 max-[359px]:text-[18px] min-[800px]:text-[26px] font-normal tracking-[.06em]">
          <i className="size-3.5 rounded-full bg-teal shadow-[0_0_0_4px_rgba(77,184,165,.25)]" />FitMom Club
        </div>
        <button type="button" className="flex items-center gap-3 whitespace-nowrap bg-warm py-1.5 pl-4 pr-1.5 font-mono text-[11px] uppercase tracking-[.16em] text-ink max-[359px]:gap-2 max-[359px]:pl-3 max-[359px]:text-[10px] max-[359px]:tracking-[.1em] min-[800px]:gap-4 min-[800px]:py-2 min-[800px]:pl-6 min-[800px]:pr-2 min-[800px]:text-[13px] min-[800px]:tracking-[.22em]">
          Join the club <span className="grid size-8 place-items-center bg-ink text-warm min-[800px]:size-9"><ArrowRight size={16} /></span>
        </button>
      </header>

    
    </>
  );
}
