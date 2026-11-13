// Dev-only: load the game with ?test, then run runAll() in the console. It plays everything and overwrites the save.
window.runAll = async () => {
  const errs = []; addEventListener('error', e => errs.push(e.message + ' @' + e.lineno + ' ' + (e.filename || '').split('/').pop()));
  const stepN = n => { for (let i = 0; i < n; i++) { Game.scene.update(DT); Input.endStep(); } ctx.setTransform(View.k, 0, 0, View.k, 0, 0); Game.scene.draw(); Input.drawClick = null; };
  const clickAt = r => { Input.click = { x: r.x + r.w / 2, y: r.y + r.h / 2 }; Input.mouse = Input.click; };
  const report = { log: [], problems: [] };

  // 1. every hand-built boulder level is solvable
  BOULDER_LEVELS.forEach((tier, t) => tier.forEach((rows, i) => { const L = parseBoulder(rows); if (L.bs.length !== L.goals.length || !boulderSolvable(L, L.px, L.py, L.bs)) report.problems.push(`boulder ${t}.${i} unsolvable`); }));

  // 2. every puzzle at every level generates, draws, and is solvable
  S = defaultState(); saveState();
  Game.go(new WorldScene('isle')); stepN(5);
  const solve = async (wrongEvery = 0) => {
    for (let k = 0; k < 900; k++) {
      const sc = Game.scene, ov = sc.overlay;
      if (!ov) return true;
      if (ov instanceof EmberScene) { ov.done = true; ov.t = 5; Input.hit.add(' '); stepN(1); continue; }
      if (ov instanceof ClueCard) { stepN(70); Input.hit.add(' '); stepN(1); continue; }
      if (ov instanceof PartyOverlay) { stepN(260); Input.hit.add(' '); stepN(1); continue; }
      if (ov instanceof PetGame) { for (let i = 0; i < 3; i++) { Input.hit.add(' '); stepN(2); } stepN(90); continue; }
      if (ov instanceof BeadPuzzle) {
        if (ov.state === 'done') { Input.hit.add(' '); stepN(1); continue; }
        const need = ov.nextNeeded();
        if (!need || ov.pausing) { await new Promise(r => setTimeout(r, 200)); stepN(2); continue; }
        if (ov.useShapes) ov.shape = need.shape || 'round';
        clickAt(ov.trayRects().find(t => t.c === need.c)); stepN(1); continue;
      }
      if (!(ov instanceof Challenge)) return 'stuck on ' + ov.constructor.name;
      if (ov.state === 'done') { stepN(30); Input.hit.add(' '); stepN(1); continue; }
      if (ov.state === 'why') { clickAt(ov.whyRects()[0]); stepN(1); continue; }
      if (ov.state === 'between') { stepN(60); ov.wait = 0; stepN(2); continue; }
      const it = ov.item, wrong = wrongEvery && k % wrongEvery === 1;
      if (it.kind === 'custom') {
        if (it.phase === 'word') { ov.grade(true, it.answer); stepN(1); continue; }
        if (it.phase === 'look') { Input.hit.add(' '); stepN(1); continue; }
        if (it.phase === 'pick' && it.choices) { const rs = ov.choiceRects(it); clickAt(rs[it.choices.findIndex(c => String(c.val) === String(it.answer))]); stepN(1); continue; }
        if (wrong && !it.solved) { ov.grade(false, 'x'); stepN(1); if (ov.state === 'ask' && ov.item === it) { const k = Object.keys(it).length; void k; } }
        it.host = ov; if (!it.solved) it.autoSolve(ov); stepN(2); continue;
      }
      if (it.kind === 'choice' || (it.kind === 'magic' && it.phase === 1)) { const rs = ov.choiceRects(it); let i = it.choices.findIndex(c => String(c.val) === String(it.answer)); if (wrong) i = (i + 1) % it.choices.length; clickAt(rs[i]); stepN(1); continue; }
      if (it.kind === 'magic') { Input.typed.push('e'); stepN(1); continue; }
      if (it.kind === 'tiles') { const rs = ov.tileRects(it); clickAt(rs[it.tiles.findIndex(t => !t.used && t.s === it.parts[it.next])]); stepN(1); continue; }
      if (it.kind === 'type') { Input.typed.push(it.word[it.pos]); stepN(1); continue; }
      if (it.kind === 'build') { const rem = it.answer - it.placed.reduce((a, b) => a + b, 0); const btns = it.buttons.map((b, i) => ({ x: PX + 40, y: PY + 96 + i * 98, w: 200, h: 84, b })); if (rem === 0) { clickAt({ x: PX + PW - 230, y: PY + PH - 96, w: 190, h: 70 }); stepN(1); continue; } clickAt(btns.filter(x => x.b.val <= rem).sort((a, c) => c.b.val - a.b.val)[0]); stepN(1); continue; }
      return 'unknown kind ' + it.kind;
    }
    return 'ran out of steps on ' + (Game.scene.overlay && Game.scene.overlay.title);
  };
  for (const name of Object.keys(PUZ)) {
    const skillId = PUZ[name].make({ count: 1, onDone() {} }).skill;
    for (let lv = 0; lv <= SKILL_MAX[skillId]; lv++) {
      for (let rep = 0; rep < 4; rep++) {
        skill(skillId).level = lv; S.taught = { [skillId]: rep === 0 ? undefined : true };
        const sc = Game.scene;
        try { sc.open(PUZ[name].make({ count: 1, coins: 1 })); stepN(3); const r = await solve(rep === 2 ? 1 : rep === 3 ? 2 : 0); if (r !== true) report.problems.push(`${name} L${lv}: ${r}`); }
        catch (e) { report.problems.push(`${name} L${lv}: ${e.message}`); sc.overlay = null; }
      }
    }
    skill(skillId).level = 0;
  }
  // 3. hint ladder: Help never breaks a custom puzzle
  for (const name of Object.keys(PUZ)) {
    const sc = Game.scene; const ov = PUZ[name].make({ count: 1, coins: 1 }); sc.open(ov); stepN(2);
    if (ov.item.kind === 'custom' && !ov.item.playing && ov.item.phase !== 'look') for (let h = 0; h < 4; h++) { try { clickAt(HELP_BTN); stepN(2); } catch (e) { report.problems.push(`help ${name}: ${e.message}`); } }
    const r = await solve(); if (r !== true) report.problems.push(`help ${name}: ${r}`);
  }
  // 4. lineups: exactly one kid fits, every clue is needed; grids have one answer; skip counts stay in range
  for (let lv = 0; lv < LINEUP_LADDER.length; lv++) for (let i = 0; i < 200; i++) {
    const P = makeLineup(lv), L = LINEUP_LADDER[lv], fits = cl => P.suspects.map((_, k) => k).filter(k => cl.every(q => q.test(k)));
    if (fits(P.chosen).length !== 1 || fits(P.chosen)[0] !== P.ci) report.problems.push(`lineup L${lv}: not exactly one answer`);
    if (P.chosen.some((_, j) => fits(P.chosen.filter((__, k) => k !== j)).length === 1)) report.problems.push(`lineup L${lv}: a clue is not needed`);
    if (P.chosen.length !== L.clues || P.suspects.length !== L.n) report.problems.push(`lineup L${lv}: wrong size`);
    if (P.suspects.some(x => x.tags.length > 3)) report.problems.push(`lineup L${lv}: too many items`);
    if (report.problems.length > 60) break;
  }
  for (let lv = 0; lv <= 4; lv++) for (let i = 0; i < 200; i++) {
    const G = makeGrid(lv), perms = permutations(G.n), live = perms.filter(p => G.clues.every(c => c.ok(p)));
    if (live.length !== 1 || live[0].join() !== G.sol.join()) report.problems.push(`grid L${lv}: not one answer`);
  }
  const bys = {};
  for (let lv = 0; lv <= 6; lv++) for (let i = 0; i < 2000; i++) { const r = skipSeq(lv, 6); bys[r.by] = 1; if (r.seq.some(v => v < 0 || !Number.isInteger(v))) report.problems.push(`skip L${lv}: bad ${r.seq}`); if (report.problems.length > 60) break; }
  report.jumps = Object.keys(bys).join(',');
  // 5. every map: everything the story needs is reachable on foot
  const reach = (id) => {
    const map = MAPS[id](), rows = map.rows.map(r => r.split('')), solid = (x, y) => y < 0 || y >= map.h || x < 0 || x >= map.w || SOLID.has(rows[y][x]);
    const block = new Set(map.ents.filter(e => (e.type === 'npc' || e.type === 'station' || e.type === 'sign' || e.type === 'chest' || e.type === 'pet' || (e.type === 'deco' && e.solid !== false))).map(e => e.x + ',' + e.y));
    const seen = new Set([map.spawn.x + ',' + map.spawn.y]), q = [[map.spawn.x, map.spawn.y]];
    for (let h = 0; h < q.length; h++) { const [x, y] = q[h]; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + a, ny = y + b, k = nx + ',' + ny; if (seen.has(k) || solid(nx, ny) || block.has(k)) continue; seen.add(k); q.push([nx, ny]); } }
    for (const e of map.ents) { if (e.solid === false || e.type === 'deco') continue; if (![[0, 1], [0, -1], [1, 0], [-1, 0]].some(([a, b]) => seen.has((e.x + a) + ',' + (e.y + b)))) report.problems.push(`${id}: cannot reach ${e.type} ${e.id || e.to || e.pet || ''} at ${e.x},${e.y}`); }
  };
  S = defaultState();
  for (const id of Object.keys(MAPS)) reach(id);

  // 6. play the whole story through the world
  S = defaultState(); saveState(); Game.go(new WorldScene('isle')); stepN(40);
  let guard = 0;
  while (STORY[S.step].id !== 'free' && guard++ < 400) {
    const g = currentGoal(), before = S.step, was = JSON.stringify([g.ent, S.done]);
    if (g.map && Game.scene.mapId !== g.map) { Game.go(new WorldScene(g.map)); stepN(30); }
    const sc = Game.scene, e = sc.ents.find(x => x.id === g.ent && !x.hidden);
    if (!e) { report.problems.push(`missing/hidden goal ${g.ent} at ${STORY[S.step].id}`); break; }
    // the guide must have a real walking route to the goal
    const gp = sc.goalPoint(); sc.p.x = sc.map.spawn.x * T + T / 2; sc.p.y = sc.map.spawn.y * T + T - 6; if (gp && sc.pathTo(gp).length === 0 && Game.scene.mapId === 'isle' && !['gate-'].some(p => g.ent.startsWith(p))) report.log.push(`no trail from spawn to ${g.ent}`);
    e.onBump(sc);
    for (let round = 0; round < 8; round++) {
      for (let w = 0; w < 60 && !Game.scene.overlay && JSON.stringify([currentGoal().ent, S.done]) === was && S.step === before; w++) { await new Promise(r => setTimeout(r, 120)); stepN(15); }
      if (Game.scene.overlay) { const r = await solve(guard % 5 === 0 ? 4 : 0); if (r !== true) { report.problems.push(`story ${g.ent}: ${r}`); round = 99; } }
      if (S.step !== before || JSON.stringify([currentGoal().ent, S.done]) !== was) break;
    }
    report.log.push(STORY[before].id + ':' + g.ent);
    if (S.step === before && JSON.stringify([currentGoal().ent, S.done]) === was) { report.problems.push(`stuck at ${STORY[before].id} on ${g.ent}`); break; }
  }
  report.end = STORY[S.step].id; report.clues = `${S.clues.length}/${CLUE_ORDER.length}`; report.pets = S.pets; report.coins = S.coins; report.errs = errs; report.steps = STORY.length;
  return report;
};
