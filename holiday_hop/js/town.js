'use strict';

/*
  Holiday Town: a top-down Brooklyn to explore with the arrow keys. No jumping, no timing.
  Neighbors and Snoozies ask Acadience-style questions; she answers by walking onto a stepping stone.
*/

const TSOLID = new Set(['H', 'T', 'F', '~', 'W', 'C', 'B', 'P', 'n', 'K']);
const TALL = new Set(['H', 'T', 'F', 'P', 'C', 'B', 'W', 'K']);
const WALK_SPEED = 210;

function townState() {
  S.town = S.town || {};
  const t = S.town;
  for (const k of ['npcs', 'chests', 'flags']) t[k] = t[k] || {};
  for (const k of ['bagels', 'pages', 'heb']) t[k] = t[k] || [];
  t.bagels = t.bagels.filter(b => typeof b === 'string' && b.includes('-')); // drop ids from an older version
  return t;
}
const pageDone = d => townState().pages.includes(d);

/* ---------- Map builder ---------- */
class TB {
  constructor(w, h, fill = ',') { this.w = w; this.h = h; this.g = Array.from({ length: h }, () => Array(w).fill(fill)); this.ents = []; this.regions = []; }
  set(x, y, ch) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.g[y][x] = ch; return this; }
  rect(x, y, w, h, ch) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, ch); return this; }
  box(x, y, w, h, wall, floor) { this.rect(x, y, w, h, wall); this.rect(x + 1, y + 1, w - 2, h - 2, floor); return this; }
  ent(type, x, y, o = {}) { this.ents.push({ type, x, y, ...o }); return this; }
  region(name, x, y, w, h) { this.regions.push({ name, x, y, w, h }); return this; }
  build(o = {}) { return { w: this.w, h: this.h, rows: this.g.map(r => r.join('')), ents: this.ents, regions: this.regions, ...o }; }
}

/* ---------- Palettes ---------- */
const TPAL = {
  home: { grass: '#8cc265', bld: '#a0523f', roof: '#6a3a30', win: '#ffe7a0', trim: '#e9dcc8' },
  halloween: { grass: '#9aa85a', bld: '#7a4a5a', roof: '#4a2a40', win: '#ffb347', trim: '#ff8a1f' },
  thanks: { grass: '#b8b060', bld: '#b5683a', roof: '#7a3a22', win: '#fff2c0', trim: '#c8322f' },
  hanukkah: { grass: '#e8eef8', bld: '#5a6a8a', roof: '#f2f6ff', win: '#ffd27a', trim: '#4aa3ff' },
  inside: { grass: '#c8a878', bld: '#e8dcc8', roof: '#b8a890', win: '#bfe6ff', trim: '#8a5a32' },
  valentine: { grass: '#9ac06a', bld: '#b05a5a', roof: '#6a2a3a', win: '#ffd0e0', trim: '#ff5fa2' },
  purim: { grass: '#a8b860', bld: '#8a5ab0', roof: '#4a2a6a', win: '#ffe27a', trim: '#ffd23f' },
  newyear: { grass: '#8a8aa0', bld: '#3a3a58', roof: '#22223a', win: '#ffe27a', trim: '#ff5fa2' },
  cpark: { grass: '#e8eef8', bld: '#8a7a6a', roof: '#f2f6ff', win: '#ffd27a', trim: '#4aa3ff' },
  zoo: { grass: '#8cc265', bld: '#c8a878', roof: '#7a5a3a', win: '#fff2c0', trim: '#3a8a5a' },
  queens: { grass: '#94c46a', bld: '#c09070', roof: '#6a4a3a', win: '#fff2c0', trim: '#4aa3ff' },
  beach: { grass: '#9ac06a', bld: '#f2ece0', roof: '#c8322f', win: '#bfe6ff', trim: '#3ec1d3' },
};

/* ---------- Town scene ---------- */
class TownScene {
  constructor(mapId = 'town', at = null) {
    this.talkBottom = true;
    this.mapId = mapId;
    this.spawnInfo = at;
    this.t = 0;
    const st = townState();
    this.map = TOWN_MAPS[mapId]();
    this.grid = this.map.rows.map(r => r.split(''));
    this.W = this.map.w; this.H = this.map.h;
    this.ents = this.map.ents.map(e => makeTownEnt(e, this)).filter(Boolean);
    const spawn = at || (st.at && st.at.map === mapId ? st.at : null) || this.map.spawn;
    this.p = { x: spawn.x * T + T / 2, y: spawn.y * T + T - 6, face: 1, run: 0, moving: false, powerT: 0, bumpCool: 0, costumeT: 0 };
    this.cam = { x: 0, y: 0 };
    this.q = null;        // current question
    this.trail = null;    // letter walk (boss word)
    this.fade = 1; this.fadeTo = null;
    this.hist = [];
    this.paused = false; this.psel = 0;
    this.timers = [];
    this.snapCam();
    FX.list = [];
    Talk.t = 0;
    Music.play(this.map.music || 'map');
    if (this.map.enter) this.later(0.4, () => this.map.enter(this));
  }

  /* Game-time timers (they pause with the game). */
  later(sec, fn) { this.timers.push({ t: sec, fn }); }

  /* ----- tiles ----- */
  tile(x, y) { return y < 0 || y >= this.H || x < 0 || x >= this.W ? 'H' : this.grid[y][x]; }
  regionAt(tx, ty) {
    for (const r of this.map.regions) if (tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h) return r.name;
    return this.map.palette || 'home';
  }
  solidTile(tx, ty) {
    const ch = this.tile(tx, ty);
    if (ch === '~' && hasCostume('bat')) return false; // the Bat Cape floats her over water
    return TSOLID.has(ch);
  }
  free(tx, ty) { return !this.solidTile(tx, ty) && !this.ents.some(e => e.solid && !e.dead && e.tx === tx && e.ty === ty && e.w1 !== false); }
  boxHits(x, y, w, h) {
    const x0 = Math.floor(x / T), x1 = Math.floor((x + w - 0.01) / T), y0 = Math.floor(y / T), y1 = Math.floor((y + h - 0.01) / T);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (this.solidTile(tx, ty)) return true;
    return false;
  }
  pbox(x = this.p.x, y = this.p.y) { return { x: x - 13, y: y - 14, w: 26, h: 14 }; }

  /* ----- movement ----- */
  move(dx, dy) {
    const p = this.p;
    for (const [ax, ay] of [[dx, 0], [0, dy]]) {
      if (!ax && !ay) continue;
      const nx = p.x + ax, ny = p.y + ay, b = this.pbox(nx, ny);
      // things first (doors sit on wall tiles), then walls
      const hit = this.ents.find(e => e.solid && !e.dead && overlap(b, e.box()));
      if (hit) { if (p.bumpCool <= 0 && hit.onBump) { p.bumpCool = 0.5; hit.onBump(this); } continue; }
      if (this.boxHits(b.x, b.y, b.w, b.h)) {
        // slide around corners: nudge toward the open side
        if (ax && !this.boxHits(b.x, b.y - 10, b.w, b.h) && this.boxHits(b.x, b.y + 10, b.w, b.h)) p.y -= 1.5;
        else if (ax && !this.boxHits(b.x, b.y + 10, b.w, b.h) && this.boxHits(b.x, b.y - 10, b.w, b.h)) p.y += 1.5;
        else if (ay && !this.boxHits(b.x - 10, b.y, b.w, b.h) && this.boxHits(b.x + 10, b.y, b.w, b.h)) p.x -= 1.5;
        else if (ay && !this.boxHits(b.x + 10, b.y, b.w, b.h) && this.boxHits(b.x - 10, b.y, b.w, b.h)) p.x += 1.5;
        continue;
      }
      p.x = nx; p.y = ny;
    }
  }

  snapCam() { this.updateCam(1, true); }
  updateCam(dt, snap) {
    const tx = clamp(this.p.x - VW / 2, 0, Math.max(0, this.W * T - VW));
    // during a question the card fills the top, so keep her lower on the screen
    const ty = clamp(this.p.y - 30 - VH / 2 - (this.q || this.trail ? 110 : 0), 0, Math.max(0, this.H * T - VH));
    if (snap) { this.cam.x = tx; this.cam.y = ty; return; }
    this.cam.x += (tx - this.cam.x) * Math.min(1, dt * 6);
    this.cam.y += (ty - this.cam.y) * Math.min(1, dt * 6);
    if (this.W * T < VW) this.cam.x = (this.W * T - VW) / 2;
    if (this.H * T < VH) this.cam.y = (this.H * T - VH) / 2;
  }

  go(mapId, at) {
    if (this.fadeTo) return;
    Sfx.teleport();
    this.fadeTo = () => {
      if (typeof mapId === 'function') return mapId();
      if (REGION_INFO[this.mapId]) townState().at = { map: this.mapId, x: Math.floor(this.p.x / T), y: Math.floor((this.p.y - 8) / T) + 1 };
      Game.go(new TownScene(mapId, at));
    };
  }

