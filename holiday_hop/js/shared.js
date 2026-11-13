'use strict';

/* Shared helpers kept from the old platformer: collision box test, holiday dates, candle flame,
   Hebrew letters, the missing-letter quiz, and the sleepy boss drawings. */
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/* Real-date awareness: a holiday glows "in season" around its date. Only ever adds bonuses. */
const HANUKKAH_FIRST_NIGHT = { 2025: [12, 14], 2026: [12, 4], 2027: [12, 24], 2028: [12, 12], 2029: [12, 1], 2030: [12, 20] };
function holidayDate(holiday, year) {
  switch (holiday) {
    case 'halloween': return new Date(year, 9, 31);
    case 'thanksgiving': { const dow = new Date(year, 10, 1).getDay(); return new Date(year, 10, 1 + (4 - dow + 7) % 7 + 21); }
    case 'hanukkah': { const d = HANUKKAH_FIRST_NIGHT[year] || [12, 10]; return new Date(year, d[0] - 1, d[1]); }
    case 'birthday': return new Date(year, 6, 6);
  }
  return null;
}
function inSeason(holiday, now = new Date()) {
  const d = holidayDate(holiday, now.getFullYear());
  if (!d) return false;
  const days = (now - d) / 864e5;
  return holiday === 'hanukkah' ? days >= -10 && days <= 9 : Math.abs(days) <= 10;
}

function drawFlame(x, y, s, t) {
  const gr = ctx.createRadialGradient(x, y - 6 * s, 2, x, y - 6 * s, 40 * s);
  gr.addColorStop(0, 'rgba(255,220,120,.7)'); gr.addColorStop(1, 'rgba(255,220,120,0)');
  ctx.fillStyle = gr; circle(x, y - 6 * s, 40 * s); ctx.fill();
  const wob = Math.sin(t * 12) * 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(x, y - 18 * s);
  ctx.quadraticCurveTo(x + 7 * s + wob, y - 6 * s, x, y);
  ctx.quadraticCurveTo(x - 7 * s + wob, y - 6 * s, x, y - 18 * s);
  paint('#ffb02e', 1.5 * s);
  ellipse(x, y - 5 * s, 2.5 * s, 4 * s); paint('#fff6b0', 0);
}

const HEBREW = [
  ['א', 'alef', 'ah-lef', ''], ['ב', 'bet', 'bet', 'buh'], ['ג', 'gimel', 'ghee-mel', 'guh'], ['ד', 'dalet', 'dah-let', 'duh'],
  ['ה', 'hey', 'hay', 'huh'], ['ו', 'vav', 'vahv', 'vuh'], ['ז', 'zayin', 'zah-yin', 'zuh'], ['ח', 'chet', 'khet', 'khh'],
  ['ט', 'tet', 'tet', 'tuh'], ['י', 'yod', 'yode', 'yuh'], ['כ', 'kaf', 'kahf', 'kuh'], ['ל', 'lamed', 'lah-med', 'luh'],
  ['מ', 'mem', 'mem', 'muh'], ['נ', 'nun', 'noon', 'nuh'], ['ס', 'samech', 'sah-mekh', 'sss'], ['ע', 'ayin', 'ah-yin', ''],
  ['פ', 'pey', 'pay', 'puh'], ['צ', 'tsadi', 'tsah-dee', 'tsuh'], ['ק', 'kuf', 'koof', 'kuh'], ['ר', 'resh', 'raysh', 'ruh'],
  ['ש', 'shin', 'sheen', 'shh'], ['ת', 'tav', 'tahv', 'tuh'],
];


const CONFUSE = { b: 'd', d: 'b', p: 'b', m: 'n', n: 'm', e: 'i', i: 'e', a: 'e', o: 'u', u: 'o', c: 'k', k: 'c', s: 'z', t: 'f', g: 'j', h: 'n', w: 'v', v: 'w', l: 'i', r: 'n', f: 't' };
function decoyFor(ch, avoid = '') {
  if (CONFUSE[ch] && !avoid.includes(CONFUSE[ch]) && Math.random() < 0.65) return CONFUSE[ch];
  const vowel = 'aeiou'.includes(ch);
  const pool = (vowel ? 'aeiou' : 'bcdfghjklmnprstvw').split('').filter(c => c !== ch && !avoid.includes(c));
  return pick(pool);
}

