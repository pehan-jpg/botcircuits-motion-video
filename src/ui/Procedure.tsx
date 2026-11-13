import React from 'react';
import {COLORS, alpha, ease, kfIO, popIn, tween} from '../theme';
import {sec} from '../timeline';
import {UI, UI_FONT, UI_FAMILY} from './tokens';
import {CONTENT} from '../v7';
import {VariableChip} from '../components/Chip';
import {typedCount} from '../components/TypingText';
import {measureText, wrapText} from '../components/measure';

export type TagKind = 'RUN' | 'IF' | 'ELSE' | 'SEND' | 'SET';
const TAG_COL: Record<TagKind, {bg: string; fg: string}> = {RUN: UI.run, IF: UI.iff, ELSE: UI.iff, SEND: UI.send, SET: UI.set};

/** Type tag (RUN blue, IF/ELSE violet, SEND orange, SET teal). */
export const TypeTag: React.FC<{kind: TagKind}> = ({kind}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', height: 40, padding: '0 14px', borderRadius: 10, background: TAG_COL[kind].bg, color: TAG_COL[kind].fg, fontFamily: UI_FONT, fontWeight: 700, fontSize: 22, letterSpacing: '0.04em', whiteSpace: 'nowrap'}}>
    {kind}
  </span>
);
export const InstructionTag: React.FC = () => (
  <span style={{display: 'inline-flex', alignItems: 'center', height: 40, padding: '0 14px', borderRadius: 10, background: UI.instruction.bg, color: UI.instruction.fg, fontFamily: UI_FONT, fontWeight: 500, fontSize: 22}}>Instruction</span>
);

export type Row =
  | {id: string; kind: 'RUN'; text: string; into: string; at: number}
  | {id: string; kind: 'IF'; cond: string; condIs: string; send: string; at: number}
  | {id: string; kind: 'ELSE'; send: string; at: number}
  | {id: string; kind: 'SEND'; text: string; at: number};
export type Section = {title: string; rows: Row[]; at: number};

// ---- metrics ------------------------------------------------------------------
export const STEPS_CARD = {x: CONTENT.x + 50, y: CONTENT.y + 30, width: 1100, height: CONTENT.height - 60, head: 112};
const FS = 26;
const LH = 36;
const PAD = 28;
const TEXT_X = 196;
const TEXT_W = STEPS_CARD.width - TEXT_X - 48;
const NEST_X = TEXT_X + 70;
const NEST_W = STEPS_CARD.width - NEST_X - 48;
const FONT = `500 ${FS}px "${UI_FAMILY}"`;
const PER_CHAR = 0.4;
const SECTION_H = 56;
const SECTION_GAP = 32;
const lines = (t: string, w: number) => wrapText(t, FONT, w, 13);
const rowText = (r: Row) => (r.kind === 'RUN' || r.kind === 'SEND' ? r.text : r.send);
const textStart = (r: Row) => r.at + (r.kind === 'IF' || r.kind === 'ELSE' ? 0.2 : 0.15);
export const rowTextEnd = (r: Row) => textStart(r) + (rowText(r).length * PER_CHAR) / 60 + 0.03;

/** Lines typed so far (fractional, eased 0.2 s as each new line starts). */
const linesNow = (r: Row, frame: number) => {
  const t = rowText(r);
  const ls = lines(t, r.kind === 'RUN' || r.kind === 'SEND' ? TEXT_W : NEST_W);
  const start = sec(textStart(r));
  let acc = 0;
  let n = 1;
  ls.forEach((l, i) => {
    if (i > 0) {
      const fr = start + acc * PER_CHAR;
      n += ease(frame, [fr, fr + sec(0.2)], [0, 1]);
    }
    acc += l.length + 1;
  });
  return {n, final: ls.length};
};

/** Current height of a row (0 before it appears; grows as its text types). */
export const rowHeightAt = (r: Row, frame: number) => {
  const appear = ease(frame, [sec(r.at - 0.05), sec(r.at + 0.2)], [0, 1]);
  if (appear <= 0) return 0;
  const {n} = linesNow(r, frame);
  let h: number;
  if (r.kind === 'RUN') {
    const tagsIn = tween(frame, rowTextEnd(r) - 0.1, rowTextEnd(r) + 0.15);
    h = PAD + n * LH + tagsIn * (16 + 44) + PAD;
  } else if (r.kind === 'SEND') h = PAD + n * LH + PAD;
  else h = PAD + 44 + 14 + n * LH + PAD;
  return h * appear;
};

