import React from 'react';
import {useCurrentFrame} from 'remotion';
import {mix, progress} from '../motion';
import {colors} from '../tokens';

export type Rect = {x: number; y: number; width: number; height: number; radius: number};

export type VeilWindow = {
  /** First frame of the state change. */
  start: number;
  /** Last frame of the state change. */
  end: number;
};

export type VeilState = {
  /** Style for the outgoing element: fades 1 to 0 and blurs 0 to `maxBlur`. */
  outgoing: React.CSSProperties;
  /** Style for the incoming element: fades in over the second half. */
  incoming: React.CSSProperties;
  /** True once the outgoing element is fully gone and can be unmounted. */
  outgoingDone: boolean;
  /** True while the incoming element has not started appearing. */
  incomingPending: boolean;
  /** Eased 0..1 progress across the whole window. */
  t: number;
};

const MAX_BLUR = 8;
const PEAK_OPACITY = 0.8;

/**
 * Values for the outgoing and incoming elements of a Veil state change.
 * Apply `outgoing` and `incoming` to the two elements and render <Veil>
 * between them with the same window.
 */
export const veilState = (frame: number, {start, end}: VeilWindow): VeilState => {
  const mid = (start + end) / 2;
  const out = progress(frame, start, end);
  const inc = progress(frame, mid, end);
  return {
    outgoing: {opacity: 1 - out, filter: out > 0 ? `blur(${out * MAX_BLUR}px)` : undefined},
    incoming: {opacity: inc},
    outgoingDone: frame >= end,
    incomingPending: frame < mid,
    t: out,
  };
};

export type VeilProps = VeilWindow & {
  /** Bounds of the outgoing element. */
  from: Rect;
  /** Bounds of the incoming element. Defaults to `from`. */
  to?: Rect;
};

/**
 * Soft dissolve between two UI states. A pale lime tint rounded rectangle
 * rises to about 0.8 opacity at the midpoint over the outgoing element's
 * bounds, then reshapes to the incoming element's bounds as it falls away
 * and the incoming element fades in.
 */
export const Veil: React.FC<VeilProps> = ({start, end, from, to = from}) => {
  const frame = useCurrentFrame();
  if (frame < start || frame > end) return null;
  const mid = (start + end) / 2;
  const rise = progress(frame, start, mid);
  const fall = progress(frame, mid, end);
  const opacity = PEAK_OPACITY * rise * (1 - fall);
  // Hold the outgoing bounds while the wash rises, then reshape to the
  // incoming bounds while it falls away.
  const t = fall;
  if (opacity <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: mix(from.x, to.x, t),
        top: mix(from.y, to.y, t),
        width: mix(from.width, to.width, t),
        height: mix(from.height, to.height, t),
        borderRadius: mix(from.radius, to.radius, t),
        background: colors.limeTint,
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};
