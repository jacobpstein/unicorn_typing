'use strict';

/* All the places: the school, the secret tunnel, and the six places it leads to. */

/* ---------- Conversations ---------- */
const jewelryCompliment = () => S.wearJewel != null && S.jewelry[S.wearJewel] && Math.random() < 0.35
  ? pick([`Ooh, I love your ${S.jewelry[S.wearJewel].kind}!`, `What a sparkly ${S.jewelry[S.wearJewel].kind}! Did you make that?`, `Your ${S.jewelry[S.wearJewel].kind} is so pretty!`]) : null;

/*
  A friend: when the story points at them, `quest` runs. After that they take a jewelry order (if they have one),
  then offer to play their challenge again for practice.
*/
function friendTalk(sc, npc) {
  const st = STORY[S.step];
  if (npc.quest && st.ent === npc.id && st.map === sc.mapId) { npc.quest(sc, npc); return; }
  if (orderTalk(sc, npc)) return;
  if (npc.notYet && S.step <= stepIndex(npc.step)) { npc.say(npc.notYet); return; }
  if (npc.practice && npc.step && pastStep(npc.step)) {
    if (npc.offered) { npc.offered = false; sc.open(npc.practice({ who: npc.whoObj(), count: 3, coins: 3 })); return; }
    npc.offered = true;
    npc.say(`${jewelryCompliment() || pick(npc.lines || ['Hi!'])} Talk to me again if you want to play once more!`);
    return;
  }
  npc.say(jewelryCompliment() || pick(npc.lines || ['Hi there!']));
}
/* Open a story challenge; when it's done, move the story on and hand over a clue. */
function questChallenge(step, make, clue, after) {
  return (sc, who) => {
    sc.open(make({
      count: 3, coins: 6,
      who: who.whoObj ? who.whoObj() : who,
      onDone: () => {
        const go = () => { advance(step, sc); if (after) after(sc); maybeBreak(sc); };
        if (clue) giveClue(sc, clue, go); else go();
      },
    }));
  };
}
function stationTalk(sc, st) {
  const step = STORY[S.step];
  if (st.quest && step.ent === st.id && step.map === sc.mapId) { st.quest(sc, { whoObj: () => st.who || null }); return; }
  if (st.practice && st.step && pastStep(st.step)) {
    if (st.offered) { st.offered = false; sc.open(st.practice({ who: st.who || null, count: 3, coins: 3 })); return; }
    st.offered = true; Talk.say('Want to play again? Walk into it again, or press the space bar!'); return;
  }
  Talk.say(st.notYet || 'Not yet! Follow the yellow arrow first.');
}

const npc = (id, o) => Object.assign({ id, look: NPC_LOOKS[o.lookId || id], talk: friendTalk }, o);
const station = (id, o) => Object.assign({ id, use: stationTalk }, o);

