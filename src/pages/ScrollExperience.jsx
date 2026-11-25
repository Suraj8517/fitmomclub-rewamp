import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import HeroSection from '../Home/HeroSection';
import AppPreview from '../Home/AppPreview';
import ParticleTransition from '../Home/ParticleTransition';
import Phone3D from '../Home/Phone3D';
import FinalReveal from '../Home/FinalReveal';
import useScrollTimeline from '../hooks/useScrollTimeline';
import { createAppArt, createPhoneArt } from '../lib/appArt';
import { HERO_SRC, HERO_SRCSET, SUBJECT_SRC, APP_SRC, CARD_IMAGES } from '../config';

const loadBelowFold = () => import('../Home/BelowFold');
const BelowFold = lazy(loadBelowFold);

/** Pinned stage: hero -> detach -> particles -> 3D phone reveal. Owns the shared scroll state. */
export default function ScrollExperience() {
  const stage = useRef(null), pv = useRef(null), particles = useRef(null), phone = useRef(null);
  const S = useRef({ lift: 0, part: 0, pa: 0, spin: 0, orbit: 0, cards: 0 }).current;
  const [art, setArt] = useState(null);
  const [showRest, setShowRest] = useState(false);
  const phoneArt = useMemo(() => (art ? createPhoneArt(art) : null), [art]); // whole phone: preview + particles

  useEffect(() => {
    let live = true;
    createAppArt(APP_SRC).then((a) => live && setArt(a));
    return () => { live = false; };
  }, []);

  // start fetching the rest of the page only once the hero has painted and the browser is idle
  useEffect(() => {
    const go = () => { loadBelowFold(); setShowRest(true); };
    const ric = window.requestIdleCallback || ((f) => setTimeout(f, 200));
    const id = ric(go, { timeout: 1500 });
    return () => (window.cancelIdleCallback || clearTimeout)(id);
  }, []);

  useScrollTimeline({ art, S, stage, pv, particles, phone });

  return (
    <>
      <section ref={stage} className="relative h-svh overflow-hidden">
        <HeroSection heroSrc={HERO_SRC} heroSrcSet={HERO_SRCSET} subjectSrc={SUBJECT_SRC}>
          <AppPreview ref={pv} art={phoneArt} />
        </HeroSection>
        <FinalReveal />
        <Phone3D ref={phone} art={art} images={CARD_IMAGES} />
        <ParticleTransition ref={particles} art={phoneArt} />
        <div className="js-end-fade pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[22vh] opacity-0 bg-gradient-to-t from-[#080b0a] via-[#080b0acc] to-transparent" />
      </section>
      {showRest && (
        <Suspense fallback={<div style={{ minHeight: '100svh' }} />}>
          <BelowFold />
        </Suspense>
      )}
    </>
  );
}
