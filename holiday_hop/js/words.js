'use strict';

/*
  First-grade word bank, grouped by spelling level.
  Format: 'word|sentence'. Pictures (when they exist) live in pictures.js.
  1 CVC · 2 more CVC + short sight words · 3 digraphs · 4 blends
  5 silent-e · 6 sight words · 7 themed words
*/
const WORD_LEVELS = {
  1: [
    'cat|The cat naps in the sun.', 'dog|The dog can dig.', 'sun|The sun is hot.', 'hat|She has a red hat.',
    'map|We look at the map.', 'bed|I go to bed.', 'pig|The pig is pink.', 'bug|A bug is on the leaf.',
    'cup|I drink from a cup.', 'bus|We ride the bus.', 'net|I catch a fish in my net.', 'pen|I write with a pen.',
    'box|The toy is in a box.', 'fox|The fox is red.', 'web|The spider made a web.', 'log|The frog sits on a log.',
    'pot|The soup is in the pot.', 'van|Dad drives a van.', 'fan|The fan is on.', 'hen|The hen has an egg.',
    'cap|He wears a cap.', 'jam|I like jam on toast.', 'mop|Mop the wet floor.', 'bat|The bat flies at night.',
    'red|The rose is red.', 'big|The whale is big.', 'sit|Sit on the mat.', 'run|I can run fast.',
    'hop|The bunny can hop.', 'ten|I have ten toes.', 'wet|The mermaid is wet.', 'mat|The cat is on the mat.',
  ],
  2: [
    'the|The fish can swim.', 'and|Mom and I dance.', 'is|The sky is blue.', 'it|I like it.',
    'in|The pearl is in the shell.', 'on|The hat is on my head.', 'up|The bubble goes up.', 'can|I can spin.',
    'see|I see a fish.', 'we|We like to sing.', 'me|Look at me!', 'at|Look at the star.',
    'nut|The squirrel has a nut.', 'leg|I hop on one leg.', 'six|I am six.', 'bag|My bag is full.',
    'tub|I take a bath in the tub.', 'ant|The ant is little.', 'jet|The jet flies up high.', 'kid|The kid can kick.',
    'hug|Give me a hug.', 'zip|Zip up your coat.', 'not|I am not sad.', 'yes|Yes, I can.',
    'get|Get the ball.', 'sad|The fish is sad.', 'fun|Ballet is fun.', 'gum|Do not sit on gum.',
  ],
  3: [
    'ship|The ship sails on the sea.', 'fish|The fish can swim.', 'chick|The chick is yellow.', 'chip|I ate a chip.',
    'dish|Put the cake on a dish.', 'moth|A moth flies to the light.', 'duck|The duck can quack.', 'sock|I lost a sock.',
    'rock|The crab is on a rock.', 'lock|The box has a lock.', 'ring|She has a gold ring.', 'king|The king has a crown.',
    'wing|The bird has a wing.', 'bath|I take a bath.', 'shop|We shop for shoes.', 'wish|I make a wish.',
    'with|Come with me.', 'that|I like that one.', 'this|This is my shell.', 'then|Then we can play.',
    'much|Thank you so much.', 'when|When can we go?', 'shut|Shut the door.', 'song|I sing a song.',
    'long|The eel is long.', 'back|Lie on your back.', 'neck|The swan has a long neck.', 'thin|The thread is thin.',
  ],
  4: [
    'frog|The frog can jump.', 'star|The star is bright.', 'crab|The crab walks sideways.', 'drum|I bang the drum.',
    'flag|The flag waves.', 'sled|We ride the sled.', 'plum|The plum is purple.', 'nest|The bird is in the nest.',
    'tent|We sleep in a tent.', 'hand|Raise your hand.', 'lamp|Turn on the lamp.', 'belt|My belt is pink.',
    'milk|I drink my milk.', 'gift|I got a gift.', 'plant|The plant is green.', 'swim|Fish can swim.',
    'stop|Stop at the red sign.', 'spin|I can spin on my toes.', 'clap|Clap your hands!', 'trip|We go on a trip.',
    'skip|I can skip.', 'glad|I am glad you came.', 'from|This gift is from Mom.', 'just|It is just right.',
    'must|We must be kind.', 'best|You are the best!', 'step|Step to the left.', 'clock|The clock says ten.',
    'snack|I eat a snack.', 'flip|The fish can flip.',
  ],
  5: [
    'cake|I eat cake.', 'bike|I ride my bike.', 'home|I go home.', 'kite|My kite flies high.',
    'bone|The dog has a bone.', 'rose|The rose smells nice.', 'cube|The ice cube is cold.', 'five|I have five fingers.',
    'nine|Nine comes after eight.', 'rope|Jump the rope.', 'cone|I lick my ice cream cone.', 'whale|The whale is big.',
    'grape|The grape is green.', 'slide|I go down the slide.', 'flute|She plays the flute.', 'plate|Put the food on the plate.',
    'smile|I smile at you.', 'lake|We swim in the lake.', 'game|We play a game.', 'make|I can make a card.',
    'ride|We ride the wave.', 'like|I like to dance.', 'name|What is your name?', 'time|It is time for bed.',
    'made|I made a necklace.', 'gave|She gave me a hug.', 'nose|I have a nose.', 'tube|The paint is in a tube.',
    'shine|The pearls shine.',
  ],
  6: [
    'said|She said hello.', 'they|They like to dance.', 'were|We were at the beach.', 'could|I could see the moon.',
    'would|I would like a hug.', 'have|I have a pet.', 'come|Come and play.', 'some|I want some cake.',
    'there|The shell is over there.', 'where|Where is my hat?', 'want|I want to swim.', 'was|It was fun.',
    'of|I want a cup of milk.', 'one|I have one nose.', 'two|I have two hands.', 'what|What is that?',
    'who|Who is at the door?', 'does|Does a fish swim?', 'friend|You are my friend.', 'many|I see many fish.',
    'again|Let us play again!', 'any|Do you have any pets?', 'put|Put on your shoes.', 'very|I am very happy.',
    'your|Is this your bag?', 'how|How are you?', 'after|We play after lunch.', 'every|I dance every day.',
    'give|Give me the ball.', 'know|I know the answer.', 'live|Fish live in the sea.', 'once|Once upon a time.',
    'walk|We walk to school.',
  ],
  7: [
    'shell|I found a shell.', 'wave|The wave is big.', 'glue|I use glue for crafts.', 'pearl|The pearl is white.',
    'crown|The queen has a crown.', 'paint|I paint a rainbow.', 'tail|The mermaid has a tail.', 'boat|The boat floats.',
    'moon|The moon is bright.', 'sea|The mermaid lives in the sea.', 'bow|I tie a bow.', 'bead|I put a bead on my string.',
    'dance|I love to dance.', 'twirl|I twirl in my tutu.', 'rainbow|I see a rainbow.', 'tutu|My tutu is pink.',
    'sand|The sand is warm.', 'coral|The coral is pink.', 'ribbon|I tie a ribbon.', 'glitter|The glitter shines.',
    'splash|Splash in the water!', 'craft|We make a craft.', 'mermaid|The mermaid sings.', 'sparkle|The stars sparkle.',
  ],
};

