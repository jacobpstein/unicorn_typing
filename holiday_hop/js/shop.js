'use strict';

/*
  Aunt Pickles' Bagel Shop (next to Sadelle's house), Zelda-style:
  things sit on tables with price tags; walk up to one to hear about it, press SPACE to buy it (or wear / take off).
  Everyday bagels earned from right answers are the money.
*/

const SHOP_ITEMS = [
  // slot: what it is worn as; one of each slot at a time
  { id: 'crown', name: 'a gold crown', price: 30, slot: 'hat' },
  { id: 'partyhat', name: 'a party hat', price: 15, slot: 'hat' },
  { id: 'sunglasses', name: 'cool sunglasses', price: 20, slot: 'face' },
  { id: 'flowers', name: 'a flower crown', price: 25, slot: 'hat' },
  { id: 'cowboy', name: 'a cowboy hat', price: 25, slot: 'hat' },
  { id: 'tutu', name: 'a pink tutu', price: 25, slot: 'outfit' },
  { id: 'hero', name: 'a superhero cape', price: 35, slot: 'outfit' },
  { id: 'bell', name: 'a bell collar for Kugel', price: 10, slot: 'kitten', needs: 'kitten' },
  { id: 'kbow', name: 'a bow for Kugel', price: 10, slot: 'kitten', needs: 'kitten' },
  { id: 'fish', name: 'a fish treat for Kugel', price: 3, use: true, needs: 'kitten' },
  { id: 'potflowers', name: 'flowers for your stoop', price: 15, deco: true },
  { id: 'lights', name: 'twinkle lights for your house', price: 20, deco: true },
  { id: 'doghouse', name: 'a doghouse for your stoop', price: 30, deco: true },
  { id: 'sparkles', name: 'a sparkle trail', price: 30, slot: 'trail' },
  { id: 'hearts', name: 'a heart trail', price: 30, slot: 'trail' },
  { id: 'puppy', name: 'a puppy named Biscuit', price: 60, slot: 'pet' },
  { id: 'bunny', name: 'a bunny named Hoppy', price: 60, slot: 'pet' },
  { id: 'ticket', name: 'an arcade ticket. It gives you thirty more seconds in the Speed Arcade', price: 10, use: true },
];
const SHOP_BY_ID = Object.fromEntries(SHOP_ITEMS.map(i => [i.id, i]));

function shopState() {
  S.shop = S.shop || {};
  const s = S.shop;
  s.owned = s.owned || [];
  s.wear = s.wear || {};
  s.fish = s.fish || 0;
  s.tickets = s.tickets || 0;
  return s;
}

