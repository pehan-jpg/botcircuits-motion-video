import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BLUR_IN, EASE } from "../theme";

/**
 * Blur in from 24px with a 20px rise over 0.7s. Optional blur out.
 * Returns the visual state so other components (TextBeat) can reuse it.
 */
export const useBlurInOut = (
  inFrame: number,
  outFrame?: number,
  outSeconds = 0.5,
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pIn = EASE(
    interpolate(frame, [inFrame, inFrame + BLUR_IN.seconds * fps], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const pOut =
    outFrame === undefined
      ? 0
      : EASE(
          interpolate(frame, [outFrame, outFrame + outSeconds * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        );
  const opacity = pIn * (1 - pOut);
  const blur = BLUR_IN.blur * (1 - pIn) + BLUR_IN.blur * pOut;
  const y = BLUR_IN.rise * (1 - pIn) - (BLUR_IN.rise / 2) * pOut;
  const visible =
    frame >= inFrame &&
    (outFrame === undefined || frame < outFrame + outSeconds * fps);
  return { opacity, blur, y, visible };
};

type Props = {
  inFrame: number;
  outFrame?: number;
  outSeconds?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
  guardLabel?: string;
  asText?: boolean;
};

export const BlurText: React.FC<Props> = ({
  inFrame,
  outFrame,
  outSeconds,
  style,
  children,
  guardLabel,
  asText = true,
}) => {
  const s = useBlurInOut(inFrame, outFrame, outSeconds);
  if (!s.visible) return null;
  return (
    <div
      data-guard={asText ? "text" : undefined}
      data-guard-label={guardLabel}
      style={{
        ...style,
        opacity:
          s.opacity *
          (style?.opacity === undefined ? 1 : Number(style.opacity)),
        filter: s.blur > 0.05 ? `blur(${s.blur}px)` : undefined,
        transform: `${style?.transform ?? ""} translateY(${s.y}px)`,
      }}
    >
      {children}
    </div>
  );
};
