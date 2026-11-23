import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Card} from '../../components/Card';
import {Chip} from '../../components/Chip';
import {ConnectionLine, fanCurve} from '../../components/ConnectionLine';
import {HEIGHT, WIDTH} from '../../config';
import {mix, progress} from '../../motion';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {AmberChip} from '../components/AmberChip';
import {ElapsedCounter} from '../components/ElapsedCounter';
import {EventChip} from '../components/EventChip';
import {NoticeRow} from '../components/NoticeRow';
import {RunList, RunListItem} from '../components/RunList';
import {RUN_ROW, RunRow} from '../components/RunRow';
import {RunStatus} from '../components/RunStatus';
import {TRIGGER_ROW, TriggerRow} from '../components/TriggerRow';
import {
  CONTROL_TITLE,
  EVENT,
  FIRED,
  NOTICE,
  PAY_STEP,
  RETRY_CHIP,
  RUN_CHIP,
  RUN_STEPS,
  TOOK,
  TRIGGERS,
  TRIGGERS_TITLE,
  WAITING_CHIP,
  WAITING_LABEL,
} from './content';
import {SPACE_AUTOMATE_TIMELINE as T} from './timeline';

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

const HEADER = 72;
const CARD_H = 640;
const CARD_Y = (HEIGHT - CARD_H) / 2;
const TRIG = {x: 60, width: 460};
const CTRL = {x: 560, width: 980};
const FOOTER = 64;
const NOTICE_SLOT = 64; // 48px notice plus 8px above and below

