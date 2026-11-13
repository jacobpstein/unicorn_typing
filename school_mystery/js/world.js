'use strict';

/*
  The walk-around world: top-down, arrow keys, no jumping, no enemies, nothing that can hurt her.
  Walk into a person, sign, door or glowing station to use it. A yellow arrow always points to the next goal.
*/

const SOLID = new Set(['#', 'W', 'L', 'D', 'C', 'B', 'T', 'R', 'x', 'K', 'S', 'P', 'O', 'V', 'Y', '~']);
const TALL = new Set(['#', 'W', 'L', 'B', 'T', 'K', 'S', 'P', 'O', 'V', 'Y']);
const WALK_SPEED = 215;

/* ---------- Map builder ---------- */
class MB {
  constructor(w, h, fill = '.') { this.w = w; this.h = h; this.g = Array.from({ length: h }, () => Array(w).fill(fill)); this.ents = []; }
  set(x, y, ch) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.g[y][x] = ch; return this; }
  rect(x, y, w, h, ch) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, ch); return this; }
  room(x, y, w, h, wall, floor) { this.rect(x, y, w, h, wall); this.rect(x + 1, y + 2, w - 2, h - 3, floor); this.rect(x + 1, y + 1, w - 2, 1, wall); return this; }
  ent(type, x, y, o = {}) { this.ents.push({ type, x, y, ...o }); return this; }
  build(o = {}) { return { w: this.w, h: this.h, rows: this.g.map(r => r.join('')), ents: this.ents, ...o }; }
}

/* ---------- The world scene ---------- */
class WorldScene {
  constructor(mapId, at = null) {
    this.mapId = mapId;
    this.t = 0;
    this.map = MAPS[mapId]();
    this.grid = this.map.rows.map(r => r.split(''));
    this.W = this.map.w; this.H = this.map.h;
    this.ents = this.map.ents.map(d => makeEnt(d, this)).filter(Boolean);
    const spawn = at || this.map.spawn;
    this.p = { x: spawn.x * T + T / 2, y: spawn.y * T + T - 6, face: 1, run: 0, moving: false, bumpCool: 0.4 };
    this.cam = { x: 0, y: 0 };
    this.fade = 1; this.fadeTo = null;
    this.hist = [];
    this.timers = [];
    this.overlay = null;
    this.near = null;
    this.updateCam(1, true);
    FX.list = [];
    S.at = { map: mapId, x: spawn.x, y: spawn.y };
    Music.play(this.map.music || 'school');
    if (this.map.enter) this.later(0.5, () => this.map.enter(this));
    this.later(0.3, () => checkStory(this));
  }
  later(sec, fn) { this.timers.push({ t: sec, fn }); }

  tile(x, y) { return y < 0 || y >= this.H || x < 0 || x >= this.W ? '#' : this.grid[y][x]; }
  solidTile(tx, ty) { return SOLID.has(this.tile(tx, ty)); }
  boxHits(x, y, w, h) {
    const x0 = Math.floor(x / T), x1 = Math.floor((x + w - 0.01) / T), y0 = Math.floor(y / T), y1 = Math.floor((y + h - 0.01) / T);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (this.solidTile(tx, ty)) return true;
    return false;
  }
  pbox(x = this.p.x, y = this.p.y) { return { x: x - 13, y: y - 14, w: 26, h: 14 }; }

  move(dx, dy) {
    const p = this.p;
    for (const [ax, ay] of [[dx, 0], [0, dy]]) {
      if (!ax && !ay) continue;
      const nx = p.x + ax, ny = p.y + ay, b = this.pbox(nx, ny);
      const hit = this.ents.find(e => e.solid && !e.hidden && overlap(b, e.box()));
      if (hit) { this.contactNow = hit; continue; }
      if (this.boxHits(b.x, b.y, b.w, b.h)) {
        // slide around corners so she never gets stuck on an edge
        for (const n of [6, 12, 18]) {
          if (ax && !this.boxHits(b.x, b.y - n, b.w, b.h)) { p.y -= 1.5; break; }
          if (ax && !this.boxHits(b.x, b.y + n, b.w, b.h)) { p.y += 1.5; break; }
          if (ay && !this.boxHits(b.x - n, b.y, b.w, b.h)) { p.x -= 1.5; break; }
          if (ay && !this.boxHits(b.x + n, b.y, b.w, b.h)) { p.x += 1.5; break; }
        }
        continue;
      }
      p.x = nx; p.y = ny;
    }
  }

  updateCam(dt, snap) {
    const tx = clamp(this.p.x - VW / 2, 0, Math.max(0, this.W * T - VW));
    const ty = clamp(this.p.y - 30 - VH / 2, 0, Math.max(0, this.H * T - VH));
    if (snap) { this.cam.x = tx; this.cam.y = ty; }
    else { this.cam.x += (tx - this.cam.x) * Math.min(1, dt * 6); this.cam.y += (ty - this.cam.y) * Math.min(1, dt * 6); }
    if (this.W * T < VW) this.cam.x = (this.W * T - VW) / 2;
    if (this.H * T < VH) this.cam.y = (this.H * T - VH) / 2;
  }

