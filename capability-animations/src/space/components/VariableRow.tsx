import React from 'react';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {TypeChip} from './TypeChip';

/** Variable name (tabular Inter) and its type chip. */
export const VariableRow: React.FC<{name: string; type: string; secure?: boolean; last?: boolean}> = ({name, type, secure, last}) => (
  <div
    style={{
      height: 72,
      boxSizing: 'border-box',
      padding: '0 24px',
      borderBottom: last ? undefined : `1px solid ${colors.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily,
    }}
  >
    <span style={{fontSize: 16, fontWeight: fontWeights.medium, color: colors.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.01em'}}>
      {name}
    </span>
    <TypeChip label={type} secure={secure} />
  </div>
);
