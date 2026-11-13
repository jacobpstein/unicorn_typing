'use strict';

/* Title, look creator, story, Brooklyn map, home stoop menus, results, pause and the parent dashboard. */

/* ---------- Title ---------- */
class TitleScene {
  constructor() { this.t = 0; }
  update(dt) {
    this.t += dt;
    if (Input.pressed('ok') || Input.pressed('jump')) {
      Sfx.init(); Sfx.chime();
      Game.go(S.created ? new TownScene((townState().at && TOWN_MAPS[townState().at.map]) ? townState().at.map : 'town') : new CreatorScene(true));
    }
  }
  draw() {
    drawBackground('street', this.t * 40, 0, this.t);
    ctx.fillStyle = 'rgba(30,15,50,.25)'; ctx.fillRect(0, 0, VW, VH);
    const bob = Math.sin(this.t * 2) * 6;
    text('Holiday', VW / 2, 120 + bob, { size: 92, color: '#ffd23f', lw: 12 });
    text('Hop!', VW / 2, 210 + bob, { size: 104, color: '#ff8a1f', lw: 12 });
    drawHero(VW / 2 - 120, 440, { run: this.t * 8, costume: 'bat', scale: 1.6 });
    drawHero(VW / 2 + 120, 440 - Math.abs(Math.sin(this.t * 4)) * 30, { costume: 'turkey', scale: 1.6, face: -1, air: true });
    drawMazelFace(VW / 2, 400, 40, false);
    if (Math.sin(this.t * 4) > -0.3) { drawKey('SPACE', VW / 2, 490, '#8be06b', 120); }
  }
}

/* ---------- Look creator (also the wardrobe) ---------- */
class CreatorScene {
  constructor(first = false) {
    this.first = first; this.row = 0; this.t = 0;
    this.rows = [
      { label: 'costume', get: () => ['none', ...S.costumes].indexOf(S.costume), opts: () => ['none', ...S.costumes], set: v => { S.costume = v; } },
      { label: 'skin', get: () => SKINS.indexOf(S.look.skin), opts: () => SKINS, set: v => { S.look.skin = v; } },
      { label: 'hair', get: () => HAIRS.indexOf(S.look.hair), opts: () => HAIRS, set: v => { S.look.hair = v; } },
      { label: 'color', get: () => COLORS.indexOf(S.look.color), opts: () => COLORS, set: v => { S.look.color = v; } },
    ];
    if (first || !S.costumes.length) this.rows.shift();
    Talk.say(first ? "Hi! I'm Mazel, the bodega cat. Let's make you! Up and down picks a row. Left and right changes it. Press space when you're ready!" : 'Wardrobe! Pick your look. Press space when you are done.');
  }
  update(dt) {
    this.t += dt;
    Talk.update(dt);
    if (Input.pressed('up') && this.row > 0) { this.row--; Sfx.click(); }
    if (Input.pressed('down') && this.row < this.rows.length) { this.row++; Sfx.click(); }
    const r = this.rows[this.row];
    if (r && (Input.pressed('left') || Input.pressed('right'))) {
      const opts = r.opts(), d = Input.pressed('left') ? -1 : 1;
      const i = (Math.max(0, r.get()) + d + opts.length) % opts.length;
      r.set(opts[i]); Sfx.pop();
      if (r.label === 'costume') Talk.say(COSTUMES[opts[i]].name);
      saveState();
    }
    if (Input.key(' ') || (Input.key('enter') && this.row === this.rows.length)) {
      S.created = true; saveState(); Sfx.chime();
      Game.go(this.first ? new StoryScene() : new HomeScene());
    }
    if (Input.pressed('pause')) Game.go(new HomeScene());
  }
  draw() {
    drawBackground('street', 0, 0, this.t);
    ctx.fillStyle = 'rgba(30,15,50,.35)'; ctx.fillRect(0, 0, VW, VH);
    rr(80, 150, 340, 370, 30); paint('rgba(255,250,240,.95)', 4);
    drawHero(250, 480, { scale: 2.6, blink: Math.sin(this.t * 1.7) > 0.97, run: 0 });
    const x0 = 470;
    this.rows.forEach((r, i) => {
      const y = 190 + i * 84, sel = i === this.row;
      rr(x0 - 20, y - 36, 470, 76, 20); paint(sel ? '#fff6c8' : 'rgba(255,250,240,.75)', sel ? 5 : 3);
      const opts = r.opts(), cur = r.get();
      opts.forEach((o, j) => {
        const cx = x0 + 34 + j * 70;
        if (r.label === 'costume') {
          ctx.save(); ctx.beginPath(); ctx.arc(cx, y + 2, 28, 0, TAU); ctx.clip();
          ctx.fillStyle = '#e8e0f4'; ctx.fill();
          drawHero(cx, y + 40, { costume: o, scale: 0.75, mazel: false });
          ctx.restore();
          circle(cx, y + 2, 28); paint(null, j === cur ? 6 : 2.5, j === cur ? '#ff5fa2' : OUT);
        } else {
          circle(cx, y + 2, 26); paint(o, j === cur ? 6 : 3, j === cur ? '#ff5fa2' : OUT);
        }
      });
      if (sel) { ctx.beginPath(); ctx.moveTo(x0 - 40, y - 10); ctx.lineTo(x0 - 26, y + 2); ctx.lineTo(x0 - 40, y + 14); ctx.closePath(); paint('#ff5fa2', 3); }
    });
    const dy = 190 + this.rows.length * 84;
    drawKey('SPACE', x0 + 200, dy, this.row === this.rows.length ? '#8be06b' : '#c8f0b0', 140);
    Talk.draw();
  }
}

