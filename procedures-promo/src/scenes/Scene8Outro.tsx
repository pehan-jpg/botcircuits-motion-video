import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../components/Stage";
import { RevealWords } from "../components/RevealText";
import { BrandLogo } from "../components/BrandLogo";
import { COLORS, TEXT, ease, pop } from "../theme";

export const Scene8Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = pop(frame, 64, fps, 18);
  return (
    <Stage>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 46% 52% at 50% 52%, rgba(210,248,0,0.16), rgba(210,248,0,0.05) 55%, rgba(249,250,251,0) 100%)",
          opacity: ease(frame, [0, 60], [0, 1]),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 132,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          letterSpacing: "-0.02em",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 400, color: COLORS.grey, lineHeight: 1.3 }}>
          <RevealWords text={TEXT.outro1} start={10} offsetY={14} />
        </div>
        <div style={{ fontSize: 28, fontWeight: 500, color: COLORS.ink, lineHeight: 1.3, marginTop: 6 }}>
          <RevealWords text={TEXT.outro2} start={28} offsetY={16} />
        </div>
        <div
          style={{
            fontSize: 14,
            color: COLORS.grey,
            marginTop: 18,
            letterSpacing: "0.01em",
            opacity: ease(frame, [48, 70], [0, 1]),
            translate: `0px ${ease(frame, [48, 74], [8, 0])}px`,
          }}
        >
          {TEXT.outroSub}
        </div>
        <div
          style={{
            marginTop: 48,
            opacity: ease(frame, [64, 84], [0, 1]),
            scale: String(0.85 + 0.15 * logo),
            filter: `blur(${ease(frame, [64, 84], [4, 0])}px)`,
          }}
        >
          <BrandLogo height={48} />
        </div>
      </div>
    </Stage>
  );
};
