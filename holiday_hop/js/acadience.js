'use strict';

/*
  Acadience-style practice items (first grade).
  Reading: Letter Names, Letter Sounds, Phonemes (segmenting/blending), Nonsense Words, Decoding, Sight Words, Stories (ORF + retell).
  Math: Number ID, Next Number, Missing Number, Number Patterns (counting by 10s off the decade, up and down), Which Is Bigger,
        Computation, Word Problems, Tens & Ones, Coins, Clocks; plus the existing spelling words.

  Every item: { prompt (spoken), show (short text), card (what the question card draws), choices [{val, kind, label}],
                answer, right (line on success), hint(val, wrongs) → line, hintCard (true after a miss) }
  Each type has its own level (1–4) that climbs after 4 right in a row and drops after 2 misses in a row.
*/

/* ---------- Pictures from the reef game, drawn on canvas ---------- */
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
  else { rr(x - size / 2, y - size / 2, size, size, 10); paint('#eee', 2); }
}

/* ---------- Sounds for speech (letter names say "ess"; sounds say "sss") ---------- */
const PH = {
  a: 'aah', e: 'eh', i: 'ih', o: 'aw', u: 'uh', b: 'buh', c: 'kuh', k: 'kuh', d: 'duh', f: 'fff', g: 'guh', h: 'huh', j: 'juh',
  l: 'lll', m: 'mmm', n: 'nnn', p: 'puh', r: 'rrr', s: 'sss', t: 'tuh', v: 'vvv', w: 'wuh', x: 'ks', y: 'yuh', z: 'zzz',
  sh: 'shhh', ch: 'chuh', th: 'thh', ng: 'ng', wh: 'wuh',
  A: 'ay', E: 'ee', I: 'eye', O: 'oh', U: 'you', oo: 'oo', ar: 'ar', or: 'or', ow: 'ow',
};
/* Split a word into its sounds. Long vowels (silent e, vowel teams) are capital letters. */
function phonemes(word) {
  const out = [];
  const silentE = /^[^aeiou]*[aeiou][^aeiou]e$/.test(word);
  let w = word;
  if (silentE) w = word.slice(0, -1);
  for (let i = 0; i < w.length;) {
    const two = w.slice(i, i + 2);
    const map2 = { sh: 'sh', ch: 'ch', th: 'th', ck: 'k', ng: 'ng', wh: 'wh', ll: 'l', ss: 's', ff: 'f', zz: 'z',
      ai: 'A', ay: 'A', ee: 'E', ea: 'E', oa: 'O', ow: 'O', oo: 'oo', ar: 'ar', or: 'or', ie: 'I', ue: 'U', ui: 'oo' };
    if (map2[two]) { out.push(map2[two]); i += 2; continue; }
    const ch = w[i];
    if (silentE && 'aeiou'.includes(ch)) out.push(ch.toUpperCase());
    else if (ch === 'x') { out.push('k', 's'); }
    else out.push(ch);
    i++;
  }
  return out;
}
const sayPh = p => PH[p] || p;
const segSpeech = word => phonemes(word).map(sayPh).join('... ');
/* Words whose sound-splitting we trust (no irregular sight words). */
const IRREGULAR = new Set(['come', 'some', 'give', 'have', 'live', 'done', 'one', 'once', 'gone', 'love', 'move', 'were', 'where', 'there',
  'said', 'they', 'was', 'what', 'who', 'of', 'two', 'does', 'the', 'want', 'walk', 'know', 'friend', 'again', 'any', 'many', 'very', 'your', 'put', 'could', 'would', 'every', 'after', 'how', 'to', 'do', 'bow', 'glue', 'tutu']);
const clean = w => /^[a-z]+$/.test(w) && !IRREGULAR.has(w) && !/(igh|ough|tion|ew|aw|ou|oi|oy|ur|ir|er|y$)/.test(w);

/* Word ladder for reading levels 1–4: CVC → blends/digraphs → silent e → vowel teams / two syllables. */
function readingWords(level, { pics = false } = {}) {
  const lv = w => {
    const p = phonemes(w);
    const longV = p.some(x => /^[AEIOU]$|^oo$/.test(x));
    if (w.length >= 6 || /(ow|oa|ai|ee|oo)/.test(w)) return 4;
    if (longV) return 3;
    if (w.length >= 4 || /(sh|ch|th|ck)/.test(w)) return 2;
    return 1;
  };
  let pool = (pics ? Object.keys(PICS) : WORDS.filter(x => x.level !== 6).map(x => x.word)).filter(clean);
  pool = pool.filter(w => lv(w) === clamp(level, 1, 4));
  if (pics) pool = pool.filter(hasPic);
  return [...new Set(pool)];
}
const SIGHT = {
  1: ['the', 'and', 'is', 'it', 'in', 'on', 'up', 'can', 'see', 'we', 'me', 'at', 'go', 'my', 'to', 'a', 'I', 'you'],
  2: ['said', 'they', 'was', 'have', 'come', 'some', 'what', 'who', 'of', 'one', 'two', 'do', 'here', 'are', 'look', 'like'],
  3: ['were', 'where', 'there', 'could', 'would', 'want', 'does', 'friend', 'many', 'again', 'any', 'very', 'your', 'every', 'once', 'know'],
};

