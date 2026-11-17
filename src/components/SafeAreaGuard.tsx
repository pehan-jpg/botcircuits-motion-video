import { useLayoutEffect } from "react";
import { CENTRE_BOX, HEIGHT, SAFE_AREA, WIDTH } from "../constants";

export type TitleGuardSpec = {
  /** First frame of the title typing. */
  startFrame: number;
  /** Expected title box in composition pixels. */
  box: { left: number; top: number; width: number; height: number };
};

/**
 * Development guard. Renders nothing; throws (failing the render) when:
 *  1. any element marked data-guard leaves the 96px safe area or the centre 60 percent,
 *  2. the title box differs from its pre-measured size or position, or wraps,
 *  3. any title character is visible on or before the title's first frame.
 */
export const SafeAreaGuard: React.FC<{
  enabled: boolean;
  frame: number;
  rootId: string;
  title: TitleGuardSpec;
}> = ({ enabled, frame, rootId, title }) => {
  useLayoutEffect(() => {
    if (!enabled) return;
    const root = document.getElementById(rootId);
    if (!root) throw new Error(`[SafeAreaGuard] root #${rootId} not found`);
    const rootRect = root.getBoundingClientRect();
    const k = rootRect.width / WIDTH; // Studio preview may be scaled.
    const local = (r: DOMRect) => ({
      left: (r.left - rootRect.left) / k,
      top: (r.top - rootRect.top) / k,
      right: (r.right - rootRect.left) / k,
      bottom: (r.bottom - rootRect.top) / k,
      width: r.width / k,
      height: r.height / k,
    });
    const fail = (msg: string) => {
      throw new Error(`[SafeAreaGuard] frame ${frame}: ${msg}`);
    };
    const tol = 0.5;

    // 1. Safe area and centre box.
    root.querySelectorAll<HTMLElement>("[data-guard]").forEach((el) => {
      if (getComputedStyle(el).opacity === "0") return;
      const r = local(el.getBoundingClientRect());
      if (r.width === 0 && r.height === 0) return;
      const name = el.dataset.guard;
      if (
        r.left < SAFE_AREA - tol ||
        r.top < SAFE_AREA - tol ||
        r.right > WIDTH - SAFE_AREA + tol ||
        r.bottom > HEIGHT - SAFE_AREA + tol
      ) {
        fail(`"${name}" leaves the ${SAFE_AREA}px safe area (${JSON.stringify(r)})`);
      }
      if (
        r.left < CENTRE_BOX.left - tol ||
        r.top < CENTRE_BOX.top - tol ||
        r.right > CENTRE_BOX.right + tol ||
        r.bottom > CENTRE_BOX.bottom + tol
      ) {
        fail(`"${name}" leaves the centre 60 percent (${JSON.stringify(r)})`);
      }
    });

    // 2. Title box is fixed from its first frame.
    const box = root.querySelector<HTMLElement>("[data-title-box]");
    if (box) {
      const r = local(box.getBoundingClientRect());
      const e = title.box;
      if (
        Math.abs(r.left - e.left) > tol ||
        Math.abs(r.top - e.top) > tol ||
        Math.abs(r.width - e.width) > tol ||
        Math.abs(r.height - e.height) > tol
      ) {
        fail(`title box moved or resized: got ${JSON.stringify(r)}, expected ${JSON.stringify(e)}`);
      }
      const chars = Array.from(box.querySelectorAll<HTMLElement>("[data-guard-char]"));
      const tops = new Set(chars.map((c) => Math.round(local(c.getBoundingClientRect()).top)));
      if (tops.size > 1) fail("title text wraps onto more than one line");
      const lastRight = Math.max(...chars.map((c) => local(c.getBoundingClientRect()).right));
      if (lastRight > r.right + tol) fail("title text overflows its pre-measured box");

      // 3. Nothing visible on the title's first frame.
      if (frame <= title.startFrame) {
        chars.forEach((c, i) => {
          if (Number(getComputedStyle(c).opacity) > 0) {
            fail(`title character ${i} ("${c.textContent}") is visible on the title's first frame`);
          }
        });
      }
    }
  });
  return null;
};