  /* ----- update ----- */
  update(dt) {
    this.t += dt;
    Talk.update(dt);
    if (this.fadeTo) {
      this.fade = Math.min(1, this.fade + dt * 4);
      if (this.fade >= 1) { const f = this.fadeTo; this.fadeTo = null; saveState(); f(); }
      return;
    }
    this.fade = Math.max(0, this.fade - dt * 3);
    if (Input.pressed('pause')) { this.paused = !this.paused; Sfx.click(); }
    if (this.paused) return this.updatePause();
    // Enter: hear the question again, or (when nothing is asked) hear the current goal
    if (Input.pressed('replay')) { if (this.q || this.trail) replayPrompt(); else { const g = townGoal(this); Talk.say(g.say, { show: g.short }); } }

    const p = this.p;
    p.bumpCool -= dt; p.powerT -= dt;
    let dx = (Input.held('right') ? 1 : 0) - (Input.held('left') ? 1 : 0);
    let dy = (Input.held('down') ? 1 : 0) - (Input.held('up') ? 1 : 0);
    if (this.q && this.q.phase === 'karaoke') { dx = dy = 0; }
    if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
    p.moving = !!(dx || dy);
    if (dx) p.face = Math.sign(dx);
    if (p.moving) { p.run += dt * 12; this.move(dx * WALK_SPEED * dt, dy * WALK_SPEED * dt); }
    if (!this.hist.length || Math.hypot(this.hist[0].x - p.x, this.hist[0].y - (p.y - 40)) > 3) { this.hist.unshift({ x: p.x, y: p.y - 40 }); if (this.hist.length > 120) this.hist.length = 120; }

    // costume power (X)
    if (Input.pressed('power') && p.powerT <= 0) this.usePower();
    // M: the map of New York
    if (Input.key('m') && !this.q && !this.trail) { Game.go(new NYCMapScene(this, false)); return; }

    // story: space after reading out loud
    if (this.q && this.q.phase === 'read' && (Input.key(' ') || Input.key('enter'))) this.startKaraoke();
    // space pets a cat walking with her (when there is nothing to read)
    if (Input.key(' ') && !this.q && !this.reading && !this.trail && !shopUse(this)) this.petCat();
    // a sparkle or heart trail behind her
    const trail = shopState().wear.trail;
    if (trail && p.moving && Math.random() < 1 / 60 * 14) {
      if (trail === 'sparkles') FX.add({ x: p.x + (Math.random() - 0.5) * 20, y: p.y - 10, vy: -20, life: 0.8, kind: 'spark', size: 6, color: pick(['#fff6b0', '#ffd23f', '#bfe6ff', '#ff8ac4']) });
      else FX.add({ x: p.x + (Math.random() - 0.5) * 20, y: p.y - 14, vy: -30, life: 0.9, kind: 'text', text: '♥', color: '#ff5fa2', size: 16 });
    }
    // reading a sign: space reads it aloud; walking away puts it away
    if (this.reading) {
      const r = this.reading;
      r.t += 1 / 60;
      if (Input.key(' ')) { Talk.say(r.text); r.heard = true; }
      if (Math.hypot(r.owner.cx() - this.p.x, r.owner.cy() - this.p.y) > T * 3 || this.q) this.reading = null;
    }

    if (this.flipT > 0) this.flipT = Math.max(0, this.flipT - dt * 1.4);
    for (const tm of this.timers.slice()) { tm.t -= dt; if (tm.t <= 0) { this.timers.splice(this.timers.indexOf(tm), 1); tm.fn(); } }
    for (const e of this.ents) if (!e.dead && e.update) e.update(this, dt);
    for (const e of this.ents) if (!e.dead && e.touch && overlap(this.pbox(), e.box())) e.touch(this);
    this.ents = this.ents.filter(e => !e.dead);
    if (this.q) this.updateQuestion(dt);
    if (this.trail) this.updateTrail(dt);
    if (this.map.tick) this.map.tick(this, dt);
    FX.update(dt);
    this.updateCam(dt);
  }

  updatePause() {
    Talk.update(0);
    const opts = this.pauseOpts();
    if (Input.pressed('left')) { this.psel = (this.psel + opts.length - 1) % opts.length; Sfx.click(); }
    if (Input.pressed('right')) { this.psel = (this.psel + 1) % opts.length; Sfx.click(); }
    if (Input.key(' ') || Input.key('enter')) {
      const o = opts[this.psel];
      if (o === 'play') this.paused = false;
      else if (o === 'hear') replayPrompt();
      else if (o === 'home') { this.paused = false; this.go('town', TOWN_SPAWN); }
    }
  }
  pauseOpts() { return ['play', 'hear', 'home']; }

  usePower() {
    const p = this.p;
    const c = S.costume;
    if (c === 'turkey') {
      p.powerT = 0.6; p.pound = 0.35;
      Sfx.pound(); FX.burst(p.x, p.y, 12, ['#fff6e0', '#e9e2f2'], { speed: 220, g: 0, life: 0.4 });
      for (const e of this.ents) if (e.onPound && Math.hypot(e.cx() - p.x, e.cy() - p.y) < T * 1.6) e.onPound(this);
    } else if (c === 'dreidel') {
      p.powerT = 0.55; p.spin = 0.45;
      Sfx.spin(); FX.add({ x: p.x, y: p.y - 24, life: 0.35, kind: 'ring', color: '#8ec5ff', size: 50 });
      for (const e of this.ents) if (e.onSpin && Math.hypot(e.cx() - p.x, e.cy() - p.y) < T * 1.8) e.onSpin(this);
    } else if (c === 'bat') {
      p.powerT = 0.6; FX.burst(p.x, p.y - 30, 8, ['#5b3a8c', '#b07cff'], { speed: 160, g: 0, life: 0.5 });
      Sfx.flap(); Talk.say('With the Bat Cape you can float right over water!');
    } else Talk.say('Find a costume to get a special power!');
  }

