'use strict';

/* Word bank, sounds, pictures, and the adaptive engine that picks every question. */

/* ---------- Pictures (from pictures.js), drawn onto the canvas ---------- */
const PIC_CACHE = {};
function picImg(word) {
  if (word in PIC_CACHE) return PIC_CACHE[word];
  const svg = picSVG(word);
  if (!svg) return (PIC_CACHE[word] = null);
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  return (PIC_CACHE[word] = img);
}
const hasPic = w => !!picFor(w);
function drawPic(word, x, y, size) {
  const img = picImg(word);
  if (img && img.complete && img.naturalWidth) ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
  else { rr(x - size / 2, y - size / 2, size, size, 12); paint('#fffaf0', 2); text(word, x, y, { size: Math.min(28, size / 3), font: 'Andika', color: OUT, stroke: null }); }
}

/* ---------- Sounds (letter names say "ess"; sounds say "sss") ---------- */
const PHON = {
  a: 'short a, like apple', e: 'short e, like egg', i: 'short i, like itch', o: 'short o, like octopus', u: 'short u, like up', b: 'buh', c: 'kuh', k: 'kuh', d: 'duh', f: 'fff', g: 'guh', h: 'huh', j: 'juh',
  l: 'lll', m: 'mmm', n: 'nnn', p: 'puh', r: 'rrr', s: 'sss', t: 'tuh', v: 'vvv', w: 'wuh', x: 'kss', y: 'yuh', z: 'zzz', q: 'kwuh',
  sh: 'shhh', ch: 'chuh', th: 'th, like thumb', ng: 'ing, like ring', wh: 'wuh', ck: 'kuh',
  A: 'ay', E: 'ee', I: 'eye', O: 'oh', U: 'you', oo: 'oo', ar: 'ar', or: 'or',
};
/* Chunks for sound sorting, said with a keyword so the voice never confuses them. */
const CHUNK_SAY = {
  sh: 'the sound at the start of ship', ch: 'the sound at the start of chip', th: 'the sound at the start of thumb',
  st: 'the sound at the start of stop', fr: 'the sound at the start of frog', bl: 'the sound at the start of block', cr: 'the sound at the start of crab',
  sn: 'the sound at the start of snake', sl: 'the sound at the start of sled', fl: 'the sound at the start of flag', dr: 'the sound at the start of drum',
  pl: 'the sound at the start of plum', gr: 'the sound at the start of grape', cl: 'the sound at the start of clock', sm: 'the sound at the start of smile',
  s: 'sss, like sun', m: 'mmm, like moon', b: 'buh, like bat', t: 'tuh, like top', p: 'puh, like pig', d: 'duh, like dog', f: 'fff, like fan', h: 'huh, like hat',
  r: 'rrr, like red', c: 'kuh, like cat', n: 'nnn, like net', l: 'lll, like lamp', k: 'kuh, like kite', w: 'wuh, like web', g: 'guh, like goat', j: 'juh, like jam',
  v: 'vvv, like van', z: 'zzz, like zip', y: 'yuh, like yes',
  ck: 'the sound at the end of duck', ng: 'the sound at the end of ring', nd: 'the sound at the end of hand', mp: 'the sound at the end of lamp',
  nt: 'the sound at the end of tent', ft: 'the sound at the end of gift', lt: 'the sound at the end of belt', lk: 'the sound at the end of milk', sk: 'the sound at the end of mask',
  a: 'the middle sound in cat', e: 'the middle sound in bed', i: 'the middle sound in pig', o: 'the middle sound in dog', u: 'the middle sound in bug',
};
function phonemes(word) {
  const out = [];
  const silentE = /^[^aeiou]*[aeiou][^aeiou]e$/.test(word);
  const w = silentE ? word.slice(0, -1) : word;
  for (let i = 0; i < w.length;) {
    const two = w.slice(i, i + 2);
    const map2 = { sh: 'sh', ch: 'ch', th: 'th', ck: 'k', ng: 'ng', wh: 'wh', ll: 'l', ss: 's', ff: 'f', zz: 'z', ee: 'E', ea: 'E', oa: 'O', ai: 'A', ay: 'A', oo: 'oo' };
    if (map2[two]) { out.push(map2[two]); i += 2; continue; }
    const ch = w[i];
    if (silentE && 'aeiou'.includes(ch)) out.push(ch.toUpperCase());
    else if (ch === 'x') out.push('k', 's');
    else out.push(ch);
    i++;
  }
  return out;
}
const sayPh = p => PHON[p] || p;
function segSpeech(word) {
  if (/ar|or|er|ir|ur|ow|ou|ai|ay|ee|ea|oa|oo|igh/.test(word) || !/[aeiou]/.test(word)) return `${word}... ${word}`;
  const m = word.match(/^([^aeiou]*)([aeiou].*)$/);
  const onset = m[1], rime = m[2];
  const onsetSounds = [];
  for (let i = 0; i < onset.length;) { const two = onset.slice(i, i + 2); if (['sh', 'ch', 'th', 'wh'].includes(two)) { onsetSounds.push(sayPh(two)); i += 2; } else { onsetSounds.push(sayPh(onset[i])); i++; } }
  return onsetSounds.concat([rime]).join('... ');
}

