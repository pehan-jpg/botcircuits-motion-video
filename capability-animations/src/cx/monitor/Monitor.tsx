import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Card} from '../../components/Card';
import {ChannelIconBox} from '../../components/ChannelGlyph';
import {ContextCard, contextCardHeight} from '../../components/ContextCard';
import {Initials} from '../../components/ContextBar';
import {CONVERSATION_ROW, ConversationRow, mmss} from '../../components/ConversationRow';
import {LiveCounter} from '../../components/LiveCounter';
import {NoticeRow} from '../../components/NoticeRow';
import {Orb} from '../../components/Orb';
import {BadgeSwap, StatusBadge} from '../../components/StatusBadge';
import {TakeOverButton} from '../../components/TakeOverButton';
import {TRACE_ROW, TraceRow} from '../../components/TraceRow';
import {BUBBLE, TranscriptBubble} from '../../components/TranscriptBubble';
import {HEIGHT} from '../../config';
import {mix, progress} from '../../motion';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {
  ATTENTION_SNIPPET,
  CONVERSATIONS,
  COUNTER_VALUES,
  CUSTOMER,
  LIST_TITLE,
  NEEDS_ATTENTION,
  TRANSCRIPT,
  WITH_DANIEL,
  WITH_DANIEL_SHORT,
} from './content';
import {MONITOR_TIMELINE as T} from './timeline';

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

const CARD_H = 700;
const CARD_Y = (HEIGHT - CARD_H) / 2;
const HEADER = 72;
const LEFT = {x: 60, width: 560};
const RIGHT = {x: 720, width: 820};
const FOOTER = 88;
const BODY_PAD = 24;
const BODY_H = CARD_H - HEADER - FOOTER;
const BODY_INNER_H = BODY_H - BODY_PAD * 2;
const BODY_INNER_W = RIGHT.width - BODY_PAD * 2;

/** Agent block: orb heads the turn; traces and reply sit 40px in. */
const AGENT_INDENT = 40;
/** Height of the soft fade at the top of the scrolled transcript. */
const TOP_FADE = 32;

