import { ease, pop, typed, TEXT } from "./theme";
import { BRANCH_Y, CARD, EMPTY_EDITOR, EditorState, POS } from "./components/ProcedureEditor";

// World-space helper for aiming the cursor at editor elements.
export const W = (x: number, y: number) => ({ x: CARD.x + x, y: CARD.y + y });

const caret = (frame: number) => Math.floor(frame / 18) % 2 === 0;

// Scene 5 — creating & defining a multi-step procedure.
export const S5 = {
  titleClick: 72,
  titleType: 76,
  titleFpc: 2,
  stepsStart: 146, // three steps populate, 100ms (6 frames) apart
  addClick: 206,
  branchStart: 212,
};

export const scene5State = (frame: number, fps: number): EditorState => {
  const titleText = typed(TEXT.title, frame, S5.titleType, S5.titleFpc);
  const typing = frame >= S5.titleType && titleText.length < TEXT.title.length;
  const steps = [0, 1, 2].map((i) => pop(frame, S5.stepsStart + i * 6, fps, 13)) as [number, number, number];
  return {
    ...EMPTY_EDITOR,
    rows: [0, 1].map((i) => ease(frame, [14 + i * 6, 14 + i * 6 + 26], [0, 1])),
    titleText,
    titleFocus: frame >= S5.titleClick && frame < S5.stepsStart,
    steps,
    addPill: frame < S5.addClick ? ease(frame, [S5.stepsStart + 18, S5.stepsStart + 32], [0, 1]) : ease(frame, [S5.addClick + 2, S5.addClick + 10], [1, 0]),
    branches: [pop(frame, S5.branchStart, fps, 11), pop(frame, S5.branchStart + 6, fps, 11)],
    caretOn: typing || caret(frame),
  };
};

export const S5_END = scene5State(1000, 60);

// Scene 6 — boundary rules & human handoff.
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

// Scene 7 — synchronized live traversal (chat on the right, tree on the left).
export const S7 = {
  typeStart: 52,
  typeFpc: 1.4,
  send: 124,
  step1: 134, // step 1 lights up, typing indicator starts
  trailStart: 160,
  trailEnd: 196, // pulse reaches the IF card
  triggered: 196,
  agentReply: 214,
  executed: 238,
  followed: 256,
};

export const scene7State = (frame: number, fps: number): EditorState => ({
  ...S6_END,
  saved: true,
  step1Active: ease(frame, [S7.step1, S7.step1 + 12], [0, 1]) * ease(frame, [S7.trailEnd, S7.trailEnd + 24], [1, 0.4]),
  trail: ease(frame, [S7.trailStart, S7.trailEnd], [0, 1], (t) => t),
  ifActive:
    ease(frame, [S7.trailEnd - 4, S7.trailEnd + 8], [0, 1]) *
    (0.75 + 0.25 * Math.cos(Math.max(0, frame - S7.trailEnd) / 9)),
  triggered: frame < S7.triggered ? 0 : pop(frame, S7.triggered, fps, 9),
  executed: pop(frame, S7.executed, fps, 10),
});

export const IF_CENTER = W(POS.ifCard.x + POS.ifCard.w / 2, BRANCH_Y);
