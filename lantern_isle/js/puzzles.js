'use strict';

/*
  Thinking puzzles for Lantern Isle. All are step-based and untimed: one key press or click is one move.
  Each is a Challenge with kind 'custom' (or 'choice'), so it shares the coins, adaptive levels and hint ladder.
  Hint ladder: Help / miss 1 restates the strategy, 2 narrows the problem, 3 glows the next single step only.
  The first time she meets a puzzle type, Mazel shows the way with the glow on and the item isn't graded.
*/

const HELP_BTN = { x: PX + PW - 150, y: PY + PH - 66, w: 130, h: 52 };

/* Mark a puzzle's first-ever item as a guided demo. */
function teach(type, it) {
  S.taught = S.taught || {};
  if (!S.taught[type]) { S.taught[type] = true; it.demo = true; it.prompt = `Mazel will show you how. Follow the glow! ${it.prompt}`; }
  return it;
}
/* Help button: climbs the same hint ladder. Asking twice means this one doesn't count as done alone. */
function helpUpdate(ch, it) {
  if (!(Input.clicked(HELP_BTN) || Input.key('h'))) return false;
  it.wrongs = Math.min(3, it.wrongs + 1);
  const hint = it.wrongs === 1 ? it.hint1 : it.wrongs === 2 ? it.hint2 : it.hint3;
  ch.say(typeof hint === 'function' ? hint() : hint || 'Look for the glow!', it.show);
  if (it.wrongs >= 2 && !it.graded) { it.graded = true; Adapt.record(ch.skill, it, false, it.key); }
  return true;
}
function helpDraw() { button('Help', HELP_BTN.x + HELP_BTN.w / 2, HELP_BTN.y + HELP_BTN.h / 2, HELP_BTN.w, HELP_BTN.h, { color: '#ffe680', size: 24 }); }
function glowRect(ch, x, y, w, h, r = 12) { ctx.globalAlpha = 0.55 + Math.sin(ch.t * 8) * 0.3; rr(x, y, w, h, r); paint('#fff07a', 0); ctx.globalAlpha = 1; }
function gridStep() { return Input.pressed('left') ? [-1, 0] : Input.pressed('right') ? [1, 0] : Input.pressed('up') ? [0, -1] : Input.pressed('down') ? [0, 1] : null; }
/* A click next to a square counts as a step toward it. */
function clickStep(px, py, x0, y0, cell) {
  if (!Input.click) return null;
  const cx = Math.floor((Input.click.x - x0) / cell), cy = Math.floor((Input.click.y - y0) / cell);
  const dx = cx - px, dy = cy - py;
  return Math.abs(dx) + Math.abs(dy) === 1 ? [dx, dy] : null;
}
const BOARD_TOP = PY + 78, BOARD_H = 376;

/* ---------- Maze ---------- */
function makeMazeGrid(n) {
  // cells [y][x] = {r:open right, d:open down}; a tree carved from the start, so every square is reachable
  const g = Array.from({ length: n }, () => Array.from({ length: n }, () => ({ r: false, d: false, seen: false })));
  const walk = [[0, 0]]; g[0][0].seen = true;
  while (walk.length) {
    const [x, y] = walk[walk.length - 1];
    const opts = shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]]).filter(([dx, dy]) => g[y + dy] && g[y + dy][x + dx] && !g[y + dy][x + dx].seen);
    if (!opts.length) { walk.pop(); continue; }
    const [dx, dy] = opts[0];
    if (dx === 1) g[y][x].r = true; if (dx === -1) g[y][x - 1].r = true; if (dy === 1) g[y][x].d = true; if (dy === -1) g[y - 1][x].d = true;
    g[y + dy][x + dx].seen = true; walk.push([x + dx, y + dy]);
  }
  return g;
}
const mazeOpen = (g, x, y, dx, dy) => dx === 1 ? g[y][x].r : dx === -1 ? (x > 0 && g[y][x - 1].r) : dy === 1 ? g[y][x].d : (y > 0 && g[y - 1][x].d);
function mazeRoute(g, n, sx, sy, gx, gy) {
  const prev = new Map([[sx + ',' + sy, null]]), q = [[sx, sy]];
  for (let h = 0; h < q.length; h++) {
    const [x, y] = q[h];
    if (x === gx && y === gy) break;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= n || ny >= n || !mazeOpen(g, x, y, dx, dy) || prev.has(nx + ',' + ny)) continue;
      prev.set(nx + ',' + ny, [x, y]); q.push([nx, ny]);
    }
  }
  const out = []; let c = [gx, gy];
  while (c) { out.unshift(c); c = prev.get(c[0] + ',' + c[1]); }
  return out;
}
function maze(o = {}) {
  return new Challenge(Object.assign({
    title: 'Maze', skill: 'maze', count: 2, color: '#eefbe8',
    intro: 'Help Mazel get to the light!',
    make(level) {
      const n = [7, 9, 9, 11, 11][Math.min(level, 4)], hasKey = level >= 1;
      const g = makeMazeGrid(n), keyAt = hasKey ? [rint(Math.floor(n / 2), n - 1), rint(0, Math.floor(n / 2) - 1)] : null, cell = Math.floor(BOARD_H / n), x0 = VW / 2 - cell * n / 2 - 40, y0 = BOARD_TOP;
      const it = teach('maze', {
        kind: 'custom', key: `maze${n}`, isRetry: true, n, g, px: 0, py: 0, got: !hasKey,
        prompt: hasKey ? 'Get the key first, then go to the light. Press an arrow, or click the next square.' : 'Press an arrow, or click the next square. One step at a time. Go to the light.', show: hasKey ? 'Get the key, then the light!' : 'Get to the light!',
        hint1: 'Look at the light. Which way goes to it? Try a way. You can always walk back.',
        hint2: 'See the little dot? It shows the next step.',
        hint3: 'Step on the glowing square!',
        rightSay: 'You got to the light!',
        target() { return it.got ? [n - 1, n - 1] : keyAt; },
        route() { const [a, b] = it.target(); return mazeRoute(g, n, it.px, it.py, a, b); },
        next() { return it.route()[1]; },
        step([dx, dy]) {
          if (!mazeOpen(g, it.px, it.py, dx, dy)) { Sfx.bonk(); return; }
          it.px += dx; it.py += dy; Sfx.plink((it.px + it.py) % 8); stepped(it);
          if (keyAt && !it.got && it.px === keyAt[0] && it.py === keyAt[1]) { it.got = true; Sfx.coin(); ch0(it).say('You got the key! Now go to the light.', 'Now go to the light!'); }
          if (it.px === n - 1 && it.py === n - 1) { if (it.got) ch0(it).grade(true); else ch0(it).say('The light is locked. Find the key first!', 'Find the key first!'); }
        },
        update(ch) {
          it.host = ch;
          if (helpUpdate(ch, it)) return;
          const s = gridStep() || clickStep(it.px, it.py, x0, y0, cell);
          if (s) it.step(s);
        },
        draw(ch) {
          it.host = ch;
          rr(x0 - 6, y0 - 6, cell * n + 12, cell * n + 12, 10); paint('#b8e0a0', 3);
          if (it.wrongs === 2 && !it.solved) it.route().slice(1, 2).forEach(([x, y]) => { circle(x0 + cell * (x + 0.5), y0 + cell * (y + 0.5), cell * 0.13); paint('#ff8a1f', 1.5); });
          if (it.wrongs >= 3 && !it.solved) { const [x, y] = it.next(); glowRect(ch, x0 + x * cell + 3, y0 + y * cell + 3, cell - 6, cell - 6, 8); }
          ctx.strokeStyle = '#3a6a3a'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath();
          for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
            const X = x0 + x * cell, Y = y0 + y * cell;
            if (!g[y][x].r && x < n - 1) { ctx.moveTo(X + cell, Y); ctx.lineTo(X + cell, Y + cell); }
            if (!g[y][x].d && y < n - 1) { ctx.moveTo(X, Y + cell); ctx.lineTo(X + cell, Y + cell); }
          }
          ctx.rect(x0, y0, cell * n, cell * n); ctx.stroke();
          const gx = x0 + cell * (n - 0.5), gy = y0 + cell * (n - 0.5);
          circle(gx, gy, cell * 0.36 + Math.sin(ch.t * 4) * 2); paint('#ffd23f', 2.5);
          if (keyAt && !it.got) { const kx = x0 + cell * (keyAt[0] + 0.5), ky = y0 + cell * (keyAt[1] + 0.5), q = cell / 40; circle(kx - 7 * q, ky, 7 * q); paint('#ffd23f', 2); rr(kx - 2 * q, ky - 2 * q, 15 * q, 5 * q, 1); paint('#ffd23f', 2); }
          drawMazelFace(x0 + cell * (it.px + 0.5), y0 + cell * (it.py + 0.5), cell * 0.32, false);
          helpDraw();
        },
        autoSolve(ch) { for (let k = 0; k < 400 && !it.solved; k++) { it.host = ch; it.step((([x, y]) => [x - it.px, y - it.py])(it.next())); } },
      });
      return it;
    },
  }, o));
}
const ch0 = it => it.host;
/* The glow shows one step. After that step she goes back to working on her own (except in the guided first go). */
const stepped = it => { if (it.wrongs >= 3 && !it.demo) it.wrongs = 2; };

/* ---------- Stepping Stones: walk a path by number or by sound. Reading and math inside a maze. ---------- */
function steppingPath(o) {
  return new Challenge(Object.assign({
    count: 2, color: '#e8f6ff',
    make(level) {
      const cols = 6, rows = 4, cell = 88, x0 = VW / 2 - cols * cell / 2 - 50, y0 = BOARD_TOP + 8;
      const g = this.gen(level);
      // a walk across the grid, never touching itself
      let path;
      for (let tries = 0; tries < 200; tries++) {
        path = [[0, rint(0, rows - 1)]];
        while (path.length < g.len) {
          const [x, y] = path[path.length - 1];
          const opts = [[1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => a < cols && b >= 0 && b < rows && !path.some(p => p[0] === a && p[1] === b) && path.filter(p => Math.abs(p[0] - a) + Math.abs(p[1] - b) === 1).length === 1);
          if (!opts.length) break;
          path.push(pick(opts));
        }
        if (path.length === g.len) break;
      }
      g.len = path.length;
      const cells = {};
      path.forEach((p, i) => { cells[p] = { label: g.at(i), good: i }; });
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (!cells[[x, y]]) {
        const near = path.findIndex(p => Math.abs(p[0] - x) + Math.abs(p[1] - y) === 1);
        cells[[x, y]] = { label: g.decoy(near, x, y), good: -1 };
      }
      const it = teach(this.title, {
        kind: 'custom', key: g.key, isRetry: true, pos: 0, numeric: false,
        prompt: g.prompt, show: g.show, hint1: g.hint1, hint2: g.hint2, hint3: 'Step on the glowing stone!', rightSay: g.done,
        tryStep(x, y) {
          if (x < 0 || y < 0 || x >= cols || y >= rows) return;
          const c = cells[[x, y]], next = path[it.pos + 1];
          if (next && next[0] === x && next[1] === y) {
            it.pos++; stepped(it); Sfx.plink(it.pos % 8); Speech.say(g.sayStep ? g.sayStep(it.pos) : String(c.label));
            if (it.pos >= path.length - 1) it.host.grade(true);
          } else if (!path.slice(0, it.pos + 1).some(p => p[0] === x && p[1] === y)) { it.host.grade(false, c.label); }
        },
        update(ch) {
          it.host = ch;
          if (helpUpdate(ch, it)) return;
          const [px, py] = path[it.pos];
          const s = gridStep() || clickStep(px, py, x0, y0, cell);
          if (s) it.tryStep(px + s[0], py + s[1]);
        },
        draw(ch) {
          it.host = ch;
          for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
            const c = cells[[x, y]], X = x0 + x * cell, Y = y0 + y * cell, idx = path.findIndex(p => p[0] === x && p[1] === y);
            const walked = idx >= 0 && idx <= it.pos, next = idx === it.pos + 1;
            if (next && it.wrongs >= 3) glowRect(ch, X - 2, Y - 2, cell, cell);
            rr(X + 4, Y + 4, cell - 8, cell - 8, 16); paint(walked ? '#a8e8a0' : '#ffffff', 3);
            text(String(c.label), X + cell / 2, Y + cell / 2, { size: String(c.label).length > 4 ? 25 : 34, font: 'Andika', color: OUT, stroke: null });
            if (Input.hover({ x: X, y: Y, w: cell, h: cell }) && Input.click && g.words && Math.abs(path[it.pos][0] - x) + Math.abs(path[it.pos][1] - y) > 1) Speech.say(String(c.label));
          }
          const [px, py] = path[it.pos];
          drawMazelFace(x0 + px * cell + cell - 16, y0 + py * cell + 16, 15, false);
          helpDraw();
        },
        autoSolve(ch) { it.host = ch; while (it.pos < path.length - 1 && !it.solved) { const n = path[it.pos + 1]; it.tryStep(n[0], n[1]); } },
      });
      return it;
    },
  }, o));
}
function numberPath(o = {}) {
  return steppingPath(Object.assign({
    title: 'Number Stones', skill: 'skipcount', intro: 'Hop on the stones. Find the jump!',
    gen(level) {
      let r; do { r = skipSeq(level, 6); } while (Math.max(...r.seq) > 150);
      const { seq, step, by, down } = r, hide = level >= 3;
      return {
        len: 6, key: `${seq[0]}${down ? '-' : '+'}${by}`, at: i => seq[i],
        decoy: (i) => {
          const near = seq[Math.min(Math.max(i, 0) + 1, 5)];
          const opts = [near + 1, near - 1, near + step, near - 2 * step, near + 2, near + by + 1].filter(v => v >= 0 && !seq.includes(v));
          return opts.length ? pick(opts) : near + 3;
        },
        prompt: hide ? `Start on ${seq[0]}. The next stone is ${seq[1]}. Find the jump, and keep going!` : `Start on ${seq[0]}. Count ${down ? 'down ' : ''}by ${by}s.`,
        show: hide ? `Start on ${seq[0]}, then ${seq[1]}. Find the jump!` : `Start on ${seq[0]}. Count ${down ? 'down ' : ''}by ${by}s!`,
        hint1: hide ? `How far is it from ${seq[0]} to ${seq[1]}? Keep making that same jump.` : `Each jump is ${by}. Count ${down ? 'back' : 'on'} from the stone you are on.`,
        hint2: `Count ${down ? 'back' : 'on'} ${by} on your fingers from the stone you are on.`,
        done: `${seq.join(', ')}!`,
      };
    },
  }, o));
}
const WORD_PATTERNS = [
  { name: 'at', say: 'words that end in at, like cat', good: ['cat', 'hat', 'bat', 'mat', 'sat', 'rat', 'pat'], bad: ['cot', 'hit', 'bet', 'mop', 'cut', 'hot', 'pet'], tier: 0 },
  { name: 'ig', say: 'words that end in ig, like pig', good: ['pig', 'big', 'dig', 'wig', 'fig', 'jig', 'rig'], bad: ['peg', 'bag', 'dug', 'hog', 'wag', 'log', 'rug'], tier: 0 },
  { name: 'sh', say: 'words that start with shh, like ship', good: ['ship', 'shop', 'shell', 'shed', 'shut', 'shin', 'shot'], bad: ['chip', 'chop', 'sip', 'sell', 'chin', 'hop', 'thin'], tier: 1 },
  { name: 'ck', say: 'words that end in c k, like duck', good: ['duck', 'sock', 'rock', 'kick', 'back', 'luck', 'pack'], bad: ['dug', 'sob', 'rob', 'kid', 'bat', 'lug', 'pan'], tier: 1 },
  { name: 'magic e', say: 'words with a magic e, like cake', good: ['cake', 'kite', 'home', 'bone', 'cube', 'rope', 'bike'], bad: ['cat', 'kit', 'hop', 'bun', 'cub', 'rot', 'bit'], tier: 2 },
];
function wordPath(o = {}) {
  return steppingPath(Object.assign({
    title: 'Word Stones', skill: 'sounds', words: true, intro: 'Only step on the right kind of word!',
    gen(level) {
      const tier = level <= 0 ? 0 : level <= 2 ? 1 : 2;
      const pat = pick(WORD_PATTERNS.filter(p => p.tier === tier));
      const goods = shuffle(pat.good), bads = shuffle(pat.bad.concat(pat.bad)); let b = 0;
      return {
        len: 6, key: `path-${pat.name}`, at: i => goods[i % goods.length], decoy: () => bads[b++ % bads.length], words: true,
        sayStep: i => goods[i % goods.length],
        prompt: `Step only on ${pat.say}. Start on ${goods[0]}.`, show: `Only step on: ${pat.name}`,
        hint1: `Read the stones next to you. We want ${pat.say}.`,
        hint2: `Sound out each stone next to you, slowly. ${pat.say}.`,
        done: `${goods.slice(0, 6).join(', ')}!`,
      };
    },
  }, o));
}

