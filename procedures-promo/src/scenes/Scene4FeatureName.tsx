import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../components/Stage";
import { PromiseLine } from "./Scene3Promise";
import { COLORS, TEXT, ease } from "../theme";

export const FeatureTitle: React.FC<{ frame: number; style?: React.CSSProperties; haloScale?: number }> = ({
  frame,
  style,
}) => {
  const halo = ease(frame, [26, 56], [0, 1]);
  const pulse = 1 + 0.06 * Math.sin(Math.max(0, frame - 56) / 14);
  return (
    <div style={{ position: "absolute", inset: 0, ...style }}>
      <div
        style={{
          position: "absolute",
          left: 480 - 230,
          top: 270 - 70,
          width: 460,
          height: 140,
          borderRadius: 70,
          background: `radial-gradient(closest-side, rgba(210,248,0,0.55), rgba(210,248,0,0.18) 55%, rgba(210,248,0,0) 100%)`,
          filter: "blur(18px)",
          opacity: halo,
          scale: String(pulse * ease(frame, [26, 56], [0.85, 1])),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 270 - 24,
          textAlign: "center",
          fontSize: 38,
          fontWeight: 500,
          letterSpacing: `${ease(frame, [12, 50], [0.02, -0.02])}em`,
          lineHeight: 1.25,
          color: COLORS.ink,
          opacity: ease(frame, [12, 36], [0, 1]),
          scale: String(ease(frame, [12, 50], [0.96, 1])),
          filter: `blur(${ease(frame, [12, 40], [8, 0])}px)`,
        }}
      >
        {TEXT.feature}
      </div>
    </div>
  );
};

export const Scene4FeatureName: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = { opacity: ease(frame, [0, 16], [1, 0]), translate: `0px ${ease(frame, [0, 18], [0, -14])}px` };
  return (
    <Stage>
      <div style={{ position: "absolute", inset: 0, ...out }}>
        <PromiseLine frame={200} fps={fps} />
      </div>
      <FeatureTitle frame={frame} />
    </Stage>
  );
};
