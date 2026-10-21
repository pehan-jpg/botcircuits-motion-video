import type React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENES, STACK, THEME, exitTiming } from "../config";
import { cardMotion, clamp, lerp, progressEase, ramp, swap } from "../motion";
import { Body, DrawnCheck, Glass, Label, LimeCheck, QueryBubble, Spinner, Stack, Title } from "../ui";

const S = SCENES.booking;
const EXIT = exitTiming(S.exitEnd);
const ICON = 26;

const Step: React.FC<{ frame: number; label: string; start: number; end: number }> = ({ frame, label, start, end }) => {
  const morphAt = end - S.morphFrames;
  const spinnerOut = ramp(frame, morphAt, 6);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, height: 30, ...swap(frame, start, null, 10, 10) }}>
      <div style={{ position: "relative", width: ICON, height: ICON, flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - spinnerOut, scale: String(lerp(1, 0.6, spinnerOut)) }}>
          <Spinner frame={frame} size={ICON} />
        </div>
        <div style={{ position: "absolute", inset: 0 }}>
          <LimeCheck frame={frame} start={morphAt + 2} size={ICON} drawFrames={8} />
        </div>
      </div>
      <Body style={{ whiteSpace: "nowrap" }}>{label}</Body>
    </div>
  );
};

const ActionCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { visible, transform, fade } = cardMotion(frame, fps, S.card.enter, EXIT.card, S.card.enterFrom, S.query.enter);
  if (!visible) return null;

  const progress = interpolate(frame, [S.card.enter, S.progressEnd], [0, 1], { ...clamp, easing: progressEase });
  const footer = ramp(frame, S.footerAt, 12);

  return (
    <Glass
      variant="action"
      tint={S.tint}
      width={STACK.width}
      transform={transform}
      fade={fade}
      surfaceStyle={{ padding: "22px 20px 18px", overflow: "hidden" }}
    >
      {/* Thin progress bar along the top edge */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 4, background: THEME.subtleFill }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            background: THEME.lime,
            transformOrigin: "0 50%",
            scale: `${progress} 1`,
          }}
        />
      </div>

      <Title>{S.copy.title}</Title>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
        {S.steps.map((step) => (
          <Step key={step.label} frame={frame} label={step.label} start={step.start} end={step.end} />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 14,
          opacity: footer,
          translate: `0px ${(8 * (1 - footer)).toFixed(2)}px`,
        }}
      >
        <DrawnCheck progress={ramp(frame, S.footerAt + 2, 12)} size={18} color={THEME.lime} strokeWidth={3} />
        <Label>{S.copy.footer}</Label>
      </div>
    </Glass>
  );
};

export const BookingProgress: React.FC = () => (
  <Stack y={S.stackY}>
    <QueryBubble text={S.query.text} enter={S.query.enter} exit={EXIT.query} dimAt={S.card.enter} tint={S.queryTint} />
    <ActionCard />
  </Stack>
);