  go(mapId, at) {
    if (this.fadeTo) return;
    Sfx.door();
    this.fadeTo = () => Game.go(new WorldScene(mapId, at));
  }

  /* Open a challenge, studio, notebook or shop screen on top of the world. */
  open(ov) { this.overlay = ov; ov.scene = this; Input.typing = !!ov.typing; }
  close() { this.overlay = null; Input.typing = false; this.p.bumpCool = 0.6; saveState(); }

  update(dt) {
    this.t += dt;
    Talk.update(dt);
    if (this.fadeTo) {
      this.fade = Math.min(1, this.fade + dt * 4);
      if (this.fade >= 1) { const f = this.fadeTo; this.fadeTo = null; saveState(); f(); }
      return;
    }
    this.fade = Math.max(0, this.fade - dt * 3);
    for (const tm of this.timers.slice()) { tm.t -= dt; if (tm.t <= 0) { this.timers.splice(this.timers.indexOf(tm), 1); tm.fn(); } }
    FX.update(dt);
    if (Input.clicked(SPEAKER) || (!this.overlay && Input.clicked({ x: 12, y: 64, w: 420, h: 36 }))) replayPrompt(this);
    if (this.overlay) { this.overlay.update(dt); this.updateCam(dt); return; }

    if (Input.key('enter') && !this.near) { const g = currentGoal(); Talk.say(g.say, { show: g.short }); }
    if (Input.key('n')) { this.open(new NotebookOverlay()); return; }
    if (Input.clicked({ x: VW - 128, y: 14, w: 52, h: 48 })) { this.open(new NotebookOverlay()); return; }
    if (pastStep('ruby') && (Input.key('j') || Input.clicked({ x: VW - 192, y: 14, w: 52, h: 48 }))) { this.open(new StudioOverlay()); return; }

    const p = this.p;
    p.bumpCool -= dt;
    this.contactNow = null;
    let dx = (Input.held('right') ? 1 : 0) - (Input.held('left') ? 1 : 0);
    let dy = (Input.held('down') ? 1 : 0) - (Input.held('up') ? 1 : 0);
    if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
    p.moving = !!(dx || dy);
    if (dx) p.face = Math.sign(dx);
    if (p.moving) { p.run += dt * 12; this.move(dx * WALK_SPEED * dt, dy * WALK_SPEED * dt); }
    // walking into something uses it once; keep holding the arrow and nothing repeats
    if (!p.moving) this.contactNow = this.contact; // standing still keeps the same contact
    if (this.contactNow && this.contactNow !== this.contact && p.bumpCool <= 0 && this.contactNow.onBump) { p.bumpCool = 0.4; this.contact = this.contactNow; this.contactNow.onBump(this); }
    else if (!this.contactNow || this.contactNow === this.contact || !this.contactNow.onBump) this.contact = this.contactNow; // a new contact during the cooldown waits for it
    if (this.overlay) return;
    if (!this.hist.length || Math.hypot(this.hist[0].x - p.x, this.hist[0].y - p.y) > 3) { this.hist.unshift({ x: p.x, y: p.y }); if (this.hist.length > 80) this.hist.length = 80; }

    // the closest thing she can use: SPACE uses it too (for when walking into it feels fiddly)
    this.near = null;
    let best = T * 1.3;
    for (const e of this.ents) {
      if (e.hidden || !e.onBump) continue;
      const d = Math.hypot(e.cx() - p.x, e.cy() + T / 2 - p.y);
      if (d < best) { best = d; this.near = e; }
    }
    if (this.near && (Input.key(' ') || Input.key('enter'))) { this.near.onBump(this); this.p.bumpCool = 0.6; }
    else if (Input.key(' ') && S.pet) this.petPet();

    // a gentle hint about a hidden pet after a minute here
    if (!this.petHint && this.t > 60 && !Speech.speaking) {
      const pet = this.ents.find(e => e instanceof PetSpot && !e.hidden);
      if (pet) { this.petHint = true; Talk.say(`Mrrp! I hear a little ${pet.pet} somewhere in here. Look for the question mark!`); }
    }
    for (const e of this.ents) if (!e.hidden && e.update) e.update(this, dt);
    for (const e of this.ents) if (!e.hidden && e.touch && overlap(this.pbox(), e.box())) e.touch(this);
    if (this.map.tick) this.map.tick(this, dt);
    this.updateCam(dt);
  }

  petPet() {
    const f = this.follower();
    if (!f || Math.hypot(f.x - this.p.x, f.y - this.p.y) > T * 2.5) return;
    Sfx.chime(); FX.hearts(f.x, f.y - 30);
    const nm = PET_INFO[S.pet].short;
    Talk.say(pick([`${nm} loves you!`, `${nm} is so happy!`, `Good job, ${nm}!`, `${nm} wiggles with joy!`]));
  }
  follower() {
    if (!S.pet) return null;
    const h = this.hist[Math.min(this.hist.length - 1, 22)] || { x: this.p.x - 50, y: this.p.y };
    const ahead = this.hist[Math.max(0, 16)] || this.p;
    return { x: h.x, y: h.y, face: ahead.x >= h.x ? 1 : -1 };
  }

