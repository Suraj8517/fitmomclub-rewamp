import { Play } from 'lucide-react';

export default function FinalReveal() {
  return (
    <>
      <div className="js-world pointer-events-none absolute inset-0 z-3 overflow-hidden">
       
        <div className="js-floor absolute inset-x-0 bottom-0 h-[32%] opacity-0 bg-[radial-gradient(60%_100%_at_50%_100%,rgba(77,184,165,.4),transparent_70%)]" />
        <div className="js-final absolute inset-0 opacity-0">
          <h2 className="js-title absolute left-1/2 top-1/2 w-[94vw] text-center font-display text-[10vw] font-normal uppercase leading-[.96] bg-clip-text text-transparent bg-[radial-gradient(55%_130%_at_var(--lx,62%)_0%,rgba(232,255,250,.95),rgba(127,224,210,.5)_38%,rgba(246,247,243,.1)_78%)] [filter:drop-shadow(0_0_22px_rgba(127,224,210,.22))] min-[800px]:text-[clamp(54px,6vw,110px)]">
            Your wellness journey.<br />All in one place.
          </h2>
          <p className="js-copy absolute bottom-[max(22px,env(safe-area-inset-bottom))] left-[calc(4vw+64px)] right-5 text-[13px] leading-snug text-warm/85 min-[800px]:bottom-[max(30px,5vh)] min-[800px]:left-[5vw] min-[800px]:right-auto min-[800px]:max-w-[27ch] min-[800px]:text-[clamp(15px,1.35vw,19px)]">
            <span className="mb-4 block h-[3px] w-11 bg-teal2 max-[799px]:hidden" />
            Fitness, nutrition, progress and expert support — everything you need to put yourself first.
          </p>
        </div>
      </div>

    
    </>
  );
}
