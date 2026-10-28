import React from "react";
import { AbsoluteFill } from "remotion";
import { mix, useTimeline } from "../anim";
import { CLOSING } from "../content";
import { TypedSegments } from "../components/TypedSegments";
import { C, FONT } from "../theme";

// TODO: replace the placeholder wordmark with public/botcircuits-logo.svg
// once the real logo file is added to the project.
const Wordmark: React.FC = () => {
  const { p } = useTimeline();
  const dot = p(CLOSING.wordmarkAt, 0.4);
  const text = p(CLOSING.wordmarkAt + 0.12, 0.5);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: C.lime,
          scale: String(dot),
        }}
      />
      <div
        style={{
          fontSize: 76,
          fontWeight: 600,
          letterSpacing: -2.5,
          opacity: text,
          translate: `0px ${mix(24, 0, text)}px`,
        }}
      >
        {CLOSING.wordmark}
      </div>
    </div>
  );
};

export const Closing: React.FC = () => {
  const { p, t } = useTimeline();
  if (t < CLOSING.wordmarkAt - 0.1) return null;
  const sub = p(CLOSING.sublineAt, 0.45);
  return (
    <AbsoluteFill
      style={{
        fontFamily: FONT,
        color: C.ink,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          translate: "0px -60px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Wordmark />
        <div
          style={{
            marginTop: 64,
            fontSize: 68,
            fontWeight: 300,
            lineHeight: 1.18,
            letterSpacing: -1.2,
            textAlign: "center",
            minHeight: "2.36em",
          }}
        >
          <TypedSegments
            lines={CLOSING.tagline}
            typeAt={CLOSING.taglineAt}
            cps={CLOSING.taglineCps}
          />
        </div>
        <div
          style={{
            marginTop: 34,
            fontSize: 40,
            fontWeight: 300,
            letterSpacing: -0.5,
            color: C.muted,
            opacity: sub,
            translate: `0px ${mix(12, 0, sub)}px`,
          }}
        >
          {CLOSING.subline}
        </div>
      </div>
    </AbsoluteFill>
  );
};
