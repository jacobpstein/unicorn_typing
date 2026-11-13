'use strict';

/*
  The Sparkle Studio: make real-feeling bead jewelry.
  Pattern Bracelet (patterns), Mirror Charm (symmetry), Count Necklace (count by 10s with 10-bead strands),
  Name Beads (typing), Free Style (no rules). Finished pieces go in the Jewelry Box and can be worn.
  Friends ask for orders; giving them the piece unlocks a reward.
*/

const TRAY_COLORS = ['pink', 'blue', 'yellow', 'green', 'purple', 'orange'];
const SHAPES = ['round', 'heart', 'star', 'cube'];
const beadSay = b => `${b.c}${b.shape && b.shape !== 'round' ? ' ' + b.shape : ''}`;
const beadEq = (a, b) => a.c === b.c && (a.shape || 'round') === (b.shape || 'round');

/* Pattern units by level: AB, AAB, ABB, ABC, AABB, then shape-and-color AB / ABC. */
function patternUnit(level, fixed) {
  if (fixed) return fixed;
  const cs = shuffle(TRAY_COLORS);
  const A = { c: cs[0] }, B = { c: cs[1] }, C = { c: cs[2] };
  switch (Math.min(level, 6)) {
    case 0: return [A, B];
    case 1: return [A, A, B];
    case 2: return [A, B, B];
    case 3: return [A, B, C];
    case 4: return [A, A, B, B];
    case 5: return [{ c: cs[0], shape: 'heart' }, { c: cs[0], shape: 'star' }];
    default: return [{ c: cs[0], shape: 'star' }, { c: cs[1], shape: 'round' }, { c: cs[1], shape: 'heart' }];
  }
}

