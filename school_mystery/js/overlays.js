'use strict';

/* Screens on top of the world: clue cards, notebook, dress-up closet, pets, the party, the title and the parent panel. */

/* A new clue! Shown big, read aloud. */
class ClueCard {
  constructor(id, then) {
    this.id = id; this.then = then; this.t = 0;
    const C = CLUES[id];
    Sfx.fanfare();
    const clr = C.clears ? ` ${SUSPECTS.find(s => s.id === C.clears).name} is cleared!` : '';
    const piece = C.piece ? ` And a piece of the Great Bead Chain! That's ${C.piece} of 5!` : '';
    Talk.say(`New clue! ${C.say}${piece}`, { show: `New clue: ${C.name}!${clr}${C.piece ? `  Chain piece ${C.piece}/5!` : ''}` });
  }
  replay() { Talk.say(CLUES[this.id].say); }
  update(dt) {
    this.t += dt;
    if (this.t > 1 && (Input.key(' ') || Input.key('enter') || Input.click || Input.key('escape'))) { this.scene.close(); if (this.then) this.then(); }
  }
  draw() {
    ctx.fillStyle = 'rgba(20,10,30,.6)'; ctx.fillRect(0, 0, VW, VH);
    const s = Math.min(1, this.t * 3), C = CLUES[this.id];
    ctx.save(); ctx.translate(VW / 2, VH / 2 - 20); ctx.scale(s, s); ctx.rotate(Math.sin(this.t * 2) * 0.02);
    rr(-240, -170, 480, 320, 24); paint('#fffaf0', 6);
    text('NEW CLUE!', 0, -130, { size: 40, color: '#ff5fa2', lw: 6 });
    drawClueIcon(this.id, 0, -30, 3.2);
    text(C.name, 0, 70, { size: 30, color: OUT, stroke: null });
    if (C.clears) { ctx.save(); ctx.rotate(-0.15); rr(60, -110, 150, 50, 10); paint(null, 5, '#3a9a5a'); text('NOT ' + SUSPECTS.find(x => x.id === C.clears).name.toUpperCase() + '!', 135, -85, { size: 18, color: '#3a9a5a', stroke: null }); ctx.restore(); }
    if (C.piece) for (let k = 0; k < 5; k++) { const got = k < C.piece, pop = k === C.piece - 1 ? 1 + Math.max(0, 1 - this.t) * 0.8 : 1; drawBead(BEAD_NAMES[k], -88 + k * 44, 104, (got ? 14 : 10) * pop, { shape: got ? 'round' : 'round' }); if (!got) { circle(-88 + k * 44, 104, 12); paint('rgba(255,255,255,.7)', 0); } }
    if (this.t > 1 && Math.sin(this.t * 4) > -0.3) drawKey('SPACE', 0, C.piece ? 148 : 120, '#8be06b', 110);
    ctx.restore();
    if (Math.random() < 0.2) FX.sparkle(VW / 2 + rint(-200, 200), VH / 2 + rint(-140, 120), 2);
    FX.draw();
    Talk.draw(true);
  }
}

