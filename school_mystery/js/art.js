'use strict';

/* Characters drawn in code: Sadelle (with outfits and jewelry), people, Mazel, pets and beads. */

const SKINS = ['#ffe0c4', '#f2c9a0', '#d9a273', '#a86f45', '#6e4529'];
const HAIRS = ['#5b3a24', '#2a1a12', '#c9772f', '#f0d27a', '#8a2f2a'];
const COLORS = ['#ff5fa2', '#b07cff', '#3ec1d3', '#8be06b', '#ffb02e', '#ff6b5a'];
const BEAD_COLORS = { pink: '#ff6fae', blue: '#4aa3ff', yellow: '#ffd23f', green: '#5fd068', purple: '#a66cff', orange: '#ff9a3d', white: '#f6f2f8', red: '#ff5252' };
const BEAD_NAMES = Object.keys(BEAD_COLORS);

/*
  A person seen 3/4 from the front, feet at (x, y).
  o.look: { skin, hair, color, pants, hairStyle: 'bob'|'short'|'puff'|'long'|'bald'|'bun', hat, glasses, beard, apron, kid }
*/
function drawPerson(x, y, o = {}) {
  const { face = 1, run = 0, look = {}, scale = 1, wave = 0, blink = false } = o;
  const L = Object.assign({ skin: '#f2c9a0', hair: '#5b3a24', color: '#4aa3ff', pants: '#3b3f7a', hairStyle: 'short' }, look);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(face * scale, scale);
  const step = Math.sin(run), bob = run ? Math.abs(Math.cos(run)) * 2 : 0;
  const tall = L.kid ? 0 : 8;
  // long hair / cape behind
  if (L.hairStyle === 'long') { rr(-17, -66 - tall - bob, 34, 36, 12); paint(L.hair, 2.5); }
  if (L.cape) { ctx.beginPath(); ctx.moveTo(-8, -38 - tall - bob); ctx.quadraticCurveTo(-26, -20, -22 + Math.sin(performance.now() / 160) * 3, -2); ctx.lineTo(4, -6); ctx.closePath(); paint(L.cape, 2.5); }
  // legs
  for (const [lx, ph] of [[-6, 1], [5, -1]]) { rr(lx - 4 + step * ph * 4, -14 - bob, 9, 14, 4); paint(L.pants, 2.5); }
  // body
  if (L.dress) { ctx.beginPath(); ctx.moveTo(-11, -38 - tall - bob); ctx.lineTo(11, -38 - tall - bob); ctx.lineTo(17, -10 - bob); ctx.lineTo(-17, -10 - bob); ctx.closePath(); paint(L.color, 3); }
  else { rr(-13, -38 - tall - bob, 26, 27 + tall, 10); paint(L.color, 3); }
  if (L.apron) { rr(-9, -32 - tall - bob, 18, 22 + tall, 5); paint(L.apron, 2); }
  if (L.stripe) { rr(-13, -26 - bob, 26, 5, 2); paint(L.stripe, 0); }
  if (L.tie) { ctx.beginPath(); ctx.moveTo(0, -36 - tall - bob); ctx.lineTo(4, -24 - bob); ctx.lineTo(0, -16 - bob); ctx.lineTo(-4, -24 - bob); ctx.closePath(); paint(L.tie, 1.5); }
  // arms
  ellipse(-14, -26 - tall * 0.5 - bob - wave * 4, 5, 7); paint(L.skin, 2.5);
  ellipse(14, -26 - tall * 0.5 - bob - wave * 10, 5, 7); paint(L.skin, 2.5);
  // head
  const hy = -52 - tall - bob;
  circle(0, hy, 17); paint(L.skin, 3);
  switch (L.hairStyle) {
    case 'bald': break;
    case 'puff': circle(0, hy - 14, 14); paint(L.hair, 2.5); circle(-14, hy - 4, 7); paint(L.hair, 2); circle(14, hy - 4, 7); paint(L.hair, 2); break;
    case 'bun': ctx.beginPath(); ctx.arc(0, hy - 2, 17.5, Math.PI * 1.02, Math.PI * 1.98); ctx.closePath(); paint(L.hair, 2.5); circle(-4, hy - 20, 8); paint(L.hair, 2.5); break;
    case 'short': ctx.beginPath(); ctx.arc(0, hy - 2, 17.5, Math.PI * 1.0, Math.PI * 2.0); ctx.quadraticCurveTo(6, hy - 8, -6, hy - 9); ctx.closePath(); paint(L.hair, 2.5); break;
    case 'curly': for (let i = 0; i < 6; i++) { circle(-14 + i * 5.6, hy - 13 - Math.sin(i) * 3, 6); paint(L.hair, 1.8); } break;
    default:
      ctx.beginPath(); ctx.arc(0, hy - 2, 17.5, Math.PI * 1.02, Math.PI * 1.98);
      ctx.quadraticCurveTo(10, hy - 10, -2, hy - 9); ctx.quadraticCurveTo(-10, hy - 6, -15, hy + 2); ctx.closePath(); paint(L.hair, 2.5);
      ellipse(-14, hy + 4, 6, 10); paint(L.hair, 2.5);
  }
  // eyes
  if (blink) { ctx.lineWidth = 2.5; ctx.strokeStyle = OUT; ctx.beginPath(); ctx.moveTo(1, hy + 1); ctx.lineTo(7, hy + 1); ctx.moveTo(10, hy + 1); ctx.lineTo(15, hy + 1); ctx.stroke(); }
  else {
    ellipse(4, hy, 3.4, 4.6); paint(OUT, 0); ellipse(12, hy, 3, 4.4); paint(OUT, 0);
    circle(5, hy - 1.6, 1.3); paint('#fff', 0); circle(13, hy - 1.6, 1.2); paint('#fff', 0);
  }
  if (L.glasses) { ctx.lineWidth = 2; ctx.strokeStyle = OUT; circle(4, hy, 5.5); ctx.stroke(); circle(13, hy, 5); ctx.stroke(); }
  circle(0, hy + 7, 3.2); paint('rgba(255,110,140,.45)', 0);
  ctx.lineWidth = 2.2; ctx.strokeStyle = OUT; ctx.beginPath(); ctx.arc(9, hy + 7, 3.5, 0.2, Math.PI - 0.2); ctx.stroke();
  if (L.beard) { ctx.beginPath(); ctx.arc(4, hy + 6, 13, 0.1, Math.PI - 0.3); paint(L.beard, 2); }
  if (L.mustache) { ellipse(9, hy + 4, 6, 2.5); paint(L.mustache, 1.5); }
  if (L.bow) { ellipse(-8, hy - 16, 6, 4, -0.4); paint(L.bow, 2); ellipse(-1, hy - 18, 6, 4, 0.4); paint(L.bow, 2); }
  if (L.hat) drawHatShape(L.hat, 0, hy, L.hatColor);
  ctx.restore();
}

