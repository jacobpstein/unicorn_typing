'use strict';

/*
  The challenge panel. One Challenge = 3–5 items from one generator.
  Item kinds: 'choice' (click/arrow a picture, number, cubby or fish), 'tiles' (build a word from tiles),
  'type' (forgiving typing with an on-screen keyboard), 'build' (bags of ten + singles, or coins), 'magic' (magic e).
  Hint ladder on every item: miss 1 → the wrong piece speaks + prompt again; miss 2 → right answer glows; miss 3 → Mazel points.
  Only the first try is graded. Nothing is ever taken away.
*/

const PX = 50, PY = 60, PW = 860, PH = 466;   // panel rectangle
const CLOSE_BTN = { x: PX + PW - 54, y: PY + 10, w: 44, h: 44 };
const HEAR_BTN = { x: PX + PW - 108, y: PY + 10, w: 44, h: 44 };

function drawPanelFrame(title, color = '#fffaf0', who = null) {
  ctx.fillStyle = 'rgba(20,10,30,.55)'; ctx.fillRect(0, 0, VW, VH);
  rr(PX, PY + 6, PW, PH, 26); paint('rgba(0,0,0,.25)', 0);
  rr(PX, PY, PW, PH, 26); paint(color, 5);
  rr(PX, PY, PW, 64, 26); paint(shade(color, -0.08), 0);
  ctx.fillStyle = shade(color, -0.08); ctx.fillRect(PX + 3, PY + 40, PW - 6, 24);
  ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(PX, PY + 64); ctx.lineTo(PX + PW, PY + 64); ctx.stroke();
  if (who && who.face) who.face(PX + 40, PY + 32, 22);
  text(title, PX + (who ? 76 : 28), PY + 33, { size: 26, color: OUT, stroke: null, align: 'left' });
  // hear-again + close
  const hh = Input.hover(HEAR_BTN);
  drawSpeaker(HEAR_BTN.x + 22, HEAR_BTN.y + 22, hh || Speech.speaking);
  const ch = Input.hover(CLOSE_BTN);
  circle(CLOSE_BTN.x + 22, CLOSE_BTN.y + 22, 22); paint(ch ? '#ffb3b3' : '#fffaf0', 3);
  ctx.strokeStyle = OUT; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath();
  ctx.moveTo(CLOSE_BTN.x + 14, CLOSE_BTN.y + 14); ctx.lineTo(CLOSE_BTN.x + 30, CLOSE_BTN.y + 30);
  ctx.moveTo(CLOSE_BTN.x + 30, CLOSE_BTN.y + 14); ctx.lineTo(CLOSE_BTN.x + 14, CLOSE_BTN.y + 30); ctx.stroke();
}

/* Big word in Andika with red vowels and blue consonants. */
function drawWord(word, cx, cy, size = 54, o = {}) {
  const sp = size * 0.62;
  const chars = word.split('');
  const x0 = cx - (chars.length - 1) * sp / 2;
  chars.forEach((c, i) => {
    const hidden = o.hide && o.hide(i);
    if (hidden) { rr(x0 + i * sp - sp * 0.35, cy + size * 0.36, sp * 0.7, 6, 3); paint(o.blankColor || '#ffb02e', 0); if (o.q) text('?', x0 + i * sp, cy, { size, color: '#ffb02e', lw: 6 }); return; }
    text(c, x0 + i * sp, cy, { size, font: 'Andika', color: o.color || ('aeiou'.includes(c) ? '#e8384f' : '#2f6fe0'), stroke: o.stroke === undefined ? '#fffaf0' : o.stroke, lw: 6, alpha: o.alpha || 1 });
  });
}

