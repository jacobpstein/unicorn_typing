# Rainbow Quest — a typing adventure

A browser game that teaches a young child (≈5 yrs) to type. It's an 8‑bit‑styled
adventure: she travels an overworld map, explores/unlocks themed worlds, collects
coins, races a unicorn to the flag, and beats a friendly "boss" word at the end of
each world — all while the difficulty adapts and proper finger placement is taught.

## Three plain files, no build
- **`index.html`** (markup/screens) + **`styles.css`** (all styling) + **`game.js`**
  (all logic). Vanilla JS in one IIFE, classic `<script src>`/`<link>` — no build step,
  no dependencies, no network calls. Works by double‑clicking `index.html` over
  `file://`, fully offline. Keep it that way.
- Do **not** add frameworks, bundlers, npm, external fonts, or CDN assets, and do **not**
  switch `game.js` to an ES module (`file://` blocks module imports). If you need a
  font/sound/image, generate it in‑code (Web Audio, canvas) or inline it.
- Versioned at github.com/jacobpstein/unicorn_typing (`main`). Per the user's global
  rule, never mention AI/Claude in commits, messages, or branch names.

## Run / preview
- Simplest: open `index.html` directly in a browser.
- Local server (used for the Claude Preview MCP): `.claude/launch.json` defines a
  `typing-game` config running `python3 -m http.server 8753`. Use `preview_start`
  with that name, then `preview_screenshot` / `preview_eval` to verify.
- The game state lives in `localStorage` under key **`rainbowQuest.v2`**. To test from
  a clean slate, `localStorage.removeItem('rainbowQuest.v2')` then reload. If you change
  the saved schema, bump the key suffix (`.v3`, …).
- Preview viewport note: the headless preview sometimes reports `innerWidth` as 1px —
  set an explicit size (e.g. 1024×720) before screenshotting. Coin emoji `🪙` renders
  gray in the preview's font but is a gold coin on the user's macOS.
- **Caching gotcha:** the preview browser aggressively caches `game.js`/`styles.css`, so a
  plain reload can run stale code. Force a refresh first:
  `await fetch('game.js',{cache:'reload'}); await fetch('styles.css',{cache:'reload'});`
  then `location.reload()`. (The user opens the real file fresh, so this only bites in‑preview;
  remind them to hard‑refresh, Cmd‑Shift‑R, if they keep a tab open.)
- **Always verify in the browser before declaring done:** drive the level with
  `preview_eval` dispatching `KeyboardEvent('keydown',{key})`, screenshot, and check
  `preview_console_logs(level:'error')`. To jump to a specific level, set `skill`/`node`
  in `localStorage` and reload (nodes cycle race→dots→maze, so e.g. node 2 = a maze).

## Code map (the one IIFE in `game.js`)
- **DATA** — `LETTER_INFO` (letter → "X is for …" + emoji), `LETTER_WAVES`
  (home‑row‑first letter unlock order), `KEY_FINGER` (key → hand+finger, incl. digits &
  `, . /`), `SHIFT_MAP`, the level‑up content banks (`PHRASES`, `COUNT_EMOJI`,
  `CAP_LETTERS`/`CAP_WORDS`, `PUNCTS`, `SENTENCES`), `WORDS`, `WORLDS` (5 map regions +
  boss word & palette), `nodeMeta`/`TOTAL_NODES`, `STICKERS`.
- **STATE** — `S` (persisted: skill, buddy, name, node, coins, stickers, prefs,
  `seenIntro`, `unlocked`) + `load`/`save`; runtime: `history`, `cur`/`idx`, `race`,
  `scene`, `shiftArmed`.
- **AUDIO** — Web Audio square‑wave chiptune blips (`sndGood`, `sndCoin`, `sndClear`,
  `sndBoss`, …). Respects mute.