/* ---------- Story ---------- */
class StoryScene {
  constructor() {
    this.t = 0; this.page = 0;
    this.pages = [
      'Oh no! Grumpy Mr. Snooze the alarm clock thinks holidays are too loud!',
      'He gobbled up the pages of the Great Brooklyn Calendar, so every day is a sleepy gray Tuesday.',
      'His sleepy Snoozies are everywhere. Jump on them to wake them up happy!',
      "Let's hop through the holidays and win the calendar pages back. Come on, Sadelle!",
    ];
    Talk.say(this.pages[0]);
  }
  update(dt) {
    this.t += dt; Talk.update(dt);
    if (Input.pressed('ok') || Input.pressed('jump') || Input.pressed('right')) {
      this.page++; Sfx.click();
      if (this.page >= this.pages.length) { Speech.stop(); Game.go(new TownScene()); return; }
      Talk.say(this.pages[this.page]);
    }
  }
  draw() {
    drawBackground('park', 0, 0, this.t);
    ctx.fillStyle = 'rgba(30,15,50,.35)'; ctx.fillRect(0, 0, VW, VH);
    const p = this.page;
    // Mr. Snooze: a grumpy sleepy alarm clock
    const cx = p === 3 ? 700 : VW / 2, cy = 230 + Math.sin(this.t * 2) * 6;
    drawMrSnooze(cx, cy, 1, this.t, false);
    if (p >= 1) for (let i = 0; i < 4; i++) { rr(cx + 120 + i * 18, cy - 60 + i * 30, 50, 60, 6); paint('#d8d8e0', 3); }
    if (p >= 2) { drawSnoozie({ x: 140, y: 340, w: 40, h: 40, skin: 'candycorn', t: this.t, face: 1 }); drawSnoozie({ x: 220, y: 340, w: 42, h: 42, skin: 'pie', t: this.t, face: 1 }); }
    if (p >= 3) drawHero(260, 420, { scale: 2, run: this.t * 8 });
    drawKey('SPACE', VW - 110, VH - 40, '#8be06b', 120);
    Talk.draw();
  }
}

