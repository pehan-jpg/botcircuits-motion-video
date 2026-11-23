import React from 'react';
import {colors} from '../../tokens';
import {Chip} from '../../components/Chip';

/** Charcoal pill for the event that starts a run. */
export const EventChip: React.FC<{label: string}> = ({label}) => (
  <Chip label={label} fontSize={14} height={32} paddingX={14} background={colors.charcoal} color="#ffffff" />
);