/* Detective notebook: clues, suspects, chain, pets, words. */
class NotebookOverlay {
  constructor() {
    this.tab = 0; this.t = 0;
    this.tabs = ['Clues', 'Suspects', 'Pets', 'Words', 'Alef-Bet'];
    this.read();
  }
  read() {
    const n = S.clues.length;
    if (this.tab === 0) Talk.say(n ? `You have ${n} clue${n === 1 ? '' : 's'}. Click a clue to hear it.` : 'No clues yet. Follow the yellow arrow!');
    else if (this.tab === 1) Talk.say('The suspects! A green stamp means they did not do it.');
    else if (this.tab === 2) Talk.say(S.pets.length ? 'Your pets! Click one to walk together.' : 'No pets yet. Pets hide in every place. Look for a question mark!');
    else if (this.tab === 3) Talk.say(`You spelled ${S.stickers.length} words! Click one to hear it.`);
    else Talk.say(`Hebrew letter beads! You found ${(S.hebrew || []).length} of 7. One is hiding in every place.`);
  }
  replay() { this.read(); }
  tabRects() { return this.tabs.map((t, i) => ({ x: PX + 30 + i * 140, y: PY + 74, w: 132, h: 44 })); }
  update(dt) {
    this.t += dt;
    if (Input.clicked(CLOSE_BTN) || Input.key('escape') || Input.key('n')) { this.scene.close(); return; }
    if (Input.clicked(HEAR_BTN)) this.read();
    this.tabRects().forEach((r, i) => { if (Input.clicked(r)) { this.tab = i; Sfx.click(); this.read(); } });
    if (Input.pressed('right')) { this.tab = (this.tab + 1) % 5; Sfx.click(); this.read(); }
    if (Input.pressed('left')) { this.tab = (this.tab + 4) % 5; Sfx.click(); this.read(); }
    if (this.tab === 0) S.clues.forEach((c, i) => { if (Input.clicked(this.clueRect(i))) Talk.say(CLUES[c].say); });
    if (this.tab === 1) SUSPECTS.forEach((s, i) => { if (Input.clicked(this.susRect(i))) this.saySuspect(s); });
    if (this.tab === 2) S.pets.forEach((p, i) => { if (Input.clicked(this.petRect(i))) { S.pet = S.pet === p ? null : p; Sfx.chime(); Talk.say(S.pet ? `${PET_INFO[p].short} is walking with you!` : `${PET_INFO[p].short} is taking a nap.`); saveState(); } });
    if (this.tab === 4) HEB_BEADS.forEach((h, i) => { if ((S.hebrew || []).includes(h[2]) && Input.clicked(this.hebRect(i))) Talk.say(`${h[2]}. ${h[3]}`); });
    if (this.tab === 3) S.stickers.slice(-40).forEach((w, i) => { if (Input.clicked(this.wordRect(i))) Speech.say(`${w}. ${spellOut(w)}. ${w}.`); });
  }
  saySuspect(s) {
    if (s.id === 'mystery') Talk.say(S.clues.includes('chain') ? 'It was Coo the pigeon! She wanted a sparkly nest for her eggs.' : S.clues.includes('camera') ? 'Someone gray... with wings! Who could it be?' : 'We do not know who this is yet!');
    else Talk.say(cleared(s.id) ? `${s.name} did not do it!` : `${s.name}. ${s.why}`);
  }
  clueRect(i) { return { x: PX + 40 + (i % 6) * 132, y: PY + 140 + Math.floor(i / 6) * 150, w: 120, h: 136 }; }
  susRect(i) { return { x: PX + 50 + i * 196, y: PY + 150, w: 176, h: 250 }; }
  petRect(i) { return { x: PX + 40 + (i % 4) * 196, y: PY + 140 + Math.floor(i / 4) * 150, w: 180, h: 136 }; }
  hebRect(i) { return { x: PX + 50 + i * 110, y: PY + 170, w: 96, h: 150 }; }
  wordRect(i) { return { x: PX + 36 + (i % 8) * 99, y: PY + 136 + Math.floor(i / 8) * 58, w: 92, h: 48 }; }
  draw() {
    drawPanelFrame('Detective Notebook', '#fff8e8');
    this.tabRects().forEach((r, i) => { const on = i === this.tab; rr(r.x, r.y, r.w, r.h, 12); paint(on ? '#ffd23f' : '#ffffff', on ? 4 : 2.5); text(this.tabs[i], r.x + r.w / 2, r.y + r.h / 2, { size: 22, color: OUT, stroke: null }); });
    if (this.tab === 0) {
      // chain progress
      const f = S.clues.length / CLUE_ORDER.length;
      rr(PX + 720, PY + 74, 100, 44, 12); paint('#ffffff', 2.5);
      for (let k = 0; k < 10; k++) { circle(PX + 732 + k * 8.5, PY + 96 + Math.sin(k) * 4, 4); paint(k < f * 10 ? BEAD_COLORS[BEAD_NAMES[k % 6]] : '#e0d8e8', 1); }
      if (!S.clues.length) text('No clues yet!', VW / 2, PY + 260, { size: 30, color: '#b8afc8', stroke: null });
      S.clues.forEach((c, i) => {
        const r = this.clueRect(i), hot = Input.hover(r);
        rr(r.x, r.y, r.w, r.h, 12); paint(hot ? '#fff6c8' : '#ffffff', 3);
        drawClueIcon(c, r.x + r.w / 2, r.y + 52, 1.8);
        const lines = wrapLines(CLUES[c].name, r.w - 12, 15, 'Fredoka');
        lines.slice(0, 2).forEach((ln, k) => text(ln, r.x + r.w / 2, r.y + 104 + k * 17, { size: 15, color: OUT, stroke: null }));
      });
    } else if (this.tab === 1) {
      SUSPECTS.forEach((s, i) => {
        const r = this.susRect(i), clr = s.id === 'mystery' ? S.clues.includes('chain') : cleared(s.id);
        rr(r.x, r.y, r.w, r.h, 14); paint('#ffffff', 3);
        const cx = r.x + r.w / 2;
        if (s.look) drawPerson(cx, r.y + 150, { look: NPC_LOOKS[s.look], scale: 1.2 });
        else if (s.id === 'mazel') drawMazelFace(cx, r.y + 90, 44, false);
        else if (S.clues.includes('chain')) drawPet('pigeon', cx, r.y + 140, this.t, { scale: 2.2 });
        else { circle(cx, r.y + 90, 44); paint('#5a5068', 3); text('?', cx, r.y + 92, { size: 50, color: '#fff', stroke: null }); if (S.clues.includes('camera')) for (const sd of [-1, 1]) { ellipse(cx + sd * 54, r.y + 84, 26, 12, sd * 0.4); paint('#8a8098', 2.5); } }
        text(s.id === 'mystery' && S.clues.includes('chain') ? 'Coo!' : s.name, cx, r.y + 190, { size: 24, color: OUT, stroke: null });
        if (clr) { ctx.save(); ctx.translate(cx, r.y + 110); ctx.rotate(-0.25); rr(-64, -24, 128, 48, 10); paint('rgba(255,255,255,.6)', 5, s.id === 'mystery' ? '#ff5fa2' : '#3a9a5a'); text(s.id === 'mystery' ? 'FOUND!' : 'NOT ME!', 0, 1, { size: 24, color: s.id === 'mystery' ? '#ff5fa2' : '#3a9a5a', stroke: null }); ctx.restore(); }
      });
    } else if (this.tab === 2) {
      if (!S.pets.length) text('Pets hide in every place. Look for a "?"', VW / 2, PY + 260, { size: 26, color: '#b8afc8', stroke: null });
      S.pets.forEach((p, i) => {
        const r = this.petRect(i), on = S.pet === p;
        rr(r.x, r.y, r.w, r.h, 14); paint(on ? '#fff6c8' : '#ffffff', on ? 5 : 3, on ? '#ff5fa2' : OUT);
        drawPet(p, r.x + r.w / 2, r.y + 90, this.t, { scale: 1.6, walking: on });
        text(PET_INFO[p].short, r.x + r.w / 2, r.y + 116, { size: 20, color: OUT, stroke: null });
      });
      text(`${S.pets.length} of 7 pets found`, VW / 2, PY + PH - 24, { size: 20, color: OUT, stroke: null });
    } else if (this.tab === 4) {
      HEB_BEADS.forEach((h, i) => {
        const r = this.hebRect(i), got = (S.hebrew || []).includes(h[2]);
        rr(r.x, r.y, r.w, r.h, 14); paint(got ? '#e4f0ff' : '#f4f0f8', 3);
        if (got) { drawBead('blue', r.x + r.w / 2, r.y + 56, 34); text(h[1], r.x + r.w / 2, r.y + 58, { size: 40, font: 'Noto Sans Hebrew', color: '#fff', lw: 5 }); text(h[2], r.x + r.w / 2, r.y + 124, { size: 20, color: OUT, stroke: null }); }
        else text('?', r.x + r.w / 2, r.y + 64, { size: 44, color: '#c8c0d8', stroke: null });
      });
    } else {
      S.stickers.slice(-40).forEach((w, i) => {
        const r = this.wordRect(i), hot = Input.hover(r);
        rr(r.x, r.y, r.w, r.h, 10); paint(hot ? '#fff6c8' : ['#ffe4f0', '#e4f0ff', '#e8ffe4', '#fff4d8'][i % 4], 2.5);
        text(w, r.x + r.w / 2, r.y + r.h / 2, { size: w.length > 6 ? 18 : 22, font: 'Andika', color: OUT, stroke: null });
      });
      if (!S.stickers.length) text('Words you spell show up here!', VW / 2, PY + 260, { size: 26, color: '#b8afc8', stroke: null });
    }
    Talk.strip();
  }
}