  /* ----- drawing ----- */
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
      drawGround(this, ch, tx, ty);
      if (TALL.has(ch)) tall.push({ y: (ty + 1) * T, draw: () => drawTall(this, ch, tx, ty) });
    }
    const list = tall.concat(this.ents.filter(e => !e.hidden && e.draw).map(e => ({ y: e.sortY ? e.sortY() : (e.ty + 1) * T, draw: () => e.draw(this) })));
    const f = this.follower();
    if (f) list.push({ y: f.y, draw: () => drawPet(S.pet, f.x, f.y, this.t, { face: f.face, walking: this.p.moving, scale: 0.85 }) });
    list.push({ y: this.p.y, draw: () => this.drawPlayer() });
    list.sort((a, b) => a.y - b.y);
    for (const d of list) d.draw();
    if (!this.overlay) this.drawGoalArrow();
    FX.draw();
    ctx.restore();
    if (this.map.dark) { ctx.fillStyle = this.map.dark; ctx.fillRect(0, 0, VW, VH); }
    this.drawHUD();
    if (this.overlay) this.overlay.draw();
    if (this.fade > 0) { ctx.fillStyle = `rgba(20,10,30,${this.fade})`; ctx.fillRect(0, 0, VW, VH); }
  }
  drawPlayer() {
    const p = this.p;
    ctx.globalAlpha = 0.25; ellipse(p.x, p.y, 16, 6); paint(OUT, 0); ctx.globalAlpha = 1;
    drawHero(p.x, p.y, { face: p.face, run: p.moving ? p.run : 0, scale: 0.9, blink: Math.sin(this.t * 1.3) > 0.97 });
  }

  goalPoint() {
    const g = currentGoal();
    if (!g.map) return null;
    if (g.map === this.mapId) {
      const e = g.ent && this.ents.find(x => x.id === g.ent && !x.hidden);
      return e ? { x: e.cx(), y: e.cy() } : g.x != null ? { x: g.x * T + T / 2, y: g.y * T + T / 2 } : null;
    }
    const hop = routeNext(this.mapId, g.map);
    const d = this.ents.find(e => e.to === hop && !e.hidden);
    return d ? { x: d.cx(), y: d.cy() } : null;
  }
  drawGoalArrow() {
    const gp = this.goalPoint();
    if (!gp) return;
    const sy = gp.y - 64 + Math.sin(this.t * 4) * 6;
    ctx.globalAlpha = 0.9; star(gp.x, sy, 14 + Math.sin(this.t * 6) * 2); paint('#ffd23f', 3); ctx.globalAlpha = 1;
    const dx = gp.x - this.p.x, dy = gp.y - (this.p.y - 20), d = Math.hypot(dx, dy);
    if (d < T * 2) return;
    const a = Math.atan2(dy, dx), r = 64 + Math.sin(this.t * 5) * 6;
    ctx.save(); ctx.translate(this.p.x + Math.cos(a) * r, this.p.y - 34 + Math.sin(a) * r); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(-10, -16); ctx.lineTo(-4, 0); ctx.lineTo(-10, 16); ctx.closePath(); paint('#ffd23f', 3);
    ctx.restore();
  }
  drawHUD() {
    // coins
    rr(12, 12, 104, 44, 14); paint('rgba(255,250,240,.92)', 3);
    drawCoin(36, 34, this.t); text(String(S.coins), 58, 35, { size: 24, color: OUT, stroke: null, align: 'left' });
    // clues
    rr(124, 12, 110, 44, 14); paint('rgba(255,250,240,.92)', 3);
    drawMagnifier(148, 33);
    text(`${S.clues.length}/${CLUE_ORDER.length}`, 170, 35, { size: 22, color: OUT, stroke: null, align: 'left' });
    // place name
    if (this.map.title) text(this.map.title, VW / 2, 30, { size: 22, color: '#fffaf0', lw: 5 });
    // goal banner
    if (!this.overlay) {
      const g = currentGoal();
      ctx.font = '600 19px Fredoka, sans-serif';
      const w = ctx.measureText(g.short).width + 58;
      rr(12, 64, w, 36, 12); paint('rgba(255,246,200,.95)', 3);
      star(32, 82, 10); paint('#ffd23f', 2);
      text(g.short, 50, 83, { size: 19, color: OUT, align: 'left', stroke: null, weight: 600 });
    }
    // notebook + speaker buttons
    rr(VW - 128, 14, 52, 48, 10); paint('#e8442f', 3); rr(VW - 120, 22, 36, 6, 2); paint('#ffd23f', 0); text('N', VW - 102, 44, { size: 18, color: '#fffaf0', lw: 3 });
    drawSpeaker(VW - 40, 38, Speech.speaking);
    if (pastStep('ruby')) { rr(VW - 192, 14, 52, 48, 10); paint('#ffb3c8', 3); for (let k = 0; k < 3; k++) drawBead(['pink', 'blue', 'yellow'][k], VW - 178 + k * 12, 36 + (k % 2) * 5, 6); text('J', VW - 166, 54, { size: 13, color: OUT, stroke: null }); }
    // "press space" hint near something usable
    if (this.near && !this.overlay && Math.sin(this.t * 4) > -0.4) {
      const sx = this.near.cx() - this.cam.x, sy = this.near.ty * T - this.cam.y - 34;
      if (sy > 60) drawKey('SPACE', sx, sy - 40, '#8be06b', 92);
    }
    if (!this.overlay) Talk.draw(true);
  }
}

