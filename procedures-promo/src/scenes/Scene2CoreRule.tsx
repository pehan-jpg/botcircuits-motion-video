import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { Line, StaticLines } from "../components/Opening";
import { TEXT, ease } from "../theme";

export const Scene2CoreRule: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      {/* Scene 1 text exits upward */}
      <Line
        size={34}
        weight={400}
        style={{
          translate: `0px ${ease(frame, [0, 20], [0, -20])}px`,
          opacity: ease(frame, [0, 16], [1, 0]),
        }}
      >
        <StaticLines lines={TEXT.line1} />
      </Line>
      {/* Fast central scale-up, then a 1.5s hold (dissolves at the start of scene 3) */}
      <Line
        size={34}
        weight={400}
        style={{
          scale: String(ease(frame, [14, 40], [0.92, 1])),
          opacity: ease(frame, [14, 32], [0, 1]),
        }}
      >
        <StaticLines lines={TEXT.line2} />
      </Line>
    </Stage>
  );
};
