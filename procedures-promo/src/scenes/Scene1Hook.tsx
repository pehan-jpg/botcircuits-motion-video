import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { BrandLogo } from "../components/BrandLogo";
import { Line, RevealLines } from "../components/Opening";
import { HERO_LOGO_H, TEXT, ease } from "../theme";

// 0:00–0:01.5 hero logo (in, 1.2s hold, dissolve) → 0:01.5–0:04.5 text reveal + hold.
const LOGO_IN = 0;
const LOGO_RISE = 12;
export const LOGO_OUT = LOGO_IN + LOGO_RISE + 72;
export const TEXT_IN = 92;

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
              ? ease(frame, [LOGO_IN, LOGO_IN + LOGO_RISE], [0.85, 1])
              : ease(frame, [LOGO_OUT, LOGO_OUT + 10], [1, 0.94]),
          ),
          opacity:
            frame < LOGO_OUT ? ease(frame, [LOGO_IN, LOGO_IN + LOGO_RISE], [0, 1]) : ease(frame, [LOGO_OUT, LOGO_OUT + 8], [1, 0]),
          filter: `blur(${ease(frame, [LOGO_OUT, LOGO_OUT + 8], [0, 4])}px)`,
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
