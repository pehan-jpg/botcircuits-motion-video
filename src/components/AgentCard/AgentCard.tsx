import React from "react";
import { interpolate } from "remotion";
import { theme } from "./theme";
import { ContentStack } from "./ContentBlock";
import { easeIn, easeOut, progress, timing } from "./timing";
import type { AgentState } from "./types";

type Props = {
  state: AgentState;
  /** Frame relative to the start of this state. */
  frame: number;
  /** Total frames this state is on screen (drives the exit). */
  durationInFrames: number;
};

const StackLayer: React.FC<{ inset: number; offset: number; opacity: number; escalation?: boolean }> = ({
  inset,
  offset,
  opacity,
  escalation,
}) => (
  <div
    style={{
      position: "absolute",
      left: inset,
      right: inset,
      top: -offset,
      // Only the sliver above the card's top edge, so nothing shows through the glass.
      height: offset + 1,
      borderRadius: `${theme.cardRadius}px ${theme.cardRadius}px 0 0`,
      borderBottom: "none",
      background: "rgba(16, 17, 16, 0.9)",
      borderTop: `1px solid ${escalation ? "rgba(196,230,57,0.3)" : theme.cardBorder}`,
      borderLeft: `1px solid ${escalation ? "rgba(196,230,57,0.3)" : theme.cardBorder}`,
      borderRight: `1px solid ${escalation ? "rgba(196,230,57,0.3)" : theme.cardBorder}`,
      opacity,
    }}
  />
);

export const AgentCard: React.FC<Props> = ({ state, frame, durationInFrames }) => {
  // Card-level enter (fade + upward settle + unblur) and exit (fade + soft blur).
  const enter = interpolate(frame, [0, timing.inDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
  const exit = interpolate(
    frame,
    [durationInFrames - timing.outDuration, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeIn },
  );

  const opacity = enter * (1 - exit);
  const translateY = (1 - enter) * 30 - exit * 6;
  const blur = (1 - enter) * 10 + exit * 14;
  const scale = interpolate(enter, [0, 1], [0.985, 1]) * interpolate(exit, [0, 1], [1, 0.985]);

  const header = progress(frame, 4, timing.itemDuration);
  const title = progress(frame, 4 + timing.headerStagger * 2, timing.itemDuration);
  const subtitle = progress(frame, 4 + timing.headerStagger * 3, timing.itemDuration);

  const esc = !!state.escalation;

  return (
    <div
      style={{
        position: "relative",
        width: theme.cardWidth,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
        fontFamily: theme.fontFamily,
      }}
    >
      {/* Faint stacked layers peeking above the top edge */}
      <StackLayer inset={56} offset={30} opacity={0.35} escalation={esc} />
      <StackLayer inset={28} offset={15} opacity={0.65} escalation={esc} />

      <div
        style={{
          position: "relative",
          borderRadius: theme.cardRadius,
          background: theme.cardBg,
          border: `1.5px solid ${esc ? theme.limeBorder : theme.cardBorder}`,
          boxShadow: esc
            ? "0 0 60px rgba(196,230,57,0.16), 0 30px 80px rgba(0,0,0,0.35)"
            : "0 30px 80px rgba(0,0,0,0.35)",
          backdropFilter: "blur(24px)",
          padding: theme.cardPadding,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top highlight to sell the glass */}
        <div
          style={{
            position: "absolute",
            left: 32,
            right: 32,
            top: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${esc ? "rgba(196,230,57,0.5)" : "rgba(255,255,255,0.22)"}, transparent)`,
          }}
        />

        {/* Header: AGENT tag + role, status pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            opacity: header,
            transform: `translateY(${(1 - header) * 8}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                fontSize: theme.size.tag,
                fontWeight: 600,
                letterSpacing: "0.08em",
                padding: "7px 12px",
                borderRadius: 8,
                color: esc ? "#0b0c0b" : theme.text,
                background: esc ? theme.lime : "rgba(255,255,255,0.06)",
                border: `1px solid ${esc ? theme.lime : "rgba(255,255,255,0.16)"}`,
              }}
            >
              {state.agentId}
            </div>
            <div style={{ fontSize: theme.size.role, color: theme.textMuted, fontWeight: 500 }}>{state.role}</div>
          </div>
          <div
            style={{
              fontSize: theme.size.pill,
              fontWeight: 600,
              letterSpacing: "0.12em",
              padding: "8px 18px",
              borderRadius: 999,
              color: esc ? "#0b0c0b" : theme.lime,
              background: esc ? theme.lime : theme.limeSoft,
              border: `1.5px solid ${theme.lime}`,
            }}
          >
            {state.status}
          </div>
        </div>

        {/* Title + subtitle */}
        <div
          style={{
            marginTop: 40,
            fontSize: theme.size.title,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.12,
            color: theme.text,
            opacity: title,
            transform: `translateY(${(1 - title) * 12}px)`,
          }}
        >
          {state.title}
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: theme.size.subtitle,
            color: theme.textMuted,
            opacity: subtitle,
            transform: `translateY(${(1 - subtitle) * 10}px)`,
          }}
        >
          {state.subtitle}
        </div>

        {/* Content */}
        <div style={{ marginTop: 32 }}>
          <ContentStack blocks={state.content} frame={frame} />
        </div>
      </div>
    </div>
  );
};
