'use strict';

/* Holiday Town maps: Brooklyn with a Halloween, a Thanksgiving and a Hanukkah district, plus indoor rooms. */

const TOWN_SPAWN = { x: 30, y: 29 };
const LOOK = (skin, hair, color) => ({ skin: SKINS[skin], hair: HAIRS[hair], color });

function shopIcon(label, col) { return (x, y) => { rr(x - 34, y - 12, 68, 20, 6); paint(col, 3); text(label, x, y - 2, { size: 13, color: '#fff', stroke: null }); }; }
function stallArt(col) {
  return (x, y) => {
    rr(x - 22, y - 30, 44, 26, 4); paint('#9a6436', 3);
    for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#fff6e0' : col; ctx.fillRect(x - 24 + i * 12, y - 46, 12, 14); }
    ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.strokeRect(x - 24, y - 46, 48, 14);
    for (let i = 0; i < 3; i++) { circle(x - 12 + i * 12, y - 32, 6); paint(['#ff8a1f', '#ffd23f', '#c8322f'][i], 2); }
  };
}
function menorahArt(x, y, t) {
  rr(x - 70, y - 14, 140, 14, 5); paint('#e8b830', 3);
  rr(x - 8, y - 150, 16, 140, 4); paint('#e8b830', 3);
  for (let k = -4; k <= 4; k++) {
    if (!k) continue;
    const cx = x + k * 17;
    rr(Math.min(x, cx) - 3, y - 80 + Math.abs(k) * 4, Math.abs(cx - x) + 6, 8, 3); paint('#e8b830', 2.5);
    rr(cx - 4, y - 140, 8, 64 - Math.abs(k) * 4 + 4, 3); paint('#e8b830', 2.5);
  }
  for (let k = -4; k <= 4; k++) drawFlame(x + k * 17, k === 0 ? y - 156 : y - 144, 0.7, t + k);
}
function archArt(x, y) {
  rr(x - 70, y - 120, 140, 120, 4); paint('#d8c8a8', 4);
  ctx.fillStyle = '#6a5a4a'; ctx.beginPath(); ctx.moveTo(x - 28, y); ctx.lineTo(x - 28, y - 60); ctx.arc(x, y - 60, 28, Math.PI, 0); ctx.lineTo(x + 28, y); ctx.fill();
  rr(x - 78, y - 132, 156, 16, 3); paint('#c8b898', 3);
}

