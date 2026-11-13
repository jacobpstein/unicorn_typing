# SADELLE AND THE SECRET TUNNEL — Game Design Document

*A top-down walk-and-talk mystery for one first grader. Vanilla JS + HTML5 canvas, no build step, all art drawn in code, WebAudio SFX/music, speechSynthesis voice. May reuse `../js/engine.js` (Adaptive), `../js/words.js`, `../js/pictures.js` where they fit. Save key: `secretTunnel.v1`.*

---

## 1. Pitch and Story

**Pitch:** *The Great Bead Chain is missing from your school! Follow the sparkly clues through a secret tunnel to the museum, the ice rink, the train station, the aquarium and Coney Island. Spell, count, and make jewelry to solve the case.*

**Core fantasy:** "I'm a detective, and I make the jewelry that solves the mystery."

**Design pillars:** (1) walking is the only skill the controls need; (2) she always knows where to go next; (3) every learning moment is a job someone in the world needs done; (4) nothing is ever lost.

### The mystery (5 acts)
1. **The case opens.** It's the morning of the school's **100th Day Party**. In the lobby hangs the **Great Bead Chain**: every kid who ever went to the school added one bead. This morning the hook is empty. On the floor: 3 shiny beads, a gray feather and tiny 3-toed footprints. Principal Feldman is worried. Sadelle gets a **Detective Notebook** and Mazel says: "A mystery! Let's look for clues."
2. **School clues.** Classmates and staff each give a clue. In the library a loose book (*Secret Places of New York*) opens a hidden door behind the bookcase: **the Secret Tunnel**, an old mail tunnel from 1904 with a little rail trolley.
3. **The city trail.** At each destination a friend found a few beads from the chain and a new clue ("I heard cooing!", "Something flew off with a shiny wrapper!"). Each place adds a section of the chain back (shown filling up in the notebook).
4. **Suspect board.** The notebook has a page with 4 suspect cards: **Mr. Gus** (custodian, has the tunnel keys), **Ruby** (loves beads), **Mazel** (cats knock things down!), **???** (a silhouette with wings). Each clue clears one suspect with a happy stamp ("Mr. Gus was fixing the boiler. Not him!"). It's never scary or mean; clearing a friend is a happy moment.
5. **The reveal (Coney Island).** At the top of the Big Wheel is a nest woven from the Bead Chain. The culprit is **Coo**, a city pigeon who loves shiny things. She was building a sparkly nest for her 2 eggs. Nobody is in trouble: Sadelle makes Coo a **Nest Necklace** of her own (a jewelry puzzle), Coo trades back the chain, and the eggs hatch. Back at school, the 100th Day Party: the chain is rehung with **Sadelle's own new bead** added, plus a little feather. Credits roll as NPCs dance in the gym wearing the jewelry she gave them. Coo and the chicks visit the school roof afterward (post-game hangout).

### Cast
| Name | Who | One-liner |
|---|---|---|
| **Sadelle** | The hero | Picks hair, skin and favorite color on frame one (defaults set, so no setup is needed). |
| **Mazel** | Orange bodega cat, sidekick | Walks beside her, speaks every hint, says "Mrrp! Over here!" when she's stuck. Returning friend from Holiday Hop. |
| **Ms. Okafor** | 1st-grade teacher | Calm and encouraging; gives the notebook and the first goal. |
| **Principal Feldman** | Principal | Big glasses, bigger worries; jokes in dad puns. |
| **Mr. Gus** | Custodian | Knows every door; hums old songs; suspect #1 (innocent). |
| **Ruby** | Classmate, best friend | Bead-crazy; runs the Sparkle Studio with Sadelle; suspect #2 (innocent). |
| **Theo** | Classmate | Train nerd; shows up at the train station "on a field trip". |
| **Dr. Stone** | Museum guide | Loves dinosaurs; talks in a whisper and then gets excited. |
| **Coach Lena** | Ice rink coach | Bouncy, says "Glide and smile!" |
| **Mr. Shapiro** | Bagel baker | Counts everything in dozens and tens; gives free samples. |
| **Captain Marisol** | Aquarium keeper | Knows every fish's name; sings to the sea lions. |
| **Coo** | Pigeon (the culprit) | Shy, sweet, obsessed with sparkle; speaks in coos that Mazel "translates". |