/* Math sign helper: shows "3 + 2 = ?" with dots under small numbers. */
function drawProblem(q, cx, cy, scale = 1) {
  const parts = q.parts.map(String);
  const sp = 46 * scale;
  const x0 = cx - (parts.length - 1) * sp / 2;
  parts.forEach((s, i) => {
    const x = x0 + i * sp;
    const isNum = /^\d+$/.test(s);
    text(s, x, cy, { size: 38 * scale, color: s === '?' ? '#ffb02e' : '#fff', lw: 6 });
    if (isNum && +s > 0 && +s <= 10) dots(+s, x, cy + 36 * scale, 4.5 * scale, '#ffd23f', 10.5 * scale);
  });
}

/*
  A quick question answered by bumping one of three blocks:
  'math' (3 + 2 = ?) or 'spell' (a word with one missing letter: c _ t).
*/
function makeQuiz(kind) {
  if (kind === 'spell') {
    const q = Adaptive.next('spell', { maxLen: 6 });
    const word = q.word, i = rint(0, word.length - 1), ch = word[i];
    const d1 = decoyFor(ch, word);
    const d2 = decoyFor(ch, word + d1);
    const vals = shuffle([...new Set([ch, d1, d2])]);
    while (vals.length < 3) { const v = pick('aeioustmnbdp'.split('')); if (!vals.includes(v)) vals.push(v); }
    const spoken = word.split('').map((c, j) => j === i ? 'blank' : lname(c)).join(', ');
    const shown = word.split('').map((c, j) => j === i ? '_' : c).join(' ');
    const sentence = q.sentence ? ` ${q.sentence}` : '';
    return {
      kind, q, answer: ch, vals, letters: true,
      prompt: `Spell ${word}.${sentence} ${spoken}. Which letter is missing?`,
      show: `${shown}   Which letter is missing?`,
      right: `${spellOut(word)}. ${word}!`,
      wrong: v => `That's ${lname(v)}. ${word}... ${spoken}.`,
      draw: (cx, cy, s) => drawMissingWord(word, i, cx, cy, s),
    };
  }
  const q = Adaptive.next('math');
  return {
    kind: 'math', q, answer: q.answer, vals: MathGen.choices(q, 3), letters: false,
    prompt: `${MathGen.speech(q)} Bump the answer!`,
    show: `${q.parts.join(' ')}   Bump the answer!`,
    right: `${MathGen.answerSpeech(q)}!`,
    wrong: v => `Not ${v}. ${MathGen.speech(q)} Count the dots!`,
    draw: (cx, cy, s) => drawProblem(q, cx, cy, s),
  };
}

function drawMissingWord(word, gap, cx, cy, s = 1) {
  const sp = 42 * s, x0 = cx - (word.length - 1) * sp / 2;
  for (let j = 0; j < word.length; j++) {
    const x = x0 + j * sp;
    if (j === gap) {
      rr(x - 14 * s, cy + 18 * s, 28 * s, 6 * s, 3); paint('#ffb02e', 0);
      text('?', x, cy, { size: 36 * s, color: '#ffb02e', lw: 6 });
    } else text(word[j], x, cy, { size: 40 * s, font: 'Andika', color: 'aeiou'.includes(word[j]) ? '#ff8a9a' : '#8ec5ff', lw: 6 });
  }
}

const BOSSES = {
  gourd: { name: 'the Great Gourd', theme: 'halloween', blast: 'bat', targets: 2, holidayLine: 'Happy Halloween!' },
  gobbler: { name: 'Gobbler the Grand Float', theme: 'thanksgiving', blast: 'feather', targets: 2, holidayLine: 'Happy Thanksgiving!' },
  dreidel: {
    name: 'Spinny the Giant Dreidel', theme: 'hanukkah', blast: 'star', targets: 2, holidayLine: 'Happy Hanukkah!',
    intro: "It's Spinny the Giant Dreidel! Stay away while he spins. When he gets dizzy, jump on his head, or spin into him!",
    show: 'When he is dizzy, jump on him!',
  },
};


