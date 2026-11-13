import type React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { SCENES, STACK, THEME, queryLabel } from "../config";
import { crossfade, queryDim, stackExit, stackLayout, stackVisible, timeOf } from "../motion";
import { CheckDraw, LimeButton, LimeIcon, RingDraw, SkeletonLines } from "../primitives";
import { Body, Glass, Label, QueryBubble, Stack, Title } from "../ui";

const S = SCENES.travel;
const B = S.beats;
const BODY_HEIGHT = 96;
const ROW = { width: STACK.width - 2 * 20, height: 44, gap: 8, radius: 12 };

const layer: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const CardContent: React.FC<{ t: number }> = ({ t }) => (
  <>
    <div style={{ display: "flex", alignItems: "center", gap: 10, height: 22 }}>
      <LimeIcon />
      <Label>{S.copy.label}</Label>
      <div style={{ flex: 1 }} />
      <Label>{S.copy.time}</Label>
    </div>

    <div style={{ position: "relative", height: BODY_HEIGHT, marginTop: 10 }}>
      {/* 1. Delay message */}
      <div style={{ ...layer, ...crossfade(t, null, B.loading) }}>
        <Body>{S.copy.delayed}</Body>
      </div>

      {/* 2. Loading: static skeleton lines + status */}
      <div style={{ ...layer, gap: 12, ...crossfade(t, B.loading, B.options) }}>
        <SkeletonLines />
        <Body color={THEME.textSecondary}>{S.copy.finding}</Body>
      </div>

      {/* 3. Option rows: a lime ring draws around the first row, then Rebook is pressed */}
      <div style={{ ...layer, gap: ROW.gap, ...crossfade(t, B.options, B.confirmed) }}>
        <div style={{ position: "relative", height: ROW.height }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: ROW.radius, background: THEME.subtleFill }} />
          <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "center", padding: "0 6px 0 14px" }}>
            <Body style={{ flex: 1, whiteSpace: "nowrap" }}>{S.copy.option1}</Body>
            <LimeButton t={t} pressAt={B.press}>
              {S.copy.rebook}
            </LimeButton>
          </div>
          <RingDraw t={t} at={B.ring} width={ROW.width} height={ROW.height} radius={ROW.radius} />
        </div>
        <div style={{ height: ROW.height, borderRadius: ROW.radius, background: THEME.subtleFill, display: "flex", alignItems: "center", padding: "0 14px" }}>
          <Body>{S.copy.option2}</Body>
        </div>
      </div>

      {/* 4. Confirmed: the new booking fades in, then the check draws */}
      <div style={{ ...layer, flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 14, ...crossfade(t, B.confirmed, null) }}>
        <CheckDraw t={t} start={B.check} size={36} />
        <div>
          <Title>{S.copy.confirmed}</Title>
          <Body color={THEME.textSecondary}>{S.copy.confirmedDetail}</Body>
        </div>
      </div>
    </div>
  </>
);

export const TravelUpdate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = timeOf(frame, fps);
  if (!stackVisible(t, B.query, B.exit)) return null;

  const [q, c] = stackLayout(t, [
    { enter: B.query, height: S.queryHeight },
    { enter: B.card, height: S.card.height },
  ]);
  const exit = stackExit(t, B.exit);

  return (
    <Stack bottom={S.stackBottom}>
      <QueryBubble
        label={queryLabel(S.industry)}
        text={S.query.text}
        tint={S.queryTint}
        height={S.queryHeight}
        y={q.y + exit.y}
        opacity={q.opacity * queryDim(t, B.card) * exit.opacity}
        textOpacity={q.textOpacity}
      />
      {t >= B.card ? (
        <Glass
          variant="action"
          tint={S.tint}
          width={STACK.width}
          height={S.card.height}
          y={c.y + exit.y}
          opacity={c.opacity * exit.opacity}
          textOpacity={c.textOpacity}
          surfaceStyle={{ padding: `${THEME.card.padY}px ${THEME.card.padX}px` }}
        >
          <CardContent t={t} />
        </Glass>
      ) : null}
    </Stack>
  );
};