---

## 2. World Map and Progression

The world is a set of **top-down rooms** (each about 1.5–2 screens, 48 px tiles, logical canvas 960×540 scaled to fit). Doors connect rooms; walking into a door edge changes rooms with a quick fade. A **map** (M key or map icon) shows rooms as big picture buttons; visited rooms can be **fast-travelled** by clicking.

**Order (the guide arrow always points to the next step):**
School (Lobby → Classroom → Cafeteria → Gym → Art Room → Principal → Library) → Tunnel → Museum → Ice Rink → Bagel Shop → Train Station → Aquarium → Coney Island → back to the School Gym for the party.

Destinations unlock one at a time (the next tunnel door lights up and opens). Every unlocked place stays open forever, so she can wander back to shop, find pets, take jewelry orders or replay challenges.

### The School (Act 1–2, about 1 session)
| Room | What's there | NPCs | Challenge | Clue / item |
|---|---|---|---|---|
| **Lobby** (start) | Empty chain hook, trophy case, 3 beads on floor | Principal Feldman | Tutorial: walk to 3 glowing beads (pick-up by walking over) | Clue: **gray feather**. Notebook opens. |
| **Classroom 1-B** | Desks, cubbies, class hamster, word wall | Ms. Okafor | **Sound Sorter** (cubby labels) | Clue: **footprint drawing** (3 toes, "not a cat!") clears **Mazel** |
| **Cafeteria** | Lunch line, trays, milk crates | Mr. Gus | **Bagel Bundles** intro with lunch trays (tens and ones) | Clue: Gus's boiler work log, clears **Mr. Gus** |
| **Gym** | Hoops, bleachers, party decorations | Theo | **Countdown Launch** (rocket-shaped party balloon pump: 20 → 0) | Item: **flashlight** (lights the tunnel later) |
| **Art Room** | Sparkle Studio bead table, paint, kiln | Ruby | **Jewelry Studio** tutorial: AB pattern bracelet | Ruby shows her bead box (no chain beads) → clears **Ruby**. Unlocks the Studio. |
| **Principal's Office** | Old photos, school map from 1904 | Principal Feldman | **Read & Find** (read 3 short notes on the bulletin board, walk to the matching object) | Clue: old map shows a tunnel under the library |
| **Library** | Shelves, reading rug, globe, big bookcase | Mrs. Bloom (librarian, minor NPC) | **Label Fixer** on 3 shelf signs, then walk into the glowing book | Bookcase swings open → **Secret Tunnel** |

