# SADELLE'S HOLIDAY HOP — Game Design Document

*Browser platformer for one first grader. HTML5 canvas + vanilla JS, no build step, procedural art, WebAudio SFX/music, speechSynthesis voice. Reuses `../js/engine.js` (Adaptive, MathGen, Words), `../js/words.js` and `../js/pictures.js`.*

---

## 1. Pitch, Hero, Story

**Pitch:** *Run, jump and glide through Brooklyn's holidays in magic costumes, spelling words with the letters you collect and powering up attacks with the numbers you add.*

**Core fantasy:** "I'm the hero who saves the holidays, and I get a new costume with a new power in every one."

**Hero:** Sadelle. Her name is the default and gets spoken ("Go, Sadelle!"). The look is a chunky round kid, about 1.5 tiles tall, with a big head and big eyes. She picks skin tone, hair (5 styles) and a favorite color on the first screen, all by clicking icons. The costume is drawn over this base, so every costume fits every look.

**Sidekick:** **Mazel**, an orange bodega cat who rides in Sadelle's hood. Mazel is the *voice of the game*: every instruction, hint and cheer comes from Mazel, so a talking face always sits next to spoken text. When Sadelle runs out of hearts, Mazel carries her back to the checkpoint.

**Villain:** **Mr. Snooze**, a grumpy, sleepy alarm clock. He finds holidays "too LOUD" and has swallowed the pages of the Great Brooklyn Calendar, so every day is the same gray Tuesday. His minions, the **Snoozies**, are drowsy creatures dressed up as each holiday. When you stomp one, it doesn't die. It pops in confetti, wakes up happy, and skips off screen. Each world's boss is a giant Snoozie. Once beaten, it wakes up, hands back its calendar page, and the holiday's colors flood back into the map. The finale is in the Birthday world: Mr. Snooze is just lonely, and you invite him to your party.

---

## 2. Core Loop at Four Timescales

| Timescale | Loop |
|---|---|
| **30 seconds** | Run, jump and stomp a Snoozie. Hear "Spell **cat**!", then bounce up a stoop to grab the **c**, which joins your trailing letter line and says "/k/". Spot a sparkly wall. Find a bagel. Hit a checkpoint. |
| **One level (3–5 min)** | Enter from the map. Spell 2 words (letters on the path). Clear 1 math gate or plank bridge. Find 3 Golden Bagels and maybe an Alef Door. Reach the end-of-level float, then get a confetti burst and a star tally. Calendar page fills in. |
| **One session (15–20 min)** | Start on the stoop (home hub). Play 3–4 levels, or 2 levels and a boss. Visit the bodega to spend tokens. Put new stickers in the book. Mazel yawns at a natural stopping point: "Great hopping! See you tomorrow?" She can still keep going; it never interrupts a level. |
| **Weeks** | A new world opens with a new costume. New powers open old secrets (go back to earlier levels). The Alef-Bet book fills up. The world that's in season glows. Word and math difficulty climbs quietly. The Birthday world is the finale (and opens early for birthday week, July 1–10). |

---

## 3. Controls and Game Feel (tuned for age 6)

**Keys.** Only 4 actions. Parent puts colored stickers on the keys.

| Key | Action |
|---|---|
| ← → | Move |
| **Space** (green sticker) or **↑** | Jump. Kids press Up to jump, so let them. |
| **X** (blue sticker) | Costume power |
| ↓ | Ground pound (Turkey costume). On the map or at a door: enter. |
| **Enter** (yellow sticker) | **Hear it again** (word, question, or hint) |
| Esc / P | Pause (big icon menu) |

Clicking the on-screen speaker icon also replays audio.

**Physics.** Fixed 60 Hz timestep. Tile = 48 px. Logical canvas 960×540, scaled to fit.

