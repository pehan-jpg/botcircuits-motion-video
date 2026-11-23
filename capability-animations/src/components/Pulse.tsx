import React from 'react';
import {colors, shadows} from '../tokens';
import {Point} from './ConnectionLine';

/** Lime dot with a soft glow, centred on `at`. */
export const Pulse: React.FC<{at: Point; opacity: number; size?: number}> = ({at, opacity, size = 10}) =>
  opacity <= 0 ? null : (
    <div
      style={{
        position: 'absolute',
        left: at.x - size / 2,
        top: at.y - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        background: colors.lime,
        boxShadow: shadows.pulse,
        opacity,
      }}
    />
  );
