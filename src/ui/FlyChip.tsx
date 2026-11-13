import React from 'react';
import {COLORS, ease, kf} from '../theme';
import {sec} from '../timeline';
import {FONT_SANS} from '../theme';
import {UI} from './tokens';

export type FlyKey = {t: number; x: number; y: number; w: number; s?: number; o?: number};

/**
 * A text chip that lifts out of one card, travels on a curved path and lands
 * as another element (shared element morph between scenes and cards). Keys are
 * screen positions (top-left) with width, scale and opacity per time; the path
 * between keys bends like the cursor's.
 */
export const FlyChip: React.FC<{frame: number; keys: FlyKey[]; children: React.ReactNode; fontSize?: number; bend?: number; variant?: 'bubble' | 'pill'}> = ({frame, keys, children, fontSize = 26, bend = 0.16, variant = 'bubble'}) => {
  const s = frame / sec(1);
  if (s < keys[0].t || s > keys[keys.length - 1].t) return null;
  let i = 0;
  while (i < keys.length - 2 && s > keys[i + 1].t) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const t = ease(frame, [sec(a.t), sec(b.t)], [0, 1]);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const c = {x: (a.x + b.x) / 2 - dy * bend, y: (a.y + b.y) / 2 + dx * bend};
  const u = 1 - t;
  const x = u * u * a.x + 2 * u * t * c.x + t * t * b.x;
  const y = u * u * a.y + 2 * u * t * c.y + t * t * b.y;
  const w = a.w + (b.w - a.w) * t;
  const sc = (a.s ?? 1) + ((b.s ?? 1) - (a.s ?? 1)) * t;
  const op = (a.o ?? 1) + ((b.o ?? 1) - (a.o ?? 1)) * t;
  const lifted = kf(frame, [keys[0].t, keys[0].t + 0.15], [0, 1]);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        opacity: op,
        transform: `scale(${sc})`,
        transformOrigin: '0 0',
        padding: variant === 'bubble' ? '16px 20px' : '0 16px',
        height: variant === 'pill' ? 46 : undefined,
        display: variant === 'pill' ? 'inline-flex' : 'block',
        alignItems: 'center',
        gap: 8,
        boxSizing: 'border-box',
        borderRadius: variant === 'bubble' ? '26px 26px 26px 8px' : 23,
        border: '1.5px solid transparent',
        background: `linear-gradient(#F7F9F8, #F7F9F8) padding-box, linear-gradient(120deg, #6FD3A4, #CDE7FF) border-box`,
        boxShadow: `0 ${18 * lifted}px ${40 * lifted}px rgba(13,18,36,${0.18 * lifted})`,
        fontFamily: FONT_SANS,
        fontSize,
        lineHeight: variant === 'bubble' ? '36px' : 1,
        color: UI.ink,
        whiteSpace: variant === 'pill' ? 'nowrap' : 'normal',
      }}
    >
      {children}
      <span style={{display: 'none'}}>{COLORS.white}</span>
    </div>
  );
};
