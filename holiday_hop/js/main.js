'use strict';

/* Boot, fixed-timestep loop and scene switching. */

const Game = {
  scene: null,
  sessionTime: 0,
  go(scene) { this.scene = scene; Talk.bottom = !!scene.talkBottom; },
};

function boot() {
  S = loadState();
  if (!S.created && S.stickers.length) S.created = true;
  Input.init();
  Speech.init();
  const today = new Date().toISOString().slice(0, 10);
  if (!S.days.includes(today)) { S.days.push(today); saveState(); }

  const q = new URLSearchParams(location.search);
  if (q.get('town')) { S.created = true; Game.go(new TownScene(q.get('town'))); }
  else if (q.get('speed')) { S.created = true; Game.go(new SpeedScene()); }
  else Game.go(new TitleScene());

  addEventListener('keydown', e => { if (e.shiftKey && e.key.toLowerCase() === 'p') { e.preventDefault(); Parent.open(); } });
  cv.addEventListener('pointerdown', e => {
    Sfx.init();
    const r = cv.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * VW, y = (e.clientY - r.top) / r.height * VH;
    if (Math.hypot(x - (VW - 40), y - 38) < 30) replayPrompt();
    cv.focus();
  });
  cv.focus();

  let last = performance.now(), acc = 0, saveT = 0;
  const frame = now => {
    const elapsed = Math.min(0.1, (now - last) / 1000);
    last = now;
    acc += elapsed;
    while (acc >= DT) {
      Game.scene.update(DT);
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
