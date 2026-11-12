import React from 'react';
import {COLORS, FONT_SANS, FONT_SANS_FAMILY, FONT_MONO_FAMILY} from '../theme';
import {Tag, VariableChip} from './Chip';
import {Sweep} from './Sweep';
import {measureText} from './measure';

/** One oversized row of the real Procedure editor, in a 1100x360 card (scene 6 peek). */
export const PEEK = {width: 1100, height: 360, radius: 28, padX: 48, gap: 16, tag: 30, into: 40, chipFont: 44, chipH: 96};

const tagW = (label: string, weight: number) =>
  measureText(label, `${weight} ${PEEK.tag}px "${FONT_SANS_FAMILY}"`, PEEK.tag * 0.6) + PEEK.tag * 1.4 + (weight === 700 ? label.length * PEEK.tag * 0.04 : 0);

export const peekLayout = () => {
  const run = tagW('RUN', 700);
  const instr = tagW('Instruction', 600);
  const into = measureText('into', `400 ${PEEK.into}px "${FONT_SANS_FAMILY}"`, 22);
  const chip =
    measureText('card_last4', `500 ${PEEK.chipFont}px "${FONT_MONO_FAMILY}"`, PEEK.chipFont * 0.6) +
    measureText('Aa', `600 ${PEEK.chipFont * 0.78}px "${FONT_SANS_FAMILY}"`, 24) +
    PEEK.chipFont * 0.4 +
    PEEK.chipFont * 1.1;
  const fixed = run + instr + into + chip + PEEK.gap * 5 + 16;
  const bars = Math.max(80, PEEK.width - PEEK.padX * 2 - fixed);
  let x = PEEK.padX;
  const pos = {run: x, instr: (x += run + PEEK.gap), bar1: (x += instr + PEEK.gap), bar2: 0, into: 0, chip: 0, chipW: chip};
  pos.bar2 = x += bars * 0.62 + 16;
  pos.into = x += bars * 0.38 + PEEK.gap;
  pos.chip = x += into + PEEK.gap;
  return {...pos, bars};
};

export const StepRow: React.FC<{glow: number; sweep: number; chipOpacity?: number}> = ({glow, sweep, chipOpacity = 1}) => {
  const L = peekLayout();
  const H = PEEK.height;
  const cell = (x: number, child: React.ReactNode) => (
    <div style={{position: 'absolute', left: x, top: 0, height: H, display: 'flex', alignItems: 'center'}}>{child}</div>
  );
  const bar = (w: number) => <div style={{width: w, height: 26, borderRadius: 13, background: '#E4E7E3'}} />;
  return (
    <div style={{position: 'relative', width: PEEK.width, height: H, borderRadius: PEEK.radius, background: COLORS.white, boxShadow: '0 50px 120px rgba(13,18,36,0.22)'}}>
      {cell(L.run, <Tag label="RUN" fontSize={PEEK.tag} />)}
      {cell(L.instr, <Tag label="Instruction" tone="blue" fontSize={PEEK.tag} />)}
      {cell(L.bar1, bar(L.bars * 0.62))}
      {cell(L.bar2, bar(L.bars * 0.38))}
      {cell(L.into, <span style={{fontFamily: FONT_SANS, fontSize: PEEK.into, color: COLORS.muted}}>into</span>)}
      {cell(
        L.chip,
        <div style={{position: 'relative', opacity: chipOpacity}}>
          <VariableChip name="card_last4" fontSize={PEEK.chipFont} height={PEEK.chipH} glow={glow} />
          <div style={{position: 'absolute', inset: 0, borderRadius: 6, overflow: 'hidden'}}>
            <Sweep progress={sweep} width={L.chipW} strength={0.7} />
          </div>
        </div>,
      )}
    </div>
  );
};
