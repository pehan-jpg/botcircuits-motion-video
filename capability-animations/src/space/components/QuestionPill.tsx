import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {measureText} from '@remotion/layout-utils';
import {charsTyped} from '../../components/TypedText';
import {colors, fontFamily, fontWeights} from '../../tokens';

export const QUESTION_PILL = {height: 56, padX: 24, fontSize: 18} as const;

/**
 * Right aligned charcoal question pill whose width follows the typed text
 * (measured with the loaded font, not the DOM).
 */
export const QuestionPill: React.FC<{text: string; startFrame: number; cps: number; opacity: number}> = ({
  text,
  startFrame,
  cps,
  opacity,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = charsTyped(frame, startFrame, cps, fps, text.length);
  const shown = text.slice(0, n);
  const w = shown ? measureText({text: shown, fontFamily: 'Inter', fontSize: QUESTION_PILL.fontSize, fontWeight: '400'}).width : 0;
  return (
    <div
      style={{
        width: Math.ceil(w) + QUESTION_PILL.padX * 2,
        height: QUESTION_PILL.height,
        borderRadius: QUESTION_PILL.height / 2,
        background: colors.charcoal,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: QUESTION_PILL.padX,
        boxSizing: 'border-box',
        fontFamily,
        fontSize: QUESTION_PILL.fontSize,
        fontWeight: fontWeights.regular,
        whiteSpace: 'pre',
        opacity,
      }}
    >
      {shown}
    </div>
  );
};
