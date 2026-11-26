/**
 * Reel camera: a crop box on the 16:9 source, in 1920x1080 source coordinates.
 * Each keyframe is reached at its time; the move into it takes `trans` seconds
 * with a smoothstep ease and ends at the keyframe time (0 = a cut).
 */
export type ReelKey = { t: number; cx: number; cy: number; w: number; aspect: number; trans: number; note?: string };

export const REEL_KEYS: ReelKey[] = [
  { t: 0.0, cx: 960, cy: 560, w: 960, aspect: 1.0, trans: 0, note: "Scene 1, Gmail" },
  { t: 4.0, cx: 1000, cy: 520, w: 1000, aspect: 1.0, trans: 0.9 },
  { t: 7.6, cx: 880, cy: 540, w: 1300, aspect: 0.8, trans: 0.9 },
  { t: 10.2, cx: 1000, cy: 540, w: 1450, aspect: 0.72, trans: 0.9 },
  { t: 13.4, cx: 960, cy: 540, w: 1400, aspect: 0.75, trans: 1.0, note: "orb and chips" },
  { t: 19.0, cx: 960, cy: 540, w: 1500, aspect: 0.6, trans: 0, note: "intro title" },
  { t: 24.0, cx: 960, cy: 540, w: 1100, aspect: 0.6, trans: 0, note: "title: Ask, or tell it what to do" },
  { t: 27.0, cx: 960, cy: 430, w: 880, aspect: 1.0, trans: 0, note: "ask screen" },
  { t: 29.5, cx: 1000, cy: 626, w: 1500, aspect: 0.605, trans: 0.8 },
  { t: 33.0, cx: 900, cy: 620, w: 900, aspect: 1.0, trans: 0.8, note: "answer" },
  { t: 36.0, cx: 960, cy: 330, w: 1000, aspect: 0.66, trans: 0.8, note: "second request" },
  { t: 38.0, cx: 955, cy: 480, w: 1000, aspect: 0.96, trans: 0.8, note: "2 changes made, chip" },
  { t: 42.0, cx: 960, cy: 540, w: 1100, aspect: 0.6, trans: 0, note: "title: Give every agent a job" },
  { t: 45.0, cx: 1000, cy: 560, w: 1000, aspect: 1.0, trans: 0, note: "agents page" },
  { t: 48.0, cx: 960, cy: 560, w: 1000, aspect: 1.0, trans: 0.6, note: "new agent panel" },
  { t: 52.0, cx: 1010, cy: 553, w: 860, aspect: 0.98, trans: 0, note: "Control Room heroes" },
  { t: 66.1, cx: 1000, cy: 553, w: 1250, aspect: 0.676, trans: 1.0, note: "walking story" },
  { t: 78.0, cx: 1100, cy: 553, w: 1000, aspect: 0.845, trans: 1.0, note: "result cards" },
  { t: 82.0, cx: 960, cy: 540, w: 1400, aspect: 0.6, trans: 0, note: "title: Ground it in your own sources" },
  { t: 84.5, cx: 900, cy: 460, w: 1500, aspect: 0.72, trans: 0.8, note: "connect data sources" },
  { t: 92.5, cx: 950, cy: 520, w: 1500, aspect: 0.72, trans: 0.8, note: "knowledge graph" },
  { t: 96.0, cx: 960, cy: 540, w: 1100, aspect: 0.6, trans: 0, note: "title: Define the process once" },
  { t: 99.0, cx: 1000, cy: 340, w: 1000, aspect: 1.0, trans: 0 },
  { t: 101.8, cx: 900, cy: 450, w: 1100, aspect: 1.0, trans: 0.6 },
  { t: 104.5, cx: 950, cy: 470, w: 1100, aspect: 1.0, trans: 0.6 },
  { t: 108.0, cx: 950, cy: 470, w: 1100, aspect: 1.0, trans: 0, note: "review inspector" },
  { t: 111.0, cx: 700, cy: 600, w: 1100, aspect: 1.0, trans: 0.6, note: "check, save and activate" },
  { t: 114.0, cx: 960, cy: 540, w: 1100, aspect: 0.6, trans: 0, note: "title: Let it run on its own" },
  { t: 118.5, cx: 960, cy: 540, w: 1700, aspect: 0.5625, trans: 0.8, note: "run and wait" },
  { t: 126.0, cx: 960, cy: 540, w: 1400, aspect: 0.55, trans: 0, note: "title: People approve what matters" },
  { t: 129.0, cx: 960, cy: 540, w: 1700, aspect: 0.5625, trans: 0, note: "review scene, keep the whole screen" },
  { t: 143.0, cx: 960, cy: 540, w: 1200, aspect: 0.6, trans: 0, note: "title: Every step on record" },
  { t: 147.0, cx: 960, cy: 540, w: 1700, aspect: 0.5625, trans: 0, note: "records" },
  { t: 152.0, cx: 960, cy: 540, w: 1400, aspect: 0.6, trans: 0, note: "title: Build the views you need" },
  { t: 155.5, cx: 960, cy: 540, w: 1700, aspect: 0.5625, trans: 0, note: "pages, dashboard" },
  { t: 164.0, cx: 960, cy: 540, w: 1700, aspect: 0.5625, trans: 0, note: "contrast scene" },
  { t: 172.0, cx: 960, cy: 540, w: 1400, aspect: 0.6, trans: 0, note: "end card" },
  { t: 176.5, cx: 960, cy: 530, w: 1000, aspect: 1.0, trans: 0 },
  { t: 179.0, cx: 960, cy: 540, w: 1400, aspect: 0.6, trans: 0, note: "logo" },
];

const SRC_W = 1920;
const SRC_H = 1080;
const smoothstep = (x: number) => x * x * (3 - 2 * x);

/** The crop box at time t (source px): x0, y0, width, height. Always inside the source frame. */
export const reelCropAt = (t: number) => {
  let i = 0;
  while (i < REEL_KEYS.length - 1 && REEL_KEYS[i + 1].t <= t) i++;
  const a = REEL_KEYS[i];
  const b = REEL_KEYS[i + 1];
  let k = a;
  if (b && b.trans > 0 && t > b.t - b.trans) {
    const p = smoothstep(Math.min(1, (t - (b.t - b.trans)) / b.trans));
    k = { ...a, cx: a.cx + (b.cx - a.cx) * p, cy: a.cy + (b.cy - a.cy) * p, w: a.w + (b.w - a.w) * p, aspect: a.aspect + (b.aspect - a.aspect) * p };
  }
  let w = Math.min(k.w, SRC_W);
  // If the height would exceed the frame, reduce the width.
  if (w * k.aspect > SRC_H) w = SRC_H / k.aspect;
  const h = w * k.aspect;
  const x0 = Math.max(0, Math.min(SRC_W - w, k.cx - w / 2));
  const y0 = Math.max(0, Math.min(SRC_H - h, k.cy - h / 2));
  return { x0, y0, w, h, aspect: k.aspect };
};
