'use strict';

/* Lantern Isle itself: the overworld, town interiors, generated dungeons, the shop, the map, the puzzle board and the ending. */

const quest = (step, name, opts, clue, after) => (sc, who) => {
  sc.open(playPuz(name, Object.assign({
    count: 3, coins: 6, who: who && who.whoObj ? who.whoObj() : null, theme: opts && opts.theme,
    onDone: () => { const go = () => { advance(step, sc); if (after) after(sc); maybeBreak(sc); }; if (clue) giveClue(sc, clue, go); else go(); },
  }, opts)));
};
const practice = (name, extra) => o => playPuz(name, Object.assign({}, extra, o));

/* ---------- Art ---------- */
function drawHouse(x, y, w, h, wall, roof, label) {
  const X = x * T, Y = y * T, W = w * T, H = h * T;
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(X + 4, Y + H - 6, W, 12);
  rr(X, Y + 30, W, H - 30, 6); paint(wall, 3);
  ctx.beginPath(); ctx.moveTo(X - 14, Y + 40); ctx.lineTo(X + W / 2, Y - 34); ctx.lineTo(X + W + 14, Y + 40); ctx.closePath(); paint(roof, 3);
  for (const wx of [X + 18, X + W - 58]) { rr(wx, Y + 58, 40, 34, 4); paint('#ffe9a8', 2.5); }
  const lw = textW(label, 18, 'Andika') + 22; rr(X + W / 2 - lw / 2, Y + 8, lw, 30, 8); paint('#fffaf0', 2.5);
  text(label, X + W / 2, Y + 23, { size: 18, font: 'Andika', color: OUT, stroke: null });
}
function artLamp(i) {
  return (x, y, t) => {
    const lit = (S.lamps || 0) > i || pastStep('home');
    rr(x - 3, y - 40, 6, 62, 2); paint('#4a4a5a', 2);
    if (lit) { ctx.globalAlpha = 0.35 + Math.sin(t * 3 + i) * 0.08; circle(x, y - 50, 36); paint('#ffe680', 0); ctx.globalAlpha = 1; }
    rr(x - 11, y - 62, 22, 24, 6); paint(lit ? '#ffd23f' : '#6a6a7a', 3);
  };
}
function artAcorns(x, y) { rr(x - 26, y - 4, 52, 28, 8); paint('#a8743e', 3); for (let k = 0; k < 5; k++) { ellipse(x - 18 + k * 9, y - 8, 4, 5); paint('#b8843e', 1.5); } }
function artPool(x, y, t) { ellipse(x, y + 6, 36, 18); paint('#4a90d8', 3); ellipse(x - 8 + Math.sin(t) * 8, y + 4, 8, 4); paint('#ff8a5a', 1.5); }
function artLily(x, y, t) { ellipse(x, y + 6, 34, 18); paint('#4a90d8', 3); for (const k of [-14, 12]) { ellipse(x + k, y + 4 + Math.sin(t + k) * 1.5, 11, 7); paint('#5fa84a', 2); } }
function artSled(x, y) { rr(x - 28, y, 56, 12, 4); paint('#e8442f', 3); rr(x - 26, y + 16, 54, 4, 2); paint('#c0c8d8', 1.5); text('tickets', x, y - 14, { size: 13, color: '#fff', lw: 3 }); }
function artOldDoor(x, y) { rr(x - 28, y - 34, 56, 60, 8); paint('#b89a60', 3); text('? 9', x, y - 4, { size: 22, color: OUT, stroke: null }); }
function artBell(x, y, t) { rr(x - 28, y - 52, 56, 8, 3); paint('#8a5a32', 2.5); for (const k of [-24, 24]) { rr(x + k - 3, y - 48, 6, 72, 2); paint('#8a5a32', 2.5); } const r = Math.sin(t * 2) * 0.08; ctx.save(); ctx.translate(x, y - 40); ctx.rotate(r); ctx.beginPath(); ctx.moveTo(-18, 30); ctx.quadraticCurveTo(-14, 0, 0, 0); ctx.quadraticCurveTo(14, 0, 18, 30); ctx.closePath(); paint('#ffd23f', 3); ctx.restore(); }
function artClueBoard(x, y) { rr(x - 44, y - 40, 88, 62, 6); paint('#a8682e', 3); rr(x - 38, y - 34, 76, 50, 3); paint('#f0dca8', 0); text('CLUES', x, y - 8, { size: 18, color: '#a0523f', stroke: null }); }
function artPuzzleBoard(x, y, t) { rr(x - 44, y - 40, 88, 62, 6); paint('#6a5ac8', 3); for (let i = 0; i < 6; i++) { rr(x - 34 + (i % 3) * 24, y - 32 + Math.floor(i / 3) * 24, 20, 20, 4); paint(['#ff6fae', '#4aa3ff', '#ffd23f', '#5fd068', '#b07cff', '#ff9a3d'][i], 1.5); } text('Puzzles', x, y + 34, { size: 13, color: '#fff', lw: 3 }); }
function artFountain(x, y, t) { ellipse(x, y + 14, 44, 20); paint('#c0c8d8', 3); ellipse(x, y + 12, 34, 13); paint('#8ad0f0', 0); rr(x - 6, y - 26, 12, 40, 3); paint('#c0c8d8', 2.5); for (let k = 0; k < 4; k++) { const a = t * 3 + k; circle(x + Math.cos(a) * 18, y - 18 + Math.abs(Math.sin(a)) * 20, 3); paint('#bfe6ff', 0); } }
function artTowerOutside(x, y, t) { const lit = pastStep('home'); ctx.beginPath(); ctx.moveTo(x - 44, y + 20); ctx.lineTo(x - 30, y - 150); ctx.lineTo(x + 30, y - 150); ctx.lineTo(x + 44, y + 20); ctx.closePath(); paint('#f6f2f8', 3); for (let k = 0; k < 3; k++) { rr(x - 38 + k * 4, y - 40 - k * 50, 76 - k * 8, 24, 2); paint('#e8442f', 0); } rr(x - 30, y - 184, 60, 36, 6); paint(lit ? '#ffd23f' : '#3a3a5a', 3); ctx.beginPath(); ctx.moveTo(x - 38, y - 182); ctx.lineTo(x, y - 214); ctx.lineTo(x + 38, y - 182); ctx.closePath(); paint('#e8442f', 3); }
function artCave(color) { return (x, y) => { ellipse(x, y - 8, 56, 50); paint(color, 4); ellipse(x, y + 2, 36, 36); paint('#1a1220', 3); }; }
function artGuardian(color) { return (x, y, t) => { const b = Math.sin(t * 3) * 3; ellipse(x, y + b, 36, 30); paint(color, 3.5); for (const k of [-12, 12]) { circle(x + k, y - 6 + b, 8); paint('#fff', 2); circle(x + k + 1, y - 5 + b, 4); paint(OUT, 0); } ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.beginPath(); ctx.arc(x, y + 6 + b, 9, 0.3, Math.PI - 0.3); ctx.stroke(); }; }
function artPedestal(name) {
  return (x, y, t, e) => {
    const K = PUZ[name].kind, col = K === 'read' ? '#ff8ac4' : K === 'math' ? '#ffb02e' : '#8ec5ff';
    rr(x - 24, y + 2, 48, 22, 5); paint('#b8a890', 3); rr(x - 26, y - 34 + Math.sin(t * 3) * 2, 52, 38, 10); paint(col, 3);
    text(K === 'read' ? 'Aa' : K === 'math' ? '10' : '?', x, y - 15 + Math.sin(t * 3) * 2, { size: 22, font: 'Andika', color: OUT, stroke: null });
    const w = textW(PUZ[name].name, 13) + 12; rr(x - w / 2, y + 26, w, 20, 5); paint('#fffaf0', 1.5); text(PUZ[name].name, x, y + 36, { size: 13, color: OUT, stroke: null });
  };
}

