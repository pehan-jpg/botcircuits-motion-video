import type React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { SCENES, STACK, THEME, exitTiming, queryLabel } from "../config";
import { type ItemMotion, floatY, itemMotion, stackLayout, stackTransform, textRoll } from "../motion";
import { CheckDraw, LimeButton, LimeIcon, RingDraw, SkeletonShimmer, TapRipple, WaveLoader } from "../primitives";
import { Body, Glass, Label, QueryBubble, Stack, Title } from "../ui";

const S = SCENES.travel;
const EXIT = exitTiming(S.exitEnd);
const BODY_HEIGHT = 128;
const ROW = { width: STACK.width - 40, height: 56, gap: 12, radius: 14 };

const layer: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const ActionCard: React.FC<{ frame: number; fps: number; motion: ItemMotion; y: number; clipTop: number }> = ({
  frame,
  fps,
  motion,
  y,
  clipTop,
}) => {
  const b = S.beats;
  return (
    <Glass
      variant="action"
      tint={S.tint}
      width={STACK.width}
      height={S.card.height}
      transform={stackTransform(y, motion.scale)}
      fade={motion.fade}
      clipTop={clipTop}
      surfaceStyle={{ padding: 20 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <LimeIcon />
        <Label>{S.copy.label}</Label>
        <div style={{ flex: 1 }} />
        <Label>{S.copy.time}</Label>
      </div>

      <div style={{ position: "relative", height: BODY_HEIGHT, marginTop: 14 }}>
        {/* 1. Delay message, rolls out into the loader */}
        <div style={{ ...layer, ...textRoll(frame, null, b.loading) }}>
          <Body>{S.copy.delayed}</Body>
        </div>

        {/* 2. Skeleton shimmer + wave loader */}
        <div style={{ ...layer, gap: 12, ...textRoll(frame, b.loading, b.options) }}>
          <SkeletonShimmer frame={frame} start={b.loading} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <WaveLoader frame={frame} />
            <Body color={THEME.textSecondary}>{S.copy.finding}</Body>
          </div>
        </div>

        {/* 3. Option rows: tap ripple on the first row, then a lime ring draws around it */}
        <div style={{ ...layer, gap: ROW.gap, ...textRoll(frame, b.options, b.confirmed) }}>
          <div style={{ position: "relative", height: ROW.height }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: ROW.radius, background: THEME.subtleFill, overflow: "hidden" }}>
              <TapRipple frame={frame} at={b.ripple} x={120} y={ROW.height / 2} />
            </div>
            <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", padding: "0 9px 0 16px" }}>
              <Body style={{ flex: 1, whiteSpace: "nowrap" }}>{S.copy.option1}</Body>
              <LimeButton frame={frame} pressAt={b.press}>
                {S.copy.rebook}
              </LimeButton>
            </div>
            <RingDraw frame={frame} at={b.ring} width={ROW.width} height={ROW.height} radius={ROW.radius} />
          </div>
          <div style={{ height: ROW.height, borderRadius: ROW.radius, background: THEME.subtleFill, display: "flex", alignItems: "center", padding: "0 16px" }}>
            <Body>{S.copy.option2}</Body>
          </div>
        </div>

        {/* 4. Confirmed: check draw, text rolls to the new booking */}
        <div style={{ ...layer, flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 16, ...textRoll(frame, b.confirmed, null) }}>
          <CheckDraw frame={frame} fps={fps} start={b.confirmed} size={44} />
          <div>
            <Title>{S.copy.confirmed}</Title>
            <Body color={THEME.textSecondary}>{S.copy.confirmedDetail}</Body>
          </div>
        </div>
      </div>
    </Glass>
  );
};

export const TravelUpdate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const qm = itemMotion(frame, fps, S.query.enter, EXIT.query);
  const cm = itemMotion(frame, fps, S.card.enter, EXIT.card);
  if (!qm.visible && !cm.visible) return null;

  const [ql, cl] = stackLayout([
    { p: qm.p, h: STACK.queryHeight, ownY: qm.ownY },
    { p: cm.p, h: S.card.height, ownY: cm.ownY },
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
      {cm.visible ? <ActionCard frame={frame} fps={fps} motion={cm} y={-cl.offset + cm.ownY + float} clipTop={cl.clipTop} /> : null}
    </Stack>
  );
};