function drawCoin(x, y, t = 0) {
  const sx = Math.abs(Math.cos(t * 2)) * 0.6 + 0.4;
  ctx.save(); ctx.translate(x, y); ctx.scale(sx, 1);
  circle(0, 0, 13); paint('#ffd23f', 3); circle(0, 0, 8); paint(null, 2, '#e0a020');
  ctx.restore();
}
function drawMagnifier(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = OUT; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(6, 6); ctx.lineTo(14, 14); ctx.stroke();
  ctx.strokeStyle = '#8a5a32'; ctx.lineWidth = 4; ctx.stroke();
  circle(0, 0, 10); paint('rgba(190,230,255,.85)', 3);
  ctx.restore();
}

/* ---------- Tiles ---------- */
const TILE_PAL = {
  school: { floor: '#e8dcc0', floor2: '#dccfae', wall: '#f2a65a', wallTop: '#a85a2a' },
  tunnel: { floor: '#6a5a50', floor2: '#5e4e46', wall: '#8a7a6a', wallTop: '#4a3a32' },
  museum: { floor: '#ece6f2', floor2: '#ddd4e8', wall: '#c8bcd8', wallTop: '#6a5a8a' },
  rink: { floor: '#dff2ff', floor2: '#cbe8fb', wall: '#9ac8e8', wallTop: '#3a6a9a' },
  station: { floor: '#d8d0c0', floor2: '#cac0ae', wall: '#d6b37a', wallTop: '#5a4a3a' },
  coney: { floor: '#c8925a', floor2: '#b8824a', wall: '#ff8a8a', wallTop: '#c8322f' },
  aquarium: { floor: '#9ad0e0', floor2: '#88c0d4', wall: '#3a7aa8', wallTop: '#1a3a6a' },
  library: { floor: '#c8a07a', floor2: '#b8906a', wall: '#a0523f', wallTop: '#5a2a20' },
  shop: { floor: '#f2d8c8', floor2: '#e8c8b4', wall: '#ffb3c8', wallTop: '#b0306a' },
};
function pal(sc) { return TILE_PAL[sc.map.pal || 'school']; }

