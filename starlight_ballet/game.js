/* Starlight Ballet — a spelling & math recital.
   One IIFE, no build, no deps, works over file://. */
(function(){
"use strict";

/* ================= DATA ================= */
const HERO="Ruby";
const ACTS=[
 {name:"Enchanted Garden", icon:"🌹", sky:["#8fd3ff","#e8f9ff"], far:"#9fd88a", deco:["🌷","🌼","🌹","🦋"], costume:"rose",
  story:"Ruby's very first recital is in the Enchanted Garden. The flowers whisper: \"Show us what you've practiced!\""},
 {name:"Moonlight Waltz",  icon:"🌙", sky:["#2b2d6e","#7a7fe0"], far:"#3d4090", deco:["⭐","🌙","✨","🦉"], costume:"moon",
  story:"Word of Ruby's dancing is spreading! The moon fairies invite her to a midnight waltz under the stars."},
 {name:"Candy Kingdom",    icon:"🍭", sky:["#ffd9ec","#fff3d9"], far:"#f7b2d9", deco:["🍭","🧁","🍬","🍰"], costume:"candy",
  story:"All that practice is paying off — the whole Candy Kingdom is cheering Ruby's name!"},
 {name:"Swan Lake",        icon:"🦢", sky:["#9fd8e8","#e8f7ff"], far:"#7fc4d8", deco:["🦢","💧","🌸","❄️"], costume:"swan",
  story:"The famous Swan Lake! Only dancers who practice every single day may perform here. Ruby is ready."},
 {name:"Starlight Gala",   icon:"👑", sky:["#1d1440","#4a2a80"], far:"#2d1d60", deco:["👑","⭐","🎆","💖"], costume:"gold",
  story:"The night of the Starlight Gala. Ruby takes a deep breath. Every step she ever practiced led her here... her dream!"},
];
const STORY_INTRO=[
 {title:"Starlight Ballet",pose:"stand",text:"This is Ruby, a little dancer with a great big dream — to become a prima ballerina!"},
 {title:"Big dreams take practice",pose:"plie",text:"Every single day, Ruby practices her steps. Plié! Twirl! Leap!"},
 {title:"You can help!",pose:"fifth",twirl:true,text:"Your spelling and your math ARE Ruby's practice. Every word and number you get right makes her dance stronger!"},
 {title:"The dream",pose:"leap",text:"Practice hard, act by act, and by the Starlight Gala... Ruby will shine like a star! Ready?"},
];
const SLOTS=["spell","math","spell","math","rhyme","finale"];
const PER_ACT=SLOTS.length, TOTAL=ACTS.length*PER_ACT;
const SLOT_ICON={spell:"🔡",math:"🔢",rhyme:"🎶",finale:"🎭"};
const SLOT_NAME={spell:"Spell the Steps",math:"Count the Beats",rhyme:"Rhyme Time",finale:"Grand Finale"};

/* Rhyme families for the bonus round: [WORD, emoji] that rhyme by sound. */
const RHYMES=[
 [["CAT","🐱"],["HAT","🎩"],["BAT","🦇"],["RAT","🐭"]],
 [["SUN","☀️"],["RUN","🏃"],["ONE","1️⃣"],["FUN","🎉"]],
 [["DOG","🐶"],["FROG","🐸"],["LOG","🪵"]],
 [["CAKE","🍰"],["SNAKE","🐍"],["LAKE","🏞️"]],
 [["ROSE","🌹"],["NOSE","👃"],["TOES","🦶"]],
 [["BEE","🐝"],["TREE","🌳"],["KEY","🔑"],["THREE","3️⃣"]],
 [["MOON","🌙"],["SPOON","🥄"],["BALLOON","🎈"]],
 [["STAR","⭐"],["CAR","🚗"],["JAR","🏺"]],
 [["PIG","🐷"],["BIG","🐘"],["DIG","⛏️"]],
 [["RING","💍"],["KING","🤴"],["SING","🎤"]],
 [["SNAIL","🐌"],["WHALE","🐋"],["PAIL","🪣"]],
 [["BOW","🎀"],["SNOW","❄️"],["GLOW","✨"]],
];

const WORD_BANK={
 1:[["CAT","🐱"],["SUN","☀️"],["BEE","🐝"],["BOW","🎀"],["PIG","🐷"],["HAT","🎩"],["BUG","🐞"],["EGG","🥚"],["FOX","🦊"],["OWL","🦉"],["JAM","🍓"],["BUS","🚌"]],
 2:[["STAR","⭐"],["MOON","🌙"],["ROSE","🌹"],["TUTU","🩰"],["SWAN","🦢"],["CAKE","🍰"],["FROG","🐸"],["FISH","🐠"],["BIRD","🐦"],["LEAP","🤸"],["SNOW","❄️"],["PINK","🌸"],["DUCK","🦆"],["KITE","🪁"]],
 3:[["DANCE","💃"],["MUSIC","🎵"],["MAGIC","✨"],["FAIRY","🧚"],["CROWN","👑"],["HEART","💖"],["APPLE","🍎"],["SMILE","😊"],["DREAM","💭"],["SHINE","🌟"],["CANDY","🍬"],["TWIRL","💫"]],
 4:[["BALLET","🩰"],["RIBBON","🎀"],["FLOWER","🌼"],["CASTLE","🏰"],["RAINBOW","🌈"],["PRINCESS","👸"],["SPARKLE","✨"],["UNICORN","🦄"]],
};
const PRAISE=["Bravo!","Beautiful!","Magnifique!","Twinkle toes!","Encore!","Superstar!","So graceful!","Lovely!"];
const MATH_EMOJI=["🌹","⭐","🧁","🎀","🦋","🍓","🎈","🍬","🐚","💎"];
const WORDS_PER_SCENE=5, PROBS_PER_SCENE=6;

/* Each costume is visually distinct: palette + tutu pattern + accessory pixels.
   stripe = alternate tutu columns; sparkle = glitter pixels on the tutu;
   head = headpiece pixels [dx,dy,color] around the bun; wings = feather wings. */
const COSTUMES={
 pink:{l:"#ff6fa5",t:"#ffc9e2",p:"#ff9ec2",name:"Pink Petal"},
 rose:{l:"#c22a4a",t:"#ff8098",p:"#e05a78",name:"Rose Garden",
  head:[[-1,-1,"#e83a5a"],[0,-1,"#ff7a9a"],[1,-1,"#3a9a4a"]]},
 moon:{l:"#3a55c0",t:"#cdd9ff",p:"#8aa2f0",name:"Moonbeam",stripe:"#8fa8ff",
  head:[[-2,-1,"#ffe9a8"],[-1,-2,"#ffe9a8"],[0,-2,"#ffe9a8"],[1,-2,"#ffe9a8"],[2,-1,"#ffe9a8"]]},
 candy:{l:"#ff5a8a",t:"#7fe8cf",p:"#ffffff",name:"Sugar Mint",stripe:"#ffffff",
  head:[[-1,-1,"#ff5a8a"],[1,-1,"#ff5a8a"]]},
 swan:{l:"#f4f6ff",t:"#ffffff",p:"#ffd76a",name:"Swan Feather",wings:"#ffffff",
  head:[[-1,-1,"#ffd76a"],[0,-2,"#ffd76a"],[1,-1,"#ffd76a"]]},
 gold:{l:"#e8b23a",t:"#ffe9a8",p:"#fff1c8",name:"Golden Star",sparkle:"#ffffff",
  head:[[-2,-1,"#ffd76a"],[-1,-2,"#ffd76a"],[0,-1,"#ffd76a"],[1,-2,"#ffd76a"],[2,-1,"#ffd76a"]]},
 /* bonus costumes bought with roses — the audience's gifts add up to something! */
 rainbow:{l:"#ff5a8a",t:"#ffd76a",p:"#7ae0c3",name:"Rainbow Magic",rainbow:true,roses:30,
  head:[[-1,-1,"#ff5a5a"],[0,-2,"#ffd76a"],[1,-1,"#5ab0ff"]]},
 unicorn:{l:"#c9a2f0",t:"#ffffff",p:"#ffd76a",name:"Unicorn Dream",stripe:"#f0e2ff",sparkle:"#ffd7ec",roses:80,
  head:[[-1,-1,"#ff9ec2"],[1,-1,"#a0e8ff"],[0,-2,"#ffd76a"],[0,-3,"#ffe9a8"]]},
};
const RAINBOW_T=["#ff5a5a","#ff9a3a","#ffd75a","#5ad07a","#5ab0ff","#b07af0"];
const SKIN="#ffd9b8", HAIR="#6b4226";

/* Ballerina pixel poses (18 wide). h hair, f face, l leotard, t tutu, s skin, p shoe */
const POSES={
 stand:[
  "........hh........",
  ".......hhhh.......",
  ".......ffff.......",
  ".......ffff.......",
  "........ff........",
  ".......llll.......",
  ".....s.llll.s.....",
  ".....s.llll.s.....",
  "......s....s......",
  "....tttttttttt....",
  "...tttttttttttt...",
  "....tttttttttt....",
  ".......s..s.......",
  ".......s..s.......",
  ".......s..s.......",
  ".......p..p.......",
 ],
 fifth:[
  "........ss........",
  "......s....s......",
  "......shhhhs......",
  "......sffffs......",
  ".......ffff.......",
  "........ff........",
  ".......llll.......",
  ".......llll.......",
  ".......llll.......",
  "....tttttttttt....",
  "...tttttttttttt...",
  "....tttttttttt....",
  ".......s..s.......",
  ".......s..s.......",
  ".......s..s.......",
  ".......p..p.......",
 ],
 plie:[
  "........hh........",
  ".......hhhh.......",
  ".......ffff.......",
  ".......ffff.......",
  "........ff........",
  ".......llll.......",
  ".....s.llll.s.....",
  "....s..llll..s....",
  "....tttttttttt....",
  "...tttttttttttt...",
  "....tttttttttt....",
  "......s....s......",
  ".....s......s.....",
  ".....p......p.....",
 ],
 arabesque:[
  "........hh........",
  ".......hhhh.......",
  ".......ffff.......",
  ".......ffff.......",
  "........ff........",
  ".......llll.......",
  "....ss.llll.ssss..",
  ".......llll.......",
  "....tttttttttt....",
  "...tttttttttttt...",
  "....tttttttttt....",
  ".psssss..s........",
  ".........s........",
  ".........s........",
  ".........p........",
 ],
 leap:[
  "....s........s....",
  ".....s......s.....",
  ".......hhhh.......",
  ".......ffff.......",
  ".......ffff.......",
  "........ff........",
  ".......llll.......",
  ".......llll.......",
  "....tttttttttt....",
  "...tttttttttttt...",
  "....tttttttttt....",
  ".sssss......sssss.",
  "p................p",
 ],
 bow:[
  "........hh........",
  ".......hhhh.......",
  ".......ffff.......",
  ".......ffff.......",
  "........ff........",
  "..ss...llll...ss..",
  ".......llll.......",
  ".......llll.......",
  "....tttttttttt....",
  "...tttttttttttt...",
  "....tttttttttt....",
  ".......ss.........",
  "......s.s.........",
  "......p.p.........",
 ],
};

/* skill → content. Both tracks run 1..8 and adapt gently.
   Spelling never shows the whole word to copy: "peek" flashes it then hides,
   "hidden" is picture + spoken word only. Mistakes still reveal hints. */
function spellStage(k){k=Math.floor(k);
 if(k<=1)return{tier:1,mode:"peek"};
 if(k===2)return{tier:2,mode:"peek"};
 if(k===3)return{tier:2,mode:"hidden"};
 if(k===4)return{tier:3,mode:"peek"};
 if(k===5)return{tier:3,mode:"hidden"};
 if(k===6)return{tier:4,mode:"peek"};
 if(k===7)return{tier:4,mode:"hidden"};
 return{tier:Math.random()<.5?3:4,mode:"hidden"};
}
/* Math is arithmetic from the start; emoji groups are there to count *on*,
   not counting-as-the-question. visual:false = numerals only (mental math). */
function mathStage(k){k=Math.floor(k);
 if(k<=1)return{kind:"add",max:5,visual:true};
 if(k===2)return{kind:"add",max:10,visual:true};
 if(k===3)return{kind:"sub",max:10,visual:true};
 if(k===4)return{kind:Math.random()<.5?"add":"sub",max:10,visual:true};
 if(k===5)return{kind:"add",max:20,visual:true};
 if(k===6)return{kind:"missing",max:10,visual:true};
 if(k===7)return{kind:Math.random()<.5?"add":"sub",max:20,visual:false};
 return{kind:Math.random()<.6?"missing":"sub",max:20,visual:false};
}

/* ================= STATE ================= */
const KEY="starlightBallet.v2";
let S={progress:0,stars:{},roses:0,costume:"pink",closet:["pink"],spell:1,math:1,muted:false,streakS:0,streakM:0,seenIntro:false,actSeen:{}};
function load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d)S=Object.assign(S,d);}catch(e){}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}

