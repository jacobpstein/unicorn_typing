# Agent guide

You're working on **Rainbow Quest**, an offline, single‑site browser typing game for a
~5‑year‑old. The full guide lives in **[`CLAUDE.md`](CLAUDE.md)** — read it before editing.
This file is just the orientation + the non‑negotiables.

## The 60‑second orientation
- Three plain files, no build: `index.html` (markup) + `styles.css` (styles) + `game.js`
  (all logic, one IIFE). Open `index.html` directly to run it.
- It's an 8‑bit overworld adventure: walk a map (arrow keys) → play levels of varied
  **kinds** (race / connect‑the‑dots / maze / boss) → adaptive difficulty teaches typing.
- `CLAUDE.md` has the code map, recipes for adding level types/worlds/content, and the
  design intent ("learning through play", ease up to hand placement, never punishing).

## Non‑negotiables (do not break these)
1. **Keep it a single self‑contained, offline, no‑build site.** No frameworks, bundlers,
   npm, CDNs, external fonts, or network calls. Do **not** convert `game.js` to an ES
   module — `file://` must keep working (the parent opens the file by double‑clicking).
   Generate any font/sound/image in code (Web Audio, canvas) or inline it.
2. **Never punishing.** No timers that fail her, no "game over", no lost progress. Mistakes
   reveal a hint; a lost race just says "try again" and eases up.
3. **Verify in the browser before saying it's done.** Drive it via the preview, screenshot,
   and check for console errors. Note the preview caches `game.js` — force‑refresh with
   `fetch('game.js',{cache:'reload'})` then reload (see `CLAUDE.md`).
4. **Git:** never mention AI/Claude/assistants in commits, messages, PRs, or branch names —
   write them as a human developer would.

## Where things live
- Data (words, worlds, pictures, mazes, stickers) and the adaptive engine: top of `game.js`.
- Level kinds: search `scene.kind` and `nodeMeta` in `game.js`; the **maze** is the best
  example of a fully custom level type.
- Persisted state: `localStorage` key `rainbowQuest.v2`.

Repo: github.com/jacobpstein/unicorn_typing (`main`).