/* A row of numbers with blanks; ones digits teal, tens digits orange. */
function drawNumberRow(seq, blankIdx, cx, cy, o = {}) {
  const n = seq.length, gap = o.gap || 118, x0 = cx - (n - 1) * gap / 2;
  seq.forEach((v, i) => {
    const x = x0 + i * gap;
    rr(x - 48, cy - 40, 96, 80, 14); paint(i === blankIdx ? '#fff6c8' : '#fffaf0', 3);
    if (i < n - 1 && o.step) text((o.step > 0 ? '+' : '−') + Math.abs(o.step), x + gap / 2, cy - 54, { size: 18, color: o.showStep ? '#ff8a1f' : 'rgba(0,0,0,0)', stroke: null });
    if (i === blankIdx) { text(o.filled != null ? String(o.filled) : '?', x, cy + 2, { size: 46, color: o.filled != null ? '#3a9a5a' : '#ffb02e', stroke: null }); return; }
    const s = String(v);
    if (s.length >= 2 && o.colorDigits !== false) {
      const tens = s.slice(0, -1), ones = s.slice(-1);
      const w1 = textW(tens, 46), w2 = textW(ones, 46);
      text(tens, x - w2 / 2, cy + 2, { size: 46, color: '#ff8a1f', stroke: null });
      text(ones, x + w1 / 2, cy + 2, { size: 46, color: '#1ca8a0', stroke: null });
    } else text(s, x, cy + 2, { size: 46, color: o.colorDigits !== false ? '#1ca8a0' : OUT, stroke: null });
  });
}

class Challenge {
  /*
    o: { title, who, color, skill, count, make(level, i) → item, intro, onDone(stats), coins, theme, ending }
  */
  constructor(o) {
    Object.assign(this, { count: 4, color: '#fffaf0', coins: 5 }, o);
    this.i = 0; this.firstRight = 0; this.t = 0; this.state = 'intro'; this.wait = 0;
    this.typing = false;
    this.next();
    const intro = (this.intro ? this.intro + ' ' : '') + this.item.prompt;
    this.say(intro, this.item.show);
  }
  say(str, show) { return Talk.say(str, { show, who: this.who }); }
  replay() { if (this.item) this.say(this.item.prompt, this.item.show); }

  next() {
    const lv = Adapt.level(this.skill);
    const due = Adapt.due(this.skill);
    this.item = due || this.make(lv, this.i);
    this.item.level = this.item.level ?? lv;
    this.item.wrongs = 0; this.item.graded = false; this.item.sel = 0; this.item.t = 0;
    this.item.solved = false; this.item.buf = '';
    if (this.item.choices) { this.item.choices.forEach(c => { c.dim = false; c.shake = 0; }); if (this.item.isRetry) this.item.choices = shuffle(this.item.choices); }
    this.typing = this.item.kind === 'type';
    Input.typing = this.typing;
    if (this.item.kind === 'type') this.initType(this.item);
    if (this.item.kind === 'tiles') this.initTiles(this.item);
    if (this.item.kind === 'build') this.item.placed = [];
    if (this.item.kind === 'magic') this.item.phase = 0;
    this.state = 'ask';
  }

  grade(right, val) {
    const it = this.item;
    if (!it.graded) {
      it.graded = true;
      const ev = Adapt.record(this.skill, it, right, it.key || it.answer);
      if (right) this.firstRight++;
      if (ev === 'up') this.levelUp = true;
    }
    if (right) return this.solve();
    it.wrongs++;
    Sfx.boing();
    if (it.wrongs === 1) this.say(it.hint1 ? it.hint1(val) : `Hmm, not that one. ${it.prompt}`, it.show);
    else if (it.wrongs === 2) this.say(it.hint2 ? it.hint2(val) : `Think about it one more time. ${it.prompt}`, it.show);
    else this.say(`Mrrp! I made the right one glow. You can do it!`);
  }
  /* Finished a built word: graded right only if there were no slips. */
  complete(it) {
    if (!it.graded) {
      it.graded = true;
      if (Adapt.record(this.skill, it, true, it.key || it.word) === 'up') this.levelUp = true;
      this.firstRight++;
    }
    this.solve();
  }
  solve() {
    const it = this.item;
    it.solved = true;
    this.state = 'between';
    Sfx.chime();
    FX.confetti(VW / 2, PY + 200, 26);
    const cheer = it.wrongs ? pick(['You got it!', 'There it is!', 'Nice work!']) : pick(['Yes!', 'Great job!', 'Super!', 'Wow!', 'Perfect!']);
    if (!it.wrongs) { S.coins++; FX.pop(VW / 2, PY + 120, '+1', '#ffd23f'); Sfx.coin(); }
    if (it.word && !S.stickers.includes(it.word)) S.stickers.push(it.word);
    (this.solvedItems = this.solvedItems || []).push(it);
    const fin = () => { if (this.state === 'between') this.advance(); };
    this.say(`${cheer} ${it.rightSay || ''}`).then(() => setTimeout(fin, 350));
    this.wait = 3.5 + (it.rightSay || '').length * 0.07;
  }
  advance() {
    this.i++;
    if (this.i >= this.count) return this.finish();
    this.next();
    this.say(this.item.prompt, this.item.show);
  }
  finish() {
    this.state = 'done';
    Input.typing = false; this.typing = false;
    const bonus = this.coins;
    S.coins += bonus;
    Sfx.fanfare(); FX.confetti(VW / 2, PY + 160, 60);
    const line = this.levelUp ? `You did it! And you are getting stronger at ${SKILL_NAMES[this.skill].toLowerCase()}!` : 'You did it! Great detective work!';
    this.say(`${line} Here are ${bonus} coins!`, `You did it! +${bonus} coins`);
    saveState();
  }