/* ---------- Props ---------- */
function plate(label) {
  return (x, y) => {
    const w = textW(label, 16) + 18;
    rr(x - w / 2, y - 38, w, 26, 7); paint('#fffaf0', 2.5);
    text(label, x, y - 25, { size: 16, font: 'Andika', color: OUT, stroke: null });
  };
}
function artBeadTable(x, y, t) {
  rr(x - 40, y - 14, 80, 40, 8); paint('#ffb3c8', 3);
  ['pink', 'blue', 'yellow', 'green'].forEach((c, i) => { ellipse(x - 27 + i * 18, y - 2, 8, 5); paint('#fffaf0', 1.5); drawBead(c, x - 27 + i * 18, y - 4, 4); });
  ctx.strokeStyle = '#c8a0b8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 30, y + 14); ctx.quadraticCurveTo(x, y + 4 + Math.sin(t * 2) * 2, x + 30, y + 14); ctx.stroke();
}
function artMirror(x, y, t) {
  rr(x - 18, y - 40, 36, 64, 16); paint('#c8a070', 3); rr(x - 12, y - 34, 24, 52, 12); paint('#dff2ff', 2);
  ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(x - 6, y - 28, 4, 30);
  text('dress up', x, y + 36, { size: 13, color: '#fff', lw: 3 });
}
function artBoard(x, y) {
  rr(x - 40, y - 34, 80, 54, 6); paint('#c8925a', 3); rr(x - 34, y - 28, 68, 42, 3); paint('#e8c89a', 0);
  [['#fffaf0', -22, -18], ['#ffe0a0', 6, -20], ['#d0f0ff', -14, 0], ['#ffd0e0', 14, -2]].forEach(([c, a, b]) => { rr(x + a - 9, y + b - 6, 20, 16, 2); paint(c, 1.5); circle(x + a, y + b - 6, 2); paint('#e8442f', 0); });
}
function artEasel(x, y) {
  ctx.strokeStyle = '#8a5a32'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 16, y + 24); ctx.lineTo(x, y - 34); ctx.lineTo(x + 16, y + 24); ctx.stroke();
  rr(x - 26, y - 30, 52, 40, 4); paint('#fffaf0', 3);
  text('cap', x - 6, y - 10, { size: 16, font: 'Andika', color: '#2f6fe0', stroke: null }); text('e', x + 16, y - 10, { size: 18, font: 'Andika', color: '#a66cff', stroke: null });
}
function artChainHook(x, y, t) {
  rr(x - 50, y - 60, 100, 70, 8); paint('#a06a3a', 3); rr(x - 44, y - 54, 88, 58, 5); paint('#f6ead8', 0);
  circle(x, y - 46, 5); paint('#c0c8d8', 2);
  if (S.step >= stepIndex('free')) {
    for (let i = 0; i < 13; i++) { const a = Math.PI * (0.08 + 0.84 * i / 12); circle(x - Math.cos(a) * 38, y - 46 + Math.sin(a) * 40, 5); paint(BEAD_COLORS[BEAD_NAMES[i % 6]], 1.2); }
    if (S.myBead) drawBead(S.myBead.c, x, y - 2, 9, { shape: S.myBead.shape });
  } else text('?', x, y - 20, { size: 26, color: '#c8a070', stroke: null });
  text('Great Bead Chain', x, y + 20, { size: 13, color: '#fff', lw: 3 });
}
function artDino(x, y, t) {
  ctx.strokeStyle = '#f6f0e4'; ctx.lineCap = 'round';
  ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(x - 90, y + 10); ctx.quadraticCurveTo(x - 40, y - 40, x + 20, y - 20); ctx.quadraticCurveTo(x + 60, y - 70, x + 80, y - 110); ctx.stroke();
  ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.stroke();
  for (let i = 0; i < 6; i++) { const px = x - 60 + i * 16; ctx.strokeStyle = '#f6f0e4'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(px, y - 28 + Math.abs(i - 3) * 3); ctx.lineTo(px, y + 2); ctx.stroke(); }
  for (const lx of [x - 40, x + 6]) { ctx.strokeStyle = '#f6f0e4'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(lx, y - 14); ctx.lineTo(lx + 4, y + 40); ctx.stroke(); }
  ellipse(x + 90, y - 118, 22, 14, -0.3); paint('#f6f0e4', 3); circle(x + 96, y - 122, 4); paint(OUT, 0);
  rr(x - 100, y + 38, 200, 12, 4); paint('#8a6a4a', 3);
}
function artGemCase(x, y, t) {
  rr(x - 30, y - 6, 60, 30, 5); paint('#6a5a8a', 3);
  rr(x - 26, y - 34, 52, 30, 5); ctx.fillStyle = 'rgba(200,235,255,.5)'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = OUT; ctx.stroke();
  ['#ff6fae', '#4aa3ff', '#5fd068', '#a66cff', '#ffd23f'].forEach((c, i) => { const gx = x - 18 + i * 9, gy = y - 18 + (i % 2) * 6; ctx.beginPath(); ctx.moveTo(gx, gy - 6); ctx.lineTo(gx + 5, gy); ctx.lineTo(gx, gy + 6); ctx.lineTo(gx - 5, gy); ctx.closePath(); paint(c, 1); });
  if (Math.random() < 0.03) FX.sparkle(x + rint(-20, 20), y - 20, 1);
}
function artSphinxCat(x, y) {
  rr(x - 26, y + 4, 52, 20, 4); paint('#d6b37a', 3);
  ellipse(x, y - 4, 22, 12); paint('#e8c88a', 3); circle(x + 14, y - 20, 11); paint('#e8c88a', 3);
  for (const ex of [8, 20]) { ctx.beginPath(); ctx.moveTo(x + ex - 4, y - 26); ctx.lineTo(x + ex, y - 38); ctx.lineTo(x + ex + 4, y - 26); ctx.closePath(); paint('#e8c88a', 2); }
}
function artZamboni(x, y, t) {
  rr(x - 30, y - 22, 60, 36, 8); paint('#e8442f', 3); rr(x - 24, y - 34, 26, 16, 4); paint('#bfe6ff', 2.5);
  for (const wx of [-18, 18]) { circle(x + wx, y + 16, 8); paint('#2a2a3a', 2); }
  text('ICE', x + 12, y - 4, { size: 14, color: '#fff', lw: 3 });
}
function artRegister(x, y) {
  rr(x - 22, y - 10, 44, 28, 5); paint('#5a8ac8', 3); rr(x - 16, y - 30, 32, 20, 4); paint('#2a2a3a', 2.5);
  text('$', x, y - 20, { size: 14, color: '#8be06b', stroke: null }); for (let i = 0; i < 3; i++) { rr(x - 14 + i * 10, y - 4, 7, 6, 2); paint('#fffaf0', 1); }
}
function artOven(x, y, t) {
  rr(x - 40, y - 30, 80, 60, 8); paint('#a0523f', 3); ellipse(x, y + 2, 26, 18); paint('#2a1a12', 3);
  ctx.globalAlpha = 0.5 + Math.sin(t * 4) * 0.2; ellipse(x, y + 6, 18, 10); paint('#ff8a1f', 0); ctx.globalAlpha = 1;
}
function artDepartures(x, y, t) {
  rr(x - 70, y - 40, 140, 64, 6); paint('#1e2236', 3);
  ['STOP', 'HOME', '????'].forEach((s, i) => text(s, x, y - 26 + i * 18, { size: 14, color: i === 2 ? '#ff8a8a' : '#ffd23f', stroke: null }));
}
function artClock(x, y, t) {
  circle(x, y, 30); paint('#f6ead8', 4, '#c8a070'); ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.lineCap = 'round';
  const h = (new Date()).getHours() % 12, m = (new Date()).getMinutes();
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(h / 12 * TAU) * 14, y - Math.cos(h / 12 * TAU) * 14); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(m / 60 * TAU) * 22, y - Math.cos(m / 60 * TAU) * 22); ctx.stroke();
}
function artTank(x, y, t) {
  for (let k = 0; k < 4; k++) {
    const fx = x - 120 + ((t * 30 + k * 70) % 240), fy = y - 70 + Math.sin(t + k) * 14 + k * 8;
    ctx.save(); ctx.translate(fx, fy); ellipse(0, 0, 14, 8); paint(['#ff8a5a', '#ffd23f', '#ff6fae', '#8ec5ff'][k], 2);
    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-22, -7); ctx.lineTo(-22, 7); ctx.closePath(); paint(['#ff8a5a', '#ffd23f', '#ff6fae', '#8ec5ff'][k], 2); ctx.restore();
  }
  rr(x - 24, y - 6, 48, 26, 6); paint('#3a7aa8', 3); text('FEED', x, y + 7, { size: 14, color: '#fff', lw: 3 });
}
function artJelly(x, y, t) {
  const b = Math.sin(t * 2) * 6;
  ctx.globalAlpha = 0.75; ellipse(x, y - 20 + b, 18, 13); paint('#ffb3e8', 2);
  ctx.strokeStyle = '#ffb3e8'; ctx.lineWidth = 3; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(x + i * 8, y - 10 + b); ctx.quadraticCurveTo(x + i * 8 + Math.sin(t * 3 + i) * 5, y + 4 + b, x + i * 8, y + 16 + b); ctx.stroke(); }
  ctx.globalAlpha = 1;
}
function artWheel(x, y, t) {
  const R = 110, cy = y - 130;
  ctx.strokeStyle = '#e8eef8'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(x - 50, y + 10); ctx.lineTo(x, cy); ctx.lineTo(x + 50, y + 10); ctx.stroke();
  ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.stroke();
  circle(x, cy, R); paint(null, 8, '#ff5f6a'); circle(x, cy, R); paint(null, 2);
  for (let i = 0; i < 8; i++) { const a = t * 0.25 + i * TAU / 8; ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(x + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke(); }
  for (let i = 0; i < 8; i++) { const a = t * 0.25 + i * TAU / 8; rr(x + Math.cos(a) * R - 12, cy + Math.sin(a) * R, 24, 18, 5); paint(['#ff5fa2', '#4aa3ff', '#ffd23f', '#8be06b'][i % 4], 2.5); }
  circle(x, cy, 12); paint('#ffd23f', 3);
  // the sparkly nest at the very top (until she gets the chain back)
  if (!pastStep('wheel')) {
    ellipse(x, cy - R - 16, 30, 12); paint('#a07a4a', 3);
    for (let i = 0; i < 9; i++) { circle(x - 24 + i * 6, cy - R - 20 + Math.sin(i) * 3, 3.5); paint(BEAD_COLORS[BEAD_NAMES[i % 6]], 1); }
    drawPet('pigeon', x + 8, cy - R - 20, t, { scale: 0.8, face: -1 });
    if (Math.random() < 0.04) FX.sparkle(x, cy - R - 20, 2);
  } else { drawPet('pigeon', x + 30, cy - R - 10, t, { scale: 0.8, face: -1 }); for (let i = 0; i < 5; i++) { circle(x + 36 + Math.cos(i) * 6, cy - R - 22 + i * 1.5, 2.2); paint(BEAD_COLORS[BEAD_NAMES[i]], 0.8); } drawPet('pigeon', x + 6, cy - R - 6, t, { scale: 0.45 }); drawPet('pigeon', x - 10, cy - R - 6, t, { scale: 0.45, face: -1 }); }
}
function artCarousel(x, y, t) {
  ctx.beginPath(); ctx.moveTo(x - 70, y - 40); ctx.lineTo(x, y - 90); ctx.lineTo(x + 70, y - 40); ctx.closePath(); paint('#ff5f6a', 3);
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x, y - 90); ctx.lineTo(x - 70 + i * 28, y - 40); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke(); }
  for (let i = 0; i < 3; i++) { const hx = x - 40 + i * 40, hy = y - 4 + Math.sin(t * 3 + i * 2) * 6; rr(hx - 2, y - 40, 4, 40, 2); paint('#ffd23f', 1); ellipse(hx, hy, 15, 8); paint(['#fffaf0', '#ffb3c8', '#bfe6ff'][i], 2); }
  rr(x - 74, y + 8, 148, 12, 5); paint('#c8325a', 3);
}
function artBooth(x, y) {
  rr(x - 30, y - 30, 60, 54, 6); paint('#ffd23f', 3); rr(x - 20, y - 20, 40, 22, 4); paint('#bfe6ff', 2);
  ctx.beginPath(); ctx.moveTo(x - 36, y - 30); ctx.lineTo(x, y - 52); ctx.lineTo(x + 36, y - 30); ctx.closePath(); paint('#e8442f', 3);
  text('TICKETS', x, y + 12, { size: 11, color: OUT, stroke: null });
}
function artHotdog(x, y) {
  rr(x - 34, y - 10, 68, 34, 6); paint('#ffd23f', 3); rr(x - 40, y - 40, 80, 14, 4); paint('#e8442f', 3);
  rr(x - 2, y - 28, 4, 20, 1); paint('#c0c8d8', 1); ellipse(x, y - 2, 18, 6); paint('#e8a060', 2); ellipse(x, y - 4, 14, 3); paint('#c8422f', 0);
}
function artLantern(x, y, t) { rr(x - 2, y - 30, 4, 12, 1); paint('#4a3a32', 0); rr(x - 9, y - 20, 18, 22, 5); paint('#3a2a20', 2.5); ctx.globalAlpha = 0.7 + Math.sin(t * 5 + x) * 0.2; rr(x - 5, y - 16, 10, 14, 3); paint('#ffd27a', 0); ctx.globalAlpha = 1; }
function artBleachers(x, y) { for (let r = 0; r < 3; r++) { rr(x - 70, y - 30 + r * 16, 140, 12, 3); paint(['#c89a62', '#b8894f', '#a87a40'][r], 2.5); } }
function artHoop(x, y) { rr(x - 3, y - 40, 6, 60, 2); paint('#8a8a9a', 2); rr(x - 18, y - 52, 36, 24, 3); paint('#fffaf0', 2.5); ellipse(x, y - 26, 12, 4); paint(null, 3, '#ff8a1f'); }
function artBench(x, y) { rr(x - 30, y - 4, 60, 12, 4); paint('#8a5a32', 2.5); for (const lx of [-24, 20]) { rr(x + lx, y + 6, 4, 12, 1); paint('#4a3a32', 0); } }
function artWhiteboard(x, y) { rr(x - 60, y - 30, 120, 48, 4); paint('#ffffff', 3, '#8a8a9a'); text('sh  ch  th', x, y - 6, { size: 18, font: 'Andika', color: '#2f6fe0', stroke: null }); }
function artHamsterCage(x, y, t) { rr(x - 22, y - 18, 44, 30, 5); paint(null, 2.5); ctx.strokeStyle = '#8a8a9a'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x - 18 + i * 7, y - 18); ctx.lineTo(x - 18 + i * 7, y + 12); ctx.stroke(); } text('empty!', x, y + 26, { size: 12, color: '#fff', lw: 3 }); }