class BeadPuzzle {
  /* o: { title, mode: 'pattern'|'mirror'|'free'|'nest', who, unit, onDone(piece), kind: 'bracelet'|'necklace', order } */
  constructor(o) {
    Object.assign(this, { kind: 'bracelet' }, o);
    this.t = 0; this.wrongs = 0; this.graded = false; this.state = 'play';
    this.sel = 0; this.shape = 'round';
    this.stages = this.mode === 'nest' ? ['pattern', 'mirror'] : [this.mode];
    this.stage = 0;
    this.setup();
  }
  say(s, show) { return Talk.say(s, { show, who: this.who }); }
  setup() {
    const m = this.stages[this.stage];
    this.wrongs = 0;
    if (m === 'pattern') {
      const lv = this.mode === 'nest' ? 3 : Adapt.level('pattern');
      this.unit = patternUnit(lv, this.unit && this.stage === 0 ? this.unit : null);
      const total = this.unit.length >= 3 ? (this.unit.length === 3 ? 9 : 12) : 10;
      this.target = Array.from({ length: total }, (_, i) => this.unit[i % this.unit.length]);
      this.beads = this.target.slice(0, this.unit.length * 2);
      this.useShapes = this.unit.some(b => b.shape);
      const names = this.beads.map(beadSay).join(', ');
      this.prompt = `Here's the pattern: ${names}. What comes next? Keep the pattern going!`;
      this.show = 'Keep the pattern going!';
    } else if (m === 'mirror') {
      const n = this.mode === 'nest' ? 3 : Adapt.level('pattern') >= 3 ? 4 : 3;
      this.left = Array.from({ length: n }, () => ({ c: pick(TRAY_COLORS) }));
      this.beads = [];
      this.target = this.left.slice().reverse();
      this.useShapes = false;
      this.prompt = `Make a mirror charm! Make the right side match the left side, like a mirror. Start next to the charm in the middle.`;
      this.show = 'Make the right side match, like a mirror!';
    } else {
      this.beads = []; this.target = null; this.useShapes = true;
      this.prompt = 'Free style! Make anything you like. Click beads to add them. Press Tie it when you are done.';
      this.show = 'Make anything you like!';
    }
    this.say(this.prompt, this.show);
  }
  replay() { this.say(this.prompt, this.show); }
  nextNeeded() {
    const m = this.stages[this.stage];
    if (m === 'pattern') return this.target[this.beads.length];
    if (m === 'mirror') return this.target[this.beads.length];
    return null;
  }
  trayRects() {
    const out = [];
    const n = TRAY_COLORS.length, w = 82, gap = 14, total = n * w + (n - 1) * gap, x0 = VW / 2 - total / 2;
    TRAY_COLORS.forEach((c, i) => out.push({ x: x0 + i * (w + gap), y: PY + PH - 110, w, h: 82, c }));
    return out;
  }
  shapeRects() { return SHAPES.map((s, i) => ({ x: PX + 40, y: PY + 90 + i * 66, w: 70, h: 58, s })); }
  addBead(b) {
    if (this.pausing || this.state === 'done') return;
    const m = this.stages[this.stage];
    const need = this.nextNeeded();
    if (m === 'free') {
      if (this.beads.length >= 14) { this.say('The string is full! Press Tie it.'); return; }
      this.beads.push(b); Sfx.plink(this.beads.length % 8); Speech.say(beadSay(b), { rate: 1.1 });
      return;
    }
    if (beadEq(b, need)) {
      this.beads.push(b); Sfx.plink(this.beads.length % 8);
      FX.sparkle(this.beadPos(this.beads.length - 1).x, this.beadPos(this.beads.length - 1).y, 6);
      if (this.beads.length >= this.target.length) return this.stageDone();
      Speech.say(beadSay(b), { rate: 1.1 });
    } else {
      this.wrongs++;
      Sfx.boing();
      if (!this.graded && this.mode !== 'nest') { this.graded = true; Adapt.record('pattern', null, false, m); }
      if (m === 'pattern') {
        const back = this.beads.slice(-this.unit.length).map(beadSay).join(', ');
        this.say(this.wrongs >= 2 ? `The pattern goes ${this.unit.map(beadSay).join(', ')}, then again. We need ${beadSay(need)}. It's glowing!` : `Hmm, not ${beadSay(b)}. Say it with me: ${back}... what comes next?`);
      } else this.say(this.wrongs >= 2 ? `Look at the left side, closest to the charm. We need ${beadSay(need)}.` : `Not quite. A mirror matches. Look at the bead on the left that is the same distance from the charm.`);
    }
  }
  stageDone() {
    if (this.stage < this.stages.length - 1) {
      Sfx.chime(); FX.confetti(VW / 2, PY + 200, 30);
      this.say('Beautiful! Now the mirror charm part.');
      this.pausing = true;
      setTimeout(() => { this.saved = (this.saved || []).concat(this.beads); this.stage++; this.setup(); this.pausing = false; }, 1600);
      return;
    }
    if (!this.graded && this.mode !== 'nest') { this.graded = true; if (Adapt.record('pattern', null, true, this.stages[this.stage]) === 'up') this.up = true; }
    this.finishPiece();
  }
  finishPiece() {
    let beads = (this.saved || []).concat(this.stages[this.stage] === 'mirror' ? this.left.concat([{ c: 'yellow', shape: 'star' }], this.beads) : this.beads);
    const piece = { kind: this.kind, beads: beads.map(b => ({ c: b.c, shape: b.shape || 'round', letter: b.letter })), name: this.pieceName || this.title, order: this.order || null };
    if (this.mode !== 'nest') {
      S.jewelry.push(piece);
      if (S.jewelry.length > 30) S.jewelry.shift();
      S.wearJewel = S.jewelry.length - 1;
    }
    this.state = 'done'; this.piece = piece;
    if (this.mode !== 'free' && this.mode !== 'nest') { S.coins += 4; }
    Sfx.fanfare(); FX.confetti(VW / 2, PY + 200, 50);
    this.say(this.mode === 'nest' ? 'You tied it! A sparkly necklace, just for Coo!' : this.mode === 'free' ? `Gorgeous! You made a ${this.kind}. You're wearing it now!` : `You tied it! A beautiful ${this.kind}! You're wearing it now. Plus 4 coins!`);
    saveState();
  }
  beadPos(i) {
    const m = this.stages[this.stage];
    if (m === 'mirror') {
      const n = this.left.length, cx = VW / 2, gap = 60;
      return { x: cx + (i + 1) * gap, y: PY + 210 + Math.pow((i + 1) / (n + 1), 2) * 30 };
    }
    const n = (this.target || []).length || 14, gap = Math.min(58, 640 / n), x0 = VW / 2 - (n - 1) * gap / 2;
    const u = n > 1 ? i / (n - 1) : 0.5;
    return { x: x0 + i * gap, y: PY + 180 + Math.sin(u * Math.PI) * 50 };
  }
  update(dt) {
    this.t += dt;
    if (Input.clicked(CLOSE_BTN) || Input.key('escape')) { this.scene.close(); if (this.state === 'done' && this.onDone) this.onDone(this.piece); return; }
    if (Input.clicked(HEAR_BTN)) { this.replay(); return; }
    if (this.state === 'done') {
      if (this.okBtn || Input.key(' ') || Input.key('enter')) { this.scene.close(); if (this.onDone) this.onDone(this.piece); }
      return;
    }
    const tray = this.trayRects();
    if (Input.pressed('left')) { this.sel = (this.sel + tray.length - 1) % tray.length; Sfx.click(); Speech.say(tray[this.sel].c, { rate: 1.1 }); }
    if (Input.pressed('right')) { this.sel = (this.sel + 1) % tray.length; Sfx.click(); Speech.say(tray[this.sel].c, { rate: 1.1 }); }
    tray.forEach((r, i) => { if (Input.hover(r)) this.sel = i; });
    if (this.useShapes) {
      const sr = this.shapeRects();
      sr.forEach(r => { if (Input.clicked(r)) { this.shape = r.s; Sfx.click(); Speech.say(r.s); } });
      if (Input.pressed('up') || Input.pressed('down')) { const k = SHAPES.indexOf(this.shape); this.shape = SHAPES[(k + (Input.pressed('up') ? 3 : 1)) % 4]; Sfx.click(); Speech.say(this.shape); }
    }
    let chosen = null;
    tray.forEach(r => { if (Input.clicked(r)) chosen = r.c; });
    if (Input.key(' ')) chosen = tray[this.sel].c;
    if (chosen) this.addBead({ c: chosen, shape: this.useShapes ? this.shape : 'round' });
    // take off the last bead (free style only, or a mistake-free undo)
    const m = this.stages[this.stage];
    if (m === 'free') {
      if ((Input.key('backspace') || this.undoBtn) && this.beads.length) { this.beads.pop(); Sfx.click(); }
      if ((this.tieBtn || Input.key('enter')) && this.beads.length >= 3) this.finishPiece();
      else if (this.tieBtn) this.say('Add at least 3 beads first!');
      if (this.kindBtn) { this.kind = this.kind === 'bracelet' ? 'necklace' : 'bracelet'; Sfx.click(); Speech.say(this.kind); }
    }
  }
  draw() {
    drawPanelFrame(this.title, '#fff0f6', this.who);
    const m = this.stages[this.stage];
    // the string
    ctx.strokeStyle = '#c8a0b8'; ctx.lineWidth = 3;
    if (m === 'mirror') {
      ctx.beginPath(); ctx.moveTo(VW / 2 - 280, PY + 240); ctx.quadraticCurveTo(VW / 2, PY + 200, VW / 2 + 280, PY + 240); ctx.stroke();
      const n = this.left.length, gap = 60;
      this.left.forEach((b, i) => drawBead(b.c, VW / 2 - (n - i) * gap, PY + 210 + Math.pow((n - i) / (n + 1), 2) * 30, 22));
      drawBead('yellow', VW / 2, PY + 205, 26, { shape: 'star' });
      for (let i = 0; i < n; i++) {
        const p = this.beadPos(i);
        if (this.beads[i]) drawBead(this.beads[i].c, p.x, p.y, 22);
        else { circle(p.x, p.y, 22); ctx.setLineDash([5, 5]); paint(i === this.beads.length ? 'rgba(255,240,120,.6)' : null, 2.5, '#b8a0c0'); ctx.setLineDash([]); }
      }
      // mirror line
      ctx.setLineDash([6, 8]); ctx.strokeStyle = '#a66cff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(VW / 2, PY + 120); ctx.lineTo(VW / 2, PY + 300); ctx.stroke(); ctx.setLineDash([]);
    } else {
      const n = (this.target || []).length || 14;
      ctx.beginPath();
      for (let i = 0; i < n; i++) { const p = this.beadPos(i); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x - 30, p.y - 10); }
      ctx.stroke();
      for (let i = 0; i < n; i++) {
        const p = this.beadPos(i), b = this.beads[i];
        if (b) drawBead(b.c, p.x, p.y, 21, { shape: b.shape, letter: b.letter });
        else if (this.target) { circle(p.x, p.y, 19); ctx.setLineDash([5, 5]); paint(i === this.beads.length ? 'rgba(255,240,120,.7)' : null, 2.5, '#b8a0c0'); ctx.setLineDash([]); }
      }
      if (!this.target && !this.beads.length) text('Click beads to add them!', VW / 2, PY + 190, { size: 26, color: '#b07090', stroke: null });
    }
    if (this.state === 'done') {
      text(this.kind === 'necklace' ? 'A new necklace!' : 'A new bracelet!', VW / 2, PY + 330, { size: 44, color: '#ff5fa2', lw: 7 });
      drawHero(VW / 2, PY + PH - 20, { scale: 1.2, mazel: false });
      this.okBtn = button('OK!', VW / 2 + 230, PY + PH - 60, 160, 60, { color: '#8be06b', size: 28 });
      FX.draw(); return;
    }
    // shape picker
    if (this.useShapes) this.shapeRects().forEach(r => {
      const on = r.s === this.shape;
      rr(r.x, r.y, r.w, r.h, 12); paint(on ? '#fff6c8' : '#ffffff', on ? 4 : 2.5, on ? '#ff5fa2' : OUT);
      drawBead('purple', r.x + r.w / 2, r.y + r.h / 2, 16, { shape: r.s });
    });
    // tray
    const need = this.nextNeeded();
    this.trayRects().forEach((r, i) => {
      const sel = i === this.sel;
      const glow = need && this.wrongs >= 2 && need.c === r.c;
      if (glow) { ctx.globalAlpha = 0.5 + Math.sin(this.t * 8) * 0.35; rr(r.x - 8, r.y - 8, r.w + 16, r.h + 16, 20); paint('#fff07a', 0); ctx.globalAlpha = 1; }
      rr(r.x, r.y - (sel ? 4 : 0), r.w, r.h, 16); paint(sel ? '#fff6c8' : '#ffffff', sel ? 5 : 3, sel ? '#ff5fa2' : OUT);
      for (let k = 0; k < 3; k++) drawBead(r.c, r.x + 22 + k * 19, r.y + r.h / 2 - (sel ? 4 : 0) + (k % 2 ? 8 : -6), 12, { shape: this.useShapes ? this.shape : 'round' });
    });
    if (m === 'free') {
      this.tieBtn = button('Tie it!', PX + PW - 110, PY + 110, 150, 56, { color: '#ff8ac4', size: 26 });
      this.undoBtn = button('Take off', PX + PW - 110, PY + 180, 150, 48, { color: '#e0d8e8', size: 20 });
      this.kindBtn = button(this.kind === 'bracelet' ? 'Bracelet' : 'Necklace', PX + PW - 110, PY + 244, 150, 48, { color: '#bfe6ff', size: 20 });
    }
    FX.draw();
    Talk.strip();
  }
}

