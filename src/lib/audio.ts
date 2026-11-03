/** Tiny Web Audio synth. Unlock from a user gesture or iOS stays silent. */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let droneOsc: OscillatorNode | null = null;
let droneGain: GainNode | null = null;
let muted = false;

function midiToFreq(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

export function unlockAudio(): void {
  if (typeof window === "undefined") return;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor({ latencyHint: "interactive" });
    master = ctx.createGain();
    master.gain.value = 0.28;
    master.connect(ctx.destination);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") void ctx?.resume();
    });
  }
  if (ctx.state === "suspended") void ctx.resume();
}

export function setMuted(next: boolean): void {
  muted = next;
  if (muted) stopDrone();
}

export function isMuted(): boolean {
  return muted;
}

export function playNote(midi: number, duration = 0.42, when = 0): void {
  if (!ctx || !master || muted) return;
  const t = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(midiToFreq(midi), t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.22, t + 0.014);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t);
  osc.stop(t + duration + 0.03);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

export function startDrone(midi: number): void {
  if (!ctx || !master || muted) return;
  stopDrone();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(midiToFreq(midi - 12), ctx.currentTime);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.08);
  osc.connect(gain);
  gain.connect(master);
  osc.start();
  droneOsc = osc;
  droneGain = gain;
}

export function stopDrone(): void {
  if (!ctx || !droneOsc || !droneGain) {
    droneOsc = null;
    droneGain = null;
    return;
  }
  const osc = droneOsc;
  const gain = droneGain;
  const t = ctx.currentTime;
  gain.gain.cancelScheduledValues(t);
  gain.gain.setTargetAtTime(0.0001, t, 0.04);
  osc.stop(t + 0.2);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
  droneOsc = null;
  droneGain = null;
}

export function playScaleThenTriad(scale: number[], triad: number[]): void {
  if (!ctx || muted) return;
  scale.forEach((midi, i) => playNote(midi, 0.28, i * 0.15));
  const start = scale.length * 0.15 + 0.12;
  triad.forEach((midi) => playNote(midi, 0.7, start));
}