  update(dt) {
    this.t += dt;
    const it = this.item;
    if (it) it.t += dt;
    if (Input.clicked(CLOSE_BTN) || Input.key('escape')) { this.quit(); return; }
    if (Input.clicked(HEAR_BTN) || (Input.key('enter') && this.state === 'ask' && it.kind === 'type')) { this.replay(); return; }
    if (this.state === 'between') { this.wait -= dt; if (this.wait <= 0) this.advance(); return; }
    if (this.state === 'done') {
      if (this.doneBtn || Input.key(' ') || Input.key('enter')) this.close(true);
      return;
    }
    if (this.state !== 'ask') return;
    switch (it.kind) {
      case 'choice': this.updateChoice(it); break;
      case 'tiles': this.updateTiles(it); break;
      case 'type': this.updateType(it, dt); break;
      case 'build': this.updateBuild(it); break;
      case 'magic': this.updateMagic(it); break;
    }
  }
  quit() { Talk.say('Okay! Come back any time.'); this.close(false); }
  close(done) {
    const sc = this.scene;
    sc.close();
    if (done && this.onDone) this.onDone({ right: this.firstRight, of: this.count }, this);
  }

  /* ----- choice ----- */
  choiceRects(it) {
    const n = it.choices.length, w = it.cw || (n > 3 ? 170 : 200), h = it.ch || 130, gap = 26;
    const total = n * w + (n - 1) * gap, x0 = VW / 2 - total / 2, y = it.cy || (PY + PH - h - 34);
    return it.choices.map((c, i) => ({ x: x0 + i * (w + gap), y, w, h }));
  }
  updateChoice(it) {
    const rects = this.choiceRects(it);
    if (Input.pressed('left')) { it.sel = (it.sel + it.choices.length - 1) % it.choices.length; Sfx.click(); this.sayChoice(it.choices[it.sel]); }
    if (Input.pressed('right')) { it.sel = (it.sel + 1) % it.choices.length; Sfx.click(); this.sayChoice(it.choices[it.sel]); }
    rects.forEach((r, i) => { if (Input.hover(r) && it.sel !== i) { it.sel = i; this.sayChoice(it.choices[i]); } });
    let chosen = -1;
    rects.forEach((r, i) => { if (Input.clicked(r)) chosen = i; });
    if (Input.key(' ') || Input.key('enter')) chosen = it.sel;
    // typing digits picks a number choice
    if (it.numeric) for (const k of Input.typed) if (/\d/.test(k)) {
      it.buf = ((it.buf || '') + k).slice(-3);
      const m = it.choices.findIndex(c => String(c.val) === it.buf);
      if (m >= 0) { chosen = m; it.buf = ''; }
      else if (it.buf.length >= String(it.answer).length) { const v = +it.buf; it.buf = ''; this.grade(false, v); return; }
    }
    if (chosen < 0) return;
    const c = it.choices[chosen];
    if (c.dim) return;
    if (String(c.val) === String(it.answer)) this.grade(true, c.val);
    else { c.shake = 1; if (it.wrongs >= 2) c.dim = true; this.grade(false, c.val); }
  }
  sayChoice(c) { if (c && c.say) Speech.say(c.say, { rate: 1 }); }
  drawChoices(it) {
    const rects = this.choiceRects(it);
    rects.forEach((r, i) => {
      const c = it.choices[i];
      c.shake = Math.max(0, (c.shake || 0) - 1 / 30);
      const sx = c.shake ? Math.sin(this.t * 50) * 6 * c.shake : 0;
      const glow = it.wrongs >= 3 && String(c.val) === String(it.answer);
      const sel = i === it.sel;
      ctx.save(); ctx.translate(sx, 0);
      if (glow) { ctx.globalAlpha = 0.6 + Math.sin(this.t * 8) * 0.3; rr(r.x - 10, r.y - 10, r.w + 20, r.h + 20, 24); paint('#fff07a', 0); ctx.globalAlpha = 1; }
      ctx.globalAlpha = c.dim ? 0.35 : 1;
      if (c.draw) c.draw(r.x + r.w / 2, r.y + r.h / 2, r, sel, this.t);
      else {
        rr(r.x, r.y + 5, r.w, r.h, 18); paint('rgba(0,0,0,.18)', 0);
        rr(r.x, r.y + (sel ? -3 : 0), r.w, r.h, 18); paint(sel ? '#fff6c8' : '#ffffff', sel ? 5 : 3, sel ? '#ff5fa2' : OUT);
        const cy = r.y + r.h / 2 + (sel ? -3 : 0);
        if (c.pic) drawPic(c.pic, r.x + r.w / 2, cy, Math.min(r.w, r.h) - 22);
        else text(String(c.label ?? c.val), r.x + r.w / 2, cy, { size: c.size || 48, font: c.font || 'Andika', color: c.color || OUT, stroke: null });
      }
      ctx.restore();
    });
    if (it.numeric && it.buf) text(`typing: ${it.buf}`, VW / 2, PY + PH - 14, { size: 18, color: OUT, stroke: null });
  }

