import React from "react";
import { interpolate, useVideoConfig } from "remotion";
import { theme } from "./theme";
import { ContentStack } from "./ContentBlock";
import { Icon } from "./icons";
import { easeIn, easeOut, progress, useCardStyle, useTiming } from "./timing";
import type { AgentState } from "./types";

/** Card-level transform, for compositions that drive the card's motion themselves. */
export type CardMotion = {
  opacity: number;
  translateY: number;
  scale: number;
  blur: number;
  /** Opacity of everything inside the glass (default 1). 0 leaves just the card shell. */
  contentOpacity?: number;
};

type Props = {
  state: AgentState;
  /** Composition frames since this state started entering. */
  frame: number;
  /** Composition frames this state is on screen (drives the built-in exit). */
  durationInFrames: number;
  /** When given, replaces the built-in enter/exit motion. */
  motion?: CardMotion;
  /** Faint stacked layers peeking above the top edge. Default true. */
  showStack?: boolean;
};

const StackLayer: React.FC<{ inset: number; offset: number; opacity: number; escalation?: boolean }> = ({
  inset,
  offset,
  opacity,
  escalation,
}) => {
  const edge = `1px solid ${escalation ? "rgba(196,230,57,0.3)" : theme.cardBorder}`;
  return (
    <div
      style={{
        position: "absolute",
        left: inset,
        right: inset,
        top: -offset,
        // Only the sliver above the card's top edge, so nothing shows through the glass.
        height: offset + 1,
        borderRadius: `${theme.cardRadius}px ${theme.cardRadius}px 0 0`,
        background: "rgba(16, 17, 16, 0.9)",
        borderTop: edge,
        borderLeft: edge,
        borderRight: edge,
        opacity,
      }}
    />
  );
};

export const AgentCard: React.FC<Props> = ({ state, frame: compFrame, durationInFrames, motion, showStack = true }) => {
  const { fps } = useVideoConfig();
  const timing = useTiming();
  const style = useCardStyle();
  // Work in 60fps units so timings are identical at any frame rate.
  const frame = compFrame * (60 / fps);
  const duration = durationInFrames * (60 / fps);

  let m: CardMotion;
  if (motion) {
    m = motion;
  } else {
    const enter = interpolate(frame, [0, timing.inDuration], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeOut,
    });
    const exit = interpolate(frame, [duration - timing.outDuration, duration], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easeIn,
    });
    m = {
      opacity: enter * (1 - exit),
      translateY: (1 - enter) * 30 - exit * 6,
      blur: (1 - enter) * 10 + exit * 14,
      scale: interpolate(enter, [0, 1], [0.985, 1]) * interpolate(exit, [0, 1], [1, 0.985]),
    };
  }

  const line = (i: number) => progress(frame, 4 + timing.headerStagger * i, timing.itemDuration);
  const header = line(0);
  const title = line(2);
  const subtitle = line(3);

  const esc = !!state.escalation;
  const pillFilled = esc || !!state.pillFilled;
  const timeline = state.layout === "timeline";

  const titleBlock = (
    <>
      <div
        style={{
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
      {state.subtitle && (
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
      )}
    </>
  );

  // Timeline layout: icon circle with a lime line drawing down beside the content.
  const iconP = progress(frame, 4 + timing.headerStagger, timing.itemDuration);
  const lineP = progress(frame, 4 + timing.headerStagger * 2, 50);

  return (
    <div
      style={{
        position: "relative",
        width: theme.cardWidth,
        opacity: m.opacity,
        transform: `translateY(${m.translateY}px) scale(${m.scale})`,
        transformOrigin: "50% 0%",
        // Always set, so the card keeps one rendering path and text does not
        // re-rasterise (a visible one-frame shimmer) when the blur reaches 0.
        filter: motion ? `blur(${m.blur.toFixed(3)}px)` : m.blur > 0.05 ? `blur(${m.blur}px)` : undefined,
        fontFamily: style.fontFamily,
      }}
    >
      {showStack && (
        <>
          <StackLayer inset={56} offset={30} opacity={0.35} escalation={esc} />
          <StackLayer inset={28} offset={15} opacity={0.65} escalation={esc} />
        </>
      )}

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

        <div style={{ opacity: m.contentOpacity ?? 1, display: "flex", flexDirection: "column" }}>
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
            {state.role && <div style={{ fontSize: theme.size.role, color: style.roleColor, fontWeight: 500 }}>{state.role}</div>}
          </div>
          <div
            style={{
              fontSize: theme.size.pill,
              fontWeight: 600,
              letterSpacing: "0.12em",
              padding: "8px 18px",
              borderRadius: 999,
              color: pillFilled ? "#0b0c0b" : theme.lime,
              background: pillFilled ? theme.lime : theme.limeSoft,
              border: `1.5px solid ${theme.lime}`,
            }}
          >
            {state.status}
          </div>
        </div>

        {timeline ? (
          <div style={{ marginTop: 36, display: "flex", gap: 26 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 64, flexShrink: 0 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 999,
                  background: "rgba(0,0,0,0.5)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: iconP,
                  transform: `scale(${interpolate(iconP, [0, 1], [0.9, 1])})`,
                }}
              >
                {state.icon && <Icon name={state.icon} size={30} color={theme.lime} />}
              </div>
              <div
                style={{
                  marginTop: 12,
                  width: 2,
                  flex: 1,
                  borderRadius: 2,
                  background: `linear-gradient(${theme.lime}, rgba(196,230,57,0.15))`,
                  transformOrigin: "50% 0%",
                  transform: `scaleY(${lineP})`,
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
              {titleBlock}
              <div style={{ marginTop: 28 }}>
                <ContentStack blocks={state.content} frame={frame} />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginTop: 40 }}>{titleBlock}</div>
            <div style={{ marginTop: state.subtitle ? 32 : 28 }}>
              <ContentStack blocks={state.content} frame={frame} />
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
};