/* Draws a district boss (no game logic). */
class BossView {
  constructor(kind) { this.kind = kind; this.info = BOSSES[kind]; this.t = 0; this.squash = 0; this.awake = false; this.hatOff = false; this.phase = 'view'; }
  eyes(x, y, gap, r) {
    if (this.awake) {
      for (const s of [-1, 1]) { circle(x + s * gap, y, r); paint('#fff', 3); circle(x + s * gap + 3, y, r * 0.5); paint(OUT, 0); }
    } else sleepyEyes(x, y, gap, false, r);
  }
  drawGourd() {
    const breathe = Math.sin(this.t * 2) * 3;
    const col = this.awake ? '#ff9a2f' : '#e07a2a';
    for (const [dx, rx] of [[-38, 34], [38, 34], [0, 40]]) { ellipse(dx, -56 - breathe / 2, rx, 54 + breathe / 2); paint(col, 4); }
    rr(-8, -122, 16, 20, 4); paint('#5a8a3a', 3);
    ctx.strokeStyle = '#5a8a3a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(6, -114); ctx.quadraticCurveTo(30, -130, 34, -110); ctx.stroke();
    this.eyes(14, -66, 22, 10);
    ctx.lineWidth = 4; ctx.strokeStyle = OUT;
    if (this.awake) { ctx.beginPath(); ctx.arc(14, -38, 20, 0.2, Math.PI - 0.2); ctx.stroke(); }
    else if (this.phase === 'yawn' || this.phase === 'power') { ellipse(14, -34, 12, 14); paint('#7a2a1a', 4); }
    else { ctx.beginPath(); ctx.moveTo(-6, -32); ctx.quadraticCurveTo(14, -40, 34, -32); ctx.stroke(); }
    if (!this.hatOff) nightcap(-6, -108, '#7a5cc4', Math.sin(this.t * 2) * 3);
  }
  drawDreidel() {
    ctx.save();
    ctx.rotate(this.tilt || 0);
    const sw = this.spinning ? 0.45 + 0.55 * Math.abs(Math.cos(this.spinA)) : 1;
    ctx.save(); ctx.scale(sw, 1);
    ctx.beginPath(); ctx.moveTo(-58, -116); ctx.lineTo(58, -116); ctx.lineTo(58, -50); ctx.lineTo(0, 0); ctx.lineTo(-58, -50); ctx.closePath();
    paint(this.awake ? '#6ab4ff' : '#4a8ad8', 4);
    ctx.beginPath(); ctx.moveTo(58, -116); ctx.lineTo(58, -50); ctx.lineTo(0, 0); ctx.lineTo(28, -54); ctx.lineTo(28, -116); ctx.closePath(); paint('rgba(30,40,110,.25)', 0);
    rr(-10, -150, 20, 36, 5); paint('#c0c8d8', 4);
    const letters = ['נ', 'ג', 'ה', 'ש'];
    const L = letters[Math.floor((this.spinA || 0) / (Math.PI / 2)) % 4];
    text(L, 0, -52, { size: 40, font: 'Noto Sans Hebrew', color: '#ffd23f', lw: 6 });
    ctx.restore();
    this.eyes(0, -92, 22, 9);
    ctx.lineWidth = 4; ctx.strokeStyle = OUT;
    if (this.awake) { ctx.beginPath(); ctx.arc(0, -82, 12, 0.2, Math.PI - 0.2); ctx.stroke(); }
    if (!this.hatOff) nightcap(-8, -146, '#7a5cc4', Math.sin(this.t * 2) * 3);
    if (this.dizzy && this.phase === 'play') for (let i = 0; i < 3; i++) { const a = this.t * 4 + i * TAU / 3; star(Math.cos(a) * 40, -170 + Math.sin(a) * 10, 9); paint('#ffd23f', 2); }
    ctx.restore();
  }
  drawGobbler() {
    // parade balloon turkey with ropes
    ctx.strokeStyle = OUT; ctx.lineWidth = 2;
    for (const dx of [-40, 0, 40]) { ctx.beginPath(); ctx.moveTo(dx, -10); ctx.lineTo(dx * 1.3, 40); ctx.stroke(); }
    const fan = ['#e8442f', '#ffb02e', '#8a5a32', '#ffd23f', '#e8442f', '#ffb02e', '#8a5a32'];
    for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 - 1.4 + i * 0.47; ellipse(-20 + Math.cos(a) * 52, -70 + Math.sin(a) * 52, 18, 42, a + Math.PI / 2); paint(fan[i], 3); }
    ellipse(0, -52, 56, 48); paint(this.awake ? '#a8703e' : '#8a5a32', 4);
    circle(30, -96, 26); paint('#a8703e', 4);
    ctx.beginPath(); ctx.moveTo(52, -98); ctx.lineTo(70, -92); ctx.lineTo(52, -86); ctx.closePath(); paint('#ffb02e', 3);
    ellipse(52, -76, 7, 12); paint('#e8442f', 3);
    this.eyes(34, -100, 10, 6);
    if (!this.hatOff) nightcap(14, -118, '#4aa3ff', Math.sin(this.t * 2) * 3);
  }

}