/* ---------- Home stoop ---------- */
class HomeScene {
  constructor() {
    this.t = 0; this.sel = 0;
    this.items = [
      { id: 'wardrobe', name: 'Wardrobe' }, { id: 'stickers', name: 'Word stickers' }, { id: 'alefbet', name: 'Alef-Bet book' }, { id: 'back', name: 'Back outside' },
    ];
    Talk.say("Your stoop! Pick the wardrobe, your word stickers, or your Alef-Bet book.");
  }
  update(dt) {
    this.t += dt; Talk.update(dt);
    if (Input.pressed('left')) { this.sel = (this.sel + this.items.length - 1) % this.items.length; Sfx.click(); Talk.say(this.items[this.sel].name); }
    if (Input.pressed('right')) { this.sel = (this.sel + 1) % this.items.length; Sfx.click(); Talk.say(this.items[this.sel].name); }
    if (Input.pressed('pause')) Game.go(new TownScene('town', { x: 22, y: 28 }));
    if (Input.key(' ')) {
      const it = this.items[this.sel].id;
      Sfx.chime();
      if (it === 'wardrobe') Game.go(new CreatorScene(false));
      else if (it === 'stickers') Game.go(new BookScene('stickers'));
      else if (it === 'alefbet') Game.go(new BookScene('alefbet'));
      else Game.go(new TownScene('town', { x: 22, y: 28 }));
    }
  }
  draw() {
    drawBackground('street', 200, 0, this.t);
    ctx.fillStyle = 'rgba(30,15,50,.3)'; ctx.fillRect(0, 0, VW, VH);
    text("Sadelle's Stoop", VW / 2, 70, { size: 48, color: '#ffd23f', lw: 8 });
    this.items.forEach((it, i) => {
      const x = 150 + i * 220, y = 270, sel = i === this.sel;
      rr(x - 85, y - 95, 170, 190, 26); paint(sel ? '#fff6c8' : 'rgba(255,250,240,.85)', sel ? 6 : 3, sel ? '#ff5fa2' : OUT);
      ctx.save(); ctx.translate(x, y - 10);
      if (it.id === 'wardrobe') { drawHero(0, 60, { scale: 1.3, costume: S.costume }); }
      else if (it.id === 'stickers') { rr(-50, -50, 100, 80, 8); paint('#ff8ac4', 3); rr(-40, -40, 80, 60, 6); paint('#fffaf0', 2); text('cat', 0, -10, { size: 28, font: 'Andika', color: '#2f6fe0', lw: 4 }); text(String(S.stickers.length), 0, 50, { size: 26, color: '#ff5fa2' }); }
      else if (it.id === 'alefbet') { rr(-50, -50, 100, 80, 8); paint('#4aa3ff', 3); text('אבג', 0, -10, { size: 34, font: 'Noto Sans Hebrew', color: '#fff', lw: 4 }); text(`${S.hebrew.length}/22`, 0, 50, { size: 24, color: '#4aa3ff' }); }
      else { ctx.beginPath(); ctx.moveTo(30, -30); ctx.lineTo(-20, 0); ctx.lineTo(30, 30); ctx.lineWidth = 14; ctx.strokeStyle = OUT; ctx.lineCap = 'round'; ctx.stroke(); }
      ctx.restore();
    });
    drawKey('SPACE', VW / 2, 450, '#8be06b', 120);
    Talk.draw();
  }
}

