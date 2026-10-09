import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../components/Stage";
import { Line, LogoTop, StatusDot } from "../components/Opening";
import { TEXT, ease, pop } from "../theme";

export const Scene2CoreRule: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dotPop = pop(frame, 8, fps, 7);
  return (
    <Stage>
      <LogoTop />
      <StatusDot scale={frame < 8 ? 1 : 0.6 + 0.4 * dotPop} lime={ease(frame, [8, 10], [0, 1])} opacity={1} />
      {/* Line 1 exits upward */}
      <Line
        size={32}
        weight={400}
        style={{
          translate: `0px ${ease(frame, [0, 20], [0, -20])}px`,
          opacity: ease(frame, [0, 16], [1, 0]),
        }}
      >
        {TEXT.line1}
      </Line>
      {/* Line 2: fast central scale-up */}
      <Line
        size={36}
        weight={500}
        style={{
          scale: String(ease(frame, [14, 40], [0.92, 1])),
          opacity: ease(frame, [14, 32], [0, 1]),
        }}
      >
        {TEXT.line2}
      </Line>
    </Stage>
  );
};
