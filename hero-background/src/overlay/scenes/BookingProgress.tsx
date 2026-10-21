import type React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENES, THEME } from "../config";
import { cardMotion, clamp, lerp, progressEase, ramp, swap } from "../motion";
import { Body, DrawnCheck, Glass, Label, LimeCheck, Spinner, Title } from "../ui";

const S = SCENES.booking;
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
          <LimeCheck frame={frame} start={morphAt + 2} size={ICON} drawFrames={10} />
        </div>
      </div>
      <Body>{label}</Body>
    </div>
  );
};

export const BookingProgress: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { visible, transform, fade } = cardMotion(frame, fps, S.enter, S.exit, S.enterFrom);
  if (!visible) return null;

  const progress = interpolate(frame, [S.enter, S.progressEnd], [0, 1], { ...clamp, easing: progressEase });
  const footer = ramp(frame, S.footerAt, 12);

  return (
    <Glass
      x={S.x}
      y={S.y}
      width={S.width}
      transform={transform}
      fade={fade}
      surfaceStyle={{ padding: "26px 24px 22px", overflow: "hidden" }}
    >
      {/* Thin progress bar along the top edge */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 4, background: "rgba(18, 22, 27, 0.06)" }}>
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

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {S.steps.map((step) => (
          <Step key={step.label} frame={frame} label={step.label} start={step.start} end={step.end} />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 16,
          opacity: footer,
          translate: `0px ${(8 * (1 - footer)).toFixed(2)}px`,
        }}
      >
        <DrawnCheck progress={ramp(frame, S.footerAt + 2, 12)} size={18} color={THEME.text} strokeWidth={3} />
        <Label>{S.copy.footer}</Label>
      </div>
    </Glass>
  );
};