/* ---------- Hebrew letter beads ---------- */
const HEB_BEADS = [
  ['isle', 'א', 'alef', 'Alef is quiet. It lets the vowel talk.', 56, 40],
  ['isle', 'ב', 'bet', 'Bet says buh.', 54, 6],
  ['isle', 'ג', 'gimel', 'Gimel says guh.', 86, 40],
  ['isle', 'ד', 'dalet', 'Dalet says duh.', 36, 60],
  ['isle', 'ה', 'hey', 'Hey says huh.', 6, 40],
  ['isle', 'ו', 'vav', 'Vav says vuh.', 6, 6],
  ['isle', 'ז', 'zayin', 'Zayin says zuh.', 86, 6],
];
function addHebrewBeads(b) {
  for (const [, ch, name, sound, x, y] of HEB_BEADS) b.ent('deco', x, y, {
    id: 'heb-' + name, solid: false, when: () => !(S.hebrew || []).includes(name),
    art: (px, py, t) => { drawBead('blue', px, py + Math.sin(t * 3) * 3, 14); text(ch, px, py + 1 + Math.sin(t * 3) * 3, { size: 16, font: 'Noto Sans Hebrew', color: '#fff', lw: 3 }); },
    touch() {
      S.hebrew = S.hebrew || [];
      if (S.hebrew.includes(name)) return;
      S.hebrew.push(name); this.hidden = true; S.coins += 2;
      Sfx.sparkle(); FX.sparkle(this.cx(), this.cy(), 16, ['#bfe6ff', '#fff', '#ffd23f']);
      Talk.say(`A Hebrew letter bead! This is ${name}. ${sound} You have ${S.hebrew.length} of 7.`, { show: `${ch}  ${name}  (${S.hebrew.length}/7)` });
      if (S.hebrew.length === 7) {
        S.coins += 30;
        S.jewelry.push({ kind: 'necklace', name: 'Alef-Bet necklace', beads: ['blue', 'yellow', 'blue', 'yellow', 'blue', 'yellow', 'blue'].map(c => ({ c, shape: 'star' })) });
        S.wearJewel = S.jewelry.length - 1;
        Game.scene.later(5, () => { Sfx.fanfare(); Talk.say('You found all seven letters! Here is a special Alef-Bet necklace, and 30 coins!'); });
      }
      saveState();
    },
  });
}
const HEB_LIST = HEB_BEADS;

