import type React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { LINES, MOTION, PRIMITIVES, SCENES, STACK, STEP_GAP, STEP_ROW, THEME, queryLabel } from "../config";
import { grownHeight, queryDim, rowAppear, stackExit, stackLayout, stackVisible, timeOf } from "../motion";
import { Orb, PillPop, ShieldDraw, StepRow } from "../primitives";
import { Body, Glass, Label, QueryBubble, Stack, Title } from "../ui";

const S = SCENES.insurance;
const B = S.beats;
const STEPS = [
  { label: S.steps[0], appearAt: B.step1, done: B.step1Done },
  { label: S.steps[1], appearAt: B.step2, done: B.step2Done },
];
const GROWTH = [
  { at: B.step1, grow: S.card.step1Grow },
  { at: B.step2, grow: S.card.step2Grow },
  { at: B.pill, grow: S.card.pillGrow },
  { at: B.detail, grow: S.card.detailGrow },
];
/** The pill fades in with its row; its check draws once the row has grown in. */
const PILL_CHECK = B.pill + MOTION.grow.duration + PRIMITIVES.pill.checkDelay;

/** The AI concierge opens the claim itself; the card grows upward as each beat arrives. */
const ClaimContent: React.FC<{ t: number }> = ({ t }) => (
  <>
    <div style={{ display: "flex", alignItems: "center", gap: 8, height: 20 }}>
      <Orb />
      <Label>{S.copy.label}</Label>
    </div>
    <Title style={{ marginTop: 6, height: LINES.title }}>{S.copy.title}</Title>

    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, height: 44 }}>
      <ShieldDraw t={t} start={B.shield} size={40} />
      <div>
        <Label>{S.copy.policyLabel}</Label>
        <Body>{S.copy.policy}</Body>
      </div>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: STEP_GAP, marginTop: 10 }}>
      {STEPS.map((s) => (
        <StepRow key={s.label} t={t} label={s.label} appearAt={s.appearAt} spinStart={s.appearAt} done={s.done} height={STEP_ROW} />
      ))}
    </div>

    <div style={{ marginTop: 10, height: 28, display: "flex", ...rowAppear(t, B.pill) }}>
      <PillPop t={t} at={B.pill} checkAt={PILL_CHECK}>
        {S.copy.confirmed}
      </PillPop>
    </div>

    <div style={{ marginTop: 6, height: LINES.body, ...rowAppear(t, B.detail) }}>
      <Body color={THEME.textSecondary}>{S.copy.detail}</Body>
    </div>
  </>
);

export const InsuranceClaim: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = timeOf(frame, fps);
  if (!stackVisible(t, B.query, B.exit)) return null;

  const cardHeight = grownHeight(t, S.card.height, GROWTH);
  const [q, c] = stackLayout(t, [
    { enter: B.query, height: S.queryHeight },
    { enter: B.card, height: cardHeight },
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
          height={cardHeight}
          y={c.y + exit.y}
          opacity={c.opacity * exit.opacity}
          textOpacity={c.textOpacity}
          surfaceStyle={{ padding: `${THEME.card.padY}px ${THEME.card.padX}px` }}
        >
          <ClaimContent t={t} />
        </Glass>
      ) : null}
    </Stack>
  );
};
