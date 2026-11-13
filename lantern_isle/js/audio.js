'use strict';

/* Sound effects, music and speech. Everything is generated in the browser. */

const Sfx = {
  ctx: null,
  master: null,

  init() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.55;
        this.master.connect(this.ctx.destination);
      } catch (e) { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  on() { return !!this.ctx && !S.settings.sfxOff; },

  tone(freq, start, dur, { type = 'sine', vol = 0.2, slide = null, attack = 0.01, dest = null } = {}) {
    const c = this.ctx, t = c.currentTime + start;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(dest || this.master);
    o.start(t);
    o.stop(t + dur + 0.05);
  },

  noise(start, dur, { vol = 0.2, freq = 1800, q = 1 } = {}) {
    const c = this.ctx, t = c.currentTime + start;
    const len = Math.ceil(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    const g = c.createGain();
    g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(this.master);
    src.start(t);
  },

  chime() {
    if (!this.on()) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      this.tone(f, i * 0.07, 0.55, { type: 'triangle', vol: 0.16 });
      this.tone(f * 2, i * 0.07, 0.3, { vol: 0.035 });
    });
  },
  bloop() {
    if (!this.on()) return;
    this.tone(392, 0, 0.32, { vol: 0.16, slide: 210 });
    this.tone(294, 0.12, 0.3, { vol: 0.08, slide: 180 });
  },
  pop() { if (this.on()) this.tone(900, 0, 0.12, { vol: 0.14, slide: 320 }); },
  click() { if (this.on()) this.tone(740, 0, 0.06, { vol: 0.06, type: 'triangle' }); },
  plink(i = 0) {
    if (!this.on()) return;
    const scale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5, 1567.98, 1760];
    const f = scale[Math.min(i, scale.length - 1)];
    this.tone(f, 0, 0.45, { type: 'triangle', vol: 0.15 });
    this.tone(f * 2, 0, 0.2, { vol: 0.03 });
  },
  sparkle() {
    if (!this.on()) return;
    for (let i = 0; i < 7; i++) this.tone(1400 + Math.random() * 1600, i * 0.05, 0.25, { vol: 0.05 });
  },
  whoosh() { if (this.on()) this.noise(0, 0.5, { vol: 0.25, freq: 900, q: 0.7 }); },
  snip() {
    if (!this.on()) return;
    this.noise(0, 0.06, { vol: 0.5, freq: 4000, q: 2 });
    this.noise(0.12, 0.06, { vol: 0.5, freq: 4200, q: 2 });
  },
  fanfare() {
    if (!this.on()) return;
    const n = [[523.25, 0, .18], [659.25, .18, .18], [783.99, .36, .18], [1046.5, .54, .6], [987.77, .9, .2], [1046.5, 1.1, .8]];
    n.forEach(([f, s, d]) => { this.tone(f, s, d + .2, { type: 'triangle', vol: .16 }); this.tone(f / 2, s, d + .2, { type: 'sine', vol: .08 }); });
  },
  applause(sec = 2.6) {
    if (!this.on()) return;
    for (let i = 0; i < sec * 40; i++) {
      this.noise(Math.random() * sec, 0.05, { vol: 0.12 + Math.random() * 0.15, freq: 1200 + Math.random() * 2200, q: 1.2 });
    }
  },

  /* Platformer sounds */
  jump() { if (this.on()) this.tone(330, 0, 0.16, { type: 'square', vol: 0.05, slide: 700 }); },
  stomp() {
    if (!this.on()) return;
    this.tone(260, 0, 0.14, { type: 'triangle', vol: 0.25, slide: 90 });
    this.noise(0, 0.08, { vol: 0.25, freq: 500, q: 0.8 });
  },
  coin() {
    if (!this.on()) return;
    this.tone(988, 0, 0.07, { type: 'square', vol: 0.045 });
    this.tone(1319, 0.06, 0.22, { type: 'square', vol: 0.045 });
  },
  boing() {
    if (!this.on()) return;
    this.tone(420, 0, 0.4, { type: 'sine', vol: 0.2, slide: 140 });
    this.tone(210, 0.05, 0.3, { type: 'triangle', vol: 0.08, slide: 120 });
  },
  bonk() { if (this.on()) { this.tone(150, 0, 0.12, { type: 'square', vol: 0.08 }); this.noise(0, 0.06, { vol: 0.2, freq: 300 }); } },
  bump() { if (this.on()) this.tone(200, 0, 0.1, { type: 'triangle', vol: 0.2, slide: 120 }); },
  hurt() {
    if (!this.on()) return;
    this.tone(620, 0, 0.12, { type: 'square', vol: 0.06, slide: 400 });
    this.tone(420, 0.1, 0.25, { type: 'square', vol: 0.06, slide: 200 });
  },
  pound() {
    if (!this.on()) return;
    this.tone(140, 0, 0.3, { type: 'triangle', vol: 0.35, slide: 45 });
    this.noise(0, 0.25, { vol: 0.35, freq: 220, q: 0.6 });
  },
  breakBlock() { if (this.on()) { this.noise(0, 0.25, { vol: 0.4, freq: 900, q: 0.5 }); this.tone(300, 0, 0.15, { type: 'square', vol: 0.05, slide: 100 }); } },
  flap() { if (this.on()) this.noise(0, 0.12, { vol: 0.12, freq: 600, q: 1.5 }); },
  spring() { if (this.on()) this.tone(200, 0, 0.35, { type: 'sine', vol: 0.2, slide: 900 }); },
  bubble() { if (this.on()) { this.tone(500, 0, 0.2, { vol: 0.12, slide: 900 }); this.tone(700, 0.15, 0.2, { vol: 0.1, slide: 1200 }); } },
  powerup() {
    if (!this.on()) return;
    [392, 494, 587, 784, 988, 1175].forEach((f, i) => this.tone(f, i * 0.06, 0.2, { type: 'square', vol: 0.05 }));
  },
  blast() {
    if (!this.on()) return;
    this.noise(0, 0.5, { vol: 0.3, freq: 1500, q: 0.4 });
    this.tone(880, 0, 0.5, { type: 'sawtooth', vol: 0.05, slide: 220 });
  },
  door() { if (this.on()) { this.tone(196, 0, 0.3, { type: 'triangle', vol: 0.15, slide: 392 }); this.chime(); } },
  teleport() { if (this.on()) [600, 800, 1000, 1300].forEach((f, i) => this.tone(f, i * 0.05, 0.15, { vol: 0.07 })); },
  spin() {
    if (!this.on()) return;
    this.noise(0, 0.35, { vol: 0.2, freq: 1400, q: 1.2 });
    this.tone(500, 0, 0.35, { type: 'triangle', vol: 0.08, slide: 1300 });
  },
  light() {
    if (!this.on()) return;
    this.noise(0, 0.18, { vol: 0.18, freq: 2500, q: 0.8 });
    [784, 988, 1319].forEach((f, i) => this.tone(f, 0.05 + i * 0.06, 0.4, { type: 'triangle', vol: 0.1 }));
  },
  puff() { if (this.on()) this.noise(0, 0.25, { vol: 0.15, freq: 700, q: 0.6 }); },
  meow() {
    if (!this.on()) return;
    this.tone(620, 0, 0.18, { type: 'sine', vol: 0.12, slide: 980 });
    this.tone(980, 0.16, 0.3, { type: 'sine', vol: 0.1, slide: 560 });
  },
  purr() {
    if (!this.on()) return;
    for (let i = 0; i < 6; i++) this.noise(i * 0.12, 0.09, { vol: 0.22, freq: 110, q: 0.7 });
  },
  check() { if (this.on()) [523, 659, 784].forEach((f, i) => this.tone(f, i * 0.08, 0.3, { type: 'triangle', vol: 0.14 })); },
};

