'use strict';

/* Procedural art: hero, Mazel, Snoozies, tiles, objects and parallax backgrounds. */

const THEMES = {
  street: {
    music: 'halloween', sky: ['#24163f', '#5b3485', '#e9845a'], far: '#3a2560', mid: '#5a3157', win: '#ffb347',
    groundTop: '#a49cb3', ground: '#4b3a57', brick: '#a0523f', plank: '#7a4b2e', accent: '#ff8a1f', bg: 'city', moon: true, pumpkins: true,
  },
  snowy: {
    music: 'hanukkah', sky: ['#0e1838', '#23407a', '#4f6fae'], far: '#1c2a55', mid: '#2e3a66', win: '#ffd27a',
    groundTop: '#f2f6ff', ground: '#4a5677', brick: '#8a5a5a', plank: '#8a6a4a', accent: '#4aa3ff', bg: 'city', moon: true, snow: true, menorahs: true,
  },
  deli: {
    music: 'hanukkah', indoor: true, wall: '#f4efe4', wall2: '#e4ddcc', win: '#bfe6ff',
    groundTop: '#e8e0d0', ground: '#3a3a48', brick: '#b5532f', plank: '#a8743e', accent: '#4aa3ff', bg: 'deli',
  },
  plazanight: {
    music: 'hanukkah', sky: ['#101a40', '#2a3c78', '#5a6aa8'], far: '#1e2a52', mid: '#3a3a6a', win: '#ffd27a',
    groundTop: '#eef2fb', ground: '#5a5a70', brick: '#8a6a5a', plank: '#9a6a3e', accent: '#4aa3ff', bg: 'plaza', moon: true, snow: true, bigMenorah: true,
  },
  park: {
    music: 'halloween', sky: ['#2b1a4a', '#7a3f7a', '#f0a060'], far: '#3b2a5a', mid: '#4d3352', win: '#ffb347',
    groundTop: '#7a9a3c', ground: '#5b3d2b', brick: '#8a5a3c', plank: '#8a5a32', accent: '#ff8a1f', bg: 'park', moon: true,
  },
  haunted: {
    music: 'indoor', indoor: true, wall: '#3a2850', wall2: '#46315f', win: '#ffd27a',
    groundTop: '#9a6a44', ground: '#5a3a2a', brick: '#6c4a78', plank: '#9a6a44', accent: '#b07cff', bg: 'haunted',
  },
  market: {
    music: 'thanksgiving', sky: ['#f2a55a', '#f7cf8a', '#fdebc0'], far: '#d9935a', mid: '#b56d3e', win: '#fff2c0',
    groundTop: '#d09a62', ground: '#8a5236', brick: '#b5532f', plank: '#9a6436', accent: '#c8322f', bg: 'plaza',
  },
  parade: {
    music: 'thanksgiving', sky: ['#5fb8ec', '#a3d8f4', '#fdeec0'], far: '#93b6d2', mid: '#7a93b0', win: '#fff6c8',
    groundTop: '#9a9aa6', ground: '#5d5d6b', brick: '#c0604a', plank: '#a87444', accent: '#e8442f', bg: 'skyline',
  },
  kitchen: {
    music: 'indoor', indoor: true, wall: '#f4dfbd', wall2: '#ecd0a2', win: '#bfe6ff',
    groundTop: '#e4d6bc', ground: '#b0906c', brick: '#d26b4a', plank: '#b98150', accent: '#e8442f', bg: 'kitchen',
  },
};