/* Dress-up closet at any mirror: her look, hats and outfits (bought with coins). */
class ClosetOverlay {
  constructor() { this.tab = 0; this.tabs = ['Me', 'Hats', 'Outfits']; this.t = 0; Talk.say('Dress up! Click to try things on. New things cost coins.'); }
  replay() { Talk.say(`You have ${S.coins} coins. Click to try things on.`); }
  items() {
    if (this.tab === 1) return [{ id: null, name: 'no hat' }].concat(Object.entries(HATS).map(([id, h]) => ({ id, name: h.name, price: h.price, key: 'hat:' + id })));
    if (this.tab === 2) return [{ id: null, name: 'my own clothes' }].concat(Object.entries(OUTFITS).map(([id, o]) => ({ id, name: o.name, price: o.price, key: 'outfit:' + id })));
    return [];
  }
  update(dt) {
    this.t += dt;
    if (Input.clicked(CLOSE_BTN) || Input.key('escape')) { this.scene.close(); return; }
    if (Input.clicked(HEAR_BTN)) this.replay();
    this.tabs.forEach((t, i) => { if (Input.clicked({ x: PX + 40 + i * 150, y: PY + 74, w: 140, h: 44 })) { this.tab = i; Sfx.click(); Speech.say(t); } });
    if (this.tab === 0) {
      SKINS.forEach((c, i) => { if (Input.clicked({ x: PX + 60 + i * 64, y: PY + 170, w: 54, h: 54 })) { S.look.skin = c; Sfx.click(); } });
      HAIRS.forEach((c, i) => { if (Input.clicked({ x: PX + 60 + i * 64, y: PY + 270, w: 54, h: 54 })) { S.look.hair = c; Sfx.click(); } });
      COLORS.forEach((c, i) => { if (Input.clicked({ x: PX + 60 + i * 64, y: PY + 370, w: 54, h: 54 })) { S.look.color = c; Sfx.click(); } });
      return;
    }
    const slot = this.tab === 1 ? 'hat' : 'outfit';
    this.items().forEach((it, i) => {
      const r = this.itemRect(i);
      if (!Input.clicked(r)) return;
      if (!it.id) { delete S.wear[slot]; Sfx.click(); Talk.say(`Okay, ${it.name}.`); return; }
      if (S.owned.includes(it.key)) { S.wear[slot] = it.id; Sfx.sparkle(); Talk.say(`You're wearing ${it.name}!`); }
      else if (S.coins >= it.price) { S.coins -= it.price; S.owned.push(it.key); S.wear[slot] = it.id; Sfx.coin(); Sfx.fanfare(); Talk.say(`You bought ${it.name} for ${it.price} coins! ${S.coins} coins left.`); }
      else Talk.say(`${it.name} costs ${it.price} coins. You have ${S.coins}. You need ${it.price - S.coins} more. Solve clues to earn coins!`);
      saveState();
    });
  }
  itemRect(i) { return { x: PX + 40 + (i % 4) * 140, y: PY + 136 + Math.floor(i / 4) * 150, w: 128, h: 138 }; }
  draw() {
    drawPanelFrame('Dress Up', '#f6f0ff');
    this.tabs.forEach((t, i) => { const on = i === this.tab; rr(PX + 40 + i * 150, PY + 74, 140, 44, 12); paint(on ? '#ffd23f' : '#fff', on ? 4 : 2.5); text(t, PX + 110 + i * 150, PY + 96, { size: 22, color: OUT, stroke: null }); });
    drawCoin(PX + 520, PY + 96, this.t); text(String(S.coins), PX + 542, PY + 97, { size: 24, color: OUT, stroke: null, align: 'left' });
    // her, big
    rr(PX + PW - 250, PY + 80, 220, 370, 20); paint('#ffffff', 3);
    drawHero(PX + PW - 140, PY + 420, { scale: 2.6, face: Math.sin(this.t) > 0 ? 1 : -1, mazel: false, blink: Math.sin(this.t * 1.3) > 0.97 });
    if (this.tab === 0) {
      [['Skin', SKINS, 'skin'], ['Hair', HAIRS, 'hair'], ['Favorite color', COLORS, 'color']].forEach(([lab, arr, key], row) => {
        text(lab, PX + 60, PY + 150 + row * 100, { size: 20, color: OUT, stroke: null, align: 'left' });
        arr.forEach((c, i) => { const on = S.look[key] === c; circle(PX + 87 + i * 64, PY + 197 + row * 100, 25); paint(c, on ? 5 : 3, on ? '#ff5fa2' : OUT); });
      });
      return;
    }
    const slot = this.tab === 1 ? 'hat' : 'outfit';
    this.items().forEach((it, i) => {
      const r = this.itemRect(i), on = (S.wear[slot] || null) === it.id, hot = Input.hover(r);
      rr(r.x, r.y, r.w, r.h, 14); paint(on ? '#fff6c8' : hot ? '#fbf6ff' : '#ffffff', on ? 5 : 3, on ? '#ff5fa2' : OUT);
      const wear = Object.assign({}, S.wear); if (it.id) wear[slot] = it.id; else delete wear[slot];
      drawHero(r.x + r.w / 2, r.y + 96, { scale: 1.15, mazel: false, wear });
      if (!it.id) text('none', r.x + r.w / 2, r.y + 122, { size: 15, color: OUT, stroke: null });
      else if (S.owned.includes(it.key)) text('yours!', r.x + r.w / 2, r.y + 122, { size: 15, color: '#3a9a5a', stroke: null });
      else { drawCoin(r.x + r.w / 2 - 18, r.y + 122, 0); text(String(it.price), r.x + r.w / 2, r.y + 123, { size: 17, color: OUT, stroke: null, align: 'left' }); }
    });
    Talk.strip();
  }
}

