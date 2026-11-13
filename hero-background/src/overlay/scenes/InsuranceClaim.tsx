import type React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { SCENES, STACK, THEME, exitTiming, queryLabel } from "../config";
import { type ItemMotion, floatY, grownHeight, itemMotion, stackLayout, stackTransform } from "../motion";
import { DetailRow, OrbPulse, PillPop, ShieldDraw, StepRow } from "../primitives";
import { Body, Glass, Label, QueryBubble, Stack, Title } from "../ui";

const S = SCENES.insurance;
const EXIT = exitTiming(S.exitEnd);
const GROWTH = [
  ...S.steps.map((s) => ({ at: s.start, grow: s.grow })),
  { at: S.confirmed.at, grow: S.confirmed.grow },
  { at: S.detail.at, grow: S.detail.grow },
];

/** The AI concierge opens the claim itself; the card grows upward as each beat arrives. */
const ClaimCard: React.FC<{ frame: number; fps: number; motion: ItemMotion; y: number; height: number; clipTop: number }> = ({
  frame,
  fps,
  motion,
  y,
  height,
  clipTop,
}) => (
  <Glass
    variant="action"
    tint={S.tint}
    width={STACK.width}
    height={height}
    transform={stackTransform(y, motion.scale)}
    fade={motion.fade}
    clipTop={clipTop}
    surfaceStyle={{ padding: 20 }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10, height: 20 }}>
      <OrbPulse frame={frame} />
      <Label>{S.copy.label}</Label>
    </div>
    <Title style={{ marginTop: 8, height: 31 }}>{S.copy.title}</Title>

    {/* Shield: outline draws, fills with a lime tint, then a check draws inside */}
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, height: 52 }}>
      <ShieldDraw frame={frame} start={S.shield.start} size={46} />
      <DetailRow frame={frame} at={S.shield.start + 6}>
        <Label>{S.copy.policyLabel}</Label>
        <Body style={{ marginTop: 2 }}>{S.copy.policy}</Body>
      </DetailRow>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
      {S.steps.map((step) => (
        <StepRow key={step.label} frame={frame} label={step.label} start={step.start} end={step.end} />
      ))}
    </div>

    <div style={{ marginTop: 14, height: 34, display: "flex" }}>
      <PillPop frame={frame} fps={fps} at={S.confirmed.at}>
        {S.copy.confirmed}
      </PillPop>
    </div>

    <DetailRow frame={frame} at={S.detail.at} style={{ marginTop: 8, height: 26 }}>
      <Body color={THEME.textSecondary} style={{ lineHeight: "26px" }}>
        {S.copy.detail}
      </Body>
    </DetailRow>
  </Glass>
);

export const InsuranceClaim: React.FC = () => {
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
      <QueryBubble
        frame={frame}
        label={queryLabel(S.industry)}
        text={S.query.text}
        enter={S.query.enter}
        dimAt={S.card.enter}
        tint={S.queryTint}
        motion={qm}
        y={-ql.offset + qm.ownY + float}
      />
      {cm.visible ? (
        <ClaimCard frame={frame} fps={fps} motion={cm} y={-cl.offset + cm.ownY + float} height={cardHeight} clipTop={cl.clipTop} />
      ) : null}
    </Stack>
  );
};
