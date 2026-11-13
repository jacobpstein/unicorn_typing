'use strict';

/* The challenge types. Each returns a Challenge (panels.js) built from an item generator. */

const PICW = w => hasPic(w);
/* Can she decode this word yet? Closed syllables (cat, ship, frog) at level 0–1, silent e at 1, plus a few heart words. */
const HEART = new Set(['the', 'a', 'i', 'is', 'to', 'has', 'my', 'we', 'he', 'she', 'his', 'of', 'you', 'are', 'was', 'said', 'look', 'see', 'go', 'no', 'do']);
function decodable(word, level) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w || HEART.has(w)) return true;
  if (level === 0) return /^[^aeiou]?[aeiou][^aeiou]?s?$/.test(w);
  if (/^[^aeiou]*[aeiou][^aeiouy]+$/.test(w) && !/(ar|or|er|ir|ur|ll$)/.test(w.replace(/ll$/, 'l'))) return true;
  if (level >= 1 && /^[^aeiou]*[aeiou][^aeiou]e$/.test(w)) return true;
  return false;
}
const sayNums = seq => seq.map(String).join(', ');

/* ---------- Reading & spelling ---------- */

/* 1. Sound Sorter: which cubby does this picture's sound go in? */
const SORT_SETS = {
  0: () => { const w = freshWord(tierWords('cvc', PICW)); const others = shuffle('smtbpdfhrnlg'.split('').filter(c => c !== w[0])).slice(0, 2); return { w, ans: w[0], opts: [w[0], ...others], where: 'starts' }; },
  1: () => {
    const B = { st: ['star', 'stop'], fr: ['frog'], cr: ['crab', 'crown'], dr: ['drum'], fl: ['flag', 'flute'], sl: ['sled', 'slide'], pl: ['plum', 'plant', 'plate'], gr: ['grape'], cl: ['clock'], sm: ['smile'] };
    const k = pick(Object.keys(B)); const w = freshWord(B[k]);
    // distractors share a letter with the answer (st / sl / sm), so the first letter alone isn't enough
    const same = shuffle(Object.keys(B).filter(x => x !== k && (x[0] === k[0] || x[1] === k[1])));
    const rest = shuffle(Object.keys(B).filter(x => x !== k && !same.includes(x)));
    return { w, ans: k, opts: [k, ...same.concat(rest).slice(0, 2)], where: 'starts' };
  },
  2: () => {
    const B = { ck: ['duck', 'sock', 'rock', 'lock', 'chick'], ng: ['ring', 'king', 'wing', 'song'], sh: ['fish'], th: ['moth'] };
    const k = pick(Object.keys(B)); const w = freshWord(B[k].filter(hasPic).length ? B[k].filter(hasPic) : B.ck);
    return { w, ans: k, opts: [k, ...shuffle(Object.keys(B).filter(x => x !== k)).slice(0, 2)], where: 'ends' };
  },
  3: () => {
    const B = { nd: ['hand'], mp: ['lamp'], nt: ['tent', 'plant'], st: ['nest'], lt: ['belt'], ft: ['gift'], lk: ['milk'] };
    const k = pick(Object.keys(B)); const w = freshWord(B[k]);
    return { w, ans: k, opts: [k, ...shuffle(Object.keys(B).filter(x => x !== k)).slice(0, 2)], where: 'ends' };
  },
  4: () => {
    const w = freshWord(tierWords('cvc', PICW)); const v = w[1];
    return { w, ans: v, opts: [v, ...shuffle('aeiou'.split('').filter(x => x !== v)).slice(0, 2)], where: 'middle' };
  },
};
function drawCubby(label) {
  return (cx, cy, r, sel) => {
    rr(r.x, r.y + 5, r.w, r.h, 12); paint('rgba(0,0,0,.2)', 0);
    rr(r.x, r.y - (sel ? 3 : 0), r.w, r.h, 12); paint(sel ? '#ffd9a8' : '#e8b07a', sel ? 5 : 3, sel ? '#ff5fa2' : OUT);
    rr(r.x + 12, r.y + 12 - (sel ? 3 : 0), r.w - 24, r.h - 24, 8); paint('#7a4a2a', 2);
    rr(cx - 50, r.y + 2 - (sel ? 3 : 0), 100, 44, 8); paint('#fffaf0', 2.5);
    text(label, cx, r.y + 25 - (sel ? 3 : 0), { size: 34, font: 'Andika', color: /^[aeiou]$/.test(label) ? '#e8384f' : '#2f6fe0', stroke: null });
  };
}
function soundSorter(o) {
  return new Challenge(Object.assign({
    title: 'Sound Sorter', skill: 'sounds', count: 4,
    intro: 'Put each picture in the right cubby!',
    make(level) {
      const g = SORT_SETS[Math.min(level, 4)]();
      const where = g.where === 'starts' ? 'starts with' : g.where === 'ends' ? 'ends with' : 'has in the middle';
      const opts = shuffle(g.opts);
      return {
        kind: 'choice', word: g.w, answer: g.ans, key: g.w, ch: 150,
        prompt: `${g.w}. What sound does ${g.w} ${g.where === 'middle' ? 'have in the middle' : g.where === 'starts' ? 'start with' : 'end with'}? ${g.w}.`,
        show: `What sound does "${g.w}" ${g.where === 'starts' ? 'start' : g.where === 'ends' ? 'end' : 'have in the middle'} with?`,
        choices: opts.map(c => ({ val: c, say: CHUNK_SAY[c] || c, draw: drawCubby(c) })),
        visual: (ch) => { rr(VW / 2 - 85, PY + 82, 170, 160, 20); paint('#ffffff', 3); drawPic(g.w, VW / 2, PY + 162, 140); },
        hint1: v => `That cubby says ${CHUNK_SAY[v] || v}. Listen: ${g.w}. ${segSpeech(g.w)}.`,
        hint2: () => `${g.w} ${where} ${CHUNK_SAY[g.ans] || g.ans}. Find the glowing cubby.`,
        rightSay: `${g.w} ${where} ${CHUNK_SAY[g.ans] || g.ans}!`,
      };
    },
  }, o));
}

