import React, { useLayoutEffect, useRef } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  getInputProps,
  useCurrentFrame,
} from "remotion";
import { SAFE } from "../theme";
import { checkLogo, checkSafeArea } from "../lib/guards";

type GuardProps = {
  guardLog?: boolean;
  hideText?: boolean;
  showSafeArea?: boolean;
};

/**
 * Runtime guards. Every frame it measures elements tagged data-guard:
 *  - text: SafeAreaGuard and minimum font size (ReadabilityGuard)
 *  - logo: SafeAreaGuard and LogoGuard
 * With inputProps.guardLog it prints a JSON report per frame for the check script.
 * With inputProps.hideText it hides text so the check script can sample the background behind it.
 */
export const GuardLayer: React.FC<{ scene: string }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  const props = getInputProps() as GuardProps;

  useLayoutEffect(() => {
    if (!props.guardLog) return;
    const root = ref.current?.parentElement;
    if (!root) return;
    const handle = delayRender("guard measure");
    const id = requestAnimationFrame(() => {
      const base = root.getBoundingClientRect();
      const k = base.width ? base.width / 1920 : 1;
      const nodes = Array.from(
        root.querySelectorAll<HTMLElement>("[data-guard]"),
      );
      const items = nodes
        .map((el) => {
          let op = 1;
          for (
            let n: HTMLElement | null = el;
            n && n !== root;
            n = n.parentElement
          ) {
            op *= Number(getComputedStyle(n).opacity);
          }
          const rect = el.getBoundingClientRect();
          const kind = el.dataset.guard;
          const label =
            el.dataset.guardLabel ?? (el.textContent ?? "").trim().slice(0, 60);
          // Font size and colour of text-bearing descendants.
          let minFont = Infinity;
          let color = "";
          el.querySelectorAll<HTMLElement>("*").forEach((c) => {
            if (
              c.childNodes.length &&
              Array.from(c.childNodes).some(
                (n) => n.nodeType === 3 && n.textContent?.trim(),
              )
            ) {
              const cs = getComputedStyle(c);
              minFont = Math.min(minFont, parseFloat(cs.fontSize));
              if (!color) color = cs.color;
            }
          });
          if (minFont === Infinity) {
            const cs = getComputedStyle(el);
            minFont = parseFloat(cs.fontSize);
            color = cs.color;
          }
          // Font size as it appears on screen, after any scale transforms.
          const elScale = el.offsetWidth ? rect.width / el.offsetWidth / k : 1;
          minFont *= elScale;
          const r = {
            x: (rect.x - base.x) / k,
            y: (rect.y - base.y) / k,
            w: rect.width / k,
            h: rect.height / k,
          };
          const issues = [
            ...checkSafeArea(r, label),
            ...(kind === "logo"
              ? checkLogo(
                  (el.querySelector("img")?.getBoundingClientRect().height ??
                    0) / k,
                  getComputedStyle(el).backgroundColor ===
                    "rgb(255, 255, 255)" || el.dataset.guardBacking === "white",
                )
              : []),
          ];
          return {
            kind,
            label,
            text: (el.textContent ?? "").trim(),
            opacity: op,
            rect: r,
            fontPx: minFont,
            color,
            issues,
          };
        })
        .filter((i) => i.opacity > 0.05);
      // eslint-disable-next-line no-console
      console.log(
        `[guard] ${JSON.stringify({ scene, frame, base: { w: base.width, h: base.height }, items })}`,
      );
      continueRender(handle);
    });
    return () => cancelAnimationFrame(id);
  }, [frame, props.guardLog, scene]);

  return (
    <AbsoluteFill ref={ref} style={{ pointerEvents: "none" }}>
      {props.hideText ? (
        <style>{`[data-guard="text"], [data-guard="text"] * { color: transparent !important; text-shadow: none !important; } [data-guard-caret] { opacity: 0 !important; } [data-guard="logo"] img { opacity: 0 !important; }`}</style>
      ) : null}
      {props.showSafeArea ? (
        <div
          style={{
            position: "absolute",
            inset: SAFE,
            outline: "2px dashed rgba(255,0,128,0.6)",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