/*
  A tiny chiptune sequencer. Each track is a string of steps: a note like
  "C5", "." for silence, or "-" to keep holding. Drums use "k" (kick) and "h" (hat).
*/
const SONGS = {
  map: {
    step: 0.15,
    tracks: [
      { type: 'square', vol: 0.035, seq: 'C5 . E5 . G5 . E5 . F5 . A5 . G5 - . . E5 . D5 . C5 . D5 . E5 . C5 - . . G4 . C5 . E5 . G5 . A5 . G5 . F5 . E5 . D5 . E5 . F5 . D5 . C5 - - - . . . .' },
      { type: 'triangle', vol: 0.12, seq: 'C3 . G3 . C3 . G3 . F2 . C3 . F2 . C3 . G2 . D3 . G2 . D3 . C3 . G3 . C3 . G3 .' },
      { drum: true, vol: 0.5, seq: 'k . h . k . h . k . h . k h h .' },
    ],
  },
  halloween: {
    step: 0.16,
    tracks: [
      { type: 'square', vol: 0.032, seq: 'A4 . C5 . E5 . C5 . D#5 . E5 - . . . . F5 . E5 . D5 . C5 . B4 . A4 - . . G#4 . B4 . A4 . C5 . E5 . A5 . G#5 . A5 - E5 . C5 . B4 . A4 - - - . . . .' },
      { type: 'triangle', vol: 0.13, seq: 'A2 . E3 . A2 . E3 . F2 . C3 . F2 . C3 . D2 . A2 . D2 . A2 . E2 . B2 . E2 . G#2 .' },
      { drum: true, vol: 0.45, seq: 'k . . h k . h . k . . h k h h h' },
    ],
  },
  thanksgiving: {
    step: 0.14,
    tracks: [
      { type: 'square', vol: 0.032, seq: 'G4 . B4 . D5 . B4 . C5 . A4 . B4 - . . G4 . A4 . B4 . C5 . D5 . E5 . D5 - . . B4 . D5 . G5 . F#5 . E5 . D5 . C5 . B4 . A4 . B4 . A4 . F#4 . G4 - - - . . . .' },
      { type: 'triangle', vol: 0.13, seq: 'G2 . D3 . G2 . D3 . C3 . G3 . C3 . G3 . D3 . A3 . D3 . A3 . G2 . D3 . G2 . D3 .' },
      { drum: true, vol: 0.45, seq: 'k . h . k h h . k . h . k . h h' },
    ],
  },
  hanukkah: {
    step: 0.13,
    tracks: [
      { type: 'square', vol: 0.032, seq: 'D5 . D#5 . F#5 . G5 . A5 - G5 . F#5 . D#5 . D5 - - . A4 . D5 . F#5 . A5 . A#5 . A5 . G5 . F#5 . G5 . A5 . G5 . F#5 . D#5 . F#5 . D5 - - - . . . .' },
      { type: 'triangle', vol: 0.13, seq: 'D3 . A3 . D3 . A3 . D3 . A3 . D3 . A3 . G2 . D3 . G2 . D3 . A2 . E3 . A2 . C#3 .' },
      { drum: true, vol: 0.45, seq: 'k . h . k h k . k . h . k h h h' },
    ],
  },
  indoor: {
    step: 0.17,
    tracks: [
      { type: 'triangle', vol: 0.09, seq: 'E5 . G5 . B5 . G5 . A5 . F5 . E5 - . . D5 . E5 . F5 . A5 . G#5 . E5 - . . . .' },
      { type: 'square', vol: 0.02, seq: 'E3 . . . E3 . . . F3 . . . F3 . . . D3 . . . D3 . . . E3 . . . G#3 . . .' },
      { drum: true, vol: 0.35, seq: 'k . . . h . . . k . k . h . . .' },
    ],
  },
  boss: {
    step: 0.12,
    tracks: [
      { type: 'square', vol: 0.035, seq: 'E5 E5 . E5 . C5 E5 . G5 . . . G4 . . . C5 . . G4 . . E4 . . A4 . B4 . A#4 A4 . G4 E5 G5 A5 . F5 G5 . E5 . C5 D5 B4 . . .' },
      { type: 'triangle', vol: 0.14, seq: 'C3 C3 C4 C3 C3 C4 C3 C4 A2 A2 A3 A2 A2 A3 A2 A3 F2 F2 F3 F2 G2 G2 G3 G2' },
      { drum: true, vol: 0.5, seq: 'k h k h k h k h k h k h k k k h' },
    ],
  },
  win: {
    step: 0.13,
    tracks: [
      { type: 'square', vol: 0.04, seq: 'C5 E5 G5 C6 - - G5 C6 - - - - . . . .' },
      { type: 'triangle', vol: 0.14, seq: 'C3 - - - G3 - - - C4 - - - . . . .' },
    ],
  },
};