/* ---------- Tiny helpers ---------- */
function uniqChoices(answer, pool, n) {
  const out = [answer];
  for (const v of shuffle(pool)) { if (out.length >= n) break; if (!out.some(o => String(o) === String(v))) out.push(v); }
  return shuffle(out);
}
const asChoices = (vals, kind) => vals.map(v => ({ val: v, kind }));
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const CONFUSE_L = { b: ['d', 'p', 'q'], d: ['b', 'p', 'q'], p: ['q', 'b', 'd'], q: ['p', 'g'], m: ['n', 'w'], n: ['m', 'u', 'h'], u: ['n', 'v'],
  i: ['l', 'j'], l: ['i', 't'], e: ['a', 'c', 'o'], a: ['o', 'e', 'd'], o: ['a', 'c'], c: ['o', 'e'], g: ['q', 'j', 'y'], w: ['m', 'v'], v: ['w', 'u', 'y'],
  t: ['f', 'l'], f: ['t'], h: ['n', 'k'], k: ['h', 'x'], s: ['z', 'c'], z: ['s'], r: ['n'], y: ['v', 'g'], j: ['i', 'g'], x: ['k'] };
function nearLetters(ch, n) { return uniqChoices(ch, [...(CONFUSE_L[ch] || []), ...shuffle(LETTERS).slice(0, 6)], n); }
function sayNum(n) { return String(n); }
function seqSpeech(nums) { return nums.map(n => n === null ? 'blank' : sayNum(n)).join(', '); }

/* Common mistakes for a missing number (rounding to the decade, off by one, off by ten). */
function numberLures(ans, step = 1) {
  const r = [ans + 1, ans - 1, ans + 10, ans - 10, Math.round(ans / 10) * 10, Math.floor(ans / 10) * 10, ans + step, ans - step,
    Number(String(ans).split('').reverse().join(''))];
  return r.filter(v => v >= 0 && v <= Math.max(100, ans) && v !== ans);
}

/* ---------- Stories (decodable, three levels) ---------- */
const STORIES = {
  1: [
    { text: 'The cat sat on a mat. The cat is fat.', q: 'Where did the cat sit?', a: 'mat', c: ['mat', 'bed', 'box'] },
    { text: 'Sam has a red hat. The hat is big.', q: 'What color is the hat?', a: 'red', c: ['red', 'tan', 'pink'] },
    { text: 'A pig is in the mud. The pig can dig.', q: 'Where is the pig?', a: 'mud', c: ['mud', 'tub', 'van'] },
    { text: 'I can see the sun. It is hot.', q: 'What is hot?', a: 'sun', c: ['sun', 'cup', 'dog'] },
    { text: 'Dad got a bug in a jar. The bug is red.', q: 'What did Dad get?', a: 'bug', c: ['bug', 'hen', 'map'] },
    { text: 'The dog ran to the van. The dog sat in the van.', q: 'Where did the dog sit?', a: 'van', c: ['van', 'bus', 'bed'] },
  ],
  2: [
    { text: 'Mom and I went to the park. We got a big pumpkin. It was fun!', q: 'What did they get?', a: 'pumpkin', c: ['pumpkin', 'kite', 'drum'] },
    { text: 'Dad made latkes in a pan. They were hot. I had six!', q: 'How many did I have?', a: 'six', c: ['six', 'ten', 'one'] },
    { text: 'The frog sat on a log. It jumped in the pond with a splash.', q: 'Where did the frog jump?', a: 'pond', c: ['pond', 'tent', 'bed'] },
    { text: 'We lit the candles. The menorah had five lights. It was so pretty.', q: 'How many lights?', a: 'five', c: ['five', 'two', 'nine'] },
    { text: 'Sadelle has a black cat. The cat sleeps on her bed at night.', q: 'Where does the cat sleep?', a: 'bed', c: ['bed', 'rug', 'box'] },
    { text: 'The duck can swim fast. It swims to the rock to rest.', q: 'Where does the duck rest?', a: 'rock', c: ['rock', 'ship', 'sock'] },
  ],
  3: [
    { text: 'On Thanksgiving, Grandma made a pie. We sat at the table with our family. Then we all said thank you.', q: 'Who made the pie?', a: 'Grandma', c: ['Grandma', 'Dad', 'Mazel'] },
    { text: 'The bodega cat sleeps by the window. When the sun comes up, she wakes and asks for milk.', q: 'What does the cat want?', a: 'milk', c: ['milk', 'cake', 'jam'] },
    { text: 'It snowed on Hanukkah. We made a snowman and gave him a blue hat. Then we went inside to spin the dreidel.', q: 'What color was the hat?', a: 'blue', c: ['blue', 'red', 'green'] },
    { text: 'On Halloween, Sadelle wore a bat cape. She went to five houses and got candy at each one.', q: 'What did Sadelle wear?', a: 'cape', c: ['cape', 'crown', 'boots'] },
    { text: 'The subway train was late. We waited and read a book. When the train came, we got on and found a seat.', q: 'What did they do while they waited?', a: 'read', c: ['read', 'ran', 'slept'] },
    { text: 'A little bird made a nest in the tree. She put three eggs in it. Soon the eggs will hatch.', q: 'How many eggs?', a: 'three', c: ['three', 'two', 'four'] },
  ],
};