/*
  Ground: . floor  , grass  ~ water  i ice  s sand  b boardwalk  r rails  m marble  c carpet  t tunnel dirt  = road  g glow path
  Tall/solid: # wall  W window wall  L lockers  B bookshelf  T tree  K display case  S shelf  P plant  O booth  V vending  Y fence
  Solid flat: D desk  C counter  R rail bed  x hole/edge
*/
function drawGround(sc, ch, tx, ty) {
  const x = tx * T, y = ty * T, P = pal(sc), n = (tx * 7 + ty * 13) % 5;
  switch (ch) {
    case ',': ctx.fillStyle = '#8cc265'; ctx.fillRect(x, y, T, T); ctx.fillStyle = '#7ab055'; ctx.fillRect(x + n * 8, y + 8 + n * 5, 3, 7); ctx.fillRect(x + 30 - n * 3, y + 30, 3, 7); break;
    case '~': ctx.fillStyle = '#4a90d8'; ctx.fillRect(x, y, T, T); ctx.fillStyle = '#bfe6ff'; ellipse(x + 14 + Math.sin(sc.t * 2 + tx) * 4, y + 16, 8, 3); ctx.fill(); ellipse(x + 34, y + 34 + Math.sin(sc.t * 2 + ty) * 3, 7, 2.5); ctx.fill(); break;
    case 'i': ctx.fillStyle = '#e4f4ff'; ctx.fillRect(x, y, T, T); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 4 + n * 5, y + 10); ctx.lineTo(x + 26 + n * 4, y + 20); ctx.moveTo(x + 10, y + 36 - n); ctx.lineTo(x + 30, y + 30); ctx.stroke(); break;
    case 's': ctx.fillStyle = '#f2dca0'; ctx.fillRect(x, y, T, T); ctx.fillStyle = '#e2c888'; ctx.fillRect(x + n * 8, y + 8 + n * 6, 4, 3); ctx.fillRect(x + 30 - n * 4, y + 34, 3, 3); break;
    case 'b': ctx.fillStyle = '#c8925a'; ctx.fillRect(x, y, T, T); ctx.fillStyle = '#a8743e'; for (let i = 0; i < 3; i++) ctx.fillRect(x, y + 15 + i * 16, T, 2); break;
    case 'r': ctx.fillStyle = '#7a6a5a'; ctx.fillRect(x, y, T, T); ctx.fillStyle = '#5a4a3a'; for (let i = 0; i < 3; i++) ctx.fillRect(x + 4 + i * 16, y, 8, T); ctx.fillStyle = '#c0c8d8'; ctx.fillRect(x, y + 10, T, 4); ctx.fillRect(x, y + 34, T, 4); break;
    case 'm': ctx.fillStyle = (tx + ty) % 2 ? '#f2eef6' : '#e2dcea'; ctx.fillRect(x, y, T, T); break;
    case 'c': ctx.fillStyle = sc.map.carpet || '#c84a5a'; ctx.fillRect(x, y, T, T); ctx.fillStyle = shade(sc.map.carpet || '#c84a5a', 0.12); if ((tx + ty) % 2) ctx.fillRect(x + 8, y + 8, T - 16, T - 16); break;
    case 't': ctx.fillStyle = '#5e4e46'; ctx.fillRect(x, y, T, T); ctx.fillStyle = '#4e3e36'; ctx.fillRect(x + n * 7, y + 10 + n * 4, 8, 5); ctx.fillRect(x + 30 - n * 2, y + 32, 6, 4); break;
    case '=': ctx.fillStyle = '#5a5a66'; ctx.fillRect(x, y, T, T); if (ty % 2 === 0 && tx % 3 === 0) { ctx.fillStyle = '#e8e0a0'; ctx.fillRect(x + 8, y + T / 2 - 2, 26, 4); } break;
    case 'g': ctx.fillStyle = P.floor; ctx.fillRect(x, y, T, T); ctx.globalAlpha = 0.35 + Math.sin(sc.t * 3 + tx + ty) * 0.15; ctx.fillStyle = '#fff6b0'; ctx.fillRect(x + 6, y + 6, T - 12, T - 12); ctx.globalAlpha = 1; break;
    case 'k': ctx.fillStyle = (tx + ty) % 2 ? '#f6f0e4' : '#3a3a48'; ctx.fillRect(x, y, T, T); break;
    case 'D': {
      ctx.fillStyle = (tx + ty) % 2 ? P.floor : P.floor2; ctx.fillRect(x, y, T, T);
      rr(x + 4, y + 8, T - 8, T - 14, 5); paint('#c89a62', 3); rr(x + 8, y + 12, T - 16, 6, 2); paint('#e0b47a', 0);
      for (const lx of [x + 8, x + T - 12]) { ctx.fillStyle = '#7a5a3a'; ctx.fillRect(lx, y + T - 8, 4, 6); }
      break;
    }
    case 'C': ctx.fillStyle = '#9a6a3e'; ctx.fillRect(x, y + 8, T, T - 8); ctx.fillStyle = '#e8d0a8'; ctx.fillRect(x, y, T, 14); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, T - 3, T - 3); break;
    case 'R': ctx.fillStyle = '#3a3036'; ctx.fillRect(x, y, T, T); ctx.fillStyle = '#5a4a3a'; for (let i = 0; i < 4; i++) ctx.fillRect(x, y + 4 + i * 12, T, 6); ctx.fillStyle = '#c0c8d8'; ctx.fillRect(x + 10, y, 4, T); ctx.fillRect(x + 34, y, 4, T); break;
    case 'x': ctx.fillStyle = '#1a1220'; ctx.fillRect(x, y, T, T); break;
    default: { // floor
      ctx.fillStyle = (tx + ty) % 2 ? P.floor : P.floor2; ctx.fillRect(x, y, T, T);
    }
  }
}

