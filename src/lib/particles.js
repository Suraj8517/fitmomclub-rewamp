import { AP } from './layout';

/** 2D-canvas particle system. Samples the WHOLE phone image (frame + screen), so the phone itself turns to particles
 *  and reassembles as a whole phone. Targets are precomputed; drawing is driven by scroll state S. */
export function createParticles(canvas) {
  const ctx = canvas.getContext('2d');
  let N = 0, gw = 0, gh = 0, gx, gy, dl, bow, sx, sy, tx, ty, bx, by, pp, col, acc, cell0 = 1, cell1 = 1, L = null;

  function build(art) {
    gw = innerWidth < 800 ? 38 : 56; gh = Math.round(gw / AP);
    const t = document.createElement('canvas'); t.width = gw; t.height = gh;
    const x = t.getContext('2d'); x.drawImage(art, 0, 0, gw, gh);
    const d = x.getImageData(0, 0, gw, gh).data, keep = [];
    for (let i = 0; i < gw * gh; i++) if (d[i * 4 + 3] > 60) keep.push(i); // only where the phone actually is
    N = keep.length;
    [gx, gy, dl, bow, sx, sy, tx, ty, bx, by, pp] = Array.from({ length: 11 }, () => new Float32Array(N));
    col = new Array(N); acc = new Array(N);
    keep.forEach((k, i) => {
      const r = Math.random();
      gx[i] = ((k % gw) + 0.5) / gw; gy[i] = (((k / gw) | 0) + 0.5) / gh;
      dl[i] = Math.min(1, (1 - gx[i]) * 0.45 + gy[i] * 0.2 + r * 0.3); // streams off right edge / top first
      bow[i] = (Math.random() - 0.5) * 0.5;
      col[i] = `rgb(${d[k * 4]},${d[k * 4 + 1]},${d[k * 4 + 2]})`;
      acc[i] = Math.random() < 0.18 ? (Math.random() < 0.5 ? '#4DB8A5' : '#F6F7F3') : null;
    });
    if (L) resize(L);
  }

  function resize(l) {
    L = l; canvas.width = l.W * l.dpr; canvas.height = l.H * l.dpr; ctx.setTransform(l.dpr, 0, 0, l.dpr, 0, 0);
    if (!N) return;
    cell0 = l.pw / gw; cell1 = l.phW / gw;
    for (let i = 0; i < N; i++) {
      sx[i] = l.pl + gx[i] * l.pw; sy[i] = l.pt + gy[i] * l.ph;
      tx[i] = l.cx + (gx[i] - 0.5) * l.phW; ty[i] = l.cy + (gy[i] - 0.5) * l.phH;
      const dx = tx[i] - sx[i], dy = ty[i] - sy[i], len = Math.hypot(dx, dy) || 1;
      bx[i] = (-dy / len) * bow[i] * len * 0.5; by[i] = (dx / len) * bow[i] * len * 0.5;
      pp[i] = (1 - ty[i] / l.H - l.y0) / (l.y1 - l.y0);
    }
  }

  function draw(S) {
    if (!L) return;
    ctx.clearRect(0, 0, L.W, L.H);
    // flat preview <-> flat particles cross-fade (part .03 -> .06) so the two never show at different angles
    const gate = Math.min(1, Math.max(0, (S.part - 0.03) / 0.03)), p = Math.max(0, S.part - 0.03) / 0.97;
    if (!N || gate <= 0 || S.pa >= 1) return;
    const oy = -L.H * S.lift; // start points ride up with the hero
    for (let i = 0; i < N; i++) {
      const e = Math.min(1, Math.max(0, (p - dl[i] * 0.5) / 0.5));
      const ee = e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2, b = Math.sin(ee * Math.PI);
      const x = sx[i] + (tx[i] - sx[i]) * ee + bx[i] * b, y = sy[i] + oy + (ty[i] - sy[i] - oy) * ee + by[i] * b;
      const z = (cell0 + (cell1 - cell0) * ee) * (1 - 0.45 * b) + 0.6;
      // particles dissolve as the dot-matrix reveal sweeps up the whole phone
      ctx.globalAlpha = gate * (1 - 0.25 * b) * (1 - Math.min(1, Math.max(0, (S.pa * 1.6 - pp[i]) / 0.28)) * e * e);
      ctx.fillStyle = acc[i] && e > 0.03 && e < 0.85 ? acc[i] : col[i];
      ctx.fillRect(x - z / 2, y - z / 2, z, z);
    }
    ctx.globalAlpha = 1;
  }
  return { build, resize, draw };
}