/* Transcript items, top down, with fixed heights (no DOM measurement). */
const lines = (n: number) => n * BUBBLE.lineHeight + BUBBLE.padY * 2;
const ITEMS = {
  // Spacing is tightened because the full transcript is taller than the body.
  customer1: {gap: 0, h: lines(1)},
  trace0: {gap: 10, h: TRACE_ROW.height},
  trace1: {gap: 4, h: TRACE_ROW.height},
  trace2: {gap: 4, h: TRACE_ROW.height},
  agent: {gap: 8, h: lines(2) + 2},
  customer2: {gap: 10, h: lines(1)},
  notice: {gap: 8, h: 40},
  context: {gap: 10, h: contextCardHeight},
  daniel: {gap: 10, h: lines(2) + 2},
} as const;
type ItemKey = keyof typeof ITEMS;
const ORDER = Object.keys(ITEMS) as ItemKey[];
const TOPS = ORDER.reduce<Record<string, number>>((acc, k, i) => {
  const prev = ORDER[i - 1];
  acc[k] = i === 0 ? 0 : acc[prev] + ITEMS[prev].h + ITEMS[k].gap;
  return acc;
}, {}) as Record<ItemKey, number>;

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export const Monitor: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const f = (s: number) => s * fps;
  const p = (a: number, b: number) => progress(frame, f(a), f(b));
  const fitCps = (text: string, w: {start: number; end: number}) => text.length / (w.end - w.start);

  /* Left card */
  const leftIn = p(T.leftIn.start, T.leftIn.end);
  const rowStart = (i: number) => T.rowsIn.start + i * T.rowsIn.stagger;
  const rowIn = CONVERSATIONS.map((_, i) => p(rowStart(i), rowStart(i) + T.rowsIn.duration));
  const counterSteps = [0, 1, 2].map((k) =>
    p(T.counterRoll.start + k * T.counterRoll.step, T.counterRoll.start + (k + 1) * T.counterRoll.step),
  );
  const D = T.listDrift;
  const drift = D.distance * p(D.start, D.end) * (1 - p(D.backStart, D.backEnd));

  const A = T.attention;
  const snippetMix = p(A.start, A.start + A.snippetFade);
  const attentionPill = p(A.pillStart, A.pillStart + A.pillFade);

  const K = T.takeOver;
  const takeOverIn = p(K.start, K.start + K.duration);
  const press = p(K.press, K.press + K.pressDuration);
  const doneStart = K.press + K.pressDuration;
  const done = p(doneStart, doneStart + K.doneDuration);
  const doneTick = p(doneStart + 0.05, doneStart + K.doneDuration + 0.15);
  // Header and row badges swap at the same moment.
  const swap = p(doneStart, doneStart + T.statusSwap.duration);
  const highlight = p(A.start, A.start + A.highlight) * (1 - swap);

  /* Right card */
  const rightIn = p(T.rightIn.start, T.rightIn.end);

  const startOf: Record<ItemKey, number> = {
    customer1: T.customer1.start,
    trace0: T.traces.start,
    trace1: T.traces.start + T.traces.stagger,
    trace2: T.traces.start + T.traces.stagger * 2,
    agent: T.agentReply.start,
    customer2: T.customer2.start,
    notice: T.notice.start,
    context: T.contextCard.start,
    daniel: T.danielReply.start,
  };
  const itemIn = (k: ItemKey) => p(startOf[k], startOf[k] + T.itemIn);

  // Auto scroll: keep the newest item inside the body, easing as it arrives.
  const scrollIn = (k: ItemKey) => p(startOf[k], startOf[k] + T.scrollEase);
  const bottom = ORDER.reduce((sum, k) => sum + (ITEMS[k].gap + ITEMS[k].h) * scrollIn(k), 0);
  const scroll = Math.max(0, bottom - BODY_INNER_H);

  const orbIn = p(T.agentOrb.start, T.agentOrb.start + T.agentOrb.duration);
  const C = T.contextCard;
  const chipIn = TRANSCRIPT.context.chips.map((_, i) =>
    p(C.chipsStart + i * C.chipStagger, C.chipsStart + i * C.chipStagger + C.chipDuration),
  );

  const fadeOut = progress(frame, f(T.fadeOut.start), durationInFrames - 1);

  const place = (k: ItemKey, children: React.ReactNode, indent = 0, rise = true) => {
    const a = itemIn(k);
    if (frame < f(startOf[k])) return null;
    return (
      <div
        key={k}
        style={{
          position: 'absolute',
          left: indent,
          right: 0,
          top: TOPS[k],
          opacity: rise ? a : 1,
          transform: rise ? `translateY(${mix(12, 0, a)}px)` : undefined,
        }}
      >
        {children}
      </div>
    );
  };

  const danielAvatar = (
    <Initials initials={TRANSCRIPT.context.initials} size={28} background={colors.border} fontSize={12} color={colors.text} border={false} />
  );

  return (
    <AbsoluteFill style={{background: colors.background, fontFamily}}>
      <AbsoluteFill style={{opacity: 1 - fadeOut}}>
        {/* Left: live conversations */}
        <div
          style={{
            position: 'absolute',
            left: LEFT.x,
            top: CARD_Y,
            opacity: leftIn,
            transform: `translateY(${mix(12, 0, leftIn)}px)`,
          }}
        >
          <Card width={LEFT.width} height={CARD_H}>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                height: HEADER,
                boxSizing: 'border-box',
                padding: `0 ${CONVERSATION_ROW.padX}px`,
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{fontSize: 20, fontWeight: fontWeights.semibold, letterSpacing: '-0.01em', color: colors.text}}>
                {LIST_TITLE}
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <div style={{width: 6, height: 6, borderRadius: '50%', background: colors.lime}} />
                <LiveCounter values={COUNTER_VALUES} steps={counterSteps} />
              </div>
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: HEADER, bottom: 0, overflow: 'hidden'}}>
              {CONVERSATIONS.map((c, i) => {
                const appeared = frame >= f(rowStart(i));
                const seconds = c.startSeconds + (appeared ? (frame - f(rowStart(i))) / fps : 0);
                const isFirst = i === 0;
                return (
                  <div
                    key={c.name}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: i * CONVERSATION_ROW.height - drift,
                      opacity: rowIn[i],
                      transform: `translateY(${mix(12, 0, rowIn[i])}px)`,
                    }}
                  >
                    <ConversationRow
                      width={LEFT.width - 2}
                      kind={c.kind}
                      name={c.name}
                      snippet={c.snippet}
                      altSnippet={isFirst ? ATTENTION_SNIPPET : undefined}
                      snippetMix={isFirst ? snippetMix : 0}
                      duration={mmss(seconds)}
                      durationOpacity={isFirst ? 1 - attentionPill : 1}
                      highlight={isFirst ? highlight : 0}
                      badge={
                        isFirst && attentionPill > 0 ? (
                          <BadgeSwap
                            opacity={attentionPill}
                            mix={swap}
                            from={<StatusBadge label={NEEDS_ATTENTION} tone="attention" />}
                            to={<StatusBadge label={WITH_DANIEL_SHORT} tone="dark" />}
                          />
                        ) : undefined
                      }
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right: transcript */}
        {rightIn > 0 && (
          <div
            style={{
              position: 'absolute',
              left: RIGHT.x,
              top: CARD_Y,
              opacity: rightIn,
              transform: `translateY(${mix(12, 0, rightIn)}px)`,
            }}
          >
            <Card width={RIGHT.width} height={CARD_H}>
              {/* Fixed header */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  height: HEADER,
                  boxSizing: 'border-box',
                  padding: `0 ${BODY_PAD}px`,
                  borderBottom: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <ChannelIconBox kind="whatsapp" size={44} />
                <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 2}}>
                  <div style={{fontSize: 18, fontWeight: fontWeights.semibold, lineHeight: '22px', color: colors.text}}>{CUSTOMER.name}</div>
                  <div style={{fontSize: 15, fontWeight: fontWeights.regular, lineHeight: '20px', color: colors.textSecondary}}>
                    {CUSTOMER.booking}
                  </div>
                </div>
                <BadgeSwap
                  mix={swap}
                  from={<StatusBadge label={NEEDS_ATTENTION} tone="attention" />}
                  to={<StatusBadge label={WITH_DANIEL} tone="dark" />}
                />
              </div>

              {/* Body: transcript, clipped and auto scrolled */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: HEADER,
                  height: BODY_H,
                  overflow: 'hidden',
                  // Soft top edge once the transcript has scrolled.
                  WebkitMaskImage:
                    scroll > 0
                      ? `linear-gradient(to bottom, rgba(0,0,0,${1 - Math.min(1, scroll / 24)}) 0px, #000 ${TOP_FADE}px)`
                      : undefined,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: BODY_PAD,
                    top: BODY_PAD - scroll,
                    width: BODY_INNER_W,
                  }}
                >
                  {place(
                    'customer1',
                    <TranscriptBubble
                      text={TRANSCRIPT.customer1}
                      startFrame={Math.round(f(T.customer1.start))}
                      cps={T.customer1.cps}
                      side="customer"
                      maxWidth={420}
                    />,
                    0,
                    false,
                  )}
                  {frame >= f(T.agentOrb.start) && (
                    <div style={{position: 'absolute', left: 0, top: TOPS.trace0 + 6, opacity: orbIn}}>
                      <Orb size={28} />
                    </div>
                  )}
                  {TRANSCRIPT.traces.map((t, i) => {
                    const k = `trace${i}` as ItemKey;
                    const land = startOf[k] + T.traces.duration;
                    return place(
                      k,
                      <TraceRow kind={t.kind} text={t.text} duration={t.duration} tick={p(land - 0.05, land + 0.2)} />,
                      AGENT_INDENT,
                    );
                  })}
                  {place(
                    'agent',
                    <TranscriptBubble
                      text={TRANSCRIPT.agent}
                      startFrame={Math.round(f(T.agentReply.start))}
                      cps={fitCps(TRANSCRIPT.agent, T.agentReply)}
                      side="agent"
                      maxWidth={460}
                    />,
                    AGENT_INDENT,
                    false,
                  )}
                  {place(
                    'customer2',
                    <TranscriptBubble
                      text={TRANSCRIPT.customer2}
                      startFrame={Math.round(f(T.customer2.start))}
                      cps={fitCps(TRANSCRIPT.customer2, T.customer2)}
                      side="customer"
                      maxWidth={420}
                    />,
                    0,
                    false,
                  )}
                  {place('notice', <NoticeRow text={TRANSCRIPT.notice} />)}
                  {place(
                    'context',
                    <ContextCard
                      avatar={danielAvatar}
                      title={TRANSCRIPT.context.title}
                      subtitle={TRANSCRIPT.context.subtitle}
                      chips={TRANSCRIPT.context.chips}
                      chipIn={chipIn}
                    />,
                  )}
                  {place(
                    'daniel',
                    <TranscriptBubble
                      text={TRANSCRIPT.daniel}
                      startFrame={Math.round(f(T.danielReply.start))}
                      cps={fitCps(TRANSCRIPT.daniel, T.danielReply)}
                      side="agent"
                      maxWidth={460}
                      avatar={danielAvatar}
                    />,
                    0,
                    false,
                  )}
                </div>
              </div>

              {/* Fixed footer */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: FOOTER,
                  boxSizing: 'border-box',
                  borderTop: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  padding: `0 ${BODY_PAD}px`,
                }}
              >
                {takeOverIn > 0 && (
                  <div style={{opacity: takeOverIn, transform: `translateY(${mix(12, 0, takeOverIn)}px)`}}>
                    <TakeOverButton width={BODY_INNER_W} press={press} done={done} tick={doneTick} />
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
