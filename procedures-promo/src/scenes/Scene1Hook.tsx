import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { RevealWords } from "../components/RevealText";
import { BrandLogo } from "../components/BrandLogo";
import { Line } from "../components/Opening";
import { TEXT, ease } from "../theme";

// Logo first → holds → dissolves completely → only then the text reveals.
export const LOGO_OUT = 58;
export const TEXT_IN = LOGO_OUT + 22;

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: String(
            frame < LOGO_OUT ? ease(frame, [4, 22], [0.85, 1]) : ease(frame, [LOGO_OUT, LOGO_OUT + 18], [1, 0.94]),
          ),
          opacity: frame < LOGO_OUT ? ease(frame, [4, 22], [0, 1]) : ease(frame, [LOGO_OUT, LOGO_OUT + 16], [1, 0]),
          filter: `blur(${ease(frame, [LOGO_OUT, LOGO_OUT + 16], [0, 4])}px)`,
        }}
      >
        <BrandLogo height={48} />
      </div>
      <Line size={32} weight={400}>
        <RevealWords text={TEXT.line1} start={TEXT_IN} staggerMs={35} />
      </Line>
    </Stage>
  );
};
