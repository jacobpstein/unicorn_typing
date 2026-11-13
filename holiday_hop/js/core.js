'use strict';

/* Canvas, input, drawing primitives, particles and Mazel's talk bubble. */

const T = 48, VW = 960, VH = 540, DT = 1 / 60;
const OUT = '#2b1d3a';
const TAU = Math.PI * 2;

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
  jump: [' ', 'arrowup', 'w'], power: ['x', 'z', 'shift'], replay: ['enter'], pause: ['escape', 'p'],
  ok: [' ', 'enter'],
};
const Input = {
  down: new Set(), hit: new Set(), any: false,
  init() {
    addEventListener('keydown', e => {
      if (document.getElementById('parent').style.display === 'block') return;
      const k = e.key.toLowerCase();
      if ([' ', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'enter', 'escape'].includes(k)) e.preventDefault();
      if (!this.down.has(k)) this.hit.add(k);
      this.down.add(k);
      this.any = true;
      Sfx.init();
    });
    addEventListener('keyup', e => this.down.delete(e.key.toLowerCase()));
    addEventListener('blur', () => this.down.clear());
  },
  held(a) { return KEYMAP[a].some(k => this.down.has(k)); },
  pressed(a) { return KEYMAP[a].some(k => this.hit.has(k)); },
  key(k) { return this.hit.has(k); },
  endStep() { this.hit.clear(); this.any = false; },
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

/* ---------- Particles (world coordinates) ---------- */
const FX = {
  list: [],
  add(p) {
    this.list.push(Object.assign({ vx: 0, vy: 0, g: 0, life: 1, size: 6, color: '#fff', kind: 'dot', rot: 0, vr: 0, drag: 0 }, p, { max: p.life || 1 }));
  },
  burst(x, y, n, colors, o = {}) {
    const { speed = 220, g = 600, life = 0.8, size = 6, kind = 'dot', up = 0 } = o;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, s = speed * (0.4 + Math.random() * 0.6);
      this.add({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - up, g, life: life * (0.6 + Math.random() * 0.6), size: size * (0.6 + Math.random() * 0.7), color: pick(colors), kind, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 12 });
    }
  },
  confetti(x, y, n = 30) { this.burst(x, y, n, ['#ff5fa2', '#ffd23f', '#3ec1d3', '#8be06b', '#b07cff', '#ff8a3d'], { kind: 'confetti', speed: 380, g: 500, life: 1.4, size: 8, up: 200 }); },
  dust(x, y, n = 6) { this.burst(x, y, n, ['#e9e2f2', '#cfc4dc'], { speed: 90, g: -40, life: 0.45, size: 7 }); },
  sparkle(x, y, n = 8, colors = ['#fff6b0', '#ffffff', '#ffd23f']) { this.burst(x, y, n, colors, { kind: 'spark', speed: 160, g: 0, life: 0.7, size: 7 }); },
  pop(x, y, str, color = '#ffd23f') { this.add({ x, y, vy: -60, life: 1, kind: 'text', text: str, color, size: 26 }); },
  update(dt) {
    for (const p of this.list) {
      p.life -= dt;
      p.vy += p.g * dt;
      if (p.drag) { p.vx *= 1 - p.drag * dt; p.vy *= 1 - p.drag * dt; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.rot += p.vr * dt;
    }
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
      else if (p.kind === 'leaf') { ctx.rotate(p.rot); ellipse(0, 0, p.size, p.size * 0.5); paint(p.color, 1.5); }
      else if (p.kind === 'zzz') { text('z', 0, 0, { size: p.size, color: '#cfe8ff', lw: 4 }); }
      else if (p.kind === 'text') { text(p.text, 0, 0, { size: p.size, color: p.color }); }
      else if (p.kind === 'ring') { circle(0, 0, p.size * (1.6 - a)); ctx.lineWidth = 4 * a; ctx.strokeStyle = p.color; ctx.stroke(); }
      else { circle(0, 0, p.size * (0.4 + a * 0.6)); ctx.fillStyle = p.color; ctx.fill(); }
      ctx.restore();
    }
  },
};