/* ---------- Drawings ---------- */
function drawShopIcon(id, x, y, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  switch (id) {
    case 'crown': ctx.beginPath(); ctx.moveTo(-16, 8); ctx.lineTo(-16, -8); ctx.lineTo(-8, 0); ctx.lineTo(0, -12); ctx.lineTo(8, 0); ctx.lineTo(16, -8); ctx.lineTo(16, 8); ctx.closePath(); paint('#ffd23f', 2.5); circle(0, 2, 3); paint('#ff5fa2', 1.5); break;
    case 'partyhat': ctx.beginPath(); ctx.moveTo(-12, 10); ctx.lineTo(0, -16); ctx.lineTo(12, 10); ctx.closePath(); paint('#8be06b', 2.5); circle(0, -17, 4); paint('#ffd23f', 2); for (const [a, b] of [[-5, 2], [4, -4], [2, 6]]) { circle(a, b, 2); paint('#ff5fa2', 0); } break;
    case 'sunglasses': for (const sx of [-9, 9]) { rr(sx - 8, -6, 16, 11, 4); paint('#2a2a3a', 2); } ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-1, -3); ctx.lineTo(1, -3); ctx.stroke(); break;
    case 'flowers': for (let i = 0; i < 5; i++) { circle(-14 + i * 7, -2 + (i % 2) * 3, 5); paint(['#ff5fa2', '#ffd23f', '#b07cff', '#ff8a1f', '#3ec1d3'][i], 1.5); } break;
    case 'cowboy': ellipse(0, 6, 20, 5); paint('#a8642a', 2.5); rr(-10, -10, 20, 16, 5); paint('#a8642a', 2.5); rr(-10, 0, 20, 3, 1); paint('#5a3a2a', 0); break;
    case 'tutu': for (let i = 0; i < 5; i++) { ellipse(-12 + i * 6, 2, 7, 9, (i - 2) * 0.3); paint('#ff8ac4', 1.5); } rr(-12, -8, 24, 6, 3); paint('#ff5fa2', 2); break;
    case 'hero': ctx.beginPath(); ctx.moveTo(-10, -12); ctx.lineTo(10, -12); ctx.lineTo(16, 14); ctx.lineTo(-16, 14); ctx.closePath(); paint('#e8442f', 2.5); star(0, 2, 7); paint('#ffd23f', 1.5); break;
    case 'bell': ellipse(0, -2, 14, 5); paint('#4aa3ff', 2.5); circle(0, 6, 5); paint('#ffd23f', 2); break;
    case 'kbow': ellipse(-6, 0, 7, 5, -0.4); paint('#ff5fa2', 2); ellipse(6, 0, 7, 5, 0.4); paint('#ff5fa2', 2); circle(0, 0, 3); paint('#ff8ac4', 1.5); break;
    case 'fish': ellipse(0, 0, 12, 7); paint('#8ec5ff', 2.5); ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(18, -7); ctx.lineTo(18, 7); ctx.closePath(); paint('#8ec5ff', 2); circle(-6, -2, 1.5); paint(OUT, 0); break;
    case 'potflowers': rr(-10, 0, 20, 12, 3); paint('#c8642a', 2.5); for (let i = 0; i < 3; i++) { rr(-7 + i * 7, -10, 2, 10, 1); paint('#3a8a3a', 0); circle(-6 + i * 7, -12, 4); paint(['#ff5fa2', '#ffd23f', '#b07cff'][i], 1.5); } break;
    case 'lights': ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-18, -4); ctx.quadraticCurveTo(0, 8, 18, -4); ctx.stroke(); for (let i = 0; i < 5; i++) { circle(-14 + i * 7, -1 + Math.sin(i / 4 * Math.PI) * 5, 3.5); paint(['#ff5fa2', '#ffd23f', '#3ec1d3', '#8be06b', '#ff8a1f'][(i + Math.floor(t * 3)) % 5], 1.5); } break;
    case 'doghouse': rr(-14, -4, 28, 18, 2); paint('#c8325a', 2.5); ctx.beginPath(); ctx.moveTo(-18, -2); ctx.lineTo(0, -16); ctx.lineTo(18, -2); ctx.closePath(); paint('#7a3a2a', 2.5); ellipse(0, 8, 6, 7); paint(OUT, 0); break;
    case 'sparkles': for (let i = 0; i < 4; i++) { star(-12 + i * 8, Math.sin(t * 4 + i) * 4, 5, 4, 0.4); paint(['#fff6b0', '#ffd23f', '#bfe6ff', '#ff8ac4'][i], 1); } break;
    case 'hearts': for (let i = 0; i < 3; i++) { heartPath(-10 + i * 10, 2 + Math.sin(t * 4 + i) * 3, 6); paint('#ff5fa2', 1.5); } break;
    case 'puppy': drawPuppy(0, 12, t, { scale: 0.7 }); break;
    case 'bunny': drawBunny(0, 12, t, { scale: 0.7 }); break;
    case 'ticket': rr(-16, -9, 32, 18, 4); paint('#ffd23f', 2.5); text('+30', 0, 0, { size: 11, color: OUT, stroke: null }); break;
  }
  ctx.restore();
}