/* ---------- The island ---------- */
MAPS.isle = () => {
  const b = new MB(92, 66, '~');
  b.rect(34, 26, 25, 17, '.');        // Harbor Town
  b.rect(34, 4, 25, 19, ',');         // Whisper Woods
  b.rect(64, 26, 25, 17, 's');        // Coral Beach
  b.rect(34, 46, 25, 17, 'q');        // Marble Marsh
  b.rect(4, 26, 25, 17, 'n');         // Frost Hill
  b.rect(4, 4, 25, 19, 'u');          // Sunstone Ruins
  b.rect(64, 4, 25, 19, ',');         // Lighthouse Point
  // roads
  const road = (x, y, w, h, c = 'p') => b.rect(x, y, w, h, c);
  road(46, 23, 1, 4); road(59, 34, 5, 1); road(46, 43, 1, 3, 'b'); road(29, 34, 5, 1); road(16, 23, 1, 3); road(76, 23, 1, 3);
  road(46, 8, 1, 15); road(46, 27, 1, 15); road(35, 34, 24, 1); road(64, 34, 20, 1); road(46, 46, 1, 13); road(10, 34, 24, 1); road(16, 8, 1, 26); road(76, 10, 1, 24);

  // pet-only ways onward
  const gate = (r, x, y, kind) => b.ent('obstacle', x, y, { id: `gate-${r}`, kind, cleared: sc => advance(`${r}G`, sc) });
  gate('beach', 61, 34, 'dirt'); gate('marsh', 46, 44, 'water'); gate('frost', 31, 34, 'burrow'); gate('ruins', 16, 24, 'ice'); gate('tower', 76, 24, 'dark');

  /* ---- town ---- */
  const house = (x, y, w, h, wall, roof, label, to, spawn) => {
    b.rect(x, y, w, h, 'H');
    b.ent('deco', x, y, { solid: false, z: h * T, art: () => drawHouse(x, y, w, h, wall, roof, label) });
    const dx = x + Math.floor(w / 2);
    b.ent('door', dx, y + h - 1, { to, at: spawn, color: '#7a3a2a' });
    return { x: dx, y: y + h };
  };
  house(36, 27, 4, 3, '#ffd0b8', '#c8643a', 'Bakery', 'bakery', { x: 6, y: 6 });
  house(41, 27, 4, 3, '#e4d0ff', '#8a5ac8', 'Jewelry', 'studio', { x: 7, y: 7 });
  house(48, 27, 5, 3, '#ffe9a8', '#e8842a', 'Market', 'market', { x: 8, y: 8 });
  house(54, 27, 4, 3, '#c8f0d0', '#4a9a6a', 'Pet Home', 'pethome', { x: 7, y: 7 });
  [[37, 33], [44, 33], [51, 33], [57, 33], [37, 39], [44, 39], [51, 39], [57, 39]].forEach(([x, y], i) => b.ent('deco', x, y, { bw: 14, bh: 14, art: artLamp(i) }));
  b.ent('deco', 46, 36, { solid: false, z: -80, art: () => {} });
  b.ent('deco', 41, 36, { bw: 84, bh: 36, art: artFountain });
  b.ent('npc', 44, 31, npc('bea', {
    step: 'home', order: 'bea', lines: ['This island has so many secrets.', 'I am so glad you are here, dear.', 'Every light matters.'],
    talk: (sc, me) => {
      const g = currentGoal();
      if (g.id === 'bea') {
        if (me.starting) return; me.starting = true;
        me.say('Oh Sadelle, thank goodness! Every shiny, glowing thing on Lantern Isle is gone. Even the big light on my lighthouse! Will you be our detective?', 'Will you be our detective?')
          .then(() => { me.starting = false; giveClue(sc, 'dark', () => { advance('bea', sc); Talk.say('Your notebook keeps your clues. Press N to look at it any time!'); }); });
        return;
      }
      if (g.id === 'home') { giveClue(sc, 'lens', () => { advance('home', sc); sc.map.dark = null; sc.open(new PartyOverlay()); }); return; }
      friendTalk(sc, me);
    },
  }));
  b.ent('station', 46, 40, station('bell', { art: artBell, step: 'bell', practice: practice('bells'), who: { face: personFace(NPC_LOOKS.bea) },
    quest: quest('bell', 'bells', { intro: 'This bell calls the whole town. Ring it just like I do!' }) }));
  b.ent('station', 50, 36, station('cluebd', { art: artClueBoard, step: 'cluebd', practice: practice('lineup'),
    quest: quest('cluebd', 'lineup', { intro: 'Someone left clues on the board! Practice being a detective.', count: 2 }, 'list') }));
  b.ent('station', 54, 36, station('puzzles', { art: artPuzzleBoard, noCheck: true, use: sc => { if (S.step < stepIndex('cluebd')) Talk.say('The puzzle board! Follow the yellow arrow first.'); else sc.open(new PuzzleBoard()); } }));
  b.ent('npc', 40, 41, npc('quill', { step: 'bell', order: 'quill', lines: ['Fascinating! Simply fascinating!', 'I read all night. Who took my reading lamp?', 'Every clue is a tiny story.'] }));
  b.ent('npc', 55, 41, npc('kidA', { lookId: 'kid1', lines: ['I love your outfit!', 'My night-light is gone. I am a little scared.', 'Did you try the puzzle board?'] }));
  b.ent('npc', 35, 40, npc('kidB', { lookId: 'kid2', lines: ['Have you found all the hidden pets?', 'The lamps get brighter if you buy lamp oil at the Market!'] }));
  b.ent('pet', 36, 41, { pet: 'hamster' });
  b.ent('sign', 47, 25, { text: 'North: Whisper Woods.', glyph: 'N' });
  b.ent('sign', 60, 33, { text: 'East: Coral Beach.', glyph: 'E' });
  b.ent('sign', 47, 42, { text: 'South: Marble Marsh.', glyph: 'S' });
  b.ent('sign', 33, 33, { text: 'West: Frost Hill.', glyph: 'W' });

  /* ---- Whisper Woods ---- */
  b.ent('npc', 44, 19, npc('fern', {
    step: 'woodsN', order: 'fern', lines: ['Shhh. Listen to the leaves.', 'The woods are full of clues.', 'Be kind to every bug!'], practice: practice('reading', { theme: 'woods' }),
    quest: quest('woodsN', 'reading', { theme: 'woods', intro: 'Hello, detective! The trail signs fell down. Read each one with me.' }, 'footprint'),
  }));
  b.ent('station', 50, 18, station('stump', { art: artAcorns, step: 'woodsS', practice: practice('gems'), quest: quest('woodsS', 'gems', { title: 'Acorn Counting', intro: 'The squirrels sort acorns in groups. Count them by groups!' }) }));
  b.ent('pet', 54, 8, { pet: 'fox' });
  b.ent('npc', 38, 12, npc('kidC', { lookId: 'kid3', lines: ['I saw a glow in the big oak tree!', 'Owls hoot all night here.'] }));

  /* ---- Coral Beach ---- */
  b.ent('npc', 70, 32, npc('marina', {
    step: 'beachN', order: 'marina', lines: ['The tide is my clock.', 'Seals are so good at swimming!', 'I heard something sad last night.'], practice: practice('labels', { theme: 'beach' }),
    quest: quest('beachN', 'labels', { theme: 'beach', intro: 'The waves washed my signs away. Help me spell them again!' }, 'sniffle'),
  }));
  b.ent('station', 76, 38, station('pool', { art: artPool, step: 'beachS', practice: practice('fish'), quest: quest('beachS', 'fish', {}) }));
  b.ent('pet', 86, 28, { pet: 'turtle' });

  /* ---- Marble Marsh ---- */
  b.ent('npc', 44, 50, npc('moss', {
    step: 'marshN', order: 'moss', lines: ['Ribbit! I mean, hello!', 'Mud is good for the toes.', 'The mushrooms glow at night. Well, they did.'], practice: practice('sounds', { theme: 'marsh' }),
    quest: quest('marshN', 'sounds', { intro: 'My frogs get mixed up! Help me sort these sounds.' }, 'trail'),
  }));
  b.ent('station', 50, 54, station('lily', { art: artLily, step: 'marshS', practice: practice('countdown'), quest: quest('marshS', 'countdown', { title: 'Lily Pad Countdown', intro: 'The frogs hop down in order. Count down with them!' }) }));
  b.ent('pet', 54, 60, { pet: 'frog' });

  /* ---- Frost Hill ---- */
  b.ent('npc', 18, 32, npc('yuki', {
    step: 'frostN', order: 'yuki', lines: ['Snow is my favorite color.', 'Wear something warm!', 'I love to skate.'], practice: practice('typing'),
    quest: quest('frostN', 'typing', { intro: 'Type a word and I will write it in the snow!' }, 'melt'),
  }));
  b.ent('station', 12, 30, station('sled', { art: artSled, step: 'frostS', practice: practice('tickets'), quest: quest('frostS', 'tickets', {}) }));
  b.ent('pet', 6, 28, { pet: 'lamb' });

  /* ---- Sunstone Ruins ---- */
  b.ent('npc', 14, 16, npc('ziva', {
    step: 'ruinsN', order: 'ziva', lines: ['These stones are thousands of years old.', 'History is a mystery too!', 'Careful, step by step.'], practice: practice('magic'),
    quest: quest('ruinsN', 'magic', { intro: 'The old words on these walls change with a magic e. Watch!' }, 'picture'),
  }));
  b.ent('station', 20, 14, station('olddoor', { art: artOldDoor, step: 'ruinsS', practice: practice('doorcode'), quest: quest('ruinsS', 'doorcode', {}) }));
  b.ent('pet', 26, 6, { pet: 'pigeon' });

  /* ---- Lighthouse Point ---- */
  b.ent('npc', 74, 16, npc('finn', {
    step: 'towerN', order: 'finn', lines: ['Ahoy there, detective!', 'I sailed here by the stars alone.', 'A boat needs a light to get home.'], practice: practice('harbor'),
    quest: quest('towerN', 'harbor', { intro: 'Ahoy! The harbor board went dark. Type the words to fix it!' }),
  }));
  b.ent('station', 80, 14, station('beacon', { art: artClueBoard, step: 'towerS', practice: practice('lineup'), quest: quest('towerS', 'lineup', { title: 'Last Suspects', intro: 'Read these clues to find the last witness!', count: 2 }) }));
  b.ent('deco', 76, 7, { bw: T, bh: T, z: -2, art: artTowerOutside });

  /* ---- dungeon entrances ---- */
  for (const r of REGION_ORDER) {
    const D = DUNGEONS[r], { x, y } = D.door;
    if (r !== 'tower') b.ent('deco', x, y - 1, { solid: false, z: -4, art: (px, py, t) => artCave(shade(D.color, -0.35))(px, py + T, t) });
    b.ent('door', x, y, { to: r, at: DUNGEON_SPAWN(r), style: 'arch', dir: 'up', label: D.name, locked: () => S.step < stepIndex(`${r}D`), lockedLine: 'Not yet! Follow the yellow arrow first.' });
  }
  // bonus puzzles anyone can stop and play: the extra mazes and brain-teasers, never required
  [['bonus1', 'maze', 40, 8, 'Hedge Maze', '#3a8a5a'], ['bonus2', 'beams', 78, 40, 'Sun Mirrors', '#ffb02e'], ['bonus3', 'maze', 38, 56, 'Reed Maze', '#5a9a7a'], ['bonus4', 'boulder', 22, 40, 'Snow Boulders', '#8ec5ff'], ['bonus5', 'square', 8, 12, 'Stone Square', '#c8a468'], ['bonus6', 'bells', 84, 12, 'Wind Bells', '#b07cff'], ['bonus7', 'petpath', 56, 20, 'Puppy Trail', '#ff9a3d'], ['bonus8', 'grid', 70, 40, 'Shell Puzzle', '#ff8ac4'], ['bonus9', 'matrix', 42, 16, 'Leaf Grid', '#8be06b'], ['bonus10', 'skip', 80, 30, 'Tide Counting', '#ffd23f']].forEach(([id, name, x, y, label, col]) =>
    b.ent('station', x, y, station(id, { noCheck: true, use: sc => sc.open(playPuz(name, { count: 3, coins: 5, title: label })),
      art: (px, py, t) => { rr(px - 24, py - 22 + Math.sin(t * 3) * 2, 48, 40, 10); paint(col, 3); text('?', px, py - 3 + Math.sin(t * 3) * 2, { size: 26, color: '#fff', lw: 4 }); const w = textW(label, 13) + 12; rr(px - w / 2, py + 24, w, 20, 5); paint('#fffaf0', 1.5); text(label, px, py + 34, { size: 13, color: OUT, stroke: null }); } })));
  addHebrewBeads(b);

  // trees and rocks, kept off roads and away from everything she needs to reach
  const keep = b.ents.map(e => [e.x, e.y]);
  for (let y = 0; y < 66; y++) for (let x = 0; x < 92; x++) {
    const c = b.g[y][x];
    if (!',qnu'.includes(c) || (x * 7 + y * 13) % 11 !== 0) continue;
    if (keep.some(([a, d]) => Math.abs(a - x) + Math.abs(d - y) <= 3)) continue;
    b.set(x, y, 'T');
  }
  const dusk = pastStep('home') ? null : `rgba(30,24,80,${Math.max(0.05, 0.24 - (S.lamps || 0) * 0.025)})`;
  return b.build({
    spawn: { x: 46, y: 37 }, pal: 'isle', music: 'isle', bg: '#2a6ab0', title: 'Lantern Isle', dark: dusk, treeColor: '#4a9a4a', fenceGround: '.',
    enter() {
      if (S.step === 0) Talk.say('Welcome to Lantern Isle! Oh no, it is so dim. Walk to Nana Bea. Use the arrow keys, and follow the yellow arrow!', { show: 'Use the arrow keys. Follow the yellow arrow!' });
    },
  });
};

