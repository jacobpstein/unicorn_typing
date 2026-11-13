'use strict';

/* Canvas, input (keys, typed letters, mouse/touch), drawing primitives, particles, saving and Mazel's talk bubble. */

const T = 48, VW = 960, VH = 540, DT = 1 / 60;
const OUT = '#2b1d3a';
const TAU = Math.PI * 2;

const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const inRect = (p, r) => p && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
const View = { k: 1 };

function resize() {
  const s = Math.min(innerWidth / VW, innerHeight / VH);
  cv.style.width = Math.floor(VW * s) + 'px';
  cv.style.height = Math.floor(VH * s) + 'px';
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  View.k = s * dpr;
  cv.width = Math.round(VW * View.k);
  cv.height = Math.round(VH * View.k);
}
addEventListener('resize', resize);
resize();

/* ---------- Input ---------- */
const KEYMAP = {
  left: ['arrowleft', 'a'], right: ['arrowright', 'd'], up: ['arrowup', 'w'], down: ['arrowdown', 's'],
  ok: [' ', 'enter'], back: ['escape'],
};
const Input = {
  down: new Set(), hit: new Set(), typed: [], click: null, mouse: { x: -99, y: -99 }, typing: false,
  init() {
    addEventListener('keydown', e => {
      if (document.getElementById('parent').style.display === 'block') return;
      const k = e.key.toLowerCase();
      if ([' ', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'enter', 'escape', 'backspace', 'tab'].includes(k)) e.preventDefault();
      if (e.metaKey || e.ctrlKey) return;
      if (!e.repeat && /^[a-z0-9]$/.test(k)) this.typed.push(k);
      if (!this.down.has(k)) this.hit.add(k);
      this.down.add(k);
      Sfx.init();
    });
    addEventListener('keyup', e => this.down.delete(e.key.toLowerCase()));
    addEventListener('blur', () => this.down.clear());
    const pos = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * VW, y: (e.clientY - r.top) / r.height * VH }; };
    cv.addEventListener('pointerdown', e => { Sfx.init(); this.click = pos(e); this.mouse = pos(e); cv.focus(); });
    cv.addEventListener('pointermove', e => { this.mouse = pos(e); });
  },
  /* While a typing challenge is open, letter keys (w/a/s/d) don't move or navigate. */
  held(a) { return KEYMAP[a].some(k => this.down.has(k) && !(this.typing && k.length === 1 && k !== ' ')); },
  pressed(a) { return KEYMAP[a].some(k => this.hit.has(k) && !(this.typing && k.length === 1 && k !== ' ')); },
  key(k) { return this.hit.has(k); },
  clicked(r) { return this.click && inRect(this.click, r); },
  hover(r) { return inRect(this.mouse, r); },
  endStep() { this.hit.clear(); this.typed.length = 0; if (this.click) this.drawClick = this.click; this.click = null; },
};

