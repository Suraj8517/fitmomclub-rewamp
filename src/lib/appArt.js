/** Returns a 540x1150 canvas holding the app screen (screenshot if src given, else a placeholder UI). */
export async function createAppArt(src) {
  const art = document.createElement('canvas');
  art.width = 540; art.height = 1150;
  const c = art.getContext('2d');
  if (src) {
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = src; });
    c.drawImage(img, 0, 0, 540, 1150);
    return art;
  }
  await Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 1500))]);
  const F = '"DM Sans",sans-serif';
  const rr = (x, y, w, h, r, f) => { c.beginPath(); c.roundRect(x, y, w, h, r); c.fillStyle = f; c.fill(); };
  c.fillStyle = '#F6F7F3'; c.fillRect(0, 0, 540, 1150);
  rr(195, 26, 150, 40, 20, '#0b100e');
  c.fillStyle = '#202B27'; c.font = `700 24px ${F}`; c.fillText('9:41', 44, 58);
  c.font = `700 40px ${F}`; c.fillText('Good morning, Asha', 36, 160);
  c.fillStyle = '#00A99D'; c.font = `500 24px ${F}`; c.fillText('Day 12 of your journey', 36, 198);
  c.lineWidth = 28; c.lineCap = 'round'; c.strokeStyle = '#E8EEE9'; c.beginPath(); c.arc(270, 400, 128, 0, 7); c.stroke();
  c.strokeStyle = '#4DB8A5'; c.beginPath(); c.arc(270, 400, 128, -1.57, -1.57 + 6.28 * 0.72); c.stroke();
  c.fillStyle = '#202B27'; c.textAlign = 'center'; c.font = `800 64px ${F}`; c.fillText('72%', 270, 418);
  c.font = `400 22px ${F}`; c.fillStyle = '#5d6b66'; c.fillText('today’s goal', 270, 452); c.textAlign = 'left';
  [['Morning strength', '25 min · with coach Pritika'], ['Meal plan', '1,640 kcal · 3 meals left'], ['Coach check-in', 'Today, 6:00 pm']].forEach((r, i) => {
    const y = 600 + i * 130; rr(30, y, 480, 106, 26, '#fff'); rr(52, y + 23, 60, 60, 30, i === 1 ? '#00A99D' : '#4DB8A5');
    c.fillStyle = '#202B27'; c.font = `700 28px ${F}`; c.fillText(r[0], 132, y + 48);
    c.fillStyle = '#5d6b66'; c.font = `400 22px ${F}`; c.fillText(r[1], 132, y + 80);
  });
  rr(30, 1030, 480, 92, 46, '#101A17');
  [0, 1, 2, 3].forEach((i) => { c.beginPath(); c.arc(105 + i * 110, 1076, i ? 14 : 20, 0, 7); c.fillStyle = i ? 'rgba(246,247,243,.45)' : '#4DB8A5'; c.fill(); });
  return art;
}

/** Whole phone (titanium frame + bezel + screen) as one 560x1125 image. The preview shows it and the particles are sampled from it. */
export function createPhoneArt(screen) {
  const c = document.createElement('canvas');
  c.width = 560; c.height = 1125;
  const x = c.getContext('2d');
  const rr = (px, py, w, h, r) => { x.beginPath(); x.roundRect(px, py, w, h, r); };
  const g = x.createLinearGradient(0, 0, 560, 1125);
  g.addColorStop(0, '#d3dbd8'); g.addColorStop(0.35, '#7d8885'); g.addColorStop(0.7, '#b4bdb9'); g.addColorStop(1, '#5f6a67');
  rr(2, 2, 556, 1121, 102); x.fillStyle = g; x.fill();
  rr(11, 11, 538, 1103, 92); x.fillStyle = '#050807'; x.fill();
  x.save(); rr(30, 30, 500, 1065, 75); x.clip(); x.drawImage(screen, 30, 30, 500, 1065); x.restore();
  rr(2, 2, 556, 1121, 102); x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 3; x.stroke();
  return c;
}
