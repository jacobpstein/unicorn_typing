'use strict';

/*
  New York City: Brooklyn ("town") plus seven more regions you walk between, Zelda-style.
  Walk off the end of a street to reach the next region. Subway stations (and the M key) show the city map.

  The big goal: win back every holiday's calendar page, then Sadelle's birthday party at Coney Island.
*/

/* ---------- Regions ---------- */
const REGION_INFO = {
  town: { name: 'Brooklyn', full: 'Park Slope, Brooklyn', color: '#ff8a1f', mapAt: [575, 395] },
  dumbo: { name: 'DUMBO', full: 'DUMBO and the Brooklyn Bridge', color: '#ff5fa2', mapAt: [470, 330], page: 'valentine' },
  les: { name: 'the Lower East Side', full: 'the Lower East Side', color: '#b07cff', mapAt: [360, 330], page: 'purim' },
  times: { name: 'Times Square', full: 'Times Square', color: '#ffd23f', mapAt: [330, 235], page: 'newyear' },
  cpark: { name: 'Central Park', full: 'Central Park', color: '#8be06b', mapAt: [345, 145], page: 'tubishvat' },
  bronx: { name: 'the Bronx Zoo', full: 'the Bronx Zoo', color: '#3a8a5a', mapAt: [420, 55], page: 'earthday' },
  queens: { name: 'Queens', full: 'Queens', color: '#4aa3ff', mapAt: [600, 210], page: 'passover' },
  coney: { name: 'Coney Island', full: 'Coney Island', color: '#e8442f', mapAt: [520, 495], page: 'july4' },
};
/* Which region opens after which. */
function regionOpen(id) {
  const st = townState();
  if (st.flags.openAll) return true;
  return {
    town: true, dumbo: !!st.flags.finale, les: pageDone('valentine'), times: pageDone('purim'), cpark: pageDone('newyear'),
    bronx: pageDone('tubishvat'), queens: pageDone('earthday'), coney: pageDone('passover'),
  }[id] ?? true;
}
const REGION_LOCK_LINE = {
  dumbo: 'This road to DUMBO opens after you win back all three Brooklyn calendar pages and wake up Mr. Snooze!',
  les: "The bridge to the Lower East Side opens after you win the Valentine's page in DUMBO.",
  times: 'Times Square opens after you win the Purim page.',
  cpark: "Central Park opens after you win the New Year's page in Times Square.",
  bronx: 'The Bronx Zoo opens after you win the Tu BiShvat page in Central Park.',
  queens: 'Queens opens after you win the Earth Day page at the Bronx Zoo.',
  coney: 'Coney Island opens after you win the Passover page in Queens.',
};
const OPPOSITE = { n: 's', s: 'n', e: 'w', w: 'e' };
function arrivalSpot(map, side) {
  if (map === 'town') return { n: { x: 31, y: 2 }, s: { x: 31, y: 41 } }[side];
  return { n: { x: 23, y: 2 }, s: { x: 23, y: 31 }, w: { x: 2, y: 16 }, e: { x: 45, y: 16 } }[side];
}
const SUBWAY_SPOT = { town: { x: 41, y: 31 } };