  /* ---------- Questions: answer by walking onto a stone ---------- */
  ask(owner, item, intro = '') {
    this.clearQuestion();
    const q = { owner, item, pads: [], wrongs: 0, graded: false, phase: item.story ? 'read' : 'ask', t: 0, t0: performance.now() };
    this.q = q;
    if (item.story) {
      Talk.say(`${intro}Here is a story. Read it out loud! Press the space bar when you finish.`, { show: 'Read it out loud, then press SPACE!' });
      return;
    }
    this.spawnPads();
    Talk.say(`${intro}${item.prompt}`, { prompt: true, show: item.show });
  }
  startKaraoke() {
    const q = this.q, it = q.item;
    q.phase = 'karaoke'; q.kt = 0; q.readSec = (performance.now() - q.t0) / 1000;
    S.orf = S.orf || []; S.orf.push({ d: new Date().toISOString().slice(0, 10), words: it.words, sec: Math.round(q.readSec) }); if (S.orf.length > 40) S.orf.shift();
    q.words = it.text.split(' ');
    q.perWord = 0.42;
    Talk.say(it.text, { show: "Let's check! Read along with me." });
  }
  spawnPads() {
    const q = this.q, n = q.item.choices.length;
    const spots = this.findPadSpots(n);
    q.pads = spots.map((s, i) => ({ tx: s[0], ty: s[1], choice: q.item.choices[i], armed: !this.onTile(s[0], s[1]), shake: 0, glow: false, lock: 0 }));
    q.item.t0 = performance.now();
  }
  onTile(tx, ty) { return Math.floor(this.p.x / T) === tx && Math.floor((this.p.y - 7) / T) === ty; }
  /* Tiles she can walk to from where she stands, with their walking distance. */
  reachable(maxD = 8) {
    const px = Math.floor(this.p.x / T), py = Math.floor((this.p.y - 7) / T);
    const seen = new Map(), queue = [[px, py, 0]];
    seen.set(px + ',' + py, 0);
    const busy = (x, y) => this.ents.some(e => !e.dead && e.solid && overlap({ x: x * T + 8, y: y * T + 8, w: T - 16, h: T - 16 }, e.box()));
    while (queue.length) {
      const [x, y, d] = queue.shift();
      if (d >= maxD) continue;
      for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = (x + ax) + ',' + (y + ay);
        if (seen.has(k) || this.solidTile(x + ax, y + ay) || busy(x + ax, y + ay)) continue;
        seen.set(k, d + 1); queue.push([x + ax, y + ay, d + 1]);
      }
    }
    return seen;
  }
  findPadSpots(n) {
    const px = Math.floor(this.p.x / T), py = Math.floor((this.p.y - 7) / T);
    const seen = this.reachable(8);
    const ok = (x, y) => seen.has(x + ',' + y) && !(x === px && y === py);
    const xs = n === 2 ? [-1, 1] : n === 3 ? [-2, 0, 2] : [-3, -1, 1, 3];
    // Stay near whoever is asking (so a run of questions doesn't walk her away from them),
    // and below them first, so the stones are never hidden under the question card.
    const o = this.q && this.q.owner;
    let ax = px, ay = py;
    if (o && o.box) { const b = o.box(); ax = Math.floor((b.x + b.w / 2) / T); ay = Math.floor((b.y + b.h - 1) / T) + 1; }
    for (const [cx, cy] of [[ax, ay], [px, py]]) {
      for (const dy of [1, 2, 3, -2, -3, -1]) {
        for (const shift of [0, 1, -1, 2, -2]) {
          const row = xs.map(dx => [cx + dx + shift, cy + dy]);
          if (row.every(([x, y]) => ok(x, y))) return row;
        }
      }
    }
    for (const dx of [2, -2, 3, -3]) {
      const col = xs.map(dy => [px + dx, py + dy]);
      if (col.every(([x, y]) => ok(x, y))) return col;
    }
    // any reachable tiles, spread apart
    const cand = [...seen.entries()].filter(([k, d]) => d >= 2).map(([k, d]) => k.split(',').map(Number).concat(d)).sort((a, b) => a[2] - b[2]);
    const out = [];
    for (const c of cand) { if (out.length >= n) break; if (out.every(o => Math.abs(o[0] - c[0]) + Math.abs(o[1] - c[1]) >= 2)) out.push([c[0], c[1]]); }
    while (out.length < n) out.push([px + out.length - 1, py + 2]);
    return out;
  }
  updateQuestion(dt) {
    const q = this.q;
    q.t += dt;
    if (q.phase === 'karaoke') {
      q.kt += dt;
      if (q.kt > q.words.length * q.perWord + 0.8) { q.phase = 'ask'; this.spawnPads(); Talk.say(q.item.prompt, { prompt: true, show: q.item.show }); }
      return;
    }
    if (q.phase !== 'ask' && q.phase !== 'read') return;
    // walked away? put the question on hold
    if (q.owner && q.owner.cx && Math.hypot(q.owner.cx() - this.p.x, q.owner.cy() - this.p.y) > T * 10) {
      Talk.say('Come back when you are ready!');
      if (q.owner.cancel) q.owner.cancel(this);
      this.clearQuestion();
      return;
    }
    if (q.phase !== 'ask') return;
    for (const pad of q.pads) {
      pad.shake = Math.max(0, pad.shake - dt * 3); pad.lock -= dt;
      const on = this.onTile(pad.tx, pad.ty) && Math.hypot(pad.tx * T + T / 2 - this.p.x, pad.ty * T + T / 2 - (this.p.y - 7)) < 22;
      if (!on) { if (!this.onTile(pad.tx, pad.ty)) pad.armed = true; continue; }
      if (!pad.armed || pad.lock > 0) continue;
      pad.armed = false;
      this.answer(pad);
      if (!this.q || this.q !== q) return;
    }
  }
  answer(pad) {
    const q = this.q, it = q.item;
    const right = String(pad.choice.val) === String(it.answer);
    if (!q.graded) { q.graded = true; Ac.record(it, right); }
    if (right) {
      const sticker = it.type === 'decode' ? it.answer : it.type === 'spell' && it.card.quiz ? it.card.quiz.q.word : null;
      if (sticker && !S.stickers.includes(sticker)) S.stickers.push(sticker);
      Sfx.chime(); Sfx.coin();
      FX.confetti(pad.tx * T + T / 2, pad.ty * T + T / 2, 30);
      addTownTokens(this, 1);
      Talk.say(`${pick(['Yes!', 'You got it!', 'Great job!', 'Super!'])} ${it.right}`);
      const owner = q.owner;
      this.clearQuestion();
      if (owner && owner.answered) owner.answered(this, true);
      return;
    }
    q.wrongs++;
    pad.shake = 1; pad.lock = 1.2;
    Sfx.boing();
    it.hintCard = true;
    if (q.wrongs >= 2) for (const o of q.pads) o.glow = String(o.choice.val) === String(it.answer);
    Talk.say(q.wrongs >= 2 ? `${it.hint(pad.choice.val, q.wrongs)} Look for the glowing stone!` : it.hint(pad.choice.val, q.wrongs), { prompt: false });
  }
  clearQuestion() { this.q = null; }

  /* ---------- Boss word: walk to the letters in order ---------- */
  startTrail(word, center, onDone) {
    const n = word.length;
    const tier = S.spell.tier >= 1 ? 1 : 0;
    // only tiles she can walk to, spread out around her
    const spots = [];
    const cand = shuffle([...this.reachable(9).entries()].filter(([k, d]) => d >= 2 && d <= 8).map(([k]) => k.split(',').map(Number)));
    for (const [x, y] of cand) {
      if (spots.length >= n + 2 * tier) break;
      if (spots.every(s => Math.abs(s[0] - x) + Math.abs(s[1] - y) >= 3)) spots.push([x, y]);
    }
    while (spots.length < n + 2 * tier) spots.push(cand[spots.length] || [Math.floor(this.p.x / T) + spots.length, Math.floor(this.p.y / T)]);
    const letters = word.split('').map((ch, i) => ({ ch, slot: i, tx: spots[i][0], ty: spots[i][1], correct: true }));
    for (let k = 0; k < tier * 2 && spots[n + k]; k++) letters.push({ ch: decoyFor(word[k % n], word), slot: -1, tx: spots[n + k][0], ty: spots[n + k][1], correct: false });
    this.trail = { word, letters, next: 0, got: [], onDone, wrong: 0, cool: 0 };
    Talk.say(`Spell ${word}! Walk to the letters in order. ${word}.`, { prompt: true, show: `Spell "${word}"!` });
  }
  updateTrail(dt) {
    const tr = this.trail;
    tr.cool -= dt;
    for (const L of tr.letters) {
      if (L.got) continue;
      if (Math.hypot(L.tx * T + T / 2 - this.p.x, L.ty * T + T / 2 - (this.p.y - 20)) > 30) continue;
      if (L.correct && L.slot === tr.next) {
        L.got = true; tr.got.push(L.ch); tr.next++;
        Sfx.plink(tr.next); FX.sparkle(L.tx * T + T / 2, L.ty * T + T / 2, 10);
        for (const o of tr.letters) if (!o.correct && !o.got) o.got = tr.next >= tr.word.length;
        if (tr.next >= tr.word.length) {
          if (!S.stickers.includes(tr.word)) S.stickers.push(tr.word);
          const done = tr.onDone, w = tr.word;
          this.trail = null;
          let fired = false;
          const fin = () => { if (!fired) { fired = true; if (done) done(); } };
          Talk.say(`${spellOut(w)}. ${w}!`).then(fin);
          this.later(1.5 + w.length * 0.9, fin);
          return;
        }
        Talk.say(lname(L.ch));
      } else if (tr.cool <= 0) {
        tr.cool = 1.2; tr.wrong++;
        Sfx.boing();
        const need = tr.word[tr.next];
        Talk.say(L.correct ? `Not yet! First find ${lname(need)}.` : `That's ${lname(L.ch)}. We need ${lname(need)}.`);
        // nudge her back off the letter
        this.p.x += (this.p.x - (L.tx * T + T / 2)) > 0 ? 20 : -20;
      }
    }
  }

  /* ---------- Drawing ---------- */
  draw() {
    const c = this.cam;
    ctx.fillStyle = this.map.bg || '#2a2040'; ctx.fillRect(0, 0, VW, VH);
    ctx.save();
    ctx.translate(-Math.round(c.x), -Math.round(c.y));
    const x0 = Math.max(0, Math.floor(c.x / T) - 1), x1 = Math.min(this.W - 1, Math.floor((c.x + VW) / T) + 1);
    const y0 = Math.max(0, Math.floor(c.y / T) - 1), y1 = Math.min(this.H - 1, Math.floor((c.y + VH) / T) + 2);
    const tall = [];
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      const ch = this.grid[ty][tx];
      drawGroundTile(this, ch, tx, ty);
      if (TALL.has(ch)) tall.push({ y: (ty + 1) * T, draw: () => drawTallTile(this, ch, tx, ty) });
    }
    // unrestored districts look sleepy and gray
    for (const r of this.map.regions) {
      if (!r.page || pageDone(r.page)) continue;
      ctx.fillStyle = 'rgba(110,105,130,.18)'; ctx.fillRect(r.x * T, r.y * T, r.w * T, r.h * T);
    }
    if (this.q) for (const pad of this.q.pads) drawPad(this, pad);
    if (this.trail) for (const L of this.trail.letters) if (!L.got) {
      const bob = Math.sin(this.t * 3 + L.tx) * 4;
      ctx.globalAlpha = 0.3; ellipse(L.tx * T + T / 2, L.ty * T + T - 6, 18, 6); paint(OUT, 0); ctx.globalAlpha = 1;
      drawLetterBubble(L.ch, L.tx * T + T / 2, L.ty * T + T / 2 - 10 + bob, 24, { alpha: L.correct && L.slot > this.trail.next ? 0.6 : 1 });
    }
    const list = tall.concat(this.ents.filter(e => !e.dead && e.draw).map(e => ({ y: e.sortY ? e.sortY() : (e.ty + 1) * T, draw: () => e.draw(this) })));
    for (const f of this.followers()) list.push({ y: f.y, draw: () => this.drawFollower(f) });
    list.push({ y: this.p.y, draw: () => { this.drawPlayer(); this.drawGoalArrow(); } });
    list.sort((a, b) => a.y - b.y);
    for (const d of list) d.draw();
    if (this.trail) this.trail.got.forEach((ch, i) => { const h = this.hist[Math.min(this.hist.length - 1, (i + 1) * 9)] || this.p; drawLetterBubble(ch, h.x, h.y - 20, 16); });
    FX.draw();
    ctx.restore();
    this.drawHUD();
    if (this.party && this.party.t < 10) {
      this.party.t += 1 / 60;
      const a = Math.min(1, this.party.t * 2, (10 - this.party.t) * 2);
      ctx.save(); ctx.globalAlpha = a;
      rr(VW / 2 - 300, 140, 600, 180, 30); paint('#fffaf0', 6);
      text(this.party.title || "You saved Brooklyn's holidays!", VW / 2, 200, { size: 40, color: '#ff5fa2', lw: 7 });
      for (let i = 0; i < 3; i++) { star(VW / 2 - 90 + i * 90, 270, 30 + Math.sin(this.party.t * 5 + i) * 4); paint('#ffd23f', 4); }
      ctx.restore();
    }
    if (this.paused) this.drawPause();
    if (this.fade > 0) { ctx.fillStyle = `rgba(20,10,30,${this.fade})`; ctx.fillRect(0, 0, VW, VH); }
  }
  /* Cats walking behind her: Babka (until she's home) and her own kitten. */
  followers() {
    const st = townState(), out = [];
    if (st.flags.catFollow && !st.flags.catHome) out.push({ name: 'Babka', look: { color: '#9a92a8', stripe: '#6a6278', scale: 1 } });
    if (st.flags.kitten) out.push({ name: 'Kugel', kitten: true, look: { color: '#f2a65a', stripe: '#d0783a', scale: 0.75 } });
    const pet = shopState().wear.pet;
    if (pet) out.push({ name: pet === 'puppy' ? 'Biscuit' : 'Hoppy', kind: pet, look: { scale: 0.8 } });
    const moving = this.p.moving;
    out.forEach((f, i) => {
      const h = this.hist[Math.min(this.hist.length - 1, (i + 1) * 24)] || { x: this.p.x - 60, y: this.p.y - 40 };
      f.x = h.x; f.y = h.y + 40;
      const ahead = this.hist[Math.max(0, (i + 1) * 24 - 5)] || this.p;
      f.look.face = (ahead.x || this.p.x) >= f.x ? 1 : -1;
      f.look.walking = moving;
      f.look.sleepy = !moving && Math.sin(this.t * 0.3 + i) > 0.6;
    });
    return out;
  }
  drawFollower(f) {
    if (f.kind === 'puppy') return drawPuppy(f.x, f.y, this.t, f.look);
    if (f.kind === 'bunny') return drawBunny(f.x, f.y, this.t, f.look);
    const flip = this.flipT > 0 && f.kitten ? Math.sin((1 - this.flipT) * Math.PI) * 30 : 0;
    ctx.save();
    if (flip) { ctx.translate(f.x, f.y - flip - 14); ctx.rotate((1 - this.flipT) * TAU); ctx.translate(-f.x, -f.y + 14); }
    drawCat(f.x, f.y, this.t, f.look);
    const acc = f.kitten && shopState().wear.kitten;
    if (acc) drawShopIcon(acc, f.x + 10 * f.look.face * f.look.scale, f.y - (acc === 'bell' ? 13 : 30) * f.look.scale, 0.45, this.t);
    ctx.restore();
  }
  petCat() {
    const f = this.followers().sort((a, b) => Math.hypot(a.x - this.p.x, a.y - this.p.y) - Math.hypot(b.x - this.p.x, b.y - this.p.y))[0];
    if (!f || Math.hypot(f.x - this.p.x, f.y - this.p.y) > T * 3) return;
    const sh = shopState();
    if (f.kitten && sh.fish > 0) {
      sh.fish--; this.flipT = 1; saveState();
      Sfx.meow(); Sfx.sparkle(); FX.sparkle(f.x, f.y - 30, 14, ['#8ec5ff', '#fff']);
      Talk.say(`Yum! Kugel ate the fish treat and did a happy flip!${sh.fish ? ` ${NUM_WORDS[Math.min(20, sh.fish)]} treats left.` : ''}`);
      return;
    }
    if (f.kind) Sfx.chime(); else { Sfx.purr(); if (Math.random() < 0.5) Sfx.meow(); }
    for (let i = 0; i < 5; i++) FX.add({ x: f.x + (Math.random() - 0.5) * 30, y: f.y - 30, vy: -60 - Math.random() * 40, vx: (Math.random() - 0.5) * 40, life: 1.1, kind: 'text', text: '♥', color: '#ff5fa2', size: 22 });
    const st = townState();
    st.flags.pets = (st.flags.pets || 0) + 1;
    if (f.kind) { Talk.say(pick([`${f.name} loves you!`, `${f.name} is so happy!`, f.kind === 'puppy' ? 'Woof woof!' : 'Hop hop hop!'])); return; }
    Talk.say(pick([`Purrr! ${f.name} loves you!`, `${f.name} is so soft!`, `${f.name} says meow!`, `Good kitty, ${f.name}!`, `Mazel is a little jealous!`]));
  }

  /* Where the yellow arrow points: the goal, or the door that leads toward it. */
  goalPoint() {
    const g = townGoal(this);
    const t = g.target;
    if (!t) return null;
    if (t.map === this.mapId) return { x: t.x * T + T / 2, y: t.y * T + T / 2 };
    // the door, exit or tunnel that leads toward the goal's map
    const hop = nextHop(this.mapId, t.map);
    const d = this.ents.find(e => !e.dead && e.to === hop && (e instanceof TDoor || e instanceof TWarp || e instanceof TManhole || e instanceof TExit));
    return d && { x: d.cx(), y: d.cy() + (d instanceof TDoor ? T / 2 : 0) };
  }
  drawGoalArrow() {
    if (this.q || this.trail || this.paused) return;
    const gp = this.goalPoint();
    if (!gp) return;
    // a twinkling star over the goal
    const sy = gp.y - 70 + Math.sin(this.t * 4) * 6;
    ctx.globalAlpha = 0.85; star(gp.x, sy, 14 + Math.sin(this.t * 6) * 2); paint('#ffd23f', 3); ctx.globalAlpha = 1;
    const dx = gp.x - this.p.x, dy = gp.y - (this.p.y - 20), d = Math.hypot(dx, dy);
    if (d < T * 2) return;
    const a = Math.atan2(dy, dx), r = 64 + Math.sin(this.t * 5) * 6;
    ctx.save(); ctx.translate(this.p.x + Math.cos(a) * r, this.p.y - 34 + Math.sin(a) * r); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(-10, -15); ctx.lineTo(-4, 0); ctx.lineTo(-10, 15); ctx.closePath(); paint('#ffd23f', 3);
    ctx.restore();
  }
  drawPlayer() {
    const p = this.p;
    ctx.globalAlpha = 0.25; ellipse(p.x, p.y, 16, 6); paint(OUT, 0); ctx.globalAlpha = 1;
    let sx = 1, sy = 1;
    if (p.pound > 0) { p.pound -= 1 / 60; sx = 1.3; sy = 0.75; }
    if (p.spin > 0) { p.spin -= 1 / 60; sx = Math.cos(p.spin * 45); }
    const hover = hasCostume('bat') && this.tile(Math.floor(p.x / T), Math.floor((p.y - 7) / T)) === '~';
    const hy = p.y - (hover ? 10 + Math.sin(this.t * 6) * 3 : 0);
    drawWearables(p.x, hy, p.face, 0.9, this.t, true);
    drawHero(p.x, p.y - (hover ? 10 + Math.sin(this.t * 6) * 3 : 0), { face: p.face, run: p.moving ? p.run : 0, scale: 0.9, sx, sy, glide: hover, blink: Math.sin(this.t * 1.3) > 0.97 });
    drawWearables(p.x, hy, p.face, 0.9, this.t, false);
  }
  drawHUD() {
    drawToken(30, 30, this.t * 0.3); text(String(S.coins), 50, 31, { size: 24, align: 'left' });
    const st = townState();
    const found = st.bagels.length;
    ctx.save(); ctx.translate(130, 30); ctx.scale(0.65, 0.65); drawBagel(0, 0, 0, false); ctx.restore();
    text(`${found}/${TOWN_BAGELS}`, 150, 31, { size: 22, align: 'left' });
    if (S.gems) { ctx.save(); ctx.translate(230, 30); ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(10, -3); ctx.lineTo(0, 12); ctx.lineTo(-10, -3); ctx.closePath(); paint('#4aa3ff', 3); ctx.restore(); text(String(S.gems), 246, 31, { size: 22, align: 'left' }); }
    if (!['heb'].includes(this.mapId)) drawQuestHUD(this);
    if (!this.q && !this.trail) {
      // the current goal, always on screen
      const g = townGoal(this);
      ctx.font = '600 18px Fredoka, sans-serif';
      const w = ctx.measureText(g.short).width + 56;
      rr(16, 92, w, 34, 12); paint('rgba(255,250,240,.92)', 3);
      star(34, 109, 10); paint('#ffd23f', 2);
      text(g.short, 50, 110, { size: 18, color: OUT, align: 'left', stroke: null, weight: 600 });
    }
    if (this.mapId === 'shop') drawShopCard(this);
    if (this.reading) {
      const r = this.reading;
      rr(VW / 2 - 260, 14, 520, 120, 18); paint('#fffaf0', 5);
      rr(VW / 2 - 250, 24, 500, 100, 12); paint('#8a6a4a', 0);
      rr(VW / 2 - 244, 30, 488, 88, 10); paint('#fffaf0', 0);
      const lines = wrapLines(r.text, r.dir ? 380 : 460, 30);
      lines.forEach((ln, i) => text(ln, VW / 2 - (r.dir ? 40 : 0), 74 - (lines.length - 1) * 18 + i * 36, { size: 30, font: 'Andika', color: OUT, stroke: null }));
      if (r.dir) drawSignArrow(VW / 2 + 190, 74, r.dir, 1.1);
      if (!r.heard && Math.sin(this.t * 4) > -0.3) drawKey('SPACE', VW / 2, 160, '#8be06b', 110);
    }
    drawSpeaker(VW - 40, 38, Speech.speaking);
    if (this.q) {
      drawCard(this.q.item, { hint: this.q.item.hintCard, hi: this.q.phase === 'karaoke' ? Math.floor(this.q.kt / this.q.perWord) : -1 });
      if (this.q.phase === 'read' && Math.sin(this.t * 4) > -0.3) drawKey('SPACE', VW / 2, (this.q.item.card.icons ? 230 : 200) + 40, '#8be06b', 110);
    }
    if (this.trail) {
      const n = this.trail.word.length, bw = 40, x0 = VW / 2 - n * bw / 2;
      rr(x0 - 14, 12, n * bw + 28, 56, 16); paint('rgba(255,250,240,.92)', 3);
      for (let i = 0; i < n; i++) {
        const x = x0 + i * bw + bw / 2;
        if (i < this.trail.next) text(this.trail.word[i], x, 38, { size: 34, font: 'Andika', color: 'aeiou'.includes(this.trail.word[i]) ? '#e8384f' : '#2f6fe0', lw: 4 });
        else { rr(x - 13, 50, 26, 5, 2); paint(i === this.trail.next ? '#ffb02e' : '#b8afc8', 0); }
      }
    }
    // a little "X" hint when her costume power would do something here
    if (S.costume !== 'none' && this.ents.some(e => (e.onPound && S.costume === 'turkey' || e.onSpin && S.costume === 'dreidel') && e.wantsPower && Math.hypot(e.cx() - this.p.x, e.cy() - this.p.y) < T * 2.2)) {
      drawKey('X', VW - 100, 38, '#4aa3ff', 40);
    }
    Talk.draw();
  }
  drawPause() {
    ctx.fillStyle = 'rgba(20,10,30,.6)'; ctx.fillRect(0, 0, VW, VH);
    text('Paused', VW / 2, 140, { size: 56, color: '#ffd23f', lw: 8 });
    this.pauseOpts().forEach((k, i) => {
      const x = VW / 2 - 200 + i * 200, y = 300, sel = i === this.psel;
      circle(x, y, 66); paint(sel ? '#fff6c8' : '#fffaf0', sel ? 7 : 4, sel ? '#ff5fa2' : OUT);
      if (k === 'play') { ctx.beginPath(); ctx.moveTo(x - 18, y - 30); ctx.lineTo(x + 30, y); ctx.lineTo(x - 18, y + 30); ctx.closePath(); paint('#8be06b', 4); }
      else if (k === 'hear') drawSpeaker(x, y, false);
      else { rr(x - 26, y - 20, 52, 42, 4); paint('#a0523f', 3); ctx.beginPath(); ctx.moveTo(x - 34, y - 18); ctx.lineTo(x, y - 44); ctx.lineTo(x + 34, y - 18); ctx.closePath(); paint('#6a3a30', 3); }
    });
  }
}