/* Count Necklace: strands of 10 beads plus single beads (count by tens, off the decade too). */
function drawStrand(x, y, s = 1, c = 'pink') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#c8a0b8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(0, 50); ctx.stroke();
  for (let k = 0; k < 10; k++) { circle(0, -45 + k * 10, 5); paint(k === 4 || k === 9 ? '#ffd23f' : BEAD_COLORS[c], 1.2); }
  ctx.restore();
}
function countNecklace(o) {
  return new Challenge(Object.assign({
    title: 'Count Necklace', skill: 'count10', count: 2, color: '#fff0f6', coins: 4,
    intro: 'Make a necklace with exactly the right number of beads! Each strand has ten.',
    make(level) {
      const n = o.target || (level <= 0 ? 10 * rint(2, 4) : level === 1 ? 10 * rint(1, 3) + 9 : rint(2, 6) * 10 + rint(1, 9));
      return {
        kind: 'build', answer: n, key: `neck${n}`, tensOnes: true,
        prompt: `Make a necklace with ${n} beads. Use strands of ten and single beads.`, show: `Make ${n} beads!`,
        goalText: `Beads: ${n}`, sendLabel: 'Tie it!', totalLabel: 'Beads',
        buttons: [
          { val: 10, label: 'Strand of 10', hot: 1, draw: (x, y, s) => drawStrand(x, y, s * 0.7) },
          { val: 1, label: '1 bead', hot: 2, draw: (x, y) => drawBead('purple', x, y, 14) },
        ],
        drawPlaced: (v, x, y) => v === 10 ? drawStrand(x, y, 1) : drawBead('purple', x, y, 14),
        countSay: placed => String(placed.reduce((a, b) => a + b, 0)),
        unitSay: tot => `You have ${tot} beads.`,
        hint2: () => `${Math.floor(n / 10)} strands of ten and ${n % 10} single beads.`,
        rightSay: `Count by tens: ${Array.from({ length: Math.floor(n / 10) }, (_, i) => (i + 1) * 10).join(', ')}${n % 10 ? `, then ${n % 10} more. ${n}!` : '!'}`,
      };
    },
    onDone(res, ch) {
      const it = ch && ch.solvedItems && ch.solvedItems[ch.solvedItems.length - 1];
      const strands = it ? it.placed.filter(v => v === 10).length : 2, singles = it ? it.placed.filter(v => v === 1).length : 3;
      const beads = [];
      for (let k = 0; k < strands; k++) for (let j = 0; j < 3; j++) beads.push({ c: j === 2 ? 'yellow' : 'pink', shape: 'round' });
      for (let k = 0; k < singles; k++) beads.push({ c: 'purple', shape: 'round' });
      const piece = { kind: 'necklace', beads: beads.slice(0, 14), name: `${it ? it.answer : ''} bead necklace`, order: o.order || null };
      S.jewelry.push(piece); S.wearJewel = S.jewelry.length - 1; saveState();
      if (o.after) o.after(piece);
    },
  }, o));
}