/* Hats and outfits on Sadelle (feet at x, y). */
function drawWearables(x, y, face, scale, t, behind) {
  const w = shopState().wear;
  ctx.save(); ctx.translate(x, y); ctx.scale(face * scale, scale);
  if (behind) {
    if (w.outfit === 'hero') { ctx.beginPath(); ctx.moveTo(-6, -38); ctx.quadraticCurveTo(-24, -20, -20 + Math.sin(t * 6) * 3, -2); ctx.lineTo(4, -6); ctx.closePath(); paint('#e8442f', 2.5); }
    ctx.restore(); return;
  }
  if (w.outfit === 'tutu') for (let i = 0; i < 5; i++) { ellipse(-12 + i * 6, -16, 6, 7, (i - 2) * 0.3); paint('#ff8ac4', 1.5); }
  if (w.outfit === 'hero') { star(0, -27, 5); paint('#ffd23f', 1.5); }
  const hy = -52;
  if (w.face === 'sunglasses') { for (const sx of [4, 12]) { rr(sx - 5, hy - 4, 10, 7, 3); paint('#2a2a3a', 1.5); } }
  switch (w.hat) {
    case 'crown': ctx.save(); ctx.translate(0, hy - 18); ctx.scale(0.8, 0.8); drawShopIcon('crown', 0, 0, 1, t); ctx.restore(); break;
    case 'partyhat': ctx.save(); ctx.translate(-2, hy - 24); ctx.scale(0.8, 0.8); drawShopIcon('partyhat', 0, 0, 1, t); ctx.restore(); break;
    case 'flowers': ctx.save(); ctx.translate(0, hy - 14); ctx.scale(0.9, 0.9); drawShopIcon('flowers', 0, 0, 1, t); ctx.restore(); break;
    case 'cowboy': ctx.save(); ctx.translate(0, hy - 18); drawShopIcon('cowboy', 0, 0, 1, t); ctx.restore(); break;
  }
  ctx.restore();
}

function drawPuppy(x, y, t, o = {}) {
  const { scale = 1, face = 1, walking = false } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(face * scale, scale);
  const step = walking ? Math.sin(t * 14) * 3 : 0;
  ctx.globalAlpha = 0.25; ellipse(0, 0, 18, 5); paint(OUT, 0); ctx.globalAlpha = 1;
  ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-14, -16); ctx.lineTo(-22, -26 + Math.sin(t * 12) * 3); ctx.stroke();
  ctx.strokeStyle = '#d8a060'; ctx.lineWidth = 3; ctx.stroke();
  for (const lx of [-9, 7]) { rr(lx - 3 + step * (lx > 0 ? 1 : -1), -10, 6, 10, 3); paint('#d8a060', 2); }
  ellipse(0, -15, 17, 10); paint('#d8a060', 2.5);
  circle(15, -24, 11); paint('#d8a060', 2.5);
  ellipse(8, -24, 5, 10, 0.3); paint('#8a5a32', 2);
  circle(13, -26, 2); paint(OUT, 0); circle(25, -22, 3); paint(OUT, 0);
  ctx.restore();
}
function drawBunny(x, y, t, o = {}) {
  const { scale = 1, face = 1, walking = false } = o;
  const hop = walking ? Math.abs(Math.sin(t * 8)) * 8 : 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(face * scale, scale);
  ctx.globalAlpha = 0.25; ellipse(0, 0, 16, 5); paint(OUT, 0); ctx.globalAlpha = 1;
  ctx.translate(0, -hop);
  ellipse(0, -12, 15, 11); paint('#f6f2f8', 2.5); circle(-14, -14, 5); paint('#fff', 2);
  circle(12, -22, 10); paint('#f6f2f8', 2.5);
  for (const ex of [8, 14]) { ellipse(ex, -38, 4, 11); paint('#f6f2f8', 2); ellipse(ex, -38, 1.8, 7); paint('#ffb3c1', 0); }
  circle(15, -23, 2); paint(OUT, 0); circle(21, -19, 2); paint('#ff7a9a', 0);
  ctx.restore();
}

