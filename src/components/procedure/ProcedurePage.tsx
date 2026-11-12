import React from 'react';
import {COLORS, FONT_MONO, FONT_SANS, alpha} from '../../theme';
import {CheckStroke, Tag, VariableChip} from '../Chip';
import {IconClose, IconPencil, IconPerson, IconRedo, IconUndo} from '../Icons';
import {Sweep} from '../Sweep';
import {StrokePolyline, roundedPolyline, Pt} from '../StrokeLine';
import {
  HEADER,
  ROW,
  ROWS,
  RowSpec,
  SECTIONS,
  SEND_VAR,
  STEPS,
  STEPS_HEAD,
  TOOLS,
  VAR_SPAN,
  handoverRange,
  rowLayout,
  sendVarRect,
} from './layout';
import {PAGE} from '../../handoff';

export const PAGE_TITLE = 'Block a lost card';
export const SECTION_TITLES = ['Verify identity', 'Block the card'];

export type RowAnim = {num: number; tag1: number; tag2: number; typed: number; into: number; chip: number; glow: number; sweep: number};
export type ProcedureAnim = {
  titleTyped: number;
  pencil: number;
  tools: [number, number, number, number];
  saved: number;
  savedCheck: number;
  savePress: number;
  steps: number;
  sections: [number, number];
  sectionTyped: [number, number];
  rows: RowAnim[];
  underline: number;
  person: number;
  flowDraw: number;
  flowDot?: number;
  flowDotOpacity: number;
  /** 0..1 white rounded frame around the whole page (card look). */
  frameCard: number;
};

const typedSpan = (text: string, n: number, style?: React.CSSProperties) => (
  <span style={{whiteSpace: 'pre', ...style}}>
    {text.slice(0, n)}
    <span style={{opacity: 0}}>{text.slice(n)}</span>
  </span>
);

const enter = (p: number, dy = 16): React.CSSProperties => ({opacity: p, transform: `translateY(${(1 - p) * dy}px)`});
const pop = (p: number): React.CSSProperties => ({opacity: p, transform: `scale(${0.9 + 0.1 * p})`});

/** Data flow route: card_last4 chip (1.1) -> {card_last4} (2.2), around the right edge. */
export const flowRoute = (): Pt[] => {
  const a = rowLayout(ROWS[0]);
  const v = sendVarRect();
  const right = SECTIONS[0].x + SECTIONS[0].width - 34;
  const bottom = SECTIONS[1].y + SECTIONS[1].height - 24;
  return roundedPolyline(
    [
      {x: a.chipX + a.chipW + 6, y: a.cy},
      {x: right, y: a.cy},
      {x: right, y: bottom},
      {x: v.x + v.w / 2, y: bottom},
      {x: v.x + v.w / 2, y: v.cy + v.h / 2 + 2},
    ],
    26,
  );
};