/* Deterministic random for backgrounds. */
function seeded(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

/* ---------- Hero ---------- */
const SKINS = ['#ffe0c4', '#f2c9a0', '#d9a273', '#a86f45', '#6e4529'];
const HAIRS = ['#5b3a24', '#2a1a12', '#c9772f', '#f0d27a', '#8a2f2a'];
const COLORS = ['#ff5fa2', '#b07cff', '#3ec1d3', '#8be06b', '#ffb02e', '#ff6b5a'];

const COSTUMES = {
  none: { name: 'Sadelle', power: '' },
  bat: { name: 'Bat Cape', power: 'glide', body: '#5b3a8c', trim: '#ff8a1f' },
  turkey: { name: 'Turkey Suit', power: 'pound', body: '#8a5a32', trim: '#e8442f' },
  dreidel: { name: 'Dreidel Suit', power: 'spin', body: '#2f6fe0', trim: '#ffd23f' },
};

function drawHero(x, y, o = {}) {
  const { face = 1, sx = 1, sy = 1, run = 0, air = false, glide = false, pound = false, blink = false, look = S.look, costume = S.costume, scale = 1, mazel = true, wave = 0 } = o;
  const cos = COSTUMES[costume] || COSTUMES.none;
  const shirt = cos.body || look.color;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(face * sx * scale, sy * scale);
  const step = air ? 0 : Math.sin(run);
  const bob = air ? 0 : Math.abs(Math.cos(run)) * 2;

  // Costume pieces behind the body
  if (costume === 'bat') {
    ctx.save();
    if (glide) {
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(0, -34);
        ctx.quadraticCurveTo(s * 30, -50, s * 46, -36);
        ctx.quadraticCurveTo(s * 40, -28, s * 36, -22);
        ctx.quadraticCurveTo(s * 30, -26, s * 24, -18);
        ctx.quadraticCurveTo(s * 18, -24, s * 10, -16);
        ctx.closePath();
        paint('#5b3a8c', 3);
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(-4, -36);
      ctx.quadraticCurveTo(-22, -24, -20 - step * 3, -6);
      ctx.lineTo(-14, -10); ctx.lineTo(-9, -4); ctx.lineTo(-4, -10);
      ctx.closePath();
      paint('#5b3a8c', 3);
    }
    ctx.restore();
  }
  if (costume === 'turkey') {
    const fan = ['#e8442f', '#ffb02e', '#8a5a32', '#ffd23f', '#e8442f'];
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 - 1.1 + i * 0.55;
      ellipse(-6 + Math.cos(a) * 18, -30 + Math.sin(a) * 18, 7, 18, a + Math.PI / 2);
      paint(fan[i], 2.5);
    }
  }

  // Legs
  ctx.lineCap = 'round';
  for (const [lx, ph] of [[-6, 1], [5, -1]]) {
    const ly = pound ? -12 : -14 + (air ? -3 : 0);
    rr(lx - 4 + step * ph * 4, ly - bob, 9, 14, 4); paint(costume === 'turkey' ? '#ffb02e' : '#3b3f7a', 2.5);
  }
  // Body
  if (costume === 'dreidel') {
    ctx.beginPath(); ctx.moveTo(-15, -38 - bob); ctx.lineTo(15, -38 - bob); ctx.lineTo(15, -20 - bob); ctx.lineTo(0, -6 - bob); ctx.lineTo(-15, -20 - bob); ctx.closePath();
    paint(shirt, 3);
    ctx.save(); ctx.scale(face, 1); text('ג', 0, -26 - bob, { size: 15, font: 'Noto Sans Hebrew', color: '#ffd23f', lw: 3 }); ctx.restore();
  } else {
    rr(-13, -38 - bob, 26, 27, 10); paint(shirt, 3);
    if (cos.trim) { rr(-13, -18 - bob, 26, 6, 3); paint(cos.trim, 0); }
  }
  // Arms
  const armUp = air ? -8 : 0;
  ellipse(-14, -26 - bob + armUp - wave * 6, 5, 7); paint(look.skin, 2.5);
  ellipse(14, -26 - bob + armUp - wave * 10, 5, 7); paint(look.skin, 2.5);
  // Head
  const hy = -52 - bob;
  circle(0, hy, 17); paint(look.skin, 3);
  // Hair: cap + side bob
  ctx.beginPath();
  ctx.arc(0, hy - 2, 17.5, Math.PI * 1.02, Math.PI * 1.98);
  ctx.quadraticCurveTo(10, hy - 10, -2, hy - 9);
  ctx.quadraticCurveTo(-10, hy - 6, -15, hy + 2);
  ctx.closePath();
  paint(look.hair, 2.5);
  ellipse(-14, hy + 4, 6, 10); paint(look.hair, 2.5);
  // Eyes
  if (blink) {
    ctx.lineWidth = 2.5; ctx.strokeStyle = OUT;
    ctx.beginPath(); ctx.moveTo(1, hy + 1); ctx.lineTo(7, hy + 1); ctx.moveTo(10, hy + 1); ctx.lineTo(15, hy + 1); ctx.stroke();
  } else {
    ellipse(4, hy, 3.4, 4.6); paint(OUT, 0);
    ellipse(12, hy, 3, 4.4); paint(OUT, 0);
    circle(5, hy - 1.6, 1.3); paint('#fff', 0);
    circle(13, hy - 1.6, 1.2); paint('#fff', 0);
  }
  circle(0, hy + 7, 3.2); paint('rgba(255,110,140,.45)', 0);
  ctx.lineWidth = 2.2; ctx.strokeStyle = OUT;
  ctx.beginPath(); ctx.arc(9, hy + 7, 3.5, 0.2, Math.PI - 0.2); ctx.stroke();

  // Headgear
  if (costume === 'bat') {
    for (const ex of [-8, 6]) {
      ctx.beginPath(); ctx.moveTo(ex - 5, hy - 13); ctx.lineTo(ex, hy - 28); ctx.lineTo(ex + 5, hy - 13); ctx.closePath();
      paint('#5b3a8c', 2.5);
    }
  } else if (costume === 'dreidel') {
    rr(-3, hy - 30, 6, 14, 2); paint('#c0c8d8', 2.5);
    circle(0, hy - 31, 4); paint('#ffd23f', 2);
  } else if (costume === 'turkey') {
    ellipse(0, hy - 14, 13, 7); paint('#8a5a32', 2.5);
    ctx.beginPath(); ctx.moveTo(14, hy - 15); ctx.lineTo(23, hy - 12); ctx.lineTo(14, hy - 9); ctx.closePath(); paint('#ffb02e', 2);
    ellipse(17, hy - 6, 3, 5); paint('#e8442f', 2);
  } else {
    // little bow in her favorite color
    ellipse(-8, hy - 16, 6, 4, -0.4); paint(look.color, 2);
    ellipse(-1, hy - 18, 6, 4, 0.4); paint(look.color, 2);
  }

  // Mazel riding in the hood
  if (mazel) drawMazel(-15, hy + 12, 0.85);
  ctx.restore();
}

function drawMazel(x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  for (const ex of [-7, 5]) {
    ctx.beginPath(); ctx.moveTo(ex - 4, -6); ctx.lineTo(ex, -15); ctx.lineTo(ex + 4, -6); ctx.closePath(); paint('#f28c28', 2);
  }
  ellipse(-1, -2, 10, 8); paint('#f28c28', 2.5);
  ctx.strokeStyle = '#c4621a'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-3, -9); ctx.lineTo(-3, -5); ctx.moveTo(1, -9); ctx.lineTo(1, -5); ctx.stroke();
  circle(-4, -2, 1.5); paint(OUT, 0); circle(3, -2, 1.5); paint(OUT, 0);
  ctx.restore();
}

function drawMazelFace(x, y, r, talking) {
  ctx.save();
  ctx.translate(x, y);
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(s * r * 0.85, -r * 0.2); ctx.lineTo(s * r * 0.75, -r * 1.15); ctx.lineTo(s * r * 0.2, -r * 0.75); ctx.closePath();
    paint('#f28c28', 3);
    ctx.beginPath(); ctx.moveTo(s * r * 0.7, -r * 0.4); ctx.lineTo(s * r * 0.68, -r * 0.9); ctx.lineTo(s * r * 0.4, -r * 0.65); ctx.closePath();
    paint('#ffb3c1', 0);
  }
  circle(0, 0, r); paint('#f28c28', 3);
  ctx.strokeStyle = '#c4621a'; ctx.lineWidth = 3;
  for (const dx of [-6, 0, 6]) { ctx.beginPath(); ctx.moveTo(dx, -r + 3); ctx.lineTo(dx, -r + 11); ctx.stroke(); }
  ellipse(0, r * 0.35, r * 0.55, r * 0.4); paint('#fff2df', 0);
  ellipse(-r * 0.38, -r * 0.1, r * 0.16, r * 0.22); paint('#3a8a3a', 0);
  ellipse(r * 0.38, -r * 0.1, r * 0.16, r * 0.22); paint('#3a8a3a', 0);
  ellipse(-r * 0.38, -r * 0.1, r * 0.06, r * 0.18); paint(OUT, 0);
  ellipse(r * 0.38, -r * 0.1, r * 0.06, r * 0.18); paint(OUT, 0);
  circle(0, r * 0.18, r * 0.1); paint('#ff7a9a', 0);
  const open = talking ? (Math.sin(performance.now() / 70) * 0.5 + 0.5) * r * 0.18 : 0;
  ctx.lineWidth = 2; ctx.strokeStyle = OUT;
  ellipse(0, r * 0.42, r * 0.14, 1 + open); paint(open > 1 ? '#a33' : null, 2);
  ctx.beginPath();
  for (const s of [-1, 1]) { ctx.moveTo(s * r * 0.35, r * 0.3); ctx.lineTo(s * r * 1.05, r * 0.2); ctx.moveTo(s * r * 0.35, r * 0.4); ctx.lineTo(s * r * 1.05, r * 0.48); }
  ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
}