/* ---------- Town interiors ---------- */
function interior(w, h, outAt, opts) {
  const b = new MB(w, h, '#');
  b.rect(1, 2, w - 2, h - 3, '.');
  b.ent('door', Math.floor(w / 2), h - 1, { to: 'isle', at: outAt, style: 'arch', dir: 'down', label: 'Outside' });
  return b;
}
MAPS.bakery = () => {
  const b = interior(13, 9, { x: 38, y: 31 });
  b.rect(2, 2, 9, 1, 'C');
  b.ent('deco', 10, 2, { solid: false, z: 2, art: artOven });
  b.ent('npc', 3, 4, npc('tova', {
    step: 'tray', order: 'tova', lines: ['Fresh bagels, fresh rugelach!', 'Counting is the secret to baking.', 'My glow jam was so pretty.'], practice: practice('bagels'),
    talk: (sc, me) => {
      if (currentGoal().id === 'tova') {
        if (me.starting) return; me.starting = true;
        me.say('My glow jam is gone! And look at these toasty crumbs. They are still warm! Come look at the tray.', 'Come look at the tray!').then(() => { me.starting = false; advance('tova', sc); });
        return;
      }
      friendTalk(sc, me);
    },
  }));
  b.ent('station', 7, 4, station('tray', { art: artBoard, step: 'tray', practice: practice('missing'),
    quest: quest('tray', 'missing', { title: 'The Bakery Tray', intro: 'Look closely at the tray. Something will disappear!' }, 'crumbs') }));
  b.ent('station', 10, 6, station('bake', { art: artRegister, noCheck: true, use: sc => sc.open(playPuz('coins', { count: 3, coins: 4, who: { face: personFace(NPC_LOOKS.tova) } })) }));
  return b.build({ spawn: { x: 6, y: 6 }, pal: 'shop', music: 'shop', bg: '#3a2a20', title: 'Bakery', wall: '#ffd0b8', wallTop: '#a0523f' });
};
MAPS.studio = () => {
  const b = interior(15, 10, { x: 43, y: 31 });
  b.rect(1, 2, 13, 1, 'S');
  b.ent('station', 7, 4, station('studio', { art: artBeadTable, noCheck: true, use: sc => { if (pastStep('opal')) sc.open(new StudioOverlay()); else Talk.say('The bead table! Talk to Madame Opal first.'); } }));
  b.ent('station', 2, 4, station('mirror1', { art: artMirror, noCheck: true, use: sc => sc.open(new ClosetOverlay()) }));
  b.ent('npc', 11, 5, npc('opal', {
    step: 'opal', lines: ['Patterns are everywhere, darling.', 'A bead for every mood!', 'You can wear the jewelry you make.'],
    talk: (sc, me) => {
      if (currentGoal().id === 'opal') {
        if (me.starting) return; me.starting = true;
        me.say('My moonstones! Gone! I found this tiny shiny scale instead. Let us make a bracelet, to calm my nerves.').then(() => {
          me.starting = false;
          if (sc.overlay) return;
          sc.open(new BeadPuzzle({ title: 'Pattern Bracelet', mode: 'pattern', unit: [{ c: 'pink' }, { c: 'blue' }], who: me.whoObj(),
            onDone: () => giveClue(sc, 'scale', () => { advance('opal', sc); Talk.say('Now you can make jewelry any time! Press J, or use the bead table.'); }) }));
        });
        return;
      }
      friendTalk(sc, me);
    },
  }));
  return b.build({ spawn: { x: 7, y: 7 }, pal: 'shop', music: 'shop', bg: '#2a2040', title: 'Madame Opal\'s Jewelry', wall: '#e4d0ff', wallTop: '#6a4a9a' });
};
MAPS.market = () => {
  const b = interior(17, 11, { x: 50, y: 31 });
  b.rect(1, 2, 15, 1, 'S');
  b.ent('npc', 8, 5, npc('bim', { lookId: 'bim', lines: ['Everything is for sale, except my hat!', 'Lamp oil makes the town brighter.', 'Coins, coins, coins!'], talk: (sc, me) => { me.say(shopNudge()); } }));
  b.ent('station', 3, 4, station('fruit', { art: artAcorns, step: 'fruit', practice: practice('scales'),
    quest: quest('fruit', 'scales', { intro: 'My scale is working, but I cannot read it. Which one is heavier?' }) }));
  b.ent('station', 12, 5, station('closet', { art: artMirror, noCheck: true, use: sc => sc.open(new ClosetOverlay()) }));
  b.ent('station', 15, 5, station('petshop', { art: artHeartBox, noCheck: true, use: sc => sc.open(new PetShop()) }));
  b.ent('station', 3, 7, station('lampshop', { art: (x, y, t) => artLamp(99)(x, y + 8, t), noCheck: true, use: buyLamp }));
  b.ent('deco', 12, 8, { solid: false, art: (x, y) => { text('Clothes', x, y - 110, { size: 15, color: '#fff', lw: 3 }); } });
  b.ent('deco', 15, 8, { solid: false, art: (x, y) => { text('Pet Shop', x, y - 106, { size: 15, color: '#fff', lw: 3 }); } });
  b.ent('deco', 3, 9, { solid: false, art: (x, y) => { text('Lamp Oil', x, y - 44, { size: 15, color: '#fff', lw: 3 }); } });
  return b.build({ spawn: { x: 8, y: 8 }, pal: 'shop', music: 'shop', bg: '#3a2a20', title: 'The Market', wall: '#ffe9a8', wallTop: '#a0702a' });
};
function artHeartBox(x, y) { rr(x - 22, y - 16, 44, 36, 8); paint('#ff8ac4', 3); drawHeart(x, y, 12, '#fff', 2); }
function shopNudge() {
  const all = [...Object.entries(OUTFITS).map(([k, v]) => ['outfit:' + k, v]), ...Object.entries(HATS).map(([k, v]) => ['hat:' + k, v])];
  const next = all.filter(([k]) => !S.owned.includes(k)).sort((a, b) => a[1].price - b[1].price)[0];
  if (!next) return 'You own everything! You are my best customer.';
  return S.coins >= next[1].price ? `You have ${S.coins} coins! You can buy ${next[1].name}. Walk to the mirror!` : `${next[1].name} costs ${next[1].price} coins. You need ${next[1].price - S.coins} more!`;
}
const LAMP_PRICE = 15;
function buyLamp(sc) {
  if ((S.lamps || 0) >= 8) { Talk.say('Every street lamp in town is shining. Thank you!'); return; }
  if (S.coins < LAMP_PRICE) { Talk.say(`Lamp oil costs ${LAMP_PRICE} coins. You have ${S.coins}. Solve puzzles to earn more!`); return; }
  S.coins -= LAMP_PRICE; S.lamps = (S.lamps || 0) + 1; saveState();
  Sfx.coin(); Sfx.sparkle();
  Talk.say(`You bought lamp oil! Street lamp number ${S.lamps} is shining in town. The whole town is a little brighter!`);
  if (S.lamps === 8 && !S.owned.includes('hat:tiara')) { S.owned.push('hat:tiara'); saveState(); sc.later(5, () => { Sfx.fanfare(); Talk.say('Every lamp is lit! The town thanks you with a star beret. Try it on at the mirror!'); }); }
}
MAPS.pethome = () => {
  const b = interior(15, 10, { x: 56, y: 31 });
  b.ent('deco', 7, 3, { solid: false, z: -60, art: (x, y, t) => {
    S.pets.forEach((p, i) => {
      const a = t * 0.4 + i * 1.3, px = x - 220 + (i % 6) * 88 + Math.sin(a) * 14, py = y + 44 + Math.floor(i / 6) * 96;
      drawPet(p, px, py, t + i, { scale: 1.05, walking: Math.sin(a * 3) > 0.3, face: Math.cos(a) > 0 ? 1 : -1 }); drawPetWear(p, px, py, 1.05, Math.cos(a) > 0 ? 1 : -1);
    });
    if (!S.pets.length) text('Your pets will live here!', x, y + 70, { size: 26, color: OUT, stroke: null });
  } });
  b.ent('station', 2, 3, station('petbook', { art: artHeartBox, noCheck: true, use: sc => { const nb = new NotebookOverlay(); nb.tab = 2; sc.open(nb); nb.read(); } }));
  return b.build({ spawn: { x: 7, y: 7 }, pal: 'shop', music: 'shop', bg: '#2a3a2a', title: 'Pet Home', wall: '#c8f0d0', wallTop: '#3a7a5a' });
};

