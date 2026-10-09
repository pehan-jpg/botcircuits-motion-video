import React from "react";
import { useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { RevealWords } from "../components/RevealText";
import { RevealLines } from "../components/Opening";
import { BrandLogo } from "../components/BrandLogo";
import { COLORS, HERO_LOGO_H, TEXT, ease } from "../theme";

// 0:00–0:03.0 text (reveal + hold) → 0:03.0–0:03.5 dissolve to an empty canvas → 0:03.5–0:06.5 hero logo.
export const TEXT_OUT = 180;
const LOGO_IN = 210;

export const Scene8Outro: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Stage>
      {/* Text phase */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          letterSpacing: "-0.025em",
          scale: String(ease(frame, [TEXT_OUT, TEXT_OUT + 30], [1, 0.96])),
          opacity: ease(frame, [TEXT_OUT, TEXT_OUT + 26], [1, 0]),
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 400, color: COLORS.grey, lineHeight: 1.25 }}>
          <RevealWords text={TEXT.outro1} start={10} offsetY={18} />
        </div>
        <div style={{ fontSize: 34, fontWeight: 400, color: COLORS.ink, lineHeight: 1.25, marginTop: 8 }}>
          <RevealLines lines={TEXT.outro2} start={30} offsetY={20} />
        </div>
      </div>

      {/* Standalone hero logo (same size as Scene 1) */}
      {frame >= LOGO_IN ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: ease(frame, [LOGO_IN, LOGO_IN + 30], [0, 1]),
            scale: String(ease(frame, [LOGO_IN, LOGO_IN + 60], [0.85, 1])),
          }}
        >
          <BrandLogo height={HERO_LOGO_H} />
        </div>
      ) : null}
    </Stage>
  );
};
