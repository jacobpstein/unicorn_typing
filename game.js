(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp = (a,b,t)=>a+(b-a)*t;

  /* ===================== DATA ===================== */
  const LETTER_INFO = {
    A:["Apple","🍎"],B:["Ballet","🩰"],C:["Coney Island","🎡"],D:["Dance","💃"],E:["Egg","🥚"],
    F:["Fruit","🍓"],G:["Grapes","🍇"],H:["Hot dog","🌭"],I:["Ice cream","🍦"],J:["Juice","🧃"],
    K:["Kiwi","🥝"],L:["Lemon","🍋"],M:["Mango","🥭"],N:["Night","🌙"],O:["Ocean","🌊"],P:["Pear","🍐"],
    Q:["Queen","👑"],R:["Rainbow","🌈"],S:["Sun","☀️"],T:["Tutu","🩰"],U:["Unicorn","🦄"],V:["Violet","💜"],
    W:["Wave","🌊"],X:["Sparkle","✨"],Y:["Yummy","😋"],Z:["Zoom","🎢"]
  };
  const LETTER_WAVES = [["F","J"],["D","K","S","L","A","G","H"],["R","U","E","I","T","O","P","W","Y","Q"],["V","N","M","C","B","X","Z"]];
  const KEY_FINGER = {
    Q:{h:"L",f:"pinky"},W:{h:"L",f:"ring"},E:{h:"L",f:"middle"},R:{h:"L",f:"index"},T:{h:"L",f:"index"},
    Y:{h:"R",f:"index"},U:{h:"R",f:"index"},I:{h:"R",f:"middle"},O:{h:"R",f:"ring"},P:{h:"R",f:"pinky"},
    A:{h:"L",f:"pinky"},S:{h:"L",f:"ring"},D:{h:"L",f:"middle"},F:{h:"L",f:"index"},G:{h:"L",f:"index"},
    H:{h:"R",f:"index"},J:{h:"R",f:"index"},K:{h:"R",f:"middle"},L:{h:"R",f:"ring"},
    Z:{h:"L",f:"pinky"},X:{h:"L",f:"ring"},C:{h:"L",f:"middle"},V:{h:"L",f:"index"},B:{h:"L",f:"index"},
    N:{h:"R",f:"index"},M:{h:"R",f:"index"},
    "1":{h:"L",f:"pinky"},"2":{h:"L",f:"ring"},"3":{h:"L",f:"middle"},"4":{h:"L",f:"index"},"5":{h:"L",f:"index"},
    "6":{h:"R",f:"index"},"7":{h:"R",f:"index"},"8":{h:"R",f:"middle"},"9":{h:"R",f:"ring"},"0":{h:"R",f:"pinky"},
    ",":{h:"R",f:"middle"},".":{h:"R",f:"ring"},"/":{h:"R",f:"pinky"}
  };
  const FINGER_NAME={index:"pointer",middle:"middle",ring:"ring",pinky:"pinky",thumb:"thumb"};
  const FINGER_COLOR={index:"var(--f-index)",middle:"var(--f-middle)",ring:"var(--f-ring)",pinky:"var(--f-pinky)",thumb:"var(--f-thumb)"};
  const SHIFT_MAP={ "1":"!","2":"@","3":"#","4":"$","5":"%","6":"^","7":"&","8":"*","9":"(","0":")","/":"?",".":">",",":"<" };

  // ---- "level-up" content beyond letters/words: space, numbers, capitals, punctuation ----
  const PHRASES=[["HOT DOG","🌭"],["ICE CREAM","🍦"],["BIG SUN","☀️"],["RED BOW","🎀"],["FUN RIDE","🎢"],["MY PONY","🐴"],["YUM PIE","🥧"],["SEA WAVE","🌊"],["TOP HAT","🎩"],["BIG CAT","🐱"]];
  const COUNT_EMOJI=["🦄","🍓","⭐","🩰","🎈","🍎","🐱","🌸","🍒","🎡"];
  const CAP_LETTERS=["A","S","D","F","J","K","L","U","R","E","M","P","T","O","B","I","N"];
  const CAP_WORDS=["SUN","FUN","PIE","CAT","DOG","BOW","TOP","MAP"];
  const PUNCTS=[["HI!","🙌"],["YES.","👍"],["WOW!","🤩"],["OK?","🤔"],["YUM!","😋"],["BYE!","👋"],["NO.","🙅"],["FUN!","🎉"]];
  const SENTENCES=[["I LIKE PIE!","🥧"],["MY UNICORN!","🦄"],["RUN FAST!","🏃"],["YUM YUM!","😋"],["BIG SUN!","☀️"],["WE WON!","🏆"],["GO GO GO!","🎉"],["I CAN DO IT!","💪"]];

  const WORDS = [
    ["SUN","☀️","rainbow"],["SKY","🌤️","rainbow"],["BOW","🎀","rainbow"],["RED","🔴","rainbow"],["RAY","🌟","rainbow"],
    ["PIE","🥧","fruit"],["JAM","🍓","fruit"],["FIG","🌿","fruit"],
    ["FUN","🎡","coney"],["SEA","🌊","coney"],
    ["KIWI","🥝","fruit"],["PEAR","🍐","fruit"],["PLUM","🟣","fruit"],["LIME","🟢","fruit"],["CAKE","🍰","fruit"],
    ["WAVE","🌊","coney"],["RIDE","🎢","coney"],["GAME","🎯","coney"],["SAND","🏖️","coney"],
    ["TUTU","🩰","ballet"],["SPIN","🌀","ballet"],["LEAP","🦋","ballet"],
    ["STAR","⭐","unicorn"],["MOON","🌙","unicorn"],["WISH","✨","unicorn"],["HORN","🦄","unicorn"],
    ["APPLE","🍎","fruit"],["GRAPE","🍇","fruit"],["MANGO","🥭","fruit"],["MELON","🍈","fruit"],["PEACH","🍑","fruit"],["LEMON","🍋","fruit"],["BERRY","🫐","fruit"],
    ["DANCE","💃","ballet"],["TWIRL","🌀","ballet"],["STAGE","🎭","ballet"],["SHOES","🩰","ballet"],
    ["MAGIC","✨","unicorn"],["HORSE","🐴","unicorn"],["CLOUD","☁️","unicorn"],["PONYS","🐴","unicorn"],
    ["OCEAN","🌊","coney"],["BEACH","🏖️","coney"],["PRIZE","🏆","coney"],["CANDY","🍬","coney"],
    ["SUNNY","🌞","rainbow"],["COLOR","🎨","rainbow"],["SHINE","🌟","rainbow"],
    ["BANANA","🍌","fruit"],["CHERRY","🍒","fruit"],["ORANGE","🍊","fruit"],["CUPCAKE","🧁","fruit"],
    ["BALLET","🩰","ballet"],["FLOWER","🌸","ballet"],
    ["CASTLE","🏰","unicorn"],["UNICORN","🦄","unicorn"],["SPARKLE","✨","unicorn"],
    ["FERRIS","🎡","coney"],["DOLPHIN","🐬","coney"],
    ["RAINBOW","🌈","rainbow"],["PURPLE","🟣","rainbow"],["YELLOW","🟡","rainbow"]
  ];
  const STICKERS=["🌈","🦄","🍓","🩰","🎡","⭐","🍦","🐬","🏰","👑","🦋","🌸","🍒","🌟","🧁","🎢","🐱","🌙"];

  // connect-the-dots pictures: ordered points (normalized 0..1, y down) you reveal by typing
  const DOT_PICS=[
    { name:"STAR", emoji:"⭐", color:"#f2b705", closed:true, pts:[[0.5,0.06],[0.76,0.88],[0.06,0.36],[0.94,0.36],[0.24,0.88]] },
    { name:"HEART", emoji:"❤️", color:"#ff5f8f", closed:true, pts:[[0.5,0.94],[0.1,0.48],[0.22,0.14],[0.5,0.34],[0.78,0.14],[0.9,0.48]] },
    { name:"HOUSE", emoji:"🏠", color:"#5b8def", closed:true, pts:[[0.24,0.9],[0.24,0.44],[0.5,0.14],[0.76,0.44],[0.76,0.9]] },
    { name:"FISH", emoji:"🐟", color:"#3bb0c9", closed:true, pts:[[0.1,0.5],[0.5,0.22],[0.95,0.14],[0.95,0.86],[0.5,0.78]] },
    { name:"DIAMOND", emoji:"💎", color:"#56c6ff", closed:true, pts:[[0.5,0.08],[0.86,0.5],[0.5,0.92],[0.14,0.5]] },
    { name:"BOAT", emoji:"⛵", color:"#ff9b54", closed:true, pts:[[0.5,0.1],[0.5,0.62],[0.14,0.62],[0.86,0.62]] }
  ];

  // maze levels: type the direction word to walk. 'S'=start, 'G'=goal, '#'=wall, '.'=open
  const MAZES=[
    ["S..#.","##.#.",".....",".###.","....G"],
    ["S.#...","#.#.#.","....#.","###..G"],
    ["S....",".###.",".#G#.","....."],
    ["S.....","###.#.","..#.#.",".....G"]
  ];
  const DIR=[{w:"UP",dc:0,dr:-1,e:"⬆️"},{w:"LEFT",dc:-1,dr:0,e:"⬅️"},{w:"RIGHT",dc:1,dr:0,e:"➡️"},{w:"DOWN",dc:0,dr:1,e:"⬇️"}];

  // platformer: obstacle types + the "control words" she types to make the unicorn act on each.
  // (Beginners type single letters; once she can spell, these action words drive the obstacle.)
  const OBS=["coin","enemy","block","gap","spring"];
  const ACTIONS={
    gap:["HOP","JUMP","LEAP","JUMP","BOUNCE"],
    enemy:["ZAP","BOP","POW","BONK","ZAP","POUNCE"],
    block:["HIT","BONK","BUMP","SMASH"],
    coin:["GET","GRAB","SCOOP","GRAB"],
    spring:["UP","FLY","BOING","BOUNCE","FLY"],
    run:["RUN","GO","DASH","ZOOM","GALLOP"]
  };
  const FOES={ rainbow:["🌧️","☁️","💨"], unicorn:["👾","🦇","🌑"], fruit:["🐛","🐌","🐝"], ballet:["🌀","🦗","🐞"], coney:["🦀","🐙","🦑"] };

  // 5 worlds; each is a region on the map with 3 levels + a boss.
  const WORLDS = [
    { name:"RAINBOW MEADOW", theme:"rainbow", levels:3, boss:{word:"RAINBOW",emoji:"🌈"},
      sky:["#bfe9ff","#e9f8ff"], hill:"#9be0a8", ground:"#6cc35a", ground2:"#4fa83f", deco:["☁️","🌸","🦋"], goal:"🚩" },
    { name:"UNICORN CASTLE", theme:"unicorn", levels:3, boss:{word:"UNICORN",emoji:"🦄"},
      sky:["#e7d6ff","#ffe0f5"], hill:"#cdb6ec", ground:"#b79be0", ground2:"#9a7fd0", deco:["⭐","✨","☁️"], goal:"🏰" },
    { name:"FRUIT FOREST", theme:"fruit", levels:3, boss:{word:"CHERRY",emoji:"🍒"},
      sky:["#d8f5cf","#f3ffe9"], hill:"#a7d98a", ground:"#7bbf5a", ground2:"#5e9c40", deco:["🍎","🍓","🌳"], goal:"🌳" },
    { name:"BALLET STAGE", theme:"ballet", levels:3, boss:{word:"BALLET",emoji:"🩰"},
      sky:["#ffe0ef","#fff0f8"], hill:"#f0c2da", ground:"#e09ec0", ground2:"#cf83ad", deco:["🎀","🌸","✨"], goal:"🎭" },
    { name:"CONEY ISLAND", theme:"coney", levels:4, boss:{word:"FERRIS",emoji:"🎡"},
      sky:["#bfe0ff","#ffe9c9"], hill:"#f3c98a", ground:"#e0b06a", ground2:"#c8924a", deco:["🎪","🌊","🎈"], goal:"🎡" }
  ];
  const nodeMeta=[];
  // Platformer is the main path; odd levels are side quests (alternating connect-the-dots / maze).
  WORLDS.forEach((w,wi)=>{ for(let l=0;l<w.levels;l++){ const kind = (l%2===1) ? (((wi+Math.floor(l/2))%2===0)?"dots":"maze") : "plat"; nodeMeta.push({world:wi,idx:l,boss:false,kind}); } nodeMeta.push({world:wi,idx:w.levels,boss:true,kind:"boss"}); });
  const TOTAL_NODES = nodeMeta.length;

  /* ===================== STATE ===================== */
  const SAVE_KEY="rainbowQuest.v2";
  const DEFAULT={ skill:1, buddy:"🦄", name:"", node:0, coins:0, stickers:[], muted:false, fingerHelper:true, homeMarkers:true, seenIntro:false, unlocked:{space:false,numbers:false,capitals:false,punct:false} };
  let S=load();
  function freshUnlocked(){ return {space:false,numbers:false,capitals:false,punct:false,fingerMagic:false}; }
  // She learns where keys ARE first; proper finger placement ("finger magic") unlocks
  // later, so the earliest levels are just about finding keys.
  const FINGER_MAGIC=4;
  function fingerOn(){ return S.fingerHelper && Math.round(S.skill)>=FINGER_MAGIC; }
  function load(){ let o; try{ const r=localStorage.getItem(SAVE_KEY); o=r?Object.assign({},DEFAULT,JSON.parse(r)):Object.assign({},DEFAULT); }catch(e){ o=Object.assign({},DEFAULT); }
    o.unlocked=Object.assign(freshUnlocked(), o.unlocked||{}); return o; }
  function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify({
    skill:S.skill,buddy:S.buddy,name:S.name,node:S.node,coins:S.coins,stickers:S.stickers,muted:S.muted,fingerHelper:S.fingerHelper,homeMarkers:S.homeMarkers,seenIntro:S.seenIntro,unlocked:S.unlocked
  })); }catch(e){} }

  const MAX_SKILL=16, HISTORY_LEN=6;
  let history=[];
  let cur=null, idx=0, keysCorrect=0, keysWrong=0, wrongThisTarget=0;
  let hintTimer=null, busy=false, lastWords=[], tipT=null, currentNode=0, shiftArmed=false, mazeBuf="";
  const race={ step:0, active:false };   // step = current obstacle/target index within the level

  const buddyFace=()=>S.buddy;

  /* ===================== AUDIO (chiptune-ish) ===================== */
  let actx=null;
  function audio(){ if(S.muted) return null; if(!actx){ try{ actx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return null; } } if(actx.state==="suspended") actx.resume(); return actx; }
  function blip(freq,dur,type="square",vol=0.13,when=0){ const a=audio(); if(!a) return; const t=a.currentTime+when; const o=a.createOscillator(),g=a.createGain(); o.type=type; o.frequency.value=freq; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t+dur+0.02); }
  const sndGood=()=>{ blip(660,.09,"square",.12); blip(990,.09,"square",.1,.05); };
  const sndWrong=()=> blip(150,.14,"square",.09);
  const sndCoin=()=>{ blip(988,.05,"square",.11); blip(1319,.09,"square",.1,.05); };
  const sndStep=()=> blip(523,.07,"square",.1);
  const sndClear=()=> [523,659,784,1047,1319].forEach((f,i)=>blip(f,.13,"square",.12,i*0.08));
  const sndBoss=()=> [392,523,659,784,1047,784,1047,1319].forEach((f,i)=>blip(f,.16,"square",.13,i*0.09));

  /* ===================== KEYBOARD + HANDS ===================== */
  const kbEl=$("#keyboard"), stageEl=$("#stage");
  const keyEls={}, fingerEls={};
  function buildKeyboard(){ kbEl.innerHTML="";
    const rows=[
      { cls:"row-num", keys:"1234567890".split("").map(c=>({id:c,label:c})) },
      { cls:"", keys:"QWERTYUIOP".split("").map(c=>({id:c,label:c})) },
      { cls:"", keys:"ASDFGHJKL".split("").map(c=>({id:c,label:c})) },
      { cls:"", keys:"ZXCVBNM".split("").map(c=>({id:c,label:c})).concat(
          [{id:",",label:",",cls:"k-punct"},{id:".",label:".",cls:"k-punct"},{id:"/",label:"/",cls:"k-punct"}]) },
      { cls:"row-space", keys:[
          {id:"SHIFT_L",label:"⇧ Shift",cls:"k-shift"},
          {id:"SPACE",label:"space",cls:"k-wide"},
          {id:"SHIFT_R",label:"⇧ Shift",cls:"k-shift"} ] }
    ];
    rows.forEach(rw=>{ const r=document.createElement("div"); r.className=("krow "+rw.cls).trim();
      rw.keys.forEach(spec=>{ const k=document.createElement("div"); k.className="key"; k.textContent=spec.label; k.dataset.k=spec.id;
        const fi=KEY_FINGER[spec.id]; if(fi) k.classList.add("f-"+fi.f);
        if("ASDFGHJKL".includes(spec.id)) k.classList.add("home");
        if(spec.id==="F"||spec.id==="J") k.classList.add("bump");
        if(spec.cls) spec.cls.split(" ").forEach(c=>k.classList.add(c));
        k.addEventListener("pointerdown",e=>{ e.preventDefault(); keyTap(spec.id); });
        keyEls[spec.id]=k; r.appendChild(k); });
      kbEl.appendChild(r); });
  }
  function keyTap(id){
    if(id==="SHIFT_L"||id==="SHIFT_R"){ shiftArmed=!shiftArmed; updateShiftVisual(); return; }
    let ch;
    if(id==="SPACE") ch=" ";
    else if(/^[A-Z]$/.test(id)) ch=shiftArmed?id:id.toLowerCase();
    else if(SHIFT_MAP[id]!==undefined) ch=shiftArmed?SHIFT_MAP[id]:id;
    else ch=id;
    if(shiftArmed){ shiftArmed=false; updateShiftVisual(); }
    routeChar(ch);
  }
  function updateShiftVisual(){ [keyEls.SHIFT_L,keyEls.SHIFT_R].forEach(k=>{ if(k) k.classList.toggle("shift-on",shiftArmed); }); }
  function applyKeyboardReveal(){ const s=Math.round(S.skill);
    kbEl.classList.toggle("kb-space",s>=11); kbEl.classList.toggle("kb-numbers",s>=12); kbEl.classList.toggle("kb-punct",s>=14);
    kbEl.classList.toggle("kb-find",s<=3); }
  function buildHands(){ const hands=$("#hands"); hands.innerHTML="";
    const make=(h,order)=>{ const hand=document.createElement("div"); hand.className="hand"; const f=document.createElement("div"); f.className="fingers";
      order.forEach(fn=>{ const el=document.createElement("i"); el.className="finger"+(fn==="thumb"?" thumb":""); el.dataset.h=h; el.dataset.f=fn; fingerEls[h+"_"+fn]=el; f.appendChild(el); });
      const palm=document.createElement("div"); palm.className="palm"; hand.appendChild(f); hand.appendChild(palm); return hand; };
    hands.appendChild(make("L",["pinky","ring","middle","index","thumb"])); hands.appendChild(make("R",["thumb","index","middle","ring","pinky"])); }
  function clearHint(){ Object.values(keyEls).forEach(k=>k.classList.remove("hint")); }
  // map a target character -> which on-screen key + whether Shift is needed
  function hintInfo(c,capStrict){
    if(c===" ") return {key:"SPACE",shift:false};
    if(/[a-zA-Z]/.test(c)) return {key:c.toUpperCase(),shift:!!capStrict};
    if(/[0-9]/.test(c)) return {key:c,shift:false};
    if(c===".") return {key:".",shift:false};
    if(c===",") return {key:",",shift:false};
    if(c==="/") return {key:"/",shift:false};
    if(c==="!") return {key:"1",shift:true};
    if(c==="?") return {key:"/",shift:true};
    return {key:c.toUpperCase(),shift:false};
  }
  function charMatches(actual,expected,capStrict){
    if(/[a-zA-Z]/.test(expected)) return capStrict ? actual===expected : actual.toLowerCase()===expected.toLowerCase();
    return actual===expected;
  }
  function showKeyHint(){ if(!cur) return; clearHint(); const ci=hintInfo(cur.text[idx],cur.capStrict);
    if(keyEls[ci.key]) keyEls[ci.key].classList.add("hint");
    if(ci.shift){ const kf=KEY_FINGER[ci.key]; const sid=(kf&&kf.h==="L")?"SHIFT_R":"SHIFT_L"; if(keyEls[sid]) keyEls[sid].classList.add("hint"); } }
  function flashKey(ch,good){ const id=hintInfo(ch,false).key; const k=keyEls[id]; if(!k) return; const c=good?"tap-good":"tap-bad"; k.classList.add(c); setTimeout(()=>k.classList.remove(c),200); }
  function clearFinger(){ Object.values(fingerEls).forEach(e=>e.classList.remove("active")); const l=$("#fingerLabel"); l.innerHTML="&nbsp;"; l.style.color=""; }
  function fingerFor(c,capStrict){ if(c===" ") return {space:true}; const ci=hintInfo(c,capStrict); if(ci.key==="SPACE") return {space:true};
    const kf=KEY_FINGER[ci.key]; if(kf) return {h:kf.h,f:kf.f,shift:ci.shift}; return null; }
  function updateFinger(){ clearFinger();
    const on=fingerOn(); $("#hands").classList.toggle("off",!on); $("#fingerLabel").classList.toggle("off",!on);
    if(!on||!cur) return; const ff=fingerFor(cur.text[idx],cur.capStrict); if(!ff) return; const l=$("#fingerLabel");
    if(ff.space){ ["L_thumb","R_thumb"].forEach(k=>{ if(fingerEls[k]) fingerEls[k].classList.add("active"); }); l.textContent="👍 Thumbs — space bar!"; l.style.color="var(--f-thumb)"; return; }
    const el=fingerEls[ff.h+"_"+ff.f]; if(el) el.classList.add("active");
    let txt=(ff.h==="L"?"👈 Left ":"👉 Right ")+FINGER_NAME[ff.f]+" finger"; if(ff.shift) txt+=" + hold SHIFT";
    l.textContent=txt; l.style.color=FINGER_COLOR[ff.f]; }

  /* ===================== ADAPTIVE ENGINE ===================== */
  function stageForSkill(skill){ const s=Math.round(skill);
    // 1–3: "find the key" (no finger pressure, one big obvious glowing key)
    if(s<=1) return {mode:"letter",wave:1,hint:"always",desc:"Find the keys (F & J)"};
    if(s===2) return {mode:"letter",wave:2,hint:"always",desc:"Find home-row keys"};
    if(s===3) return {mode:"letter",wave:3,hint:"always",desc:"Find top-row keys"};
    // 4–5: finger magic — now teach which finger
    if(s===4) return {mode:"letter",wave:4,hint:"always",desc:"Finger magic — all letters"};
    if(s===5) return {mode:"letter",wave:4,hint:"delay",desc:"All letters"};
    // 6+: words (in the platformer these become action words like JUMP / ZAP)
    if(s===6) return {mode:"word",min:3,max:3,hint:"delay",desc:"3-letter words"};
    if(s===7) return {mode:"word",min:3,max:4,hint:"delay",desc:"3–4 letter words"};
    if(s===8) return {mode:"word",min:4,max:5,hint:"onwrong",desc:"4–5 letter words"};
    if(s===9) return {mode:"word",min:5,max:6,hint:"onwrong",desc:"5–6 letter words"};
    if(s===10) return {mode:"word",min:6,max:7,hint:"onwrong",desc:"Big words!"};
    if(s===11) return {mode:"phrase",hint:"delay",desc:"Two words + SPACE bar"};
    if(s===12) return {mode:"number",hint:"always",desc:"Numbers (counting)"};
    if(s===13) return {mode:"capital",hint:"always",desc:"BIG letters (Shift)"};
    if(s===14) return {mode:"punct",hint:"delay",desc:"Punctuation . , ! ?"};
    return {mode:"sentence",hint:"onwrong",desc:"Mini sentences!"}; }
  function allowedLetters(wave){ let set=[]; for(let i=0;i<wave&&i<LETTER_WAVES.length;i++) set=set.concat(LETTER_WAVES[i]); return set; }
  function pickTarget(themeBias){ const st=stageForSkill(S.skill); const R=a=>a[(Math.random()*a.length)|0];
    if(st.mode==="letter"){ const pool=allowedLetters(st.wave); const ch=R(pool); const[w,e]=LETTER_INFO[ch];
      return {mode:"letter",text:ch,emoji:e,caption:`${ch} is for ${w}`,stage:st}; }
    if(st.mode==="phrase"){ const p=R(PHRASES); return {mode:"phrase",text:p[0],emoji:p[1],caption:p[0].toLowerCase(),stage:st}; }
    if(st.mode==="number"){ const n=1+((Math.random()*9)|0); const e=R(COUNT_EMOJI); return {mode:"number",text:String(n),emoji:e,caption:e.repeat(n)+"  = ?",stage:st}; }
    if(st.mode==="capital"){ if(Math.random()<0.7){ const c=R(CAP_LETTERS); return {mode:"capital",text:c,emoji:"🔠",caption:"Make a BIG "+c+" — hold SHIFT!",capStrict:true,stage:st}; }
      const wd=R(CAP_WORDS); return {mode:"capital",text:wd,emoji:"🔠",caption:"BIG letters — hold SHIFT!",capStrict:true,stage:st}; }
    if(st.mode==="punct"){ const p=R(PUNCTS); return {mode:"punct",text:p[0],emoji:p[1],caption:p[0].toLowerCase(),stage:st}; }
    if(st.mode==="sentence"){ const p=R(SENTENCES); return {mode:"sentence",text:p[0],emoji:p[1],caption:p[0].toLowerCase(),stage:st}; }
    let pool=WORDS.filter(w=>w[0].length>=st.min&&w[0].length<=st.max); if(!pool.length) pool=WORDS.filter(w=>w[0].length<=st.max);
    const themed=pool.filter(w=>w[2]===themeBias); if(themed.length>=2 && Math.random()<0.72) pool=themed;
    let p,tries=0; do{ p=R(pool); tries++; }while(lastWords.includes(p[0])&&tries<12);
    lastWords.push(p[0]); if(lastWords.length>3) lastWords.shift();
    return {mode:"word",text:p[0],emoji:p[1],caption:p[0].toLowerCase(),theme:p[2],stage:st}; }
  function checkUnlock(){
    if(Math.round(S.skill)>=FINGER_MAGIC && S.fingerHelper && S.unlocked && !S.unlocked.fingerMagic){ S.unlocked.fingerMagic=true; save(); showPowerup("fingerMagic"); }
    const m=stageForSkill(S.skill).mode; const map={phrase:"space",number:"numbers",capital:"capitals",punct:"punct"};
    const key=map[m]; if(key && S.unlocked && !S.unlocked[key]){ S.unlocked[key]=true; save(); showPowerup(key); } }
  function updateSkill(){ const recent=history.slice(-HISTORY_LEN); if(recent.length<3) return;
    const acc=recent.reduce((a,r)=>a+r.accuracy,0)/recent.length, ftr=recent.reduce((a,r)=>a+(r.firstTry?1:0),0)/recent.length;
    const before=Math.round(S.skill);
    // gentle ramp: it takes a couple of strong targets to move up a level
    if(acc>=0.92&&ftr>=0.75) S.skill=Math.min(MAX_SKILL,S.skill+0.5);
    else if(acc>=0.8) S.skill=Math.min(MAX_SKILL,S.skill+0.25);
    else if(acc<0.5) S.skill=Math.max(1,S.skill-0.5);
    else if(acc<0.65) S.skill=Math.max(1,S.skill-0.25);
    if(Math.round(S.skill)!==before) history=[]; }

  /* ===================== SCENE (8-bit canvas) ===================== */
  const canvas=$("#scene"), X=canvas.getContext("2d");
  const VW=320, VH=140, GROUND_Y=112, SEG=46;
  const PSTART=24, PSEG=54;                 // platformer: hero start x, spacing between obstacle stations
  const scene={ raf:0, running:false, world:null, isBoss:false, kind:"plat", len:5, pic:null, stations:[],
    heroX:30, heroRenderX:30, anim:null, flagX:0, cam:0, floaters:[], fx:30, fy:GROUND_Y-30, bossScale:1, bossHappy:false, t:0 };

  function r(x,y,w,h,c){ X.fillStyle=c; X.fillRect(x|0,y|0,Math.ceil(w),Math.ceil(h)); }
  function emoji(ch,x,y,size){ X.font=size+"px serif"; X.textAlign="center"; X.textBaseline="alphabetic"; X.fillText(ch,x,y); }

  // ===== hand-drawn pixel unicorn sprite (NES-style), facing right, with legs =====
  function px(ctx,x,y,w,h,c){ ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h))); }
  const RAINBOW6=["#ff5f6e","#ff9f43","#ffe24d","#4fd16a","#4ba3ff","#b07cff"];
  function heroPal(b){
    if(b==="🩰") return {body:"#ffe6f3",sh:"#f6c9e2",mane:["#ff8fc0","#ff6fae","#ff8fc0","#ffa6d0","#ff6fae","#ff8fc0"],horn:"#ff7ab0"};
    if(b==="🍓") return {body:"#ffd9df",sh:"#f3b6bf",mane:["#ff5f6f","#ff7f5f","#ff5f6f","#ff8f7f","#ff5f6f","#ff7f8f"],horn:"#ff5f6f"};
    if(b==="🐱") return {body:"#ffe2c4",sh:"#f3c79a",mane:["#ffb74d","#ffa64d","#ffc14d","#ffb74d","#ffa64d","#ffc14d"],horn:"#ffb347"};
    return {body:"#fdf2ff",sh:"#e9d4f2",mane:RAINBOW6,horn:"#ffd84d"};   // unicorn / rainbow
  }
  // cx = centre, by = feet baseline; frame 0/1 = walk cycle; air = legs tucked (mid-jump)
  function drawHero(ctx,cx,by,frame,air,buddy){
    const P=heroPal(buddy||S.buddy), EYE="#3a2a5a", HOOF="#b79bd8";
    const legH=air?3:5;
    const lift = air ? [0,0,0,0] : (frame ? [2,0,2,0] : [0,2,0,2]);
    const legX=[cx-7,cx-4,cx+2,cx+5];
    // tail (behind body)
    for(let i=0;i<6;i++) px(ctx, cx-11-(i&1), by-legH-7+i*2, 3, 2, P.mane[i]);
    // legs
    legX.forEach((lx,i)=>{ px(ctx, lx, by-legH+lift[i], 2, legH-lift[i], P.body); px(ctx, lx, by-1, 2, 1, HOOF); });
    // body
    px(ctx, cx-8, by-legH-6, 14, 7, P.body);
    px(ctx, cx-7, by-legH, 12, 1, P.sh);            // belly shade
    px(ctx, cx-9, by-legH-5, 1, 4, P.body);         // rump round
    // neck + head (front = right)
    px(ctx, cx+3, by-legH-11, 5, 7, P.body);        // neck
    px(ctx, cx+6, by-legH-15, 7, 6, P.body);        // head
    px(ctx, cx+12, by-legH-13, 3, 3, P.body);       // muzzle
    px(ctx, cx+13, by-legH-11, 1, 1, P.sh);         // nostril
    px(ctx, cx+6, by-legH-17, 2, 3, P.body);        // ear
    // mane down the back of the neck
    for(let i=0;i<6;i++) px(ctx, cx, by-legH-16+i*2, 4, 2, P.mane[i]);
    px(ctx, cx+8, by-legH-17, 3, 2, P.mane[0]);     // forelock
    // horn
    px(ctx, cx+10, by-legH-20, 2, 4, P.horn); px(ctx, cx+11, by-legH-22, 1, 2, P.horn);
    // eye + cheek
    px(ctx, cx+9, by-legH-13, 2, 2, EYE);
    px(ctx, cx+10, by-legH-10, 2, 1, "#ffb6d8");
  }

  function startSceneLoop(){ if(scene.running) return; scene.running=true; scene.raf=requestAnimationFrame(drawScene); }
  function stopSceneLoop(){ scene.running=false; cancelAnimationFrame(scene.raf); }

  function drawScene(ts){
    if(!scene.running) return;
    scene.t=ts;
    if(scene.kind==="dots"){ drawDotsScene(ts); scene.raf=requestAnimationFrame(drawScene); return; }
    if(scene.kind==="maze"){ drawMazeScene(ts); scene.raf=requestAnimationFrame(drawScene); return; }
    const w=scene.world;
    // hero hop tween
    let hop=0;
    if(scene.anim){ const k=(ts-scene.anim.t0)/scene.anim.dur; if(k>=1){ scene.heroRenderX=scene.anim.to; scene.anim=null; } else { scene.heroRenderX=lerp(scene.anim.from,scene.anim.to,k); hop=Math.sin(k*Math.PI)*(scene.anim.arc||16); } }
    // camera
    const maxCam=Math.max(0, scene.flagX+34-VW);
    scene.cam=clamp(scene.heroRenderX-70,0,maxCam);
    const cam=scene.cam;
    scene.fx=scene.heroRenderX; scene.fy=GROUND_Y-30;

    // sky
    const g=X.createLinearGradient(0,0,0,VH); g.addColorStop(0,w.sky[0]); g.addColorStop(1,w.sky[1]); X.fillStyle=g; X.fillRect(0,0,VW,VH);
    // far hills (parallax)
    X.fillStyle=w.hill;
    for(let i=-1;i<6;i++){ const hx=i*90 - (cam*0.4)%90; X.beginPath(); X.arc(hx+45, GROUND_Y+6, 46, Math.PI, 0); X.fill(); }
    // deco (clouds/etc parallax)
    for(let i=0;i<5;i++){ const dx=(i*84 - (cam*0.6))%(VW+84); const x=((dx%(VW+84))+(VW+84))%(VW+84)-42; emoji(w.deco[i%w.deco.length], x, 34+ (i%2)*16, 16); }
    // ground
    for(let gx=-((cam)%16); gx<VW; gx+=16){ const c=((Math.floor((gx+cam)/16))%2===0)?w.ground:w.ground2; r(gx,GROUND_Y+8,16,VH-GROUND_Y-8,c); }
    r(0,GROUND_Y+8,VW,3,"rgba(255,255,255,.25)");

    if(scene.isBoss){
      // boss creature in the middle, shrinks as letters typed
      const prog = cur? (idx/cur.text.length):0;
      const sc = scene.bossHappy? 1 : (1-0.45*prog);
      const bx=VW*0.62, by=GROUND_Y+6;
      const bob=Math.sin(ts/250)*3;
      emoji(scene.world.boss.emoji, bx, by-bob, 52*sc);
      if(scene.bossHappy){ emoji("💖",bx-22,by-40,14); emoji("✨",bx+22,by-44,14); }
      // hero faces boss
      drawHero(X, 60, GROUND_Y+8-hop, Math.floor(ts/200)%2, false, S.buddy);
      emoji("⭐", 60, GROUND_Y-28-hop, 10);
    } else {
      // ===== platformer: pits, obstacles, flagpole, hero with jump arc =====
      // pits (gaps): carve an abyss into the ground
      for(let i=0;i<scene.len;i++){ if(scene.stations[i]!=="gap") continue; const ox=PSTART+i*PSEG+PSEG/2-cam; if(ox<-30||ox>VW+30) continue;
        r(ox-18, GROUND_Y+8, 36, VH-GROUND_Y-8, w.sky[1]); r(ox-18,GROUND_Y+8,3,VH-GROUND_Y-8,"rgba(0,0,0,.18)"); r(ox+15,GROUND_Y+8,3,VH-GROUND_Y-8,"rgba(0,0,0,.18)"); }
      // obstacles (cleared ones: enemy/coin vanish, block goes empty, gap stays a pit, spring stays)
      for(let i=0;i<scene.len;i++){ const type=scene.stations[i], cleared=i<race.step; const ox=PSTART+i*PSEG+PSEG/2-cam; if(ox<-24||ox>VW+24) continue;
        const bob=Math.sin(ts/200+i)*3;
        if(type==="coin"){ if(!cleared){ const sw=3+Math.round(2*Math.abs(Math.cos(ts/180+i))); r(ox-sw,GROUND_Y-26+bob,sw*2,12,"#ffcf33"); r(ox-1,GROUND_Y-24+bob,2,8,"#fff3a8"); } }
        else if(type==="enemy"){ if(!cleared) emoji(foeFor(i), ox, GROUND_Y+8+Math.sin(ts/180+i)*1.5, 17); }
        else if(type==="block"){ r(ox-9,GROUND_Y-30,18,18, cleared?"#b08a5a":"#e0a83c"); r(ox-9,GROUND_Y-30,18,3,cleared?"#caa472":"#ffd86a"); if(!cleared){ X.fillStyle="#7a5c00"; X.font="bold 12px ui-monospace,monospace"; X.textAlign="center"; X.textBaseline="middle"; X.fillText("?",ox,GROUND_Y-20); X.textBaseline="alphabetic"; } }
        else if(type==="spring"){ r(ox-8,GROUND_Y+2,16,6,"#9a7fd0"); r(ox-8,GROUND_Y+1,16,2,"#c4aef0"); }
      }
      // flagpole goal (Mario-style)
      const fx=scene.flagX-cam; if(fx>-24 && fx<VW+24){ r(fx,GROUND_Y-46,2,54,"#9a9a9a"); emoji("🚩",fx+7,GROUND_Y-34,12); emoji(scene.world.goal, fx+4, GROUND_Y+8, 22); }
      // hero (hop reflects the jump arc set on scene.anim)
      drawHero(X, scene.heroRenderX-cam, GROUND_Y+8-hop, Math.floor(ts/150)%2, !!scene.anim, S.buddy);
    }

    drawFloaters(ts,cam);
    scene.raf=requestAnimationFrame(drawScene);
  }
  function drawFloaters(ts,cam){ scene.floaters=scene.floaters.filter(f=>{ const k=(ts-f.t0)/700; if(k>=1) return false; X.globalAlpha=1-k; X.fillStyle="#fff"; X.font="bold 11px ui-monospace,monospace"; X.textAlign="center"; X.textBaseline="alphabetic"; X.fillText(f.txt, f.x-cam, f.y-22*k); X.globalAlpha=1; return true; }); }
  function addFloater(txt){ scene.floaters.push({txt, x:scene.fx, y:scene.fy, t0:scene.t}); }
  function foeFor(i){ const arr=FOES[scene.world.theme]||["👾"]; return arr[i%arr.length]; }
  // platformer target: the obstacle's "control word" (or a single letter for beginners)
  function platTarget(obType){ const st=stageForSkill(S.skill); const R=a=>a[(Math.random()*a.length)|0];
    if(st.mode==="letter"){ const pool=allowedLetters(st.wave); const ch=R(pool); const[w,e]=LETTER_INFO[ch];
      return {mode:"letter",text:ch,emoji:e,caption:`${ch} is for ${w}`,stage:st,action:obType}; }
    let pool=ACTIONS[obType]||ACTIONS.run;
    if(st.min){ const f=pool.filter(x=>x.length>=st.min&&x.length<=st.max); if(f.length) pool=f; }
    const word=R(pool);
    return {mode:"word",text:word,emoji:"",caption:word.toLowerCase(),stage:st,action:obType,plat:true}; }
  // little burst when an obstacle is cleared
  function platEffect(type,i){ const ox=PSTART+i*PSEG+PSEG/2;
    if(type==="enemy"){ scene.floaters.push({txt:"💥",x:ox,y:GROUND_Y-12,t0:scene.t}); }
    else if(type==="block"){ scene.floaters.push({txt:"🪙",x:ox,y:GROUND_Y-34,t0:scene.t}); }
    else if(type==="coin"){ scene.floaters.push({txt:"🪙",x:ox,y:GROUND_Y-26,t0:scene.t}); }
    else if(type==="spring"){ scene.floaters.push({txt:"✨",x:ox,y:GROUND_Y-30,t0:scene.t}); } }

  // connect-the-dots level: type a target to light the next numbered dot and draw the line
  function drawDotsScene(ts){
    const pic=scene.pic, padX=56, padY=18;
    const P=pic.pts.map(([nx,ny])=>[padX+nx*(VW-2*padX), padY+ny*(VH-2*padY)]);
    const lit=race.step, done=lit>=scene.len;
    const g=X.createLinearGradient(0,0,0,VH); g.addColorStop(0,"#eaf3ff"); g.addColorStop(1,"#fff0fb"); X.fillStyle=g; X.fillRect(0,0,VW,VH);
    if(done){ X.fillStyle=pic.color+"44"; X.beginPath(); P.forEach((p,i)=> i?X.lineTo(p[0],p[1]):X.moveTo(p[0],p[1])); X.closePath(); X.fill(); }
    // lines between lit dots
    X.strokeStyle=pic.color; X.lineWidth=3; X.lineCap="round"; X.lineJoin="round"; X.beginPath();
    for(let i=0;i<lit;i++){ const p=P[i]; if(i===0) X.moveTo(p[0],p[1]); else X.lineTo(p[0],p[1]); }
    if(done && pic.closed) X.lineTo(P[0][0],P[0][1]);
    X.stroke();
    // dots
    P.forEach((p,i)=>{ const on=i<lit, isNext=(i===lit && !done);
      X.beginPath(); X.arc(p[0],p[1], isNext?6:5,0,7); X.fillStyle=on?pic.color:"#fff"; X.fill(); X.lineWidth=2; X.strokeStyle="#3a2a5a"; X.stroke();
      if(isNext){ const rr=7+(Math.sin(ts/180)+1)*3; X.strokeStyle="#ff5fb0"; X.lineWidth=2; X.beginPath(); X.arc(p[0],p[1],rr,0,7); X.stroke(); }
      if(!on){ X.fillStyle="#3a2a5a"; X.font="bold 8px ui-monospace,monospace"; X.textAlign="center"; X.textBaseline="middle"; X.fillText(String(i+1),p[0],p[1]); } });
    X.textBaseline="alphabetic";
    if(done){ const bob=Math.sin(ts/250)*3; emoji(pic.emoji, VW/2, VH/2+10-bob, 34); emoji("✨",VW/2-30,VH/2-14,13); emoji("✨",VW/2+30,VH/2-18,13); }
    const nd=P[Math.min(lit,scene.len-1)]; scene.fx=nd[0]; scene.fy=nd[1]-10;
    drawFloaters(ts,0);
  }

  // ===== maze level: type a direction word to walk to the goal =====
  function setupMaze(){
    const raw=MAZES[(Math.random()*MAZES.length)|0]; const grid=raw.map(s=>s.split(""));
    const rows=grid.length, cols=grid[0].length; let sc=0,sr=0,gc=0,gr=0;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ if(grid[r][c]==="S"){sc=c;sr=r;} if(grid[r][c]==="G"){gc=c;gr=r;} }
    const cs=Math.min((VW-44)/cols,(VH-22)/rows);
    scene.mz={grid,rows,cols,c:sc,r:sr,gc,gr,cs,offX:(VW-cs*cols)/2,offY:(VH-cs*rows)/2,anim:null,bump:null};
    mazeBuf="";
  }
  function mazeOpen(c,r){ const m=scene.mz; if(c<0||r<0||c>=m.cols||r>=m.rows) return false; return m.grid[r][c]!=="#"; }
  function drawMazeScene(ts){
    const m=scene.mz; if(!m) return;
    const g=X.createLinearGradient(0,0,0,VH); g.addColorStop(0,"#e7e0ff"); g.addColorStop(1,"#fff0fb"); X.fillStyle=g; X.fillRect(0,0,VW,VH);
    for(let r=0;r<m.rows;r++)for(let c=0;c<m.cols;c++){ const x=m.offX+c*m.cs,y=m.offY+r*m.cs;
      r2(x+1,y+1,m.cs-2,m.cs-2, m.grid[r][c]==="#"?"#6b4fa0":"#ffffff"); }
    emoji("🎁", m.offX+m.gc*m.cs+m.cs/2, m.offY+m.gr*m.cs+m.cs*0.74, m.cs*0.66);
    let hc=m.c, hr=m.r;
    if(m.anim){ const k=clamp((ts-m.anim.t0)/m.anim.dur,0,1); hc=lerp(m.anim.fc,m.anim.tc,k); hr=lerp(m.anim.fr,m.anim.tr,k); if(k>=1) m.anim=null; }
    let bx=0,by=0; if(m.bump){ const k=(ts-m.bump.t0)/220; if(k>=1) m.bump=null; else { const s=Math.sin(k*Math.PI)*4; bx=m.bump.dc*s; by=m.bump.dr*s; } }
    emoji(buddyFace(), m.offX+hc*m.cs+m.cs/2+bx, m.offY+hr*m.cs+m.cs*0.78+by, m.cs*0.8);
  }
  function r2(x,y,w,h,c){ X.fillStyle=c; X.fillRect(x|0,y|0,Math.ceil(w),Math.ceil(h)); }
  function mazeKey(raw){ if(busy||scene.kind!=="maze") return; const c=String(raw||"").toUpperCase(); if(!/^[A-Z]$/.test(c)) return;
    const buf=mazeBuf+c, cands=DIR.filter(d=>d.w.startsWith(buf));
    if(!cands.length){ mazeBuf=""; sndWrong(); renderMaze(); return; }
    mazeBuf=buf; sndGood();
    const full=cands.find(d=>d.w===buf);
    if(full){ mazeBuf=""; renderMaze(); mazeMove(full); return; }
    renderMaze();
  }
  function mazeMove(d){ const m=scene.mz; const nc=m.c+d.dc, nr=m.r+d.dr;
    if(mazeOpen(nc,nr)){ m.anim={fc:m.c,fr:m.r,tc:nc,tr:nr,t0:scene.t,dur:200}; m.c=nc; m.r=nr; sndStep();
      S.coins=(S.coins||0)+2; $("#coins").textContent=S.coins;
      if(m.c===m.gc && m.r===m.gr){ busy=true; sndClear(); setTimeout(()=>finishLevel(true),320); } }
    else { m.bump={dc:d.dc,dr:d.dr,t0:scene.t}; sndWrong(); }
  }
  function renderMaze(){
    applyKeyboardReveal(); kbEl.classList.remove("kb-find");
    stageEl.innerHTML="";
    const help=document.createElement("div"); help.className="caption"; help.textContent="Type a direction to move! 🧭"; stageEl.appendChild(help);
    const pad=document.createElement("div"); pad.className="dpad";
    DIR.forEach(d=>{ const chip=document.createElement("div"); chip.className="dchip d-"+d.w.toLowerCase();
      const spelling = mazeBuf.length>0 && d.w.startsWith(mazeBuf);
      const letters=[...d.w].map((ch,i)=>`<span class="dl${spelling&&i<mazeBuf.length?" done":spelling&&i===mazeBuf.length?" cur":""}">${ch}</span>`).join("");
      chip.innerHTML=`<span class="darrow">${d.e}</span><span class="dword">${letters}</span>`; pad.appendChild(chip); });
    stageEl.appendChild(pad);
    // keyboard + finger hints
    clearHint();
    let nextCh="";
    if(mazeBuf===""){ DIR.forEach(d=>{ if(keyEls[d.w[0]]) keyEls[d.w[0]].classList.add("hint"); }); }
    else { const cand=DIR.find(d=>d.w.startsWith(mazeBuf)); if(cand){ nextCh=cand.w[mazeBuf.length]||""; if(keyEls[nextCh]) keyEls[nextCh].classList.add("hint"); } }
    const fon=fingerOn(); $("#hands").classList.toggle("off",!fon); $("#fingerLabel").classList.toggle("off",!fon);
    clearFinger();
    if(fon && nextCh){ const fi=KEY_FINGER[nextCh]; if(fi){ const el=fingerEls[fi.h+"_"+fi.f]; if(el) el.classList.add("active"); const l=$("#fingerLabel"); l.textContent=(fi.h==="L"?"👈 Left ":"👉 Right ")+FINGER_NAME[fi.f]+" finger"; l.style.color=FINGER_COLOR[fi.f]; } }
  }
  function routeChar(ch){ if(scene.kind==="maze") mazeKey(ch); else handleChar(ch); }

  /* ===================== TARGET / TYPING ===================== */
  function renderTarget(){ stageEl.innerHTML="";
    const cap=document.createElement("div"); cap.className="caption";
    const plain = (cur.mode==="letter"||cur.mode==="number"||cur.mode==="capital");
    cap.textContent = cur.boss ? ("✨ Cast the spell: "+cur.caption+" ✨") : plain ? cur.caption : ("Type: "+cur.caption);
    stageEl.appendChild(cap);
    const row=document.createElement("div"); row.className="word-row";
    [...cur.text].forEach((ch,i)=>{ const t=document.createElement("div");
      t.className="tile"+(ch===" "?" space-tile":"")+(i<idx?" done":i===idx?" current":"");
      t.textContent=(ch===" ")?"␣":ch; t.dataset.i=i; row.appendChild(t); });
    stageEl.appendChild(row); }
  function refreshTiles(){ stageEl.querySelectorAll(".tile").forEach((t,i)=>{ t.classList.toggle("done",i<idx); t.classList.toggle("current",i===idx); }); }
  function armHint(fresh){ updateFinger(); clearHint(); if(hintTimer){ clearTimeout(hintTimer); hintTimer=null; }
    const mode=cur.stage.hint; if(mode==="always") showKeyHint(); else if(mode==="delay") hintTimer=setTimeout(showKeyHint, fresh?2600:1500); }

  function nextTarget(){
    if(scene.kind==="boss"){ const b=scene.world.boss; cur={mode:"word",text:b.word,emoji:b.emoji,caption:b.word.toLowerCase(),stage:{mode:"word",hint:"always"},boss:true}; }
    else if(scene.kind==="plat"){ cur=platTarget(scene.stations[race.step]||"coin"); }
    else cur=pickTarget(scene.world.theme);
    idx=0; keysCorrect=0; keysWrong=0; wrongThisTarget=0;
    applyKeyboardReveal(); renderTarget(); armHint(true);
  }

  function handleChar(raw){ if(busy||!cur||!race.active) return; const actual=String(raw); if(actual.length!==1) return;
    const expected=cur.text[idx];
    if(charMatches(actual,expected,cur.capStrict)){ flashKey(expected,true); keysCorrect++; idx++; sndGood();
      S.coins=(S.coins||0)+1; $("#coins").textContent=S.coins; addFloater("+1"); if(idx%2===0) sndCoin();
      if(idx>=cur.text.length){ completeTarget(); return; }
      refreshTiles(); armHint(false);
    } else { flashKey(actual,false); keysWrong++; wrongThisTarget++; sndWrong();
      const t=stageEl.querySelector(".tile.current"); if(t){ t.classList.add("wrong"); setTimeout(()=>t.classList.remove("wrong"),350); }
      showKeyHint(); }
  }

  function completeTarget(){ clearHint(); if(hintTimer) clearTimeout(hintTimer); refreshTiles(); sndStep();
    const total=keysCorrect+keysWrong, accuracy=total?keysCorrect/total:1;
    history.push({accuracy,firstTry:wrongThisTarget===0}); updateSkill(); checkUnlock(); applyKeyboardReveal();
    S.coins=(S.coins||0)+4; $("#coins").textContent=S.coins; addFloater("+5🪙"); sndCoin(); save();

    if(scene.kind==="boss"){ scene.bossHappy=true; finishLevel(true); return; }
    if(scene.kind==="plat"){
      const cleared=scene.stations[race.step]; race.step++;
      const reached=race.step>=scene.len;
      const to = reached ? scene.flagX : PSTART+race.step*PSEG;
      const arc = cleared==="gap"?28 : cleared==="spring"?40 : 16;
      scene.anim={from:scene.heroRenderX,to,t0:scene.t,dur:reached?540:430,arc};
      platEffect(cleared, race.step-1);
      busy=true;
      if(reached){ setTimeout(()=>finishLevel(true), 580); } else { setTimeout(()=>{ busy=false; nextTarget(); },560); }
      return;
    }
    // dots: light next dot (drawDotsScene reads race.step)
    race.step++;
    if(race.step>=scene.len){ finishLevel(true); }
    else { busy=true; setTimeout(()=>{ busy=false; nextTarget(); },600); }
  }

  /* ===================== LEVEL FLOW ===================== */
  function startLevel(node){
    currentNode=node; const meta=nodeMeta[node]; const w=WORLDS[meta.world]; const sk=Math.round(S.skill);
    scene.world=w; scene.isBoss=meta.boss; scene.kind=meta.kind;
    scene.heroX=PSTART; scene.heroRenderX=PSTART; scene.anim=null; scene.floaters=[]; scene.bossHappy=false; scene.fx=PSTART; scene.fy=GROUND_Y-30;
    if(meta.kind==="dots"){
      scene.pic = DOT_PICS[(Math.random()*DOT_PICS.length)|0];
      scene.len = scene.pic.pts.length; scene.flagX=VW;
    } else if(meta.kind==="maze"){
      setupMaze(); scene.len=1; scene.flagX=VW;
    } else if(meta.boss){
      scene.len=1; scene.stations=[]; scene.flagX=VW*0.62;
    } else { // platformer (the main level type)
      scene.len = sk<=3?4 : sk<=6?5 : 6;
      scene.stations=[]; for(let i=0;i<scene.len;i++) scene.stations.push(OBS[(Math.random()*OBS.length)|0]);
      scene.flagX = PSTART + scene.len*PSEG + 40;
    }
    race.step=0; race.active=true;
    $("#worldName").textContent = w.name + (meta.boss?"  • BOSS": meta.kind==="dots"?("  • DOTS "+(meta.idx+1)+"/"+w.levels) : meta.kind==="maze"?("  • MAZE "+(meta.idx+1)+"/"+w.levels) : ("  • "+(meta.idx+1)+"/"+w.levels));
    $("#coins").textContent=S.coins||0;
    document.body.style.setProperty("--bg1",w.sky[0]); document.body.style.setProperty("--bg2",w.sky[1]);
    stopMapLoop(); showScreen("game"); startSceneLoop();
    busy=false; if(meta.kind==="maze"){ cur=null; renderMaze(); } else { nextTarget(); }
    if(meta.idx===0 && !meta.boss) showBanner(meta.world);
  }

  function finishLevel(){     // levels are never lost — clearing always advances
    if(!race.active) return; race.active=false;
    clearHint(); clearFinger(); if(hintTimer) clearTimeout(hintTimer); busy=true;
    if(currentNode===S.node && S.node<TOTAL_NODES-1) S.node++;
    const isDots = scene.kind==="dots", isMaze = scene.kind==="maze";
    const sticker = isDots ? scene.pic.emoji : isMaze ? "🧩" : STICKERS[S.stickers.length%STICKERS.length];
    S.stickers.push(sticker);
    $("#wowText").textContent = scene.isBoss ? "WORLD CLEAR!" : isDots ? ("YOU MADE A "+scene.pic.name+"!") : isMaze ? "MAZE SOLVED!" : "LEVEL CLEAR!";
    $("#newSticker").textContent=sticker;
    $("#gotText").textContent = (S.name?S.name+", ":"") + (isDots ? ("you drew a "+scene.pic.name.toLowerCase()+"! 🪙 "+(S.coins||0)) : isMaze ? ("you found the way out! 🪙 "+(S.coins||0)) : ("you earned a "+sticker+" sticker! 🪙 "+(S.coins||0)));
    $("#keepGoingBtn").textContent="▶ Map"; $("#keepGoingBtn").dataset.action="map";
    if(scene.isBoss){ sndBoss(); burstConfetti(80); } else { sndClear(); burstConfetti(55); }
    save();
    setTimeout(()=>{ stopSceneLoop(); $("#celebrate").classList.remove("hidden"); }, 650);
  }

  /* ===================== OVERWORLD MAP (walk with arrow keys) ===================== */
  const mcanvas=$("#mapCanvas"), MX=mcanvas.getContext("2d");
  const MVW=320, MVH=150, MGY=118;
  const omap={ raf:0, running:false, pos:0, anim:null, cam:0, t:0, nodeX:[], nodeY:[] };
  function layoutMap(){ omap.nodeX=[]; omap.nodeY=[]; const sp=48; for(let i=0;i<TOTAL_NODES;i++){ omap.nodeX[i]=34+i*sp; omap.nodeY[i]=70+Math.sin(i*0.85)*22; } }
  function mr(x,y,w,h,c){ MX.fillStyle=c; MX.fillRect(x|0,y|0,Math.ceil(w),Math.ceil(h)); }
  function memoji(ch,x,y,s){ MX.font=s+"px serif"; MX.textAlign="center"; MX.textBaseline="alphabetic"; MX.fillText(ch,x,y); }
  function startMapLoop(){ if(omap.running) return; omap.running=true; omap.raf=requestAnimationFrame(drawMap); }
  function stopMapLoop(){ omap.running=false; cancelAnimationFrame(omap.raf); }
  function openMap(){ if(!omap.nodeX.length) layoutMap(); omap.pos=clamp(S.node,0,TOTAL_NODES-1); omap.anim=null;
    $("#mapTitle").textContent="🗺️ "+WORLDS[nodeMeta[omap.pos].world].name; startMapLoop(); showScreen("map"); }
  function heroXY(){ if(omap.anim){ const k=clamp((omap.t-omap.anim.t0)/omap.anim.dur,0,1); return { x:lerp(omap.nodeX[omap.anim.from],omap.nodeX[omap.anim.to],k), y:lerp(omap.nodeY[omap.anim.from],omap.nodeY[omap.anim.to],k)-Math.sin(k*Math.PI)*12, walking:true }; }
    return { x:omap.nodeX[omap.pos], y:omap.nodeY[omap.pos], walking:false }; }
  function drawMap(ts){ if(!omap.running) return; omap.t=ts;
    if(omap.anim && (ts-omap.anim.t0)>=omap.anim.dur){ omap.pos=omap.anim.to; omap.anim=null; $("#mapTitle").textContent="🗺️ "+WORLDS[nodeMeta[omap.pos].world].name; }
    const hero=heroXY(); const worldW=omap.nodeX[TOTAL_NODES-1]+50;
    omap.cam=clamp(hero.x-MVW/2,0,Math.max(0,worldW-MVW)); const cam=omap.cam;
    const g=MX.createLinearGradient(0,0,0,MVH); g.addColorStop(0,"#bfe3ff"); g.addColorStop(1,"#eef9ff"); MX.fillStyle=g; MX.fillRect(0,0,MVW,MVH);
    // rolling hills
    MX.fillStyle="#bfe9c0"; for(let i=-1;i<8;i++){ const hx=i*70-(cam*0.5)%70; MX.beginPath(); MX.arc(hx+35,MGY+8,40,Math.PI,0); MX.fill(); }
    mr(0,MGY+6,MVW,MVH-MGY,"#8fd98a"); mr(0,MGY+6,MVW,3,"rgba(255,255,255,.3)");
    // path between nodes (bright up to frontier, dim beyond)
    MX.lineCap="round"; MX.lineWidth=5;
    for(let i=0;i<TOTAL_NODES-1;i++){ MX.strokeStyle=(i<S.node)?"#e7b85e":"rgba(150,130,170,.4)"; MX.setLineDash([2,7]);
      MX.beginPath(); MX.moveTo(omap.nodeX[i]-cam,omap.nodeY[i]); MX.lineTo(omap.nodeX[i+1]-cam,omap.nodeY[i+1]); MX.stroke(); }
    MX.setLineDash([]);
    // nodes
    for(let i=0;i<TOTAL_NODES;i++){ const x=omap.nodeX[i]-cam,y=omap.nodeY[i]; if(x<-26||x>MVW+26) continue;
      const meta=nodeMeta[i], w=WORLDS[meta.world]; const locked=i>S.node, done=i<S.node;
      mr(x-13,y-13,26,26, locked?"#d6cfe2":done?"#c6f0cb":"#fff4bf");
      MX.strokeStyle="#3a2a5a"; MX.lineWidth=2; MX.strokeRect(x-13,y-13,26,26);
      if(meta.boss) memoji(w.boss.emoji,x,y+7,17); else if(locked) memoji("🔒",x,y+6,12); else if(done) memoji("⭐",x,y+7,14); else if(meta.kind==="dots") memoji("🎨",x,y+6,14); else if(meta.kind==="maze") memoji("🧩",x,y+6,14); else memoji(String(meta.idx+1),x,y+6,13);
    }
    // hero on top of current node
    drawHero(MX, hero.x-cam, hero.y+6, Math.floor(ts/150)%2, false, S.buddy);
    // "press play" bubble when standing still
    if(!hero.walking){ const x=hero.x-cam, by=hero.y-50; const bw=62,bh=15; MX.fillStyle="#fff"; MX.strokeStyle="#3a2a5a"; MX.lineWidth=2; MX.fillRect(x-bw/2,by,bw,bh); MX.strokeRect(x-bw/2,by,bw,bh); MX.fillStyle="#3a2a5a"; MX.font="bold 9px ui-monospace,monospace"; MX.textAlign="center"; MX.fillText("PRESS ↵",x,by+11); }
    omap.raf=requestAnimationFrame(drawMap);
  }
  function mapWalk(dir){ if(omap.anim) return; const to=omap.pos+dir; if(to<0||to>=TOTAL_NODES||to>S.node) return; omap.anim={from:omap.pos,to,t0:omap.t,dur:400}; blip(560,.05,"square",.07); }
  function mapEnter(){ if(omap.anim) return; startLevel(omap.pos); }
  function showBanner(wi){ $("#bannerWorld").textContent="WORLD "+(wi+1); $("#bannerSub").textContent=WORLDS[wi].name;
    const b=$("#banner"); b.classList.remove("hidden"); setTimeout(()=>b.classList.add("hidden"),1500); }
  const POWER={ fingerMagic:["✨ FINGER MAGIC! ✨","Now rest your hands: A S D F · J K L — we'll show the finger!"], space:["⭐ NEW POWER-UP! ⭐","SPACE BAR — tap it with your THUMB"], numbers:["⭐ NEW POWER-UP! ⭐","NUMBERS — use the top row"], capitals:["⭐ NEW POWER-UP! ⭐","BIG letters — hold SHIFT"], punct:["⭐ NEW POWER-UP! ⭐",". , ! ?  — hold Shift for ! and ?"] };
  function showPowerup(key){ const p=POWER[key]; if(!p) return; $("#bannerWorld").textContent=p[0]; $("#bannerSub").textContent=p[1];
    const b=$("#banner"); b.classList.remove("hidden"); sndClear(); burstConfetti(45); clearTimeout(showPowerup._t); showPowerup._t=setTimeout(()=>b.classList.add("hidden"),2400); }

  /* ===================== SCREENS ===================== */
  function showScreen(name){ ["start","intro","map","game"].forEach(s=>$("#"+s).classList.toggle("hidden", s!==name)); }

  /* ===================== INTRO / HOW-TO-PLAY ===================== */
  function visualStory(){ return `<div class="intro-story"><span class="dust">✨</span><span class="rival" style="bottom:34px">🪙</span><span class="hero">${buddyFace()}</span><span class="goal">🚩</span></div>`; }
  function visualHands(){
    const L=[["A","pinky"],["S","ring"],["D","middle"],["F","index"]], Rr=[["J","index"],["K","middle"],["L","ring"],[";","pinky"]];
    const keys=arr=>arr.map(([c,f])=>`<span class="hk-key f-${f}${(c==="F"||c==="J")?" bump":""}">${c}</span>`).join("");
    const hand=(side,order)=>`<div class="hk-hand ${side}">`+order.map(f=>`<i class="hk-finger ${f}"></i>`).join("")+`<i class="hk-thumb"></i></div>`;
    return `<div class="hk">
      <div class="hk-row">${hand("left",["pinky","ring","middle","index"])}${hand("right",["index","middle","ring","pinky"])}</div>
      <div class="hk-row"><div class="hk-group">${keys(L)}</div><div class="hk-mid">✋</div><div class="hk-group">${keys(Rr)}</div></div>
      <div class="hk-space">⎵ SPACE — use your thumbs 👍</div>
    </div>`;
  }
  function visualPlay(){ return `<div class="intro-play"><span class="glowkey">F</span><div class="ifinger">press the key that glows!</div></div>`; }
  function visualMap(){ return `<div class="intro-story" style="font-size:2rem"><span class="rival" style="bottom:30px">🗺️</span><span class="hero">${buddyFace()}</span><span class="goal">🚩</span></div>`; }
  const STEP_STORY={ title:"RAINBOW QUEST", text:"Run and jump your unicorn through magical worlds! 🌈 Press letters (and later words like JUMP and ZAP) to leap over gaps, bop baddies, and grab coins. Take on maze & dot‑to‑dot side‑quests, and beat the boss in each world!", visual:visualStory };
  const STEP_FIND={ title:"FIND THE KEY", text:"A letter pops up and its key GLOWS on the keyboard — just find it and press it! Use any finger you like to start. The more you play, the faster you'll know where every key is. 🔎", visual:visualPlay };
  const STEP_HANDS={ title:"HANDS ON HOME BASE", text:"Later you'll rest BOTH hands here: left fingers on A S D F, right fingers on J K L. Feel the bumps on F and J to find home base without looking! 🤚", visual:visualHands };
  const STEP_MAP={ title:"EXPLORE THE MAP", text:"Walk around the adventure map with the ⬅️ ➡️ arrow keys, then press ↵ (Enter) or SPACE to play a level. Ready? Let's go! 🗺️", visual:visualMap };
  const INTRO=[STEP_STORY,STEP_FIND,STEP_MAP];               // gentle first run
  const INTRO_FULL=[STEP_STORY,STEP_FIND,STEP_HANDS,STEP_MAP]; // full "how to play"
  let introList=INTRO, introStep=0;
  function renderIntro(){ const s=introList[introStep]; $("#introTitle").textContent=s.title; $("#introText").textContent=s.text; $("#introVisual").innerHTML=s.visual();
    $("#introNext").textContent = introStep===introList.length-1 ? "Let's go! 🏁" : "Next ▶";
    $("#introDots").innerHTML=introList.map((_,i)=>`<span class="dot${i===introStep?" on":""}"></span>`).join(""); }
  function openIntro(full){ introList = full?INTRO_FULL:INTRO; introStep=0; renderIntro(); showScreen("intro"); }
  function finishIntro(){ S.seenIntro=true; save(); openMap(); }
  $("#introNext").addEventListener("click",()=>{ if(introStep<introList.length-1){ introStep++; renderIntro(); } else finishIntro(); });
  $("#introSkip").addEventListener("click",finishIntro);
  $("#howtoBtn").addEventListener("click",()=>openIntro(true));

  function selectBuddy(b){ S.buddy=b; document.querySelectorAll(".buddy-btn").forEach(x=>x.classList.toggle("selected",x.dataset.buddy===b)); }
  document.querySelectorAll(".buddy-btn").forEach(b=>b.addEventListener("click",()=>selectBuddy(b.dataset.buddy)));
  selectBuddy(S.buddy); $("#nameInput").value=S.name||"";

  function startGame(){ S.name=$("#nameInput").value.trim().slice(0,12); save(); audio(); if(!S.seenIntro){ openIntro(); } else { openMap(); } }
  $("#playBtn").addEventListener("click",startGame);

  $("#enterBtn").addEventListener("click",mapEnter);
  $("#mapLeft").addEventListener("click",()=>mapWalk(-1));
  $("#mapRight").addEventListener("click",()=>mapWalk(1));
  $("#mapBtn").addEventListener("click",()=>{ if(race.active){ race.active=false; stopSceneLoop(); } openMap(); });
  $("#keepGoingBtn").addEventListener("click",()=>{ $("#celebrate").classList.add("hidden"); busy=false;
    const act=$("#keepGoingBtn").dataset.action; if(act==="retry"){ startLevel(currentNode); } else { openMap(); } });

  // tip
  function showTip(){ if(!fingerOn()) return; const t=$("#tip"); t.classList.remove("hidden"); clearTimeout(tipT); tipT=setTimeout(()=>t.classList.add("hidden"),9000); }
  $("#tipClose").addEventListener("click",()=>$("#tip").classList.add("hidden"));

  // sticker book
  function openBook(){ const grid=$("#stickerGrid"); grid.innerHTML=""; const earned=S.stickers, slots=Math.max(15,earned.length);
    for(let i=0;i<slots;i++){ const d=document.createElement("div"); if(i<earned.length){ d.className="slot"; d.textContent=earned[i]; } else { d.className="slot empty"; d.textContent="?"; } grid.appendChild(d); }
    $("#book").classList.remove("hidden"); }
  $("#bookBtn").addEventListener("click",openBook);
  $("#closeBookBtn").addEventListener("click",()=>$("#book").classList.add("hidden"));

  // prefs / mute
  function applyPrefs(){ $("#hands").classList.toggle("off",!fingerOn()); $("#fingerLabel").classList.toggle("off",!fingerOn());
    kbEl.classList.toggle("no-home",!S.homeMarkers); $("#fingerToggle").textContent=S.fingerHelper?"On":"Off"; $("#homeToggle").textContent=S.homeMarkers?"On":"Off"; applyKeyboardReveal(); refreshMute(); }
  function refreshMute(){ $("#muteBtn").textContent=S.muted?"🔇":"🔊"; $("#muteBtn2").textContent=S.muted?"Off":"On"; }
  function toggleMute(){ S.muted=!S.muted; refreshMute(); save(); if(!S.muted) blip(660,.1,"square",.12); }
  $("#muteBtn").addEventListener("click",toggleMute); $("#muteBtn2").addEventListener("click",toggleMute);
  $("#fingerToggle").addEventListener("click",()=>{ S.fingerHelper=!S.fingerHelper; applyPrefs(); updateFinger(); save(); });
  $("#homeToggle").addEventListener("click",()=>{ S.homeMarkers=!S.homeMarkers; applyPrefs(); save(); });

  // grown-up
  function openGear(){ $("#levelBadge").textContent=Math.round(S.skill)+" / "+MAX_SKILL; $("#levelDesc").textContent=stageForSkill(S.skill).desc; $("#grownup").classList.remove("hidden"); }
  $("#gearBtn").addEventListener("click",openGear); $("#grownupLink").addEventListener("click",openGear);
  $("#closeGearBtn").addEventListener("click",()=>$("#grownup").classList.add("hidden"));
  $("#easierBtn").addEventListener("click",()=>{ S.skill=Math.max(1,S.skill-1); history=[]; applyKeyboardReveal(); save(); openGear(); if(race.active) nextTarget(); });
  $("#harderBtn").addEventListener("click",()=>{ S.skill=Math.min(MAX_SKILL,S.skill+1); history=[]; checkUnlock(); applyKeyboardReveal(); save(); openGear(); if(race.active) nextTarget(); });
  $("#resetBtn").addEventListener("click",()=>{ localStorage.removeItem(SAVE_KEY); S=Object.assign({},DEFAULT); S.unlocked=freshUnlocked(); history=[]; lastWords=[];
    applyPrefs(); selectBuddy(S.buddy); $("#grownup").classList.add("hidden"); $("#coins").textContent=0; stopSceneLoop(); race.active=false; showScreen("start"); });

  // physical keyboard — drives both the overworld (arrows) and the typing levels
  addEventListener("keydown",e=>{
    if(!$("#map").classList.contains("hidden")){
      if(e.key==="ArrowRight"){ e.preventDefault(); mapWalk(1); }
      else if(e.key==="ArrowLeft"){ e.preventDefault(); mapWalk(-1); }
      else if(e.key==="Enter"||e.key===" "||e.key==="ArrowUp"){ e.preventDefault(); mapEnter(); }
      return;
    }
    if(!$("#game").classList.contains("hidden")){ if(e.key===" ") e.preventDefault(); if(e.key&&e.key.length===1) routeChar(e.key); }
  });

  /* ===================== CONFETTI ===================== */
  const cc=$("#confetti"), cx=cc.getContext("2d"); let parts=[], rafOn=false;
  function csize(){ cc.width=innerWidth; cc.height=innerHeight; } csize(); addEventListener("resize",csize);
  const CEMO=["🌈","⭐","🦄","🍓","✨","🎉","🩰","🎡","🌸","🪙"];
  function burstConfetti(n){ for(let i=0;i<n;i++) parts.push({x:Math.random()*cc.width,y:-20-Math.random()*60,vx:(Math.random()-.5)*3,vy:2+Math.random()*3,rot:Math.random()*6.28,vr:(Math.random()-.5)*.25,sz:18+Math.random()*20,ch:CEMO[(Math.random()*CEMO.length)|0]}); if(!rafOn) cloop(); }
  function cloop(){ rafOn=true; cx.clearRect(0,0,cc.width,cc.height); parts.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=.04; p.rot+=p.vr; cx.save(); cx.translate(p.x,p.y); cx.rotate(p.rot); cx.font=p.sz+"px serif"; cx.textAlign="center"; cx.fillText(p.ch,0,0); cx.restore(); }); parts=parts.filter(p=>p.y<cc.height+40); if(parts.length) requestAnimationFrame(cloop); else { cx.clearRect(0,0,cc.width,cc.height); rafOn=false; } }

  /* ===================== INIT ===================== */
  buildKeyboard(); buildHands(); applyPrefs(); $("#coins").textContent=S.coins||0;
  // show the F/J tip the first time she enters a level
  const _startLevel=startLevel;
  startLevel=function(n){ _startLevel(n); if(fingerOn() && !startLevel._tipped){ startLevel._tipped=true; showTip(); } };
})();
