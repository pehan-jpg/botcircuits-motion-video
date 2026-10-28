import React from "react";
import { useTimeline } from "../anim";
import { C } from "../theme";

// Thin lime underline (5 px) that wipes in left to right, and fades when
// `until` is reached.
export const Highlight: React.FC<{
  at: number;
  until?: number;
  duration?: number;
  children: React.ReactNode;
}> = ({ at, until, duration = 0.33, children }) => {
  const { p } = useTimeline();
  const wipe = p(at, duration);
  const alpha = until === undefined ? 1 : 1 - p(until, 0.25);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      <span
        style={{
          position: "absolute",
          left: 0,
          bottom: "-0.04em",
          height: 5,
          borderRadius: 3,
          width: `${wipe * 100}%`,
          backgroundColor: C.lime,
          opacity: alpha,
        }}
      />
    </span>
  );
};