let scene=null, sceneIndex=0, rafId=null, running=false;
const $=id=>document.getElementById(id);
const rnd=n=>Math.floor(Math.random()*n);
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};

/* ================= AUDIO ================= */
let AC=null, musicTimer=null, musicBar=0, nextBarTime=0, musicOn=false;
function actx(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}}if(AC&&AC.state==="suspended")AC.resume();return AC;}
function tone(freq,dur,at,type,vol){
 const ac=actx(); if(!ac||S.muted||!freq)return;
 const t=at||ac.currentTime;
 const o=ac.createOscillator(),g=ac.createGain();
 o.type=type||"sine"; o.frequency.value=freq;
 g.gain.setValueAtTime(0.0001,t);
 g.gain.linearRampToValueAtTime(vol||0.12,t+0.02);
 g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
 o.connect(g).connect(ac.destination); o.start(t); o.stop(t+dur+0.05);
}
const PENTA=[523.25,587.33,659.25,783.99,880.00,1046.5];
function sndStep(i){tone(PENTA[i%PENTA.length],0.18,0,"sine",0.12);tone(PENTA[i%PENTA.length]*2,0.12,0,"triangle",0.05);}
function sndWord(){[523,659,784,1047].forEach((f,i)=>tone(f,0.22,actx()&&actx().currentTime+i*0.09,"sine",0.11));}
function sndOops(){tone(233,0.25,0,"sine",0.08);}
function sndStar(){[784,988,1175,1568].forEach((f,i)=>tone(f,0.2,actx()&&actx().currentTime+i*0.07,"triangle",0.1));}
/* Zelda-style "item get!" for costume unlocks */
function sndItemGet(){
 const ac=actx(); if(!ac)return; const t=ac.currentTime;
 [[392,0,.13],[440,.14,.13],[494,.28,.13],[784,.44,.55]].forEach(([f,d,len])=>{
  tone(f,len,t+d,"triangle",0.12); tone(f*2,len,t+d,"sine",0.05);
 });
}
function sndFanfare(){
 const ac=actx(); if(!ac)return; const t=ac.currentTime;
 [[523,0],[659,.12],[784,.24],[1047,.36],[784,.52],[1047,.62]].forEach(([f,d])=>{tone(f,0.3,t+d,"triangle",0.11);tone(f/2,0.3,t+d,"sine",0.07);});
}
/* filtered noise = a real theater APPLAUSE for the little recital star */
function sndApplause(dur){
 const ac=actx(); if(!ac||S.muted)return;
 const len=Math.floor(ac.sampleRate*(dur||1.5)), buf=ac.createBuffer(1,len,ac.sampleRate);
 const d=buf.getChannelData(0);
 for(let i=0;i<len;i++){const t=i/len;d[i]=(Math.random()*2-1)*Math.pow(1-t,1.4)*(0.35+0.65*Math.random());}
 const src=ac.createBufferSource(); src.buffer=buf;
 const f=ac.createBiquadFilter(); f.type="bandpass"; f.frequency.value=1500; f.Q.value=0.5;
 const g=ac.createGain(); g.gain.value=0.22;
 src.connect(f); f.connect(g); g.connect(ac.destination); src.start();
}
/* gentle music-box waltz loop */
const WALTZ_BASS=[130.81,98.00,110.00,98.00];
const WALTZ_MEL=[[523,659,784],[659,0,784],[880,784,659],[784,0,0],[659,784,880],[1047,0,880],[784,659,587],[523,0,0]];
function scheduleBar(){
 const ac=actx(); if(!ac||!musicOn)return;
 if(S.muted){musicTimer=setTimeout(scheduleBar,600);nextBarTime=ac.currentTime+0.1;return;}
 const beat=0.42, t0=Math.max(nextBarTime,ac.currentTime+0.05);
 const bass=WALTZ_BASS[musicBar%4];
 tone(bass,0.35,t0,"triangle",0.055);
 for(let b=1;b<3;b++){tone(bass*2,0.16,t0+b*beat,"triangle",0.03);tone(bass*3,0.16,t0+b*beat,"sine",0.022);}
 WALTZ_MEL[musicBar%8].forEach((f,i)=>{if(f)tone(f,0.32,t0+i*beat,"sine",0.045);});
 musicBar++; nextBarTime=t0+3*beat;
 musicTimer=setTimeout(scheduleBar,Math.max(60,(nextBarTime-ac.currentTime-0.2)*1000));
}
function startWaltz(){if(musicOn)return;musicOn=true;musicBar=0;const ac=actx();nextBarTime=ac?ac.currentTime+0.1:0;scheduleBar();}
function stopWaltz(){musicOn=false;if(musicTimer){clearTimeout(musicTimer);musicTimer=null;}}

