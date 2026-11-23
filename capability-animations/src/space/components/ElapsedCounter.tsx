import React from 'react';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {Counter} from '../../components/Counter';

/** "h NN min" from whole minutes. */
export const hoursMinutes = (minutes: number) => `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} min`;

/** Label followed by a rolling duration (tabular figures, fixed width). */
export const ElapsedCounter: React.FC<{label: string; minutes: number}> = ({label, minutes}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 6, fontFamily, fontSize: 15, fontWeight: fontWeights.medium, color: colors.text}}>
    <span>{label}</span>
    <Counter
      value={minutes}
      label=""
      showLabel={false}
      align="left"
      numberSize={15}
      numberWeight={fontWeights.medium}
      numberColor={colors.text}
      numberLetterSpacing="0"
      numberWidth={90}
      format={hoursMinutes}
    />
  </div>
);