function drawHatShape(kind, x, hy, color) {
  switch (kind) {
    case 'conductor': rr(x - 16, hy - 26, 32, 14, 4); paint(color || '#2f4f8a', 2.5); rr(x - 4, hy - 16, 26, 5, 2); paint(OUT, 0); circle(x, hy - 20, 3); paint('#ffd23f', 1); break;
    case 'beanie': ctx.beginPath(); ctx.arc(x, hy - 6, 17, Math.PI, 0); ctx.closePath(); paint(color || '#e8442f', 2.5); circle(x, hy - 24, 5); paint('#fff', 2); break;
    case 'chef': rr(x - 13, hy - 34, 26, 20, 8); paint('#fff', 2.5); circle(x - 8, hy - 34, 8); paint('#fff', 2); circle(x + 8, hy - 34, 8); paint('#fff', 2); break;
    case 'cap': ctx.beginPath(); ctx.arc(x, hy - 6, 17, Math.PI, 0); ctx.closePath(); paint(color || '#4aa3ff', 2.5); rr(x, hy - 10, 24, 5, 2); paint(color || '#4aa3ff', 2); break;
    case 'beret': ellipse(x - 2, hy - 15, 18, 7, -0.2); paint(color || '#b0306a', 2.5); break;
    case 'kippah': ellipse(x - 2, hy - 15, 9, 4); paint(color || '#2f4f8a', 2); break;
    case 'crown': ctx.beginPath(); ctx.moveTo(x - 13, hy - 12); ctx.lineTo(x - 13, hy - 26); ctx.lineTo(x - 6, hy - 19); ctx.lineTo(x, hy - 30); ctx.lineTo(x + 6, hy - 19); ctx.lineTo(x + 13, hy - 26); ctx.lineTo(x + 13, hy - 12); ctx.closePath(); paint('#ffd23f', 2.5); circle(x, hy - 16, 2.5); paint('#ff5fa2', 1); break;
    case 'detective': ellipse(x, hy - 12, 22, 6); paint(color || '#a07a4a', 2.5); rr(x - 13, hy - 28, 26, 16, 7); paint(color || '#a07a4a', 2.5); rr(x - 13, hy - 17, 26, 4, 1); paint('#5a3a2a', 0); break;
    case 'flower': for (let i = 0; i < 5; i++) { circle(x - 14 + i * 7, hy - 16 + (i % 2) * 3, 5); paint(['#ff5fa2', '#ffd23f', '#b07cff', '#ff8a1f', '#3ec1d3'][i], 1.5); } break;
    case 'bunny': for (const ex of [-7, 7]) { ellipse(x + ex, hy - 30, 5, 13); paint('#fff', 2); ellipse(x + ex, hy - 30, 2, 8); paint('#ffb3c1', 0); } break;
    case 'party': ctx.beginPath(); ctx.moveTo(x - 10, hy - 14); ctx.lineTo(x, hy - 40); ctx.lineTo(x + 10, hy - 14); ctx.closePath(); paint(color || '#8be06b', 2.5); circle(x, hy - 41, 4); paint('#ffd23f', 2); break;
    case 'astronaut': circle(x, hy, 23); ctx.fillStyle = 'rgba(190,230,255,.35)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#e8eef8'; ctx.stroke(); break;
  }
}

