import React from 'react';
import {colors} from '../tokens';
import {Chip} from './Chip';

/**
 * Test result at the right edge of a row: "Passed" on lime tint or "Failed"
 * on rose. Both are stacked, right aligned, and fade by opacity. Empty when
 * both are 0.
 */
export const ResultPill: React.FC<{passed: number; failed: number}> = ({passed, failed}) => {
  const layer = (opacity: number): React.CSSProperties => ({
    position: 'absolute',
    right: 0,
    top: 0,
    opacity,
  });
  const common = {fontSize: 14, height: 28, paddingX: 12} as const;
  return (
    <div style={{position: 'relative', width: 1, height: 28, flexShrink: 0}}>
      {passed > 0 && (
        <div style={layer(passed)}>
          <Chip label="Passed" {...common} background={colors.limeTint} color={colors.charcoal} />
        </div>
      )}
      {failed > 0 && (
        <div style={layer(failed)}>
          <Chip label="Failed" {...common} background={colors.rose} color={colors.roseText} />
        </div>
      )}
    </div>
  );
};
