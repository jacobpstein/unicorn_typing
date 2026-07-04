# Starlight Ballet — a spelling & math recital

A companion game to Rainbow Quest for a six-year-old who loves ballet. It tells
the story of **Ruby**, a little dancer practicing her way to the Starlight Gala —
because big dreams take practice. **Spelling words makes her dance** and **math
makes the crowd throw roses**. SNES-inspired, borrowing from the greats: a
Mario-style journey across each stage to a goal star, Zelda-style "item get!"
costume unlocks, and a Pokemon-style badge case (one recital badge per act).
Never punishing, no timers, difficulty adapts — mistakes just reveal hints.

## Run it
Open `index.html` in a browser. No build, no dependencies, works offline over `file://`.

## How it plays
- **Story**: an intro tells Ruby's dream (replayable via 📖); each act opens with
  a story card about how her practice is paying off.
- **Recital Program** (map): 5 acts — Enchanted Garden, Moonlight Waltz, Candy
  Kingdom, Swan Lake, Starlight Gala. Each act = Spell → Count → Spell → Count →
  **Rhyme Time** → **Grand Finale** (perform the routine, unlock a costume + badge).
- **Rhyme Time** (bonus): "What rhymes with CAT?" — three big word+emoji cards,
  tap or press 1/2/3. Wrong picks just dim; it feeds the spelling skill track.
- **Dance Studio** (free play, from the program): no goals — press T/L/P/A/B for
  moves, S for sparkles, R for roses, arrow keys to move Ruby around the stage.
- **Spell the Steps**: an emoji + spoken word (built-in speech synthesis). The word
  is never shown to copy — it *peeks* for ~2.5s then hides (higher skill: picture +
  voice only, 3-letter → 8-letter words). Each letter = a dance step. **No automatic
  hints**: misses just wiggle (and ease the adaptive skill); her self-serve helpers
  are 🔊 Hear it and 👀 Peek (max two peeks per word, each counts against
  first-try like a miss). Every
  word moves Ruby across the stage toward the goal star while the audience cheers.
- **Count the Beats**: addition → subtraction → mixed → missing-number → numerals-
  only mental math, answered on a number pad. Emoji groups are there to count *on*.
  **No answer hints** — a miss on a numerals-only problem just reveals the plain
  emoji objects so the counting stays hers; misses ease the skill instead.
- **Grand Finale**: a shuffled dance routine that grows one move per act
  (Act 1 = 4 moves … the Gala = 8), always ending with a bow — cheers and
  sparkles escalate move by move, and applause (filtered noise) caps every scene.
- **Costume Closet**: each act's finale unlocks a visually distinct costume
  (palettes, striped tutus, tiaras, swan wings, gold sparkles) that recolors
  Ruby's sprite. Roses are a real currency too: bonus costumes (Rainbow Magic,
  Unicorn Dream) unlock at rose milestones, and locked closet slots telegraph
  their goal (act icon or 🌹 count).
- **Endings that land**: every scene closes with Ruby running to the goal star,
  grabbing it in a sparkle burst and bowing before the star card appears; the
  final Gala finale plays a special "Prima Ballerina" storybook ending.

## Guts
Three plain files (`index.html` / `styles.css` / `game.js`, one IIFE). Progress
saves to localStorage key `starlightBallet.v2`. Two independent adaptive skill
tracks (`S.spell`, `S.math`, 1–8), **streak-based**: three first-try answers in a
row nudge the level up (+0.34); any miss immediately eases it back (−0.3). The
ballerina is a hand-drawn pixel sprite (`POSES` grids; costume accessories/patterns
in `COSTUMES`) with poses: stand, fifth, plié, arabesque, leap, bow.