/* ---------- Item generators ---------- */
const GEN = {
  letterName(l) {
    const t = pick(l <= 1 ? 'abcdefghikmnoprstuw'.split('') : LETTERS);
    if (l >= 3 && Math.random() < 0.6) {
      return { prompt: `This is a big ${lname(t)}. Find the little ${lname(t)}!`, show: `Find the little letter that matches!`,
        card: { kind: 'letter', ch: t.toUpperCase() }, choices: asChoices(nearLetters(t, 4), 'letter'), answer: t,
        right: `Yes! Big ${lname(t)}, little ${lname(t)}.`, hint: v => `That's ${lname(v)}. Find ${lname(t)}.` };
    }
    return { prompt: `Find the letter ${lname(t)}!`, show: 'Find the letter you hear!', card: { kind: 'listen' },
      choices: asChoices(nearLetters(t, l <= 1 ? 3 : 4), 'letter'), answer: t,
      right: `Yes! That's ${lname(t)}.`, hint: v => `That one is ${lname(v)}. Find ${lname(t)}!` };
  },

  letterSound(l) {
    const mode = l <= 1 ? 'first' : l === 2 ? pick(['first', 'last']) : pick(['first', 'last', 'middle']);
    const pool = readingWords(Math.min(l, 2), { pics: true }).concat(readingWords(1, { pics: true }));
    const ok = pool.filter(w => { const p = phonemes(w); return p.length >= 3 && p[0].length === 1 && p[p.length - 1].length === 1 && /[aeiou]/.test(p[1] + p[2]); });
    const word = pick(ok.length ? ok : ['cat', 'dog', 'sun']);
    const p = phonemes(word);
    const target = mode === 'first' ? p[0] : mode === 'last' ? p[p.length - 1] : p.find(x => 'aeiou'.includes(x)) || p[1];
    const where = { first: 'beginning', last: 'end', middle: 'middle' }[mode];
    const pool2 = mode === 'middle' ? 'aeiou'.split('') : 'bcdfghjklmnprstvwz'.split('');
    return { prompt: `${word}. What letter do you hear at the ${where} of ${word}?`, show: `${word}: the ${where} sound`,
      card: { kind: 'pic', word }, choices: asChoices(uniqChoices(target, [...(CONFUSE_L[target] || []), ...pool2], l <= 1 ? 3 : 4), 'letter'), answer: target,
      right: `Yes! ${word} ${mode === 'first' ? 'starts' : mode === 'last' ? 'ends' : 'has'} ${sayPh(target)}, ${lname(target)}!`,
      hint: () => `Say it slowly: ${segSpeech(word)}. Which letter says ${sayPh(target)}?` };
  },

  phonemes(l) {
    const pool = readingWords(clamp(l, 1, 3)).filter(w => !w.includes('x') && !w.includes('qu'));
    const word = pick(pool.length ? pool : ['map', 'ship', 'frog']);
    const n = phonemes(word).length;
    return { prompt: `How many sounds are in ${word}? Say it slowly. ${word}.`, show: `How many sounds in "${word}"?`,
      card: hasPic(word) ? { kind: 'pic', word } : { kind: 'listen' }, choices: asChoices(uniqChoices(n, [2, 3, 4, 5].filter(x => x !== n), 3).sort((a, b) => a - b), 'num'), answer: n,
      right: `Yes! ${segSpeech(word)}. ${NUM_WORDS[n]} sounds in ${word}!`, hint: () => `Listen: ${segSpeech(word)}. Count each sound!` };
  },

  blend(l) {
    const words = readingWords(clamp(l, 1, 4), { pics: l <= 2 });
    const word = pick(words.length ? words : ['cat', 'sun', 'pig']);
    const others = shuffle(readingWords(clamp(l, 1, 4), { pics: l <= 2 }).filter(w => w !== word)).slice(0, 2);
    const usePics = l <= 2 && hasPic(word) && others.every(hasPic);
    return { prompt: `Listen: ${segSpeech(word)}. What word is that?`, show: 'Put the sounds together!', card: { kind: 'listen' },
      choices: shuffle([word, ...others]).map(v => ({ val: v, kind: usePics ? 'pic' : 'word' })), answer: word,
      right: `${segSpeech(word)}... ${word}!`, hint: () => `Say the sounds faster and faster: ${segSpeech(word)}.` };
  },

  nonsense(l) {
    const make = () => {
      const C = 'bdfghjklmnprstvz'.split(''), V = 'aeiou'.split(''), F = 'bdfgklmnpstx'.split('');
      if (l <= 2) return pick(C) + pick(V) + pick(F);
      if (l === 3) return pick(['bl', 'fl', 'gr', 'st', 'sl', 'tr', 'sn', 'cr', 'sh', 'ch']) + pick(V) + pick(F);
      return pick(C) + pick(V) + pick(['mp', 'nd', 'st', 'sk', 'nt', 'lt', 'ft']);
    };
    const real = new Set(WORDS.map(w => w.word).concat(['bad', 'bum', 'fat', 'gas', 'pot', 'sex', 'hot', 'dum', 'kil', 'dam', 'sux', 'fux', 'fuk', 'dik', 'pis', 'tit', 'pup', 'gun', 'nut', 'hut']));
    let word = make();
    for (let i = 0; i < 20 && real.has(word); i++) word = make();
    const vary = w => {
      const k = rint(0, w.length - 1), ch = w[k];
      const rep = 'aeiou'.includes(ch) ? pick('aeiou'.split('').filter(v => v !== ch)) : pick((CONFUSE_L[ch] || 'bdpmn'.split('')).filter(v => v !== ch && !'qxy'.includes(v)).concat(['b', 'd', 'p', 'm', 'n'].filter(v => v !== ch)));
      return w.slice(0, k) + rep + w.slice(k + 1);
    };
    const choices = [word];
    for (let i = 0; i < 20 && choices.length < (l <= 1 ? 3 : 4); i++) { const v = vary(word); if (!choices.includes(v)) choices.push(v); }
    const spoken = l <= 1 ? `${segSpeech(word)}. ${word}` : word;
    return { prompt: `Here is a silly made-up word: ${spoken}. Find ${word}!`, show: 'Find the silly word you hear!', card: { kind: 'listen' },
      choices: asChoices(shuffle(choices), 'word'), answer: word,
      right: `Yes! ${segSpeech(word)}. ${word}!`, hint: v => `That one says ${segSpeech(v)}. Listen: ${segSpeech(word)}.` };
  },

  decode(l) {
    const words = readingWords(clamp(l, 1, 4), { pics: true });
    const word = pick(words.length ? words : ['cat', 'pig', 'sun']);
    const others = shuffle(Object.keys(PICS).filter(w => w !== word && hasPic(w) && w[0] === word[0])).concat(shuffle(Object.keys(PICS)).filter(w => w !== word)).slice(0, 2);
    return { prompt: 'Read this word. Which picture is it?', show: 'Read the word. Find its picture!', card: { kind: 'word', text: word },
      choices: shuffle([word, ...others]).map(v => ({ val: v, kind: 'pic' })), answer: word,
      right: `${word}! Great reading!`, hint: () => `Sound it out: ${segSpeech(word)}.` };
  },

  sight(l) {
    const list = SIGHT[clamp(l, 1, 3)];
    const word = pick(list);
    return { prompt: `Find the word ${word}.`, show: 'Find the word you hear!', card: { kind: 'listen' },
      choices: asChoices(uniqChoices(word, list, l <= 1 ? 3 : 4), 'word'), answer: word,
      right: `Yes! ${word}. ${spellOut(word.toLowerCase())}.`, hint: v => `That word is ${v}. Find ${word}.` };
  },

  story(l) {
    const s = pick(STORIES[clamp(l, 1, 3)]);
    return { story: true, prompt: s.q, show: s.q, card: { kind: 'story', text: s.text }, words: s.text.split(' ').length,
      choices: asChoices(shuffle(s.c), 'word'), answer: s.a, text: s.text,
      right: `Yes! ${s.a}! You understood the story.`, hint: () => `Let's read it again: ${s.text} ${s.q}` };
  },

  /* ----- Math ----- */
  numberId(l) {
    const max = [20, 20, 50, 100][clamp(l, 1, 4) - 1];
    const n = rint(l <= 1 ? 0 : 10, max);
    return { prompt: `Find the number ${sayNum(n)}!`, show: 'Find the number you hear!', card: { kind: 'listen' },
      choices: asChoices(uniqChoices(n, numberLures(n), l <= 1 ? 3 : 4), 'num'), answer: n,
      right: `Yes! ${sayNum(n)}!`, hint: v => `That is ${sayNum(v)}. Find ${sayNum(n)}.` };
  },

  nextNum(l) {
    const max = [15, 30, 60, 99][clamp(l, 1, 4) - 1];
    let n = rint(1, max);
    if (l >= 2 && Math.random() < 0.5) n = rint(1, Math.floor(max / 10)) * 10 - 1; // cross a decade: 29 → 30
    const before = l >= 2 && Math.random() < 0.35 && n > 1;
    const ans = before ? n - 1 : n + 1;
    return { prompt: `What number comes ${before ? 'before' : 'after'} ${sayNum(n)}?`, show: `What comes ${before ? 'before' : 'after'} ${n}?`,
      card: { kind: 'seq', nums: before ? [null, n] : [n, null] }, choices: asChoices(uniqChoices(ans, numberLures(ans).concat([n]), 3), 'num'), answer: ans,
      right: before ? `${sayNum(ans)}, ${sayNum(n)}!` : `${sayNum(n)}, ${sayNum(ans)}!`,
      hint: () => before ? `Count down: ${n + 1}, ${n}... what's next?` : `Count with me: ${Math.max(0, n - 2)}, ${Math.max(0, n - 1)}, ${n}... what's next?` };
  },

  missingNum(l) {
    const max = [18, 40, 70, 99][clamp(l, 1, 4) - 1];
    let s = rint(0, max - 2);
    if (l >= 2 && Math.random() < 0.5) s = rint(1, Math.floor(max / 10)) * 10 - 2;
    const nums = [s, s + 1, s + 2];
    const gap = l <= 1 ? 1 : rint(0, 2);
    const ans = nums[gap]; nums[gap] = null;
    return { prompt: `What number is missing? ${seqSpeech(nums)}.`, show: 'What number is missing?', card: { kind: 'seq', nums },
      choices: asChoices(uniqChoices(ans, numberLures(ans), 3), 'num'), answer: ans,
      right: `${s}, ${s + 1}, ${s + 2}!`, hint: () => `Count by ones: ${s}, ${s + 1}, ${s + 2}. Which one is hiding?` };
  },

  /* Counting by tens (and more) when the numbers don't end in zero: 9, 19, 29, __, 49 – up and down. */
  pattern(l) {
    let step = 10, dir = 1, start;
    switch (clamp(l, 1, 6)) {
      case 1: start = pick([0, 10, 20]); break;
      case 2: dir = -1; start = pick([90, 80, 70, 100]); break;
      case 3: start = rint(1, 9) + pick([0, 0, 10, 20]); break;
      case 4: dir = -1; start = rint(5, 9) * 10 + rint(1, 9); break;
      case 5: step = 1; dir = pick([1, -1]); start = dir > 0 ? rint(2, 8) * 10 - rint(2, 3) : rint(2, 8) * 10 + rint(1, 2); break;
      default: step = pick([2, 5, 10]); dir = pick([1, -1]); start = step === 10 ? rint(51, 99) : step * rint(dir > 0 ? 0 : 6, dir > 0 ? 4 : 10);
    }
    const nums = [0, 1, 2, 3, 4].map(i => start + dir * step * i);
    if (nums.some(n => n < 0 || n > 120)) return GEN.pattern(Math.max(1, l - 1));
    const gap = l <= 2 ? 3 : rint(1, 4);
    const ans = nums[gap];
    const shown = nums.map((n, i) => i === gap ? null : n);
    const by = step === 1 ? 'ones' : step === 2 ? 'twos' : step === 5 ? 'fives' : 'tens';
    const ones = start % 10;
    const hint = () => step === 10 && ones !== 0
      ? `Look at the last digit. It stays ${ones} every time! The tens go ${dir > 0 ? 'up' : 'down'} one ten each jump. ${seqSpeech(shown)}.`
      : step === 10 ? `Count ${dir > 0 ? 'up' : 'down'} by tens: ${nums.join(', ')}... which one is hiding?`
        : `Count ${dir > 0 ? 'up' : 'down'} by ${by}. ${seqSpeech(shown)}.`;
    return { prompt: `What number is missing? ${seqSpeech(shown)}.`, show: `Counting by ${by}! What's missing?`,
      card: { kind: 'seq', nums: shown, step: step * dir, pattern: true }, choices: asChoices(uniqChoices(ans, numberLures(ans, step), 4).sort((a, b) => a - b), 'num'), answer: ans,
      right: `${nums.join(', ')}! Counting by ${by}${dir < 0 ? ', going down' : ''}!`, hint };
  },

  bigger(l) {
    const max = [10, 20, 100, 100][clamp(l, 1, 4) - 1];
    let a = rint(0, max), b = rint(0, max);
    if (l >= 3 && Math.random() < 0.5) { const t = rint(1, 9), o = rint(0, 9); a = t * 10 + o; b = o * 10 + t; if (o === 0) b += 1; }
    while (a === b) b = rint(0, max);
    const smaller = l >= 2 && Math.random() < 0.3;
    const ans = smaller ? Math.min(a, b) : Math.max(a, b);
    return { prompt: `Which number is ${smaller ? 'smaller' : 'bigger'}? ${a} or ${b}?`, show: `Which is ${smaller ? 'smaller' : 'bigger'}?`, card: { kind: 'listen' },
      choices: shuffle([a, b]).map(v => ({ val: v, kind: max <= 10 ? 'numdots' : 'num' })), answer: ans,
      right: `Yes! ${ans} is ${smaller ? 'smaller' : 'bigger'}!`,
      hint: () => max > 20 ? 'Look at the tens first! More tens means bigger.' : `Count up: which one do you say later? That one is bigger.` };
  },

  compute(l) {
    const q = Adaptive.next('math');
    return { adaptive: q, prompt: MathGen.speech(q), show: q.parts.join(' '), card: { kind: 'problem', q },
      choices: asChoices(MathGen.choices(q, 3), 'num'), answer: q.answer, right: `${MathGen.answerSpeech(q)}!`,
      hint: () => `${MathGen.speech(q)} Count the dots!` };
  },

  wordProblem(l) {
    const things = [['star', 'stars'], ['gift', 'gifts'], ['cake', 'cakes'], ['kite', 'kites'], ['sock', 'socks'], ['hat', 'hats'], ['plum', 'plums'], ['drum', 'drums']];
    const [one, many] = pick(things);
    const name = pick(['Sadelle', 'Mazel', 'Grandma', 'Dad', 'Mom']);
    const she = { Mazel: 'She', Dad: 'He' }[name] || 'She';
    const max = [5, 10, 15, 20][clamp(l, 1, 4) - 1];
    const sub = l >= 2 && Math.random() < 0.45;
    let a, b, ans, text;
    if (sub) { a = rint(3, max); b = rint(1, a - 1); ans = a - b; text = `${name} had ${a} ${many}. ${she} gave ${b} away. How many ${many} are left?`; }
    else { a = rint(1, max - 1); b = rint(1, Math.max(1, Math.min(max - a, 9))); ans = a + b; text = `${name} has ${a} ${a === 1 ? one : many}. ${she} gets ${b} more. How many ${many} now?`; }
    return { prompt: text, show: text, card: { kind: 'story', text, icons: { word: one, a, b, sub } },
      choices: asChoices(uniqChoices(ans, [ans + 1, ans - 1, a, b, a + b, Math.abs(a - b)].filter(v => v >= 0 && v !== ans), 3), 'num'), answer: ans,
      right: `${a} ${sub ? 'take away' : 'plus'} ${b} is ${ans}!`, hint: () => `${text} Count the pictures!` };
  },

  placeValue(l) {
    const tens = l <= 1 ? 1 : rint(l <= 2 ? 2 : 3, l <= 2 ? 5 : 9), ones = rint(0, 9);
    const n = tens * 10 + ones;
    return { prompt: 'How many? Count the tens, then the ones.', show: 'Tens and ones: how many?', card: { kind: 'blocks', tens, ones },
      choices: asChoices(uniqChoices(n, [ones * 10 + tens, n + 10, n - 10, n + 1, tens + ones].filter(v => v >= 0 && v !== n), 3), 'num'), answer: n,
      right: `${tens} tens and ${ones} ones make ${n}!`, hint: () => `Each long stick is ten. Count by tens: ${Array.from({ length: tens }, (_, i) => (i + 1) * 10).join(', ')}. Then count on the little ones.` };
  },

  coins(l) {
    const coins = [];
    if (l <= 1) { for (let i = rint(2, 9); i > 0; i--) coins.push(1); }
    else if (l === 2) { for (let i = rint(1, 4); i > 0; i--) coins.push(10); for (let i = rint(0, 5); i > 0; i--) coins.push(1); }
    else { for (let i = rint(0, 3); i > 0; i--) coins.push(10); for (let i = rint(1, 3); i > 0; i--) coins.push(5); for (let i = rint(0, 4); i > 0; i--) coins.push(1); }
    const n = coins.reduce((a, b) => a + b, 0);
    return { prompt: 'How many cents are there?', show: 'How many cents?', card: { kind: 'coins', coins },
      choices: asChoices(uniqChoices(n, [coins.length, n + 1, n - 1, n + 5, n - 5, n + 10].filter(v => v > 0 && v !== n), 3), 'num'), answer: n,
      right: `${n} cents!`, hint: () => 'A dime is ten cents. A nickel is five cents. A penny is one cent. Start with the big ones!' };
  },

  clock(l) {
    const h = rint(1, 12), half = l >= 2 && Math.random() < 0.5;
    const t = `${h}:${half ? '30' : '00'}`;
    const lures = [`${h % 12 + 1}:${half ? '30' : '00'}`, `${h}:${half ? '00' : '30'}`, `${(h + 10) % 12 + 1}:00`];
    return { prompt: 'What time is it?', show: 'What time is it?', card: { kind: 'clock', h, m: half ? 30 : 0 },
      choices: asChoices(uniqChoices(t, lures, 3), 'time'), answer: t,
      right: half ? `Half past ${h}! ${h} thirty.` : `${h} o'clock!`, hint: () => half ? 'The long hand points down to the 6. That means thirty!' : "The long hand is on the 12, so it's o'clock. Look where the short hand points." };
  },

  spell(l) {
    const quiz = makeQuiz('spell');
    return { adaptive: quiz.q, prompt: quiz.prompt, show: quiz.show, card: { kind: 'missing', quiz },
      choices: asChoices(quiz.vals, 'letter'), answer: quiz.answer, right: quiz.right, hint: v => quiz.wrong(v) };
  },
};

