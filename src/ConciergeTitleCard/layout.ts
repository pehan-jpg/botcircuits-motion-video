import { measureText } from "@remotion/layout-utils";
import { HEIGHT, WIDTH } from "../constants";
import { SANS } from "../fonts";
import { lineStartIndices, TYPE_RULES } from "../components/Typewriter";
import { BEATS, Beat, ChipBeat, MessageBeat } from "./timeline";

const measure = (text: string, fontSize: number, fontWeight: number) =>
  measureText({
    text,
    fontFamily: SANS,
    fontSize,
    fontWeight: String(fontWeight),
    validateFontIsLoaded: true,
  }).width;

export const CX = WIDTH / 2;
export const CY = HEIGHT / 2;

export const CARD = { w: 760, h: 560, radius: 28, padX: 32, padTop: 26 };
export const HEADER = { orb: 56, gap: 18, nameSize: 28, statusSize: 20, height: 60 };
export const MSG_FONT = { size: 30, weight: 500, lineHeight: 42 };
export const CHIP_FONT = { size: 26, weight: 600, lineHeight: 34 };
export const STAMP = { size: 14, lineHeight: 20, gap: 6 };
export const BUBBLE = { padX: 24, padY: 14, radius: 26, tail: 8 };
export const CUSTOMER_AVATAR = 44;
export const AVATAR_GAP = 12;
export const ITEM_GAP = 16;
export const THREAD_PAD = { top: 18, bottom: 16 };
export const INDICATOR = { w: 96, h: 56 };
export const CHIP = { h: 64, padL: 22, icon: 30, gap: 14, padR: 26 };

/** Greedy word wrap with real glyph widths. Trailing spaces stay on their line. */
export const wrapLines = (text: string, maxWidth: number) => {
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

export type MessageLayout = {
  beat: MessageBeat;
  lines: string[];
  /** Fixed bubble width, final from the first frame. */
  w: number;
  oneLineH: number;
  /** Frames at which the bubble starts growing to line 2, 3, ... */
  growAt: number[];
};

export type ChipLayout = { beat: ChipBeat; w: number; labelW: number };

/** Pre-measured layout. Call only after fonts are loaded. */
export const computeLayout = () => {
  const threadW = CARD.w - CARD.padX * 2;
  const threadTop = CARD.padTop + HEADER.height + 20 + 1; // header, gap, divider
  const viewportH = CARD.h - threadTop - 8;

  const maxText = {
    customer: threadW - CUSTOMER_AVATAR - AVATAR_GAP - BUBBLE.padX * 2 - 70,
    agent: threadW - BUBBLE.padX * 2 - 70,
  };

  const messages = new Map<string, MessageLayout>();
  const chips = new Map<string, ChipLayout>();
  for (const beat of BEATS) {
    if (beat.kind === "message") {
      const lines = wrapLines(beat.text, maxText[beat.side]);
      const textW = Math.ceil(Math.max(...lines.map((l) => measure(l.trimEnd(), MSG_FONT.size, MSG_FONT.weight)))) + 4;
      const starts = lineStartIndices(lines);
      const growAt = starts
        .slice(1)
        .map((i) => beat.typeStart + (beat.schedule.starts[i] - TYPE_RULES.lineGrow) * 60);
      messages.set(beat.id, {
        beat,
        lines,
        w: textW + BUBBLE.padX * 2,
        oneLineH: MSG_FONT.lineHeight + BUBBLE.padY * 2,
        growAt,
      });
    } else {
      const labelW =
        Math.ceil(
          Math.max(
            measure(beat.busy, CHIP_FONT.size, CHIP_FONT.weight),
            measure(beat.doneLabel, CHIP_FONT.size, CHIP_FONT.weight),
          ),
        ) + 2;
      chips.set(beat.id, { beat, labelW, w: CHIP.padL + CHIP.icon + CHIP.gap + labelW + CHIP.padR });
    }
  }

  // Content height changes: each is an instant with the new total content height.
  // The scroll follows each change with its own 0.4s ease out.
  type Change = { at: number; id: string; height: number };
  const changes: Change[] = [];
  const stampRow = STAMP.gap + STAMP.lineHeight;
  for (const beat of BEATS) {
    if (beat.kind === "message") {
      const m = messages.get(beat.id)!;
      changes.push({ at: beat.pop[0], id: beat.id, height: m.oneLineH + stampRow });
      m.growAt.forEach((at, k) =>
        changes.push({ at, id: beat.id, height: m.oneLineH + MSG_FONT.lineHeight * (k + 1) + stampRow }),
      );
    } else {
      changes.push({ at: beat.indicator[0], id: beat.id, height: INDICATOR.h });
      changes.push({ at: beat.expand[0], id: beat.id, height: CHIP.h });
    }
  }
  changes.sort((a, b) => a.at - b.at);

  const heights = new Map<string, number>();
  const order = BEATS.map((b) => b.id);
  const contentAt = () => {
    let h = THREAD_PAD.top + THREAD_PAD.bottom;
    let n = 0;
    for (const id of order) {
      const v = heights.get(id);
      if (v === undefined) continue;
      h += v + (n > 0 ? ITEM_GAP : 0);
      n++;
    }
    return h;
  };
  // Never rest on a half cut row: if the minimum scroll would cut a row at the
  // top edge, scroll that row fully out and leave the next one SNAP_MARGIN below the edge.
  const SNAP_MARGIN = 14;
  const snapped = (minScroll: number) => {
    if (minScroll <= 0) return 0;
    let top = THREAD_PAD.top;
    for (const id of order) {
      const v = heights.get(id);
      if (v === undefined) continue;
      const bottom = top + v;
      if (top < minScroll && bottom > minScroll - SNAP_MARGIN) {
        return Math.max(minScroll, bottom + ITEM_GAP - SNAP_MARGIN);
      }
      top = bottom + ITEM_GAP;
    }
    return minScroll;
  };
  const scrollSteps: { at: number; delta: number }[] = [];
  let prevScroll = 0;
  for (const c of changes) {
    heights.set(c.id, c.height);
    const target = snapped(Math.max(0, contentAt() - viewportH));
    if (target !== prevScroll) scrollSteps.push({ at: c.at, delta: target - prevScroll });
    prevScroll = target;
  }

  return {
    threadW,
    threadTop,
    viewportH,
    messages,
    chips,
    scrollSteps,
    finalScroll: prevScroll,
    finalContent: contentAt(),
    stampRow,
  };
};

export type Layout = ReturnType<typeof computeLayout>;
export type { Beat };