/* ---------- Skip counting: 2s, 3s, 4s, 5s and beyond, up and down, on and off the multiples ---------- */
function skipSeq(level, len = 5) {
  const lv = Math.min(level, 6);
  const plans = [
    () => pick([[2, 'even'], [5, 'zero'], [2, 'even']]),
    () => pick([[5, 'zero'], [10, 'off'], [2, 'odd']]),
    () => pick([[3, 'zero'], [2, 'odd'], [-2, 'even'], [10, 'off']]),
    () => pick([[3, 'any'], [4, 'zero'], [-5, 'zero'], [-10, 'off']]),
    () => pick([[4, 'any'], [6, 'zero'], [-3, 'zero'], [5, 'off']]),
    () => pick([[6, 'any'], [7, 'zero'], [8, 'zero'], [-4, 'zero'], [-6, 'zero']]),
    () => pick([[7, 'any'], [8, 'any'], [9, 'zero'], [-7, 'zero'], [-8, 'zero'], [-3, 'any']]),
  ];
  const [step, kind] = plans[lv]();
  const by = Math.abs(step), m = by * rint(0, 3);
  let first = kind === 'zero' ? m : kind === 'even' ? 2 * rint(0, 6) : kind === 'odd' ? 2 * rint(0, 6) + 1 : kind === 'off' ? rint(1, by - 1) + by * rint(0, 3) : rint(1, 9) + by * rint(0, 2);
  if (step < 0) first += by * (len - 1);         // going down must never pass zero
  return { seq: Array.from({ length: len }, (_, i) => first + i * step), step, by, down: step < 0 };
}
function skipCounting(o = {}) {
  return new Challenge(Object.assign({
    title: 'Skip Counting', skill: 'skipcount', count: 4, color: '#fff4e4',
    intro: 'Find the jump, then keep counting!',
    make(level) {
      const { seq, step, by, down } = skipSeq(level);
      const askRule = level >= 2 && Math.random() < 0.3, hideRule = level >= 3;
      if (askRule) {
        return teach('skip', {
          kind: 'choice', answer: by, numeric: true, key: `rule${by}`, ch: 100, cw: 120, cy: PY + PH - 124,
          prompt: `${seq.join(', ')}. What are we counting by?`, show: 'What is the jump each time?',
          choices: shuffle([by, ...shuffle([2, 3, 4, 5, 6, 7, 8, 9, 10].filter(v => v !== by)).slice(0, 3)]).map(v => ({ val: v, label: v, font: 'Fredoka', size: 52, say: `by ${v}s` })),
          hint1: 'Pick two numbers next to each other. How far apart are they?',
          hint2: () => `Start at ${seq[0]}. Count ${down ? 'back' : 'on'} by ones until you get to ${seq[1]}.`,
          rightSay: `We are counting ${down ? 'down ' : ''}by ${by}s!`,
          visual: (ch, it) => drawNumberRow(seq, -1, VW / 2, PY + 150, { gap: 128, colorDigits: false, step, showStep: it.solved }),
        });
      }
      const blank = rint(1, seq.length - 1), ans = seq[blank];
      const spoken = seq.map((v, i) => i === blank ? 'what' : v).join(', ');
      const prev = seq[blank - 1];
      return teach('skip', {
        kind: 'choice', answer: ans, numeric: true, key: `${seq[0]}${down ? '-' : '+'}${by}`, ch: 110, cw: 150, cy: PY + PH - 134,
        prompt: hideRule ? `${spoken}? Find the jump.` : `Count ${down ? 'down ' : ''}by ${by}s: ${spoken}?`,
        show: hideRule ? 'Find the jump! What number is missing?' : `Count ${down ? 'down ' : ''}by ${by}s!`,
        choices: numChoices(ans, [ans + step, ans - step, ans + 1, ans - 1, ans + 2, ans - 2, ans + 10]).concat([]),
        hint1: v => `Not ${v}. ${hideRule ? 'How far apart are the numbers next to each other?' : `Each jump is ${by}.`}`,
        hint2: () => `Start at ${prev}. Count ${down ? 'back' : 'on'} ${by} more on your fingers.`,
        why: ['I found the jump', 'I just picked one'], whyGood: 0,
        rightSay: `${seq.join(', ')}! ${down ? 'Down ' : ''}by ${by}s!`,
        visual: (ch, it) => drawNumberRow(seq, blank, VW / 2, PY + 150, { gap: 128, colorDigits: false, step, showStep: it.wrongs >= 1 || !hideRule, filled: it.solved ? ans : null }),
      });
    },
  }, o));
}

/* ---------- Door Code: the ones wheel is frozen, only the tens wheel turns. ---------- */
function doorCode(o = {}) {
  return new Challenge(Object.assign({
    title: 'Door Code', skill: 'count10', count: 3, color: '#f4f0ff',
    intro: 'Turn the tens wheel to open the lock!',
    make(level) {
      const { seq, step } = count10Seq(Math.max(1, level));
      const blank = rint(2, seq.length - 1), ans = seq[blank], ones = ans % 10, tens = Math.floor(ans / 10);
      const spoken = seq.map((v, i) => i === blank ? 'what' : v).join(', ');
      const set = [tens, ...shuffle([tens + 1, tens - 1, tens + 2, tens - 2].filter(v => v >= 0 && v <= 12)).slice(0, 2)];
      return teach('doorcode', {
        kind: 'choice', answer: tens, key: `${seq[0]}${step > 0 ? '+' : '-'}10`, ch: 100, cw: 150, cy: PY + PH - 136,
        prompt: `Count by tens${step < 0 ? ' going down' : ''}: ${spoken}? The ones wheel is stuck on ${ones}. Turn the tens wheel!`, show: 'Which tens number opens the lock?',
        choices: shuffle(set).map(v => ({ val: v, label: v, font: 'Fredoka', size: 52, say: `${v} tens` })),
        hint1: v => `${v}${ones} is not next. ${step > 0 ? 'Ten more' : 'Ten less'} means the tens wheel moves one. ${spoken}?`,
        hint2: () => `Look at the number just before. Its tens wheel is ${Math.floor(seq[blank - 1] / 10)}. Go ${step > 0 ? 'up' : 'down'} one.`,
        rightSay: `${seq.join(', ')}!`,
        visual: (ch, it) => {
          drawNumberRow(seq, blank, VW / 2, PY + 122, { gap: 128, filled: it.solved ? ans : null });
          const wx = VW / 2 - 56, wy = PY + 212;
          rr(wx - 44, wy - 44, 88, 88, 14); paint('#ffe0bc', 3); text(it.solved ? String(tens) : '?', wx, wy, { size: 56, color: '#ff8a1f', stroke: null });
          rr(wx + 68, wy - 44, 88, 88, 14); paint('#d0f0ec', 3); text(String(ones), wx + 112, wy, { size: 56, color: '#1ca8a0', stroke: null });
          text('tens', wx, wy + 58, { size: 18, color: OUT, stroke: null }); text('ones', wx + 112, wy + 58, { size: 18, color: OUT, stroke: null });
        },
      });
    },
  }, o));
}

/* ---------- Boulder Push ---------- */
const BOULDER_LEVELS = [
  [['######', '#....#', '#PB.O#', '#....#', '######'], ['######', '#.O..#', '#....#', '#.B..#', '#.P..#', '######'], ['######', '#P...#', '#.B..#', '#...O#', '######']],
  [['#######', '#O...O#', '#.....#', '#.B.B.#', '#..P..#', '#######'], ['#######', '#P.B.O#', '#.....#', '#O.B..#', '#.....#', '#######'], ['#######', '#..O..#', '#.B#B.#', '#..P..#', '#..O..#', '#######']],
  [['########', '#P.....#', '#.B#.B.#', '#..#...#', '#O...O.#', '########'], ['########', '#O.B.P.#', '#.##.#.#', '#..B..O#', '#......#', '########'], ['#########', '#P......#', '#.B.B.B.#', '#.......#', '#O..O..O#', '#########']],
  [['#########', '#O#...#O#', '#...B...#', '#.B.#.B.#', '#...P...#', '#...O...#', '#########'], ['########', '#P.....#', '#.B.B..#', '#.#..B.#', '#O.O.O.#', '########'], ['#########', '#P..#...#', '#.B...B.#', '#.#.B.#.#', '#O..O..O#', '#########']],
];
function boulderKey(px, py, bs) { return px + ',' + py + '|' + bs.map(b => b.join(',')).sort().join(';'); }
function parseBoulder(rows) {
  const out = { rows, walls: new Set(), goals: [], bs: [], px: 0, py: 0, w: rows[0].length, h: rows.length };
  rows.forEach((r, y) => r.split('').forEach((c, x) => {
    if (c === '#') out.walls.add(x + ',' + y); if (c === 'O') out.goals.push([x, y]); if (c === 'B') out.bs.push([x, y]); if (c === 'P') { out.px = x; out.py = y; }
  }));
  return out;
}
/* Shortest moves from a position, or null if it can't be finished. */
function solveBoulder(L, px, py, bs) {
  const win = s => s.every(b => L.goals.some(g => g[0] === b[0] && g[1] === b[1]));
  const start = { px, py, bs, path: [] };
  if (win(bs)) return [];
  const seen = new Set([boulderKey(px, py, bs)]), q = [start];
  for (let h = 0; h < q.length && h < 90000; h++) {
    const s = q[h];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = s.px + dx, ny = s.py + dy;
      if (L.walls.has(nx + ',' + ny)) continue;
      const i = s.bs.findIndex(b => b[0] === nx && b[1] === ny);
      let nbs = s.bs;
      if (i >= 0) {
        const bx = nx + dx, by = ny + dy;
        if (L.walls.has(bx + ',' + by) || s.bs.some(b => b[0] === bx && b[1] === by)) continue;
        nbs = s.bs.map((b, k) => k === i ? [bx, by] : b);
      }
      const key = boulderKey(nx, ny, nbs);
      if (seen.has(key)) continue;
      seen.add(key);
      const path = s.path.concat([[dx, dy]]);
      if (win(nbs)) return path;
      q.push({ px: nx, py: ny, bs: nbs, path });
    }
  }
  return null;
}
/* Every position in a level, and how many moves it is from winning. Built once per level, so hints and the
   "stuck" check are instant and always right (the old search gave up on big levels and said "stuck" by mistake). */