/* Making friends with a pet: gentle petting, no way to fail. */
class PetGame {
  constructor(pet, onDone) {
    this.pet = pet; this.onDone = onDone; this.t = 0; this.pets = 0; this.need = 3;
    Talk.say(`Oh! It's ${PET_INFO[pet].name}! ${PET_INFO[pet].short} is a little shy. Press the space bar or click to pet gently, three times.`, { show: 'Press SPACE or click to pet, 3 times!' });
  }
  replay() { Talk.say('Press the space bar or click to pet, three times.'); }
  update(dt) {
    this.t += dt;
    if (Input.clicked(CLOSE_BTN) || Input.key('escape')) { this.scene.close(); return; }
    if (this.pets >= this.need) { if (this.t > this.doneAt + 1.2) { this.scene.close(); this.onDone(); } return; }
    if (Input.key(' ') || Input.key('enter') || (Input.click && !Input.clicked(CLOSE_BTN) && !Input.clicked(HEAR_BTN))) {
      this.pets++; Sfx.chime(); FX.hearts(VW / 2, VH / 2 - 40, 4);
      Speech.say(NUM_WORDS[this.pets] + '!');
      if (this.pets >= this.need) { this.doneAt = this.t; Sfx.fanfare(); FX.confetti(VW / 2, VH / 2 - 60, 40); }
    }
    if (Input.clicked(HEAR_BTN)) this.replay();
  }
  draw() {
    drawPanelFrame(`Hello, ${PET_INFO[this.pet].short}!`, '#f0fff0');
    const hop = this.pets >= this.need ? Math.abs(Math.sin(this.t * 8)) * 20 : 0;
    drawPet(this.pet, VW / 2, VH / 2 + 80 - hop, this.t, { scale: 4, walking: this.pets >= this.need });
    for (let k = 0; k < this.need; k++) drawHeart(VW / 2 - 60 + k * 60, PY + 110, 18, k < this.pets ? '#ff5fa2' : '#f0e0e8', 3);
    if (this.pets < this.need && Math.sin(this.t * 4) > -0.3) drawKey('SPACE', VW / 2, PY + PH - 40, '#8be06b', 110);
    FX.draw();
    Talk.strip();
  }
}

