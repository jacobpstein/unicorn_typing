'use strict';

/* Utilities, saved state, question generators and the adaptive engine. */

const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- Saved state ---------- */
const SAVE_KEY = 'holidayHop.v1';
const MAX_LEVEL = { math: 8, spell: 7 };

function defaultState() {
  return {
    name: 'Sadelle',
    look: { hair: '#5b3a24', skin: '#f2c9a0', color: '#ff5fa2' },
    costume: 'none',
    costumes: [],          // unlocked costume ids
    levels: {},            // levelId -> { done, stars: {clear, letters, secret}, best }
    coins: 0,
    gems: 0,               // Hebrew bonus gems
    hebrew: [],            // collected Hebrew letters
    stickers: [],
    lastPlayed: null,
    days: [],              // dates played (gentle streak: only ever counts up)
    math: { level: 1, sr: 0, sw: 0, hist: [], aid: 0, n: 0, retry: [], recent: [] },
    spell: { level: 1, tier: 0, t0: 0, sr: 0, sw: 0, hist: [], aid: 0, n: 0, retry: [], recent: [] },
    stats: { math: {}, spell: {}, missed: {}, hebrew: {} },
    settings: { sfxOff: false, musicOff: false, voice: '', speechRate: 1, hebrew: true, shake: true },
    played: {},
    ac: {}, acDays: {}, town: {}, speed: {}, orf: [],           // date -> seconds played
  };
}

function merge(base, saved) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return saved ?? base;
  const out = { ...base };
  for (const k of Object.keys(saved)) {
    out[k] = (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) ? merge(base[k], saved[k]) : saved[k];
  }
  return out;
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) return merge(defaultState(), JSON.parse(raw));
  } catch (e) { /* storage blocked or corrupt */ }
  return defaultState();
}
function saveState() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }

let S = defaultState(); // replaced by loadState() at boot

/* ---------- Math ---------- */
function mq(a, op, b, missing = null) {
  const c = op === '+' ? a + b : a - b;
  let parts, answer;
  if (missing === 'a') { parts = ['?', op, b, '=', c]; answer = a; }
  else if (missing === 'b') { parts = [a, op, '?', '=', c]; answer = b; }
  else { parts = [a, op, b, '=', '?']; answer = c; }
  return { kind: 'math', a, b, op, c, missing, parts, answer, key: parts.join('') };
}

function missingWithin(max) {
  const r = Math.random();
  const c = rint(3, max);
  if (r < 0.45) { const a = rint(0, c - 1); return mq(a, '+', c - a, 'b'); }
  if (r < 0.75) { const b = rint(1, c - 1); return mq(c - b, '+', b, 'a'); }
  const a = rint(3, max), b = rint(1, a - 1);
  return mq(a, '-', b, 'b');
}

const MathGen = {
  make(level) {
    let q;
    switch (level) {
      case 1: { const s = rint(2, 5); const a = rint(1, s - 1); q = mq(a, '+', s - a); break; }
      case 2: { const s = rint(4, 10); const a = rint(1, s - 1); q = mq(a, '+', s - a); break; }
      case 3: { const a = rint(3, 10); const b = rint(1, a); q = mq(a, '-', b); break; }
      case 4: q = Math.random() < 0.5 ? MathGen.make(2) : MathGen.make(3); break;
      case 5: q = missingWithin(10); break;
      case 6: {
        if (Math.random() < 0.35) { const a = rint(10, 17); q = mq(a, '+', rint(1, 20 - a)); }
        else { const s = rint(11, 20); const a = rint(s - 10, 10); q = mq(a, '+', s - a); }
        break;
      }
      case 7: { const a = rint(11, 20); const b = rint(1, Math.min(10, a)); q = mq(a, '-', b); break; }
      default: {
        const r = Math.random();
        q = r < 0.35 ? MathGen.make(6) : r < 0.7 ? MathGen.make(7) : missingWithin(20);
      }
    }
    q.level = level;
    return q;
  },

  choices(q, n) {
    const set = new Set([q.answer]);
    const cands = shuffle([1, -1, 2, -2, 3, -3, 10, -10].map(d => q.answer + d))
      .filter(v => v >= 0 && v <= 20 && Math.abs(v - q.answer) <= (q.answer > 10 ? 10 : 3));
    for (const v of cands) { if (set.size >= n) break; set.add(v); }
    let k = 4;
    while (set.size < n) set.add(q.answer + k++);
    return shuffle([...set]);
  },

  speech(q) {
    const w = { '+': 'plus', '-': 'minus' };
    const p = q.parts.map(x => x === '?' ? 'what' : x === '=' ? 'equals' : w[x] || String(x));
    return p.join(' ') + '?';
  },
  answerSpeech(q) {
    return `${q.a} ${q.op === '+' ? 'plus' : 'minus'} ${q.b} equals ${q.c}`;
  },
};

