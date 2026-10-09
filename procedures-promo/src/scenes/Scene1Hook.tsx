import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { BrandLogo } from "../components/BrandLogo";
import { Line, RevealLines } from "../components/Opening";
import { HERO_LOGO_H, TEXT, ease } from "../theme";

// Hero logo (0.4s in, 1.5s hold) → dissolves completely → text reveals and holds 5s.
const LOGO_IN = 4;
export const LOGO_OUT = LOGO_IN + 24 + 90;
export const TEXT_IN = LOGO_OUT + 26;

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
            frame < LOGO_OUT
              ? ease(frame, [LOGO_IN, LOGO_IN + 24], [0.85, 1])
              : ease(frame, [LOGO_OUT, LOGO_OUT + 20], [1, 0.94]),
          ),
          opacity:
            frame < LOGO_OUT ? ease(frame, [LOGO_IN, LOGO_IN + 24], [0, 1]) : ease(frame, [LOGO_OUT, LOGO_OUT + 18], [1, 0]),
          filter: `blur(${ease(frame, [LOGO_OUT, LOGO_OUT + 18], [0, 4])}px)`,
        }}
      >
        <BrandLogo height={HERO_LOGO_H} />
      </div>
      <Line size={52} weight={500}>
        <RevealLines lines={TEXT.line1} start={TEXT_IN} />
      </Line>
    </Stage>
  );
};
