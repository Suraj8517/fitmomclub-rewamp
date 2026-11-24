import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CARD_OFFSETS, TICKS, COUNT_FROM, COUNT_TO, EXIT, HIDDEN_L, HIDDEN_R, SHOWN,
} from "./constants";

gsap.registerPlugin(ScrollTrigger);

/* pin, horizontal run, strip exit, next-section reveal, badge curve */
export default function useShowcaseScroll({ refs, labels }) {
  const { nextRef, sectionRef, pinRef, trackRef, stRef, progressRef, hiddenRef, lastUiRef } = refs;

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ScrollTrigger.config({ ignoreMobileResize: true }); // stop mobile URL-bar jitter

    const offFns = [];
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const next = nextRef.current;
      const dist = () => Math.max(1, track.scrollWidth - window.innerWidth);
      const panels = Array.from(track.querySelectorAll("[data-panel]"));

      /* scroll distance reserved after the horizontal run for the exit + reveal */
      const extra = () => Math.round(window.innerHeight * (reduce ? 0.6 : 3.3));

      /* 1) the pin: holds the section for run + exit + reveal */
      const pinTrigger = ScrollTrigger.create({
        trigger: pinRef.current,
        pin: true,
        anticipatePin: 1,
        start: "top top",
        end: () => "+=" + (dist() + extra()),
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const s = Math.max(0, self.scroll() - self.start);
          const total = dist() + extra();
          const p = gsap.utils.clamp(0, 1, s / total);
          const ph = gsap.utils.clamp(0, 1, s / dist());
          progressRef.current = ph;
          const mid = ph * dist() + window.innerWidth * 0.5;
          let panel = panels.length - 1;
          for (let i = 0; i < panels.length; i++) {
            const el = panels[i];
            if (mid >= el.offsetLeft && mid < el.offsetLeft + el.offsetWidth) {
              panel = i;
              break;
            }
          }
          const swapAt = reduce ? dist() : dist() + extra() * (EXIT.swap / EXIT.total);
          if (s > swapAt) panel = panels.length; // the revealed section
          hiddenRef.current = s > swapAt;

          /* send the numbers to the global <Scoreboard /> */
          const nextUi = {
            tick: Math.round(p * TICKS),
            count: Math.round(gsap.utils.mapRange(0, 1, COUNT_FROM, COUNT_TO, p)),
            panel,
            label: labels[panel] ?? labels[0],
            total: labels.length,
          };
          const key = `${nextUi.tick}|${nextUi.count}|${nextUi.panel}`;
          if (key !== lastUiRef.current) {
            lastUiRef.current = key;
            window.dispatchEvent(new CustomEvent("scoreboard:update", { detail: nextUi }));
          }
        },
      });
      stRef.current = pinTrigger;

      /* 2) the horizontal run: first `dist` pixels of scrolling */
      const scrollTween = gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => "+=" + dist(),
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });

      if (reduce) {
        /* no strips / no motion: just show the next section once reached */
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: () => "top+=" + dist() + " top",
          onEnter: () => gsap.set(next, { autoAlpha: 1 }),
          onLeaveBack: () => gsap.set(next, { autoAlpha: 0 }),
        });
        return;
      }

      /* hero headline: plays once on load */
      gsap.fromTo(
        "[data-intro]",
        { "--p": 100, x: 80 },
        { "--p": 0, x: 0, duration: 1.5, stagger: 0.18, ease: "power3.out", delay: 0.25 }
      );
      gsap.from("[data-sub]", { opacity: 0, duration: 1, delay: 1.2 });

      /* feature cards: slide up/left into place as the track moves */
      gsap.utils.toArray("[data-slot]", track).forEach((slot, i) => {
        const card = slot.querySelector("[data-card]");
        const copy = slot.querySelector("[data-copy]");
        const off = CARD_OFFSETS[i % CARD_OFFSETS.length];
        gsap.fromTo(
          card,
          { x: 160, y: off + 150, opacity: 0 },
          {
            x: 0,
            y: off,
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: slot,
              containerAnimation: scrollTween,
              start: "left 108%",
              end: "left 52%",
              scrub: true,
            },
          }
        );
        gsap.fromTo(
          copy,
          { opacity: 0 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: slot,
              containerAnimation: scrollTween,
              start: "left 75%",
              end: "left 45%",
              scrub: true,
            },
          }
        );
      });

      /* closing headline: wipe in, line by line */
      const closing = track.querySelector("[data-closing]");
      if (closing) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: closing,
              containerAnimation: scrollTween,
              start: "left 100%",
              end: "left 30%",
              scrub: true,
            },
          })
          .fromTo(
            closing.querySelectorAll("[data-line]"),
            { "--p": 100, x: 80 },
            { "--p": 0, x: 0, ease: "none", stagger: 0.3 }
          );
      }

      /* 3) the exit, one scrubbed timeline:
            a. strips sweep in and cover the first section
            b. next section is swapped in underneath
            c. strips retract (same stagger) revealing it
            d. title lines reveal one by one, then subject grows, title lines
               drift at different speeds (parallax), and the vertical badge
               moves in and settles on the subject */
      const strips = gsap.utils.toArray("[data-strip]", pinRef.current);
      const exitTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: () => "top+=" + dist() + " top",
          end: () => "+=" + extra(),
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      strips.forEach((el, i) => {
        const fromLeft = i % 2 === 0;
        exitTl.fromTo(
          el,
          { clipPath: fromLeft ? HIDDEN_L : HIDDEN_R },
          { clipPath: SHOWN, ease: "none", duration: 0.45 },
          i * 0.055
        );
      });

      exitTl.set(next, { autoAlpha: 1 }, EXIT.swap);

      strips.forEach((el, i) => {
        const fromLeft = i % 2 === 0;
        exitTl.fromTo(
          el,
          { clipPath: SHOWN },
          {
            clipPath: fromLeft ? HIDDEN_L : HIDDEN_R,
            ease: "none",
            duration: 0.45,
            immediateRender: false,
          },
          EXIT.retract + i * 0.055
        );
      });

      const gd = EXIT.total - EXIT.grow;
      exitTl.fromTo(
        "[data-subject]",
        { scale: 1, xPercent: 0 },
        {
          scale: 1.14,
          xPercent: -3,
          transformOrigin: "50% 100%",
          ease: "power1.inOut",
          duration: gd,
          immediateRender: false,
        },
        EXIT.grow
      );

      /* title lines: staggered reveal as the strips leave, then per-line parallax */
      const tLines = gsap.utils.toArray("[data-tline]", pinRef.current);
      tLines.forEach((el, i) => {
        const inner = el.querySelector("[data-tline-in]");

        /* reveal: slides up out of its mask with a slight skew, one line after another */
        exitTl.fromTo(
          inner,
          { yPercent: 110, skewY: 6 },
          { yPercent: 0, skewY: 0, ease: "power3.out", duration: 0.6 },
          EXIT.retract + 0.5 + i * 0.12
        );

        /* parallax: each line drifts a different distance during the grow phase */
        exitTl.fromTo(
          el,
          { x: 0, y: 0 },
          {
            x: el.dataset.dx,
            y: el.dataset.dy,
            ease: "none",
            duration: gd,
            immediateRender: false,
          },
          EXIT.grow
        );
      });

      /* badge: ONE continuous curve (no stop between the two stages).
         It starts big at the right edge, passes a mid waypoint, and lands on the
         subject at 50% opacity. Position and scale follow a quadratic Bezier that
         goes exactly through the waypoint; scale is interpolated in log space so
         the shrink feels even. The text is rendered at its LARGEST size and only
         ever scaled DOWN, so it stays crisp and the GPU just moves one layer. */
      const badge = pinRef.current.querySelector("[data-badge]");
      const geo = { S: null, M: null, E: null };
      const proxy = { t: 0 };

      const remeasure = () => {
        const pin = pinRef.current;
        const W = pin.clientWidth;
        const H = pin.clientHeight;
        const narrowNow = W < 768;

        badge.style.fontSize = "100px";
        const lenEm = badge.offsetHeight / 100; // text length in em
        /* FINAL SIZE: text is 84% of the screen height (62% on phones) */
        const fontEnd = (H * (narrowNow ? 0.62 : 0.84)) / lenEm;
        badge.style.fontSize = fontEnd + "px";

        const column = badge.offsetWidth;
        /* FINAL POSITION: must match left-[72.9%] / max-md:left-[90%] on the badge in NextSection.jsx */
        const endX = W * (narrowNow ? 0.9 : 0.729);
        const startX = W * 0.985 - column / 2; // starts at the right edge

        geo.S = { x: startX - endX, y: 0, ls: 0 };
        geo.M = { x: (startX - endX) * 0.5, y: 0, ls: 0 }; // straight line, no resizing
        geo.E = { x: 0, y: 0, ls: 0 };
      };

      const bez = (a, c, b, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;
      const smooth01 = (v) => {
        const k = Math.min(1, Math.max(0, v));
        return k * k * (3 - 2 * k);
      };
      const apply = () => {
        if (!geo.S) return;
        const t = proxy.t;
        const { S, M, E } = geo;
        const ctrl = (k) => 2 * M[k] - (S[k] + E[k]) / 2; // passes through M at t = 0.5
        const x = bez(S.x, ctrl("x"), E.x, t);
        const y = bez(S.y, ctrl("y"), E.y, t);
        const sc = Math.exp(bez(S.ls, ctrl("ls"), E.ls, t));
        const o = 1 - 0.2 * smooth01((t - 0.4) / 0.6); // full opacity, settles at 80%
        badge.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%) scale(${sc.toFixed(4)})`;
        badge.style.opacity = o.toFixed(3);
      };

      remeasure();
      apply();
      const onRefresh = () => {
        remeasure();
        apply();
      };
      ScrollTrigger.addEventListener("refresh", onRefresh);
      offFns.push(() => ScrollTrigger.removeEventListener("refresh", onRefresh));

      exitTl.fromTo(
        proxy,
        { t: 0 },
        { t: 1, ease: "sine.inOut", duration: gd, onUpdate: apply },
        EXIT.grow
      );

      /* fonts change text length: re-measure once they are ready */
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    }, pinRef);

    return () => {
      offFns.forEach((fn) => fn());
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}