/* ---------- The shop room ---------- */
TOWN_MAPS.shop = () => {
  const b = new TB(17, 11, 'w');
  b.rect(0, 0, 17, 2, 'W').rect(0, 0, 1, 11, 'W').rect(16, 0, 1, 11, 'W').rect(0, 10, 17, 1, 'W');
  b.rect(3, 3, 11, 1, 'C');
  b.set(8, 10, 'w'); b.ent('warp', 8, 10, { to: 'town', at: { x: 38, y: 34 } });
  // Aunt Pickles, Mazel's aunt, behind the counter
  b.ent('deco', 8, 2, { solid: false, art: (x, y, t) => { drawCat(x, y - 6, t, { color: '#f28c28', stripe: '#c4621a', scale: 1.6, face: 1 }); rr(x - 8, y - 46, 26, 22, 5); paint('#fffaf0', 2); } });
  const spots = [];
  for (const row of [5, 7]) for (const x of [2, 4, 6, 8, 10, 12, 14]) spots.push([x, row]);
  for (const x of [2, 4, 12, 14]) spots.push([x, 9]);
  SHOP_ITEMS.forEach((it, i) => b.ent('shopitem', spots[i][0], spots[i][1], { item: it.id }));
  return b.build({
    spawn: { x: 8, y: 9 }, music: 'indoor', wall: '#f6e3c3', bg: '#3a2a20', palette: 'inside',
    enter(sc) {
      Talk.say("Welcome to my Bagel Shop! I'm Aunt Pickles, Mazel's aunt. Walk up to anything to hear about it. Press the space bar to buy it with your bagels!", { show: 'Walk up to something, then press SPACE to buy it!' });
    },
  });
};

class TShopItem extends TEnt {
  constructor(d, sc) { super(d, sc); this.solid = true; this.it = SHOP_BY_ID[d.item]; }
  onBump(sc) {
    sc.shopSel = this;
    const it = this.it, sh = shopState();
    const owned = sh.owned.includes(it.id);
    if (it.needs === 'kitten' && !townState().flags.kitten) { Talk.say(`That's ${it.name}. You need a kitten first! Mrs. Levi on Halloween Street might have one.`); return; }
    if (owned && it.slot) Talk.say(`You have ${it.name}. Press space to ${sh.wear[it.slot] === it.id ? 'take it off' : 'wear it'}!`);
    else if (owned && it.deco) Talk.say(`You have ${it.name}! It's at your house.`);
    else Talk.say(`That's ${it.name}! It costs ${it.price} bagels. You have ${S.coins}. Press space to buy it!`, { show: `${it.price} bagels. Press SPACE to buy!` });
  }
  sortY() { return (this.ty + 1) * T; }
  draw(sc) {
    const x = this.cx(), y = this.ty * T;
    rr(x - 20, y + 18, 40, 26, 5); paint('#a8743e', 3);
    const owned = shopState().owned.includes(this.it.id);
    drawShopIcon(this.it.id, x, y + 6 + Math.sin(this.t * 2) * 2, 0.9, this.t);
    rr(x - 16, y + 30, 32, 14, 4); paint(owned && !this.it.use ? '#8be06b' : '#fffaf0', 2);
    if (owned && !this.it.use) text('✓', x, y + 37, { size: 12, color: OUT, stroke: null });
    else { drawToken(x - 8, y + 37, 0, 0.45); text(String(this.it.price), x + 5, y + 38, { size: 11, color: OUT, stroke: null }); }
    if (sc.shopSel === this) { ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3; rr(x - 23, y - 14, 46, 60, 8); ctx.stroke(); }
  }
}