/* ---------- Landmark art ---------- */
const LANDMARKS = {
  carousel(x, y, t) {
    rr(x - 70, y - 20, 140, 20, 6); paint('#e8dcc8', 3);
    for (let i = 0; i < 5; i++) { rr(x - 60 + i * 30, y - 100, 6, 80, 2); paint('#ffd23f', 2); const hy = y - 60 + Math.sin(t * 3 + i) * 8; ellipse(x - 57 + i * 30, hy, 12, 8); paint(['#fff', '#ff8ac4', '#8ec5ff', '#ffd23f', '#b07cff'][i], 2); }
    ctx.beginPath(); ctx.moveTo(x - 80, y - 100); ctx.lineTo(x, y - 150); ctx.lineTo(x + 80, y - 100); ctx.closePath(); paint('#ff5fa2', 3);
    circle(x, y - 152, 8); paint('#ffd23f', 2);
  },
  bridgeTower(x, y) {
    rr(x - 60, y - 190, 120, 190, 4); paint('#b89a7a', 4);
    for (const s of [-1, 1]) { ctx.fillStyle = '#6a7a9a'; ctx.beginPath(); ctx.moveTo(x + s * 30 - 16, y); ctx.lineTo(x + s * 30 - 16, y - 110); ctx.arc(x + s * 30, y - 110, 16, Math.PI, 0); ctx.lineTo(x + s * 30 + 16, y); ctx.fill(); }
    ctx.strokeStyle = '#5a4a3a'; ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x - 60, y - 180); ctx.lineTo(x - 180, y - 40 + i * 6); ctx.moveTo(x + 60, y - 180); ctx.lineTo(x + 180, y - 40 + i * 6); ctx.stroke(); }
  },
  purimTent(x, y, t) {
    for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#fff6e0' : '#b07cff'; ctx.beginPath(); ctx.moveTo(x - 75 + i * 25, y); ctx.lineTo(x, y - 120); ctx.lineTo(x - 50 + i * 25, y); ctx.fill(); }
    ctx.strokeStyle = OUT; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 75, y); ctx.lineTo(x, y - 120); ctx.lineTo(x + 75, y); ctx.stroke();
    rr(x - 3, y - 150, 6, 32, 2); paint('#8a6a4a', 2);
    ctx.beginPath(); ctx.moveTo(x + 3, y - 150); ctx.lineTo(x + 30, y - 142 + Math.sin(t * 4) * 3); ctx.lineTo(x + 3, y - 134); ctx.closePath(); paint('#ffd23f', 2);
  },
  ballTower(x, y, t) {
    rr(x - 40, y - 210, 80, 210, 4); paint('#3a3a58', 4);
    for (let i = 0; i < 6; i++) { rr(x - 32, y - 200 + i * 32, 64, 24, 3); paint(['#ff5fa2', '#4aa3ff', '#ffd23f', '#8be06b', '#ff8a1f', '#b07cff'][(i + Math.floor(t * 2)) % 6], 2); }
    rr(x - 3, y - 270, 6, 62, 2); paint('#c0c8d8', 2);
    const by = y - 250 + (Math.sin(t * 0.5) * 0.5 + 0.5) * 20;
    circle(x, by, 22); paint('#e8ecf8', 3);
    ctx.fillStyle = 'rgba(120,180,255,.6)'; for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) if ((i + j + Math.floor(t * 6)) % 2 === 0) ctx.fillRect(x + i * 11 - 4, by + j * 11 - 4, 8, 8);
  },
  fountain(x, y, t) {
    ellipse(x, y - 14, 70, 22); paint('#8ec5ff', 4);
    rr(x - 8, y - 80, 16, 66, 4); paint('#c0b8a8', 3);
    ellipse(x, y - 80, 28, 8); paint('#c0b8a8', 3);
    // the angel on top
    circle(x, y - 110, 9); paint('#7a8a6a', 2.5); rr(x - 8, y - 102, 16, 20, 5); paint('#7a8a6a', 2.5);
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x, y - 100); ctx.quadraticCurveTo(x + s * 30, y - 130, x + s * 22, y - 90); ctx.closePath(); paint('#7a8a6a', 2); }
    ctx.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + t; circle(x + Math.cos(a) * 30, y - 20 + Math.sin(a) * 6, 2.5); ctx.fill(); }
  },
  zooGate(x, y) {
    for (const s of [-1, 1]) { rr(x + s * 60 - 12, y - 120, 24, 120, 3); paint('#8a6a4a', 3); }
    rr(x - 80, y - 140, 160, 30, 6); paint('#3a8a5a', 4);
    text('ZOO', x, y - 124, { size: 22, color: '#fff', lw: 4 });
    // a giraffe peeking over
    rr(x + 70, y - 190, 14, 80, 6); paint('#f2c050', 3); ellipse(x + 80, y - 196, 16, 10); paint('#f2c050', 3);
    for (const [sx, sy] of [[74, -170], [78, -140], [76, -120]]) { circle(x + sx, y + sy, 3.5); paint('#a8642a', 0); }
    circle(x + 88, y - 198, 2); paint(OUT, 0);
  },
  unisphere(x, y, t) {
    rr(x - 6, y - 70, 12, 70, 3); paint('#8a92a8', 3);
    ctx.strokeStyle = '#a8b0c8'; ctx.lineWidth = 3;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(x, y - 140, 70 * Math.abs(Math.cos(t * 0.3 + i * 0.6)), 70, 0, 0, TAU); ctx.stroke(); }
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.ellipse(x, y - 140 - 70 + i * 35, Math.sqrt(1 - Math.pow((i * 35 - 70) / 70, 2)) * 70, 8, 0, 0, TAU); ctx.stroke(); }
    ctx.fillStyle = 'rgba(120,200,120,.6)'; ellipse(x - 20, y - 150, 22, 14); ctx.fill(); ellipse(x + 26, y - 120, 16, 18); ctx.fill();
    ellipse(x, y - 4, 60, 10); paint('#8ec5ff', 3);
  },
  wonderWheel(x, y, t) {
    for (const s of [-1, 1]) { ctx.strokeStyle = '#c8322f'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x + s * 40, y); ctx.lineTo(x, y - 120); ctx.stroke(); }
    circle(x, y - 120, 100); paint(null, 6, '#c8322f');
    circle(x, y - 120, 60); paint(null, 3, '#e8442f');
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU + t * 0.3;
      ctx.strokeStyle = '#e8442f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y - 120); ctx.lineTo(x + Math.cos(a) * 100, y - 120 + Math.sin(a) * 100); ctx.stroke();
      rr(x + Math.cos(a) * 100 - 9, y - 120 + Math.sin(a) * 100, 18, 14, 4); paint(['#ffd23f', '#3ec1d3', '#ff5fa2', '#8be06b'][i % 4], 2);
    }
    circle(x, y - 120, 10); paint('#ffd23f', 3);
  },
  billboards(x, y, t) {
    for (let i = 0; i < 3; i++) {
      rr(x - 110 + i * 76, y - 110, 68, 90, 6); paint(['#ff5fa2', '#4aa3ff', '#ffd23f'][(i + Math.floor(t)) % 3], 4);
      text(['WOW', 'NYC', 'YAY'][i], x - 76 + i * 76, y - 66, { size: 22, color: '#fff', lw: 4 });
    }
  },
  animals(x, y, t) {
    // an elephant behind a little fence
    ellipse(x, y - 34, 34, 24); paint('#a0a0b0', 3); circle(x + 30, y - 46, 16); paint('#a0a0b0', 3);
    ctx.strokeStyle = OUT; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(x + 42, y - 40); ctx.quadraticCurveTo(x + 54, y - 20 + Math.sin(t * 2) * 4, x + 46, y - 8); ctx.stroke();
    ctx.strokeStyle = '#a0a0b0'; ctx.lineWidth = 5; ctx.stroke();
    for (const lx of [-20, -6, 12, 22]) { rr(x + lx, y - 18, 9, 18, 3); paint('#a0a0b0', 2); }
    circle(x + 34, y - 50, 2.5); paint(OUT, 0);
  },
  penguins(x, y, t) {
    ellipse(x, y - 10, 60, 16); paint('#8ec5ff', 3);
    for (let i = 0; i < 3; i++) drawSnoozie({ x: x - 50 + i * 30, y: y - 50 + Math.sin(t * 3 + i) * 3, w: 40, h: 40, skin: 'penguin', t: t + i, face: 1, state: 'happy' });
  },
  nathans(x, y) {
    rr(x - 50, y - 70, 100, 70, 6); paint('#fff6e0', 3);
    rr(x - 56, y - 86, 112, 20, 4); paint('#2a8a3a', 3);
    text("HOT DOGS", x, y - 76, { size: 14, color: '#ffd23f', lw: 3 });
    for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#2a8a3a' : '#ffd23f'; ctx.fillRect(x - 50 + i * 25, y - 66, 25, 10); }
  },
  seder(x, y) {
    rr(x - 70, y - 40, 140, 30, 6); paint('#fffaf0', 3);
    for (const s of [-1, 1]) { rr(x + s * 60 - 4, y - 14, 8, 14, 2); paint('#8a5a32', 2); }
    circle(x, y - 30, 16); paint('#c0c8d8', 2.5);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; circle(x + Math.cos(a) * 9, y - 30 + Math.sin(a) * 9, 3); paint(['#8be06b', '#c8a878', '#fff', '#e8442f', '#c8642a', '#6a3a2a'][i], 1); }
    for (const s of [-1, 1]) { rr(x + s * 40 - 6, y - 50, 12, 16, 3); paint('#b07cff', 2); }
  },
};