const TypedBlock: React.FC<{text: string; frame: number; at: number; x: number; w: number; seed: string}> = ({text, frame, at, x, w, seed}) => {
  const n = typedCount(frame, sec(at), text.length, PER_CHAR, seed);
  return (
    <div style={{position: 'absolute', left: x, top: 0, width: w, fontSize: FS, lineHeight: `${LH}px`, fontWeight: 500, color: UI.ink, whiteSpace: 'normal'}}>
      {text.slice(0, n)}
      <span style={{opacity: 0}}>{text.slice(n)}</span>
    </div>
  );
};

/** One step row. Its tag pops, its text types (row grows to fit), its chip flies into "into". */
export const StepRow: React.FC<{r: Row; frame: number; dim: number}> = ({r, frame, dim}) => {
  const h = rowHeightAt(r, frame);
  if (h <= 0) return null;
  const tag = popIn(frame, r.at, 0.3, 1.04);
  const vis = tween(frame, r.at - 0.05, r.at + 0.15);
  const end = rowTextEnd(r);
  let body: React.ReactNode;
  if (r.kind === 'RUN') {
    const ls = lines(r.text, TEXT_W);
    const fly = kfIO(frame, [end, end + 0.35], [0, 1]);
    const last = ls[ls.length - 1];
    const from = {x: TEXT_X + measureText(last, FONT, 13) + 18, y: (ls.length - 1) * LH - 2};
    const chipW = measureText(r.into, `500 22px "JetBrains Mono"`, 13) + 70;
    const to = {x: STEPS_CARD.width - 48 - chipW, y: ls.length * LH + 16};
    const tags = tween(frame, end - 0.1, end + 0.15);
    body = (
      <>
        <div style={{position: 'absolute', left: 90, top: -2, transform: `scale(${tag})`, transformOrigin: 'left center'}}><TypeTag kind="RUN" /></div>
        <TypedBlock text={r.text} frame={frame} at={textStart(r)} x={TEXT_X} w={TEXT_W} seed={r.id} />
        <div style={{position: 'absolute', left: TEXT_X, top: ls.length * LH + 16, opacity: tags}}><InstructionTag /></div>
        <div style={{position: 'absolute', left: to.x - 60, top: ls.length * LH + 22, fontSize: 22, color: UI.text2, opacity: tags}}>into</div>
        <div style={{position: 'absolute', left: from.x + (to.x - from.x) * fly, top: from.y + (to.y - from.y) * fly - Math.sin(fly * Math.PI) * 30, opacity: tween(frame, end - 0.02, end + 0.1)}}>
          <VariableChip name={r.into} fontSize={22} height={40} glow={kfIO(frame, [end + 0.3, end + 0.45, end + 0.9], [0, 1, 0])} />
        </div>
      </>
    );
  } else if (r.kind === 'SEND') {
    body = (
      <>
        <div style={{position: 'absolute', left: 90, top: -2, transform: `scale(${tag})`, transformOrigin: 'left center'}}><TypeTag kind="SEND" /></div>
        <TypedBlock text={r.text} frame={frame} at={textStart(r)} x={TEXT_X} w={TEXT_W} seed={r.id} />
      </>
    );
  } else {
    const isIf = r.kind === 'IF';
    body = (
      <>
        <div style={{position: 'absolute', left: 90, top: 0, display: 'flex', alignItems: 'center', gap: 12, transform: `scale(${tag})`, transformOrigin: 'left center', fontSize: FS, fontWeight: 500, color: UI.ink, whiteSpace: 'nowrap'}}>
          <TypeTag kind={isIf ? 'IF' : 'ELSE'} />
          {isIf ? (
            <>
              <VariableChip name={(r as {cond: string}).cond} fontSize={22} height={40} />
              <span>{(r as {condIs: string}).condIs}</span>
            </>
          ) : null}
        </div>
        <div style={{position: 'absolute', left: 100, top: 52, width: 3, height: h - PAD * 2 - 52, borderRadius: 2, background: alpha(UI.iff.fg, 0.25)}} />
        <div style={{position: 'absolute', left: 120, top: 56, opacity: tween(frame, r.at + 0.15, r.at + 0.3)}}><TypeTag kind="SEND" /></div>
        <div style={{position: 'absolute', left: 0, top: 58}}>
          <TypedBlock text={r.send} frame={frame} at={textStart(r)} x={NEST_X} w={NEST_W} seed={r.id} />
        </div>
      </>
    );
  }
  return (
    <div style={{position: 'relative', height: h, opacity: vis * (1 - 0.55 * dim), fontFamily: UI_FONT, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 32, top: PAD + 6, fontSize: 22, color: '#9CA3AF', fontWeight: 500}}>{r.id}</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: PAD}}>{body}</div>
    </div>
  );
};

