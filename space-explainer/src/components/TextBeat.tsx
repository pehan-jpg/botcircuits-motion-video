import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import {
  COLOR,
  FONT,
  HEADLINE_CPS,
  SAFE,
  TEXT_BEAT,
  readHoldSeconds,
} from "../theme";
import { typeDuration } from "../lib/typewriter";
import { Typewriter } from "./Typewriter";
import { useBlurInOut } from "./BlurText";
import { GlassPanel } from "./GlassPanel";

/** Timing of a TextBeat in seconds relative to its start. The hold is never shorter than the ReadabilityGuard minimum. */
export const textBeatTiming = (text: string, seed = "beat") => {
  const typed = typeDuration(text, HEADLINE_CPS, seed);
  const hold = Math.max(TEXT_BEAT.holdSeconds, readHoldSeconds(text));
  return {
    typed,
    hold,
    outAt: typed + hold,
    end: typed + hold + TEXT_BEAT.outSeconds,
  };
};

type Props = {
  text: string;
  /** Frame (in parent sequence) at which typing starts. */
  startFrame: number;
  seed?: string;
  panel?: "none" | "glass";
  color?: string;
};

/** A short headline typed top left inside the safe area. Holds, then blurs out. */
export const TextBeat: React.FC<Props> = ({
  text,
  startFrame,
  seed = "beat",
  panel = "none",
  color = COLOR.ink,
}) => {
  const { fps } = useVideoConfig();
  const timing = textBeatTiming(text, seed);
  const outFrame = startFrame + Math.round(timing.outAt * fps);
  // Reuse blur in/out only for the exit; typing handles the entrance.
  const exit = useBlurInOut(-10_000, outFrame, TEXT_BEAT.outSeconds);
  const frame = useCurrentFrame();
  if (!exit.visible || frame < startFrame) return null;
  const content = (
    <Typewriter
      lines={[text]}
      cps={HEADLINE_CPS}
      startFrame={startFrame}
      seed={seed}
      caretColor={color}
      style={{
        fontFamily: FONT.sans,
        fontWeight: 700,
        fontSize: TEXT_BEAT.size,
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
        color,
      }}
    />
  );
  return (
    <div
      data-guard="text"
      data-guard-label={`TextBeat: ${text}`}
      style={{
        position: "absolute",
        left: SAFE,
        top: SAFE,
        opacity: exit.opacity,
        filter: exit.blur > 0.05 ? `blur(${exit.blur}px)` : undefined,
        transform: `translateY(${exit.y}px)`,
      }}
    >
      {panel === "glass" ? (
        <GlassPanel style={{ padding: "14px 26px", borderRadius: 22 }}>
          {content}
        </GlassPanel>
      ) : (
        content
      )}
    </div>
  );
};