const AC_INFO = {
  letterName: ['reading', 'Letter Names (LNF)'], letterSound: ['reading', 'Letter Sounds'], phonemes: ['reading', 'Phoneme Segmentation (PSF)'],
  blend: ['reading', 'Blending sounds'], nonsense: ['reading', 'Nonsense Words (NWF)'], decode: ['reading', 'Reading words'],
  sight: ['reading', 'Sight words'], story: ['reading', 'Stories & retell (ORF)'], spell: ['reading', 'Spelling'],
  numberId: ['math', 'Number ID (NIF)'], nextNum: ['math', 'Next Number (NNF)'], missingNum: ['math', 'Missing Number (MNF)'],
  pattern: ['math', 'Counting patterns (by 10s off the decade)'], bigger: ['math', 'Which is bigger (QD)'], compute: ['math', 'Computation'],
  wordProblem: ['math', 'Word problems (C&A)'], placeValue: ['math', 'Tens & ones (C&A)'], coins: ['math', 'Coins (C&A)'], clock: ['math', 'Clocks (C&A)'],
};
/* Extra practice weight. Counting patterns get the most, per her teacher. */
const AC_WEIGHT = { pattern: 3, missingNum: 2, nextNum: 1.5, nonsense: 2, phonemes: 1.5, blend: 1.5, decode: 1.5, letterSound: 1.5, story: 1 };
const READING_TYPES = ['letterName', 'letterSound', 'phonemes', 'blend', 'nonsense', 'decode', 'sight', 'spell'];
const MATH_TYPES = ['numberId', 'nextNum', 'missingNum', 'pattern', 'bigger', 'compute', 'wordProblem', 'placeValue', 'coins', 'clock'];
const MAX_AC_LEVEL = { pattern: 6 };

