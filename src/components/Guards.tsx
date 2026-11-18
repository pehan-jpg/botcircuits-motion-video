import React, { useLayoutEffect, useRef } from "react";
import { cancelRender, continueRender, delayRender, useCurrentFrame } from "remotion";
import { HEIGHT, WIDTH } from "../constants";

/* ---------- colour helpers ---------- */
type RGBA = [number, number, number, number];
const parse = (c: string): RGBA | null => {
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
  return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
};
const over = (top: RGBA, bottom: RGBA): RGBA => {
  const a = top[3];
  return [top[0] * a + bottom[0] * (1 - a), top[1] * a + bottom[1] * (1 - a), top[2] * a + bottom[2] * (1 - a), 1];
};
const lum = ([r, g, b]: RGBA) => {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
export const contrast = (a: RGBA, b: RGBA) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};
/** Effective background colour behind an element: stacked ancestor background colours over white. */
const effectiveBg = (el: HTMLElement): RGBA => {
  const layers: RGBA[] = [];
  let n: HTMLElement | null = el;
  while (n) {
    const c = parse(getComputedStyle(n).backgroundColor);
    if (c && c[3] > 0) {
      layers.push(c);
      if (c[3] >= 1) break;
    }
    n = n.parentElement;
  }
  return layers.reverse().reduce<RGBA>((acc, l) => over(l, acc), [255, 255, 255, 1]);
};

const useFrameRoot = () => useRef<HTMLDivElement>(null);
const Root: React.FC<{ r: React.RefObject<HTMLDivElement | null>; children: React.ReactNode }> = ({ r, children }) => (
  <div ref={r} style={{ position: "absolute", left: 0, top: 0, width: WIDTH, height: HEIGHT }}>
    {children}
  </div>
);

/**
 * ReadabilityGuard (dev only): fails the render when
 *  - any text is smaller than 18px or below 4.5:1 contrast against its background,
 *  - a typed box shows a character on its first frame, or its width differs from its fixed width,
 *  - typed text overflows its box,
 *  - on the click frame, the cursor hotspot is not on the target button.
 */
export const ReadabilityGuard: React.FC<{
  enabled: boolean;
  clickFrame: number;
  clickTarget: string;
  children: React.ReactNode;
}> = ({ enabled, clickFrame, clickTarget, children }) => {
  const frame = useCurrentFrame();
  const root = useFrameRoot();
  useLayoutEffect(() => {
    if (!enabled || !root.current) return;
    const fail = (m: string) => cancelRender(new Error(`[ReadabilityGuard] frame ${frame}: ${m}`));
    const k = root.current.getBoundingClientRect().width / WIDTH;

    for (const el of Array.from(root.current.querySelectorAll<HTMLElement>("*"))) {
      const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && (n.textContent ?? "").trim() !== "");
      if (!hasText || el.closest("[aria-hidden]") || el.closest("svg")) continue;
      const cs = getComputedStyle(el);
      const size = parseFloat(cs.fontSize);
      if (size < 18) return fail(`text "${el.textContent}" is ${size}px (minimum 18px)`);
      const fg = parse(cs.color);
      if (!fg) continue;
      const bg = effectiveBg(el);
      const ratio = contrast(over(fg, bg), bg);
      if (ratio < 4.5) return fail(`text "${el.textContent}" contrast ${ratio.toFixed(2)}:1 (minimum 4.5:1)`);
    }

    for (const box of Array.from(root.current.querySelectorAll<HTMLElement>("[data-tw-box]"))) {
      const id = box.dataset.twBox;
      const w = box.getBoundingClientRect().width / k;
      const scale = box.offsetWidth > 0 ? w / box.offsetWidth : 1;
      if (Math.abs(box.offsetWidth - Number(box.dataset.twWidth)) > 0.5)
        return fail(`typed box "${id}" is ${box.offsetWidth}px wide, fixed width is ${box.dataset.twWidth}px`);
      for (const line of Array.from(box.children) as HTMLElement[]) {
        if (line.scrollWidth > box.offsetWidth + 1) return fail(`typed box "${id}" overflows (${line.scrollWidth}px > ${box.offsetWidth}px)`);
      }
      if (frame === Number(box.dataset.twStart)) {
        for (const c of Array.from(box.querySelectorAll<HTMLElement>("[data-tw-char] > span:first-child"))) {
          if (Number(getComputedStyle(c).opacity) > 0) return fail(`typed box "${id}" shows "${c.textContent}" on its first frame`);
        }
      }
      void scale;
    }

    if (frame === clickFrame) {
      const tip = root.current.querySelector<HTMLElement>("[data-cursor-tip]");
      const btn = root.current.querySelector<HTMLElement>(`[data-guard="${clickTarget}"]`);
      if (!tip || !btn) return fail("cursor or click target missing on the click frame");
      const t = tip.getBoundingClientRect();
      const b = btn.getBoundingClientRect();
      const m = 6 * k;
      if (!(t.left > b.left + m && t.left < b.right - m && t.top > b.top + m && t.top < b.bottom - m))
        return fail(`cursor hotspot (${(t.left / k).toFixed(1)}, ${(t.top / k).toFixed(1)}) is not on "${clickTarget}"`);
    }
  });
  return <Root r={root}>{children}</Root>;
};

