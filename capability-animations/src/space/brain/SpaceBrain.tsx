import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Card} from '../../components/Card';
import {Chip} from '../../components/Chip';
import {ConnectionLine, fanCurve} from '../../components/ConnectionLine';
import {Counter} from '../../components/Counter';
import {HEIGHT, WIDTH} from '../../config';
import {mix, progress} from '../../motion';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {ANSWER, AnswerBlock} from '../components/AnswerBlock';
import {CitationChip} from '../components/CitationChip';
import {PermissionChip} from '../components/PermissionChip';
import {DocumentPreview, ImagePreview, PREVIEW, PreviewCard, TablePreview} from '../components/PreviewCard';
import {QUESTION_PILL, QuestionPill} from '../components/QuestionPill';
import {SOURCE_ROW, SourceRow} from '../components/SourceRow';
import {
  ANSWER_TEXT,
  ANSWER_TITLE,
  CITATIONS,
  CLAIM_CHIP,
  ITEMS_TOTAL,
  PERMISSION,
  PREVIEWS,
  QUESTION,
  SOURCES,
  SOURCES_TITLE,
} from './content';
import {SPACE_BRAIN_TIMELINE as T} from './timeline';

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

const HEADER = 72;
const CARD_H = 640;
const CARD_Y = (HEIGHT - CARD_H) / 2;
const SOURCES_CARD = {x: 60, width: 420};
const ANSWER_CARD = {x: 520, width: 1020};
const BODY_PAD = 28;
const BODY_W = ANSWER_CARD.width - BODY_PAD * 2;
const BODY_H = CARD_H - HEADER - BODY_PAD * 2;

/* Answer body, top down (fixed from the start so nothing jumps). */
const ANSWER_TOP = QUESTION_PILL.height + 20;
const ANSWER_H = ANSWER.lineHeight * 3; // reserved for up to three lines
const PREVIEWS_TOP = ANSWER_TOP + ANSWER_H + 20;
const PREVIEW_GAP = 16;
const PREVIEWS_W = PREVIEW.width * 3 + PREVIEW_GAP * 2; // 920
const FOOTER_H = 28;