/* ---------- Mazel the bodega cat: the voice of the game ---------- */
const LETTER_NAMES = {
  a: 'ay', b: 'bee', c: 'see', d: 'dee', e: 'ee', f: 'eff', g: 'jee', h: 'aitch', i: 'eye', j: 'jay', k: 'kay', l: 'ell', m: 'em',
  n: 'en', o: 'oh', p: 'pee', q: 'cue', r: 'are', s: 'ess', t: 'tee', u: 'you', v: 'vee', w: 'double you', x: 'ex', y: 'why', z: 'zee',
};
const lname = ch => LETTER_NAMES[ch] || ch;
const spellOut = w => w.split('').map(lname).join(', ');
const NUM_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

const Talk = {
  line: '', t: 0, last: '', lastPrompt: '',
  say(str, { prompt = false, interrupt = true, show = null } = {}) {
    if (!str) return Promise.resolve();
    this.line = show || str;
    this.t = Math.max(2.5, str.length * 0.075);
    this.last = str;
    if (prompt) this.lastPrompt = str;
    return Speech.say(str, { interrupt });
  },
  update(dt) { if (this.t > 0) this.t -= dt; },
  draw() {
    if (this.t <= 0 || !this.line) return;
    const a = Math.min(1, this.t * 3);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = '600 20px Fredoka, sans-serif';
    // wrap onto at most two lines
    const maxW = 520, words = this.line.split(' '), lines = [''];
    for (const wd of words) {
      const tryLine = lines[lines.length - 1] ? lines[lines.length - 1] + ' ' + wd : wd;
      if (ctx.measureText(tryLine).width > maxW && lines[lines.length - 1]) { if (lines.length === 2) { lines[1] += '…'; break; } lines.push(wd); }
      else lines[lines.length - 1] = tryLine;
    }
    const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + 40;
    const x = 92, y = this.bottom ? VH - 40 - lines.length * 24 : 112, h = 28 + lines.length * 24;
    rr(x, y - 26, w, h, 18); paint('#fffaf0', 3);
    ctx.beginPath(); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 14, y + 6); ctx.lineTo(x + 6, y + 12); ctx.closePath(); paint('#fffaf0', 0);
    lines.forEach((l, i) => text(l, x + 18, y + 1 + i * 24, { size: 20, color: OUT, align: 'left', stroke: null, weight: 600 }));
    drawMazelFace(52, y + 8, 30, Speech.speaking);
    ctx.restore();
  },
};

/* Speaker button for "hear it again", top-right. */
function drawSpeaker(x, y, hot) {
  circle(x, y, 24); paint(hot ? '#ffe680' : '#fffaf0', 3);
  ctx.beginPath();
  ctx.moveTo(x - 11, y - 5); ctx.lineTo(x - 5, y - 5); ctx.lineTo(x + 3, y - 12); ctx.lineTo(x + 3, y + 12); ctx.lineTo(x - 5, y + 5); ctx.lineTo(x - 11, y + 5);
  ctx.closePath(); paint(OUT, 0);
  ctx.lineWidth = 3; ctx.strokeStyle = OUT;
  ctx.beginPath(); ctx.arc(x + 4, y, 8, -0.8, 0.8); ctx.stroke();
  ctx.beginPath(); ctx.arc(x + 4, y, 14, -0.8, 0.8); ctx.stroke();
}

/* Keyboard key cap hint, e.g. drawKey('X', x, y, '#4aa3ff') */
function drawKey(label, x, y, color = '#fffaf0', w = 44) {
  rr(x - w / 2, y - 20, w, 40, 9); paint(shade(color, -0.25), 3);
  rr(x - w / 2 + 3, y - 18, w - 6, 32, 7); paint(color, 0);
  text(label, x, y - 2, { size: 20, color: OUT, stroke: null });
}