  /* ----- tiles: build the word in order ----- */
  initTiles(it) {
    it.slots = it.parts.map(() => null);
    it.tiles = shuffle(it.parts.map((p, i) => ({ s: p, slot: i })).concat((it.decoys || []).map(d => ({ s: d, slot: -1 }))));
    if (it.tiles.length > 1 && it.tiles.every((t, i) => t.slot === i)) it.tiles.reverse();
    it.next = 0;
  }
  tileRects(it) {
    const n = it.tiles.length, w = it.tileW || 84, gap = 18, total = n * w + (n - 1) * gap, x0 = VW / 2 - total / 2;
    return it.tiles.map((t, i) => ({ x: x0 + i * (w + gap), y: PY + PH - 120, w, h: 84 }));
  }
  updateTiles(it) {
    const rects = this.tileRects(it);
    const live = it.tiles.map((t, i) => i).filter(i => !it.tiles[i].used);
    if (Input.pressed('left') || Input.pressed('right')) {
      const d = Input.pressed('left') ? -1 : 1;
      let k = live.indexOf(it.sel); k = (k + d + live.length) % live.length; if (k < 0) k = 0; it.sel = live[k]; Sfx.click();
      Speech.say(this.tileSay(it.tiles[it.sel].s));
    }
    if (it.tiles[it.sel] && it.tiles[it.sel].used) it.sel = live[0] ?? 0;
    rects.forEach((r, i) => { if (Input.hover(r) && !it.tiles[i].used) it.sel = i; });
    let chosen = -1;
    rects.forEach((r, i) => { if (Input.clicked(r) && !it.tiles[i].used) chosen = i; });
    if (Input.key(' ') || Input.key('enter')) chosen = it.sel;
    // typing a letter also picks its tile
    for (const k of Input.typed) { const m = it.tiles.findIndex(t => !t.used && t.s[0] === k); if (m >= 0) chosen = m; }
    if (chosen < 0 || !it.tiles[chosen] || it.tiles[chosen].used) return;
    const tile = it.tiles[chosen];
    const need = it.parts[it.next];
    if (tile.s === need) {
      tile.used = true; it.slots[it.next] = tile.s; it.next++;
      Sfx.plink(it.next);
      if (it.next >= it.parts.length) { this.complete(it); return; }
      Speech.say(this.tileSay(tile.s));
    } else {
      tile.shake = 1;
      if (!it.graded) { it.graded = true; Adapt.record(this.skill, it, false, it.key || it.word); }
      it.wrongs++;
      Sfx.boing();
      const why = it.chunks ? `That says ${sylSay(tile.s)}.` : tile.s.length > 1 ? `That says ${sayPh(tile.s)}.` : `That's ${lname(tile.s)}. It says ${sayPh(tile.s)}.`;
      if (it.wrongs >= 3) this.say(`${why} We need ${it.chunks ? sylSay(need) : need.length > 1 ? sayPh(need) : lname(need)}. Find the glowing tile!`);
      else if (it.wrongs === 2) this.say(`${why} The next sound is ${it.chunks ? sylSay(need) : sayPh(need)}. Which tile makes that sound?`);
      else this.say(`${why} Listen: ${it.word}. ${it.chunks ? '' : segSpeech(it.word)}. What comes next?`);
    }
  }
  tileSay(s) { return s.length === 1 ? (PHON[s] ? `${lname(s)}, ${PHON[s]}` : lname(s)) : sylSay(s); }
  drawTiles(it) {
    // slots
    const n = it.parts.length, sw = it.tileW || 84, gap = 12, total = n * sw + (n - 1) * gap, x0 = VW / 2 - total / 2, sy = PY + 236;
    for (let i = 0; i < n; i++) {
      const x = x0 + i * (sw + gap);
      rr(x, sy, sw, 84, 14); paint(i === it.next ? '#fff6c8' : 'rgba(255,255,255,.6)', 3);
      if (it.slots[i]) text(it.slots[i], x + sw / 2, sy + 44, { size: 48, font: 'Andika', color: /^[aeiou]+$/.test(it.slots[i]) ? '#e8384f' : '#2f6fe0', stroke: null });
    }
    const rects = this.tileRects(it);
    rects.forEach((r, i) => {
      const t = it.tiles[i];
      if (t.used) { rr(r.x, r.y, r.w, r.h, 16); paint('rgba(0,0,0,.08)', 0); return; }
      t.shake = Math.max(0, (t.shake || 0) - 1 / 30);
      const sx = t.shake ? Math.sin(this.t * 50) * 6 * t.shake : 0;
      const glow = it.wrongs >= 3 && t.s === it.parts[it.next];
      const sel = i === it.sel;
      if (glow) { ctx.globalAlpha = 0.6 + Math.sin(this.t * 8) * 0.3; rr(r.x - 8, r.y - 8, r.w + 16, r.h + 16, 22); paint('#fff07a', 0); ctx.globalAlpha = 1; }
      rr(r.x + sx, r.y + 5, r.w, r.h, 16); paint('rgba(0,0,0,.2)', 0);
      rr(r.x + sx, r.y - (sel ? 4 : 0), r.w, r.h, 16); paint(sel ? '#fff6c8' : '#ffe9a8', sel ? 5 : 3, sel ? '#ff5fa2' : OUT);
      text(t.s, r.x + r.w / 2 + sx, r.y + r.h / 2 - (sel ? 4 : 0), { size: t.s.length > 3 ? 34 : 46, font: 'Andika', color: /^[aeiou]+$/.test(t.s) ? '#e8384f' : '#2f6fe0', stroke: null });
    });
  }

