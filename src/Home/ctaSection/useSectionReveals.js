import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { STATS } from "./constants";

gsap.registerPlugin(ScrollTrigger);

// Copy reveal, stat divider lines, and count-up numbers.
export default function useSectionReveals(rootRef, numsRef) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".reveal", {
        y: 28, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.1,
        scrollTrigger: { trigger: rootRef.current, start: "top 75%" },
      });
      gsap.from(".stat-line", {
        scaleX: 0, transformOrigin: "left", duration: 1, ease: "power2.out", stagger: 0.12,
        scrollTrigger: { trigger: ".stats", start: "top 85%" },
      });
      STATS.forEach((stat, i) => {
        const o = { n: 0 };
        gsap.to(o, {
          n: stat.value, duration: 1.8, ease: "power2.out",
          scrollTrigger: { trigger: ".stats", start: "top 85%", once: true },
          onUpdate: () => numsRef.current[i] && (numsRef.current[i].textContent = Math.round(o.n)),
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, [rootRef, numsRef]);
}