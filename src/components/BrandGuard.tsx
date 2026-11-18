import { useLayoutEffect } from "react";
import { WIDTH } from "../constants";

/**
 * Development guard. Renders nothing; throws (failing the render) when:
 *  1. a required logo file is missing from /public,
 *  2. a logo renders under its minimum height,
 *  3. a logo is tinted (filter, blend mode, mask) or stretched (box ratio differs from the artwork),
 *  4. any placeholder, or the "LOGO" placeholder text, is visible in the frame.
 */
export const BrandGuard: React.FC<{
  enabled: boolean;
  frame: number;
  rootId: string;
  required: { id: string; present: boolean; file: string; minHeight: number }[];
}> = ({ enabled, frame, rootId, required }) => {
  useLayoutEffect(() => {
    if (!enabled) return;
    const fail = (msg: string): never => {
      throw new Error(`[BrandGuard] frame ${frame}: ${msg}`);
    };
    const root = document.getElementById(rootId);
    if (!root) return fail(`root #${rootId} not found`);
    const k = root.getBoundingClientRect().width / WIDTH;
    const opacityOf = (el: Element) => {
      let o = 1;
      for (let n: Element | null = el; n && n !== root.parentElement; n = n.parentElement) o *= Number(getComputedStyle(n).opacity);
      return o;
    };

    for (const r of required) {
      if (!r.present) fail(`logo file /public/${r.file} is missing`);
      const img: HTMLImageElement | null = root.querySelector<HTMLImageElement>(`[data-brand-logo="${r.id}"]`);
      if (!img) fail(`logo "${r.id}" is not rendered`);
      const box = img!.getBoundingClientRect();
      const s = getComputedStyle(img!);
      // Rendered artwork height inside an object-fit: contain box.
      const nat = img!.naturalWidth / Math.max(1, img!.naturalHeight);
      const boxRatio = box.width / Math.max(1e-6, box.height);
      const drawnH = (boxRatio > nat ? box.height : box.width / nat) / k;
      if (drawnH < r.minHeight - 0.5) fail(`logo "${r.id}" is ${drawnH.toFixed(1)}px high (min ${r.minHeight}px)`);
      if (s.objectFit !== "contain" && Math.abs(boxRatio / nat - 1) > 0.02) {
        fail(`logo "${r.id}" is stretched (box ${boxRatio.toFixed(3)} vs artwork ${nat.toFixed(3)})`);
      }
      for (let n: HTMLElement | null = img!; n && n !== root; n = n.parentElement) {
        const c = getComputedStyle(n);
        if (c.filter !== "none" || c.mixBlendMode !== "normal" || (c.maskImage && c.maskImage !== "none")) {
          fail(`logo "${r.id}" is tinted (filter ${c.filter}, blend ${c.mixBlendMode}, mask ${c.maskImage})`);
        }
      }
      if (/rotate|skew|matrix\((?!1, 0, 0, 1)/.test(s.transform)) fail(`logo "${r.id}" is rotated or skewed (${s.transform})`);
    }

    // No placeholder may be visible.
    root.querySelectorAll<HTMLElement>("[data-placeholder]").forEach((el) => {
      if (opacityOf(el) > 0) fail(`placeholder "${el.dataset.placeholder}" is visible`);
    });
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let t = walker.nextNode(); t; t = walker.nextNode()) {
      if (/\bLOGO\b/i.test(t.textContent ?? "") && t.parentElement && opacityOf(t.parentElement) > 0) {
        fail(`"LOGO" placeholder text is visible`);
      }
    }
  });
  return null;
};
