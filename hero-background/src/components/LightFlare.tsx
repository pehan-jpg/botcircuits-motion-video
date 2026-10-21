import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FLARE } from "../config";

/** Soft amber light leak that peaks at the midpoint of its sequence. */
export const LightFlare: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const mid = (durationInFrames - 1) / 2;

  return (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        pointerEvents: "none",
        opacity: interpolate(frame, [0, mid, durationInFrames - 1], [0, FLARE.peakOpacity, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.ease),
        }),
      }}
    >
      <AbsoluteFill
        style={{
          filter: `blur(${FLARE.blurPx}px)`,
          background: `radial-gradient(ellipse ${FLARE.sizePct}% ${FLARE.sizePct}% at ${FLARE.x}% ${FLARE.y}%, rgba(${FLARE.color}, 1) 0%, rgba(${FLARE.color}, 0.55) 35%, rgba(${FLARE.color}, 0) 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};