/* Design her own bead for the Great Bead Chain. */
class BeadDesign {
  constructor(onDone) {
    this.onDone = onDone; this.t = 0; this.c = 'pink'; this.shape = 'heart';
    Talk.say("You found the Great Bead Chain! Thank you, detective! Now you get to add your very own bead to the chain. Pick a color and a shape!", { show: 'Pick a color and a shape for YOUR bead!' });
  }
  replay() { Talk.say('Pick a color and a shape. Then click Done.'); }
  update(dt) {
    this.t += dt;
    if (Input.clicked(HEAR_BTN)) this.replay();
    TRAY_COLORS.concat(['red', 'white']).forEach((c, i) => { if (Input.clicked({ x: PX + 60 + i * 90, y: PY + 300, w: 76, h: 76 })) { this.c = c; Sfx.click(); Speech.say(c); } });
    SHAPES.forEach((s, i) => { if (Input.clicked({ x: PX + 160 + i * 130, y: PY + 390, w: 110, h: 60 })) { this.shape = s; Sfx.click(); Speech.say(s); } });
    if (this.doneBtn || Input.key('enter')) { S.myBead = { c: this.c, shape: this.shape }; saveState(); this.scene.close(); this.onDone(); }
  }
  draw() {
    drawPanelFrame('My Bead', '#fff0f6', { face: personFace(NPC_LOOKS.feldman) });
    drawBead(this.c, VW / 2, PY + 180, 70 + Math.sin(this.t * 3) * 3, { shape: this.shape });
    TRAY_COLORS.concat(['red', 'white']).forEach((c, i) => { const on = c === this.c; circle(PX + 98 + i * 90, PY + 338, 32); paint(BEAD_COLORS[c], on ? 6 : 3, on ? '#ff5fa2' : OUT); });
    SHAPES.forEach((s, i) => { const on = s === this.shape; rr(PX + 160 + i * 130, PY + 390, 110, 60, 12); paint(on ? '#fff6c8' : '#fff', on ? 5 : 3, on ? '#ff5fa2' : OUT); drawBead(this.c, PX + 215 + i * 130, PY + 420, 18, { shape: s }); });
    this.doneBtn = button('Done!', PX + PW - 110, PY + 180, 150, 64, { color: '#8be06b', size: 30 });
    Talk.strip();
  }
}

/* The 100th Day Party: everyone dances, wearing what she made. */
class PartyOverlay {
  constructor() {
    this.t = 0; Music.play('win', { loop: false });
    setTimeout(() => Music.play('coney'), 2500);
    Talk.say("Happy hundredth day! The Great Bead Chain is back, with your bead on it! Coo and her babies came to the party too! You solved the mystery, Detective Sadelle!", { show: 'You solved the mystery!' });
  }
  replay() { Talk.say('You solved the mystery! You can keep exploring, find pets, and make jewelry for your friends.'); }
  update(dt) {
    this.t += dt;
    if (Math.random() < 0.15) FX.confetti(rint(100, VW - 100), 60, 6);
    if (this.t > 4 && (Input.key(' ') || Input.key('enter') || Input.click || Input.key('escape'))) { this.scene.close(); Talk.say('Now you can explore! Find all 7 pets, and make jewelry for your friends. They have orders for you!'); }
  }
  draw() {
    ctx.fillStyle = 'rgba(40,20,60,.82)'; ctx.fillRect(0, 0, VW, VH);
    text('You solved the mystery!', VW / 2, 80, { size: 52, color: '#ffd23f', lw: 8 });
    const cast = ['okafor', 'gus', 'ruby', 'theo', 'feldman', 'stone', 'lena', 'shapiro', 'joy', 'marisol'];
    cast.forEach((k, i) => {
      const x = 90 + i * 87, y = 400 + Math.abs(Math.sin(this.t * 5 + i)) * -18;
      drawPerson(x, y, { look: NPC_LOOKS[k], scale: 1.05, face: i % 2 ? -1 : 1, wave: Math.max(0, Math.sin(this.t * 6 + i)) });
      if (S.gifts[k]) drawGiftNecklace(x, y, 1.05, i % 2 ? -1 : 1, !NPC_LOOKS[k].kid);
    });
    drawHero(VW / 2, 300 + Math.abs(Math.sin(this.t * 5)) * -20, { scale: 1.8, wave: 1 });
    // the chain arching over everyone
    for (let i = 0; i < 40; i++) { const a = Math.PI * (i / 39); circle(VW / 2 - Math.cos(a) * 400, 250 - Math.sin(a) * 110, 8); paint(BEAD_COLORS[BEAD_NAMES[i % 6]], 1.5); }
    if (S.myBead) drawBead(S.myBead.c, VW / 2, 140, 18, { shape: S.myBead.shape });
    drawPet('pigeon', VW / 2 + 140, 150, this.t, { scale: 1.4, walking: true });
    drawPet('pigeon', VW / 2 + 180, 160, this.t, { scale: 0.7 });
    if (S.pet) drawPet(S.pet, VW / 2 - 90, 310, this.t, { scale: 1.3, walking: true });
    FX.update(1 / 60); FX.draw();
    if (this.t > 4) text('Press SPACE to keep exploring', VW / 2, VH - 40, { size: 24, color: '#fff', lw: 5 });
    Talk.strip();
  }
}

