import React from 'react';
import {interpolateColors} from 'remotion';
import {mix} from '../../motion';
import {colors, fontFamily, fontWeights, shadows} from '../../tokens';
import type {Rect} from '../../components/Veil';
import {COMPOSER} from './Composer';

export const USER_BUBBLE = {fontSize: 18, lineHeight: 26, padY: 14, padX: 20, radius: 16} as const;
export const userBubbleHeight = USER_BUBBLE.lineHeight + USER_BUBBLE.padY * 2;

/**
 * The sent message. One rectangle that interpolates from the composer pill
 * (`from`, morph 0) to the bubble (`to`, morph 1): position, size, radius,
 * fill, border, shadow, text size, colour and padding all ease together.
 * At morph 0 it renders exactly like the composer's text pill.
 */
export const UserBubble: React.FC<{text: string; from: Rect; to: Rect; morph: number}> = ({text, from, to, morph}) => {
  const m = morph;
  return (
    <div
      style={{
        position: 'absolute',
        left: mix(from.x, to.x, m),
        top: mix(from.y, to.y, m),
        width: mix(from.width, to.width, m),
        height: mix(from.height, to.height, m),
        boxSizing: 'border-box',
        borderRadius: mix(from.radius, to.radius, m),
        background: interpolateColors(m, [0, 1], [colors.surface, colors.charcoal]),
        border: `1px solid ${interpolateColors(m, [0, 1], [colors.border, colors.charcoal])}`,
        boxShadow: m < 1 ? shadows.card.replace('0.06', (0.06 * (1 - m)).toFixed(4)) : undefined,
        fontFamily,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: mix(COMPOSER.padX, USER_BUBBLE.padX, m) - 1,
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          fontSize: mix(COMPOSER.fontSize, USER_BUBBLE.fontSize, m),
          fontWeight: fontWeights.regular,
          lineHeight: `${USER_BUBBLE.lineHeight}px`,
          color: interpolateColors(m, [0, 1], [colors.text, '#ffffff']),
          whiteSpace: 'pre',
        }}
      >
        {text}
      </div>
    </div>
  );
};
