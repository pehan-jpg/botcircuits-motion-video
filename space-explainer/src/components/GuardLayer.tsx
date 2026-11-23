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
          let maxCss = 0;
          let minLabel = "";
          let color = "";
          const visible = (c: Element) => {
            let o = 1;
            for (let n: Element | null = c; n && n !== el; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
            return o > 0.5;
          };
          el.querySelectorAll<HTMLElement>("*").forEach((c) => {
            if (
              // Text inside an SVG pictogram (for example the PDF icon mark) is part of the icon.
              !c.closest("svg") &&
              c.childNodes.length &&
              Array.from(c.childNodes).some(
                (n) => n.nodeType === 3 && n.textContent?.trim(),
              ) &&
              (kind !== "frame" || visible(c))
            ) {
              const cs = getComputedStyle(c);
              const fs = parseFloat(cs.fontSize);
              if (fs < minFont) minLabel = (c.textContent ?? "").trim().slice(0, 40);
              minFont = Math.min(minFont, fs);
              maxCss = Math.max(maxCss, fs);
              if (!color) color = cs.color;
            }
          });
          if (minFont === Infinity) {
            const cs = getComputedStyle(el);
            minFont = parseFloat(cs.fontSize);
            maxCss = minFont;
            color = cs.color;
          }
          const cssPx = minFont;
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
                    "rgb(255, 255, 255)" ||
                    el.dataset.guardBacking === "white" ||
                    el.dataset.guardBacking === "sampled",
                )
              : []),
          ];
          return {
            kind,
            label,
            text: (el.textContent ?? "").trim(),
            backing: el.dataset.guardBacking,
            opacity: op,
            rect: r,
            fontPx: minFont,
            cssPx: cssPx === Infinity ? null : cssPx,
            fontPxMax: maxCss * elScale,
            maxCss,
            minLabel,
            read: el.dataset.guardRead === "1",
            color,
            issues,
          };
        })
        .filter((i) => i.opacity > 0.05);
      // Overflow test: every [data-fit-text] lies inside its [data-fit-box] with at least 12px margin (CSS px).
      // Collision test: boxes sharing a [data-collide] group keep at least 12px apart (CSS px).
      const fitIssues: { guard: string; message: string }[] = [];
      let boxes = 0;
      let texts = 0;
      const opaque = (el: Element) => {
        let o = 1;
        for (let n: Element | null = el; n && n !== root; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
        return o > 0.3;
      };
      root.querySelectorAll<HTMLElement>("[data-fit-box]").forEach((box) => {
        if (!opaque(box)) return;
        const br = box.getBoundingClientRect();
        const sc = box.offsetWidth ? br.width / box.offsetWidth : 1;
        if (sc <= 0) return;
        boxes++;
        box.querySelectorAll<HTMLElement>("[data-fit-text]").forEach((tx) => {
          texts++;
          const r = tx.getBoundingClientRect();
          const m = Math.min(r.left - br.left, br.right - r.right, r.top - br.top, br.bottom - r.bottom) / sc;
          if (m < 11.5) fitIssues.push({ guard: "Overflow", message: `"${(tx.textContent ?? "").trim()}" sits ${m.toFixed(1)}px from the edge of ${box.dataset.fitBox} (needs 12px)` });
        });
      });
      const groups: Record<string, { el: HTMLElement; r: DOMRect; sc: number }[]> = {};
      root.querySelectorAll<HTMLElement>("[data-collide]").forEach((el) => {
        if (!opaque(el)) return;
        const r = el.getBoundingClientRect();
        (groups[el.dataset.collide ?? ""] ??= []).push({ el, r, sc: el.offsetWidth ? r.width / el.offsetWidth : 1 });
      });
      let pairs = 0;
      Object.entries(groups).forEach(([g, list]) => {
        for (let i = 0; i < list.length; i++)
          for (let j = i + 1; j < list.length; j++) {
            pairs++;
            const a = list[i];
            const b = list[j];
            const gapX = Math.max(b.r.left - a.r.right, a.r.left - b.r.right) / a.sc;
            const gapY = Math.max(b.r.top - a.r.bottom, a.r.top - b.r.bottom) / a.sc;
            if (Math.max(gapX, gapY) < 11.5)
              fitIssues.push({ guard: "Collision", message: `${g}: "${(a.el.textContent ?? "").trim()}" and "${(b.el.textContent ?? "").trim()}" are ${Math.max(gapX, gapY).toFixed(1)}px apart (needs 12px)` });
          }
      });
      items.push({
        kind: "fitcheck",
        label: `fit ${boxes} boxes ${texts} texts ${pairs} pairs`,
        text: "",
        backing: undefined,
        opacity: 1,
        rect: { x: 960, y: 540, w: 0, h: 0 },
        fontPx: 0,
        cssPx: null,
        fontPxMax: 0,
        maxCss: 0,
        minLabel: "",
        read: false,
        color: "",
        issues: fitIssues,
      });
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
        <style>{`[data-guard="text"], [data-guard="text"] *, [data-guard="uitext"], [data-guard="uitext"] * { color: transparent !important; text-shadow: none !important; } [data-guard-caret] { opacity: 0 !important; } [data-guard="logo"] img { opacity: 0 !important; } [data-guard="uitext"] [data-orb], [data-guard="text"] [data-orb], [data-guard="text"] img, [data-guard="decision"] { visibility: hidden !important; }`}</style>
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
