// ---------------------------------------------------------------------------
// Deterministic typewriter timing (pure, no React): every chat message and
// call transcript row types character by character with +/-10% per character
// jitter (seeded, never random), a pause after commas and sentence ends, and
// a 70 ms fade per character. Shared by src/pacing.ts (scene lengths) and
// the renderers, so timing and visuals always agree.
// ---------------------------------------------------------------------------
export const CHAR_FADE = 0.07;
export const COMMA_PAUSE = 0.14;
export const STOP_PAUSE = 0.26;
export const JITTER = 0.1;

/** Deterministic 0..1 hash (FNV-1a) of a string. */
const hash01 = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
};

/** Raw per-character offsets (seconds from the start) at a given chars-per-second. */
const rawOffsets = (text: string, cps: number, seed: string) => {
  const out: number[] = [];
  let t = 0;
  for (let i = 0; i < text.length; i++) {
    out.push(t);
    const j = 1 + JITTER * (2 * hash01(`${seed}:${i}`) - 1);
    t += j / cps;
    const ch = text[i];
    if (i < text.length - 1) {
      if (ch === ',') t += COMMA_PAUSE;
      else if (ch === '.' || ch === '?' || ch === '!') t += STOP_PAUSE;
    }
  }
  return {offsets: out, end: t};
};

/**
 * Time at which each character starts to appear, and when typing ends.
 * With `fitTo`, the timing is scaled so typing ends exactly fitTo seconds
 * after `start` (call transcript rows finish with their speech slot).
 */
export const charTimes = (text: string, start: number, cps: number, seed: string, fitTo?: number) => {
  const {offsets, end} = rawOffsets(text, cps, seed);
  const k = fitTo !== undefined ? fitTo / end : 1;
  return {times: offsets.map((o) => start + o * k), end: start + end * k, cps: cps / k};
};

/** Characters visible (count of started characters) at time s. */
export const typedChars = (times: number[], s: number) => {
  let n = 0;
  while (n < times.length && times[n] <= s) n++;
  return n;
};
