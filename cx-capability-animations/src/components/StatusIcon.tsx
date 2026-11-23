import React from 'react';
import {colors} from '../tokens';
import {TickIcon} from './Icons';
import {Spinner} from './Spinner';

/**
 * Test status icon. The four states are stacked and crossfade by opacity,
 * so the caller drives every change from frame derived numbers.
 */
export type StatusIconState = {
  idle: number;
  running: number;
  passed: number;
  failed: number;
  /** 0..1 draw progress of the pass tick. */
  tick: number;
};

const layer = (opacity: number): React.CSSProperties => ({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity,
});

export const StatusIcon: React.FC<StatusIconState & {size?: number}> = ({
  idle,
  running,
  passed,
  failed,
  tick,
  size = 24,
}) => {
  const r = (size - 1.5) / 2;
  return (
    <div style={{position: 'relative', width: size, height: size, flexShrink: 0}}>
      {idle > 0 && (
        <div style={layer(idle)}>
          <svg width={size} height={size} style={{display: 'block'}}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors.idleRing} strokeWidth={1.5} />
          </svg>
        </div>
      )}
      {running > 0 && (
        <div style={layer(running)}>
          <Spinner size={size} trackColor={colors.idleRing} arcColor={colors.text} />
        </div>
      )}
      {passed > 0 && (
        <div style={{...layer(passed), borderRadius: '50%', background: colors.lime}}>
          <TickIcon size={14} strokeWidth={1.75} color={colors.charcoal} draw={tick} />
        </div>
      )}
      {failed > 0 && (
        <div style={{...layer(failed), borderRadius: '50%', background: colors.rose}}>
          <svg width={12} height={12} viewBox="0 0 12 12" style={{display: 'block'}}>
            <path
              d="M3 3l6 6M9 3l-6 6"
              stroke={colors.roseText}
              strokeWidth={1.75}
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
