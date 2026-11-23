import React from 'react';
import {Chip} from './Chip';
import {TickIcon} from './Icons';
import {Spinner} from './Spinner';
import {colors} from '../tokens';

export const STATUS_PILL = {height: 28, fontSize: 14, paddingX: 12} as const;

/**
 * Connection status at the right edge of a tile. The three states are
 * stacked, right aligned, and crossfade by opacity, so the caller drives the
 * whole change from frame derived values.
 *
 *   connect    0..1 opacity of the grey "Connect" pill
 *   spinner    0..1 opacity of the spinner
 *   connected  0..1 opacity of the lime tint "Connected" pill
 *   tick       0..1 draw progress of the tick
 */
export type StatusPillProps = {
  connect: number;
  spinner: number;
  connected: number;
  tick: number;
  /** Optional labels and icon; defaults are the Integrate copy. */
  connectLabel?: string;
  connectedLabel?: string;
  /** Replaces the drawn tick in the connected pill. */
  connectedIcon?: React.ReactNode;
};

const layer = (opacity: number): React.CSSProperties => ({
  position: 'absolute',
  right: 0,
  top: 0,
  height: STATUS_PILL.height,
  display: 'flex',
  alignItems: 'center',
  opacity,
});

export const StatusPill: React.FC<StatusPillProps> = ({
  connect,
  spinner,
  connected,
  tick,
  connectLabel = 'Connect',
  connectedLabel = 'Connected',
  connectedIcon,
}) => (
  <div style={{position: 'relative', height: STATUS_PILL.height, width: 1}}>
    {connect > 0 && (
      <div style={layer(connect)}>
        <Chip
          label={connectLabel}
          fontSize={STATUS_PILL.fontSize}
          height={STATUS_PILL.height}
          paddingX={STATUS_PILL.paddingX}
        />
      </div>
    )}
    {spinner > 0 && (
      // Centred where the Connect pill sat (its width is about 82px).
      <div style={{...layer(spinner), right: 34}}>
        <Spinner />
      </div>
    )}
    {connected > 0 && (
      <div style={layer(connected)}>
        <Chip
          label={connectedLabel}
          icon={connectedIcon ?? <TickIcon size={14} strokeWidth={1.75} color={colors.charcoal} draw={tick} />}
          fontSize={STATUS_PILL.fontSize}
          height={STATUS_PILL.height}
          paddingX={STATUS_PILL.paddingX}
          gap={6}
          background={colors.limeTint}
          color={colors.charcoal}
        />
      </div>
    )}
  </div>
);
