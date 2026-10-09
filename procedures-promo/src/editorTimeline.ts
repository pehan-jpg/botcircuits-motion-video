import { interpolate } from "remotion";
import { GLIDE, ease, pop, TEXT } from "./theme";
import {
  CARD,
  CONTENT_BOTTOM,
  CardKey,
  EMPTY_EDITOR,
  EditorState,
  FIELDS,
  FieldKey,
  POS,
  toksLen,
} from "./components/ProcedureEditor";

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

// Scene 5 — step 1 is pre-populated; steps 2 and 3 are configured live by the cursor.
const TYPE = (start: number, k: FieldKey, fpc: number) => ({ start, fpc, end: start + Math.ceil(toksLen(FIELDS[k]) * fpc) });
export const S5 = (() => {
  const cond = { click: 134, ...TYPE(138, "cond21", 1.6) };
  const set = { pill: cond.end + 22, hover: 0, ...TYPE(cond.end + 55, "set21", 1.6) };
  const calc = { pill: set.end + 19, hover: 1, ...TYPE(set.end + 52, "calc21", 1.4) };
  const c22 = calc.end + 14;
  const pan3 = calc.end + 20;
  const api = { pill: pan3 + 56, hover: 2, ...TYPE(pan3 + 92, "api31", 1.3) };
  const send = { pill: api.end + 28, hover: 3, ...TYPE(api.end + 64, "send32", 0.8) };
  const done = send.end + 4;
  return { cond, set, calc, c22, pan3, api, send, done, pullBack: done + 16 };
})();
// A pill click opens the menu, the cursor reaches its item, and the selection lands 26 frames after the click.
export const menuTimes = (pill: number) => ({ open: pill + 2, hover: pill + 14, select: pill + 26 });

const PREPOP: CardKey[] = ["h1", "c11", "c12", "h2", "c21", "h3"];

export const FULL_VIEW = {
  s: 540 / (CONTENT_BOTTOM + 60),
  fy: CARD.y + CONTENT_BOTTOM / 2,
};
const STEP2_FY = CARD.y + POS.c21.y + 40;
const STEP3_FY = CARD.y + POS.c31.y + 70;
const WORK_S = 1.25;

export const scene5Camera = (frame: number) => ({
  fx: 480,
  fy: track(frame, [
    { f: 0, v: 256 },
    { f: 70, v: 256 },
    { f: 112, v: STEP2_FY },
    { f: S5.pan3, v: STEP2_FY },
    { f: S5.pan3 + 40, v: STEP3_FY },
    { f: S5.pullBack, v: STEP3_FY },
    { f: S5.pullBack + 60, v: FULL_VIEW.fy },
  ]),
  s:
    frame < 70
      ? ease(frame, [8, 60], [0.8, 1])
      : track(frame, [
          { f: 70, v: 1 },
          { f: 112, v: WORK_S },
          { f: S5.pullBack, v: WORK_S },
          { f: S5.pullBack + 60, v: FULL_VIEW.s },
        ]),
});

const typedAt = (frame: number, t: { start: number; fpc: number }, k: FieldKey) =>
  Math.min(toksLen(FIELDS[k]), Math.max(0, Math.floor((frame - t.start) / t.fpc)));

