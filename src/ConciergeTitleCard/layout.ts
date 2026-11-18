import { measureText } from "@remotion/layout-utils";
import { HEIGHT, WIDTH } from "../constants";
import { SANS } from "../fonts";
import { lineStartIndices, TYPE_RULES } from "../components/Typewriter";
import { BEATS, ChipRowBeat, ChipSpec, MessageBeat } from "./timeline";

const measure = (text: string, fontSize: number, fontWeight: number) =>
  measureText({ text, fontFamily: SANS, fontSize, fontWeight: String(fontWeight), validateFontIsLoaded: true }).width;

export type Rect = { x: number; y: number; w: number; h: number };

// Stage: 1480 x 780, radius 36, centred.
export const STAGE: Rect & { radius: number } = {
  w: 1480,
  h: 780,
  x: (WIDTH - 1480) / 2,
  y: (HEIGHT - 780) / 2,
  radius: 36,
};

// Left: chat window 620 x 620 at 80px from the stage's left edge, vertically centred.
export const CHAT: Rect & { radius: number } = {
  w: 620,
  h: 620,
  x: STAGE.x + 80,
  y: STAGE.y + (STAGE.h - 620) / 2,
  radius: 24,
};
// Logo: 40px, with at least a quarter of its height (10px) of clear space on every side.
export const CHAT_HEADER = { h: 76, padX: 22, logo: 40, nameSize: 22, orb: 40 };
export const COMPOSER = { h: 52, padX: 20, padBottom: 20, send: 52, gap: 10 };
export const THREAD = {
  padX: 20,
  top: CHAT_HEADER.h + 1,
  bottom: CHAT.h - COMPOSER.padBottom - COMPOSER.h - 12,
  padTop: 18,
  padBottom: 14,
  gap: 14,
};

// Right: receipt rail 560 wide at 80px from the stage's right edge; three 520 x 120 slots, 24px gaps.
export const RAIL: Rect = { w: 560, h: 3 * 120 + 2 * 24, x: STAGE.x + STAGE.w - 80 - 560, y: 0 };
RAIL.y = STAGE.y + (STAGE.h - RAIL.h) / 2;
export const SLOT = { w: 520, h: 120, radius: 20, gap: 24 };
export const slotRect = (i: number): Rect => ({
  x: RAIL.x + (RAIL.w - SLOT.w) / 2,
  y: RAIL.y + i * (SLOT.h + SLOT.gap),
  w: SLOT.w,
  h: SLOT.h,
});

export const MSG_FONT = { size: 28, weight: 500, lineHeight: 38 };
export const BUBBLE = { padX: 20, padY: 12, radius: 22, tail: 6 };
export const AVATAR = 40;
export const AVATAR_GAP = 10;
export const PILL = { w: 76, h: 48 };
export const CHIP_FONT = { size: 22, weight: 600, lineHeight: 30 };
export const CHIP = { h: 48, padL: 14, icon: 24, gap: 10, padR: 18, stack: 8 };
export const KEPT = { h: 40, padL: 12, icon: 22, gap: 8, padR: 16 };
export const RECEIPT = {
  glyphCircle: 56,
  padL: 22,
  textX: 22 + 56 + 18,
  titleSize: 26,
  detailSize: 20,
  stampSize: 18,
  badge: 30,
};

export type MessageLayout = { beat: MessageBeat; lines: string[]; w: number; oneLineH: number; growAt: number[] };
export type ChipLayout = { spec: ChipSpec; row: ChipRowBeat; index: number; w: number; labelW: number; keptW: number; keptLabelW: number };

/** Greedy word wrap with real glyph widths. Trailing spaces stay on their line. */
const wrapLines = (text: string, maxWidth: number) => {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && measure(candidate, MSG_FONT.size, MSG_FONT.weight) > maxWidth) {
      lines.push(`${current} `);
      current = word;
    } else {
      current = candidate;
    }
  }
  lines.push(current);
  return lines;
};

