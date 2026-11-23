import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {PROGRAM_IMAGES} from "../config"
gsap.registerPlugin(ScrollTrigger);

const BRANDS = [
  {
    tag: "Blossom",
    name: "Prenatal Care",
      image: PROGRAM_IMAGES[0],
  },
  {
    tag: "Queen",
    name: "Postnatal Care",
    image: PROGRAM_IMAGES[1],
  },
  {
    tag: "Pro",
    name: "No Health Conditions",
    image: PROGRAM_IMAGES[4],
  },
  {
    tag: "Elite",
    name: "With Health Conditions",
     image: PROGRAM_IMAGES[2],
  },
  {
    tag: "Tone Up",
    name: "Fitness-Based Body Toning Program",
    image: PROGRAM_IMAGES[3],
  },
];

const CARD_COUNT = 15; // cards on the helix (cycles through BRANDS)

const STATS = [
  { prefix: "", value: "1", suffix: "lakh+", label: "Lives Transformed" },
  { prefix: "", value: "98", suffix: "%", label: "Success Rate" },
  { prefix: "", value: 70, suffix: "+", label: "Countries Served" },
    { prefix: "", value: "40", suffix: "K+", label: "Members Community" },
  { prefix: "", value: "400", suffix: "+", label: "Team Members" },
];

const R = 290; // radius of the cylinder
const PITCH = 110; // vertical px travelled per radian
const GAP_PX = 55 + 10; // original vertical spacing (55px) + 10px
const STEP = GAP_PX / PITCH; // angle between neighbouring cards (rad) ≈ 0.59
const CARD_W = 155;
const CARD_H = 265;

export default function CtaSection() {
  const root = useRef(null);
  const stage = useRef(null);
  const cards = useRef([]);
  const nums = useRef([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const range = CARD_COUNT * STEP;

    const ctx = gsap.context(() => {
      const st = { offset: 0, boost: 0, target: 0 };
      let s = 1;
      const measure = () => {
        const W = stage.current.clientWidth;
        const H = stage.current.clientHeight;
        s = Math.min(W / 600, H / 830);
        stage.current.style.perspective = `${1800 * s}px`;
        cards.current.forEach((el) => {
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
      ro.observe(stage.current);

      const BASE = reduce ? 0.03 : 0.22; // rad/s, always drifting up
      const render = (_t, dtMs) => {
        const dt = Math.min(dtMs, 50) / 1000;
        st.boost += (st.target - st.boost) * Math.min(1, dt * 3.5); // smooth accel
        st.target *= Math.pow(0.03, dt); // smooth decay after scrolling stops
        st.offset -= (BASE + st.boost) * dt; // decreasing angle = cards travel up the S

        for (let i = 0; i < CARD_COUNT; i++) {
          const el = cards.current[i];
          if (!el) continue;
          // wrap each card's angle into [-range/2, range/2]
          const th = ((((i * STEP + st.offset) % range) + range) % range) - range / 2;
          const c = Math.cos(th);
          const y = th * PITCH * s;
          const back = Math.min(1, Math.max(0, (-c + 0.15) / 1.0)); // 0 front .. 1 behind
          const end = 1 - Math.pow(Math.abs(th) / (range / 2), 6); // fade at wrap points
          el.style.transform =
            `translate3d(0,${y}px,0) rotateY(${th}rad) translateZ(${R * s}px) rotateZ(${(c * 1.6).toFixed(2)}deg)`;
          el.style.opacity = (1 - back * 0.35) * end;
          el.style.filter = back > 0.05 ? `blur(${(back * 9 * Math.max(s, 0.6)).toFixed(1)}px)` : "none";
          el.style.zIndex = Math.round((c + 1) * 50);
        }
      };
      gsap.ticker.add(render);

      // scrolling down speeds the cards up the S; scrolling up slows/reverses them
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = self.getVelocity() / 1000;
          st.target = gsap.utils.clamp(-1.2, 4, v * 0.55);
        },
      });

      gsap.from(".reveal", {
        y: 28, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.1,
        scrollTrigger: { trigger: root.current, start: "top 75%" },
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
          onUpdate: () => nums.current[i] && (nums.current[i].textContent = Math.round(o.n)),
        });
      });

      return () => {
        gsap.ticker.remove(render);
        ro.disconnect();
      };
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-[88rem] items-center gap-8 px-5 sm:px-8 lg:grid-cols-12 lg:gap-4">
        {/* Copy */}
        <div className="lg:col-span-4">
          <p className="reveal text-sm font-medium uppercase tracking-tight text-slate-500">
            Trusted by incredible Moms
          </p>
          <h2 className="reveal mt-3 font-serif text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">
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

        {/* Helix ribbon (mask = soft top/bottom fade) */}
        <div
          className="relative order-last h-[440px] sm:h-[560px] lg:order-none lg:col-span-4 lg:h-[780px]"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 6%, #000 94%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, transparent 0, #000 6%, #000 94%, transparent 100%)",
          }}
          aria-hidden="true"
        >
          <div ref={stage} className="absolute inset-0">
            {Array.from({ length: CARD_COUNT }).map((_, i) => {
              const b = BRANDS[i % BRANDS.length];
              return (
                <div
                  key={i}
                  ref={(el) => (cards.current[i] = el)}
                  className="absolute left-1/2 top-1/2 overflow-hidden rounded-xl bg-slate-800 shadow-xl will-change-transform"
                >
                  {/* background image */}
                  <img
                    src={b.image}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {/* dark gradient so the label stays readable */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* brand label / logo */}
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-center px-3 pb-[8%]">
                    {b.logo ? (
                      <img src={b.logo} alt="" className="max-h-[14%] max-w-[70%] object-contain" />
                    ) : (
                      <span className="text-center text-[1.15em] font-semibold leading-tight tracking-tight text-white">
                        {b.name}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="stats grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="relative py-5 lg:py-6">
              <div className="flex items-center gap-4 lg:justify-end">
                <div className="whitespace-nowrap font-serif text-5xl font-extrabold leading-none text-slate-950 sm:text-5xl">
                  {stat.prefix}
                  <span ref={(el) => (nums.current[i] = el)}>0</span>
                  <span className="font-light text-teal-600">{stat.suffix}</span>
                </div>
                <p className="max-w-[9rem] text-lg leading-tight text-slate-500">{stat.label}</p>
              </div>
              <span className="stat-line absolute bottom-0 left-0 h-px w-full bg-teal-600/20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}