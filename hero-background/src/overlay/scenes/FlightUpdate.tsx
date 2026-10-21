import type React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { SCENES, THEME } from "../config";
import { inter } from "../fonts";
import { cardMotion, lerp, pressScale, ramp, swap } from "../motion";
import { Body, DotLoader, Glass, Label, LimeCheck, LimeIcon, Ripple, Shimmer, Title } from "../ui";

const S = SCENES.flight;
const BODY_HEIGHT = 128;
const ROW_HEIGHT = 56;

const layer: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

export const FlightUpdate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { visible, transform, fade } = cardMotion(frame, fps, S.enter, S.exit, S.enterFrom);
  if (!visible) return null;

  const b = S.beats;
  const highlight = ramp(frame, b.highlight, 12);
  const rebook = ramp(frame, b.rebookAppear, 10);

  return (
    <Glass x={S.x} y={S.y} width={S.width} transform={transform} fade={fade} surfaceStyle={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <LimeIcon />
        <Label color={THEME.text}>{S.copy.label}</Label>
        <div style={{ flex: 1 }} />
        <Label>{S.copy.time}</Label>
      </div>

      <div style={{ position: "relative", height: BODY_HEIGHT, marginTop: 16 }}>
        {/* 1. Delay message */}
        <div style={{ ...layer, ...swap(frame, S.enter - 10, b.loading) }}>
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
              padding: "0 10px 0 18px",
              overflow: "hidden",
            }}
          >
            <Body style={{ flex: 1 }}>{S.copy.option1}</Body>
            <Ripple frame={frame} at={b.ripple} x={120} y={ROW_HEIGHT / 2} size={220} />
            <div
              style={{
                height: 38,
                padding: "0 18px",
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
            <Ripple frame={frame} at={b.press} x={400} y={ROW_HEIGHT / 2} size={140} duration={16} />
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
              padding: "0 18px",
            }}
          >
            <Body>{S.copy.option2}</Body>
          </div>
        </div>

        {/* 4. Confirmed */}
        <div style={{ ...layer, flexDirection: "row", alignItems: "center", gap: 16, ...swap(frame, b.confirmed + 2, null, 12, 18) }}>
          <LimeCheck frame={frame} start={b.confirmed + 2} size={44} />
          <div>
            <Title>{S.copy.confirmed}</Title>
            <Body color={THEME.textSecondary}>{S.copy.confirmedDetail}</Body>
          </div>
        </div>
      </div>
    </Glass>
  );
};