/** Pre-measured layout. Call only after fonts are loaded. */
export const computeLayout = () => {
  const threadW = CHAT.w - THREAD.padX * 2;
  const viewportH = THREAD.bottom - THREAD.top;
  const maxText = threadW - AVATAR - AVATAR_GAP - BUBBLE.padX * 2 - 70;

  const messages = new Map<string, MessageLayout>();
  const chips = new Map<string, ChipLayout>();
  const rowHeights = new Map<string, number>();
  const warnings: string[] = [];

  for (const beat of BEATS) {
    if (beat.kind === "message") {
      const lines = wrapLines(beat.text, maxText);
      const textW = Math.ceil(Math.max(...lines.map((l) => measure(l.trimEnd(), MSG_FONT.size, MSG_FONT.weight)))) + 4;
      const starts = lineStartIndices(lines);
      messages.set(beat.id, {
        beat,
        lines,
        w: textW + BUBBLE.padX * 2,
        oneLineH: MSG_FONT.lineHeight + BUBBLE.padY * 2,
        growAt: starts.slice(1).map((i) => beat.typeStart + (beat.schedule.starts[i] - TYPE_RULES.lineGrow) * 60),
      });
    } else {
      beat.chips.forEach((spec, index) => {
        const labelW = Math.ceil(Math.max(measure(spec.busy, CHIP_FONT.size, 600), measure(spec.doneLabel, CHIP_FONT.size, 600))) + 2;
        const keptLabelW = Math.ceil(measure(spec.doneLabel, CHIP_FONT.size, 600)) + 2;
        chips.set(spec.id, {
          spec,
          row: beat,
          index,
          labelW,
          w: CHIP.padL + CHIP.icon + CHIP.gap + labelW + CHIP.padR,
          keptLabelW,
          keptW: KEPT.padL + KEPT.icon + KEPT.gap + keptLabelW + KEPT.padR,
        });
        // Receipt text must fit: title row is full width (the badge sits on the corner).
        const titleW = measure(spec.receipt.title, RECEIPT.titleSize, 600);
        const room = SLOT.w - RECEIPT.textX - 20;
        if (titleW > room) warnings.push(`receipt title "${spec.receipt.title}" is ${Math.round(titleW)}px, room ${room}px`);
      });
      rowHeights.set(beat.id, beat.chips.length * CHIP.h + (beat.chips.length - 1) * CHIP.stack);
    }
  }

  // Height changes of the thread content; the scroll follows each with a 0.4s ease out.
  type Change = { at: number; id: string; height: number };
  const changes: Change[] = [];
  for (const beat of BEATS) {
    if (beat.kind === "message") {
      const m = messages.get(beat.id)!;
      const appear = beat.indicator ? beat.indicator[0] : beat.enter[0];
      if (beat.indicator) changes.push({ at: beat.indicator[0], id: beat.id, height: PILL.h });
      changes.push({ at: beat.indicator ? beat.enter[0] : appear, id: beat.id, height: m.oneLineH });
      m.growAt.forEach((at, k) => changes.push({ at, id: beat.id, height: m.oneLineH + MSG_FONT.lineHeight * (k + 1) }));
    } else {
      changes.push({ at: beat.indicator[0], id: beat.id, height: PILL.h });
      changes.push({ at: beat.expand[0], id: beat.id, height: rowHeights.get(beat.id)! });
    }
  }
  changes.sort((a, b) => a.at - b.at);

  const order = BEATS.map((b) => b.id);
  const heights = new Map<string, number>();
  const contentH = () => {
    let h = THREAD.padTop + THREAD.padBottom;
    let n = 0;
    for (const id of order) {
      const v = heights.get(id);
      if (v === undefined) continue;
      h += v + (n++ > 0 ? THREAD.gap : 0);
    }
    return h;
  };
  // Never rest on a half cut row: scroll a cut row fully out instead.
  const SNAP = 12;
  const snapped = (min: number) => {
    if (min <= 0) return 0;
    let top = THREAD.padTop;
    for (const id of order) {
      const v = heights.get(id);
      if (v === undefined) continue;
      const bottom = top + v;
      if (top < min && bottom > min - SNAP) return Math.max(min, bottom + THREAD.gap - SNAP);
      top = bottom + THREAD.gap;
    }
    return min;
  };
  const scrollSteps: { at: number; delta: number }[] = [];
  let prev = 0;
  for (const c of changes) {
    heights.set(c.id, c.height);
    const target = snapped(Math.max(0, contentH() - viewportH));
    if (target !== prev) scrollSteps.push({ at: c.at, delta: target - prev });
    prev = target;
  }

  return { threadW, viewportH, messages, chips, rowHeights, scrollSteps, warnings };
};

export type Layout = ReturnType<typeof computeLayout>;