/* ---------- Word bank: every word has a sentence ---------- */
const WORD_TIERS = {
  cvc: [
    'cat|The cat naps in the sun.', 'dog|The dog digs a hole.', 'sun|The sun is hot.', 'map|We look at the map.', 'bed|I go to bed at night.',
    'pig|The pig is pink.', 'hat|She has a red hat.', 'bus|We ride the bus to school.', 'cup|I drink from a cup.', 'fox|The fox is fast.',
    'hen|The hen sits on an egg.', 'jam|I like jam on toast.', 'log|The frog sits on a log.', 'net|I catch a fish in my net.', 'web|A spider made a web.',
    'fan|The fan is on.', 'box|The toy is in the box.', 'bug|A bug is on the leaf.', 'van|Dad drives a van.', 'pen|I write with a pen.',
    'bat|The bat flies at night.', 'mop|Mop up the mess.', 'tub|The duck is in the tub.', 'jet|The jet flies up high.', 'pot|The soup is in the pot.',
  ],
  blend: [
    'stop|The bus will stop here.', 'frog|The frog hops in the pond.', 'crab|The crab walks on the sand.', 'flag|The flag waves in the wind.', 'drum|Bang the drum!',
    'plum|A plum is purple.', 'sled|We ride the sled in the snow.', 'nest|The bird sits in its nest.', 'hand|Raise your hand.', 'lamp|Turn on the lamp.',
    'gift|I got a gift.', 'tent|We sleep in a tent.', 'belt|My belt is brown.', 'milk|I drink my milk.', 'swim|Fish swim in the tank.',
    'spin|Skaters spin on the ice.', 'snap|Snap your fingers.', 'clap|Clap your hands.', 'step|Watch your step.', 'skip|I skip to the park.',
    'plant|The plant needs water.', 'ant|The ant is tiny.', 'slip|Do not slip on the ice.', 'trip|We took a trip.', 'grin|She has a big grin.',
  ],
  digraph: [
    'ship|A ship sails on the sea.', 'fish|The fish swims fast.', 'chick|The chick is yellow.', 'shell|I found a shell on the beach.', 'duck|The duck says quack.',
    'sock|I lost my sock.', 'rock|I sit on a big rock.', 'ring|She has a gold ring.', 'king|The king has a crown.', 'wing|A bird has a wing.',
    'moth|A moth flies to the light.', 'chip|I ate a chip.', 'lunch|We eat lunch at noon.', 'bath|I take a bath.', 'math|I like math.',
    'shop|We shop for bagels.', 'dish|Put it in the dish.', 'path|Walk on the path.', 'lock|Lock the door.', 'song|We sing a song.',
    'clock|The clock says tick tock.', 'chin|I bump my chin.', 'wish|Make a wish!', 'thin|The book is thin.', 'much|Thank you so much.',
  ],
  silente: [
    'cake|We eat cake at the party.', 'kite|I fly my kite up high.', 'bike|I ride my bike.', 'bone|The dog has a bone.', 'cube|An ice cube is cold.',
    'rope|Hold on to the rope.', 'cone|I like an ice cream cone.', 'home|I go home after school.', 'smile|You have a nice smile.', 'slide|I go down the slide.',
    'grape|A grape is a fruit.', 'flute|She plays the flute.', 'plate|Put food on the plate.', 'skate|I skate on the ice.', 'lake|The lake is blue.',
    'stone|I found a smooth stone.', 'snake|The snake is long.', 'plane|The plane flies fast.', 'tape|Use tape to fix it.', 'ride|We ride the train.',
    'wave|Wave hello!', 'whale|A whale is very big.', 'rose|A rose is red.', 'globe|The globe shows the world.', 'mule|A mule can pull a cart.', 'hope|I hope it snows.',
  ],
  twosyl: [
    'sunset|The sunset is pink.', 'rabbit|My rabbit likes carrots.', 'kitten|The kitten is soft.', 'picnic|We have a picnic in the park.', 'muffin|I ate a muffin.',
    'napkin|Use a napkin.', 'basket|The eggs are in a basket.', 'rocket|The rocket goes up.', 'button|Push the button.', 'magnet|A magnet sticks to metal.',
    'pumpkin|The pumpkin is orange.', 'cupcake|I want a cupcake.', 'popcorn|We eat popcorn.', 'sandbox|I dig in the sandbox.', 'lunchbox|My lunchbox is red.',
    'hotdog|I ate a hotdog at Coney Island.', 'ticket|Show your ticket.', 'robot|The robot can walk.', 'goblin|The goblin is just pretend.', 'insect|An ant is an insect.',
    'mitten|My mitten keeps me warm.', 'fossil|A fossil is very old.', 'pocket|It is in my pocket.', 'cobweb|A cobweb is in the corner.', 'tablet|I read on the tablet.',
  ],
  sight: [
    'the|The bird is gray.', 'said|Mazel said hello.', 'was|It was a good day.', 'you|I like you.', 'are|We are friends.', 'have|I have a bead.',
    'they|They are at school.', 'what|What is that?', 'where|Where is the chain?', 'come|Come with me.', 'here|The clue is here.', 'look|Look at the map!',
    'one|I have one cat.', 'two|I see two birds.', 'my|This is my bag.', 'there|The nest is there.', 'of|A box of beads.', 'to|We go to the museum.',
  ],
};
const TIER_ORDER = ['cvc', 'blend', 'digraph', 'silente', 'twosyl'];
const WORDS = {};
for (const [tier, list] of Object.entries(WORD_TIERS)) for (const s of list) { const [w, sent] = s.split('|'); WORDS[w] = { word: w, sentence: sent, tier }; }
const sentenceFor = w => (WORDS[w] && WORDS[w].sentence) || '';
const tierWords = (tier, filter) => Object.values(WORDS).filter(w => w.tier === tier && (!filter || filter(w.word))).map(w => w.word);