/* speech (built-in, offline voices) */
function speak(txt){
 try{
  if(S.muted||!window.speechSynthesis)return;
  const u=new SpeechSynthesisUtterance(txt); u.rate=0.8; u.pitch=1.15;
  const vs=speechSynthesis.getVoices();
  const v=vs.find(v=>/^en/.test(v.lang)&&/Samantha|Karen|Moira|Female/i.test(v.name))||vs.find(v=>/^en/.test(v.lang));
  if(v)u.voice=v;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
 }catch(e){}
}

/* ================= SKILL ================= */
/* Streak-based: three first-try answers in a row nudge the level up a step;
   any miss immediately eases it back a little, so it hugs her ability. */
function bumpSkill(track,ok){
 const key=track==="spell"?"streakS":"streakM";
 const before=Math.floor(S[track]);
 if(ok){
  S[key]=(S[key]||0)+1;
  if(S[key]>=3){S[key]=0;S[track]=Math.min(8,S[track]+0.34);}
 }else{
  S[key]=0;
  S[track]=Math.max(1,S[track]-0.3);
 }
 if(Math.floor(S[track])>before){
  toast(track==="spell"?"✨ Level up! New dance words!":"✨ Level up! Bigger numbers!");
  sndStar();
 }
 save();
}

/* ================= ROSES ================= */
/* Roses are the audience's love — and they add up to real gifts:
   bonus costumes unlock at rose milestones so every 🌹 counts. */
function gainRoses(n){
 S.roses+=n; save(); updatePills();
 Object.keys(COSTUMES).forEach(k=>{
  const c=COSTUMES[k];
  if(c.roses&&S.roses>=c.roses&&!S.closet.includes(k)){
   S.closet.push(k); save();
   setTimeout(()=>{
    sndItemGet(); confetti();
    toast(`🌹×${c.roses}! New costume: ${c.name}! Find it in the closet!`);
    speak(`Wow, ${c.roses} roses! You earned the ${c.name} costume!`);
   },600);
  }
 });
}

/* ================= BALLERINA SPRITE ================= */
function drawBallerina(g,cx,feetY,sc,pose,sx,costumeKey){
 const grid=POSES[pose]||POSES.stand;
 const c=COSTUMES[costumeKey]||COSTUMES.pink;
 const map={h:HAIR,f:SKIN,s:SKIN,l:c.l,t:c.t,p:c.p};
 const w=18,h=grid.length;
 g.save();
 g.translate(cx,feetY-h*sc);
 g.scale(sx||1,1);
 const put=(x,y,col)=>{g.fillStyle=col;g.fillRect((x-w/2)*sc,y*sc,sc,sc);};
 for(let y=0;y<h;y++){const row=grid[y];
  for(let x=0;x<row.length;x++){const ch=row[x];
   if(ch==="."||!map[ch])continue;
   let col=map[ch];
   if(ch==="t"){
    if(c.rainbow)col=RAINBOW_T[(x+y)%RAINBOW_T.length];
    if(c.stripe&&x%2===0)col=c.stripe;
    if(c.sparkle&&(x*3+y*5)%7===0)col=c.sparkle;
   }
   put(x,y,col);
  }
 }
 /* wings behind-ish the torso (swan) */
 if(c.wings){
  const ly=Math.max(0,grid.findIndex(r=>r.indexOf("l")>=0))+1;
  for(let wy=0;wy<3;wy++)for(let wx=0;wx<3-wy;wx++){
   put(12+wx,ly+wy,c.wings); put(5-wx,ly+wy,c.wings);
  }
 }
 /* headpiece around the bun */
 if(c.head){
  let hy=grid.findIndex(r=>r.indexOf("h")>=0); if(hy<0)hy=0;
  c.head.forEach(([dx,dy,col])=>put(9+dx,hy+dy,col));
 }
 /* eyes on face row 3-ish */
 let fy=grid.findIndex(r=>r.indexOf("f")>=0);
 if(fy>=0){fy+=1;g.fillStyle="#4a3040";
  g.fillRect((-1.5)*sc,(fy+0.2)*sc,sc*0.8,sc*0.8);
  g.fillRect((0.7)*sc,(fy+0.2)*sc,sc*0.8,sc*0.8);
 }
 g.restore();
}

/* ================= STAGE SCENE ================= */
const stage=$("stage"), ctx=stage.getContext("2d");
function spawnSparkles(n,x,y){
 for(let i=0;i<n;i++)scene.particles.push({type:"spark",x:x+rnd(60)-30,y:y-rnd(60),vx:(Math.random()-0.5)*40,vy:-30-rnd(50),life:0.9+Math.random()*0.5});
}
function spawnRoses(n){
 for(let i=0;i<n;i++)scene.particles.push({type:"rose",x:20+rnd(440),y:-10-rnd(120),vx:(Math.random()-0.5)*20,vy:50+rnd(50),life:4,rot:Math.random()*6});
}
function setPose(p,ms){if(!scene)return;scene.pose=p;scene.poseUntil=performance.now()+(ms||700);}
function doTwirl(ms){if(!scene)return;scene.twirlUntil=performance.now()+(ms||900);}

