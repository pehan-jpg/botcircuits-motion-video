import { HEADLINE_CPS, sec } from "../constants";
import { typewriterDuration } from "../components/Typewriter";

export const DURATION = 336; // 5.6s at 60 fps

export const TITLE_TEXT = "Space by";
export const UNDERLINE_WORD = "Space";

/** All beats in frames (60 fps). Comments give seconds. */
export const T = {
  cardIn: 0, // 0.0
  cardInDur: sec(0.45),
  rowIn: sec(0.5), // 0.5 new row slides in
  rowInDur: sec(0.3),
  highlightFade: [sec(0.62), sec(1.1)] as const,

  // 1.0 to 1.4 trigger
  leg0: [sec(1.0), sec(1.27)] as const, // row -> node A
  popA: sec(1.13),
  lineAB: [sec(1.23), sec(1.43)] as const,
  popB: sec(1.33),
  popDur: sec(0.24),
  spinnerIn: sec(1.05),

  // 1.4 to 2.3 agent
  leg1: [sec(1.43), sec(1.7)] as const, // A -> B
  haloB: [sec(1.7), sec(2.1)] as const, // 0.4s halo pulse
  lineBC: [sec(2.0), sec(2.2)] as const,
  leg2: [sec(2.1), sec(2.37)] as const, // B -> C

  // 2.3 to 2.9 review gate
  ringC: [sec(2.37), sec(2.57)] as const, // ring 1 start, ring 2 start
  ringDur: sec(0.24),
  approveC: [sec(2.72), sec(2.92)] as const,
  lineCD: [sec(2.74), sec(2.9)] as const,
  leg3: [sec(2.8), sec(3.0)] as const, // C -> D
  popD: sec(2.9),

  // 2.9 to 3.3 complete and hold
  statusDone: [sec(2.97), sec(3.17)] as const,

  // 3.3 to 3.8 merge
  merge: [sec(3.3), sec(3.68)] as const,
  symbolIn: [sec(3.48), sec(3.72)] as const,
  symbolMove: [sec(3.66), sec(3.98)] as const,

  // title
  titleStart: sec(3.9),
  underline: sec(5.0),
  loopOut: [DURATION - sec(0.4), DURATION] as const,
};

export const TYPE_END = T.titleStart + Math.ceil(typewriterDuration(TITLE_TEXT, HEADLINE_CPS) * 60);
export const WORDMARK_IN: readonly [number, number] = [TYPE_END + sec(0.04), TYPE_END + sec(0.54)];

/* ---------- layout (px, 1920 x 1080) ---------- */
export const CARD = { left: 640, top: 286, width: 640, height: 220, radius: 20 };
export const ROW = { top: 52, pitch: 52, height: 36, inset: 14, dotX: 30 };
export const NODE = { size: 96, y: 706, xs: [630, 850, 1070, 1290] as const, radius: 26 };
export const MERGE_POINT = { x: 960, y: 540 };

export const TITLE = {
  fontSize: 84,
  fontWeight: 600,
  lineHeight: 1.45,
  symbolSize: 88,
  gapSymbol: 26,
  gapWordmark: 20,
  wordmarkHeight: 56,
  centreY: 540,
};

/** Row dot of the new (top) row in frame coordinates. */
export const NEW_ROW_DOT = {
  x: CARD.left + ROW.dotX,
  y: CARD.top + ROW.top + ROW.height / 2,
};
