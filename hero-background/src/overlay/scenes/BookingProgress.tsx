import type React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SCENES, STACK, THEME, exitTiming } from "../config";
import {
  type ItemMotion,
  clamp,
  floatY,
  grownHeight,
  itemMotion,
  lerp,
  progressEase,
  ramp,
  stackLayout,
  stackTransform,
  swap,
} from "../motion";
import { Body, DrawnCheck, Glass, Label, LimeCheck, QueryBubble, Spinner, Stack, Title } from "../ui";

const S = SCENES.booking;
const EXIT = exitTiming(S.exitEnd);
const ICON = 26;
const GROWTH = [...S.steps.map((s) => ({ at: s.start, grow: s.grow })), { at: S.footer.at, grow: S.footer.grow }];

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

/** Grows upward: the bottom stays in its slot while new rows are revealed beneath the title. */
const ActionCard: React.FC<{ frame: number; motion: ItemMotion; y: number; height: number; clipTop: number }> = ({
  frame,
  motion,
  y,
  height,
  clipTop,
}) => {
  const progress = interpolate(frame, [S.card.enter, S.progressEnd], [0, 1], { ...clamp, easing: progressEase });
  const footer = ramp(frame, S.footer.at, 12);

  return (
    <Glass
      variant="action"
      tint={S.tint}
      width={STACK.width}
      height={height}
      transform={stackTransform(y, motion.scale)}
      fade={motion.fade}
      clipTop={clipTop}
      surfaceStyle={{ padding: "22px 20px 18px" }}
    >
      {/* Thin progress bar along the top edge */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 4, background: THEME.subtleFill }}>
        <div style={{ width: "100%", height: "100%", background: THEME.lime, transformOrigin: "0 50%", scale: `${progress} 1` }} />
      </div>

      <Title style={{ height: 31 }}>{S.copy.title}</Title>

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
          height: 18,
          marginTop: 14,
          opacity: footer,
          translate: `0px ${(8 * (1 - footer)).toFixed(2)}px`,
        }}
      >
        <DrawnCheck progress={ramp(frame, S.footer.at + 2, 12)} size={18} color={THEME.lime} strokeWidth={3} />
        <Label>{S.copy.footer}</Label>
      </div>
    </Glass>
  );
};

export const BookingProgress: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const qm = itemMotion(frame, fps, S.query.enter, EXIT.query);
  const cm = itemMotion(frame, fps, S.card.enter, EXIT.card);
  if (!qm.visible && !cm.visible) return null;

  const cardHeight = grownHeight(frame, fps, S.card.height, GROWTH);
  const [ql, cl] = stackLayout([
    { p: qm.p, h: STACK.queryHeight, ownY: qm.ownY },
    { p: cm.p, h: cardHeight, ownY: cm.ownY },
  ]);
  const float = floatY(frame, S.query.enter);

  return (
    <Stack bottom={S.stackBottom}>
      <QueryBubble frame={frame} text={S.query.text} enter={S.query.enter} dimAt={S.card.enter} tint={S.queryTint} motion={qm} y={-ql.offset + qm.ownY + float} />
      {cm.visible ? <ActionCard frame={frame} motion={cm} y={-cl.offset + cm.ownY + float} height={cardHeight} clipTop={cl.clipTop} /> : null}
    </Stack>
  );
};
