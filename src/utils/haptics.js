// Native haptics via Capacitor (falls back gracefully in browser)
let Haptics = null;
import('@capacitor/haptics').then(m => { Haptics = m.Haptics; }).catch(() => {});

export async function hapticLight() {
  try {
    if (Haptics) await Haptics.impact({ style: 'LIGHT' });
    else if (navigator.vibrate) navigator.vibrate(10);
  } catch {}
}

export async function hapticMedium() {
  try {
    if (Haptics) await Haptics.impact({ style: 'MEDIUM' });
    else if (navigator.vibrate) navigator.vibrate(20);
  } catch {}
}

export async function hapticHeavy() {
  try {
    if (Haptics) await Haptics.impact({ style: 'HEAVY' });
    else if (navigator.vibrate) navigator.vibrate([30, 10, 30]);
  } catch {}
}

export async function hapticSuccess() {
  try {
    if (Haptics) await Haptics.notification({ type: 'SUCCESS' });
    else if (navigator.vibrate) navigator.vibrate([20, 10, 20, 10, 40]);
  } catch {}
}

export async function hapticError() {
  try {
    if (Haptics) await Haptics.notification({ type: 'ERROR' });
    else if (navigator.vibrate) navigator.vibrate([50, 20, 50]);
  } catch {}
}

// Web Audio API sound effects
let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

// Call once on any user gesture (click/tap) so the context is pre-unlocked
// for all subsequent programmatic sound calls.
export function unlockAudio() {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
  } catch {}
}

export async function playTone(freq, duration, type = 'sine', volume = 0.15) {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') await ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

export function soundMark() {
  playTone(880, 0.08, 'sine', 0.12);
  setTimeout(() => playTone(1100, 0.06, 'sine', 0.08), 60);
}

export function soundCombo() {
  playTone(660, 0.06, 'sine', 0.1);
  setTimeout(() => playTone(880, 0.06, 'sine', 0.1), 70);
  setTimeout(() => playTone(1100, 0.1, 'sine', 0.12), 140);
}

export function soundWin() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((n, i) => setTimeout(() => playTone(n, 0.2, 'sine', 0.15), i * 100));
}

export function soundError() {
  playTone(200, 0.15, 'sawtooth', 0.08);
}

export function soundCardFlip() {
  playTone(440, 0.04, 'triangle', 0.05);
}

export function soundTick() {
  playTone(880, 0.03, 'square', 0.04);
}
