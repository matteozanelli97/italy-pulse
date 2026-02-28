// ============================================================
// ITALY PULSE — Tactical Audio System (Web Audio API)
// ============================================================

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function beep(freq: number, dur: number, vol = 0.08, type: OscillatorType = 'sine') {
  try {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
  } catch { /* audio not available */ }
}

export const sounds = {
  click: () => beep(800, 0.06, 0.05, 'square'),
  hover: () => beep(1200, 0.03, 0.02, 'sine'),
  toggle: () => beep(600, 0.1, 0.06, 'triangle'),
  alert: () => { beep(880, 0.15, 0.1, 'square'); setTimeout(() => beep(1100, 0.15, 0.1, 'square'), 160); },
  data: () => beep(1400, 0.04, 0.03, 'sine'),
  marker: () => beep(500, 0.12, 0.06, 'triangle'),
};