/* Name Beads: type a word or name and letter beads slide onto the string. */
function nameBeads(o) {
  return new Challenge(Object.assign({
    title: 'Name Beads', skill: 'type', count: o.word ? 1 : 3, color: '#fff0f6', coins: 4,
    intro: 'Type the letters, and letter beads slide onto the string!',
    make(level) {
      const w = o.word || freshWord(['star', 'shell', 'smile', 'ruby', 'theo', 'coo', 'gus', 'mazel', 'heart', 'fish', 'cake', 'frog', 'mom', 'dad']);
      const it = typeItem(level, w, { mode: o.word || !WORDS[w] ? 'copy' : undefined });
      if (!WORDS[w]) { it.mode = Adapt.level('type') >= 1 ? 'faded' : 'copy'; it.prompt = `Type ${w}. ${spellOut(w)}.`; it.show = `Type "${w}"`; }
      it.color = pick(TRAY_COLORS);
      it.drawArea = (ch, it2) => {
        const n = w.length, sp = 66, x0 = VW / 2 - (n - 1) * sp / 2, y = PY + 170;
        ctx.strokeStyle = '#c8a0b8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 - 60, y); ctx.lineTo(x0 + (n - 1) * sp + 60, y); ctx.stroke();
        for (let i = 0; i < n; i++) {
          const x = x0 + i * sp;
          if (i < it2.pos) drawBead(it2.color, x, y, 28, { letter: w[i] });
          else { circle(x, y, 26); ctx.setLineDash([5, 5]); paint(i === it2.pos ? 'rgba(255,240,120,.6)' : null, 2.5, '#b8a0c0'); ctx.setLineDash([]); if (it2.mode === 'copy' || it2.mode === 'faded') text(w[i], x, y, { size: 34, font: 'Andika', color: it2.mode === 'copy' ? '#a898b8' : 'rgba(150,130,170,.3)', stroke: null }); }
        }
      };
      it.rightSay = `${spellOut(w)}. ${w}!`;
      return it;
    },
    onDone(res, ch) {
      const items = (ch && ch.solvedItems) || [];
      const w = o.word || (items[items.length - 1] && items[items.length - 1].word) || 'star';
      const color = (items[items.length - 1] && items[items.length - 1].color) || 'pink';
      const piece = { kind: 'bracelet', beads: w.split('').map(c => ({ c: color, shape: 'round', letter: c })), name: `"${w}" beads`, order: o.order || null };
      S.jewelry.push(piece); S.wearJewel = S.jewelry.length - 1; saveState();
      if (o.after) o.after(piece);
    },
  }, o));
}