  /* ----- type: forgiving typing ----- */
  initType(it) { it.pos = 0; it.idle = 0; it.typedWrong = 0; it.flash = {}; }
  updateType(it, dt) {
    it.idle += dt;
    for (const k in it.flash) it.flash[k] = Math.max(0, it.flash[k] - dt * 2);
    // click keys on the screen keyboard too
    const keys = [...Input.typed];
    for (const kr of keyRects()) if (Input.clicked(kr)) keys.push(kr.k);
    for (const k of keys) {
      if (!/^[a-z]$/.test(k)) continue;
      const need = it.word[it.pos];
      if (k === need) {
        it.pos++; it.idle = 0; it.typedWrong = 0;
        Sfx.plink(it.pos);
        if (it.onLetter) it.onLetter(it.pos);
        if (it.pos >= it.word.length) {
          it.rightSay = it.rightSay || `${spellOut(it.word)}. ${it.word}!`;
          this.complete(it);
          return;
        }
        Speech.say(lname(k), { rate: 1.05 });
      } else {
        it.flash[k] = 1; it.typedWrong++;
        if (!it.graded) { it.graded = true; Adapt.record(this.skill, it, false, it.word); }
        it.wrongs++;
        Sfx.bonk();
        if (it.typedWrong >= 3) this.say(`We need ${lname(need)}. Find the glowing key!`);
        else if (it.typedWrong === 2) this.say(`The next sound is ${sayPh(need)}. ${it.word}.`);
        else Speech.say(`That's ${lname(k)}.`, { rate: 1.05 });
      }
    }
  }
  /* Glow the next key: right away at the easiest level, after 2 seconds, or after mistakes. */
  glowKey(it) {
    if (it.pos >= it.word.length) return null;
    const lv = Adapt.level('type');
    const late = it.mode === 'pic' || it.mode === 'sentence';
    if (lv === 0 || it.typedWrong >= 3 || it.idle > (late ? 8 : lv === 1 ? 2 : 4)) {
      // a glow she waited for in the harder modes means it wasn't a first try on her own
      if (late && !it.graded) { it.graded = true; Adapt.record(this.skill, it, false, it.word); }
      return it.word[it.pos];
    }
    return null;
  }
  drawType(it) {
    if (it.drawArea) it.drawArea(this, it);
    else {
      const mode = it.mode;
      const sp = 58, n = it.word.length, x0 = VW / 2 - (n - 1) * sp / 2, y = PY + 210;
      for (let i = 0; i < n; i++) {
        const x = x0 + i * sp;
        rr(x - 25, y - 34, 50, 66, 10); paint(i === it.pos ? '#fff6c8' : '#ffffff', 3);
        if (i < it.pos) text(it.word[i], x, y, { size: 46, font: 'Andika', color: 'aeiou'.includes(it.word[i]) ? '#e8384f' : '#2f6fe0', stroke: null });
        else if (mode === 'copy' || mode === 'faded') text(it.word[i], x, y, { size: 46, font: 'Andika', color: mode === 'copy' ? '#8a80a0' : 'rgba(140,130,160,.35)', stroke: null });
      }
    }
    drawKeyboard(this.glowKey(it), it.flash, this.t);
  }

