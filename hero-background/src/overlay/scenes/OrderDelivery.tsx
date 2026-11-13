import type React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { PRIMITIVES, SCENES, STACK, THEME, exitTiming, queryLabel } from "../config";
import { type ItemMotion, floatY, itemMotion, stackLayout, stackTransform } from "../motion";
import { PillPop, RollingDetail, RouteDraw, SegmentedBar, TagTicks, wipeInset } from "../primitives";
import { Body, Glass, Label, QueryBubble, Stack, Title } from "../ui";

const S = SCENES.retail;
const EXIT = exitTiming(S.exitEnd);
const ROUTE = { width: 200, height: 48, d: "M 12 36 Q 100 -8 188 36" };

const Place: React.FC<{ name: string }> = ({ name }) => (
  <Title style={{ fontSize: 18, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{name}</Title>
);

const OrderCard: React.FC<{ frame: number; fps: number; motion: ItemMotion; y: number; clipTop: number }> = ({
  frame,
  fps,
  motion,
  y,
  clipTop,
}) => (
  <Glass
    variant="action"
    tint={S.tint}
    width={STACK.width}
    height={S.card.height}
    transform={stackTransform(y, motion.scale)}
    fade={motion.fade}
    clipRight={wipeInset(frame, S.wipe.start, STACK.width)}
    clipTop={clipTop}
    surfaceStyle={{ padding: 18, display: "flex", flexDirection: "column" }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 26 }}>
      <Label>{S.copy.label}</Label>
      <PillPop frame={frame} fps={fps} at={S.badgeAt} small>
        {S.copy.badge}
      </PillPop>
    </div>

    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, height: ROUTE.height }}>
      <Place name={S.copy.from} />
      <RouteDraw id="delivery-route" frame={frame} start={S.route.start} width={ROUTE.width} height={ROUTE.height} d={ROUTE.d} glyph="van" />
      <Place name={S.copy.to} />
    </div>

    <div style={{ borderTop: `1.5px dashed ${THEME.hairline}`, marginTop: 10 }} />

    <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1fr 1.4fr", marginTop: 10 }}>
      {S.copy.details.map((d, i) => (
        <RollingDetail key={d.label} frame={frame} label={d.label} value={d.value} start={S.details.start + i * S.details.stagger} />
      ))}
    </div>

    <div style={{ marginTop: "auto" }}>
      <SegmentedBar frame={frame} start={S.stages.start} filled={S.stages.filled} labels={S.copy.stages} />
    </div>
  </Glass>
);

const Tag: React.FC<{ frame: number; motion: ItemMotion; y: number; clipTop: number }> = ({ frame, motion, y, clipTop }) => (
  <Glass
    variant="action"
    tint={S.tint}
    width="fit"
    height={S.tag.height}
    radius={999}
    transform={stackTransform(y, motion.scale)}
    fade={motion.fade}
    clipTop={clipTop}
    surfaceStyle={{ padding: "0 18px 0 14px", display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}
  >
    <TagTicks frame={frame} start={S.tag.at + 8} />
    <Body style={{ lineHeight: 1.3 }}>{S.copy.tag}</Body>
  </Glass>
);

export const OrderDelivery: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const qm = itemMotion(frame, fps, S.query.enter, EXIT.query);
  const om = itemMotion(frame, fps, S.card.enter, EXIT.card);
  const tm = itemMotion(frame, fps, S.tag.at, EXIT.card, PRIMITIVES.tag.risePx);
  if (!qm.visible && !om.visible) return null;

  const [ql, ol, tl] = stackLayout([
    { p: qm.p, h: STACK.queryHeight, ownY: qm.ownY },
    { p: om.p, h: S.card.height, ownY: om.ownY },
    { p: tm.p, h: S.tag.height, ownY: tm.ownY },
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
      {om.visible ? <OrderCard frame={frame} fps={fps} motion={om} y={-ol.offset + om.ownY + float} clipTop={ol.clipTop} /> : null}
      {tm.visible ? <Tag frame={frame} motion={tm} y={-tl.offset + tm.ownY + float} clipTop={tl.clipTop} /> : null}
    </Stack>
  );
};
