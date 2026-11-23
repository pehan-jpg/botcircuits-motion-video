import React from 'react';
import {mix, progress} from '../motion';
import {colors, fontFamily, fontWeights} from '../tokens';
import {MockProps, TimeLabel, useExchange} from './MockShared';
import {Orb} from './Orb';
import {TypedText} from './TypedText';
import {Waveform} from './Waveform';

/** Voice call mockup with timer, waveform and live captions. */
export const VoiceMock: React.FC<
  MockProps & {name: string; seconds: number; amplitude: number}
> = ({exchange: e, timeLabel, timeLabelOpacity, width, height, name, seconds, amplitude}) => {
  const s = useExchange(e);
  const customerIn = progress(s.frame, e.customerStart, e.customerStart + 0.15 * s.fps);
  const agentIn = progress(s.frame, e.agentStart, e.agentStart + 0.15 * s.fps);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(Math.floor(seconds % 60)).padStart(2, '0');
  const caption: React.CSSProperties = {
    fontFamily,
    fontSize: 17,
    fontWeight: fontWeights.regular,
    lineHeight: 1.45,
    minHeight: 25,
  };
  return (
    <div
      style={{
        width,
        height,
        background: colors.surface,
        padding: 20,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <TimeLabel label={timeLabel} opacity={timeLabelOpacity} />
      <div style={{marginTop: 28}}>
        <Orb size={64} />
      </div>
      <div
        style={{
          marginTop: 16,
          fontFamily,
          fontSize: 20,
          fontWeight: fontWeights.semibold,
          letterSpacing: '-0.01em',
          color: colors.text,
        }}
      >
        {name}
      </div>
      <div
        style={{
          marginTop: 4,
          fontFamily,
          fontSize: 16,
          fontWeight: fontWeights.medium,
          color: colors.textSecondary,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {mm}:{ss}
      </div>
      <div style={{marginTop: 36}}>
        <Waveform amplitude={amplitude} />
      </div>
      <div style={{marginTop: 40, width: 360, display: 'flex', flexDirection: 'column', gap: 10}}>
        <div style={{...caption, color: colors.textSecondary, opacity: customerIn, transform: `translateY(${mix(6, 0, customerIn)}px)`}}>
          <TypedText text={e.customer} startFrame={e.customerStart} cps={e.cps} highlight={false} />
        </div>
        <div style={{...caption, color: colors.text, opacity: agentIn, transform: `translateY(${mix(6, 0, agentIn)}px)`}}>
          <TypedText text={e.agent} startFrame={e.agentStart} cps={e.cps} highlight={false} />
        </div>
      </div>
    </div>
  );
};
