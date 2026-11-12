import React from 'react';
import {COLORS, FONT_SANS, FONT_SANS_FAMILY} from '../theme';
import {Tag, VariableChip, variableChipWidth} from './Chip';
import {Sweep} from './Sweep';
import {measureText} from './measure';

/** One oversized row of the real Procedure editor (scene 6 peek). */
export const STEP = {height: 150, padX: 40, gap: 20, tag: 28, chip: 32, bars: [230, 140]};
const tagW = (label: string, weight: number) =>
  measureText(label, `${weight} ${STEP.tag}px "${FONT_SANS_FAMILY}"`, STEP.tag * 0.6) + STEP.tag * 1.4 + (weight === 700 ? label.length * STEP.tag * 0.04 : 0);

export const stepRowLayout = () => {
  let x = STEP.padX;
  const run = x;
  x += tagW('RUN', 700) + STEP.gap;
  const instr = x;
  x += tagW('Instruction', 600) + STEP.gap + 8;
  const bar1 = x;
  x += STEP.bars[0] + 16;
  const bar2 = x;
  x += STEP.bars[1] + STEP.gap + 8;
  const into = x;
  x += measureText('into', `400 ${STEP.tag}px "${FONT_SANS_FAMILY}"`, 15) + STEP.gap;
  const chip = x;
  const chipW = variableChipWidth('card_last4', STEP.chip);
  x += chipW + STEP.padX;
  return {run, instr, bar1, bar2, into, chip, chipW, width: x};
};

export const StepRow: React.FC<{glow: number; sweep: number; chipOpacity?: number}> = ({glow, sweep, chipOpacity = 1}) => {
  const L = stepRowLayout();
  const H = STEP.height;
  const cell = (x: number, child: React.ReactNode) => (
    <div style={{position: 'absolute', left: x, top: 0, height: H, display: 'flex', alignItems: 'center'}}>{child}</div>
  );
  const bar = (w: number) => <div style={{width: w, height: 24, borderRadius: 12, background: '#E4E7E3'}} />;
  return (
    <div
      style={{
        position: 'relative',
        width: L.width,
        height: H,
        borderRadius: 32,
        background: COLORS.white,
        boxShadow: '0 40px 90px rgba(13,18,36,0.18)',
      }}
    >
      {cell(L.run, <Tag label="RUN" fontSize={STEP.tag} />)}
      {cell(L.instr, <Tag label="Instruction" tone="blue" fontSize={STEP.tag} />)}
      {cell(L.bar1, bar(STEP.bars[0]))}
      {cell(L.bar2, bar(STEP.bars[1]))}
      {cell(L.into, <span style={{fontFamily: FONT_SANS, fontSize: STEP.tag, color: COLORS.muted}}>into</span>)}
      {cell(
        L.chip,
        <div style={{position: 'relative', opacity: chipOpacity}}>
          <VariableChip name="card_last4" fontSize={STEP.chip} glow={glow} />
          <div style={{position: 'absolute', inset: 0, borderRadius: 6, overflow: 'hidden'}}>
            <Sweep progress={sweep} width={L.chipW} strength={0.6} color={COLORS.white} />
          </div>
        </div>,
      )}
    </div>
  );
};