const hasCostume = c => S.costumes.includes(c);
/* How many questions she has already answered for someone (kept if she walks away or leaves the area). */
function progGet(key) { const st = townState(); st.prog = st.prog || {}; return st.prog[key] || 0; }
function progSet(key, n) { const st = townState(); st.prog = st.prog || {}; if (n) st.prog[key] = n; else delete st.prog[key]; saveState(); }
/* Everyday bagels: earned for right answers and helping, spent at the Bagel Shop. */
function addTownTokens(scene, n) { S.coins += n; FX.pop(scene.p.x, scene.p.y - 80, `+${n}`, '#e8b070'); }

/* ---------- Tile art (3/4 top-down) ---------- */
function drawGroundTile(sc, ch, tx, ty) {
  const x = tx * T, y = ty * T, pal = TPAL[sc.regionAt(tx, ty)];
  const n = (tx * 7 + ty * 13) % 5;
  switch (ch) {
    case '.': ctx.fillStyle = '#c8c4d0'; ctx.fillRect(x, y, T, T); ctx.strokeStyle = '#aaa6b8'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, T - 2, T - 2); break;
    case '=': ctx.fillStyle = '#5a5a66'; ctx.fillRect(x, y, T, T); if (ty % 2 === 0 && tx % 3 === 0) { ctx.fillStyle = '#e8e0a0'; ctx.fillRect(x + 8, y + T / 2 - 2, 26, 4); } break;
    case 'z': ctx.fillStyle = '#5a5a66'; ctx.fillRect(x, y, T, T); ctx.fillStyle = '#f2f2f2'; for (let i = 0; i < 4; i++) ctx.fillRect(x + 4 + i * 12, y + 4, 6, T - 8); break;
    case 'p': ctx.fillStyle = '#c8a878'; ctx.fillRect(x, y, T, T); ctx.fillStyle = '#b8946a'; ctx.fillRect(x + n * 7, y + 10 + n * 4, 6, 4); break;
    case 's': ctx.fillStyle = '#f2f6ff'; ctx.fillRect(x, y, T, T); ctx.fillStyle = '#dfe6f4'; ctx.fillRect(x + n * 8, y + 6 + n * 6, 10, 4); break;
    case 'q': ctx.fillStyle = '#c98b5a'; ctx.fillRect(x, y, T, T); ctx.strokeStyle = '#a86a3e'; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, T / 2 - 1, T / 2 - 1); ctx.strokeRect(x + T / 2, y + T / 2, T / 2 - 1, T / 2 - 1); break;
    case 'w': ctx.fillStyle = '#c8925a'; ctx.fillRect(x, y, T, T); ctx.fillStyle = '#a8743e'; for (let i = 0; i < 3; i++) ctx.fillRect(x, y + 15 + i * 16, T, 2); break;
    case 'k': ctx.fillStyle = (tx + ty) % 2 ? '#f6f0e4' : '#3a3a48'; ctx.fillRect(x, y, T, T); break;
    case 'm': ctx.fillStyle = '#5a5a66'; ctx.fillRect(x, y, T, T); circle(x + T / 2, y + T / 2, 18); paint('#7a7a88', 3); break;
    case '~': {
      ctx.fillStyle = '#4a90d8'; ctx.fillRect(x, y, T, T);
      ctx.fillStyle = '#bfe6ff'; ellipse(x + 14 + Math.sin(sc.t * 2 + tx) * 4, y + 16, 8, 3); ctx.fill(); ellipse(x + 34, y + 34 + Math.sin(sc.t * 2 + ty) * 3, 7, 2.5); ctx.fill();
      break;
    }
    case 'n': ctx.fillStyle = '#0c0a18'; ctx.fillRect(x, y, T, T); break;
    case 'd': ctx.fillStyle = '#f0dca8'; ctx.fillRect(x, y, T, T); ctx.fillStyle = '#e0c890'; ctx.fillRect(x + n * 8, y + 8 + n * 6, 4, 3); ctx.fillRect(x + 30 - n * 4, y + 34, 3, 3); break;
    case 'i': ctx.fillStyle = '#cfe8f8'; ctx.fillRect(x, y, T, T); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 6 + n * 4, y + 10); ctx.lineTo(x + 22 + n * 4, y + 18); ctx.stroke(); break;
    case 'b': ctx.fillStyle = '#b07a48'; ctx.fillRect(x, y, T, T); ctx.fillStyle = '#8a5a32'; for (let i = 1; i < 4; i++) ctx.fillRect(x + i * 12, y, 2, T); break;
    case 'f': case 'L': case ',': default: {
      ctx.fillStyle = pal.grass; ctx.fillRect(x, y, T, T);
      ctx.fillStyle = shade(pal.grass, -0.12); ctx.fillRect(x + n * 8, y + 8 + n * 5, 3, 7); ctx.fillRect(x + 30 - n * 3, y + 30, 3, 7);
      if (ch === 'f') { for (let i = 0; i < 3; i++) { circle(x + 10 + i * 14, y + 16 + (i % 2) * 14, 5); paint(['#ff5fa2', '#ffd23f', '#b07cff'][i], 1.5); } }
      if (ch === 'L') for (let i = 0; i < 5; i++) { ellipse(x + 8 + i * 8, y + 20 + (i % 2) * 12, 8, 5, i); paint(['#e0642c', '#f2a23a', '#c43d2e'][i % 3], 1.5); }
    }
  }
}