/* A shiny bead to pick up (the lobby tutorial). */
function floorBead(id, x, y, c) {
  return {
    id, solid: false, when: () => !S.done[id],
    art: (px, py, t) => { ctx.globalAlpha = 0.5; ellipse(px, py + 14, 12, 4); paint(OUT, 0); ctx.globalAlpha = 1; drawBead(c, px, py + Math.sin(t * 4) * 3, 11); if (Math.random() < 0.04) FX.sparkle(px, py, 2); },
    touch(sc) {
      if (S.done[id]) return;
      S.done[id] = true; this.hidden = true;
      Sfx.coin(); FX.sparkle(this.cx(), this.cy(), 14);
      const n = ['bead1', 'bead2', 'bead3'].filter(b => S.done[b]).length;
      if (n >= 3) { Talk.say('Three beads! These are from the Great Bead Chain! Go show Principal Feldman.'); advance('beads', null); }
      else Talk.say(`${NUM_WORDS[n].replace(/^./, c => c.toUpperCase())}! Find ${3 - n === 1 ? 'one more' : 'two more'}.`);
      saveState();
    },
  };
}

const MAPS = {};

/* ---------- The school ---------- */
MAPS.school = () => {
  const b = new MB(44, 26, '#');
  b.rect(1, 2, 12, 9, '.');           // classroom
  b.rect(14, 2, 14, 9, 'k');          // cafeteria
  b.rect(29, 2, 14, 9, 'b');          // gym
  b.rect(1, 12, 42, 3, '.');          // hallway
  b.rect(1, 16, 10, 9, '.');          // art room
  b.rect(12, 16, 14, 9, 'm');         // lobby
  b.rect(27, 16, 7, 9, '.');          // office
  b.rect(35, 16, 8, 9, 'c');          // library
  for (let x = 1; x < 43; x++) if (![13, 28].includes(x)) b.set(x, 11, 'L');
  for (const x of [6, 7, 20, 21, 35, 36]) b.set(x, 11, '.');
  for (const x of [5, 6, 17, 18, 19, 20, 30, 38, 39]) b.set(x, 15, '.');
  // room names over the doorways
  [['Class 1-B', 6.5, 11], ['Cafeteria', 20.5, 11], ['Gym', 35.5, 11], ['Art Room', 5.5, 15], ['Lobby', 18.5, 15], ['Office', 30, 15], ['Library', 38.5, 15]].forEach(([l, x, y]) =>
    b.ent('deco', Math.floor(x), y, { solid: false, z: 200, art: (px, py) => plate(l)(px + (x % 1 ? T / 2 : 0), py + 6) }));

  // classroom
  for (const y of [6, 8]) for (const x of [3, 4, 7, 8, 10, 11]) b.set(x, y, 'D');
  b.set(12, 2, 'B').set(12, 3, 'B').set(1, 2, 'P');
  b.ent('deco', 6, 1, { solid: false, art: (x, y) => artWhiteboard(x + T / 2, y + 4) });
  b.ent('deco', 11, 4, { bw: 40, bh: 30, art: artHamsterCage });
  b.ent('npc', 6, 4, npc('okafor', {
    step: 'okafor', lines: ['Phonics power!', 'Every sound is a clue.', 'I am so proud of you, detective!'], order: 'okafor', practice: soundSorter,
    quest: questChallenge('okafor', o => soundSorter(Object.assign({ intro: "Hi, Sadelle! I found tiny footprints by the cubbies! Help me sort the cubbies, and I'll show you." }, o)), 'footprints'),
  }));
  b.ent('npc', 2, 9, npc('maya', { lookId: 'kid1', lines: ['Did you hear? The bead chain is missing!', 'I put a blue bead on the chain last year!', 'I like your shoes!'] }));

  // cafeteria
  b.rect(15, 3, 12, 1, 'C');
  for (const x of [16, 17, 18, 22, 23, 24]) b.set(x, 7, 'D');
  b.ent('npc', 20, 5, npc('gus', {
    step: 'gus', lines: ['I fix things! Hmm hmm hmm...', 'Every door in this school, I have a key for it.', 'Watch out, the floor is shiny!'], order: 'gus', practice: o => bagelBundles(Object.assign({ title: 'Lunch Trays' }, o)),
    quest: questChallenge('gus', o => bagelBundles(Object.assign({ title: 'Lunch Trays', intro: "Me? Take the chain? No way! I'll show you my work log. But first help me count lunch bagels. They come in bags of ten!" }, o)), 'log'),
  }));
  b.ent('npc', 17, 9, npc('dev', { lookId: 'kid2', lines: ['Pizza day is the best day.', 'Mr. Gus can fix anything!', 'I counted all the milk cartons. Thirty!'] }));

  // gym
  b.ent('deco', 33, 2, { bw: T * 3, bh: 30, art: (x, y) => artBleachers(x, y + 10) });
  b.ent('deco', 39, 2, { bw: T * 3, bh: 30, art: (x, y) => artBleachers(x, y + 10) });
  b.ent('deco', 29, 6, { bw: 30, bh: 20, art: artHoop });
  b.ent('npc', 35, 6, npc('theo', {
    step: 'theo', lines: ['Choo choo! Did you know trains run all night in New York?', 'I love counting down. Ten, nine, eight...', 'Rockets are cool. Trains are cooler.'], practice: o => countdownLaunch(Object.assign({ title: 'Balloon Rocket' }, o)),
    quest: questChallenge('theo', o => countdownLaunch(Object.assign({ title: 'Balloon Rocket', intro: "Sadelle! I saw glitter on the bleachers! But first, help me launch the party balloon rocket. We have to count down!" }, o)), 'glitter'),
  }));
  b.ent('pet', 41, 9, { pet: 'hamster' });

  // art room
  b.ent('station', 5, 18, station('studio', { art: artBeadTable, noCheck: true, use: sc => { if (pastStep('ruby')) sc.open(new StudioOverlay()); else Talk.say('The Sparkle Studio! Talk to Ruby first.'); } }));
  b.ent('station', 2, 17, station('mirror1', { art: artMirror, noCheck: true, use: sc => sc.open(new ClosetOverlay()) }));
  b.ent('station', 9, 17, station('easel', { art: artEasel, noCheck: true, use: sc => sc.open(magicE({ count: 4, coins: 4 })) }));
  b.ent('npc', 6, 21, npc('ruby', {
    step: 'ruby', lines: ['Beads, beads, beads! I love beads.', 'Want to make something? The bead table is right here!', 'You can wear the jewelry you make!'],
    quest: (sc, me) => sc.open(new BeadPuzzle({
      title: 'Pattern Bracelet', mode: 'pattern', unit: [{ c: 'pink' }, { c: 'blue' }], who: me.whoObj(),
      onDone: () => giveClue(sc, 'rubybox', () => { advance('ruby', sc); Talk.say('Now you can make jewelry any time! Press J, or use the bead table.'); }),
    })),
    talk: (sc, me) => { if (STORY[S.step].ent === 'ruby') { if (me.starting) return; me.starting = true; me.say("Me? I didn't take it! My beads are all here. Let's make a bracelet together!").then(() => { me.starting = false; if (!sc.overlay) me.quest(sc, me); }); return; } if (pastStep('ruby') && Math.random() < 0.5) { me.say('Let\'s make something!'); sc.open(new StudioOverlay()); return; } friendTalk(sc, me); },
  }));
  b.ent('npc', 2, 23, npc('noa', { lookId: 'kid3', lines: ['I am painting a rainbow.', 'Ruby made me a bracelet!', 'The magic e easel is fun. Try it!'] }));

  // lobby
  b.set(13, 16, 'K').set(14, 16, 'K').set(24, 16, 'K').set(12, 24, 'P').set(25, 24, 'P');
  b.ent('deco', 19, 16, { bw: 90, bh: 30, art: (x, y, t) => artChainHook(x + T / 2, y + 20, t) });
  b.ent('deco', 15, 20, floorBead('bead1', 15, 20, 'pink'));
  b.ent('deco', 23, 21, floorBead('bead2', 23, 21, 'blue'));
  b.ent('deco', 18, 18, floorBead('bead3', 18, 18, 'yellow'));
  b.ent('npc', 21, 19, npc('feldman', {
    lines: ['Hello, detective!', 'What do you call a sleeping dinosaur? A dino-snore!', 'I believe in you, Sadelle!'],
    talk: (sc, me) => {
      const g = currentGoal();
      if (S.step === 0) { me.say('Oh dear, oh dear! Pick up those shiny beads first, please!'); return; }
      if (g.id === 'feldman') {
        if (me.starting) return; me.starting = true;
        me.say("Sadelle! Our Great Bead Chain is gone, on our hundredth day party! Will you be our detective? Look, a gray feather!", 'Will you be our detective?')
          .then(() => { me.starting = false; giveClue(sc, 'feather', () => { advance('feldman', sc); Talk.say('Your notebook keeps your clues. Press N to look at it any time!'); }); });
        return;
      }
      if (g.id === 'party') { sc.open(new BeadDesign(() => { advance('party', sc); sc.open(new PartyOverlay()); })); return; }
      friendTalk(sc, me);
    },
  }));
  b.ent('door', 18, 25, { to: null, locked: () => true, lockedLine: 'The front door. We have a mystery to solve first!', color: '#2f6fe0' });
  b.ent('door', 19, 25, { to: null, locked: () => true, lockedLine: 'The front door. We have a mystery to solve first!', color: '#2f6fe0' });

  // office
  b.rect(28, 20, 3, 1, 'D').set(33, 16, 'B').set(27, 24, 'P');
  b.ent('station', 31, 18, station('board', {
    art: artBoard, step: 'board', notYet: 'The bulletin board has notes on it. Follow the yellow arrow first!', practice: readFind,
    quest: questChallenge('board', o => readFind(Object.assign({ intro: 'There are notes on the board! Read each one.', notes: [
      ['Get the map from the box.', 'map', ['mop', 'cap']],
      ['The bus is at the stop.', 'bus', ['box', 'bug']],
      ['A big rock is on the map.', 'rock', ['sock', 'lock']],
    ] }, o)), 'oldmap'),
  }));

  // library
  b.ent('station', 36, 23, station('robot', { noCheck: true, use: sc => sc.open(robotWords({ coins: 4 })),
    art: (x, y, t) => { const b = Math.sin(t * 4) * 2; rr(x - 18, y - 30 + b, 36, 30, 8); paint('#c0c8d8', 3); for (const ex of [-8, 8]) { circle(x + ex, y - 16 + b, 4); paint('#8be06b', 0); } rr(x - 14, y + 2, 28, 22, 6); paint('#a8b0c0', 3); rr(x - 1, y - 40 + b, 2, 10, 1); paint(OUT, 0); circle(x, y - 42 + b, 4); paint('#ff5f6a', 1.5); text('Robot Words', x, y + 34, { size: 12, color: '#fff', lw: 3 }); } }));
  b.rect(35, 18, 2, 1, 'B').rect(40, 18, 3, 1, 'B').rect(35, 21, 2, 1, 'B').rect(40, 21, 3, 1, 'B').set(42, 24, 'P');
  b.ent('npc', 37, 17, npc('bloom', {
    step: 'bloom', lines: ['Shhh... reading is magic.', 'Books can take you anywhere.', 'Have you read a mystery book? You are in one!'], practice: o => labelFixer(Object.assign({ title: 'Shelf Labels' }, o)),
    quest: questChallenge('bloom', o => labelFixer(Object.assign({ title: 'Shelf Labels', intro: 'A tunnel under my library? Hmm. The shelf labels are all mixed up. Fix them, and maybe we will find out!' }, o)), null,
      sc => { Sfx.door(); FX.confetti(43 * T, 22 * T, 30); Talk.say('Creeeak! The big bookcase moved! It is a secret door! Walk into it.'); }),
  }));
  b.ent('door', 43, 22, {
    to: 'tunnel', at: { x: 2, y: 5 }, locked: () => !pastStep('bloom'), lockedLine: 'A big bookcase. It looks a little loose...',
    draw(sc) { const x = this.tx * T, y = this.ty * T; ctx.fillStyle = '#7a4a2a'; ctx.fillRect(x, y - T, T, T * 2); for (let r = 0; r < 6; r++) for (let i = 0; i < 4; i++) { ctx.fillStyle = ['#e8442f', '#2f6fe0', '#ffd23f', '#3a8a5a'][(i + r) % 4]; ctx.fillRect(x + 5 + i * 10, y - T + 4 + r * 15, 7, 12); } ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y - T + 1.5, T - 3, T * 2 - 3); if (pastStep('bloom')) { ctx.globalAlpha = 0.4 + Math.sin(sc.t * 4) * 0.2; ctx.fillStyle = '#fff6b0'; ctx.fillRect(x, y - T, 6, T * 2); ctx.globalAlpha = 1; } },
  });

  addHebrewBead('school', b);
  return b.build({
    spawn: { x: 19, y: 23 }, pal: 'school', music: 'school', bg: '#3a2a20', carpet: '#5a7ac8', title: '',
    enter(sc) {
      if (S.step === 0) Talk.say("Welcome to school, Sadelle! Uh oh... the Great Bead Chain is missing! Look, there are shiny beads on the floor. Walk over them with the arrow keys!", { show: 'Use the arrow keys to walk over the shiny beads!' });
    },
  });
};

