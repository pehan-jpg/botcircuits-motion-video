import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { RevealWords } from "../components/RevealText";
import { Line, LogoTop, StatusDot } from "../components/Opening";
import { TEXT, ease } from "../theme";

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <LogoTop
        style={{
          scale: String(ease(frame, [4, 22], [0.85, 1])),
          opacity: ease(frame, [4, 22], [0, 1]),
        }}
      />
      <StatusDot scale={ease(frame, [26, 44], [0.4, 1])} opacity={ease(frame, [26, 40], [0, 1])} lime={0} />
      <Line size={32} weight={400}>
        <RevealWords text={TEXT.line1} start={20} staggerMs={35} />
      </Line>
    </Stage>
  );
};