/* 2. Label Fixer: build the word from tiles. */
function splitChunks(w) {
  const out = [];
  for (let i = 0; i < w.length;) { const two = w.slice(i, i + 2); if (['sh', 'ch', 'th', 'ck', 'ng', 'wh'].includes(two)) { out.push(two); i += 2; } else { out.push(w[i]); i++; } }
  return out;
}
function labelFixer(o) {
  return new Challenge(Object.assign({
    title: 'Label Fixer', skill: 'spell', count: 4,
    intro: 'The labels got all mixed up! Fix them.',
    make(level) {
      const lv = Math.min(level, 4);
      const w = spellWord(lv, o.theme, { filter: x => hasPic(x) || lv >= 4 });
      let parts, decoys = [], chunks = false;
      if (lv >= 4 && SYLL[w]) { parts = SYLL[w]; chunks = true; decoys = [pick(['pen', 'ket', 'sun', 'bit', 'kin', 'ton'].filter(d => !parts.includes(d)))]; }
      else {
        parts = lv >= 3 ? splitChunks(w) : w.split('');
        const nd = lv === 2 ? 1 : lv >= 3 ? 2 : 0;
        for (let k = 0; k < nd; k++) decoys.push(decoyFor(w[k % w.length], w + decoys.join('')));
      }
      const sent = sentenceFor(w);
      return {
        kind: 'tiles', word: w, parts, decoys, chunks, key: w, tileW: chunks ? 120 : 84,
        prompt: `Spell ${w}. ${sent} ${w}.`, show: `Spell "${w}"`,
        rightSay: `${chunks ? parts.join(', ') : spellOut(w)}. ${w}!`,
        visual: () => {
          rr(VW / 2 - 80, PY + 76, 160, 150, 20); paint('#ffffff', 3);
          if (hasPic(w)) drawPic(w, VW / 2, PY + 151, 130); else text('?', VW / 2, PY + 151, { size: 60, color: '#b8afc8', stroke: null });
          // little museum label card behind the slots
          rr(VW / 2 - 260, PY + 228, 520, 98, 14); paint('#f0dca8', 3);
        },
      };
    },
  }, o));
}

/* 7. Syllable Snap: snap two word parts together. */
function syllableSnap(o) {
  return new Challenge(Object.assign({
    title: 'Syllable Snap', skill: 'syll', count: 4,
    intro: 'Clap the parts, then snap them together!',
    make(level) {
      const w = freshWord(Object.keys(SYLL));
      const parts = SYLL[w];
      const extra = ['pen', 'sun', 'kin', 'bit', 'ton', 'ket', 'pop', 'tick', 'mag', 'zip'].filter(d => !parts.includes(d));
      const decoys = shuffle(extra).slice(0, Math.min(3, level));
      return {
        kind: 'tiles', word: w, parts, decoys, chunks: true, key: w, tileW: 120,
        prompt: `${sylSay(parts[0])}... ${sylSay(parts[1])}. ${w}! Clap it: ${sylSay(parts[0])}, ${sylSay(parts[1])}. Snap the parts together.`, show: `Snap together "${w}"`,
        rightSay: `${sylSay(parts[0])}, ${sylSay(parts[1])}. ${w}!`,
        visual: (ch) => {
          // a little carousel
          const cx = VW / 2, cy = PY + 150;
          ctx.beginPath(); ctx.moveTo(cx - 150, cy - 30); ctx.lineTo(cx, cy - 80); ctx.lineTo(cx + 150, cy - 30); ctx.closePath(); paint('#ff5f6a', 3);
          for (let i = 0; i < 5; i++) { rr(cx - 140 + i * 66, cy - 30, 6, 80, 2); paint('#ffd23f', 1.5); }
          for (let i = 0; i < 3; i++) { const hx = cx - 100 + i * 100, hy = cy + 10 + Math.sin(ch.t * 3 + i * 2) * 8; ellipse(hx, hy, 24, 13); paint(['#fffaf0', '#ffb3c8', '#bfe6ff'][i], 2.5); circle(hx + 20, hy - 12, 9); paint(['#fffaf0', '#ffb3c8', '#bfe6ff'][i], 2.5); }
          if (hasPic(w)) drawPic(w, cx + 250, cy, 90);
        },
      };
    },
  }, o));
}

/* 5. Magic E. */
const MAGIC_PAIRS = [['cap', 'cape'], ['kit', 'kite'], ['hop', 'hope'], ['tub', 'tube'], ['pin', 'pine'], ['can', 'cane'], ['not', 'note'], ['cub', 'cube'], ['man', 'mane'], ['rid', 'ride'], ['tap', 'tape'], ['dim', 'dime'], ['rob', 'robe'], ['hat', 'hate'], ['fin', 'fine']];
function magicE(o) {
  return new Challenge(Object.assign({
    title: 'Magic e', skill: 'magic', count: 4,
    intro: 'Watch the magic e change the word!',
    make(level) {
      const [s, l] = pick(MAGIC_PAIRS);
      const vowel = s.match(/[aeiou]/)[0];
      const ask = level === 0 ? l : pick([s, l]);
      return {
        kind: 'magic', short: s, long: l, vowel, ask, answer: ask, key: l, word: l, cw: 220,
        prompt: `This word says ${s}. Click the magic e to change it!`, show: `"${s}" — click the magic e!`,
        choices: shuffle([s, l]).map(x => ({ val: x, label: x, say: x })),
        hint1: v => `That one says ${v}. ${v === s ? `No e, so the ${lname(vowel)} is short.` : `It has the magic e, so the ${lname(vowel)} says its name.`} Which says ${ask}?`,
        rightSay: `${ask}! ${ask === l ? 'The e makes the ' + lname(vowel) + ' say its name.' : 'No magic e, short ' + lname(vowel) + '.'}`,
      };
    },
  }, o));
}