/* ---------- The secret tunnel ---------- */
const TUNNEL_DOORS = [
  { to: 'museum', x: 6, label: 'Museum', step: 'stone', icon: (x, y, t) => { ctx.save(); ctx.translate(x - 4, y + 18); ctx.scale(0.28, 0.28); artDino(0, 0, t); ctx.restore(); } },
  { to: 'rink', x: 12, label: 'Ice Rink', step: 'lena', icon: (x, y) => { ctx.fillStyle = '#dff2ff'; ctx.fillRect(x - 30, y - 30, 60, 60); rr(x - 12, y - 16, 20, 20, 5); paint('#fff', 2.5); rr(x - 15, y + 4, 28, 5, 2); paint('#c0c8d8', 2); } },
  { to: 'bagels', x: 18, label: 'Bagels', step: 'shapiro', icon: (x, y) => drawBagel(x, y, 1.2) },
  { to: 'station', x: 24, label: 'Trains', step: 'joy', icon: (x, y) => { rr(x - 18, y - 16, 36, 28, 6); paint('#e8442f', 2.5); rr(x - 12, y - 11, 10, 9, 2); paint('#bfe6ff', 1.5); rr(x + 2, y - 11, 10, 9, 2); paint('#bfe6ff', 1.5); for (const wx of [-10, 10]) { circle(x + wx, y + 14, 5); paint('#2a2a3a', 1.5); } } },
  { to: 'aquarium', x: 30, label: 'Aquarium', step: 'marisol', icon: (x, y, t) => { ctx.fillStyle = '#8ad0f0'; ctx.fillRect(x - 30, y - 30, 60, 60); drawFish(' ', '#ff8a5a')(x - 2, y, null, false, t); } },
  { to: 'coney', x: 36, label: 'Coney Island', step: 'booth', icon: (x, y) => { circle(x, y, 20); paint(null, 4, '#ff5f6a'); for (let i = 0; i < 6; i++) { const a = i * TAU / 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 20, y + Math.sin(a) * 20); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 2; ctx.stroke(); } } },
];
MAPS.tunnel = () => {
  const b = new MB(40, 10, '#');
  b.rect(1, 3, 38, 5, 't');
  b.rect(1, 7, 38, 1, 'r');
  for (const d of TUNNEL_DOORS) {
    const spawn = { museum: { x: 12, y: 11 }, rink: { x: 12, y: 12 }, bagels: { x: 11, y: 9 }, station: { x: 13, y: 11 }, aquarium: { x: 12, y: 11 }, coney: { x: 15, y: 2 } }[d.to];
    b.ent('door', d.x, 2, { to: d.to, at: spawn, style: 'tunnel', label: d.label, icon: d.icon, locked: () => S.step < stepIndex(d.step), lockedLine: `The ${d.label} door is locked. Not yet!` });
    b.ent('deco', d.x + 3, 2, { solid: false, z: 60, art: (x, y, t) => artLantern(x, y + 8, t) });
  }
  b.ent('door', 0, 5, { to: 'school', at: { x: 42, y: 22 }, style: 'arch', dir: 'left', label: 'School' });
  b.ent('station', 2, 3, station('mirror2', { art: artMirror, noCheck: true, use: sc => sc.open(new ClosetOverlay()) }));
  b.ent('sign', 4, 3, { text: 'Secret Tunnel. Built long, long ago!', glyph: 'Aa' });
  return b.build({
    spawn: { x: 2, y: 5 }, pal: 'tunnel', music: 'tunnel', bg: '#1a1220', title: 'Secret Tunnel', wall: '#a0604a', wallTop: '#3a2a26', brick: true,
    enter(sc) {
      if (!S.done.tunnelSeen) { S.done.tunnelSeen = true; Talk.say('Whoa! A secret tunnel under the school! Each round door goes to a different place in New York. The doors open one at a time.'); }
    },
  });
};

