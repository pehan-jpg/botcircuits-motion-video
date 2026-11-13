import React from 'react';
import {COLORS, alpha, kfIO, popIn, tween} from '../theme';
import {sec} from '../timeline';
import {UI, UI_FONT, UI_FAMILY} from './tokens';
import {CONTENT} from '../v7';
import {VariableChip} from '../components/Chip';
import {typedCount} from '../components/TypingText';
import {measureText} from '../components/measure';

export type TagKind = 'RUN' | 'IF' | 'ELSE' | 'SEND' | 'SET';
const TAG_COL: Record<TagKind, {bg: string; fg: string}> = {RUN: UI.run, IF: UI.iff, ELSE: UI.iff, SEND: UI.send, SET: UI.set};

/** Type tag (RUN blue, IF/ELSE violet, SEND orange, SET teal). */
export const TypeTag: React.FC<{kind: TagKind; scale?: number}> = ({kind, scale = 1}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 44,
      padding: '0 14px',
      borderRadius: 10,
      background: TAG_COL[kind].bg,
      color: TAG_COL[kind].fg,
      fontFamily: UI_FONT,
      fontWeight: 700,
      fontSize: 26,
      letterSpacing: '0.04em',
      transform: `scale(${scale})`,
      transformOrigin: 'left center',
      whiteSpace: 'nowrap',
    }}
  >
    {kind === 'ELSE' ? 'ELSE' : kind}
  </span>
);

export const InstructionTag: React.FC = () => (
  <span style={{display: 'inline-flex', alignItems: 'center', height: 42, padding: '0 14px', borderRadius: 10, background: UI.instruction.bg, color: UI.instruction.fg, fontFamily: UI_FONT, fontWeight: 500, fontSize: 28}}>
    Instruction
  </span>
);

// ---- the content -------------------------------------------------------------
const FS = 31;
const LH = 44;
const TEXT_X = 196;
const TEXT_W = 760;
const FONT = `500 ${FS}px "${UI_FAMILY}"`;
const wrap = (t: string, w0 = TEXT_W) => {
  const w = w0 * 0.86; // conservative line estimate (real wrapping is native)
  const out: string[] = [];
  let cur = '';
  for (const word of t.split(' ')) {
    const n = cur ? `${cur} ${word}` : word;
    if (cur && measureText(n, FONT, 17) > w) {
      out.push(cur + ' ');
      cur = word;
    } else cur = n;
  }
  if (cur) out.push(cur);
  return out;
};

export type Row =
  | {id: string; kind: 'RUN'; text: string; into: string; at: number}
  | {id: string; kind: 'IF'; cond: string; condIs: string; send: string; at: number}
  | {id: string; kind: 'ELSE'; send: string; at: number}
  | {id: string; kind: 'SEND'; text: string; at: number};

export type Section = {title: string; rows: Row[]; at: number};

const rowHeight = (r: Row) => {
  if (r.kind === 'RUN') return wrap(r.text).length * LH + 16 + 50 + 30;
  if (r.kind === 'SEND') return wrap(r.text).length * LH + 30;
  return 60 + wrap(r.send, TEXT_W - 60).length * LH + 34;
};
const SECTION_TITLE = 64;

/** y offset of a row (within the scrolling body). */
export const layoutRows = (sections: Section[]) => {
  const out: Record<string, {y: number; h: number}> = {};
  let y = 0;
  sections.forEach((s, si) => {
    out[`s${si}`] = {y, h: SECTION_TITLE};
    y += SECTION_TITLE;
    s.rows.forEach((r) => {
      const h = rowHeight(r);
      out[r.id] = {y, h};
      y += h;
    });
    y += 20;
  });
  return {rows: out, total: y};
};