  /* ----- build: bags of ten and singles, or coins ----- */
  updateBuild(it) {
    const btns = it.buttons.map((b, i) => ({ x: PX + 40, y: PY + 96 + i * 98, w: 200, h: 84, b }));
    for (const r of btns) if (Input.clicked(r) || (Input.typed.includes(String(r.b.hot)))) { it.placed.push(r.b.val); Sfx.pop(); Speech.say(this.runningSay(it)); }
    // click a placed thing to take it back
    const pr = this.placedRects(it);
    for (let i = pr.length - 1; i >= 0; i--) if (Input.clicked(pr[i])) { it.placed.splice(i, 1); Sfx.click(); Speech.say(this.runningSay(it)); break; }
    if (Input.key('backspace') && it.placed.length) { it.placed.pop(); Sfx.click(); }
    const send = { x: PX + PW - 230, y: PY + PH - 96, w: 190, h: 70 };
    if (Input.clicked(send) || Input.key(' ') || Input.key('enter')) {
      const tot = it.placed.reduce((a, b) => a + b, 0);
      if (tot === it.answer) this.grade(true);
      else {
        this.grade(false, tot);
        const more = tot < it.answer;
        if (it.wrongs >= 2) this.say(`${it.unitSay(tot)} We need ${it.answer}. ${more ? 'Add a little more.' : 'That is too many. Click one to take it back.'} ${it.hint2 ? it.hint2() : ''}`);
        else this.say(`${it.unitSay(tot)} We need ${it.answer}. ${more ? 'We need more!' : 'That is too many!'}`);
      }
    }
  }
  runningSay(it) { const tot = it.placed.reduce((a, b) => a + b, 0); return it.countSay ? it.countSay(it.placed) : String(tot); }
  placedRects(it) {
    const out = [];
    const tens = it.placed.map((v, i) => ({ v, i })).filter(p => p.v >= 10), ones = it.placed.map((v, i) => ({ v, i })).filter(p => p.v < 10);
    const rects = new Array(it.placed.length);
    tens.forEach((p, k) => { rects[p.i] = { x: PX + 280 + (k % 6) * 62, y: PY + 120 + Math.floor(k / 6) * 120, w: 54, h: 110 }; });
    ones.forEach((p, k) => { rects[p.i] = { x: PX + 280 + (k % 9) * 44, y: PY + 250 + Math.floor(k / 9) * 48 + (tens.length > 6 ? 70 : 0), w: 40, h: 42 }; });
    return rects.map(r => r || { x: -99, y: -99, w: 0, h: 0 }).concat(out);
  }
  drawBuild(it) {
    it.buttons.forEach((b, i) => {
      const r = { x: PX + 40, y: PY + 96 + i * 98, w: 200, h: 84 };
      const hot = Input.hover(r);
      const glow = it.wrongs >= 2 && b.val === (it.answer - it.placed.reduce((a, c) => a + c, 0) >= b.val ? b.val : -1);
      if (glow) { ctx.globalAlpha = 0.5 + Math.sin(this.t * 8) * 0.3; rr(r.x - 8, r.y - 8, r.w + 16, r.h + 16, 20); paint('#fff07a', 0); ctx.globalAlpha = 1; }
      rr(r.x, r.y + (hot ? 2 : 0), r.w, r.h, 16); paint(hot ? '#fff6c8' : '#ffffff', 3);
      b.draw(r.x + 46, r.y + r.h / 2 + (hot ? 2 : 0), 0.8);
      text(b.label, r.x + 132, r.y + r.h / 2 + (hot ? 2 : 0), { size: 20, color: OUT, stroke: null });
    });
    const pr = this.placedRects(it);
    it.placed.forEach((v, i) => { const r = pr[i]; it.drawPlaced(v, r.x + r.w / 2, r.y + r.h / 2); });
    const tot = it.placed.reduce((a, b) => a + b, 0);
    rr(PX + PW - 230, PY + 90, 190, 120, 18); paint('#fff6c8', 3);
    text(it.totalLabel || 'You have', PX + PW - 135, PY + 116, { size: 18, color: OUT, stroke: null });
    text(it.fmt ? it.fmt(tot) : String(tot), PX + PW - 135, PY + 166, { size: 50, color: tot === it.answer ? '#3a9a5a' : OUT, stroke: null });
    if (it.tensOnes) text(`${Math.floor(tot / 10)} tens  ${tot % 10} ones`, PX + PW - 135, PY + 230, { size: 18, color: OUT, stroke: null });
    const send = { x: PX + PW - 230, y: PY + PH - 96, w: 190, h: 70 };
    button(it.sendLabel || 'Send it!', send.x + send.w / 2, send.y + send.h / 2, send.w, send.h, { color: '#8be06b', size: 28 });
    text(it.goalText, PX + PW - 135, PY + 280, { size: 22, color: '#ff5fa2', stroke: null });
  }

