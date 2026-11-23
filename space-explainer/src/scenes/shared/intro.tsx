import React from "react";
import { COLOR } from "../../theme";
import { BlurText } from "../../components/BlurText";
import { SpaceByLockup } from "../../components/SpaceByLockup";

/**
 * Layout shared across scene boundaries: the end of Scene 1, Scene 2 and the
 * opening of Scene 3. Changing a value here moves it on both sides.
 */
export const INTRO = {
  /** Space orb at the Scene 1 to Scene 2 boundary: centre of frame, 187.5px. */
  handoffOrb: { x: 960, y: 540, size: 187.5 },
  /** The single intro line: "Introducing Space by" plus the logo. */
  line: {
    top: 488,
    size: 84,
    weight: 500,
    tracking: "-0.02em",
    prefix: "Introducing ",
  },
  /** Very soft light behind the line: white at 45 percent, feathered to zero. */
  glow: { cx: 960, cy: 540, w: 1700, h: 640, alpha: 0.45 },
} as const;

/** Soft radial light behind the intro line, so it reads on the plate without a box. */
export const IntroGlow: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const g = INTRO.glow;
  return (
    <div
      style={{
        position: "absolute",
        left: g.cx - g.w / 2,
        top: g.cy - g.h / 2,
        width: g.w,
        height: g.h,
        borderRadius: "50%",
        background: `radial-gradient(closest-side, rgba(255,255,255,${g.alpha}) 0%, rgba(255,255,255,${g.alpha * 0.75}) 35%, rgba(255,255,255,${g.alpha * 0.3}) 70%, rgba(255,255,255,0) 100%)`,
        opacity,
      }}
    />
  );
};

/** The intro line. Animated in Scene 2 (startFrame), static in Scene 3 (blurs out at outFrame). */
export const IntroLine: React.FC<{
  startFrame?: number;
  outFrame?: number;
  outSeconds?: number;
}> = ({ startFrame, outFrame, outSeconds = 0.4 }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: INTRO.line.top,
      display: "flex",
      justifyContent: "center",
    }}
  >
    <BlurText
      inFrame={-100000}
      outFrame={outFrame}
      outSeconds={outSeconds}
      asText={false}
    >
      <SpaceByLockup
        prefix={INTRO.line.prefix}
        fontSize={INTRO.line.size}
        weight={INTRO.line.weight}
        tracking={INTRO.line.tracking}
        startFrame={startFrame}
        seed="s2-line"
        logoMode="assemble"
        color={COLOR.ink}
        backing="sampled"
      />
    </BlurText>
  </div>
);