/* Sadelle: her chosen look, plus what she is wearing from the shop and the jewelry she made. */
function drawHero(x, y, o = {}) {
  const w = o.wear || S.wear || {};
  const outfit = OUTFITS[w.outfit] || null;
  const look = Object.assign({ hairStyle: 'bob', kid: true, bow: w.hat ? null : S.look.color }, S.look, outfit ? outfit.look : {});
  if (w.hat) { look.hat = HATS[w.hat].shape; look.hatColor = HATS[w.hat].color; look.bow = null; }
  if (w.glasses) look.glasses = true;
  drawPerson(x, y, Object.assign({}, o, { look }));
  // jewelry she made: a necklace and a bracelet
  const j = S.wearJewel != null ? S.jewelry[S.wearJewel] : null;
  if (j) {
    const sc = o.scale || 1, f = o.face || 1, bob = o.run ? Math.abs(Math.cos(o.run)) * 2 : 0;
    ctx.save(); ctx.translate(x, y); ctx.scale(f * sc, sc);
    if (j.kind === 'necklace') {
      const n = Math.min(9, j.beads.length);
      for (let i = 0; i < n; i++) { const a = Math.PI * (0.15 + 0.7 * i / Math.max(1, n - 1)); circle(Math.cos(a) * 11, -38 - bob + Math.sin(a) * 7, 2.6); paint(BEAD_COLORS[j.beads[i].c] || '#fff', 1); }
    } else { for (let i = 0; i < 4; i++) { circle(10 + i * 2.6, -21 - bob, 2); paint(BEAD_COLORS[(j.beads[i] || j.beads[0]).c], 0.8); } }
    ctx.restore();
  }
  if (o.mazel !== false) {
    const sc = o.scale || 1, f = o.face || 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(f * sc, sc);
    drawMazel(-15, -40 - (o.run ? Math.abs(Math.cos(o.run)) * 2 : 0), 0.85);
    ctx.restore();
  }
}