  /* ----- magic e ----- */
  updateMagic(it) {
    const eb = { x: VW / 2 + 150, y: PY + 150, w: 90, h: 90 };
    if (it.phase === 0) {
      if (Input.clicked(eb) || Input.key(' ') || Input.key('enter') || Input.typed.includes('e')) {
        it.phase = 1; Sfx.sparkle(); FX.sparkle(VW / 2, PY + 190, 20);
        this.say(`${it.short}... ${it.long}! The magic e makes the ${lname(it.vowel)} say its name. Now: which word says ${it.ask}?`, `Which word says "${it.ask}"?`);
      }
      return;
    }
    this.updateChoice(it);
  }
  drawMagic(it) {
    if (it.phase === 0) {
      drawWord(it.short, VW / 2 - 40, PY + 190, 72);
      const bob = Math.sin(this.t * 4) * 6;
      ctx.globalAlpha = 0.5 + Math.sin(this.t * 5) * 0.3; circle(VW / 2 + 195, PY + 195 + bob, 52); paint('#fff07a', 0); ctx.globalAlpha = 1;
      drawBead('purple', VW / 2 + 195, PY + 195 + bob, 40, { letter: 'e' });
      text('Click the magic e!', VW / 2, PY + 330, { size: 28, color: OUT, stroke: null });
    } else {
      drawWord(it.long, VW / 2, PY + 150, 60);
      text('↓', VW / 2, PY + 210, { size: 30, color: '#a66cff', stroke: null });
      this.drawChoices(it);
    }
  }

