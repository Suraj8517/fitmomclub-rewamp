import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CARD_COUNT, STEP, PITCH, R, CARD_W, CARD_H } from "./constants";

gsap.registerPlugin(ScrollTrigger);

// Drives the 3D helix: constant drift + extra speed from scroll velocity.
export default function useHelix(rootRef, stageRef, cardsRef) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const range = CARD_COUNT * STEP;

    const ctx = gsap.context(() => {
      const st = { offset: 0, boost: 0, target: 0 };
      let s = 1;

      const measure = () => {
        const W = stageRef.current.clientWidth;
        const H = stageRef.current.clientHeight;
        s = Math.min(W / 600, H / 830);
        stageRef.current.style.perspective = `${1800 * s}px`;
        cardsRef.current.forEach((el) => {
          if (!el) return;
          el.style.width = `${CARD_W * s}px`;
          el.style.height = `${CARD_H * s}px`;
          el.style.marginLeft = `${(-CARD_W * s) / 2}px`;
          el.style.marginTop = `${(-CARD_H * s) / 2}px`;
          el.style.fontSize = `${s}em`;
        });
      };
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(stageRef.current);

      const BASE = reduce ? 0.03 : 0.22; // rad/s, always drifting up
      const render = (_t, dtMs) => {
        const dt = Math.min(dtMs, 50) / 1000;
        st.boost += (st.target - st.boost) * Math.min(1, dt * 3.5); // smooth accel
        st.target *= Math.pow(0.03, dt); // smooth decay after scrolling stops
        st.offset -= (BASE + st.boost) * dt; // decreasing angle = cards travel up

        for (let i = 0; i < CARD_COUNT; i++) {
          const el = cardsRef.current[i];
          if (!el) continue;
          // wrap each card's angle into [-range/2, range/2]
          const th = ((((i * STEP + st.offset) % range) + range) % range) - range / 2;
          const c = Math.cos(th);
          const y = th * PITCH * s;
          const back = Math.min(1, Math.max(0, (-c + 0.15) / 1.0)); // 0 front .. 1 behind
          const end = 1 - Math.pow(Math.abs(th) / (range / 2), 6); // fade at wrap points
          el.style.transform = `translate3d(0,${y}px,0) rotateY(${th}rad) translateZ(${R * s}px) rotateZ(${(c * 1.6).toFixed(2)}deg)`;
          el.style.opacity = (1 - back * 0.35) * end;
          el.style.filter = back > 0.05 ? `blur(${(back * 9 * Math.max(s, 0.6)).toFixed(1)}px)` : "none";
          el.style.zIndex = Math.round((c + 1) * 50);
        }
      };
      gsap.ticker.add(render);

      // scrolling down speeds the cards up; scrolling up slows/reverses them
      ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = self.getVelocity() / 1000;
          st.target = gsap.utils.clamp(-1.2, 4, v * 0.55);
        },
      });

      return () => {
        gsap.ticker.remove(render);
        ro.disconnect();
      };
    }, rootRef);

    return () => ctx.revert();
  }, [rootRef, stageRef, cardsRef]);
}