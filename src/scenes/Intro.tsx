import React from "react";
import { AbsoluteFill } from "remotion";
import { mix, useTimeline } from "../anim";
import { INTRO, MORPH_IN } from "../content";
import { C, EASE_CAMERA, EASE_IN, FONT } from "../theme";
import { TintedText } from "../components/TintedText";

// Soft vertical feather on the top and bottom of a text block.
const FEATHER =
  "linear-gradient(180deg, transparent 0%, #000 14%, #000 86%, transparent 100%)";

// Headline that resolves from blur character by character, then the
// supporting line. Both shrink away as the T1 morph begins.
export const Intro: React.FC = () => {
  const { p, since, t } = useTimeline();
  if (t > MORPH_IN.start + 0.45) return null;
  const out = p(MORPH_IN.start, 0.3, EASE_CAMERA);
  const sub = p(INTRO.sublineAt, 0.5);
  let index = 0;
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        color: C.ink,
        opacity: 1 - out,
        scale: String(mix(1, 0.62, out)),
        translate: `0px ${mix(0, 40, out)}px`,
      }}
    >
      <div
        style={{
          padding: "36px 40px",
          textAlign: "center",
          fontSize: 104,
          fontWeight: 300,
          lineHeight: 1.12,
          letterSpacing: -3,
          WebkitMaskImage: FEATHER,
          maskImage: FEATHER,
        }}
      >
        {INTRO.headline.map((line) => (
          <div key={line} style={{ whiteSpace: "pre" }}>
            {Array.from(line).map((ch) => {
              const i = index++;
              const at = INTRO.headlineAt + i * INTRO.charStagger;
              const e = p(at, INTRO.charDuration, EASE_IN);
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    whiteSpace: "pre",
                    opacity: e,
                    filter: e < 1 ? `blur(${mix(24, 0, e)}px)` : undefined,
                    translate: `0px ${mix(20, 0, e)}px`,
                  }}
                >
                  <TintedText
                    text={ch}
                    ageOf={() => since(at + INTRO.charDuration * 0.35)}
                    settle={INTRO.tintDuration}
                  />
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 22,
          maxWidth: 820,
          textAlign: "center",
          fontSize: 44,
          fontWeight: 300,
          lineHeight: 1.3,
          letterSpacing: -0.6,
          color: C.muted,
          opacity: sub,
          filter: sub < 1 ? `blur(${mix(10, 0, sub)}px)` : undefined,
          translate: `0px ${mix(14, 0, sub)}px`,
        }}
      >
        {INTRO.subline}
      </div>
    </AbsoluteFill>
  );
};
