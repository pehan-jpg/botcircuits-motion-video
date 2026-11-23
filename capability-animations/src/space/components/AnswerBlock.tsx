import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {charsTyped} from '../../components/TypedText';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {Orb} from '../../components/Orb';

export const ANSWER = {orb: 32, gap: 16, maxWidth: 800, lineHeight: 28, fontSize: 18} as const;

/**
 * Orb plus an answer paragraph that types in. The whole paragraph, including
 * the trailing chips, is laid out from the first frame (untyped text is
 * transparent and chips are faded), so wrapping never changes and nothing
 * below it moves.
 */
export const AnswerBlock: React.FC<{
  text: string;
  startFrame: number;
  cps: number;
  orb: number;
  chips: React.ReactNode;
}> = ({text, startFrame, cps, orb, chips}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = charsTyped(frame, startFrame, cps, fps, text.length);
  return (
    <div style={{display: 'flex', alignItems: 'flex-start', gap: ANSWER.gap, fontFamily}}>
      <div style={{opacity: orb, flexShrink: 0}}>
        <Orb size={ANSWER.orb} />
      </div>
      <div
        style={{
          maxWidth: ANSWER.maxWidth,
          fontSize: ANSWER.fontSize,
          fontWeight: fontWeights.regular,
          lineHeight: `${ANSWER.lineHeight}px`,
          color: colors.text,
          paddingTop: (ANSWER.orb - ANSWER.lineHeight) / 2,
        }}
      >
        {text.slice(0, n)}
        <span style={{color: 'transparent'}}>{text.slice(n)}</span>
        {chips}
      </div>
    </div>
  );
};
