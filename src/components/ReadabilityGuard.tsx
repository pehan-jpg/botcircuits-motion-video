import { useLayoutEffect } from "react";
import { MAX_CPS } from "../constants";
import { TypeSchedule } from "./Typewriter";

export type MessageGuardSpec = {
  id: string;
  /** First frame on which a character may become visible. */
  typeStart: number;
  /** Fixed bubble width once typing starts. */
  width: number;
  /** Bubble height with exactly one line. */
  oneLineHeight: number;
  lineHeight: number;
  schedule: TypeSchedule;
};

const parseColor = (c: string): [number, number, number, number] => {
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) throw new Error(`[ReadabilityGuard] cannot parse colour ${c}`);
  const v = m[1].split(/[,\s/]+/).filter(Boolean).map(parseFloat);
  return [v[0], v[1], v[2], v[3] ?? 1];
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

/** Background behind an element: the nearest ancestor with a non transparent background. */
const backgroundOf = (el: HTMLElement): number[] => {
  let n: HTMLElement | null = el;
  while (n) {
    const c = parseColor(getComputedStyle(n).backgroundColor);
    if (c[3] > 0) return c.slice(0, 3);
    n = n.parentElement;
  }
  return [255, 255, 255];
};

type Box = { kind: string; id: string; state: string; slot: number; r: DOMRect; el: HTMLElement };

const overlaps = (a: DOMRect, b: DOMRect) =>
  a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;

/**
 * Development guard. Renders nothing; throws (failing the render) when:
 *  1. a message shows any character on or before its first typing frame,
 *  2. a bubble's width changes after typing starts,
 *  3. an empty bubble is taller than one line, or a bubble runs more than one line ahead of its text,
 *  4. any message is typed faster than 40 characters per second,
 *  5. any text marked data-contrast falls below 4.5:1 against its background,
 *  6. chips, receipts and slots overlap each other or the chat window
 *     (a receipt may cover its own slot; a receipt in flight may cross the chat window).
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
    if (!root) return fail(`root #${rootId} not found`);
    const visibleOpacity = (el: HTMLElement) => {
      let o = 1;
      for (let n: HTMLElement | null = el; n && n !== root; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
      return o;
    };

    for (const m of messages) {
      if (m.schedule.minGap < 1 / MAX_CPS - 1e-9) {
        fail(`"${m.id}" types at ${(1 / m.schedule.minGap).toFixed(1)} cps (max ${MAX_CPS})`);
      }
      const bubble = root.querySelector<HTMLElement>(`[data-bubble="${m.id}"]`);
      if (!bubble) continue;
      const chars = Array.from(root.querySelectorAll<HTMLElement>(`[data-guard-char="${m.id}"]`));
      const visible = chars.filter((c) => Number(getComputedStyle(c).opacity) > 0);
      if (frame <= m.typeStart && visible.length > 0) {
        fail(`"${m.id}" shows ${visible.length} character(s) on or before its first typing frame`);
      }
      if (frame >= m.typeStart && Math.abs(bubble.offsetWidth - m.width) > 0.5) {
        fail(`"${m.id}" bubble width ${bubble.offsetWidth}px after typing started, expected a fixed ${m.width}px`);
      }
      const lines = new Set(visible.map((c) => Math.round(c.getBoundingClientRect().top))).size;
      const allowed = lines === 0 ? m.oneLineHeight : m.oneLineHeight + m.lineHeight * lines;
      if (bubble.offsetHeight > allowed + 0.5) {
        fail(`"${m.id}" bubble is ${bubble.offsetHeight}px tall with ${lines} visible line(s) (max ${allowed}px)`);
      }
    }

    // 5. Contrast of every marked text element that is on screen.
    root.querySelectorAll<HTMLElement>("[data-contrast]").forEach((el) => {
      if (visibleOpacity(el) < 0.5) return; // mid crossfade: checked when it settles
      const fg = parseColor(getComputedStyle(el).color);
      const bg = backgroundOf(el);
      const composite = [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3]));
      const ratio = contrastRatio(composite, bg);
      if (ratio < 4.5) fail(`text "${el.textContent?.slice(0, 30)}" contrast ${ratio.toFixed(2)}:1 is below 4.5:1`);
    });

    // 6. Overlaps.
    const boxes: Box[] = Array.from(root.querySelectorAll<HTMLElement>("[data-box]"))
      .filter((el) => visibleOpacity(el) > 0.02)
      .map((el) => {
        const [kind, id, state = "", slot = "-1"] = el.dataset.box!.split(":");
        return { kind, id, state, slot: Number(slot), r: el.getBoundingClientRect(), el };
      });
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const [a, b] = [boxes[i], boxes[j]];
        if (!overlaps(a.r, b.r)) continue;
        const pair = [a.kind, b.kind].sort().join("+");
        const receipt = a.kind === "receipt" ? a : b;
        const other = receipt === a ? b : a;
        if (pair === "receipt+slot" && receipt.slot === other.slot) continue;
        if (pair === "chat+receipt" && receipt.state === "flying") continue;
        if (pair === "chat+chip") continue; // chips live inside the chat window
        if (pair === "chip+receipt" && receipt.state === "flying") continue; // the flight starts from its chip
        fail(`${a.kind} "${a.id}" overlaps ${b.kind} "${b.id}"`);
      }
    }
  });
  return null;
};
