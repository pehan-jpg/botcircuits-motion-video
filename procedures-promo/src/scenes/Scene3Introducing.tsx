import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../components/Stage";
import { RevealWords } from "../components/RevealText";
import { Line, StaticLines } from "../components/Opening";
import { COLORS, TEXT, ease } from "../theme";

const START = 14;
// The last word settles 30 frames after its start; the highlight begins as it locks.
export const LOCK_FRAME = START + 3 * 2.1 + 30;

// "Introducing BotCircuits Procedures." — a flat 2px lime stroke under the product name; no glow.
export const IntroLine: React.FC<{ frame: number; fps: number; style?: React.CSSProperties }> = ({
  frame,
  fps,
  style,
}) => {
  const stagger = (35 / 1000) * fps;
  return (
    <Line size={34} weight={400} style={style}>
      <div style={{ whiteSpace: "nowrap" }}>
        <RevealWords text={TEXT.introLead} start={START} />
        <span style={{ position: "relative", display: "inline-block" }}>
          <RevealWords text={TEXT.introName} start={START + stagger} />
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
        {/* Period sits flush against "Procedures" (RevealWords pads each word with a trailing space) */}
        <span
          style={{
            display: "inline-block",
            marginLeft: "-0.28em",
            opacity: ease(frame, [START + 3 * stagger, START + 3 * stagger + 21], [0, 1]),
            translate: `0px ${ease(frame, [START + 3 * stagger, START + 3 * stagger + 30], [18, 0])}px`,
          }}
        >
          .
        </span>
      </div>
    </Line>
  );
};

export const Scene3Introducing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Stage>
      {/* Scene 2 line dissolves out */}
      <Line
        size={34}
        weight={400}
        style={{
          opacity: ease(frame, [0, 14], [1, 0]),
          filter: `blur(${ease(frame, [0, 14], [0, 6])}px)`,
        }}
      >
        <StaticLines lines={TEXT.line2} />
      </Line>
      <IntroLine frame={frame} fps={fps} />
    </Stage>
  );
};
