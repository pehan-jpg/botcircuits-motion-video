import React from 'react';
import {colors} from '../../tokens';
import {Chip} from '../../components/Chip';
import {PauseIcon} from '../../components/Icons';

/** Amber chip shown while a step waits for a person's review. */
export const PausedChip: React.FC<{label: string}> = ({label}) => (
  <Chip
    label={label}
    icon={<PauseIcon size={12} strokeWidth={2} />}
    fontSize={13}
    height={28}
    paddingX={10}
    gap={6}
    background={colors.amber}
    color={colors.amberText}
    style={{border: `1px solid ${colors.amberBorder}`, boxSizing: 'border-box'}}
  />
);
