# Rainbow Quest — a typing adventure

A browser game that teaches a young child (≈5 yrs) to type. It's an 8‑bit‑styled
adventure: she travels an overworld map, explores/unlocks themed worlds, collects
coins, races a unicorn to the flag, and beats a friendly "boss" word at the end of
each world — all while the difficulty adapts and proper finger placement is taught.

## The whole app is one file
- **`index.html`** is the entire game: HTML + CSS + vanilla JS, no build step, no
  dependencies, no network calls. It must stay this way so a non‑technical parent can
  just double‑click it (works over `file://`, fully offline).
- Do **not** add frameworks, bundlers, npm, external fonts, or CDN assets. If you need
  a font/sound/image, generate it in‑code (Web Audio, canvas) or inline it.

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

## Code map (inside the one `<script>` IIFE in `index.html`)
- **DATA** — `LETTER_INFO` (letter → "X is for …" + emoji), `LETTER_WAVES`
  (home‑row‑first letter unlock order), `KEY_FINGER` (key → hand+finger), `WORDS`
  (word, emoji, theme), `WORLDS` (the 5 map regions + their boss word & palette),
  `nodeMeta`/`TOTAL_NODES` (flattened map nodes), `STICKERS`.
- **STATE** — `S` (persisted: skill, buddy, name, node, coins, stickers, prefs) +
  `load`/`save`; runtime: `history`, `cur`/`idx`, `race`, `scene`.
- **AUDIO** — Web Audio square‑wave chiptune blips (`sndGood`, `sndCoin`, `sndClear`,
  `sndBoss`, …). Respects mute.
- **KEYBOARD + HANDS** — builds the on‑screen keyboard (finger color classes, home‑row
  outline, F/J bump markers) and the animated hands finger guide.
- **ADAPTIVE ENGINE** — `stageForSkill` maps a continuous `S.skill` (1–12) to content +
  hint policy; `pickTarget` (theme‑biased to the current world); `updateSkill` nudges
  skill from rolling accuracy + first‑try rate; `handicap()` sets the unicorn's speed.
- **SCENE** — `<canvas id="scene">` (320×140 backing, upscaled `image-rendering:pixelated`)
  drawn in a rAF loop: parallax hills/clouds, checker ground, coins, goal landmark,
  the unicorn rival, the hero (the chosen buddy emoji), and the boss. Camera follows
  the hero; correct keys hop the hero forward.
- **TARGET/TYPING** — `handleChar` (the core input handler, used by both physical keydown
  and on‑screen taps), `completeTarget`, hint timing in `armHint`.
- **LEVEL FLOW** — `startLevel(node)`, `finishLevel(win)` (win → sticker + advance map
  node; lose → gentle "try again", eases next race). **MAP** — `renderMap`, world banner.
- **SCREENS/BUTTONS, CONFETTI, INIT** at the end.

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