/* ---------- One region's map ---------- */
const REGION_SPECS = {
  dumbo: {
    pal: 'valentine', ground: ',', page: 'valentine', music: 'map', river: 'west',
    links: { s: 'town', w: 'les' },
    landmark: { art: 'carousel', x: 36, y: 6 }, extraArt: [{ art: 'bridgeTower', x: 5, y: 14, solid: false }],
    blocks: [[11, 2, 9, 4], [11, 21, 9, 4], [28, 21, 8, 4], [38, 21, 8, 4]],
    boss: { skin: 'heart', name: 'the Big Sleepy Heart', line: "Happy Valentine's Day!", theme: 'valentine', place: 'by the carousel' },
    npcs: [
      [13, 8, { look: LOOK(1, 3, '#ff5fa2'), topics: ['pattern', 'missingNum', 'bigger'], hello: "Happy Valentine's Day! I'm Rosie. I count hearts by tens!", thanks: 'You are a sweetheart!' }],
      [17, 8, { skin: 'heart', topics: ['letterSound', 'blend', 'phonemes'], hello: 'Yawn... I am a sleepy heart. Help me hear the sounds!', thanks: 'My heart is so happy!' }],
      [13, 27, { look: LOOK(3, 0, '#c8322f'), topics: ['decode', 'sight', 'spell'], hello: "Hi! I'm Marcus. I write Valentine cards. Help me read!", thanks: 'Thanks, card reader!' }],
      [33, 27, { skin: 'pigeon', topics: ['coins', 'wordProblem', 'compute'], hello: 'Coo coo! I sell flowers. Can you count my money?', thanks: 'Coo! Thank you!' }],
    ],
    guide: { look: LOOK(2, 2, '#ff8ac4'), intro: "I'm Bea. I walk dogs on the bridge!" },
    signs: [{ x: 21, y: 19, text: 'Manhattan', dir: 'left' }, { x: 26, y: 31, text: 'Brooklyn', dir: 'down' }],
    story: { x: 16, y: 27, text: 'The Brooklyn Bridge is very long. Many people walk on it.', q: 'What is long?', a: 'bridge', c: ['bridge', 'cake', 'dog'] },
    chest: [44, 31], bagels: [[19, 30], [45, 2]], heb: [12, 31],
    trees: [[44, 13], [27, 31], [20, 13], [40, 31]],
  },
  les: {
    pal: 'purim', ground: ',', page: 'purim', music: 'hanukkah', river: 'east',
    links: { e: 'dumbo', n: 'times' },
    landmark: { art: 'purimTent', x: 31, y: 6 },
    blocks: [[2, 2, 9, 4], [12, 2, 8, 4], [2, 21, 8, 4], [27, 21, 9, 4]],
    boss: { skin: 'hamantasch', name: 'the Giant Hamantasch', line: 'Happy Purim!', theme: 'purim', place: 'at the Purim carnival' },
    npcs: [
      [6, 8, { look: LOOK(0, 2, '#b07cff'), topics: ['pattern', 'nextNum', 'placeValue'], hello: "Happy Purim! I'm Shira. I baked hamantaschen in rows of ten!", thanks: 'You count like a baker!' }],
      [16, 8, { skin: 'pickle', topics: ['nonsense', 'letterName', 'decode'], hello: 'Yawn... I am a sleepy pickle from the pickle shop. Read silly words with me!', thanks: 'That was a big dill! Thank you!' }],
      [6, 27, { look: LOOK(2, 4, '#ffd23f'), costume: 'none', topics: ['story', 'sight'], hello: "I'm Avi! I'm dressed up as a king. Read me a story!", thanks: 'Your majesty, thank you!' }],
      [30, 27, { skin: 'hamantasch', topics: ['wordProblem', 'coins', 'clock'], hello: 'I am a sleepy cookie. Help me with my math!', thanks: 'Yum, thank you!' }],
    ],
    guide: { look: LOOK(1, 1, '#ffd23f'), intro: "I'm Esther. I'm handing out Purim treats!" },
    signs: [{ x: 21, y: 19, text: 'Times Square', dir: 'up' }, { x: 26, y: 13, text: 'Brooklyn Bridge', dir: 'right' }],
    story: { x: 14, y: 26, text: 'On Purim we wear masks and give treats to friends.', q: 'What do we wear?', a: 'masks', c: ['masks', 'boots', 'socks'] },
    chest: [35, 31], bagels: [[18, 30], [36, 2]], heb: [3, 31],
    trees: [[19, 13], [3, 13], [14, 31], [33, 13]],
  },
  times: {
    pal: 'newyear', ground: 'q', page: 'newyear', music: 'boss',
    links: { s: 'les', n: 'cpark' },
    landmark: { art: 'ballTower', x: 36, y: 7 }, extraArt: [{ art: 'billboards', x: 11, y: 13, solid: false }],
    blocks: [[2, 2, 9, 4], [12, 2, 8, 4], [2, 21, 8, 4], [12, 21, 8, 4], [28, 21, 8, 4], [38, 21, 8, 4]],
    boss: { skin: 'discoball', name: 'the Sleepy Ball', line: 'Happy New Year!', theme: 'newyear', place: 'under the big ball' },
    npcs: [
      [6, 8, { look: LOOK(4, 1, '#ff5fa2'), topics: ['pattern', 'missingNum', 'numberId'], hello: "Happy New Year! I'm Dana. Let's count down from big numbers!", thanks: 'Ten, nine, eight... you rock!' }],
      [16, 8, { skin: 'pizza', topics: ['phonemes', 'blend', 'letterSound'], hello: 'Yawn... I am a sleepy slice of pizza. Count the sounds with me!', thanks: 'Cheesy thanks!' }],
      [6, 27, { look: LOOK(1, 0, '#4aa3ff'), topics: ['clock', 'compute'], hello: "I'm Mr. Lee. Everyone watches the clock tonight! Can you read clocks?", thanks: 'Right on time!' }],
      [33, 27, { look: LOOK(0, 4, '#8be06b'), topics: ['decode', 'nonsense', 'story'], hello: "Hi, I'm Lucy! I read all the signs in Times Square. Read with me!", thanks: 'What a great reader!' }],
    ],
    guide: { look: LOOK(3, 1, '#ffd23f'), intro: "I'm Gus. I sell popcorn!" },
    signs: [{ x: 21, y: 19, text: 'Central Park', dir: 'up' }, { x: 21, y: 31, text: 'Lower East Side', dir: 'down' }],
    story: { x: 26, y: 26, text: 'At night the lights are bright. We count down and the big ball drops!', q: 'What drops?', a: 'ball', c: ['ball', 'cup', 'hat'] },
    chest: [44, 31], bagels: [[19, 30], [45, 2]], heb: [3, 31],
    trees: [],
  },
  cpark: {
    pal: 'cpark', ground: 's', page: 'tubishvat', music: 'hanukkah',
    links: { s: 'times', n: 'bronx', e: 'queens' },
    landmark: { art: 'fountain', x: 36, y: 7 },
    blocks: [[12, 2, 7, 3]],
    ice: [2, 21, 14, 9],
    boss: { skin: 'snowman', name: 'Snowy the Snowman', line: 'Happy Tu BiShvat! Happy birthday, trees!', theme: 'tubishvat', place: 'by the fountain' },
    npcs: [
      [6, 8, { look: LOOK(2, 3, '#3a8a5a'), topics: ['pattern', 'missingNum', 'placeValue'], hello: "Happy Tu BiShvat! It's the trees' birthday! I'm Noa. Count the trees with me!", thanks: 'The trees say thank you!' }],
      [16, 8, { skin: 'snowowl', topics: ['story', 'decode'], hello: 'Hoo! It is a snowy day. Read me a story!', thanks: 'Hoo hoo! Thank you!' }],
      [18, 27, { look: LOOK(0, 0, '#ff8a1f'), topics: ['letterName', 'sight', 'nonsense'], hello: "I'm Jake. I'm ice skating! Let's play a word game.", thanks: 'Wheee! Thank you!' }],
      [33, 27, { skin: 'acorn', topics: ['bigger', 'coins', 'wordProblem'], hello: 'Yawn... I am a sleepy acorn. Help me with numbers!', thanks: 'I will grow into a big tree!' }],
    ],
    guide: { look: LOOK(1, 2, '#4aa3ff'), intro: "I'm Max. I give carriage rides in the park!" },
    signs: [{ x: 21, y: 19, text: 'Bronx Zoo', dir: 'up' }, { x: 26, y: 13, text: 'Queens', dir: 'right' }],
    story: { x: 20, y: 24, text: 'Snow fell on the park. The kids made a big snowman with a red hat.', q: 'What color was the hat?', a: 'red', c: ['red', 'blue', 'tan'] },
    chest: [44, 31], bagels: [[8, 25], [45, 2]], heb: [3, 13],
    trees: [[3, 3], [9, 3], [3, 9], [19, 9], [20, 4], [27, 31], [31, 31], [35, 31], [39, 31], [44, 21], [44, 25], [20, 31]],
  },
  bronx: {
    pal: 'zoo', ground: ',', page: 'earthday', music: 'thanksgiving',
    links: { s: 'cpark' },
    landmark: { art: 'zooGate', x: 36, y: 7 }, extraArt: [{ art: 'animals', x: 9, y: 27, solid: true }, { art: 'penguins', x: 37, y: 27, solid: true }],
    blocks: [],
    fences: [[3, 22, 14, 7], [30, 22, 14, 7]],
    boss: { skin: 'lion', name: 'Leo the Lazy Lion', line: 'Happy Earth Day! Roar!', theme: 'earthday', place: 'by the zoo gate' },
    npcs: [
      [6, 8, { look: LOOK(3, 0, '#3a8a5a'), topics: ['pattern', 'nextNum', 'bigger'], hello: "Welcome to the zoo! I'm Zookeeper Ana. Help me count the animals!", thanks: 'The animals thank you!' }],
      [16, 8, { skin: 'penguin', topics: ['blend', 'phonemes', 'letterSound'], hello: 'Yawn... I am a sleepy penguin. Listen to sounds with me!', thanks: 'Waddle waddle, thanks!' }],
      [10, 31, { look: LOOK(1, 4, '#8be06b'), topics: ['wordProblem', 'placeValue', 'compute'], hello: "I'm Sam. I feed the elephants peanuts! Help me with my problems.", thanks: 'Peanut-tastic!' }],
      [36, 31, { look: LOOK(0, 1, '#ff8a1f'), topics: ['story', 'nonsense', 'decode'], hello: "I'm Pia. I read about animals. Read with me!", thanks: 'You are a zoo star!' }],
    ],
    guide: { look: LOOK(2, 0, '#3a8a5a'), intro: "I'm Omar. I fix the zoo fences!" },
    signs: [{ x: 21, y: 19, text: 'Central Park', dir: 'down' }],
    story: { x: 26, y: 19, text: 'The elephant is big and gray. It sprays water with its long trunk.', q: 'What is long?', a: 'trunk', c: ['trunk', 'tail', 'tent'] },
    chest: [44, 13], bagels: [[19, 31], [2, 13]], heb: [45, 31],
    trees: [[3, 13], [12, 13], [19, 2], [27, 13], [44, 2], [26, 31], [20, 20]],
  },
  queens: {
    pal: 'queens', ground: ',', page: 'passover', music: 'hanukkah',
    links: { w: 'cpark' },
    landmark: { art: 'unisphere', x: 36, y: 8 }, extraArt: [{ art: 'seder', x: 9, y: 28, solid: true }],
    blocks: [[2, 2, 9, 4], [12, 2, 8, 4], [28, 21, 8, 4], [38, 21, 8, 4]],
    boss: { skin: 'matzah', name: 'Mr. Matzah', line: 'Happy Passover!', theme: 'passover', place: 'by the big globe' },
    npcs: [
      [6, 8, { look: LOOK(1, 0, '#4aa3ff'), topics: ['pattern', 'missingNum', 'nextNum'], hello: "Chag sameach! I'm Uncle Ben. Count the matzah with me!", thanks: 'Dayenu! That was enough!' }],
      [16, 8, { skin: 'matzah', topics: ['letterName', 'letterSound', 'spell'], hello: 'Yawn... I am a sleepy piece of matzah. Spell with me!', thanks: 'Crunchy thanks!' }],
      [14, 29, { look: LOOK(0, 3, '#b07cff'), topics: ['story', 'decode', 'blend'], hello: "I'm Savta! Come to my seder. Read the story with me!", thanks: 'Such a good reader, motek!' }],
      [33, 27, { look: LOOK(3, 2, '#ff8a1f'), topics: ['clock', 'coins', 'wordProblem'], hello: "I'm Leo's cousin Max! Help me get ready for the seder.", thanks: 'Now we are ready!' }],
    ],
    guide: { look: LOOK(4, 1, '#4aa3ff'), intro: "I'm Priya. I live near the big globe!" },
    signs: [{ x: 21, y: 19, text: 'Central Park', dir: 'left' }],
    story: { x: 26, y: 26, text: 'At the seder we ask four questions. Then we look for the hidden matzah.', q: 'How many questions?', a: 'four', c: ['four', 'six', 'two'] },
    chest: [44, 31], bagels: [[19, 31], [45, 2]], heb: [3, 31],
    trees: [[3, 13], [19, 13], [27, 31], [3, 21], [20, 21]],
  },
  coney: {
    pal: 'beach', ground: ',', page: 'july4', music: 'thanksgiving', ocean: true,
    links: { n: 'town' },
    landmark: { art: 'wonderWheel', x: 36, y: 8 }, extraArt: [{ art: 'nathans', x: 7, y: 6, solid: true }],
    blocks: [[12, 2, 8, 4]],
    boss: { skin: 'hotdog', name: 'Hot Dog Harry', line: 'Happy Fourth of July!', theme: 'july4', place: 'by the Wonder Wheel' },
    npcs: [
      [6, 9, { look: LOOK(2, 1, '#e8442f'), topics: ['pattern', 'bigger', 'numberId'], hello: "Happy Fourth of July! I'm Kai. Count the fireworks with me!", thanks: 'Boom! You did it!' }],
      [16, 8, { skin: 'hotdog', topics: ['coins', 'wordProblem', 'compute'], hello: 'Yawn... I am a sleepy hot dog. Hot dogs cost ten cents. Help me count!', thanks: 'Relish the moment! Thanks!' }],
      [10, 23, { look: LOOK(0, 3, '#3ec1d3'), topics: ['story', 'decode', 'sight'], hello: "I'm Maya! I'm building a sand castle. Read me a story!", thanks: 'Best beach day ever!' }],
      [36, 23, { skin: 'penguin', topics: ['nonsense', 'phonemes', 'letterSound'], hello: 'Yawn... I am a penguin from the aquarium! Silly words, please!', thanks: 'Splash! Thank you!' }],
    ],
    guide: { look: LOOK(3, 0, '#ffd23f'), intro: "I'm Lou. I'm a lifeguard!" },
    signs: [{ x: 21, y: 19, text: 'Brooklyn', dir: 'up' }],
    story: { x: 26, y: 13, text: 'We rode the Wonder Wheel. Then we ate hot dogs on the beach.', q: 'What did we eat?', a: 'hot dogs', c: ['hot dogs', 'pie', 'soup'] },
    chest: [44, 24], bagels: [[2, 24], [45, 2]], heb: [20, 24],
    trees: [[3, 13], [19, 13], [27, 13]],
    birthday: { x: 28, y: 23 },
  },
};

