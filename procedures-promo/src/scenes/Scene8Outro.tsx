import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { RevealWords } from "../components/RevealText";
import { COLORS, GLIDE, TEXT, ease } from "../theme";

// Text phase → holds 4.5s → dissolves to an empty canvas → standalone hero logo.
const TEXT_SETTLED = 70;
export const TEXT_OUT = TEXT_SETTLED + 270; // 4.5s hold at 60fps
const LOGO_IN = TEXT_OUT + 44; // screen is fully empty for ~0.25s before the logo
const SHEEN = LOGO_IN + 44;

const LOGO_H = 48 * 1.3; // hero scale: 130% of the standard lock-up
const LOGO_W = (LOGO_H * 1898) / 390;

export const Scene8Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const sheen = ease(frame, [SHEEN, SHEEN + 60], [0, 1], GLIDE);
  return (
    <Stage>
      {/* Text phase */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 270 - 62,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          letterSpacing: "-0.02em",
          scale: String(ease(frame, [TEXT_OUT, TEXT_OUT + 30], [1, 0.96])),
          opacity: ease(frame, [TEXT_OUT, TEXT_OUT + 26], [1, 0]),
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 400, color: COLORS.grey, lineHeight: 1.3 }}>
          <RevealWords text={TEXT.outro1} start={10} offsetY={14} />
        </div>
        <div style={{ fontSize: 28, fontWeight: 500, color: COLORS.ink, lineHeight: 1.3, marginTop: 6 }}>
          <RevealWords text={TEXT.outro2} start={26} offsetY={16} />
        </div>
        <div style={{ fontSize: 14, color: COLORS.grey, marginTop: 18, letterSpacing: "0.01em", lineHeight: 1.3 }}>
          <RevealWords text={TEXT.outroSub} start={44} offsetY={10} />
        </div>
      </div>

      {/* Standalone hero logo */}
      {frame >= LOGO_IN ? (
        <div
          style={{
            position: "absolute",
            left: 480 - LOGO_W / 2,
            top: 270 - LOGO_H / 2,
            width: LOGO_W,
            height: LOGO_H,
            opacity: ease(frame, [LOGO_IN, LOGO_IN + 24], [0, 1]),
            scale: String(ease(frame, [LOGO_IN, LOGO_IN + 48], [0.85, 1])),
          }}
        >
          <Img src={staticFile("botcircuits-logo.png")} style={{ width: LOGO_W, height: LOGO_H, display: "block" }} />
          {/* 45° light sheen, clipped to the logo's shape */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              WebkitMaskImage: `url(${staticFile("botcircuits-logo.png")})`,
              WebkitMaskSize: "100% 100%",
              maskImage: `url(${staticFile("botcircuits-logo.png")})`,
              maskSize: "100% 100%",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0) 44%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 56%)",
              backgroundSize: "300% 300%",
              backgroundPosition: `${100 - sheen * 100}% ${100 - sheen * 100}%`,
              opacity: sheen > 0 && sheen < 1 ? 1 : 0,
            }}
          />
        </div>
      ) : null}
    </Stage>
  );
};