- **KEYBOARD + HANDS** — builds the on‑screen keyboard (number row, QWERTY, bottom row
  with `, . /`, and a Shift/Space row) which reveal progressively via `applyKeyboardReveal`:
  Space/Shift row at skill ≥11, number row ≥12, `, . /` ≥14; at skill ≤3 it adds `kb-find`
  (plain keys, no finger colors/home‑outlines/bumps — just the one glowing key). `keyTap`/
  `shiftArmed` emulate Shift for on‑screen taps; `hintInfo`/`charMatches`/`fingerFor` map a
  target char → key + whether Shift is needed (capitals & `!`/`?`). Hands guide includes
  thumbs (space).
- **ADAPTIVE ENGINE** — `stageForSkill` maps a continuous `S.skill` (1–16) to content +
  hint policy. The curve **eases up to hand placement on purpose**: skill 1–3 = "find the
  key" (finger guide OFF, one big glowing key + `⬇` via `kb-find`, dimmed others, no rival);
  `FINGER_MAGIC` (=4) turns the finger guide on (`fingerOn()`), gated separately from the
  `S.fingerHelper` pref; `RIVAL_SKILL` (=5) turns the racing rival on (`scene.rivalOn`).
  The unicorn's SPEED is the main adaptive lever — `handicap()` factors in skill **and**
  recent accuracy/first‑try. Below `STAKES_SKILL` (=7) the rival is capped so it can't cross
  the flag first (confidence builder, never loses); at ≥7 there are **real stakes** (it can
  win → gentle no‑progress‑lost "try again", `scene.stakes`). Then words → `phrase` (space) →
  `number` → `capital` (Shift) → `punct` → `sentence`. `pickTarget` (theme‑biased);
  `updateSkill` nudges gently (±0.25/±0.5); `checkUnlock`/`showPowerup` fire power‑up banners.
- **INTRO** — gentle first‑run `INTRO` (story → "find the key" → "explore the map") vs.
  full `INTRO_FULL` (adds the hands‑on‑home‑base step) used by the map's "How to play".
  `visualStory`/`visualPlay`/`visualHands`/`visualMap`. Shown once via `S.seenIntro`.
- **SCENE** — `<canvas id="scene">` (320×140 backing, upscaled `image-rendering:pixelated`)
  drawn in a rAF loop: parallax hills/clouds, checker ground, coins, goal landmark,
  the unicorn rival, the hero (the chosen buddy emoji), and the boss. Camera follows
  the hero; correct keys hop the hero forward.
- **TARGET/TYPING** — `handleChar` (the core input handler, used by both physical keydown
  and on‑screen taps), `completeTarget`, hint timing in `armHint`.
- **LEVEL FLOW** — every node has a `kind` (cycles race→dots→maze per `l%3`, plus boss):
  **race** (type targets to cross the scene vs the adaptive unicorn), **dots**
  (connect-the-dots — type to light numbered dots and reveal a `DOT_PICS` picture;
  `drawDotsScene`, no rival, keep the picture as a sticker), **maze** (type the direction
  word UP/DOWN/LEFT/RIGHT (`DIR`) to walk a `MAZES` grid to the 🎁 goal; `setupMaze`/
  `drawMazeScene`/`mazeKey`→`mazeMove`/`renderMaze` d-pad; `routeChar` sends keystrokes to
  `mazeKey` instead of `handleChar`), or **boss** (cast the world word). To add a level type:
  new `kind`, branch in `startLevel`/`drawScene`/`finishLevel`, and route input if it's not
  the standard target-typing. Map telegraphs kinds with 🎨 (dots) / 🧩 (maze).
- **OVERWORLD MAP** — `<canvas id="mapCanvas">` walkable SMB3‑style overworld (`omap`,
  `drawMap`, `layoutMap`): the hero stands on a node, `mapWalk(±1)` walks along the path
  (blocked past the `S.node` frontier), `mapEnter` plays the current node. Driven by
  ◀/▶/Enter/Space (arrow keys handled in the global `keydown`; on‑screen ◀ ▶ Play buttons
  too). `openMap`/`stopMapLoop` start/stop its rAF loop.
