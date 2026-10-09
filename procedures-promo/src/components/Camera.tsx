import React from "react";

export type Cam = { fx: number; fy: number; s: number };

// Places world point (fx, fy) at the stage centre, scaled by s.
export const Camera: React.FC<{ cam: Cam; children: React.ReactNode }> = ({ cam, children }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: 960,
      height: 540,
      transformOrigin: "0 0",
      transform: `translate(480px, 270px) scale(${cam.s}) translate(${-cam.fx}px, ${-cam.fy}px)`,
    }}
  >
    {children}
  </div>
);
