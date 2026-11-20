import React from "react";
import { COLOR, PRODUCT_FRAME } from "../theme";

/** The dark app window, 24px radius, soft shadow, about 1500px wide. Used from Scene 3. */
export const ProductFrame: React.FC<{
  width?: number;
  height?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width = PRODUCT_FRAME.width, height = 860, children, style }) => (
  <div
    style={{
      width,
      height,
      borderRadius: PRODUCT_FRAME.radius,
      background: COLOR.appBg,
      boxShadow: PRODUCT_FRAME.shadow,
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      flexDirection: "column",
      ...style,
    }}
  >
    <div
      style={{
        height: 52,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 22px",
        borderBottom: `1px solid ${COLOR.appLine}`,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 13,
            height: 13,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.18)",
          }}
        />
      ))}
    </div>
    <div style={{ flex: 1, position: "relative" }}>{children}</div>
  </div>
);

/** Slow camera. Scale is clamped to 6 percent. */
export const Camera: React.FC<{
  scale: number;
  x?: number;
  y?: number;
  children: React.ReactNode;
}> = ({ scale, x = 0, y = 0, children }) => {
  const s = Math.min(
    PRODUCT_FRAME.maxCameraScale,
    Math.max(1 / PRODUCT_FRAME.maxCameraScale, scale),
  );
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translate(${x}px, ${y}px) scale(${s})`,
        transformOrigin: "50% 50%",
      }}
    >
      {children}
    </div>
  );
};