let lastTs=0;
function drawStage(ts){
 const g=ctx,W=stage.width,H=stage.height,act=scene.act;
 const dt=Math.min(0.05,(ts-lastTs)/1000)||0.016; lastTs=ts;
 /* sky */
 const sky=g.createLinearGradient(0,0,0,125);
 sky.addColorStop(0,act.sky[0]); sky.addColorStop(1,act.sky[1]);
 g.fillStyle=sky; g.fillRect(0,0,W,125);
 /* far hills */
 g.fillStyle=act.far;
 g.beginPath(); g.moveTo(0,125);
 for(let x=0;x<=W;x+=40)g.quadraticCurveTo(x+20,105+((x/40)%2)*8,x+40,125);
 g.closePath(); g.fill();
 /* floating deco */
 g.font="16px sans-serif"; g.textAlign="center";
 for(let i=0;i<10;i++){
  const e=act.deco[i%act.deco.length];
  const x=40+(i*97)%400, y=22+(i*53)%68+Math.sin(ts/700+i)*3;
  g.globalAlpha=0.9; g.fillText(e,x,y); g.globalAlpha=1;
 }
 /* stage floor */
 const wood=g.createLinearGradient(0,125,0,H);
 wood.addColorStop(0,"#b07a48"); wood.addColorStop(1,"#7a4a2c");
 g.fillStyle=wood; g.fillRect(0,125,W,H-125);
 g.strokeStyle="#00000022";
 for(let x=16;x<W;x+=32){g.beginPath();g.moveTo(x,125);g.lineTo(x,H);g.stroke();}
 g.fillStyle="#ffffff33"; g.fillRect(0,125,W,3);
 /* the journey: Stella crosses the stage toward the goal star as answers land */
 if(scene.hx==null)scene.hx=scene.hxT=(scene.kind==="finale"||scene.kind==="studio"?W/2:90);
 scene.hx+=(scene.hxT-scene.hx)*Math.min(1,dt*3.5);
 if(Math.abs(scene.hxT-scene.hx)>4&&Math.random()<0.4)
  scene.particles.push({type:"spark",x:scene.hx-10,y:168,vx:-30,vy:-20-rnd(30),life:0.5+Math.random()*0.3});
 /* goal star on its pedestal, stage right — once grabbed it dances above Ruby */
 if(scene.kind!=="finale"&&scene.kind!=="studio"){
  g.fillStyle="#8a5a9a"; g.fillRect(418,160,26,12);
  g.fillStyle="#6a4078"; g.fillRect(421,156,20,4);
  g.font="17px sans-serif"; g.textAlign="center";
  if(scene.starGone){
   g.font="24px sans-serif";
   g.fillText("⭐",scene.hx,94+Math.sin(ts/140)*4);
  }else{
   g.globalAlpha=0.7+0.3*Math.sin(ts/180); g.fillText("⭐",431,154); g.globalAlpha=1;
  }
 }
 /* spotlight */
 const hx=scene.hx, hy=170;
 const spot=g.createRadialGradient(hx,hy-30,10,hx,hy-30,95);
 spot.addColorStop(0,"rgba(255,255,230,0.30)"); spot.addColorStop(1,"rgba(255,255,230,0)");
 g.fillStyle=spot; g.fillRect(0,0,W,H);
 /* ballerina */
 const now=performance.now();
 let pose=scene.pose||"stand";
 if(scene.poseUntil&&now>scene.poseUntil){scene.pose="stand";pose="stand";}
 let sx=1, bobY=Math.sin(ts/500)*1.5, sc=4;
 if(scene.twirlUntil&&now<scene.twirlUntil){pose="fifth";sx=Math.cos(now/80);if(Math.abs(sx)<0.15)sx=0.15*Math.sign(sx||1);
  if(Math.random()<0.3)spawnSparkles(1,hx,hy-20);}
 let feetY=172+bobY;
 if(pose==="leap")feetY-=26;
 drawBallerina(g,hx,feetY,sc,pose,sx,S.costume);
 /* particles */
 scene.particles=scene.particles.filter(p=>{
  p.life-=dt; if(p.life<=0)return false;
  p.x+=p.vx*dt; p.y+=p.vy*dt;
  if(p.type==="spark"){
   p.vy+=60*dt;
   g.fillStyle=["#fff","#ffd76a","#ff9ec2","#a0e8ff"][rnd(4)];
   const s=p.life>0.5?3:2; g.fillRect(p.x,p.y,s,s);
  }else{ /* rose */
   p.rot+=dt*3;
   g.save();g.translate(p.x,p.y);g.rotate(Math.sin(p.rot)*0.5);
   g.font="14px sans-serif";g.textAlign="center";g.fillText("🌹",0,0);g.restore();
   if(p.y>H-8){p.vy=0;p.vx=0;}
  }
  return true;
 });
 /* curtains on top so hero stays behind the frame */
 g.fillStyle="#a3273f";
 g.fillRect(0,0,26,H); g.fillRect(W-26,0,26,H);
 g.fillStyle="#7a1a2e";
 for(let y=0;y<H;y+=18){g.fillRect(6,y,5,14);g.fillRect(W-11,y,5,14);}
 /* valance */
 g.fillStyle="#a3273f"; g.fillRect(0,0,W,18);
 g.beginPath();
 for(let x=0;x<=W;x+=40){g.moveTo(x,18);g.quadraticCurveTo(x+20,34,x+40,18);}
 g.fill();
 g.fillStyle="#ffd76a"; g.fillRect(0,16,W,3);
 /* front-row audience silhouettes; they bounce and wave when she nails it */
 const cheer=now<(scene.cheerUntil||0);
 for(let i=0;i<12;i++){
  const ax=28+i*38.5, bob=Math.abs(Math.sin(ts/(cheer?110:450)+i*1.3))*(cheer?8:2);
  g.fillStyle=["#2a1a4a","#3a2255","#1d1338"][i%3];
  g.beginPath(); g.arc(ax,H+3-bob,12,Math.PI,0); g.fill();
  if(cheer&&i%2===0){g.fillRect(ax-13,H-16-bob,3,8);g.fillRect(ax+10,H-16-bob,3,8);}
 }
 /* footlights */
 for(let x=40;x<W-20;x+=44){
  const fl=g.createRadialGradient(x,H-4,1,x,H-4,10);
  fl.addColorStop(0,"rgba(255,235,150,0.95)"); fl.addColorStop(1,"rgba(255,235,150,0)");
  g.fillStyle=fl; g.beginPath(); g.arc(x,H-4,10,0,7); g.fill();
 }
}
function loop(ts){if(!running)return;drawStage(ts);rafId=requestAnimationFrame(loop);}
function startLoop(){if(running)return;running=true;lastTs=performance.now();rafId=requestAnimationFrame(loop);}
function stopLoop(){running=false;if(rafId)cancelAnimationFrame(rafId);}

/* ================= SCREENS ================= */
function show(id){
 document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
 $(id).classList.add("active");
 if(id!=="level"){stopLoop();stopWaltz();$("celebrate").classList.remove("show");}
 if(id==="program")renderProgram();
}
function toast(txt){
 const t=$("toast"); t.textContent=txt; t.classList.add("show");
 clearTimeout(toast._tm); toast._tm=setTimeout(()=>t.classList.remove("show"),2200);
}
function praise(){
 const p=$("praise"); p.textContent=PRAISE[rnd(PRAISE.length)];
 p.classList.add("show");
 clearTimeout(praise._tm); praise._tm=setTimeout(()=>p.classList.remove("show"),1100);
}
function confetti(){
 const colors=["#ff6fa5","#ffd76a","#7ae0c3","#9db4f0","#fff"];
 for(let i=0;i<60;i++){
  const d=document.createElement("div"); d.className="confetti";
  d.style.left=Math.random()*100+"vw";
  d.style.background=colors[rnd(colors.length)];
  d.style.animationDuration=(1.6+Math.random()*1.6)+"s";
  d.style.animationDelay=(Math.random()*0.6)+"s";
  document.body.appendChild(d);
  setTimeout(()=>d.remove(),3800);
 }
}
function updatePills(){
 const total=Object.values(S.stars).reduce((a,b)=>a+b,0);
 $("roseCount").textContent="🌹 "+S.roses;
 $("starCount").textContent="⭐ "+total;
 $("roseCount2").textContent="🌹 "+S.roses;
 const m=S.muted?"🔇":"🔊";
 $("btnMute").textContent=m; $("btnMute2").textContent=m;
}

