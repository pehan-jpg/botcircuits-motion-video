import React from 'react';
import {colors, fontFamily, fontWeights, tagColours} from '../../tokens';
import {Chip} from '../../components/Chip';
import {TickIcon} from '../../components/Icons';

/**
 * Header run status: lime dot "Running", amber dot "Waiting", or a lime
 * tint "Completed" chip. `waiting` and `completed` (0..1) crossfade.
 */
export const RunStatus: React.FC<{waiting: number; completed: number; tick: number}> = ({waiting, completed, tick}) => {
  const layer: React.CSSProperties = {position: 'absolute', right: 0, top: 0, height: 28, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap'};
  const running = (1 - waiting) * (1 - completed);
  return (
    <div style={{position: 'relative', width: 1, height: 28, fontFamily, fontSize: 15, fontWeight: fontWeights.medium}}>
      {running > 0 && (
        <div style={{...layer, opacity: running, color: colors.text}}>
          <span style={{width: 6, height: 6, borderRadius: '50%', background: colors.lime}} />
          Running
        </div>
      )}
      {waiting > 0 && (
        <div style={{...layer, opacity: waiting * (1 - completed), color: tagColours.review.text}}>
          <span style={{width: 6, height: 6, borderRadius: '50%', background: tagColours.review.text}} />
          Waiting
        </div>
      )}
      {completed > 0 && (
        <div style={{...layer, opacity: completed}}>
          <Chip
            label="Completed"
            icon={<TickIcon size={14} strokeWidth={1.75} color={colors.charcoal} draw={tick} />}
            fontSize={14}
            height={28}
            paddingX={12}
            gap={6}
            background={colors.limeTint}
            color={colors.charcoal}
          />
        </div>
      )}
    </div>
  );
};