/* 6. Read & Find: read the sign (karaoke at first), then pick the picture. Riddles at the top levels. */
const RIDDLES = [
  ['I live in the sea. I am very, very big.', 'whale', ['fish', 'crab']],
  ['I can hop. I am green. I sit on a log.', 'frog', ['duck', 'fox']],
  ['You eat me at a party. I have candles on top.', 'cake', ['cup', 'jam']],
  ['I shine at night. I am not the sun.', 'moon', ['sun', 'lamp']],
  ['I have two wheels. You ride me to the park.', 'bike', ['bus', 'van']],
  ['I go up on a string. The wind helps me fly.', 'kite', ['star', 'jet']],
  ['I have two big claws. I walk on the sand.', 'crab', ['fish', 'shell']],
  ['A king wears me on his head. I am gold.', 'crown', ['hat', 'ring']],
  ['I say quack. I swim in the pond.', 'duck', ['hen', 'frog']],
  ['I float on the water. People ride in me.', 'boat', ['bus', 'bike']],
  ['I have a long tail. I say meow.', 'cat', ['dog', 'fox']],
  ['I say oink. I like the mud.', 'pig', ['dog', 'hen']],
  ['You bang on me. Boom, boom, boom!', 'drum', ['flute', 'bell']],
  ['I tell you the time. Tick, tock!', 'clock', ['lamp', 'box']],
];
function readFind(o) {
  return new Challenge(Object.assign({
    title: 'Read & Find', skill: 'read', count: 3,
    intro: 'Read the sign, then find the picture!',
    make(level) {
      let sentence, ans, wrong;
      const notes = o.notes && o.notes[this.i] && !this.notesUsed?.[this.i];
      if (notes) { [sentence, ans, wrong] = o.notes[this.i]; wrong = wrong.slice(); (this.notesUsed = this.notesUsed || {})[this.i] = true; }
      else if (level >= 3) { const r = pick(RIDDLES.filter(r => hasPic(r[1]))); sentence = r[0]; ans = r[1]; wrong = r[2].filter(hasPic); }
      else {
        const maxLen = level === 0 ? 5 : level === 1 ? 7 : 99;
        const ok = x => hasPic(x.word) && x.tier !== 'sight' && x.sentence.split(' ').length <= maxLen && (level >= 2 || x.sentence.split(' ').every(wd => decodable(wd, level)));
        let pool = Object.values(WORDS).filter(ok);
        if (o.theme && THEME_WORDS[o.theme]) { const th = pool.filter(x => THEME_WORDS[o.theme].includes(x.word)); if (th.length >= 2) pool = th; }
        if (!pool.length) pool = Object.values(WORDS).filter(x => hasPic(x.word) && x.tier === 'cvc');
        const w = pick(pool.filter(x => !recentWords.includes(x.word))) || pick(pool);
        recentWords.push(w.word);
        sentence = w.sentence; ans = w.word;
        wrong = [];
      }
      // distractors that share a sound make it about reading, not guessing
      const cands = shuffle(Object.keys(WORDS).filter(x => hasPic(x) && x !== ans && !sentence.toLowerCase().includes(x)));
      const similar = cands.filter(x => x[0] === ans[0] || x.slice(-2) === ans.slice(-2));
      while (wrong.length < 2) { const c = similar.shift() || cands.shift(); if (c && !wrong.includes(c) && !sentence.toLowerCase().includes(c)) wrong.push(c); }
      wrong = wrong.slice(0, 2);
      const words = sentence.split(' ');
      const auto = level <= 1;
      // at level 1 the voice reads everything except the answer word: she reads that one herself
      const spoken = level === 1 ? sentence.replace(new RegExp('\\b' + ans + '\\b', 'i'), 'hmm') : sentence;
      return {
        kind: 'choice', answer: ans, key: ans, sentence, words, ch: 140, cw: 170,
        prompt: level === 0 ? `Read with me: ${sentence} Which picture goes with the sign?` : level === 1 ? `Read with me: ${spoken} You read the hmm word! Which picture?` : `Read the sign. Click any word if you need help. Then pick the picture.`,
        show: 'Read the sign. Which picture?',
        choices: shuffle([ans, ...wrong]).map(x => ({ val: x, pic: x })),
        hint1: v => `That's a ${v}. Read the sign again. Click a word to hear it.`,
        hint2: () => `${sentence}`,
        rightSay: `${sentence}`,
        visual: (ch, it) => {
          // the sign; each word can be clicked to hear it
          const lines = [];
          let cur = [];
          ctx.font = '700 38px Andika, sans-serif';
          for (const wd of words) { const tryL = cur.concat(wd).join(' '); if (ctx.measureText(tryL).width > 700 && cur.length) { lines.push(cur); cur = [wd]; } else cur.push(wd); }
          lines.push(cur);
          const top = PY + 90, h = 60 + lines.length * 52;
          rr(VW / 2 - 390, top, 780, h, 18); paint('#f0dca8', 4);
          rr(VW / 2 - 380, top + 10, 760, h - 20, 12); paint('#fffaf0', 0);
          let idx = 0;
          const karaoke = auto && it.t < words.length * 0.45 + 2.5 ? Math.floor((it.t - 1.4) / 0.42) : -1;
          lines.forEach((ln, li) => {
            const lw = ctx.measureText(ln.join(' ')).width;
            let x = VW / 2 - lw / 2;
            for (const wd of ln) {
              const ww = ctx.measureText(wd).width, y = top + 50 + li * 52;
              const r = { x: x - 4, y: y - 26, w: ww + 8, h: 50 };
              const hot = Input.hover(r) || idx === karaoke;
              if (hot) { rr(r.x, r.y, r.w, r.h, 8); paint('#fff07a', 0); }
              text(wd, x + ww / 2, y, { size: 38, font: 'Andika', color: OUT, stroke: null });
              if (Input.clicked(r)) { const clean = wd.replace(/[^a-z]/gi, '').toLowerCase(); Speech.say(clean); S.stats.help = S.stats.help || {}; S.stats.help[clean] = (S.stats.help[clean] || 0) + 1; }
              x += ww + ctx.measureText(' ').width; idx++;
            }
          });
        },
      };
    },
  }, o));
}