/* ---------- Snoozies (enemies) ---------- */
function sleepyEyes(x, y, gap, happy, r = 5) {
  ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    if (happy) ctx.arc(x + s * gap, y + 2, r, Math.PI * 1.15, Math.PI * 1.85);
    else ctx.arc(x + s * gap, y - 2, r, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  }
}
function nightcap(x, y, color, flop = 0) {
  ctx.beginPath();
  ctx.moveTo(x - 12, y); ctx.quadraticCurveTo(x, y - 22, x + 16 + flop, y - 10 + flop);
  ctx.quadraticCurveTo(x + 6, y - 4, x + 12, y);
  ctx.closePath(); paint(color, 2.5);
  circle(x + 17 + flop, y - 9 + flop, 4.5); paint('#fff', 2);
}

function drawSnoozie(e) {
  const happy = e.state === 'happy';
  const t = e.t || 0;
  const sq = e.squash || 0;
  ctx.save();
  ctx.translate(e.x + e.w / 2, e.y + e.h);
  ctx.scale((e.face || 1) * (1 + sq * 0.25), 1 - sq * 0.25);
  if (e.state === 'shell') { drawShell(e); ctx.restore(); return; }
  const k = e.skin;
  const breathe = Math.sin(t * 2) * 1.5;
  switch (k) {
    case 'candycorn': {
      ctx.beginPath(); ctx.moveTo(-20, -2); ctx.quadraticCurveTo(-22, -10, -14, -24); ctx.quadraticCurveTo(0, -48 - breathe, 14, -24); ctx.quadraticCurveTo(22, -10, 20, -2); ctx.closePath();
      paint('#ffd23f', 3);
      ctx.save(); ctx.clip();
      ctx.fillStyle = '#ff8a1f'; ctx.fillRect(-24, -16, 48, 16);
      ctx.fillStyle = '#fff6e0'; ctx.fillRect(-24, -60, 48, 26);
      ctx.restore();
      ctx.beginPath(); ctx.moveTo(-20, -2); ctx.quadraticCurveTo(-22, -10, -14, -24); ctx.quadraticCurveTo(0, -48 - breathe, 14, -24); ctx.quadraticCurveTo(22, -10, 20, -2); ctx.closePath(); paint(null, 3);
      sleepyEyes(3, -18, 6, happy);
      break;
    }
    case 'pumpkin': case 'cranberry': {
      const col = k === 'pumpkin' ? '#ff8a1f' : '#d8304a';
      ellipse(0, -19 + breathe * 0.3, 22, 19 - breathe * 0.3); paint(col, 3);
      ctx.strokeStyle = shade(col, -0.25); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(0, -19, 8, 18, 0, 0, TAU); ctx.stroke();
      if (k === 'pumpkin') { rr(-3, -44, 6, 9, 2); paint('#5a8a3a', 2.5); }
      else { ellipse(-8, -30, 5, 3); paint('rgba(255,255,255,.5)', 0); }
      if (happy) { ctx.beginPath(); ctx.moveTo(-6, -12); ctx.lineTo(6, -12); ctx.lineTo(0, -6); ctx.closePath(); paint(OUT, 0); }
      sleepyEyes(4, -22, 7, happy);
      if (k === 'pumpkin' && !happy) nightcap(-2, -36, '#7a5cc4', Math.sin(t) * 2);
      break;
    }
    case 'ghost': case 'balloon': {
      const col = k === 'ghost' ? '#f4f0ff' : (e.color || '#ff5fa2');
      if (k === 'balloon') {
        ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -4); ctx.quadraticCurveTo(6, 10, -2, 22); ctx.stroke();
        ellipse(0, -22, 20, 22); paint(col, 3);
        ellipse(-7, -30, 5, 7, -0.4); paint('rgba(255,255,255,.55)', 0);
      } else {
        ctx.beginPath();
        ctx.moveTo(-20, -2);
        ctx.lineTo(-20, -24); ctx.arc(0, -24, 20, Math.PI, 0); ctx.lineTo(20, -2);
        for (let i = 0; i < 4; i++) ctx.quadraticCurveTo(15 - i * 10, 4 + Math.sin(t * 6 + i) * 3, 10 - i * 10, -2);
        ctx.closePath(); paint(col, 3);
      }
      sleepyEyes(4, -24, 7, happy);
      break;
    }
    case 'acorn': {
      ellipse(0, -16, 17, 16); paint('#b8783e', 3);
      ctx.beginPath(); ctx.ellipse(0, -28, 19, 10, 0, Math.PI, 0); ctx.closePath(); paint('#6b4628', 3);
      rr(-2, -42, 4, 7, 2); paint('#6b4628', 2);
      sleepyEyes(4, -16, 6, happy);
      break;
    }
    case 'hedgehog': case 'pinecone': case 'knithog': {
      const col = k === 'pinecone' ? '#9a6a3a' : '#7a5638';
      if (!happy) {
        for (let i = 0; i < 7; i++) {
          const a = Math.PI + 0.25 + i * 0.44;
          ctx.beginPath(); ctx.moveTo(Math.cos(a - 0.2) * 18, -16 + Math.sin(a - 0.2) * 16);
          ctx.lineTo(Math.cos(a) * 30, -16 + Math.sin(a) * 28); ctx.lineTo(Math.cos(a + 0.2) * 18, -16 + Math.sin(a + 0.2) * 16);
          ctx.closePath(); paint(k === 'pinecone' ? '#6b4628' : '#4a3424', 2.5);
        }
      }
      ellipse(0, -16, 21, 16); paint(col, 3);
      ellipse(10, -12, 9, 8); paint('#e8c49a', 2);
      circle(18, -12, 3); paint(OUT, 0);
      sleepyEyes(7, -18, 5, happy, 4);
      if (k === 'knithog' && !happy) {
        ctx.beginPath(); ctx.arc(-4, -28, 13, Math.PI, 0); ctx.closePath(); paint('#4aa3ff', 2.5);
        ctx.fillStyle = '#fff'; ctx.fillRect(-16, -32, 24, 3);
        circle(-4, -43, 5); paint('#fff', 2);
      }
      if (k === 'hedgehog' && !happy) {
        ctx.beginPath(); ctx.moveTo(-18, -28); ctx.lineTo(8, -28); ctx.lineTo(-4, -56); ctx.closePath(); paint('#3a2a5a', 2.5);
        ellipse(-5, -28, 17, 4); paint('#3a2a5a', 2.5);
      }
      break;
    }
    case 'bat': case 'pigeon': {
      const col = k === 'bat' ? '#5b3a8c' : '#8a8aa0';
      const flap = Math.sin(t * (e.blink > 0 ? 18 : 6)) * 8;
      for (const s of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(s * 10, -22); ctx.quadraticCurveTo(s * 30, -38 + flap, s * 34, -18 + flap); ctx.quadraticCurveTo(s * 22, -18, s * 10, -12); ctx.closePath();
        paint(k === 'bat' ? '#3a2560' : '#a0a0b8', 2.5);
      }
      ellipse(0, -18, 15, 14); paint(col, 3);
      if (k === 'bat') { for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 4, -30); ctx.lineTo(s * 9, -40); ctx.lineTo(s * 12, -28); ctx.closePath(); paint(col, 2); } }
      else { ctx.beginPath(); ctx.moveTo(13, -18); ctx.lineTo(21, -15); ctx.lineTo(13, -12); ctx.closePath(); paint('#ffb02e', 2); ellipse(0, -10, 9, 5); paint('#7ac0a0', 0); }
      if (e.blink > 0) { circle(-1, -20, 3.5); paint(OUT, 0); circle(7, -20, 3.5); paint(OUT, 0); }
      else sleepyEyes(3, -19, 5, happy, 4);
      break;
    }
    case 'sufganiyah': {
      ellipse(0, -17 + breathe * 0.3, 21, 17); paint('#e8a860', 3);
      ellipse(0, -24, 16, 8); paint('#fff8f0', 0);
      ctx.fillStyle = '#fff'; for (const [sx, sy] of [[-10, -28], [8, -30], [-2, -32], [12, -24]]) { circle(sx, sy, 1.8); ctx.fill(); }
      circle(4, -33, 5); paint('#d8304a', 2);
      sleepyEyes(3, -14, 7, happy);
      break;
    }
    case 'latke': {
      ellipse(0, -12 + breathe * 0.2, 24, 12); paint('#d0903a', 3);
      ctx.fillStyle = '#9a5a1e'; for (const [sx, sy] of [[-14, -14], [10, -8], [-4, -18], [16, -15], [-18, -7]]) { ellipse(sx, sy, 3, 2); ctx.fill(); }
      sleepyEyes(3, -12, 7, happy);
      if (!happy) nightcap(-6, -22, '#4aa3ff', Math.sin(t) * 2);
      break;
    }
    case 'dreidel': {
      ctx.save(); ctx.scale(0.55 + 0.45 * Math.abs(Math.cos(t * 5)), 1);
      ctx.beginPath(); ctx.moveTo(-18, -40); ctx.lineTo(18, -40); ctx.lineTo(18, -18); ctx.lineTo(0, 0); ctx.lineTo(-18, -18); ctx.closePath(); paint('#8ec5ff', 3);
      rr(-3, -52, 6, 13, 2); paint('#c0c8d8', 2);
      text('נ', 0, -16, { size: 13, font: 'Noto Sans Hebrew', color: '#2f6fe0', lw: 2 });
      ctx.restore();
      sleepyEyes(2, -30, 6, happy, 4);
      break;
    }
    case 'gelt': {
      circle(0, -18, 18); paint('#ffd23f', 3);
      circle(0, -18, 13); paint(null, 2, '#c49a10');
      sleepyEyes(3, -20, 6, happy);
      break;
    }
    case 'snowowl': {
      const flap = Math.sin(t * (e.blink > 0 ? 18 : 6)) * 8;
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 10, -22); ctx.quadraticCurveTo(s * 30, -38 + flap, s * 34, -18 + flap); ctx.quadraticCurveTo(s * 22, -18, s * 10, -12); ctx.closePath(); paint('#d8dcf0', 2.5); }
      ellipse(0, -18, 15, 15); paint('#f6f6ff', 3);
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 4, -30); ctx.lineTo(s * 10, -38); ctx.lineTo(s * 12, -28); ctx.closePath(); paint('#f6f6ff', 2); }
      ctx.beginPath(); ctx.moveTo(-3, -14); ctx.lineTo(3, -14); ctx.lineTo(0, -9); ctx.closePath(); paint('#ffb02e', 1.5);
      if (e.blink > 0) { circle(-5, -20, 3.5); paint(OUT, 0); circle(5, -20, 3.5); paint(OUT, 0); }
      else sleepyEyes(0, -20, 5, happy, 4);
      break;
    }
    case 'heart': {
      ctx.save(); ctx.translate(0, -22 + breathe * 0.3); heartPath(0, 4, 22); paint('#ff5fa2', 3); ctx.restore();
      sleepyEyes(0, -24, 7, happy);
      break;
    }
    case 'hamantasch': {
      ctx.beginPath(); ctx.moveTo(-22, -4); ctx.lineTo(22, -4); ctx.lineTo(0, -40 - breathe); ctx.closePath(); paint('#e8b070', 3);
      ctx.beginPath(); ctx.moveTo(-11, -10); ctx.lineTo(11, -10); ctx.lineTo(0, -28); ctx.closePath(); paint('#7a2a6a', 2);
      sleepyEyes(0, -16, 6, happy, 4);
      break;
    }
    case 'discoball': {
      circle(0, -20, 20); paint('#c8ccd8', 3);
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) if ((i + j + Math.floor(t * 4)) % 2 === 0 && i * i + j * j < 6) ctx.fillRect(i * 7 - 3, -20 + j * 7 - 3, 6, 6);
      sleepyEyes(0, -20, 7, happy);
      break;
    }
    case 'snowman': {
      circle(0, -14, 15); paint('#fafcff', 3); circle(0, -36, 11); paint('#fafcff', 3);
      ctx.beginPath(); ctx.moveTo(4, -35); ctx.lineTo(16, -33); ctx.lineTo(4, -31); ctx.closePath(); paint('#ff8a1f', 1.5);
      for (const yy of [-18, -10]) { circle(0, yy, 2); paint(OUT, 0); }
      sleepyEyes(0, -39, 4, happy, 3);
      if (!happy) { rr(-11, -54, 22, 8, 2); paint('#3a3a48', 2); rr(-7, -64, 14, 12, 2); paint('#3a3a48', 2); }
      break;
    }
    case 'lion': {
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; circle(Math.cos(a) * 18, -22 + Math.sin(a) * 18, 9); paint('#c8782a', 2); }
      circle(0, -22, 16); paint('#f2c050', 3);
      ellipse(0, -14, 6, 4); paint('#f8e0a0', 0);
      sleepyEyes(0, -25, 6, happy, 4);
      break;
    }
    case 'matzah': {
      rr(-20, -38 - breathe * 0.3, 40, 34, 4); paint('#f0d8a0', 3);
      ctx.fillStyle = '#b8945a'; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { circle(-13 + i * 9, -30 + j * 9, 1.6); ctx.fill(); }
      sleepyEyes(0, -20, 7, happy);
      break;
    }
    case 'hotdog': {
      ellipse(0, -14, 24, 11); paint('#e8b070', 3);
      ellipse(0, -20, 26, 7); paint('#c8503a', 3);
      ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 5; i++) ctx.lineTo(-18 + i * 9, -21 + (i % 2) * 4); ctx.stroke();
      sleepyEyes(0, -30, 7, happy, 4);
      break;
    }
    case 'pickle': {
      ellipse(0, -20, 13, 20); paint('#6aa83a', 3);
      ctx.fillStyle = '#4a8a2a'; for (const [sx, sy] of [[-5, -30], [5, -22], [-4, -12], [6, -34]]) { circle(sx, sy, 2); ctx.fill(); }
      sleepyEyes(0, -24, 5, happy, 4);
      break;
    }
    case 'penguin': {
      ellipse(0, -20, 16, 20); paint('#2a2a3a', 3);
      ellipse(0, -16, 10, 14); paint('#fafcff', 0);
      ctx.beginPath(); ctx.moveTo(-4, -27); ctx.lineTo(4, -27); ctx.lineTo(0, -21); ctx.closePath(); paint('#ff8a1f', 1.5);
      sleepyEyes(0, -31, 5, happy, 3);
      break;
    }
    case 'pizza': {
      ctx.beginPath(); ctx.moveTo(-20, -36); ctx.lineTo(20, -36); ctx.lineTo(0, -2); ctx.closePath(); paint('#ffd23f', 3);
      rr(-21, -40, 42, 8, 4); paint('#d8a060', 2.5);
      for (const [sx, sy] of [[-8, -28], [6, -24], [0, -14]]) { circle(sx, sy, 3.5); paint('#c8322f', 1.5); }
      sleepyEyes(0, -30, 6, happy, 4);
      break;
    }
    case 'pie': {
      ellipse(0, -14, 22, 14); paint('#e8b070', 3);
      ellipse(0, -18, 18, 9); paint('#c86a3a', 2);
      ctx.strokeStyle = '#a0603a'; ctx.lineWidth = 2;
      for (const dx of [-8, 0, 8]) { ctx.beginPath(); ctx.moveTo(dx - 3, -22); ctx.lineTo(dx + 3, -14); ctx.stroke(); }
      sleepyEyes(3, -10, 7, happy);
      if (!happy) nightcap(-6, -24, '#4aa3ff', Math.sin(t) * 2);
      break;
    }
    default: { circle(0, -18, 18); paint('#aaa', 3); sleepyEyes(3, -18, 6, happy); }
  }
  ctx.restore();
  if (!happy && e.state !== 'shell' && Math.sin(t * 1.3) > 0.92) FX.add({ x: e.x + e.w / 2 + 10, y: e.y - 6, vy: -30, vx: 12, life: 1.2, kind: 'zzz', size: 14 });
}