| Parameter | Value | Note |
|---|---|---|
| Max run speed | 5 tiles/s (240 px/s) | Slower than Mario. Fast enough to feel zippy. |
| Accel / decel | 0→max in 0.12 s; stop in 0.08 s | Snappy stops, no ice-skating |
| Air control | 85% of ground accel | Kids steer in the air constantly |
| Full jump height | 3.0 tiles | Apex reached in 0.38 s |
| Minimum hop (tap) | 1.0 tile | Variable height: releasing early triples gravity |
| Fall gravity | 1.6× rise gravity | Snappy landing, reads clearly |
| Terminal fall speed | 9 tiles/s | |
| Running jump distance | ~4.5 tiles | **Design rule: gaps of 3 tiles or less without a costume** |
| Coyote time | **150 ms** | Adult games use about 80 ms |
| Jump buffer | **180 ms** | |
| Corner correction | 12 px | If her head clips a ledge, nudge her past it |
| Ledge assist | Feet miss a ledge by 10 px or less → pop up onto it | |
| Stomp window | Falling, and feet above enemy center + 8 px | Bounce 2 tiles, or 3.5 if holding jump |
| Player hurtbox | 70% of sprite width, 80% of height | Generous |
| Hearts | **4** (no max-heart upgrades in the slice) | Heart pickups about every 30 s. Full refill at checkpoints. |
| Damage | 1 heart, knockback 1 tile, **1.5 s i-frames** (flashing) | Costume is **never** lost on a hit |
| Hit-stop on stomp | 60 ms | Juice |
| Checkpoints | Every ~30–40 s of play | Respawn takes 1.2 s (Mazel-carry animation) |

**No bottomless pits.** Gaps have something below them: a lower path, a leaf pile, a bouncy awning. Where a real drop exists (later worlds), a **Bubble Rescue** catches her. A soap bubble floats her back to the last safe ground and costs 1 heart. If that was her last heart, she respawns at the checkpoint with full hearts. There is no game over and no lives counter.

**Helper Balloon.** If she loses hearts 3 times between the same two checkpoints, Mazel offers a balloon icon. Taking it shows a dotted floating path over the hard part. It is offered, never forced, and it never costs stars.

**Camera.** Looks 2 tiles ahead in the direction of travel. Vertical moves are platform-snapped (Mario World style): the camera only moves up when she lands higher, so jumps don't make the screen bob.

---

## 4. Engine Choice, Verbs, Enemies

**Build ONE engine: the side-scrolling platformer.** Top-down adventure rooms come later, if ever. Reasons:
1. It delivers the Mario feel the parent asked for, with one physics system to tune until it feels great.
2. **Left-to-right scrolling matches left-to-right spelling.** Letters placed in word order along the path teach the order of letters through the order of movement.
3. Zelda-like exploration still fits: secret walls, costume-gated doors, and going back into earlier levels.
4. Secret Alef rooms are single-screen platformer rooms, so no second engine is needed.

**Base verbs:** run, jump (variable height), stomp, kick (a stomped Roller becomes a kickable shell), head-bump blocks from below, enter doors (↓). **Costume verb:** one per costume, on X (or a passive change, like glide).

**Enemy archetypes.** These are all Snoozies, re-skinned per world. They have sleepy half-closed eyes, a nightcap tuft and **slow, telegraphed** movement. They squash before they jump and blink before they throw.

| Archetype | Behavior | Teaches | Halloween / Thanksgiving skin |
|---|---|---|---|
| **Waddler** | Walks back and forth, turns at edges | Stomp basics | Candy Corn / Runaway Pie |
| **Bouncer** | Hops in arcs every 1.5 s | Timing | Jack-o'-Lantern / Cranberry Blob |
| **Drifter** | Flies in a sine wave, can be stomped from above | Air awareness | Sheet Ghost / Lost Parade Balloon |
| **Roller** | Stomp it → shell, kick it to clear a row | Cause and effect, combos | Mini Pumpkin / Acorn |
| **Prickle** | Spiky on top, can't be stomped. Needs a costume power or a kicked shell. | "Use your power" | Hedgehog in Witch Hat / Pinecone Turkey |
| **Tosser** | Stays put, lobs a slow arcing object every 2.5 s (with a shadow marker) | Dodge and approach | Bat dropping wrapped candy / Pigeon dropping corn |

---

## 5. Learning Mechanics, Moment to Moment

**Rule zero: no modal pop-ups and no timers on answers.** Prompts are spoken while she keeps moving. Answers are **places and things in the world** that she reaches by platforming. The world never freezes for a question.

**Plugging into the existing systems:** every graded item comes from `Adaptive.next(skill)` and reports through `Adaptive.record(q, correct)`. **Only the first attempt is graded.** The spaced retry queue, level-ups and "easier" events work as they do now. Extend the save state under a new key (`holidayHop.v1`) but keep the same `math`/`spell` shape so progress carries over.