function regionMap(id) {
  const sp = REGION_SPECS[id];
  const b = new TB(48, 34, sp.ground);
  b.region(sp.pal, 0, 0, 48, 34); b.regions[0].page = sp.page;
  // edges are trees, roads cross the middle
  for (let x = 0; x < 48; x++) { b.set(x, 0, 'T'); b.set(x, 33, 'T'); }
  for (let y = 0; y < 34; y++) { b.set(0, y, 'T'); b.set(47, y, 'T'); }
  b.rect(0, 15, 48, 1, '.').rect(0, 16, 48, 2, '=').rect(0, 18, 48, 1, '.');
  b.rect(22, 0, 1, 34, '.').rect(23, 0, 2, 34, '=').rect(25, 0, 1, 34, '.');
  b.rect(23, 15, 2, 4, 'z');
  // roads only reach the edge where there is somewhere to go
  if (!sp.links.n) b.rect(22, 0, 4, 1, 'T');
  if (!sp.links.s) b.rect(22, 33, 4, 1, 'T');
  if (!sp.links.w) b.rect(0, 15, 1, 4, 'T');
  if (!sp.links.e) b.rect(47, 15, 1, 4, 'T');
  // water
  if (sp.river === 'west') { b.rect(0, 1, 10, 32, '~'); b.rect(0, 15, 10, 4, 'b'); }
  if (sp.river === 'east') { b.rect(38, 1, 10, 32, '~'); b.rect(38, 15, 10, 4, 'b'); }
  if (sp.ocean) { b.rect(1, 19, 46, 7, 'd'); b.rect(1, 19, 46, 1, 'b'); b.rect(1, 26, 46, 7, '~'); b.rect(23, 19, 2, 1, 'b'); }
  if (sp.ice) b.rect(...sp.ice, 'i');
  // landmark plaza
  const L = sp.landmark;
  b.rect(L.x - 8, L.y - 4, 17, 10, sp.ground === 's' ? 's' : 'q');
  b.ent('deco', L.x, L.y, { solid: true, art: (x, y, t) => LANDMARKS[L.art](x, y, t) });
  b.set(L.x - 1, L.y, 'K').set(L.x + 1, L.y, 'K');
  for (const a of sp.extraArt || []) b.ent('deco', a.x, a.y, { solid: a.solid, art: (x, y, t) => LANDMARKS[a.art](x, y, t) });
  for (const [x, y, w, h] of sp.blocks) b.rect(x, y, w, h, 'H');
  for (const [x, y, w, h] of sp.fences || []) { b.rect(x, y, w, 1, 'F').rect(x, y + h - 1, w, 1, 'F').rect(x, y, 1, h, 'F').rect(x + w - 1, y, 1, h, 'F'); b.rect(x + 1, y + 1, w - 2, h - 2, ','); b.set(x + Math.floor(w / 2), y, ','); }
  for (const [x, y] of sp.trees) b.set(x, y, 'T');
  // people, Snoozies and things
  const helpers = [];
  sp.npcs.forEach(([x, y, o], i) => { const nid = `${id}${i + 1}`; helpers.push(nid); b.ent('npc', x, y, { id: nid, ...o }); });
  b.ent('boss', L.x, L.y + 4, { kind: 'snoozie', skin: sp.boss.skin, name: sp.boss.name, holidayLine: sp.boss.line, theme: sp.boss.theme, page: sp.page, pageName: HOLIDAY_NAMES[sp.page], helpers, topics: ['pattern', 'nonsense', 'decode', 'missingNum', 'story', 'letterSound', 'wordProblem'] });
  b.ent('guide', 21, 13, sp.guide);
  for (const s of sp.signs) b.ent('signpost', s.x, s.y, s);
  b.ent('sign', sp.story.x, sp.story.y, sp.story);
  b.ent('chest', sp.chest[0], sp.chest[1], { id: `chest-${id}` });
  for (const [x, y] of sp.bagels) b.ent('bagel', x, y);
  b.ent('heb', sp.heb[0], sp.heb[1], { back: { x: sp.heb[0], y: sp.heb[1] + 1, map: id } });
  b.ent('subway', 26, 20, {});
  if (sp.birthday) b.ent('birthday', sp.birthday.x, sp.birthday.y, { id: 'birthday' });
  // exits to the next regions
  for (const [dir, to] of Object.entries(sp.links)) addExit(b, id, dir, to);
  return b.build({
    spawn: arrivalSpot(id, Object.keys(sp.links)[0]), music: sp.music, bg: '#2a2040', palette: sp.pal,
    enter(sc) { regionWelcome(sc, id); },
    onHelp: bossReadyCheck,
  });
}

