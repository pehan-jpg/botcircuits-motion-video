import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { PROBLEM_BACKDROP as B } from "../theme";
import { FilmGrain } from "./PlateBackground";

/**
 * Scene 1 backdrop: pale cool base with large blurred colour blobs that drift
 * at most 3 percent across the scene, plus 3 percent grain. `timeOffset` and
 * `duration` let Scene 2 continue it exactly.
 */
export const ProblemBackdrop: React.FC<{
  timeOffset?: number;
  duration?: number;
}> = ({ timeOffset = 0, duration = 15 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps + timeOffset;
  const p = Math.min(1, t / duration);
  const drift = B.maxDrift * 1920;
  return (
    <AbsoluteFill style={{ background: B.base, overflow: "hidden" }}>
      {B.blobs.map((b, i) => {
        const dir = [
          [1, -0.6],
          [-0.8, 0.5],
          [-0.5, -0.7],
        ][i];
        const ease = Math.sin((p * Math.PI) / 2);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: b.x - b.r + dir[0] * drift * ease,
              top: b.y - b.r + dir[1] * drift * ease,
              width: b.r * 2,
              height: b.r * 2,
              borderRadius: "50%",
              background: b.color,
              filter: `blur(${B.blur}px)`,
            }}
          />
        );
      })}
      <FilmGrain opacity={0.03} />
    </AbsoluteFill>
  );
};
