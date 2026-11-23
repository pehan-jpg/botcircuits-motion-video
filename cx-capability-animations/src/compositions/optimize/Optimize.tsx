import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ALERT_CARD, AlertCard, alertCardHeight} from '../../components/AlertCard';
import {BubbleChart, bubbleDiameter, clusterOffset} from '../../components/BubbleChart';
import {Card} from '../../components/Card';
import {Chip} from '../../components/Chip';
import {ConnectionLine, fanCurve} from '../../components/ConnectionLine';
import {ProcedureCard} from '../../components/ProcedureCard';
import {RolledOutPill} from '../../components/RolledOutPill';
import {BadgeSwap} from '../../components/StatusBadge';
import {StepRow} from '../../components/StepRow';
import {TrafficBar} from '../../components/TrafficBar';
import {VariantPanel} from '../../components/VariantPanel';
import {Rect, Veil, veilState} from '../../components/Veil';
import {HEIGHT, WIDTH} from '../../config';
import {mix, progress} from '../../motion';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {
  ALERT,
  ALERT_TOPIC,
  BOARD,
  DRAFT,
  NEW_CHIP,
  NEW_STEP,
  PROCEDURE_TITLE,
  SAVED,
  STEPS,
  TOPICS,
  TOPICS_RANGE,
  TOPICS_TITLE,
} from './content';
import {OPTIMIZE_TIMELINE as T} from './timeline';

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

const HEADER = 72;
const TOPICS_CARD: Rect = {x: 100, y: (HEIGHT - 640) / 2, width: 680, height: 640, radius: 20};
const CHART = {width: TOPICS_CARD.width - 2, height: TOPICS_CARD.height - HEADER - 2, maxDiameter: 232};
const SIDE_CARD: Rect = {x: 840, y: TOPICS_CARD.y, width: 660, height: alertCardHeight, radius: 20};
const BOARD_RECT: Rect = {x: 200, y: (HEIGHT - 640) / 2, width: 1200, height: 640, radius: 20};
const PART2_BOUNDS: Rect = {
  x: TOPICS_CARD.x,
  y: TOPICS_CARD.y,
  width: SIDE_CARD.x + SIDE_CARD.width - TOPICS_CARD.x,
  height: TOPICS_CARD.height,
  radius: 20,
};

/* Board interior */
const BAR_W = 1000;
const PANEL = {width: 560, height: 360, gap: 40};
const BAR_TOP = HEADER + 63;
const PANELS_TOP = BAR_TOP + 38 + 40;

