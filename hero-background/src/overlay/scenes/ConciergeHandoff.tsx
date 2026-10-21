import type React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENES, STACK, THEME, exitTiming } from "../config";
import { cardMotion, clamp, lerp, progressEase, ramp, swap } from "../motion";
import { Body, DotLoader, Glass, Label, LimeCheck, QueryBubble, Stack, Title } from "../ui";

const S = SCENES.concierge;
const EXIT = exitTiming(S.exitEnd);
const AVATAR = 52;

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
    <div style={{ display: "flex", alignItems: "center", height: AVATAR, marginTop: 16 }}>
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
            opacity: 0.7,
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
          background: "rgba(255, 255, 255, 0.16)",
          border: `1px solid ${THEME.hairline}`,
          boxSizing: "border-box",
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

const HandoffCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { visible, transform, fade } = cardMotion(frame, fps, S.card.enter, EXIT.card, S.card.enterFrom, S.query.enter);
  if (!visible) return null;

  return (
    <Glass variant="action" tint={S.tint} width={STACK.width} transform={transform} fade={fade} surfaceStyle={{ padding: 20 }}>
      <Label>{S.copy.label}</Label>
      <Title style={{ marginTop: 6 }}>{S.copy.title}</Title>
      <Avatars frame={frame} />
      <div style={{ position: "relative", height: 58, marginTop: 16 }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 14, ...swap(frame, S.connecting.start, S.joinedAt) }}>
          <DotLoader frame={frame} />
          <Body color={THEME.textSecondary}>{S.copy.connecting}</Body>
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 14, ...swap(frame, S.joinedAt + 2, null, 12) }}>
          <LimeCheck frame={frame} start={S.joinedAt + 2} size={30} />
          <Body>{S.copy.joined}</Body>
        </div>
      </div>
    </Glass>
  );
};

export const ConciergeHandoff: React.FC = () => (
  <Stack y={S.stackY}>
    <QueryBubble text={S.query.text} enter={S.query.enter} exit={EXIT.query} dimAt={S.card.enter} tint={S.queryTint} />
    <HandoffCard />
  </Stack>
);