/* ---------- Title ---------- */
class TitleScene {
  constructor() { this.t = 0; Music.stop(); }
  update(dt) {
    this.t += dt;
    Talk.update(dt);
    if (!this.spoke && (Input.click || Input.hit.size)) { this.spoke = true; Sfx.init(); if (!this.playBtn && !Input.key(' ') && !Input.key('enter')) Speech.say('Hi Sadelle! Press the green Play button, or the space bar!'); }
    if (this.playBtn || Input.key(' ') || Input.key('enter')) {
      Sfx.init(); S.created = true; saveState();
      const at = S.at && MAPS[S.at.map] && S.step > 0 ? S.at : null;
      Game.go(new WorldScene(at ? at.map : 'school', at ? null : null));
    }
  }
  draw() {
    const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#2a1a4a'); g.addColorStop(1, '#6a3a6a'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    for (let i = 0; i < 40; i++) { const x = (i * 97) % VW, y = (i * 53) % 260; star(x, y, 2 + (i % 3) + Math.sin(this.t * 3 + i), 4, 0.4); paint('#fff6b0', 0); }
    // the bead chain arc
    for (let i = 0; i < 30; i++) { const a = Math.PI * (i / 29); drawBead(BEAD_NAMES[i % 6], VW / 2 - Math.cos(a) * 330, 250 - Math.sin(a) * 150 + Math.sin(this.t * 2 + i) * 3, 9); }
    text('Sadelle and the', VW / 2, 150, { size: 36, color: '#ffd6f0', lw: 6 });
    text('Secret Tunnel', VW / 2, 210, { size: 72, color: '#ffd23f', lw: 10 });
    text('A School Mystery', VW / 2, 268, { size: 26, color: '#fff', lw: 5 });
    drawHero(VW / 2 - 40, 430 + Math.sin(this.t * 3) * 3, { scale: 2, wave: Math.max(0, Math.sin(this.t * 4)), mazel: false });
    drawMazelFace(VW / 2 + 70, 380, 34, false);
    if (S.clues.includes('chain')) drawPet('pigeon', VW / 2 + 260, 160 + Math.sin(this.t * 2) * 8, this.t, { scale: 1.5, walking: true, face: -1 });
    else { const qy = 140 + Math.sin(this.t * 2) * 8; circle(VW / 2 + 260, qy, 26); paint('#5a5068', 3); text('?', VW / 2 + 260, qy + 2, { size: 34, color: '#fff', stroke: null }); }
    this.playBtn = button(S.step > 0 ? 'Keep Playing' : 'Play!', VW / 2 + 260, 440, 230, 80, { color: '#8be06b', size: 36 });
    text('Arrow keys to walk  •  Space to talk  •  N notebook  •  J jewelry', VW / 2, VH - 18, { size: 16, color: '#e8d8f8', stroke: null });
  }
}

