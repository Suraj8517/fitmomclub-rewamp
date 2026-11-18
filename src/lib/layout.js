export const A = 540 / 1150; // app screen aspect
export const AP = 560 / 1125; // whole-phone aspect (frame + screen)

/** Pure geometry shared by the preview, particles and 3D phone. */
export function computeLayout() {
  const W = innerWidth, H = innerHeight, m = W < 800;
  const dpr = Math.min(devicePixelRatio || 1, m ? 1.5 : 2);
  const ph = Math.min(H * 0.3, m ? 200 : 300), pw = ph * AP;
  const pl = W - pw - Math.max(m ? 34 : 20, W * 0.05), pt = H - ph - Math.max(34, H * 0.09);
  const phH = m ? Math.min(H * 0.5, W * 0.7 * 2.09) : Math.min(H * 0.72, W * 0.8 * 2.09);
  const cy = H / 2 + (m ? H * 0.06 : 0), sh = (phH * 1.98) / 2.09;
  return { W, H, m, dpr, pw, ph, pl, pt, phH, cy, cx: W / 2, sh, sw: sh * A, phW: phH * AP,
    y0: 1 - (cy + phH / 2) / H, y1: 1 - (cy - phH / 2) / H };
}