const Ac = {
  st(type) {
    S.ac = S.ac || {};
    return S.ac[type] || (S.ac[type] = { level: 1, streak: 0, miss: 0, n: 0, right: 0, ms: [] });
  },
  make(type) {
    const st = this.st(type);
    const it = GEN[type](st.level);
    it.type = type; it.level = st.level; it.t0 = performance.now();
    return it;
  },
  /* Pick a type from a list, favoring her weak spots and the weighted ones. */
  pickType(types) {
    const ws = types.map(t => {
      const st = this.st(t);
      const acc = st.n ? st.right / st.n : 0.6;
      return (AC_WEIGHT[t] || 1) * (1.4 - acc) * (st.n < 3 ? 1.3 : 1);
    });
    let r = Math.random() * ws.reduce((a, b) => a + b, 0);
    for (let i = 0; i < types.length; i++) { r -= ws[i]; if (r <= 0) return types[i]; }
    return types[types.length - 1];
  },
  record(it, ok) {
    const st = this.st(it.type);
    st.n++; if (ok) st.right++;
    st.ms.push(Math.round(performance.now() - it.t0)); if (st.ms.length > 20) st.ms.shift();
    if (ok) { st.streak++; st.miss = 0; if (st.streak >= 4 && st.level < (MAX_AC_LEVEL[it.type] || 4)) { st.level++; st.streak = 0; } }
    else { st.miss++; st.streak = 0; if (st.miss >= 2 && st.level > 1) { st.level--; st.miss = 0; } }
    if (it.adaptive) Adaptive.record(it.adaptive, ok);
    const day = new Date().toISOString().slice(0, 10);
    S.acDays = S.acDays || {};
    const d = S.acDays[day] || (S.acDays[day] = {});
    const k = d[it.type] || (d[it.type] = [0, 0]); k[1]++; if (ok) k[0]++;
    saveState();
  },
};