/* Line from the Refunds bubble's right edge to the alert card. */
const maxShare = Math.max(...TOPICS.map((t) => t.share));
const sized = TOPICS.map((t) => ({...t, d: bubbleDiameter(t.share, maxShare, CHART.maxDiameter)}));
const off = clusterOffset(sized, CHART.width, CHART.height);
const refunds = sized[ALERT_TOPIC];
const LINE = fanCurve(
  {x: TOPICS_CARD.x + 1 + refunds.x + off.dx + refunds.d / 2, y: TOPICS_CARD.y + HEADER + 1 + refunds.y + off.dy},
  {x: SIDE_CARD.x, y: SIDE_CARD.y + ALERT_CARD.pad + ALERT_CARD.badge + 16 + ALERT_CARD.titleLine / 2},
);

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export const Optimize: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const f = (s: number) => s * fps;
  const p = (a: number, b: number) => progress(frame, f(a), f(b));

  /* Part 1 */
  const topicsIn = p(T.topicsIn.start, T.topicsIn.end);
  const bubbleIn = TOPICS.map((_, i) => {
    const s = T.bubblesIn.start + i * T.bubblesIn.stagger;
    return p(s, s + T.bubblesIn.duration);
  });
  const alertAmount = p(T.refundsAlert.start, T.refundsAlert.start + T.refundsAlert.duration);
  const A = T.alertIn;
  const alertIn = p(A.start, A.start + A.duration);
  const reveal = [0, 1, 2, 3, 4].map((k) => {
    const s = A.blocksStart + k * A.blockStagger;
    return p(s, s + A.blockDuration);
  });
  const lineDraw = p(T.alertLine.start, T.alertLine.start + T.alertLine.duration);
  const P = T.applyPress;
  const press = p(P.start, P.start + P.down) * (1 - p(P.start + P.down, P.start + P.down + P.up));

  /* Part 2 */
  const veil1 = {start: f(T.veilToProcedure.start), end: f(T.veilToProcedure.start + T.veilToProcedure.duration)};
  const v1 = veilState(frame, veil1);
  const rowStart = (i: number) => Math.round(f(T.rows.start + i * T.rows.stagger));
  const N = T.newRow;
  const newTypeStart = rowStart(NEW_STEP) + Math.round(f(N.typeDelay));
  const newText = STEPS[NEW_STEP].text;
  const newCps = newText.length / (T.newRow.typeEnd - newTypeStart / fps);
  const tint = progress(frame, newTypeStart, newTypeStart + f(N.tintFade));
  const newChip = p(N.typeEnd, N.typeEnd + N.chipFade);
  const saved = p(N.typeEnd, N.typeEnd + T.savedSwap);

  /* Part 3 */
  const veil2 = {start: f(T.veilToBoard.start), end: f(T.veilToBoard.start + T.veilToBoard.duration)};
  const v2 = veilState(frame, veil2);
  const boardIn = p(T.boardIn.start, T.boardIn.start + T.boardIn.duration);
  const barReveal = p(T.trafficBar.start, T.trafficBar.start + T.trafficBar.duration);
  const panelIn = [0, 1].map((k) => {
    const s = T.panels.start + k * T.panels.stagger;
    return p(s, s + T.panels.duration);
  });
  const results = p(T.results.start, T.results.start + T.results.duration);
  const winner = p(T.winner.start, T.winner.start + T.winner.duration);
  const R = T.rollout;
  const rollout = p(R.start, R.start + R.duration);
  const splitLabel = p(R.start, R.start + R.labelFade);
  const pillIn = p(R.start, R.start + R.pill);
  const pillTick = p(R.start + R.tickDelay, R.start + R.tickDelay + 0.3);

  const fadeOut = progress(frame, f(T.fadeOut.start), durationInFrames - 1);

  const at = (r: Rect, style?: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute',
    left: r.x,
    top: r.y,
    ...style,
  });

  return (
    <AbsoluteFill style={{background: colors.background, fontFamily}}>
      <AbsoluteFill style={{opacity: 1 - fadeOut}}>
        {/* Parts 1 and 2: topics card plus alert or procedure card */}
        {!v2.outgoingDone && (
          <AbsoluteFill style={v2.outgoing}>
            <div style={at(TOPICS_CARD, {opacity: topicsIn, transform: `translateY(${mix(12, 0, topicsIn)}px)`})}>
              <Card width={TOPICS_CARD.width} height={TOPICS_CARD.height}>
                <div
                  style={{
                    height: HEADER,
                    boxSizing: 'border-box',
                    padding: '0 24px',
                    borderBottom: `1px solid ${colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{fontSize: 20, fontWeight: fontWeights.semibold, letterSpacing: '-0.01em', color: colors.text}}>
                    {TOPICS_TITLE}
                  </div>
                  <div style={{fontSize: 15, color: colors.textSecondary}}>{TOPICS_RANGE}</div>
                </div>
                <BubbleChart
                  bubbles={TOPICS}
                  width={CHART.width}
                  height={CHART.height}
                  maxDiameter={CHART.maxDiameter}
                  appear={bubbleIn}
                  alert={TOPICS.map((_, i) => (i === ALERT_TOPIC ? alertAmount : 0))}
                />
              </Card>
            </div>

            {/* Insight line, above the topics card and under the side card */}
            {!v1.outgoingDone && (
              <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0, ...v1.outgoing}}>
                <ConnectionLine curve={LINE} draw={lineDraw} />
              </svg>
            )}

            {alertIn > 0 && !v1.outgoingDone && (
              <div style={at(SIDE_CARD, {...v1.outgoing, opacity: alertIn * Number(v1.outgoing.opacity ?? 1), transform: `translateY(${mix(12, 0, alertIn)}px)`})}>
                <AlertCard width={SIDE_CARD.width} {...ALERT} reveal={reveal} press={press} />
              </div>
            )}

            <Veil {...veil1} from={SIDE_CARD} />

            {!v1.incomingPending && (
              <div style={at(SIDE_CARD, v1.incoming)}>
                <ProcedureCard
                  width={SIDE_CARD.width}
                  height={SIDE_CARD.height}
                  title={PROCEDURE_TITLE}
                  headerRight={
                    <BadgeSwap
                      mix={saved}
                      from={<Chip label={DRAFT} fontSize={14} height={28} paddingX={12} />}
                      to={<Chip label={SAVED} fontSize={14} height={28} paddingX={12} />}
                    />
                  }
                >
                  {STEPS.map((s, i) => {
                    const isNew = i === NEW_STEP;
                    return (
                      <div key={s.number} style={{position: 'relative'}}>
                        {isNew && tint > 0 && (
                          <div
                            style={{
                              position: 'absolute',
                              inset: '0 -10px',
                              borderRadius: 10,
                              background: colors.limeTint,
                              opacity: tint,
                            }}
                          />
                        )}
                        <div style={{position: 'relative'}}>
                          <StepRow
                            number={s.number}
                            kind={s.kind}
                            text={s.text}
                            startFrame={rowStart(i)}
                            cps={isNew ? newCps : 1000}
                            typeDelay={isNew ? N.typeDelay : 0}
                            enter={T.rows.enter}
                            highlight={false}
                          />
                        </div>
                        {isNew && newChip > 0 && (
                          <div style={{position: 'absolute', right: 0, top: 11, opacity: newChip}}>
                            <Chip label={NEW_CHIP} fontSize={12} height={22} paddingX={8} background={colors.lime} color={colors.charcoal} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </ProcedureCard>
              </div>
            )}
          </AbsoluteFill>
        )}

        <Veil {...veil2} from={PART2_BOUNDS} to={BOARD_RECT} peak={T.veilPeak} />

        {/* Part 3: A/B board */}
        {boardIn > 0 && (
          <>
            <div style={at(BOARD_RECT, {opacity: boardIn, transform: `translateY(${mix(12, 0, boardIn)}px)`})}>
              <Card width={BOARD_RECT.width} height={BOARD_RECT.height}>
                <div
                  style={{
                    height: HEADER,
                    boxSizing: 'border-box',
                    padding: '0 28px',
                    borderBottom: `1px solid ${colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{fontSize: 20, fontWeight: fontWeights.semibold, letterSpacing: '-0.01em', color: colors.text}}>
                    {BOARD.title}
                  </div>
                  <div style={{position: 'relative', width: 140, height: 20, fontSize: 15, fontWeight: fontWeights.medium, color: colors.textSecondary}}>
                    <span style={{position: 'absolute', right: 0, opacity: 1 - splitLabel}}>{BOARD.split}</span>
                    {splitLabel > 0 && <span style={{position: 'absolute', right: 0, opacity: splitLabel}}>{BOARD.splitDone}</span>}
                  </div>
                </div>
                <div style={{position: 'absolute', left: (BOARD_RECT.width - BAR_W) / 2, top: BAR_TOP}}>
                  <TrafficBar
                    width={BAR_W}
                    reveal={barReveal}
                    split={mix(0.5, 1, rollout)}
                    leftLabel={BOARD.current}
                    rightLabel={BOARD.updated}
                    leftLabelOpacity={1 - rollout}
                  />
                </div>
                {[0, 1].map((k) => {
                  const left = (BOARD_RECT.width - PANEL.width * 2 - PANEL.gap) / 2 + k * (PANEL.width + PANEL.gap);
                  const isUpdated = k === 1;
                  return (
                    <div
                      key={k}
                      style={{
                        position: 'absolute',
                        left,
                        top: PANELS_TOP,
                        opacity: panelIn[k],
                        transform: `translateY(${mix(12, 0, panelIn[k])}px)`,
                      }}
                    >
                      <VariantPanel
                        width={PANEL.width}
                        height={PANEL.height}
                        title={isUpdated ? BOARD.updated : BOARD.current}
                        label={BOARD.metric}
                        value={results * (isUpdated ? BOARD.updatedValue : BOARD.currentValue)}
                        fill={isUpdated ? colors.charcoal : colors.line}
                        winner={isUpdated ? winner : 0}
                        winnerChip={isUpdated ? BOARD.uplift : undefined}
                      />
                    </div>
                  );
                })}
              </Card>
            </div>
            {pillIn > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: BOARD_RECT.y + BOARD_RECT.height + 24,
                  display: 'flex',
                  justifyContent: 'center',
                  opacity: pillIn,
                  transform: `translateY(${mix(12, 0, pillIn)}px)`,
                }}
              >
                <RolledOutPill label={BOARD.rolledOut} tick={pillTick} />
              </div>
            )}
          </>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
