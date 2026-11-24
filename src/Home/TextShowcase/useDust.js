import { useEffect } from "react";
import * as THREE from "three";
import { C } from "./constants";

/* Three.js: drifting dust, parallaxed by scroll */
export default function useDust({ canvasRef, progressRef, hiddenRef, ambientRef }) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    } catch {
      return; // WebGL unavailable: the section works fine without the dust
    }
    const lowPower = window.innerWidth < 768;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
    camera.position.z = 6;

    const N = lowPower ? 320 : 650;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const speed = new Float32Array(N);
    const phase = new Float32Array(N);
    const cream = new THREE.Color(C.cream);
    const teal = new THREE.Color(C.tealSoft);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7.4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      speed[i] = 0.03 + Math.random() * 0.12;
      phase[i] = Math.random() * Math.PI * 2;
      const c = cream.clone().lerp(teal, Math.random() < 0.3 ? Math.random() : 0);
      col.set([c.r, c.g, c.b], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas.parentElement;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let smooth = 0;
    const clock = new THREE.Clock();

    const frame = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      if (ambientRef.current) {
        for (let i = 0; i < N; i++) {
          let y = pos[i * 3 + 1] + speed[i] * dt;
          if (y > 3.7) y = -3.7;
          pos[i * 3 + 1] = y;
          pos[i * 3] += Math.sin(t * 0.4 + phase[i]) * 0.0006;
        }
        geo.attributes.position.needsUpdate = true;
      }
      smooth += (progressRef.current - smooth) * 0.06;
      points.position.x = -smooth * 6;
      if (!hiddenRef.current) renderer.render(scene, camera); // no GPU work while covered
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}