import React from "react";
import { useTimeline } from "../anim";

// Lime marker that wipes in left to right, and fades when `until` is reached.
export const Highlight: React.FC<{
  at: number;
  until?: number;
  duration?: number;
  children: React.ReactNode;
}> = ({ at, until, duration = 0.33, children }) => {
  const { p } = useTimeline();
  const wipe = p(at, duration);
  const alpha = until === undefined ? 1 : 1 - p(until, 0.25);
  const color = `rgba(180, 240, 0, ${alpha})`;
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(${color}, ${color})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0 85%",
        backgroundSize: `${wipe * 100}% 58%`,
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
        padding: "0 0.06em",
        margin: "0 -0.06em",
      }}
    >
      {children}
    </span>
  );
};