### The Secret Tunnel (hub)
A curved brick tunnel with warm lanterns, a little mail trolley track and **6 round doors**, each with a picture sign and the place's name spoken when she walks near ("Museum!"). Locked doors show a padlock picture and a soft "not yet" chime. Mazel's lantern lights the path. A wall **Clue Map** shows a line drawn from place to place as she progresses. The tunnel also holds the **Lost & Found** (pets she's found wait here and in her "pet room" corner).

### Destinations (Act 3–5)
Each destination: 1 guide NPC, 2 challenges (one reading, one math), 1 hidden pet, 1 jewelry order, a chain section and a clue.

| # | Place | What's there | NPC | Challenges | Clue / reward |
|---|---|---|---|---|---|
| 1 | **Museum of Big Things** | Dinosaur skeleton, gem hall, mummy-free Egypt room with a sphinx cat statue | Dr. Stone | **Label Fixer** (fix the scrambled exhibit labels: *fossil, crab, shell*); **Gem Counting** = Ticket Counter variant (count gems by 2s/5s/10s) | Chain section 1. Clue: a security-camera drawing of "a gray blur with wings" (silhouette card gets wings) |
| 2 | **Ice Rink** | Oval rink, skate rental, hot cocoa stand | Coach Lena | **Ice Writing** (TYPING: she types, a skater carves the word on the ice); **Countdown Launch** (Zamboni countdown 30 → 0 by 10s and from 59 by 10s) | Chain section 2. Clue: "It flew toward the bagels!" Item: skates (cosmetic, slide-walk animation) |
| 3 | **Shapiro's Bagels** (bagel shop + bodega) | Ovens, bagel bins, sesame/poppy/everything, a cat bed for Mazel | Mr. Shapiro | **Bagel Bundles** (bags of 10 + singles); **Coin Shop** (pay for bagels) | Chain section 3. Clue: a crumb trail out the door and "Coo… coo…" sound in a recording. Shop: outfits. |
| 4 | **Grand Station** (train station) | Starry ceiling, big clock, departure board, ticket windows | Conductor Joy + Theo | **Departure Board** (TYPING destinations); **Ticket Counter** (count tickets by 10s from 9) | Chain section 4. Clue: "The bird took the Coney Island train!" |
| 5 | **Brooklyn Aquarium** | Big glass tank, sea lion pool, jellyfish room with soft colors | Captain Marisol | **Read & Find** (read the tank signs, find the fish); **Fish Facts** (feed the fish the right sum) | Chain section 5. Clue: a seagull says Coo nests "up high, by the giant wheel". |
| 6 | **Coney Island** (finale) | Boardwalk, Big Wheel, carousel, wooden coaster (scenery only; rides are gentle cutscenes), ticket booth | Coo, plus everyone shows up | **Ticket Counter** finale (count down tickets by 10s: 95, 85, …), **Syllable Snap** at the carousel, then the **Nest Necklace** jewelry puzzle | The reveal, the full chain, the party |

**Free wandering:** all rooms are walkable; the arrow just shows the way. Optional side content everywhere: pets, jewelry orders, NPC chats, coins in sparkly spots, stickers.

---

## 3. Challenge Catalog

### Shared rules for every challenge
- **Start:** walking into a challenge object (a sparkle ring on the floor) or pressing Space near an NPC opens a **puzzle panel** over the world (the world dims, not hidden). Esc or the X button leaves at any time with no penalty.
- **Each challenge is 3–5 items** (about 2 minutes). Finishing gives coins, a sticker, and the story step.
- **Adaptive levels per skill** (`spell`, `read`, `count10`, `countdown`, `placeValue`, `facts`, `coins`, `pattern`): 3 first-try correct in a row → up a level; 2 misses on items in a row → down a level (quietly, never announced as "easier"). Only the **first attempt** is graded; missed items go to a retry queue that resurfaces 2–4 items later.
- **Hint ladder (everywhere):** miss 1 → soft "boop", the wrong piece speaks itself ("that says /m/"), the prompt replays. Miss 2 → visual hint (right tile glows, or dots/number line appears). Miss 3 → Mazel points and she does the final click/key herself (errorless finish). No red X, no buzzer, no lost coins.
- **Hear again:** a big speaker button on every panel, plus the **H key** (Enter is reserved for "confirm"). Every word is spoken when tapped.
- **Input:** every panel works with mouse clicks OR arrow keys + Space/Enter. Typing challenges also accept on-screen letter buttons (click).

### Forgiving typing rules (Departure Board, Ice Writing, Name Beads, Locker Code)
- An **on-screen keyboard** (QWERTY, big keys) mirrors the real keyboard. The **next correct key glows yellow**, softly, after 2 seconds of no input (immediately at the lowest level).
- Only the correct next letter is accepted. A wrong key: the key flashes gray, its letter sound plays quietly, nothing is typed. After 2 wrong keys the correct key **pulses** and Mazel says the sound ("We need /sh/… s-h").
- Each accepted letter speaks its sound; the finished word is blended aloud ("f-r-o-g, frog!").
- Lowercase only on screen; Caps Lock and Shift are ignored. Backspace does nothing (there's nothing wrong to delete).
- Typing levels: L0 the word is shown, she copies it (key glows); L1 the word is shown with a missing letter (she types the gap); L2 word is spoken + picture only, letter slots shown; L3 word spoken in a sentence, no picture.

### Reading and spelling challenges
**1. Label Fixer** (Museum, Library) — "The labels got mixed up! Fix them."
- Interaction: a picture (fossil, crab) with a scrambled label of letter tiles below. Click tiles in order (or arrow + Space) to build the word into slots. Slots snap tiles in; a wrong tile bounces back and says its sound.
- Ladder: L0 3 tiles, correct order hidden in a 3-letter word; L1 blends (4 tiles); L2 + 1 decoy tile; L3 digraph/silent-e words + 2 decoys; L4 two-syllable words (tiles in syllable chunks: *rab|bit*).
- Scaffolds: picture, word spoken, "sound it out" button (says each phoneme slowly while lighting slots), vowel tiles in red.

**2. Departure Board** (Train Station) — TYPING. "The board is broken! Type where the trains go."
- Interaction: a big flip-letter board. Conductor Joy says "The next train goes to… **Coney**. Type it!" Letters flip in with a clacky sound as she types. Finished row → a train toots and departs (scenery).
- Words: place-y words by tier: *bus, map, stop, train, beach, park, home, lake, Coney, Bronx* (proper nouns are shown, she types lowercase).
- Ladder: the typing levels above. Bonus at L3: a 3-word sentence ("to the zoo").

**3. Ice Writing** (Ice Rink) — TYPING. "Help Lena skate a word!"
- Interaction: each typed letter makes Lena glide and carve that letter on the ice in a sparkly trail. The finished word lights up and the crowd cheers. Then she reads it back by clicking a matching picture out of 3 (reading check).
- Words: blend and digraph tiers (*skate, snow, spin, slip, chill, flag, swim*).

**4. Sound Sorter** (Classroom, later Aquarium) — "Put each picture in the right cubby."
- Interaction: a picture appears and is spoken ("ship"). Click (or arrow to) one of 2–3 cubbies labeled with a sound chunk: **sh / ch / th**, or **st / fr / bl**, or short vs long vowel (*cap / cape*).
- Ladder: L0 2 cubbies, first letter (s vs m); L1 2 digraph cubbies; L2 3 cubbies; L3 ending sounds (*fish* ends in sh); L4 middle vowel.
- Scaffolds: each cubby speaks its sound on hover; Mazel exaggerates the target sound ("shhhhip").

**5. Magic E** (Art Room bonus, Museum gem hall) — "Tap the magic e to change the word!"
- Interaction: a word shows with a picture (*cap*). A glowing **e** bead sits on the side. She reads/hears "cap", then clicks the e to add it: the word becomes *cape*, the picture morphs, and the voice says "cap… cape! The e makes the a say its name." Then a 2-picture choice: "Which one is *kite*?" (*kit* vs *kite*).
- Pairs: cap/cape, kit/kite, hop/hope, tub/tube, pin/pine, can/cane, not/note, cub/cube, man/mane, rid/ride, tap/tape, dim/dime, rob/robe, hat/hate, fin/fine.

**6. Read & Find** (Principal's Office, Aquarium) — reading passages. "Read the sign. Find the thing."
- Interaction: a sign shows a short sentence; each word lights up as the voice reads it (karaoke). At L2+ the voice does NOT read automatically: she clicks words she needs help with (each click is logged). Then she walks to (or clicks) the object the sign describes among 3 in the room.
- Sentence ladder: L0 3 words ("A red fish."); L1 4–5 words ("The crab is in the sand."); L2 6–8 words ("The big shark swims by the ship."); L3 two sentences ("This fish is blue. It hides in a shell."); L4 three sentences with a question ("Jake the seal likes to splash. He has a ball. What color is it?").
- Logged: words she clicked for help → parent panel.

**7. Syllable Snap** (Coney Island carousel, Library bonus) — "Clap the parts! Then snap them together."
- Interaction: a two-syllable word is spoken ("pop-corn"). Two halves float as carousel horses; she clicks them in order to snap the word. At L2+ she picks the right first half from 3 (*pop / pen / pig*). At L3 she types the second half (TYPING lite).
- Words: *sunset, popcorn, rabbit, picnic, kitten, muffin, napkin, basket, rocket, button, magnet, pumpkin, cupcake, hotdog, sandbox, bathtub, lunchbox, upset*.

### Math challenges
**8. Ticket Counter** (Train Station, Coney Island, Museum gems) — counting by 10s off the decade. "Count the tickets in tens!"
- Interaction: tickets come in **bundles of 10** (a rubber band). Bundles slide onto a counter one at a time; a number line of slots shows the sequence with 1–2 blanks. She clicks the right number from 3 choices or types the digits (forgiving typing).
- Ladder (this is the teacher's target, so it gets the most items):
  - L0 decades: 10, 20, 30, _ (warm-up only).
  - L1 start at 9: 9, 19, 29, _, 49 (one bundle + 9 loose tickets drawn; the 9 loose stay put while bundles add on, showing why the ones digit stays 9).
  - L2 other starts 1–8: 4, 14, 24, _, 44; 7, 17, _, 37.
  - L3 blanks anywhere, two blanks, up to 99: 23, _, 43, _, 63.
  - L4 **counting down by 10s**: 95, 85, _, 65; 49, 39, _, 19.
  - L5 mixed up/down, start numbers to 120 (11, 21… also 102, 112).
- Scaffolds: the ones digit is always colored the same (teal) so she sees it never changes; tens digit pops orange each step; voice counts aloud as bundles land; a hundreds chart overlay at hint 2 with the column highlighted.
- Variants: Gem Counting by **2s and 5s** (museum: gems in pairs or hands of 5).

**9. Countdown Launch** (Gym, Ice Rink) — counting down. "Count down so it can go!"
- Interaction: a big number shows, she picks the next number down (3 choices or type it). Each step fills a pump/rocket meter; at 0 the balloon rocket or Zamboni whooshes off with confetti.
- Ladder: L0 10 → 0; L1 20 → 10 (crossing teens: 13, 12, 11, 10); L2 starts 21–40 crossing a decade (32, 31, 30, **29**); L3 starts 41–100 (crossing 70 → 69); L4 count down by 10s from a decade (90, 80…); L5 by 10s off the decade (59, 49, 39…); L6 by 2s and 5s down.
- Scaffolds: a vertical number line with the next number hidden behind a door; hint 2 opens the door partly; the voice counts the last 3 numbers aloud.

**10. Bagel Bundles** (Cafeteria, Bagel Shop) — place value / number sense. "Mr. Shapiro needs 34 bagels!"
- Interaction: click the **bag of 10** button and the **single bagel** button to fill an order; a counter shows tens and ones. Too many? Click a bagel to put it back (no penalty). Then "Send it!" Conversely at L3: shown a tray, she says how many by picking the number.
- Ladder: L0 numbers to 20; L1 to 50; L2 to 99; L3 read a tray of bags + singles and pick the number (out of 3, including the "flip" foil: 43 vs 34); L4 "10 more / 10 less" orders ("Now add one more bag. How many?").
- Scaffolds: ten-frames on each bag, voice counts "ten, twenty, thirty, thirty-one…", number spoken as "3 tens and 4 ones is 34".

**11. Fish Facts** (Aquarium, Cafeteria lunch variant) — math facts. "Feed each fish the right snack."
- Interaction: 3 fish swim slowly in a tank and **stop and wait** when the question shows; each fish has a number on its side. The question shows with dots ("4 + 3"). She clicks a fish (or arrows + Space) to feed it. Correct fish does a happy flip. No timer, fish never leave.
- Ladder: L0 +1/+2 within 10; L1 sums within 10; L2 make 10 (7 + _ = 10); L3 subtraction within 10; L4 doubles and near doubles to 20; L5 add/subtract within 20 (bridging 10).
- Scaffolds: dot pictures on L0–L2, a ten-frame at hint 2, a number line hop at hint 2 for subtraction.

**12. Coin Shop** (Bagel Shop, Jewelry bead shop, outfit shop) — money. "That costs 15¢. Pay with coins."
- Interaction: click coins from a coin tray into the paying dish (pennies, nickels, dimes; quarters at L3). The dish shows a running total. "Pay!" when equal. Overpay at L4 = she gets change and picks which coins come back.
- Ladder: L0 pennies to 10¢; L1 dimes + pennies (counting by 10s then 1s: 23¢ = 2 dimes + 3 pennies); L2 nickels; L3 quarters; L4 making change from 10¢ or 25¢.
- Scaffolds: each coin says its name and value when clicked; at hint 2 the dish highlights which coin to add.
- **Coin Shop purchases use real game coins** — she pays what she owes, never loses extra.

### Word lists (shared bank; ~15+ per tier)
| Tier | Words |
|---|---|
| T1 CVC | cat, dog, sun, map, bed, pig, hat, bus, cup, fox, hen, jam, log, mud, net, pin, rug, web, fan, box |
| T2 Blends | stop, frog, crab, flag, snap, drum, swim, plum, spin, step, sled, clap, grin, trip, nest, hand, lamp, gift, skunk, train |
| T3 Digraphs | ship, fish, chip, chin, shell, bath, math, thin, rich, lunch, much, shop, dish, path, chick, duck, sock, whale, wish, peach |
| T4 Silent e | cake, kite, home, cube, bike, rope, lake, bone, tape, slide, skate, smile, flute, snake, plane, stone, globe, grape |
| T5 Two-syllable | sunset, rabbit, kitten, picnic, muffin, napkin, basket, rocket, button, magnet, pumpkin, cupcake, popcorn, sandbox, lunchbox, hotdog, ticket, robot, tiger, zebra |
| Sight words (Read & Find, bonus spelling) | the, said, was, you, are, have, they, what, where, come, here, look, do, to, one, two, of, my, there |
| Theme words (mixed in by place) | Museum: fossil, bone, gem, shell, stone. Rink: skate, snow, spin, chill. Bagels: bake, salt, seed, lunch. Station: train, stop, ticket, track, clock. Aquarium: fish, crab, shark, whale, shell. Coney: wheel, ride, beach, sand, popcorn. |

**Context sentences** (spoken with every spelling word, one per word; examples): "The **frog** hops in the pond." "A **ship** sails on the sea." "I fly my **kite** up high." "The **crab** walks on the sand." "We eat **lunch** at noon." "My **rabbit** likes carrots." Store one sentence per word in the data file; the build must cover every listed word.

**Number ranges summary:** facts within 10 → 20; counting 0–120; skip counting by 10s from **any start** (weighted: 50% of count-by-10 items start off the decade, 30% are counting down); by 2s and 5s to 50; place value to 99; money to 25¢ (change to 25¢).

---

## 4. The Sparkle Studio (Jewelry Making)

**Where:** a bead table in the school Art Room (unlocked early in Act 1), and a **bead kit** button in the HUD that opens it anywhere **after the Museum**, so it's always within reach. Ruby is the studio host.

**Core interaction:** a big string runs across the panel. Below it is a **bead tray** (round, star, heart, cube, letter beads in 6 colors). She clicks a bead (or arrows + Space) and it slides onto the string with a happy click sound and a voice ("red heart!"). Clicking the last bead on the string takes it off (no undo penalty). When finished: "Tie it!" — the piece curls into a bracelet or necklace with a sparkle animation and goes into her **Jewelry Box**.

### Puzzle types
| Type | What she does | Teaches | Ladder |
|---|---|---|---|
| **Pattern Bracelet** | Ruby starts a pattern; she continues it to fill the string (6–12 beads). | Patterns | AB → AAB → ABB → ABC → AABB → growing (A, AB, ABB…) → "find the mistake" (one wrong bead to swap) |
| **Count-a-Strand** | An order says "a necklace with 40 beads." Beads come in 10-strands with a gold spacer; she adds strands and singles. Or: "Count my necklace by 10s", starting at 9 loose beads. | Skip counting 2s/5s/10s, off-decade | Mirrors Ticket Counter levels, including counting down ("take off 10 at a time: 49, 39…") |
| **Name Beads** | Spell a word or name with letter beads — TYPING (letter beads appear as she types, forgiving rules) or clicking letter beads. | Spelling | NPC names first (Ruby, Theo, Coo, Gus), then tier words: *star, shell, smile, heart* |
| **Mirror Charm** | Half a design is shown; she places beads to make the other half match, mirrored around a center charm. | Symmetry | 3 beads per side → 5 → 2 colors + 2 shapes |
| **Bead Shop** | Buy special beads (glow, gold, gem) with coins; uses Coin Shop interaction. | Money | Coin Shop ladder |

### Freestyle mode
After any puzzle, the **Free String** button lets her make anything with unlocked beads, no rules, no grading. This should feel like the real hobby: a calm music loop, satisfying clicks, a "Wear it!" button.

### Rewards and integration with the mystery
- **Wearing:** 3 slots on the avatar — **necklace, bracelet, hair clip** — drawn on the walking sprite in her bead colors. NPCs comment on what she's wearing ("Ooh, a star bracelet!").
- **Orders Board** in the Studio and one **order per NPC** (shown with a bead icon over their head). Delivering gives a reward:
  | NPC | Order | Unlock |
  |---|---|---|
  | Ms. Okafor | AB bracelet in red/blue | Clue notebook sticker sheet |
  | Mr. Gus | Name Beads "GUS" keychain | Opens the boiler room (a secret room with a pet and coins) |
  | Dr. Stone | 20-bead "fossil" necklace, counted by 10s from 0, then a 29-bead one | Museum gem hall (Gem Counting) |
  | Coach Lena | Snowflake mirror charm | Skates (slide-walk) |
  | Mr. Shapiro | Necklace of 34 beads (3 strands + 4) | Free "everything bagel" hat |
  | Conductor Joy | ABC pattern in train colors | Train conductor outfit |
  | Captain Marisol | Name Beads "SHELL" | Sea lion show + aquarium pet clue |
  | Coo (finale) | **Nest Necklace:** a growing pattern + mirror charm combined, 12 beads | Coo trades back the Great Bead Chain |
- **Clue pieces as jewelry:** each chain section she recovers is shown as a pattern strand. At the Train Station the next clue is a broken bracelet she must **finish the pattern** on to read the hidden message beads (a letter bead pattern that spells *coo*).
- **The final bead:** at the party she designs her **own bead** (color + shape picker) to add to the Great Bead Chain. It's saved and shows in the lobby forever.

---

## 5. Collectibles and Customization

- **Coins:** earned from challenges (5–10 per challenge, +2 per first-try right), sparkle spots on the floor (1 each, respawn daily), and orders (15–25). Spent on beads, outfits, pet treats. Prices 5–60. **Everything is cosmetic.** Coins are never taken away.
- **Outfit shop** (Shapiro's Bagels back room "Stoop Style"): 4 categories — hats (beret detective hat, bagel hat, star clip, crown), tops (detective coat, sweater, overalls, sparkle dress), shoes (sneakers, boots, skates), and colors. Plus the **Detective Kit** (magnifying glass in hand) given free in Act 1. Changing clothes happens at any mirror (one in the art room, tunnel and shop) via a big icon picker.
- **Pets (one per location, 7 total):** hidden somewhere in each place, found by walking into a rustling spot. Each pet follows her (one at a time; choose at the tunnel Pet Corner). Finding is never hard: Mazel says "I hear something squeaking…" and a small paw icon appears near the spot once she's been in a room for 60 seconds.
  - School: **Pickle** the class hamster (escaped into the gym bleachers)
  - Museum: **Pebble** the baby turtle (by the fossil pit)
  - Ice Rink: **Flurry** the white bunny (in the skate rental)
  - Bagel Shop: **Sesame** the kitten (in a flour sack)
  - Train Station: **Tooter** the duckling (under a bench)
  - Aquarium: **Bubbles** the goldfish (in a bowl she carries)
  - Coney Island: **Sandy** the hermit crab (under the boardwalk)
- **Detective Notebook** (N key or notebook icon), 4 tabs: **Clues** (each clue card with picture + spoken caption), **Suspects** (cards with happy "cleared" stamps), **Chain** (a 100-bead chain that fills as sections return), **Stickers** (one per challenge type and level-up, plus pets and gifts). Every page reads itself aloud when opened.
- **Hebrew bonus (optional, parent toggle):** one hidden **alef-bet bead** per location (7 total: alef, bet, gimel, dalet, hey, vav, zayin). Picking it up: "This is bet. Bet says /b/." They become special beads in the Studio.

---

## 6. UX Rules

- **Playable in 10 seconds:** opening the page shows the title with one giant **Play** button (Space/Enter/click). First run drops her straight into the Lobby with defaults (Sadelle's name, a default look). Avatar customizing is offered at the first mirror, never forced. Returning players skip straight back to where they left off.
- **Controls:** arrows/WASD to walk (4-direction plus diagonals, speed 4 tiles/s, no momentum, collision boxes are forgiving with corner sliding so she never snags on edges). **Space/Enter** = talk / use / confirm. **H** = hear again. **M** = map. **N** = notebook. **Esc** = close panel or pause. Mouse clicks work on every panel, button and NPC (clicking an NPC walks her there automatically using simple pathfinding).
- **Goal banner:** a top-center banner always shows the current goal in big text with a small picture ("Talk to Ruby in the Art Room"). It's spoken on room entry and when clicked.
- **Yellow guide arrow:** a bouncing arrow at the edge of her sprite always points to the next goal (through doors: points at the right door first). In the target room, a sparkle ring marks the exact spot. If she's idle for 20 s, Mazel walks a few steps toward the goal and says "This way!"
- **Voice:** every NPC line, sign, banner, button label and word is spoken via speechSynthesis (pre-pick the best English voice; rate 0.9; cancel before each new line). Speech bubbles show text at the same time with the current word highlighted. Phoneme sounds use a lookup table of spoken spellings ("/sh/" → "shh") so the TTS doesn't say letter names when a sound is meant.
- **Hear-again button:** a big speaker icon on the banner, every speech bubble and every puzzle panel; H key does the same.
- **Signs:** all doors and rooms have a picture + word sign; walking near speaks it.
- **No fail states:** no health, no enemies, no timers, no game over. Wrong answers only trigger hints. Leaving a challenge halfway keeps nothing but costs nothing. Coins never drop.
- **Session length:** content is paced so each act fits ~15–20 min. After the parent-set time (default 20 min), Mazel yawns at the next natural stopping point (after a challenge, never mid-challenge): "Great detecting! Let's save the next clue for tomorrow." She can keep playing.
- **Auto-save:** after every challenge, pick-up, room change and order (localStorage, wrapped in try/catch). One save slot. Reset only in the parent panel.
- **Parent panel (Shift+P, then an adult question like 6×7):** shows story progress, time played per day, current level per skill, accuracy per skill (last 20 items), **missed words list** (with how often), words she clicked for help in Read & Find, count-by-10 items missed (with the start number), counting-down misses, typing accuracy, jewelry made. Settings: session length, voice picker + test button, speech rate, Hebrew on/off, skill start levels (override), "jump to act" (for testing), reset save.
- **Accessibility:** big text (Andika or a system rounded font, min 28 px in panels), high contrast, vowels red / consonants blue in all spelling UIs, no flashing.

---

## 7. Build Priority

**MVP (ship this first, complete and polished):**
1. Engine: room renderer (tile grid + procedural props), player walking with corner sliding, room doors with fade, NPCs with dialog bubbles, voice queue, goal banner + guide arrow + idle Mazel nudge, save/load.
2. Story flow driven by a single linear **quest step list** (data table: step id, goal text, target room/object, on-complete actions). The arrow, banner and door unlocks all read from it.
3. School rooms (7) + Tunnel hub + **4 destinations: Museum, Ice Rink, Train Station, Coney Island**, with the finale and party.
4. Challenges: Label Fixer, Departure Board (typing), Ice Writing (typing), Sound Sorter, Ticket Counter, Countdown Launch, Bagel Bundles, Fish Facts (can live in the Cafeteria for MVP). Shared adaptive engine + hint ladder + forgiving typing component.
5. Sparkle Studio: Pattern Bracelet, Count-a-Strand, Name Beads, freestyle, wearing on avatar, 4 NPC orders (Okafor, Stone, Lena, Coo).
6. Notebook (clues, suspects, chain), coins, 4 pets, a small outfit set (6 items) at a mirror.
7. Parent panel with progress and missed words.

**Nice-to-have (add in this order):**
1. Bagel Shop (with Coin Shop + outfit shop) and Aquarium (Read & Find + Fish Facts move here).
2. Magic E, Read & Find in the Principal's office, Syllable Snap.
3. Mirror Charm, Bead Shop, the remaining NPC orders.
4. Remaining pets, more outfits, map fast-travel, skates slide-walk.
5. Hebrew alef-bet beads; post-game Coo visits; daily sparkle spots.
6. Music variations per location (WebAudio chiptune loops).

**Art rules (so procedural art looks finished):** one character rig (round head, big eyes with blink, 2-tone body, outfit/jewelry layers), thick dark outlines, soft drop shadows, a warm palette per location (school: cream/red brick; museum: marble/gold; rink: icy blue; station: starry teal; aquarium: deep blue; Coney: sunny yellow/red). Every interactable object gently bobs or sparkles.

**Biggest risks:** (1) TTS saying letter names instead of sounds — use the phoneme spelling table and test every sound on the parent's machine; (2) scope — finish the School + Museum to "polished" before building the next place; (3) typing frustration — watch her play the Departure Board once and tune the glow delay.
