'use strict';

/* The mystery: cast, clues, suspects and the step-by-step story that drives the goal banner and arrow. */

const NPC_LOOKS = {
  feldman: { skin: '#e8b890', hair: '#8a8a8a', color: '#3a6ab0', hairStyle: 'short', glasses: true, tie: '#e8442f', mustache: '#8a8a8a' },
  okafor: { skin: '#7a4a2a', hair: '#1a1210', color: '#8be06b', hairStyle: 'puff', dress: true },
  gus: { skin: '#d9a273', hair: '#4a3a2a', color: '#4a6a8a', hairStyle: 'short', hat: 'cap', hatColor: '#2f4f8a', beard: '#4a3a2a' },
  ruby: { skin: '#f2c9a0', hair: '#c9472f', color: '#ff8ac4', hairStyle: 'long', kid: true, bow: '#ffd23f', dress: true },
  theo: { skin: '#a86f45', hair: '#2a1a12', color: '#ffb02e', hairStyle: 'curly', kid: true, hat: 'conductor', hatColor: '#4a6ab0' },
  bloom: { skin: '#ffe0c4', hair: '#e8e8f0', color: '#b07cff', hairStyle: 'bun', glasses: true },
  stone: { skin: '#d9a273', hair: '#5b3a24', color: '#c8a070', hairStyle: 'short', glasses: true, hat: 'detective', hatColor: '#8a6a3a' },
  lena: { skin: '#f2c9a0', hair: '#f0d27a', color: '#4aa3ff', hairStyle: 'long', dress: true, hat: 'beanie', hatColor: '#ff5fa2' },
  shapiro: { skin: '#f2c9a0', hair: '#2a1a12', color: '#fffaf0', hairStyle: 'short', apron: '#e8d0a8', hat: 'chef', beard: '#2a1a12' },
  joy: { skin: '#6e4529', hair: '#1a1210', color: '#2f4f8a', hairStyle: 'bun', hat: 'conductor', hatColor: '#2f4f8a', stripe: '#ffd23f' },
  marisol: { skin: '#d9a273', hair: '#2a1a12', color: '#3ec1d3', hairStyle: 'long', hat: 'cap', hatColor: '#1a6a8a' },
  kid1: { skin: '#ffe0c4', hair: '#f0d27a', color: '#8be06b', hairStyle: 'bob', kid: true },
  kid2: { skin: '#6e4529', hair: '#1a1210', color: '#ff6b5a', hairStyle: 'puff', kid: true },
  kid3: { skin: '#d9a273', hair: '#2a1a12', color: '#b07cff', hairStyle: 'short', kid: true, hat: 'kippah', hatColor: '#2f4f8a' },
  adult1: { skin: '#a86f45', hair: '#1a1210', color: '#e8442f', hairStyle: 'short' },
  adult2: { skin: '#ffe0c4', hair: '#c9772f', color: '#ffd23f', hairStyle: 'long', dress: true },
};

const CLUES = {
  feather: { name: 'A gray feather', icon: 'feather', say: 'A soft gray feather, right under the empty hook!' },
  footprints: { name: 'Tiny footprints', icon: 'paw', say: 'Tiny footprints with three skinny toes. Cats have round paws, so it was not Mazel!', clears: 'mazel' },
  log: { name: "Mr. Gus's work log", icon: 'note', say: 'Mr. Gus was fixing the boiler all morning. It was not Mr. Gus!', clears: 'gus' },
  glitter: { name: 'Glitter going up', icon: 'glitter', say: 'A trail of glitter going up, up, up to the high gym window!' },
  rubybox: { name: "Ruby's bead box", icon: 'bead', say: "Ruby's beads are all in her box. It was not Ruby!", clears: 'ruby' },
  oldmap: { name: 'An old school map', icon: 'map', say: 'An old map from long ago. There is a secret tunnel under the library!' },
  camera: { name: 'A camera picture', icon: 'feather', say: 'The museum camera saw a gray blur... with wings!', wings: true, piece: 1 },
  skate: { name: 'Coach Lena saw it', icon: 'skate', say: 'Something gray flew over the ice, toward the bagel shop!', piece: 2 },
  crumbs: { name: 'Crumbs and a coo', icon: 'note', say: 'Bagel crumbs, and a sound: coo, coo!', piece: 3 },
  ticket: { name: 'A train ticket', icon: 'ticket', say: 'The bird rode the train to Coney Island!', piece: 4 },
  shell: { name: 'A seagull tip', icon: 'shell', say: 'A seagull says: the gray bird lives up high, by the giant wheel!', piece: 5 },
  chain: { name: 'The Great Bead Chain!', icon: 'bead', say: 'You found the Great Bead Chain! Mystery solved!' },
};
const CLUE_ORDER = Object.keys(CLUES);
const SUSPECTS = [
  { id: 'gus', name: 'Mr. Gus', look: 'gus', why: 'He has all the keys.' },
  { id: 'ruby', name: 'Ruby', look: 'ruby', why: 'She loves beads.' },
  { id: 'mazel', name: 'Mazel', look: null, why: 'Cats knock things down!' },
  { id: 'mystery', name: '???', look: null, why: 'Who could it be?' },
];
const cleared = id => S.clues.some(c => CLUES[c].clears === id);