function addExit(b, from, dir, to) {
  const tiles = { n: [[23, 0], [24, 0]], s: [[23, b.h - 1], [24, b.h - 1]], w: [[0, 16], [0, 17]], e: [[b.w - 1, 16], [b.w - 1, 17]] }[dir];
  if (from === 'town') { tiles[0][0] = 31; tiles[1][0] = 32; }
  tiles.forEach(([x, y], i) => { b.set(x, y, '='); b.ent('exit', x, y, { to, dir, main: i === 0, at: arrivalSpot(to, OPPOSITE[dir]) }); });
}

const HOLIDAY_NAMES = { halloween: 'Halloween', thanks: 'Thanksgiving', hanukkah: 'Hanukkah', valentine: "Valentine's Day", purim: 'Purim', newyear: "New Year's", tubishvat: 'Tu BiShvat', earthday: 'Earth Day', passover: 'Passover', july4: 'Fourth of July' };
const PAGE_COLORS = { halloween: '#ff8a1f', thanks: '#c8322f', hanukkah: '#2f6fe0', valentine: '#ff5fa2', purim: '#b07cff', newyear: '#ffd23f', tubishvat: '#8be06b', earthday: '#3a8a5a', passover: '#4aa3ff', july4: '#e8442f' };

function regionWelcome(sc, id) {
  const st = townState();
  const key = 'seen-' + id;
  if (!st.flags[key]) {
    st.flags[key] = true; saveState();
    const sp = REGION_SPECS[id];
    if (sp) Talk.say(`Welcome to ${REGION_INFO[id].full}! It's ${HOLIDAY_NAMES[sp.page]} here! Help the neighbors, wake up ${sp.boss.name}, and win the calendar page!`, { show: `Welcome to ${REGION_INFO[id].name}!` });
  }
}
function bossReadyCheck(sc, npc) {
  for (const boss of sc.ents.filter(e => e instanceof TBoss)) {
    if (boss.helpers.includes(npc.id) && boss.need(sc) === 0 && !boss.won) sc.later(3.2, () => Talk.say(`Everyone is helped! Now go wake up ${boss.view.info.name}!`));
  }
}

for (const id of Object.keys(REGION_SPECS)) TOWN_MAPS[id] = () => regionMap(id);
TOWN_BAGELS = Object.values(TOWN_MAPS).reduce((n, f) => n + f().ents.filter(e => e.type === 'bagel').length, 0);

/* ---------- New town things ---------- */
/* Edge of a region: walk into it to go to the next one (locked ones explain why). */
class TExit extends TEnt {
  get solid() { return !regionOpen(this.to); }
  set solid(v) {}
  box() { return { x: this.tx * T, y: this.ty * T, w: T, h: T }; }
  touch(sc) { if (regionOpen(this.to)) sc.go(this.to, this.at); }
  onBump(sc) { Talk.say(REGION_LOCK_LINE[this.to] || 'This way is closed for now.'); Sfx.bonk(); }
  sortY() { return this.ty * T + T; }
  draw(sc) {
    if (!this.main) return;
    const x = this.tx * T + (this.dir === 'n' || this.dir === 's' ? T : T / 2), y = this.ty * T + T / 2;
    const off = { n: [0, 30], s: [0, -40], w: [50, -30], e: [-50, -30] }[this.dir];
    const sx = x + off[0], sy = y + off[1];
    rr(sx - 3, sy - 6, 6, 40, 2); paint('#8a6a4a', 2);
    ctx.font = '700 15px Fredoka, sans-serif';
    const label = REGION_INFO[this.to].name.replace(/^the /, '');
    const w = ctx.measureText(label).width + 50;
    rr(sx - w / 2, sy - 38, w, 32, 8); paint(regionOpen(this.to) ? '#2a7a4a' : '#8a8296', 3);
    text(label, sx + 10, sy - 22, { size: 15, color: '#fff', lw: 0, stroke: null });
    drawSignArrow(sx - w / 2 + 18, sy - 22, { n: 'up', s: 'down', w: 'left', e: 'right' }[this.dir], 0.28);
    if (!regionOpen(this.to)) { rr(sx + w / 2 - 14, sy - 46, 18, 16, 4); paint('#ffd23f', 2); }
  }
}

