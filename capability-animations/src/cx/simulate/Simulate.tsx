import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Card} from '../../components/Card';
import {Chip} from '../../components/Chip';
import {Counter} from '../../components/Counter';
import {FixBlock, fixBlockHeight} from '../../components/FixBlock';
import {ProgressBar} from '../../components/ProgressBar';
import {StatusIconState} from '../../components/StatusIcon';
import {TEST_ROW, TestRow, reasonExtra} from '../../components/TestRow';
import {HEIGHT, WIDTH} from '../../config';
import {mix, progress} from '../../motion';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {
  COUNTER_DONE_LABEL,
  COUNTER_LABEL,
  FAIL_REASON,
  FAILED_TEST,
  FIX_KIND,
  FIX_LABEL,
  FIX_TEXT,
  SIM_LABEL,
  TESTS,
  TITLE,
} from './content';
import {SIMULATE_TIMELINE as T} from './timeline';

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

const CARD = {width: 880, pad: 32};
const INNER = CARD.width - CARD.pad * 2;
const HEADER = 96;
const BAR_GAP = 20;
const BAR = 6;
const ROWS_GAP = 24;
const ROWS_TOP = CARD.pad + HEADER + BAR_GAP + BAR + ROWS_GAP;

/** Extra height of the failed row once the fix block is open. */
const FIX_EXTRA = fixBlockHeight + TEST_ROW.reasonGap - TEST_ROW.reasonPad;

const rowsHeight = (extra: number) =>
  TESTS.length * TEST_ROW.height + (TESTS.length - 1) * TEST_ROW.gap + extra;
const cardHeight = (extra: number) => ROWS_TOP + rowsHeight(extra) + CARD.pad;

/** Top edge is fixed so the card at its tallest (fix open) is centred. */
const CARD_MAX_HEIGHT = cardHeight(reasonExtra + FIX_EXTRA);
const CARD_X = (WIDTH - CARD.width) / 2;
const CARD_Y = Math.round((HEIGHT - CARD_MAX_HEIGHT) / 2);

/* ------------------------------------------------------------------ */
/* Frame derived state                                                 */
/* ------------------------------------------------------------------ */

type RowState = {
  enter: number;
  status: StatusIconState;
  result: {passed: number; failed: number};
};

const runFor = (test: number) => T.runs.find((r) => r.test === test)!;