  draw() {
    drawPanelFrame(this.title, this.color, this.who);
    const it = this.item;
    // progress dots
    for (let k = 0; k < this.count; k++) { circle(PX + PW - 140 - (this.count - 1 - k) * 22, PY + 32, 7); paint(k < this.i || (k === this.i && this.state !== 'ask' && it && it.solved) ? '#8be06b' : k === this.i ? '#ffd23f' : '#e0d8e8', 2); }
    if (this.state === 'done') {
      text('You did it!', VW / 2, PY + 170, { size: 64, color: '#ff5fa2', lw: 8 });
      for (let k = 0; k < 3; k++) { star(VW / 2 - 100 + k * 100, PY + 270 + Math.sin(this.t * 4 + k) * 6, 34); paint(k < Math.max(1, Math.round(3 * this.firstRight / this.count)) ? '#ffd23f' : '#fff', 4); }
      drawCoin(VW / 2 - 40, PY + 350, this.t); text(`+${this.coins}`, VW / 2 + 10, PY + 352, { size: 32, color: OUT, stroke: null, align: 'left' });
      this.doneBtn = button('OK!', VW / 2, PY + PH - 50, 180, 64, { color: '#8be06b', size: 30 });
      FX.draw();
      return;
    }
    if (it.visual) it.visual(this, it);
    if (it.kind === 'choice') this.drawChoices(it);
    else if (it.kind === 'tiles') this.drawTiles(it);
    else if (it.kind === 'type') this.drawType(it);
    else if (it.kind === 'build') this.drawBuild(it);
    else if (it.kind === 'magic') this.drawMagic(it);
    FX.draw();
    Talk.strip();
  }
}

/* ---------- On-screen keyboard ---------- */
const KB_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
function keyRects() {
  const out = [], kw = 52, gap = 6, y0 = PY + PH - 186;
  KB_ROWS.forEach((row, r) => {
    const total = row.length * kw + (row.length - 1) * gap, x0 = VW / 2 - total / 2 + r * 14;
    row.split('').forEach((k, i) => out.push({ k, x: x0 + i * (kw + gap), y: y0 + r * (kw + gap), w: kw, h: kw }));
  });
  return out;
}
function drawKeyboard(glow, flash = {}, t = 0) {
  for (const r of keyRects()) {
    const g = r.k === glow, f = flash[r.k] || 0, hot = Input.hover(r);
    if (g) { ctx.globalAlpha = 0.55 + Math.sin(t * 7) * 0.35; rr(r.x - 6, r.y - 6, r.w + 12, r.h + 12, 14); paint('#fff07a', 0); ctx.globalAlpha = 1; }
    rr(r.x, r.y + 4, r.w, r.h, 10); paint('rgba(0,0,0,.2)', 0);
    rr(r.x, r.y + (hot ? 2 : 0), r.w, r.h, 10); paint(f > 0 ? '#c8c0d0' : g ? '#fff6a0' : '#ffffff', 2.5);
    text(r.k, r.x + r.w / 2, r.y + r.h / 2 - 2 + (hot ? 2 : 0), { size: 28, font: 'Andika', color: 'aeiou'.includes(r.k) ? '#e8384f' : '#2f6fe0', stroke: null });
  }
}
