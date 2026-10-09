import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { Stage } from "../components/Stage";
import { RevealWords } from "../components/RevealText";
import { RevealLines } from "../components/Opening";
import { COLORS, GLIDE, HERO_LOGO_H, TEXT, ease } from "../theme";

// 0:00–0:05.0 text (reveal + hold) → 0:05.0–0:05.5 dissolve to an empty canvas → 0:05.5 hero logo.
export const TEXT_OUT = 300;
const LOGO_IN = 330;
const SHEEN = LOGO_IN + 60;

const LOGO_W = (HERO_LOGO_H * 1898) / 390;

export const Scene8Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const sheen = ease(frame, [SHEEN, SHEEN + 60], [0, 1], GLIDE);
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
        <div style={{ fontSize: 42, fontWeight: 400, color: COLORS.grey, lineHeight: 1.2 }}>
          <RevealWords text={TEXT.outro1} start={10} offsetY={18} />
        </div>
        <div style={{ fontSize: 56, fontWeight: 500, color: COLORS.ink, lineHeight: 1.15, marginTop: 14 }}>
          <RevealLines lines={TEXT.outro2} start={30} offsetY={20} />
        </div>
      </div>

      {/* Standalone hero logo (same size as Scene 1) */}
      {frame >= LOGO_IN ? (
        <div
          style={{
            position: "absolute",
            left: 480 - LOGO_W / 2,
            top: 270 - HERO_LOGO_H / 2,
            width: LOGO_W,
            height: HERO_LOGO_H,
            opacity: ease(frame, [LOGO_IN, LOGO_IN + 30], [0, 1]),
            scale: String(ease(frame, [LOGO_IN, LOGO_IN + 60], [0.85, 1])),
          }}
        >
          <Img src={staticFile("botcircuits-logo.png")} style={{ width: LOGO_W, height: HERO_LOGO_H, display: "block" }} />
          {/* Subtle 45° light sheen, clipped to the logo's shape */}
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
