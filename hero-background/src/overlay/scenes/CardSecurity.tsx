import type React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { LINES, SCENES, STACK, STEP_GAP, STEP_ROW, THEME, queryLabel } from "../config";
import { grownHeight, queryDim, rowAppear, stackExit, stackLayout, stackVisible, timeOf } from "../motion";
import { CheckDraw, StepProgressBar, StepRow, spinnerDoneEnd } from "../primitives";
import { Body, Glass, QueryBubble, Stack, Title } from "../ui";

const S = SCENES.banking;
const B = S.beats;

/** Each step: when its row appears (null = arrives with the card), when its spinner starts and completes. */
const STEPS = [
  { label: S.steps[0], appearAt: null, spinStart: B.card, done: B.step1Done },
  { label: S.steps[1], appearAt: B.step2, spinStart: B.step2, done: B.step2Done },
  { label: S.steps[2], appearAt: B.step3, spinStart: B.step3, done: B.step3Done },
];
const GROWTH = [
  { at: B.step2, grow: S.card.stepGrow },
  { at: B.step3, grow: S.card.stepGrow },
  { at: B.footer, grow: S.card.footerGrow },
];
const BAR = STEPS.map((s) => ({ start: s.spinStart, end: spinnerDoneEnd(s.done) }));

const CardContent: React.FC<{ t: number }> = ({ t }) => (
  <>
    <StepProgressBar t={t} steps={BAR} />
    <Title style={{ height: LINES.title }}>{S.copy.title}</Title>
    <div style={{ display: "flex", flexDirection: "column", gap: STEP_GAP, marginTop: 10 }}>
      {STEPS.map((s) => (
        <StepRow key={s.label} t={t} label={s.label} appearAt={s.appearAt} spinStart={s.spinStart} done={s.done} height={STEP_ROW} />
      ))}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 12, height: LINES.body, marginTop: 10, ...rowAppear(t, B.footer) }}>
      <div style={{ width: 22, display: "flex", justifyContent: "center", flexShrink: 0 }}>
        <CheckDraw t={t} start={B.footerCheck} size={18} />
      </div>
      <Body color={THEME.textSecondary} style={{ whiteSpace: "nowrap" }}>
        {S.copy.footer}
      </Body>
    </div>
  </>
);

export const CardSecurity: React.FC = () => {
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
          <CardContent t={t} />
        </Glass>
      ) : null}
    </Stack>
  );
};
