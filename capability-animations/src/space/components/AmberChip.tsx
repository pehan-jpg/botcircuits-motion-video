import React from 'react';
import {tagColours} from '../../tokens';
import {Chip} from '../../components/Chip';

/** Amber tint chip for waiting and retrying states. */
export const AmberChip: React.FC<{label: string}> = ({label}) => (
  <Chip label={label} fontSize={13} height={28} paddingX={10} background={tagColours.review.background} color={tagColours.review.text} />
);