/* 2/3. Typing challenges: Departure Board, Ice Writing, Name Beads. */
function typeItem(level, word, extra = {}) {
  const tl = Adapt.level('type');
  const mode = tl === 0 ? 'copy' : tl === 1 ? 'faded' : tl === 2 && hasPic(word) ? 'pic' : 'sentence';
  const sent = sentenceFor(word);
  return Object.assign({
    kind: 'type', word, key: word, mode,
    prompt: mode === 'copy' ? `Type ${word}. ${spellOut(word)}. Find the glowing keys!` : mode === 'faded' ? `Type ${word}. ${sent}` : `Type ${word}. ${sent} ${word}.`,
    show: mode === 'copy' || mode === 'faded' ? `Type "${word}"` : 'Type the word you hear',
  }, extra);
}
function departureBoard(o) {
  const dests = ['stop', 'bus', 'map', 'home', 'lake', 'ride', 'trip', 'track', 'dock', 'tram', 'plane', 'ship', 'lunch', 'shop', 'camp', 'pond'];
  return new Challenge(Object.assign({
    title: 'Departure Board', skill: 'type', count: 4, color: '#e8f0ff',
    intro: 'The departure board is broken! Type the words to fix it.',
    make(level) {
      const sl = Adapt.level('spell');
      const pool = sl <= 0 ? ['bus', 'map', 'van', 'jet', 'hut', 'den'] : sl === 1 ? ['stop', 'trip', 'pond', 'camp', 'tram', 'dock'] : dests;
      const w = freshWord(pool);
      const it = typeItem(level, w);
      it.drawArea = (ch, it2) => {
        const n = w.length, sp = 64, x0 = VW / 2 - (n - 1) * sp / 2 + 60, y = PY + 175;
        rr(PX + 60, PY + 84, PW - 120, 150, 12); paint('#1e2236', 4);
        text('NEXT TRAIN TO', PX + 90, PY + 112, { size: 18, color: '#ffd23f', stroke: null, align: 'left', font: 'Fredoka' });
        if (it2.mode === 'pic') drawPic(w, PX + 150, y + 4, 90);
        for (let i = 0; i < n; i++) {
          const x = x0 + i * sp;
          rr(x - 28, y - 38, 56, 76, 6); paint('#2e344e', 2, '#0e1020');
          ctx.fillStyle = '#0e1020'; ctx.fillRect(x - 28, y - 1, 56, 2);
          if (i < it2.pos) text(w[i], x, y, { size: 50, font: 'Andika', color: '#ffd23f', stroke: null });
          else if (it2.mode === 'copy') text(w[i], x, y, { size: 50, font: 'Andika', color: 'rgba(255,210,63,.35)', stroke: null });
          else if (it2.mode === 'faded') text(w[i], x, y, { size: 50, font: 'Andika', color: 'rgba(255,210,63,.14)', stroke: null });
          if (i === it2.pos) { rr(x - 20, y + 30, 40, 5, 2); paint('#ffd23f', 0); }
        }
      };
      it.onLetter = () => Sfx.click();
      it.rightSay = `${spellOut(w)}. ${w}! Toot toot!`;
      return it;
    },
  }, o));
}
function iceWriting(o) {
  return new Challenge(Object.assign({
    title: 'Ice Writing', skill: 'type', count: 4, color: '#eef8ff',
    intro: 'Type a word and Coach Lena will skate it on the ice!',
    make(level) {
      const sl = Adapt.level('spell');
      const pool = sl <= 1 ? ['spin', 'skip', 'sled', 'step', 'snap', 'swim', 'flag', 'clap'] : ['skate', 'slide', 'spin', 'sled', 'smile', 'ship', 'wish', 'chin', 'snake', 'stone', 'flute'];
      const w = freshWord(pool);
      const it = typeItem(level, w);
      it.drawArea = (ch, it2) => {
        rr(PX + 40, PY + 80, PW - 80, 170, 60); paint('#e4f4ff', 4, '#9ac8e8');
        const n = w.length, sp = 70, x0 = VW / 2 - (n - 1) * sp / 2, y = PY + 166;
        if (it2.mode === 'pic') drawPic(w, PX + 110, y, 80);
        for (let i = 0; i < n; i++) {
          const x = x0 + i * sp + Math.sin(i) * 4;
          if (i < it2.pos) { text(w[i], x, y, { size: 70, font: 'Andika', color: '#bfe6ff', stroke: '#4a90d8', lw: 4 }); if (Math.random() < 0.05) FX.sparkle(x, y, 1, ['#fff', '#bfe6ff']); }
          else if (it2.mode === 'copy') text(w[i], x, y, { size: 70, font: 'Andika', color: 'rgba(74,144,216,.25)', stroke: null });
          else if (it2.mode === 'faded') text(w[i], x, y, { size: 70, font: 'Andika', color: 'rgba(74,144,216,.12)', stroke: null });
        }
        // Lena skating to the last letter
        const lx = x0 + Math.max(0, it2.pos - 0.5) * sp + 30, ly = y + 40;
        drawPerson(lx, ly + Math.sin(ch.t * 6) * 2, { look: NPC_LOOKS.lena, scale: 0.55, face: 1, run: ch.t * 10 });
      };
      it.rightSay = `${spellOut(w)}. ${w}! The crowd cheers!`;
      return it;
    },
  }, o));
}

/* ---------- Math ---------- */
function numChoices(ans, decoys, n = 3) {
  const set = [ans];
  for (const d of shuffle(decoys)) { if (set.length >= n) break; if (d >= 0 && d <= 130 && !set.includes(d)) set.push(d); }
  let k = 2; while (set.length < n) { const d = ans + k * (k % 2 ? -1 : 1); if (d >= 0 && !set.includes(d)) set.push(d); k++; }
  return shuffle(set).map(v => ({ val: v, label: v, font: 'Fredoka', size: 52, say: String(v) }));
}

