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
