import React from "react";
import { HEIGHT, WIDTH } from "../constants";

export const CREAM = "#FBF6EE";
export const LILAC = "#E5DDFA";
export const PEACH = "#FCDCC7";

/**
 * Cream, lilac and peach soft gradient. The gradient layer drifts by at most
 * 3 percent of the frame on a closed path, so frame N matches frame 0 (loop safe).
 * Content is never zoomed.
 */
export const Backdrop: React.FC<{ frame: number; duration: number }> = ({
  frame,
  duration,
}) => {
  const a = (2 * Math.PI * frame) / duration;
  const dx = 0.024 * WIDTH * Math.sin(a);
  const dy = 0.018 * HEIGHT * Math.sin(a + Math.PI / 3);
  const pad = 0.04;
  return (
    <div style={{ position: "absolute", inset: 0, background: CREAM }}>
      <div
        style={{
          position: "absolute",
          left: -WIDTH * pad,
          top: -HEIGHT * pad,
          width: WIDTH * (1 + 2 * pad),
          height: HEIGHT * (1 + 2 * pad),
          transform: `translate(${dx}px, ${dy}px)`,
          background: [
            `radial-gradient(ellipse 60% 70% at 16% 20%, ${LILAC} 0%, rgba(229,221,250,0) 70%)`,
            `radial-gradient(ellipse 58% 66% at 86% 82%, ${PEACH} 0%, rgba(252,220,199,0) 70%)`,
            `radial-gradient(ellipse 40% 44% at 78% 18%, rgba(252,220,199,0.55) 0%, rgba(252,220,199,0) 70%)`,
            `radial-gradient(ellipse 46% 50% at 22% 86%, rgba(229,221,250,0.6) 0%, rgba(229,221,250,0) 70%)`,
            `radial-gradient(ellipse 42% 46% at 50% 50%, rgba(255,252,247,0.9) 0%, rgba(255,252,247,0) 75%)`,
          ].join(", "),
        }}
      />
    </div>
  );
};
