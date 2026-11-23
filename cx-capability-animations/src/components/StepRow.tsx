import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {mix, progress} from '../motion';
import {colors, fontFamily, fontWeights, radii, tagColours} from '../tokens';
import {Chip} from './Chip';
import {BranchIcon, MessageIcon, SpeechArrowIcon, WrenchIcon} from './Icons';
import {TypedText} from './TypedText';

export type StepKind = 'ask' | 'tool' | 'if' | 'elseIf' | 'tell';

const TAGS: Record<StepKind, {label: string; Icon: React.FC<{size?: number}>}> = {
  ask: {label: 'Ask', Icon: MessageIcon},
  tool: {label: 'Tool', Icon: WrenchIcon},
  if: {label: 'If', Icon: BranchIcon},
  elseIf: {label: 'Else if', Icon: BranchIcon},
  tell: {label: 'Tell', Icon: SpeechArrowIcon},
};

/** Layout constants for procedure rows, shared by any animation that lists steps. */
export const STEP_ROW = {
  height: 44,
  gap: 8,
  indent: 32,
  numberColumn: 28,
  numberToTag: 10,
  tagToText: 14,
  /** Fixed tag width so every row's text starts at the same x. */
  tagWidth: 96,
  textSize: 22,
  numberSize: 16,
} as const;

/** Step tag: fixed width pill coloured per step type, content left aligned. */
export const StepTag: React.FC<{kind: StepKind}> = ({kind}) => {
  const {label, Icon} = TAGS[kind];
  const {background, text} = tagColours[kind];
  return (
    <Chip
      label={label}
      icon={<Icon size={14} />}
      fontSize={14}
      height={24}
      paddingX={10}
      gap={6}
      radius={radii.tag}
      background={background}
      color={text}
      style={{width: STEP_ROW.tagWidth, justifyContent: 'flex-start'}}
    />
  );
};

export type StepRowProps = {
  number?: string;
  kind: StepKind;
  text: string;
  /** Nesting level; each level indents 32px. */
  level?: number;
  /** Frame on which the row starts entering. */
  startFrame: number;
  /** Typing speed for the row text. */
  cps: number;
  /** Seconds between the row entering and its text starting to type. */
  typeDelay?: number;
  /** Seconds for the row entrance (fade plus small rise). */
  enter?: number;
};

export const StepRow: React.FC<StepRowProps> = ({
  number,
  kind,
  text,
  level = 0,
  startFrame,
  cps,
  typeDelay = 0.08,
  enter = 0.3,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = progress(frame, startFrame, startFrame + enter * fps);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: STEP_ROW.height,
        paddingLeft: level * STEP_ROW.indent,
        opacity: p,
        transform: `translateY(${mix(8, 0, p)}px)`,
        fontFamily,
      }}
    >
      <div
        style={{
          width: STEP_ROW.numberColumn,
          flexShrink: 0,
          fontSize: STEP_ROW.numberSize,
          fontWeight: fontWeights.medium,
          color: colors.textSecondary,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {number ?? ''}
      </div>
      <div style={{marginLeft: STEP_ROW.numberToTag, flexShrink: 0}}>
        <StepTag kind={kind} />
      </div>
      <div
        style={{
          marginLeft: STEP_ROW.tagToText,
          fontSize: STEP_ROW.textSize,
          fontWeight: fontWeights.regular,
          color: colors.text,
          lineHeight: 1.3,
          whiteSpace: 'nowrap',
        }}
      >
        <TypedText text={text} startFrame={startFrame + Math.round(typeDelay * fps)} cps={cps} />
      </div>
    </div>
  );
};

/** Total height of `count` rows, including the gaps between them. */
export const rowsHeight = (count: number): number =>
  count <= 0 ? 0 : count * STEP_ROW.height + (count - 1) * STEP_ROW.gap;
