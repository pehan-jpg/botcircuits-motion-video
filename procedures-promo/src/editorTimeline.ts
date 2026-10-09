import { interpolate } from "remotion";
import { GLIDE, ease, pop, typed, TEXT } from "./theme";
import { CARD, CONTENT_BOTTOM, CardKey, EMPTY_EDITOR, EditorState, FIELDS, FieldKey, POS, toksLen } from "./components/ProcedureEditor";

// World-space helper for aiming the cursor at editor elements.
export const W = (x: number, y: number) => ({ x: CARD.x + x, y: CARD.y + y });

// Piecewise, eased keyframes: glides between consecutive keys, holds outside them.
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

// ── Scene 5 — the procedure assembles itself section by section on a blank editor ──
const FPC = 0.9; // 15ms per character
const TAG = 9; // tags and pills snap in over ~0.15s
const TYPE = (start: number, k: FieldKey) => ({ start, end: start + Math.ceil(toksLen(FIELDS[k]) * FPC) });

export const S5 = (() => {
  const title = { click: 50, start: 54, end: 54 + Math.ceil(TEXT.title.length * FPC) };
  // Step 1
  const h1 = title.end + 14;
  const c11 = h1 + 8;
  const if11 = c11 + 10;
  const cond11 = TYPE(if11 + TAG, "cond11");
  const handoff11 = cond11.end + 8;
  const act11 = TYPE(handoff11 + TAG, "act11");
  const toggle = act11.end + 11;
  const c12 = toggle + 18;
  // Step 2
  const h2 = c12 + 26;
  const c21 = h2 + 8;
  const if21 = c21 + 10;
  const cond21 = TYPE(if21 + TAG, "cond21");
  const set21 = cond21.end + 10;
  const setT = TYPE(set21 + TAG, "set21");
  const calc21 = setT.end + 9;
  const calcT = TYPE(calc21 + TAG, "calc21");
  const c22 = calcT.end + 13;
  // Step 3
  const pan3 = c22 + 8;
  const h3 = pan3 + 18;
  const c31 = h3 + 8;
  const api31 = c31 + 10;
  const apiT = TYPE(api31 + TAG, "api31");
  const returns = apiT.end + 4;
  const c32 = returns + 12;
  const send32 = c32 + 10;
  const sendT = TYPE(send32 + TAG, "send32");
  const done = sendT.end + 6;
  return {
    title, h1, c11, if11, cond11, handoff11, act11, toggle, c12,
    h2, c21, if21, cond21, set21, setT, calc21, calcT, c22,
    pan3, h3, c31, api31, apiT, returns, c32, send32, sendT, done,
    pullBack: done + 10,
  };
})();
export const S5_LENGTH = S5.pullBack + 60 + 40;

export const FULL_VIEW = {
  s: 540 / (CONTENT_BOTTOM + 60),
  fy: CARD.y + CONTENT_BOTTOM / 2,
};
const WORK_S = 1.25;
const STEP1_FY = CARD.y + POS.c11.y + 20;
const STEP2_FY = CARD.y + POS.c21.y + 40;
const STEP3_FY = CARD.y + POS.c31.y + 70;

export const scene5Camera = (frame: number) => ({
  fx: 480,
  fy: track(frame, [
    { f: 0, v: 256 },
    { f: S5.title.end, v: 256 },
    { f: S5.h1 + 24, v: STEP1_FY },
    { f: S5.h2 - 6, v: STEP1_FY },
    { f: S5.h2 + 24, v: STEP2_FY },
    { f: S5.pan3, v: STEP2_FY },
    { f: S5.pan3 + 32, v: STEP3_FY },
    { f: S5.pullBack, v: STEP3_FY },
    { f: S5.pullBack + 60, v: FULL_VIEW.fy },
  ]),
  s:
    frame < S5.title.end
      ? ease(frame, [8, 50], [0.8, 1])
      : track(frame, [
          { f: S5.title.end, v: 1 },
          { f: S5.h1 + 24, v: WORK_S },
          { f: S5.pullBack, v: WORK_S },
          { f: S5.pullBack + 60, v: FULL_VIEW.s },
        ]),
});

const typedAt = (frame: number, t: { start: number }, k: FieldKey) =>
  Math.min(toksLen(FIELDS[k]), Math.max(0, Math.floor((frame - t.start) / FPC)));