const BOULDER_DIST = new Map();
function boulderNext(L, px, py, bs, dx, dy) {
  const nx = px + dx, ny = py + dy;
  if (L.walls.has(nx + ',' + ny)) return null;
  const i = bs.findIndex(b => b[0] === nx && b[1] === ny);
  if (i < 0) return { px: nx, py: ny, bs, push: false };
  const bx = nx + dx, by = ny + dy;
  if (L.walls.has(bx + ',' + by) || bs.some(b => b[0] === bx && b[1] === by)) return null;
  return { px: nx, py: ny, bs: bs.map((b, k) => k === i ? [bx, by] : b), push: true };
}
function boulderDistances(L) {
  const id = L.rows.join('/');
  if (BOULDER_DIST.has(id)) return BOULDER_DIST.get(id);
  const win = bs => bs.every(b => L.goals.some(g => g[0] === b[0] && g[1] === b[1]));
  const keys = [], back = [], index = new Map(), wins = [];
  const addState = (px, py, bs) => { const k = boulderKey(px, py, bs); if (index.has(k)) return index.get(k); const n = keys.length; index.set(k, n); keys.push({ px, py, bs }); back.push([]); if (win(bs)) wins.push(n); return n; };
  addState(L.px, L.py, L.bs);
  for (let h = 0; h < keys.length; h++) {
    const s0 = keys[h];
    if (win(s0.bs)) continue;            // a finished puzzle ends here
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = boulderNext(L, s0.px, s0.py, s0.bs, dx, dy);
      if (nx) back[addState(nx.px, nx.py, nx.bs)].push(h);
    }
  }
  const dist = new Map(), d = new Int32Array(keys.length).fill(-1), q = wins.slice();
  wins.forEach(n => { d[n] = 0; });
  for (let h = 0; h < q.length; h++) for (const p of back[q[h]]) if (d[p] < 0) { d[p] = d[q[h]] + 1; q.push(p); }
  index.forEach((n, k) => { if (d[n] >= 0) dist.set(k, d[n]); });
  BOULDER_DIST.set(id, dist);
  return dist;
}
/* The best next step from here, or null if this position can't be finished. */
function boulderHint(L, px, py, bs) {
  const dist = boulderDistances(L), here = dist.get(boulderKey(px, py, bs));
  if (here == null || here === 0) return null;
  for (const m of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = boulderNext(L, px, py, bs, m[0], m[1]); if (nx && dist.get(boulderKey(nx.px, nx.py, nx.bs)) === here - 1) return m; }
  return null;
}
const boulderSolvable = (L, px, py, bs) => boulderDistances(L).has(boulderKey(px, py, bs));
function boulderPush(o = {}) {
  return new Challenge(Object.assign({
    title: 'Boulder Push', skill: 'boulder', count: 2, color: '#f6eee0',
    intro: 'Push each boulder onto a glowing circle!',
    make(level) {
      const first = !(S.taught && S.taught.boulder);   // the very first one has a single boulder
      const tier = BOULDER_LEVELS[first ? 0 : Math.min(level + 1, BOULDER_LEVELS.length - 1)];
      const L = parseBoulder(pick(tier));
      boulderDistances(L);
      const cell = Math.min(62, Math.floor(BOARD_H / L.h)), x0 = VW / 2 - cell * L.w / 2 - 50, y0 = BOARD_TOP + (BOARD_H - cell * L.h) / 2;
      const it = teach('boulder', {
        kind: 'custom', key: `push${L.bs.length}`, isRetry: true, px: L.px, py: L.py, bs: L.bs.map(b => b.slice()), undo: [], walk: [], walkT: 0,
        prompt: 'Stand behind a boulder, then walk into it to push. Use the arrows, or click a square to walk there. If you get stuck, press Undo!', show: 'Push the boulders onto the circles!',
        hint1: 'Stand behind the boulder. Which way will it go when you push?',
        hint2: 'Look at the boulder, then the circle. Which side do you need to push from?',
        hint3: 'Step on the glowing square!',
        rightSay: 'All the boulders are on the circles!',
        nextMove() { return boulderHint(L, it.px, it.py, it.bs); },
        won() { return it.bs.every(b => L.goals.some(g => g[0] === b[0] && g[1] === b[1])); },
        move([dx, dy]) {
          const nx = it.px + dx, ny = it.py + dy;
          if (L.walls.has(nx + ',' + ny)) { Sfx.bonk(); return; }
          const b = it.bs.find(q => q[0] === nx && q[1] === ny);
          if (b && (L.walls.has((nx + dx) + ',' + (ny + dy)) || it.bs.some(q => q[0] === nx + dx && q[1] === ny + dy))) { Sfx.bonk(); return; }
          it.undo.push({ px: it.px, py: it.py, bs: it.bs.map(q => q.slice()) });
          it.px = nx; it.py = ny; stepped(it);
          if (b) { b[0] += dx; b[1] += dy; Sfx.pop(); } else Sfx.click();
          if (it.won()) { it.host.grade(true); return; }
          if (b && !boulderSolvable(L, it.px, it.py, it.bs)) it.host.say('Oh, that boulder is stuck. No problem! Press Undo.', 'Stuck! Press Undo.');
        },
        back() { it.walk = []; const u = it.undo.pop(); if (u) { it.px = u.px; it.py = u.py; it.bs = u.bs; Sfx.click(); } },
        reset() { it.walk = []; it.px = L.px; it.py = L.py; it.bs = L.bs.map(b => b.slice()); it.undo = []; Sfx.click(); },
        /* A click: next to Mazel, step or push that way. Farther away, walk there around the boulders. */
        clickAt(cx, cy) {
          if (cx < 0 || cy < 0 || cx >= L.w || cy >= L.h) return;
          const dx = cx - it.px, dy = cy - it.py;
          if (Math.abs(dx) + Math.abs(dy) === 1) { it.walk = []; it.move([dx, dy]); return; }
          if (it.bs.some(b => b[0] === cx && b[1] === cy)) { it.host.say('Walk right next to the boulder first. Then click it to push it.', 'Walk next to it, then click it!'); return; }
          if (L.walls.has(cx + ',' + cy)) return;
          const prev = new Map([[it.px + ',' + it.py, null]]), q = [[it.px, it.py]];
          for (let h = 0; h < q.length; h++) {
            const [x, y] = q[h];
            for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const nx = x + ax, ny = y + ay, k = nx + ',' + ny;
              if (prev.has(k) || L.walls.has(k) || it.bs.some(b => b[0] === nx && b[1] === ny)) continue;
              prev.set(k, [x, y, ax, ay]); q.push([nx, ny]);
            }
          }
          if (!prev.has(cx + ',' + cy)) { Sfx.bonk(); return; }
          const steps = []; let k = cx + ',' + cy;
          while (prev.get(k)) { const [x, y, ax, ay] = prev.get(k); steps.unshift([ax, ay]); k = x + ',' + y; }
          it.walk = steps; it.walkT = 0;
        },
        update(ch) {
          it.host = ch;
          if (helpUpdate(ch, it)) return;
          if (Input.key('u') || Input.clicked({ x: HELP_BTN.x, y: HELP_BTN.y - 130, w: 130, h: 52 })) return it.back();
          if (Input.key('r') || Input.clicked({ x: HELP_BTN.x, y: HELP_BTN.y - 65, w: 130, h: 52 })) return it.reset();
          const s = gridStep();
          if (s) { it.walk = []; it.move(s); return; }
          if (Input.click && Input.click.x >= x0 && Input.click.y >= y0) { it.clickAt(Math.floor((Input.click.x - x0) / cell), Math.floor((Input.click.y - y0) / cell)); return; }
          if (it.walk.length) { it.walkT -= DT; if (it.walkT <= 0) { it.walkT = 0.12; it.move(it.walk.shift()); } }
        },
        draw(ch) {
          it.host = ch;
          for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) {
            const X = x0 + x * cell, Y = y0 + y * cell, wall = L.walls.has(x + ',' + y);
            ctx.fillStyle = wall ? '#7a6a5a' : (x + y) % 2 ? '#f0e4cc' : '#e6d8bc'; ctx.fillRect(X, Y, cell, cell);
          }
          L.goals.forEach(([x, y]) => { circle(x0 + cell * (x + 0.5), y0 + cell * (y + 0.5), cell * 0.36); paint('rgba(255,210,63,.65)', 3, '#e0a020'); });
          if (it.wrongs >= 3 && !it.won()) { const m = it.nextMove(); if (m) glowRect(ch, x0 + (it.px + m[0]) * cell + 3, y0 + (it.py + m[1]) * cell + 3, cell - 6, cell - 6, 8); }
          it.bs.forEach(([x, y]) => { const on = L.goals.some(g => g[0] === x && g[1] === y); circle(x0 + cell * (x + 0.5), y0 + cell * (y + 0.5), cell * 0.4); paint(on ? '#8be06b' : '#a89a8a', 3); });
          drawMazelFace(x0 + cell * (it.px + 0.5), y0 + cell * (it.py + 0.5), cell * 0.32, false);
          button('Undo', HELP_BTN.x + 65, HELP_BTN.y - 104, 130, 52, { color: '#bfe6ff', size: 24 });
          button('Start over', HELP_BTN.x + 65, HELP_BTN.y - 39, 130, 52, { color: '#e0d8e8', size: 20 });
          helpDraw();
        },
        autoSolve(ch) { it.host = ch; for (let k = 0; k < 200 && !it.solved; k++) { const m = it.nextMove(); if (!m) break; it.move(m); } },
      });
      return it;
    },
  }, o));
}

/* ---------- Light Beams: click a mirror to flip it. ---------- */
const reflect = (m, [dx, dy]) => m === '/' ? [-dy, -dx] : [dy, dx];   // '/' turns east to north; '\' turns east to south
function makeBeams(mirrors, cols, rows) {
  for (let tries = 0; tries < 400; tries++) {
    const start = [-1, rint(0, rows - 1)];
    let x = start[0], y = start[1], d = [1, 0];
    const used = new Set(), ms = [];
    let ok = true;
    for (let m = 0; m <= mirrors && ok; m++) {
      const len = rint(m === 0 ? 2 : 1, 3);
      for (let k = 0; k < len; k++) {
        x += d[0]; y += d[1];
        if (x < 0 || y < 0 || x >= cols || y >= rows || used.has(x + ',' + y)) { ok = false; break; }
        used.add(x + ',' + y);
      }
      if (!ok) break;
      if (m === mirrors) break;
      const opts = d[0] ? [[0, 1], [0, -1]] : [[1, 0], [-1, 0]];
      const nd = pick(opts);
      const shape = reflect('/', d)[0] === nd[0] && reflect('/', d)[1] === nd[1] ? '/' : '\\';
      ms.push({ x, y, right: shape, now: shape });
      d = nd;
    }
    if (ok && ms.length === mirrors && x >= 0) return { startY: start[1], ms, crystal: [x, y], used };
  }
  return null;
}
function traceBeam(B, cols, rows) {
  let x = -1, y = B.startY, d = [1, 0]; const pts = [[x, y]]; let hit = false;
  for (let k = 0; k < 40; k++) {
    x += d[0]; y += d[1];
    if (x < 0 || y < 0 || x >= cols || y >= rows) { pts.push([x, y]); break; }
    pts.push([x, y]);
    if (x === B.crystal[0] && y === B.crystal[1]) { hit = true; break; }
    const m = B.ms.find(q => q.x === x && q.y === y);
    if (m) d = reflect(m.now, d);
  }
  return { pts, hit };
}
function lightBeams(o = {}) {
  return new Challenge(Object.assign({
    title: 'Light Beams', skill: 'beams', count: 3, color: '#eef0ff',
    intro: 'Flip the mirrors to send the light to the crystal!',
    make(level) {
      const cols = 7, rows = 5, cell = 72, x0 = VW / 2 - cols * cell / 2 - 30, y0 = BOARD_TOP + 8;
      const n = [3, 3, 4, 4][Math.min(level, 3)], decoys = [1, 2, 2, 3][Math.min(level, 3)];
      const B = makeBeams(n, cols, rows);
      B.ms.forEach(m => { m.now = m.right; });
      // start with mirrors flipped so the beam misses; every mirror that starts wrong is one click to fix
      B.ms.forEach((m, i) => { if (i === 0 || Math.random() < 0.6) m.now = m.right === '/' ? '\\' : '/'; });
      if (traceBeam(B, cols, rows).hit) B.ms[B.ms.length - 1].now = B.ms[B.ms.length - 1].right === '/' ? '\\' : '/';
      // extra mirrors that are not part of the answer, so she has to follow the light
      const free = []; for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (!B.used.has(x + ',' + y) && y !== B.startY) free.push([x, y]);
      shuffle(free).slice(0, decoys).forEach(([x, y]) => { const c = pick(['/', '\\']); B.ms.push({ x, y, right: c, now: c, decoy: true }); });
      const it = teach('beams', {
        kind: 'custom', key: `beam${n}`, isRetry: true, B, clicks: 0, sel: 0,
        prompt: 'Click a mirror to flip it. Where does the light hit next?', show: 'Send the light to the crystal!',
        hint1: 'Follow the light with your eyes. Where does it hit first? Which way should it bounce?',
        hint2: 'Start at the sun. Follow the line. At each mirror, does the light turn toward the crystal?',
        hint3: 'Click the glowing mirror!',
        rightSay: 'The crystal is shining!',
        wrongMirror() { return B.ms.find(m => !m.decoy && m.now !== m.right); },
        flip(m) {
          m.now = m.now === '/' ? '\\' : '/'; it.clicks++; Sfx.click(); stepped(it);
          if (traceBeam(B, cols, rows).hit) {
            // many extra flips means it was luck, so it doesn't count as done alone
            if (it.clicks > n + 1 && !it.graded) { it.graded = true; Adapt.record(it.host.skill, it, false, it.key); }
            it.host.grade(true);
          }
        },
        update(ch) {
          it.host = ch;
          if (helpUpdate(ch, it)) return;
          if (Input.pressed('left') || Input.pressed('up')) { it.sel = (it.sel + B.ms.length - 1) % B.ms.length; Sfx.click(); }
          if (Input.pressed('right') || Input.pressed('down')) { it.sel = (it.sel + 1) % B.ms.length; Sfx.click(); }
          for (const [i, m] of B.ms.entries()) {
            const r = { x: x0 + m.x * cell, y: y0 + m.y * cell, w: cell, h: cell };
            if (Input.hover(r)) it.sel = i;
            if (Input.clicked(r)) { it.flip(m); return; }
          }
          if (Input.key(' ') || Input.key('enter')) it.flip(B.ms[it.sel]);
        },
        draw(ch) {
          it.host = ch;
          rr(x0 - 60, y0 - 4, cell * cols + 66, cell * rows + 8, 10); paint('#2e3560', 3);
          for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { rr(x0 + x * cell + 3, y0 + y * cell + 3, cell - 6, cell - 6, 6); paint('#3c447a', 0); }
          const center = ([x, y]) => [x0 + cell * (x + 0.5), y0 + cell * (y + 0.5)];
          const { pts, hit } = traceBeam(B, cols, rows);
          ctx.save(); ctx.beginPath(); ctx.rect(x0 - 60, y0 - 4, cell * cols + 66, cell * rows + 8); ctx.clip(); ctx.strokeStyle = '#ffe680'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); pts.forEach((p, i) => { const [a, b] = center(p); if (i) ctx.lineTo(a, b); else ctx.moveTo(a, b); }); ctx.stroke(); ctx.restore();
          const wm = it.wrongMirror();
          B.ms.forEach((m, i) => {
            const [a, b] = center([m.x, m.y]), R = cell * 0.36;
            if (wm === m && it.wrongs >= 3) glowRect(ch, a - cell / 2 + 2, b - cell / 2 + 2, cell - 4, cell - 4, 8);
            circle(a, b, R + 6); paint(i === it.sel ? '#ff5fa2' : '#6a74b0', 2);
            ctx.strokeStyle = '#dff2ff'; ctx.lineWidth = 8; ctx.beginPath();
            if (m.now === '/') { ctx.moveTo(a - R, b + R); ctx.lineTo(a + R, b - R); } else { ctx.moveTo(a - R, b - R); ctx.lineTo(a + R, b + R); } ctx.stroke(); ctx.setLineDash([]);
          });
          const [cx, cy] = center(B.crystal);
          ctx.beginPath(); ctx.moveTo(cx, cy - 26); ctx.lineTo(cx + 19, cy); ctx.lineTo(cx, cy + 26); ctx.lineTo(cx - 19, cy); ctx.closePath(); paint(hit ? '#ffd23f' : '#b07cff', 3);
          const [lx, ly] = center([-1, B.startY]); circle(lx + 12, ly, 18); paint('#ffd23f', 3);
          helpDraw();
        },
        autoSolve(ch) { it.host = ch; let m; while (!it.solved && (m = it.wrongMirror())) it.flip(m); },
      });
      return it;
    },
  }, o));
}

