'use strict';

/* The mystery: cast, clues, suspects, the six dungeons, and the step-by-step story that drives the goal banner and arrow. */

const NPC_LOOKS = {
  bea: { skin: '#d9a273', hair: '#e8e8f0', color: '#4a7ad8', hairStyle: 'bun', glasses: true, apron: '#ffd23f' },
  tova: { skin: '#f2c9a0', hair: '#7a3a2a', color: '#fffaf0', hairStyle: 'bun', apron: '#e8d0a8', hat: 'chef' },
  opal: { skin: '#6e4529', hair: '#1a1210', color: '#b07cff', hairStyle: 'puff', dress: true, bow: '#ffd23f' },
  finn: { skin: '#e8b890', hair: '#c9772f', color: '#2f4f8a', hairStyle: 'short', beard: '#c9772f', hat: 'cap', hatColor: '#fffaf0' },
  quill: { skin: '#a86f45', hair: '#8a8a8a', color: '#8a5a32', hairStyle: 'short', glasses: true, tie: '#3a8a5a', mustache: '#8a8a8a' },
  bim: { skin: '#ffe0c4', hair: '#2a1a12', color: '#ff8a1f', hairStyle: 'curly', apron: '#fffaf0', hat: 'kippah', hatColor: '#2f4f8a' },
  fern: { skin: '#d9a273', hair: '#3a2a1a', color: '#5a9a5a', hairStyle: 'long', hat: 'detective', hatColor: '#8a6a3a' },
  marina: { skin: '#a86f45', hair: '#2a1a12', color: '#3ec1d3', hairStyle: 'long', hat: 'cap', hatColor: '#1a6a8a' },
  moss: { skin: '#f2c9a0', hair: '#5a7a4a', color: '#8be06b', hairStyle: 'curly', beard: '#5a7a4a' },
  yuki: { skin: '#ffe0c4', hair: '#1a1210', color: '#8ec5ff', hairStyle: 'long', dress: true, hat: 'beanie', hatColor: '#ff5fa2' },
  ziva: { skin: '#d9a273', hair: '#2a1a12', color: '#d8b888', hairStyle: 'bob', glasses: true, hat: 'detective', hatColor: '#c8a070' },
  kid1: { skin: '#ffe0c4', hair: '#f0d27a', color: '#8be06b', hairStyle: 'bob', kid: true },
  kid2: { skin: '#6e4529', hair: '#1a1210', color: '#ff6b5a', hairStyle: 'puff', kid: true },
  kid3: { skin: '#d9a273', hair: '#2a1a12', color: '#b07cff', hairStyle: 'short', kid: true, hat: 'kippah', hatColor: '#2f4f8a' },
  adult1: { skin: '#a86f45', hair: '#1a1210', color: '#e8442f', hairStyle: 'short' },
  adult2: { skin: '#ffe0c4', hair: '#c9772f', color: '#ffd23f', hairStyle: 'long', dress: true },
};

