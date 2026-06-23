# 🌈 Rainbow Quest — a typing adventure 🦄

A browser game that teaches a young child (~5 yrs) to type. It's an 8‑bit, Mario‑style
**typing platformer**: walk an overworld map and play side‑scrolling levels where you type
to run, jump and zap a unicorn through obstacles to the flag — with maze and connect‑the‑dots
levels as side quests, and a friendly "boss" word ending each world. The difficulty quietly
adapts and proper finger placement is eased in over time.

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

The main path is the platformer; side quests are sprinkled in so it never feels repetitive
(the map shows each node's icon so you know what's coming):

| Icon | Type | What she does |
|------|------|---------------|
| 1,2,3 | 🦄 **Platformer** (main) | A side‑scrolling level. Type a letter (or, once she can spell, an **action word** like `JUMP`, `ZAP`, `HOP`) to make the unicorn leap gaps, bop baddies, bump ? blocks, grab coins, and reach the flagpole. |
| 🎨 | **Connect‑the‑dots** (side quest) | Type targets to light numbered dots one by one and reveal a picture (star, heart, house, fish…). She keeps the picture as a sticker. |
| 🧩 | **Maze** (side quest) | Type a **direction word** — `UP` / `DOWN` / `LEFT` / `RIGHT` — to walk her character through a maze to the 🎁 goal. |
| 🌈/🦄/… | 👾 **Boss** | At the end of each world, "cast the spell" by typing the world's word (RAINBOW, UNICORN…). |

## How the difficulty works (and why it's gentle)

- **It eases *up to* hand placement.** The earliest levels are pure "find the key": plain
  keyboard, one big glowing key with an arrow, **no finger pressure**. Proper finger
  technique unlocks a little later as a **"FINGER MAGIC"** power‑up (finger color‑coding,
  the F/J home‑row guide, and an animated hands guide that shows which finger to use).
- **It adapts automatically.** It watches her accuracy and first‑try rate and moves a hidden
  skill level up/down — growing from single letters → words → spaces → numbers → capitals
  (Shift) → punctuation → mini‑sentences. The on‑screen keyboard grows with her.
- **Never punishing.** No timers that fail her, no "game over," no lost progress, no losing a
  level. Mistakes just reveal a hint. The challenge is the typing and the obstacles — not a
  clock or a rival.

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
