import React from 'react';
import {colors} from '../../tokens';
import {Chip} from '../../components/Chip';
import {ChannelGlyph} from '../../components/ChannelGlyph';

/** Variable type chip; `secure` is charcoal with a lock. */
export const TypeChip: React.FC<{label: string; secure?: boolean}> = ({label, secure}) =>
  secure ? (
    <Chip
      label={label}
      icon={<ChannelGlyph kind="lock" size={13} color="#ffffff" />}
      fontSize={13}
      height={28}
      paddingX={10}
      gap={6}
      background={colors.charcoal}
      color="#ffffff"
    />
  ) : (
    <Chip label={label} fontSize={13} height={28} paddingX={10} />
  );