function drawShell(e) {
  const col = e.skin === 'acorn' ? '#b8783e' : e.skin === 'gelt' ? '#ffd23f' : '#ff8a1f';
  ctx.rotate(e.spin || 0);
  circle(0, -16, 17); paint(col, 3);
  ctx.strokeStyle = shade(col, -0.3); ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-14, -16); ctx.lineTo(14, -16); ctx.moveTo(0, -30); ctx.lineTo(0, -2); ctx.stroke();
}

/* ---------- Pickups & objects ---------- */
/* An everyday bagel: the money she earns (golden bagels are the rare hidden treasures). */
function drawToken(x, y, t, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.ellipse(0, 0, 13, 10, 0, 0, TAU); ctx.ellipse(0, -1, 4, 3, 0, 0, TAU, true);
  ctx.fillStyle = '#d8a060'; ctx.fill('evenodd'); ctx.lineWidth = 2.5; ctx.strokeStyle = OUT; ctx.stroke();
  ctx.fillStyle = '#fff6d0';
  for (const [sx, sy] of [[-7, -4], [-2, -7], [5, -6], [8, -1], [-8, 3]]) { ellipse(sx, sy, 1.4, 0.9, sx * 0.1); ctx.fill(); }
  ctx.restore();
}
function drawBagel(x, y, t, ghost = false) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 3) * 3);
  if (ghost) ctx.globalAlpha = 0.35;
  const gr = ctx.createRadialGradient(0, 0, 4, 0, 0, 34);
  gr.addColorStop(0, 'rgba(255,230,120,.7)'); gr.addColorStop(1, 'rgba(255,230,120,0)');
  ctx.fillStyle = gr; circle(0, 0, 34); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, 0, 18, 14, 0, 0, TAU); ctx.ellipse(0, -1, 6, 4, 0, 0, TAU, true);
  ctx.fillStyle = '#ffc93c'; ctx.fill('evenodd'); ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.stroke();
  ctx.fillStyle = '#fff6d0';
  for (const [sx, sy] of [[-10, -6], [-4, -10], [6, -9], [11, -3], [-12, 3], [9, 5]]) { ellipse(sx, sy, 1.8, 1.1, sx * 0.1); ctx.fill(); }
  ctx.restore();
}
function drawHeart(x, y, s, fill = '#ff4f6d', lw = 3) { heartPath(x, y, s); paint(fill, lw); }

