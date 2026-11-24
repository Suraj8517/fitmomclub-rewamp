import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TestimonialsSection from './testimonialSection';
import TextShowcase from './ImageSection';
import GetReadySection from './getReadySection';
import Scoreboard from './components/homeMenu';
import ProductDetails from './productDetails';
import CtaSection from './ctaSection';
import Footer from '../footer/footer';
import { whiteBag, blackBag, FOOTER_SRC } from '../config';

/** Everything under the pinned hero. Loaded as ONE lazy chunk (after the hero has painted) so that all
 *  ScrollTriggers register together, in document order, and the heavy code (three.js dust, GSAP sections)
 *  stays out of the critical path. */
export default function BelowFold() {
  useEffect(() => {
    // sections were mounted after the hero's triggers were measured: re-measure everything once
    const id = requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <>
      <TextShowcase />
      <ProductDetails />
      <TestimonialsSection />
      <GetReadySection leftSrc={whiteBag} rightSrc={blackBag} ctaHref="/shop" />
      <CtaSection />
      <Scoreboard />
      <Footer personImage={FOOTER_SRC} ownerName="FitMom Club" />
    </>
  );
}
