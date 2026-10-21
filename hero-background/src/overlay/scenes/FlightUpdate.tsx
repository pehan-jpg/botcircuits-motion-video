import type React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { SCENES, STACK, THEME, exitTiming } from "../config";
import { inter } from "../fonts";
import { type ItemMotion, floatY, itemMotion, lerp, pressScale, ramp, stackLayout, stackTransform, swap } from "../motion";
import { Body, DotLoader, Glass, Label, LimeCheck, LimeIcon, QueryBubble, Ripple, Shimmer, Stack, Title } from "../ui";

const S = SCENES.flight;
const EXIT = exitTiming(S.exitEnd);
const BODY_HEIGHT = 128;
const ROW_HEIGHT = 56;

const layer: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const ActionCard: React.FC<{ frame: number; motion: ItemMotion; y: number; clipTop: number }> = ({ frame, motion, y, clipTop }) => {
  const b = S.beats;
  const highlight = ramp(frame, b.highlight, 12);
  const rebook = ramp(frame, b.rebookAppear, 10);

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
        {/* 1. Delay message */}
        <div style={{ ...layer, ...swap(frame, S.card.enter - 10, b.loading) }}>
          <Body>{S.copy.delayed}</Body>
        </div>

        {/* 2. Skeleton + loader */}
        <div style={{ ...layer, gap: 12, ...swap(frame, b.loading, b.options) }}>
          <Shimmer frame={frame} width="100%" />
          <Shimmer frame={frame + 12} width="68%" />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
            <DotLoader frame={frame} />
            <Body color={THEME.textSecondary}>{S.copy.finding}</Body>
          </div>
        </div>

        {/* 3. Options */}
        <div style={{ ...layer, gap: 12, ...swap(frame, b.options, b.confirmed, 12, 18) }}>
          <div
            style={{
              position: "relative",
              height: ROW_HEIGHT,
              borderRadius: 14,
              background: THEME.subtleFill,
              display: "flex",
              alignItems: "center",
              padding: "0 9px 0 16px",
              overflow: "hidden",
            }}
          >
            <Body style={{ flex: 1, whiteSpace: "nowrap" }}>{S.copy.option1}</Body>
            <Ripple frame={frame} at={b.ripple} x={110} y={ROW_HEIGHT / 2} size={220} />
            <div
              style={{
                height: 38,
                padding: "0 16px",
                borderRadius: 19,
                background: THEME.lime,
                color: THEME.onLime,
                fontFamily: inter,
                fontSize: THEME.type.button.size,
                fontWeight: THEME.type.button.weight,
                display: "flex",
                alignItems: "center",
                opacity: rebook,
                translate: `${(8 * (1 - rebook)).toFixed(2)}px 0px`,
                scale: String(pressScale(frame, b.press)),
              }}
            >
              {S.copy.rebook}
            </div>
            <Ripple frame={frame} at={b.press} x={350} y={ROW_HEIGHT / 2} size={140} duration={16} />
          </div>
          {/* Lime ring highlighting the first row */}
          <div
            style={{
              position: "absolute",
              left: -3,
              right: -3,
              top: (BODY_HEIGHT - (ROW_HEIGHT * 2 + 12)) / 2 - 3,
              height: ROW_HEIGHT + 6,
              borderRadius: 17,
              border: `2px solid ${THEME.lime}`,
              opacity: highlight,
              scale: String(lerp(1.03, 1, highlight)),
            }}
          />
          <div
            style={{
              height: ROW_HEIGHT,
              borderRadius: 14,
              background: THEME.subtleFill,
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
            }}
          >
            <Body>{S.copy.option2}</Body>
          </div>
        </div>

        {/* 4. Confirmed: circle at `confirmed`, check drawn by `confirmed + 16` */}
        <div style={{ ...layer, flexDirection: "row", alignItems: "center", gap: 16, ...swap(frame, b.confirmed, null, 12, 18) }}>
          <LimeCheck frame={frame} start={b.confirmed} size={44} drawFrames={12} />
          <div>
            <Title>{S.copy.confirmed}</Title>
            <Body color={THEME.textSecondary}>{S.copy.confirmedDetail}</Body>
          </div>
        </div>
      </div>
    </Glass>
  );
};

export const FlightUpdate: React.FC = () => {
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
      <QueryBubble frame={frame} text={S.query.text} enter={S.query.enter} dimAt={S.card.enter} tint={S.queryTint} motion={qm} y={-ql.offset + qm.ownY + float} />
      {cm.visible ? <ActionCard frame={frame} motion={cm} y={-cl.offset + cm.ownY + float} clipTop={cl.clipTop} /> : null}
    </Stack>
  );
};
