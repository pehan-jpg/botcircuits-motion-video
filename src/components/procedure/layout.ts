// World-space layout of the Procedure editor (identity camera = full page).
import {FONT_MONO_FAMILY, FONT_SANS_FAMILY} from '../../theme';
import {measureText} from '../measure';
import {variableChipWidth} from '../Chip';

export const HEADER = {cy: 215, titleX: 100, titleSize: 54};
export const TOOLS = {undoX: 1300, redoX: 1352, autoX: 1418, toggleX: 1530, saveX: 1630, saveW: 200, saveH: 62};
export const STEPS = {x: 90, y: 280, width: 1740, height: 690, radius: 20};
export const STEPS_HEAD = {titleCy: 324, subCy: 362, x: 130};
export const SECTIONS = [
  {x: 120, y: 410, width: 1680, height: 250, titleCy: 452, rows: [520, 594]},
  {x: 120, y: 684, width: 1680, height: 250, titleCy: 726, rows: [794, 868]},
];

export const ROW = {x0: 152, numW: 58, tagSize: 16, gapTag: 10, gapText: 16, textSize: 22, gapInto: 14, chipSize: 18};

export type RowSpec = {
  id: string;
  section: 0 | 1;
  index: 0 | 1;
  kind: 'RUN' | 'SEND';
  text: string;
  variable?: string; // RUN: "into" target
  person?: boolean; // RUN 1.2: abstract person glyph slot
};

export const ROWS: RowSpec[] = [
  {
    id: '1.1',
    section: 0,
    index: 0,
    kind: 'RUN',
    text: 'Ask for the last four digits of the card and the date of birth.',
    variable: 'card_last4',
  },
  {
    id: '1.2',
    section: 0,
    index: 1,
    kind: 'RUN',
    text: 'Check the details. If they cannot be verified, hand over to a person.',
    variable: 'verified',
    person: true,
  },
  {id: '2.1', section: 1, index: 0, kind: 'RUN', text: 'Block the card ending in the given digits.', variable: 'block_status'},
  {
    id: '2.2',
    section: 1,
    index: 1,
    kind: 'SEND',
    text: 'Your card ending {card_last4} is now blocked. Shall I order a replacement?',
  },
];

export const SEND_VAR = '{card_last4}';
export const VAR_SPAN = {fontSize: 20, padX: 6};

const sans = (w: number, s: number) => `${w} ${s}px "${FONT_SANS_FAMILY}"`;
const tagWidth = (label: string, weight: number) =>
  measureText(label, sans(weight, ROW.tagSize), ROW.tagSize * 0.6) +
  ROW.tagSize * 1.4 +
  (weight === 700 ? label.length * ROW.tagSize * 0.04 : 0);

export const PERSON_SLOT = 40;

/** x positions of every element in a row (world). */
export const rowLayout = (row: RowSpec) => {
  const cy = SECTIONS[row.section].rows[row.index];
  const tag1X = ROW.x0 + ROW.numW;
  const tag1W = tagWidth(row.kind, 700);
  let x = tag1X + tag1W + ROW.gapTag;
  const tag2X = x;
  const tag2W = row.kind === 'RUN' ? tagWidth('Instruction', 600) : 0;
  if (row.kind === 'RUN') x += tag2W + ROW.gapText;
  else x = tag1X + tag1W + ROW.gapText;
  const textX = x;
  let textW = 0;
  if (row.kind === 'RUN') textW = measureText(row.text, sans(400, ROW.textSize), ROW.textSize * 0.52);
  else {
    const [a, b] = row.text.split(SEND_VAR);
    textW =
      measureText(a, sans(400, ROW.textSize), ROW.textSize * 0.52) +
      measureText(SEND_VAR, `500 ${VAR_SPAN.fontSize}px "${FONT_MONO_FAMILY}"`, VAR_SPAN.fontSize * 0.6) +
      VAR_SPAN.padX * 2 +
      measureText(b, sans(400, ROW.textSize), ROW.textSize * 0.52);
  }
  const personX = textX + textW + 10;
  const intoX = textX + textW + (row.person ? PERSON_SLOT + 10 : 0) + ROW.gapInto;
  const intoW = measureText('into', sans(400, ROW.textSize), ROW.textSize * 0.52);
  const chipX = intoX + intoW + 12;
  const chipW = row.variable ? variableChipWidth(row.variable, ROW.chipSize) : 0;
  return {cy, tag1X, tag1W, tag2X, tag2W, textX, textW, personX, intoX, chipX, chipW};
};

/** Where "{card_last4}" sits inside row 2.2 (world). */
export const sendVarRect = () => {
  const row = ROWS[3];
  const l = rowLayout(row);
  const before = row.text.split(SEND_VAR)[0];
  const x = l.textX + measureText(before, sans(400, ROW.textSize), ROW.textSize * 0.52);
  const w = measureText(SEND_VAR, `500 ${VAR_SPAN.fontSize}px "${FONT_MONO_FAMILY}"`, VAR_SPAN.fontSize * 0.6) + VAR_SPAN.padX * 2;
  return {x, w, cy: l.cy, h: VAR_SPAN.fontSize * 1.5};
};

/** Range of "hand over to a person" inside row 1.2 (world x). */
export const handoverRange = () => {
  const row = ROWS[1];
  const l = rowLayout(row);
  const phrase = 'hand over to a person';
  const i = row.text.indexOf(phrase);
  const x0 = l.textX + measureText(row.text.slice(0, i), sans(400, ROW.textSize), ROW.textSize * 0.52);
  const x1 = x0 + measureText(phrase, sans(400, ROW.textSize), ROW.textSize * 0.52);
  return {x0, x1, y: l.cy + ROW.textSize * 0.72};
};