const TOWN_MAPS = {
  town() {
    const st = townState();
    const b = new TB(64, 44, ',');
    b.region('hanukkah', 0, 0, 64, 11).region('halloween', 0, 11, 17, 33).region('thanks', 47, 11, 17, 33);
    b.regions[0].page = 'hanukkah'; b.regions[1].page = 'halloween'; b.regions[2].page = 'thanks';
    // roads and sidewalks
    b.rect(0, 19, 64, 1, '.').rect(0, 20, 64, 2, '=').rect(0, 22, 64, 1, '.');
    b.rect(30, 0, 1, 44, '.').rect(31, 0, 2, 44, '=').rect(33, 0, 1, 44, '.');
    b.rect(31, 19, 2, 4, 'z');
    // district borders (trees), with openings
    for (let x = 0; x < 64; x++) if (x < 30 || x > 33) b.set(x, 11, 'T');
    for (let y = 12; y < 44; y++) if (y < 19 || y > 22) { b.set(16, y, 'T'); b.set(47, y, 'T'); }

    /* ----- Home block ----- */
    b.rect(20, 24, 6, 4, 'H'); b.ent('door', 22, 27, { color: '#2f6fe0', action: sc => sc.go(() => Game.go(new HomeScene())), icon: shopIcon('HOME', '#ff5fa2') });
    b.rect(35, 24, 7, 4, 'H'); b.ent('door', 38, 27, { to: 'library', at: { x: 7, y: 8 }, icon: shopIcon('LIBRARY', '#3a8a5a') });
    b.rect(20, 33, 6, 4, 'H'); b.ent('door', 22, 36, { color: '#c8322f', action: sc => sc.go(() => Game.go(new SpeedScene())), icon: shopIcon('ARCADE', '#c8322f') });
    b.rect(35, 31, 7, 3, 'H'); b.ent('door', 38, 33, { to: 'shop', at: { x: 8, y: 9 }, color: '#d8a060', icon: shopIcon('BAGEL SHOP', '#c8822a') });
    addStoopDecor(b);
    b.ent('guide', 43, 35, { look: LOOK(2, 1, '#e8902f'), intro: "Hi Sadelle! I'm Jo. I sell hot pretzels!", hat: (x, y) => { ellipse(x, y - 2, 15, 6); paint('#c8322f', 2.5); rr(x - 9, y - 12, 18, 10, 4); paint('#c8322f', 2.5); } });
    b.ent('deco', 44, 35, { solid: true, art: (x, y) => {
      // Jo's pretzel cart
      rr(x - 20, y - 34, 40, 26, 5); paint('#d8d8e0', 3);
      for (let i = 0; i < 2; i++) { circle(x - 12 + i * 24, y - 6, 6); paint('#3a3a48', 2); }
      rr(x - 22, y - 58, 44, 10, 3); paint('#e8902f', 3); rr(x - 2, y - 48, 4, 14, 1); paint('#8a8296', 0);
      ctx.strokeStyle = '#a8642a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x - 6, y - 24, 6, 0, TAU); ctx.arc(x + 6, y - 24, 6, 0, TAU); ctx.stroke();
    } });
    b.ent('snooze', 25, 30);
    b.ent('subway', 41, 30, {});
    addExit(b, 'town', 'n', 'dumbo');
    addExit(b, 'town', 's', 'coney');
    b.ent('signpost', 29, 24, { text: 'Prospect Park', dir: 'left' });
    b.ent('signpost', 34, 24, { text: 'The Market', dir: 'right' });
    b.ent('signpost', 29, 17, { text: 'Latke Lane', dir: 'up' });
    b.rect(36, 37, 6, 4, 'p'); b.rect(19, 38, 9, 4, 'p');
    b.ent('npc', 39, 39, { id: 'leo', look: LOOK(2, 1, '#3ec1d3'), topics: ['clock', 'coins', 'compute', 'pattern'], hello: "Hi! I'm Leo. Let's do some number puzzles!", again: 'More puzzles? Yay!', thanks: 'You are a math star!' });
    b.ent('npc', 24, 40, { id: 'snooze1', skin: 'pie', topics: ['nonsense', 'letterName', 'letterSound'], hello: 'Yawn... I love silly words. Let us play!', thanks: 'Ha ha! Those were silly!' });
    b.ent('sign', 28, 29, { text: 'Hop on the bus to the park.', q: 'Where does the bus go?', a: 'park', c: ['park', 'shop', 'pond'] });
    b.ent('sign', 35, 30, { text: 'The library has lots of books.', q: 'What does the library have?', a: 'books', c: ['books', 'cats', 'cakes'] });
    b.ent('bagel', 43, 24);
    b.set(44, 30, 'T').set(19, 30, 'T').set(27, 42, 'T').set(43, 42, 'T').set(18, 25, 'f').set(28, 25, 'f');

    /* ----- Halloween: brownstones + Prospect Park ----- */
    b.rect(1, 13, 15, 6, 'H');
    b.ent('npc', 3, 19, { id: 'hw1', look: LOOK(1, 0, '#b07cff'), costume: 'bat', topics: ['pattern', 'missingNum', 'nextNum'], hello: "Happy Halloween! I'm Ms. Rivera. Help me count my candy!", thanks: 'Thank you! Here are some treats!' });
    b.ent('npc', 8, 19, { id: 'hw2', look: LOOK(3, 1, '#ff8a1f'), topics: ['letterName', 'letterSound', 'sight'], hello: "Trick or treat! I'm Mr. Cohen. Let's play a letter game!", thanks: 'You know your letters!' });
    b.ent('npc', 13, 19, { id: 'hw3', look: LOOK(0, 3, '#8be06b'), topics: ['blend', 'phonemes', 'decode'], hello: "Boo! I'm Ms. Park. Can you put sounds together?", thanks: 'Wow, great listening!' });
    b.ent('bagel', 8, 12); // hiding behind the brownstones
    b.ent('guide', 18, 24, { look: LOOK(4, 0, '#ff8a1f'), intro: "I'm Kim, the crossing guard!" });
    b.ent('signpost', 7, 22, { text: 'Pumpkin Patch', dir: 'down' });
    b.rect(2, 23, 13, 1, 'p').rect(8, 23, 1, 20, 'p');
    for (const [x, y] of [[2, 26], [4, 29], [13, 24], [1, 40], [14, 37], [11, 42], [3, 42], [15, 31]]) b.set(x, y, 'T');
    b.rect(10, 26, 5, 4, 'P'); b.rect(11, 27, 3, 2, ','); b.set(12, 29, ',');
    b.rect(2, 33, 6, 6, '~'); b.rect(4, 35, 2, 2, ','); // pond with an island (Bat Cape floats you over)
    b.ent('bagel', 4, 35); b.ent('heb', 5, 35, { back: { x: 5, y: 40 } });
    // Mrs. Levi lost her cat Babka somewhere in Prospect Park
    b.ent('catlady', 5, 19, { id: 'catlady', look: LOOK(1, 4, '#ff8ac4') });
    b.ent('lostcat', 6, 41, { id: 'lostcat' });
    b.ent('npc', 12, 35, { id: 'hw4', skin: 'ghost', topics: ['numberId', 'bigger', 'compute'], hello: 'Boooo... I mean, hello! I am a sleepy ghost. Help me with numbers!', thanks: 'Thank you! I feel so awake!' });
    b.ent('chest', 13, 40, { id: 'chest-bat', costume: 'bat', topics: READING_TYPES });
    b.ent('sign', 9, 24, { text: 'Welcome to the park. Do not feed the ducks.', q: 'What should you not feed?', a: 'ducks', c: ['ducks', 'dogs', 'kids'] });
    b.ent('boss', 12, 28, { kind: 'gourd', page: 'halloween', pageName: 'Halloween', helpers: ['hw1', 'hw2', 'hw3', 'hw4', 'catlady'], topics: ['pattern', 'nonsense', 'decode', 'missingNum', 'letterSound'] });
    for (const [x, y] of [[3, 24], [6, 30], [14, 33], [10, 39]]) b.set(x, y, 'L');

    /* ----- Thanksgiving: Grand Army Plaza market ----- */
    b.rect(48, 13, 7, 6, 'H'); b.ent('door', 51, 18, { to: 'kitchen', at: { x: 6, y: 7 }, icon: shopIcon('GRANDMA', '#c8322f') });
    b.rect(57, 13, 6, 6, 'H');
    b.rect(48, 23, 15, 14, 'q');
    b.ent('deco', 55, 24, { solid: true, art: x => archArt(x, (24 + 1) * T) });
    b.set(54, 24, 'K').set(56, 24, 'K');
    b.ent('deco', 51, 26, { solid: true, art: stallArt('#c8322f') });
    b.ent('deco', 59, 26, { solid: true, art: stallArt('#3a8a5a') });
    b.ent('deco', 50, 33, { solid: true, art: stallArt('#e8902f') });
    b.ent('npc', 51, 27, { id: 'tg1', look: LOOK(2, 0, '#c8322f'), topics: ['coins', 'compute'], hello: "Welcome to my apple stand! Can you count my coins?", thanks: 'You are great with money!' });
    b.ent('npc', 59, 27, { id: 'tg2', look: LOOK(4, 1, '#3a8a5a'), topics: ['wordProblem', 'bigger'], hello: "Hi! I sell pies. Help me with my story problems!", thanks: 'Thank you, smart helper!' });
    b.ent('npc', 50, 34, { id: 'tg3', look: LOOK(1, 4, '#e8902f'), topics: ['placeValue', 'pattern'], hello: "I stack corn in tens! Can you count them?", thanks: 'Tens and ones! You got it!' });
    b.ent('boss', 56, 31, { kind: 'gobbler', page: 'thanks', pageName: 'Thanksgiving', helpers: ['tg1', 'tg2', 'tg3', 'tg4'], topics: ['pattern', 'wordProblem', 'nonsense', 'blend', 'placeValue'] });
    b.ent('chest', 61, 41, { id: 'chest-turkey', costume: 'turkey', topics: MATH_TYPES });
    b.set(60, 21, 'm'); b.ent('manhole', 60, 21, { id: 'man1', to: 'tunnel', at: { x: 2, y: 3 } });
    b.ent('bagel', 62, 38);
    b.ent('guide', 45, 24, { look: LOOK(1, 2, '#3a6ad8'), intro: "I'm Ray. I deliver the mail!" });
    b.ent('signpost', 50, 22, { text: "Grandma's House", dir: 'up' });
    for (const [x, y] of [[49, 39], [52, 42], [58, 40], [62, 24]]) b.set(x, y, 'T');

    /* ----- Hanukkah: Latke Lane ----- */
    b.rect(0, 0, 30, 11, 's'); b.rect(34, 0, 30, 11, 's');
    b.rect(0, 6, 30, 2, '=').rect(34, 6, 30, 2, '=').rect(0, 5, 30, 1, '.').rect(34, 5, 30, 1, '.').rect(0, 8, 30, 1, '.').rect(34, 8, 30, 1, '.');
    b.rect(31, 6, 2, 2, 'z');
    b.rect(2, 1, 11, 4, 'H'); b.rect(19, 1, 9, 4, 'H');
    b.rect(13, 1, 6, 4, 'n'); b.ent('bagel', 15, 2); b.ent('heb', 17, 2, { back: { x: 16, y: 5 } });
    if (st.flags.alley) b.rect(13, 1, 6, 4, 's');
    b.ent('candle', 13, 9, { id: 'c1', group: 'alley' }); b.ent('candle', 16, 9, { id: 'c2', group: 'alley' }); b.ent('candle', 19, 9, { id: 'c3', group: 'alley' });
    b.rect(36, 1, 9, 4, 'H'); b.ent('door', 40, 4, { to: 'deli', at: { x: 7, y: 8 }, icon: shopIcon('DELI', '#4aa3ff') });
    b.rect(48, 1, 10, 4, 'H');
    b.ent('npc', 7, 9, { id: 'th1', look: LOOK(0, 2, '#4aa3ff'), costume: 'dreidel', topics: ['pattern', 'missingNum', 'nextNum'], hello: "Happy Hanukkah! I'm Zayde Sam. Let's count by tens!", thanks: 'You can count up AND down!' });
    b.ent('npc', 24, 9, { id: 'th2', skin: 'sufganiyah', topics: ['sight', 'decode', 'spell'], hello: 'Yawn... I am a sleepy jelly donut. Read with me!', thanks: 'Yum! Thank you!' });
    b.ent('deco', 52, 9, { solid: true, art: (x, y, t) => menorahArt(x, y, t) });
    b.ent('npc', 55, 9, { id: 'th4', look: LOOK(3, 4, '#ffd23f'), topics: ['pattern', 'bigger', 'numberId'], hello: "I take care of the big menorah. Help me count!", thanks: 'Eight nights, lots of light! Thank you!' });
    b.ent('chest', 61, 9, { id: 'chest-dreidel', costume: 'dreidel' });
    b.ent('boss', 44, 9, { kind: 'dreidel', page: 'hanukkah', pageName: 'Hanukkah', helpers: ['th1', 'th2', 'th3', 'th4'], topics: ['pattern', 'nonsense', 'decode', 'clock', 'missingNum'] });
    for (const [x, y] of [[1, 9], [28, 10], [36, 10], [63, 3]]) b.set(x, y, 'T');
    b.ent('guide', 34, 13, { look: LOOK(0, 1, '#4aa3ff'), intro: "I'm Dov. I shovel the snow!" });
    b.ent('signpost', 38, 9, { text: 'The Deli', dir: 'up' });

    /* ----- gates between districts ----- */
    b.ent('gate', 47, 19, { h: 4, open: () => pageDone('halloween') || townState().flags.openAll, line: 'This hedge opens after you win the Halloween calendar page. Wake up the Great Gourd in Prospect Park!' });
    b.ent('gate', 30, 11, { w: 4, open: () => pageDone('thanks') || townState().flags.openAll, line: 'Latke Lane opens after the Thanksgiving calendar page. Help the market and wake up Gobbler!' });

    return b.build({
      spawn: TOWN_SPAWN, music: 'map', bg: '#2a2040',
      enter(sc) {
        const st = townState();
        if (!st.flags.welcome) { st.flags.welcome = true; saveState(); Talk.say("Welcome to Brooklyn! Your big goal: win back the holiday calendar pages from the sleepy Snoozies, and save the holidays! Walk with the arrow keys and follow the yellow arrow. Press Enter to hear your goal, and press M to see the map of New York."); }
        else if (!TOWN_SESSION.greeted) { const g = townGoal(sc); Talk.say(`Welcome back! ${g.say}`, { show: g.short }); }
        TOWN_SESSION.greeted = true;
      },
      onHelp: (sc, npc) => bossReadyCheck(sc, npc),
      tick(sc) {
        const st = townState();
        if (!st.flags.shopTip && S.coins >= 15 && !sc.q && !sc.trail && Talk.t <= 0) {
          st.flags.shopTip = true; saveState();
          Talk.say("You have lots of bagels! Visit Aunt Pickles' Bagel Shop next to your house. You can buy hats, treats for Kugel, and more!", { show: 'Visit the Bagel Shop to spend your bagels!' });
        }
      },
      onCandles(sc, group) {
        if (group !== 'alley') return;
        townState().flags.alley = true;
        for (let y = 1; y < 5; y++) for (let x = 13; x < 19; x++) sc.grid[y][x] = 's';
        FX.confetti(16 * T, 3 * T, 40); saveState();
      },
    });
  },

  library() {
    const b = new TB(15, 10, 'w');
    b.rect(0, 0, 15, 2, 'W').rect(0, 0, 1, 10, 'W').rect(14, 0, 1, 10, 'W').rect(0, 9, 15, 1, 'W');
    b.rect(1, 2, 13, 1, 'B'); b.rect(1, 3, 2, 1, 'B'); b.rect(12, 3, 2, 1, 'B');
    b.set(7, 9, 'w');
    b.ent('warp', 7, 9, { to: 'town', at: { x: 38, y: 28 } });
    b.ent('npc', 7, 5, { id: 'librarian', look: LOOK(1, 1, '#3a8a5a'), topics: ['story'], hello: "Welcome to the library! Let's read a story together.", again: 'Another story? I love that!', thanks: 'What a great reader you are!' });
    b.ent('npc', 3, 7, { id: 'bookworm', skin: 'candycorn', topics: ['decode', 'sight', 'phonemes', 'blend'], hello: 'Psst! I am a book-loving Snoozie. Read words with me!', thanks: 'Thank you, word wizard!' });
    b.ent('npc', 11, 7, { id: 'storyowl', skin: 'snowowl', topics: ['story', 'nonsense'], hello: 'Hoo! Do you like stories? Read with me!', thanks: 'Hoo hoo! Wonderful!' });
    b.ent('bagel', 13, 5);
    return b.build({ spawn: { x: 7, y: 8 }, music: 'indoor', wall: '#d8c8a8', bg: '#3a2a20', palette: 'inside' });
  },

  kitchen() {
    const b = new TB(13, 9, 'k');
    b.rect(0, 0, 13, 2, 'W').rect(0, 0, 1, 9, 'W').rect(12, 0, 1, 9, 'W').rect(0, 8, 13, 1, 'W');
    b.rect(1, 2, 11, 1, 'C'); b.rect(8, 5, 3, 1, 'C');
    b.set(6, 8, 'k'); b.ent('warp', 6, 8, { to: 'town', at: { x: 51, y: 19 } });
    b.ent('npc', 3, 6, { id: 'tg4', look: LOOK(0, 3, '#e8442f'), scale: 0.95, topics: ['story', 'nonsense', 'decode', 'wordProblem'], count: 4, hello: "Sadelle, my sweetheart! Grandma made pie. Read with me while it bakes!", thanks: 'Such a smart grandchild! Happy Thanksgiving!' });
    return b.build({ spawn: { x: 6, y: 7 }, music: 'indoor', wall: '#f4dfbd', bg: '#3a2a20', palette: 'inside' });
  },

  deli() {
    const b = new TB(15, 10, 'k');
    b.rect(0, 0, 15, 2, 'W').rect(0, 0, 1, 10, 'W').rect(14, 0, 1, 10, 'W').rect(0, 9, 15, 1, 'W');
    b.rect(2, 3, 11, 1, 'C');
    b.set(7, 9, 'k'); b.ent('warp', 7, 9, { to: 'town', at: { x: 40, y: 5 } });
    b.ent('npc', 7, 5, { id: 'th3', look: LOOK(2, 1, '#fffaf0'), topics: ['coins', 'wordProblem', 'nonsense'], hello: "Welcome to the deli! Latkes are ten cents. Can you help me with the money?", thanks: 'You are hired! Just kidding. Thank you!' });
    b.ent('npc', 3, 7, { id: 'bubbe', look: LOOK(1, 3, '#b07cff'), topics: ['story', 'blend'], hello: "Come sit with Bubbe! Let's read a little story.", thanks: 'Mwah! Such a reader!' });
    b.ent('bagel', 12, 7);
    return b.build({ spawn: { x: 7, y: 8 }, music: 'indoor', wall: '#f4efe4', bg: '#20202a', palette: 'inside' });
  },

  tunnel() {
    const b = new TB(17, 7, 'p');
    b.rect(0, 0, 17, 2, 'W').rect(0, 6, 17, 1, 'W').rect(0, 0, 1, 7, 'W').rect(16, 0, 1, 7, 'W');
    b.ent('warp', 1, 3, { to: 'town', at: { x: 60, y: 22 }, icon: (x, y) => { rr(x - 16, y - 20, 32, 40, 4); paint('#8a8a9a', 3); for (let i = 0; i < 4; i++) { ctx.fillStyle = '#c0c0c8'; ctx.fillRect(x - 12, y - 14 + i * 9, 24, 3); } } });
    b.ent('bagel', 14, 4);
    b.ent('heb', 12, 2, { back: { x: 60, y: 22 } });
    b.ent('npc', 8, 4, { id: 'mole', skin: 'acorn', topics: ['pattern', 'missingNum', 'placeValue'], hello: 'Hello up there! I live down here. Count with me!', thanks: 'Thanks, friend!' });
    return b.build({ spawn: { x: 2, y: 3 }, music: 'indoor', wall: '#6a6478', bg: '#100c18', palette: 'inside' });
  },

  heb() {
    const b = new TB(11, 8, 'w');
    b.rect(0, 0, 11, 2, 'W').rect(0, 0, 1, 8, 'W').rect(10, 0, 1, 8, 'W').rect(0, 7, 11, 1, 'W');
    b.set(5, 7, 'w');
    return b.build({
      spawn: { x: 3, y: 5 }, music: 'indoor', wall: '#2f4fa8', bg: '#101838', palette: 'inside',
      enter(sc) {
        const back = (sc.spawnInfo && sc.spawnInfo.back) || TOWN_SPAWN;
        sc.ents.push(makeTownEnt({ type: 'warp', x: 5, y: 7, to: back.map || 'town', at: back }, sc));
        const idx = S.hebrew.length % HEBREW.length, target = HEBREW[idx];
        const others = shuffle(HEBREW.filter(h => h !== target && Math.abs(HEBREW.indexOf(h) - idx) < 6)).slice(0, 2);
        shuffle([target, ...others]).forEach((h, i) => sc.ents.push(makeTownEnt({ type: 'hebletter', x: 2 + i * 3, y: 3, heb: h }, sc)));
        sc.hebRoom = { target, done: false };
        Talk.say(`A secret room! This letter is ${target[2]}.${target[3] ? ` ${target[2]} says ${target[3]}.` : ''} Walk to ${target[2]}!`, { prompt: true, show: `Find ${target[1]}!  ${target[0]}` });
      },
    });
  },
};

let TOWN_BAGELS = 0; // counted in nyc.js once every map exists


const TOWN_SESSION = { greeted: false };
