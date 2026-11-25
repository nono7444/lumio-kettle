import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const KEY = 'lumio-kettle-v1';

export const DEFAULT_STATE = {
  done: {}, // { '1A': '2026-11-26T18:00:00Z' }
  weights: { bas: 12, haut: 12 },
  settings: { voice: true, beeps: true, noImpact: false, overrideSilent: false },
  tests: {}, // { 4: { bas: true, haut: false, date } }
  videos: {}, // vidéos personnalisées { exId: youtubeId }
};

const merge = (s) => ({
  ...DEFAULT_STATE,
  ...s,
  weights: { ...DEFAULT_STATE.weights, ...(s?.weights || {}) },
  settings: { ...DEFAULT_STATE.settings, ...(s?.settings || {}) },
});

export function loadSync() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? merge(JSON.parse(raw)) : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

// Sur iPhone, on garde aussi une copie dans les Préférences natives
// (localStorage peut être vidé par iOS si le stockage est plein).
export async function loadNative() {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const { value } = await Preferences.get({ key: KEY });
    return value ? merge(JSON.parse(value)) : null;
  } catch {
    return null;
  }
}

export function save(state) {
  const raw = JSON.stringify(state);
  try { localStorage.setItem(KEY, raw); } catch { /* ignore */ }
  if (Capacitor.isNativePlatform()) Preferences.set({ key: KEY, value: raw }).catch(() => {});
}
