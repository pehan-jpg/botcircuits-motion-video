import { interpolate } from "remotion";
import { GLIDE, ease, pop, typed, TEXT } from "./theme";
import { CARD, CONTENT_BOTTOM, CardKey, EMPTY_EDITOR, EditorState, POS, stepCenter } from "./components/ProcedureEditor";

// World-space helper for aiming the cursor at editor elements.
export const W = (x: number, y: number) => ({ x: CARD.x + x, y: CARD.y + y });

// Piecewise, eased keyframes: holds between keys, glides across each [f, f+dur] window.
export const track = (frame: number, keys: { f: number; v: number }[]) => {
  if (frame <= keys[0].f) return keys[0].v;
  for (let i = 0; i < keys.length - 1; i++) {
    if (frame <= keys[i + 1].f) {
      return interpolate(frame, [keys[i].f, keys[i + 1].f], [keys[i].v, keys[i + 1].v], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: GLIDE,
      });
    }
  }
  return keys[keys.length - 1].v;
};

const caret = (frame: number) => Math.floor(frame / 18) % 2 === 0;

// Scene 5 — the multi-step procedure cascades in, one card every 0.6s (36 frames).
const GAP = 36;
export const S5 = {
  titleClick: 72,
  titleType: 76,
  titleFpc: 2,
  cascade: 146,
};
const ORDER: CardKey[] = ["h1", "c11", "c12", "h2", "c21", "c22", "h3", "c31", "c32"];
export const S5_CARDS = Object.fromEntries(ORDER.map((k, i) => [k, S5.cascade + i * GAP])) as Record<CardKey, number>;
export const S5_PULLBACK = S5_CARDS.c32 + 40;

// Camera: follow the newest card down, then pull back to frame the whole procedure.
const bottomOf: Record<CardKey, number> = {
  h1: POS.stepY[0] + POS.stepH,
  c11: POS.c11.y + POS.c11.h,
  c12: POS.c12.y + POS.c12.h,
  h2: POS.stepY[1] + POS.stepH,
  c21: POS.c21.y + POS.c21.h,
  c22: POS.c22.y + POS.c22.h,
  h3: POS.stepY[2] + POS.stepH,
  c31: POS.c31.y + POS.c31.h,
  c32: POS.c32.y + POS.c32.h,
};
const followY = (k: CardKey) => Math.max(256, CARD.y + bottomOf[k] + 48 - 270);
export const FULL_VIEW = {
  s: 540 / (CONTENT_BOTTOM + 60),
  fy: CARD.y + CONTENT_BOTTOM / 2,
};

export const scene5Camera = (frame: number) => {
  // Glide continuously from card to card as the cascade grows downward.
  const keys: { f: number; v: number }[] = [{ f: S5.cascade, v: 256 }];
  ORDER.forEach((k) => {
    const v = followY(k);
    if (v !== keys[keys.length - 1].v) keys.push({ f: S5_CARDS[k] + 24, v });
  });
  keys.push({ f: S5_PULLBACK, v: keys[keys.length - 1].v }, { f: S5_PULLBACK + 60, v: FULL_VIEW.fy });
  return {
    fx: 480,
    fy: track(frame, keys),
    s:
      frame < S5_PULLBACK
        ? ease(frame, [8, 60], [0.8, 1])
        : track(frame, [
            { f: S5_PULLBACK, v: 1 },
            { f: S5_PULLBACK + 60, v: FULL_VIEW.s },
          ]),
  };
};

export const scene5State = (frame: number, fps: number): EditorState => {
  const titleText = typed(TEXT.title, frame, S5.titleType, S5.titleFpc);
  const typing = frame >= S5.titleType && titleText.length < TEXT.title.length;
  const cards = Object.fromEntries(
    (Object.keys(S5_CARDS) as CardKey[]).map((k) => [k, pop(frame, S5_CARDS[k], fps, 14)]),
  ) as Record<CardKey, number>;
  return {
    ...EMPTY_EDITOR,
    rows: [0, 1].map((i) => ease(frame, [14 + i * 6, 14 + i * 6 + 26], [0, 1])),
    titleText,
    titleFocus: frame >= S5.titleClick && frame < S5.cascade,
    cards,
    caretOn: typing || caret(frame),
  };
};

export const S5_END = scene5State(10000, 60);

// Scene 6 — boundary rules & human handoff on step 1.1.
export const S6 = {
  actionClick: 96,
  optionHover: 120,
  optionClick: 134,
  toggleClick: 176,
};

export const scene6State = (frame: number, fps: number): EditorState => ({
  ...S5_END,
  condFocus: ease(frame, [44, 56], [0, 1]) * ease(frame, [76, 90], [1, 0]),
  actionOpen:
    frame < S6.optionClick
      ? ease(frame, [S6.actionClick + 2, S6.actionClick + 16], [0, 1])
      : ease(frame, [S6.optionClick + 2, S6.optionClick + 12], [1, 0]),
  actionHover: frame >= S6.optionHover ? 2 : frame >= 112 ? 1 : -1,
  actionSelected: frame >= S6.optionClick + 2,
  toggle: ease(frame, [S6.toggleClick, S6.toggleClick + 10], [0, 1]),
  glow: ease(frame, [S6.toggleClick + 2, S6.toggleClick + 30], [0, 1]),
  badge: pop(frame, S6.toggleClick + 8, fps, 10),
});

export const S6_END = scene6State(1000, 60);

// Scene 7 — synchronized live traversal through all three steps.
export const S7 = {
  typeStart: 50,
  typeFpc: 1,
  send: 136,
  // Rapid 0.8s (48-frame) pulse per step
  step1: 146,
  pass1: 160,
  toStep2: 186,
  step2: 194,
  branch21: 206,
  calc: 218,
  toStep3: 234,
  step3: 242,
  label: 254,
  send32: 268,
  agentReply: 280,
  allDone: 330, // badge, then a 1.2s hold before the crossfade into scene 8
};

export const scene7State = (frame: number, fps: number): EditorState => {
  const s1 = stepCenter(0);
  const s2 = stepCenter(1);
  const s3 = stepCenter(2);
  const on = (f: number, d = 12) => ease(frame, [f, f + d], [0, 1]);
  const settle = (f: number) => ease(frame, [f, f + 24], [1, 0.35]);
  return {
    ...S6_END,
    saved: true,
    glow: S6_END.glow * (1 - 0.6 * on(S7.pass1)),
    trailY:
      frame < S7.step1
        ? 0
        : track(frame, [
            { f: S7.step1, v: s1 },
            { f: S7.toStep2, v: s1 },
            { f: S7.step2, v: s2 },
            { f: S7.toStep3, v: s2 },
            { f: S7.step3, v: s3 },
          ]),
    stepActive: [on(S7.step1) * settle(S7.toStep2), on(S7.step2) * settle(S7.toStep3), on(S7.step3) * settle(S7.allDone)],
    stepDone: [on(S7.toStep2, 6), on(S7.toStep3, 6), on(S7.allDone, 6)],
    passChip: pop(frame, S7.pass1, fps, 14),
    skipStep1Branches: on(S7.pass1, 18),
    c21Active: on(S7.branch21) * (0.7 + 0.3 * Math.cos(Math.max(0, frame - S7.branch21) / 10)),
    calcPill: pop(frame, S7.calc, fps, 11),
    c31Active: on(S7.step3 + 8) * settle(S7.send32),
    labelPill: pop(frame, S7.label, fps, 11),
    c32Active: on(S7.send32) * settle(S7.allDone + 20),
  };
};

export const IF_CENTER = W(POS.c11.x + POS.c11.w / 2, POS.c11.y + 46);