/* Outfits and hats sold in the shop. */
const OUTFITS = {
  detective: { name: 'a detective coat', price: 25, look: { color: '#c8a070', stripe: '#8a6a3a' } },
  skater: { name: 'a sparkly skating dress', price: 30, look: { color: '#8ec5ff', dress: true, stripe: '#fff' } },
  astronaut: { name: 'a space suit', price: 40, look: { color: '#e8eef8', pants: '#c8d0dc', stripe: '#e8442f' } },
  superhero: { name: 'a superhero cape', price: 35, look: { color: '#4a4ad8', cape: '#e8442f' } },
  rainbow: { name: 'a rainbow dress', price: 30, look: { color: '#ff8ac4', dress: true, stripe: '#ffd23f' } },
  conductor: { name: 'a train conductor uniform', price: 25, look: { color: '#2f4f8a', pants: '#2a2a48', stripe: '#ffd23f' } },
};
const HATS = {
  detective: { name: 'a detective hat', price: 15, shape: 'detective', color: '#a07a4a' },
  crown: { name: 'a sparkly crown', price: 30, shape: 'crown' },
  bunny: { name: 'bunny ears', price: 20, shape: 'bunny' },
  flower: { name: 'a flower crown', price: 20, shape: 'flower' },
  beanie: { name: 'a cozy winter hat', price: 15, shape: 'beanie', color: '#ff5fa2' },
  party: { name: 'a party hat', price: 10, shape: 'party', color: '#b07cff' },
};

function drawMazel(x, y, s = 1) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  for (const ex of [-7, 5]) { ctx.beginPath(); ctx.moveTo(ex - 4, -6); ctx.lineTo(ex, -15); ctx.lineTo(ex + 4, -6); ctx.closePath(); paint('#f28c28', 2); }
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
    ctx.beginPath(); ctx.moveTo(s * r * 0.85, -r * 0.2); ctx.lineTo(s * r * 0.75, -r * 1.15); ctx.lineTo(s * r * 0.2, -r * 0.75); ctx.closePath(); paint('#f28c28', 3);
    ctx.beginPath(); ctx.moveTo(s * r * 0.7, -r * 0.4); ctx.lineTo(s * r * 0.68, -r * 0.9); ctx.lineTo(s * r * 0.4, -r * 0.65); ctx.closePath(); paint('#ffb3c1', 0);
  }
  circle(0, 0, r); paint('#f28c28', 3);
  ctx.strokeStyle = '#c4621a'; ctx.lineWidth = 3;
  for (const dx of [-6, 0, 6]) { ctx.beginPath(); ctx.moveTo(dx, -r + 3); ctx.lineTo(dx, -r + 11); ctx.stroke(); }
  ellipse(0, r * 0.35, r * 0.55, r * 0.4); paint('#fff2df', 0);
  for (const s of [-1, 1]) { ellipse(s * r * 0.38, -r * 0.1, r * 0.16, r * 0.22); paint('#3a8a3a', 0); ellipse(s * r * 0.38, -r * 0.1, r * 0.06, r * 0.18); paint(OUT, 0); }
  circle(0, r * 0.18, r * 0.1); paint('#ff7a9a', 0);
  const open = talking ? (Math.sin(performance.now() / 70) * 0.5 + 0.5) * r * 0.18 : 0;
  ctx.lineWidth = 2; ctx.strokeStyle = OUT;
  ellipse(0, r * 0.42, r * 0.14, 1 + open); paint(open > 1 ? '#a33' : null, 2);
  ctx.beginPath();
  for (const s of [-1, 1]) { ctx.moveTo(s * r * 0.35, r * 0.3); ctx.lineTo(s * r * 1.05, r * 0.2); ctx.moveTo(s * r * 0.35, r * 0.4); ctx.lineTo(s * r * 1.05, r * 0.48); }
  ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
}
/* A round portrait of a person for the talk bubble. */
function personFace(look) {
  return (x, y, r) => {
    ctx.save();
    circle(x, y, r + 4); paint('#fffaf0', 3);
    ctx.beginPath(); ctx.arc(x, y, r + 2, 0, TAU); ctx.clip();
    const k = r / 30;
    drawPerson(x - 4 * k, y + 66 * k, { look: Object.assign({ kid: true }, look), scale: 1.05 * k, mazel: false });
    ctx.restore();
  };
}