/* Subway entrance: ride to any place she has already been. */
class TSubway extends TEnt {
  box() { return { x: this.tx * T + 8, y: this.ty * T + 8, w: T - 16, h: T - 16 }; }
  touch(sc) {
    if (this.cool > 0) return;
    this.cool = 2;
    Game.go(new NYCMapScene(sc, true));
  }
  update(sc, dt) { this.t += dt; this.cool = (this.cool || 0) - dt; if (this.cool > 0 && overlap(sc.pbox(), this.box())) this.cool = 1; }
  sortY() { return this.ty * T; }
  draw(sc) {
    const x = this.cx(), y = this.cy();
    rr(x - 22, y - 18, 44, 36, 6); paint('#2a2a34', 3);
    for (let i = 0; i < 3; i++) { ctx.fillStyle = i % 2 ? '#c0c0c8' : '#9a9aa6'; ctx.fillRect(x - 16, y - 12 + i * 9, 32, 7); }
    rr(x - 3, y - 64, 6, 46, 2); paint('#2a7a4a', 2);
    circle(x, y - 70, 14); paint('#2a7a4a', 3);
    text('S', x, y - 69, { size: 16, color: '#fff', stroke: null });
  }
}

/* The birthday party on the boardwalk: the very end of the big adventure. */
class TBirthday extends TEnt {
  constructor(d, sc) { super(d, sc); this.done = !!townState().flags.birthday; this.asked = 0; }
  get here() { return QUESTS.filter(q => q.page).every(q => pageDone(q.page)); }
  get solid() { return this.here; }
  set solid(v) {}
  box() { return this.here ? { x: (this.tx - 1) * T, y: this.ty * T, w: T * 3, h: T } : { x: -999, y: -999, w: 0, h: 0 }; }
  onBump(sc) {
    if (this.done) { Talk.say('Happy birthday, Sadelle! You saved the whole year!'); return; }
    if (sc.q) return;
    this.asked = progGet('birthday');
    if (this.asked) { sc.ask(this, Ac.make(Ac.pickType(READING_TYPES.concat(MATH_TYPES))), `Welcome back! ${NUM_WORDS[3 - this.asked]} more candles to light! `); return; }
    sc.ask(this, Ac.make(Ac.pickType(READING_TYPES.concat(MATH_TYPES))), "Surprise! It's your birthday party! Everyone came! Answer three questions to light the candles! ");
  }
  answered(sc) {
    this.asked++;
    progSet('birthday', this.asked);
    if (this.asked < 3) { sc.later(1.5, () => { if (!sc.q) sc.ask(this, Ac.make(Ac.pickType(READING_TYPES.concat(MATH_TYPES))), `${NUM_WORDS[3 - this.asked]} more! `); }); return; }
    this.done = true;
    townState().flags.birthday = true;
    addTownTokens(sc, 70); saveState();
    Music.play('win', { loop: false }); Sfx.fanfare(); Sfx.applause(3);
    FX.confetti(this.cx(), this.cy() - 60, 140);
    sc.party = { t: 0, title: 'Happy Birthday, Sadelle!' };
    Talk.say("Make a wish and blow out the candles! Happy birthday, Sadelle! You won back every calendar page and saved the whole year in New York City! Mr. Snooze and Mrs. Doze say thank you!");
    sc.later(9, () => Music.play(sc.map.music || 'map'));
  }
  cancel() {}
  sortY() { return (this.ty + 1) * T; }
  draw(sc) {
    if (!this.here) return;
    const x = this.cx(), y = this.ty * T + T;
    // table and cake
    rr(x - 70, y - 40, 140, 26, 6); paint('#ff8ac4', 3);
    for (const s of [-1, 1]) { rr(x + s * 60 - 4, y - 16, 8, 16, 2); paint('#8a5a32', 2); }
    rr(x - 34, y - 78, 68, 40, 8); paint('#fffaf0', 3); rr(x - 34, y - 62, 68, 8, 0); paint('#ff5fa2', 0);
    for (let i = 0; i < 7; i++) { const cx = x - 27 + i * 9; rr(cx - 2, y - 94, 4, 16, 1); paint(['#4aa3ff', '#ffd23f', '#8be06b', '#ff5fa2'][i % 4], 1); if (this.done || this.asked > i / 2.4) drawFlame(cx, y - 94, 0.5, this.t + i); }
    // Mr. Snooze and Mrs. Doze, awake and partying
    drawMrSnooze(x - 120, y - 70, 0.38, this.t, true);
    drawMrSnooze(x + 120, y - 70, 0.38, this.t + 1, true);
    for (let i = 0; i < 4; i++) { const bx = x - 150 + i * 100, by = y - 170 + Math.sin(this.t * 2 + i) * 8; ctx.strokeStyle = OUT; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, by + 20); ctx.lineTo(bx + 4, by + 70); ctx.stroke(); ellipse(bx, by, 16, 20); paint(['#ff5fa2', '#ffd23f', '#3ec1d3', '#8be06b'][i], 3); }
    if (!this.done) { const by = y - 200 + Math.sin(this.t * 4) * 4; circle(x, by, 15); paint('#ffd23f', 3); text('!', x, by + 1, { size: 22, color: OUT, stroke: null }); }
  }
}

const TOWN_EXTRA_ENTS = { exit: TExit, subway: TSubway, birthday: TBirthday, ...SHOP_ENTS };

/* ---------- Finding the way across the city ---------- */
let MAP_GRAPH = null;
function mapGraph() {
  if (MAP_GRAPH) return MAP_GRAPH;
  MAP_GRAPH = {};
  for (const [id, f] of Object.entries(TOWN_MAPS)) {
    if (id === 'heb') continue;
    MAP_GRAPH[id] = [...new Set(f().ents.filter(e => e.to).map(e => e.to))];
  }
  return MAP_GRAPH;
}
/* The next map to walk into, on the way from one map to another. */
function nextHop(from, to) {
  if (from === to) return null;
  const g = mapGraph(), prev = { [from]: null }, q = [from];
  while (q.length) {
    const m = q.shift();
    if (m === to) break;
    for (const n of g[m] || []) if (!(n in prev)) { prev[n] = m; q.push(n); }
  }
  if (!(to in prev)) return null;
  let m = to;
  while (prev[m] !== from && prev[m] !== null) m = prev[m];
  return m;
}

function hopCount(from, to) {
  let n = 0, m = from;
  while (m && m !== to && n < 20) { m = nextHop(m, to); n++; }
  return n;
}
const regionVisited = id => id === 'town' || !!townState().flags['seen-' + id];