const CLUES = {
  dark: { name: 'The lights went out', icon: 'note', say: 'Every shiny, glowing thing on Lantern Isle is gone. Even the big light on top of the lighthouse!' },
  crumbs: { name: 'Toasty crumbs', icon: 'note', say: 'Toasty, warm crumbs by the glow jam shelf. Who made them warm?' },
  scale: { name: 'A tiny shiny scale', icon: 'bead', say: 'A tiny shiny scale. It is still a little bit warm!' },
  list: { name: 'Clue board note', icon: 'note', say: 'Someone has been taking lights only at night. We need more clues!' },
  footprint: { name: 'A warm footprint', icon: 'paw', say: 'A tiny footprint in the moss. Mazel sniffs it. Cat paws are round, so it was not Mazel!', clears: 'mazel' },
  gemGreen: { name: 'The green light gem', icon: 'bead', say: 'The green light gem! It belongs in the lighthouse lens.', piece: 1 },
  sniffle: { name: 'A sniffle at night', icon: 'shell', say: 'Marina heard a tiny sniffle in the night, up in the sky!' },
  gemBlue: { name: 'The blue light gem', icon: 'bead', say: 'The blue light gem! Captain Finn was at sea all night. It was not him!', clears: 'finn', piece: 2 },
  trail: { name: 'A glowing trail', icon: 'glitter', say: 'A trail of glowing dust, going up and up into the air.', wings: true },
  gemPink: { name: 'The pink light gem', icon: 'bead', say: 'The pink light gem! Madame Opal had all of her gems in her locked box. It was not her!', clears: 'opal', piece: 3 },
  melt: { name: 'A melted ice hole', icon: 'skate', say: 'A little round hole, melted in the ice. Something very warm was here.' },
  gemWhite: { name: 'The white light gem', icon: 'bead', say: 'The white light gem! Professor Quill was reading in bed all night. It was not him!', clears: 'quill', piece: 4 },
  picture: { name: 'An old wall picture', icon: 'map', say: 'An old picture on the wall. A tiny dragon, curled up by a candle!' },
  gemGold: { name: 'The gold light gem', icon: 'bead', say: 'The gold light gem! Only one more place to look. The lighthouse!', piece: 5 },
  lens: { name: 'The lighthouse lens!', icon: 'bead', say: 'You found the lighthouse lens! Mystery solved!' },
};
const CLUE_ORDER = Object.keys(CLUES);
const SUSPECTS = [
  { id: 'finn', name: 'Capt. Finn', look: 'finn', why: 'He needs a light for his boat.' },
  { id: 'opal', name: 'Mme. Opal', look: 'opal', why: 'She loves shiny gems.' },
  { id: 'quill', name: 'Prof. Quill', look: 'quill', why: 'He collects old things.' },
  { id: 'mazel', name: 'Mazel', look: null, why: 'Cats love to play with shiny things!' },
  { id: 'mystery', name: '???', look: null, why: 'Who could it be?' },
];
const cleared = id => S.clues.some(c => CLUES[c].clears === id);

/* ---------- Six places to explore ---------- */
const REGION_ORDER = ['woods', 'beach', 'marsh', 'frost', 'ruins', 'tower'];
const DUNGEONS = {
  woods: {
    name: 'Hollow Oak', region: 'Whisper Woods', pal: 'woods', music: 'museum', theme: 'woods', bg: '#1e2e1a', pet: 'puppy', clue: 'gemGreen', color: '#5fd068', door: { x: 46, y: 6 },
    rooms: ['labels', 'maze', 'tickets', 'oddone', 'sounds'], boss: ['reading', 'skip', 'missing'], outfit: 'outfit:ranger', secret: 'water',
    bossName: 'Mossy the shy stump', bossLine: 'Psst... I found a puppy and a pretty green gem, and I am too shy to give them back. Will you play three games with me?',
  },
  beach: {
    name: 'Tide Cave', region: 'Coral Beach', pal: 'beach', music: 'aquarium', theme: 'beach', bg: '#123048', pet: 'seal', clue: 'gemBlue', color: '#4aa3ff', door: { x: 84, y: 34 },
    rooms: ['wordpath', 'beams', 'skip', 'soundbells', 'fish'], boss: ['labels', 'tickets', 'numberpath'], outfit: 'outfit:mermaid', secret: 'burrow',
    bossName: 'Clam Sam', bossLine: 'Blub blub! Hello! A seal pup is keeping me company. I will open my shell if you play three games with me!',
  },
  marsh: {
    name: 'Mushroom Burrow', region: 'Marble Marsh', pal: 'marsh', music: 'tunnel', theme: 'marsh', bg: '#1a2e24', pet: 'bunny', clue: 'gemPink', color: '#ff6fae', door: { x: 46, y: 60 },
    rooms: ['syllables', 'square', 'numberpath', 'petpath', 'soundbells', 'bagels'], boss: ['lineup', 'countdown', 'maze'], outfit: 'outfit:froggy', secret: 'ice',
    bossName: 'Old Toad Tilly', bossLine: 'Croak! A little bunny is napping on my pink gem. Play three games with me, and I will wake her up gently.',
  },
  frost: {
    name: 'Crystal Cavern', region: 'Frost Hill', pal: 'frost', music: 'rink', theme: 'frost', bg: '#1a2a44', pet: 'penguin', clue: 'gemWhite', color: '#f6f2f8', door: { x: 8, y: 34 },
    rooms: ['typing', 'boulder', 'skip', 'scales', 'magic', 'doorcode'], boss: ['labels', 'fish', 'wordpath'], outfit: 'outfit:snow', secret: 'dark',
    bossName: 'Flake the snow friend', bossLine: 'Brrr! Hello! I have been hugging a penguin and a white gem to keep them safe. Play three games with me!',
  },
  ruins: {
    name: 'Sunstone Temple', region: 'Sunstone Ruins', pal: 'ruins', music: 'station', theme: 'ruins', bg: '#2a2010', pet: 'owl', clue: 'gemGold', color: '#ffd23f', door: { x: 16, y: 6 },
    rooms: ['reading', 'grid', 'gems', 'lineup', 'robot', 'coins', 'wordpath'], boss: ['syllables', 'numberpath', 'doorcode'], outfit: 'outfit:explorer', secret: 'dirt',
    bossName: 'Sir Sphinx', bossLine: 'Good day, young detective. An owl and a gold gem are safe with me. Three games, if you please!',
  },
  tower: {
    name: 'The Lighthouse', region: 'Lighthouse Point', pal: 'tower', music: 'tunnel', theme: 'tower', bg: '#1a1a3a', pet: null, clue: null, color: '#b07cff', door: { x: 76, y: 8 },
    rooms: ['magic', 'doorcode', 'skip', 'lineup', 'grid', 'fish', 'wordpath', 'numberpath', 'countdown'], boss: ['labels', 'doorcode', 'soundbells'], outfit: 'outfit:star', secret: null,
    bossName: 'The top of the lighthouse', bossLine: 'This is the very top. Three last puzzles, and we will know who took the lights!',
  },
};
const needsKey = name => PUZ[name].kind !== 'logic';   // keys come from reading and math; logic opens rune doors
const roomId = (r, i) => `${r}-p${i}`, chestId = (r, i) => `${r}-c${i}`, gateId = (r, i) => `${r}-g${i}`;