const WORDS = [];
for (const [lvl, list] of Object.entries(WORD_LEVELS)) {
  for (const item of list) {
    const [word, sentence] = item.split('|');
    WORDS.push({ word, sentence, level: +lvl });
  }
}

/* Holiday words for boss "wake-up words" and themed zones. */
const THEME_WORDS = {
  halloween: [
    'bat|The bat flies at night.', 'web|The spider made a web.', 'cat|The black cat says meow.', 'hat|The witch has a tall hat.',
    'boo|The ghost says boo!', 'moon|The moon is full.', 'mask|I wear a mask.', 'owl|The owl says hoo.',
    'candy|I got candy!', 'witch|The witch has a broom.', 'spooky|The house is spooky.', 'treat|Trick or treat!',
  ],
  hanukkah: [
    'oil|We fry latkes in oil.', 'gift|I got a gift.', 'spin|Spin the dreidel!', 'gelt|Gelt is chocolate money.',
    'jam|The donut has jam in it.', 'hot|The latkes are hot.', 'snow|The snow is white.', 'star|The star is blue.',
    'latke|I eat a latke.', 'light|The candles give light.', 'eight|Hanukkah has eight nights.', 'candle|Light the candle.',
    'dreidel|Spin the dreidel!',
  ],
  valentine: [
    'love|I love my family.', 'card|I made a card.', 'red|The heart is red.', 'hug|Give me a hug.', 'kind|Be kind to friends.',
    'pink|The card is pink.', 'heart|I drew a heart.', 'sweet|You are so sweet.', 'kiss|A kiss for Mom.',
  ],
  purim: [
    'mask|I wear a mask.', 'king|The king has a crown.', 'queen|Queen Esther is brave.', 'fun|Purim is fun!', 'treat|I give a treat.',
    'gift|I bring a gift.', 'crown|The crown is gold.', 'noise|Make a big noise!', 'jam|The cookie has jam.',
  ],
  newyear: [
    'new|It is a new year.', 'ball|The ball drops down.', 'clock|The clock says twelve.', 'cheer|We all cheer!', 'year|Happy new year!',
    'hat|I wear a party hat.', 'pop|Pop goes the popper.', 'night|We stay up at night.', 'ten|We count down from ten.',
  ],
  tubishvat: [
    'tree|We plant a tree.', 'seed|A seed grows.', 'leaf|The leaf is green.', 'root|The root is deep.', 'fig|I eat a fig.',
    'date|A date is sweet.', 'snow|The snow is cold.', 'grow|Trees grow tall.', 'nut|The squirrel has a nut.',
  ],
  earthday: [
    'sun|The sun is hot.', 'bee|The bee likes flowers.', 'frog|The frog can hop.', 'plant|We plant a plant.', 'clean|Keep the park clean.',
    'zoo|We go to the zoo.', 'lion|The lion says roar.', 'bird|The bird sings.', 'earth|We love the earth.',
  ],
  passover: [
    'egg|The egg is on the plate.', 'cup|Fill the cup.', 'seder|We have a seder.', 'frog|A frog jumped out!', 'wine|Grape juice for kids.',
    'four|We ask four questions.', 'free|We are free.', 'plate|The seder plate is pretty.', 'sea|The sea split.',
  ],
  july4: [
    'flag|The flag is red, white, and blue.', 'pop|The firework goes pop.', 'sun|The sun is hot.', 'sand|I dig in the sand.', 'wave|The wave is big.',
    'swim|I swim in the sea.', 'hot|It is a hot day.', 'star|The flag has stars.', 'beach|We go to the beach.',
  ],
  birthday: [
    'cake|I eat cake.', 'gift|I got a gift.', 'wish|I make a wish.', 'party|It is my party.', 'seven|I am seven!', 'candle|Blow out the candle.',
  ],
  thanksgiving: [
    'pie|I eat pie.', 'yam|The yam is orange.', 'corn|The corn is yellow.', 'nut|The squirrel has a nut.',
    'hen|The hen sits on eggs.', 'pan|The pan is hot.', 'thank|Thank you, Grandma!', 'feast|We have a big feast.',
    'leaf|The leaf is red.', 'turkey|The turkey says gobble.', 'gobble|Gobble, gobble!', 'family|I love my family.',
  ],
};

function themeWord(theme) {
  const list = (THEME_WORDS[theme] || THEME_WORDS.halloween).map(s => { const [word, sentence] = s.split('|'); return { word, sentence }; });
  const lvl = S.spell.level;
  const maxLen = lvl <= 2 ? 3 : lvl <= 4 ? 4 : lvl <= 6 ? 5 : 6;
  const pool = list.filter(w => w.word.length <= maxLen);
  const w = pick(pool.length ? pool : list);
  return { kind: 'spell', word: w.word, sentence: w.sentence, level: lvl, key: w.word, skill: 'spell', theme: true };
}