/* ---------- Dungeons: built from a list of rooms. Three rooms per row, snaking down. ---------- */
const ROOM_W = 12, ROOM_H = 7;
function roomPos(i) { const row = Math.floor(i / 3), col = row % 2 ? 2 - (i % 3) : i % 3; return { row, col, x: 1 + col * (ROOM_W + 1), y: 2 + row * (ROOM_H + 3) }; }
function DUNGEON_SPAWN() { return { x: 2, y: 5 }; }
function buildDungeon(r) {
  const D = DUNGEONS[r], total = D.rooms.length + 1, rows = Math.ceil(total / 3);
  const b = new MB(3 * (ROOM_W + 1) + 1, 2 + rows * (ROOM_H + 3), '#');
  for (let i = 0; i < total; i++) { const p = roomPos(i); b.rect(p.x, p.y, ROOM_W, ROOM_H, '.'); }
  b.ent('door', 0, 5, { to: 'isle', at: { x: D.door.x, y: D.door.y + 1 }, style: 'arch', dir: 'left', label: 'Outside' });
  D.rooms.forEach((name, i) => {
    const p = roomPos(i), q = roomPos(i + 1), id = roomId(r, i), key = needsKey(name), gid = gateId(r, i);
    // the way to the next room, with a gate in it
    let gx, gy;
    if (q.row === p.row) { gx = q.col > p.col ? p.x + ROOM_W : q.x + ROOM_W; gy = p.y + 3; b.set(gx, gy, '.'); }
    else { gx = p.x + 6; gy = p.y + ROOM_H; for (let k = 0; k < 3; k++) b.set(gx, gy + k, '.'); }
    b.ent('gate', gx, gy, { id: gid, dungeon: r, needs: key ? 'key' : 'rune', onBump(sc) {
      if (!key) { Sfx.bonk(); Talk.say('Solve the puzzle in this room, and the rune door will open!'); return; }
      KeyGate.prototype.onBump.call(this, sc);
    } });
    b.ent('station', p.x + 6, p.y + 2, station(id, {
      art: artPedestal(name), noCheck: false,
      use: sc => {
        if (S.done[id]) { sc.open(playPuz(name, { count: 2, coins: 2, theme: D.theme })); return; }
        sc.open(playPuz(name, { count: 3, coins: 6, theme: D.theme, onDone: () => {
          S.done[id] = true;
          sc.ents.forEach(e => { if (e.hiddenUntil === id) e.hidden = false; });
          if (key) Talk.say('A treasure chest appeared!');
          else {
            S.done[gid] = true; const g = sc.ents.find(e => e.id === gid); if (g) g.hidden = true;
            Sfx.door(); Talk.say('The rune door opened! And a chest appeared!');
          }
          saveState(); maybeBreak(sc);
        } }));
      },
    }));
    // a chest: small key after reading and math; treasure after logic
    const cid = chestId(r, i);
    b.ent('chest', p.x + 9, p.y + 2, { id: cid, hiddenUntil: id, give: (sc) => {
      if (key) { S.keys[r] = (S.keys[r] || 0) + 1; saveState(); FX.pop(sc.p.x, sc.p.y - 70, 'Key!', '#ffd23f'); Talk.say('A little key! It opens the gate.'); }
      else {
        const k = D.outfit, first = !S.owned.includes(k) && i === D.rooms.findIndex(n => !needsKey(n));
        if (first) { S.owned.push(k); saveState(); const [kind, oid] = k.split(':'); Talk.say(`Wow! You found ${(kind === 'outfit' ? OUTFITS : HATS)[oid].name}! Try it on at any mirror.`); }
        else { S.coins += 8; saveState(); Talk.say('Eight shiny coins!'); }
      }
    } });
    for (const [ax, ay] of [[1, 0], [ROOM_W - 2, 0]]) b.ent('deco', p.x + ax, p.y + ay, { solid: false, art: (x, y, t) => artLantern(x, y + 10, t) });
    if (i === 0) b.ent('sign', p.x + 2, p.y + 5, { text: `${D.name}`, glyph: 'Aa' });
  });
  // secret nook: needs a friend found later
  if (D.secret) {
    const p = roomPos(1), nx = p.x + 10, ny = p.y + 4;
    b.set(nx + 1, ny, 'Y').set(nx - 1, ny + 1, 'Y').set(nx - 1, ny + 2, 'Y');
    b.ent('obstacle', nx, ny, { id: `${r}-secretgate`, kind: D.secret });
    b.ent('chest', nx + 1, ny + 2, { id: `${r}-secret`, give: () => { S.coins += 30; saveState(); Talk.say('A secret treasure! Thirty coins!'); } });
  }
  // guardian in the last room
  const L = roomPos(total - 1);
  b.ent('station', L.x + 6, L.y + 3, station(`${r}-boss`, { art: artGuardian(D.color), noCheck: true, use: sc => bossTalk(sc, r) }));
  return b.build({ spawn: DUNGEON_SPAWN(r), pal: D.pal, music: D.music, bg: D.bg, title: D.name, dark: 'rgba(30,20,70,.10)' });
}
for (const r of REGION_ORDER) MAPS[r] = () => buildDungeon(r);