/**
 * LogoGuard (dev only): every [data-logo] image must come from a supplied file, be at least 28px high,
 * keep its natural aspect ratio, never be rotated or tinted, sit on white, and keep clear space of a
 * quarter of its height inside its [data-logo-tile]. Placeholders must be listed for the report.
 */
export const LogoGuard: React.FC<{
  enabled: boolean;
  availableFiles: string[];
  reportedPlaceholders: string[];
  children: React.ReactNode;
}> = ({ enabled, availableFiles, reportedPlaceholders, children }) => {
  const frame = useCurrentFrame();
  const root = useFrameRoot();
  useLayoutEffect(() => {
    if (!enabled || !root.current) return;
    const el = root.current;
    // Wait until every logo has decoded, then check (the frame is held with delayRender meanwhile).
    const handle = delayRender(`LogoGuard frame ${frame}`);
    const imgs = Array.from(el.querySelectorAll<HTMLImageElement>("img[data-logo]"));
    Promise.all(imgs.map((i) => (i.complete && i.naturalWidth ? Promise.resolve() : i.decode().catch(() => undefined))))
      .then(() => {
        check(el);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  });
  const check = (rootEl: HTMLDivElement) => {
    const fail = (m: string) => cancelRender(new Error(`[LogoGuard] frame ${frame}: ${m}`));
    const k = rootEl.getBoundingClientRect().width / WIDTH;
    const root = { current: rootEl };
    for (const ph of Array.from(root.current.querySelectorAll<HTMLElement>("[data-logo-placeholder]"))) {
      const name = ph.dataset.logoPlaceholder ?? "";
      if (!reportedPlaceholders.includes(name)) return fail(`placeholder for ${name} is not listed in the report`);
    }

    for (const img of Array.from(root.current.querySelectorAll<HTMLImageElement>("img[data-logo]"))) {
      const file = img.dataset.logo ?? "";
      if (!availableFiles.includes(file)) return fail(`logo file public/${file} is missing`);
      const r = img.getBoundingClientRect();
      if (r.width === 0 || Number(getComputedStyle(img).opacity) === 0) continue;
      // measure in layout pixels (independent of pop scale)
      const h = img.offsetHeight;
      const w = img.offsetWidth;
      if (h < 28) return fail(`${file} is ${h}px high (minimum 28px)`);
      if (!img.naturalWidth) return fail(`${file} did not load`);
      const natural = img.naturalWidth / img.naturalHeight;
      if (Math.abs(w / h - natural) / natural > 0.02) return fail(`${file} is stretched (${(w / h).toFixed(3)} vs ${natural.toFixed(3)})`);
      if (getComputedStyle(img).objectFit !== "fill" && getComputedStyle(img).objectFit !== "contain")
        return fail(`${file} uses object-fit ${getComputedStyle(img).objectFit}`);
      for (let n: HTMLElement | null = img; n && n !== root.current; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.filter !== "none") return fail(`${file} is tinted by a filter (${cs.filter})`);
        if (cs.mixBlendMode !== "normal") return fail(`${file} is blended (${cs.mixBlendMode})`);
        if (cs.transform !== "none") {
          const m = new DOMMatrix(cs.transform);
          if (Math.abs(m.b) > 1e-3 || Math.abs(m.c) > 1e-3 || Math.abs(m.a - m.d) > 1e-3) return fail(`${file} is rotated or stretched by a transform`);
        }
      }
      const bg = effectiveBg(img);
      if (bg.slice(0, 3).some((v) => Math.round(v) !== 255)) return fail(`${file} is on a coloured fill (${bg.map(Math.round).join(",")})`);
      const tile = img.closest<HTMLElement>("[data-logo-tile]");
      if (!tile) return fail(`${file} has no logo tile`);
      const t = tile.getBoundingClientRect();
      const clear = (h / 4) * (r.height / h) - 0.5 * k;
      if (r.left - t.left < clear || t.right - r.right < clear || r.top - t.top < clear || t.bottom - r.bottom < clear)
        return fail(`${file} has less than a quarter of its height as clear space`);
    }
  };
  return <Root r={root}>{children}</Root>;
};
