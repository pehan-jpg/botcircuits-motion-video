import React from "react";
import { CREAM, LILAC, PEACH } from "./Backdrop";

/**
 * Soft misty fill for the stage: blurred cream, lilac and peach blobs. The blob
 * layer drifts by at most 3 percent of the stage on a closed path (loop safe);
 * content is never zoomed.
 */
export const StageMist: React.FC<{ width: number; height: number; frame: number; period: number }> = ({
  width,
  height,
  frame,
  period,
}) => {
  const a = (2 * Math.PI * frame) / period;
  const dx = 0.025 * width * Math.sin(a);
  const dy = 0.02 * height * Math.sin(a + Math.PI / 3);
  const blob = (x: number, y: number, w: number, h: number, color: string, opacity: number) => (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        borderRadius: "50%",
        background: color,
        opacity,
        filter: "blur(90px)",
      }}
    />
  );
  return (
    <div style={{ position: "absolute", inset: 0, background: CREAM }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${dx}px, ${dy}px)` }}>
        {blob(width * 0.18, height * 0.22, width * 0.5, height * 0.7, LILAC, 0.95)}
        {blob(width * 0.86, height * 0.8, width * 0.5, height * 0.75, PEACH, 0.95)}
        {blob(width * 0.74, height * 0.12, width * 0.34, height * 0.45, PEACH, 0.6)}
        {blob(width * 0.3, height * 0.92, width * 0.36, height * 0.45, LILAC, 0.7)}
        {blob(width * 0.52, height * 0.5, width * 0.36, height * 0.5, "#FFFCF7", 0.75)}
      </div>
    </div>
  );
};
