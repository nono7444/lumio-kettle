import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { KeepAwake } from '@capacitor-community/keep-awake';

const native = Capacitor.isNativePlatform();
let ctx = null;
let overrideSilent = false;

export function configureAudio({ overrideSilent: o }) {
  overrideSilent = !!o;
  // Safari / iOS 17+ : 'playback' = sonne même en mode silencieux, 'ambient' = se mélange à ta musique
  try {
    if (navigator.audioSession) navigator.audioSession.type = overrideSilent ? 'playback' : 'ambient';
  } catch { /* ignore */ }
}

// À appeler sur un tap (iOS exige un geste pour activer le son)
export function unlockAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    g.gain.value = 0.0001;
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.01);
  } catch { /* ignore */ }
}

export function beep(type = 'short') {
  if (!ctx) return;
  try {
    const conf = {
      short: { f: 880, d: 0.12 },
      long: { f: 1320, d: 0.45 },
      end: { f: 660, d: 0.6 },
    }[type];
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = conf.f;
    const t = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.6, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + conf.d);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + conf.d + 0.05);
  } catch { /* ignore */ }
}

let frVoice = null;
function pickWebVoice() {
  if (frVoice || !window.speechSynthesis) return frVoice;
  const voices = window.speechSynthesis.getVoices();
  frVoice = voices.find((v) => v.lang === 'fr-FR') || voices.find((v) => v.lang?.startsWith('fr')) || null;
  return frVoice;
}

export async function speak(text) {
  if (!text) return;
  if (native) {
    try {
      await TextToSpeech.stop();
      await TextToSpeech.speak({
        text,
        lang: 'fr-FR',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        category: overrideSilent ? 'playback' : 'ambient',
      });
      return;
    } catch { /* on tente la voix web */ }
  }
  try {
    const s = window.speechSynthesis;
    if (!s) return;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'fr-FR';
    const v = pickWebVoice();
    if (v) u.voice = v;
    s.speak(u);
  } catch { /* ignore */ }
}

export function stopSpeech() {
  if (native) TextToSpeech.stop().catch(() => {});
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
}

// Écran toujours allumé pendant la séance
let wakeLock = null;
export async function keepScreenOn(on) {
  if (native) {
    try { on ? await KeepAwake.keepAwake() : await KeepAwake.allowSleep(); } catch { /* ignore */ }
    return;
  }
  try {
    if (on && navigator.wakeLock) wakeLock = await navigator.wakeLock.request('screen');
    if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch { /* ignore */ }
}