function drawTallTile(sc, ch, tx, ty) {
  const x = tx * T, y = ty * T, reg = sc.regionAt(tx, ty), pal = TPAL[reg];
  const below = sc.tile(tx, ty + 1), above = sc.tile(tx, ty - 1);
  switch (ch) {
    case 'H': case 'W': {
      const wall = ch === 'W' ? (sc.map.wall || '#e8dcc8') : pal.bld;
      if (below !== ch) {
        // front face with a window
        ctx.fillStyle = wall; ctx.fillRect(x, y, T, T);
        ctx.fillStyle = shade(wall, -0.2); ctx.fillRect(x, y + T - 6, T, 6);
        if (ch === 'H') { rr(x + 12, y + 8, 24, 26, 3); paint(pal.win, 2.5); ctx.fillStyle = OUT; ctx.fillRect(x + 23, y + 8, 2, 26); }
        else { ctx.fillStyle = shade(wall, -0.08); for (let i = 0; i < 3; i++) ctx.fillRect(x + 4 + i * 16, y, 6, T - 6); }
        ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y + T); ctx.lineTo(x + T, y + T); ctx.stroke();
      } else {
        // roof
        ctx.fillStyle = ch === 'W' ? shade(wall, -0.35) : pal.roof; ctx.fillRect(x, y, T, T);
        ctx.fillStyle = shade(ch === 'W' ? shade(wall, -0.35) : pal.roof, 0.12);
        if ((tx + ty) % 2) ctx.fillRect(x + 6, y + 6, T - 12, 4);
      }
      if (above !== ch && ch === 'H') { ctx.fillStyle = reg === 'hanukkah' ? '#ffffff' : pal.trim; ctx.fillRect(x, y, T, 6); }
      ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.beginPath();
      if (sc.tile(tx - 1, ty) !== ch) { ctx.moveTo(x + 1.5, y); ctx.lineTo(x + 1.5, y + T); }
      if (sc.tile(tx + 1, ty) !== ch) { ctx.moveTo(x + T - 1.5, y); ctx.lineTo(x + T - 1.5, y + T); }
      if (above !== ch) { ctx.moveTo(x, y + 1.5); ctx.lineTo(x + T, y + 1.5); }
      ctx.stroke();
      break;
    }
    case 'T': {
      drawGroundTile(sc, ',', tx, ty);
      rr(x + 19, y + 18, 10, 26, 3); paint('#6a4630', 2.5);
      const col = reg === 'halloween' ? ['#e0782c', '#c4502a'] : reg === 'thanks' ? ['#d89a30', '#b8702a'] : reg === 'hanukkah' ? ['#3a7a5a', '#f2f6ff'] : ['#4a9a4a', '#3a8a3a'];
      circle(x + T / 2, y + 4, 26); paint(col[0], 3);
      circle(x + T / 2 - 8, y - 4, 12); paint(shade(col[0], 0.15), 0);
      if (reg === 'hanukkah') { ellipse(x + T / 2, y - 14, 18, 7); paint('#f2f6ff', 0); }
      break;
    }
    case 'F': {
      drawGroundTile(sc, sc.tile(tx, ty - 1) === 'F' ? ',' : ',', tx, ty);
      for (let i = 0; i < 3; i++) { rr(x + 4 + i * 15, y + 6, 10, 36, 3); paint('#f4efe4', 2); }
      rr(x, y + 16, T, 7, 2); paint('#e4ddcc', 2);
      break;
    }
    case 'P': {
      drawGroundTile(sc, ',', tx, ty);
      ellipse(x + T / 2, y + 30, 18, 14); paint('#ff8a1f', 3);
      ctx.strokeStyle = '#c45f10'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x + T / 2, y + 30, 6, 13, 0, 0, TAU); ctx.stroke();
      rr(x + T / 2 - 3, y + 10, 6, 8, 2); paint('#5a8a3a', 2);
      break;
    }
    case 'C': {
      ctx.fillStyle = '#9a6a3e'; ctx.fillRect(x, y + 8, T, T - 8);
      ctx.fillStyle = '#e8d0a8'; ctx.fillRect(x, y, T, 14);
      ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, T - 3, T - 3);
      break;
    }
    case 'K': { // menorah / display stand (solid) – drawn by entities on top
      drawGroundTile(sc, sc.tile(tx, ty + 1) === 'K' ? 'q' : sc.tile(tx, ty + 1), tx, ty);
      break;
    }
    case 'B': {
      ctx.fillStyle = '#7a4a2a'; ctx.fillRect(x, y, T, T);
      for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) { ctx.fillStyle = ['#e8442f', '#2f6fe0', '#ffd23f', '#3a8a5a', '#b07cff'][(i + r + tx) % 5]; ctx.fillRect(x + 4 + i * 8, y + 4 + r * 15, 6, 12); }
      ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, T - 3, T - 3);
      break;
    }
  }
}

function drawPad(sc, pad) {
  const x = pad.tx * T + T / 2 + (pad.shake ? Math.sin(sc.t * 50) * 4 * pad.shake : 0), y = pad.ty * T + T / 2;
  if (pad.glow) {
    const gr = ctx.createRadialGradient(x, y, 10, x, y, 56); gr.addColorStop(0, 'rgba(255,240,140,.9)'); gr.addColorStop(1, 'rgba(255,240,140,0)');
    ctx.fillStyle = gr; circle(x, y, 56); ctx.fill();
  }
  ctx.globalAlpha = 0.3; ellipse(x, y + 18, 24, 7); paint(OUT, 0); ctx.globalAlpha = 1;
  const bob = Math.sin(sc.t * 3 + pad.tx) * 2;
  const pic = pad.choice.kind === 'pic';
  ellipse(x, y + bob, pic ? 30 : 26, pic ? 28 : 22); paint(pad.lock > 0 ? '#9a92a8' : pic || pad.choice.kind === 'word' ? '#fffaf0' : '#6a5ad0', 3);
  drawChoice(pad.choice, x, y + bob, pic ? 0.95 : 0.85);
}

/* ---------- Town things ---------- */
class TEnt {
  constructor(d, sc) { Object.assign(this, d); this.tx = d.x; this.ty = d.y; this.t = Math.random() * 5; this.dead = false; }
  box() { return { x: this.tx * T + 4, y: this.ty * T + 8, w: T - 8, h: T - 10 }; }
  cx() { return this.tx * T + T / 2; }
  cy() { return this.ty * T + T / 2; }
  update(sc, dt) { this.t += dt; }
}