/* SPACE next to the item she just looked at: buy it, or wear / take it off. Returns true if it did something. */
function shopUse(sc) {
  const e = sc.shopSel;
  if (!e || Math.hypot(e.cx() - sc.p.x, e.cy() - sc.p.y) > T * 2) return false;
  const it = e.it, sh = shopState();
  if (it.needs === 'kitten' && !townState().flags.kitten) { Talk.say('You need a kitten first!'); return true; }
  const owned = sh.owned.includes(it.id);
  if (owned && it.slot) {
    sh.wear[it.slot] = sh.wear[it.slot] === it.id ? null : it.id;
    Sfx.pop(); saveState();
    Talk.say(sh.wear[it.slot] ? pick(['Looking great!', 'So stylish!', 'Ooh, I love it!']) : 'Okay, taken off!');
    return true;
  }
  if (owned && it.deco) { Talk.say('You already have that! Go see it at your house.'); return true; }
  if (S.coins < it.price) {
    Sfx.boing();
    Talk.say(`You need ${it.price - S.coins} more bagels for that. Answer questions around town to earn more!`);
    return true;
  }
  S.coins -= it.price;
  Sfx.coin(); Sfx.chime(); FX.confetti(e.cx(), e.cy() - 20, 30);
  if (it.id === 'fish') { sh.fish++; Talk.say('A fish treat! Press space next to Kugel to give it to her.'); }
  else if (it.id === 'ticket') { sh.tickets++; Talk.say(`An arcade ticket! You have ${sh.tickets}. Your next Speed Arcade game gets thirty more seconds!`); }
  else {
    sh.owned.push(it.id);
    if (it.slot) sh.wear[it.slot] = it.id;
    Talk.say(it.deco ? `Thank you! I'll bring ${it.name.replace(/^an? /, 'the ')} to your house!` : it.slot === 'pet' ? `Your new friend will follow you everywhere! Press space to pet them.` : `Thank you! You're wearing it now!`);
  }
  saveState();
  return true;
}

/* The card at the top while she looks at an item. */
function drawShopCard(sc) {
  const e = sc.shopSel;
  if (!e || Math.hypot(e.cx() - sc.p.x, e.cy() - sc.p.y) > T * 2) return;
  const it = e.it, sh = shopState(), owned = sh.owned.includes(it.id);
  rr(VW / 2 - 200, 12, 400, 130, 18); paint('rgba(40,25,60,.93)', 4);
  drawShopIcon(it.id, VW / 2 - 130, 74, 2.2, sc.t);
  text(it.name.replace(/^an? /, '').split('.')[0], VW / 2 + 50, 50, { size: 20, color: '#fff', lw: 4 });
  if (!owned || it.use) { drawToken(VW / 2 + 20, 92, sc.t * 0.3, 1.2); text(`${it.price}`, VW / 2 + 44, 93, { size: 28, color: '#ffd23f', align: 'left', lw: 5 }); }
  else text(it.slot ? (sh.wear[it.slot] === it.id ? 'Wearing it!' : 'Yours!') : 'Yours!', VW / 2 + 50, 92, { size: 24, color: '#8be06b', lw: 5 });
  drawKey('SPACE', VW / 2 + 50, 164, '#8be06b', 100);
}

/* Things she bought for her stoop show up outside her house in Brooklyn. */
function addStoopDecor(b) {
  const sh = shopState();
  if (sh.owned.includes('potflowers')) { b.ent('deco', 19, 27, { art: (x, y, t) => drawShopIcon('potflowers', x, y - 14, 1.3, t) }); b.ent('deco', 26, 27, { art: (x, y, t) => drawShopIcon('potflowers', x, y - 14, 1.3, t) }); }
  if (sh.owned.includes('lights')) b.ent('deco', 22, 24, { art: (x, y, t) => { for (let i = -2; i <= 2; i++) drawShopIcon('lights', x + i * 40, y - 46, 1.2, t + i); } });
  if (sh.owned.includes('doghouse')) b.ent('deco', 27, 28, { solid: true, art: (x, y, t) => drawShopIcon('doghouse', x, y - 18, 1.6, t) });
}

const SHOP_ENTS = { shopitem: TShopItem };
