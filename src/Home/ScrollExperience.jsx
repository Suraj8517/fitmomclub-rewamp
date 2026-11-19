import { useEffect, useMemo, useRef, useState } from 'react';
import HeroSection from './HeroSection';
import AppPreview from './AppPreview';
import ParticleTransition from './ParticleTransition';
import Phone3D from './Phone3D';
import FinalReveal from './FinalReveal';
import useScrollTimeline from '../hooks/useScrollTimeline';
import { createAppArt, createPhoneArt } from '../lib/appArt';
import { HERO_SRC, SUBJECT_SRC, APP_SRC, CARD_IMAGES ,whiteBag,blackBag} from '../config';
import TestimonialsSection from './testimonialSection';
import TextShowcase from './ImageSection';
import GetReadySection from './getReadySection';
import Scoreboard from './components/homeMenu';

/** Pinned stage: hero -> detach -> particles -> 3D phone reveal. Owns the shared scroll state. */
export default function ScrollExperience() {
  const stage = useRef(null), pv = useRef(null), particles = useRef(null), phone = useRef(null);
  const S = useRef({ lift: 0, part: 0, pa: 0, spin: 0, orbit: 0, cards: 0 }).current;
  const [art, setArt] = useState(null);
  const phoneArt = useMemo(() => (art ? createPhoneArt(art) : null), [art]); // whole phone: preview + particles

  useEffect(() => {
    let live = true;
    createAppArt(APP_SRC).then((a) => live && setArt(a));
    return () => { live = false; };
  }, []);

  useScrollTimeline({ art, S, stage, pv, particles, phone });

  return (
    <>
      <section ref={stage} className="relative h-svh overflow-hidden">
        <HeroSection heroSrc={HERO_SRC} subjectSrc={SUBJECT_SRC}>
          <AppPreview ref={pv} art={phoneArt} />
        </HeroSection>
        <FinalReveal />
        <Phone3D ref={phone} art={art} images={CARD_IMAGES} />
        <ParticleTransition ref={particles} art={phoneArt} />
        {/* black seam into the next section; fades in at the very end of the pin */}
        <div className="js-end-fade pointer-events-none absolute inset-x-0 bottom-0 z-40 h-[22vh] opacity-0 bg-gradient-to-t from-[#080b0a] via-[#080b0acc] to-transparent" />
      </section>
      {/* content below the pinned sequence loads here */}
      <TextShowcase/>
      <TestimonialsSection/>
      <GetReadySection leftSrc={whiteBag} rightSrc={blackBag} ctaHref="/shop" />
        <Scoreboard />
    </>
  );
}