/* ---------- Drawing the question card and answer stones ---------- */
function drawChoice(c, x, y, size = 1) {
  const s = size;
  switch (c.kind) {
    case 'letter': text(String(c.val), x, y - 2 * s, { size: 40 * s, font: 'Andika', color: 'aeiou'.includes(c.val) ? '#e8384f' : '#2f6fe0', lw: 6 }); break;
    case 'word': {
      const len = String(c.val).length;
      text(String(c.val), x, y, { size: (len > 6 ? 20 : len > 4 ? 24 : 30) * s, font: 'Andika', color: '#2f2050', lw: 0, stroke: null });
      break;
    }
    case 'pic': drawPic(c.val, x, y, 54 * s); break;
    case 'numdots': text(String(c.val), x, y - 8 * s, { size: 30 * s, color: '#fff', lw: 6 }); dots(c.val, x, y + 16 * s, 3.2 * s, '#ffd23f', 8 * s); break;
    case 'time': text(String(c.val), x, y, { size: 28 * s, color: '#fff', lw: 6 }); break;
    default: text(String(c.val), x, y, { size: 34 * s, color: '#fff', lw: 6 });
  }
}

function drawDigits(n, x, y, size) {
  // tens digit blue, ones digit red, so patterns like 9, 19, 29 stand out
  const s = String(n);
  if (s.length === 1) { text(s, x, y, { size, color: '#ff8a9a', lw: 6 }); return; }
  ctx.font = `700 ${size}px Fredoka, sans-serif`;
  const w = ctx.measureText(s).width;
  let cx = x - w / 2;
  s.split('').forEach((d, i) => {
    const dw = ctx.measureText(d).width;
    text(d, cx + dw / 2, y, { size, color: i === s.length - 1 ? '#ff8a9a' : '#8ec5ff', lw: 6 });
    cx += dw;
  });
}

