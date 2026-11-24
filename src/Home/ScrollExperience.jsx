<<<<<<< HEAD
import { useEffect, useMemo, useRef, useState } from 'react';
=======
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
>>>>>>> master
import HeroSection from './HeroSection';
import AppPreview from './AppPreview';
import ParticleTransition from './ParticleTransition';
import Phone3D from './Phone3D';
import FinalReveal from './FinalReveal';
import useScrollTimeline from '../hooks/useScrollTimeline';
import { createAppArt, createPhoneArt } from '../lib/appArt';
<<<<<<< HEAD
import { HERO_SRC, SUBJECT_SRC, APP_SRC, CARD_IMAGES ,whiteBag,blackBag,FOOTER_SRC} from '../config';
import TestimonialsSection from './testimonialSection';
import TextShowcase from './ImageSection';
import GetReadySection from './getReadySection';
import Scoreboard from './components/homeMenu';
import ProductDetails from './productDetails';
import CtaSection from './ctaSection';
import Footer from '../footer/footer';
=======
import { HERO_SRC, HERO_SRCSET, SUBJECT_SRC, APP_SRC, CARD_IMAGES } from '../config';

const loadBelowFold = () => import('./BelowFold');
const BelowFold = lazy(loadBelowFold);
>>>>>>> master

/** Pinned stage: hero -> detach -> particles -> 3D phone reveal. Owns the shared scroll state. */
export default function ScrollExperience() {
  const stage = useRef(null), pv = useRef(null), particles = useRef(null), phone = useRef(null);
  const S = useRef({ lift: 0, part: 0, pa: 0, spin: 0, orbit: 0, cards: 0 }).current;
  const [art, setArt] = useState(null);
<<<<<<< HEAD
=======
  const [showRest, setShowRest] = useState(false);
>>>>>>> master
  const phoneArt = useMemo(() => (art ? createPhoneArt(art) : null), [art]); // whole phone: preview + particles

  useEffect(() => {
    let live = true;
    createAppArt(APP_SRC).then((a) => live && setArt(a));
    return () => { live = false; };
  }, []);

<<<<<<< HEAD
=======
  // start fetching the rest of the page only once the hero has painted and the browser is idle
  useEffect(() => {
    const go = () => { loadBelowFold(); setShowRest(true); };
    const ric = window.requestIdleCallback || ((f) => setTimeout(f, 200));
    const id = ric(go, { timeout: 1500 });
    return () => (window.cancelIdleCallback || clearTimeout)(id);
  }, []);

>>>>>>> master
  useScrollTimeline({ art, S, stage, pv, particles, phone });

  return (
    <>
      <section ref={stage} className="relative h-svh overflow-hidden">
<<<<<<< HEAD
        <HeroSection heroSrc={HERO_SRC} subjectSrc={SUBJECT_SRC}>
=======
        <HeroSection heroSrc={HERO_SRC} heroSrcSet={HERO_SRCSET} subjectSrc={SUBJECT_SRC}>
>>>>>>> master
          <AppPreview ref={pv} art={phoneArt} />
        </HeroSection>
        <FinalReveal />
        <Phone3D ref={phone} art={art} images={CARD_IMAGES} />
        <ParticleTransition ref={particles} art={phoneArt} />
        <div className="js-end-fade pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[22vh] opacity-0 bg-gradient-to-t from-[#080b0a] via-[#080b0acc] to-transparent" />
      </section>
<<<<<<< HEAD
      <TextShowcase/>
      <ProductDetails/>
      <TestimonialsSection/>
      <GetReadySection leftSrc={whiteBag} rightSrc={blackBag} ctaHref="/shop" />
      <CtaSection/>
        <Scoreboard />
        <Footer personImage = {FOOTER_SRC} ownerName = "FitMom Club" />
        
=======
      {showRest && (
        <Suspense fallback={<div style={{ minHeight: '100svh' }} />}>
          <BelowFold />
        </Suspense>
      )}
>>>>>>> master
    </>
  );
}