/* Words that belong to each place (still from the bank above). */
const THEME_WORDS = {
  woods: ['log', 'fox', 'frog', 'nest', 'plant', 'bug', 'moth', 'web', 'tent'],
  beach: ['fish', 'crab', 'whale', 'shell', 'swim', 'duck', 'ship', 'wave', 'net'],
  marsh: ['frog', 'mud', 'log', 'duck', 'bug', 'net', 'plum', 'pond', 'moth'],
  frost: ['skate', 'spin', 'sled', 'mitten', 'cube', 'slide', 'step', 'skip'],
  ruins: ['globe', 'stone', 'bone', 'fossil', 'crown', 'king', 'ring', 'rock'],
  tower: ['star', 'lamp', 'moon', 'clock', 'ship', 'stone', 'home', 'wave'],
};

/* ---------- Adaptive engine ----------
   Each skill has a level. 3 first-try rights in a row → up a level. 2 first-try misses in a row → down (quietly).
   Missed items come back 2–4 questions later. */
const SKILL_MAX = { grid: 4, skipcount: 6, spell: 5, sounds: 4, read: 4, count10: 5, countdown: 6, place: 4, facts: 5, coins: 3, pattern: 6, syll: 3, magic: 2, type: 3, maze: 4, boulder: 3, beams: 3, lineup: 6, square: 4, bells: 4, missing: 4, matrix: 4, petpath: 3, scales: 4, oddone: 3 };
const SKILL_NAMES = { grid: 'Who Has What? (logic grids)', skipcount: 'Skip counting (2s, 3s, 4s, 5s and up)', spell: 'Spelling', sounds: 'Letter sounds', read: 'Reading sentences', count10: 'Counting by 10s', countdown: 'Counting down', place: 'Tens and ones', facts: 'Adding & taking away', coins: 'Coins', pattern: 'Patterns', syll: 'Syllables', magic: 'Magic e', type: 'Typing', maze: 'Mazes', boulder: 'Boulder Push', beams: 'Light Beams', lineup: 'Suspect Lineup (reading clues)', square: 'Picture Square', bells: 'Bell Memory', missing: "What's Missing", matrix: 'Pattern Grid', petpath: 'Pet Path', scales: 'Balance Scales', oddone: 'Odd One Out' };
function skill(id) {
  const s = S.skills[id] || (S.skills[id] = { level: 0, streak: 0, miss: 0, hist: [], n: 0 });
  delete s.retry; // older saves kept this; retries now live in memory only
  return s;
}
/* Missed items to bring back soon. Kept in memory (items hold drawing functions that can't be saved). */
const RETRY = {};
const retryQ = id => RETRY[id] || (RETRY[id] = []);
const Adapt = {
  level(id) { return skill(id).level; },
  /* Returns an item from the retry queue if one is due, else null. */
  due(id) {
    const s = skill(id); s.n++;
    const q = retryQ(id), i = q.findIndex(r => r.due <= s.n);
    return i >= 0 ? q.splice(i, 1)[0].item : null;
  },
  record(id, item, right, key) {
    const s = skill(id);
    s.hist.push(right ? 1 : 0); if (s.hist.length > 20) s.hist.shift();
    const k = `${id}:${key}`;
    S.stats.tries[k] = (S.stats.tries[k] || 0) + 1;
    if (right) {
      S.stats.right[k] = (S.stats.right[k] || 0) + 1;
      s.streak++; s.miss = 0;
      const last5 = s.hist.slice(-5); if (s.streak >= 3 && last5.reduce((a, b) => a + b, 0) >= Math.min(4, last5.length) && s.level < SKILL_MAX[id]) { s.level++; s.streak = 0; return 'up'; }
    } else {
      S.stats.missed[k] = (S.stats.missed[k] || 0) + 1;
      s.streak = 0; s.miss++;
      if (item && !item.isRetry && retryQ(id).length < 5) retryQ(id).push({ item: Object.assign({}, item, { isRetry: true }), due: s.n + rint(2, 4) });
      if (s.miss >= 2 && s.level > 0) { s.level--; s.miss = 0; return 'down'; }
    }
    return null;
  },
  accuracy(id) { const h = skill(id).hist; return h.length ? Math.round(100 * h.reduce((a, b) => a + b, 0) / h.length) : null; },
};