**Hint ladder (same everywhere):**
1. First wrong try: a soft "boing". The wrong item says its own sound or value, then the prompt replays.
2. Second wrong try: a visual hint. The right letter glows, or ten-frame dots appear.
3. Third wrong try: Mazel points to the answer and Sadelle still completes it herself (errorless finish). The item goes into the retry queue.

### A. Letter Trail (spelling)
- **Start:** Passing a **Word Post** (a mailbox with a picture from `pictures.js` when one exists) makes Mazel say: "Spell **ship**. The ship sails on the sea. Ship!"
- **Letters** are big floating lowercase bubble letters (Andika, about 72 px, vowels red and consonants blue), placed **in word order** along the path. Every letter can be reached with a base jump or with costumes she already owns.
- **Collecting one:** it says its sound ("/sh/"), then **joins a conga line behind Sadelle** (like Yoshi's eggs) so the word builds up on screen as she runs.
- **The trail spells the word when it's done:** the letters fly into the next **Word Door**, which reads the whole word, sounds it out and blends it ("sh-i-p, ship!"). The door bursts open and drops a reward (tokens, a heart, or a costume charge).
- **The spelling tier sets how hard the choices are** (this matches the existing tier field):
  - *Tier 0:* only the right letters, in order. The work is hearing each sound and connecting it to the letter.
  - *Tier 1 (decoys at forks):* each letter spot splits into **high path vs. low path**, one right letter and one decoy. **She answers by choosing where to jump.**
  - *Tier 2 (scatter):* letters are scattered in a small open area with 2 decoys, and she must collect them in the right order. Out-of-order letters bounce off.
- **Wrong letter:** touching it does no damage. It springs her gently back and says "That's /m/. We need /i/." The lane she skipped stays reachable (the paths loop back after 3 tiles), so a wrong choice costs about 2 seconds, not a restart.
- **Skipped letter:** later letters stay sleepy and gray, and a bobbing arrow points back. Level layout keeps backtracking under 5 seconds.

### B. Power Orbs (math as attack power)
Your costume attack's strength is a **ten-frame meter** next to your hearts. **Number orbs** float around the arena as glowing bubbles, each showing a numeral and the same number of dots. Touching one adds its dots to the meter.
- **Make the target:** the boss shows **HP pips** in its own ten-frame, for example 7. Collect orbs that add up to *exactly* 7 (3+4, or 5+2). The meter then glows **READY** and Mazel cheers "Seven! Blast it!" Press X, and the costume attack knocks out all 7 pips.
- **Too low:** empty meter slots blink, so she can see how many more she needs. That's missing-addend practice built into the HUD.
- **Too high:** the extra dots spill back out as an orb ("Whoa, too much!"). This counts as wrong for grading but costs nothing.
- **Matching to adaptive math level:**
  - Levels 1–2: targets up to 5, then up to 10, with orbs 1–5.
  - Level 3 (subtraction): **Shield phase.** The boss starts with 9 pips, your hit takes off 4, and the pips pop away one by one. While the boss is dizzy (untimed), Mazel asks "How many left?" She answers by bumping one of 3 number blocks.
  - Level 5 (missing addend): you already have 5 and need 8, so there's only one right orb.
  - Levels 6–8: two ten-frames, and a **ten-stick orb** (10) appears, which teaches teen numbers as 10 + ones.
- **The parent's "how many hits" idea:** dividing boss HP by attack power is above first grade, so it's **rejected**. "Make the exact number" keeps the same fantasy (the math decides your damage) inside first-grade standards.
- **Away from bosses:** **Power Pedestals** guard optional chests. Fill the meter to the pedestal's number to open it.

### C. Plank Bridges (math with physical feedback)
A gap shows a bridge outline with **N plank slots**, some already filled. Number crates nearby are labeled and dotted (2, 3, 4). **Kick or push** the right crate into the gap and it unfolds into exactly that many planks. **A wrong crate shows its own mistake:** too short leaves a visible hole, too long sticks out and wobbles. Then it pops back. This teaches the concept, not just "wrong!" Falling through the hole lands her on a lower path that loops back, so nothing is lost.

### D. Gates and Chests (quick questions you jump at)
A door or chest shows the problem as a picture: "3 + 2" with ten-frame dots, and Mazel reads it aloud. Above it are **2–3 answer blocks** (Mario ?-blocks showing numerals). She **head-bumps** the answer. A wrong block goes "bonk", shows a dot hint, and is locked for 1 second (anti-mash). For spelling gates: "Which word is **cat**?" with picture blocks at tier 0, or letter blocks for the missing letter at tier 1+ ("c _ t").

### E. Bosses (3 phases, about 2–3 minutes)
1. **Play:** pure action. Dodge its pattern and stomp its weak spot 3 times. This teaches its moves.
2. **Power:** the boss **yawns and slows down** (a calm phase). Orbs drift in, and she makes the target to blast it (section B). Repeat once with a new target.
3. **Wake-up word:** the boss's nightcap flies off and letters spill out. She collects its wake-up word (normal Letter Trail rules) while the boss slowly rolls around. Spelling it wakes the boss up and wins the fight.

### Target ratio
About **35% of play time involves learning and 65% is pure play.** That works out to about **1 graded item every 30–40 seconds**: roughly 6–8 per level and 30–35 per 20-minute session. Every item sits **on the main path**, so it can't be skipped, but each one is answered by movement. Optional extras (pedestals, Alef rooms) add more for a kid who wants it.

---

## 6. Costumes (one per world, with Metroidvania-lite backtracking)

Rules: each costume adds **one new verb**. Costumes are kept forever. **Switching costumes:** the latest costume is worn by default. She can swap at any checkpoint flag via a wardrobe trunk (icon wheel), and the Birthday suit allows swapping anywhere. **No softlocks:** a level only ever needs its own world's costume or earlier ones, and a costume box sits right before any section that needs it.

| World | Costume | Power (X or passive) | Opens up later |
|---|---|---|---|
| Halloween | **Bat Cape** | Hold jump while falling → **glide** at 1/4 fall speed | Wide gaps, updraft shafts to high secrets |
| Thanksgiving | **Turkey Suit** | ↓ in the air → **Gobble Pound** (ground pound) | Breaks cracked crust floors and grates, pounds springs for super bounce, flips Prickles |
| Hanukkah | **Dreidel Suit** | X → **Spin** (hits all around, deflects thrown objects); spinning near a candle lights it | Lit menorah candles make hidden **light platforms** appear |
| Snow Day | **Snowsuit** | X → snowball that **freezes an enemy into an ice block** you can stand on; belly-slide on slopes | Build your own steps to reach secrets |
| Tu BiShvat | **Sprout Suit** | X → throw a seed that grows a **vine ladder** where it lands (max 2 at once) | Climb to treetop secrets anywhere there's soil |
| Valentine's | **Heart Magnet** | Hold X → **pull** letters, coins and metal crates toward you | Grab items behind fences, drag crates into place from far away |
| Purim | **Grogger Mask** | X → **disguise** for 4 s: Snoozies ignore you and "Snoozies Only" doors let you in | Sneak-through secret rooms |
| Passover | **Frog Suit** | **Swim**; hold ↓ then jump for a **super hop** (5 tiles) | Water sections, tall shafts |
| Rosh Hashanah & Sukkot | **Honeybee Suit** | Hold jump in the air → **hover** for 1.5 s; **stick** to honeycomb walls | Honeycomb walls in earlier worlds |
| Fourth of July | **Firework Suit** | **Double jump** (a rocket burst with sparkles) | Everywhere: the late-game "now I can reach it all" moment |
| Birthday | **Party Hat** | Swap to any costume anytime (X + arrows); confetti cannon | Final mastery: mix powers |

The Firework double jump is saved for late on purpose. It would make earlier levels trivial, so getting it feels like a victory lap.

---

## 7. World Map

**Overworld:** a Mario World-style node map of Brooklyn, drawn as a hand-painted-looking diorama. Use ← → ↑ ↓ to walk the dotted paths and Space to enter. Each beaten boss floods its region with the holiday's color, and the next path draws itself in with sparkles. **Home: Sadelle's Stoop** (a brownstone hub node) has the wardrobe closet, the sticker book, the Alef-Bet book and the **Bodega** shop.

**Real-date awareness (only adds things):** the world whose holiday is within ±10 days **glows "in season"**. It gets extra decorations, music flourishes and double tokens. On Oct 31 the Halloween levels get trick-or-treat doors that hand out candy-token bonuses. **The date never locks content.** The exception that only gives: **Birthday Week (July 1–10)** opens a one-off Birthday level early as a gift, whatever her progress. The full Birthday world stays the finale.

| # | World | Costume | Brooklyn flavor | Learning twist |
|---|---|---|---|---|
| 1 ★ | **Halloween: Spooky Stoop Street** | Bat Cape | Park Slope brownstone stoops, Prospect Park pumpkin patch | Base Letter Trail, gates |
| 2 ★ | **Thanksgiving: Parade & Pie** | Turkey Suit | Grand Army Plaza farmers market, giant parade balloons, Grandma's kitchen | Plank Bridges (pound crates into gaps) |
| 3 | **Hanukkah: Latke Lights** | Dreidel | Grand Army Plaza giant menorah, a deli | Light-platforms only show while lit: count the candles (1–8) to open doors |
| 4 | **Snow Day & New Year's** | Snowsuit | Sledding hill in Prospect Park, snowy Brooklyn Bridge | Freeze enemies to build stairs to letters |
| 5 | **Tu BiShvat: Botanic Garden** (Groundhog Day bonus level) | Sprout | Brooklyn Botanic Garden greenhouses | Grow vines to the letters you choose (decoys go higher) |
| 6 | **Valentine's: DUMBO Hearts** | Heart Magnet | DUMBO cobblestones, the Manhattan Bridge view | Magnet-pull letters in the right order (scatter tier) |
| 7 | **Purim: Carnival Parade** | Grogger Mask | Purim street carnival, hamantaschen bakery | Masked Snoozies guard doors with spelling riddles |
| 8 | **Passover: Seder River** (Earth Day bonus level) | Frog Suit | Gowanus Canal, East River boat ride | Underwater ten-frame bubbles; "make 10" crossings |
| 9 | **Rosh Hashanah & Sukkot: Harvest Rooftops** | Honeybee | Rooftop gardens, water towers, a sukkah on the roof | Apples and honey: plank bridges within 20 |
| 10 | **Fourth of July: Coney Island** | Firework | Boardwalk, Cyclone coaster level, Wonder Wheel, Nathan's | Teen-number orbs; coaster-cart levels |
| 11 | **Birthday Bash (July 6)** | Party Hat | Sadelle's stoop block party, all of Brooklyn invited | Remix of every mechanic; Mr. Snooze finale |

★ = **vertical slice** (Halloween is a week away, Thanksgiving is next month). Each world has 3 levels and a boss, plus 1 bonus level in worlds 5 and 8. Hanukkah is built next, timed for December.

---

## 8. Gamification and Meta (no dark patterns)

- **Stars (3 per level):** ★ Finish. ★ Find 3 Golden Bagels (exploration). ★ Secret exit or Alef Door. **Stars are never tied to answering correctly,** because that would teach guessing and anxiety. Learning gets its praise in the moment instead.
- **Currency: Subway Tokens.** They come from stomps, Word Doors and chests. Spend them at the Bodega (run by Mazel's Aunt Pickles) on hats, hair colors, sparkle trails, stoop decorations, and paint colors for Mazel. **Everything is cosmetic.** Nothing helps you win, and there's no real money.
- **Costume Wardrobe:** a closet on the stoop. Earned costumes come in alternate colors for 50 tokens.
- **Sticker Book:** one page per world. Every Snoozie type she befriends, every boss, and **every word she has spelled** (with its picture) becomes a sticker. Tapping a word sticker reads it aloud. Over time this becomes her personal word wall.
- **Alef-Bet Book (Hebrew bonus):** each level has one hidden **Alef Door**: a glowing blue door behind a fake wall, a cracked floor, or a costume gate. Inside is a single-screen room. Mazel says "This is **bet**. Bet says /b/." Then she platforms to the matching letter among 2–3 floating Hebrew letters: shape matching at first, sound-to-letter later. **Reward:** a blue gem plus a letter sticker. Letters come in alef-bet order across levels, and 22 letters fit in about 33 levels. Gems open Hebrew cosmetics (a star-sparkle trail, a shofar horn honk for the jump sound). Every few letters, a **word room** opens: שלום, אבא, אמא. Use a `he-IL` voice when one is available (macOS has Carmit); otherwise use an English phonetic-spelling table ("shah-LOHM"). Hebrew rooms are **never required** and can be turned off in the parent settings.
- **Gentle streaks:** a wall calendar on the stoop gets a sticker for each day she plays. A missed day simply has no sticker. There's no broken streak, no shaming, and no "you lost it". After a break, Mazel says "I missed you!" and gives a small gift. Return gifts are never tied to daily logins.
- **Session wind-down:** after the parent-set time (default 20 min), Mazel suggests stopping **when the current level ends.** There's no countdown and nothing is withheld.
- **Parent dashboard:** a hidden gate (hold Shift+P for 3 s, then answer an adult question like 7×8). It shows:
  - accuracy by spelling level and tier, and by math level, using the existing `S.stats`
  - most-missed words and facts, and what's in the retry queue
  - Hebrew letters found
  - time played per day
  - spots where she lost hearts often (a frustration heatmap per level)
  - manual overrides: level, tier, Hebrew on/off, Helper Balloon frequency, session length

---

## 9. Accessibility for a Non-Reader

- **Audio-first:** every prompt is spoken. Every icon speaks its name on hover or highlight ("Wardrobe!"). **Enter or the speaker icon replays the last line.** Prompts during action are 6 words or fewer. Speech rate is 0.9. Music drops to 30% while speech plays.
- **Letters:** Andika (already loaded in `index.html`; single-story a and g), lowercase, at least 64 px in the world and 96 px in Word Doors. Vowels are red and consonants blue, and every letter has a dark outline so it reads on any background.
- **No time pressure on learning.** Orbs, gates and letters wait forever. Bosses go calm during thinking phases.
- **Pause anytime** (Esc/P). The menu is 4 big icons: resume, hear again, map, home.
- **No reading required anywhere:** menus use icons only, numbers always come with dots, and words always come with a picture or with speech.
- **Readability:** color is never the only signal (decoys also have a different outline shape). No flashing faster than 3 Hz. Screen shake is at most 4 px and can be turned off.

---

## 10. Vertical Slice Scope (build exactly this)

**In scope:** the platformer engine with the full feel spec; the overworld (Stoop hub plus 2 worlds, 8 nodes); 6 levels plus 2 bosses; 2 costumes (Bat Cape, Turkey Suit); 6 enemy archetypes in 2 skins; Letter Trail at all 3 tiers; Power Orbs; Plank Bridges; Gates; 3 Alef Doors (alef, bet, gimel); stars, tokens, the Bodega with 8 cosmetics, the sticker book; the parent dashboard; save/load.

**Out of scope for the slice:** worlds 3–11, top-down rooms, the date-based Birthday level, the Hebrew word rooms.

**Build order:**
1. A gray-box test room until the run/jump/stomp feel is right (play-test with Sadelle before any art).
2. Letter Trail.
3. Level 1-1 fully finished.
4. Everything else.

**Level outlines** (structure for each: introduce safely → develop → twist → celebrate):

**1-1 Trick-or-Treat Street**
- *Introduce:* a flat sidewalk. One Waddler stands under a porch light with no hazard nearby, so her first stomp is safe. Then the first Word Post: a tier-0 word with letters sitting right on the path.
- *Develop:* brownstone stoops work as staircases. Bouncers hop between stoops. Word 2's letters sit on top of the stoops.
- *Twist:* a porch door Gate ("2 + 1") with answer blocks above it. Behind a cracked brick wall (stomp it) is an **Alef Door** that needs no costume. A cracked sidewalk grate she can't break yet is foreshadowing.
- *Celebrate:* the candy-bag float at the end, confetti, a token shower.

**1-2 Prospect Park Pumpkin Patch**
- *Introduce:* a costume box at the start gives the **Bat Cape**. The first gap has a leaf pile underneath, so trying to glide can't hurt.
- *Develop:* leaf-blower updrafts plus gliding carry her over pumpkin rows. Drifters (ghost sheets) appear. A word at a decoy fork (high path vs. low path), so the glide decides which letter she gets.
- *Twist:* the first **Plank Bridge**, over the duck pond.
- *Celebrate:* a hayride float.

**1-3 The Haunted Brownstone**
- *Introduce:* an indoor climb up through 4 floors. Flickering lights show where platforms are.
- *Develop:* Rollers come down the stairs. Kick a shell to clear a Prickle.
- *Twist:* a tier-2 scatter word in the attic (letters drifting around like dust). A Power Pedestal guards the bagel chest, which previews the boss mechanic.
- *Celebrate:* the roof bursts open to show the moon.

**Boss: The Great Gourd** (a giant sleepy jack-o'-lantern)
- *Play:* stomp its vine-hands as they slam down.
- *Power:* make its 6 HP pips, then make 8.
- *Wake-up word:* letters pour out of its lid.
- Reward: the calendar page, and Halloween colors flood the map.

**2-1 Grand Army Plaza Market**
- *Introduce:* the **Turkey Suit**. Pound through stacked pie-crust crates.
- *Develop:* Prickle pinecones (pound flips them). Plank Bridges where she **pounds** crates into the gaps.
- *Twist:* pound a spring for a super bounce up to a high word.
- *Celebrate:* a cornucopia float.

**2-2 Parade Balloon Skyway**
- *Introduce:* bouncy balloon platforms high above the parade route. Falling is safe: she lands on the street, which is a longer but complete path.
- *Develop:* **combine Glide and Pound** (glide over, pound down onto a target).
- *Twist:* a balloon handler Gate with a subtraction problem ("6 balloons, 2 float away").
- *Celebrate:* she rides the lead balloon.

**2-3 Grandma's Kitchen**
- *Introduce:* moving rolling-pin platforms, jiggly cranberry blocks.
- *Develop:* oven Tossers.
- *Twist:* a kitchen-themed word set. The **backtrack reveal**: Mazel mentions "that cracked grate on Trick-or-Treat Street…", which sends her back to 1-1 to pound into the **Gimel room**.
- *Celebrate:* a family table and a "pie" fireworks show.

**Boss: Gobbler the Grand Float** (a turkey parade balloon held down by ropes)
- *Play:* pound its 3 tethers while dodging falling feathers.
- *Power:* make 7, then make 10.
- *Wake-up word.*
- Reward: Thanksgiving colors, and the Hanukkah path glows "coming soon".

**Done means:** Sadelle plays 3 sessions on her own, asks to play again, loses hearts fewer than about 4 times per level, and the dashboard shows 30+ graded items per session.

### Art direction (procedural, charming)
- **Shapes:** everything is chunky rounded shapes with a **4 px deep-plum outline** (#2B1D3A, never pure black) and 2-tone flat shading (base plus a lighter top highlight).
- **Animation:** squash and stretch on jump, land and stomp (scale 1.25/0.8). An idle bob and a blink every 3–5 s on *every* character, including Snoozies.
- **Backgrounds:** 3 parallax layers (skyline silhouettes with water towers, brownstones and bridge cables; mid-ground props; foreground).
- **Palette per world:** Halloween is purple, orange and lime. Thanksgiving is amber, cranberry and cream.
- **Particles:** dust puffs, confetti, sparkles, leaves. Letters and orbs get a soft radial-gradient glow plus a sparkle.
- **Music:** each world gets a short 8-bar WebAudio square/triangle loop with a melody that matches the holiday mood.
- **SFX:** synthesized, with a sound for each action: jump "boop" with rising pitch, stomp "pomf", letter collect plays a rising arpeggio note by position in the word (so a finished word plays a little tune), and wrong answers get a soft "boing" (never a buzzer).

---

## 11. Top 5 Risks to Fun

1. **Platforming frustration.** *Mitigation:* the numbers in section 3, no pits, Helper Balloon, checkpoints every 30–40 s, the frustration heatmap in the dashboard, and a gray-box play-test with Sadelle before art. If she struggles, widen coyote time and buffering before making levels flatter.
2. **Learning feels like an interruption, or like busywork.** *Mitigation:* answers are given by movement (forks, crates, orbs, blocks), prompts are 6 words or fewer, the world never freezes, and the 35/65 ratio holds. Test it by asking her what the game is about. The right answer is "jumping and costumes", not "spelling".
3. **Speech synthesis quality.** TTS says "c" as "see" and not /k/, it lags, Chrome's `cancel()` is buggy, and a Hebrew voice may be missing. *Mitigation:*
   - a hand-tuned **phoneme table** with spellings that make TTS say the sound ("kuh", "sh", "ah")
   - always pair a sound with an example word
   - a speech queue wrapper that cancels before speaking
   - pre-pick the voice at the stoop
   - a phonetic English fallback for Hebrew
   - a parent "voice check" screen
4. **Guessing and button-mashing at gates.** *Mitigation:* only first attempts are graded, a wrong block locks for 1 s, the hint ladder ends with her finishing the answer herself, and wrong letters bounce her (a small cost, no punishment). The dashboard flags fast wrong answers.
5. **Too much scope, or procedural art that looks cheap.** *Mitigation:* build exactly the 2-world slice, one engine, and one shared character rig (body, head, eyes, costume overlay). Write the art rules down (outline, 2 tones, squash, blink) and apply them everywhere. Polish 1-1 to "finished" before building 1-2. A small game that feels excellent beats a big game that's flat.