function drawTall(sc, ch, tx, ty) {
  const x = tx * T, y = ty * T, P = pal(sc);
  const below = sc.tile(tx, ty + 1), above = sc.tile(tx, ty - 1);
  const edge = () => {
    ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.beginPath();
    if (sc.tile(tx - 1, ty) !== ch) { ctx.moveTo(x + 1.5, y); ctx.lineTo(x + 1.5, y + T); }
    if (sc.tile(tx + 1, ty) !== ch) { ctx.moveTo(x + T - 1.5, y); ctx.lineTo(x + T - 1.5, y + T); }
    if (above !== ch) { ctx.moveTo(x, y + 1.5); ctx.lineTo(x + T, y + 1.5); }
    if (below !== ch) { ctx.moveTo(x, y + T - 1.5); ctx.lineTo(x + T, y + T - 1.5); }
    ctx.stroke();
  };
  switch (ch) {
    case '#': case 'W': {
      const wall = sc.map.wall || P.wall;
      if (!SOLID.has(below) || below === 'D' || below === 'C') {
        ctx.fillStyle = wall; ctx.fillRect(x, y, T, T);
        ctx.fillStyle = shade(wall, -0.18); ctx.fillRect(x, y + T - 8, T, 8);
        if (ch === 'W') { rr(x + 8, y + 6, T - 16, 26, 3); paint('#bfe6ff', 2.5); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fillRect(x + 12, y + 10, 6, 14); }
        else if (sc.map.brick) { ctx.fillStyle = shade(wall, -0.1); for (let r = 0; r < 3; r++) for (let i = -1; i < 3; i++) ctx.fillRect(x + i * 20 + (r % 2) * 10 + 2, y + 2 + r * 13, 16, 10); }
      } else { ctx.fillStyle = sc.map.wallTop || P.wallTop; ctx.fillRect(x, y, T, T); }
      edge();
      break;
    }
    case 'L': {
      ctx.fillStyle = sc.map.lockers || '#4a7ad8'; ctx.fillRect(x, y, T, T);
      ctx.strokeStyle = OUT; ctx.lineWidth = 2; ctx.strokeRect(x + 2, y + 2, T / 2 - 2, T - 4); ctx.strokeRect(x + T / 2, y + 2, T / 2 - 2, T - 4);
      ctx.fillStyle = shade(sc.map.lockers || '#4a7ad8', -0.3); for (const lx of [x + 6, x + T / 2 + 4]) for (let i = 0; i < 3; i++) ctx.fillRect(lx, y + 8 + i * 4, 12, 2);
      circle(x + T / 2 - 5, y + 28, 2); paint('#c0c8d8', 0); circle(x + T - 6, y + 28, 2); paint('#c0c8d8', 0);
      edge(); break;
    }
    case 'B': {
      ctx.fillStyle = '#7a4a2a'; ctx.fillRect(x, y, T, T);
      for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) { ctx.fillStyle = ['#e8442f', '#2f6fe0', '#ffd23f', '#3a8a5a', '#b07cff'][(i + r + tx) % 5]; ctx.fillRect(x + 4 + i * 8, y + 4 + r * 15, 6, 12); }
      edge(); break;
    }
    case 'T': {
      drawGround(sc, ',', tx, ty);
      rr(x + 19, y + 18, 10, 26, 3); paint('#6a4630', 2.5);
      circle(x + T / 2, y + 4, 26); paint(sc.map.treeColor || '#4a9a4a', 3);
      circle(x + T / 2 - 8, y - 4, 12); paint(shade(sc.map.treeColor || '#4a9a4a', 0.15), 0);
      break;
    }
    case 'K': {
      drawGround(sc, '.', tx, ty);
      rr(x + 4, y + 20, T - 8, T - 22, 4); paint('#8a6a4a', 3);
      rr(x + 6, y - 6, T - 12, 30, 4); ctx.fillStyle = 'rgba(200,235,255,.45)'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = OUT; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(x + 10, y - 2, 4, 20);
      break;
    }
    case 'S': {
      ctx.fillStyle = '#c89a62'; ctx.fillRect(x, y, T, T);
      for (let r = 0; r < 3; r++) { ctx.fillStyle = '#a07a4a'; ctx.fillRect(x, y + 14 + r * 15, T, 3); for (let i = 0; i < 4; i++) { circle(x + 8 + i * 11, y + 8 + r * 15, 4); paint(['#ff6fae', '#4aa3ff', '#ffd23f', '#5fd068', '#a66cff'][(i + r + tx) % 5], 1.5); } }
      edge(); break;
    }
    case 'P': { drawGround(sc, '.', tx, ty); rr(x + 14, y + 26, 20, 18, 4); paint('#c8642a', 2.5); for (let i = 0; i < 5; i++) { ellipse(x + 24 + Math.cos(i * 1.3) * 9, y + 14 + Math.sin(i * 1.3) * 7, 8, 5, i); paint('#4a9a4a', 2); } break; }
    case 'O': {
      ctx.fillStyle = sc.map.booth || '#ff8a8a'; ctx.fillRect(x, y, T, T);
      if (above !== 'O') { for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#fff' : (sc.map.booth || '#ff5f6a'); ctx.fillRect(x + i * 12, y, 12, 14); } }
      edge(); break;
    }
    case 'V': { ctx.fillStyle = '#e8442f'; ctx.fillRect(x, y, T, T); rr(x + 6, y + 6, T - 20, T - 16, 3); paint('#bfe6ff', 2); for (let i = 0; i < 3; i++) { circle(x + T - 8, y + 10 + i * 9, 2.5); paint('#ffd23f', 1); } edge(); break; }
    case 'Y': {
      drawGround(sc, sc.map.fenceGround || '.', tx, ty);
      ctx.fillStyle = '#e8eef8'; ctx.fillRect(x, y + 14, T, 6); ctx.fillRect(x, y + 30, T, 6);
      for (const px of [x + 4, x + T - 10]) { rr(px, y + 6, 6, 36, 2); paint('#c0c8d8', 2); }
      break;
    }
  }
}

/* ---------- Things in the world ---------- */
class Ent {
  constructor(d) { Object.assign(this, d); this.tx = d.x; this.ty = d.y; this.t = Math.random() * 5; }
  box() { return { x: this.tx * T + 4, y: this.ty * T + 8, w: T - 8, h: T - 10 }; }
  cx() { return this.tx * T + T / 2; }
  cy() { return this.ty * T + T / 2; }
  update(sc, dt) { this.t += dt; }
  sortY() { return (this.ty + 1) * T - 4; }
}

