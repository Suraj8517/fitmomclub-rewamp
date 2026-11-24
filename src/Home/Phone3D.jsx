import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
<<<<<<< HEAD
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
=======

/** Three.js canvas layer (phone + orbiting cards). Parent calls ref.resize(layout) and ref.render(state, time).
 *  three.js is loaded lazily; the last layout is remembered and applied as soon as the scene exists. */
const Phone3D = forwardRef(function Phone3D({ art, images }, ref) {
  const cv = useRef(null), scene = useRef(null), lastL = useRef(null);
  useEffect(() => {
    if (!art) return;
    let dead = false, made = null;
    import('../lib/phoneScene').then(({ createPhoneScene }) => {
      if (dead || !cv.current) return;
      made = scene.current = createPhoneScene(cv.current, art, images);
      if (lastL.current) made.resize(lastL.current);
    });
    return () => { dead = true; made?.dispose(); scene.current = null; };
  }, [art, images]);
  useImperativeHandle(ref, () => ({
    resize: (L) => { lastL.current = L; scene.current?.resize(L); },
    render: (S, t) => scene.current?.render(S, t),
  }), []);
>>>>>>> master
  return <canvas ref={cv} className="invisible absolute inset-0 z-4 size-full" />;
});
export default Phone3D;