/* ---------- The big goal ---------- */
const QUESTS = [
  { page: 'halloween', map: 'town', name: 'Halloween Street', at: 'on Halloween Street', boss: 'the Great Gourd', bossPlace: 'in the pumpkin patch', helpers: ['hw1', 'hw2', 'hw3', 'hw4', 'catlady'] },
  { page: 'thanks', map: 'town', name: 'the market', at: 'at the market', boss: 'Gobbler', bossPlace: 'at the big arch', helpers: ['tg1', 'tg2', 'tg3', 'tg4'] },
  { page: 'hanukkah', map: 'town', name: 'Latke Lane', at: 'on Latke Lane', boss: 'Spinny the Giant Dreidel', bossPlace: 'on Latke Lane', helpers: ['th1', 'th2', 'th3', 'th4'] },
  { special: 'finale' },
  ...['dumbo', 'les', 'times', 'cpark', 'bronx', 'queens', 'coney'].map(id => {
    const sp = REGION_SPECS[id], nm = REGION_INFO[id].name;
    return { page: sp.page, map: id, name: nm, at: `${id === 'les' ? 'on' : id === 'bronx' || id === 'coney' ? 'at' : 'in'} ${nm}`, boss: sp.boss.name, bossPlace: sp.boss.place, helpers: sp.npcs.map((_, i) => `${id}${i + 1}`) };
  }),
  { special: 'birthday' },
];
const ROOM_NAMES = { kitchen: "Grandma's house", deli: 'the deli', library: 'the library', tunnel: 'the tunnel', shop: 'the Bagel Shop' };

let TOWN_LOC = null;
function townLocations() {
  if (TOWN_LOC) return TOWN_LOC;
  TOWN_LOC = { bagels: [] };
  for (const [mapId, f] of Object.entries(TOWN_MAPS)) {
    if (mapId === 'heb') continue;
    for (const e of f().ents) {
      if (e.type === 'boss') TOWN_LOC['boss-' + e.page] = { map: mapId, x: e.x, y: e.y + 1 };
      else if (e.type === 'snooze') TOWN_LOC.snooze = { map: mapId, x: e.x, y: e.y + 1 };
      else if (e.type === 'birthday') TOWN_LOC.birthday = { map: mapId, x: e.x, y: e.y + 1 };
      else if (e.type === 'bagel') TOWN_LOC.bagels.push({ map: mapId, x: e.x, y: e.y, id: `${mapId}-${e.x}-${e.y}` });
      else if (e.type === 'npc' || e.id) { if (e.id) TOWN_LOC[e.id] = { map: mapId, x: e.x, y: e.y }; }
    }
  }
  return TOWN_LOC;
}

/* Words for which way to go, from where she is. */
function directionWords(sc, t) {
  if (!t) return '';
  if (t.map !== sc.mapId) {
    if (ROOM_NAMES[t.map] && nextHop(sc.mapId, t.map) === t.map) return `Go inside ${ROOM_NAMES[t.map]}.`;
    if (ROOM_NAMES[sc.mapId]) return 'Go back outside.';
    const hop = nextHop(sc.mapId, t.map);
    const where = REGION_INFO[t.map] ? REGION_INFO[t.map].name : REGION_INFO[hop] ? REGION_INFO[hop].name : '';
    const far = hopCount(sc.mapId, t.map) >= 3 && regionVisited(t.map);
    if (far) return `${where} is far away! Ride the subway: look for the green S sign. Or walk and follow the yellow arrow.`;
    return where ? `Walk to ${where}! Follow the yellow arrow.` : 'Follow the yellow arrow.';
  }
  const dx = t.x * T - sc.p.x, dy = t.y * T - sc.p.y;
  if (Math.hypot(dx, dy) < T * 3) return "It's right here!";
  return Math.abs(dx) > Math.abs(dy) ? `Go ${dx < 0 ? 'left' : 'right'}.` : `Go ${dy < 0 ? 'up' : 'down'}.`;
}

function townGoal(sc) {
  const st = townState(), L = townLocations();
  const dist = t => (t.map === sc.mapId ? 0 : 5000) + Math.hypot(t.x * T - sc.p.x, t.y * T - sc.p.y);
  for (const d of QUESTS) {
    if (d.special === 'finale') {
      if (st.flags.finale) continue;
      const target = L.snooze;
      return { short: 'Go home for the big party!', say: 'You have all three Brooklyn calendar pages! Go home to your stoop. Mr. Snooze is waiting there!', guide: `Mr. Snooze is at your stoop! ${directionWords(sc, target)}`, target };
    }
    if (d.special === 'birthday') {
      if (st.flags.birthday) continue;
      const target = L.birthday;
      return { short: 'Go to your birthday party!', say: 'You won back every calendar page! Go to the Coney Island boardwalk. Your birthday party is waiting!', guide: `Your birthday party is at Coney Island! ${directionWords(sc, target)}`, target };
    }
    if (pageDone(d.page)) continue;
    const left = d.helpers.filter(id => !st.npcs[id]);
    if (left.length) {
      // the lost cat is its own little quest: meet Mrs. Levi, find Babka, bring her home
      if (left.includes('catlady') && st.flags.catAsked) {
        const following = st.flags.catFollow, t2 = following ? L.catlady : L.lostcat;
        return following
          ? { short: 'Bring Babka home to Mrs. Levi!', say: 'Babka is following you! Bring her home to Mrs. Levi on Halloween Street.', guide: `Mrs. Levi is waiting for Babka! ${directionWords(sc, t2)}`, target: t2 }
          : { short: 'Find Babka the cat in the park!', say: "Mrs. Levi's cat Babka is lost in Prospect Park. Can you find her?", guide: `Babka the cat is hiding in Prospect Park. ${directionWords(sc, t2)}`, target: t2 };
      }
      const target = left.map(id => L[id]).sort((a, b) => dist(a) - dist(b))[0];
      const n = left.length;
      const there = d.map !== sc.mapId && REGION_INFO[d.map] && !ROOM_NAMES[sc.mapId] && !(ROOM_NAMES[target.map] && d.map === 'town');
      return {
        short: there ? `Walk to ${d.name.replace(/^the /, 'the ')}!` : `Help ${n} neighbor${n > 1 ? 's' : ''} ${d.at}`,
        say: `Your goal: help ${NUM_WORDS[n]} neighbor${n > 1 ? 's' : ''} ${d.at}. Follow the yellow arrow!`,
        guide: `Neighbors ${d.at} need your help! ${directionWords(sc, target)}`, target,
      };
    }
    const target = L['boss-' + d.page];
    return {
      short: `Wake up ${d.boss}!`,
      say: `Everyone ${d.at} is helped! Now wake up ${d.boss} ${d.bossPlace} to win the calendar page!`,
      guide: `${d.boss} is sleeping ${d.bossPlace}. ${directionWords(sc, target)} Wake him up!`, target,
    };
  }
  // after everything: golden bagels (some need a costume first)
  const needs = { 'town-4-35': ['bat', 'chest-bat', 'Find the Bat Cape in the park! It lets you float over the pond.'],
    'town-15-2': ['dreidel', 'chest-dreidel', 'Find the Dreidel Suit on Latke Lane! Then spin by the three candles.'],
    'tunnel-14-4': ['turkey', 'chest-turkey', 'Find the Turkey Suit at the market! Then pound the cracked manhole.'] };
  const leftB = L.bagels.filter(b => !st.bagels.includes(b.id));
  const ready = leftB.filter(b => !needs[b.id] || S.costumes.includes(needs[b.id][0]));
  if (!ready.length && leftB.length) {
    const [, chest, line] = needs[leftB[0].id];
    return { short: 'Find a costume chest!', say: line, guide: line, target: L[chest] };
  }
  const bagel = ready.sort((a, b) => dist(a) - dist(b))[0];
  if (bagel) return { short: 'Find all the golden bagels!', say: 'You saved the whole year! Now find all the golden bagels in New York. Follow the arrow!', guide: `There is a golden bagel hiding nearby. ${directionWords(sc, bagel)}`, target: bagel };
  return { short: 'You saved the whole year!', say: 'You did everything! Help neighbors again, find secret blue doors, or play in the Speed Arcade!', guide: 'You did it all! Try the Speed Arcade, or ride the subway.', target: null };
}