/* ================= PROGRAM (map) ================= */
function renderProgram(){
 updatePills();
 const wrap=$("acts"); wrap.innerHTML="";
 ACTS.forEach((act,a)=>{
  const div=document.createElement("div"); div.className="act";
  const firstIdx=a*PER_ACT;
  if(firstIdx>S.progress)div.classList.add("locked");
  div.innerHTML=`<h3>Act ${a+1} · ${act.icon} ${act.name}</h3>`;
  const row=document.createElement("div"); row.className="scene-row";
  SLOTS.forEach((kind,s)=>{
   const i=firstIdx+s;
   const b=document.createElement("button"); b.className="scene-btn";
   const stars=S.stars[i]||0;
   b.innerHTML=`<span class="ic">${SLOT_ICON[kind]}</span><span>${SLOT_NAME[kind].split(" ")[0]}</span><span class="mini-stars">${"⭐".repeat(stars)}</span>`;
   if(i<S.progress)b.classList.add("done");
   if(i===S.progress)b.classList.add("now");
   if(i>S.progress)b.classList.add("lockd");
   b.onclick=()=>{actx();startScene(i);};
   row.appendChild(b);
  });
  div.appendChild(row); wrap.appendChild(div);
 });
 /* closet */
 const cr=$("closetRow"); cr.innerHTML="";
 Object.keys(COSTUMES).forEach(k=>{
  const b=document.createElement("button"); b.className="costume-btn";
  const owned=S.closet.includes(k);
  if(!owned)b.classList.add("lockd");
  if(k===S.costume)b.classList.add("worn");
  const cv=document.createElement("canvas"); cv.width=18*3; cv.height=16*3+6;
  drawBallerina(cv.getContext("2d"),cv.width/2,cv.height-2,3,"stand",1,k);
  b.appendChild(cv);
  const lb=document.createElement("span");
  if(owned)lb.textContent=COSTUMES[k].name;
  else if(COSTUMES[k].roses)lb.textContent=`🔒 🌹×${COSTUMES[k].roses}`;
  else{const src=ACTS.find(a=>a.costume===k);lb.textContent="🔒 "+(src?src.icon:"");}
  b.appendChild(lb);
  b.onclick=()=>{S.costume=k;save();renderProgram();sndStep(2);};
  cr.appendChild(b);
 });
 /* recital badges — one per act, like gym badges */
 const br=$("badgeRow"); br.innerHTML="";
 ACTS.forEach((act,a)=>{
  const fin=a*PER_ACT+PER_ACT-1;
  const got=fin<S.progress||!!S.stars[fin];
  const sp=document.createElement("span");
  sp.className="badge "+(got?"got":"miss");
  sp.textContent=got?act.icon:"❔";
  sp.title=act.name;
  br.appendChild(sp);
 });
}

/* ================= LEVEL FLOW ================= */
function startScene(i){
 if(i>S.progress)return;
 const a=Math.floor(i/PER_ACT);
 if(!S.actSeen)S.actSeen={};
 if(!S.actSeen[a]){
  S.actSeen[a]=1; save();
  showStory([{title:`Act ${a+1} · ${ACTS[a].icon} ${ACTS[a].name}`,pose:"fifth",twirl:true,text:ACTS[a].story}],()=>reallyStartScene(i));
  return;
 }
 reallyStartScene(i);
}
function reallyStartScene(i){
 sceneIndex=i;
 const act=ACTS[Math.floor(i/PER_ACT)], slot=i%PER_ACT, kind=SLOTS[slot];
 scene={kind,act,slot,particles:[],pose:"stand",poseUntil:0,twirlUntil:0,firstTries:[],hx:null,hxT:null,cheerUntil:0};
 $("levelTitle").textContent=`${act.icon} ${SLOT_NAME[kind]}`;
 $("celebrate").classList.remove("show");
 show("level"); updatePills();
 if(kind==="spell")setupSpell();
 else if(kind==="math")setupMath();
 else if(kind==="rhyme")setupRhyme();
 else setupFinale();
 startLoop(); startWaltz();
}
function renderProgress(){
 const row=$("progressRow"); row.innerHTML="";
 for(let i=0;i<scene.total;i++){
  const s=document.createElement("span");
  s.className="p-dot"+(i<scene.i?" won":i===scene.i?" cur":"");
  s.textContent=scene.kind==="math"?"🌟":scene.kind==="rhyme"?"🎶":"🌹";
  row.appendChild(s);
 }
}
/* The Mario moment: after the last answer Ruby runs to the goal star,
   grabs it in a burst of sparkles and takes a bow — THEN the card appears. */
function goalMoment(){
 if(!scene)return;
 $("prompt").innerHTML="";
 $("inputArea").innerHTML="";
 scene.hxT=404;
 scene.cheerUntil=performance.now()+2600;
 setTimeout(()=>{
  if(!scene)return;
  scene.starGone=true;
  spawnSparkles(30,414,150); spawnRoses(4);
  sndStar(); setPose("bow",1400);
 },750);
 setTimeout(()=>{if(scene)finishScene();},1800);
}
function finishScene(){
 stopWaltz();
 const tries=scene.firstTries;
 let stars=3;
 if(scene.kind!=="finale"&&tries.length){
  const rate=tries.reduce((a,b)=>a+b,0)/tries.length;
  stars=rate>=0.85?3:rate>=0.55?2:1;
 }
 const prev=S.stars[sceneIndex]||0;
 S.stars[sceneIndex]=Math.max(prev,stars);
 let costumeMsg="", champion=false;
 if(sceneIndex===S.progress){
  S.progress=Math.min(TOTAL,S.progress+1);
  if(scene.kind==="finale"){
   const c=scene.act.costume;
   if(!S.closet.includes(c)){S.closet.push(c);costumeMsg=c;}
   champion=S.progress>=TOTAL; /* she just finished the Starlight Gala! */
  }
 }
 save(); updatePills(); sndFanfare(); sndApplause(champion?2.8:1.6); confetti();
 /* celebrate overlay */
 $("celeStars").innerHTML="⭐".repeat(stars).split("").map(s=>`<span>${s}</span>`).join("");
 $("celeTitle").textContent=scene.kind==="finale"?`${HERO} takes a bow! ${scene.act.icon}`:PRAISE[rnd(PRAISE.length)];
 $("celeMsg").textContent=scene.kind==="finale"
   ?`The crowd adores ${HERO}! All that practice made ${scene.act.name} shine!`
   :`Your practice made ${HERO} ${scene.kind==="spell"?"dance beautifully":scene.kind==="rhyme"?"sing like a songbird":"leap sky-high"}! 🌹 ${S.roses}`;
 const cc=$("celeCostume"); cc.innerHTML="";
 if(costumeMsg){
  const c=COSTUMES[costumeMsg];
  setTimeout(sndItemGet,900); /* item get! */
  const dv=document.createElement("div"); dv.className="cst";
  const cv=document.createElement("canvas"); cv.width=18*3; cv.height=16*3+6;
  drawBallerina(cv.getContext("2d"),cv.width/2,cv.height-2,3,"fifth",1,costumeMsg);
  dv.appendChild(cv);
  const lb=document.createElement("span"); lb.textContent=`New costume: ${c.name}!`;
  dv.appendChild(lb); cc.appendChild(dv);
  S.costume=costumeMsg; save();
  speak(`You earned a new costume! ${c.name}!`);
 }
 $("btnNext").style.display=S.progress<TOTAL?"":"none";
 if(champion){
  /* THE dream-come-true ending: fireworks of confetti + a storybook finish */
  $("celeTitle").textContent="👑 PRIMA BALLERINA! 👑";
  $("celeMsg").textContent=`Ruby's big dream came true — because YOU practiced with her, every step of the way! 🌹 ${S.roses}`;
  setTimeout(confetti,900); setTimeout(confetti,1800);
  setTimeout(()=>{
   showStory([
    {title:"👑 Prima Ballerina!",pose:"leap",text:"She did it! Ruby danced the whole Starlight Gala, and the crowd cheered louder than thunder!"},
    {title:"A dream come true ⭐",pose:"fifth",twirl:true,text:"Every word you spelled and every number you counted became one of Ruby's dance steps. Big dreams take practice — and you practiced! Keep dancing in the studio, and collect every costume!"},
   ],()=>{sndItemGet();confetti();$("celebrate").classList.add("show");});
  },1200);
 }else $("celebrate").classList.add("show");
}

