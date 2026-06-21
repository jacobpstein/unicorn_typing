# 🌈 Rainbow Quest — a typing adventure 🦄

A browser game that teaches a young child (~5 yrs) to type. It's an 8‑bit‑styled
adventure: walk an overworld map, explore and unlock themed worlds, collect coins, play
a variety of level types, and beat a friendly "boss" word at the end of each world — while
the difficulty quietly adapts and proper finger placement is eased in over time.

Built for one specific kid and tuned through play‑testing, so the guiding principle is
**"learning through play"** — it should feel like a game, not homework.

## Play it

**Just open `index.html` in any browser** (double‑click it). No install, no build step,
no internet required — it runs fully offline, including over `file://`.

A physical keyboard works best for real typing practice, but every key is also tappable
on screen, so it works on a touchscreen or trackpad too.

## How it plays

- **Title** — pick a hero (🦄/🩰/🍓/🐱/🌈) and (optionally) type a name.
- **Intro** — a short, animated story + "find the key" + "explore the map" walkthrough
  (replayable any time from the map's **❔ How to play**).
- **Overworld map** — walk the hero between level nodes with the **⬅️ ➡️ arrow keys** (or
  on‑screen ◀ ▶), then press **Enter/Space** to play the node you're standing on. Locked
  nodes (🔒) lie ahead; cleared ones show ⭐.

### Level types

The levels rotate through different kinds so it never feels repetitive (the map shows each
node's icon so you know what's coming):

| Icon | Type | What she does |
|------|------|---------------|
| 1,2,3 | 🏁 **Race** | Type the targets to dash across the scene and beat the unicorn to the flag. |
| 🎨 | **Connect‑the‑dots** | Type targets to light numbered dots one by one and reveal a picture (star, heart, house, fish…). She keeps the picture as a sticker. |
| 🧩 | **Maze** | Type a **direction word** — `UP` / `DOWN` / `LEFT` / `RIGHT` — to walk her character through a maze to the 🎁 goal. |
| 🌈/🦄/… | 👾 **Boss** | At the end of each world, "cast the spell" by typing the world's word (RAINBOW, UNICORN…). |

## How the difficulty works (and why it's gentle)

- **It eases *up to* hand placement.** The earliest levels are pure "find the key": plain
  keyboard, one big glowing key with an arrow, **no finger pressure**. Proper finger
  technique unlocks a little later as a **"FINGER MAGIC"** power‑up (finger color‑coding,
  the F/J home‑row guide, and an animated hands guide that shows which finger to use).
- **It adapts automatically.** It watches her accuracy and first‑try rate and moves a hidden
  skill level up/down — growing from single letters → words → spaces → numbers → capitals
  (Shift) → punctuation → mini‑sentences. The on‑screen keyboard grows with her.
- **The unicorn's speed is the main challenge dial**, and **she basically can't lose early.**
  Real stakes (the unicorn can actually beat her) only kick in once she's genuinely capable —
  and even then a loss costs **no progress**, just a friendly "try again."
- **Never punishing.** No timers that fail her, no "game over," no lost progress. Mistakes
  just reveal a hint.

There's a **"For grown‑ups"** panel (⚙️) to toggle sound, the finger helper, or the home‑row
guides, nudge the difficulty easier/harder, or reset.

## Project layout

| File | What it is |
|------|------------|
| `index.html` | Markup + screens (title, intro, map, game) |
| `styles.css` | All styling (8‑bit chrome, keyboard, hands guide, animations) |
| `game.js` | All game logic (data, adaptive engine, canvas scenes, input, map, audio) |
| `CLAUDE.md` | **Start here if you're extending the game** — architecture, code map, how to add level types/worlds/content, design rules |
| `AGENTS.md` | Short pointer for AI coding agents |
| `.claude/launch.json` | Local dev‑server config (`python3 -m http.server 8753`) |

No dependencies, no package manager, no build. It's intentionally a tiny static site so it
stays easy to open and easy to edit. **Please keep it a single self‑contained, offline,
no‑build site** (plain `<script src>`/`<link>`, no frameworks/CDNs/ES‑modules — `file://`
must keep working).

## Local development

Edit the three files directly and refresh the browser. To serve it locally (optional):

```sh
python3 -m http.server 8753
# then open http://localhost:8753
```

Game state lives in `localStorage` under the key `rainbowQuest.v2`. To start from a clean
slate, run `localStorage.removeItem('rainbowQuest.v2')` in the browser console and reload
(or use **Reset** in the grown‑ups panel). If you change the saved schema, bump the key
suffix (`.v3`, …).

**Extending it?** Read `CLAUDE.md` first — it has the full code map and step‑by‑step recipes
for adding a new level type, world, or content, plus the design intent to preserve.