/* ---------- Destinations ---------- */
function backDoor(b, x, y, tunnelX) { b.ent('door', x, y, { to: 'tunnel', at: { x: tunnelX, y: 3 }, style: 'arch', dir: 'down', label: 'Tunnel' }); }

MAPS.museum = () => {
  const b = new MB(24, 14, '#');
  b.rect(1, 2, 22, 11, 'm');
  b.set(2, 2, 'K').set(4, 2, 'K').set(21, 2, 'K').set(1, 12, 'P').set(22, 12, 'P');
  b.ent('deco', 8, 5, { bw: T * 4, bh: 30, art: artDino, z: 10 });
  b.ent('deco', 20, 9, { bw: 50, bh: 24, art: artSphinxCat });
  b.ent('station', 17, 4, station('gems', {
    art: artGemCase, step: 'gems', practice: gemCounting, who: { face: personFace(NPC_LOOKS.stone) },
    quest: questChallenge('gems', o => gemCounting(Object.assign({ intro: 'Our gems are in little groups. Count them by groups, and I will show you what our camera saw!' }, o)), 'camera'),
  }));
  b.ent('npc', 12, 8, npc('stone', {
    step: 'stone', lines: ['Psst... this dinosaur is seventy million years old! Isn\'t that AMAZING?', 'Fossils are clues from long ago.', 'The cat statue is my favorite.'], order: 'stone', practice: o => labelFixer(Object.assign({ theme: 'museum' }, o)),
    quest: questChallenge('stone', o => labelFixer(Object.assign({ theme: 'museum', intro: "Welcome to the Museum of Big Things! Oh no, the labels fell off! Can you fix them?" }, o))),
  }));
  b.ent('npc', 4, 10, npc('visitor1', { lookId: 'adult2', lines: ['What a big dinosaur!', 'I heard a flapping sound this morning.', 'The gem hall sparkles!'] }));
  b.ent('pet', 2, 11, { pet: 'turtle' });
  backDoor(b, 12, 13, 6);
  addHebrewBead('museum', b);
  return b.build({ spawn: { x: 12, y: 11 }, pal: 'museum', music: 'museum', bg: '#2a2040', title: 'Museum of Big Things', wall: '#d8cce8', wallTop: '#6a5a8a' });
};