/* ---------- Suspect Lineup: read decodable clues, cross off who doesn't fit. ---------- */
const CLUE_BANK = [
  // tier 0: short-vowel words. key = picture trait on the suspect. Negative clues only from level 2.
  { tag: 'hat', yes: 'The kid has a hat.', no: 'The kid has no hat.', word: 'hat', tier: 0 },
  { tag: 'bag', yes: 'The kid has a bag.', no: 'The kid has no bag.', word: 'bag', tier: 0 },
  { tag: 'dog', yes: 'The kid has a pet dog.', no: 'The kid has no dog.', word: 'dog', tier: 0 },
  { tag: 'cat', yes: 'The kid is with a cat.', no: 'The kid has no cat.', word: 'cat', tier: 0 },
  { tag: 'fan', yes: 'I met a kid with a fan.', no: 'The kid has no fan.', word: 'fan', tier: 0 },
  { tag: 'cup', yes: 'The kid has a cup.', no: 'The kid has no cup.', word: 'cup', tier: 0 },
  { tag: 'pig', yes: 'The kid is with a pig.', no: 'The kid has no pig.', word: 'pig', tier: 0 },
  // tier 1: blends and digraphs
  { tag: 'vest', yes: 'The kid has a red vest.', no: 'The kid has no vest.', word: 'vest', tier: 1 },
  { tag: 'shell', yes: 'The kid has a shell.', no: 'The kid has no shell.', word: 'shell', tier: 1 },
  { tag: 'duck', yes: 'The kid is with a duck.', no: 'The kid has no duck.', word: 'duck', tier: 1 },
  { tag: 'ring', yes: 'The kid has a ring.', no: 'The kid has no ring.', word: 'ring', tier: 1 },
  { tag: 'chick', yes: 'I met a kid with a chick.', no: 'The kid has no chick.', word: 'chick', tier: 1 },
  { tag: 'crab', yes: 'The kid is with a crab.', no: 'The kid has no crab.', word: 'crab', tier: 1 },
  // tier 2: silent e
  { tag: 'kite', yes: 'The kid has a kite.', no: 'The kid has no kite.', word: 'kite', tier: 2 },
  { tag: 'cape', yes: 'The kid has a cape.', no: 'The kid has no cape.', word: 'cape', tier: 2 },
  { tag: 'flute', yes: 'The kid has a flute.', no: 'The kid has no flute.', word: 'flute', tier: 2 },
  { tag: 'rose', yes: 'The kid has a rose.', no: 'The kid has no rose.', word: 'rose', tier: 2 },
  { tag: 'cone', yes: 'I met a kid with a cone.', no: 'The kid has no cone.', word: 'cone', tier: 2 },
];
/* Clue forms grow from plain facts to and / or / but / next-to. Every clue is needed: drop any one and two kids still fit. */
const LINEUP_LADDER = [
  { clues: 2, n: 4, tier: 0, forms: ['yes', 'no'] },
  { clues: 3, n: 5, tier: 0, forms: ['yes', 'no', 'but'] },
  { clues: 3, n: 5, tier: 0, forms: ['no', 'but', 'and', 'or'] },
  { clues: 3, n: 6, tier: 0, forms: ['no', 'but', 'or', 'next', 'end'] },
  { clues: 4, n: 6, tier: 1, forms: ['yes', 'no', 'but', 'or', 'next'] },
  { clues: 4, n: 6, tier: 1, forms: ['no', 'but', 'or', 'next', 'end'] },
  { clues: 4, n: 6, tier: 2, forms: ['no', 'but', 'or', 'next', 'end'] },
];
function lineupClues(L, tags, suspects, ci) {
  const has = (i, t) => suspects[i] && suspects[i].tags.includes(t);
  const name = t => CLUE_BANK.find(c => c.tag === t).word, bank = t => CLUE_BANK.find(c => c.tag === t);
  const out = [];
  const add = (form, text, words, test) => { if (L.forms.includes(form) && test(ci)) out.push({ form, text, words, test }); };
  for (const a of tags) {
    add('yes', bank(a).yes, [name(a)], i => has(i, a));
    add('no', bank(a).no, [name(a)], i => !has(i, a));
    add('next', `The kid is next to a kid with a ${name(a)}.`, [name(a)], i => has(i - 1, a) || has(i + 1, a));
    for (const b of tags) if (a !== b) {
      add('but', `The kid has a ${name(a)} but no ${name(b)}.`, [name(a), name(b)], i => has(i, a) && !has(i, b));
      if (a < b) {
        add('and', `The kid has a ${name(a)} and a ${name(b)}.`, [name(a), name(b)], i => has(i, a) && has(i, b));
        add('or', `The kid has a ${name(a)} or a ${name(b)}.`, [name(a), name(b)], i => has(i, a) || has(i, b));
      }
    }
  }
  add('end', 'The kid is at the end.', ['end'], i => i === 0 || i === suspects.length - 1);
  add('end', 'The kid is not at the end.', ['end'], i => i !== 0 && i !== suspects.length - 1);
  return out;
}
function makeLineup(level) {
  const L = LINEUP_LADDER[Math.min(level, LINEUP_LADDER.length - 1)];
  for (let tries = 0; tries < 4000; tries++) {
    const pool = shuffle(CLUE_BANK.filter(c => c.tier === L.tier)).slice(0, 4).map(c => c.tag);
    const seen = new Set(), suspects = [];
    for (let guard = 0; suspects.length < L.n && guard < 60; guard++) {
      const tags = shuffle(pool).slice(0, rint(1, 3)).sort(), k = tags.join();
      if (!seen.has(k)) { seen.add(k); suspects.push({ tags }); }
    }
    if (suspects.length < L.n) continue;
    const ci = rint(0, L.n - 1), chosen = [];
    let left = suspects.map((_, i) => i);
    for (const q of shuffle(lineupClues(L, pool, suspects, ci))) {
      const next = left.filter(i => q.test(i));
      if (next.length < left.length) { chosen.push(q); left = next; }
      if (left.length === 1) break;
    }
    if (left.length !== 1) continue;
    const fitsAll = (cl, i) => cl.every(q => q.test(i));
    for (let k = chosen.length - 1; k >= 0; k--) { const rest = chosen.filter((_, j) => j !== k); if (suspects.filter((_, i) => fitsAll(rest, i)).length === 1) chosen.splice(k, 1); }
    if (chosen.length !== L.clues) continue;
    if (new Set(chosen.map(q => q.form)).size < Math.min(2, L.forms.length)) continue;
    return { chosen, suspects, culprit: suspects[ci], ci };
  }
  throw new Error('no lineup found at level ' + level);
}
const KID_SKIN = ['#ffe0c4', '#d9a273', '#a86f45', '#6e4529', '#f2c9a0'], KID_HAIR = ['#5b3a24', '#2a1a12', '#c9772f', '#f0d27a', '#1a1210'], KID_SHIRT = ['#8be06b', '#b07cff', '#ffb02e', '#3ec1d3', '#ff8ac4'];
function drawTrait(tag, x, y) {
  const P = { dog: 'dog', cat: 'cat', pig: 'pig', fan: 'fan', cup: 'cup', shell: 'shell', duck: 'duck', ring: 'ring', chick: 'chick', crab: 'crab', kite: 'kite', flute: 'flute', rose: 'rose', cone: 'cone' };
  if (P[tag]) drawPic(P[tag], x, y, 48);
}
function drawSuspect(s, i, x, y, scale = 1.25) {
  const look = { skin: KID_SKIN[i % 5], hair: KID_HAIR[(i * 2) % 5], color: s.tags.includes('vest') ? '#e8442f' : KID_SHIRT[i % 5], hairStyle: ['bob', 'short', 'puff', 'long', 'curly'][i % 5], kid: true };
  if (s.tags.includes('hat')) { look.hat = 'detective'; look.hatColor = '#6a5aa0'; }
  if (s.tags.includes('cape')) look.cape = '#e8442f';
  if (s.tags.includes('vest')) look.stripe = '#ffd23f';
  drawPerson(x, y, { look, scale });
  if (s.tags.includes('bag')) { rr(x + 12, y - 42, 24, 26, 5); paint('#c8843e', 2.5); }
  const items = s.tags.filter(t => !['hat', 'cape', 'vest', 'bag'].includes(t));
  items.forEach((t, k) => drawTrait(t, k === 2 ? x + 36 : x - 36 + k * 72, k === 2 ? y - 58 : y - 4));
}
function suspectLineup(o = {}) {
  return new Challenge(Object.assign({
    title: 'Suspect Lineup', skill: 'lineup', count: 3, color: '#fff6e0',
    intro: 'Read the clues. Cross off who does not fit!',
    make(level) {
      const P = makeLineup(level), n = P.suspects.length, lines = P.chosen.map(q => q.text);
      const cw = Math.min(150, 760 / n), x0 = VW / 2 - n * cw / 2 - 20, cy = PY + 84 + lines.length * 34, ch2 = PY + 396 - cy;
      const cross = P.suspects.map(() => false);
      const it = teach('lineup', {
        kind: 'custom', key: `lineup${P.chosen.length}`, isRetry: true, sel: 0, cross,
        prompt: 'Read the clues yourself. Click a word for help. Then click anyone who does not fit.',
        show: 'Cross off who does not fit!',
        hint1: 'Read the clue again. Who does not fit it? Cross them off.',
        hint2: () => `This clue says: ${lines[0]} Look at each kid.`,
        hint3: 'Cross off the glowing kid. That kid does not fit!',
        rightSay: `Yes! ${lines.join(' ')}`,
        why: ['I read the clues and crossed kids off', 'I just picked one'], whyGood: 0,
        rect(i) { return { x: x0 + i * cw + 4, y: cy, w: cw - 8, h: ch2 }; },
        accuse(i) {
          const s = P.suspects[i];
          if (s === P.culprit) { if (it.heardWord && !it.graded) it.graded = true; it.host.grade(true); return; }
          cross.fill(false);
          it.host.grade(false, '');
        },
        update(ch) {
          it.host = ch;
          if (helpUpdate(ch, it)) return;
          // click a clue word to hear it (counted as help, for the parent's panel)
          for (const w of it.wordRects || []) if (Input.clicked(w)) { const c = w.w0.replace(/[^a-z]/gi, '').toLowerCase(); Speech.say(c); if (P.chosen.some(q => q.words.includes(c))) it.heardWord = true; S.stats.help = S.stats.help || {}; S.stats.help[c] = (S.stats.help[c] || 0) + 1; return; }
          if (Input.pressed('left')) { it.sel = (it.sel + n - 1) % n; Sfx.click(); }
          if (Input.pressed('right')) { it.sel = (it.sel + 1) % n; Sfx.click(); }
          for (let i = 0; i < n; i++) { const r = it.rect(i); if (Input.hover(r)) it.sel = i; if (Input.clicked(r)) { it.toggle(i); return; } }
          if (Input.key(' ')) { it.toggle(it.sel); return; }
          const left = cross.map((v, i) => v ? -1 : i).filter(i => i >= 0);
          if (left.length === 1 && (Input.clicked(it.btn) || Input.key('enter'))) it.accuse(left[0]);
        },
        btn: { x: VW / 2 - 130, y: PY + PH - 62, w: 260, h: 52 },
        nextOff() { return P.suspects.findIndex((s, i) => s !== P.culprit && !cross[i]); },
        toggle(i) {
          const left = cross.map((v, k) => v ? -1 : k).filter(k => k >= 0);
          if (left.length === 1 && left[0] === i) { it.accuse(i); return; }   // the last kid standing: click means "this one"
          const was = it.wrongs >= 3 && i === it.nextOff(); cross[i] = !cross[i]; Sfx.click(); if (was) stepped(it);
          if (cross.filter(v => !v).length === 1) it.host.say('Only one kid is left. Click that kid, or press the green button!', 'Only one left!');
        },
        draw(ch) {
          it.host = ch;
          ctx.font = '700 28px Andika, sans-serif';
          it.wordRects = [];
          lines.forEach((ln, li) => {
            const y = PY + 90 + li * 34, sp = ctx.measureText(' ').width; let x = PX + 40;
            for (const wd of ln.split(' ')) {
              ctx.font = '700 28px Andika, sans-serif';
              const w = ctx.measureText(wd).width, r = { x: x - 3, y: y - 17, w: w + 6, h: 34, w0: wd };
              if (Input.hover(r)) { rr(r.x, r.y, r.w, r.h, 6); paint('#fff07a', 0); }
              text(wd, x + w / 2, y, { size: 28, font: 'Andika', color: OUT, stroke: null });
              it.wordRects.push(r); x += w + sp;
            }
          });
          P.suspects.forEach((s, i) => {
            const r = it.rect(i), sel = it.sel === i, glow = it.wrongs >= 3 && i === it.nextOff();
            if (glow) glowRect(ch, r.x - 6, r.y - 6, r.w + 12, r.h + 12, 18);
            rr(r.x, r.y, r.w, r.h, 14); paint(sel ? '#fff6c8' : '#ffffff', sel ? 5 : 3, sel ? '#ff5fa2' : OUT);
            ctx.globalAlpha = cross[i] ? 0.35 : 1;
            drawSuspect(s, i, r.x + r.w / 2, r.y + r.h - 14, r.h < 150 ? 0.95 : 1.15);
            ctx.globalAlpha = 1;
            if (cross[i]) { ctx.strokeStyle = '#e8442f'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(r.x + 16, r.y + 16); ctx.lineTo(r.x + r.w - 16, r.y + r.h - 16); ctx.moveTo(r.x + r.w - 16, r.y + 16); ctx.lineTo(r.x + 16, r.y + r.h - 16); ctx.stroke(); }
          });
          const left = cross.filter(v => !v).length;
          if (left === 1 && it.wrongs >= 3) glowRect(ch, it.btn.x - 6, it.btn.y - 6, it.btn.w + 12, it.btn.h + 12, 18);
          if (left === 1) button('This is the one!', VW / 2, it.btn.y + 26, 260, 52, { color: '#8be06b', size: 26 });
          helpDraw();
        },
        autoSolve(ch) { it.host = ch; it.accuse(P.suspects.indexOf(P.culprit)); },
      });
      return it;
    },
  }, o));
}

