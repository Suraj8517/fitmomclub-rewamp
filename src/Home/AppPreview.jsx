import { forwardRef, useEffect, useRef } from 'react';

const corner = 'absolute size-3.5 border-warm/80';

/** Small tilted app preview with technical corner brackets. Position/transform are driven by the scroll hook. */
const AppPreview = forwardRef(function AppPreview({ art }, ref) {
  const cv = useRef(null);
  useEffect(() => { if (art) cv.current.getContext('2d').drawImage(art, 0, 0, 280, 563); }, [art]);
  return (
    <div ref={ref} className="absolute z-6 will-change-transform ">
      <canvas ref={cv} width="280" height="563" className="block size-full drop-shadow-[0_30px_40px_rgba(0,0,0,.5)]" />
      <div className="js-labels pointer-events-none absolute -inset-x-3 -top-8 -bottom-8 min-[800px]:-bottom-14 min-[800px]:-inset-x-7 font-mono text-[9px] uppercase tracking-[.22em]">
        <i className={`${corner} left-0 top-0 border-l border-t`} />
        <i className={`${corner} right-0 top-0 border-r border-t`} />
        <i className={`${corner} bottom-0 left-0 border-b border-l`} />
        <i className={`${corner} bottom-0 right-0 border-b border-r`} />
        <span className="absolute left-6 top-1 text-teal">App·01</span>
        <span className="absolute inset-x-0 bottom-6 text-center text-warm/60 max-[799px]:hidden">X 66.4 · Y 39.7</span>
        <span className="absolute inset-x-0 bottom-2 text-center text-warm/60 max-[799px]:hidden">Fitmom app / 01</span>
      </div>
    </div>
  );
});
export default AppPreview;