/* The friendly guardian: three short games in a row (reading, math, thinking), then the reward. */
function runMedley(sc, r, list, who, done) {
  S.bossProg = S.bossProg || {};
  const go = i => {
    S.bossProg[r] = i; saveState();
    if (i >= list.length) return done();
    sc.open(playPuz(list[i], { count: 2, coins: 4, who, intro: i === 0 ? undefined : `Game number ${i + 1}!`, onDone: () => go(i + 1) }));
  };
  go(S.bossProg[r] || 0);   // leaving or reloading picks up at the same game
}
function bossTalk(sc, r) {
  const D = DUNGEONS[r], who = { face: (x, y, s) => artGuardian(D.color)(x, y, 0, s) && 0 };
  const whoFace = { face: (x, y) => { ctx.save(); ctx.translate(x, y); ctx.scale(0.55, 0.55); ctx.translate(-x, -y); artGuardian(D.color)(x, y, 0); ctx.restore(); } };
  void who;
  if (S.step !== stepIndex(`${r}D`)) { Talk.say(`${D.bossName} waves hello! Thank you for playing with me.`); return; }
  if (dungeonGoal(r).ent !== `${r}-boss`) { Talk.say('Finish the other rooms first!'); return; }
  if (sc.bossStart) return; sc.bossStart = true;
  Talk.say(D.bossLine, { show: `${D.bossName}: Play three games with me!` }).then(() => {
    sc.bossStart = false;
    if (sc.overlay) return;
    runMedley(sc, r, D.boss, whoFace, () => {
      if (r === 'tower') { sc.open(new EmberScene('reveal', () => {
        sc.open(new BeadPuzzle({ title: "Ember's Night-Light", mode: 'nest', kind: 'necklace', noQuit: true, onDone: () => {
          sc.open(new EmberScene('thanks', () => {
            if (!S.pets.includes('dragon')) S.pets.push('dragon'); S.pet = 'dragon';
            advance('towerD', sc); saveState();
          }));
        } }));
      })); return; }
      const finish = () => giveClue(sc, D.clue, () => { advance(`${r}D`, sc); maybeBreak(sc); });
      if (S.pets.includes(D.pet)) { finish(); return; }
      sc.open(new PetGame(D.pet, () => {
        S.pets.push(D.pet); S.pet = D.pet; Sfx.fanfare(); saveState();
        finish();
      }, true));
    });
  });
}

