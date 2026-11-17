import React, { useLayoutEffect, useRef } from "react";
import { cancelRender, useCurrentFrame } from "remotion";
import { CENTRE_BOX, HEIGHT, SAFE, WIDTH } from "../constants";

export type SafeAreaGuardProps = {
  enabled: boolean;
  /** First frame of the title. No title character may be visible on it. */
  titleStartFrame: number;
  /** Pre-measured title box size; the box must keep this size on every frame. */
  titleBox: { width: number; height: number } | null;
  children: React.ReactNode;
};

const TOL = 0.75;

/**
 * Dev only guard. Renders nothing visible. Fails the render (cancelRender) when:
 *  - any [data-guard] element leaves the 96px safe area or the centre 60 percent,
 *  - the title box changes size while typing, or its text overflows the box,
 *  - any title character is visible on the title's first frame.
 */
export const SafeAreaGuard: React.FC<SafeAreaGuardProps> = ({
  enabled,
  titleStartFrame,
  titleBox,
  children,
}) => {
  const frame = useCurrentFrame();
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!enabled || !root.current) return;
    const rootRect = root.current.getBoundingClientRect();
    const k = rootRect.width / WIDTH;
    const fail = (msg: string) => cancelRender(new Error(`[SafeAreaGuard] frame ${frame}: ${msg}`));

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
        fail(`"${name}" leaves the 96px safe area (${JSON.stringify(box)})`);
        return;
      }
      if (
        box.left < CENTRE_BOX.left - TOL ||
        box.right > CENTRE_BOX.right + TOL ||
        box.top < CENTRE_BOX.top - TOL ||
        box.bottom > CENTRE_BOX.bottom + TOL
      ) {
        fail(`"${name}" leaves the centre 60 percent of the frame (${JSON.stringify(box)})`);
        return;
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
  }, [enabled, frame, titleStartFrame, titleBox]);

  return (
    <div ref={root} style={{ position: "absolute", inset: 0 }}>
      {children}
    </div>
  );
};