/* ---------- Picture Square: every row and column has each picture once. ---------- */
const SQUARE_SET = ['cat', 'dog', 'fish', 'frog'];
const SQUARE_WORDS = ['ship', 'chip', 'shop', 'chop'];
function latin(n) {
  const rows = shuffle([...Array(n).keys()]), cols = shuffle([...Array(n).keys()]), syms = shuffle([...Array(n).keys()]);
  return rows.map(r => cols.map(c => syms[(r + c) % n]));
}
/* Blank cells one at a time, keeping a puzzle solvable by "only one is left" reasoning, so no guessing is ever needed. */
function solvedBySingles(g, n) {
  const a = g.map(r => r.slice()); let moved = true;
  while (moved) {
    moved = false;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (a[y][x] < 0) {
      const used = new Set([...a[y], ...a.map(r => r[x])]);
      const can = [...Array(n).keys()].filter(v => !used.has(v));
      if (can.length === 1) { a[y][x] = can[0]; moved = true; }
    }
  }
  return a.every(r => r.every(v => v >= 0));
}
function makeSquare(n, blanks) {
  const sol = latin(n), g = sol.map(r => r.slice());
  let done = 0;
  for (const [x, y] of shuffle([].concat(...[...Array(n).keys()].map(y => [...Array(n).keys()].map(x => [x, y]))))) {
    if (done >= blanks) break;
    const keep = g[y][x]; g[y][x] = -1;
    if (solvedBySingles(g, n)) done++; else g[y][x] = keep;
  }
  return { sol, g };
}
function pictureSquare(o = {}) {
  return new Challenge(Object.assign({
    title: 'Picture Square', skill: 'square', count: 2, color: '#fff2f8',
    intro: 'Each row and each column has every picture one time!',
    make(level) {
      const lv = Math.min(level, 4);
      const [n, blanks] = [[3, 5], [4, 6], [4, 8], [4, 10], [4, 11]][lv];
      const words = lv === 4;
      const set = shuffle(words ? SQUARE_WORDS : SQUARE_SET).slice(0, n);
      const { sol, g } = makeSquare(n, blanks);
      const cell = Math.min(96, Math.floor(BOARD_H / n)), x0 = VW / 2 - cell * n / 2 - 110, y0 = BOARD_TOP;
      const blanksList = () => { const out = []; g.forEach((r, y) => r.forEach((v, x) => { if (v < 0) out.push([x, y]); })); return out; };
      /* the blank with only one possibility left: the next single sensible step */
      const nextBlank = () => blanksList().find(([x, y]) => { const u = new Set([...g[y], ...g.map(r => r[x])]); return [...Array(n).keys()].filter(v => !u.has(v)).length === 1; }) || blanksList()[0];
      const it = teach('square', {
        kind: 'custom', key: `square${n}-${blanks}`, isRetry: true, cur: null, palSel: 0,
        prompt: 'Click an empty box. Then click the picture that goes there. Each row and column has every picture one time.', show: 'Fill the empty boxes!',
        hint1: 'Find a box where only one picture can go. Look at its row and its column.',
        hint2: () => { it.cur = nextBlank(); return 'Look at the yellow row. Which picture is not in it yet?'; },
        hint3: 'Click the glowing picture!',
        rightSay: 'Every row and column has every picture!',
        why: ['That picture was the only one left', 'I just tried one'], whyGood: 0,
        palRect(i) { return { x: x0 + cell * n + 60, y: y0 + i * 92, w: 150, h: 84 }; },
        place(v) {
          if (!it.cur) it.cur = nextBlank();
          const [x, y] = it.cur;
          if (v === sol[y][x]) {
            g[y][x] = v; Sfx.plink(2); Speech.say(set[v]); it.cur = null; stepped(it);
            if (!blanksList().length) it.host.grade(true);
            else it.cur = nextBlank();
          } else it.host.grade(false, set[v]);
        },
        update(ch) {
          it.host = ch;
          if (it.cur == null && blanksList().length) it.cur = nextBlank();
          if (helpUpdate(ch, it)) return;
          for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (g[y][x] < 0 && Input.clicked({ x: x0 + x * cell, y: y0 + y * cell, w: cell, h: cell })) { it.cur = [x, y]; Sfx.click(); return; }
          const s = gridStep();
          if (s) {
            // arrows jump to the nearest empty box that way
            const [cx, cy] = it.cur; let best = null, bd = 99;
            for (const [x, y] of blanksList()) { const dx = x - cx, dy = y - cy; if ((s[0] && Math.sign(dx) === s[0]) || (s[1] && Math.sign(dy) === s[1])) { const d = Math.abs(dx) + Math.abs(dy); if (d < bd) { bd = d; best = [x, y]; } } }
            if (best) { it.cur = best; Sfx.click(); }
          }
          for (let i = 0; i < n; i++) { const r = it.palRect(i); if (Input.hover(r) && it.palSel !== i) { it.palSel = i; Speech.say(set[i]); } if (Input.clicked(r)) { it.palSel = i; it.place(i); return; } }
          for (const k of Input.typed) if (/[1-4]/.test(k) && +k <= n) { it.place(+k - 1); return; }
          if (Input.key(' ') || Input.key('enter')) { it.palSel = (it.palSel + 1) % n; Speech.say(set[it.palSel]); }
        },
        draw(ch) {
          it.host = ch;
          for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
            const X = x0 + x * cell, Y = y0 + y * cell, on = it.cur && it.cur[0] === x && it.cur[1] === y;
            const rowHi = it.wrongs === 2 && it.cur && it.cur[1] === y;
            rr(X + 3, Y + 3, cell - 6, cell - 6, 12); paint(rowHi ? '#fff0a0' : g[y][x] < 0 ? (on ? '#fff6c8' : '#f4f0e8') : '#ffffff', on ? 5 : 3, on ? '#ff5fa2' : OUT);
            if (g[y][x] >= 0) { if (words) text(set[g[y][x]], X + cell / 2, Y + cell / 2, { size: 26, font: 'Andika', color: OUT, stroke: null }); else drawPic(set[g[y][x]], X + cell / 2, Y + cell / 2, cell - 24); }
          }
          // a used picture dims at hint 2 so she sees what is left
          const cur = it.cur, used = cur ? new Set([...g[cur[1]], ...g.map(r => r[cur[0]])]) : new Set();
          set.forEach((w, i) => {
            const r = it.palRect(i), glow = it.wrongs >= 3 && cur && sol[cur[1]][cur[0]] === i;
            if (glow) glowRect(ch, r.x - 6, r.y - 6, r.w + 12, r.h + 12, 18);
            ctx.globalAlpha = it.wrongs >= 3 && used.has(i) ? 0.3 : 1;
            rr(r.x, r.y, r.w, r.h, 14); paint(it.palSel === i ? '#fff6c8' : '#ffffff', 3);
            if (words) text(w, r.x + r.w / 2, r.y + r.h / 2, { size: 30, font: 'Andika', color: OUT, stroke: null }); else drawPic(w, r.x + r.w / 2, r.y + r.h / 2, 70);
            ctx.globalAlpha = 1;
          });
          helpDraw();
        },
        autoSolve(ch) { it.host = ch; let k = 0; while (blanksList().length && !it.solved && k++ < 30) { it.cur = nextBlank(); it.place(sol[it.cur[1]][it.cur[0]]); } },
      });
      return it;
    },
  }, o));
}

/* ---------- Bell Memory, and Sound Bells (the bells say the sounds of a word) ---------- */
const BELL_NOTES = [523, 659, 784, 988];
const BELL_COLORS = ['#ff6fae', '#4aa3ff', '#ffd23f', '#5fd068'];
function bellBoard(o) {
  return new Challenge(Object.assign({
    count: 3, color: '#fff8e0',
    make(level) {
      const g = this.gen(level), pads = g.pads, gap = 170, x0 = VW / 2 - (pads - 1) * gap / 2, y = PY + 190;
      const it = teach(this.title, {
        kind: 'custom', key: g.key, isRetry: true, seq: g.seq, pos: 0, playing: true, pt: -0.7, pi: -1, lit: -1, phase: g.choice ? 'bells' : 'only',
        prompt: g.prompt, show: g.show, hint1: g.hint1, hint2: 'Listen one more time, nice and slow.', hint3: 'Click the glowing bell!', rightSay: g.done,
        choices: g.choice ? shuffle(g.choice).map(w => ({ val: w, label: w, font: 'Andika', say: w })) : undefined, answer: g.word, cw: 220, ch: 110, cy: PY + PH - 150,
        rect(i) { return { x: x0 + i * gap - 62, y: y - 62, w: 124, h: 124 }; },
        replayBells(slow) { it.playing = true; it.pt = -0.4; it.pi = -1; it.pos = 0; it.slow = slow; it.host && (it.host.bellReplays = (it.host.bellReplays || 0) + 1); },
        ring(i) { Sfx.tone && Sfx.on() && Sfx.tone(BELL_NOTES[i % 4], 0, 0.4, { type: 'triangle', vol: 0.22 }); if (g.say) Speech.say(g.say(i), { rate: 0.85 }); it.lit = i; it.litT = 0.35; },
        press(i) {
          if (i === it.seq[it.pos]) {
            it.ring(i); it.pos++;
            if (it.pos >= it.seq.length) {
              if (it.phase === 'bells') { it.phase = 'word'; if (!it.demo) it.wrongs = 0; it.host.say(g.ask, 'Which word did the bells say?'); }
              else it.host.grade(true);
            }
          } else if (it.phase === 'bells') {   // only the word itself counts for phonics credit
            Sfx.boing(); it.wrongs = Math.min(3, it.wrongs + 1); it.host.say(g.hint1, it.show); it.replayBells(it.wrongs >= 2);
          } else { Sfx.boing(); it.host.grade(false); it.replayBells(it.wrongs >= 2); }
        },
        update(ch, dt) {
          it.host = ch;
          if (it.litT > 0) { it.litT -= dt; if (it.litT <= 0) it.lit = -1; }
          if (it.phase === 'word') { ch.updateChoice(it); return; }
          if (Input.clicked({ x: VW / 2 - 90, y: PY + PH - 70, w: 180, h: 56 }) && !it.playing) { it.replayBells(false); return; }
          if (it.playing) {
            it.pt += dt * (it.slow ? 0.6 : 1);
            const step = g.say ? 2.1 : 0.75, idx = Math.floor(it.pt / step);
            if (it.pt >= 0 && idx !== it.pi) { it.pi = idx; if (idx < it.seq.length) it.ring(it.seq[idx]); else { it.playing = false; it.pos = 0; } }
            return;
          }
          if (helpUpdate(ch, it)) return;
          for (let i = 0; i < pads; i++) if (Input.clicked(it.rect(i))) { it.press(i); return; }
          for (const k of Input.typed) if (/[1-4]/.test(k) && +k <= pads) { it.press(+k - 1); return; }
          if (Input.pressed('left')) { it.sel = (it.sel + pads - 1) % pads; Sfx.click(); }
          if (Input.pressed('right')) { it.sel = (it.sel + 1) % pads; Sfx.click(); }
          if (Input.key(' ')) it.press(it.sel);
        },
        draw(ch) {
          it.host = ch;
          if (it.phase === 'word') { text('Which word did the bells say?', VW / 2, PY + 150, { size: 34, color: OUT, stroke: null }); ch.drawChoices(it); return; }
          for (let i = 0; i < pads; i++) {
            const X = x0 + i * gap, on = it.lit === i, glow = !it.playing && it.wrongs >= 3 && it.seq[it.pos] === i;
            if (glow) { ctx.globalAlpha = 0.55 + Math.sin(ch.t * 8) * 0.3; circle(X, y, 82); paint('#fff07a', 0); ctx.globalAlpha = 1; }
            const R = on ? 66 : 58, rock = on ? Math.sin(ch.t * 30) * 0.15 : 0;
            ctx.save(); ctx.translate(X, y); ctx.rotate(rock);
            ctx.beginPath(); ctx.moveTo(-R * 0.7, R * 0.5); ctx.quadraticCurveTo(-R * 0.6, -R, 0, -R); ctx.quadraticCurveTo(R * 0.6, -R, R * 0.7, R * 0.5); ctx.closePath(); paint(on ? shade(BELL_COLORS[i], 0.35) : BELL_COLORS[i], it.sel === i && !it.playing ? 6 : 4, it.sel === i && !it.playing ? '#ff5fa2' : OUT);
            circle(0, R * 0.62, R * 0.17); paint('#fffaf0', 3);
            ctx.restore();
            if (g.label) text(g.label(i), X, y - 6, { size: 32, font: 'Andika', color: '#fff', lw: 5 });
          }
          for (let k = 0; k < it.seq.length; k++) { circle(VW / 2 - (it.seq.length - 1) * 16 + k * 32, PY + 310, 11); paint(k < it.pos && !it.playing ? '#8be06b' : '#fff', 3); }
          if (it.playing) text('Listen...', VW / 2, PY + 355, { size: 28, color: OUT, stroke: null });
          else { text('Your turn!', VW / 2, PY + 355, { size: 28, color: '#3a9a5a', stroke: null }); button('Hear it again', VW / 2, PY + PH - 42, 180, 56, { color: '#bfe6ff', size: 22 }); helpDraw(); }
        },
        autoSolve(ch) {
          it.host = ch; it.playing = false; it.pos = 0;
          it.seq.slice().forEach(i => it.press(i));
          if (it.phase === 'word') ch.grade(true, g.word);
        },
        sel: 0,
      });
      return it;
    },
  }, o));
}
function bellMemory(o = {}) {
  return bellBoard(Object.assign({
    title: 'Bell Memory', skill: 'bells', intro: 'Listen to the bells, then ring them the same way!',
    gen(level) {
      const lv = Math.min(level, 4), len = [3, 4, 4, 5, 6][lv], pads = [3, 4, 4, 4, 4][lv];
      const seq = []; while (seq.length < len) { const v = rint(0, pads - 1); if (seq[seq.length - 1] !== v) seq.push(v); }
      return { seq, pads, key: `bells${len}`, prompt: `Listen to ${len} bells. Then ring them in the same order. Say the colors in your head!`, show: `Ring ${len} bells in order`, hint1: 'Listen again. Say each color as you hear it.', done: 'You rang them all!' };
    },
  }, o));
}
function soundBells(o = {}) {
  const WORD_PAIRS = [['sat', 'sit'], ['pig', 'big'], ['hat', 'hot'], ['bed', 'bad'], ['cup', 'cap'], ['map', 'mop'], ['sun', 'run'], ['pen', 'pan']];
  const HARD_PAIRS = [['ship', 'chip'], ['shop', 'chop'], ['moth', 'mop'], ['chin', 'thin'], ['fish', 'dish'], ['wish', 'with']];
  return bellBoard(Object.assign({
    title: 'Sound Bells', skill: 'sounds', intro: 'Each bell says a sound! Ring them in order.',
    gen(level) {
      const [a, b] = shuffle(level <= 1 ? pick(WORD_PAIRS) : pick(HARD_PAIRS));
      const ph = phonemes(a).slice(0, 4);
      // order the pads so the left-to-right order isn't simply the answer
      const order = shuffle(ph.map((_, i) => i)), seq = ph.map((_, i) => order.indexOf(i));
      return {
        seq, pads: ph.length, key: `bell-${a}`, word: a, choice: [a, b, pick((level <= 1 ? WORD_PAIRS : HARD_PAIRS).filter(q => !q.includes(a) && !q.includes(b)))[0]], say: i => sayPh(ph[order[i]]),
        prompt: 'Listen to the sounds. Ring the bells in the same order. Then tell me the word!', show: 'Ring the sounds in order',
        ask: 'Which word did the bells say?', hint1: 'Listen again. Say each sound with the bells.', done: `${ph.map(sayPh).join(', ')}. ${a}!`,
      };
    },
  }, o));
}