function drawLetterBubble(ch, x, y, r, o = {}) {
  const { alpha = 1, glow = 0, font = 'Andika', color = null } = o;
  ctx.save();
  ctx.globalAlpha = alpha;
  if (glow > 0) {
    const gr = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 2.2);
    gr.addColorStop(0, `rgba(255,240,140,${0.8 * glow})`); gr.addColorStop(1, 'rgba(255,240,140,0)');
    ctx.fillStyle = gr; circle(x, y, r * 2.2); ctx.fill();
  }
  const gr2 = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
  gr2.addColorStop(0, '#ffffff'); gr2.addColorStop(1, '#dff3ff');
  circle(x, y, r); ctx.fillStyle = gr2; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.stroke();
  ellipse(x - r * 0.4, y - r * 0.45, r * 0.22, r * 0.12, -0.6); paint('rgba(255,255,255,.9)', 0);
  const isV = 'aeiou'.includes(ch);
  const col = color || (isV ? '#e8384f' : '#2f6fe0');
  text(ch, x, y + r * 0.02, { size: r * 1.35, font, color: col, lw: Math.max(3, r * 0.14), stroke: OUT });
  ctx.restore();
}

/* ---------- Backgrounds ---------- */
const BG_CACHE = {};
function makeLayer(w, h, fn) {
  const c = document.createElement('canvas');
  c.width = w * 2; c.height = h * 2;
  const g = c.getContext('2d');
  g.scale(2, 2);
  fn(g);
  return c;
}
function bgLayers(themeName) {
  if (BG_CACHE[themeName]) return BG_CACHE[themeName];
  const th = THEMES[themeName];
  const R = seeded(themeName.length * 977 + 13);
  const W = 1920, H = VH;
  const out = { far: null, mid: null };
  const building = (g, x, y, w, h, col, win, rows = 4, lit = 0.5) => {
    g.fillStyle = col; g.fillRect(x, y, w, h);
    for (let r = 0; r < rows; r++) for (let c = 0; c < Math.floor(w / 22); c++) {
      if (R() < lit) { g.fillStyle = win; g.fillRect(x + 8 + c * 22, y + 14 + r * 30, 10, 14); }
    }
  };
  if (th.bg === 'city' || th.bg === 'skyline') {
    out.far = makeLayer(W, H, g => {
      for (let x = 0; x < W;) {
        const w = 50 + R() * 90, h = 120 + R() * (th.bg === 'skyline' ? 260 : 160);
        building(g, x, H - h - 40, w, h + 40, th.far, shade(th.win, -0.1), 6, 0.25);
        if (R() < 0.35) { // Brooklyn water tower
          g.fillStyle = shade(th.far, -0.2);
          g.fillRect(x + w / 2 - 12, H - h - 72, 24, 26); g.beginPath(); g.moveTo(x + w / 2 - 15, H - h - 72); g.lineTo(x + w / 2, H - h - 88); g.lineTo(x + w / 2 + 15, H - h - 72); g.fill();
          g.fillRect(x + w / 2 - 10, H - h - 46, 3, 8); g.fillRect(x + w / 2 + 7, H - h - 46, 3, 8);
        }
        x += w + 4;
      }
    });
    out.mid = makeLayer(W, H, g => {
      for (let x = 0; x < W;) {
        const w = 130 + R() * 40, h = 190 + R() * 60;
        const col = shade(th.mid, (R() - 0.5) * 0.2);
        g.fillStyle = col; g.fillRect(x, H - h, w, h);
        g.fillStyle = shade(col, -0.25); g.fillRect(x - 4, H - h - 10, w + 8, 12); // cornice
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
          g.fillStyle = R() < 0.6 ? th.win : shade(col, -0.35);
          g.fillRect(x + 16 + c * 40, H - h + 24 + r * 52, 22, 32);
        }
        if (th.pumpkins && R() < 0.5) { // jack-o-lantern in the window
          g.fillStyle = '#ff8a1f'; g.beginPath(); g.ellipse(x + 27, H - h + 52, 9, 8, 0, 0, TAU); g.fill();
        }
        if (th.menorahs) for (let c = 0; c < 3; c++) if (R() < 0.45) { // a menorah in the window
          const mx = x + 27 + c * 40, my = H - h + 50;
          g.fillStyle = '#3a2a20'; g.fillRect(mx - 9, my, 18, 2); g.fillRect(mx - 1, my - 6, 2, 6);
          g.fillStyle = '#ffe9a0'; for (let k = 0; k < 9; k++) g.fillRect(mx - 9 + k * 2.2, k === 4 ? my - 9 : my - 6, 1.4, 3);
        }
        if (th.snow) { g.fillStyle = '#f2f6ff'; g.fillRect(x - 4, H - h - 14, w + 8, 6); }
        if (th.bg === 'skyline') { // parade flags
          g.fillStyle = pick(['#e8442f', '#ffd23f', '#3ec1d3']); g.fillRect(x + w - 12, H - h - 40, 3, 40);
          g.beginPath(); g.moveTo(x + w - 9, H - h - 40); g.lineTo(x + w + 14, H - h - 32); g.lineTo(x + w - 9, H - h - 24); g.fill();
        }
        x += w + 10;
      }
    });
  } else if (th.bg === 'park') {
    out.far = makeLayer(W, H, g => {
      g.fillStyle = th.far;
      g.beginPath(); g.moveTo(0, H);
      for (let x = 0; x <= W; x += 40) g.lineTo(x, H - 150 - Math.sin(x / 210) * 50 - Math.sin(x / 90) * 15);
      g.lineTo(W, H); g.fill();
    });
    out.mid = makeLayer(W, H, g => {
      for (let x = 20; x < W; x += 90 + R() * 80) {
        const h = 150 + R() * 90;
        g.fillStyle = '#3a2830'; g.fillRect(x - 6, H - h, 12, h);
        for (let i = 0; i < 5; i++) {
          g.fillStyle = pick(['#c4502a', '#e0782c', '#a83a2e', '#d89a30']);
          g.beginPath(); g.arc(x + (R() - 0.5) * 60, H - h - 10 + (R() - 0.5) * 50, 30 + R() * 20, 0, TAU); g.fill();
        }
      }
    });
  } else if (th.bg === 'plaza') {
    out.far = makeLayer(W, H, g => {
      g.fillStyle = th.far;
      // Grand Army Plaza arch
      const ax = 700;
      g.fillRect(ax, H - 330, 300, 290);
      g.fillStyle = th.sky[2]; g.beginPath(); g.moveTo(ax + 90, H - 40); g.lineTo(ax + 90, H - 200); g.arc(ax + 150, H - 200, 60, Math.PI, 0); g.lineTo(ax + 210, H - 40); g.fill();
      g.fillStyle = th.far; g.fillRect(ax - 10, H - 350, 320, 26);
      g.fillRect(ax + 120, H - 400, 60, 50);
      for (let x = 0; x < W; x += 70) { if (x > ax - 80 && x < ax + 340) continue; if (th.bigMenorah && x > 140 && x < 520) continue; g.beginPath(); g.arc(x, H - 120 - R() * 40, 45, 0, TAU); g.fill(); g.fillRect(x - 5, H - 120, 10, 120); }
      if (th.bigMenorah) { // the giant menorah at Grand Army Plaza
        const cx = 330, by = H - 40;
        g.fillStyle = '#c8a040'; g.fillRect(cx - 50, by - 16, 100, 16); g.fillRect(cx - 7, by - 300, 14, 290);
        for (let k = 1; k <= 4; k++) for (const s of [-1, 1]) { const ax2 = cx + s * k * 38; g.fillRect(Math.min(cx, ax2), by - 170 + k * 4, Math.abs(ax2 - cx), 8); g.fillRect(ax2 - 5, by - 280, 10, 120); }
        g.fillStyle = '#ffd27a';
        for (let k = -4; k <= 4; k++) { const fx = cx + k * 38; g.beginPath(); g.ellipse(fx, k === 0 ? by - 318 : by - 296, 7, 12, 0, 0, TAU); g.fill(); }
      }
    });
    out.mid = makeLayer(W, H, g => {
      for (let x = 0; x < W; x += 200) {
        const col = pick(['#c8322f', '#e8902f', '#3a8a5a']);
        g.fillStyle = '#7a4a2a'; g.fillRect(x + 20, H - 130, 8, 130); g.fillRect(x + 150, H - 130, 8, 130);
        for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#fff6e0' : col; g.fillRect(x + 10 + i * 25, H - 150, 25, 30); }
        g.fillStyle = '#9a6436'; g.fillRect(x + 14, H - 70, 150, 70);
        for (let i = 0; i < 5; i++) { g.fillStyle = pick(['#ff8a1f', '#ffd23f', '#c8322f', '#8a5a32']); g.beginPath(); g.arc(x + 34 + i * 28, H - 76, 12, 0, TAU); g.fill(); }
      }
    });
  } else if (th.bg === 'haunted') {
    out.far = makeLayer(W, H, g => {
      g.fillStyle = th.wall; g.fillRect(0, 0, W, H);
      g.fillStyle = th.wall2; for (let x = 0; x < W; x += 60) g.fillRect(x, 0, 26, H);
    });
    // one floor tall (6 tiles); drawn locked to the floors
    out.floor = makeLayer(W, T * 6, g => {
      for (let x = 40; x < W; x += 230) {
        const k = Math.floor(R() * 3);
        if (k === 0) { // portrait of a sleepy ghost
          g.fillStyle = '#c8a040'; g.fillRect(x, 40, 86, 104); g.fillStyle = '#2a1c3a'; g.fillRect(x + 8, 48, 70, 88);
          g.fillStyle = '#f4f0ff'; g.beginPath(); g.arc(x + 43, 92, 22, Math.PI, 0); g.lineTo(x + 65, 120); g.lineTo(x + 21, 120); g.fill();
        } else if (k === 1) { // moonlit window
          g.fillStyle = '#2a1c3a'; g.fillRect(x, 30, 80, 130); g.fillStyle = th.win; g.fillRect(x + 6, 36, 68, 118);
          g.fillStyle = '#2a1c3a'; g.fillRect(x + 37, 36, 6, 118); g.fillRect(x + 6, 92, 68, 6);
          g.fillStyle = '#fff4c8'; g.beginPath(); g.arc(x + 22, 60, 12, 0, TAU); g.fill();
        } else { // candle sconce
          g.fillStyle = '#8a6a3a'; g.fillRect(x + 30, 100, 26, 8); g.fillStyle = '#fffaf0'; g.fillRect(x + 37, 76, 12, 24);
          g.fillStyle = '#ffb347'; g.beginPath(); g.ellipse(x + 43, 68, 5, 9, 0, 0, TAU); g.fill();
        }
        // cobweb
        if (R() < 0.4) { g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 1.5; for (let i = 1; i < 4; i++) { g.beginPath(); g.arc(x + 160, 0, i * 14, 0, Math.PI / 2); g.stroke(); } }
      }
    });
  } else if (th.indoor) {
    out.far = makeLayer(W, H, g => {
      g.fillStyle = th.wall; g.fillRect(0, 0, W, H);
      g.fillStyle = th.wall2;
      if (th.bg === 'deli') {
        for (let y = 0; y < H; y += 24) for (let x = (y / 24 % 2) * 24; x < W; x += 48) g.fillRect(x, y, 46, 2);
        for (let y = 0; y < H; y += 24) for (let x = (y / 24 % 2) * 24; x < W; x += 48) g.fillRect(x, y, 2, 24);
      } else if (th.bg === 'kitchen') {
        for (let y = 0; y < H; y += 40) for (let x = (y / 40 % 2) * 40; x < W; x += 80) g.fillRect(x, y, 40, 40);
      } else {
        for (let x = 0; x < W; x += 60) g.fillRect(x, 0, 26, H);
      }
    });
    out.mid = makeLayer(W, H, g => {
      for (let x = 60; x < W; x += 260 + R() * 80) {
        if (th.bg === 'deli') {
          // hanging salamis, a menu board and a little menorah on a shelf
          g.fillStyle = '#6a6a78'; g.fillRect(x - 20, 40, 170, 5);
          for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? '#8a2a2a' : '#a8443a'; g.beginPath(); g.ellipse(x + i * 32, 90 + (i % 2) * 10, 10, 34, 0, 0, TAU); g.fill(); }
          g.fillStyle = '#2a2a34'; g.fillRect(x + 10, 170, 140, 90);
          g.fillStyle = 'rgba(255,255,255,.7)'; for (let r2 = 0; r2 < 4; r2++) g.fillRect(x + 22, 186 + r2 * 18, 70 + R() * 40, 4);
          g.fillStyle = '#8a6a3a'; g.fillRect(x + 170, 250, 70, 6);
          g.fillStyle = '#e8b830'; g.fillRect(x + 180, 244, 50, 4); g.fillRect(x + 203, 226, 4, 18);
          g.fillStyle = '#ffd27a'; for (let k = 0; k < 9; k++) g.fillRect(x + 180 + k * 6, k === 4 ? 218 : 234, 3, 6);
        } else if (th.bg === 'kitchen') {
          g.fillStyle = '#c98b5a'; g.fillRect(x, 40, 160, 110); g.fillStyle = '#e0a870'; g.fillRect(x + 8, 48, 68, 94); g.fillRect(x + 84, 48, 68, 94);
          g.fillStyle = th.win; g.fillRect(x + 40, 210, 90, 80); g.fillStyle = '#fff'; g.fillRect(x + 82, 210, 6, 80);
        } else {
          g.fillStyle = '#2a1c3a'; g.fillRect(x, 120, 90, 120); g.fillStyle = '#8a6a3a'; g.fillRect(x + 8, 128, 74, 104);
          g.fillStyle = '#4a3462'; g.beginPath(); g.arc(x + 45, 175, 26, 0, TAU); g.fill();
          g.fillStyle = th.win; g.fillRect(x + 140, 160, 70, 100); g.fillStyle = '#2a1c3a'; g.fillRect(x + 172, 160, 6, 100); g.fillRect(x + 140, 206, 70, 6);
        }
      }
    });
  }
  BG_CACHE[themeName] = out;
  return out;
}