/* 8. Ticket Counter: count by 10s, mostly starting off the decade. */
function count10Seq(level) {
  let start, step = 10, len = 5;
  const down = level >= 4 ? (level === 4 ? true : Math.random() < 0.4) : (level >= 2 && Math.random() < 0.3);
  if (level === 0) { start = 10 * rint(1, 4); len = 4; }
  else if (level === 1) start = pick([9, 9, 19, 29]);         // the teacher's example, but not always the same run
  else if (level === 2) start = rint(1, 8) + 10 * rint(0, 2);
  else if (level === 3) start = rint(1, 5) * 10 + rint(1, 9) - 10 * rint(0, 1);
  else start = rint(1, 9) + 10 * rint(0, level >= 5 ? 6 : 3);
  if (down) { step = -10; start = start + 10 * (len - 1); if (level >= 5) start += 10 * rint(0, 3); }
  let seq = Array.from({ length: len }, (_, i) => start + i * step);
  const hi = Math.max(...seq);
  if (hi > 120) seq = seq.map(v => v - 10 * Math.ceil((hi - 120) / 10));
  return { seq, step };
}
/* A strip of the hundreds chart: the rows the sequence crosses, with the ones column lit up. */
function drawHundredsStrip(seq, blankIdx, cx, top, t) {
  const lo = Math.floor(Math.min(...seq) / 10), hiR = Math.floor(Math.max(...seq) / 10);
  const rows = Math.min(5, hiR - lo + 1), cw = 42, rh = 23, x0 = cx - 5 * cw;
  const ones = seq[0] % 10;
  for (let r = 0; r < rows; r++) for (let c = 0; c < 10; c++) {
    const v = (lo + r) * 10 + c;
    const lit = c === ones, blank = v === seq[blankIdx];
    ctx.fillStyle = blank ? '#fff07a' : lit ? '#bff0ea' : '#ffffff'; ctx.fillRect(x0 + c * cw, top + r * rh, cw - 2, rh - 2);
    text(blank ? '?' : String(v), x0 + c * cw + cw / 2 - 1, top + r * rh + rh / 2, { size: 14, color: lit ? '#1ca8a0' : '#8a80a0', stroke: null });
  }
}
function ticketCounter(o) {
  return new Challenge(Object.assign({
    title: 'Ticket Counter', skill: 'count10', count: 4,
    intro: 'Tickets come in bundles of ten. Count by tens!',
    make(level) {
      const { seq, step } = count10Seq(level);
      const blank = level <= 1 ? rint(2, seq.length - 1) : rint(1, seq.length - 1);
      const ans = seq[blank];
      const spoken = seq.map((v, i) => i === blank ? 'what' : v).join(', ');
      const ones = ans % 10;
      return {
        kind: 'choice', answer: ans, numeric: true, key: `${seq[0]}${step > 0 ? '+' : '-'}10`, seqStart: seq[0], ch: 110, cw: 170,
        prompt: `Count by tens${step < 0 ? ' going down' : ''}: ${spoken}?`, show: `Count by 10s${step < 0 ? ' down' : ''}! What number is missing?`,
        choices: numChoices(ans, [ans + (step > 0 ? 1 : -1), ans - ones + (step > 0 ? 10 : 0), ans + step, ans - step + 1, ans - 1], level >= 2 ? 4 : 3),
        hint1: v => `Not ${v}. ${step > 0 ? 'Add' : 'Take away'} one bundle of ten. Look at the chart: go straight ${step > 0 ? 'down' : 'up'}. ${spoken}?`,
        hint2: () => `The ones number always stays ${ones}. Only the tens number changes, one at a time. ${spoken}?`,
        rightSay: `${sayNums(seq)}!`,
        visual: (ch, it) => {
          drawNumberRow(seq, blank, VW / 2, PY + 150, { gap: 128, step, showStep: it.wrongs >= 1, filled: it.solved ? ans : null });
          if (it.wrongs >= 1) { drawHundredsStrip(seq, it.solved ? -1 : blank, VW / 2, PY + 204, ch.t); return; }
          // ticket bundles for the first number
          const tens = Math.floor(seq[0] / 10), onesN = seq[0] % 10;
          const bx = VW / 2 - 300, by = PY + 250;
          for (let k = 0; k < Math.min(tens, 12); k++) drawTicketBundle(bx + k * 30, by);
          for (let k = 0; k < onesN; k++) drawTicket(bx + Math.min(tens, 12) * 30 + 16 + k * 14, by, 0.7);
          text(`${seq[0]} = ${tens} bundle${tens === 1 ? '' : 's'} + ${onesN} loose`, VW / 2 + 230, by + 4, { size: 20, color: OUT, stroke: null });
        },
      };
    },
  }, o));
}
function drawTicket(x, y, s = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(-8, -16, 16, 32, 3); paint('#ffd23f', 2); ctx.restore(); }
function drawTicketBundle(x, y) { for (let k = 0; k < 3; k++) { rr(x - 12 + k * 2, y - 18 - k * 2, 22, 36, 3); paint('#ffd23f', 2); } rr(x - 13, y - 4, 26, 6, 2); paint('#e8442f', 1.5); }