/* ---------- Parent panel (Shift+P) ---------- */
const Parent = {
  open() { const el = document.getElementById('parent'); el.style.display = 'block'; this.render(); },
  close() { document.getElementById('parent').style.display = 'none'; saveState(); },
  render() {
    const el = document.getElementById('parent');
    const days = Object.entries(S.played).sort().slice(-7).map(([d, s]) => `<tr><td>${d}</td><td>${Math.round(s / 60)} min</td></tr>`).join('');
    const skills = Object.keys(SKILL_MAX).map(k => { const sk = S.skills[k]; return `<tr><td>${SKILL_NAMES[k]}</td><td>${sk ? sk.level + ' / ' + SKILL_MAX[k] : '—'}</td><td>${Adapt.accuracy(k) ?? '—'}${Adapt.accuracy(k) != null ? '%' : ''}</td></tr>`; }).join('');
    const missed = Object.entries(S.stats.missed).sort((a, b) => b[1] - a[1]).slice(0, 30)
      .map(([k, n]) => { const [sk, item] = k.split(':'); return `<tr><td>${SKILL_NAMES[sk] || sk}</td><td>${item}</td><td>${n} miss${n > 1 ? 'es' : ''}</td><td>${S.stats.right[k] || 0} right</td></tr>`; }).join('');
    const help = Object.entries((S.stats && S.stats.help) || {}).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([w, n]) => `${w} (${n})`).join(', ');
    el.innerHTML = `<div class="box">
      <h2>Parent panel</h2>
      <div class="row">Story: step ${S.step + 1} of ${STORY.length} — <b>${STORY[Math.min(S.step, STORY.length - 1)].short}</b>. Clues ${S.clues.length}/${CLUE_ORDER.length}, pets ${S.pets.length}/7, jewelry made ${S.jewelry.length}, coins ${S.coins}.</div>
      <h3>Skills (level / max, accuracy on last 20 first tries)</h3><table>${skills}</table>
      <h3>Most-missed items</h3><p style="opacity:.8">Counting items read like "19+10" (count by 10s starting at 19) or "32-1" (count down from 32). Words are spelling words.</p>
      <table>${missed || '<tr><td>None yet</td></tr>'}</table>
      <h3>Words she clicked for help while reading</h3><p>${help || 'None yet'}</p>
      <h3>Time played</h3><table>${days || '<tr><td>None yet</td></tr>'}</table>
      <h3>Settings</h3>
      <div class="row">Voice: <select id="pv">${Speech.voices().map(v => `<option ${Speech.voice && v.name === Speech.voice.name ? 'selected' : ''}>${v.name}</option>`).join('')}</select> <button data-a="test">Test voice</button></div>
      <div class="row">Speech speed: <button data-a="slow">Slower</button><button data-a="fast">Faster</button> (${(S.settings.speechRate || 1).toFixed(2)})</div>
      <div class="row"><button data-a="music">Music: ${S.settings.musicOff ? 'off' : 'on'}</button><button data-a="sfx">Sounds: ${S.settings.sfxOff ? 'off' : 'on'}</button></div>
      <div class="row">Jump to story step: <select id="pj">${STORY.map((s, i) => `<option value="${i}" ${i === S.step ? 'selected' : ''}>${i + 1}. ${s.short}</option>`).join('')}</select> <button data-a="jump">Jump</button></div>
      <div class="row"><button data-a="coins">+50 coins</button><button data-a="reset" style="background:#e8442f;color:#fff">Reset all progress</button></div>
      <div class="row"><button data-a="close" style="background:#8be06b">Close</button></div>
    </div>`;
    el.querySelectorAll('button').forEach(b => b.onclick = () => this.act(b.dataset.a));
    const pv = el.querySelector('#pv'); if (pv) pv.onchange = () => { S.settings.voice = pv.value; Speech.choose(); saveState(); };
  },
  act(a) {
    if (a === 'close') return this.close();
    if (a === 'test') Speech.say('Hi Sadelle! Let us solve the mystery. Sss, ship, frog.');
    if (a === 'slow') S.settings.speechRate = Math.max(0.6, (S.settings.speechRate || 1) - 0.1);
    if (a === 'fast') S.settings.speechRate = Math.min(1.4, (S.settings.speechRate || 1) + 0.1);
    if (a === 'music') { S.settings.musicOff = !S.settings.musicOff; if (S.settings.musicOff) Music.stop(); }
    if (a === 'sfx') S.settings.sfxOff = !S.settings.sfxOff;
    if (a === 'coins') S.coins += 50;
    if (a === 'jump') {
      const i = +document.getElementById('pj').value;
      S.step = i;
      if (i > 0) ['bead1', 'bead2', 'bead3'].forEach(b => S.done[b] = true);
      // give the clues that come before this step
      const clueAt = { feldman: 'feather', okafor: 'footprints', gus: 'log', theo: 'glitter', ruby: 'rubybox', board: 'oldmap', gems: 'camera', zamboni: 'skate', register: 'crumbs', theoS: 'ticket', tank: 'shell', wheel: 'chain' };
      S.clues = STORY.slice(0, i).map(s => clueAt[s.id]).filter(Boolean);
      saveState(); this.close();
      const g = currentGoal();
      Game.go(new WorldScene(g.map || 'school'));
      return;
    }
    if (a === 'reset') { if (confirm('Erase all progress for this game?')) { S = defaultState(); saveState(); this.close(); Game.go(new TitleScene()); return; } }
    saveState(); this.render();
  },
};