/* ================= SPELLING ================= */
let peekTimer=null;
function setupSpell(){
 const st=spellStage(S.spell);
 scene.mode=st.mode;
 scene.items=shuffle(WORD_BANK[st.tier]).slice(0,WORDS_PER_SCENE);
 scene.i=0; scene.total=scene.items.length;
 buildKeyboard();
 nextWord();
}
function buildKeyboard(){
 const area=$("inputArea"); area.innerHTML="";
 ["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"].forEach(rw=>{
  const row=document.createElement("div"); row.className="kb-row";
  rw.split("").forEach(ch=>{
   const k=document.createElement("button"); k.className="kb-key"; k.textContent=ch;
   k.dataset.ch=ch;
   k.onclick=()=>{actx();handleSpellKey(ch);};
   row.appendChild(k);
  });
  area.appendChild(row);
 });
}
function nextWord(){
 clearTimeout(peekTimer);
 const [word,emoji]=scene.items[scene.i];
 scene.word=word; scene.emoji=emoji; scene.typed=0; scene.misses=0; scene.firstTry=true;
 renderProgress();
 const pr=$("prompt");
 pr.innerHTML=`<div class="spell-row"><span class="big-emoji">${emoji}</span><div class="slots" id="slots"></div></div>
   <div class="help-row">
     <button class="hear-btn" id="btnHear">🔊 Hear it</button>
     <button class="hear-btn" id="btnPeek">👀 Peek</button>
   </div>`;
 const slots=$("slots");
 word.split("").forEach(()=>{
  const s=document.createElement("div"); s.className="slot";
  s.innerHTML=`<span class="ghost"></span>`;
  slots.appendChild(s);
 });
 /* "peek": flash the word, then she spells it from memory. "hidden": picture + voice only. */
 if(scene.mode==="peek"){
  [...slots.children].forEach((s,j)=>s.querySelector(".ghost").textContent=word[j]);
  peekTimer=setTimeout(()=>{
   [...slots.children].forEach((s,j)=>{if(j>=scene.typed)s.querySelector(".ghost").textContent="";});
  },2600);
 }
 $("btnHear").onclick=()=>speak(word.toLowerCase());
 $("btnPeek").onclick=()=>{actx();peekWord();};
 speak(word.toLowerCase());
}
/* NO automatic hints — the game adapts instead (a missed word eases the skill
   down right away). Her self-serve helpers are the 🔊 and 👀 buttons; peeking
   counts like a miss so stars and the adaptive tracks stay honest. */
function peekWord(){
 if(!scene||scene.kind!=="spell"||!scene.word)return;
 scene.firstTry=false;
 const slots=$("slots"); if(!slots)return;
 [...slots.children].forEach((s,j)=>{const g=s.querySelector(".ghost");if(g)g.textContent=scene.word[j];});
 clearTimeout(peekTimer);
 peekTimer=setTimeout(()=>{
  const sl=$("slots"); if(!sl||!scene||scene.kind!=="spell")return;
  [...sl.children].forEach((s,j)=>{const g=s.querySelector(".ghost");if(g&&j>=scene.typed)g.textContent="";});
 },1400);
}
function handleSpellKey(ch){
 if(!scene||scene.kind!=="spell"||!scene.word)return;
 if(scene.typed>=scene.word.length)return; /* happy keys during the win pause aren't misses */
 if($("celebrate").classList.contains("show"))return;
 ch=ch.toUpperCase();
 const expect=scene.word[scene.typed];
 if(ch===expect){
  const slot=$("slots").children[scene.typed];
  slot.innerHTML=expect; slot.classList.add("fill");
  sndStep(scene.typed);
  setPose(["plie","fifth","arabesque"][scene.typed%3],650);
  scene.typed++;
  if(scene.typed>=scene.word.length)wordDone();
 }else{
  scene.firstTry=false; scene.misses++;
  $("slots").classList.remove("wiggle"); void $("slots").offsetWidth;
  $("slots").classList.add("wiggle");
  sndOops();
 }
}
function wordDone(){
 scene.firstTries.push(scene.firstTry?1:0);
 bumpSkill("spell",scene.firstTry);
 gainRoses(1);
 praise(); sndWord(); doTwirl(900);
 spawnSparkles(14,scene.hx||stage.width/2,150);
 spawnRoses(2);
 scene.cheerUntil=performance.now()+1300;
 scene.i++;
 scene.hxT=90+(scene.i/scene.total)*310;
 renderProgress();
 setTimeout(()=>{
  if(!scene||scene.kind!=="spell")return;
  if(scene.i>=scene.total)goalMoment(); else nextWord();
 },1100);
}

/* ================= MATH ================= */
function setupMath(){
 scene.i=0; scene.total=PROBS_PER_SCENE;
 buildPad();
 nextProb();
}
function buildPad(){
 const area=$("inputArea"); area.innerHTML="";
 const pad=document.createElement("div"); pad.className="pad";
 [1,2,3,4,5,6,7,8,9,"⌫",0,"✓"].forEach(k=>{
  const b=document.createElement("button"); b.className="pad-key"; b.textContent=k;
  b.dataset.k=k;
  b.onclick=()=>{actx();
   if(k==="⌫")mathErase();
   else if(k==="✓")mathSubmit();
   else handleDigit(String(k));
  };
  pad.appendChild(b);
 });
 area.appendChild(pad);
}
function genProb(){
 const st=mathStage(S.math);
 const e=MATH_EMOJI[rnd(MATH_EMOJI.length)];
 if(st.kind==="add"){
  const a=1+rnd(st.max-1), b=1+rnd(st.max-a);
  return{kind:"add",e,a,b,ans:a+b,visual:st.visual};
 }
 if(st.kind==="sub"){
  const tot=2+rnd(st.max-1), take=1+rnd(tot-1);
  return{kind:"sub",e,tot,take,ans:tot-take,visual:st.visual};
 }
 /* missing: a + ▢ = c */
 const c=3+rnd(st.max-2), a=1+rnd(c-1);
 return{kind:"missing",e,a,c,ans:c-a,visual:st.visual};
}
function missingSlotsHtml(p){
 let h=`<span class="m-slots">`;
 for(let i=0;i<p.c;i++)h+=`<span class="m-slot${i<p.a?" has":""}">${i<p.a?p.e:""}</span>`;
 return h+`</span>`;
}
function emojiGrid(e,n,goneFrom){
 let h=`<span class="m-grid">`;
 for(let i=0;i<n;i++)h+=`<span class="m-it${goneFrom!=null&&i>=goneFrom?" gone":""}">${e}</span>`;
 return h+`</span>`;
}
function nextProb(){
 const p=scene.prob=genProb();
 scene.ansStr=""; scene.misses=0; scene.firstTry=true;
 renderProgress();
 const pr=$("prompt");
 let html="",eq="";
 if(p.kind==="add"){
  if(p.visual)html=`<div class="m-row">${emojiGrid(p.e,p.a)}<span class="m-op">+</span>${emojiGrid(p.e,p.b)}</div>`;
  eq=`${p.a} + ${p.b} = ?`;
 }else if(p.kind==="sub"){
  if(p.visual)html=`<div class="m-row">${emojiGrid(p.e,p.tot,p.tot-p.take)}</div>`;
  eq=`${p.tot} − ${p.take} = ?`;
 }else{
  if(p.visual)html=`<div class="m-row">${missingSlotsHtml(p)}</div>`;
  eq=`${p.a} + ▢ = ${p.c}`;
 }
 pr.innerHTML=`${html}<div class="m-row"><span class="m-eq">${eq}</span><span class="m-ans" id="mAns">?</span></div>`;
}
function renderAns(){const a=$("mAns");if(a)a.textContent=scene.ansStr||"?";}
function handleDigit(d){
 if(!scene||scene.kind!=="math"||!scene.prob)return;
 if($("celebrate").classList.contains("show"))return;
 if(scene.ansStr.length>=2)return;
 scene.ansStr+=d; renderAns(); sndStep(Number(d));
 const need=String(scene.prob.ans).length;
 if(scene.ansStr.length>=need)mathSubmit();
}
function mathErase(){if(!scene||!scene.prob)return;scene.ansStr=scene.ansStr.slice(0,-1);renderAns();}
function mathSubmit(){
 if(!scene||scene.kind!=="math"||!scene.prob||!scene.ansStr)return;
 const val=Number(scene.ansStr);
 if(val===scene.prob.ans){
  const a=$("mAns"); a.classList.add("fill"); a.textContent=scene.prob.ans;
  scene.firstTries.push(scene.firstTry?1:0);
  bumpSkill("math",scene.firstTry);
  gainRoses(1);
  praise(); sndStar(); setPose("leap",700);
  spawnSparkles(12,scene.hx||stage.width/2,150);
  spawnRoses(2);
  scene.cheerUntil=performance.now()+1300;
  scene.i++;
  scene.hxT=90+(scene.i/scene.total)*310;
  renderProgress();
  scene.prob=null;
  setTimeout(()=>{
   if(!scene||scene.kind!=="math")return;
   if(scene.i>=scene.total)goalMoment(); else nextProb();
  },1000);
 }else{
  scene.firstTry=false; scene.misses++;
  const a=$("mAns");
  a.classList.remove("wiggle"); void a.offsetWidth; a.classList.add("wiggle");
  sndOops();
  scene.ansStr=""; setTimeout(renderAns,350);
  if(!scene.prob.visual)showCountHelp();
 }
}
/* NO automatic answer hints (no badges, no glowing pad keys). For
   numerals-only problems a miss reveals the emoji objects — a manipulative
   to count on. The counting stays hers; misses ease the skill instead. */