- **SCREENS/BUTTONS, CONFETTI, INIT** at the end.

## Extending the game (common tasks)
- **Add a new level type (`kind`).** This is the most requested kind of work. (1) give some
  nodes the new kind in the `nodeMeta` builder (currently `["race","dots","maze"][l%3]`);
  (2) in `startLevel`, add an `else if(meta.kind==="…")` branch that sets up its state on
  `scene` (and `scene.rivalOn=false` unless it's a race); (3) add a draw branch at the top
  of `drawScene` (e.g. `if(scene.kind==="…"){ drawYourScene(ts); … return; }`); (4) decide
  how input works — if it's standard "type the shown target" it can reuse `handleChar`/
  `completeTarget`; if it's custom (like the maze), write your own input fn and route to it
  in `routeChar`; (5) handle the win in `finishLevel` (wow text + sticker); (6) give it a
  map icon in `drawMap`. The **maze** is the best worked example of a fully custom kind.
- **Add words / phrases / pictures / mazes.** Just append to the `WORDS`, `PHRASES`,
  `DOT_PICS`, `MAZES`, etc. arrays in DATA — keep them on‑theme (rainbows/unicorns/fruit/
  ballet/Coney Island) and age‑appropriate. Mazes are ASCII grids (`S` start, `G` goal,
  `#` wall, `.` open) — verify a path exists and keep the solution short (~6–9 moves).
- **Add a world.** Append to `WORLDS` (name, theme, `levels`, `boss` word+emoji, sky/ground
  palette, deco, goal emoji). `nodeMeta`/`TOTAL_NODES` and the map rebuild from it.
- **Tune difficulty.** The knobs are the `FINGER_MAGIC` / `RIVAL_SKILL` / `STAKES_SKILL`
  constants, `stageForSkill` (content per skill), `updateSkill` (how fast skill moves), and
  `handicap()` (unicorn speed).

## Design direction (the "why" — honor this)
The user is building this for his ~5‑year‑old daughter and has steered it through play‑testing.
Internalize these so you don't undo hard‑won decisions:
- **Gameplay first, not homework.** She should feel like she's playing an adventure that
  happens to teach typing — hence the overworld, varied level types, coins, stickers, bosses.
  When in doubt, add fun/variety, not drill.
- **Ease *up to* hand placement, don't lead with it.** Early levels are pure "find the key"
  (no finger guide, no finger colors, no home‑row/F‑J cues — `kb-find`). Proper finger
  technique unlocks later as "FINGER MAGIC". Don't push finger placement in the first levels.
- **The unicorn's *speed* is the adaptive lever**, not just word length. And **she basically
  never loses early** (rival capped < `STAKES_SKILL`); **real stakes** kick in only once she's
  capable, and even then a loss costs no progress ("try again").
- **Keep adding level variety** when asked — past requests: connect‑the‑dots, the direction
  maze. Open ideas floated but not built: "pop the balloons", a spelling‑bee level.

## Design rules (please keep)
- **Never punishing.** No timers that fail her, no "game over", no lost progress. A lost
  race just offers "try again" and eases up. Mistakes reveal the hint, never scold.
- **Adaptive, not fixed levels.** Difficulty follows `S.skill`; the map is a separate
  *exploration/progression* layer, not the difficulty driver.
- **Teach real typing.** Keep the finger color‑coding, home‑row/F‑J bump guides, and the
  hands finger guide. Letter *shapes* on tiles/keys stay in a clear rounded font (a child
  is still learning letters) — the 8‑bit styling lives in the chrome, scene, and sounds.
- **Big, legible, high‑contrast, lots of positive feedback.** Themes she likes: rainbows,
  unicorns, fruit, ballet, Coney Island.
- Verify changes in the browser (preview screenshots + console‑error check) before
  declaring done; check a short laptop height (~620px) so the keyboard isn't cut off.

## Git
Per the user's global rule: never mention AI/Claude in commits, messages, or branch
names — write them as a human developer would.