export const scene5State = (frame: number, fps: number): EditorState => {
  const snap = (f: number) => ease(frame, [f, f + TAG], [0, 1], (x) => x);
  const cards: Record<CardKey, number> = {
    h1: pop(frame, S5.h1, fps, 15),
    c11: pop(frame, S5.c11, fps, 15),
    c12: pop(frame, S5.c12, fps, 15),
    h2: pop(frame, S5.h2, fps, 15),
    c21: pop(frame, S5.c21, fps, 15),
    c22: pop(frame, S5.c22, fps, 15),
    h3: pop(frame, S5.h3, fps, 15),
    c31: pop(frame, S5.c31, fps, 15),
    c32: pop(frame, S5.c32, fps, 15),
  };
  const fields: [FieldKey, { start: number; end: number }][] = [
    ["cond11", S5.cond11],
    ["act11", S5.act11],
    ["cond21", S5.cond21],
    ["set21", S5.setT],
    ["calc21", S5.calcT],
    ["api31", S5.apiT],
    ["send32", S5.sendT],
  ];
  const focusField = fields.find(([, t]) => frame >= t.start - 2 && frame < t.end + 4);
  const typing =
    (frame >= S5.title.start && frame < S5.title.end) || fields.some(([, t]) => frame >= t.start && frame < t.end);
  return {
    ...EMPTY_EDITOR,
    rows: [0, 1].map((i) => ease(frame, [10 + i * 6, 10 + i * 6 + 26], [0, 1])),
    titleText: typed(TEXT.title, frame, S5.title.start, FPC),
    titleFocus: frame >= S5.title.click && frame < S5.title.end + 8,
    cards,
    tags: {
      if11: snap(S5.if11),
      handoff11: snap(S5.handoff11),
      if21: snap(S5.if21),
      set21: snap(S5.set21),
      calc21: snap(S5.calc21),
      api31: snap(S5.api31),
      send32: snap(S5.send32),
    },
    typed: Object.fromEntries(fields.map(([k, t]) => [k, typedAt(frame, t, k)])) as Record<FieldKey, number>,
    focus: focusField ? focusField[0] : null,
    set21Row: ease(frame, [S5.set21 - 2, S5.set21 + 4], [0, 1]),
    calc21Row: ease(frame, [S5.calc21 - 2, S5.calc21 + 4], [0, 1]),
    c21H: track(frame, [
      { f: 0, v: 40 },
      { f: S5.set21 - 8, v: 40 },
      { f: S5.set21, v: 64 },
      { f: S5.calc21 - 8, v: 64 },
      { f: S5.calc21, v: 86 },
    ]),
    returnsChip: snap(S5.returns),
    // Strict Boundary Rule: the toggle slides on with a micro-pulse.
    toggle: ease(frame, [S5.toggle, S5.toggle + 8], [0, 1]),
    togglePulse: ease(frame, [S5.toggle + 6, S5.toggle + 26], [0, 1], (x) => x),
    glow: ease(frame, [S5.toggle + 2, S5.toggle + 20], [0, 1]),
    badge: pop(frame, S5.toggle + 6, fps, 10),
    caretOn: typing || caret(frame),
  };
};

export const S5_END = scene5State(10000, 60);

// ── Scene 7 — a three-turn conversation; each turn lights its step on the left ──
export const S7 = {
  typeStart: 50,
  typeFpc: 2.7, // 45ms per character
  send: 276,
  // Turn 1 — policy check (step 1) → reply 1
  step1: 282,
  pass1: 294,
  reply1: 330,
  // Turn 2 — fee calculation (step 2) → reply 2 with a confirmation prompt
  step2: 372,
  branch21: 380,
  calc: 396,
  reply2: 420,
  // Turn 3 — customer confirms → label generation (step 3) → interactive card
  type2Start: 478,
  send2: 568,
  step3: 576,
  label: 612,
  card: 628,
  hover: 680,
  end: 710, // the 3D orbit scene picks up from this exact frame
};
export const S7_LENGTH = S7.end;

export const scene7State = (frame: number, fps: number): EditorState => {
  const on = (f: number, d = 10) => ease(frame, [f, f + d], [0, 1]);
  const off = (f: number) => ease(frame, [f, f + 12], [1, 0]);
  return {
    ...S5_END,
    saved: true,
    // Inactive cards return to neutral borders; the toggle and badge still show the strict rule.
    glow: S5_END.glow * ease(frame, [0, 30], [1, 0]),
    // Only the executing step glows; finished steps keep a quiet check.
    stepActive: [on(S7.step1) * off(S7.step2), on(S7.step2) * off(S7.step3), on(S7.step3)],
    stepDone: [on(S7.step2, 6), on(S7.step3, 6), 0],
    passChip: pop(frame, S7.pass1, fps, 14),
    skipStep1Branches: on(S7.pass1, 18),
    c21Active: on(S7.branch21) * off(S7.step3),
    calcPill: pop(frame, S7.calc, fps, 11),
    c31Active: on(S7.step3 + 6) * off(S7.card),
    labelPill: pop(frame, S7.label, fps, 11),
    c32Active: on(S7.card),
  };
};
