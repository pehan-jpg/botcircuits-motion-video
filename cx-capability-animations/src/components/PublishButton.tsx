import React from 'react';
import {interpolateColors} from 'remotion';
import {mix} from '../motion';
import {colors, fontFamily, fontWeights} from '../tokens';
import {TickIcon} from './Icons';

/**
 * Publish button. `press` 0..1 darkens it to #333; `done` 0..1 turns it into
 * a lime tint "Published" pill with a charcoal tick drawn by `tick`.
 */
export const PublishButton: React.FC<{
  width: number;
  press: number;
  done: number;
  tick: number;
  label?: string;
  doneLabel?: string;
}> = ({width, press, done, tick, label = 'Publish', doneLabel = 'Published'}) => {
  const pressed = interpolateColors(press, [0, 1], [colors.charcoal, '#333333']);
  return (
    <div
      style={{
        position: 'relative',
        width,
        height: 44,
        borderRadius: mix(12, 22, done),
        background: interpolateColors(done, [0, 1], [pressed, colors.limeTint]),
        fontFamily,
        fontWeight: fontWeights.medium,
        fontSize: 16,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          opacity: 1 - done,
        }}
      >
        {label}
      </div>
      {done > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: colors.charcoal,
            opacity: done,
          }}
        >
          <TickIcon size={16} strokeWidth={1.75} color={colors.charcoal} draw={tick} />
          {doneLabel}
        </div>
      )}
    </div>
  );
};
