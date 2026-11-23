import React from 'react';
import {interpolateColors} from 'remotion';
import {mix} from '../motion';
import {colors, fontFamily, fontWeights} from '../tokens';
import {TickIcon} from './Icons';

/**
 * "Take over" button. `press` lightens it to #333; `done` returns it to
 * charcoal as a pill reading "Taken over" with a tick drawn by `tick`.
 */
export const TakeOverButton: React.FC<{width: number; press: number; done: number; tick: number}> = ({
  width,
  press,
  done,
  tick,
}) => {
  const pressed = interpolateColors(press, [0, 1], [colors.charcoal, '#333333']);
  const label: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    color: '#ffffff',
  };
  return (
    <div
      style={{
        position: 'relative',
        width,
        height: 44,
        borderRadius: mix(12, 22, done),
        background: interpolateColors(done, [0, 1], [pressed, colors.charcoal]),
        fontFamily,
        fontSize: 16,
        fontWeight: fontWeights.medium,
      }}
    >
      <div style={{...label, opacity: 1 - done}}>Take over</div>
      {done > 0 && (
        <div style={{...label, opacity: done}}>
          <TickIcon size={16} strokeWidth={1.75} color="#ffffff" draw={tick} />
          Taken over
        </div>
      )}
    </div>
  );
};
