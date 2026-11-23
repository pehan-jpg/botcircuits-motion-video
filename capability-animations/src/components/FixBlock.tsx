import React from 'react';
import {colors, fontFamily, fontWeights} from '../tokens';
import {StepKind, StepTag} from './StepRow';
import {TypedText} from './TypedText';

export const FIX_BLOCK = {
  dividerGap: 14,
  labelHeight: 18,
  labelGap: 6,
  stepHeight: 44,
  bottomPad: 10,
} as const;

/** Total height of the fix block below its divider line. */
export const fixBlockHeight =
  1 + FIX_BLOCK.dividerGap + FIX_BLOCK.labelHeight + FIX_BLOCK.labelGap + FIX_BLOCK.stepHeight + FIX_BLOCK.bottomPad;

/**
 * A procedure correction shown inside a failed test: divider, a small label
 * and one step that types in after its tag.
 */
export const FixBlock: React.FC<{
  label: string;
  kind: StepKind;
  text: string;
  /** 0..1 opacity of the divider and label. */
  reveal: number;
  /** 0..1 opacity of the tag. */
  tag: number;
  /** Frame on which the step text starts typing. */
  typeStart: number;
  cps: number;
  highlightHold?: number;
}> = ({label, kind, text, reveal, tag, typeStart, cps, highlightHold = 0.3}) => (
  <div style={{fontFamily}}>
    <div style={{height: 1, background: colors.roseRowBorder, opacity: reveal}} />
    <div
      style={{
        marginTop: FIX_BLOCK.dividerGap,
        height: FIX_BLOCK.labelHeight,
        lineHeight: `${FIX_BLOCK.labelHeight}px`,
        fontSize: 13,
        fontWeight: fontWeights.regular,
        color: colors.textSecondary,
        opacity: reveal,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
    <div
      style={{
        marginTop: FIX_BLOCK.labelGap,
        height: FIX_BLOCK.stepHeight,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div style={{opacity: tag}}>
        <StepTag kind={kind} />
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: fontWeights.regular,
          color: colors.text,
          lineHeight: 1.3,
          whiteSpace: 'nowrap',
        }}
      >
        <TypedText text={text} startFrame={typeStart} cps={cps} highlightHold={highlightHold} />
      </div>
    </div>
  </div>
);
