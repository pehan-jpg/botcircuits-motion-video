import type React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENES, THEME } from "../config";
import { cardMotion, clamp, lerp, pressScale, progressEase, ramp, swap } from "../motion";
import { Body, DotLoader, Glass, Label, LimeCheck, Ripple, Title } from "../ui";

const S = SCENES.concierge;
const CARD_HEIGHT = 256;
const AVATAR = 56;

const PulseRing: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const t = interpolate(frame, [at, at + 26], [0, 1], clamp);
  if (frame < at || t >= 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        border: `2px solid ${THEME.lime}`,
        scale: String(lerp(1, 2.3, t)),
        opacity: 0.7 * (1 - t),
      }}
    />
  );
};

const Avatars: React.FC<{ frame: number }> = ({ frame }) => {
  const a = S.avatars;
  const agent = ramp(frame, a.agentAt, 12);
  const human = ramp(frame, a.humanAt, 12);
  const line = ramp(frame, a.lineStart, a.lineEnd - a.lineStart, progressEase);
  const pulses: number[] = [];
  for (let f = a.agentAt + 4; f <= a.pulseUntil; f += a.pulseEvery) pulses.push(f);
  // A small lime packet travels the line while connecting.
  const packetT = frame >= a.lineEnd && frame < S.joinedAt ? ((frame - a.lineEnd) % 16) / 16 : -1;

  return (
    <div style={{ display: "flex", alignItems: "center", height: AVATAR, marginTop: 20 }}>
      <div style={{ position: "relative", width: AVATAR, height: AVATAR, flexShrink: 0, opacity: agent, scale: String(lerp(0.6, 1, agent)) }}>
        {pulses.map((p) => (
          <PulseRing key={p} frame={frame} at={p} />
        ))}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, ${THEME.lime} 48%, ${THEME.lime} 100%)`,
            boxShadow: `0 0 24px color-mix(in srgb, ${THEME.lime} 55%, transparent)`,
          }}
        />
      </div>

      <div style={{ position: "relative", flex: 1, height: 2, margin: "0 14px", background: THEME.hairline, borderRadius: 1 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: THEME.text,
            opacity: 0.55,
            transformOrigin: "0 50%",
            scale: `${line} 1`,
          }}
        />
        {packetT >= 0 ? (
          <div
            style={{
              position: "absolute",
              top: -4,
              left: `${(packetT * 100).toFixed(2)}%`,
              width: 10,
              height: 10,
              marginLeft: -5,
              borderRadius: "50%",
              background: THEME.lime,
              opacity: Math.sin(packetT * Math.PI),
            }}
          />
        ) : null}
      </div>

      <div
        style={{
          width: AVATAR,
          height: AVATAR,
          borderRadius: "50%",
          background: "rgba(18, 22, 27, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          opacity: human,
          scale: String(lerp(0.6, 1, human)),
        }}
      >
        <Title style={{ fontSize: 20 }}>{S.copy.initials}</Title>
      </div>
    </div>
  );
};

export const ConciergeHandoff: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { visible, transform, fade } = cardMotion(frame, fps, S.enter, S.exit, S.enterFrom);
  if (!visible) return null;

  const e = ramp(frame, S.expand.start, S.expand.end - S.expand.start);
  const reveal =
    e < 1
      ? {
          right: (S.width - S.chip.width) * (1 - e),
          bottom: (CARD_HEIGHT - S.chip.height) * (1 - e),
          radius: lerp(S.chip.height / 2, THEME.glass.radius, e),
          height: CARD_HEIGHT,
        }
      : undefined;

  const chipOrigin = `${S.chip.width / 2}px ${S.chip.height / 2}px`;
  const containerTransform: React.CSSProperties = {
    ...transform,
    transformOrigin: chipOrigin,
    scale: String(Number(transform.scale) * pressScale(frame, S.ripple)),
  };
  const chipOut = ramp(frame, S.expand.start, 6);
  const content = ramp(frame, S.expand.start + 4, 14);

  return (
    <Glass
      x={S.x}
      y={S.y}
      width={S.width}
      transform={containerTransform}
      fade={fade}
      reveal={reveal}
      surfaceStyle={{ height: CARD_HEIGHT, padding: 24, overflow: "hidden" }}
    >
      {/* Quick reply chip */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: S.chip.width,
          height: S.chip.height,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 22px",
          boxSizing: "border-box",
          opacity: 1 - chipOut,
          translate: `0px ${(-6 * chipOut).toFixed(2)}px`,
          whiteSpace: "nowrap",
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: THEME.lime, flexShrink: 0 }} />
        <Body style={{ fontWeight: 500 }}>{S.copy.chip}</Body>
      </div>
      <Ripple frame={frame} at={S.ripple} x={S.chip.width * 0.7} y={S.chip.height / 2} size={260} duration={18} />

      {/* Handoff card */}
      <div style={{ opacity: content, translate: `0px ${(10 * (1 - content)).toFixed(2)}px` }}>
        <Label>{S.copy.label}</Label>
        <Title style={{ marginTop: 8 }}>{S.copy.title}</Title>
        <Avatars frame={frame} />
        <div style={{ position: "relative", height: 56, marginTop: 20 }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 14, ...swap(frame, S.connecting.start, S.joinedAt) }}>
            <DotLoader frame={frame} />
            <Body color={THEME.textSecondary}>{S.copy.connecting}</Body>
          </div>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 14, ...swap(frame, S.joinedAt + 2, null, 12) }}>
            <LimeCheck frame={frame} start={S.joinedAt + 2} size={30} />
            <Body>{S.copy.joined}</Body>
          </div>
        </div>
      </div>
    </Glass>
  );
};
