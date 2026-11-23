import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Card} from '../../components/Card';
import {Chip} from '../../components/Chip';
import {PauseIcon, TickIcon} from '../../components/Icons';
import {Orb} from '../../components/Orb';
import {BadgeSwap} from '../../components/StatusBadge';
import {StepRow} from '../../components/StepRow';
import {HEIGHT} from '../../config';
import {mix, progress} from '../../motion';
import {colors, fontFamily, fontWeights, tagColours} from '../../tokens';
import {CheckRow, ChecksCard} from '../components/ChecksCard';
import {PausedChip} from '../components/PausedChip';
import {PLAYBOOK, PlaybookCard} from '../components/PlaybookCard';
import {RunHighlight} from '../components/RunHighlight';
import {VariableRow} from '../components/VariableRow';
import {CHECKS, DRAFT, READY, STEPS, TITLE, VARIABLES, WAITING} from './content';
import {SPACE_BUILD_TIMELINE as T} from './timeline';

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

const PLAY = {x: 60, width: 860, height: 700};
const PLAY_Y = (HEIGHT - PLAY.height) / 2;
const SIDE = {x: 960, width: 580, height: 336, gap: 28};
const REVIEW_ROW = STEPS.findIndex((s) => s.review);

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export const SpaceBuild: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const f = (s: number) => s * fps;
  const p = (a: number, b: number) => progress(frame, f(a), f(b));
  const rise = (v: number): React.CSSProperties => ({opacity: v, transform: `translateY(${mix(12, 0, v)}px)`});

  const playIn = p(T.playbookIn.start, T.playbookIn.end);
  const rowStart = (i: number) => Math.round(f(T.rows.start + i * T.rows.stagger));

  const varsIn = p(T.variablesIn.start, T.variablesIn.start + T.variablesIn.duration);
  const varRows = VARIABLES.map((_, i) => p(T.variableRows.start + i * T.variableRows.stagger, T.variableRows.start + i * T.variableRows.stagger + T.variableRows.duration));
  const checksIn = p(T.checksIn.start, T.checksIn.end);
  const C = T.checkRows;
  const checkIn = C.appear.map((t) => p(t, t + C.fade));
  const checkSpin = C.ticks.map((t) => p(t - C.spinner, t - C.spinner + 0.1));
  const checkDone = C.ticks.map((t) => p(t, t + T.tickFade));
  const checkTick = C.ticks.map((t) => p(t, t + T.tickFade + 0.15));
  const R = T.runPress;
  const press = p(R.start, R.start + R.down) * (1 - p(R.start + R.down, R.start + R.down + R.up));

  /* Test run: one moving highlight */
  const H = T.highlightFade;
  const runStart = T.run[0][0];
  const runEnd = T.run[T.run.length - 1][1];
  const hlOpacity = p(runStart, runStart + H) * (1 - p(runEnd, runEnd + H));
  let hlRow = 0;
  for (let i = 1; i < T.run.length; i++) hlRow += p(T.run[i][0], T.run[i][0] + H);
  const hlY = hlRow * PLAYBOOK.row;
  const [pauseStart, pauseEnd] = T.run[REVIEW_ROW];
  const amber = p(pauseStart, pauseStart + H) * (1 - p(pauseEnd, pauseEnd + H));
  const rowDone = T.run.map(([, end]) => p(end, end + T.tickFade));
  const rowTick = T.run.map(([, end]) => p(end, end + T.tickFade + 0.15));
  const paused = amber; // chip shows for the whole pause

  const ready = p(T.ready.start, T.ready.start + T.ready.duration);
  const passed = p(T.testPassed.start, T.testPassed.start + T.testPassed.duration);
  const passedTick = p(T.testPassed.start + 0.1, T.testPassed.start + T.testPassed.duration + 0.1);

  const fadeOut = progress(frame, f(T.fadeOut.start), durationInFrames - 1);

  const statusSlot = (i: number, review?: boolean) => {
    const done = rowDone[i];
    return (
      <div style={{position: 'relative', width: 20, height: 20}}>
        {review && frame >= rowStart(i) && (
          <div style={{position: 'absolute', inset: 0, opacity: 1 - Math.max(paused, done), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <PauseIcon size={18} strokeWidth={2} color={colors.textSecondary} />
          </div>
        )}
        {review && paused > 0 && (
          <div style={{position: 'absolute', right: 0, top: -4, opacity: paused}}>
            <PausedChip label={WAITING} />
          </div>
        )}
        {done > 0 && (
          <div style={{position: 'absolute', inset: 0, opacity: done, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <TickIcon size={18} strokeWidth={1.75} color={colors.charcoal} draw={rowTick[i]} />
          </div>
        )}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{background: colors.background, fontFamily}}>
      <AbsoluteFill style={{opacity: 1 - fadeOut}}>
        {/* Playbook */}
        <div style={{position: 'absolute', left: PLAY.x, top: PLAY_Y, ...rise(playIn)}}>
          <PlaybookCard
            width={PLAY.width}
            height={PLAY.height}
            title={TITLE}
            status={
              <BadgeSwap
                mix={ready}
                from={<Chip label={DRAFT} fontSize={14} height={28} paddingX={12} />}
                to={<Chip label={READY} fontSize={14} height={28} paddingX={12} background={colors.limeTint} color={colors.charcoal} />}
              />
            }
            highlight={
              <RunHighlight y={hlY} height={PLAYBOOK.row} opacity={hlOpacity} amber={amber} run={colors.limeTint} pause={tagColours.review.background} />
            }
          >
            {STEPS.map((s, i) => (
              <div
                key={s.number}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: i * PLAYBOOK.row,
                  height: PLAYBOOK.row,
                  boxSizing: 'border-box',
                  borderBottom: `1px solid ${colors.border}`,
                  padding: `0 ${PLAYBOOK.padX}px`,
                }}
              >
                <StepRow
                  number={s.number}
                  kind={s.kind}
                  text={s.text}
                  level={s.level}
                  startFrame={rowStart(i)}
                  cps={T.rows.cps}
                  typeDelay={T.rows.typeDelay}
                  enter={T.rows.enter}
                  highlight={false}
                  height={PLAYBOOK.row - 1}
                  numberWidth={40}
                  numberSize={15}
                  textSize={17}
                  indentSize={28}
                  prefix={s.orb ? <Orb size={20} /> : undefined}
                  statusSlot={statusSlot(i, s.review)}
                />
              </div>
            ))}
          </PlaybookCard>
        </div>

        {/* Variables */}
        {varsIn > 0 && (
          <div style={{position: 'absolute', left: SIDE.x, top: PLAY_Y, ...rise(varsIn)}}>
            <Card width={SIDE.width} height={SIDE.height}>
              <div style={{height: 64, boxSizing: 'border-box', padding: '0 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center'}}>
                <span style={{fontSize: 18, fontWeight: fontWeights.semibold, color: colors.text}}>Variables</span>
              </div>
              {VARIABLES.map((v, i) => (
                <div key={v.name} style={rise(varRows[i])}>
                  <VariableRow name={v.name} type={v.type} secure={v.secure} last={i === VARIABLES.length - 1} />
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* Checks */}
        {checksIn > 0 && (
          <div style={{position: 'absolute', left: SIDE.x, top: PLAY_Y + SIDE.height + SIDE.gap, ...rise(checksIn)}}>
            <ChecksCard
              width={SIDE.width}
              height={SIDE.height}
              title={CHECKS.title}
              button={CHECKS.button}
              press={press}
              result={
                passed > 0 ? (
                  <div style={rise(passed)}>
                    <Chip
                      label={CHECKS.passed}
                      icon={<TickIcon size={16} strokeWidth={1.75} color={colors.charcoal} draw={passedTick} />}
                      fontSize={15}
                      height={36}
                      paddingX={16}
                      gap={8}
                      background={colors.limeTint}
                      color={colors.charcoal}
                    />
                  </div>
                ) : undefined
              }
            >
              {CHECKS.rows.map((r, i) => (
                <div key={r} style={rise(checkIn[i])}>
                  <CheckRow text={r} spinner={checkSpin[i]} done={checkDone[i]} tick={checkTick[i]} />
                </div>
              ))}
            </ChecksCard>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