const Row: React.FC<{spec: RowSpec; a: RowAnim}> = ({spec, a}) => {
  const l = rowLayout(spec);
  const H = 44;
  const top = l.cy - H / 2;
  const cell = (x: number, style: React.CSSProperties, children: React.ReactNode) => (
    <div style={{position: 'absolute', left: x, top, height: H, display: 'flex', alignItems: 'center', ...style}}>{children}</div>
  );
  let text: React.ReactNode;
  if (spec.kind === 'RUN') text = typedSpan(spec.text, a.typed);
  else {
    const [before, after] = spec.text.split(SEND_VAR);
    const n1 = Math.min(a.typed, before.length);
    const n2 = Math.max(0, Math.min(SEND_VAR.length, a.typed - before.length));
    const n3 = Math.max(0, a.typed - before.length - SEND_VAR.length);
    text = (
      <>
        {typedSpan(before, n1)}
        <span
          style={{
            display: 'inline-block',
            padding: `0 ${VAR_SPAN.padX}px`,
            borderRadius: 6,
            background: n2 > 0 ? COLORS.chipMint : 'transparent',
            color: COLORS.chipMintText,
            fontFamily: FONT_MONO,
            fontWeight: 500,
            fontSize: VAR_SPAN.fontSize,
            lineHeight: `${VAR_SPAN.fontSize * 1.5}px`,
          }}
        >
          {typedSpan(SEND_VAR, n2)}
        </span>
        {typedSpan(after, n3)}
      </>
    );
  }
  return (
    <>
      {cell(ROW.x0, {...enter(a.num, 8), fontFamily: FONT_SANS, fontSize: 21, fontWeight: 500, color: COLORS.faint}, spec.id)}
      {cell(l.tag1X, {...pop(a.tag1), transformOrigin: 'left center'}, <Tag label={spec.kind} fontSize={ROW.tagSize} />)}
      {spec.kind === 'RUN'
        ? cell(l.tag2X, {...pop(a.tag2), transformOrigin: 'left center'}, <Tag label="Instruction" tone="blue" fontSize={ROW.tagSize} />)
        : null}
      {cell(l.textX, {fontFamily: FONT_SANS, fontSize: ROW.textSize, color: COLORS.ink}, text)}
      {spec.variable ? (
        <>
          {cell(l.intoX, {...enter(a.into, 8), fontFamily: FONT_SANS, fontSize: ROW.textSize, color: COLORS.muted}, 'into')}
          {cell(
            l.chipX,
            {...pop(a.chip), transformOrigin: 'center'},
            <VariableChip name={spec.variable} fontSize={ROW.chipSize} glow={a.glow} />,
          )}
          {/* lime sweep across the chip */}
          <div
            style={{
              position: 'absolute',
              left: l.chipX,
              top: l.cy - ROW.chipSize * 0.9,
              width: l.chipW,
              height: ROW.chipSize * 1.8,
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            <Sweep progress={a.sweep} width={l.chipW} strength={0.85} />
          </div>
        </>
      ) : null}
    </>
  );
};

/**
 * The BotCircuits Procedure editor, rebuilt as React components. Pure
 * function of its animation state; world coordinates (1920x1080 page).
 */
export const ProcedurePage: React.FC<{a: ProcedureAnim}> = ({a}) => {
  const titleSize = HEADER.titleSize;
  const hover = handoverRange();
  const l12 = rowLayout(ROWS[1]);
  return (
    <div style={{position: 'absolute', left: 0, top: 0}}>
      {/* optional card frame around the page (scenes 6 end / 7) */}
      <div
        style={{
          position: 'absolute',
          left: PAGE.x,
          top: PAGE.y,
          width: PAGE.width,
          height: PAGE.height,
          borderRadius: 36,
          background: COLORS.white,
          border: `2px solid ${COLORS.line}`,
          boxShadow: '0 60px 140px rgba(11,13,12,0.14)',
          opacity: a.frameCard,
        }}
      />

      {/* ---- page header ---- */}
      <div
        style={{
          position: 'absolute',
          left: HEADER.titleX,
          top: HEADER.cy - titleSize * 0.7,
          height: titleSize * 1.4,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          fontFamily: FONT_SANS,
          fontWeight: 600,
          fontSize: titleSize,
          letterSpacing: '-0.015em',
          color: COLORS.ink,
        }}
      >
        {typedSpan(PAGE_TITLE, a.titleTyped)}
        <span style={{...pop(a.pencil), color: COLORS.muted, display: 'inline-block'}}>
          <IconPencil size={30} stroke={2} />
        </span>
      </div>
      {[
        {x: TOOLS.undoX, el: <IconUndo size={30} stroke={2} />},
        {x: TOOLS.redoX, el: <IconRedo size={30} stroke={2} />},
      ].map((t, i) => (
        <div key={i} style={{position: 'absolute', left: t.x, top: HEADER.cy - 15, color: COLORS.muted, ...enter(a.tools[i], 12)}}>
          {t.el}
        </div>
      ))}
      <div
        style={{
          position: 'absolute',
          left: TOOLS.autoX,
          top: HEADER.cy - 18,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          fontFamily: FONT_SANS,
          fontSize: 22,
          fontWeight: 500,
          color: COLORS.muted,
          ...enter(a.tools[2], 12),
        }}
      >
        Auto save
        <span style={{position: 'relative', width: 54, height: 30, borderRadius: 15, background: COLORS.tagGrey, border: `1px solid ${COLORS.line}`, display: 'inline-block'}}>
          <span style={{position: 'absolute', left: 3, top: 3, width: 22, height: 22, borderRadius: 11, background: COLORS.white, boxShadow: '0 1px 3px rgba(11,13,12,0.25)'}} />
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: TOOLS.saveX,
          top: HEADER.cy - TOOLS.saveH / 2,
          width: TOOLS.saveW,
          height: TOOLS.saveH,
          ...enter(a.tools[3], 12),
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 14,
            background: COLORS.buttonGrey,
            transform: `scale(${a.savePress})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT_SANS,
            fontSize: 23,
            fontWeight: 600,
            color: COLORS.white,
          }}
        >
          <span style={{position: 'absolute', opacity: 1 - a.saved, transform: `translateY(${-a.saved * 12}px)`}}>Save</span>
          <span
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: a.saved,
              transform: `translateY(${(1 - a.saved) * 12}px)`,
            }}
          >
            <CheckStroke size={24} draw={a.savedCheck} color={COLORS.lime} width={2.8} />
            Saved
          </span>
        </div>
      </div>

      {/* ---- Steps card ---- */}
      <div style={{position: 'absolute', left: 0, top: 0, ...enter(a.steps, 24)}}>
        <div
          style={{
            position: 'absolute',
            left: STEPS.x,
            top: STEPS.y,
            width: STEPS.width,
            height: STEPS.height,
            borderRadius: STEPS.radius,
            background: COLORS.white,
            border: `1px solid ${COLORS.line}`,
            boxShadow: '0 24px 60px rgba(11,13,12,0.07), 0 2px 8px rgba(11,13,12,0.04)',
          }}
        />
        <div style={{position: 'absolute', left: STEPS_HEAD.x, top: STEPS_HEAD.titleCy - 20, fontFamily: FONT_SANS, fontWeight: 700, fontSize: 30, lineHeight: '40px', color: COLORS.ink}}>
          Steps
        </div>
        <div style={{position: 'absolute', left: STEPS_HEAD.x, top: STEPS_HEAD.subCy - 15, fontFamily: FONT_SANS, fontSize: 21, lineHeight: '30px', color: COLORS.muted, whiteSpace: 'nowrap'}}>
          Guide your agent with clear instructions, one step at a time.
        </div>
        <div style={{position: 'absolute', left: STEPS.x + STEPS.width - 60, top: STEPS_HEAD.titleCy - 14, color: COLORS.muted}}>
          <IconClose size={28} stroke={2} />
        </div>

        {SECTIONS.map((s, i) => (
          <div key={i} style={{position: 'absolute', left: 0, top: 0, ...enter(a.sections[i], 24)}}>
            <div
              style={{
                position: 'absolute',
                left: s.x,
                top: s.y,
                width: s.width,
                height: s.height,
                borderRadius: 16,
                background: '#FAFBFA',
                border: `1px solid ${COLORS.lineSoft}`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: s.x + 32,
                top: s.titleCy - 18,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                fontFamily: FONT_SANS,
                fontSize: 26,
                fontWeight: 600,
                color: COLORS.ink,
                whiteSpace: 'pre',
              }}
            >
              <span style={{color: COLORS.faint, opacity: a.sectionTyped[i] > 0 ? 1 : 0}}>{`${i + 1}.  `}</span>
              {typedSpan(SECTION_TITLES[i], a.sectionTyped[i])}
            </div>
          </div>
        ))}

        {ROWS.map((r, i) => (
          <div key={r.id} style={{position: 'absolute', left: 0, top: 0, opacity: a.sections[r.section]}}>
            <Row spec={r} a={a.rows[i]} />
          </div>
        ))}

        {/* human in the loop: ink underline + abstract person glyph */}
        <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
          <path
            d={`M ${hover.x0} ${hover.y} L ${hover.x1} ${hover.y}`}
            stroke={COLORS.ink}
            strokeWidth={2.5}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - a.underline}
            opacity={a.underline > 0 ? 1 : 0}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            left: l12.personX,
            top: l12.cy - 17,
            width: 34,
            height: 34,
            borderRadius: 17,
            background: COLORS.ink,
            color: COLORS.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...pop(a.person),
          }}
        >
          <IconPerson size={20} stroke={2} color={COLORS.white} />
        </div>

        {/* data flowing between steps */}
        <StrokePolyline
          points={flowRoute()}
          draw={a.flowDraw}
          dot={a.flowDot}
          dotOpacity={a.flowDotOpacity}
          color={COLORS.chipMintText}
          dotColor={COLORS.lime}
          width={2.5}
          dotSize={14}
        />
      </div>
    </div>
  );
};

export const glowShadow = (g: number) => `0 0 ${24 * g}px ${alpha(COLORS.lime, 0.6 * g)}`;
