import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {mix, progress} from '../motion';
import {colors, fontFamily, fontWeights, radii, tagColours} from '../tokens';
import {Chip} from './Chip';
import {BotIcon, BranchIcon, ClipboardIcon, MessageIcon, SpeechArrowIcon, UserCheckIcon, WrenchIcon} from './Icons';
import {TypedText} from './TypedText';

export type StepKind = 'ask' | 'tool' | 'if' | 'elseIf' | 'tell' | 'collect' | 'agent' | 'review';

const TAGS: Record<StepKind, {label: string; Icon: React.FC<{size?: number}>}> = {
  ask: {label: 'Ask', Icon: MessageIcon},
  tool: {label: 'Tool', Icon: WrenchIcon},
  if: {label: 'If', Icon: BranchIcon},
  elseIf: {label: 'Else if', Icon: BranchIcon},
  tell: {label: 'Tell', Icon: SpeechArrowIcon},
  collect: {label: 'Collect', Icon: ClipboardIcon},
  agent: {label: 'Agent', Icon: BotIcon},
  review: {label: 'Review', Icon: UserCheckIcon},
};

/** Colour pair for each kind. Collect shares the Ask colours. */
const TAG_COLOUR: Record<StepKind, keyof typeof tagColours> = {
  ask: 'ask',
  tool: 'tool',
  if: 'if',
  elseIf: 'elseIf',
  tell: 'tell',
  collect: 'ask',
  agent: 'agent',
  review: 'review',
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
export const StepTag: React.FC<{kind: StepKind; width?: number}> = ({kind, width = STEP_ROW.tagWidth}) => {
  const {label, Icon} = TAGS[kind];
  const {background, text} = tagColours[TAG_COLOUR[kind]];
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
      style={{width, justifyContent: 'flex-start'}}
    />
  );
};

export type StepRowProps = {
  number?: React.ReactNode;
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
  /** Typing highlight on the newest word. Defaults to on. */
  highlight?: boolean;
  /** Optional layout overrides; defaults are the Build procedure rows. */
  height?: number;
  numberWidth?: number;
  numberSize?: number;
  textSize?: number;
  /** Indent per nesting level. */
  indentSize?: number;
  /** Element shown before the step text (for example a small orb). */
  prefix?: React.ReactNode;
  /** Element in a status slot at the row's right edge. */
  statusSlot?: React.ReactNode;
  /** Element in a fixed slot between the number column and the tag. */
  lead?: React.ReactNode;
  leadWidth?: number;
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
  highlight = true,
  height = STEP_ROW.height,
  numberWidth = STEP_ROW.numberColumn,
  numberSize = STEP_ROW.numberSize,
  textSize = STEP_ROW.textSize,
  indentSize = STEP_ROW.indent,
  prefix,
  statusSlot,
  lead,
  leadWidth = 24,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = progress(frame, startFrame, startFrame + enter * fps);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height,
        paddingLeft: level * indentSize,
        opacity: p,
        transform: `translateY(${mix(8, 0, p)}px)`,
        fontFamily,
      }}
    >
      <div
        style={{
          width: numberWidth,
          flexShrink: 0,
          fontSize: numberSize,
          fontWeight: fontWeights.medium,
          color: colors.textSecondary,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}
      >
        {number ?? ''}
      </div>
      {lead !== undefined && (
        <div style={{width: leadWidth, height: leadWidth, flexShrink: 0, position: 'relative'}}>{lead}</div>
      )}
      <div style={{marginLeft: STEP_ROW.numberToTag, flexShrink: 0}}>
        <StepTag kind={kind} />
      </div>
      <div
        style={{
          marginLeft: STEP_ROW.tagToText,
          display: prefix ? 'flex' : undefined,
          alignItems: prefix ? 'center' : undefined,
          gap: prefix ? 6 : undefined,
          fontSize: textSize,
          fontWeight: fontWeights.regular,
          color: colors.text,
          lineHeight: 1.3,
          whiteSpace: 'nowrap',
        }}
      >
        {prefix}
        <TypedText text={text} startFrame={startFrame + Math.round(typeDelay * fps)} cps={cps} highlight={highlight} />
      </div>
      {statusSlot !== undefined && (
        <div style={{marginLeft: 'auto', flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
          {statusSlot}
        </div>
      )}
    </div>
  );
};

/** Total height of `count` rows, including the gaps between them. */
export const rowsHeight = (count: number): number =>
  count <= 0 ? 0 : count * STEP_ROW.height + (count - 1) * STEP_ROW.gap;