/* ---------- Story steps ---------- */
const STORY = [
  { id: 'beads', map: 'school', short: 'Pick up the 3 shiny beads', say: 'Look! Shiny beads on the floor. Walk over them to pick them up.' },
  { id: 'feldman', map: 'school', ent: 'feldman', short: 'Talk to Principal Feldman', say: 'Go talk to Principal Feldman. Follow the yellow arrow!' },
  { id: 'ruby', map: 'school', ent: 'ruby', short: 'Visit Ruby in the art room', say: 'Ruby loves beads! Visit her in the art room, right next door.' },
  { id: 'okafor', map: 'school', ent: 'okafor', short: 'Find Ms. Okafor in the classroom', say: 'Find Ms. Okafor in your classroom. Follow the arrow!' },
  { id: 'gus', map: 'school', ent: 'gus', short: 'Ask Mr. Gus in the cafeteria', say: 'Mr. Gus is in the cafeteria. Let\'s ask him!' },
  { id: 'theo', map: 'school', ent: 'theo', short: 'Find Theo in the gym', say: 'Theo is in the gym. Maybe he saw something!' },
  { id: 'board', map: 'school', ent: 'board', short: "Read the notes in the principal's office", say: "Go to the principal's office and read the notes on the board." },
  { id: 'bloom', map: 'school', ent: 'bloom', short: 'Talk to Mrs. Bloom in the library', say: 'The old map shows the library! Talk to Mrs. Bloom.' },
  { id: 'stone', map: 'museum', ent: 'stone', short: 'Go through the tunnel to the Museum', say: 'Walk into the secret bookcase, then go to the Museum door!' },
  { id: 'gems', map: 'museum', ent: 'gems', short: 'Count the gems in the gem case', say: 'Dr. Stone needs help counting the gems.' },
  { id: 'lena', map: 'rink', ent: 'lena', short: 'Go to the Ice Rink', say: 'Back to the tunnel! The Ice Rink door is open now.' },
  { id: 'zamboni', map: 'rink', ent: 'zamboni', short: 'Help count down the ice machine', say: 'Help count down so the ice machine can go!' },
  { id: 'shapiro', map: 'bagels', ent: 'shapiro', short: "Go to Shapiro's Bagels", say: "The bird flew toward the bagels! Go to Shapiro's Bagels." },
  { id: 'register', map: 'bagels', ent: 'register', short: 'Pay at the cash register', say: 'Pay for your bagel at the cash register.' },
  { id: 'joy', map: 'station', ent: 'joy', short: 'Go to Grand Station', say: 'Go to the train station! Find Conductor Joy.' },
  { id: 'theoS', map: 'station', ent: 'theoS', short: 'Help Theo count the tickets', say: 'Theo is at the station too! Help him count tickets.' },
  { id: 'marisol', map: 'aquarium', ent: 'marisol', short: 'Go to the Aquarium', say: 'Go to the Aquarium. Captain Marisol knows every animal.' },
  { id: 'tank', map: 'aquarium', ent: 'tank', short: 'Feed the fish at the big tank', say: 'Feed the fish at the big tank!' },
  { id: 'booth', map: 'coney', ent: 'booth', short: 'Go to Coney Island! Get tickets', say: 'To Coney Island! Get ride tickets at the ticket booth.' },
  { id: 'carousel', map: 'coney', ent: 'carousel', short: 'Ride the carousel', say: 'Ride the carousel!' },
  { id: 'wheel', map: 'coney', ent: 'wheel', short: 'Ride the Big Wheel to the top!', say: 'The bird lives up high, by the giant wheel. Ride the Big Wheel!' },
  { id: 'party', map: 'school', ent: 'feldman', short: 'Bring the chain back to school!', say: 'Bring the Great Bead Chain back to Principal Feldman!' },
  { id: 'free', short: 'Free play: friends, pets and jewelry!', say: 'You solved the mystery! Now you can explore, find pets, and make jewelry for your friends.' },
];
const stepIndex = id => STORY.findIndex(s => s.id === id);
const pastStep = id => S.step > stepIndex(id);