function drawBackground(themeName, camX, camY, time) {
  const th = THEMES[themeName];
  if (!th.indoor) {
    const gr = ctx.createLinearGradient(0, 0, 0, VH);
    gr.addColorStop(0, th.sky[0]); gr.addColorStop(0.6, th.sky[1]); gr.addColorStop(1, th.sky[2]);
    ctx.fillStyle = gr; ctx.fillRect(0, 0, VW, VH);
    if (th.moon) {
      circle(780, 90, 42); ctx.fillStyle = '#fff4c8'; ctx.fill();
      circle(766, 80, 8); ctx.fillStyle = '#efe2a8'; ctx.fill(); circle(792, 102, 6); ctx.fill();
      for (let i = 0; i < 18; i++) { const sx = (i * 173) % VW, sy = (i * 97) % 220; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(time * 2 + i); circle(sx, sy, 1.5); ctx.fillStyle = '#fff'; ctx.fill(); }
      ctx.globalAlpha = 1;
    } else {
      circle(150, 90, 50); ctx.fillStyle = 'rgba(255,250,220,.9)'; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      for (let i = 0; i < 4; i++) { const cx = ((i * 300 - camX * 0.05 + time * 8) % (VW + 300) + VW + 300) % (VW + 300) - 150; ellipse(cx, 70 + i * 30, 70, 20); ctx.fill(); ellipse(cx + 40, 60 + i * 30, 40, 20); ctx.fill(); }
    }
  }
  const L = bgLayers(themeName);
  if (th.snow) {
    drawLayers(L, th, camX, camY);
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    for (let i = 0; i < 60; i++) {
      const sp = 20 + (i % 4) * 12;
      const x = ((i * 157 + Math.sin(time + i) * 20 - camX * 0.4 + time * 10) % VW + VW) % VW;
      const y = ((i * 83 + time * sp) % VH);
      circle(x, y, 1.5 + (i % 3)); ctx.fill();
    }
    return;
  }
  if (L.floor) {
    const lw = L.far.width / 2;
    const ox = -((camX * 0.3) % lw);
    for (let x = ox - lw; x < VW; x += lw) ctx.drawImage(L.far, x, 0, lw, VH);
    const fh = T * 6, fx = -((camX * 0.6) % lw);
    // floors are 6 tiles apart; the wall between them starts one tile below each slab top
    const base = T * 3;
    for (let y = base - (camY % fh) - fh; y < VH; y += fh) for (let x = fx - lw; x < VW; x += lw) ctx.drawImage(L.floor, x, y, lw, fh);
    return;
  }
  drawLayers(L, th, camX, camY);
}

