import React from "react";
import { PRODUCT, PRODUCT_FRAME } from "../../theme";
import { CHAT_NATIVE, UI } from "./ChatScreen";

/** Screens are authored at the reference screenshots' native size and scaled into the product frame. */
export const PRODUCT_SCALE = PRODUCT.scale;
export const PRODUCT_RECT = { x: PRODUCT.x, y: PRODUCT.y, w: PRODUCT.w, h: PRODUCT.h, radius: PRODUCT_FRAME.radius };
/** Native point to screen pixels (before any camera transform). */
export const nat = (x: number, y: number) => ({ x: PRODUCT_RECT.x + x * PRODUCT_SCALE, y: PRODUCT_RECT.y + y * PRODUCT_SCALE });
/** Centre of the product frame on screen. */
export const FRAME_CENTRE = { x: PRODUCT_RECT.x + PRODUCT_RECT.w / 2, y: PRODUCT_RECT.y + PRODUCT_RECT.h / 2 };

/** The light app window (white rounded card): 24px radius, soft shadow. Children are drawn in native units (1875 x 895). */
export const ProductWindow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    data-guard="frame"
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: PRODUCT_RECT.radius,
      background: UI.bg,
      boxShadow: PRODUCT_FRAME.shadow,
      overflow: "hidden",
    }}
  >
    <div style={{ position: "absolute", left: 0, top: 0, width: CHAT_NATIVE.w, height: CHAT_NATIVE.h, transform: `scale(${PRODUCT_SCALE})`, transformOrigin: "0 0" }}>
      {children}
    </div>
  </div>
);

/** Camera: a focus point (pre-camera screen px) brought to the frame centre at zoom z. */
export type Cam = { x: number; y: number; z: number };
export const camTransform = (c: Cam) =>
  `translate(${FRAME_CENTRE.x}px, ${FRAME_CENTRE.y}px) scale(${c.z}) translate(${-c.x}px, ${-c.y}px)`;
export type CamKey = { t: number; c: Cam; lin?: boolean };
/** Eased camera between keys; `lin` makes the segment ending at that key linear (slow drifts). */
export const camAt = (keys: CamKey[], t: number, ease: (x: number) => number): Cam => {
  if (t <= keys[0].t) return keys[0].c;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t <= b.t) {
      const raw = Math.max(0, Math.min(1, (t - a.t) / Math.max(0.001, b.t - a.t)));
      const p = b.lin ? raw : ease(raw);
      return { x: a.c.x + (b.c.x - a.c.x) * p, y: a.c.y + (b.c.y - a.c.y) * p, z: a.c.z + (b.c.z - a.c.z) * p };
    }
  }
  return keys[keys.length - 1].c;
};
