import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {mix, progress} from '../motion';
import {colors, fontFamily, fontWeights} from '../tokens';
import {TypedText} from './TypedText';

/**
 * Message bubble whose text types in. The bubble is sized from the full
 * text from the start, so it never changes size while typing. Messages are
 * single line. Appears with
 * a short fade and 6px rise when typing starts. No typing highlight.
 */
export const ChatBubble: React.FC<{
  text: string;
  startFrame: number;
  cps: number;
  background: string;
  color: string;
  radius: number;
  border?: string;
  maxWidth?: number;
  fontSize?: number;
}> = ({text, startFrame, cps, background, color, radius, border, maxWidth = 360, fontSize = 16}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const appear = progress(frame, startFrame, startFrame + 0.15 * fps);
  if (appear <= 0) return null;
  return (
    <div
      style={{
        position: 'relative',
        maxWidth,
        padding: '10px 14px',
        boxSizing: 'border-box',
        borderRadius: radius,
        background,
        border,
        color,
        fontFamily,
        fontSize,
        fontWeight: fontWeights.regular,
        lineHeight: 1.4,
        opacity: appear,
        transform: `translateY(${mix(6, 0, appear)}px)`,
      }}
    >
      <span style={{visibility: 'hidden', whiteSpace: 'pre'}}>{text}</span>
      <span style={{position: 'absolute', left: 14, top: 10, right: 14}}>
        <TypedText text={text} startFrame={startFrame} cps={cps} highlight={false} />
      </span>
    </div>
  );
};

/** Small secondary caption such as a timestamp. */
export const Meta: React.FC<{children: React.ReactNode; align?: 'left' | 'right'; opacity?: number}> = ({
  children,
  align = 'left',
  opacity = 1,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      gap: 4,
      marginTop: 4,
      fontFamily,
      fontSize: 12,
      fontWeight: fontWeights.regular,
      color: colors.textSecondary,
      opacity,
    }}
  >
    {children}
  </div>
);
