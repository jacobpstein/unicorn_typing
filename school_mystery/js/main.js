'use strict';

/* Music for each place, boot, and the main loop. */

Object.assign(SONGS, {
  school: SONGS.map,
  tunnel: {
    step: 0.2,
    tracks: [
      { type: 'triangle', vol: 0.08, seq: 'A4 . C5 . E5 . D5 . C5 - - . B4 . A4 . G4 . A4 - - - . . E4 . A4 . C5 . B4 - - . G4 . A4 - - - . . . .' },
      { type: 'square', vol: 0.018, seq: 'A2 . . . E3 . . . F2 . . . C3 . . . G2 . . . D3 . . . A2 . . . E3 . . .' },
      { drum: true, vol: 0.25, seq: 'k . . . . . h . k . . . . . h .' },
    ],
  },
  museum: {
    step: 0.19,
    tracks: [
      { type: 'triangle', vol: 0.09, seq: 'C5 . E5 . G5 . C6 - - . B5 . G5 . A5 - - . F5 . D5 . E5 . C5 - - - . . G4 . C5 . D5 . E5 - . F5 . E5 . D5 . C5 - - - . . . .' },
      { type: 'sine', vol: 0.1, seq: 'C3 - - - G3 - - - A2 - - - E3 - - - F2 - - - C3 - - - G2 - - - G3 - - -' },
    ],
  },
  rink: {
    step: 0.16,
    tracks: [
      { type: 'triangle', vol: 0.09, seq: 'G5 - - E5 . . F5 - - D5 . . E5 - - C5 . . D5 - - B4 . . C5 - - - - - E5 - - G5 . . C6 - - B5 . . A5 - - G5 . . F5 - - D5 . . C5 - - - - -' },
      { type: 'sine', vol: 0.11, seq: 'C3 . . G3 . . C3 . . G3 . . F2 . . C3 . . G2 . . D3 . .' },
      { drum: true, vol: 0.25, seq: 'k . . h . . h . .' },
    ],
  },
  shop: SONGS.thanksgiving,
  station: {
    step: 0.14,
    tracks: [
      { type: 'square', vol: 0.03, seq: 'E5 . E5 . G5 . E5 . D5 . C5 . D5 - . . E5 . G5 . A5 . G5 . E5 . D5 . C5 - . . C5 . D5 . E5 . E5 . D5 . D5 . C5 . . . G4 - C5 - - - . . . .' },
      { type: 'triangle', vol: 0.12, seq: 'C3 . G3 . C3 . G3 . A2 . E3 . A2 . E3 . F2 . C3 . F2 . C3 . G2 . D3 . G2 . D3 .' },
      { drum: true, vol: 0.45, seq: 'k h k h k h k h' },
    ],
  },
  aquarium: {
    step: 0.22,
    tracks: [
      { type: 'sine', vol: 0.11, seq: 'E5 - G5 - B5 - - - A5 - F#5 - D5 - - - E5 - G5 - B5 - D6 - C#6 - - - - - . .' },
      { type: 'triangle', vol: 0.07, seq: 'E3 - - - B3 - - - D3 - - - A3 - - - C3 - - - G3 - - - A2 - - - E3 - - -' },
    ],
  },
  coney: {
    step: 0.13,
    tracks: [
      { type: 'square', vol: 0.032, seq: 'C5 . E5 G5 . E5 C5 . D5 . F5 A5 . F5 D5 . E5 . G5 C6 . G5 E5 . F5 E5 D5 C5 - . . . G4 . C5 E5 . C5 G4 . A4 . C5 F5 . C5 A4 . G4 . B4 D5 . G5 F5 . E5 D5 C5 . - . . .' },
      { type: 'triangle', vol: 0.12, seq: 'C3 . G3 . C3 . G3 . F2 . C3 . F2 . C3 . C3 . G3 . C3 . G3 . G2 . D3 . G2 . D3 .' },
      { drum: true, vol: 0.45, seq: 'k . h . k h h . k . h . k . h h' },
    ],
  },
});

const Game = {
  scene: null,
  sessionTime: 0,
  breakSaid: false,
  go(scene) { this.scene = scene; },
};

function boot() {
  S = loadState();
  Input.init();
  Speech.init();
  const today = new Date().toISOString().slice(0, 10);
  if (!S.days.includes(today)) { S.days.push(today); saveState(); }

  const q = new URLSearchParams(location.search);
  if (q.get('map') && MAPS[q.get('map')]) Game.go(new WorldScene(q.get('map')));
  else Game.go(new TitleScene());

  addEventListener('keydown', e => { if (e.shiftKey && e.key.toLowerCase() === 'p') { e.preventDefault(); Parent.open(); } });
  cv.focus();

  let last = performance.now(), acc = 0, saveT = 0, idle = 0;
  const frame = now => {
    const elapsed = Math.min(0.1, (now - last) / 1000);
    last = now;
    acc += elapsed;
    while (acc >= DT) {
      Game.scene.update(DT);
      // Mazel's gentle nudge if she stands still for a while with nothing open
      const sc = Game.scene;
      if (sc instanceof WorldScene && !sc.overlay && !sc.p.moving && !Speech.speaking) {
        idle += DT;
        if (idle > 25) { idle = 0; const g = currentGoal(); if (g.map) Talk.say(`Mrrp! ${g.say}`, { show: g.short }); }
      } else idle = 0;
      Input.endStep();
      acc -= DT;
      if (document.hasFocus()) {
        Game.sessionTime += DT;
        S.played[today] = (S.played[today] || 0) + DT;
        saveT += DT;
        if (saveT > 15) { saveT = 0; saveState(); }
      }
    }
    ctx.setTransform(View.k, 0, 0, View.k, 0, 0);
    ctx.clearRect(0, 0, VW, VH);
    Game.scene.draw();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

window.Game = Game;
document.fonts && document.fonts.ready.then(boot, boot);
if (!document.fonts) boot();