/* Calendar pages across the top, plus helpers for the quest here. */
function drawQuestHUD(sc) {
  const pages = QUESTS.filter(q => q.page);
  pages.forEach((q, i) => {
    const x = 26 + i * 24, y = 68, got = pageDone(q.page);
    rr(x - 10, y - 12, 20, 24, 3); paint(got ? '#fffaf0' : 'rgba(255,255,255,.3)', 2);
    rr(x - 10, y - 12, 20, 7, 3); paint(got ? PAGE_COLORS[q.page] : 'rgba(255,255,255,.2)', 0);
  });
  drawKey('M', VW - 100, 38, '#e8f0ff', 40);
}

/* ---------- The New York City map (M key, or a subway ride) ---------- */
class NYCMapScene {
  constructor(back, travel) {
    this.back = back; this.travel = travel; this.t = 0; this.talkBottom = true;
    const st = townState();
    this.nodes = Object.keys(REGION_INFO).filter(id => travel ? (regionOpen(id) && (id === 'town' || st.flags['seen-' + id])) : true);
    this.sel = Math.max(0, this.nodes.indexOf(back.mapId in REGION_INFO ? back.mapId : 'town'));
    Talk.say(travel ? 'Subway! Where do you want to go? Use the arrow keys, then press space to ride.' : 'Here is New York City! You are here. Press M or Escape to go back.');
  }
  update(dt) {
    this.t += dt; Talk.update(dt);
    if (Input.pressed('left') || Input.pressed('up')) { this.sel = (this.sel + this.nodes.length - 1) % this.nodes.length; Sfx.click(); Talk.say(REGION_INFO[this.nodes[this.sel]].name); }
    if (Input.pressed('right') || Input.pressed('down')) { this.sel = (this.sel + 1) % this.nodes.length; Sfx.click(); Talk.say(REGION_INFO[this.nodes[this.sel]].name); }
    if (Input.key('escape') || Input.key('m')) { Game.go(this.back); return; }
    if (this.travel && (Input.key(' ') || Input.key('enter'))) {
      const id = this.nodes[this.sel];
      if (id === this.back.mapId) { Game.go(this.back); return; }
      Sfx.teleport();
      const spot = SUBWAY_SPOT[id] || { x: 26, y: 21 };
      Game.go(new TownScene(id, { x: spot.x, y: spot.y + 1 }));
    }
  }
  draw() {
    const t = this.t;
    ctx.fillStyle = '#5aa0d8'; ctx.fillRect(0, 0, VW, VH);
    ctx.fillStyle = '#7ab8e8'; for (let i = 0; i < 20; i++) { ellipse((i * 137 + t * 15) % VW, (i * 83) % VH, 18, 3); ctx.fill(); }
    const land = (pts, col) => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); paint(col, 4); };
    land([[300, 0], [520, 0], [520, 120], [430, 110], [380, 95], [340, 90]], '#c8d8a0');             // the Bronx
    land([[300, 95], [380, 100], [410, 120], [395, 260], [380, 350], [330, 380], [300, 350], [295, 200]], '#e8dcc0'); // Manhattan
    land([[420, 130], [560, 125], [760, 120], [800, 300], [690, 330], [560, 290], [450, 280]], '#d8e0b0'); // Queens
    land([[430, 300], [560, 300], [700, 340], [680, 480], [600, 540], [470, 540], [430, 440]], '#e8d0b0'); // Brooklyn
    land([[80, 380], [220, 360], [250, 470], [160, 540], [60, 530]], '#d0d8b8');                            // Staten Island
    // Statue of Liberty on her island
    circle(270, 440, 14); paint('#c8d8a0', 2); rr(266, 410, 8, 26, 2); paint('#6ab8a0', 2); circle(270, 406, 6); paint('#6ab8a0', 2);
    text('Statue of Liberty', 270, 470, { size: 12, color: OUT, stroke: null });
    const labels = [['THE BRONX', 410, 25], ['MANHATTAN', 300, 120], ['QUEENS', 670, 170], ['BROOKLYN', 640, 470], ['STATEN ISLAND', 150, 440]];
    for (const [l, x, y] of labels) text(l, x, y, { size: 14, color: 'rgba(60,40,80,.6)', stroke: null });
    // paths between regions
    ctx.setLineDash([3, 9]); ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (const [id, f] of Object.entries(REGION_SPECS)) for (const to of Object.values(f.links)) {
      const a = REGION_INFO[id].mapAt, b = REGION_INFO[to].mapAt;
      ctx.strokeStyle = regionOpen(id) && regionOpen(to) ? '#fffaf0' : 'rgba(80,70,100,.5)';
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    ctx.setLineDash([]);
    // region stops
    for (const [id, info] of Object.entries(REGION_INFO)) {
      const [x, y] = info.mapAt, open = regionOpen(id), page = info.page, sel = this.nodes[this.sel] === id;
      const done = page ? pageDone(page) : ['halloween', 'thanks', 'hanukkah'].every(pageDone);
      if (sel) { circle(x, y, 30 + Math.sin(t * 5) * 3); ctx.fillStyle = 'rgba(255,230,120,.5)'; ctx.fill(); }
      circle(x, y, 20); paint(open ? info.color : '#a09aa8', 4);
      if (done) { star(x, y, 12); paint('#fffaf0', 2); }
      else if (!open) { rr(x - 8, y - 4, 16, 12, 3); paint('#ffd23f', 2); ctx.lineWidth = 3; ctx.strokeStyle = OUT; ctx.beginPath(); ctx.arc(x, y - 4, 5, Math.PI, 0); ctx.stroke(); }
      text(info.name.replace(/^the /, ''), x, y + 34, { size: 15, color: '#fff', lw: 4 });
    }
    // where she is
    const here = REGION_INFO[this.back.mapId] ? this.back.mapId : 'town';
    const [hx, hy] = REGION_INFO[here].mapAt;
    drawHero(hx + 26, hy + 6 - Math.abs(Math.sin(t * 4)) * 6, { scale: 0.55, mazel: false });
    text(this.travel ? 'Subway: pick a stop, then press SPACE' : 'New York City', VW / 2, 30, { size: 26, color: '#fff', lw: 6 });
    text('Esc = back', VW - 70, VH - 20, { size: 15, color: '#fff', lw: 3 });
    const pages = QUESTS.filter(q => q.page);
    text(`Calendar pages: ${pages.filter(q => pageDone(q.page)).length} / ${pages.length}`, 120, VH - 20, { size: 18, color: '#fff', lw: 4 });
    Talk.draw();
  }
}
