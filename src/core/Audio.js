// ============================================================
// Sonido procedural con Web Audio API.
// No usa archivos externos: todos los efectos y el ambiente
// se sintetizan en tiempo real.
// ============================================================

class AudioManager {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this.droneGain = null;
    this.ghostGain = null;
    this.noiseBuf = null;
    this.ambient = false;
    this._lastScare = 0;
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.9;
    this.master.connect(this.ctx.destination);
    this.noiseBuf = this._makeNoise();
    this._buildAmbient();
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  setMuted(m) {
    this.muted = !!m;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.muted ? 0 : 0.9, this.ctx.currentTime, 0.05);
    }
  }

  // ---------- Ambiente ----------
  _makeNoise() {
    const len = Math.floor(this.ctx.sampleRate * 1.5);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  _buildAmbient() {
    const ctx = this.ctx;

    // Zumbido grave del hotel
    this.droneGain = ctx.createGain();
    this.droneGain.gain.value = 0;
    this.droneGain.connect(this.master);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 160;
    lp.Q.value = 0.8;
    lp.connect(this.droneGain);

    const o1 = ctx.createOscillator();
    o1.type = 'sawtooth';
    o1.frequency.value = 46;
    const g1 = ctx.createGain();
    g1.gain.value = 0.5;
    o1.connect(g1).connect(lp);
    o1.start();

    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = 55.5;
    const g2 = ctx.createGain();
    g2.gain.value = 0.6;
    o2.connect(g2).connect(lp);
    o2.start();

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.03;
    lfo.connect(lfoGain).connect(this.droneGain.gain);
    lfo.start();

    // Canal de proximidad de fantasmas
    this.ghostGain = ctx.createGain();
    this.ghostGain.gain.value = 0;
    this.ghostGain.connect(this.master);

    const wh = ctx.createOscillator();
    wh.type = 'sine';
    wh.frequency.value = 174;
    const wh2 = ctx.createOscillator();
    wh2.type = 'sine';
    wh2.frequency.value = 181;
    const whGain = ctx.createGain();
    whGain.gain.value = 0.5;
    wh.connect(whGain);
    wh2.connect(whGain);
    whGain.connect(this.ghostGain);

    const vib = ctx.createOscillator();
    vib.frequency.value = 0.9;
    const vibGain = ctx.createGain();
    vibGain.gain.value = 6;
    vib.connect(vibGain).connect(wh.detune);
    vib.start();

    wh.start();
    wh2.start();
  }

  startAmbient() {
    this.init();
    if (!this.droneGain) return;
    this.droneGain.gain.setTargetAtTime(this.muted ? 0 : 0.05, this.ctx.currentTime, 0.6);
    this.ambient = true;
  }

  stopAmbient() {
    if (!this.ctx) return;
    if (this.droneGain) this.droneGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
    if (this.ghostGain) this.ghostGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
    this.ambient = false;
  }

  setGhostIntensity(v) {
    if (!this.ctx || !this.ghostGain) return;
    const vol = this.muted ? 0 : Math.max(0, Math.min(1, v)) * 0.09;
    this.ghostGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.25);
  }

  // ---------- Primitivas ----------
  tone({ type = 'sine', f0 = 220, f1 = f0, dur = 0.4, vol = 0.1, attack = 0.01, delay = 0 } = {}) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  noise({ dur = 0.2, vol = 0.12, freq = 800, q = 0.8, type = 'bandpass', delay = 0 } = {}) {
    if (!this.ctx || !this.noiseBuf) return;
    const t = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const filt = this.ctx.createBiquadFilter();
    filt.type = type;
    filt.frequency.value = freq;
    filt.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filt).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + dur + 0.05);
  }

  // ---------- Efectos ----------
  sfx(name) {
    if (!this.ctx) return;
    switch (name) {
      case 'click':
        this.tone({ type: 'triangle', f0: 340, f1: 240, dur: 0.09, vol: 0.05 });
        break;
      case 'step':
        this.noise({ dur: 0.08, vol: 0.045, freq: 380 + Math.random() * 160, q: 1.2 });
        this.tone({ type: 'sine', f0: 90, f1: 60, dur: 0.09, vol: 0.03 });
        break;
      case 'hurt':
        this.tone({ type: 'sawtooth', f0: 180, f1: 50, dur: 0.35, vol: 0.18 });
        this.noise({ dur: 0.15, vol: 0.1, freq: 500, type: 'lowpass' });
        break;
      case 'scare':
        this.tone({ type: 'sine', f0: 300, f1: 320, dur: 0.6, vol: 0.045, attack: 0.04 });
        this.tone({ type: 'sine', f0: 377, f1: 360, dur: 0.6, vol: 0.045, attack: 0.04 });
        this.tone({ type: 'sine', f0: 449, f1: 470, dur: 0.6, vol: 0.04, attack: 0.04 });
        break;
      case 'twins':
        this.tone({ type: 'sine', f0: 660, f1: 660, dur: 2.2, vol: 0.04, attack: 0.8 });
        this.tone({ type: 'sine', f0: 992, f1: 988, dur: 2.0, vol: 0.03, attack: 0.9 });
        this.noise({ dur: 1.4, vol: 0.03, freq: 3000, q: 0.6, type: 'highpass' });
        break;
      case 'win': {
        const notes = [392, 494, 587, 784, 988];
        notes.forEach((f, i) => {
          this.tone({ type: 'triangle', f0: f, f1: f, dur: 0.6, vol: 0.09, delay: i * 0.15 });
        });
        break;
      }
      case 'lose':
        this.tone({ type: 'sine', f0: 120, f1: 35, dur: 2.4, vol: 0.16 });
        this.noise({ dur: 2.0, vol: 0.1, freq: 120, type: 'lowpass' });
        break;
      case 'heartbeat':
        this.tone({ type: 'sine', f0: 62, f1: 50, dur: 0.12, vol: 0.18 });
        this.tone({ type: 'sine', f0: 58, f1: 46, dur: 0.12, vol: 0.14, delay: 0.22 });
        break;
      default:
        break;
    }
  }
}

export const audio = new AudioManager();
