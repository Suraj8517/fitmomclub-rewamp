import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createParticles } from '../lib/particles';

/** Canvas layer. Parent calls ref.resize(layout) and ref.draw(scrollState). */
const ParticleTransition = forwardRef(function ParticleTransition({ art }, ref) {
  const cv = useRef(null), sys = useRef(null);
  useEffect(() => { sys.current = createParticles(cv.current); return () => { sys.current = null; }; }, []);
  useEffect(() => { if (art) sys.current?.build(art); }, [art]);
  useImperativeHandle(ref, () => ({ resize: (L) => sys.current?.resize(L), draw: (S) => sys.current?.draw(S) }), []);
  return <canvas ref={cv} className="pointer-events-none absolute inset-0 z-5 size-full" />;
});
export default ParticleTransition;