/* ---------- Orders from friends ---------- */
const ORDERS = {
  okafor: { npc: 'okafor', who: 'Ms. Okafor', ask: 'Could you make me a bracelet with a green, green, purple pattern? Green, green, purple!', mode: 'pattern', unit: [{ c: 'green' }, { c: 'green' }, { c: 'purple' }], reward: { coins: 12, say: 'I love it! Here are 12 coins for your detective fund.' } },
  gus: { npc: 'gus', who: 'Mr. Gus', ask: 'Could you make me a keychain that says G U S? Gus! With letter beads.', mode: 'name', word: 'gus', reward: { coins: 12, say: 'G U S! My name! Thank you, kiddo. Here are 12 coins.' } },
  stone: { npc: 'stone', who: 'Dr. Stone', ask: 'I need a fossil necklace with exactly 29 beads. Strands of ten, plus some singles!', mode: 'count', target: 29, reward: { coins: 15, say: 'Twenty nine! Ten, twenty, and nine more. Perfect! Here are 15 coins.' } },
  lena: { npc: 'lena', who: 'Coach Lena', ask: 'Could you make me a snowflake mirror charm? Both sides have to match!', mode: 'mirror', reward: { hat: 'beanie', coins: 10, say: 'Glide and smile! Here is a cozy winter hat for you, and 10 coins.' } },
  shapiro: { npc: 'shapiro', who: 'Mr. Shapiro', ask: 'Make me a necklace with 34 beads. Three strands of ten and four more!', mode: 'count', target: 34, reward: { coins: 15, say: 'Thirty four, just like a big bagel order! Here are 15 coins.' } },
  joy: { npc: 'joy', who: 'Conductor Joy', ask: 'Could you make me a train-color bracelet? Blue, yellow, green, then again!', mode: 'pattern', unit: [{ c: 'blue' }, { c: 'yellow' }, { c: 'green' }], reward: { outfit: 'conductor', say: 'All aboard! Here is your very own conductor uniform!' } },
  marisol: { npc: 'marisol', who: 'Captain Marisol', ask: 'Could you make me letter beads that spell shell? S H E L L.', mode: 'name', word: 'shell', reward: { coins: 12, say: 'Shell! The sea lions are clapping for you! Here are 12 coins.' } },
};
function orderState(id) { S.orders = S.orders || {}; return S.orders[id] || (S.orders[id] = { taken: false, made: false, given: false }); }
function startOrder(sc, id) {
  const o = ORDERS[id], st = orderState(id);
  const after = () => { st.made = true; saveState(); Talk.say(`You made it! Now go give it to ${o.who}.`); };
  const who = { face: personFace(NPC_LOOKS[o.npc]) };
  if (o.mode === 'pattern') sc.open(new BeadPuzzle({ title: `Order for ${o.who}`, mode: 'pattern', unit: o.unit, who, order: id, onDone: after }));
  else if (o.mode === 'mirror') sc.open(new BeadPuzzle({ title: `Order for ${o.who}`, mode: 'mirror', who, order: id, onDone: after }));
  else if (o.mode === 'count') sc.open(countNecklace({ title: `Order for ${o.who}`, target: o.target, count: 1, who, order: id, after }));
  else if (o.mode === 'name') sc.open(nameBeads({ title: `Order for ${o.who}`, word: o.word, who, order: id, after }));
}
/* Called from an NPC conversation. Returns true if an order took over the conversation. */
function orderTalk(sc, npc) {
  const id = npc.order;
  if (!id || !ORDERS[id] || !pastStep('ruby') || (npc.step && !pastStep(npc.step))) return false;
  const o = ORDERS[id], st = orderState(id);
  if (st.given) return false;
  if (!st.taken) { st.taken = true; saveState(); npc.say(`${o.ask} Make it in the Sparkle Studio. Press J to open it.`); return true; }
  if (st.made) {
    st.given = true; S.gifts[npc.id] = true;
    const r = o.reward;
    if (r.coins) S.coins += r.coins;
    if (r.hat && !S.owned.includes('hat:' + r.hat)) S.owned.push('hat:' + r.hat);
    if (r.outfit && !S.owned.includes('outfit:' + r.outfit)) S.owned.push('outfit:' + r.outfit);
    Sfx.fanfare(); FX.hearts(npc.cx(), npc.cy() - 40, 8); FX.confetti(npc.cx(), npc.cy() - 40, 30);
    npc.say(r.say);
    saveState();
    return true;
  }
  return false;
}

