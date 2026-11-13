import type React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { PRIMITIVES, SCENES, STACK, THEME, queryLabel } from "../config";
import { queryDim, stackExit, stackLayout, stackVisible, timeOf } from "../motion";
import { PillPop, RollingDetail, RouteDraw, SegmentedBar, TagTicks } from "../primitives";
import { Body, Glass, Label, QueryBubble, Stack, TEXT_CLASS, textBase } from "../ui";

const S = SCENES.retail;
const B = S.beats;
const ROUTE = { width: 200, height: 44, d: "M 12 32 Q 100 -6 188 32" };

const Place: React.FC<{ name: string }> = ({ name }) => (
  <div
    className={TEXT_CLASS}
    style={{ ...textBase, fontSize: 16, fontWeight: 600, lineHeight: "20px", letterSpacing: "0.06em", textTransform: "uppercase", color: THEME.text }}
  >
    {name}
  </div>
);

/** The card arrives with all of its content in place; inner animations start once it has settled. */
const OrderContent: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 24 }}>
      <Label>{S.copy.label}</Label>
      <PillPop t={t} at={B.badge} small>
        {S.copy.badge}
      </PillPop>
    </div>

    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, height: ROUTE.height }}>
      <Place name={S.copy.from} />
      <RouteDraw id="delivery-route" t={t} start={B.route} width={ROUTE.width} height={ROUTE.height} d={ROUTE.d} glyph="van" />
      <Place name={S.copy.to} />
    </div>

    <div style={{ height: 1, marginTop: 10, borderTop: `1px dashed ${THEME.hairline}` }} />

    <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1fr 1.4fr", marginTop: 10, height: 42 }}>
      {S.copy.details.map((d, i) => (
        <RollingDetail key={d.label} t={t} label={d.label} value={d.value} start={B.details + i * PRIMITIVES.digitRoll.groupStagger} valueHeight={25} />
      ))}
    </div>

    <div style={{ marginTop: 12, height: 26 }}>
      <SegmentedBar t={t} start={B.segments} filled={S.stagesFilled} labels={S.copy.stages} />
    </div>
  </div>
);

export const OrderDelivery: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = timeOf(frame, fps);
  if (!stackVisible(t, B.query, B.exit)) return null;

  const [q, c, g] = stackLayout(t, [
    { enter: B.query, height: S.queryHeight },
    { enter: B.card, height: S.card.height },
    { enter: B.tag, height: S.tag.height },
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
          <OrderContent t={t} />
        </Glass>
      ) : null}
      {t >= B.tag ? (
        <Glass
          variant="action"
          tint={S.tint}
          width="fit"
          height={S.tag.height}
          radius={999}
          y={g.y + exit.y}
          opacity={g.opacity * exit.opacity}
          textOpacity={g.textOpacity}
          surfaceStyle={{ padding: "0 16px 0 12px", whiteSpace: "nowrap" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: "100%" }}>
            <TagTicks t={t} start={B.ticks} />
            <Body>{S.copy.tag}</Body>
          </div>
        </Glass>
      ) : null}
    </Stack>
  );
};