function showCountHelp(){
 const p=scene.prob; if(!p)return;
 if(document.querySelector("#prompt .m-it,#prompt .m-slot"))return;
 const d=document.createElement("div"); d.className="m-row";
 if(p.kind==="add")d.innerHTML=emojiGrid(p.e,p.a)+`<span class="m-op">+</span>`+emojiGrid(p.e,p.b);
 else if(p.kind==="sub")d.innerHTML=emojiGrid(p.e,p.tot,p.tot-p.take);
 else d.innerHTML=missingSlotsHtml(p);
 $("prompt").insertBefore(d,$("prompt").firstChild);
}

/* ================= RHYME TIME (bonus) ================= */
function setupRhyme(){
 scene.total=5; scene.i=0;
 $("inputArea").innerHTML=`<div class="rhyme-tip">Tap the word that rhymes — or press 1, 2, 3!</div>`;
 nextRhyme();
}
function nextRhyme(){
 renderProgress();
 const fi=rnd(RHYMES.length), fam=shuffle(RHYMES[fi]);
 const target=fam[0], correct=fam[1];
 const others=[];
 while(others.length<2){
  const oi=rnd(RHYMES.length); if(oi===fi)continue;
  const w=RHYMES[oi][rnd(RHYMES[oi].length)];
  if(!others.some(o=>o[0]===w[0]))others.push(w);
 }
 const choices=shuffle([correct,...others]);
 scene.rhyme={target,correct}; scene.firstTry=true;
 $("prompt").innerHTML=`<div class="rhyme-q">What rhymes with <b>${target[0]}</b>? <span class="rq-emoji">${target[1]}</span></div>
  <div class="rhyme-row">${choices.map((c,i)=>`<button class="rhyme-card" data-w="${c[0]}">
    <span class="rc-num">${i+1}</span><span class="rc-emoji">${c[1]}</span><span class="rc-word">${c[0]}</span></button>`).join("")}</div>`;
 [...document.querySelectorAll(".rhyme-card")].forEach(b=>b.onclick=()=>{actx();pickRhyme(b);});
 speak(`Which one rhymes with ${target[0].toLowerCase()}? ${choices.map(c=>c[0].toLowerCase()).join(", ")}?`);
}
function pickRhyme(btn){
 if(!scene||scene.kind!=="rhyme"||!scene.rhyme)return;
 if($("celebrate").classList.contains("show")||btn.classList.contains("dim"))return;
 if(btn.dataset.w===scene.rhyme.correct[0]){
  btn.classList.add("win");
  const r=scene.rhyme; scene.rhyme=null;
  scene.firstTries.push(scene.firstTry?1:0);
  bumpSkill("spell",scene.firstTry); /* rhymes feed the word track */
  gainRoses(1);
  praise(); sndWord(); doTwirl(900);
  spawnSparkles(14,scene.hx||240,150); spawnRoses(2);
  scene.cheerUntil=performance.now()+1300;
  scene.i++; scene.hxT=90+(scene.i/scene.total)*310;
  speak(`${r.target[0].toLowerCase()} rhymes with ${r.correct[0].toLowerCase()}!`);
  setTimeout(()=>{
   if(!scene||scene.kind!=="rhyme")return;
   if(scene.i>=scene.total)goalMoment(); else nextRhyme();
  },1300);
 }else{
  scene.firstTry=false;
  btn.classList.add("dim");
  btn.classList.remove("wiggle"); void btn.offsetWidth; btn.classList.add("wiggle");
  sndOops();
 }
}

/* ================= DANCE STUDIO (free play) ================= */
const STUDIO_MOVES=[["T","TWIRL"],["L","LEAP"],["P","PLIÉ"],["A","ARABESQUE"],["B","BOW"],["S","SPARKLE"],["R","ROSES"]];
function startStudio(){
 sceneIndex=-1;
 scene={kind:"studio",act:ACTS[rnd(ACTS.length)],particles:[],pose:"stand",poseUntil:0,twirlUntil:0,firstTries:[],hx:null,hxT:null,cheerUntil:0,total:0,i:0};
 $("levelTitle").textContent="💃 Dance Studio";
 $("celebrate").classList.remove("show");
 show("level"); updatePills();
 $("progressRow").innerHTML="";
 $("prompt").innerHTML=`<div class="fin-word">Free play! Make ${HERO} dance — arrows move her around!</div>`;
 const area=$("inputArea"); area.innerHTML="";
 const row=document.createElement("div"); row.className="kb-row studio-row";
 STUDIO_MOVES.forEach(([k,w])=>{
  const b=document.createElement("button"); b.className="move-btn";
  b.innerHTML=`<b>${k}</b><span>${w}</span>`;
  b.onclick=()=>{actx();studioMove(k);};
  row.appendChild(b);
 });
 area.appendChild(row);
 startLoop(); startWaltz();
}
function studioMove(k){
 if(!scene||scene.kind!=="studio")return;
 const m=STUDIO_MOVES.find(x=>x[0]===k); if(!m)return;
 const w=m[1];
 scene.cheerUntil=performance.now()+1200;
 if(w==="TWIRL")doTwirl(1000);
 else if(w==="LEAP")setPose("leap",800);
 else if(w==="PLIÉ")setPose("plie",800);
 else if(w==="ARABESQUE")setPose("arabesque",900);
 else if(w==="BOW")setPose("bow",900);
 else if(w==="SPARKLE")spawnSparkles(22,scene.hx||240,150);
 else if(w==="ROSES")spawnRoses(10);
 if(w!=="SPARKLE"&&w!=="ROSES")spawnSparkles(8,scene.hx||240,150);
 sndStep(rnd(5));
}

/* ================= FINALE ================= */
/* A real routine, not four fixed presses: shuffled moves, one more per act
   (Act 1 = 4 … Gala = 8), always ending with a BOW. The crowd cheers louder
   and the sparkles grow with every move — an escalating boss celebration. */
const FIN_POOL=[["T","TWIRL"],["L","LEAP"],["P","PLIÉ"],["A","ARABESQUE"],["S","SPARKLE"]];
function setupFinale(){
 const a=Math.floor(sceneIndex/PER_ACT);
 let seq=shuffle(FIN_POOL);
 while(seq.length<3+a)seq=seq.concat(shuffle(FIN_POOL));
 seq=seq.slice(0,3+a);
 for(let i=1;i<seq.length;i++)if(seq[i][0]===seq[i-1][0]) /* no move twice in a row */
  for(let j=i+1;j<seq.length;j++)if(seq[j][0]!==seq[i-1][0]){[seq[i],seq[j]]=[seq[j],seq[i]];break;}
 seq.push(["B","BOW"]); /* every routine ends with a bow */
 scene.finSeq=seq; scene.mi=0; scene.total=seq.length; scene.i=0;
 $("inputArea").innerHTML="";
 renderProgress();
 nextMove();
}
function nextMove(){
 const [k,w]=scene.finSeq[scene.mi];
 $("prompt").innerHTML=`<div class="fin-card">
   <div class="fin-word">Press the key to ${w}!</div>
   <div class="fin-key">${k}</div></div>`;
 document.querySelector(".fin-key").onclick=()=>{actx();handleFinaleKey(k);};
 speak(w==="PLIÉ"?"plee-ay":w.toLowerCase());
}
function handleFinaleKey(ch){
 if($("celebrate").classList.contains("show"))return;
 if(!scene.finSeq||scene.mi>=scene.finSeq.length)return;
 const [k,w]=scene.finSeq[scene.mi];
 if(ch.toUpperCase()!==k){
  /* gentle nudge — the key card wiggles so she knows to look at it */
  const el=document.querySelector(".fin-key");
  if(el){el.classList.remove("wiggle");void el.offsetWidth;el.classList.add("wiggle");}
  sndOops(); return;
 }
 sndWord(); praise();
 scene.cheerUntil=performance.now()+1300+scene.mi*250;
 if(w==="TWIRL")doTwirl(1100);
 else if(w==="LEAP")setPose("leap",800);
 else if(w==="PLIÉ")setPose("plie",800);
 else if(w==="ARABESQUE")setPose("arabesque",900);
 else if(w==="SPARKLE")doTwirl(700);
 else setPose("bow",1000);
 spawnSparkles(12+scene.mi*4,stage.width/2,150);
 if(w==="SPARKLE")spawnSparkles(20,stage.width/2,150);
 scene.mi++; scene.i++; renderProgress();
 if(scene.mi>=scene.finSeq.length){
  $("prompt").innerHTML=`<div class="fin-card"><div class="fin-word">🌹 The crowd throws roses! 🌹</div></div>`;
  spawnRoses(26); gainRoses(5);
  sndApplause(2.4);
  scene.cheerUntil=performance.now()+2600;
  setTimeout(()=>{if(scene&&scene.kind==="finale")finishScene();},2600);
 }else setTimeout(nextMove,900);
}