function drawClock(x, y, r, h, m) {
  circle(x, y, r); paint('#fffaf0', 4);
  for (let i = 1; i <= 12; i++) { const a = i / 12 * TAU - Math.PI / 2; text(String(i), x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78, { size: r * 0.24, color: OUT, stroke: null }); }
  const ha = ((h % 12) + m / 60) / 12 * TAU - Math.PI / 2, ma = m / 60 * TAU - Math.PI / 2;
  ctx.lineCap = 'round'; ctx.strokeStyle = OUT;
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ha) * r * 0.5, y + Math.sin(ha) * r * 0.5); ctx.stroke();
  ctx.lineWidth = 4; ctx.strokeStyle = '#2f6fe0'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ma) * r * 0.8, y + Math.sin(ma) * r * 0.8); ctx.stroke();
  circle(x, y, 4); paint(OUT, 0);
}

function drawCoin(x, y, v) {
  const r = v === 10 ? 15 : v === 5 ? 19 : 17;
  circle(x, y, r); paint(v === 1 ? '#d08a4a' : '#d8d8e4', 3);
  text(v === 1 ? '1¢' : v === 5 ? '5¢' : '10¢', x, y + 1, { size: r * 0.8, color: OUT, stroke: null });
}

function wrapLines(str, maxW, size, font = 'Andika') {
  ctx.font = `700 ${size}px ${font}, sans-serif`;
  const words = str.split(' '), lines = [''];
  for (const w of words) {
    const t = lines[lines.length - 1] ? lines[lines.length - 1] + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && lines[lines.length - 1]) lines.push(w); else lines[lines.length - 1] = t;
  }
  return lines;
}