const OPENING = [
  { id: 'bea', map: 'isle', ent: 'bea', short: 'Talk to Nana Bea', say: 'Walk to Nana Bea, the lighthouse keeper. Follow the yellow arrow!', clue: 'dark' },
  { id: 'tova', map: 'bakery', ent: 'tova', short: 'Go to the bakery', say: 'Something happened at the bakery! Go in and talk to Baker Tova.' },
  { id: 'tray', map: 'bakery', ent: 'tray', short: 'Look at the bakery tray', say: 'Baker Tova needs you to look at the tray.', clue: 'crumbs' },
  { id: 'opal', map: 'studio', ent: 'opal', short: "Visit Madame Opal's jewelry shop", say: 'Go see Madame Opal at the jewelry shop.', clue: 'scale' },
  { id: 'bell', map: 'isle', ent: 'bell', short: 'Ring the harbor bell', say: 'Ring the harbor bell! Maybe someone will come.' },
  { id: 'fruit', map: 'market', ent: 'fruit', short: 'Help at the Market', say: 'Go to the Market. Mister Bim needs help with his scale.' },
  { id: 'cluebd', map: 'isle', ent: 'cluebd', short: 'Read the clue board', say: 'Go read the clue board in the town square.', clue: 'list' },
];
const REGION_STEPS = {
  woods: { npc: 'fern', station: 'stump', who: 'Ranger Fern', nClue: 'footprint', sClue: null, short: 'Find Ranger Fern in the woods', say: 'Go north to Whisper Woods! Find Ranger Fern.', sShort: 'Count the acorns', sSay: 'Help count the acorns on the tree stump.' },
  beach: { npc: 'marina', station: 'pool', who: 'Diver Marina', nClue: 'sniffle', sClue: null, short: 'Find Diver Marina on the beach', say: 'Go east to Coral Beach! Find Diver Marina.', sShort: 'Feed the fish in the tide pool', sSay: 'Feed the fish in the tide pool.' },
  marsh: { npc: 'moss', station: 'lily', who: 'Mister Moss', nClue: 'trail', sClue: null, short: 'Find Mister Moss in the marsh', say: 'Go south to Marble Marsh! Find Mister Moss.', sShort: 'Count down the lily pads', sSay: 'Count down the lily pads.' },
  frost: { npc: 'yuki', station: 'sled', who: 'Yuki', nClue: 'melt', sClue: null, short: 'Find Yuki on Frost Hill', say: 'Go west to Frost Hill! Find Yuki.', sShort: 'Count the sled tickets', sSay: 'Count the sled tickets by tens.' },
  ruins: { npc: 'ziva', station: 'olddoor', who: 'Doctor Ziva', nClue: 'picture', sClue: null, short: 'Find Doctor Ziva in the ruins', say: 'Go north to the Sunstone Ruins! Find Doctor Ziva.', sShort: 'Open the old door', sSay: 'Open the old door with the number code.' },
  tower: { npc: 'finn', station: 'beacon', who: 'Captain Finn', nClue: null, sClue: null, short: 'Find Captain Finn at the point', say: 'Go to Lighthouse Point! Find Captain Finn.', sShort: 'Read the last clues', sSay: 'Read the last clues on the board.' },
};
const PET_NAMES = () => PET_INFO;
const GATE_SHORT = {
  beach: ['Dig through to Coral Beach', 'Pickle can dig! Go east and walk up to the dirt pile.'],
  marsh: ['Cross the river to the marsh', 'Bubbles can pull a raft! Go south and walk up to the water.'],
  frost: ['Open the gate to Frost Hill', 'Marshmallow can hop in! Go west and walk up to the little tunnel.'],
  ruins: ['Break the ice to the ruins', 'Waddles can break the ice! Go north from Frost Hill and walk up to the ice block.'],
  tower: ['Light up the dark path', 'Hoot can see in the dark! Go north from Coral Beach and walk up to the dark path.'],
};