/* Lines from rows 1 to 3 into the answer card's left edge. */
const rowCentreY = (i: number) => CARD_Y + HEADER + i * SOURCE_ROW.height + SOURCE_ROW.height / 2;
const LINE_TARGET = {x: ANSWER_CARD.x, y: CARD_Y + HEADER + BODY_PAD + ANSWER_TOP + ANSWER.orb / 2};
const LINES = [0, 1, 2].map((i) => fanCurve({x: SOURCES_CARD.x + SOURCES_CARD.width, y: rowCentreY(i)}, LINE_TARGET));

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export const SpaceBrain: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const f = (s: number) => s * fps;
  const p = (a: number, b: number) => progress(frame, f(a), f(b));
  const rise = (v: number): React.CSSProperties => ({opacity: v, transform: `translateY(${mix(12, 0, v)}px)`});

  /* Sources */
  const sourcesIn = p(T.sourcesIn.start, T.sourcesIn.end);
  const rowIn = SOURCES.map((_, i) => p(T.rowsIn.start + i * T.rowsIn.stagger, T.rowsIn.start + i * T.rowsIn.stagger + T.rowsIn.duration));
  const done = T.ticks.map((t) => p(t, t + T.tickFade));
  const tickDraw = T.ticks.map((t) => p(t, t + T.tickFade + 0.15));
  const items = ITEMS_TOTAL * p(T.counter.start, T.counter.end);

  /* Answer card */
  const answerIn = p(T.answerIn.start, T.answerIn.end);
  const questionIn = p(T.question.start, T.question.start + 0.15);
  const S = T.search;
  const searchOut = p(T.searchOut.start, T.searchOut.start + T.searchOut.duration);
  const lines = p(S.start, S.start + S.lines);
  const outline = p(S.start, S.start + S.outline) * (1 - searchOut);
  const orb = p(S.orbStart, S.orbEnd);
  const answerCps = ANSWER_TEXT.length / (T.answer.end - T.answer.start);

  const chipIn = CITATIONS.map((_, i) => p(T.chipsIn.start + i * T.chipsIn.stagger, T.chipsIn.start + i * T.chipsIn.stagger + T.chipsIn.duration));
  const chipActive = T.reveals.map((r) => p(r.chip, r.chip + T.chipActivate));
  const previewIn = T.reveals.map((r) => p(r.preview, r.preview + T.previewIn));
  const highlight = T.reveals.map((r) => p(r.highlight, r.highlight + r.highlightDuration));
  const textRead = p(T.textReadChip.start, T.textReadChip.start + T.textReadChip.duration);
  const footer = p(T.footer.start, T.footer.end);

  const fadeOut = progress(frame, f(T.fadeOut.start), durationInFrames - 1);

  const header = (title: string, right: React.ReactNode, dot = false) => (
    <div
      style={{
        height: HEADER,
        boxSizing: 'border-box',
        padding: '0 24px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
        <span style={{fontSize: 20, fontWeight: fontWeights.semibold, letterSpacing: '-0.01em', color: colors.text}}>{title}</span>
        {dot && <span style={{width: 6, height: 6, borderRadius: '50%', background: colors.lime}} />}
      </div>
      {right}
    </div>
  );

  const previews = [
    <PreviewCard key="doc" kind="file" title={PREVIEWS.document.title}>
      <DocumentPreview passage={PREVIEWS.document.passage} reveal={highlight[0]} />
    </PreviewCard>,
    <PreviewCard key="table" kind="table" title={PREVIEWS.table.title}>
      <TablePreview columns={PREVIEWS.table.columns} rows={PREVIEWS.table.rows} highlightRow={PREVIEWS.table.highlightRow} reveal={highlight[1]} />
    </PreviewCard>,
    <PreviewCard key="img" kind="image" title={PREVIEWS.image.title}>
      <ImagePreview total={PREVIEWS.image.total} reveal={highlight[2]} chip={PREVIEWS.image.chip} chipIn={textRead} />
    </PreviewCard>,
  ];

  return (
    <AbsoluteFill style={{background: colors.background, fontFamily}}>
      <AbsoluteFill style={{opacity: 1 - fadeOut}}>
        {/* Sources */}
        <div style={{position: 'absolute', left: SOURCES_CARD.x, top: CARD_Y, ...rise(sourcesIn)}}>
          <Card width={SOURCES_CARD.width} height={CARD_H}>
            {header(
              SOURCES_TITLE,
              <Counter
                value={items}
                suffix=" items"
                label=""
                showLabel={false}
                numberSize={15}
                numberWeight={fontWeights.medium}
                numberColor={colors.textSecondary}
                numberLetterSpacing="0"
                format={(n) => n.toLocaleString('en-US')}
              />,
              true,
            )}
            {SOURCES.map((s, i) => (
              <div key={s.name} style={{position: 'absolute', left: 0, top: HEADER + i * SOURCE_ROW.height, ...rise(rowIn[i])}}>
                <SourceRow
                  width={SOURCES_CARD.width - 2}
                  kind={s.kind}
                  name={s.name}
                  detail={s.detail}
                  dashed={s.dashed}
                  spinner={rowIn[i]}
                  done={done[i] ?? 0}
                  tick={tickDraw[i] ?? 0}
                  active={i < 3 ? outline : 0}
                />
              </div>
            ))}
          </Card>
        </div>

        {/* Answer */}
        {answerIn > 0 && (
          <div style={{position: 'absolute', left: ANSWER_CARD.x, top: CARD_Y, ...rise(answerIn)}}>
            <Card width={ANSWER_CARD.width} height={CARD_H}>
              {header(ANSWER_TITLE, <Chip label={CLAIM_CHIP} fontSize={14} height={28} paddingX={12} />)}
              <div style={{position: 'absolute', left: BODY_PAD, top: HEADER + BODY_PAD, width: BODY_W, height: BODY_H}}>
                {questionIn > 0 && (
                  <div style={{position: 'absolute', right: 0, top: 0}}>
                    <QuestionPill text={QUESTION} startFrame={Math.round(f(T.question.start))} cps={T.question.cps} opacity={questionIn} />
                  </div>
                )}
                <div style={{position: 'absolute', left: 0, top: ANSWER_TOP, height: ANSWER_H}}>
                  <AnswerBlock
                    text={ANSWER_TEXT}
                    startFrame={Math.round(f(T.answer.start))}
                    cps={answerCps}
                    orb={orb}
                    chips={CITATIONS.map((c, i) => (
                      <span key={c.label} style={{marginLeft: 8}}>
                        <CitationChip kind={c.kind} label={c.label} number={i + 1} active={chipActive[i]} opacity={chipIn[i]} />
                      </span>
                    ))}
                  />
                </div>
                <div
                  style={{
                    position: 'absolute',
                    left: (BODY_W - PREVIEWS_W) / 2,
                    top: PREVIEWS_TOP,
                    display: 'flex',
                    gap: PREVIEW_GAP,
                  }}
                >
                  {previews.map((node, i) => (
                    <div key={i} style={{width: PREVIEW.width, height: PREVIEW.height, ...rise(previewIn[i])}}>
                      {previewIn[i] > 0 ? node : null}
                    </div>
                  ))}
                </div>
                {footer > 0 && (
                  <div style={{position: 'absolute', left: 0, right: 0, top: BODY_H - FOOTER_H, display: 'flex', justifyContent: 'center', ...rise(footer)}}>
                    <PermissionChip label={PERMISSION} />
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Search lines, above both cards */}
        <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0, opacity: 1 - searchOut}}>
          {LINES.map((c, i) => (
            <ConnectionLine key={i} curve={c} draw={lines} />
          ))}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
