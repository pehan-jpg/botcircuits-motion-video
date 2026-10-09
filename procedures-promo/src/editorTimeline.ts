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

// ── Scene 5 — the whole procedure is built live, starting from a blank editor ──
const TYPE = (start: number, k: FieldKey, fpc: number) => ({ start, fpc, end: start + Math.ceil(toksLen(FIELDS[k]) * fpc) });
// A pill / dropdown click opens its menu; the cursor reaches the item and selects it 26 frames after the click.
export const menuTimes = (click: number) => ({ open: click + 2, hover: click + 14, select: click + 26 });

export const S5 = (() => {
  const title = { click: 72, start: 76, fpc: 1.6, end: 76 + Math.ceil(TEXT.title.length * 1.6) };
  // Step 1
  const step1 = { click: title.end + 26 };
  const cond11 = { click: step1.click + 28, ...TYPE(step1.click + 32, "cond11", 1.4) };
  const action = { click: cond11.end + 18 };
  const toggle = { click: menuTimes(action.click).select + 30 };
  const c12 = toggle.click + 22;
  // Step 2
  const step2 = { click: c12 + 40 };
  const cond = { click: step2.click + 34, ...TYPE(step2.click + 38, "cond21", 1.6) };
  const set = { pill: cond.end + 22, hover: 0, ...TYPE(cond.end + 55, "set21", 1.6) };
  const calc = { pill: set.end + 19, hover: 1, ...TYPE(set.end + 52, "calc21", 1.4) };
  const c22 = calc.end + 14;
  // Step 3
  const pan3 = calc.end + 20;
  const step3 = { click: pan3 + 46 };
  const api = { pill: step3.click + 40, hover: 2, ...TYPE(step3.click + 76, "api31", 1.3) };
  const send = { pill: api.end + 28, hover: 3, ...TYPE(api.end + 64, "send32", 0.8) };
  const done = send.end + 4;
  return { title, step1, cond11, action, toggle, c12, step2, cond, set, calc, c22, pan3, step3, api, send, done, pullBack: done + 16 };
})();
export const S5_LENGTH = S5.pullBack + 60 + 50;

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
    { f: S5.step1.click + 30, v: STEP1_FY },
    { f: S5.step2.click + 6, v: STEP1_FY },
    { f: S5.step2.click + 40, v: STEP2_FY },
    { f: S5.pan3, v: STEP2_FY },
    { f: S5.pan3 + 40, v: STEP3_FY },
    { f: S5.pullBack, v: STEP3_FY },
    { f: S5.pullBack + 60, v: FULL_VIEW.fy },
  ]),
  s:
    frame < S5.title.end
      ? ease(frame, [8, 60], [0.8, 1])
      : track(frame, [
          { f: S5.title.end, v: 1 },
          { f: S5.step1.click + 30, v: WORK_S },
          { f: S5.pullBack, v: WORK_S },
          { f: S5.pullBack + 60, v: FULL_VIEW.s },
        ]),
});

const typedAt = (frame: number, t: { start: number; fpc: number }, k: FieldKey) =>
  Math.min(toksLen(FIELDS[k]), Math.max(0, Math.floor((frame - t.start) / t.fpc)));

