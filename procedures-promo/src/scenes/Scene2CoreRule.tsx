import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { Line } from "../components/Opening";
import { TEXT, ease } from "../theme";

export const Scene2CoreRule: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
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