class BookScene {
  constructor(kind) {
    this.kind = kind; this.t = 0; this.sel = 0;
    this.items = kind === 'stickers' ? S.stickers.slice() : HEBREW.map(h => h);
    Talk.say(kind === 'stickers'
      ? (this.items.length ? 'Your word stickers! Pick one to hear it.' : 'Read and spell words around town to get word stickers!')
      : 'Your Alef-Bet book! Find secret blue doors to fill it up.');
  }
  update(dt) {
    this.t += dt; Talk.update(dt);
    const n = this.items.length, cols = this.kind === 'stickers' ? 6 : 8;
    const move = d => { if (!n) return; this.sel = clamp(this.sel + d, 0, n - 1); Sfx.click(); this.speak(); };
    if (Input.pressed('left')) move(this.kind === 'alefbet' ? 1 : -1);
    if (Input.pressed('right')) move(this.kind === 'alefbet' ? -1 : 1);
    if (Input.pressed('up')) move(-cols);
    if (Input.pressed('down')) move(cols);
    if (Input.key(' ') || Input.pressed('replay')) this.speak();
    if (Input.pressed('pause')) Game.go(new HomeScene());
  }
  speak() {
    const it = this.items[this.sel];
    if (!it) return;
    if (this.kind === 'stickers') Talk.say(`${it}. ${spellOut(it)}. ${it}!`);
    else Talk.say(S.hebrew.includes(it[1]) ? `${it[2]}` : 'Not found yet!');
  }
  draw() {
    ctx.fillStyle = '#f6ecd8'; ctx.fillRect(0, 0, VW, VH);
    ctx.fillStyle = '#ead9b8'; for (let y = 0; y < VH; y += 32) ctx.fillRect(0, y, VW, 2);
    text(this.kind === 'stickers' ? 'Word Stickers' : 'Alef-Bet Book', VW / 2, 50, { size: 42, color: this.kind === 'stickers' ? '#ff5fa2' : '#2f6fe0', lw: 7 });
    if (this.kind === 'stickers') {
      this.items.forEach((wd, i) => {
        const c = i % 6, r = Math.floor(i / 6);
        const x = 110 + c * 148, y = 130 + r * 78 - Math.max(0, Math.floor(this.sel / 6) - 3) * 78;
        if (y < 90 || y > VH - 40) return;
        rr(x - 64, y - 30, 128, 60, 14); paint(i === this.sel ? '#fff6c8' : '#fff', i === this.sel ? 5 : 3, i === this.sel ? '#ff5fa2' : OUT);
        text(wd, x, y, { size: 30, font: 'Andika', color: '#2f6fe0', lw: 4 });
      });
    } else {
      this.items.forEach((h, i) => {
        const c = i % 8, r = Math.floor(i / 8);
        const x = VW - 110 - c * 106, y = 150 + r * 120;
        const got = S.hebrew.includes(h[1]);
        rr(x - 46, y - 46, 92, 92, 16); paint(i === this.sel ? '#fff6c8' : got ? '#fff' : '#e8e0d0', i === this.sel ? 5 : 3, i === this.sel ? '#4aa3ff' : OUT);
        text(h[0], x, y - 4, { size: 50, font: 'Noto Sans Hebrew', color: got ? '#2f6fe0' : '#c8c0b0', lw: got ? 5 : 0, stroke: got ? OUT : null });
        if (got) text(h[1], x, y + 34, { size: 14, color: OUT, stroke: null });
      });
    }
    text('Esc = back', VW - 80, VH - 24, { size: 16, color: OUT, stroke: null });
    Talk.draw();
  }
}

function replayPrompt() {
  const line = Talk.lastPrompt || Talk.last;
  if (line) Talk.say(line);
}