/* A neighbor or Snoozie with questions. */
class TNpc extends TEnt {
  constructor(d, sc) {
    super(d, sc);
    this.solid = true;
    this.done = !!townState().npcs[d.id];
    this.asked = 0;
    this.count = d.count || 3;
  }
  onBump(sc) {
    if (sc.q && sc.q.owner === this) return;
    if (sc.q || sc.trail) return;
    this.asked = this.done ? 0 : progGet(this.id);
    const hello = this.done ? (this.again || 'Want to play again? Here you go!') : this.asked ? "Welcome back! Let's keep going." : this.hello;
    this.next(sc, hello + ' ');
  }
  next(sc, intro = '') {
    const type = Ac.pickType(this.topics);
    sc.ask(this, Ac.make(type), intro);
  }
  answered(sc) {
    this.asked++;
    if (!this.done) progSet(this.id, this.asked);
    if (this.asked < (this.done ? 2 : this.count)) { sc.later(1.6, () => { if (!sc.q) this.next(sc); }); return; }
    const first = !this.done;
    this.done = true;
    townState().npcs[this.id] = true;
    addTownTokens(sc, first ? 5 : 2);
    FX.confetti(this.cx(), this.cy() - 30, 40);
    Sfx.fanfare();
    sc.later(1.4, () => Talk.say(first ? this.thanks || 'Thank you so much!' : 'Thanks for playing again!'));
    saveState();
    if (first && sc.map.onHelp) sc.map.onHelp(sc, this);
  }
  cancel() {}
  sortY() { return (this.ty + 1) * T - 4; }
  draw(sc) {
    const x = this.cx(), y = this.ty * T + T - 6, bob = Math.sin(this.t * 2) * 1.5;
    ctx.globalAlpha = 0.25; ellipse(x, y, 16, 6); paint(OUT, 0); ctx.globalAlpha = 1;
    if (this.skin) drawSnoozie({ x: x - 20, y: y - 40 + bob, w: 40, h: 40, skin: this.skin, t: this.t, face: sc.p.x < x ? -1 : 1, state: this.done || (sc.q && sc.q.owner === this) ? 'happy' : 'walk' });
    else drawHero(x, y + bob * 0.3, { look: this.look, costume: this.costume || 'none', mazel: false, face: sc.p.x < x ? -1 : 1, scale: this.scale || 0.85, wave: Math.max(0, Math.sin(this.t * 3)) * (this.done ? 0 : 1) });
    if (this.hat) this.hat(x, y);
    if (!this.done && !(sc.q && sc.q.owner === this)) {
      const by = y - 92 + Math.sin(this.t * 4) * 4;
      circle(x, by, 15); paint('#ffd23f', 3); text('!', x, by + 1, { size: 22, color: OUT, stroke: null });
    } else if (this.done) {
      drawHeart(x, y - 88 + Math.sin(this.t * 3) * 3, 9, '#ff5fa2', 2);
    }
  }
}

/* A door: walk into it to go inside. */
class TDoor extends TEnt {
  constructor(d, sc) { super(d, sc); this.solid = true; }
  box() { return { x: this.tx * T + 6, y: this.ty * T + 4, w: T - 12, h: T - 2 }; }
  onBump(sc) {
    if (this.locked && this.locked()) { Talk.say(this.lockedLine || 'It is locked.'); Sfx.bonk(); return; }
    if (this.action) return this.action(sc);
    sc.go(this.to, this.at);
  }
  draw(sc) {
    const x = this.tx * T, y = this.ty * T;
    rr(x + 8, y + 2, T - 16, T - 4, 12); paint(this.color || '#7a3a2a', 3);
    circle(x + T - 15, y + T / 2 + 4, 3); paint('#ffd23f', 1.5);
    if (this.icon) this.icon(x + T / 2, y - 14, sc);
  }
  sortY() { return (this.ty + 1) * T + 1; }
}

/* Locked chest: answer a question to open it. */
class TChest extends TEnt {
  constructor(d, sc) { super(d, sc); this.solid = true; this.open = !!townState().chests[d.id]; }
  onBump(sc) {
    if (this.open) { Talk.say('This chest is empty now.'); return; }
    if (sc.q) return;
    this.asked = progGet(this.id);
    sc.ask(this, Ac.make(Ac.pickType(this.topics || MATH_TYPES.concat(READING_TYPES))), this.asked ? 'One more to open the chest! ' : 'A treasure chest! Answer to open it. ');
  }
  answered(sc) {
    this.asked++;
    progSet(this.id, this.asked);
    if (this.asked < (this.count || 2)) { sc.later(1.5, () => { if (!sc.q) sc.ask(this, Ac.make(Ac.pickType(this.topics || MATH_TYPES.concat(READING_TYPES))), 'One more! '); }); return; }
    this.open = true;
    townState().chests[this.id] = true;
    Sfx.door(); FX.confetti(this.cx(), this.cy(), 50);
    if (this.costume) {
      if (!S.costumes.includes(this.costume)) S.costumes.push(this.costume);
      S.costume = this.costume;
      Sfx.powerup();
      const lines = {
        bat: 'You found the Bat Cape! Now you can float right over water!',
        turkey: 'You found the Turkey Suit! Press X to do a Gobble Pound. It can open cracked manholes!',
        dreidel: 'You found the Dreidel Suit! Press X to spin. Spin next to candles to light them!',
      };
      sc.later(1.3, () => Talk.say(lines[this.costume]));
    } else { addTownTokens(sc, 10); sc.later(1.3, () => Talk.say('Ten bagels! Wow! Spend them at the Bagel Shop!')); }
    saveState();
  }
  draw(sc) {
    const x = this.tx * T, y = this.ty * T;
    rr(x + 4, y + 14, T - 8, T - 18, 6); paint(this.open ? '#9a7a5a' : '#c8925a', 3);
    if (!this.open) { rr(x + 4, y + 8, T - 8, 14, 6); paint('#a8743e', 3); rr(x + T / 2 - 6, y + 18, 12, 12, 3); paint('#ffd23f', 2); if (Math.sin(this.t * 3) > 0.6) FX.sparkle(x + Math.random() * T, y + Math.random() * T, 1); }
    else { rr(x + 4, y + 2, T - 8, 12, 6); paint('#a8743e', 3); }
  }
}

class TBagel extends TEnt {
  constructor(d, sc) { super(d, sc); this.dead = townState().bagels.includes(d.id); }
  touch(sc) {
    this.dead = true; townState().bagels.push(this.id);
    addTownTokens(sc, 5); Sfx.sparkle(); Sfx.chime(); FX.sparkle(this.cx(), this.cy(), 16);
    const n = townState().bagels.length;
    Talk.say(n >= TOWN_BAGELS ? 'You found ALL the golden bagels! Amazing explorer!' : `A golden bagel! You found ${NUM_WORDS[Math.min(20, n)] || n}!`);
    saveState();
  }
  draw(sc) { drawBagel(this.cx(), this.cy() - 8, this.t); }
}

/* District gate: a hedge that opens when a calendar page is won. */
class TGate extends TEnt {
  constructor(d, sc) { super(d, sc); this.solid = true; }
  box() { return { x: this.tx * T, y: this.ty * T, w: (this.w || 1) * T, h: (this.h || 1) * T }; }
  update(sc, dt) { this.t += dt; if (this.open && this.open()) { this.dead = true; FX.confetti(this.cx(), this.cy(), 30); } }
  onBump(sc) { Talk.say(this.line || 'This way is closed for now.'); Sfx.bonk(); }
  draw(sc) {
    for (let j = 0; j < (this.h || 1); j++) for (let i = 0; i < (this.w || 1); i++) {
      const x = (this.tx + i) * T, y = (this.ty + j) * T;
      rr(x + 2, y + 4, T - 4, T - 6, 12); paint('#3a7a3a', 3);
      circle(x + 14, y + 16, 8); paint('#4a9a4a', 0); circle(x + 32, y + 26, 9); paint('#4a9a4a', 0);
    }
    const x = this.cx() + ((this.w || 1) - 1) * T / 2, y = this.cy() + ((this.h || 1) - 1) * T / 2;
    rr(x - 14, y - 12, 28, 24, 5); paint('#ffd23f', 3);
    ctx.lineWidth = 4; ctx.strokeStyle = OUT; ctx.beginPath(); ctx.arc(x, y - 12, 8, Math.PI, 0); ctx.stroke();
  }
  sortY() { return (this.ty + (this.h || 1)) * T; }
}

/* A cracked manhole: Gobble Pound (Turkey Suit) opens it. */
class TManhole extends TEnt {
  constructor(d, sc) { super(d, sc); this.isOpen = !!townState().flags[d.id]; this.wantsPower = !this.isOpen; }
  onPound(sc) {
    if (this.isOpen) return;
    this.isOpen = true; this.wantsPower = false; townState().flags[this.id] = true;
    Sfx.breakBlock(); FX.burst(this.cx(), this.cy(), 14, ['#7a7a88', '#5a5a66'], { speed: 240 });
    Talk.say('The manhole popped open! Walk in to explore!');
  }
  touch(sc) {
    if (this.isOpen) sc.go(this.to, this.at);
    else if (!this.said) { this.said = true; Talk.say(hasCostume('turkey') ? 'A cracked manhole! Wear the Turkey Suit and press X to pound it!' : 'A cracked manhole. Maybe a costume could open it.'); }
  }
  box() { return { x: this.tx * T + 10, y: this.ty * T + 10, w: T - 20, h: T - 20 }; }
  draw(sc) {
    const x = this.cx(), y = this.cy();
    if (this.isOpen) { ellipse(x, y, 20, 14); paint('#100c18', 3); for (let i = 0; i < 3; i++) { ctx.fillStyle = '#c0c0c8'; ctx.fillRect(x - 8, y - 6 + i * 5, 16, 2); } }
    else { circle(x, y, 20); paint('#7a7a88', 3); ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 14, y - 6); ctx.lineTo(x, y + 2); ctx.lineTo(x + 12, y - 8); ctx.stroke(); }
  }
  sortY() { return this.ty * T; }
}