/* ---------- Pets (side view, feet at x, y) ---------- */
const PET_INFO = {
  puppy: { name: 'Pickle the puppy', short: 'Pickle', color: '#d8a060' },
  bunny: { name: 'Marshmallow the bunny', short: 'Marshmallow', color: '#f6f2f8' },
  penguin: { name: 'Waddles the penguin', short: 'Waddles', color: '#2a2a3a' },
  turtle: { name: 'Shelly the turtle', short: 'Shelly', color: '#5fa860' },
  hamster: { name: 'Nugget the hamster', short: 'Nugget', color: '#f2b06a' },
  owl: { name: 'Hoot the owl', short: 'Hoot', color: '#a8865a' },
  pigeon: { name: 'Pigeon Pete', short: 'Pete', color: '#9aa0b8' },
  seal: { name: 'Bubbles the seal', short: 'Bubbles', color: '#8a96a8' },
};
function drawPet(kind, x, y, t, o = {}) {
  const { scale = 1, face = 1, walking = false } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(face * scale, scale);
  const step = walking ? Math.sin(t * 14) * 3 : 0;
  ctx.globalAlpha = 0.25; ellipse(0, 0, 18, 5); paint(OUT, 0); ctx.globalAlpha = 1;
  const eye = (ex, ey, r = 2) => { circle(ex, ey, r); paint(OUT, 0); circle(ex + 0.6, ey - 0.7, r * 0.35); paint('#fff', 0); };
  switch (kind) {
    case 'puppy': {
      ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-14, -16); ctx.lineTo(-22, -26 + Math.sin(t * 12) * 3); ctx.stroke();
      ctx.strokeStyle = '#d8a060'; ctx.lineWidth = 3; ctx.stroke();
      for (const lx of [-9, 7]) { rr(lx - 3 + step * (lx > 0 ? 1 : -1), -10, 6, 10, 3); paint('#d8a060', 2); }
      ellipse(0, -15, 17, 10); paint('#d8a060', 2.5);
      circle(15, -24, 11); paint('#d8a060', 2.5); ellipse(8, -24, 5, 10, 0.3); paint('#8a5a32', 2);
      eye(14, -26); circle(25, -22, 3); paint(OUT, 0);
      break;
    }
    case 'bunny': {
      const hop = walking ? Math.abs(Math.sin(t * 8)) * 8 : 0; ctx.translate(0, -hop);
      ellipse(0, -12, 15, 11); paint('#f6f2f8', 2.5); circle(-14, -14, 5); paint('#fff', 2);
      circle(12, -22, 10); paint('#f6f2f8', 2.5);
      for (const ex of [8, 14]) { ellipse(ex, -38, 4, 11); paint('#f6f2f8', 2); ellipse(ex, -38, 1.8, 7); paint('#ffb3c1', 0); }
      eye(15, -23); circle(21, -19, 2); paint('#ff7a9a', 0);
      break;
    }
    case 'penguin': {
      const sway = walking ? Math.sin(t * 10) * 0.15 : 0; ctx.rotate(sway);
      for (const lx of [-6, 5]) { ellipse(lx, -2, 6, 3); paint('#ffb02e', 1.5); }
      ellipse(0, -18, 13, 17); paint('#2a2a3a', 2.5); ellipse(3, -16, 9, 13); paint('#fff', 0);
      ellipse(-11, -18, 4, 10, 0.3); paint('#2a2a3a', 2);
      eye(6, -27); ctx.beginPath(); ctx.moveTo(10, -25); ctx.lineTo(17, -23); ctx.lineTo(10, -21); ctx.closePath(); paint('#ffb02e', 1.5);
      ellipse(0, -36, 10, 4); paint('#ff5fa2', 1.5); // little scarf hat
      break;
    }
    case 'turtle': {
      for (const lx of [-10, 8]) { ellipse(lx + step, -3, 5, 4); paint('#7ac87a', 2); }
      ellipse(18, -9, 7, 6); paint('#7ac87a', 2.5); eye(21, -11, 1.6);
      ctx.beginPath(); ctx.ellipse(0, -8, 17, 12, 0, Math.PI, TAU); ctx.closePath(); paint('#3a8a4a', 2.5);
      for (const hx of [-8, 0, 8]) { circle(hx, -12, 3.5); paint('#5fa860', 1.5); }
      break;
    }
    case 'hamster': {
      ellipse(0, -10, 15, 10); paint('#f2b06a', 2.5); ellipse(2, -7, 9, 5); paint('#fff2df', 0);
      for (const ex of [5, 12]) { circle(ex, -19, 4); paint('#f2b06a', 2); circle(ex, -19, 2); paint('#ffb3c1', 0); }
      eye(12, -12); circle(16, -8, 1.8); paint('#ff7a9a', 0);
      for (const lx of [-6, 6]) { ellipse(lx + step, -1, 3, 2); paint('#ffb3c1', 1); }
      break;
    }
    case 'owl': {
      const fl = walking ? Math.sin(t * 16) * 6 : 0; ctx.translate(0, -8 - Math.abs(fl));
      ellipse(0, -16, 13, 16); paint('#a8865a', 2.5); ellipse(0, -12, 8, 10); paint('#e8d0a8', 0);
      for (const s of [-1, 1]) { ellipse(s * 12, -16 + fl * 0.5, 5, 11, s * 0.3); paint('#8a6a3a', 2); circle(s * 5, -24, 5); paint('#fff', 1.5); circle(s * 5, -24, 2.2); paint(OUT, 0); }
      ctx.beginPath(); ctx.moveTo(-2, -20); ctx.lineTo(2, -20); ctx.lineTo(0, -16); ctx.closePath(); paint('#ffb02e', 1);
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 9, -30); ctx.lineTo(s * 12, -37); ctx.lineTo(s * 4, -31); ctx.closePath(); paint('#a8865a', 1.5); }
      break;
    }
    case 'pigeon': {
      const peck = walking ? Math.sin(t * 12) * 2 : 0;
      for (const lx of [-3, 3]) { rr(lx - 1, -6, 2, 6, 1); paint('#ff7a7a', 0); }
      ellipse(0, -12, 13, 8); paint('#9aa0b8', 2.5); ellipse(-6, -12, 9, 5, 0.2); paint('#7a8098', 1.5);
      circle(11 + peck, -20, 7); paint('#9aa0b8', 2.5); ellipse(9 + peck, -15, 5, 3); paint('#7ac8a8', 0);
      eye(13 + peck, -21, 1.5); ctx.beginPath(); ctx.moveTo(17 + peck, -21); ctx.lineTo(22 + peck, -19); ctx.lineTo(17 + peck, -18); ctx.closePath(); paint('#ffb02e', 1);
      break;
    }
    case 'seal': {
      const wig = walking ? Math.sin(t * 10) * 2 : 0;
      ctx.beginPath(); ctx.moveTo(-20, -4); ctx.quadraticCurveTo(-26, -12 + wig, -18, -12); ctx.lineTo(-12, -6); ctx.closePath(); paint('#8a96a8', 2);
      ellipse(0, -9, 17, 9); paint('#8a96a8', 2.5);
      circle(14, -16, 9); paint('#8a96a8', 2.5); eye(16, -18); circle(22, -14, 2); paint(OUT, 0);
      ellipse(6, -2, 6, 3, 0.4); paint('#7a8698', 1.5);
      break;
    }
  }
  ctx.restore();
}

