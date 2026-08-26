/* Ambient soundscape — Web Audio drone, filtered noise, space echo,
   per-constellation blips, random ambient pings.
   Created lazily on first user click (browser autoplay policy).
   Returns an API for the engine to call. */

import { SCALE, FAMS } from '../config/constants';

export interface SoundEngine {
  /** Initialise AudioContext + drone + echo. Call once, on first click. */
  start(): void;
  /** Toggle sound on/off. Returns the new on/off state. */
  toggle(vol: number): Promise<boolean>;
  /** Play a short blip tuned to a constellation's note. */
  blip(fam: string): void;
  /** Play the supernova death-crash sound. */
  supernova(): void;
  /** Re-apply volume (after slider change). */
  applyVol(vol: number): void;
  /** Whether sound is currently on. */
  readonly on: boolean;
  /** The AudioContext (for view cleanup). */
  readonly ctx: AudioContext | null;
}

export function createSoundEngine(
  dead: () => boolean,
): SoundEngine {
  let AC: AudioContext | null = null;
  let droneGain: GainNode | null = null;
  let spaceEcho: DelayNode | null = null;
  let soundOn = false;

  function start(): void {
    try {
      AC = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
    } catch (_) {
      return;
    }
    droneGain = AC!.createGain();
    droneGain.gain.value = 0;
    droneGain.connect(AC!.destination);

    spaceEcho = AC!.createDelay(3);
    spaceEcho.delayTime.value = 0.48;
    const fb = AC!.createGain();
    fb.gain.value = 0.5;
    const damp = AC!.createBiquadFilter();
    damp.type = 'lowpass';
    damp.frequency.value = 1600;
    spaceEcho.connect(damp);
    damp.connect(fb);
    fb.connect(spaceEcho);
    const eo = AC!.createGain();
    eo.gain.value = 0.7;
    spaceEcho.connect(eo);
    eo.connect(droneGain);

    // low drone oscillators
    for (const [f, g0] of [[52, 0.055], [55.5, 0.045]]) {
      const o = AC!.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      const g = AC!.createGain();
      g.gain.value = g0;
      o.connect(g);
      g.connect(droneGain!);
      o.start();
    }

    // filtered noise bed
    const len = 2 * AC!.sampleRate;
    const buf = AC!.createBuffer(1, len, AC!.sampleRate);
    const ch = buf.getChannelData(0);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      lp = lp * 0.97 + (Math.random() * 2 - 1) * 0.03;
      ch[i] = lp * 3;
    }
    const noise = AC!.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const bp = AC!.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 420;
    bp.Q.value = 0.7;
    const ng = AC!.createGain();
    ng.gain.value = 0.16;
    noise.connect(bp);
    bp.connect(ng);
    ng.connect(droneGain!);
    ng.connect(spaceEcho!);
    const lfo = AC!.createOscillator();
    lfo.frequency.value = 0.045;
    const lg = AC!.createGain();
    lg.gain.value = 260;
    lfo.connect(lg);
    lg.connect(bp.frequency);
    lfo.start();
    noise.start();

    // ambient pings
    const ping = () => {
      if (dead()) return;
      if (soundOn && AC!.state === 'running') {
        const f = SCALE[Math.floor(Math.random() * SCALE.length)] * (Math.random() < 0.3 ? 0.5 : 1);
        const o = AC!.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, AC!.currentTime);
        o.frequency.exponentialRampToValueAtTime(f * 0.985, AC!.currentTime + 2.5);
        const g = AC!.createGain();
        g.gain.setValueAtTime(0, AC!.currentTime);
        g.gain.linearRampToValueAtTime(0.05, AC!.currentTime + 0.06);
        g.gain.exponentialRampToValueAtTime(0.0001, AC!.currentTime + 3.5);
        o.connect(g);
        g.connect(droneGain!);
        g.connect(spaceEcho!);
        o.start();
        o.stop(AC!.currentTime + 3.6);
      }
      setTimeout(ping, 2500 + Math.random() * 5500);
    };
    setTimeout(ping, 1200);
  }

  async function toggle(vol: number): Promise<boolean> {
    if (!AC) start();
    if (!AC) return false;
    if (AC.state !== 'running') {
      try { await AC.resume(); } catch (_) { /* empty */ }
    }
    if (AC.state !== 'running') return false;
    soundOn = !soundOn;
    droneGain!.gain.setTargetAtTime(soundOn ? 0.9 * vol : 0, AC.currentTime, 1.2);
    return soundOn;
  }

  function applyVol(vol: number): void {
    if (AC && droneGain && soundOn) {
      droneGain.gain.setTargetAtTime(0.9 * vol, AC.currentTime, 0.4);
    }
  }

  function blip(fam: string): void {
    if (!soundOn || !AC || AC.state !== 'running') return;
    const base = (FAMS[fam] && FAMS[fam].snd) || 480;
    const o = AC.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(base, AC.currentTime);
    o.frequency.exponentialRampToValueAtTime(base * 0.97, AC.currentTime + 0.9);
    const g = AC.createGain();
    g.gain.setValueAtTime(0, AC.currentTime);
    g.gain.linearRampToValueAtTime(0.05, AC.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + 1.1);
    o.connect(g);
    g.connect(droneGain!);
    g.connect(spaceEcho!);
    o.start();
    o.stop(AC.currentTime + 1.2);
  }

  function supernova(): void {
    if (!soundOn || !AC || AC.state !== 'running') return;
    // noise burst — white noise decaying quickly
    const len2 = AC.sampleRate * 1.2;
    const buf = AC.createBuffer(1, len2, AC.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len2; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len2, 2.5);
    const src = AC.createBufferSource();
    src.buffer = buf;
    const lp = AC.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 400;
    const g = AC.createGain();
    g.gain.value = 0.5;
    src.connect(lp);
    lp.connect(g);
    g.connect(droneGain!);
    g.connect(spaceEcho!);
    src.start();
    // sub-bass thud
    const o = AC.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(90, AC.currentTime);
    o.frequency.exponentialRampToValueAtTime(28, AC.currentTime + 1.4);
    const og = AC.createGain();
    og.gain.setValueAtTime(0.4, AC.currentTime);
    og.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + 1.6);
    o.connect(og);
    og.connect(droneGain!);
    o.start();
    o.stop(AC.currentTime + 1.7);
  }

  return {
    start,
    toggle,
    blip,
    supernova,
    applyVol,
    get on() { return soundOn; },
    get ctx() { return AC; },
  };
}
