import React from 'react';
import {colors, fontFamily, fontWeights} from '../tokens';
import {TickIcon} from './Icons';
import {StepKind, StepTag} from './StepRow';

export const TRACE_ROW = {height: 40, radius: 12, tagWidth: 76} as const;

/** One step the agent took: tag, step text, and its duration with a tick. */
export const TraceRow: React.FC<{kind: StepKind; text: string; duration: string; tick: number}> = ({
  kind,
  text,
  duration,
  tick,
}) => (
  <div
    style={{
      height: TRACE_ROW.height,
      borderRadius: TRACE_ROW.radius,
      background: colors.traceFill,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '0 14px 0 8px',
      fontFamily,
    }}
  >
    <StepTag kind={kind} width={TRACE_ROW.tagWidth} />
    <div style={{flex: 1, fontSize: 15, fontWeight: fontWeights.regular, color: colors.text, whiteSpace: 'nowrap'}}>{text}</div>
    <div style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: fontWeights.medium, color: colors.textSecondary}}>
      <span style={{opacity: tick > 0 ? 1 : 0}}>{duration}</span>
      <TickIcon size={14} strokeWidth={1.75} color={colors.charcoal} draw={tick} />
    </div>
  </div>
);