MAPS.rink = () => {
  const b = new MB(24, 14, '#');
  b.rect(1, 2, 22, 11, '.');
  b.rect(3, 3, 18, 1, 'Y').rect(3, 10, 18, 1, 'Y').rect(3, 3, 1, 8, 'Y').rect(20, 3, 1, 8, 'Y');
  b.rect(4, 4, 16, 6, 'i');
  b.set(11, 10, 'i').set(12, 10, 'i');
  b.rect(1, 12, 3, 1, 'C').set(22, 12, 'P');
  b.ent('npc', 11, 6, npc('lena', {
    step: 'lena', lines: ['Glide and smile!', 'Bend your knees, arms out like a bird!', 'I can spin ten times in a row!'], order: 'lena', practice: iceWriting,
    quest: questChallenge('lena', o => iceWriting(Object.assign({ intro: 'Glide and smile! I write words on the ice with my skates. You type the letters, and I will skate them!' }, o))),
  }));
  b.ent('station', 16, 5, station('zamboni', {
    art: artZamboni, step: 'zamboni', practice: o => countdownLaunch(Object.assign({ title: 'Ice Machine' }, o)), who: { face: personFace(NPC_LOOKS.lena) },
    quest: questChallenge('zamboni', o => countdownLaunch(Object.assign({ title: 'Ice Machine', intro: 'The ice machine needs a countdown to start! Then I will tell you what I saw.' }, o)), 'skate'),
  }));
  b.ent('npc', 2, 11, npc('cocoa', { lookId: 'adult1', lines: ['Hot cocoa! Nice and warm!', 'A gray bird flew right over my cocoa stand!', 'Brr! Skating makes you hungry.'] }));
  b.ent('pet', 6, 8, { pet: 'penguin' });
  backDoor(b, 12, 13, 12);
  addHebrewBead('rink', b);
  return b.build({ spawn: { x: 12, y: 12 }, pal: 'rink', music: 'rink', bg: '#1a2a3a', title: 'Ice Rink', fenceGround: 'i', wall: '#bfe0f4', wallTop: '#3a6a9a' });
};