/* A magic candle: spin (Dreidel Suit) to light it. Groups of candles open dark alleys. */
class TCandle extends TEnt {
  constructor(d, sc) { super(d, sc); this.solid = true; this.lit = !!townState().flags[d.id]; this.wantsPower = !this.lit; }
  onSpin(sc) {
    if (this.lit) return;
    this.lit = true; this.wantsPower = false; townState().flags[this.id] = true;
    Sfx.light(); FX.sparkle(this.cx(), this.cy() - 30, 14, ['#ffd23f', '#fff6b0']);
    const group = sc.ents.filter(e => e instanceof TCandle && e.group === this.group);
    const n = group.filter(e => e.lit).length;
    if (n >= group.length) { Talk.say('All the candles are lit! The dark alley lights up!'); if (sc.map.onCandles) sc.map.onCandles(sc, this.group); }
    else Talk.say(`${NUM_WORDS[n]} candle${n > 1 ? 's' : ''} lit! ${NUM_WORDS[group.length - n]} more.`);
    saveState();
  }
  onBump(sc) { if (!this.lit) Talk.say(hasCostume('dreidel') ? 'Put on the Dreidel Suit and press X to spin next to the candle!' : 'A magic candle. Maybe a costume could light it.'); }
  draw(sc) {
    const x = this.cx(), base = this.ty * T + T - 6;
    rr(x - 14, base - 8, 28, 8, 3); paint('#e8b830', 2.5);
    rr(x - 7, base - 40, 14, 34, 3); paint('#e8f0ff', 2.5);
    ctx.fillStyle = '#4aa3ff'; for (let i = 0; i < 3; i++) ctx.fillRect(x - 6, base - 34 + i * 9, 12, 3);
    if (this.lit) drawFlame(x, base - 42, 1, this.t);
  }
}

/* Secret blue door into a Hebrew letter room. */
class THebDoor extends TEnt {
  constructor(d, sc) { super(d, sc); this.solid = true; }
  box() { return { x: this.tx * T + 6, y: this.ty * T + 4, w: T - 12, h: T - 2 }; }
  onBump(sc) {
    if (!S.settings.hebrew) { Talk.say('This door is closed today.'); return; }
    sc.go('heb', { x: 3, y: 5, back: this.back });
  }
  update(sc, dt) { this.t += dt; if (Math.random() < dt * 3) FX.sparkle(this.tx * T + Math.random() * T, this.ty * T + Math.random() * T, 1, ['#bfe6ff', '#4aa3ff']); }
  draw(sc) {
    const x = this.tx * T, y = this.ty * T;
    rr(x + 6, y - 8, T - 12, T + 4, 16); paint('#2f6fe0', 3);
    text('א', x + T / 2, y + 12, { size: 22, font: 'Noto Sans Hebrew', color: '#fff', lw: 4 });
  }
  sortY() { return (this.ty + 1) * T + 1; }
}

/* Hebrew room puzzle: walk to the letter Mazel names. */
class THebLetter extends TEnt {
  constructor(d, sc) { super(d, sc); this.cool = 0; }
  update(sc, dt) { this.t += dt; this.cool -= dt; }
  touch(sc) {
    const room = sc.hebRoom;
    if (!room || room.done || this.cool > 0) return;
    if (this.heb === room.target) {
      room.done = true;
      if (!S.hebrew.includes(this.heb[1])) S.hebrew.push(this.heb[1]);
      S.gems++;
      S.stats.hebrew[this.heb[1]] = (S.stats.hebrew[this.heb[1]] || 0) + 1;
      saveState();
      Sfx.fanfare(); FX.confetti(this.cx(), this.cy(), 40);
      Talk.say(`Yes! That's ${this.heb[2]}! You found a blue gem! Walk out the door when you're ready.`, { show: `Yes! ${this.heb[1]}! A blue gem!` });
      for (const e of sc.ents) if (e instanceof THebLetter && e !== this) e.dead = true;
    } else {
      this.cool = 1.5; Sfx.boing();
      Talk.say(`That's ${this.heb[2]}. Find ${room.target[2]}!`, { show: `That's ${this.heb[1]}. Find ${room.target[1]}!` });
    }
  }
  draw(sc) { drawLetterBubble(this.heb[0], this.cx(), this.cy() - 12 + Math.sin(this.t * 2.5) * 4, 26, { font: 'Noto Sans Hebrew', color: '#2f6fe0', alpha: this.cool > 0 ? 0.5 : 1 }); }
}

/* Read-a-sign: a short sentence to read (oral reading practice). */
class TSign extends TEnt {
  constructor(d, sc) { super(d, sc); this.solid = true; }
  onBump(sc) {
    if (sc.q) return;
    sc.ask(this, { story: true, type: 'story', level: 1, t0: performance.now(), card: { kind: 'story', text: this.text }, text: this.text, words: this.text.split(' ').length,
      prompt: this.q, show: this.q, choices: asChoices(shuffle(this.c), 'word'), answer: this.a, right: `${this.a}! Great reading!`, hint: () => `Let's read it again: ${this.text}` }, 'A sign! ');
  }
  answered(sc) { addTownTokens(sc, 2); }
  draw(sc) {
    const x = this.cx(), y = this.ty * T + T;
    rr(x - 3, y - 34, 6, 30, 2); paint('#8a6a4a', 2);
    rr(x - 22, y - 52, 44, 26, 5); paint('#fffaf0', 3);
    for (let i = 0; i < 3; i++) { ctx.fillStyle = '#8a8296'; ctx.fillRect(x - 15, y - 46 + i * 7, 30 - i * 6, 3); }
  }
}

/* A district boss: asleep until the neighbors are helped; then question rounds and a wake-up word. */
class TBoss extends TEnt {
  constructor(d, sc) {
    super(d, sc);
    this.solid = true;
    this.won = pageDone(d.page);
    this.view = d.kind === 'snoozie'
      ? { giant: true, skin: d.skin, info: { name: d.name, holidayLine: d.holidayLine, theme: d.theme }, t: 0, squash: 0, awake: false, hatOff: false }
      : new BossView(d.kind);
    this.view.awake = this.won; this.view.hatOff = this.won;
    this.hits = this.won ? 0 : progGet('boss-' + d.page);
  }
  box() { return { x: (this.tx - 1) * T, y: (this.ty - 1) * T, w: T * 3, h: T * 2 }; }
  update(sc, dt) { this.t += dt; this.view.t = this.t; this.view.squash = Math.max(0, (this.view.squash || 0) - dt * 3); if (!this.won && Math.random() < dt * 1.2) FX.add({ x: this.cx() + 30, y: this.ty * T - 80, vy: -40, vx: 20, life: 1.6, kind: 'zzz', size: 22 }); }
  onBump(sc) {
    if (this.won) { Talk.say(`${this.view.info.holidayLine} Thanks for waking me up!`); return; }
    if (sc.q || sc.trail) return;
    const need = this.need(sc);
    if (need > 0) { Talk.say(`${this.view.info.name} is too grumpy to wake up. Help ${NUM_WORDS[need]} more neighbor${need > 1 ? 's' : ''} first!`); return; }
    if (this.hits >= 5) { this.hits = 4; } // got all five but never spelled the word: one quick question, then the letters
    this.nextQ(sc, this.hits ? `Welcome back! ${NUM_WORDS[5 - this.hits]} more question${5 - this.hits > 1 ? 's' : ''} for ${this.view.info.name}! ` : `It's ${this.view.info.name}! Answer five questions to make him yawn! `);
  }
  need(sc) { return (this.helpers || []).filter(id => !townState().npcs[id]).length; }
  nextQ(sc, intro = '') { sc.ask(this, Ac.make(Ac.pickType(this.topics)), intro); }
  answered(sc) {
    this.hits++;
    progSet('boss-' + this.page, this.hits);
    this.view.squash = 1; Sfx.stomp(); FX.burst(this.cx(), this.ty * T - 40, 12, ['#ffd23f', '#fff'], { kind: 'spark', speed: 220, g: 0 });
    if (this.hits < 5) { sc.later(1.7, () => { if (!sc.q) this.nextQ(sc, `${5 - this.hits === 1 ? 'Last one!' : `${NUM_WORDS[5 - this.hits]} more!`} `); }); return; }
    this.view.hatOff = true;
    sc.later(1.8, () => {
      Talk.say('Big yawn! Letters fell out of his hat!');
      sc.startTrail(themeWord(this.view.info.theme).word, { x: this.cx(), y: this.cy() + T * 2 }, () => this.wake(sc));
    });
  }
  cancel() {}
  wake(sc) {
    progSet('boss-' + this.page, 0);
    this.won = true; this.view.awake = true;
    const st = townState();
    if (!st.pages.includes(this.page)) st.pages.push(this.page);
    addTownTokens(sc, 20);
    Music.play('win', { loop: false }); Sfx.fanfare(); Sfx.applause(2);
    FX.confetti(this.cx(), this.cy() - 60, 90);
    Talk.say(`He woke up happy! ${this.view.info.holidayLine} You won the ${this.pageName} calendar page! A new part of Brooklyn is open!`);
    saveState();
    sc.later(5, () => Music.play(sc.map.music || 'map'));
  }
  sortY() { return (this.ty + 1) * T; }
  draw(sc) {
    ctx.save();
    ctx.translate(this.cx(), (this.ty + 1) * T);
    const v = this.view;
    ctx.scale(-(1 + v.squash * 0.1), 1 - v.squash * 0.1);
    if (v.giant) { ctx.scale(3, 3); drawSnoozie({ x: -20, y: -40, w: 40, h: 40, skin: v.skin, t: this.t, face: 1, state: v.awake ? 'happy' : 'walk' }); }
    else if (v.kind === 'gourd') v.drawGourd(); else if (v.kind === 'dreidel') v.drawDreidel(); else { ctx.translate(0, -10); v.drawGobbler(); }
    ctx.restore();
  }
}

/* Teleport tile (subway stairs, exits). */
/* Signpost: words to read (with an arrow). Space has Mazel read it. */
class TSignpost extends TEnt {
  constructor(d, sc) { super(d, sc); this.solid = true; }
  onBump(sc) {
    if (sc.q) return;
    sc.reading = { owner: this, text: this.text, dir: this.dir, t: 0, heard: false };
    Talk.say('Can you read the sign? Press the space bar and I will read it with you.', { show: 'Read the sign! (SPACE = hear it)' });
  }
  sortY() { return (this.ty + 1) * T; }
  draw(sc) {
    const x = this.cx(), y = this.ty * T + T;
    rr(x - 3, y - 50, 6, 46, 2); paint('#8a6a4a', 2);
    rr(x - 30, y - 74, 60, 30, 5); paint('#fffaf0', 3);
    drawSignArrow(x + 16, y - 59, this.dir, 0.35);
    for (let i = 0; i < 2; i++) { ctx.fillStyle = '#8a8296'; ctx.fillRect(x - 24, y - 66 + i * 10, 24, 3); }
  }
}

