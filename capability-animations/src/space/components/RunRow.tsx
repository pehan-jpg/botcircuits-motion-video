import React from 'react';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {ChannelGlyph} from '../../components/ChannelGlyph';
import {TickIcon} from '../../components/Icons';
import {Spinner} from '../../components/Spinner';
import {StepKind, StepRow} from '../../components/StepRow';

export const RUN_ROW = {height: 64, padX: 28, timeWidth: 100} as const;

export type RunRowState = {
  spinner: number;
  done: number;
  tick: number;
  waiting: number;
};

/** Status slot: spinner, amber hourglass or charcoal tick, crossfaded. */
export const RunStatusIcon: React.FC<RunRowState> = ({spinner, done, tick, waiting}) => {
  const layer: React.CSSProperties = {position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'};
  return (
    <>
      {spinner > 0 && done < 1 && (
        <div style={{...layer, opacity: spinner * (1 - done)}}>
          <Spinner size={20} />
        </div>
      )}
      {waiting > 0 && (
        <div style={{...layer, opacity: waiting * (1 - done)}}>
          <ChannelGlyph kind="hourglass" size={20} color="#7a5a00" />
        </div>
      )}
      {done > 0 && (
        <div style={{...layer, opacity: done}}>
          <TickIcon size={18} strokeWidth={1.75} color={colors.charcoal} draw={tick} />
        </div>
      )}
    </>
  );
};

/** Time label that can crossfade to a new time. */
const Time: React.FC<{time: string; altTime?: string; mix: number}> = ({time, altTime, mix}) => (
  <span style={{position: 'relative', display: 'inline-block', fontFamily, fontWeight: fontWeights.medium, fontVariantNumeric: 'tabular-nums'}}>
    <span style={{opacity: 1 - mix}}>{time}</span>
    {altTime && mix > 0 && <span style={{position: 'absolute', left: 0, top: 0, opacity: mix}}>{altTime}</span>}
  </span>
);

/**
 * One step of a run, built on StepRow: time column, status slot, tag and
 * text, and an optional chip on the right.
 */
export const RunRow: React.FC<{
  kind: StepKind;
  text: string;
  time: string;
  altTime?: string;
  timeMix?: number;
  state: RunRowState;
  chip?: React.ReactNode;
  startFrame: number;
}> = ({kind, text, time, altTime, timeMix = 0, state, chip, startFrame}) => (
  <div
    style={{
      height: RUN_ROW.height,
      boxSizing: 'border-box',
      borderBottom: `1px solid ${colors.border}`,
      padding: `0 ${RUN_ROW.padX}px`,
    }}
  >
    <StepRow
      number={<Time time={time} altTime={altTime} mix={timeMix} />}
      kind={kind}
      text={text}
      startFrame={startFrame}
      cps={1000}
      typeDelay={0}
      enter={0}
      highlight={false}
      height={RUN_ROW.height - 1}
      numberWidth={RUN_ROW.timeWidth}
      numberSize={14}
      textSize={16}
      lead={<RunStatusIcon {...state} />}
      statusSlot={<div style={{position: 'relative', height: 28, display: 'flex', alignItems: 'center'}}>{chip}</div>}
    />
  </div>
);