/** Total content height at a frame (for scrolling). */
export const bodyHeightAt = (sections: Section[], frame: number) =>
  sections.reduce((a, s, i) => a + (frame >= sec(s.at) ? SECTION_H * tween(frame, s.at, s.at + 0.25) : 0) + s.rows.reduce((b, r) => b + rowHeightAt(r, frame), 0) + (i > 0 && frame >= sec(s.at) ? SECTION_GAP : 0), 0);

/**
 * The Steps card: header (title + subtitle fully visible), sections whose
 * rows grow as they type. `active` spotlights one row (others at 45%).
 */
export const StepsCard: React.FC<{frame: number; sections: Section[]; active?: string; spotlight?: number; skeleton?: number}> = ({frame, sections, active, spotlight = 0, skeleton = 0}) => {
  const viewport = STEPS_CARD.height - STEPS_CARD.head - 24;
  const total = bodyHeightAt(sections, frame);
  const scroll = Math.max(0, total - viewport);
  return (
    <div data-safe="steps card" style={{position: 'absolute', left: STEPS_CARD.x, top: STEPS_CARD.y, width: STEPS_CARD.width, height: STEPS_CARD.height, fontFamily: UI_FONT, color: UI.ink}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: UI.radius + 6, background: COLORS.white, border: `1px solid ${UI.border}`, boxShadow: UI.shadow}} />
      <div style={{position: 'absolute', left: 32, top: 24, fontSize: 30, fontWeight: 700}}>Steps</div>
      <div style={{position: 'absolute', left: 32, top: 66, fontSize: 22, color: UI.text2, whiteSpace: 'nowrap'}}>Guide your agent with clear instructions, one step at a time.</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: STEPS_CARD.head, height: 1, background: UI.border}} />
      {/* skeleton placeholder rows (empty page state) */}
      {skeleton > 0 ? (
        <div style={{position: 'absolute', left: 32, right: 32, top: STEPS_CARD.head + 36, opacity: skeleton}}>
          {[0.7, 0.55, 0.62].map((w, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, height: 52, marginBottom: 24}}>
              <div style={{width: 60, height: 32, borderRadius: 8, background: '#F1F2F4'}} />
              <div style={{width: `${w * 100}%`, height: 20, borderRadius: 10, background: '#F1F2F4'}} />
            </div>
          ))}
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 0, right: 0, top: STEPS_CARD.head + 1, bottom: 0, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(180deg, transparent 0, #000 28px)', maskImage: 'linear-gradient(180deg, transparent 0, #000 28px)'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 12 - scroll}}>
          {sections.map((s, si) => {
            if (frame < sec(s.at)) return null;
            const t = tween(frame, s.at, s.at + 0.25);
            return (
              <div key={si} style={{paddingTop: si > 0 ? SECTION_GAP : 0}}>
                <div style={{height: SECTION_H * t, overflow: 'hidden', opacity: t * (active && spotlight > 0 ? 1 - 0.55 * spotlight : 1)}}>
                  <div style={{paddingLeft: 32, paddingTop: 12, fontSize: 26, fontWeight: 600, whiteSpace: 'nowrap'}}>
                    <span style={{color: '#9CA3AF'}}>{si + 1}.</span> {s.title}
                  </div>
                </div>
                {s.rows.map((r) => (
                  <StepRow key={r.id} r={r} frame={frame} dim={active && r.id !== active ? spotlight : 0} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/** World position of a row's text start (top-left of its first line) at a frame. */
export const rowTextAnchor = (sections: Section[], id: string, frame: number) => {
  const viewport = STEPS_CARD.height - STEPS_CARD.head - 24;
  const scroll = Math.max(0, bodyHeightAt(sections, frame) - viewport);
  let y = STEPS_CARD.y + STEPS_CARD.head + 1 + 12 - scroll;
  for (const [si, s] of sections.entries()) {
    if (frame < sec(s.at)) break;
    if (si > 0) y += SECTION_GAP;
    y += SECTION_H * tween(frame, s.at, s.at + 0.25);
    for (const r of s.rows) {
      if (r.id === id) {
        const nested = r.kind === 'IF' || r.kind === 'ELSE';
        return {x: STEPS_CARD.x + (nested ? NEST_X : TEXT_X), y: y + PAD + (nested ? 58 : 0), w: nested ? NEST_W : TEXT_W};
      }
      y += rowHeightAt(r, frame);
    }
  }
  return {x: STEPS_CARD.x + TEXT_X, y, w: TEXT_W};
};
export const STEP_FONT = {size: FS, lineHeight: LH};
