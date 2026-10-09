import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { ease } from "../theme";

// Masked vertical upward reveal, staggered per word.
export const RevealWords: React.FC<{
  text: string;
  start: number;
  staggerMs?: number;
  durationFrames?: number;
  offsetY?: number;
  frame?: number; // optional override, e.g. to show a settled line inside another scene
}> = ({ text, start, staggerMs = 35, durationFrames = 30, offsetY = 18, frame: frameOverride }) => {
  const current = useCurrentFrame();
  const frame = frameOverride ?? current;
  const { fps } = useVideoConfig();
  const stagger = (staggerMs / 1000) * fps;
  return (
    <>
      {text.split(" ").map((word, i) => {
        const s = start + i * stagger;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              overflow: "hidden",
              verticalAlign: "top",
              paddingBottom: "0.12em",
              marginBottom: "-0.12em",
            }}
          >
            <span
              style={{
                display: "inline-block",
                translate: `0px ${ease(frame, [s, s + durationFrames], [offsetY, 0])}px`,
                opacity: ease(frame, [s, s + durationFrames * 0.7], [0, 1]),
                whiteSpace: "pre",
              }}
            >
              {word}
              {" "}
            </span>
          </span>
        );
      })}
    </>
  );
};
