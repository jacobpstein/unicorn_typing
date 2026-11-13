'use strict';

/*
  Mazel's Speed Arcade (in the bodega): optional 1-minute fluency rounds, like the timed Acadience measures.
  Four answers sit in a row; each arrow key picks one (← ↑ ↓ →), so speed never depends on steering.
*/

const SPEED_GAMES = [
  { id: 'letters', name: 'Letter Dash', icon: 'b d', color: '#2f6fe0', measure: 'Letter Names', gen: () => GEN.letterName(Math.max(2, Ac.st('letterName').level)) },
  { id: 'silly', name: 'Silly Word Dash', icon: 'zib', color: '#e8384f', measure: 'Nonsense Words', gen: () => GEN.nonsense(Math.max(2, Ac.st('nonsense').level)) },
  { id: 'numbers', name: 'Number Dash', icon: '47', color: '#3a8a5a', measure: 'Number ID', gen: () => GEN.numberId(Math.max(3, Ac.st('numberId').level)) },
  { id: 'count', name: 'Count Dash', icon: '9,19', color: '#ff8a1f', measure: 'Missing Number & Patterns', gen: () => pick([() => GEN.pattern(Ac.st('pattern').level), () => GEN.nextNum(3), () => GEN.missingNum(3)])() },
  { id: 'facts', name: 'Fact Dash', icon: '3+4', color: '#b07cff', measure: 'Computation', gen: () => GEN.compute(1) },
];
const SPEED_KEYS = [['arrowleft', '←'], ['arrowup', '↑'], ['arrowdown', '↓'], ['arrowright', '→']];

function fillTo4(item) {
  const ch = item.choices.slice();
  const kind = ch[0].kind;
  const have = v => ch.some(c => String(c.val) === String(v));
  for (let i = 0; i < 40 && ch.length < 4; i++) {
    let v;
    if (kind === 'letter') v = pick(LETTERS);
    else if (kind === 'word') { const w = String(item.answer); const k = rint(0, w.length - 1); v = w.slice(0, k) + pick('aeioubdmnpst'.split('')) + w.slice(k + 1); }
    else v = Number(item.answer) + pick([-3, -2, 2, 3, 11, -11]);
    if (v !== undefined && (typeof v !== 'number' || v >= 0) && !have(v)) ch.push({ val: v, kind });
  }
  item.choices = shuffle(ch).slice(0, 4);
  if (!item.choices.some(c => String(c.val) === String(item.answer))) item.choices[0] = { val: item.answer, kind };
  return item;
}