/* 9. Countdown Launch. */
function countdownSeq(level) {
  let start, step = -1;
  switch (Math.min(level, 6)) {
    case 0: start = rint(5, 10); break;
    case 1: start = rint(13, 20); break;
    case 2: start = 10 * rint(2, 4) + rint(1, 3); break;     // crosses a decade: 32, 31, 30, 29
    case 3: start = 10 * rint(4, 9) + rint(1, 3); break;
    case 4: start = 10 * rint(5, 10); step = -10; break;
    case 5: start = 10 * rint(4, 9) + rint(1, 9); step = -10; break;  // 59, 49, 39 ... or 74, 64, 54
    default: step = pick([-2, -5]); start = step === -2 ? 2 * rint(8, 15) : 5 * rint(8, 14);
  }
  return { seq: Array.from({ length: 4 }, (_, i) => start + i * step), step };
}
function countdownLaunch(o) {
  return new Challenge(Object.assign({
    title: o.title || 'Countdown Launch', skill: 'countdown', count: 4,
    intro: 'Count down so it can blast off!',
    make(level) {
      const { seq, step } = countdownSeq(level);
      const blank = level >= 3 ? rint(1, 3) : 3;
      const ans = seq[blank];
      const spokenSeq = seq.map((v, i) => i === blank ? 'what' : v).join(', ');
      return {
        kind: 'choice', answer: ans, numeric: true, key: `${seq[0]}${step}`, ch: 110, cw: 170,
        prompt: `Count down${step !== -1 ? ' by ' + (-step) + 's' : ''}: ${spokenSeq}?`,
        show: `Count down${step !== -1 ? ' by ' + (-step) + 's' : ''}! What number is missing?`,
        choices: numChoices(ans, [ans + step, ans - step, ans + 1, ans - 1, ans - 9, step === -1 && ans % 10 === 9 ? ans + 10 : ans - 10], level >= 2 ? 4 : 3),
        hint1: v => `Not ${v}. Going down means smaller. ${spokenSeq}?`,
        hint2: () => step === -1 ? `Each number is one less. When the ones get to zero, the next one ends in nine and the tens go down one.` : `Take away ${-step} each time. ${step === -10 ? 'The ones number stays the same!' : ''}`,
        rightSay: `${sayNums(seq)}!`,
        visual: (ch, it) => {
          drawNumberRow(seq, blank, VW / 2 - 40, PY + 150, { gap: 128, colorDigits: step === -10, filled: it.solved ? ans : null });
          // the rocket balloon (or zamboni) meter
          const rx = PX + PW - 90, ry = PY + 290, fill = (ch.i + (it.solved ? 1 : 0)) / ch.count;
          rr(rx - 16, ry - 200, 32, 200, 14); paint('#fffaf0', 3);
          rr(rx - 12, ry - 4 - 192 * fill, 24, 192 * fill, 10); paint('#ff8a1f', 0);
          ctx.save(); ctx.translate(rx, ry - 230 - (ch.state === 'done' ? 200 : 0));
          ctx.beginPath(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(18, -6, 12, 18); ctx.lineTo(-12, 18); ctx.quadraticCurveTo(-18, -6, 0, -30); paint('#e8eef8', 3);
          circle(0, -4, 6); paint('#8ec5ff', 2); ctx.restore();
        },
      };
    },
  }, o));
}

/* Gem counting by 2s and 5s (Museum gem hall). */
function gemCounting(o) {
  return new Challenge(Object.assign({
    title: 'Gem Counting', skill: 'skipcount', count: 4,
    intro: 'The gems come in groups. Count them by groups!',
    make(level) {
      const by = level <= 1 ? 2 : pick([2, 5, 10]);
      const n = 5, start = 0;
      const seq = Array.from({ length: n }, (_, i) => start + (i + 1) * by);
      const ans = seq[n - 1];
      const col = pick(['#ff6fae', '#4aa3ff', '#5fd068', '#a66cff']);
      return {
        kind: 'choice', answer: ans, numeric: true, key: `gems${by}`, ch: 110, cw: 170, item: true,
        prompt: `Count the gems by ${by}s: ${seq.slice(0, n - 1).join(', ')}, what's next?`, show: `Count by ${by}s! How many gems?`,
        choices: numChoices(ans, [ans + 1, ans - 1, ans + by, ans - by]),
        hint1: v => `Not ${v}. Each group has ${by}. ${seq.slice(0, n - 1).join(', ')}... ${by} more is?`,
        hint2: () => `Count the gems in the last box, then count on from ${seq[n - 2]}.`, rightSay: `${seq.join(', ')}! ${ans} gems!`,
        visual: (ch, it) => {
          for (let g = 0; g < n; g++) {
            const gx = VW / 2 - 320 + g * 160, gy = PY + 150;
            rr(gx - 66, gy - 60, 132, 120, 14); paint(g === n - 1 && !it.solved ? '#fff6c8' : '#ffffff', 2.5);
            const k = by === 10 ? 10 : by;
            for (let j = 0; j < k; j++) { const cols = by === 2 ? 2 : 5; const x = gx - (cols - 1) * 11 + (j % cols) * 22, y = gy - 20 + Math.floor(j / cols) * 26; ctx.beginPath(); ctx.moveTo(x, y - 9); ctx.lineTo(x + 8, y - 2); ctx.lineTo(x, y + 9); ctx.lineTo(x - 8, y - 2); ctx.closePath(); paint(col, 1.5); }
            text(g === n - 1 && !it.solved ? '?' : String(seq[g]), gx, gy + 44, { size: 26, color: g === n - 1 ? '#ffb02e' : OUT, stroke: null });
          }
          if (start) text(`Start at ${start}`, VW / 2, PY + 240, { size: 20, color: OUT, stroke: null });
        },
      };
    },
  }, o));
}

/* 10. Bagel Bundles: bags of ten and single bagels. */
function drawBagelBag(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(-24, -48, 48, 96, 8); paint('#e8d0a8', 3);
  rr(-16, -58, 32, 14, 4); paint('#c8a070', 2.5);
  text('10', 0, -24, { size: 22, color: '#a0523f', stroke: null });
  for (let k = 0; k < 10; k++) { const px = -10 + (k % 2) * 20, py = -6 + Math.floor(k / 2) * 10; circle(px, py, 4); paint('#d8964a', 1.2); }
  ctx.restore();
}
function drawBagel(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  circle(0, 0, 17); paint('#d8964a', 3); circle(0, 0, 5); paint('#fffaf0', 2);
  for (const [a, b] of [[-8, -8], [6, -10], [10, 4], [-10, 6]]) { ctx.fillStyle = '#fff6d0'; ctx.fillRect(a, b, 3, 2); }
  ctx.restore();
}
function bagelBundles(o) {
  return new Challenge(Object.assign({
    title: o.title || 'Bagel Bundles', skill: 'place', count: 4,
    intro: 'Fill the order with bags of ten and single bagels!',
    make(level) {
      const max = [20, 50, 99, 99, 99][Math.min(level, 4)];
      const n = rint(level === 0 ? 11 : 12, max);
      if (level >= 3) {
        // read the tray: how many?
        const tens = Math.floor(n / 10), ones = n % 10;
        const flip = ones && ones !== tens ? ones * 10 + tens : n + 10;
        const plus = level === 4;
        const ans = plus ? n + 10 : n;
        return {
          kind: 'choice', answer: ans, numeric: true, key: `tray${n}`, ch: 100, cw: 160, cy: PY + PH - 130,
          prompt: plus ? `Here are ${n} bagels. Mr. Shapiro adds one more bag of ten. How many now?` : `How many bagels are on the tray?`,
          show: plus ? `${n} bagels + one more bag of 10 = ?` : 'How many bagels?',
          choices: numChoices(ans, plus ? [n + 1, ans + 1, ans - 1, n] : [flip, n + 1, n - 1, n + 10]),
          hint1: v => `Not ${v}. Count the bags by tens first: ${Array.from({ length: tens }, (_, i) => (i + 1) * 10).join(', ')}. Then the ones.`,
          hint2: () => plus ? `Ten more means the tens number goes up by one. The ones stay the same.` : `Count the bags by tens. Then keep counting the single bagels by ones.`,
          rightSay: plus ? `${n} and ten more is ${ans}!` : `${tens} tens and ${ones} ones. ${n}!`,
          visual: () => {
            rr(PX + 60, PY + 80, PW - 120, 230, 16); paint('#c8925a', 3);
            for (let k = 0; k < tens + (plus ? 0 : 0); k++) drawBagelBag(PX + 120 + k * 60, PY + 190, 0.95);
            for (let k = 0; k < ones; k++) drawBagel(PX + 140 + tens * 60 + (k % 5) * 40, PY + 150 + Math.floor(k / 5) * 44);
            if (plus) { drawBagelBag(PX + PW - 120, PY + 190, 0.95); text('+', PX + PW - 170, PY + 190, { size: 40, color: '#fff' }); }
          },
        };
      }
      return {
        kind: 'build', answer: n, key: `order${n}`, tensOnes: true,
        prompt: `Mr. Shapiro needs ${n} bagels. Use bags of ten and single bagels.`, show: `Make ${n} bagels!`,
        goalText: `Order: ${n}`,
        buttons: [
          { val: 10, label: 'Bag of 10', hot: 1, draw: (x, y, s) => drawBagelBag(x, y, s * 0.7) },
          { val: 1, label: '1 bagel', hot: 2, draw: (x, y, s) => drawBagel(x, y, s * 1.2) },
        ],
        drawPlaced: (v, x, y) => v === 10 ? drawBagelBag(x, y, 1) : drawBagel(x, y, 1),
        countSay: placed => { const t = placed.filter(v => v === 10).length, on = placed.filter(v => v === 1).length; return `${t * 10 + on}`; },
        unitSay: tot => `You have ${tot}.`,
        hint2: () => `${Math.floor(n / 10)} bags of ten and ${n % 10} single bagels.`,
        rightSay: `${Math.floor(n / 10)} tens and ${n % 10} ones makes ${n}!`,
      };
    },
  }, o));
}

/* 12. Coin Shop. */
const COINS = { 1: { name: 'penny', r: 15, col: '#d8864a' }, 5: { name: 'nickel', r: 18, col: '#c8ccd4' }, 10: { name: 'dime', r: 13, col: '#dfe3ea' }, 25: { name: 'quarter', r: 21, col: '#d4d8e0' } };
function drawRealCoin(v, x, y, s = 1) { const c = COINS[v]; circle(x, y, c.r * s); paint(c.col, 2.5); text(`${v}¢`, x, y + 1, { size: 12 * s + 2, color: OUT, stroke: null }); }
function coinShop(o) {
  return new Challenge(Object.assign({
    title: o.title || 'Coin Shop', skill: 'coins', count: 3,
    intro: 'Pay with coins! Put coins in the dish until it matches the price.',
    make(level) {
      const vals = level === 0 ? [1] : level === 1 ? [10, 1] : level === 2 ? [10, 5, 1] : [25, 10, 5, 1];
      const price = level === 0 ? rint(3, 10) : level === 1 ? rint(11, 39) : level === 2 ? rint(15, 45) : rint(26, 60);
      const item = pick(['a bagel', 'a cookie', 'a juice', 'a pickle', 'a muffin', 'a bead pack']);
      return {
        kind: 'build', answer: price, key: `pay${price}`,
        prompt: `${item} costs ${price} cents. Pay with coins.`, show: `Pay ${price}¢`,
        goalText: `Price: ${price}¢`, sendLabel: 'Pay!', totalLabel: 'In the dish', fmt: v => `${v}¢`,
        buttons: vals.map((v, i) => ({ val: v, hot: i + 1, label: `${COINS[v].name} ${v}¢`, draw: (x, y, s) => drawRealCoin(v, x, y, 1.4) })),
        drawPlaced: (v, x, y) => drawRealCoin(v, x, y, 1.3),
        countSay: placed => `${placed.reduce((a, b) => a + b, 0)} cents`,
        unitSay: tot => `That's ${tot} cents.`,
        hint2: () => vals.includes(10) ? `Use dimes to count by tens, then pennies.` : '',
        rightSay: `${price} cents! Paid!`,
      };
    },
  }, o));
}

/* A ten-frame: 2 rows of 5 boxes, filled left to right. */
function tenFrame(n, cx, cy, cell = 14) {
  const x0 = cx - 2.5 * cell, y0 = cy - cell;
  for (let k = 0; k < 10; k++) {
    const x = x0 + (k % 5) * cell, y = y0 + Math.floor(k / 5) * cell;
    ctx.fillStyle = '#fffaf0'; ctx.fillRect(x, y, cell, cell); ctx.strokeStyle = OUT; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, cell, cell);
    if (k < n) { circle(x + cell / 2, y + cell / 2, cell * 0.36); paint('#ff8a1f', 1); }
  }
}