const STORY = OPENING.slice();
REGION_ORDER.forEach((r, i) => {
  const R = REGION_STEPS[r], D = DUNGEONS[r];
  if (i > 0) STORY.push({ id: `${r}G`, map: 'isle', ent: `gate-${r}`, short: GATE_SHORT[r][0], say: GATE_SHORT[r][1], gate: `gate-${r}` });
  STORY.push({ id: `${r}N`, map: 'isle', ent: R.npc, short: R.short, say: R.say, clue: R.nClue });
  STORY.push({ id: `${r}S`, map: 'isle', ent: R.station, short: R.sShort, say: R.sSay });
  STORY.push({ id: `${r}D`, map: r, dung: r, short: `Explore ${D.name}`, say: `Go into ${D.name}! Follow the arrow, room by room.`, clue: D.clue, pet: D.pet });
});
STORY.push({ id: 'home', map: 'isle', ent: 'bea', short: 'Bring the lens to Nana Bea', say: 'Bring the lens back to Nana Bea in town!', clue: 'lens', pet: 'dragon' });
STORY.push({ id: 'free', short: 'Free play: friends, pets and jewelry!', say: 'You solved the mystery! Now you can explore, find pets, and make jewelry for your friends.' });

const stepIndex = id => STORY.findIndex(s => s.id === id);
const pastStep = id => S.step > stepIndex(id);

/* Where she should go inside a dungeon: the next thing not done yet. */
function dungeonGoal(r) {
  const D = DUNGEONS[r];
  for (let i = 0; i < D.rooms.length; i++) {
    if (!S.done[roomId(r, i)]) return { ent: roomId(r, i), short: `Solve the ${PUZ[D.rooms[i]].name} puzzle`, say: `Walk to the glowing ${PUZ[D.rooms[i]].name} puzzle.` };
    if (!needsKey(D.rooms[i]) && !S.done[chestId(r, i)]) return { ent: chestId(r, i), short: 'Open the treasure chest', say: 'A chest appeared! Walk up to it.' };
    if (needsKey(D.rooms[i])) {
      if (!S.done[chestId(r, i)]) return { ent: chestId(r, i), short: 'Open the treasure chest', say: 'A chest appeared! Walk up to it.' };
      if (!S.done[gateId(r, i)]) return { ent: gateId(r, i), short: 'Use your key on the gate', say: 'Walk up to the gate. Your key will open it.' };
    }
  }
  return { ent: `${r}-boss`, short: `Meet ${D.bossName}`, say: `Someone is waiting in the last room. Go say hello!` };
}