/* ---------- Drawing primitives ---------- */
function rr(x, y, w, h, r) {
  ctx.beginPath();
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, Math.max(0.1, r), 0, TAU); }
function ellipse(x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, TAU); }
function paint(fill, lw = 3, stroke = OUT) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.stroke(); }
}
function text(str, x, y, o = {}) {
  const { size = 28, color = '#fff', font = 'Fredoka', weight = 700, align = 'center', base = 'middle', stroke = OUT, lw = 6, alpha = 1 } = o;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = `${weight} ${size}px ${font}, system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  if (stroke && lw) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.lineJoin = 'round'; ctx.strokeText(str, x, y); }
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
  ctx.restore();
}
function textW(str, size = 28, font = 'Fredoka', weight = 700) { ctx.font = `${weight} ${size}px ${font}, system-ui, sans-serif`; return ctx.measureText(str).width; }
function wrapLines(str, maxW, size, font = 'Andika') {
  ctx.font = `700 ${size}px ${font}, sans-serif`;
  const out = [''];
  for (const wd of str.split(' ')) {
    const t = out[out.length - 1] ? out[out.length - 1] + ' ' + wd : wd;
    if (ctx.measureText(t).width > maxW && out[out.length - 1]) out.push(wd); else out[out.length - 1] = t;
  }
  return out;
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  if (amt > 0) { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
  else { r *= 1 + amt; g *= 1 + amt; b *= 1 + amt; }
  return '#' + [r, g, b].map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
}
function star(x, y, r, n = 5, inner = 0.45) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = -Math.PI / 2 + i * Math.PI / n, rad = i % 2 ? r * inner : r;
    ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  ctx.closePath();
}
function heartPath(x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.35);
  ctx.bezierCurveTo(x - s * 1.1, y - s * 0.4, x - s * 0.45, y - s * 1.05, x, y - s * 0.45);
  ctx.bezierCurveTo(x + s * 0.45, y - s * 1.05, x + s * 1.1, y - s * 0.4, x, y + s * 0.35);
  ctx.closePath();
}
function drawHeart(x, y, s, fill = '#ff4f6d', lw = 3) { heartPath(x, y, s); paint(fill, lw); }
/* Ten-frame style dots: n dots in rows of 5. */
function dots(n, x, y, r = 5, color = '#fff', gap = 13) {
  const rows = Math.ceil(n / 5);
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 5), col = i % 5;
    const cnt = Math.min(5, n - row * 5);
    circle(x + (col - (cnt - 1) / 2) * gap, y + (row - (rows - 1) / 2) * gap, r);
    paint(color, 2);
  }
}
/* A big friendly clickable button. Returns true when clicked. */
function button(label, x, y, w, h, o = {}) {
  const { color = '#8be06b', size = 24, sel = false } = o;
  const r = { x: x - w / 2, y: y - h / 2, w, h };
  const hot = Input.hover(r) || sel;
  rr(r.x, r.y + 4, w, h, 14); paint(shade(color, -0.3), 0);
  rr(r.x, r.y + (hot ? 2 : 0), w, h, 14); paint(hot ? shade(color, 0.2) : color, 3);
  text(label, x, y + (hot ? 2 : 0), { size, color: OUT, stroke: null, font: o.font || 'Fredoka' });
  return !!(Input.drawClick && inRect(Input.drawClick, r));
}
function drawKey(label, x, y, color = '#fffaf0', w = 44) {
  rr(x - w / 2, y - 20, w, 40, 9); paint(shade(color, -0.25), 3);
  rr(x - w / 2 + 3, y - 18, w - 6, 32, 7); paint(color, 0);
  text(label, x, y - 2, { size: 20, color: OUT, stroke: null });
}
function drawSpeaker(x, y, hot) {
  circle(x, y, 24); paint(hot ? '#ffe680' : '#fffaf0', 3);
  ctx.beginPath();
  ctx.moveTo(x - 11, y - 5); ctx.lineTo(x - 5, y - 5); ctx.lineTo(x + 3, y - 12); ctx.lineTo(x + 3, y + 12); ctx.lineTo(x - 5, y + 5); ctx.lineTo(x - 11, y + 5);
  ctx.closePath(); paint(OUT, 0);
  ctx.lineWidth = 3; ctx.strokeStyle = OUT;
  ctx.beginPath(); ctx.arc(x + 4, y, 8, -0.8, 0.8); ctx.stroke();
  ctx.beginPath(); ctx.arc(x + 4, y, 14, -0.8, 0.8); ctx.stroke();
}
const SPEAKER = { x: VW - 64, y: 14, w: 48, h: 48 };

/* ---------- Particles ---------- */
const FX = {
  list: [],
  add(p) { this.list.push(Object.assign({ vx: 0, vy: 0, g: 0, life: 1, size: 6, color: '#fff', kind: 'dot', rot: 0, vr: 0 }, p, { max: p.life || 1 })); },
  burst(x, y, n, colors, o = {}) {
    const { speed = 220, g = 600, life = 0.8, size = 6, kind = 'dot', up = 0 } = o;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, s = speed * (0.4 + Math.random() * 0.6);
      this.add({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - up, g, life: life * (0.6 + Math.random() * 0.6), size: size * (0.6 + Math.random() * 0.7), color: pick(colors), kind, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12 });
    }
  },
  confetti(x, y, n = 30) { this.burst(x, y, n, ['#ff5fa2', '#ffd23f', '#3ec1d3', '#8be06b', '#b07cff', '#ff8a3d'], { kind: 'confetti', speed: 380, g: 500, life: 1.4, size: 8, up: 200 }); },
  sparkle(x, y, n = 8, colors = ['#fff6b0', '#ffffff', '#ffd23f']) { this.burst(x, y, n, colors, { kind: 'spark', speed: 160, g: 0, life: 0.7, size: 7 }); },
  pop(x, y, str, color = '#ffd23f') { this.add({ x, y, vy: -60, life: 1.1, kind: 'text', text: str, color, size: 26 }); },
  hearts(x, y, n = 5) { for (let i = 0; i < n; i++) this.add({ x: x + (Math.random() - 0.5) * 30, y, vy: -60 - Math.random() * 40, vx: (Math.random() - 0.5) * 40, life: 1.1, kind: 'text', text: '♥', color: '#ff5fa2', size: 22 }); },
  update(dt) {
    for (const p of this.list) { p.life -= dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; }
    this.list = this.list.filter(p => p.life > 0);
  },
  draw() {
    for (const p of this.list) {
      const a = clamp(p.life / p.max, 0, 1);
      ctx.save();
      ctx.globalAlpha = p.kind === 'text' ? Math.min(1, a * 2) : a;
      ctx.translate(p.x, p.y);
      if (p.kind === 'confetti') { ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); }
      else if (p.kind === 'spark') { ctx.rotate(p.rot); star(0, 0, p.size * (0.5 + a), 4, 0.35); ctx.fillStyle = p.color; ctx.fill(); }
      else if (p.kind === 'text') text(p.text, 0, 0, { size: p.size, color: p.color });
      else if (p.kind === 'ring') { circle(0, 0, p.size * (1.6 - a)); ctx.lineWidth = 4 * a; ctx.strokeStyle = p.color; ctx.stroke(); }
      else { circle(0, 0, p.size * (0.4 + a * 0.6)); ctx.fillStyle = p.color; ctx.fill(); }
      ctx.restore();
    }
  },
};

/* ---------- Saved state ---------- */
const SAVE_KEY = 'lanternIsle.v1';
function defaultState() {
  return {
    created: false,
    look: { hair: '#5b3a24', skin: '#f2c9a0', color: '#ff5fa2' },
    coins: 0,
    step: 0,               // story progress (index into STORY)
    clues: [],             // clue ids found
    pets: [],              // pet ids found
    pet: null,             // pet walking with her
    owned: [],             // shop items
    wear: {},              // slot -> item id
    beads: { pink: 6, blue: 6, yellow: 6, green: 4, purple: 4 },
    letterBeads: true,
    keys: {}, taught: {}, lamps: 0, petWear: {}, visited: {}, lastGift: null,
    jewelry: [],           // made pieces: {kind, beads:[...], word}
    wearJewel: null,       // index into jewelry
    gifts: {},             // npc id -> true
    talked: {},            // npc id -> times
    done: {},              // challenge-station id -> true
    stickers: [],          // words spelled
    skills: {},            // skill id -> { level, streak, miss, hist: [] }
    stats: { missed: {}, right: {}, tries: {} },
    settings: { sfxOff: false, musicOff: false, voice: '', speechRate: 1 },
    played: {}, days: [], at: null,
  };
}
function merge(base, saved) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return saved ?? base;
  const out = { ...base };
  for (const k of Object.keys(saved)) out[k] = (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) ? merge(base[k], saved[k]) : saved[k];
  return out;
}
function loadState() {
  try { const raw = localStorage.getItem(SAVE_KEY); if (raw) return merge(defaultState(), JSON.parse(raw)); } catch (e) { /* blocked or corrupt */ }
  return defaultState();
}
function saveState() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }
let S = defaultState();

/* ---------- Speaking helpers ---------- */
const LETTER_NAMES = {
  a: 'ay', b: 'bee', c: 'see', d: 'dee', e: 'ee', f: 'eff', g: 'jee', h: 'aitch', i: 'eye', j: 'jay', k: 'kay', l: 'ell', m: 'em',
  n: 'en', o: 'oh', p: 'pee', q: 'cue', r: 'are', s: 'ess', t: 'tee', u: 'you', v: 'vee', w: 'double you', x: 'ex', y: 'why', z: 'zee',
};
const lname = ch => LETTER_NAMES[ch] || ch;
const spellOut = w => w.split('').map(lname).join(', ');
const NUM_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

/* ---------- Mazel's talk bubble ---------- */
const Talk = {
  line: '', t: 0, last: '', who: null,
  say(str, { show = null, who = null, interrupt = true } = {}) {
    if (!str) return Promise.resolve();
    this.line = show || str;
    this.who = who;
    this.t = Math.max(3, (show || str).length * 0.08);
    this.last = str;
    return Speech.say(str, { interrupt });
  },
  update(dt) { if (this.t > 0 && !Speech.speaking) this.t -= dt; },
  /* Compact strip above a panel: Mazel's face and up to two lines. */
  strip() {
    if (this.t <= 0 || !this.line) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, this.t * 3);
    const lines = wrapLines(this.line, 820, 18, 'Fredoka').slice(0, 2);
    rr(46, 4, 868, 50, 14); paint('#fffaf0', 2.5);
    lines.forEach((l, i) => text(l, 92, (lines.length === 1 ? 29 : 19) + i * 21, { size: 18, color: OUT, align: 'left', stroke: null, weight: 600, font: 'Fredoka' }));
    if (this.who && this.who.face) this.who.face(68, 29, 18); else drawMazelFace(68, 31, 17, Speech.speaking);
    ctx.restore();
  },
  draw(bottom = true) {
    if (this.t <= 0 || !this.line) return;
    const a = Math.min(1, this.t * 3);
    ctx.save();
    ctx.globalAlpha = a;
    const lines = wrapLines(this.line, 640, 21, 'Fredoka').slice(0, 3);
    ctx.font = '600 21px Fredoka, sans-serif';
    const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 44;
    const h = 22 + lines.length * 26;
    const x = 96, y = bottom ? VH - 16 - h : 84;
    rr(x, y, w, h, 18); paint('#fffaf0', 3);
    ctx.beginPath(); ctx.moveTo(x + 2, y + h / 2 - 8); ctx.lineTo(x - 16, y + h / 2 + 2); ctx.lineTo(x + 2, y + h / 2 + 10); ctx.closePath(); paint('#fffaf0', 0);
    lines.forEach((l, i) => text(l, x + 20, y + 24 + i * 26, { size: 21, color: OUT, align: 'left', stroke: null, weight: 600 }));
    if (this.who && this.who.face) this.who.face(52, y + h / 2, 32);
    else drawMazelFace(52, y + h / 2, 30, Speech.speaking);
    ctx.restore();
  },
};