/* ---------- Beads ---------- */
function drawBead(c, x, y, r = 14, o = {}) {
  const col = BEAD_COLORS[c] || '#ccc';
  const shape = o.shape || 'round';
  if (shape === 'heart') { heartPath(x, y + r * 0.2, r * 1.05); paint(col, 2.5); }
  else if (shape === 'star') { star(x, y, r * 1.1, 5, 0.5); paint(col, 2.5); }
  else if (shape === 'cube') { rr(x - r * 0.9, y - r * 0.9, r * 1.8, r * 1.8, 4); paint(col, 2.5); }
  else { circle(x, y, r); paint(col, 2.5); }
  if (o.letter) text(o.letter, x, y + 1, { size: r * 1.3, font: 'Andika', color: OUT, stroke: null });
  else if (o.num != null) text(String(o.num), x, y + 1, { size: r * 1.1, color: OUT, stroke: null });
  else { circle(x - r * 0.35, y - r * 0.35, r * 0.25); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fill(); }
}

/* ---------- Clue icons for the notebook ---------- */
function drawClueIcon(id, x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const C = CLUES[id] || {};
  switch (C.icon) {
    case 'feather': ctx.beginPath(); ctx.moveTo(-12, 14); ctx.quadraticCurveTo(-8, -16, 12, -16); ctx.quadraticCurveTo(6, 6, -12, 14); paint('#b07cff', 2.5); ctx.beginPath(); ctx.moveTo(-12, 14); ctx.lineTo(8, -12); ctx.lineWidth = 1.5; ctx.stroke(); break;
    case 'glitter': for (let i = 0; i < 6; i++) { star(Math.cos(i) * 10, Math.sin(i * 2) * 10, 5, 4, 0.4); paint(['#ffd23f', '#ff8ac4', '#8ec5ff'][i % 3], 1); } break;
    case 'ticket': rr(-16, -9, 32, 18, 4); paint('#ffd23f', 2.5); text('ADMIT', 0, 0, { size: 9, color: OUT, stroke: null }); break;
    case 'skate': rr(-12, -14, 18, 18, 5); paint('#fff', 2.5); rr(-14, 4, 26, 4, 2); paint('#c0c8d8', 1.5); break;
    case 'note': rr(-13, -15, 26, 30, 3); paint('#fffaf0', 2.5); for (let i = 0; i < 4; i++) { ctx.fillStyle = '#8ec5ff'; ctx.fillRect(-9, -9 + i * 6, 18, 2); } break;
    case 'bead': drawBead('purple', 0, 0, 12, { shape: 'star' }); break;
    case 'map': rr(-15, -12, 30, 24, 3); paint('#f0dca8', 2.5); ctx.strokeStyle = '#e8442f'; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(-10, 6); ctx.quadraticCurveTo(0, -10, 10, 2); ctx.stroke(); ctx.setLineDash([]); text('x', 10, 2, { size: 12, color: '#e8442f', stroke: null }); break;
    case 'key': circle(-8, 0, 7); paint('#ffd23f', 2.5); rr(-2, -2, 18, 5, 2); paint('#ffd23f', 2); rr(10, 2, 4, 6, 1); paint('#ffd23f', 1.5); break;
    case 'shell': ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(-14, -4); ctx.quadraticCurveTo(0, -18, 14, -4); ctx.closePath(); paint('#ffc0a8', 2.5); for (const dx of [-6, 0, 6]) { ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(dx, -10); ctx.lineWidth = 1.5; ctx.stroke(); } break;
    case 'book': rr(-14, -12, 28, 24, 3); paint('#e8442f', 2.5); rr(-10, -8, 20, 4, 1); paint('#ffd23f', 0); break;
    case 'paw': circle(0, 4, 7); paint('#c8a070', 2); for (const [dx, dy] of [[-8, -5], [-3, -10], [3, -10], [8, -5]]) { circle(dx, dy, 3); paint('#c8a070', 1.5); } break;
    default: circle(0, 0, 12); paint('#fffaf0', 2.5); text('?', 0, 1, { size: 18, color: OUT, stroke: null });
  }
  ctx.restore();
}

/* The necklace a friend got from her, drawn on them. */
function drawGiftNecklace(x, y, scale = 1, face = 1, adult = true) {
  ctx.save(); ctx.translate(x, y); ctx.scale(face * scale, scale);
  const top = -38 - (adult ? 8 : 0);
  for (let i = 0; i < 7; i++) { const a = Math.PI * (0.15 + 0.7 * i / 6); circle(Math.cos(a) * 11, top + Math.sin(a) * 7, 2.6); paint(BEAD_COLORS[BEAD_NAMES[i % 6]], 1); }
  ctx.restore();
}