/* Pick a fresh word: avoids repeats within a session list. */
const recentWords = [];
function freshWord(pool) {
  let p = pool.filter(w => !recentWords.includes(w));
  if (!p.length) p = pool;
  const w = pick(p);
  recentWords.push(w); if (recentWords.length > 14) recentWords.shift();
  return w;
}
/* Spelling word for a level, optionally mixed with words from a place. */
/* A word she has missed more than she has gotten right comes back now and then, even on another day. */
function weakWord(level, filter) {
  const out = [];
  for (const k of Object.keys(S.stats.missed)) {
    if (!k.startsWith('spell:')) continue;
    const w = k.slice(6);
    if (WORDS[w] && TIER_ORDER.indexOf(WORDS[w].tier) <= level && (S.stats.missed[k] > (S.stats.right[k] || 0)) && (!filter || filter(w)) && !recentWords.includes(w)) out.push(w);
  }
  return out;
}
function spellWord(level, theme, opts = {}) {
  const weak = Math.random() < 0.3 ? weakWord(level, opts.filter) : [];
  if (weak.length) return freshWord(weak);
  const tier = TIER_ORDER[Math.min(level, TIER_ORDER.length - 1)];
  let pool = tierWords(tier, opts.filter);
  if (theme && THEME_WORDS[theme] && Math.random() < 0.45) {
    const themed = THEME_WORDS[theme].filter(w => WORDS[w] && TIER_ORDER.indexOf(WORDS[w].tier) <= level && (!opts.filter || opts.filter(w)));
    if (themed.length) pool = themed;
  }
  if (!pool.length) pool = tierWords('cvc', opts.filter);
  return freshWord(pool);
}