/* A guide: tells her where to go next, and shows the words to read along. */
class TGuide extends TEnt {
  constructor(d, sc) { super(d, sc); this.solid = true; }
  onBump(sc) {
    if (sc.q) return;
    const g = townGoal(sc);
    const line = `${this.intro ? this.intro + ' ' : ''}${g.guide || g.say}`;
    sc.reading = { owner: this, text: g.short, t: 0, heard: true };
    Talk.say(line, { show: g.short });
  }
  sortY() { return (this.ty + 1) * T - 4; }
  draw(sc) {
    const x = this.cx(), y = this.ty * T + T - 6;
    ctx.globalAlpha = 0.25; ellipse(x, y, 16, 6); paint(OUT, 0); ctx.globalAlpha = 1;
    drawHero(x, y, { look: this.look, costume: 'none', mazel: false, face: sc.p.x < x ? -1 : 1, scale: 0.85 });
    if (this.hat) this.hat(x, y - 72);
    // speech bubble icon
    const by = y - 94 + Math.sin(this.t * 3) * 3;
    rr(x - 16, by - 12, 32, 24, 8); paint('#fffaf0', 3);
    for (let i = 0; i < 3; i++) { circle(x - 8 + i * 8, by, 2.5); paint(OUT, 0); }
  }
}

/* Babka, the lost cat: walk up to her and she follows you. */
class TLostCat extends TEnt {
  constructor(d, sc) { super(d, sc); const f = townState().flags; this.dead = !!(f.catFollow || f.catHome); }
  box() { return { x: this.tx * T + 4, y: this.ty * T + 4, w: T - 8, h: T - 8 }; }
  update(sc, dt) { this.t += dt; if (Math.random() < dt * 0.4) { FX.pop(this.cx(), this.ty * T - 10, 'meow?', '#fff'); } }
  touch(sc) {
    const st = townState();
    this.dead = true;
    st.flags.catFollow = true; st.flags.catAsked = true;
    saveState();
    Sfx.meow(); FX.sparkle(this.cx(), this.cy(), 14, ['#ff5fa2', '#fff']);
    Talk.say("You found Babka! She will follow you. Bring her home to Mrs. Levi on Halloween Street! Press the space bar to pet her.", { show: 'You found Babka! (SPACE = pet her)' });
  }
  sortY() { return (this.ty + 1) * T - 6; }
  draw(sc) { drawCat(this.cx(), this.ty * T + T - 8, this.t, { color: '#9a92a8', stripe: '#6a6278', face: Math.sin(this.t * 0.5) > 0 ? 1 : -1, sleepy: Math.sin(this.t) > 0.5 }); }
}

/* Mrs. Levi, whose cat Babka is lost. Bringing Babka home counts as helping her, and she gives Sadelle a kitten. */
class TCatOwner extends TNpc {
  onBump(sc) {
    const st = townState();
    if (sc.q) return;
    if (this.done) { Talk.say(pick(['How is little Kugel? Give her a pet with the space bar!', 'Babka is so happy to be home!', 'Thank you again, Sadelle!'])); return; }
    if (st.flags.catFollow) {
      st.flags.catFollow = false; st.flags.catHome = true; st.flags.kitten = true;
      st.npcs[this.id] = true; this.done = true;
      addTownTokens(sc, 10); saveState();
      Sfx.fanfare(); Sfx.meow(); FX.confetti(this.cx(), this.cy() - 30, 50);
      Talk.say("Babka! You found her! Thank you, Sadelle! Babka had kittens, and this little one loves you. Would you like to keep her? Her name is Kugel! She will follow you everywhere. Press the space bar to pet her!", { show: 'You adopted a kitten named Kugel!' });
      if (sc.map.onHelp) sc.map.onHelp(sc, this);
      return;
    }
    st.flags.catAsked = true; saveState();
    Talk.say("Oh, Sadelle, please help! My cat Babka ran away. I think she is hiding in Prospect Park. Can you find her and bring her home? Follow the yellow arrow!", { show: 'Find Babka the cat in the park!' });
  }
  draw(sc) {
    super.draw(sc);
    if (townState().flags.catHome) drawCat(this.cx() + 30, this.ty * T + T - 4, this.t, { color: '#9a92a8', stripe: '#6a6278', face: -1, sleepy: Math.sin(this.t * 0.7) > 0 });
  }
}

/* Mr. Snooze waits at the stoop once all three calendar pages are won: the big finale. */
class TSnooze extends TEnt {
  constructor(d, sc) { super(d, sc); this.solid = true; this.awake = !!townState().flags.finale; this.hits = 0; }
  get here() { return ['halloween', 'thanks', 'hanukkah'].every(pageDone); }
  box() { return this.here ? { x: (this.tx - 1) * T, y: (this.ty - 1) * T, w: T * 3, h: T * 2 } : { x: -999, y: -999, w: 0, h: 0 }; }
  update(sc, dt) { this.t += dt; if (this.here && !this.awake && Math.random() < dt) FX.add({ x: this.cx() + 50, y: this.ty * T - 110, vy: -40, vx: 20, life: 1.6, kind: 'zzz', size: 26 }); if (this.awake && Math.random() < dt * 2) FX.confetti(this.cx() + (Math.random() - 0.5) * 400, this.ty * T - 200, 6); }
  onBump(sc) {
    if (this.awake) { Talk.say("Thank you for waking me up! I love holidays now! Let's party!"); return; }
    if (sc.q) return;
    this.hits = progGet('snooze');
    if (this.hits) { sc.ask(this, Ac.make(Ac.pickType(READING_TYPES.concat(MATH_TYPES))), `Welcome back! ${NUM_WORDS[5 - this.hits]} more to wake up Mr. Snooze! `); return; }
    sc.ask(this, Ac.make(Ac.pickType(READING_TYPES.concat(MATH_TYPES))), "It's Mr. Snooze! He took the holidays because he was grumpy and sleepy. Answer five questions to wake him up! ");
  }
  answered(sc) {
    this.hits++;
    progSet('snooze', this.hits);
    Sfx.stomp(); FX.burst(this.cx(), this.ty * T - 80, 14, ['#ffd23f', '#fff'], { kind: 'spark', speed: 220, g: 0 });
    if (this.hits < 5) { sc.later(1.6, () => { if (!sc.q) sc.ask(this, Ac.make(Ac.pickType(READING_TYPES.concat(MATH_TYPES))), `${NUM_WORDS[5 - this.hits]} more! `); }); return; }
    this.awake = true;
    progSet('snooze', 0);
    townState().flags.finale = true;
    addTownTokens(sc, 50);
    saveState();
    Music.play('win', { loop: false }); Sfx.fanfare(); Sfx.applause(3);
    FX.confetti(this.cx(), this.ty * T - 100, 120);
    sc.party = { t: 0 };
    Talk.say("Mr. Snooze woke up happy! Thank you, Sadelle! But oh no... my cousin, Mrs. Doze, took the rest of the year's calendar pages and hid them all over New York City! Can you get them back? Walk north on the big street to DUMBO! Press M to see the map.");
    sc.later(8, () => Music.play(sc.map.music || 'map'));
  }
  cancel() {}
  sortY() { return (this.ty + 1) * T; }
  draw(sc) {
    if (!this.here) return;
    const bob = Math.sin(this.t * 2) * 4;
    ctx.globalAlpha = 0.25; ellipse(this.cx(), (this.ty + 1) * T - 4, 60, 12); paint(OUT, 0); ctx.globalAlpha = 1;
    drawMrSnooze(this.cx(), this.ty * T - 30 + bob, 0.55, this.t, this.awake);
    if (this.awake) {
      // party balloons and a banner
      for (let i = 0; i < 5; i++) {
        const bx = this.cx() - 160 + i * 80, byy = this.ty * T - 150 + Math.sin(this.t * 2 + i) * 8;
        ctx.strokeStyle = OUT; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, byy + 22); ctx.lineTo(bx + 4, byy + 80); ctx.stroke();
        ellipse(bx, byy, 18, 22); paint(['#ff5fa2', '#ffd23f', '#3ec1d3', '#8be06b', '#b07cff'][i], 3);
      }
    }
  }
}

class TWarp extends TEnt {
  touch(sc) { if (this.action) this.action(sc); else sc.go(this.to, this.at); }
  box() { return { x: this.tx * T + 8, y: this.ty * T + 8, w: T - 16, h: T - 16 }; }
  draw(sc) { if (this.icon) this.icon(this.cx(), this.cy(), sc); }
  sortY() { return this.ty * T; }
}

class TDeco extends TEnt {
  constructor(d, sc) { super(d, sc); this.solid = !!d.solid; }
  draw(sc) { this.art(this.cx(), (this.ty + 1) * T, this.t, sc); }
  sortY() { return (this.ty + 1) * T - 2; }
}

function makeTownEnt(d, sc) {
  const C = (typeof TOWN_EXTRA_ENTS !== 'undefined' && TOWN_EXTRA_ENTS[d.type]) || { lostcat: TLostCat, catlady: TCatOwner, signpost: TSignpost, guide: TGuide, snooze: TSnooze, npc: TNpc, door: TDoor, chest: TChest, bagel: TBagel, gate: TGate, manhole: TManhole, candle: TCandle, heb: THebDoor, hebletter: THebLetter, sign: TSign, boss: TBoss, warp: TWarp, deco: TDeco }[d.type];
  if (d.type === 'bagel' && !d.id) d = { ...d, id: `${sc.mapId}-${d.x}-${d.y}` };
  return C ? new C(d, sc) : null;
}

function drawSignArrow(x, y, dir, s = 1) {
  const a = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[dir] ?? 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-36, -12); ctx.lineTo(8, -12); ctx.lineTo(8, -28); ctx.lineTo(38, 0); ctx.lineTo(8, 28); ctx.lineTo(8, 12); ctx.lineTo(-36, 12); ctx.closePath();
  paint('#ff8a1f', 4);
  ctx.restore();
}
