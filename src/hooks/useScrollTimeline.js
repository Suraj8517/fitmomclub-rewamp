import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { computeLayout } from '../lib/layout';
import { CARDS } from '../lib/cards';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true }); // mobile URL-bar show/hide must not re-trigger layout

/**
 * One pinned, scrubbed GSAP timeline (units = % of the sequence) that drives:
 *  - DOM layers via js-* selectors scoped to the stage
 *  - the shared mutable scroll state S read by the particle + Three.js renderers
 * A gsap ticker renders the canvases; nothing re-renders through React state.
 */
export default function useScrollTimeline({ art, S, stage, pv, particles, phone }) {
  useEffect(() => {
    if (!art || !stage.current) return;
    const root = stage.current;
    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hn = root.querySelector('.js-hn'), ht = root.querySelector('.js-ht'), hp = root.querySelector('.js-hp'), hb = root.querySelector('.js-hb');
    let last = '', lastH = -1, L, tlST, lastW = innerWidth, lastHt = innerHeight;
    const heroEl = root.querySelector('.js-hero'), pvCv = pv.current.firstElementChild;

    const layout = () => {
      L = computeLayout();
      Object.assign(pv.current.style, { left: L.pl + 'px', top: L.pt + 'px', width: L.pw + 'px', height: L.ph + 'px' });
      root.style.setProperty('--pvh', L.ph + 'px');
      particles.current.resize(L); phone.current.resize(L); last = '';
    };
    layout();

    const ctx = gsap.context(() => {
      // only the background TYPE is 3D (own perspective); the rest of the scene stays flat
      gsap.set('.js-title', { xPercent: -50, yPercent: -50, rotationY: -24, rotationZ: -4, transformPerspective: 900 });
      tlST = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root, start: 'top top', end: '+=400%', scrub: RM ? true : 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true , refreshPriority: 1, } })
        .to('.js-hero-img', { scale: 1.1, duration: 35 }, 0)
        .to('.js-note', { opacity: 0, duration: 5 }, 0)
        // 0 → hero lifts away; its bottom feathers to black; particles leave the preview straight away
        .to('.js-skirt', { opacity: 1, duration: 10 }, 0)
        .to(S, { lift: 1, duration: 38 }, 0)
        .to(S, { part: 1, duration: 50 }, 0)
        // dark stage: spotlight, floor, type from the right, tilting 3D world
        .to('.js-floor', { opacity: 1, duration: 16 }, 16)
        .set('.js-final', { opacity: 1 }, 18)
        .fromTo('.js-title', { opacity: 0, x: () => innerWidth * 0.7 }, { opacity: 1, x: 0, duration: 22, ease: 'power3.out' }, 18)
        .to('.js-title', { x: () => -innerWidth * 0.06, duration: 50 }, 40)
        .fromTo('.js-title', { '--lx': '28%' }, { '--lx': '82%', duration: 60 }, 18) // spotlight sweeps across the type
        .fromTo('.js-title', { rotationY: -24 }, { rotationY: -8, duration: 60 }, 18) // 3D turn of the type only
        // dot-matrix reveal of the whole phone while particles are still arriving
        .to(S, { pa: 1, duration: 30, ease: 'power1.inOut' }, 32)
        // cards enter from below, orbit up, exit through the top
        .to(S, { cards: 1, duration: 14, ease: 'power2.out' }, 42)
        .to(S, { orbit: 1, duration: 60 }, 40)
        .to('.js-hud', { opacity: 1, duration: 8 }, 42)
        // limited phone turn once it has formed
        .to(S, { spin: 1, duration: 30 }, 62)
        .fromTo('.js-copy', { opacity: 0 }, { opacity: 1, duration: 8 }, 88)
        .to('.js-end-fade', { opacity: 1, duration: 8 }, 92) // black seam into the next section
        .to({}, { duration: 1 }, 99);
    }, root);
ScrollTrigger.sort();
ScrollTrigger.refresh();
    const tick = (t) => {
      const f = RM ? 0 : 1 - Math.min(1, S.part / 0.03) /* tilt flattens first, while particles are still hidden */;
      pv.current.style.transform = `translateY(${Math.sin(t * 1.1) * 7 * f}px) perspective(800px) rotateY(${-14 * f}deg) rotateX(${5 * f}deg)`;
      pvCv.style.opacity = 1 - Math.min(1, Math.max(0, (S.part - 0.03) / 0.03)); // phone image cross-fades into its own particles; brackets stay
      heroEl.style.transform = `translate3d(0,${-S.lift * L.H}px,0)`;
      heroEl.style.visibility = S.lift >= 1 ? 'hidden' : 'visible';
      S.extra = tlST ? (Math.max(0, scrollY - tlST.scrollTrigger.end) / L.H) * 0.4 : 0; // cards keep turning after the pin releases
      const k = `${S.lift}|${S.part}|${S.pa}`;
      if (k !== last) { particles.current.draw(S); last = k; }
      phone.current.render(S, t);
      const hi = Math.min(4, Math.floor(S.orbit * 5));
      if (hi !== lastH && hn) { lastH = hi; hn.textContent = '0' + (hi + 1); ht.textContent = CARDS[hi][0]; hp.textContent = `0${hi + 1} / 05`; }
      hb?.style.setProperty('--p', S.orbit);
    };
    gsap.ticker.add(tick);

    let rt;
    const onResize = () => { clearTimeout(rt); rt = setTimeout(() => {
      if (innerWidth === lastW && Math.abs(innerHeight - lastHt) < 140) return; // ignore mobile address-bar resizes
      lastW = innerWidth; lastHt = innerHeight; layout(); ScrollTrigger.refresh();
    }, 150); };
    addEventListener('resize', onResize);
    return () => { clearTimeout(rt); removeEventListener('resize', onResize); gsap.ticker.remove(tick); ctx.revert(); };
  }, [art, S, stage, pv, particles, phone]);
}