const firedRowCY = CARD_Y + HEADER + FIRED * TRIGGER_ROW.height + TRIGGER_ROW.height / 2;
const LINE = fanCurve({x: TRIG.x + TRIG.width, y: firedRowCY}, {x: CTRL.x, y: CARD_Y + HEADER + RUN_ROW.height / 2});

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export const SpaceAutomate: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const f = (s: number) => s * fps;
  const p = (a: number, b: number) => progress(frame, f(a), f(b));
  const rise = (v: number): React.CSSProperties => ({opacity: v, transform: `translateY(${mix(12, 0, v)}px)`});

  /* Triggers */
  const trigIn = p(T.triggersIn.start, T.triggersIn.end);
  const trigRows = TRIGGERS.map((_, i) => p(T.triggerRows.start + i * T.triggerRows.stagger, T.triggerRows.start + i * T.triggerRows.stagger + T.triggerRows.duration));
  const F = T.fire;
  const outline = p(F.outline, F.outline + F.outlineDuration);
  const chipOpacity = p(F.chipIn, F.chipIn + F.chipFade) * (1 - p(F.chipOut, F.chipOut + F.chipFade));
  const chipMove = p(F.chipMove.start, F.chipMove.start + F.chipMove.duration);
  const line = p(T.line.start, T.line.end);

  /* Control Room */
  const ctrlIn = p(T.controlIn.start, T.controlIn.end);
  const stepIn = T.steps.map(([a]) => p(a, a + T.rowIn));
  const stepSpin = T.steps.map(([a]) => p(a, a + 0.1));
  const stepDone = T.steps.map(([, t]) => p(t, t + T.tickFade));
  const stepTick = T.steps.map(([, t]) => p(t, t + T.tickFade + 0.15));

  const RV = T.review;
  const reviewIn = p(RV.appear, RV.appear + T.rowIn);
  const reviewChip = p(RV.appear, RV.appear + RV.chipFade);
  const W = T.waiting;
  const waitingStatus = p(W.start, W.start + W.statusFade);
  const minutes = W.minutes * p(W.start, W.counterEnd);
  const RS = T.resume;
  const resumed = p(RS.start, RS.start + RS.duration);
  const resumedTick = p(RS.start, RS.start + RS.duration + 0.15);
  const footerText = p(W.start, W.start + W.statusFade) * (1 - resumed);

  const noticeGrow = p(T.notice.start, T.notice.end);

  const PY = T.pay;
  const payIn = p(PY.appear, PY.appear + T.rowIn);
  const retry = p(PY.retryIn, PY.retryIn + PY.chipFade) * (1 - p(PY.retryOut, PY.retryOut + PY.chipFade));
  const payDone = p(PY.retryOut, PY.retryOut + T.tickFade);
  const payTick = p(PY.retryOut, PY.retryOut + T.tickFade + 0.15);

  const C = T.completed;
  const completed = p(C.start, C.start + C.statusFade);
  const completedTick = p(C.start + 0.05, C.start + C.statusFade + 0.15);
  const tookIn = p(C.start, C.start + C.pill);

  const fadeOut = progress(frame, f(T.fadeOut.start), durationInFrames - 1);

  const items: RunListItem[] = [
    ...RUN_STEPS.slice(0, 4).map((s, i) => ({
      key: `s${i}`,
      height: RUN_ROW.height,
      appear: stepIn[i],
      node: (
        <RunRow
          kind={s.kind}
          text={s.text}
          time={s.time}
          startFrame={Math.round(f(T.steps[i][0]))}
          state={{spinner: stepSpin[i], done: stepDone[i], tick: stepTick[i], waiting: 0}}
        />
      ),
    })),
    {
      key: 'review',
      height: RUN_ROW.height,
      appear: reviewIn,
      node: (
        <RunRow
          kind={RUN_STEPS[4].kind}
          text={RUN_STEPS[4].text}
          time={RUN_STEPS[4].time}
          altTime={RUN_STEPS[4].altTime}
          timeMix={resumed}
          startFrame={Math.round(f(RV.appear))}
          state={{spinner: 0, done: resumed, tick: resumedTick, waiting: 1}}
          chip={
            reviewChip * (1 - resumed) > 0 ? (
              <div style={{opacity: reviewChip * (1 - resumed)}}>
                <AmberChip label={WAITING_CHIP} />
              </div>
            ) : undefined
          }
        />
      ),
    },
    {
      key: 'notice',
      height: NOTICE_SLOT,
      grow: noticeGrow,
      appear: noticeGrow,
      node: (
        <div style={{padding: `8px ${RUN_ROW.padX - 8}px`}}>
          <NoticeRow glyph="restart" text={NOTICE} />
        </div>
      ),
    },
    {
      key: 'pay',
      height: RUN_ROW.height,
      appear: payIn,
      node: (
        <RunRow
          kind={PAY_STEP.kind}
          text={PAY_STEP.text}
          time={PAY_STEP.time}
          startFrame={Math.round(f(PY.appear))}
          state={{spinner: payIn, done: payDone, tick: payTick, waiting: 0}}
          chip={
            retry > 0 ? (
              <div style={{opacity: retry}}>
                <AmberChip label={RETRY_CHIP} />
              </div>
            ) : undefined
          }
        />
      ),
    },
  ];

  return (
    <AbsoluteFill style={{background: colors.background, fontFamily}}>
      <AbsoluteFill style={{opacity: 1 - fadeOut}}>
        {/* Triggers */}
        <div style={{position: 'absolute', left: TRIG.x, top: CARD_Y, ...rise(trigIn)}}>
          <Card width={TRIG.width} height={CARD_H}>
            <div style={{height: HEADER, boxSizing: 'border-box', padding: '0 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center'}}>
              <span style={{fontSize: 20, fontWeight: fontWeights.semibold, letterSpacing: '-0.01em', color: colors.text}}>{TRIGGERS_TITLE}</span>
            </div>
            {TRIGGERS.map((t, i) => (
              <div key={t.name} style={{position: 'absolute', left: 0, top: HEADER + i * TRIGGER_ROW.height, ...rise(trigRows[i])}}>
                <TriggerRow width={TRIG.width - 2} kind={t.kind} name={t.name} detail={t.detail} active={i === FIRED ? outline : 0} />
              </div>
            ))}
          </Card>
        </div>

        {/* Control Room */}
        {ctrlIn > 0 && (
          <div style={{position: 'absolute', left: CTRL.x, top: CARD_Y, ...rise(ctrlIn)}}>
            <Card width={CTRL.width} height={CARD_H}>
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
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <span style={{fontSize: 20, fontWeight: fontWeights.semibold, letterSpacing: '-0.01em', color: colors.text}}>{CONTROL_TITLE}</span>
                  <Chip label={RUN_CHIP} fontSize={14} height={28} paddingX={12} />
                </div>
                <RunStatus waiting={waitingStatus * (1 - resumed)} completed={completed} tick={completedTick} />
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, top: HEADER}}>
                <RunList items={items} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: FOOTER,
                  boxSizing: 'border-box',
                  padding: '0 28px',
                  borderTop: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{opacity: footerText}}>{footerText > 0 && <ElapsedCounter label={WAITING_LABEL} minutes={minutes} />}</div>
                {tookIn > 0 && (
                  <div style={rise(tookIn)}>
                    <Chip label={TOOK} fontSize={14} height={32} paddingX={14} color={colors.text} />
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Line and event chip, above the cards */}
        <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0}}>
          <ConnectionLine curve={LINE} draw={line} />
        </svg>
        {chipOpacity > 0 && (
          <div
            style={{
              position: 'absolute',
              left: TRIG.x + TRIG.width - 70 + 40 * chipMove,
              top: firedRowCY - 16,
              opacity: chipOpacity,
            }}
          >
            <EventChip label={EVENT} />
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