/* ---------- What's Missing ---------- */
const MISSING_PICS = ['cat', 'dog', 'sun', 'hat', 'cup', 'fish', 'frog', 'star', 'cake', 'kite', 'bus', 'pig', 'ring', 'duck', 'crab', 'clock', 'drum', 'moon'];
function whatsMissing(o = {}) {
  return new Challenge(Object.assign({
    title: "What's Missing?", skill: 'missing', count: 3, color: '#f0fbff',
    intro: 'Look closely, then see what is gone!',
    make(level) {
      const n = [4, 5, 6, 7, 8][Math.min(level, 4)], words = level >= 1;
      const set = shuffle(MISSING_PICS.filter(hasPic)).slice(0, n + 2);
      const items = set.slice(0, n), gone = pick(items), wrong = shuffle(items.filter(x => x !== gone)).slice(0, 1).concat(set.slice(n, n + 1));
      const perRow = n > 6 ? 4 : n, sz = n > 6 ? 74 : 100, pos = i => ({ x: VW / 2 - (Math.min(n - Math.floor(i / perRow) * perRow, perRow) - 1) * (sz + 20) / 2 + (i % perRow) * (sz + 20), y: n > 6 ? PY + 128 + Math.floor(i / perRow) * 84 : PY + 170 });
      const it = teach('missing', {
        kind: 'custom', key: `missing${n}`, isRetry: true, phase: 'look', answer: gone, cw: 180, ch: 100, cy: PY + PH - 124,
        choices: shuffle([gone, ...wrong]).map(x => words ? { val: x, label: x, font: 'Andika', size: 40, say: x } : { val: x, pic: x, say: x }),
        prompt: `Look: ${items.join(', ')}. Say the names in your head. When you are ready, press the button.`, show: 'Look closely! Press Ready.',
        hint1: 'Say the names you remember. Which name is not there?',
        hint2: () => `It starts with the sound ${sayPh(gone[0])}.`,
        rightSay: `The ${gone} was missing!`,
        update(ch) {
          it.host = ch;
          if (it.phase === 'look') {
            const r = { x: VW / 2 - 110, y: PY + PH - 104, w: 220, h: 70 };
            items.forEach((w, i) => { const p = pos(i); if (Input.clicked({ x: p.x - sz / 2, y: p.y - sz / 2, w: sz, h: sz })) Speech.say(w); });
            if (Input.clicked(r) || Input.key(' ') || Input.key('enter')) { it.phase = 'pick'; Sfx.pop(); ch.say('One thing is gone! What is missing?', "What's missing?"); it.prompt = 'One thing is gone! What is missing?'; it.show = "What's missing?"; }
            return;
          }
          ch.updateChoice(it);
        },
        draw(ch) {
          it.host = ch;
          rr(PX + 30, PY + 90, PW - 60, 170, 18); paint('#fff', 3);
          items.forEach((w, i) => {
            const p = pos(i);
            if (it.phase === 'pick' && w === gone && !it.solved) { circle(p.x, p.y, sz * 0.44); ctx.setLineDash([6, 6]); paint(null, 3, '#b8a0c0'); ctx.setLineDash([]); text('?', p.x, p.y, { size: 44, color: '#b8a0c0', stroke: null }); }
            else drawPic(w, p.x, p.y, sz);
          });
          if (it.phase === 'look') button("I'm ready!", VW / 2, PY + PH - 69, 220, 70, { color: '#8be06b', size: 30 });
          else ch.drawChoices(it);
        },
        autoSolve(ch) { it.host = ch; it.phase = 'pick'; ch.grade(true, gone); },
      });
      return it;
    },
  }, o));
}

/* ---------- Pattern Grid ---------- */
const MX_SHAPES = ['circle', 'square', 'triangle', 'star'], MX_COLORS = ['#ff6fae', '#4aa3ff', '#ffd23f', '#5fd068'];
function drawMxShape(s, c, x, y, r) {
  if (s === 'circle') circle(x, y, r); else if (s === 'square') rr(x - r, y - r, r * 2, r * 2, 5); else if (s === 'star') star(x, y, r * 1.15); else { ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y + r * 0.85); ctx.lineTo(x - r, y + r * 0.85); ctx.closePath(); }
  paint(c, 3);
}
function patternGrid(o = {}) {
  return new Challenge(Object.assign({
    title: 'Pattern Grid', skill: 'matrix', count: 3, color: '#f4f0ff',
    intro: 'What goes in the empty box?',
    make(level) {
      const lv = Math.min(level, 4), n = 3, S2 = shuffle(MX_SHAPES), C2 = shuffle(MX_COLORS);
      let cell, rule1, key;
      const across = 'Across the row, the color stays the same. Down the column, the shape stays the same.';
      if (lv === 0) { cell = (r, c) => ({ s: S2[c], c: C2[c] }); rule1 = 'Each row goes in the same order. Look at the row above.'; key = 'mx-row'; }
      else if (lv === 1) { cell = (r, c) => ({ s: S2[c], c: C2[r] }); rule1 = across; key = 'mx-3x3'; }
      else if (lv === 2) { cell = (r, c) => ({ s: S2[(r + c) % 3], c: C2[0] }); rule1 = 'Each row has all three shapes, and so does each column. Which shape is not there yet?'; key = 'mx-latin'; }
      else if (lv === 3) { cell = (r, c) => ({ s: S2[(r + c) % 3], c: C2[r] }); rule1 = 'Each row has one color. Every row and column has all three shapes.'; key = 'mx-latin2'; }
      else { const by = pick([2, 3, 4, 5, 10]), starts = [rint(1, 9), rint(1, 9), rint(1, 9)]; cell = (r, c) => ({ num: starts[r] + c * by }); rule1 = `Each row jumps by the same number. How far apart are they?`; key = `mx-num${by}`; }
      const bx = n - 1, by = n - 1, ans = cell(by, bx), id = v => v.num != null ? String(v.num) : v.s + v.c;
      const cand = [ans];
      const add = v => { if (!cand.some(q => id(q) === id(v))) cand.push(v); };
      if (ans.num != null) { add({ num: ans.num + 1 }); add({ num: ans.num - 1 }); add({ num: ans.num + 2 }); add({ num: ans.num + 10 }); }
      else { add({ s: ans.s, c: C2[(C2.indexOf(ans.c) + 1) % 4] }); add({ s: S2[(S2.indexOf(ans.s) + 1) % 4], c: ans.c }); add({ s: S2[(S2.indexOf(ans.s) + 2) % 4], c: C2[(C2.indexOf(ans.c) + 2) % 4] }); }
      const opts = shuffle(cand.slice(0, 4));
      const sz = 92, x0 = VW / 2 - n * sz / 2, y0 = PY + 76;
      const name = v => v.num != null ? String(v.num) : `${v.c === '#ff6fae' ? 'pink' : v.c === '#4aa3ff' ? 'blue' : v.c === '#ffd23f' ? 'yellow' : 'green'} ${v.s}`;
      return teach('matrix', {
        kind: 'choice', answer: id(ans), key, ch: 96, cw: 130, cy: PY + PH - 112,
        prompt: 'What goes in the empty box? Look across and down.', show: 'What goes in the empty box?',
        choices: opts.map(v => ({ val: id(v), say: name(v), draw: (cx, cy, r, sel) => { rr(r.x, r.y, r.w, r.h, 16); paint(sel ? '#fff6c8' : '#fff', sel ? 5 : 3, sel ? '#ff5fa2' : OUT); if (v.num != null) text(String(v.num), cx, cy, { size: 44, color: OUT, stroke: null }); else drawMxShape(v.s, v.c, cx, cy, 30); } })),
        hint1: () => rule1, hint2: () => `Look at the row just above. ${rule1}`,
        why: ['I looked across and down', 'I just picked one'], whyGood: 0,
        rightSay: `It's ${name(ans)}!`,
        visual: (ch, it) => {
          for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
            const X = x0 + c * sz, Y = y0 + r * sz, blank = r === by && c === bx && !it.solved, v = cell(r, c);
            const hi = it.wrongs >= 2 && r === by - 1;
            rr(X + 3, Y + 3, sz - 6, sz - 6, 12); paint(blank ? '#fff6c8' : hi ? '#ffe8c0' : '#fff', 3);
            if (blank) text('?', X + sz / 2, Y + sz / 2, { size: 46, color: '#ffb02e', stroke: null });
            else if (v.num != null) text(String(v.num), X + sz / 2, Y + sz / 2, { size: 38, color: OUT, stroke: null });
            else drawMxShape(v.s, v.c, X + sz / 2, Y + sz / 2, sz * 0.29);
          }
        },
      });
    },
  }, o));
}