export const scene5State = (frame: number, fps: number): EditorState => {
  const fadeIn = (f: number) => ease(frame, [f, f + 12], [0, 1]);
  const fadeOut = (f: number) => ease(frame, [f, f + 6], [1, 0]);
  const mAction = menuTimes(S5.action.click);
  const mSet = menuTimes(S5.set.pill);
  const mCalc = menuTimes(S5.calc.pill);
  const mApi = menuTimes(S5.api.pill);
  const mSend = menuTimes(S5.send.pill);
  const cards: Record<CardKey, number> = {
    h1: pop(frame, S5.step1.click + 4, fps, 14),
    c11: pop(frame, S5.step1.click + 12, fps, 14),
    c12: pop(frame, S5.c12, fps, 14),
    h2: pop(frame, S5.step2.click + 4, fps, 14),
    c21: pop(frame, S5.step2.click + 12, fps, 14),
    c22: pop(frame, S5.c22, fps, 14),
    h3: pop(frame, S5.step3.click + 4, fps, 14),
    c31: pop(frame, mApi.select, fps, 14),
    c32: pop(frame, mSend.select, fps, 14),
  };

  const titleText = typed(TEXT.title, frame, S5.title.start, S5.title.fpc);
  const fields: [FieldKey, { start: number; end: number; fpc: number }, number][] = [
    ["cond11", S5.cond11, S5.cond11.click],
    ["cond21", S5.cond, S5.cond.click],
    ["set21", S5.set, S5.set.start - 4],
    ["calc21", S5.calc, S5.calc.start - 4],
    ["api31", S5.api, S5.api.start - 4],
    ["send32", S5.send, S5.send.start - 4],
  ];
  const focusField = fields.find(([, t, from]) => frame >= from && frame < t.end + 6);
  const focus: FieldKey | null = focusField ? focusField[0] : null;
  const typing =
    (frame >= S5.title.start && frame < S5.title.end) || fields.some(([, t]) => frame >= t.start && frame < t.end);

  const menuFor = (m: ReturnType<typeof menuTimes>, hover: number) => ({
    p: frame < m.select ? ease(frame, [m.open, m.open + 12], [0, 1]) : ease(frame, [m.select + 2, m.select + 10], [1, 0]),
    hover: frame >= m.hover ? hover : -1,
  });
  const menu =
    frame >= S5.api.pill
      ? { at: "c3" as const, ...(frame >= S5.send.pill ? menuFor(mSend, S5.send.hover) : menuFor(mApi, S5.api.hover)) }
      : { at: "c21" as const, ...(frame >= S5.calc.pill ? menuFor(mCalc, S5.calc.hover) : menuFor(mSet, S5.set.hover)) };

  const addSlot = frame < S5.step1.click + 4 ? 0 : frame < S5.step2.click + 4 ? 1 : 2;
  return {
    ...EMPTY_EDITOR,
    rows: [0, 1].map((i) => ease(frame, [10 + i * 6, 10 + i * 6 + 26], [0, 1])),
    titleText,
    titleFocus: frame >= S5.title.click && frame < S5.title.end + 10,
    cards,
    typed: {
      cond11: typedAt(frame, S5.cond11, "cond11"),
      cond21: typedAt(frame, S5.cond, "cond21"),
      set21: typedAt(frame, S5.set, "set21"),
      calc21: typedAt(frame, S5.calc, "calc21"),
      api31: typedAt(frame, S5.api, "api31"),
      send32: typedAt(frame, S5.send, "send32"),
    },
    focus,
    // Step 1.1: HANDOFF from the action dropdown, then the Strict Boundary Rule toggle.
    actionOpen:
      frame < mAction.select
        ? ease(frame, [mAction.open, mAction.open + 14], [0, 1])
        : ease(frame, [mAction.select + 2, mAction.select + 12], [1, 0]),
    actionHover: frame >= mAction.hover ? 2 : -1,
    actionSelected: frame >= mAction.select + 2,
    toggle: ease(frame, [S5.toggle.click, S5.toggle.click + 10], [0, 1]),
    glow: ease(frame, [S5.toggle.click + 2, S5.toggle.click + 24], [0, 1]),
    badge: pop(frame, S5.toggle.click + 8, fps, 10),
    // Step 2.1 actions
    set21Row: pop(frame, mSet.select, fps, 14),
    calc21Row: pop(frame, mCalc.select, fps, 14),
    c21H: track(frame, [
      { f: 0, v: 40 },
      { f: S5.cond.end + 4, v: 40 },
      { f: S5.cond.end + 16, v: 64 },
      { f: mSet.select, v: 64 },
      { f: mSet.select + 12, v: 88 },
      { f: S5.calc.end + 4, v: 88 },
      { f: S5.calc.end + 16, v: 86 },
    ]),
    // "+ Add action" pills: each is visible from when it becomes useful until an action is picked.
    pill21: {
      p: Math.max(fadeIn(S5.cond.end + 8) * fadeOut(mSet.select), fadeIn(S5.set.end + 4) * fadeOut(mCalc.select)),
      slot: frame < S5.set.end + 4 ? 1 : 2,
    },
    pill3: {
      p: Math.max(fadeIn(S5.step3.click + 14) * fadeOut(mApi.select), fadeIn(S5.api.end + 10) * fadeOut(mSend.select)),
      slot: frame < S5.api.end + 10 ? 0 : 1,
    },
    menu,
    returnsChip: pop(frame, S5.api.end + 4, fps, 14),
    // "+ Add a step…" row: the blank state, then below each new step until it is clicked.
    addStep: {
      p: Math.max(
        fadeIn(30) * fadeOut(S5.step1.click + 2),
        fadeIn(S5.c12 + 10) * fadeOut(S5.step2.click + 2),
        fadeIn(S5.c22 + 10) * fadeOut(S5.step3.click + 2),
      ),
      slot: addSlot,
    },
    caretOn: typing || caret(frame),
  };
};

export const S5_END = scene5State(10000, 60);

// ── Scene 7 — four synchronized phases: chat on the right, the tree lights on the left ──
export const S7 = {
  typeStart: 50,
  typeFpc: 2.7, // 45ms per character
  send: 276,
  // Phase 1 — message sent, step 1 validates
  step1: 282,
  pass1: 294,
  // Phase 2 — step 2 evaluates branch 2.1, first agent reply
  step2: 324,
  branch21: 332,
  calc: 348,
  reply1: 364,
  // Phase 3 — step 3 calls EasyPost, second agent reply
  step3: 410,
  reply2: 446,
  // Phase 4 — label generated, interactive card delivered
  label: 488,
  card: 504,
  hover: 552,
  allDone: 576, // header badge, then a 1.2s hold before the crossfade into scene 8
};
export const S7_LENGTH = S7.allDone + 72 + 24;

export const scene7State = (frame: number, fps: number): EditorState => {
  const on = (f: number, d = 10) => ease(frame, [f, f + d], [0, 1]);
  const off = (f: number) => ease(frame, [f, f + 12], [1, 0]);
  return {
    ...S5_END,
    saved: true,
    // Only the executing node is lit; finished nodes keep a quiet check.
    stepActive: [on(S7.step1) * off(S7.step2), on(S7.step2) * off(S7.step3), on(S7.step3) * off(S7.allDone)],
    stepDone: [on(S7.step2, 6), on(S7.step3, 6), on(S7.allDone, 6)],
    passChip: pop(frame, S7.pass1, fps, 14),
    skipStep1Branches: on(S7.pass1, 18),
    c21Active: on(S7.branch21) * off(S7.step3 + 10),
    calcPill: pop(frame, S7.calc, fps, 11),
    c31Active: on(S7.step3 + 6) * off(S7.card),
    labelPill: pop(frame, S7.label, fps, 11),
    c32Active: on(S7.card) * off(S7.allDone),
  };
};
