import React, { useRef } from "react";
import HelixRibbon from "./ctaSection/helixRibbon";
import Stats from "./ctaSection/stats";
import useHelix from "./ctaSection/useHelix";
import useSectionReveals from "./ctaSection/useSectionReveals";

export default function CtaSection() {
  const root = useRef(null);
  const stage = useRef(null);
  const cards = useRef([]);
  const nums = useRef([]);

  useHelix(root, stage, cards);
  useSectionReveals(root, nums);

  return (
    <section ref={root} className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-[88rem] items-center gap-8 px-5 sm:px-8 lg:grid-cols-12 lg:gap-4">
        {/* Copy */}
        <div className="lg:col-span-4">
          <p className="reveal text-sm font-medium uppercase tracking-tight text-slate-500">
            Trusted by incredible Moms
          </p>
          <h2 className="reveal mt-3 font-serif text-4xl font-extrabold leading-[1.05] tracking-tight text-teal-800 sm:text-5xl">
            Not Sure Which Program is Right for You?
          </h2>
          <p className="reveal mt-5 max-w-md text-lg leading-snug text-slate-500">
            Discover the perfect plan tailored to your wellness journey. Take our quick quiz to get personalised recommendations, or contact us for expert guidance.
          </p>
          <a
            href="#book"
            className="reveal mt-8 inline-flex bg-teal-600 px-7 py-4 text-base font-medium text-white transition-colors hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          >
            Book a Free Consultation
          </a>
        </div>

        <HelixRibbon stageRef={stage} cardsRef={cards} />
        <Stats numsRef={nums} />
      </div>
    </section>
  );
}