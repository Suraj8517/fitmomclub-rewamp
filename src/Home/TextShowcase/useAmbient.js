import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/* ambient-motion toggle state + the equalizer icon bars (button is commented out in the JSX) */
export default function useAmbient() {
  const [ambient, setAmbient] = useState(true);
  const ambientRef = useRef(true);
  const barsRef = useRef([]);

  useEffect(() => {
    ambientRef.current = ambient;
    const bars = barsRef.current.filter(Boolean);
    gsap.killTweensOf(bars);
    if (ambient && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      bars.forEach((b, i) =>
        gsap.to(b, {
          scaleY: gsap.utils.random(0.35, 1),
          duration: gsap.utils.random(0.35, 0.7),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.08,
          transformOrigin: "50% 100%",
        })
      );
    } else {
      gsap.set(bars, { scaleY: 0.25, transformOrigin: "50% 100%" });
    }
    return () => gsap.killTweensOf(bars);
  }, [ambient]);

  return { ambient, setAmbient, ambientRef, barsRef };
}