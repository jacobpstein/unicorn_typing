// Dev-only: paste into the console (or load with ?test) to auto-play the whole story and report errors.
window.runAll = async () => {
  window.__errs = []; addEventListener('error', e => window.__errs.push(e.message + ' @' + e.lineno + ' ' + (e.filename || '').split('/').pop()));
  const stepN = n => { for (let i = 0; i < n; i++) { Game.scene.update(DT); Input.endStep(); } ctx.setTransform(View.k, 0, 0, View.k, 0, 0); Game.scene.draw(); };
  const clickAt = r => { Input.click = { x: r.x + r.w / 2, y: r.y + r.h / 2 }; Input.mouse = Input.click; };
  const solveOne = wrong => {
    const sc = Game.scene, ov = sc.overlay; if (!ov) return 'none';
    if (ov instanceof WheelRide) { stepN(200); Input.hit.add(' '); stepN(1); return 'ride'; }
    if (ov instanceof ClueCard || ov instanceof PartyOverlay) { stepN(300); Input.hit.add(' '); stepN(1); return 'card'; }
    if (ov instanceof PetGame) { for (let i = 0; i < 3; i++) { Input.hit.add(' '); stepN(2); } stepN(120); return 'pet'; }
    if (ov instanceof BeadDesign) { Input.hit.add('enter'); stepN(1); return 'design'; }
    if (ov instanceof BeadPuzzle) {
      if (ov.state === 'done') { Input.hit.add(' '); stepN(1); return 'beaddone'; }
      const need = ov.nextNeeded(); if (!need || ov.pausing) return 'beadwait';
      if (ov.useShapes) ov.shape = need.shape || 'round';
      const tr = ov.trayRects(); clickAt(wrong ? tr.find(t => t.c !== need.c) : tr.find(t => t.c === need.c)); stepN(1); return 'bead';
    }
    if (!(ov instanceof Challenge)) return 'other:' + ov.constructor.name;
    if (ov.state === 'done') { stepN(30); Input.hit.add(' '); stepN(1); return 'done'; }
    if (ov.state === 'between') { stepN(400); return 'between'; }
    const it = ov.item;
    if (it.kind === 'choice' || (it.kind === 'magic' && it.phase === 1)) { const rs = ov.choiceRects(it); let i = it.choices.findIndex(c => String(c.val) === String(it.answer)); if (wrong) i = (i + 1) % it.choices.length; clickAt(rs[i]); stepN(1); return 'choice'; }
    if (it.kind === 'magic') { Input.typed.push('e'); stepN(1); return 'magic0'; }
    if (it.kind === 'tiles') { const rs = ov.tileRects(it); let i = it.tiles.findIndex(t => !t.used && t.s === it.parts[it.next]); if (wrong) { const j = it.tiles.findIndex(t => !t.used && t.s !== it.parts[it.next]); if (j >= 0) i = j; } clickAt(rs[i]); stepN(1); return 'tile'; }
    if (it.kind === 'type') { Input.typed.push(wrong ? (it.word[it.pos] === 'q' ? 'z' : 'q') : it.word[it.pos]); stepN(1); return 'type'; }
    if (it.kind === 'build') { const tot = it.placed.reduce((a, b) => a + b, 0), rem = it.answer - tot; const btns = it.buttons.map((b, i) => ({ x: PX + 40, y: PY + 96 + i * 98, w: 200, h: 84, b })); if (rem === 0 || wrong) { clickAt({ x: PX + PW - 230, y: PY + PH - 96, w: 190, h: 70 }); stepN(1); return 'send'; } clickAt(btns.filter(x => x.b.val <= rem).sort((a, c) => c.b.val - a.b.val)[0]); stepN(1); return 'add'; }
    return 'unknown';
  };
  const solve = async (wrongEvery = 4) => { for (let k = 0; k < 500; k++) { if (!Game.scene.overlay) return true; const r = solveOne(wrongEvery && k % wrongEvery === 1); if (r === 'beadwait') await new Promise(res => setTimeout(res, 300)); } return false; };
  const go = m => { Game.go(new WorldScene(m)); stepN(40); };
  const log = [];
  S = defaultState(); go('school');
  for (const [x, y] of [[15, 20], [23, 21], [18, 18]]) { Game.scene.p.x = x * T + T / 2; Game.scene.p.y = y * T + T - 6; stepN(3); }
  let guard = 0;
  while (STORY[S.step].id !== 'free' && guard++ < 40) {
    const g = currentGoal(); if (Game.scene.mapId !== g.map) go(g.map);
    const sc = Game.scene, e = sc.ents.find(x => x.id === g.ent);
    if (!e) { log.push('missing ent ' + g.ent); break; }
    const before = S.step; e.onBump(sc);
    const settle = async () => { for (let w = 0; w < 120 && !Game.scene.overlay && S.step === before; w++) { await new Promise(r => setTimeout(r, 250)); stepN(15); } };
    for (let round = 0; round < 6 && S.step === before; round++) { await settle(); await solve(round ? 0 : 4); }
    log.push(`${STORY[before].id}${S.step > before ? '' : ' (stuck)'}`);
    if (S.step === before) break;
  }
  return { log, step: STORY[S.step].id, clues: S.clues.length, errs: window.__errs };
};