export const scene5State = (frame: number, fps: number): EditorState => {
  const cards = Object.fromEntries(
    PREPOP.map((k, i) => [k, pop(frame, 20 + i * 6, fps, 14)]),
  ) as Record<CardKey, number>;
  const mSet = menuTimes(S5.set.pill);
  const mCalc = menuTimes(S5.calc.pill);
  const mApi = menuTimes(S5.api.pill);
  const mSend = menuTimes(S5.send.pill);
  cards.c22 = pop(frame, S5.c22, fps, 14);
  cards.c31 = pop(frame, mApi.select, fps, 14);
  cards.c32 = pop(frame, mSend.select, fps, 14);

  const focus: FieldKey | null =
    frame >= S5.send.start - 4 && frame < S5.done
      ? "send32"
      : frame >= S5.api.start - 4 && frame < S5.api.end + 6
        ? "api31"
        : frame >= S5.calc.start - 4 && frame < S5.calc.end + 6
          ? "calc21"
          : frame >= S5.set.start - 4 && frame < S5.set.end + 6
            ? "set21"
            : frame >= S5.cond.click && frame < S5.cond.end + 6
              ? "cond21"
              : null;
  const typing =
    (frame >= S5.cond.start && frame < S5.cond.end) ||
    (frame >= S5.set.start && frame < S5.set.end) ||
    (frame >= S5.calc.start && frame < S5.calc.end) ||
    (frame >= S5.api.start && frame < S5.api.end) ||
    (frame >= S5.send.start && frame < S5.send.end);

  // Which menu is open, and its hover.
  const menuFor = (m: ReturnType<typeof menuTimes>, hover: number) => ({
    p: frame < m.select ? ease(frame, [m.open, m.open + 12], [0, 1]) : ease(frame, [m.select + 2, m.select + 10], [1, 0]),
    hover: frame >= m.hover ? hover : -1,
  });
  const menu =
    frame >= S5.api.pill
      ? { at: "c3" as const, ...(frame >= S5.send.pill ? menuFor(mSend, S5.send.hover) : menuFor(mApi, S5.api.hover)) }
      : { at: "c21" as const, ...(frame >= S5.calc.pill ? menuFor(mCalc, S5.calc.hover) : menuFor(mSet, S5.set.hover)) };

  const fadeIn = (f: number) => ease(frame, [f, f + 12], [0, 1]);
  const fadeOut = (f: number) => ease(frame, [f, f + 6], [1, 0]);
  const set21Row = pop(frame, mSet.select, fps, 14);
  const calc21Row = pop(frame, mCalc.select, fps, 14);
  return {
    ...EMPTY_EDITOR,
    rows: [0, 1].map((i) => ease(frame, [10 + i * 6, 10 + i * 6 + 26], [0, 1])),
    titleText: TEXT.title,
    cards,
    typed: {
      cond21: typedAt(frame, S5.cond, "cond21"),
      set21: typedAt(frame, S5.set, "set21"),
      calc21: typedAt(frame, S5.calc, "calc21"),
      api31: typedAt(frame, S5.api, "api31"),
      send32: typedAt(frame, S5.send, "send32"),
    },
    focus,
    set21Row,
    calc21Row,
    c21H: track(frame, [
      { f: 0, v: 40 },
      { f: S5.cond.end + 4, v: 40 },
      { f: S5.cond.end + 16, v: 64 },
      { f: mSet.select, v: 64 },
      { f: mSet.select + 12, v: 88 },
      { f: S5.calc.end + 4, v: 88 },
      { f: S5.calc.end + 16, v: 86 },
    ]),
    // "+ Add action" pills: each is visible from when it becomes useful until the cursor picks an action.
    pill21: {
      p: Math.max(
        fadeIn(S5.cond.end + 8) * fadeOut(mSet.select),
        fadeIn(S5.set.end + 4) * fadeOut(mCalc.select),
      ),
      slot: frame < S5.set.end + 4 ? 1 : 2,
    },
    pill3: {
      p: Math.max(fadeIn(40) * fadeOut(mApi.select), fadeIn(S5.api.end + 10) * fadeOut(mSend.select)),
      slot: frame < S5.api.end + 10 ? 0 : 1,
    },
    menu,
    returnsChip: pop(frame, S5.api.end + 4, fps, 14),
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

// Scene 7 — the chat drives the run: input sent → step 1, typing indicator → step 2, step 3 → reply.
export const S7 = {
  typeStart: 50,
  typeFpc: 2.7, // 45ms per character
  send: 276,
  step1: 280, // phase 1: step 1 node lights, {order_age} = 12 days → Passed
  pass1: 290,
  step2: 300, // phase 2: 1.0s typing indicator while step 2 evaluates
  branch21: 308,
  calc: 324,
  step3: 360, // phase 3: CALL_API → label, and the reply lands at the same time
  label: 370,
  agentReply: 370,
  send32: 382,
  allDone: 430, // badge, then a 1.2s hold before the crossfade into scene 8
};

export const scene7State = (frame: number, fps: number): EditorState => {
  const on = (f: number, d = 10) => ease(frame, [f, f + d], [0, 1]);
  const off = (f: number) => ease(frame, [f, f + 12], [1, 0]);
  return {
    ...S6_END,
    saved: true,
    // Scene 6's strict-boundary glow eases down to the muted accent level.
    glow: S6_END.glow * ease(frame, [0, 30], [1, 0.4]),
    // Only the executing node is lit; finished nodes keep a quiet check.
    stepActive: [on(S7.step1) * off(S7.step2), on(S7.step2) * off(S7.step3), on(S7.step3) * off(S7.allDone)],
    stepDone: [on(S7.step2, 6), on(S7.step3, 6), on(S7.allDone, 6)],
    passChip: pop(frame, S7.pass1, fps, 14),
    skipStep1Branches: on(S7.pass1, 18),
    c21Active: on(S7.branch21) * off(S7.step3 + 20),
    calcPill: pop(frame, S7.calc, fps, 11),
    c31Active: on(S7.step3 + 4) * off(S7.send32 + 10),
    labelPill: pop(frame, S7.label, fps, 11),
    c32Active: on(S7.send32) * off(S7.allDone),
  };
};

export const IF_CENTER = W(POS.c11.x + POS.c11.w / 2, POS.c11.y + 46);