function currentGoal() {
  const s = STORY[Math.min(S.step, STORY.length - 1)];
  const g = Object.assign({}, s);
  if (s.dung) {
    const dg = dungeonGoal(s.dung);
    g.ent = dg.ent; g.map = s.dung;
    if (Game.scene && Game.scene.mapId === s.dung) { g.short = dg.short; g.say = dg.say; }   // outside, keep saying where to go
  }
  if (s.id === 'free') {
    const made = Object.keys(ORDERS).find(k => { const o = orderState(k); return o.made && !o.given; });
    const fresh = Object.keys(ORDERS).find(k => !orderState(k).taken);
    const pending = Object.keys(ORDERS).find(k => { const o = orderState(k); return o.taken && !o.made; });
    const pet = Object.keys(PET_PLACES).find(k => !S.pets.includes(k));
    if (made) { g.map = NPC_HOME[ORDERS[made].npc]; g.ent = ORDERS[made].npc; g.short = `Give your jewelry to ${ORDERS[made].who}`; g.say = `${g.short}!`; }
    else if (pending) { g.map = 'studio'; g.ent = 'studio'; g.short = `Make jewelry for ${ORDERS[pending].who}`; g.say = `${ORDERS[pending].who} is waiting for jewelry. Go to the bead table, or press J!`; }
    else if (fresh) { g.map = NPC_HOME[ORDERS[fresh].npc]; g.ent = ORDERS[fresh].npc; g.short = `Ask ${ORDERS[fresh].who} about jewelry`; g.say = `${ORDERS[fresh].who} wants you to make something! Go ask.`; }
    else if (pet) { g.map = PET_PLACES[pet]; g.ent = 'pet-' + pet; g.short = `Find ${PET_INFO[pet].short}`; g.say = `A little friend is hiding! Can you find ${PET_INFO[pet].short}?`; }
    else {
      const sec = REGION_ORDER.find(r => DUNGEONS[r].secret && !S.done[`${r}-secret`]);
      if (sec) { g.map = sec; g.ent = `${sec}-secret`; g.short = `Find the secret chest in ${DUNGEONS[sec].name}`; g.say = `There is a secret chest in ${DUNGEONS[sec].name}!`; }
      else { const h = HEB_LIST.find(x => !(S.hebrew || []).includes(x[2])); if (h) { g.map = 'isle'; g.ent = 'heb-' + h[2]; g.short = `Find the letter ${h[2]}`; g.say = `A Hebrew letter bead is hiding. Can you find ${h[2]}?`; } }
    }
  }
  return g;
}
/* Where hidden pets and friends are (for the arrow during free play). */
const PET_PLACES = { hamster: 'isle', fox: 'isle', turtle: 'isle', frog: 'isle', lamb: 'isle', pigeon: 'isle' };
const NPC_HOME = { bea: 'isle', tova: 'bakery', opal: 'studio', finn: 'isle', quill: 'isle', fern: 'isle', marina: 'isle', moss: 'isle', yuki: 'isle', ziva: 'isle' };

/* Every place connects through the island itself. */
function routeNext(from, to) {
  if (!to || from === to) return null;
  return from === 'isle' ? to : 'isle';
}

/* If a gate is already open (from an old save or a jump), the story never waits on it. */
function settleStory() {
  while (STORY[S.step] && STORY[S.step].gate && S.done[STORY[S.step].gate]) S.step++;
}
function advance(id, sc) {
  if (STORY[S.step].id !== id) return false;
  S.step++;
  saveState();
  const nx = currentGoal();
  if (sc) sc.later(4.5, () => { if (!sc.overlay) Talk.say(nx.say, { show: nx.short }); });
  return true;
}
function checkStory(sc) {
  const g = currentGoal();
  if (g.map === sc.mapId && S.step > 0) sc.later(2.2, () => { if (!sc.overlay && !Speech.speaking) Talk.say(g.say, { show: g.short }); });
}

function giveClue(sc, id, then) {
  if (S.clues.includes(id)) { if (then) then(); return; }
  S.clues.push(id);
  saveState();
  sc.open(new ClueCard(id, then));
}

/* A gentle suggestion to rest, at a natural stopping point, once. */
function maybeBreak(sc) {
  if (Game.sessionTime > 20 * 60 && !Game.breakSaid) {
    Game.breakSaid = true;
    sc.later(5, () => Talk.say('Great detecting today! This is a good place to take a break. Your game is saved. You can keep playing if you want!'));
  }
}
