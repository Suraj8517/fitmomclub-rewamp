import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);


const DEFAULT_ITEMS = [
  {
    title: "Personalized Programs",
    description:
      "Personalized workout programs designed for prenatal, postnatal, and busy moms, helping you regain strength, improve mobility, and stay active at every stage.",
    image:
      "https://res.cloudinary.com/q1vba78b/image/upload/v1791863505/wellness_e74adj.webp",
  },
  {
    title: "Holistic Wellness",
    description:
      "Achieve complete wellness through a balanced approach that combines fitness, nutritious eating, stress management, quality sleep, and emotional well-being.",
    image:
      "https://res.cloudinary.com/q1vba78b/image/upload/v1791863505/wellness_e74adj.webp",
  },
  {
    title: "Flexible Schedules",
    description:
      "Exercise anytime with flexible online sessions that easily fit into your daily routine—whether during nap time, early mornings, or evenings.",
    image:
      "https://res.cloudinary.com/q1vba78b/image/upload/v1791863503/online_bq5yyz.webp",
  },
  {
    title: "Expert Trainers",
    description:
      "Train with certified women's health and fitness specialists who provide safe, effective guidance tailored to every phase of motherhood.",
    image:
      "https://res.cloudinary.com/q1vba78b/image/upload/v1791863505/trainer_bxgvuy.webp",
  },
  {
    title: "Supportive Community",
    description:
      "Become part of a positive community where moms inspire, encourage, and celebrate each other's progress throughout their wellness journey.",
    image:
      "https://res.cloudinary.com/q1vba78b/image/upload/v1791863503/support_xgn6cr.webp",
  },
  {
    title: "Family-Friendly Approach",
    description:
      "Enjoy fitness routines that fit seamlessly into family life, with activities you can do alone or together with your little ones.",
    image:
      "https://res.cloudinary.com/q1vba78b/image/upload/v1791863500/family_eskmzh.webp",
  },
  {
    title: "Realistic Goals",
    description:
      "Focus on achievable milestones that build lasting healthy habits, helping you gain confidence without overwhelming your daily routine.",
    image:
      "https://res.cloudinary.com/q1vba78b/image/upload/v1791863504/goal_oip8yb.webp",
  },
  {
    title: "Custom Nutrition Plans",
    description:
      "Receive personalized nutrition plans crafted around your lifestyle, recovery, and health goals to fuel your body and support sustainable wellness.",
    image:
      "https://res.cloudinary.com/q1vba78b/image/upload/v1791863503/nutrition_rodna3.webp",
  },
];


const MOTION = {
  scrub: 1.2,            // smoothing lag (higher = softer, lazier). true = 1:1 with scroll
  titleFrom: 10,         // title slide distance in % of its width (right -> left)
  imageFrom: -25,        // image div start offset in % of its width (left -> right)
  imageScaleFrom: 0.9,   // image div starts at this size and grows to 1
  imageInnerScale: 1.15, // photo inside the frame starts zoomed and settles to 1
  rowStart: "top 90%",   // animation begins when row top hits 90% of viewport
  rowEnd: "top 40%",     // ...and finishes when it reaches 40% (bigger gap = slower)
};

export default function ProductDetails({
  heading = "Product Details",
  items = DEFAULT_ITEMS,
}) {
  const root = useRef(null);

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const ctx = gsap.context(() => {
      // Every animation is scrubbed: it is driven by scroll position,
      // so it grows as you scroll down and reverses as you scroll back up.

      // 1. Title: right -> left
      gsap.fromTo(
        ".pd-title",
        { xPercent: MOTION.titleFrom, opacity: 0 },
        {
          xPercent: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".pd-title",
            start: "top 95%",
            end: "top 65%",
            scrub: MOTION.scrub,
          },
        }
      );

      // 2. Rows: line grows from centre outwards, then text + image come in
      gsap.utils.toArray(".pd-row").forEach((row) => {
        const line = row.querySelector(".pd-line");
        const texts = row.querySelectorAll(".pd-text");
        const mask = row.querySelector(".pd-img-mask");
        const photo = row.querySelector(".pd-photo");

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: row,
            start: MOTION.rowStart,
            end: MOTION.rowEnd,
            scrub: MOTION.scrub,
          },
        });

        tl.fromTo(
          line,
          { scaleX: 0 },
          { scaleX: 1, duration: 1, transformOrigin: "50% 50%" }
        )
          .fromTo(texts, { opacity: 0 }, { opacity: 1, duration: 0.8, stagger: 0.1 }, 0.4)
          // image div: moves left -> right AND grows as you scroll
          .fromTo(
            mask,
            {
              xPercent: MOTION.imageFrom,
              scale: MOTION.imageScaleFrom,
              opacity: 0,
              transformOrigin: "0% 50%",
            },
            { xPercent: 0, scale: 1, opacity: 1, duration: 1 },
            0.3
          )
          // photo inside settles from zoomed-in to normal
          .fromTo(photo, { scale: MOTION.imageInnerScale }, { scale: 1, duration: 1 }, 0.3);
      });

      // 3. Closing line
      gsap.fromTo(
        ".pd-line-end",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          transformOrigin: "50% 50%",
          scrollTrigger: {
            trigger: ".pd-line-end",
            start: "top 100%",
            end: "top 70%",
            scrub: MOTION.scrub,
          },
        }
      );
    }, root);

    // Recalculate positions once images/fonts have loaded
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, [items]);

  return (
    <section
      ref={root}
      className="w-full overflow-hidden bg-black text-white"
      style={{ fontFamily: "'Newsreader', 'Tiempos Text', Georgia, serif" }}
    >
<div className="mx-auto w-full max-w-[1600px] px-6 pt-16 pb-0 md:px-12 md:pt-28 md:pb-0 lg:px-[9.5%]">
            {/* Heading */}
        <h2 className="pd-title mb-10 text-[34px] font-normal leading-none tracking-tight text-white md:mb-22 md:text-5xl">
          {heading}
        </h2>

        {/* Rows */}
        <div>
          {items.map((item, i) => (
            <article key={item.title + i} className="pd-row">
              <div className="pd-line h-px w-full origin-center bg-teal-400/70" />

              {/* Mobile: text left / image right. Desktop: 12-col grid */}
              <div className="grid grid-cols-[1fr_42%] gap-5 py-7 md:grid-cols-12 md:items-end md:gap-8 md:py-12">
                <h3 className="pd-text col-span-1 text-[28px] leading-[1.1] text-white md:col-span-4 md:text-[28px] md:self-end">
                  {item.title}
                </h3>

                <p className="pd-text order-3 col-span-1 text-[15px] font-extralight leading-snug text-white/60 md:order-none md:col-span-5 md:max-w-[520px] md:text-[22px] md:leading-tight">
                  {item.description}
                </p>

                <div className="pd-img-mask relative order-2 row-span-2 aspect-[16/10] w-full self-center overflow-hidden md:order-none md:col-span-3 md:row-span-1 md:self-end">
                  {/* image or placeholder */}
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="pd-photo h-full w-full object-cover  contrast-125"
                    />
                  ) : (
                    <div className="pd-photo h-full w-full bg-gradient-to-br from-black via-neutral-700 to-neutral-300" />
                  )}
                  {/* teal tint replacing original colours */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              </div>
            </article>
          ))}

          <div className="pd-line-end h-px w-full origin-center bg-teal-400/70" />
        </div>
      </div>
    </section>
  );
}