/* Someone to talk to. d.talk(sc, npc) runs the conversation; it may open a challenge. */
class Npc extends Ent {
  constructor(d) { super(d); this.solid = true; this.wander = d.wander ? { ox: d.x, oy: d.y, t: 2 } : null; this.px = this.cx(); }
  onBump(sc) {
    S.talked[this.id] = (S.talked[this.id] || 0) + 1;
    if (this.talk) this.talk(sc, this);
    else Talk.say(pick(this.lines || ['Hi!']), { who: this.whoObj() });
  }
  whoObj() { return { face: this.kind === 'pet' ? null : personFace(this.look) }; }
  say(str, show) { return Talk.say(str, { who: this.whoObj(), show }); }
  wantsYou() { const g = currentGoal(); return g.ent === this.id && g.map === Game.scene.mapId; }
  draw(sc) {
    const x = this.cx(), y = this.ty * T + T - 6, bob = Math.sin(this.t * 2) * 1.5;
    ctx.globalAlpha = 0.25; ellipse(x, y, 16, 6); paint(OUT, 0); ctx.globalAlpha = 1;
    drawPerson(x, y + bob * 0.3, { look: this.look, face: sc.p.x < x ? -1 : 1, scale: this.scale || 0.88, wave: this.wantsYou() ? Math.max(0, Math.sin(this.t * 4)) : 0 });
    if (S.gifts[this.id]) drawGiftNecklace(x, y + bob * 0.3, this.scale || 0.88, sc.p.x < x ? -1 : 1, !(this.look && this.look.kid));
    if (this.prop) this.prop(x, y, this.t);
    if (this.wantsYou()) {
      const by = y - 100 + Math.sin(this.t * 4) * 4;
      circle(x, by, 15); paint('#ffd23f', 3); text('!', x, by + 1, { size: 22, color: OUT, stroke: null });
    } else if (S.gifts[this.id]) drawHeart(x + 18, y - 84 + Math.sin(this.t * 3) * 3, 8, '#ff5fa2', 2);
  }
}

/* A door or exit: walk into it to go somewhere. */
class Door extends Ent {
  constructor(d) { super(d); this.solid = true; }
  box() { return { x: this.tx * T + 6, y: this.ty * T + 4, w: T - 12, h: T - 4 }; }
  /* Say the place's name when she walks up to a labeled door. */
  update(sc, dt) {
    this.t += dt;
    if (!this.label) return;
    const d = Math.hypot(this.cx() - sc.p.x, this.cy() + T / 2 - sc.p.y);
    if (d < T * 1.7 && !this.heard) { this.heard = true; if (!Speech.speaking && !sc.overlay) Speech.say(this.locked && this.locked() ? `${this.label}. Not open yet.` : this.label); }
    else if (d > T * 3) this.heard = false;
  }
  onBump(sc) {
    if (this.locked && this.locked()) { Talk.say(this.lockedLine || 'It is locked. Not yet!'); Sfx.bonk(); return; }
    sc.go(this.to, this.at);
  }
  draw(sc) {
    const x = this.tx * T, y = this.ty * T;
    if (this.style === 'arch') { // open passage with a glow
      ctx.globalAlpha = 0.5 + Math.sin(sc.t * 3) * 0.2; rr(x + 4, y + 4, T - 8, T - 6, 10); paint('#fff6b0', 0); ctx.globalAlpha = 1;
      drawArrowGlyph(x + T / 2, y + T / 2, this.dir || 'down');
    } else if (this.style === 'tunnel') {
      // a big round door with a picture of where it goes
      const cx = x + T / 2, cy = y + 6, locked = this.locked && this.locked();
      const goal = currentGoal().map === this.to;
      if (goal) { ctx.globalAlpha = 0.5 + Math.sin(sc.t * 4) * 0.3; circle(cx, cy, 46); paint('#fff07a', 0); ctx.globalAlpha = 1; }
      circle(cx, cy, 38); paint('#6a4a3a', 4);
      circle(cx, cy, 31); paint(locked ? '#3a2a30' : '#fff6d8', 3);
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, 30, 0, TAU); ctx.clip();
      if (!locked && this.icon) this.icon(cx, cy, sc.t);
      ctx.restore();
      if (locked) { rr(cx - 10, cy - 4, 20, 16, 4); paint('#ffd23f', 2.5); ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.beginPath(); ctx.arc(cx, cy - 4, 7, Math.PI, 0); ctx.stroke(); }
      return this.drawLabel(cx, y + T - 2);
    } else {
      const locked = this.locked && this.locked();
      rr(x + 6, y + 2, T - 12, T - 4, 8); paint(this.color || '#7a3a2a', 3);
      rr(x + 12, y + 8, T - 24, 14, 3); paint('#bfe6ff', 2);
      circle(x + T - 14, y + T / 2 + 6, 3); paint('#ffd23f', 1.5);
      if (locked) { rr(x + T / 2 - 7, y + 26, 14, 12, 3); paint('#ffd23f', 2); ctx.lineWidth = 2.5; ctx.strokeStyle = OUT; ctx.beginPath(); ctx.arc(x + T / 2, y + 26, 5, Math.PI, 0); ctx.stroke(); }
    }
    if (this.label) this.drawLabel(x + T / 2, y - 15);
  }
  drawLabel(cx, cy) {
    if (!this.label) return;
    const w = textW(this.label, 16, 'Andika') + 18;
    rr(cx - w / 2, cy - 12, w, 24, 6); paint('#fffaf0', 2);
    text(this.label, cx, cy, { size: 16, font: 'Andika', color: OUT, stroke: null });
  }
  sortY() { return (this.ty + 1) * T + 1; }
}
function drawArrowGlyph(x, y, dir) {
  const a = { up: -Math.PI / 2, down: Math.PI / 2, left: Math.PI, right: 0 }[dir];
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-6, -10); ctx.lineTo(-6, 10); ctx.closePath(); paint('#ffb02e', 2.5);
  ctx.restore();
}

