import React, { useLayoutEffect, useRef } from "react";
import { cancelRender, useCurrentFrame } from "remotion";
import { CENTRE_BOX, HEIGHT, SAFE, WIDTH } from "../constants";

export type SafeAreaGuardProps = {
  enabled: boolean;
  /** First frame of the title, if the composition has one. No title character may be visible on it. */
  titleStartFrame?: number;
  /** Pre-measured title box size; the box must keep this size on every frame. */
  titleBox?: { width: number; height: number } | null;
  /** Also require everything inside the centre 60 percent of the frame. */
  centreBox?: boolean;
  /** Fail when two [data-guard] elements (other than any marked data-guard-container) overlap. */
  noOverlap?: boolean;
  /** Static layout errors to fail on (e.g. lines crossing nodes). */
  staticErrors?: string[];
  children: React.ReactNode;
};

const TOL = 0.75;

/**
 * Dev only guard. Renders nothing visible. Fails the render (cancelRender) when:
 *  - any [data-guard] element leaves the 96px safe area (or, with centreBox, the centre 60 percent),
 *  - two [data-guard] elements overlap (noOverlap), or a static layout check failed,
 *  - the title box changes size while typing, or its text overflows the box,
 *  - any title character is visible on the title's first frame.
 */
export const SafeAreaGuard: React.FC<SafeAreaGuardProps> = ({
  enabled,
  titleStartFrame = -1,
  titleBox = null,
  centreBox = false,
  noOverlap = false,
  staticErrors = [],
  children,
}) => {
  const frame = useCurrentFrame();
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!enabled || !root.current) return;
    const rootRect = root.current.getBoundingClientRect();
    const k = rootRect.width / WIDTH;
    const fail = (msg: string) => cancelRender(new Error(`[SafeAreaGuard] frame ${frame}: ${msg}`));

    if (staticErrors.length > 0) {
      fail(`layout: ${staticErrors.join("; ")}`);
      return;
    }

    const nodes = root.current.querySelectorAll<HTMLElement>("[data-guard]");
    for (const el of Array.from(nodes)) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      const box = {
        left: (r.left - rootRect.left) / k,
        right: (r.right - rootRect.left) / k,
        top: (r.top - rootRect.top) / k,
        bottom: (r.bottom - rootRect.top) / k,
      };
      const name = el.dataset.guard;
      if (box.left < SAFE - TOL || box.top < SAFE - TOL || box.right > WIDTH - SAFE + TOL || box.bottom > HEIGHT - SAFE + TOL) {
        fail(`"${name}" leaves the 96px safe area (${JSON.stringify(box)}, root ${rootRect.width}x${rootRect.height}, el ${r.width}x${r.height})`);
        return;
      }
      if (
        centreBox &&
        (box.left < CENTRE_BOX.left - TOL ||
        box.right > CENTRE_BOX.right + TOL ||
        box.top < CENTRE_BOX.top - TOL ||
        box.bottom > CENTRE_BOX.bottom + TOL)
      ) {
        fail(`"${name}" leaves the centre 60 percent of the frame (${JSON.stringify(box)})`);
        return;
      }
    }

    if (noOverlap) {
      const solids = Array.from(nodes)
        .filter((el) => el.dataset.guardContainer === undefined && Number(getComputedStyle(el).opacity) > 0.01)
        .map((el) => ({ name: el.dataset.guard, r: el.getBoundingClientRect() }));
      for (let i = 0; i < solids.length; i++) {
        for (let j = i + 1; j < solids.length; j++) {
          const a = solids[i].r;
          const b = solids[j].r;
          if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) {
            fail(`"${solids[i].name}" overlaps "${solids[j].name}"`);
            return;
          }
        }
      }
    }

    const title = root.current.querySelector<HTMLElement>('[data-guard="title-box"]');
    if (title && titleBox) {
      const r = title.getBoundingClientRect();
      const w = r.width / k;
      const h = r.height / k;
      if (Math.abs(w - titleBox.width) > TOL || Math.abs(h - titleBox.height) > TOL) {
        fail(`title box changed size: ${w.toFixed(2)}x${h.toFixed(2)}, expected ${titleBox.width.toFixed(2)}x${titleBox.height.toFixed(2)}`);
        return;
      }
      if (title.scrollWidth > title.clientWidth + 1) {
        fail(`title text overflows its box (${title.scrollWidth} > ${title.clientWidth})`);
        return;
      }
    }

    if (frame === titleStartFrame) {
      const chars = root.current.querySelectorAll<HTMLElement>("[data-tw-char] > span:first-child");
      if (chars.length === 0) {
        fail("title characters are not laid out on the title's first frame");
        return;
      }
      for (const c of Array.from(chars)) {
        if (Number(getComputedStyle(c).opacity) > 0) {
          fail(`title character "${c.textContent}" is visible on the title's first frame`);
          return;
        }
      }
    }
  }, [enabled, frame, titleStartFrame, titleBox, centreBox, noOverlap, staticErrors]);

  return (
    <div ref={root} style={{ position: "absolute", left: 0, top: 0, width: WIDTH, height: HEIGHT }}>
      {children}
    </div>
  );
};