/* ---------- Pet Path: plan the arrows, then press Go. ---------- */
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const DIR_KEYS = ['left', 'up', 'down', 'right'];
function petRoute(cols, rows, sx, sy, gx, gy, rocks) {
  const prev = new Map([[sx + ',' + sy, null]]), q = [[sx, sy]];
  for (let h = 0; h < q.length; h++) {
    const [x, y] = q[h];
    if (x === gx && y === gy) { const out = []; let k = x + ',' + y; while (prev.get(k)) { const p = prev.get(k); out.unshift(p.d); k = p.from; } return out; }
    for (const d of DIR_KEYS) {
      const nx = x + DIRS[d][0], ny = y + DIRS[d][1], k = nx + ',' + ny;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || rocks.has(k) || prev.has(k)) continue;
      prev.set(k, { from: x + ',' + y, d }); q.push([nx, ny]);
    }
  }
  return null;
}
function drawDirArrow(d, x, y, r = 20, color = '#4aa3ff') {
  const a = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[d];
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.beginPath(); ctx.moveTo(r, 0); ctx.lineTo(0, -r); ctx.lineTo(0, -r * 0.45); ctx.lineTo(-r, -r * 0.45); ctx.lineTo(-r, r * 0.45); ctx.lineTo(0, r * 0.45); ctx.lineTo(0, r); ctx.closePath(); paint(color, 2.5);
  ctx.restore();
}
function petPath(o = {}) {
  return new Challenge(Object.assign({
    title: 'Pet Path', skill: 'petpath', count: 3, color: '#effcf0',
    intro: 'Plan the arrows so your pet gets the treat!',
    make(level) {
      const lv = Math.min(level, 3), cols = 6, rows = 4, cell = 66, x0 = VW / 2 - 400 + 40, y0 = BOARD_TOP;
      let sx, sy, gx, gy, rocks, route;
      const want = [[4, 5], [6, 8], [8, 11], [7, 10]][lv];
      for (let t = 0; t < 4000; t++) {
        const a = rint(0, cols - 1), b = rint(0, rows - 1), c = rint(0, cols - 1), d = rint(0, rows - 1);
        const rs = new Set();
        if (lv >= 1) for (let k = 0; k < 3 + lv * 2; k++) rs.add(rint(0, cols - 1) + ',' + rint(0, rows - 1));
        if (rs.has(a + ',' + b) || rs.has(c + ',' + d)) continue;
        const r = petRoute(cols, rows, a, b, c, d, rs);
        if (!r || r.length < want[0] || r.length > want[1]) continue;
        const turns = r.filter((x, i) => i && x !== r[i - 1]).length;
        if (turns < 1 + lv) { if (!route) { sx = a; sy = b; gx = c; gy = d; rocks = rs; route = r; } continue; }
        sx = a; sy = b; gx = c; gy = d; rocks = rs; route = r;
        break;
      }
      const pet = S.pet || 'puppy';
      const it = teach('petpath', {
        kind: 'custom', key: `path${lv}`, isRetry: true, q: [], running: false, step: 0, wait: 0, x: sx, y: sy, sel: 0,
        prompt: 'Press arrows to plan the walk, then press Go. Click an arrow in your plan to take it out.', show: 'Plan the arrows, then press Go!',
        hint1: 'Trace the way with your finger, one square at a time.',
        hint2: 'Press Go and watch. Where does the first wrong arrow take your pet?',
        hint3: 'Follow the glow!',
        rightSay: 'Yum! Your pet got the treat!',
        why: ['I planned every step', 'I just pressed arrows'], whyGood: 0,
        go() { if (!it.q.length) { it.host.say('Add some arrows first!'); return; } it.running = true; it.step = 0; it.wait = 0.2; it.x = sx; it.y = sy; Sfx.pop(); },
        add(d) { if (it.q.length >= 12 || it.running) return; if (it.wrongs >= 3 && d === it.nextGood()) stepped(it); it.q.push(d); Sfx.click(); Speech.say(d, { rate: 1.1 }); },
        /* The next correct arrow from where the plan now ends. */
        nextGood() {
          let x = sx, y = sy;
          for (const d of it.q) { const nx = x + DIRS[d][0], ny = y + DIRS[d][1]; if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || rocks.has(nx + ',' + ny)) return null; x = nx; y = ny; }
          const r = petRoute(cols, rows, x, y, gx, gy, rocks);
          return r && r[0];
        },
        finishRun(hit) {
          it.running = false;
          if (hit) { it.host.grade(true); return; }
          it.x = sx; it.y = sy;
          it.host.grade(false);
        },
        update(ch, dt) {
          it.host = ch;
          if (it.running) {
            it.wait -= dt;
            if (it.wait > 0) return;
            it.wait = 0.42;
            if (it.step >= it.q.length) return it.finishRun(it.x === gx && it.y === gy);
            const d = it.q[it.step++], nx = it.x + DIRS[d][0], ny = it.y + DIRS[d][1];
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || rocks.has(nx + ',' + ny)) { Sfx.bonk(); return it.finishRun(false); }
            it.x = nx; it.y = ny; Sfx.plink(it.step % 8);
            if (it.x === gx && it.y === gy) return it.finishRun(true);
            return;
          }
          if (helpUpdate(ch, it)) return;
          for (const d of DIR_KEYS) if (Input.pressed(d)) return it.add(d);
          DIR_KEYS.forEach((d, i) => { if (Input.clicked(it.arrowRect(i))) it.add(d); });
          for (let i = it.q.length - 1; i >= 0; i--) if (Input.clicked(it.qRect(i))) { it.q.splice(i, 1); Sfx.click(); return; }
          if (Input.key('backspace') && it.q.length) { it.q.pop(); Sfx.click(); }
          if (Input.clicked(it.goBtn) || Input.key(' ') || Input.key('enter')) it.go();
        },
        goBtn: { x: PX + PW - 170, y: PY + 250, w: 150, h: 70 },
        arrowRect(i) { return { x: PX + PW - 300 + (i % 2) * 74 + 100, y: PY + 90 + Math.floor(i / 2) * 74, w: 68, h: 68 }; },
        qRect(i) { return { x: x0 + (i % 12) * 50, y: PY + PH - 112, w: 46, h: 50 }; },
        draw(ch) {
          it.host = ch;
          for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
            const X = x0 + x * cell, Y = y0 + y * cell;
            rr(X + 2, Y + 2, cell - 4, cell - 4, 8); paint((x + y) % 2 ? '#d8f0c8' : '#c8e8b8', 0);
            if (rocks.has(x + ',' + y)) { ellipse(X + cell / 2, Y + cell / 2 + 6, 24, 18); paint('#a89a8a', 3); }
          }
          drawBead('pink', x0 + cell * (gx + 0.5), y0 + cell * (gy + 0.5), 18, { shape: 'heart' });
          drawPet(pet, x0 + cell * (it.x + 0.5), y0 + cell * (it.y + 0.8), ch.t, { scale: 1.1, walking: it.running });
          const showGlow = !it.running && it.wrongs >= 3, good = showGlow ? it.nextGood() : null;
          if (showGlow && good === undefined) glowRect(ch, it.goBtn.x - 6, it.goBtn.y - 6, it.goBtn.w + 12, it.goBtn.h + 12, 18);
          if (showGlow && good === null && it.q.length) { const r = it.qRect(it.q.length - 1); glowRect(ch, r.x - 4, r.y - 4, r.w + 8, r.h + 8, 10); }
          DIR_KEYS.forEach((d, i) => { const r = it.arrowRect(i); if (d === good) glowRect(ch, r.x - 5, r.y - 5, r.w + 10, r.h + 10, 14); rr(r.x, r.y, r.w, r.h, 12); paint('#fff', 3); drawDirArrow(d, r.x + r.w / 2, r.y + r.h / 2); });
          button('Go!', it.goBtn.x + 75, it.goBtn.y + 35, 150, 70, { color: '#8be06b', size: 34 });
          rr(x0 - 6, PY + PH - 118, 12 * 50 + 8, 62, 10); paint('#fff', 3);
          it.q.forEach((d, i) => { const r = it.qRect(i), on = it.running && i === it.step - 1; rr(r.x, r.y, r.w, r.h, 8); paint(on ? '#ffd23f' : '#e4f0ff', 2); drawDirArrow(d, r.x + 23, r.y + 25, 15); });
          helpDraw();
        },
        autoSolve(ch) { it.host = ch; it.q = route.slice(); it.x = gx; it.y = gy; it.finishRun(true); },
      });
      return it;
    },
  }, o));
}

/* ---------- Balance Scales ---------- */
function drawScale(x, y, L, R, tilt, w = 130) {
  const a = tilt * 0.3;
  rr(x - 5, y - 70, 10, 76, 3); paint('#c8a070', 3); rr(x - 40, y + 2, 80, 12, 4); paint('#a8682e', 3);
  const lx = x - Math.cos(a) * w, ly = y - 70 - Math.sin(a) * w, rx = x + Math.cos(a) * w, ry = y - 70 + Math.sin(a) * w;
  ctx.strokeStyle = OUT; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ry); ctx.stroke();
  for (const [px, py, item] of [[lx, ly, L], [rx, ry, R]]) {
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + 22); ctx.stroke();
    ellipse(px, py + 26, 44, 9); paint('#ffd23f', 3);
    item(px, py + 4);
  }
}
function balanceScales(o = {}) {
  return new Challenge(Object.assign({
    title: 'Balance Scales', skill: 'scales', count: 3, color: '#fff8ea',
    intro: 'The side that goes down is heavier!',
    make(level) {
      const lv = Math.min(level, 4);
      if (lv >= 3) {
        // equal means both sides have the same amount
        const total = lv === 3 ? rint(9, 14) : rint(12, 18), a = rint(2, total - 3), b = total - a, c = rint(2, total - 3), ans = total - c;
        const leftLabel = `${a} + ${b}`, rightLabel = `${c} + ?`;
        return teach('scales', {
          kind: 'choice', answer: ans, numeric: true, key: `eq${a}+${b}=${c}+?`, ch: 100, cw: 150, cy: PY + PH - 116,
          prompt: `${a} plus ${b} on this side. ${c} plus what on that side? Make it balance.`, show: 'Make the scale balance!',
          choices: numChoices(ans, [ans + 1, ans - 1, ans + 2, a]),
          hint1: v => `Not ${v}. Balanced means both sides are the same amount.`, hint2: () => `This side makes ${total}. Start at ${c} and count up to ${total}.`,
          rightSay: `${a} plus ${b} equals ${c} plus ${ans}. Both sides are ${total}!`,
          visual: (ch, it) => {
            const lab = s => (x, y) => text(s, x, y, { size: 34, color: OUT, stroke: '#fffaf0', lw: 5 });
            drawScale(VW / 2, PY + 230, lab(leftLabel), lab(it.solved ? `${c} + ${ans}` : rightLabel), 0, 170);
          },
        });
      }
      const n = [3, 4, 4][lv];
      const names = shuffle(['cat', 'dog', 'frog', 'fish', 'hat', 'cup', 'bus', 'cake', 'drum', 'duck'].filter(hasPic)).slice(0, n);
      // names[0] is heaviest. Picture size is unrelated to weight, so she has to read the scales.
      const sizes = shuffle([40, 62, 54, 72]).slice(0, n);
      const pic = (i) => (x, y) => drawPic(names[i], x, y, sizes[i]);
      const lightest = lv >= 2 && Math.random() < 0.5;
      const word = lightest ? 'lightest' : n === 2 ? 'heavier' : 'heaviest';
      const ans = lightest ? names[n - 1] : names[0];
      const pairs = shuffle(Array.from({ length: n - 1 }, (_, i) => [i, i + 1]));
      const flips = pairs.map(() => Math.random() < 0.5);
      const w = n === 2 ? 130 : n === 3 ? 100 : 72, gap = n === 2 ? 0 : n === 3 ? 340 : 280, x0 = VW / 2 - (n - 2) * gap / 2;
      return teach('scales', {
        kind: 'choice', answer: ans, key: `scale${n}`, ch: 104, cw: 130, cy: PY + PH - 120,
        prompt: `Which one is ${word}? The side that goes down is heavier.`, show: `Which is ${word}?`,
        choices: shuffle(names).map(x => ({ val: x, pic: x, say: x })),
        hint1: v => n === 2 ? 'Look at which side went down.' : `Which one was ${lightest ? 'never lower' : 'never higher'} on a scale?`,
        hint2: () => n === 2 ? 'The heavy one pulls its side down.' : `Line them up. The ${names[0]} is heavier than the ${names[1]}.`,
        why: n > 2 ? ['I looked at all the scales', 'I picked the biggest one'] : undefined, whyGood: 0,
        rightSay: `The ${ans} is ${word}!`,
        visual: () => pairs.forEach(([h, l], i) => {
          const fl = flips[i];
          drawScale(x0 + i * gap, PY + 240, pic(fl ? l : h), pic(fl ? h : l), fl ? 1 : -1, w);
        }),
      });
    },
  }, o));
}

/* ---------- Odd One Out ---------- */
const ODD_GROUPS = [
  { name: 'animals', say: 'animals', items: ['cat', 'dog', 'pig', 'fox', 'frog', 'duck', 'crab', 'hen'] },
  { name: 'food', say: 'things to eat', items: ['cake', 'jam', 'plum', 'grape', 'milk'] },
  { name: 'ride', say: 'things that ride or fly', items: ['bus', 'van', 'jet', 'ship', 'bike', 'boat'] },
  { name: 'wear', say: 'things to wear', items: ['hat', 'sock', 'belt', 'crown', 'ring'] },
];
const ODD_SOUNDS = [['sh', ['ship', 'shell']], ['ch', ['chick', 'chip']], ['b', ['bat', 'bed', 'bus', 'bug', 'box', 'bike']], ['s', ['sun', 'sock', 'star', 'slide']], ['c', ['cat', 'cup', 'cake', 'cap', 'crab']], ['f', ['fan', 'fish', 'fox', 'frog']], ['d', ['dog', 'duck', 'drum']], ['h', ['hat', 'hen', 'hand', 'home']]];
const ODD_RHYMES = [['cat', 'hat', 'bat'], ['dog', 'log', 'frog'], ['sock', 'rock', 'lock', 'clock'], ['ring', 'king', 'wing'], ['cake', 'rake', 'lake'], ['net', 'jet', 'pet'], ['pen', 'hen', 'ten']];
function oddOne(o = {}) {
  return new Challenge(Object.assign({
    title: 'Odd One Out', skill: 'oddone', count: 3, color: '#f0fff4',
    intro: 'Which one does not belong?',
    make(level) {
      const words = level >= 2, rhyme = level === 1 || level === 3;
      const firstSound = w => w[0] === 'k' ? 'c' : w[0];
      const cards = v => words ? { val: v, label: v, font: 'Andika', size: 38, say: undefined } : { val: v, pic: v, say: v };
      if (rhyme) {
        const sets = ODD_RHYMES.filter(g => (words ? g : g.filter(hasPic)).length >= 3);
        const g = pick(sets), goods = shuffle(words ? g : g.filter(hasPic)).slice(0, 3);
        const oddW = pick(MISSING_PICS.filter(w => hasPic(w) && !g.includes(w) && w.slice(-2) !== g[0].slice(-2)));
        return teach('oddone', {
          kind: 'choice', answer: oddW, key: `rhyme-${g[0]}`, ch: 130, cw: 170,
          prompt: words ? 'Read the words. Which one does not rhyme?' : `${goods.join(', ')}, ${oddW}. Which one does not rhyme?`, show: 'Which one does not rhyme?',
          choices: shuffle([...goods, oddW]).map(cards),
          hint1: 'Rhyming words sound the same at the end. Say each one.', hint2: () => `Three of them end like ${goods[0]}.`,
          rightSay: `${goods.join(', ')} all rhyme. ${oddW} does not!`,
          visual: () => text('Three rhyme. One does not.', VW / 2, PY + 150, { size: 30, color: OUT, stroke: null }),
        });
      }
      const usable = ODD_SOUNDS.filter(([, w]) => w.filter(hasPic).length >= 3);
      const [snd, list] = pick(usable), goods = shuffle(list.filter(hasPic)).slice(0, 3);
      const oddW = pick(MISSING_PICS.filter(w => hasPic(w) && firstSound(w) !== firstSound(snd) && !goods.includes(w)));
      return teach('oddone', {
        kind: 'choice', answer: oddW, key: `odd-${snd}`, ch: 130, cw: 170,
        prompt: words ? 'Read the words. Which one starts with a different sound?' : `${goods.join(', ')}, ${oddW}. Which one does not start like the others?`, show: 'Which one starts with a different sound?',
        choices: shuffle([...goods, oddW]).map(cards),
        hint1: 'Say the first sound of each one.', hint2: () => `Three start with ${sayPh(snd)}. Which one does not?`,
        rightSay: `${oddW} starts with ${sayPh(oddW[0])}. The others start with ${sayPh(snd)}!`,
        visual: () => text('Say the first sound of each one.', VW / 2, PY + 150, { size: 30, color: OUT, stroke: null }),
      });
    },
  }, o));
}

