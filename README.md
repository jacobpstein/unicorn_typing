# 🌈 Rainbow Quest — a typing adventure 🦄

A browser game that teaches a young child (~5 yrs) to type. It's an 8‑bit‑styled
adventure: travel an overworld map, explore and unlock themed worlds, collect coins,
race a unicorn to the flag, and beat a friendly "boss" word at the end of each world —
while the difficulty adapts and proper finger placement is taught along the way.

## Play it

**Just open `index.html` in any browser** (double‑click it). No install, no build step,
no internet required — it runs fully offline, including over `file://`.

A physical keyboard works best for real typing practice, but every key is also tappable
on screen, so it works on a touchscreen or trackpad too.

## What's inside

- **Adaptive difficulty** — the game watches accuracy and first‑try rate and adjusts on
  its own: single letters with a glowing key for beginners → words → spaces, numbers,
  capitals (Shift) and punctuation for advanced typers. Losing a race never blocks
  progress; it just eases up.
- **Teaches real typing** — keys are color‑coded by finger, the home row is outlined
  with the F/J "bump" markers, and an animated hands guide shows which finger to use.
- **An intro** that sets up the story and shows how to rest both hands on home base.
- **Overworld map** with five themed worlds (Rainbow Meadow, Unicorn Castle, Fruit
  Forest, Ballet Stage, Coney Island), each ending in a boss word.
- **8‑bit feel** — pixel scenes drawn on a canvas, chiptune (square‑wave) sound effects,
  coins, stickers, and trophies. Progress saves in `localStorage`.
- A **"For grown‑ups"** panel (⚙️) to toggle sound, the finger helper, home‑row guides,
  nudge difficulty, or reset.

## Project layout

| File | What it is |
|------|------------|
| `index.html` | Markup + screens (title, intro, map, game) |
| `styles.css` | All styling (8‑bit chrome, keyboard, hands guide, animations) |
| `game.js` | All game logic (data, adaptive engine, canvas scene, input, map, audio) |
| `CLAUDE.md` | Notes on architecture and design rules |
| `.claude/launch.json` | Local dev‑server config (`python3 -m http.server 8753`) |

No dependencies, no package manager, no build. It's intentionally a tiny static site
so it stays easy to open and easy to edit.

## Local development

Edit the three files directly and refresh the browser. To serve it locally (optional):

```sh
python3 -m http.server 8753
# then open http://localhost:8753
```

Game state lives in `localStorage` under the key `rainbowQuest.v2`. To start from a
clean slate, run `localStorage.removeItem('rainbowQuest.v2')` in the browser console and
reload (or use **Reset** in the grown‑ups panel).
