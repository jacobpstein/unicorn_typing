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
  WORLDS.forEach((w,wi)=>{ for(let l=0;l<w.levels;l++) nodeMeta.push({world:wi,idx:l,boss:false}); nodeMeta.push({world:wi,idx:w.levels,boss:true}); });
  const TOTAL_NODES = nodeMeta.length;

  /* ===================== STATE ===================== */
  const SAVE_KEY="rainbowQuest.v2";
  const DEFAULT={ skill:1, buddy:"🦄", name:"", node:0, coins:0, stickers:[], muted:false, fingerHelper:true, homeMarkers:true, seenIntro:false, unlocked:{space:false,numbers:false,capitals:false,punct:false} };
  let S=load();
  function freshUnlocked(){ return {space:false,numbers:false,capitals:false,punct:false}; }
  function load(){ let o; try{ const r=localStorage.getItem(SAVE_KEY); o=r?Object.assign({},DEFAULT,JSON.parse(r)):Object.assign({},DEFAULT); }catch(e){ o=Object.assign({},DEFAULT); }
    o.unlocked=Object.assign(freshUnlocked(), o.unlocked||{}); return o; }
  function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify({
    skill:S.skill,buddy:S.buddy,name:S.name,node:S.node,coins:S.coins,stickers:S.stickers,muted:S.muted,fingerHelper:S.fingerHelper,homeMarkers:S.homeMarkers,seenIntro:S.seenIntro,unlocked:S.unlocked
  })); }catch(e){} }

  const MAX_SKILL=16, HISTORY_LEN=6;
  let history=[];
  let cur=null, idx=0, keysCorrect=0, keysWrong=0, wrongThisTarget=0;
  let hintTimer=null, busy=false, lastWords=[], tipT=null, currentNode=0, shiftArmed=false;
  const race={ len:5, step:0, paceMs:6000, rivalMs:30000, startTs:0, active:false, targetTs:0, lost:false };

  const buddyFace=()=>S.buddy;
  const rivalEmoji=()=> S.buddy==="🦄" ? "🌈" : "🦄";

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
    handleChar(ch);
  }
  function updateShiftVisual(){ [keyEls.SHIFT_L,keyEls.SHIFT_R].forEach(k=>{ if(k) k.classList.toggle("shift-on",shiftArmed); }); }
  function applyKeyboardReveal(){ kbEl.classList.toggle("kb-space",S.skill>=10); kbEl.classList.toggle("kb-numbers",S.skill>=11); kbEl.classList.toggle("kb-punct",S.skill>=13); }
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
  function updateFinger(){ clearFinger(); if(!S.fingerHelper||!cur) return; const ff=fingerFor(cur.text[idx],cur.capStrict); if(!ff) return; const l=$("#fingerLabel");
    if(ff.space){ ["L_thumb","R_thumb"].forEach(k=>{ if(fingerEls[k]) fingerEls[k].classList.add("active"); }); l.textContent="👍 Thumbs — space bar!"; l.style.color="var(--f-thumb)"; return; }
    const el=fingerEls[ff.h+"_"+ff.f]; if(el) el.classList.add("active");
    let txt=(ff.h==="L"?"👈 Left ":"👉 Right ")+FINGER_NAME[ff.f]+" finger"; if(ff.shift) txt+=" + hold SHIFT";
    l.textContent=txt; l.style.color=FINGER_COLOR[ff.f]; }

  /* ===================== ADAPTIVE ENGINE ===================== */
  function stageForSkill(skill){ const s=Math.round(skill);
    if(s<=1) return {mode:"letter",wave:1,hint:"always",desc:"Bump keys F & J"};
    if(s===2) return {mode:"letter",wave:2,hint:"always",desc:"Home-row letters"};
    if(s===3) return {mode:"letter",wave:3,hint:"always",desc:"+ top-row letters"};
    if(s===4) return {mode:"letter",wave:4,hint:"delay",desc:"All letters"};
    if(s===5) return {mode:"word",min:3,max:3,hint:"delay",desc:"3-letter words"};
    if(s===6) return {mode:"word",min:3,max:4,hint:"delay",desc:"3–4 letter words"};
    if(s===7) return {mode:"word",min:4,max:5,hint:"onwrong",desc:"4–5 letter words"};
    if(s===8) return {mode:"word",min:5,max:6,hint:"onwrong",desc:"5–6 letter words"};
    if(s===9) return {mode:"word",min:6,max:7,hint:"onwrong",desc:"Big words!"};
    if(s===10) return {mode:"phrase",hint:"delay",desc:"Two words + SPACE bar"};
    if(s===11) return {mode:"number",hint:"always",desc:"Numbers (counting)"};
    if(s===12) return {mode:"capital",hint:"always",desc:"BIG letters (Shift)"};
    if(s===13) return {mode:"punct",hint:"delay",desc:"Punctuation . , ! ?"};
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
  function checkUnlock(){ const m=stageForSkill(S.skill).mode; const map={phrase:"space",number:"numbers",capital:"capitals",punct:"punct"};
    const key=map[m]; if(key && S.unlocked && !S.unlocked[key]){ S.unlocked[key]=true; save(); showPowerup(key); } }
  function updateSkill(){ const recent=history.slice(-HISTORY_LEN); if(recent.length<3) return;
    const acc=recent.reduce((a,r)=>a+r.accuracy,0)/recent.length, ftr=recent.reduce((a,r)=>a+(r.firstTry?1:0),0)/recent.length;
    const before=Math.round(S.skill);
    if(acc>=0.9&&ftr>=0.7) S.skill=Math.min(MAX_SKILL,S.skill+1);
    else if(acc>=0.78) S.skill=Math.min(MAX_SKILL,S.skill+0.5);
    else if(acc<0.5) S.skill=Math.max(1,S.skill-1);
    else if(acc<0.65) S.skill=Math.max(1,S.skill-0.5);
    if(Math.round(S.skill)!==before) history=[]; }
  function handicap(){ const t=(clamp(S.skill,1,16)-1)/15; return 1.8-t*(1.8-1.1); }

  /* ===================== SCENE (8-bit canvas) ===================== */
  const canvas=$("#scene"), X=canvas.getContext("2d");
  const VW=320, VH=140, GROUND_Y=112, SEG=46;
  const scene={ raf:0, running:false, world:null, isBoss:false, len:5,
    heroX:30, heroRenderX:30, anim:null, flagX:0, cam:0, floaters:[], bossScale:1, bossHappy:false, t:0 };

  function r(x,y,w,h,c){ X.fillStyle=c; X.fillRect(x|0,y|0,Math.ceil(w),Math.ceil(h)); }
  function emoji(ch,x,y,size){ X.font=size+"px serif"; X.textAlign="center"; X.textBaseline="alphabetic"; X.fillText(ch,x,y); }

  function startSceneLoop(){ if(scene.running) return; scene.running=true; scene.raf=requestAnimationFrame(drawScene); }
  function stopSceneLoop(){ scene.running=false; cancelAnimationFrame(scene.raf); }

  function drawScene(ts){
    if(!scene.running) return;
    scene.t=ts; const w=scene.world;
    // hero hop tween
    let hop=0;
    if(scene.anim){ const k=(ts-scene.anim.t0)/scene.anim.dur; if(k>=1){ scene.heroRenderX=scene.anim.to; scene.anim=null; } else { scene.heroRenderX=lerp(scene.anim.from,scene.anim.to,k); hop=Math.sin(k*Math.PI)*16; } }
    // rival progress (time based)
    let rivalX=null;
    if(!scene.isBoss && race.active){ const p=(performance.now()-race.startTs)/race.rivalMs; rivalX=30+clamp(p,0,1)*(scene.flagX-30); if(p>=1 && !race.lost){ race.lost=true; finishLevel(false); } }
    // camera
    const maxCam=Math.max(0, scene.flagX+34-VW);
    scene.cam=clamp(scene.heroRenderX-70,0,maxCam);
    const cam=scene.cam;

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
      emoji(buddyFace(), 60, GROUND_Y+6-hop, 26);
      emoji("⭐", 60, GROUND_Y-22-hop, 10);
    } else {
      // coins along the path
      for(let i=0;i<scene.len;i++){ if(race.step>i) continue; const cxw=30+(i+0.7)*SEG; const cx=cxw-cam; if(cx<-12||cx>VW+12) continue;
        const bobv=Math.sin(ts/200+i)*3; const sw=3+Math.round(2*Math.abs(Math.cos(ts/180+i)));
        r(cx-sw, GROUND_Y-26+bobv, sw*2, 12, "#ffcf33"); r(cx-1, GROUND_Y-24+bobv, 2, 8, "#fff3a8"); }
      // goal flag / landmark
      const fx=scene.flagX-cam; if(fx<VW+30){ emoji(scene.world.goal, fx+6, GROUND_Y+8, 30); r(fx-8,GROUND_Y-30,2,38,"#888"); emoji("🚩",fx,GROUND_Y-22,12); }
      // rival
      if(rivalX!=null){ const rx=rivalX-cam; emoji(rivalEmoji(), rx, GROUND_Y+2, 18); }
      // hero
      emoji(buddyFace(), scene.heroRenderX-cam, GROUND_Y+6-hop, 26);
    }

    // floaters (+coins)
    scene.floaters=scene.floaters.filter(f=>{ const k=(ts-f.t0)/700; if(k>=1) return false; X.globalAlpha=1-k; X.fillStyle="#fff"; X.font="bold 11px ui-monospace,monospace"; X.textAlign="center"; X.fillText(f.txt, f.x-cam, f.y-22*k); X.globalAlpha=1; return true; });

    scene.raf=requestAnimationFrame(drawScene);
  }
  function addFloater(txt){ scene.floaters.push({txt, x:scene.heroRenderX, y:GROUND_Y-30, t0:scene.t}); }

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
    if(scene.isBoss){ const b=scene.world.boss; cur={mode:"word",text:b.word,emoji:b.emoji,caption:b.word.toLowerCase(),stage:{mode:"word",hint:"always"},boss:true}; }
    else cur=pickTarget(scene.world.theme);
    idx=0; keysCorrect=0; keysWrong=0; wrongThisTarget=0; race.targetTs=performance.now();
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
    const ms=performance.now()-race.targetTs; race.paceMs=clamp(race.paceMs*0.6+ms*0.4,1800,12000);
    S.coins=(S.coins||0)+4; $("#coins").textContent=S.coins; addFloater("+5🪙"); sndCoin(); save();

    if(scene.isBoss){ scene.bossHappy=true; finishLevel(true); return; }
    race.step++; const to=30+race.step*SEG; scene.anim={from:scene.heroRenderX,to,t0:scene.t,dur:430};
    if(race.step>=scene.len){ finishLevel(true); }
    else { busy=true; setTimeout(()=>{ busy=false; nextTarget(); },600); }
  }

  /* ===================== LEVEL FLOW ===================== */
  function startLevel(node){
    currentNode=node; const meta=nodeMeta[node]; const w=WORLDS[meta.world];
    scene.world=w; scene.isBoss=meta.boss; scene.len=meta.boss?1:5;
    scene.heroX=30; scene.heroRenderX=30; scene.anim=null; scene.floaters=[]; scene.bossHappy=false;
    scene.flagX = meta.boss ? VW*0.62 : 30+scene.len*SEG+30;
    race.step=0; race.active=true; race.lost=false;
    race.rivalMs=clamp(race.paceMs*scene.len*handicap(),6000,60000); race.startTs=performance.now();
    $("#worldName").textContent = w.name + (meta.boss?"  • BOSS":"  • "+(meta.idx+1)+"/"+w.levels);
    $("#coins").textContent=S.coins||0;
    document.body.style.setProperty("--bg1",w.sky[0]); document.body.style.setProperty("--bg2",w.sky[1]);
    showScreen("game"); startSceneLoop();
    busy=false; nextTarget();
    if(meta.idx===0 && !meta.boss) showBanner(meta.world);
  }

  function finishLevel(win){
    if(!race.active) return; race.active=false;
    clearHint(); clearFinger(); if(hintTimer) clearTimeout(hintTimer); busy=true;
    const meta=nodeMeta[currentNode], w=WORLDS[meta.world];
    if(win){
      if(currentNode===S.node && S.node<TOTAL_NODES-1) S.node++;
      else if(currentNode===S.node && S.node===TOTAL_NODES-1) { /* finished all */ }
      const sticker=STICKERS[S.stickers.length%STICKERS.length]; S.stickers.push(sticker);
      $("#wowText").textContent = scene.isBoss ? "WORLD CLEAR!" : "LEVEL CLEAR!";
      $("#newSticker").textContent=sticker;
      $("#gotText").textContent = (S.name?S.name+", ":"") + "you earned a "+sticker+" sticker! 🪙 "+(S.coins||0);
      $("#keepGoingBtn").textContent="▶ Map";
      $("#keepGoingBtn").dataset.action="map";
      if(scene.isBoss){ sndBoss(); burstConfetti(80); } else { sndClear(); burstConfetti(55); }
    } else {
      race.paceMs=clamp(race.paceMs*1.18,1800,12000);
      $("#wowText").textContent="SO CLOSE!";
      $("#newSticker").textContent=rivalEmoji()+"💨";
      $("#gotText").textContent="The unicorn zoomed ahead — try again!";
      $("#keepGoingBtn").textContent="▶ Try again";
      $("#keepGoingBtn").dataset.action="retry";
      sndWrong(); burstConfetti(14);
    }
    save();
    setTimeout(()=>{ stopSceneLoop(); $("#celebrate").classList.remove("hidden"); }, 650);
  }

  /* ===================== MAP ===================== */
  function renderMap(){
    const wrap=$("#mapPath"); wrap.innerHTML="";
    let node=0;
    WORLDS.forEach((w,wi)=>{
      const firstNode=node;
      const lastNode=node+w.levels; // boss index
      const unlocked = S.node>=firstNode;
      const block=document.createElement("div"); block.className="world-block";
      const head=document.createElement("div"); head.className="world-head";
      head.innerHTML=`<span>${w.goal}</span> <span>${w.name}</span> <span class="wlock">${unlocked?"":"🔒"}</span>`;
      block.appendChild(head);
      const nodes=document.createElement("div"); nodes.className="nodes";
      for(let l=0;l<=w.levels;l++){
        const ni=node; const isBoss=(l===w.levels);
        const el=document.createElement("div"); el.className="node"+(isBoss?" boss":"");
        if(ni<S.node) el.classList.add("done");
        if(ni===S.node) el.classList.add("current");
        if(ni>S.node) el.classList.add("locked");
        el.innerHTML = ni<S.node ? "✓" : isBoss ? w.boss.emoji : "<small></small>"+(l+1);
        if(ni===S.node){ const f=document.createElement("div"); f.className="hereflag"; f.textContent=buddyFace(); el.appendChild(f); }
        const playable = ni<=S.node;
        if(playable) el.addEventListener("click",()=>{ startLevel(ni); });
        nodes.appendChild(el); node++;
      }
      block.appendChild(nodes); wrap.appendChild(block);
    });
    $("#enterBtn").textContent = S.node>=TOTAL_NODES-1 && false ? "▶ Enter" : "▶ Enter";
  }
  function showBanner(wi){ $("#bannerWorld").textContent="WORLD "+(wi+1); $("#bannerSub").textContent=WORLDS[wi].name;
    const b=$("#banner"); b.classList.remove("hidden"); setTimeout(()=>b.classList.add("hidden"),1500); }
  const POWER={ space:["⭐ NEW POWER-UP! ⭐","SPACE BAR — tap it with your THUMB"], numbers:["⭐ NEW POWER-UP! ⭐","NUMBERS — use the top row"], capitals:["⭐ NEW POWER-UP! ⭐","BIG letters — hold SHIFT"], punct:["⭐ NEW POWER-UP! ⭐",". , ! ?  — hold Shift for ! and ?"] };
  function showPowerup(key){ const p=POWER[key]; if(!p) return; $("#bannerWorld").textContent=p[0]; $("#bannerSub").textContent=p[1];
    const b=$("#banner"); b.classList.remove("hidden"); sndClear(); burstConfetti(45); clearTimeout(showPowerup._t); showPowerup._t=setTimeout(()=>b.classList.add("hidden"),2400); }

  /* ===================== SCREENS ===================== */
  function showScreen(name){ ["start","intro","map","game"].forEach(s=>$("#"+s).classList.toggle("hidden", s!==name)); }

  /* ===================== INTRO / HOW-TO-PLAY ===================== */
  function visualStory(){ return `<div class="intro-story"><span class="dust">💨</span><span class="rival">${rivalEmoji()}</span><span class="hero">${buddyFace()}</span><span class="goal">🏁</span></div>`; }
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
  function visualPlay(){ return `<div class="intro-play"><span class="glowkey">F</span><div class="ifinger">👈 use your left pointer finger</div></div>`; }
  const INTRO=[
    { title:"RAINBOW QUEST", text:"Sparkle the unicorn wants to RACE across magical worlds! 🌈 Type the letters to zoom ahead, collect coins, and explore. Each world ends with a friendly boss to beat with a magic word!", visual:visualStory },
    { title:"HANDS ON HOME BASE", text:"Put BOTH hands on the keyboard like this. Left fingers rest on A S D F. Right fingers rest on J K L. Feel the little bumps on F and J — that's how you find home base without looking! 🤚", visual:visualHands },
    { title:"READY TO RACE", text:"A key will GLOW to show what to press, and the hands show which finger to use. Keep your fingers on home base and reach from there. Ready? Let's go! 🏁", visual:visualPlay }
  ];
  let introStep=0;
  function renderIntro(){ const s=INTRO[introStep]; $("#introTitle").textContent=s.title; $("#introText").textContent=s.text; $("#introVisual").innerHTML=s.visual();
    $("#introNext").textContent = introStep===INTRO.length-1 ? "Let's go! 🏁" : "Next ▶";
    $("#introDots").innerHTML=INTRO.map((_,i)=>`<span class="dot${i===introStep?" on":""}"></span>`).join(""); }
  function openIntro(){ introStep=0; renderIntro(); showScreen("intro"); }
  function finishIntro(){ S.seenIntro=true; save(); renderMap(); showScreen("map"); }
  $("#introNext").addEventListener("click",()=>{ if(introStep<INTRO.length-1){ introStep++; renderIntro(); } else finishIntro(); });
  $("#introSkip").addEventListener("click",finishIntro);
  $("#howtoBtn").addEventListener("click",openIntro);

  function selectBuddy(b){ S.buddy=b; document.querySelectorAll(".buddy-btn").forEach(x=>x.classList.toggle("selected",x.dataset.buddy===b)); }
  document.querySelectorAll(".buddy-btn").forEach(b=>b.addEventListener("click",()=>selectBuddy(b.dataset.buddy)));
  selectBuddy(S.buddy); $("#nameInput").value=S.name||"";

  function startGame(){ S.name=$("#nameInput").value.trim().slice(0,12); save(); audio(); if(!S.seenIntro){ openIntro(); } else { renderMap(); showScreen("map"); } }
  $("#playBtn").addEventListener("click",startGame);

  $("#enterBtn").addEventListener("click",()=>startLevel(S.node));
  $("#mapBtn").addEventListener("click",()=>{ if(race.active){ race.active=false; stopSceneLoop(); } renderMap(); showScreen("map"); });
  $("#keepGoingBtn").addEventListener("click",()=>{ $("#celebrate").classList.add("hidden"); busy=false;
    const act=$("#keepGoingBtn").dataset.action; if(act==="retry"){ startLevel(currentNode); } else { renderMap(); showScreen("map"); } });

  // tip
  function showTipSoon(){ if(!S.fingerHelper) return; }
  function showTip(){ if(!S.fingerHelper) return; const t=$("#tip"); t.classList.remove("hidden"); clearTimeout(tipT); tipT=setTimeout(()=>t.classList.add("hidden"),9000); }
  $("#tipClose").addEventListener("click",()=>$("#tip").classList.add("hidden"));

  // sticker book
  function openBook(){ const grid=$("#stickerGrid"); grid.innerHTML=""; const earned=S.stickers, slots=Math.max(15,earned.length);
    for(let i=0;i<slots;i++){ const d=document.createElement("div"); if(i<earned.length){ d.className="slot"; d.textContent=earned[i]; } else { d.className="slot empty"; d.textContent="?"; } grid.appendChild(d); }
    $("#book").classList.remove("hidden"); }
  $("#bookBtn").addEventListener("click",openBook);
  $("#closeBookBtn").addEventListener("click",()=>$("#book").classList.add("hidden"));

  // prefs / mute
  function applyPrefs(){ $("#hands").classList.toggle("off",!S.fingerHelper); $("#fingerLabel").classList.toggle("off",!S.fingerHelper);
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
  $("#resetBtn").addEventListener("click",()=>{ localStorage.removeItem(SAVE_KEY); S=Object.assign({},DEFAULT); S.unlocked=freshUnlocked(); history=[]; lastWords=[]; race.paceMs=6000;
    applyPrefs(); selectBuddy(S.buddy); $("#grownup").classList.add("hidden"); $("#coins").textContent=0; stopSceneLoop(); race.active=false; showScreen("start"); });

  // physical keyboard
  addEventListener("keydown",e=>{ if(!$("#game").classList.contains("hidden")){ if(e.key===" ") e.preventDefault(); if(e.key&&e.key.length===1) handleChar(e.key); } });

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
  startLevel=function(n){ _startLevel(n); if(!startLevel._tipped){ startLevel._tipped=true; showTip(); } };
})();