/* ---------- Studio menu ---------- */
class StudioOverlay {
  constructor() {
    this.t = 0;
    this.say("Welcome to the Sparkle Studio! What do you want to make?");
  }
  say(s, show) { return Talk.say(s, { show, who: { face: personFace(NPC_LOOKS.ruby) } }); }
  replay() { this.say('What do you want to make? Click a picture!'); }
  items() {
    const open = Object.keys(ORDERS).filter(id => { const st = orderState(id); return st.taken && !st.made; });
    return [
      { id: 'pattern', label: 'Pattern Bracelet', say: 'Pattern bracelet' },
      { id: 'mirror', label: 'Mirror Charm', say: 'Mirror charm' },
      { id: 'count', label: 'Count Necklace', say: 'Count necklace' },
      { id: 'name', label: 'Name Beads', say: 'Name beads. Type letters!' },
      { id: 'free', label: 'Free Style', say: 'Free style. Make anything!' },
      { id: 'box', label: 'Jewelry Box', say: 'Your jewelry box' },
    ].concat(open.map(id => ({ id: 'order:' + id, label: `Order: ${ORDERS[id].who}`, say: `An order for ${ORDERS[id].who}`, order: true })));
  }
  rects() {
    return this.items().map((it, i) => {
      if (i < 6) return { x: PX + 50 + (i % 3) * 260, y: PY + 80 + Math.floor(i / 3) * 132, w: 240, h: 120 };
      const k = i - 6;
      return { x: PX + 50 + (k % 3) * 260, y: PY + 352 + Math.floor(k / 3) * 54, w: 240, h: 46 };
    });
  }
  update(dt) {
    this.t += dt;
    const sc = this.scene;
    if (Input.clicked(CLOSE_BTN) || Input.key('escape')) { sc.close(); return; }
    if (Input.clicked(HEAR_BTN)) { this.replay(); return; }
    const items = this.items(), rects = this.rects();
    this.sel = this.sel || 0;
    if (Input.pressed('right')) { this.sel = (this.sel + 1) % items.length; Sfx.click(); Speech.say(items[this.sel].say); }
    if (Input.pressed('left')) { this.sel = (this.sel + items.length - 1) % items.length; Sfx.click(); Speech.say(items[this.sel].say); }
    if (Input.pressed('down')) { this.sel = Math.min(items.length - 1, this.sel + 3); Sfx.click(); Speech.say(items[this.sel].say); }
    if (Input.pressed('up')) { this.sel = Math.max(0, this.sel - 3); Sfx.click(); Speech.say(items[this.sel].say); }
    rects.forEach((r, i) => { if (Input.hover(r) && this.sel !== i) { this.sel = i; Speech.say(items[i].say); } });
    let chosen = -1;
    rects.forEach((r, i) => { if (Input.clicked(r)) chosen = i; });
    if (Input.key(' ') || Input.key('enter')) chosen = this.sel;
    if (chosen < 0) return;
    const id = items[chosen].id;
    const ruby = { face: personFace(NPC_LOOKS.ruby) };
    const back = () => {};
    if (id === 'pattern') sc.open(new BeadPuzzle({ title: 'Pattern Bracelet', mode: 'pattern', who: ruby, onDone: back }));
    else if (id === 'mirror') sc.open(new BeadPuzzle({ title: 'Mirror Charm', mode: 'mirror', who: ruby, kind: 'necklace', onDone: back }));
    else if (id === 'free') sc.open(new BeadPuzzle({ title: 'Free Style', mode: 'free', who: ruby, onDone: back }));
    else if (id === 'count') sc.open(countNecklace({ who: ruby }));
    else if (id === 'name') sc.open(nameBeads({ who: ruby }));
    else if (id === 'box') sc.open(new JewelryBox());
    else if (id.startsWith('order:')) startOrder(sc, id.slice(6));
  }
  draw() {
    drawPanelFrame('Sparkle Studio', '#fff0f6', { face: personFace(NPC_LOOKS.ruby) });
    const items = this.items();
    this.rects().forEach((r, i) => {
      const it = items[i], sel = i === this.sel;
      rr(r.x, r.y + 5, r.w, r.h, 18); paint('rgba(0,0,0,.15)', 0);
      rr(r.x, r.y - (sel ? 3 : 0), r.w, r.h, 18); paint(it.order ? '#fff6c8' : sel ? '#ffe4f0' : '#ffffff', sel ? 5 : 3, sel ? '#ff5fa2' : OUT);
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2 - 14 - (sel ? 3 : 0);
      if (!it.order) {
        if (it.id === 'pattern') ['pink', 'blue', 'pink', 'blue', 'pink'].forEach((c, k) => drawBead(c, cx - 64 + k * 32, cy, 13));
        else if (it.id === 'mirror') { ['green', 'pink'].forEach((c, k) => drawBead(c, cx - 60 + k * 30, cy, 12)); drawBead('yellow', cx, cy, 15, { shape: 'star' }); ['pink', 'green'].forEach((c, k) => drawBead(c, cx + 30 + k * 30, cy, 12)); }
        else if (it.id === 'count') { drawStrand(cx - 30, cy, 0.5); drawStrand(cx, cy, 0.5); drawBead('purple', cx + 30, cy, 8); drawBead('purple', cx + 46, cy, 8); }
        else if (it.id === 'name') ['s', 't', 'a', 'r'].forEach((c, k) => drawBead('pink', cx - 48 + k * 32, cy, 14, { letter: c }));
        else if (it.id === 'free') [['blue', 'heart'], ['yellow', 'star'], ['green', 'cube'], ['purple', 'round']].forEach(([c, s], k) => drawBead(c, cx - 48 + k * 32, cy, 13, { shape: s }));
        else { rr(cx - 40, cy - 22, 80, 44, 8); paint('#c86a9a', 3); rr(cx - 40, cy - 22, 80, 14, 6); paint('#e88abb', 2); }
      }
      text(it.label, cx, r.y + r.h - (it.order ? 28 : 26) - (sel ? 3 : 0), { size: it.order ? 18 : 22, color: OUT, stroke: null });
    });
    Talk.strip();
  }
}