class SpeedScene {
  constructor() {
    this.talkBottom = true;
    this.t = 0; this.sel = 0; this.mode = 'menu';
    S.speed = S.speed || {};
    Music.play('map');
    Talk.say("Mazel's Speed Arcade! Pick a game. You get one minute. Press an arrow key to answer. Try to beat your best score!");
  }
  update(dt) {
    this.t += dt; Talk.update(dt);
    if (this.mode === 'menu') {
      if (Input.pressed('left')) { this.sel = (this.sel + SPEED_GAMES.length - 1) % SPEED_GAMES.length; Sfx.click(); Talk.say(SPEED_GAMES[this.sel].name); }
      if (Input.pressed('right')) { this.sel = (this.sel + 1) % SPEED_GAMES.length; Sfx.click(); Talk.say(SPEED_GAMES[this.sel].name); }
      if (Input.key(' ') || Input.key('enter')) { this.game = SPEED_GAMES[this.sel]; this.mode = 'count'; this.ct = 3.4; Speech.stop(); Sfx.click(); }
      if (Input.pressed('pause')) Game.go(new TownScene('town', { x: 22, y: 37 }));
      return;
    }
    if (this.mode === 'count') {
      const before = Math.ceil(this.ct);
      this.ct -= dt;
      if (Math.ceil(this.ct) !== before && this.ct > 0) Sfx.plink(4 - Math.ceil(this.ct));
      if (this.ct <= 0) {
        this.mode = 'play'; this.time = 60; this.right = 0; this.tries = 0;
        const sh = shopState();
        if (sh.tickets > 0) { sh.tickets--; this.time = 90; this.bonus = true; saveState(); Talk.say('Arcade ticket! You get thirty more seconds!'); } else this.bonus = false;
        this.total = this.time;
        this.next(); Sfx.chime();
      }
      return;
    }
    if (this.mode === 'play') {
      this.time -= dt;
      this.flash = Math.max(0, (this.flash || 0) - dt);
      if (Input.pressed('replay')) Talk.say(this.item.prompt);
      if (Input.pressed('pause')) { this.mode = 'menu'; Speech.stop(); return; }
      if (this.wait > 0) { this.wait -= dt; if (this.wait <= 0) this.next(); }
      else SPEED_KEYS.forEach(([k], i) => { if (Input.key(k)) this.pick(i); });
      if (this.time <= 0) this.finish();
      return;
    }
    if (this.mode === 'done') {
      if (this.t - this.doneT > 1.5 && (Input.key(' ') || Input.key('enter'))) { this.mode = 'menu'; Sfx.click(); }
      if (Input.pressed('pause')) Game.go(new TownScene('town', { x: 22, y: 37 }));
    }
  }
  next() {
    this.item = fillTo4(this.game.gen());
    this.item.t0 = performance.now();
    this.result = null;
    const short = this.item.card.kind === 'listen' ? this.item.prompt.replace(/^Here is a silly made-up word: .*?Find /, 'Find ') : this.item.show;
    Talk.say(this.item.card.kind === 'listen' ? short : '', { show: this.item.show });
    if (this.item.card.kind !== 'listen') Speech.stop();
  }
  pick(i) {
    const c = this.item.choices[i];
    if (!c) return;
    this.tries++;
    const ok = String(c.val) === String(this.item.answer);
    if (ok) { this.right++; Sfx.coin(); this.result = { i, ok }; this.wait = 0.25; }
    else { Sfx.boing(); this.result = { i, ok, right: this.item.choices.findIndex(x => String(x.val) === String(this.item.answer)) }; this.wait = 0.9; }
  }
  finish() {
    this.mode = 'done'; this.doneT = this.t;
    const rec = S.speed[this.game.id] || (S.speed[this.game.id] = { best: 0, hist: [] });
    // scores are per minute, so a bonus-time round (arcade ticket) stays fair
    const perMin = Math.round(this.right * 60 / (this.total || 60));
    const newBest = perMin > rec.best;
    rec.best = Math.max(rec.best, perMin);
    rec.hist.push({ d: new Date().toISOString().slice(0, 10), right: perMin, tries: this.tries, sec: this.total || 60 });
    if (rec.hist.length > 30) rec.hist.shift();
    S.coins += this.right;
    saveState();
    Sfx.fanfare();
    const howLong = this.bonus ? 'with your bonus time' : 'in one minute';
    Talk.say(newBest ? `New best score! ${this.right} right ${howLong}! Woo hoo!` : `${this.right} right ${howLong}! Your best is ${rec.best} a minute.`);
  }
  draw() {
    drawBackground('street', this.t * 20, 0, this.t);
    ctx.fillStyle = 'rgba(30,15,50,.55)'; ctx.fillRect(0, 0, VW, VH);
    if (this.mode === 'menu') {
      text("Mazel's Speed Arcade", VW / 2, 60, { size: 44, color: '#ffd23f', lw: 8 });
      SPEED_GAMES.forEach((g, i) => {
        const x = 110 + i * 185, y = 250, sel = i === this.sel;
        rr(x - 80, y - 100, 160, 200, 22); paint(sel ? '#fff6c8' : 'rgba(255,250,240,.85)', sel ? 6 : 3, sel ? '#ff5fa2' : OUT);
        rr(x - 56, y - 76, 112, 80, 14); paint(g.color, 3);
        text(g.icon, x, y - 36, { size: 32, font: 'Andika', color: '#fff', lw: 5 });
        text(g.name, x, y + 30, { size: 18, color: OUT, stroke: null });
        const best = S.speed[g.id] ? S.speed[g.id].best : 0;
        text(`Best: ${best}`, x, y + 66, { size: 18, color: '#c47a10', stroke: null });
      });
      drawKey('SPACE', VW / 2, 440, '#8be06b', 120);
      text('Esc = back to town', VW / 2, 490, { size: 16, color: '#fff', lw: 3 });
    } else if (this.mode === 'count') {
      text(this.game.name, VW / 2, 140, { size: 44, color: '#ffd23f', lw: 8 });
      text(String(Math.max(1, Math.ceil(this.ct))), VW / 2, 300, { size: 140, color: '#fff', lw: 12 });
    } else if (this.mode === 'play' || this.mode === 'done') {
      if (this.mode === 'play') {
        drawCard(this.item, {});
        const n = this.item.choices.length;
        this.item.choices.forEach((c, i) => {
          const x = VW / 2 + (i - (n - 1) / 2) * 200, y = 320;
          const r = this.result, hot = r && (r.i === i || r.right === i);
          const col = !r ? '#6a5ad0' : r.ok && r.i === i ? '#8be06b' : r.right === i ? '#8be06b' : r.i === i ? '#ff8a9a' : '#6a5ad0';
          rr(x - 80, y - 70, 160, 140, 24); paint(c.kind === 'word' || c.kind === 'pic' ? (hot ? col : '#fffaf0') : col, hot ? 6 : 4);
          drawChoice(c, x, y - 6, 1.2);
          drawKey(SPEED_KEYS[i][1], x, y + 100, '#fffaf0', 48);
        });
        // timer bar
        rr(VW / 2 - 300, 186, 600, 18, 9); paint('rgba(255,255,255,.2)', 3);
        rr(VW / 2 - 300, 186, 600 * clamp(this.time / this.total, 0, 1), 18, 9); paint(this.time < 10 ? '#ff8a9a' : '#ffd23f', 0);
        text(`★ ${this.right}`, VW / 2 + 350, 195, { size: 26, color: '#ffd23f', lw: 5 });
      } else {
        rr(VW / 2 - 230, 110, 460, 300, 30); paint('#fffaf0', 5);
        text(this.game.name, VW / 2, 160, { size: 34, color: OUT, stroke: null });
        text(String(this.right), VW / 2, 260, { size: 110, color: '#ff5fa2', lw: 8 });
        text('right in one minute!', VW / 2, 330, { size: 24, color: OUT, stroke: null });
        text(`Best: ${S.speed[this.game.id].best}`, VW / 2, 370, { size: 22, color: '#c47a10', stroke: null });
        if (this.t - this.doneT > 1.5) drawKey('SPACE', VW / 2, 450, '#8be06b', 120);
      }
    }
    Talk.draw();
  }
}