function currentGoal() {
  const s = STORY[Math.min(S.step, STORY.length - 1)];
  const g = Object.assign({}, s);
  if (s.id === 'beads') { const left = ['bead1', 'bead2', 'bead3'].filter(b => !S.done[b]); g.ent = left[0]; g.short = `Pick up the shiny beads (${3 - left.length}/3)`; }
  if (s.id === 'free') {
    // free play still has a next thing: deliver jewelry, take a new order, then find the pets
    const made = Object.keys(ORDERS).find(k => { const o = orderState(k); return o.made && !o.given; });
    const fresh = Object.keys(ORDERS).find(k => !orderState(k).taken);
    const pet = Object.keys(PET_PLACES).find(k => !S.pets.includes(k));
    if (made) { g.map = NPC_HOME[ORDERS[made].npc]; g.ent = ORDERS[made].npc; g.short = `Give your jewelry to ${ORDERS[made].who}`; g.say = `${g.short}!`; }
    else if (fresh) { g.map = NPC_HOME[ORDERS[fresh].npc]; g.ent = ORDERS[fresh].npc; g.short = `Ask ${ORDERS[fresh].who} about jewelry`; g.say = `${ORDERS[fresh].who} wants you to make something! Go ask.`; }
    else if (pet) { g.map = PET_PLACES[pet]; g.ent = 'pet-' + pet; g.short = `Find ${PET_INFO[pet].short} the ${pet}`; g.say = `A little ${pet} is hiding! Can you find ${PET_INFO[pet].short}?`; }
  }
  return g;
}
/* Which map each friend lives on (for the arrow during free play). */
const PET_PLACES = { hamster: 'school', turtle: 'museum', penguin: 'rink', bunny: 'bagels', owl: 'station', seal: 'aquarium', puppy: 'coney' };
const NPC_HOME = { feldman: 'school', okafor: 'school', gus: 'school', ruby: 'school', theo: 'school', bloom: 'school', stone: 'museum', lena: 'rink', shapiro: 'bagels', joy: 'station', marisol: 'aquarium' };

/* The way between maps: everything connects through the tunnel. */
function routeNext(from, to) {
  if (!to || from === to) return null;
  if (from === 'tunnel') return to;
  return 'tunnel';
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
  // say the goal when she arrives somewhere the goal is
  const g = currentGoal();
  if (g.map === sc.mapId && S.step > 0) sc.later(2.2, () => { if (!sc.overlay && !Speech.speaking) Talk.say(g.say, { show: g.short }); });
}

function giveClue(sc, id, then) {
  if (S.clues.includes(id)) { if (then) then(); return; }
  S.clues.push(id);
  saveState();
  sc.open(new ClueCard(id, then));
}

/* After a challenge: give a break suggestion at a natural stopping point, once. */
function maybeBreak(sc) {
  if (Game.sessionTime > 20 * 60 && !Game.breakSaid) {
    Game.breakSaid = true;
    sc.later(5, () => Talk.say('Great detecting today! This is a good place to take a break. Your game is saved. You can keep playing if you want!'));
  }
}