/* Jewelry Box: pick what to wear. */
class JewelryBox {
  constructor() { this.t = 0; Talk.say(S.jewelry.length ? 'Click a piece to wear it!' : 'Your jewelry box is empty. Make something in the studio!'); }
  replay() { Talk.say('Click a piece to wear it!'); }
  rects() { return S.jewelry.slice(-15).map((p, i) => ({ x: PX + 40 + (i % 5) * 160, y: PY + 84 + Math.floor(i / 5) * 120, w: 148, h: 108 })); }
  update() {
    if (Input.clicked(CLOSE_BTN) || Input.key('escape')) { this.scene.close(); return; }
    if (Input.clicked(HEAR_BTN)) this.replay();
    const off = Math.max(0, S.jewelry.length - 15);
    this.rects().forEach((r, i) => { if (Input.clicked(r)) { S.wearJewel = (S.wearJewel === i + off) ? null : i + off; Sfx.sparkle(); Talk.say(S.wearJewel == null ? 'Taken off.' : `You're wearing your ${S.jewelry[i + off].kind}!`); saveState(); } });
  }
  draw() {
    drawPanelFrame('Jewelry Box', '#fff0f6');
    const off = Math.max(0, S.jewelry.length - 15);
    this.rects().forEach((r, i) => {
      const p = S.jewelry[i + off], on = S.wearJewel === i + off;
      rr(r.x, r.y, r.w, r.h, 14); paint(on ? '#fff6c8' : '#ffffff', on ? 5 : 3, on ? '#ff5fa2' : OUT);
      const n = Math.min(10, p.beads.length);
      for (let k = 0; k < n; k++) { const a = Math.PI * (0.1 + 0.8 * k / Math.max(1, n - 1)); const b = p.beads[k]; drawBead(b.c, r.x + r.w / 2 - Math.cos(a) * 52, r.y + 30 + Math.sin(a) * 34, 9, { shape: b.shape, letter: b.letter }); }
      text(on ? 'wearing' : p.kind, r.x + r.w / 2, r.y + r.h - 14, { size: 16, color: OUT, stroke: null });
    });
    drawHero(PX + PW - 90, PY + PH - 30, { scale: 1.3, mazel: false });
  }
}
