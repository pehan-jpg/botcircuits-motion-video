import React from 'react';
import {mix} from '../../motion';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {Orb} from '../../components/Orb';
import {Spinner} from '../../components/Spinner';

/**
 * Space's reply line: 32px orb, a status text that can crossfade to a new
 * one, and an optional spinner after the text.
 */
export const ReplyRow: React.FC<{
  orb: number;
  text: number;
  label: string;
  altLabel: string;
  labelMix: number;
  spinner: number;
}> = ({orb, text, label, altLabel, labelMix, spinner}) => {
  const labelStyle: React.CSSProperties = {position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 10, height: 32};
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 14, height: 32, fontFamily}}>
      <div style={{opacity: orb}}>
        <Orb size={32} />
      </div>
      <div
        style={{
          position: 'relative',
          height: 32,
          width: 300,
          fontSize: 16,
          fontWeight: fontWeights.medium,
          color: colors.text,
          opacity: text,
          transform: `translateY(${mix(6, 0, text)}px)`,
        }}
      >
        <div style={{...labelStyle, opacity: 1 - labelMix}}>
          {label}
          {spinner > 0 && (
            <span style={{opacity: spinner}}>
              <Spinner size={14} />
            </span>
          )}
        </div>
        {labelMix > 0 && <div style={{...labelStyle, opacity: labelMix}}>{altLabel}</div>}
      </div>
    </div>
  );
};