/* 11. Fish Facts: feed the fish with the right number. */
function factQ(level) {
  let a, b, op = '+';
  switch (Math.min(level, 5)) {
    case 0: a = rint(1, 8); b = rint(1, 2); break;
    case 1: { const s = rint(4, 10); a = rint(1, s - 1); b = s - a; break; }
    case 2: { a = rint(2, 9); b = 10 - a; return { parts: [a, '+', '?', '=', 10], ans: b, say: `${a} plus what makes ten?` }; }
    case 3: a = rint(4, 10); b = rint(1, a - 1); op = '-'; break;
    case 4: { a = rint(2, 9); b = a + pick([0, 0, 1]); break; }
    default: if (Math.random() < 0.5) { a = rint(6, 9); b = rint(11 - a, 9); } else { a = rint(11, 18); b = rint(a - 9, 9); op = '-'; }
  }
  const c = op === '+' ? a + b : a - b;
  return { parts: [a, op, b, '=', '?'], ans: c, say: `${a} ${op === '+' ? 'plus' : 'minus'} ${b}?`, a, b, op };
}
function drawFish(n, color) {
  return (cx, cy, r, sel, t) => {
    const bob = Math.sin(t * 2 + cx) * 5 - (sel ? 4 : 0);
    ctx.save(); ctx.translate(cx, cy + bob);
    ctx.beginPath(); ctx.moveTo(48, 0); ctx.lineTo(76, -26); ctx.lineTo(76, 26); ctx.closePath(); paint(shade(color, -0.15), 3);
    ellipse(0, 0, 60, 40); paint(color, sel ? 5 : 3, sel ? '#ff5fa2' : OUT);
    circle(-34, -10, 7); paint('#fff', 2); circle(-36, -10, 3.5); paint(OUT, 0);
    text(String(n), 8, 2, { size: 40, color: '#fff', lw: 6 });
    ctx.restore();
  };
}
function fishFacts(o) {
  return new Challenge(Object.assign({
    title: 'Fish Facts', skill: 'facts', count: 5, color: '#e6f6ff',
    intro: 'Feed the fish with the right answer!',
    make(level) {
      const q = factQ(level);
      const vals = numChoices(q.ans, [q.ans + 1, q.ans - 1, q.ans + 2, q.ans - 2, q.ans + 10], 3).map(c => c.val);
      const cols = ['#ff8a5a', '#4aa3ff', '#ffd23f'];
      return {
        kind: 'choice', answer: q.ans, numeric: true, key: q.parts.join(''), ch: 110, cw: 200, cy: PY + PH - 150,
        prompt: `${q.say} Feed the fish with the answer.`, show: `${q.parts.join(' ')}   Feed the right fish!`,
        choices: vals.map((v, i) => ({ val: v, say: String(v), draw: drawFish(v, cols[i]) })),
        hint1: v => `Not ${v}. Count the dots! ${q.say}`,
        hint2: () => q.op === '-' ? `Start at ${q.a} and count back ${q.b}.` : q.parts[2] === '?' ? `Count up from ${q.parts[0]} to ten.` : `Start at ${q.a} and count up ${q.b}.`,
        rightSay: `${q.parts.map(p => p === '?' ? q.ans : p === '+' ? 'plus' : p === '-' ? 'minus' : p === '=' ? 'equals' : p).join(' ')}!`,
        visual: (ch, it) => {
          rr(PX + 30, PY + 74, PW - 60, PH - 90, 20); paint('#bfe6ff', 0);
          const sp = 90, x0 = VW / 2 - 2 * sp;
          q.parts.forEach((p, i) => {
            const x = x0 + i * sp, s = String(p === '?' && it.solved ? q.ans : p);
            text(s, x, PY + 130, { size: 56, color: p === '?' && !it.solved ? '#ffb02e' : '#fff', lw: 7 });
            if (/^\d+$/.test(s) && +s <= 10 && (level <= 2 || it.wrongs >= 1) && !(p === '?' && !it.solved)) tenFrame(+s, x, PY + 190);
          });
          for (let k = 0; k < 6; k++) { const bx = PX + 60 + ((k * 137 + ch.t * 30) % (PW - 120)), by = PY + PH - 30 - ((ch.t * 40 + k * 70) % 300); circle(bx, by, 4); paint('rgba(255,255,255,.6)', 1, '#8ec5ff'); }
        },
      };
    },
  }, o));
}