/* ---------- Letter confusions for decoy tiles ---------- */
const CONFUSE = { b: 'd', d: 'b', p: 'b', m: 'n', n: 'm', e: 'i', i: 'e', a: 'e', o: 'u', u: 'o', c: 'g', k: 'g', s: 'f', t: 'f', g: 'j', h: 'n', w: 'v', v: 'w', l: 'i', r: 'n', f: 't' };
function decoyFor(ch, avoid = '') {
  if (CONFUSE[ch] && !avoid.includes(CONFUSE[ch]) && Math.random() < 0.65) return CONFUSE[ch];
  const vowel = 'aeiou'.includes(ch);
  const pool = (vowel ? 'aeiou' : 'bcdfghjklmnprstvw').split('').filter(c => c !== ch && !avoid.includes(c));
  return pick(pool);
}

/* Split a two-syllable word into its two parts. */
const SYLL = {
  sunset: ['sun', 'set'], rabbit: ['rab', 'bit'], kitten: ['kit', 'ten'], picnic: ['pic', 'nic'], muffin: ['muf', 'fin'], napkin: ['nap', 'kin'],
  basket: ['bas', 'ket'], rocket: ['rock', 'et'], button: ['but', 'ton'], magnet: ['mag', 'net'], pumpkin: ['pump', 'kin'], cupcake: ['cup', 'cake'],
  popcorn: ['pop', 'corn'], sandbox: ['sand', 'box'], lunchbox: ['lunch', 'box'], hotdog: ['hot', 'dog'], ticket: ['tick', 'et'], robot: ['ro', 'bot'],
  goblin: ['gob', 'lin'], insect: ['in', 'sect'], mitten: ['mit', 'ten'], fossil: ['fos', 'sil'], pocket: ['pock', 'et'], cobweb: ['cob', 'web'], tablet: ['tab', 'let'],
};
/* How to say a word part so the voice doesn't misread it ("et" → "E.T."). */
const SYLL_SAY = { ro: 'roe', et: 'it', bas: 'bass', nic: 'nick', ket: 'kit', kin: 'kin', sil: 'sill', fos: 'foss', lin: 'lin', sect: 'sekt', let: 'let', tab: 'tab', gob: 'gob', muf: 'muff', pic: 'pick', bit: 'bit', ton: 'tun', mag: 'mag', but: 'butt', pock: 'pock', rock: 'rock', tick: 'tick' };
const sylSay = p => SYLL_SAY[p] || p;

/* Number to words for speech, 0–120. */
function numWord(n) { return String(n); }