function drawLayers(L, th, camX, camY) {
  const yoff = th.indoor ? 0 : clamp(-camY * 0.1, -60, 60) + 40;
  for (const [layer, f] of [[L.far, th.indoor ? 0.3 : 0.15], [L.mid, th.indoor ? 0.5 : 0.35]]) {
    if (!layer) continue;
    const lw = layer.width / 2;
    const ox = -((camX * f) % lw);
    for (let x = ox - lw; x < VW; x += lw) ctx.drawImage(layer, x, th.indoor ? -((camY * f) % VH) : yoff, lw, VH);
    if (th.indoor) for (let x = ox - lw; x < VW; x += lw) ctx.drawImage(layer, x, -((camY * f) % VH) + VH, lw, VH);
  }
}


/* Mr. Snooze, the grumpy sleepy alarm clock (centered at x, y; s = scale). Awake, he smiles. */
function drawMrSnooze(cx, cy, s, t, awake) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  for (const k of [-1, 1]) { circle(k * 60, -80, 26); paint(awake ? '#ffd23f' : '#c0c8d8', 4); }
  circle(0, 0, 100); paint(awake ? '#ff8ac4' : '#9aa4b8', 5); circle(0, 0, 80); paint('#fffaf0', 4);
  ctx.lineWidth = 5; ctx.strokeStyle = OUT; ctx.lineCap = 'round';
  if (awake) {
    for (const k of [-1, 1]) { circle(k * 30, -10, 11); paint('#fff', 4); circle(k * 30 + 3, -10, 5); paint(OUT, 0); }
    ctx.beginPath(); ctx.arc(0, 26, 26, 0.15, Math.PI - 0.15); ctx.stroke();
    // party hat
    ctx.beginPath(); ctx.moveTo(-30, -92); ctx.lineTo(0, -160); ctx.lineTo(30, -92); ctx.closePath(); paint('#8be06b', 4);
    circle(0, -162, 10); paint('#ffd23f', 3);
  } else {
    sleepyEyes(0, -10, 30, false, 12);
    ctx.beginPath(); ctx.moveTo(-24, 40); ctx.quadraticCurveTo(0, 28, 24, 40); ctx.stroke();
    nightcap(-30, -70, '#7a5cc4', Math.sin(t * 2) * 4);
  }
  ctx.restore();
}

