import { useEffect } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

/* the global <Scoreboard /> play button asks this section to step to the next stop */
export default function useStepNext({ stRef, trackRef }) {
  useEffect(() => {
    const goNext = () => {
      const st = stRef.current;
      const track = trackRef.current;
      if (!st || !track) return;
      const dist = Math.max(1, track.scrollWidth - window.innerWidth);
      const pos = gsap.utils.clamp(0, dist, st.scroll() - st.start);
      const stops = Array.from(track.querySelectorAll("[data-stop]")).map((el) =>
        gsap.utils.clamp(0, dist, el.offsetLeft + el.offsetWidth / 2 - window.innerWidth / 2)
      );
      const target = stops.find((s) => s > pos + 12) ?? 0; // wraps to the start
      gsap.to(window, {
        scrollTo: { y: st.start + target, autoKill: true },
        duration: 1.4,
        ease: "power2.inOut",
      });
    };

    window.addEventListener("scoreboard:next", goNext);
    return () => window.removeEventListener("scoreboard:next", goNext);
  }, [stRef, trackRef]);
}