import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../components/Stage";
import { BrandLogo } from "../components/BrandLogo";
import { COLORS, HERO_LOGO_H, TEXT, ease } from "../theme";

// 0:00–0:02.0 two text lines (reveal + hold) → dissolve to an empty canvas → hero logo with the tagline under it, 2.5s.
export const TEXT_OUT = 120;
const LOGO_IN = 150;
const REVEAL_START = 10;

// One line revealed upward through a bottom clipping mask; lines are staggered 35ms apart.
const MaskedLine: React.FC<{ i: number; style: React.CSSProperties; children: React.ReactNode }> = ({ i, style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = REVEAL_START + i * (35 / 1000) * fps;
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.12em", ...style }}>
      <div
        style={{
          translate: `0px ${ease(frame, [s, s + 34], [110, 0])}%`,
          opacity: ease(frame, [s, s + 24], [0, 1]),
        }}
      >
        {children}
      </div>
    </div>
  );
};

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
          fontWeight: 400,
          scale: String(ease(frame, [TEXT_OUT, TEXT_OUT + 30], [1, 0.96])),
          opacity: ease(frame, [TEXT_OUT, TEXT_OUT + 26], [1, 0]),
        }}
      >
        <MaskedLine i={0} style={{ fontSize: 34, lineHeight: 1.25, letterSpacing: "-0.025em", color: COLORS.grey }}>
          {TEXT.outro1}
        </MaskedLine>
        <MaskedLine i={1} style={{ fontSize: 34, lineHeight: 1.25, letterSpacing: "-0.025em", color: COLORS.ink, marginTop: 4 }}>
          {TEXT.outro2.join(" ")}
        </MaskedLine>
      </div>

      {/* Hero logo (same size as Scene 1) with the tagline directly beneath; they reveal together */}
      {frame >= LOGO_IN ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 22,
            opacity: ease(frame, [LOGO_IN, LOGO_IN + 30], [0, 1]),
            scale: String(ease(frame, [LOGO_IN, LOGO_IN + 60], [0.85, 1])),
          }}
        >
          <BrandLogo height={HERO_LOGO_H} />
          <div style={{ fontSize: 20, fontWeight: 400, lineHeight: 1.3, letterSpacing: "-0.01em", color: COLORS.grey }}>
            {TEXT.tagline}
          </div>
        </div>
      ) : null}
    </Stage>
  );
};
