import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createPhoneScene } from '../lib/phoneScene';

/** Three.js canvas layer (phone + orbiting cards). Parent calls ref.resize(layout) and ref.render(state, time). */
const Phone3D = forwardRef(function Phone3D({ art, images }, ref) {
  const cv = useRef(null), scene = useRef(null);
  useEffect(() => {
    if (!art) return;
    scene.current = createPhoneScene(cv.current, art, images);
    return () => { scene.current?.dispose(); scene.current = null; };
  }, [art, images]);
  useImperativeHandle(ref, () => ({ resize: (L) => scene.current?.resize(L), render: (S, t) => scene.current?.render(S, t) }), []);
  return <canvas ref={cv} className="invisible absolute inset-0 z-4 size-full" />;
});
export default Phone3D;