/* ---------- Parent dashboard (Shift+P, adult question) ---------- */
const Parent = {
  open() {
    const ans = prompt('Grown-ups only: what is 7 × 8?');
    if (ans === null || ans.trim() !== '56') return;
    Speech.stop();
    this.render();
    document.getElementById('parent').style.display = 'block';
  },
  close() { document.getElementById('parent').style.display = 'none'; cv.focus(); },
  render() {
    const el = document.getElementById('parent');
    const acc = st => st.hist.length ? Math.round(st.hist.reduce((a, b) => a + b, 0) / st.hist.length * 100) + '%' : '—';
    const lvRows = sk => Object.entries(S.stats[sk]).map(([lv, [r, n]]) => `<tr><td>Level ${lv}</td><td>${r} / ${n}</td><td>${Math.round(r / n * 100)}%</td></tr>`).join('') || '<tr><td colspan=3>No answers yet</td></tr>';
    const missed = Object.entries(S.stats.missed).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, n]) => `${k} (${n})`).join(', ') || '—';
    const today = new Date().toISOString().slice(0, 10);
    const days = Object.entries(S.played || {}).slice(-14).map(([d, s]) => `<tr><td>${d}</td><td>${Math.round(s / 60)} min</td></tr>`).join('');
    const ts = townState();
    const helped = Object.keys(ts.npcs).length;
    const voices = Speech.voices().map(v => `<option ${S.settings.voice === v.name ? 'selected' : ''}>${v.name}</option>`).join('');
    el.innerHTML = `<div class="box">
      <h2>Holiday Hop: grown-up corner</h2>
      <div class="row">Today: ${Math.round((S.played[today] || 0) / 60)} min played · Bagels to spend ${S.coins} · Blue gems ${S.gems} · Word stickers ${S.stickers.length}</div>
      <h3>Acadience-style practice (each skill moves up and down on its own)</h3>
      <table><tr><th>Skill</th><th>Level</th><th>Right</th><th>Accuracy</th><th>Avg. answer time</th></tr>${acRows()}</table>
      <div class="row">Skill level buttons: ${Object.keys(AC_INFO).map(k => `<button data-a="ac-${k}" title="${AC_INFO[k][1]}">${k} ${Ac.st(k).level}</button>`).join('')} <span style="opacity:.7">(click to cycle 1–${4})</span></div>
      <h3>Speed Arcade (one-minute rounds)</h3><table>${speedRows()}</table>
      <h3>Story reading (time to read out loud before checking)</h3><div>${(S.orf || []).slice(-8).map(r => `${r.d}: ${r.words} words in ${r.sec}s (~${Math.round(r.words / Math.max(1, r.sec) * 60)} wpm)`).join('<br>') || '—'}</div>
      <h3>Math: level ${S.math.level} of 8 · recent accuracy ${acc(S.math)} · retry queue ${S.math.retry.length}</h3>
      <table>${lvRows('math')}</table>
      <div class="row"><button data-a="m-">Math easier</button><button data-a="m+">Math harder</button></div>
      <h3>Spelling: level ${S.spell.level} of 7 · tier ${S.spell.tier} (${['letters only', 'high/low choices', 'scatter'][S.spell.tier] || ''}) · accuracy ${acc(S.spell)}</h3>
      <table>${lvRows('spell')}</table>
      <div class="row"><button data-a="s-">Spelling easier</button><button data-a="s+">Spelling harder</button><button data-a="t0">Letters only (tier 0)</button><button data-a="t1">High/low choices (tier 1)</button></div>
      <h3>Most missed</h3><div>${missed}</div>
      <h3>Hebrew letters found (${S.hebrew.length}/22)</h3><div>${S.hebrew.join(', ') || '—'}</div>
      <h3>Holiday Town progress</h3><div>Calendar pages: ${ts.pages.join(', ') || 'none yet'} · Neighbors helped: ${helped} · Golden bagels: ${ts.bagels.length}/${TOWN_BAGELS} · Brooklyn finale: ${ts.flags.finale ? 'done!' : 'not yet'} · Birthday party: ${ts.flags.birthday ? 'done!' : 'not yet'}</div>
      <h3>Time played</h3><table>${days || '<tr><td>—</td></tr>'}</table>
      <h3>Settings</h3>
      <div class="row">
        <button data-a="music">Music: ${S.settings.musicOff ? 'off' : 'on'}</button>
        <button data-a="sfx">Sounds: ${S.settings.sfxOff ? 'off' : 'on'}</button>
        <button data-a="heb">Hebrew rooms: ${S.settings.hebrew ? 'on' : 'off'}</button>
        <button data-a="shake">Screen shake: ${S.settings.shake ? 'on' : 'off'}</button>
      </div>
      <div class="row">Voice: <select id="pvoice"><option value="">(automatic)</option>${voices}</select>
        Speed: <select id="prate">${[0.8, 0.9, 1, 1.1].map(r => `<option ${S.settings.speechRate == r ? 'selected' : ''}>${r}</option>`).join('')}</select>
        <button data-a="test">Test voice</button></div>
      <div class="row">Suggest a break after <select id="psess">${[10, 15, 20, 30, 45].map(m => `<option ${(S.settings.session || 20) == m ? 'selected' : ''}>${m}</option>`).join('')}</select> minutes</div>
      <div class="row"><button data-a="unlock">Open all neighborhoods</button><button data-a="reset" style="background:#ff8a8a">Reset all progress</button></div>
      <div class="row"><button data-a="close" style="background:#8be06b">Close</button></div>
    </div>`;
    el.querySelectorAll('button').forEach(b => b.onclick = () => this.act(b.dataset.a));
    el.querySelector('#pvoice').onchange = e => { S.settings.voice = e.target.value; Speech.choose(); saveState(); };
    el.querySelector('#prate').onchange = e => { S.settings.speechRate = +e.target.value; saveState(); };
    el.querySelector('#psess').onchange = e => { S.settings.session = +e.target.value; saveState(); };
  },
  act(a) {
    const st = S.settings;
    if (a.startsWith('ac-')) { const k = a.slice(3), x = Ac.st(k); x.level = x.level % (MAX_AC_LEVEL[k] || 4) + 1; x.streak = 0; x.miss = 0; saveState(); this.render(); return; }
    switch (a) {
      case 'm-': S.math.level = Math.max(1, S.math.level - 1); break;
      case 'm+': S.math.level = Math.min(8, S.math.level + 1); break;
      case 's-': S.spell.level = Math.max(1, S.spell.level - 1); break;
      case 's+': S.spell.level = Math.min(7, S.spell.level + 1); break;
      case 't0': S.spell.tier = 0; break;
      case 't1': S.spell.tier = 1; break;
      case 'music': st.musicOff = !st.musicOff; if (st.musicOff) Music.stop(); break;
      case 'sfx': st.sfxOff = !st.sfxOff; break;
      case 'heb': st.hebrew = !st.hebrew; break;
      case 'shake': st.shake = !st.shake; break;
      case 'test': Speech.say('Hi Sadelle! Spell cat. c, a, t. Cat!'); break;
      case 'unlock': townState().flags.openAll = true; break;
      case 'reset': if (confirm('Erase all of Sadelle\'s progress?')) { const keep = S.settings; S = defaultState(); S.settings = keep; } break;
      case 'close': saveState(); this.close(); if (!(Game.scene instanceof TownScene)) Game.go(new TownScene()); return;
    }
    saveState();
    this.render();
  },
};

function acRows() {
  const rows = [];
  for (const area of ['reading', 'math']) {
    rows.push(`<tr><td colspan=5 style="color:#ffd36b">${area === 'reading' ? 'Reading' : 'Math'}</td></tr>`);
    for (const [k, [ar, label]] of Object.entries(AC_INFO)) {
      if (ar !== area) continue;
      const x = Ac.st(k);
      const avg = x.ms.length ? (x.ms.reduce((a, b) => a + b, 0) / x.ms.length / 1000).toFixed(1) + 's' : '—';
      rows.push(`<tr><td>${label}</td><td>${x.level}</td><td>${x.right} / ${x.n}</td><td>${x.n ? Math.round(x.right / x.n * 100) + '%' : '—'}</td><td>${avg}</td></tr>`);
    }
  }
  return rows.join('');
}
function speedRows() {
  return SPEED_GAMES.map(g => {
    const r = (S.speed || {})[g.id];
    const recent = r ? r.hist.slice(-5).map(h => h.right).join(', ') : '';
    return `<tr><td>${g.name} (${g.measure})</td><td>best ${r ? r.best : 0}</td><td>recent: ${recent || '—'}</td></tr>`;
  }).join('');
}