/* A cat seen from the side, feet at (x, y). Babka is a gray tabby; the kitten is small and ginger. */
function drawCat(x, y, t, o = {}) {
  const { color = '#9a92a8', stripe = '#6a6278', scale = 1, face = 1, walking = false, sleepy = false } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(face * scale, scale);
  const step = walking ? Math.sin(t * 14) * 3 : 0;
  ctx.globalAlpha = 0.25; ellipse(0, 0, 18, 5); paint(OUT, 0); ctx.globalAlpha = 1;
  // tail
  ctx.strokeStyle = OUT; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-14, -12); ctx.quadraticCurveTo(-30, -18, -24, -34 + Math.sin(t * 3) * 4); ctx.stroke();
  ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.stroke();
  // legs + body
  for (const lx of [-9, 7]) { rr(lx - 3 + step * (lx > 0 ? 1 : -1), -9, 6, 9, 3); paint(color, 2); }
  ellipse(0, -14, 17, 10); paint(color, 2.5);
  ctx.fillStyle = stripe; for (const sx of [-8, -2, 4]) ctx.fillRect(sx, -23, 3, 7);
  // head
  const hx = 14, hy = -24;
  for (const ex of [-6, 5]) { ctx.beginPath(); ctx.moveTo(hx + ex - 4, hy - 5); ctx.lineTo(hx + ex, hy - 15); ctx.lineTo(hx + ex + 4, hy - 5); ctx.closePath(); paint(color, 2); }
  circle(hx, hy, 10); paint(color, 2.5);
  if (sleepy) { ctx.lineWidth = 1.8; ctx.strokeStyle = OUT; ctx.beginPath(); ctx.arc(hx - 3, hy - 1, 2.5, 0.2, Math.PI - 0.2); ctx.arc(hx + 5, hy - 1, 2.5, 0.2, Math.PI - 0.2); ctx.stroke(); }
  else { circle(hx - 3, hy - 1, 2); paint(OUT, 0); circle(hx + 5, hy - 1, 2); paint(OUT, 0); }
  circle(hx + 1, hy + 3, 1.6); paint('#ff7a9a', 0);
  ctx.restore();
}