MAPS.bagels = () => {
  const b = new MB(22, 12, '#');
  b.rect(1, 2, 20, 9, '.');
  b.rect(3, 4, 12, 1, 'C');
  b.set(1, 2, 'S').set(2, 2, 'S').set(20, 10, 'P');
  b.ent('deco', 6, 2, { bw: T * 2, bh: 20, art: (x, y, t) => artOven(x, y + 4, t) });
  b.ent('deco', 10, 2, { bw: T * 2, bh: 20, art: (x, y, t) => artOven(x, y + 4, t) });
  b.ent('npc', 8, 6, npc('shapiro', {
    step: 'shapiro', lines: ['Bagels! Fresh and hot! Sesame, poppy, everything!', 'A dozen is twelve, but I like to count by tens.', 'Mazel! There you are! Have a little lox.'], order: 'shapiro', practice: bagelBundles,
    quest: questChallenge('shapiro', o => bagelBundles(Object.assign({ intro: "Welcome to Shapiro's Bagels! Big orders today! Help me fill them with bags of ten." }, o))),
  }));
  b.ent('station', 16, 4, station('register', {
    art: artRegister, step: 'register', practice: coinShop, who: { face: personFace(NPC_LOOKS.shapiro) },
    quest: questChallenge('register', o => coinShop(Object.assign({ intro: "Time to pay for your snack! Then I'll tell you about the strange crumbs I found." }, o)), 'crumbs'),
  }));
  b.ent('station', 19, 3, station('mirror3', { art: artMirror, noCheck: true, use: sc => sc.open(new ClosetOverlay()) }));
  b.ent('sign', 17, 7, { text: 'Stoop Style: hats and outfits! Use the mirror.', glyph: 'hat' });
  b.ent('pet', 2, 9, { pet: 'bunny' });
  backDoor(b, 11, 11, 18);
  addHebrewBead('bagels', b);
  return b.build({ spawn: { x: 11, y: 9 }, pal: 'shop', music: 'shop', bg: '#3a2a20', title: "Shapiro's Bagels", wall: '#ffd0b8', wallTop: '#a0523f' });
};

MAPS.station = () => {
  const b = new MB(26, 14, '#');
  b.rect(1, 2, 24, 11, 'm');
  b.rect(2, 2, 3, 1, 'O').rect(21, 2, 3, 1, 'O');
  b.ent('deco', 13, 1, { solid: false, art: (x, y, t) => artClock(x, y - 2, t), z: 300 });
  b.ent('station', 12, 2, station('departures', {
    art: artDepartures, noCheck: true, use: sc => { if (pastStep('joy')) sc.open(departureBoard({ count: 3, coins: 3, who: { face: personFace(NPC_LOOKS.joy) } })); else Talk.say('The departure board is broken! Talk to Conductor Joy.'); },
  }));
  for (const [x, y] of [[5, 8], [9, 8], [17, 8], [21, 8]]) b.ent('deco', x, y, { bw: 60, bh: 14, art: artBench });
  b.ent('npc', 8, 5, npc('joy', {
    step: 'joy', lines: ['All aboard!', 'The Q train goes all the way to Coney Island.', 'Tickets, please!'], order: 'joy', practice: departureBoard,
    quest: questChallenge('joy', o => departureBoard(Object.assign({ intro: "All aboard! Oh no, my departure board is broken. Can you type where the trains go?" }, o))),
  }));
  b.ent('npc', 17, 6, npc('theoS', {
    lookId: 'theo', step: 'theoS', lines: ['I told you I love trains!', 'Grand Station has a starry ceiling. Look up!', 'Ten, twenty, thirty tickets!'], practice: ticketCounter,
    quest: questChallenge('theoS', o => ticketCounter(Object.assign({ intro: "Sadelle! I'm on a field trip! I saw a gray bird hop on a train. Help me count these tickets by tens and I'll show you which train!" }, o)), 'ticket'),
  }));
  b.ent('npc', 3, 11, npc('rider', { lookId: 'adult1', lines: ['I take the train every day.', 'Did you see the bird? It had something shiny!', 'Mind the gap!'] }));
  b.ent('pet', 23, 4, { pet: 'owl' });
  backDoor(b, 13, 13, 24);
  addHebrewBead('station', b);
  return b.build({ spawn: { x: 13, y: 11 }, pal: 'station', music: 'station', bg: '#14304a', title: 'Grand Station', wall: '#d6b37a', wallTop: '#1e4a5a' });
};

MAPS.aquarium = () => {
  const b = new MB(24, 14, '#');
  b.rect(1, 2, 22, 11, '.');
  b.rect(4, 2, 16, 3, '~');
  b.rect(16, 9, 5, 3, '~');
  b.ent('deco', 12, 3, { solid: false, art: (x, y, t) => {}, z: -100 });
  b.ent('station', 12, 5, station('tank', {
    art: artTank, step: 'tank', practice: fishFacts, who: { face: personFace(NPC_LOOKS.marisol) },
    quest: questChallenge('tank', o => fishFacts(Object.assign({ intro: "Feeding time! Each fish has a number. Feed the fish with the right answer! Then I'll tell you what the seagull said." }, o)), 'shell'),
  }));
  for (const [x, y] of [[2, 6], [2, 9], [22, 6]]) b.ent('deco', x, y, { solid: false, art: artJelly });
  b.ent('npc', 6, 8, npc('marisol', {
    step: 'marisol', lines: ['The sea lions love when I sing!', 'That fish is named Gus, like your custodian!', 'Jellyfish have no brains, but they are still beautiful.'], order: 'marisol', practice: o => readFind(Object.assign({ theme: 'aquarium' }, o)),
    quest: questChallenge('marisol', o => readFind(Object.assign({ theme: 'aquarium', intro: "Ahoy! I'm Captain Marisol. Read my tank signs and find the animals!" }, o))),
  }));
  b.ent('pet', 15, 10, { pet: 'seal' });
  backDoor(b, 12, 13, 30);
  addHebrewBead('aquarium', b);
  return b.build({ spawn: { x: 12, y: 11 }, pal: 'aquarium', music: 'aquarium', bg: '#0a1a3a', title: 'Brooklyn Aquarium', wall: '#4a8ab8', wallTop: '#1a3a6a' });
};

