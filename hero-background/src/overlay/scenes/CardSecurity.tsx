import type React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { SCENES, STACK, THEME, exitTiming, queryLabel } from "../config";
import { type ItemMotion, floatY, grownHeight, itemMotion, stackLayout, stackTransform } from "../motion";
import { CheckDraw, DetailRow, StepProgressBar, StepRow } from "../primitives";
import { Body, Glass, QueryBubble, Stack, Title } from "../ui";

const S = SCENES.banking;
const EXIT = exitTiming(S.exitEnd);
const GROWTH = [...S.steps.map((s) => ({ at: s.start, grow: s.grow })), { at: S.footer.at, grow: S.footer.grow }];

/** Steps card: grows upward as each step and the footer arrive. */
const StepsCard: React.FC<{ frame: number; fps: number; motion: ItemMotion; y: number; height: number; clipTop: number }> = ({
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
    surfaceStyle={{ padding: "22px 20px 18px" }}
  >
    <StepProgressBar frame={frame} steps={S.steps} />

    <Title style={{ height: 31 }}>{S.copy.title}</Title>

    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
      {S.steps.map((step) => (
        <StepRow key={step.label} frame={frame} label={step.label} start={step.start} end={step.end} />
      ))}
    </div>

    <DetailRow frame={frame} at={S.footer.at} style={{ display: "flex", alignItems: "center", gap: 10, height: 26, marginTop: 14 }}>
      <CheckDraw frame={frame} fps={fps} start={S.footer.at} size={20} />
      <Body color={THEME.textSecondary} style={{ whiteSpace: "nowrap" }}>
        {S.copy.footer}
      </Body>
    </DetailRow>
  </Glass>
);

export const CardSecurity: React.FC = () => {
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
        <StepsCard frame={frame} fps={fps} motion={cm} y={-cl.offset + cm.ownY + float} height={cardHeight} clipTop={cl.clipTop} />
      ) : null}
    </Stack>
  );
};