/* ---------- Words ---------- */
const Words = {
  make(level, recent, theme) {
    let pool = WORDS.filter(w => w.level === level && !recent.includes(w.word));
    if (!pool.length) pool = WORDS.filter(w => w.level === level);
    const w = pick(pool);
    return { kind: 'spell', word: w.word, sentence: w.sentence, level, key: w.word };
  },
};

/* ---------- Adaptive engine ---------- */
const Adaptive = {
  accuracy(st) { return st.hist.length ? st.hist.reduce((a, b) => a + b, 0) / st.hist.length : 0; },

  next(skill, opts = {}) {
    const st = S[skill];
    st.n++;
    let q = null;
    const due = st.retry.findIndex(r => r.due <= st.n);
    if (due >= 0 && !opts.maxLen) {
      q = st.retry.splice(due, 1)[0].q;
      q.retry = true;
    } else {
      let level = st.level, stretch = false;
      if (st.aid > 0) {
        // keep current level, just add support below
      } else if (st.sr >= 4 && st.level < MAX_LEVEL[skill]) {
        level = st.level + 1; stretch = true; st.sr = 0;
      } else if (st.level > 1 && Math.random() < 0.15) {
        level = rint(1, st.level - 1);
      }
      if (opts.maxLevel) level = Math.min(level, opts.maxLevel);
      for (let i = 0; i < 20; i++) {
        q = skill === 'math' ? MathGen.make(level) : Words.make(level, st.recent);
        if (st.recent.includes(q.key)) continue;
        if (opts.maxLen && q.word && q.word.length > opts.maxLen) continue;
        if (opts.maxAnswer != null && q.answer > opts.maxAnswer) continue;
        break;
      }
      q.stretch = stretch;
    }
    q.skill = skill;
    q.aid = st.aid > 0;
    if (st.aid > 0) st.aid--;
    st.recent.push(q.key);
    if (st.recent.length > 12) st.recent.shift();
    return q;
  },

  /* Returns an event: 'levelup', 'easier' or null. */
  record(q, correct) {
    const skill = q.skill, st = S[skill];
    let event = null;
    st.hist.push(correct ? 1 : 0);
    if (st.hist.length > 10) st.hist.shift();
    const lv = S.stats[skill][q.level] || (S.stats[skill][q.level] = [0, 0]);
    lv[1]++; if (correct) lv[0]++;

    if (correct) {
      st.sr++; st.sw = 0;
      if (q.stretch && this.accuracy(st) >= 0.8 && st.level < MAX_LEVEL[skill]) {
        st.level++; event = 'levelup';
      }
    } else {
      st.sw++; st.sr = 0;
      S.stats.missed[q.key] = (S.stats.missed[q.key] || 0) + 1;
      if (!q.stretch && st.retry.length < 6) {
        const copy = { ...q }; delete copy.retry; delete copy.aid;
        st.retry.push({ q: copy, due: st.n + rint(3, 5) });
      }
      if (st.sw >= 3) {
        st.sw = 0; st.aid = 2; event = 'easier';
        if (st.level > 1) st.level--;
      }
    }
    saveState();
    return event;
  },
};