export const Simulate: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const f = (s: number) => s * fps;
  const p = (a: number, b: number) => progress(frame, f(a), f(b));

  const R = T.rerun;
  const rerunDone = R.start + R.toSpinner + R.spinner; // Passed on the rerun.
  const failAt = runFor(FAILED_TEST).start + runFor(FAILED_TEST).spinner;

  // Failed row treatment: in after the fail, out on the rerun pass.
  const shrink = p(rerunDone, rerunDone + R.shrink);
  const failGrow = p(failAt, failAt + T.failReveal) * (1 - shrink);
  const fixGrow = p(T.fixOpen.start, T.fixOpen.end) * (1 - shrink);
  const rose = failGrow;
  const reasonOpacity = failGrow;
  const fixOpacity = 1 - shrink;

  const rows: RowState[] = TESTS.map((_, i) => {
    const run = runFor(i);
    const enterStart = T.rowsIn.start + i * T.rowsIn.stagger;
    const done = run.start + run.spinner;
    const toRunning = p(run.start, run.start + 0.08);
    const toDone = p(done, done + 0.1);
    let idle = 1 - toRunning;
    let running = toRunning * (1 - toDone);
    let passed = run.outcome === 'pass' ? toDone : 0;
    let failed = run.outcome === 'fail' ? toDone : 0;
    let tick = run.outcome === 'pass' ? p(done, done + T.passPill) : 0;
    let pill = p(done, done + T.passPill);
    let resultPassed = run.outcome === 'pass' ? pill : 0;
    let resultFailed = run.outcome === 'fail' ? pill : 0;

    if (i === FAILED_TEST) {
      // Rerun: Failed to spinner, spinner to Passed.
      const backToRun = p(R.start, R.start + R.toSpinner);
      const toPass = p(rerunDone, rerunDone + 0.1);
      failed *= 1 - backToRun;
      resultFailed *= 1 - backToRun;
      running = Math.max(running, backToRun * (1 - toPass));
      passed = toPass;
      tick = p(rerunDone, rerunDone + T.passPill);
      resultPassed = p(rerunDone, rerunDone + T.passPill);
      idle = idle * (1 - backToRun);
    }

    return {
      enter: p(enterStart, enterStart + T.rowsIn.duration),
      status: {idle, running, passed, failed, tick},
      result: {passed: resultPassed, failed: resultFailed},
    };
  });

  // Counter: +20 eased over each roll window after a pass.
  const rollStarts = [
    ...T.runs.filter((r) => r.outcome === 'pass').map((r) => [r.start + r.spinner, T.counterRoll]),
    [rerunDone, R.counterRoll],
  ];
  const counter = rollStarts.reduce((sum, [s, d]) => sum + 20 * p(s, s + d), 0);
  const completeAt = rerunDone + R.counterRoll;
  const highlight = p(completeAt, completeAt + T.complete.highlight);
  const labelMix = p(completeAt, completeAt + T.complete.label);

  const cardIn = p(T.cardIn.start, T.cardIn.end);
  const fadeOut = progress(frame, f(T.fadeOut.start), durationInFrames - 1);

  // Row heights and positions (no DOM measurement).
  const failedExtra = failGrow * reasonExtra + fixGrow * FIX_EXTRA;
  const heights = TESTS.map((_, i) => TEST_ROW.height + (i === FAILED_TEST ? failedExtra : 0));
  const tops = heights.map((_, i) =>
    heights.slice(0, i).reduce((sum, h) => sum + h + TEST_ROW.gap, ROWS_TOP),
  );

  return (
    <AbsoluteFill style={{background: colors.background, fontFamily}}>
      <AbsoluteFill style={{opacity: 1 - fadeOut}}>
        <div
          style={{
            position: 'absolute',
            left: CARD_X,
            top: CARD_Y,
            opacity: cardIn,
            transform: `translateY(${mix(12, 0, cardIn)}px)`,
          }}
        >
          <Card width={CARD.width} height={cardHeight(failedExtra)}>
            {/* Header */}
            <div
              style={{
                position: 'absolute',
                left: CARD.pad,
                right: CARD.pad,
                top: CARD.pad,
                height: HEADER,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10}}>
                <Chip label={SIM_LABEL} fontSize={13} height={26} paddingX={10} />
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: fontWeights.semibold,
                    lineHeight: '30px',
                    letterSpacing: '-0.01em',
                    color: colors.text,
                  }}
                >
                  {TITLE}
                </div>
              </div>
              <Counter
                value={counter}
                suffix="%"
                label={COUNTER_LABEL}
                altLabel={COUNTER_DONE_LABEL}
                labelMix={labelMix}
                highlight={highlight}
              />
            </div>

            {/* Progress */}
            <div style={{position: 'absolute', left: CARD.pad, top: CARD.pad + HEADER + BAR_GAP}}>
              <ProgressBar value={counter / 100} width={INNER} height={BAR} />
            </div>

            {/* Rows */}
            {TESTS.map((text, i) => {
              const r = rows[i];
              const isFailed = i === FAILED_TEST;
              return (
                <div
                  key={text}
                  style={{
                    position: 'absolute',
                    left: CARD.pad,
                    top: tops[i],
                    opacity: r.enter,
                    transform: `translateY(${mix(8, 0, r.enter)}px)`,
                  }}
                >
                  <TestRow
                    text={text}
                    width={INNER}
                    height={heights[i]}
                    status={r.status}
                    result={r.result}
                    rose={isFailed ? rose : 0}
                    reason={isFailed ? FAIL_REASON : undefined}
                    reasonOpacity={isFailed ? reasonOpacity : 0}
                    fixOpacity={isFailed && fixGrow > 0 ? fixOpacity : 0}
                    fix={
                      isFailed ? (
                        <FixBlock
                          label={FIX_LABEL}
                          kind={FIX_KIND}
                          text={FIX_TEXT}
                          reveal={p(T.fixOpen.start, T.fixOpen.end)}
                          tag={p(T.fixTag.start, T.fixTag.start + T.fixTag.duration)}
                          typeStart={Math.round(f(T.fixTypeStart))}
                          cps={T.fixCps}
                          highlightHold={T.highlightHold}
                        />
                      ) : undefined
                    }
                  />
                </div>
              );
            })}
          </Card>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