/* ---------- Who Has What: a logic grid. Read the clues, work out who has which pet. ---------- */
const GRID_NAMES = ['Sam', 'Pam', 'Ben', 'Meg', 'Tim', 'Jen', 'Dan'];
const GRID_THINGS = ['dog', 'cat', 'pig', 'hen', 'fox', 'frog', 'duck'].filter(hasPic);
function permutations(n) { const out = []; const go = (a, used) => { if (a.length === n) { out.push(a.slice()); return; } for (let i = 0; i < n; i++) if (!used[i]) { used[i] = 1; a.push(i); go(a, used); a.pop(); used[i] = 0; } }; go([], []); return out; }
/* L0: 3 kids; L1: 3 kids, only "no" clues; L2+: 4 kids. Clues are the fewest that leave exactly one answer. */
function makeGrid(level) {
  const lv = Math.min(level, 4), n = lv <= 1 ? 3 : 4, onlyNo = lv === 1 || lv >= 3;
  for (let tries = 0; tries < 800; tries++) {
    const kids = shuffle(GRID_NAMES).slice(0, n), things = shuffle(GRID_THINGS).slice(0, n), sol = shuffle([...Array(n).keys()]);
    const clues = [];
    for (let k = 0; k < n; k++) for (let t = 0; t < n; t++) {
      if (sol[k] === t && !onlyNo) clues.push({ text: `${kids[k]} has the ${things[t]}.`, ok: p => p[k] === t, yes: true });
      else if (sol[k] !== t) {
        clues.push({ text: pick([`${kids[k]} has no ${things[t]}.`, `The ${things[t]} is not with ${kids[k]}.`]), ok: p => p[k] !== t });
      }
    }
    const perms = permutations(n);
    const chosen = shuffle(clues.filter(c => !c.yes)).concat(clues.filter(c => c.yes));
    let live = perms; const use = [];
    for (const c of chosen) { const nx = live.filter(c.ok); if (nx.length < live.length) { use.push(c); live = nx; } if (live.length === 1) break; }
    if (live.length !== 1) continue;
    for (let k = use.length - 1; k >= 0; k--) { const rest = use.filter((_, j) => j !== k); if (perms.filter(p => rest.every(c => c.ok(p))).length === 1) use.splice(k, 1); }
    if (use.length > (n === 3 ? 4 : 6)) continue;
    return { n, kids, things, sol, clues: shuffle(use) };
  }
  throw new Error('no grid found');
}
function whoHasWhat(o = {}) {
  return new Challenge(Object.assign({
    title: 'Who Has What?', skill: 'grid', count: 2, color: '#f2f6ff',
    intro: 'Read the clues. Work out who has which pet!',
    make(level) {
      const G = makeGrid(level), n = G.n, cell = 62, x0 = PX + 470, y0 = PY + 132, nameW = 76;
      const marks = Array.from({ length: n }, () => Array(n).fill(0));   // 0 blank, 1 X, 2 check
      const it = teach('grid', {
        kind: 'custom', key: `grid${n}`, isRetry: true, cx: 0, cy: 0,
        prompt: 'Read the clues. Click a box once for no, and again for yes. Then press Check.', show: 'Who has which pet?',
        hint1: 'Read one clue. Put an X in that box. Then look for a row or a column with only one box left.',
        hint2: 'If a row has only one empty box, that one must be yes!',
        hint3: 'Follow the glowing box!',
        rightSay: () => '', why: ['Only one box was left', 'I guessed'], whyGood: 0,
        next() { for (let k = 0; k < n; k++) { const t = G.sol[k]; if (marks[k][t] !== 2) return [k, t]; } for (let k = 0; k < n; k++) for (let t = 0; t < n; t++) if (marks[k][t] === 2 && G.sol[k] !== t) return [k, t]; return null; },
        tap(k, t) {
          const was = marks[k][t];
          marks[k][t] = (was + 1) % 3;
          if (marks[k][t] === 2) { for (let a = 0; a < n; a++) { if (a !== t && marks[k][a] === 2) marks[k][a] = 1; if (a !== k && marks[a][t] === 2) marks[a][t] = 1; } }
          Sfx.click();
          if (it.wrongs >= 3 && marks[k][G.sol[k]] === 2) stepped(it);
        },
        check() {
          const all = marks.every(r => r.includes(2));
          if (!all) { it.host.say('Every kid needs one yes. Keep going!', it.show); return; }
          if (marks.every((r, k) => r[G.sol[k]] === 2)) { it.rightSay = G.kids.map((k, i) => `${k} has the ${G.things[G.sol[i]]}.`).join(' '); it.host.grade(true); }
          else it.host.grade(false, '');
        },
        checkBtn: { x: PX + 60, y: PY + PH - 72, w: 220, h: 58 },
        update(ch) {
          it.host = ch;
          if (helpUpdate(ch, it)) return;
          for (const w of it.wordRects || []) if (Input.clicked(w)) { const c = w.w0.replace(/[^a-z]/gi, '').toLowerCase(); Speech.say(c); S.stats.help = S.stats.help || {}; S.stats.help[c] = (S.stats.help[c] || 0) + 1; return; }
          const s = gridStep();
          if (s) { it.cx = (it.cx + s[0] + n) % n; it.cy = (it.cy + s[1] + n) % n; Sfx.click(); Speech.say(`${G.kids[it.cy]}, ${G.things[it.cx]}`); }
          for (let k = 0; k < n; k++) for (let t = 0; t < n; t++) { const r = { x: x0 + nameW + t * cell, y: y0 + k * cell, w: cell, h: cell }; if (Input.hover(r)) { it.cx = t; it.cy = k; } if (Input.clicked(r)) { it.tap(k, t); return; } }
          if (Input.key(' ')) { it.tap(it.cy, it.cx); return; }
          if (Input.clicked(it.checkBtn) || Input.key('enter')) it.check();
        },
        draw(ch) {
          it.host = ch;
          it.wordRects = [];
          G.clues.forEach((c, li) => {
            const y = PY + 96 + li * 40, sp = (ctx.font = '700 25px Andika, sans-serif', ctx.measureText(' ').width); let x = PX + 30;
            for (const wd of c.text.split(' ')) {
              ctx.font = '700 25px Andika, sans-serif';
              const w = ctx.measureText(wd).width, r = { x: x - 3, y: y - 16, w: w + 6, h: 32, w0: wd };
              if (Input.hover(r)) { rr(r.x, r.y, r.w, r.h, 6); paint('#fff07a', 0); }
              text(wd, x + w / 2, y, { size: 25, font: 'Andika', color: OUT, stroke: null }); it.wordRects.push(r); x += w + sp;
            }
          });
          G.things.forEach((w, t) => drawPic(w, x0 + nameW + (t + 0.5) * cell, y0 - 28, 50));
          const g = it.wrongs >= 3 && !it.solved ? it.next() : null;
          G.kids.forEach((nm, k) => {
            text(nm, x0 + nameW - 8, y0 + (k + 0.5) * cell, { size: 26, font: 'Andika', color: OUT, stroke: null, align: 'right' });
            for (let t = 0; t < n; t++) {
              const X = x0 + nameW + t * cell, Y = y0 + k * cell, on = it.cx === t && it.cy === k;
              if (g && g[0] === k && g[1] === t) glowRect(ch, X - 2, Y - 2, cell + 4, cell + 4, 10);
              rr(X + 3, Y + 3, cell - 6, cell - 6, 8); paint('#fff', on ? 5 : 3, on ? '#ff5fa2' : OUT);
              if (marks[k][t] === 1) text('X', X + cell / 2, Y + cell / 2, { size: 34, color: '#e8442f', stroke: null });
              if (marks[k][t] === 2) text('✓', X + cell / 2, Y + cell / 2, { size: 38, color: '#3a9a5a', stroke: null });
            }
          });
          button('Check!', it.checkBtn.x + 110, it.checkBtn.y + 29, 220, 58, { color: '#8be06b', size: 28 });
          helpDraw();
        },
        autoSolve(ch) { it.host = ch; marks.forEach((r, k) => { r.fill(0); r[G.sol[k]] = 2; }); it.check(); },
      });
      return it;
    },
  }, o));
}

/* ---------- Registry. Rooms, the puzzle board and quests all use these names. ---------- */
const PUZ = {
  labels: { kind: 'read', name: 'Spell It', say: 'Spell it', make: o => labelFixer(Object.assign({ title: 'Spell It', intro: 'The signs got mixed up! Fix them.' }, o)) },
  sounds: { kind: 'read', name: 'Sound Sorter', say: 'Sound sorter', make: o => soundSorter(o) },
  syllables: { kind: 'read', name: 'Word Parts', say: 'Word parts', make: o => syllableSnap(Object.assign({ title: 'Word Parts' }, o)) },
  magic: { kind: 'read', name: 'Magic e', say: 'Magic e', make: o => magicE(o) },
  reading: { kind: 'read', name: 'Read & Find', say: 'Read and find', make: o => readFind(o) },
  robot: { kind: 'read', name: 'Robot Words', say: 'Robot words', make: o => robotWords(o) },
  typing: { kind: 'read', name: 'Snow Writing', say: 'Snow writing. Type words!', make: o => iceWriting(Object.assign({ title: 'Snow Writing' }, o)) },
  harbor: { kind: 'read', name: 'Harbor Board', say: 'Harbor board. Type words!', make: o => departureBoard(Object.assign({ title: 'Harbor Board' }, o)) },
  wordpath: { kind: 'read', name: 'Word Stones', say: 'Word stones', make: o => wordPath(o) },
  soundbells: { kind: 'read', name: 'Sound Bells', say: 'Sound bells', make: o => soundBells(o) },
  lineup: { kind: 'read', name: 'Suspect Lineup', say: 'Suspect lineup', make: o => suspectLineup(o) },
  tickets: { kind: 'math', name: 'Count by Tens', say: 'Count by tens', make: o => ticketCounter(Object.assign({ title: 'Count by Tens', intro: 'These tickets come in bundles of ten. Count by tens!' }, o)) },
  doorcode: { kind: 'math', name: 'Door Code', say: 'Door code', make: o => doorCode(o) },
  numberpath: { kind: 'math', name: 'Number Stones', say: 'Number stones', make: o => numberPath(o) },
  skip: { kind: 'math', name: 'Skip Counting', say: 'Skip counting. Twos, threes, fours and more!', make: o => skipCounting(o) },
  countdown: { kind: 'math', name: 'Countdown', say: 'Countdown', make: o => countdownLaunch(Object.assign({ title: 'Countdown' }, o)) },
  gems: { kind: 'math', name: 'Gem Counting', say: 'Gem counting', make: o => gemCounting(o) },
  bagels: { kind: 'math', name: 'Tens and Ones', say: 'Tens and ones', make: o => bagelBundles(Object.assign({ title: 'Tens and Ones' }, o)) },
  coins: { kind: 'math', name: 'Coin Counter', say: 'Coin counter', make: o => coinShop(Object.assign({ title: 'Coin Counter' }, o)) },
  fish: { kind: 'math', name: 'Fish Facts', say: 'Fish facts', make: o => fishFacts(o) },
  maze: { kind: 'logic', name: 'Maze', say: 'Maze', make: o => maze(o) },
  boulder: { kind: 'logic', name: 'Boulder Push', say: 'Boulder push', make: o => boulderPush(o) },
  beams: { kind: 'logic', name: 'Light Beams', say: 'Light beams', make: o => lightBeams(o) },
  square: { kind: 'logic', name: 'Picture Square', say: 'Picture square', make: o => pictureSquare(o) },
  bells: { kind: 'logic', name: 'Bell Memory', say: 'Bell memory', make: o => bellMemory(o) },
  missing: { kind: 'logic', name: "What's Missing", say: 'What is missing', make: o => whatsMissing(o) },
  matrix: { kind: 'logic', name: 'Pattern Grid', say: 'Pattern grid', make: o => patternGrid(o) },
  petpath: { kind: 'logic', name: 'Pet Path', say: 'Pet path', make: o => petPath(o) },
  scales: { kind: 'logic', name: 'Balance Scales', say: 'Balance scales', make: o => balanceScales(o) },
  grid: { kind: 'logic', name: 'Who Has What?', say: 'Who has what? Read clues and work it out', make: o => whoHasWhat(o) },
  oddone: { kind: 'logic', name: 'Odd One Out', say: 'Odd one out', make: o => oddOne(o) },
};
const playPuz = (name, o) => PUZ[name].make(o);
