import React from "react";
import { PRODUCT_FRAME } from "../../theme";
import { CHAT_NATIVE, UI } from "./ChatScreen";

/** Screen authored at the reference screenshot's native size, scaled into the 1500px product frame. */
export const PRODUCT_SCALE = 0.8;
export const PRODUCT_RECT = {
  x: 210,
  y: 210,
  w: CHAT_NATIVE.w * PRODUCT_SCALE,
  h: CHAT_NATIVE.h * PRODUCT_SCALE,
  radius: PRODUCT_FRAME.radius,
};

/** The dark app window: 24px radius, soft shadow. Children are drawn in native units (1875 x 895). */
export const ProductWindow: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    data-guard="frame"
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: PRODUCT_RECT.radius,
      background: UI.bg,
      boxShadow: PRODUCT_FRAME.shadow,
      border: "1px solid rgba(255,255,255,0.08)",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: CHAT_NATIVE.w,
        height: CHAT_NATIVE.h,
        transform: `scale(${PRODUCT_SCALE})`,
        transformOrigin: "0 0",
      }}
    >
      {children}
    </div>
  </div>
);