/* ---------- Finale ---------- */
class EmberScene {
  constructor(phase, then) {
    this.phase = phase; this.then = then; this.t = 0; this.done = false; this.i = 0;
    this.lines = phase === 'reveal'
      ? [['Look! All the lights are here, in a cozy little nest. And who is that?', 'Who is that?'],
         ['It is Ember, a baby dragon! Ember is afraid of the dark. So Ember took every light, to feel safe.', 'Ember is afraid of the dark.'],
         ['Nobody is in trouble. Let us make Ember a glowing necklace, a night-light to wear all the time.', 'Make Ember a glowing necklace!']]
      : [['Ember loves it! It glows and glows! Now Ember is not scared. Ember gives back every light!', 'Ember gives back every light!'],
         ['The big lens is back. And Ember wants to be your friend!', 'Ember is your new friend!']];
    this.play();
  }
  async play() { for (const [l, sh] of this.lines) { if (this.closed) return; this.line = sh; await Talk.say(l, { show: sh }); } this.done = true; }
  replay() { Talk.say(Talk.last, { show: Talk.line }); }
  finish() { if (this.closed) return; this.closed = true; Speech.stop(); this.scene.close(); this.then(); }
  update(dt) {
    this.t += dt;
    if (Input.clicked(HEAR_BTN)) { this.replay(); return; }
    if (this.done && this.t > 3 && (Input.key(' ') || Input.key('enter') || Input.click)) this.finish();
    else if (this.t > 4 && (Input.key(' ') || Input.key('enter'))) this.finish();
  }
  draw() {
    const g = ctx.createLinearGradient(0, 0, 0, VH); g.addColorStop(0, '#1a1a4a'); g.addColorStop(1, '#6a4a8a'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    for (let i = 0; i < 30; i++) { star((i * 97) % VW, (i * 41) % 240, 2 + (i % 3), 4, 0.4); paint('#fff6b0', 0); }
    rr(VW / 2 - 260, 330, 520, 60, 16); paint('#a8743e', 4);
    ellipse(VW / 2, 340, 170, 44); paint('#c8a070', 4);
    for (let i = 0; i < 9; i++) { const a = i * 0.7 + this.t; drawBead(BEAD_NAMES[i % 6], VW / 2 - 130 + i * 32, 320 + Math.sin(a) * 5, 11); }
    drawPet('dragon', VW / 2, 330, this.t, { scale: 3.2, walking: this.phase === 'thanks' });
    if (this.phase === 'thanks') { for (let k = 0; k < 7; k++) { const a = Math.PI * (0.15 + 0.7 * k / 6); circle(VW / 2 + 38 + Math.cos(a) * 34, 255 + Math.sin(a) * 22, 8); paint(BEAD_COLORS[BEAD_NAMES[k]], 2); } if (Math.random() < 0.15) FX.sparkle(VW / 2 + rint(-100, 100), 260, 2); }
    drawHero(VW / 2 - 260, 460, { scale: 1.9, wave: 1 });
    FX.update(1 / 60); FX.draw();
    Talk.strip();
    drawSpeaker(HEAR_BTN.x + 22, 96, Speech.speaking);
    if (this.done && Math.sin(this.t * 4) > -0.3) drawKey('SPACE', VW - 90, VH - 34, '#8be06b', 110);
  }
}
/* Every light comes back; everyone dances, wearing what she made. */
class PartyOverlay {
  constructor() {
    this.t = 0; Music.play('win', { loop: false });
    setTimeout(() => Music.play('coney'), 2500);
    Talk.say('The lighthouse is shining again! All the lights came home, and Ember is not scared any more. You solved the mystery, Detective Sadelle!', { show: 'You solved the mystery!' });
  }
  replay() { Talk.say('You solved the mystery! You can keep exploring, find secret chests, and make jewelry for your friends.'); }
  update(dt) {
    this.t += dt;
    if (Math.random() < 0.15) FX.confetti(rint(100, VW - 100), 60, 6);
    if (this.t > 4 && (Input.key(' ') || Input.key('enter') || Input.click || Input.key('escape'))) { this.scene.close(); Talk.say('Now you can explore! Your pets can open secret rooms in the old dungeons. And your friends have jewelry orders for you!'); }
  }
  draw() {
    ctx.fillStyle = 'rgba(40,20,60,.82)'; ctx.fillRect(0, 0, VW, VH);
    text('You solved the mystery!', VW / 2, 80, { size: 52, color: '#ffd23f', lw: 8 });
    const cast = ['bea', 'tova', 'opal', 'finn', 'quill', 'fern', 'marina', 'moss', 'yuki', 'ziva'];
    cast.forEach((k, i) => {
      const x = 90 + i * 87, y = 400 + Math.abs(Math.sin(this.t * 5 + i)) * -18;
      drawPerson(x, y, { look: NPC_LOOKS[k], scale: 1.05, face: i % 2 ? -1 : 1, wave: Math.max(0, Math.sin(this.t * 6 + i)) });
      if (S.gifts[k]) drawGiftNecklace(x, y, 1.05, i % 2 ? -1 : 1, !NPC_LOOKS[k].kid);
    });
    drawHero(VW / 2, 300 + Math.abs(Math.sin(this.t * 5)) * -20, { scale: 1.8, wave: 1 });
    drawPet('dragon', VW / 2 + 150, 300, this.t, { scale: 1.6, walking: true });
    S.pets.filter(p => p !== 'dragon').slice(0, 8).forEach((p, i) => drawPet(p, 110 + i * 100, 500, this.t + i, { scale: 1.1, walking: true }));
    FX.update(1 / 60); FX.draw();
    if (this.t > 4) text('Press SPACE to keep exploring', VW / 2, VH - 16, { size: 22, color: '#fff', lw: 5 });
    Talk.strip();
  }
}

/* ---------- Picture map: click to travel ---------- */
const PLACES = [
  { name: 'Harbor Town', say: 'Harbor Town', x: 46, y: 37, mx: 480, my: 300, c: '#f2a65a', open: () => true },
  { name: 'Whisper Woods', say: 'Whisper Woods', x: 46, y: 21, mx: 480, my: 190, c: '#5fa84a', open: () => S.step >= stepIndex('woodsN') },
  { name: 'Coral Beach', say: 'Coral Beach', x: 66, y: 35, mx: 730, my: 300, c: '#f2dca0', open: () => !!S.done['gate-beach'] },
  { name: 'Marble Marsh', say: 'Marble Marsh', x: 46, y: 47, mx: 480, my: 410, c: '#6a9a6a', open: () => !!S.done['gate-marsh'] },
  { name: 'Frost Hill', say: 'Frost Hill', x: 27, y: 35, mx: 230, my: 300, c: '#dff2ff', open: () => !!S.done['gate-frost'] },
  { name: 'Sunstone Ruins', say: 'Sunstone Ruins', x: 16, y: 21, mx: 230, my: 190, c: '#e4cfa0', open: () => !!S.done['gate-ruins'] },
  { name: 'Lighthouse Point', say: 'Lighthouse Point', x: 76, y: 21, mx: 730, my: 190, c: '#c8c0e8', open: () => !!S.done['gate-tower'] },
];
/* Which place on the picture map holds the next goal. */
function goalPlace() {
  const id = STORY[Math.min(S.step, STORY.length - 1)].id, r = REGION_ORDER.find(x => id.startsWith(x));
  if (!r) return 0;
  if (id.endsWith('G')) return { beach: 0, marsh: 0, frost: 0, ruins: 4, tower: 2 }[r];
  return REGION_ORDER.indexOf(r) + 1;
}
class MapOverlay {
  constructor() { this.t = 0; this.sel = 0; Talk.say('Your map! Click a place to go there.', { show: 'Click a place to go there!' }); }
  replay() { Talk.say('Click a place to go there. Places with a lock are not open yet.'); }
  rect(p) { return { x: p.mx - 100, y: p.my - 45, w: 200, h: 90 }; }
  update(dt) {
    this.t += dt;
    if (Input.clicked(CLOSE_BTN) || Input.key('escape') || Input.key('m')) { this.scene.close(); return; }
    if (Input.clicked(HEAR_BTN)) { this.replay(); return; }
    if (Input.pressed('right')) { this.sel = (this.sel + 1) % PLACES.length; Sfx.click(); Speech.say(PLACES[this.sel].say); }
    if (Input.pressed('left')) { this.sel = (this.sel + PLACES.length - 1) % PLACES.length; Sfx.click(); Speech.say(PLACES[this.sel].say); }
    PLACES.forEach((p, i) => { if (Input.hover(this.rect(p)) && this.sel !== i) { this.sel = i; Speech.say(p.say); } });
    let c = -1;
    PLACES.forEach((p, i) => { if (Input.clicked(this.rect(p))) c = i; });
    if (Input.key(' ') || Input.key('enter')) c = this.sel;
    if (c < 0) return;
    const p = PLACES[c];
    if (!p.open()) { Sfx.bonk(); Talk.say(`${p.say} is not open yet. Keep following the arrow!`); return; }
    this.scene.close(); this.scene.go('isle', { x: p.x, y: p.y });
  }
  draw() {
    drawPanelFrame('Map of Lantern Isle', '#bfe6ff');
    const place = goalPlace();
    PLACES.forEach((p, i) => {
      const r = this.rect(p), open = p.open(), sel = i === this.sel;
      if (i === place) { ctx.globalAlpha = 0.5 + Math.sin(this.t * 5) * 0.3; rr(r.x - 10, r.y - 10, r.w + 20, r.h + 20, 32); paint('#fff07a', 0); ctx.globalAlpha = 1; star(r.x + r.w - 6, r.y + 6 + Math.sin(this.t * 4) * 4, 16); paint('#ffd23f', 3); }
      rr(r.x, r.y, r.w, r.h, 26); paint(open ? p.c : '#a8a8b8', sel ? 6 : 3, sel ? '#ff5fa2' : OUT);
      text(p.name, p.mx, p.my, { size: 22, color: OUT, stroke: null });
      if (!open) { rr(p.mx - 10, p.my + 14, 20, 16, 4); paint('#ffd23f', 2.5); ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.beginPath(); ctx.arc(p.mx, p.my + 14, 7, Math.PI, 0); ctx.stroke(); }
    });
    Talk.strip();
  }
}

/* ---------- Pet accessory shop ---------- */
class PetShop {
  constructor() { this.t = 0; Talk.say(S.pet ? `Buy something for ${PET_INFO[S.pet].short}! Click to buy or try it on.` : 'Pick a pet to walk with you first. Press N and look at your pets.'); }
  replay() { Talk.say(`You have ${S.coins} coins. Click to buy or try on.`); }
  items() { return Object.entries(PET_WEAR); }
  rect(i) { return { x: PX + 50 + i * 170, y: PY + 170, w: 150, h: 170 }; }
  update(dt) {
    this.t += dt;
    if (Input.clicked(CLOSE_BTN) || Input.key('escape')) { this.scene.close(); return; }
    if (Input.clicked(HEAR_BTN)) { this.replay(); return; }
    if (!S.pet) return;
    const list = this.items(), speak = ([id, it]) => Speech.say(S.owned.includes('pet:' + id) ? it.name : `${it.name}. ${it.price} coins.`);
    this.sel = this.sel || 0;
    if (Input.pressed('right')) { this.sel = (this.sel + 1) % list.length; Sfx.click(); speak(list[this.sel]); }
    if (Input.pressed('left')) { this.sel = (this.sel + list.length - 1) % list.length; Sfx.click(); speak(list[this.sel]); }
    list.forEach((e, i) => { if (Input.hover(this.rect(i)) && this.sel !== i) { this.sel = i; speak(e); } });
    list.forEach(([id, it], i) => {
      if (!(Input.clicked(this.rect(i)) || (i === this.sel && (Input.key(' ') || Input.key('enter'))))) return;
      const key = 'pet:' + id;
      if (!S.owned.includes(key) && this.preview !== key) { this.preview = key; Sfx.click(); Talk.say(S.coins >= it.price ? `${it.name} costs ${it.price} coins. You have ${S.coins}. Press it again to buy it.` : `${it.name} costs ${it.price} coins. You need ${it.price - S.coins} more.`); return; }
      if (S.owned.includes(key)) { S.petWear[S.pet] = S.petWear[S.pet] === id ? null : id; Sfx.sparkle(); Talk.say(S.petWear[S.pet] ? `${PET_INFO[S.pet].short} is wearing ${it.name}!` : 'Taken off.'); }
      else if (S.coins >= it.price) { S.coins -= it.price; S.owned.push(key); S.petWear[S.pet] = id; Sfx.coin(); Talk.say(`You bought ${it.name} for ${it.price} coins! ${PET_INFO[S.pet].short} loves it!`); }
      else Talk.say(`${it.name} costs ${it.price} coins. You have ${S.coins}. You need ${it.price - S.coins} more.`);
      saveState();
    });
  }
  draw() {
    drawPanelFrame('Pet Shop', '#fff0f6');
    drawCoin(PX + 40, PY + 110, this.t); text(String(S.coins), PX + 62, PY + 111, { size: 26, color: OUT, stroke: null, align: 'left' });
    if (!S.pet) { text('Pick a pet first! Press N.', VW / 2, VH / 2, { size: 32, color: OUT, stroke: null }); return; }
    this.items().forEach(([id, it], i) => {
      const r = this.rect(i), on = S.petWear[S.pet] === id, own = S.owned.includes('pet:' + id), hot = Input.hover(r) || i === (this.sel || 0);
      rr(r.x, r.y, r.w, r.h, 14); paint(on ? '#fff6c8' : hot ? '#fbf6ff' : '#fff', on ? 5 : 3, on ? '#ff5fa2' : OUT);
      const old = S.petWear[S.pet]; S.petWear[S.pet] = id;
      drawPet(S.pet, r.x + r.w / 2, r.y + 112, this.t, { scale: 1.6 }); drawPetWear(S.pet, r.x + r.w / 2, r.y + 112, 1.6, 1);
      S.petWear[S.pet] = old;
      if (own) text('yours!', r.x + r.w / 2, r.y + 148, { size: 18, color: '#3a9a5a', stroke: null });
      else { drawCoin(r.x + r.w / 2 - 20, r.y + 148, 0); text(String(it.price), r.x + r.w / 2, r.y + 149, { size: 20, color: OUT, stroke: null, align: 'left' }); }
    });
    Talk.strip();
  }
}

/* ---------- Puzzle board: play any puzzle again ---------- */
class PuzzleBoard {
  constructor() { this.t = 0; this.names = Object.keys(PUZ); this.sel = 0; Talk.say('The puzzle board! Pick any puzzle. Pink is reading, orange is math, and blue is thinking.', { show: 'Pick any puzzle!' }); }
  replay() { Talk.say('Pick any puzzle. Pink is reading, orange is math, and blue is thinking.'); }
  rect(i) { const cols = 5; return { x: PX + 24 + (i % cols) * 164, y: PY + 76 + Math.floor(i / cols) * 64, w: 156, h: 56 }; }
  update(dt) {
    this.t += dt;
    if (Input.clicked(CLOSE_BTN) || Input.key('escape')) { this.scene.close(); return; }
    if (Input.clicked(HEAR_BTN)) { this.replay(); return; }
    const n = this.names.length, mv = d => { this.sel = (this.sel + d + n) % n; Sfx.click(); Speech.say(PUZ[this.names[this.sel]].say); };
    if (Input.pressed('right')) mv(1); if (Input.pressed('left')) mv(-1); if (Input.pressed('down')) mv(5); if (Input.pressed('up')) mv(-5);
    this.names.forEach((nm, i) => { if (Input.hover(this.rect(i)) && this.sel !== i) { this.sel = i; Speech.say(PUZ[nm].say); } });
    let c = -1;
    this.names.forEach((nm, i) => { if (Input.clicked(this.rect(i))) c = i; });
    if (Input.key(' ') || Input.key('enter')) c = this.sel;
    if (c >= 0) this.scene.open(playPuz(this.names[c], { count: 3, coins: 3 }));
  }
  draw() {
    drawPanelFrame('Puzzle Board', '#f0ecff');
    this.names.forEach((nm, i) => {
      const r = this.rect(i), K = PUZ[nm].kind, sel = this.sel === i;
      rr(r.x, r.y, r.w, r.h, 12); paint(K === 'read' ? '#ffd0e4' : K === 'math' ? '#ffe0b0' : '#cfe6ff', sel ? 5 : 3, sel ? '#ff5fa2' : OUT);
      text(PUZ[nm].name, r.x + r.w / 2, r.y + r.h / 2, { size: PUZ[nm].name.length > 12 ? 17 : 20, color: OUT, stroke: null });
    });
    Talk.strip();
  }
}

/* A small gift for coming back, once a day. */
function dailyGift(sc) {
  const today = new Date().toISOString().slice(0, 10);
  if (S.lastGift === today || S.step === 0) return;
  S.lastGift = today; S.coins += 5;
  // once every order is done, a few friends have new wishes each day
  if (S.step >= stepIndex('free') && Object.keys(ORDERS).every(k => orderState(k).given)) shuffle(Object.keys(ORDERS)).slice(0, 3).forEach(k => { S.orders[k] = { taken: false, made: false, given: false }; });
  saveState();
  sc.later(1.2, () => { Sfx.coin(); Talk.say('Welcome back! Here is a gift of 5 coins.'); });
}