/* A sign: SPACE or bump reads it aloud. */
class Sign extends Ent {
  constructor(d) { super(d); this.solid = true; }
  onBump() { Talk.say(this.read || this.text, { show: this.text }); }
  draw() {
    const x = this.cx(), y = this.ty * T;
    rr(x - 3, y + 22, 6, 22, 2); paint('#8a5a32', 2);
    rr(x - 22, y + 2, 44, 26, 5); paint('#f0dca8', 2.5);
    text(this.glyph || 'Aa', x, y + 15, { size: 15, font: 'Andika', color: OUT, stroke: null });
  }
}

/* A glowing challenge spot (a museum case, the departure board...). d.use(sc, ent) opens its challenge. */
class Station extends Ent {
  constructor(d) { super(d); this.solid = d.solid !== false; }
  onBump(sc) { if (this.use) this.use(sc, this); }
  done() { return !!S.done[this.id]; }
  draw(sc) {
    const x = this.cx(), y = this.cy();
    const want = currentGoal().ent === this.id;
    if (want) { const gr = ctx.createRadialGradient(x, y, 6, x, y, 46); gr.addColorStop(0, 'rgba(255,240,140,.85)'); gr.addColorStop(1, 'rgba(255,240,140,0)'); ctx.fillStyle = gr; circle(x, y, 46); ctx.fill(); }
    if (this.art) this.art(x, y, sc.t, this);
    else { rr(x - 20, y - 18, 40, 36, 8); paint(this.done() ? '#8be06b' : '#ffd23f', 3); text(this.done() ? '✓' : '?', x, y, { size: 24, color: OUT, stroke: null }); }
    if (this.done() && !this.noCheck) { circle(x + 18, y - 22, 9); paint('#8be06b', 2); text('✓', x + 18, y - 21, { size: 12, color: OUT, stroke: null }); }
  }
}

/* A pet hiding somewhere. Walk up to it to make friends. */
class PetSpot extends Ent {
  constructor(d) { super(d); this.id = this.id || 'pet-' + d.pet; this.solid = true; this.hidden = S.pets.includes(d.pet) || (d.when && !d.when()); }
  onBump(sc) { if (this.befriend) this.befriend(sc, this); else befriendPet(sc, this); }
  draw(sc) {
    const x = this.cx(), y = this.ty * T + T - 6;
    drawPet(this.pet, x, y, sc.t, { face: Math.sin(sc.t * 0.7) > 0 ? 1 : -1, walking: Math.sin(sc.t * 1.3) > 0.6 });
    if (Math.sin(sc.t * 3) > 0) { FX.list.length < 200 && Math.random() < 0.05 && FX.sparkle(x, y - 30, 2); }
    text('?', x + 16, y - 46 + Math.sin(sc.t * 4) * 3, { size: 20, color: '#ffd23f', lw: 4 });
  }
}
function befriendPet(sc, e) {
  const info = PET_INFO[e.pet];
  sc.open(new PetGame(e.pet, () => {
    e.hidden = true;
    if (!S.pets.includes(e.pet)) S.pets.push(e.pet);
    S.pet = e.pet;
    Sfx.fanfare(); FX.hearts(e.cx(), e.cy() - 20, 8); FX.confetti(e.cx(), e.cy() - 20, 30);
    Talk.say(`You made a new friend! ${info.name} will walk with you. You can switch pets in your notebook. Press N.`);
    saveState();
  }));
}

/* Decorations drawn by a function, optionally solid. */
class Deco extends Ent {
  constructor(d) { super(d); this.solid = d.solid !== false; }
  box() { return this.bw ? { x: this.tx * T + (T - this.bw) / 2, y: this.ty * T + T - this.bh, w: this.bw, h: this.bh } : super.box(); }
  draw(sc) { if (this.art) this.art(this.cx(), this.cy(), sc.t, this); }
  sortY() { return (this.ty + 1) * T - 2 + (this.z || 0); }
}

const ENT_TYPES = { npc: Npc, door: Door, sign: Sign, station: Station, pet: PetSpot, deco: Deco };
function makeEnt(d, sc) {
  if (d.when && d.type !== 'pet' && !d.when()) return null;
  const C = ENT_TYPES[d.type];
  return C ? new C(d, sc) : null;
}

/* Speaker button / Enter: say again whatever matters right now. */
function replayPrompt(sc) {
  if (sc && sc.overlay && sc.overlay.replay) return sc.overlay.replay();
  const g = currentGoal(); Talk.say(g.say, { show: g.short });
}
