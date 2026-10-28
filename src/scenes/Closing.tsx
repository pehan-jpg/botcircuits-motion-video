import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { mix, useTimeline } from "../anim";
import { CLOSING, VIDEO } from "../content";
import { C, EASE_IN } from "../theme";

// Supplied logo, used unaltered at its original proportions.
const LOGO = { src: "botcircuits-logo.png", width: 1898, height: 390 };

// Final screen: pure white with only the logo, which resolves from blur.
export const Closing: React.FC = () => {
  const { p, t } = useTimeline();
  if (t < CLOSING.logoAt) return null;
  const e = p(CLOSING.logoAt, CLOSING.logoDuration, EASE_IN);
  const width = VIDEO.width * CLOSING.logoWidthRatio;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          opacity: e,
          filter: e < 1 ? `blur(${mix(24, 0, e)}px)` : undefined,
          translate: `0px ${mix(20, 0, e)}px`,
        }}
      >
        <Img
          src={staticFile(LOGO.src)}
          style={{
            display: "block",
            width,
            height: (width * LOGO.height) / LOGO.width,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