/** One step row. Its tag pops, its text types, its variable chip flies into "into". */
export const StepRow: React.FC<{r: Row; frame: number; active: number; perChar?: number}> = ({r, frame, active, perChar = 0.5}) => {
  const tag = popIn(frame, r.at, 0.3, 1.04);
  const vis = tween(frame, r.at - 0.05, r.at + 0.15);
  const typeAt = sec(r.at + 0.15);
  const typed = (t: string) => typedCount(frame, typeAt, t.length, perChar, r.id + t);
  const lineBlock = (t: string, x: number, w: number) => {
    const n = typed(t);
    // native wrapping inside a fixed width: never overflows, layout stays stable
    return (
      <div style={{position: 'absolute', left: x, top: 6, width: w, fontSize: FS, lineHeight: `${LH}px`, fontWeight: 500, color: UI.ink, whiteSpace: 'normal', overflowWrap: 'break-word'}}>
        {t.slice(0, n)}
        <span style={{opacity: 0}}>{t.slice(n)}</span>
      </div>
    );
  };
  const textEnd = (t: string) => r.at + 0.15 + (t.length * perChar) / sec(1) + 0.05;
  const glow = active;
  const num = <div style={{position: 'absolute', left: 30, top: 14, fontSize: 28, color: '#9CA3AF', fontWeight: 500}}>{r.id}</div>;
  let body: React.ReactNode = null;
  if (r.kind === 'RUN') {
    const lines = wrap(r.text).length;
    const end = textEnd(r.text);
    const fly = kfIO(frame, [end, end + 0.35], [0, 1]);
    const chipIn = tween(frame, end - 0.02, end + 0.1);
    const lastLine = wrap(r.text)[lines - 1];
    const from = {x: TEXT_X + measureText(lastLine, FONT, 17) + 20, y: 6 + (lines - 1) * LH};
    const to = {x: TEXT_X + TEXT_W - 250, y: lines * LH + 22};
    body = (
      <>
        <div style={{position: 'absolute', left: 92, top: 6, transform: `scale(${tag})`, transformOrigin: 'left center'}}>
          <TypeTag kind="RUN" />
        </div>
        {lineBlock(r.text, TEXT_X, TEXT_W)}
        <div style={{position: 'absolute', left: TEXT_X, top: lines * LH + 22, opacity: tween(frame, end - 0.1, end + 0.1)}}>
          <InstructionTag />
        </div>
        <div style={{position: 'absolute', left: to.x - 64, top: to.y + 6, fontSize: 28, color: UI.text2, opacity: tween(frame, end, end + 0.2)}}>into</div>
        <div
          style={{
            position: 'absolute',
            left: from.x + (to.x - from.x) * fly,
            top: from.y + (to.y - from.y) * fly - Math.sin(fly * Math.PI) * 40,
            opacity: chipIn,
            transform: `scale(${0.8 + 0.2 * fly})`,
            transformOrigin: 'left center',
          }}
        >
          <VariableChip name={r.into} fontSize={26} height={44} glow={kfIO(frame, [end + 0.3, end + 0.45, end + 0.9], [0, 1, 0])} />
        </div>
      </>
    );
  } else if (r.kind === 'SEND') {
    body = (
      <>
        <div style={{position: 'absolute', left: 92, top: 6, transform: `scale(${tag})`, transformOrigin: 'left center'}}>
          <TypeTag kind="SEND" />
        </div>
        {lineBlock(r.text, TEXT_X, TEXT_W)}
      </>
    );
  } else {
    const isIf = r.kind === 'IF';
    body = (
      <>
        <div style={{position: 'absolute', left: 92, top: 6, display: 'flex', alignItems: 'center', gap: 14, transform: `scale(${tag})`, transformOrigin: 'left center'}}>
          <TypeTag kind={isIf ? 'IF' : 'ELSE'} />
          {isIf ? (
            <>
              <VariableChip name={(r as {cond: string}).cond} fontSize={26} height={44} />
              <span style={{fontSize: FS, fontWeight: 500, color: UI.ink}}>{(r as {condIs: string}).condIs}</span>
            </>
          ) : null}
        </div>
        <div style={{position: 'absolute', left: 92, top: 64, width: 4, height: rowHeight(r) - 84, borderRadius: 2, background: alpha(UI.iff.fg, 0.25)}} />
        <div style={{position: 'absolute', left: 120, top: 64, opacity: tween(frame, r.at + 0.2, r.at + 0.35)}}>
          <TypeTag kind="SEND" />
        </div>
        <div style={{position: 'absolute', left: 0, top: 58}}>{lineBlock(r.send, TEXT_X + 60, TEXT_W - 60)}</div>
      </>
    );
  }
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: rowHeight(r), opacity: vis, fontFamily: UI_FONT}}>
      {glow > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            top: -6,
            bottom: 4,
            borderRadius: 16,
            background: alpha('#8B5CF6', 0.06 * glow),
            boxShadow: `0 0 0 2px ${alpha('#8B5CF6', 0.45 * glow)}, 0 0 40px ${alpha('#8B5CF6', 0.35 * glow)}`,
          }}
        />
      ) : null}
      {num}
      {body}
    </div>
  );
};

export const STEPS_CARD = {x: CONTENT.x + 24, y: CONTENT.y + 22, width: CONTENT.width - 48, height: CONTENT.height - 44, head: 132};

/** The Steps card: header, then sections whose body scrolls. */
export const StepsCard: React.FC<{frame: number; sections: Section[]; scroll: number; activeRow?: string; activeGlow?: number}> = ({frame, sections, scroll, activeRow, activeGlow = 0}) => {
  const L = layoutRows(sections);
  return (
    <div style={{position: 'absolute', left: STEPS_CARD.x, top: STEPS_CARD.y, width: STEPS_CARD.width, height: STEPS_CARD.height, fontFamily: UI_FONT, color: UI.ink}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: UI.radius + 6, background: COLORS.white, border: `1px solid ${UI.border}`, boxShadow: UI.shadow}} />
      <div style={{position: 'absolute', left: 32, top: 24, fontSize: 34, fontWeight: 700}}>Steps</div>
      <div style={{position: 'absolute', left: 32, top: 72, fontSize: 30, color: UI.text2, whiteSpace: 'nowrap'}}>Guide your agent with clear instructions, one step at a time.</div>
      <svg style={{position: 'absolute', right: 30, top: 30}} width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round">
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: STEPS_CARD.head, height: 1, background: UI.border}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: STEPS_CARD.head + 1, bottom: 0, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 18, transform: `translateY(${-scroll}px)`}}>
          {sections.map((s, si) => (
            <React.Fragment key={si}>
              <div
                style={{
                  position: 'absolute',
                  left: 30,
                  top: L.rows[`s${si}`].y + 8,
                  fontSize: 32,
                  fontWeight: 600,
                  opacity: tween(frame, s.at, s.at + 0.25),
                  transform: `translateY(${(1 - tween(frame, s.at, s.at + 0.35)) * 30}px)`,
                }}
              >
                <span style={{color: '#9CA3AF'}}>{si + 1}.</span> {s.title}
              </div>
              {s.rows.map((r) => (
                <div key={r.id} style={{position: 'absolute', left: 0, right: 0, top: L.rows[r.id].y}}>
                  <StepRow r={r} frame={frame} active={activeRow === r.id ? activeGlow : 0} />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