MAPS.coney = () => {
  const b = new MB(30, 16, 's');
  b.rect(0, 6, 30, 3, 'b');
  b.rect(0, 13, 30, 3, '~');
  b.rect(0, 0, 30, 1, 'Y').rect(0, 0, 1, 13, 'Y').rect(29, 0, 1, 13, 'Y');
  b.ent('door', 15, 0, { to: 'tunnel', at: { x: 36, y: 3 }, style: 'arch', dir: 'up', label: 'Tunnel' });
  b.ent('station', 24, 8, station('wheel', {
    art: (x, y, t) => artWheel(x, y + 20, t), bw: T * 2, bh: 40, noCheck: true, z: -10,
    quest: (sc) => sc.open(new WheelRide('up', () => sc.open(new BeadPuzzle({
      title: 'Nest Necklace for Coo', mode: 'nest', kind: 'necklace', who: null,
      onDone: () => sc.open(new WheelRide('hatch', () => giveClue(sc, 'chain', () => advance('wheel', sc)))),
    })))),
    use(sc) { const g = currentGoal(); if (g.ent === 'wheel') this.quest(sc); else if (pastStep('wheel')) Talk.say('Coo and her babies wave hello! Coo, coo!'); else Talk.say('The Big Wheel! Follow the yellow arrow first.'); },
  }));
  b.ent('station', 7, 4, station('carousel', {
    art: artCarousel, step: 'carousel', practice: syllableSnap,
    quest: questChallenge('carousel', o => syllableSnap(Object.assign({ intro: 'Hop on the carousel! Each horse holds part of a word.' }, o))),
  }));
  b.ent('station', 14, 4, station('booth', {
    art: artBooth, step: 'booth', practice: ticketCounter,
    quest: questChallenge('booth', o => ticketCounter(Object.assign({ title: 'Ticket Booth', intro: 'Ride tickets come in bundles of ten. Count them!' }, o))),
  }));
  b.ent('deco', 19, 10, { bw: 70, bh: 30, art: artHotdog });
  for (const [x, y, c] of [[7, 11, '#ff5fa2'], [13, 12, '#4aa3ff'], [26, 11, '#ffd23f']]) b.ent('deco', x, y, { bw: 10, bh: 10, art: (px, py) => { rr(px - 2, py - 40, 4, 50, 2); paint('#fffaf0', 1.5); ctx.beginPath(); ctx.moveTo(px - 34, py - 34); ctx.quadraticCurveTo(px, py - 70, px + 34, py - 34); ctx.closePath(); paint(c, 3); rr(px - 26, py + 4, 52, 12, 4); paint('#fffaf0', 2); } });
  b.ent('npc', 11, 10, npc('vendor', { lookId: 'adult2', lines: ['Hot dogs! Popcorn! Cotton candy!', 'A pigeon keeps flying up to the top of the Big Wheel.', 'Coney Island is the best place in summer!'] }));
  b.ent('pet', 3, 11, { pet: 'puppy' });
  addHebrewBead('coney', b);
  return b.build({ spawn: { x: 15, y: 2 }, pal: 'coney', music: 'coney', bg: '#8ad0f0', title: 'Coney Island', fenceGround: 's' });
};

/* Hebrew bonus: one hidden alef-bet bead in each place. */
const HEB_BEADS = [
  ['school', 'א', 'alef', 'Alef is quiet. It lets the vowel talk.', 42, 2],
  ['museum', 'ב', 'bet', 'Bet says buh.', 21, 11],
  ['rink', 'ג', 'gimel', 'Gimel says guh.', 21, 12],
  ['bagels', 'ד', 'dalet', 'Dalet says duh.', 19, 9],
  ['station', 'ה', 'hey', 'Hey says huh.', 2, 6],
  ['aquarium', 'ו', 'vav', 'Vav says vuh.', 21, 3],
  ['coney', 'ז', 'zayin', 'Zayin says zuh.', 28, 11],
];
function addHebrewBead(map, b) {
  const h = HEB_BEADS.find(x => x[0] === map);
  if (!h) return;
  const [, ch, name, sound, x, y] = h;
  b.ent('deco', x, y, {
    id: 'heb-' + name, solid: false, when: () => !(S.hebrew || []).includes(name),
    art: (px, py, t) => { drawBead('blue', px, py + Math.sin(t * 3) * 3, 14); text(ch, px, py + 1 + Math.sin(t * 3) * 3, { size: 16, font: 'Noto Sans Hebrew', color: '#fff', lw: 3 }); if (Math.random() < 0.03) FX.sparkle(px, py, 2, ['#bfe6ff', '#fff']); },
    touch(sc) {
      S.hebrew = S.hebrew || [];
      if (S.hebrew.includes(name)) return;
      S.hebrew.push(name); this.hidden = true; S.coins += 2;
      Sfx.sparkle(); FX.sparkle(this.cx(), this.cy(), 16, ['#bfe6ff', '#fff', '#ffd23f']);
      Talk.say(`A Hebrew letter bead! This is ${name}. ${sound} You have ${S.hebrew.length} of 7.`, { show: `${ch}  ${name}  (${S.hebrew.length}/7)` });
      saveState();
    },
  });
}

/* Pet names for this game, one per place. */
Object.assign(PET_INFO, {
  hamster: { name: 'Pickle the class hamster', short: 'Pickle' },
  turtle: { name: 'Pebble the baby turtle', short: 'Pebble' },
  penguin: { name: 'Flurry the penguin', short: 'Flurry' },
  bunny: { name: 'Sesame the bunny', short: 'Sesame' },
  owl: { name: 'Hoot the owl', short: 'Hoot' },
  seal: { name: 'Bubbles the seal pup', short: 'Bubbles' },
  puppy: { name: 'Sandy the puppy', short: 'Sandy' },
});
delete PET_INFO.pigeon;