/* ================= STORY OVERLAY ================= */
let storyState=null;
const sCanvas=$("storyCanvas"), sg=sCanvas.getContext("2d");
function showStory(slides,done){
 storyState={slides,i:0,done};
 renderSlide();
 $("story").classList.add("show");
 requestAnimationFrame(storyLoop);
}
function renderSlide(){
 const sl=storyState.slides[storyState.i];
 $("storyTitle").textContent=sl.title;
 $("storyText").textContent=sl.text;
 $("storyBtn").textContent=storyState.i>=storyState.slides.length-1?"🩰 Let's dance!":"Next ▶";
}
function storyLoop(ts){
 if(!storyState)return;
 const W=sCanvas.width,H=sCanvas.height,sl=storyState.slides[storyState.i];
 const bg=sg.createLinearGradient(0,0,0,H);
 bg.addColorStop(0,"#2b1d5e"); bg.addColorStop(1,"#4a2a80");
 sg.fillStyle=bg; sg.fillRect(0,0,W,H);
 for(let i=0;i<12;i++){
  sg.globalAlpha=0.35+0.65*Math.abs(Math.sin(ts/550+i*1.7));
  sg.fillStyle="#ffd76a"; sg.fillRect((i*53)%W,(i*29)%(H-34),2,2);
 }
 sg.globalAlpha=1;
 sg.fillStyle="#3a2a6e"; sg.fillRect(0,H-18,W,18);
 const spot=sg.createRadialGradient(W/2,H-34,4,W/2,H-34,58);
 spot.addColorStop(0,"rgba(255,255,230,0.32)"); spot.addColorStop(1,"rgba(255,255,230,0)");
 sg.fillStyle=spot; sg.fillRect(0,0,W,H);
 let sx=1;
 if(sl.twirl){sx=Math.cos(ts/280);if(Math.abs(sx)<0.15)sx=0.15*Math.sign(sx||1);}
 const bob=Math.sin(ts/450)*1.5;
 drawBallerina(sg,W/2,H-18+bob,4,sl.pose||"stand",sx,S.costume);
 requestAnimationFrame(storyLoop);
}
$("storyBtn").onclick=()=>{
 actx(); sndStep(storyState.i);
 if(storyState.i<storyState.slides.length-1){storyState.i++;renderSlide();return;}
 $("story").classList.remove("show");
 const done=storyState.done; storyState=null;
 if(done)done();
};

/* ================= TITLE ANIMATION ================= */
const tCanvas=$("titleCanvas"), tg=tCanvas.getContext("2d");
function titleLoop(ts){
 if(!$("title").classList.contains("active"))return;
 const W=tCanvas.width,H=tCanvas.height;
 const sky=tg.createLinearGradient(0,0,0,H);
 sky.addColorStop(0,"#2b1d5e"); sky.addColorStop(1,"#4a2a80");
 tg.fillStyle=sky; tg.fillRect(0,0,W,H);
 for(let i=0;i<16;i++){
  const x=(i*67)%W, y=(i*41)%(H-40);
  tg.globalAlpha=0.4+0.6*Math.abs(Math.sin(ts/600+i));
  tg.fillStyle="#ffd76a"; tg.fillRect(x,y,2,2);
 }
 tg.globalAlpha=1;
 tg.fillStyle="#3a2a6e"; tg.fillRect(0,H-24,W,24);
 const spot=tg.createRadialGradient(W/2,H-40,5,W/2,H-40,70);
 spot.addColorStop(0,"rgba(255,255,230,0.3)"); spot.addColorStop(1,"rgba(255,255,230,0)");
 tg.fillStyle=spot; tg.fillRect(0,0,W,H);
 let sx=Math.cos(ts/300); if(Math.abs(sx)<0.15)sx=0.15*Math.sign(sx||1);
 drawBallerina(tg,W/2,H-24,4,"fifth",sx,S.costume);
 requestAnimationFrame(titleLoop);
}

/* ================= INPUT ================= */
document.addEventListener("keydown",e=>{
 if(e.metaKey||e.ctrlKey||e.altKey)return;
 const k=e.key;
 if($("story").classList.contains("show")){
  if(k==="Enter"||k===" "){e.preventDefault();$("storyBtn").click();}
  return;
 }
 if($("level").classList.contains("active")){
  if($("celebrate").classList.contains("show")){
   if(k==="Enter"&&S.progress<TOTAL){e.preventDefault();startScene(S.progress);}
   return;
  }
  if(k==="Escape"){show("program");return;}
  if(!scene)return;
  if(scene.kind==="spell"&&/^[a-zA-Z]$/.test(k)){e.preventDefault();actx();handleSpellKey(k);}
  else if(scene.kind==="math"){
   if(/^[0-9]$/.test(k)){e.preventDefault();actx();handleDigit(k);}
   else if(k==="Backspace"){e.preventDefault();mathErase();}
   else if(k==="Enter"){e.preventDefault();mathSubmit();}
  }
  else if(scene.kind==="rhyme"&&/^[1-3]$/.test(k)){
   e.preventDefault();actx();
   const c=[...document.querySelectorAll(".rhyme-card")][+k-1];
   if(c)pickRhyme(c);
  }
  else if(scene.kind==="studio"){
   if(/^[a-zA-Z]$/.test(k)){e.preventDefault();actx();studioMove(k.toUpperCase());}
   else if(k==="ArrowLeft"){e.preventDefault();scene.hxT=Math.max(60,(scene.hxT==null?240:scene.hxT)-34);}
   else if(k==="ArrowRight"){e.preventDefault();scene.hxT=Math.min(420,(scene.hxT==null?240:scene.hxT)+34);}
  }
  else if(scene.kind==="finale"&&/^[a-zA-Z]$/.test(k)){e.preventDefault();actx();handleFinaleKey(k);}
 }else if($("program").classList.contains("active")){
  if(k==="Enter"||k===" "){e.preventDefault();actx();if(S.progress<TOTAL)startScene(S.progress);}
 }else if($("title").classList.contains("active")){
  if(k==="Enter"||k===" "){e.preventDefault();actx();show("program");}
 }
});

/* ================= INIT ================= */
$("btnPlay").onclick=()=>{
 actx(); sndFanfare();
 if(!S.seenIntro){showStory(STORY_INTRO,()=>{S.seenIntro=true;save();show("program");});show("program");}
 else show("program");
};
$("btnStory").onclick=()=>{actx();showStory(STORY_INTRO,null);};
$("btnStudio").onclick=()=>{actx();startStudio();};
$("btnBack").onclick=()=>show("program");
$("btnNext").onclick=()=>{if(S.progress<TOTAL)startScene(S.progress);else show("program");};
$("btnProgram").onclick=()=>show("program");
function toggleMute(){S.muted=!S.muted;save();updatePills();if(S.muted){stopWaltz();try{speechSynthesis.cancel();}catch(e){}}else if($("level").classList.contains("active"))startWaltz();}
$("btnMute").onclick=toggleMute;
$("btnMute2").onclick=toggleMute;

load(); updatePills();
if(window.speechSynthesis)speechSynthesis.getVoices(); /* warm the voice list */
requestAnimationFrame(titleLoop);
})();