/* The question card (screen space). `hi` = index of the word being read aloud in a story. */
function drawCard(it, o = {}) {
  const c = it.card;
  if (!c) return;
  const big = c.kind === 'story';
  const W = big ? 640 : 420, H = big ? (c.icons ? 230 : 200) : 150;
  const x = VW / 2 - W / 2, y = 12;
  rr(x, y, W, H, 20); paint('rgba(40,25,60,.93)', 4);
  const cx = VW / 2, cy = y + H / 2;
  switch (c.kind) {
    case 'listen': drawSpeaker(cx, cy - 12, Speech.speaking); text('Listen!', cx, cy + 34, { size: 24, color: '#ffd23f', lw: 5 }); break;
    case 'letter': text(c.ch, cx, cy, { size: 96, font: 'Andika', color: '#ffd23f', lw: 8 }); break;
    case 'word': text(c.text, cx, cy, { size: c.text.length > 6 ? 64 : 80, font: 'Andika', color: '#fff', lw: 8 }); break;
    case 'pic': rr(cx - 60, cy - 60, 120, 120, 16); paint('#fffaf0', 3); drawPic(c.word, cx, cy, 104); break;
    case 'problem': drawProblem(c.q, cx, cy - 14, 1.1); break;
    case 'missing': c.quiz.draw(cx, cy - 10, 1.1); break;
    case 'seq': {
      const n = c.nums.length, sp = Math.min(84, (W - 40) / n);
      c.nums.forEach((v, i) => {
        const nx = cx + (i - (n - 1) / 2) * sp;
        if (v === null) { rr(nx - 28, cy - 30, 56, 56, 10); paint('rgba(255,176,46,.25)', 3, '#ffb02e'); text('?', nx, cy - 2, { size: 40, color: '#ffb02e', lw: 6 }); }
        else drawDigits(v, nx, cy - 2, 40);
        if (i < n - 1) text(',', nx + sp / 2 - 4, cy + 10, { size: 30, color: '#aaa', lw: 0, stroke: null });
        if (o.hint && c.pattern && i < n - 1) {
          ctx.strokeStyle = '#8be06b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(nx + sp / 2, cy + 30, sp / 2 - 6, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
          text((c.step > 0 ? '+' : '') + c.step, nx + sp / 2, cy + 56, { size: 16, color: '#8be06b', lw: 3 });
        }
      });
      break;
    }
    case 'blocks': {
      const tw = c.tens * 22 + (c.ones ? 30 + Math.ceil(c.ones / 5) * 20 : 0);
      let bx = cx - tw / 2;
      for (let i = 0; i < c.tens; i++) { for (let k = 0; k < 10; k++) { rr(bx, cy - 55 + k * 11, 16, 10, 2); paint('#4aa3ff', 1.5); } bx += 22; }
      bx += 14;
      for (let i = 0; i < c.ones; i++) { rr(bx + Math.floor(i / 5) * 20, cy + 45 - (i % 5) * 14, 14, 12, 2); paint('#ffb02e', 1.5); }
      break;
    }
    case 'coins': {
      const n = c.coins.length, sp = Math.min(46, (W - 40) / n);
      c.coins.slice().sort((a, b) => b - a).forEach((v, i) => drawCoin(cx + (i - (n - 1) / 2) * sp, cy, v));
      break;
    }
    case 'clock': drawClock(cx, cy, 62, c.h, c.m); break;
    case 'story': {
      const lines = wrapLines(c.text, W - 50, 30);
      let wi = 0;
      lines.forEach((ln, li) => {
        ctx.font = '700 30px Andika, sans-serif';
        const lw = ctx.measureText(ln).width;
        let lx = cx - lw / 2;
        const ly = y + 38 + li * 40;
        for (const word of ln.split(' ')) {
          const ww = ctx.measureText(word + ' ').width;
          const hot = o.hi === wi;
          if (hot) { rr(lx - 4, ly - 20, ctx.measureText(word).width + 8, 38, 8); paint('#ffd23f', 0); }
          text(word, lx + ctx.measureText(word).width / 2, ly, { size: 30, font: 'Andika', color: hot ? OUT : '#fff', lw: hot ? 0 : 5, stroke: hot ? null : OUT });
          lx += ww; wi++;
        }
      });
      if (c.icons) {
        const { word, a, b, sub } = c.icons, tot = sub ? a : a + b, sp = Math.min(40, (W - 60) / tot);
        for (let i = 0; i < tot; i++) {
          const ix = cx + (i - (tot - 1) / 2) * sp, iy = y + H - 34;
          drawPic(word, ix, iy, 34);
          if (sub && i >= a - b) { ctx.strokeStyle = '#ff4f6d'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ix - 14, iy - 14); ctx.lineTo(ix + 14, iy + 14); ctx.stroke(); }
          if (!sub && i === a - 1) { ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ix + sp / 2, iy - 18); ctx.lineTo(ix + sp / 2, iy + 18); ctx.stroke(); }
        }
      }
      break;
    }
  }
}