/* The Big Wheel ride: up to the top, where Coo has a nest made of beads. Then (after the necklace) the eggs hatch. */
class WheelRide {
  constructor(phase, then) {
    this.phase = phase; this.then = then; this.t = 0; this.done = false;
    const lines = phase === 'up'
      ? [['Up, up, up we go! Look at the very top! A nest made of beads, and a pigeon!', 'A nest made of beads!'],
         ["Coo coo! Mazel can speak pigeon. Her name is Coo! She made a sparkly nest for her eggs. Let's make her a necklace, so she can give the chain back!", 'Make Coo her own sparkly necklace!']]
      : [['Coo loves her necklace! Coo coo! She gives back the Great Bead Chain. And look, her eggs are hatching!', 'The eggs are hatching!']];
    (async () => { for (const [l, sh] of lines) await Talk.say(l, { show: sh }); this.done = true; })();
    if (phase === 'hatch') { Sfx.fanfare(); }
  }
  replay() { Talk.say(Talk.last, { show: Talk.line }); }
  update(dt) {
    this.t += dt;
    if (this.phase === 'hatch' && this.t > 2.5 && this.t < 2.6) { Sfx.chime(); FX.confetti(VW / 2, VH / 2 - 60, 50); }
    const skip = this.t > 3 && (Input.key(' ') || Input.key('enter') || Input.click);
    if ((this.done && this.t > 3) || skip) { if (this.closed) return; this.closed = true; Speech.stop(); this.scene.close(); this.then(); }
  }
  draw() {
    const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#8ad0f0'); g.addColorStop(1, '#ffe0b0'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    ctx.fillStyle = '#4a90d8'; ctx.fillRect(0, VH - 60, VW, 60);
    const cx = VW / 2 - 120, cy = 300, R = 210;
    const rise = this.phase === 'up' ? Math.min(1, this.t / 4) : 1;
    ctx.save();
    // the wheel turns so her car rises from the bottom to the top
    const a0 = Math.PI / 2 - rise * Math.PI;
    ctx.strokeStyle = '#ff5f6a'; ctx.lineWidth = 10; circle(cx, cy, R); ctx.stroke();
    for (let i = 0; i < 8; i++) { const a = a0 + i * TAU / 8; ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke(); }
    for (let i = 1; i < 8; i++) { const a = a0 + i * TAU / 8; rr(cx + Math.cos(a) * R - 20, cy + Math.sin(a) * R, 40, 28, 7); paint(['#ff5fa2', '#4aa3ff', '#ffd23f', '#8be06b'][i % 4], 3); }
    const hx = cx + Math.cos(a0) * R, hy = cy + Math.sin(a0) * R;
    rr(hx - 30, hy, 60, 40, 9); paint('#b07cff', 3);
    drawHero(hx, hy + 30, { scale: 0.9, face: 1, wave: rise >= 1 ? 1 : 0 });
    ctx.restore();
    // Coo's nest on a perch at the top
    const nx = cx + 150, ny = cy - R - 10;
    rr(nx - 6, ny, 12, 120, 3); paint('#c0c8d8', 2.5);
    ellipse(nx, ny, 64, 22); paint('#a07a4a', 3);
    if (this.phase === 'up') for (let i = 0; i < 14; i++) { circle(nx - 52 + i * 8, ny - 6 + Math.sin(i * 1.7) * 4, 5); paint(BEAD_COLORS[BEAD_NAMES[i % 6]], 1.2); }
    const hatch = this.phase === 'hatch' && this.t > 2.5;
    for (const ex of [-14, 14]) {
      if (hatch) { drawPet('pigeon', nx + ex, ny - 4, this.t + ex, { scale: 0.7, face: ex < 0 ? -1 : 1 }); ctx.beginPath(); ctx.arc(nx + ex, ny + 2, 10, 0, Math.PI); paint('#fffaf0', 2); }
      else { ellipse(nx + ex, ny - 8, 10, 13); paint('#fffaf0', 2.5); if (this.phase === 'hatch') { ctx.strokeStyle = OUT; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(nx + ex - 6, ny - 10); ctx.lineTo(nx + ex - 2, ny - 6); ctx.lineTo(nx + ex + 3, ny - 11); ctx.stroke(); } }
    }
    drawPet('pigeon', nx + 50, ny - 14, this.t, { scale: 2, face: -1, walking: Math.sin(this.t * 2) > 0.5 });
    if (this.phase === 'hatch') for (let i = 0; i < 5; i++) { circle(nx + 64 + Math.cos(i) * 10, ny - 36 + i * 3, 3.5); paint(BEAD_COLORS[BEAD_NAMES[i]], 1); }
    if (this.phase === 'hatch') { for (let i = 0; i < 24; i++) { const a = Math.PI * (i / 23); circle(VW / 2 + 200 - Math.cos(a) * 140, 460 - Math.sin(a) * 60, 8); paint(BEAD_COLORS[BEAD_NAMES[i % 6]], 1.5); } text('The Great Bead Chain!', VW / 2 + 200, 500, { size: 24, color: '#fff', lw: 5 }); }
    FX.draw();
    Talk.strip();
    if (this.t > 3 && Math.sin(this.t * 4) > -0.3) drawKey('SPACE', VW - 80, VH - 30, '#8be06b', 100);
  }
}
