import { useLayoutEffect } from "react";
import { MAX_CPS } from "../constants";
import { TypeSchedule } from "./Typewriter";

export type MessageGuardSpec = {
  id: string;
  /** First frame on which a character may become visible. */
  typeStart: number;
  /** Fixed bubble width. */
  width: number;
  /** Bubble height with exactly one line. */
  oneLineHeight: number;
  lineHeight: number;
  schedule: TypeSchedule;
};

const parseRgb = (c: string) => {
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) throw new Error(`[ReadabilityGuard] cannot parse colour ${c}`);
  return m[1].split(",").map((v) => parseFloat(v)).slice(0, 3);
};

const luminance = ([r, g, b]: number[]) => {
  const ch = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
};

export const contrastRatio = (a: number[], b: number[]) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

/**
 * Development guard. Renders nothing; throws (failing the render) when:
 *  1. a message shows any character on or before its first typing frame,
 *  2. a bubble's width differs from its fixed final width,
 *  3. an empty bubble is taller than one line, or a bubble is more than one line ahead of its text,
 *  4. any message is typed faster than 40 characters per second,
 *  5. chip text contrast drops below 4.5:1.
 */
export const ReadabilityGuard: React.FC<{
  enabled: boolean;
  frame: number;
  rootId: string;
  messages: MessageGuardSpec[];
}> = ({ enabled, frame, rootId, messages }) => {
  useLayoutEffect(() => {
    if (!enabled) return;
    const fail = (msg: string) => {
      throw new Error(`[ReadabilityGuard] frame ${frame}: ${msg}`);
    };
    const root = document.getElementById(rootId);
    if (!root) fail(`root #${rootId} not found`);

    for (const m of messages) {
      // 4. Speed ceiling.
      if (m.schedule.minGap < 1 / MAX_CPS - 1e-9) {
        fail(`"${m.id}" types at ${(1 / m.schedule.minGap).toFixed(1)} cps (max ${MAX_CPS})`);
      }
      const bubble = root!.querySelector<HTMLElement>(`[data-bubble="${m.id}"]`);
      if (!bubble) continue;
      const chars = Array.from(root!.querySelectorAll<HTMLElement>(`[data-guard-char="${m.id}"]`));
      const visible = chars.filter((c) => Number(getComputedStyle(c).opacity) > 0);

      // 1. Nothing visible before typing starts.
      if (frame <= m.typeStart && visible.length > 0) {
        fail(`"${m.id}" shows ${visible.length} character(s) on or before its first typing frame`);
      }
      // 2. Fixed width (layout width, unaffected by the pop transform).
      if (Math.abs(bubble.offsetWidth - m.width) > 0.5) {
        fail(`"${m.id}" bubble width ${bubble.offsetWidth}px, expected a fixed ${m.width}px`);
      }
      // 3. Never a tall empty box; grow one line at a time.
      const lines = new Set(visible.map((c) => Math.round(c.getBoundingClientRect().top))).size;
      const allowed = lines === 0 ? m.oneLineHeight : m.oneLineHeight + m.lineHeight * lines;
      if (bubble.offsetHeight > allowed + 0.5) {
        fail(`"${m.id}" bubble is ${bubble.offsetHeight}px tall with ${lines} visible line(s) (max ${allowed}px)`);
      }
    }

    // 5. Chip contrast in every state, including mid crossfade.
    root!.querySelectorAll<HTMLElement>("[data-chip]").forEach((chip) => {
      const bg = parseRgb(getComputedStyle(chip).backgroundColor);
      chip.querySelectorAll<HTMLElement>("[data-chip-label]").forEach((label) => {
        const fg = parseRgb(getComputedStyle(label).color);
        const ratio = contrastRatio(fg, bg);
        if (ratio < 4.5) fail(`chip "${chip.dataset.chip}" text contrast ${ratio.toFixed(2)}:1 is below 4.5:1`);
      });
    });
  });
  return null;
};