function noteFreq(n) {
  const m = /^([A-G])(#?)(\d)$/.exec(n);
  if (!m) return 0;
  const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0);
  const midi = base + (+m[3] + 1) * 12;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

const Music = {
  bus: null, cur: null, iv: null,

  play(name, { loop = true } = {}) {
    if (this.cur === name) return;
    this.stop();
    this.cur = name;
    if (!Sfx.ctx || S.settings.musicOff) return;
    const song = SONGS[name];
    if (!song) return;
    const c = Sfx.ctx;
    const bus = c.createGain();
    bus.gain.value = Speech.speaking ? 0.3 : 1;
    bus.connect(Sfx.master);
    this.bus = bus;
    const tracks = song.tracks.map(t => {
      const steps = t.seq.trim().split(/\s+/);
      return { ...t, steps };
    });
    const loopLen = Math.max(...tracks.map(t => t.steps.length));
    let i = 0, next = c.currentTime + 0.08;
    const note = (f, t, d, vol, type) => {
      const o = c.createOscillator(), gn = c.createGain();
      o.type = type; o.frequency.value = f;
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(vol, t + 0.01);
      gn.gain.setValueAtTime(vol, t + Math.max(0.02, d - 0.05));
      gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(gn); gn.connect(bus);
      o.start(t); o.stop(t + d + 0.05);
    };
    const drum = (k, t, vol) => {
      if (k === 'k') {
        const o = c.createOscillator(), gn = c.createGain();
        o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
        gn.gain.setValueAtTime(vol * 0.5, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
        o.connect(gn); gn.connect(bus); o.start(t); o.stop(t + 0.2);
      } else if (k === 'h') {
        const len = Math.ceil(c.sampleRate * 0.04);
        const buf = c.createBuffer(1, len, c.sampleRate);
        const d = buf.getChannelData(0);
        for (let j = 0; j < len; j++) d[j] = (Math.random() * 2 - 1) * (1 - j / len);
        const src = c.createBufferSource(); src.buffer = buf;
        const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6000;
        const gn = c.createGain(); gn.gain.value = vol * 0.12;
        src.connect(f); f.connect(gn); gn.connect(bus); src.start(t);
      }
    };
    const schedule = () => {
      while (next < c.currentTime + 0.6) {
        if (!loop && i >= loopLen) { clearInterval(this.iv); this.iv = null; return; }
        for (const tr of tracks) {
          const s = tr.steps[i % tr.steps.length];
          if (tr.drum) { drum(s, next, tr.vol); continue; }
          if (s === '.' || s === '-') continue;
          let len = 1;
          while (tr.steps[(i + len) % tr.steps.length] === '-' && len < 8) len++;
          note(noteFreq(s), next, len * song.step * 0.95, tr.vol, tr.type);
        }
        next += song.step;
        i++;
      }
    };
    schedule();
    this.iv = setInterval(schedule, 120);
  },

  stop() {
    this.cur = null;
    if (this.iv) { clearInterval(this.iv); this.iv = null; }
    if (this.bus && Sfx.ctx) {
      const bus = this.bus, c = Sfx.ctx;
      try {
        bus.gain.setValueAtTime(bus.gain.value, c.currentTime);
        bus.gain.linearRampToValueAtTime(0.0001, c.currentTime + 0.4);
        setTimeout(() => bus.disconnect(), 600);
      } catch (e) { /* ignore */ }
    }
    this.bus = null;
  },

  duck(on) {
    if (this.bus && Sfx.ctx) this.bus.gain.setTargetAtTime(on ? 0.3 : 1, Sfx.ctx.currentTime, 0.08);
  },
};

const Speech = {
  voice: null,
  ok: 'speechSynthesis' in window,
  speaking: false,

  init() {
    if (!this.ok) return;
    this.choose();
    speechSynthesis.onvoiceschanged = () => this.choose();
  },

  voices() {
    if (!this.ok) return [];
    return speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang));
  },

  choose() {
    const vs = this.voices();
    if (!vs.length) return;
    const wanted = S.settings.voice;
    let v = wanted && vs.find(x => x.name === wanted);
    if (!v) v = vs.find(x => /en[-_]US/i.test(x.lang) && /premium/i.test(x.name)) || vs.find(x => /en[-_]US/i.test(x.lang) && /enhanced/i.test(x.name));
    if (!v) {
      const prefs = ['Samantha', 'Ava', 'Allison', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Susan', 'Karen', 'Moira', 'Tessa', 'Serena'];
      for (const p of prefs) { v = vs.find(x => x.name.includes(p)); if (v) break; }
    }
    this.voice = v || vs.find(x => /en-US/i.test(x.lang)) || vs[0];
  },

  /*
    Speech runs through our own one-at-a-time queue instead of the browser's.
    Safari and Chrome can silently drop an utterance spoken right after cancel(),
    or get stuck so nothing ever starts. So we wait a moment after cancelling,
    resume a paused engine, and if a line hasn't started within 1.5s we reset
    the engine and try once more.
  */
  queue: [],
  busy: false,
  gen: 0, // bumped on every stop() so lines queued before it are skipped
  current: null, // keeps the active utterance referenced so it isn't garbage-collected

  stop() {
    if (!this.ok) return;
    this.gen++;
    this.queue.splice(0).forEach(item => item.resolve());
    const cur = this.current;
    speechSynthesis.cancel();
    if (cur) { cur.cancelled = true; cur.fin('ok'); }
  },

  say(text, { rate = 0.9, pitch = 1.08, interrupt = true } = {}) {
    if (!this.ok || !text) return Promise.resolve();
    return new Promise(resolve => {
      if (interrupt) this.stop();
      this.queue.push({ text, rate, pitch, resolve, fresh: interrupt, gen: this.gen });
      if (!this.busy) this.next();
    });
  },

  async next() {
    const item = this.queue.shift();
    if (!item) { this.busy = false; this.speaking = false; Music.duck(false); return; }
    this.busy = true;
    // Give the engine a moment to settle after a cancel before speaking again.
    await sleep(item.fresh ? 120 : 30);
    if (item.gen !== this.gen) { item.resolve(); this.next(); return; }
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await this.speakOne(item);
      if (result !== 'stuck' || item.gen !== this.gen) break;
      speechSynthesis.cancel();
      await sleep(150);
    }
    item.resolve();
    this.next();
  },

  speakOne(item) {
    return new Promise(done => {
      const u = new SpeechSynthesisUtterance(item.text);
      if (this.voice) u.voice = this.voice;
      u.rate = item.rate * (S.settings.speechRate || 1);
      u.pitch = item.pitch;
      const rec = { u, started: false, cancelled: false };
      this.current = rec;
      let finished = false;
      const fin = r => { if (!finished) { finished = true; if (this.current === rec) this.current = null; done(r); } };
      rec.fin = fin;
      u.onstart = () => { rec.started = true; };
      u.onend = () => fin('ok');
      u.onerror = () => fin('ok');
      // Watchdog: never started means the engine is stuck.
      setTimeout(() => { if (!rec.started && !rec.cancelled) fin('stuck'); }, 1500);
      // Safety net: never hang the game even if 'end' never fires.
      setTimeout(() => fin('ok'), 2500 + item.text.length * 120);
      this.speaking = true; Music.duck(true);
      if (speechSynthesis.paused) speechSynthesis.resume();
      speechSynthesis.speak(u);
      if (rec.cancelled) fin('ok');
    });
  },
};
