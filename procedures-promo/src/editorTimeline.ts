import { ease, pop, typed, TEXT } from "./theme";
import { CARD, EMPTY_EDITOR, EditorState, POS } from "./components/ProcedureEditor";

// World-space helpers for aiming the cursor at editor elements.
export const W = (x: number, y: number) => ({ x: CARD.x + x, y: CARD.y + y });

const caret = (frame: number) => Math.floor(frame / 18) % 2 === 0;

// Scene 5 — creating & defining the procedure.
export const S5 = {
  titleClick: 72,
  titleType: 76,
  titleFpc: 2.4,
  instrClick: 162,
  instrType: 166,
  instrFpc: 1.2, // 20ms per character at 60fps
  addClick: 298,
  branchStart: 304,
};

export const scene5State = (frame: number, fps: number): EditorState => {
  const titleText = typed(TEXT.title, frame, S5.titleType, S5.titleFpc);
  const instrText = typed(TEXT.instruction, frame, S5.instrType, S5.instrFpc);
  const typing =
    (frame >= S5.titleType && titleText.length < TEXT.title.length) ||
    (frame >= S5.instrType && instrText.length < TEXT.instruction.length);
  return {
    ...EMPTY_EDITOR,
    rows: [0, 1, 2, 3, 4, 5].map((i) => ease(frame, [14 + i * 5, 14 + i * 5 + 26], [0, 1])),
    titleText,
    titleFocus: frame >= S5.titleClick && frame < S5.instrClick,
    instrText,
    instrFocus: frame >= S5.instrClick && frame < S5.addClick,
    chip: pop(frame, 266, fps, 14),
    addPill: ease(frame, [S5.addClick + 2, S5.addClick + 12], [1, 0]),
    branches: [
      pop(frame, S5.branchStart, fps, 11),
      pop(frame, S5.branchStart + 6, fps, 11),
      pop(frame, S5.branchStart + 12, fps, 11),
    ],
    caretOn: typing || caret(frame),
  };
};

export const S5_END = scene5State(1000, 60);

// Scene 6 — boundary rules & human handoff.
export const S6 = {
  condType: 54,
  condFpc: 2.2,
  actionClick: 126,
  optionHover: 150,
  optionClick: 164,
  toggleClick: 206,
};

export const scene6State = (frame: number, fps: number): EditorState => {
  const condText = typed(TEXT.condition, frame, S6.condType, S6.condFpc);
  return {
    ...S5_END,
    instrFocus: false,
    condText,
    condFocus: frame >= 50 && frame < 100,
    actionOpen:
      frame < S6.optionClick
        ? ease(frame, [S6.actionClick + 2, S6.actionClick + 16], [0, 1])
        : ease(frame, [S6.optionClick + 2, S6.optionClick + 12], [1, 0]),
    actionHover: frame >= S6.optionHover ? 2 : frame >= 142 ? 1 : -1,
    actionSelected: frame >= S6.optionClick + 2,
    toggle: ease(frame, [S6.toggleClick, S6.toggleClick + 10], [0, 1]),
    glow: ease(frame, [S6.toggleClick + 2, S6.toggleClick + 30], [0, 1]),
    badge: pop(frame, S6.toggleClick + 8, fps, 10),
    caretOn: condText.length < TEXT.condition.length || caret(frame),
  };
};

export const S6_END = scene6State(1000, 60);

// Scene 7 — live execution traversal.
export const S7 = {
  typeStart: 56,
  typeFpc: 1.4,
  send: 132,
  trailStart: 144,
  trailEnd: 214,
  agentReply: 250,
  followed: 296,
};

export const scene7State = (frame: number): EditorState => {
  const verifyIn = ease(frame, [S7.trailStart + 6, S7.trailStart + 18], [0, 1]);
  const verifyOut = ease(frame, [S7.trailEnd - 6, S7.trailEnd + 20], [1, 0.35]);
  return {
    ...S6_END,
    saved: true,
    trail: ease(frame, [S7.trailStart, S7.trailEnd], [0, 1]),
    verifyActive: verifyIn * verifyOut,
    ifActive:
      ease(frame, [S7.trailEnd - 8, S7.trailEnd + 6], [0, 1]) *
      (0.75 + 0.25 * Math.cos(Math.max(0, frame - S7.trailEnd) / 9)),
  };
};

export const IF_CENTER = W(POS.ifCard.x + POS.ifCard.w / 2, POS.ifCard.y + POS.ifCard.h / 2);
