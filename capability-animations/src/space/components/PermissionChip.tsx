import React from 'react';
import {Chip} from '../../components/Chip';
import {ChannelGlyph} from '../../components/ChannelGlyph';

/** Grey chip with a lock: answers respect each person's access. */
export const PermissionChip: React.FC<{label: string}> = ({label}) => (
  <Chip label={label} icon={<ChannelGlyph kind="lock" size={14} />} fontSize={13} height={28} paddingX={12} gap={6} />
);
