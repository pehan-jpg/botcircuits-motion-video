import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../components/Stage";
import { RevealWords } from "../components/RevealText";
import { Line, StaticLines } from "../components/Opening";
import { COLORS, TEXT, ease } from "../theme";

// "every time." locks at scene frame 96.
export const LOCK_FRAME = 96;

export const PromiseLine: React.FC<{
  frame: number;
  fps: number;
  style?: React.CSSProperties;
}> = ({ frame, fps, style }) => {
  const stagger = (35 / 1000) * fps;
  const startC = LOCK_FRAME - 30;
  const startB = startC - 3 * stagger - 6;
  return (
    <Line size={34} weight={400} style={style}>
      <div>
        <RevealWords text={TEXT.line3a} start={14} />
        <RevealWords text={TEXT.line3b} start={startB} />
        <span style={{ position: "relative", display: "inline-block" }}>
          <RevealWords text={TEXT.line3c} start={startC} />
          <span
            style={{
              position: "absolute",
              left: 0,
              bottom: -2,
              height: 2,
              borderRadius: 1,
              background: COLORS.lime,
              width: `calc((100% - 0.28em) * ${ease(frame, [LOCK_FRAME, LOCK_FRAME + 15], [0, 1])})`,
            }}
          />
        </span>
      </div>
    </Line>
  );
};

export const Scene3Promise: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      <Line
        size={56}
        weight={500}
        style={{
          opacity: ease(frame, [0, 16], [1, 0]),
          filter: `blur(${ease(frame, [0, 16], [0, 6])}px)`,
        }}
      >
        <StaticLines lines={TEXT.line2} />
      </Line>
      <PromiseLine frame={frame} fps={fps} />
    </Stage>
  );
};