/* Robot Words: nonsense words (like Acadience nonsense-word fluency). She hears the sounds, then picks the printed one. */
function robotWords(o) {
  const C = 'bdfghjklmnprstvz', V = 'aeiou';
  const make = (lv) => { let w; do { w = pick(C.split('')) + pick(V.split('')) + pick(C.split('')); if (lv >= 2 && Math.random() < 0.5) w = pick(['sh', 'ch', 'th']) + w.slice(1); } while (WORDS[w] || ['fuk', 'fak', 'dik', 'sek'].includes(w)); return w; };
  return new Challenge(Object.assign({
    title: 'Robot Words', skill: 'sounds', count: 4, color: '#eef4ff',
    intro: 'Beep boop! The robot speaks in silly made-up words. Listen to the sounds, then find its word!',
    make(level) {
      const w = make(level);
      // decoys change one sound: the first, the vowel, or the last
      const d1 = decoyFor(w[0], w) + w.slice(1), d2 = w.slice(0, -2) + decoyFor(w[w.length - 2], w) + w.slice(-1), d3 = w.slice(0, -1) + decoyFor(w[w.length - 1], w);
      const opts = shuffle([w, ...shuffle([d1, d2, d3].filter(x => x !== w)).slice(0, level >= 1 ? 2 : 1)]);
      return {
        kind: 'choice', answer: w, key: 'nonsense', word: null, cw: 200, ch: 110,
        prompt: `The robot says: ${segSpeech(w)}... ${w}. Which word did the robot say?`, show: 'Which word did the robot say?',
        choices: opts.map(x => ({ val: x, label: x, font: 'Andika' })),
        hint1: v => `Listen again: ${segSpeech(w)}... Look at each sound.`,
        hint2: () => `The first sound is ${sayPh(w.startsWith('sh') || w.startsWith('ch') || w.startsWith('th') ? w.slice(0, 2) : w[0])}. ${segSpeech(w)}.`,
        rightSay: `${w}! Beep boop!`,
        visual: (ch) => {
          const x = VW / 2, y = PY + 170, b = Math.sin(ch.t * 4) * 3;
          rr(x - 50, y - 60 + b, 100, 80, 16); paint('#c0c8d8', 3); rr(x - 34, y - 44 + b, 68, 34, 8); paint('#2a2a3a', 2);
          for (const ex of [-14, 14]) { circle(x + ex, y - 27 + b, 6); paint('#8be06b', 0); }
          rr(x - 3, y - 80 + b, 6, 20, 2); paint('#8a8a9a', 2); circle(x, y - 84 + b, 7); paint('#ff5f6a', 2);
          rr(x - 40, y + 24, 80, 50, 10); paint('#a8b0c0', 3);
        },
      };
    },
  }, o));
}

const CHALLENGES = { robotWords, soundSorter, labelFixer, syllableSnap, magicE, readFind, departureBoard, iceWriting, ticketCounter, countdownLaunch, gemCounting, bagelBundles, coinShop, fishFacts };
