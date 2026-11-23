import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {mix, progress} from '../motion';
import {colors, fontFamily, fontWeights} from '../tokens';

export const BUBBLE = {lineHeight: 22, padY: 10, padX: 14} as const;

/**
 * Transcript message that may wrap over several lines. The full text is
 * always laid out and the untyped part is transparent, so line breaks never
 * shift while it types. Appears with a short fade and 6px rise.
 */
export const TranscriptBubble: React.FC<{
  text: string;
  startFrame: number;
  cps: number;
  side: 'customer' | 'agent';
  maxWidth: number;
  /** Avatar shown beside agent side bubbles. */
  avatar?: React.ReactNode;
  avatarOpacity?: number;
}> = ({text, startFrame, cps, side, maxWidth, avatar, avatarOpacity = 1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const appear = progress(frame, startFrame, startFrame + 0.15 * fps);
  const typed = frame < startFrame ? 0 : Math.min(text.length, Math.floor(((frame - startFrame) / fps) * cps) + 1);
  const customer = side === 'customer';
  const bubble = (
    <div
      style={{
        maxWidth,
        boxSizing: 'border-box',
        padding: `${BUBBLE.padY}px ${BUBBLE.padX}px`,
        borderRadius: 12,
        background: customer ? colors.charcoal : colors.surface,
        border: customer ? undefined : `1px solid ${colors.border}`,
        color: customer ? '#ffffff' : colors.text,
        fontFamily,
        fontSize: 16,
        fontWeight: fontWeights.regular,
        lineHeight: `${BUBBLE.lineHeight}px`,
        opacity: appear,
        transform: `translateY(${mix(6, 0, appear)}px)`,
      }}
    >
      {text.slice(0, typed)}
      <span style={{color: 'transparent'}}>{text.slice(typed)}</span>
    </div>
  );
  return (
    <div style={{display: 'flex', justifyContent: customer ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 12}}>
      {avatar && <div style={{opacity: avatarOpacity, flexShrink: 0}}>{avatar}</div>}
      {appear > 0 ? bubble : null}
    </div>
  );
};
