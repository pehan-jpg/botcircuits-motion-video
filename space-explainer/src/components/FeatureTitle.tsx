import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLOR, EASE, FONT, readHoldSeconds } from "../theme";

/**
 * FeatureTitle: introduces a feature alone on the plate, then hands over to
 * the product frame. Word by word blur in, hold, drift up and out.
 */
export const FEATURE_TITLE = {
  size: 88,
  weight: 600,
  tracking: "-0.03em",
  maxWidth: 1400,
  wordIn: 0.7,
  stagger: 0.09,
  blur: 14,
  rise: 18,
  minHold: 1.2,
  exit: 0.5,
  exitRise: 24,
  glow: { w: 1700, h: 700, alpha: 0.45 },
  /** The product frame starts rising this long before the title has left. */
  frameLead: 0.3,
  frameRise: 0.9,
} as const;

/**
 * Timing in seconds relative to `start`. Reading time counts from the first
 * word, because the title is read as it reveals; the hold after the last word
 * is never under 1.2s.
 */
export const featureTitleTiming = (text: string) => {
  const words = text.split(/\s+/).filter(Boolean);
  const lastIn = (words.length - 1) * FEATURE_TITLE.stagger + FEATURE_TITLE.wordIn;
  const exitStart = Math.max(lastIn + FEATURE_TITLE.minHold, readHoldSeconds(text));
  const exitEnd = exitStart + FEATURE_TITLE.exit;
  const frameRiseStart = exitEnd - FEATURE_TITLE.frameLead;
  return { words, lastIn, exitStart, exitEnd, frameRiseStart, frameRiseEnd: frameRiseStart + FEATURE_TITLE.frameRise };
};

/** Product frame rise under a FeatureTitle: scale 0.94 to 1, translateY 40 to 0, opacity 0 to 1. */
export const frameRiseStyle = (p: number): React.CSSProperties => ({
  // Opacity comes in a little later than the move, so the frame never shows through the exiting title.
  opacity: p * p,
  transform: `translateY(${40 * (1 - p)}px) scale(${0.94 + 0.06 * p})`,
  transformOrigin: "50% 50%",
});

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const FeatureTitle: React.FC<{ text: string; startFrame: number; centerY?: number }> = ({ text, startFrame, centerY = 540 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame - startFrame) / fps;
  const T = featureTitleTiming(text);
  if (t < 0 || t > T.exitEnd) return null;
  const exitP = EASE(interpolate(t, [T.exitStart, T.exitEnd], [0, 1], clamp));
  const glowIn = EASE(interpolate(t, [0, 0.6], [0, 1], clamp));
  const g = FEATURE_TITLE.glow;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 960 - g.w / 2,
          top: centerY - g.h / 2,
          width: g.w,
          height: g.h,
          borderRadius: "50%",
          background: `radial-gradient(closest-side, rgba(255,255,255,${g.alpha}) 0%, rgba(255,255,255,${g.alpha * 0.75}) 35%, rgba(255,255,255,${g.alpha * 0.3}) 70%, rgba(255,255,255,0) 100%)`,
          opacity: glowIn * (1 - exitP),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: centerY,
          display: "flex",
          justifyContent: "center",
          transform: "translateY(-50%)",
        }}
      >
        <div
          data-guard="text"
          data-guard-label={`FeatureTitle: ${text}`}
          style={{
            opacity: 1 - exitP,
            // A slow scale drift while the title holds, so the frame keeps moving.
            transform: `scale(${1 + 0.02 * Math.min(1, Math.max(0, t / T.exitStart))})`,
            maxWidth: FEATURE_TITLE.maxWidth,
            textAlign: "center",
            fontFamily: FONT.sans,
            fontWeight: FEATURE_TITLE.weight,
            fontSize: FEATURE_TITLE.size,
            letterSpacing: FEATURE_TITLE.tracking,
            lineHeight: 1.1,
            color: COLOR.ink,
          }}
        >
          {T.words.map((w, i) => {
            const p = EASE(interpolate(t, [i * FEATURE_TITLE.stagger, i * FEATURE_TITLE.stagger + FEATURE_TITLE.wordIn], [0, 1], clamp));
            const blur = FEATURE_TITLE.blur * (1 - p) + 12 * exitP;
            return (
              <React.Fragment key={i}>
                <span
                  style={{
                    display: "inline-block",
                    opacity: p,
                    filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
                    transform: `translateY(${FEATURE_TITLE.rise * (1 - p) - FEATURE_TITLE.exitRise * exitP}px)`,
                  }}
                >
                  {w}
                </span>
                {i < T.words.length - 1 ? " " : null}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </>
  );
};
