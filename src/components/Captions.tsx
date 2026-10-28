import React from "react";
import { AbsoluteFill } from "remotion";
import { useTimeline } from "../anim";
import { CAPTIONS, CAPTION_FADE } from "../content";
import { C, CAPTION_TOP, FONT } from "../theme";
import { TypedSegments } from "./TypedSegments";

// Bottom captions, one at a time: type in, hold, fade out.
export const Captions: React.FC<{ offsetX?: number }> = ({ offsetX = 0 }) => {
  const { t, p } = useTimeline();
  const active = CAPTIONS.find(
    (c) => t >= c.typeAt - 0.05 && t < c.fadeAt + CAPTION_FADE,
  );
  if (!active) return null;
  const opacity = 1 - p(active.fadeAt, CAPTION_FADE);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: CAPTION_TOP,
          left: 80,
          right: 80,
          translate: `${offsetX}px 0px`,
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: 300,
          fontSize: 64,
          lineHeight: 1.18,
          letterSpacing: -1,
          color: C.ink,
          opacity,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <TypedSegments
          lines={active.lines}
          typeAt={active.typeAt}
          cps={active.cps}
        />
      </div>
    </AbsoluteFill>
  );
};
