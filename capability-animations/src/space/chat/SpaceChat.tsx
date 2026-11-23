import React from 'react';
import {AbsoluteFill, interpolateColors, useCurrentFrame, useVideoConfig} from 'remotion';
import {measureText} from '@remotion/layout-utils';
import {TypedText} from '../../components/TypedText';
import {Rect, Veil, veilState} from '../../components/Veil';
import {HEIGHT, WIDTH} from '../../config';
import {mix, progress} from '../../motion';
import {colors, fontFamily, radii, shadows} from '../../tokens';
import {COMPOSER, Composer, SendButton} from '../components/Composer';
import {PlanGraph} from '../components/PlanGraph';
import {ReplyRow} from '../components/ReplyRow';
import {ResultCard} from '../components/ResultCard';
import {USER_BUBBLE, UserBubble, userBubbleHeight} from '../components/UserBubble';
import {FOUND, PLACEHOLDER, PLAN_AGENTS, PLAN_RESULT, PLAN_START, PROMPT, RESULT, WORKING} from './content';
import {SPACE_CHAT_TIMELINE as T} from './timeline';

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

const COL = {x: (WIDTH - COMPOSER.width) / 2, width: COMPOSER.width}; // 360 to 1240
const CENTRE_COMPOSER: Rect = {
  x: COL.x,
  y: HEIGHT / 2 - COMPOSER.height / 2,
  width: COMPOSER.width,
  height: COMPOSER.height,
  radius: COMPOSER.height / 2,
};
/** Bottom composer centred at y=900. */
const BOTTOM_COMPOSER_Y = 900 - COMPOSER.height / 2;
const THREAD_GAP_TO_COMPOSER = 32;
const BUBBLE_TO_REPLY = 20;
const REPLY_H = 32;
const REPLY_TO_CARD = 16;
const PLAN_H = 300;
const RESULT_H = 440;

/** Thread top is fixed, centred above the composer at its tallest. */
const threadMax = userBubbleHeight + BUBBLE_TO_REPLY + REPLY_H + REPLY_TO_CARD + RESULT_H;
const THREAD_TOP = Math.round((BOTTOM_COMPOSER_Y - THREAD_GAP_TO_COMPOSER - threadMax) / 2);
const REPLY_Y = THREAD_TOP + userBubbleHeight + BUBBLE_TO_REPLY;
const CARD_Y = REPLY_Y + REPLY_H + REPLY_TO_CARD;
const PLAN_RECT: Rect = {x: COL.x, y: CARD_Y, width: COL.width, height: PLAN_H, radius: radii.card};
const RESULT_RECT: Rect = {...PLAN_RECT, height: RESULT_H};

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export const SpaceChat: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const f = (s: number) => s * fps;
  const p = (a: number, b: number) => progress(frame, f(a), f(b));

  // Bubble size from the measured prompt (no DOM measurement).
  const textWidth = measureText({text: PROMPT, fontFamily: 'Inter', fontSize: USER_BUBBLE.fontSize, fontWeight: '400'}).width;
  const bubbleWidth = Math.ceil(textWidth + USER_BUBBLE.padX * 2 + 2);
  const BUBBLE_RECT: Rect = {
    x: COL.x + COL.width - bubbleWidth,
    y: THREAD_TOP,
    width: bubbleWidth,
    height: userBubbleHeight,
    radius: USER_BUBBLE.radius,
  };

  /* Composer and morph */
  const composerIn = p(T.composerIn.start, T.composerIn.end);
  const placeholder = 1 - p(T.prompt.start, T.prompt.start + T.prompt.placeholderFade);
  const S = T.send;
  const press = p(S.start, S.start + S.down) * (1 - p(S.start + S.down, S.start + S.down + S.up));
  const sendBg = interpolateColors(press, [0, 1], [colors.charcoal, '#333333']);
  const morphing = frame >= f(T.morph.start);
  const morph = p(T.morph.start, T.morph.end);
  const newComposer = morph;

  /* Reply row */
  const R = T.reply;
  const replyOrb = p(R.orb, R.orb + R.duration);
  const replyText = p(R.text, R.text + R.duration);
  const veil = {start: f(T.veil.start), end: f(T.veil.start + T.veil.duration)};
  const v = veilState(frame, veil);
  const replyMix = p(T.veil.start, T.veil.start + T.replyLabelFade);

  /* Plan */
  const P = T.plan;
  const planCard = p(P.card.start, P.card.end);
  const ticks = P.ticks.map((t) => p(t, t + P.tickFade));
  const tickDraw = P.ticks.map((t) => p(t, t + P.tickFade + 0.15));
  const planState = {
    start: p(P.startNode, P.startNode + P.fade),
    inLines: PLAN_AGENTS.map(() => p(P.inLines.start, P.inLines.start + P.inLines.duration)),
    agents: P.agents.map((t) => p(t, t + 0.3)),
    done: ticks,
    ticks: tickDraw,
    outLines: P.ticks.map((t) => p(t, t + P.outLine)),
    result: p(P.result, P.result + P.fade),
  };

  /* Result */
  const Q = T.result;
  const header = p(Q.header, Q.header + Q.duration);
  const rows = RESULT.findings.map((_, i) => p(Q.rowsStart + i * Q.stagger, Q.rowsStart + i * Q.stagger + Q.duration));
  const buttons = p(Q.buttons, Q.buttons + Q.buttonsDuration);

  const fadeOut = progress(frame, f(T.fadeOut.start), durationInFrames - 1);

  return (
    <AbsoluteFill style={{background: colors.background, fontFamily}}>
      <AbsoluteFill style={{opacity: 1 - fadeOut}}>
        {/* Composer with the typed prompt, until the morph begins */}
        {!morphing && (
          <div
            style={{
              position: 'absolute',
              left: CENTRE_COMPOSER.x,
              top: CENTRE_COMPOSER.y,
              opacity: composerIn,
              transform: `translateY(${mix(12, 0, composerIn)}px)`,
            }}
          >
            <Composer
              placeholder={PLACEHOLDER}
              placeholderOpacity={placeholder}
              sendBackground={sendBg}
              text={<TypedText text={PROMPT} startFrame={Math.round(f(T.prompt.start))} cps={T.prompt.cps} highlight={false} />}
            />
          </div>
        )}

        {/* The same text pill becomes the user bubble: one rectangle */}
        {morphing && (
          <>
            <UserBubble text={PROMPT} from={CENTRE_COMPOSER} to={BUBBLE_RECT} morph={morph} />
            {morph < 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: CENTRE_COMPOSER.x + CENTRE_COMPOSER.width - COMPOSER.sendPad - COMPOSER.send,
                  top: CENTRE_COMPOSER.y + (COMPOSER.height - COMPOSER.send) / 2,
                  opacity: 1 - morph,
                }}
              >
                <SendButton />
              </div>
            )}
            <div style={{position: 'absolute', left: COL.x, top: BOTTOM_COMPOSER_Y, opacity: newComposer}}>
              <Composer placeholder={PLACEHOLDER} />
            </div>
          </>
        )}

        {/* Space reply row */}
        {replyOrb > 0 && (
          <div style={{position: 'absolute', left: COL.x, top: REPLY_Y, transform: `translateY(${mix(12, 0, replyOrb)}px)`}}>
            <ReplyRow
              orb={replyOrb}
              text={replyText}
              label={WORKING}
              altLabel={FOUND}
              labelMix={replyMix}
              spinner={1 - replyMix}
            />
          </div>
        )}

        {/* Plan card */}
        {planCard > 0 && !v.outgoingDone && (
          <div
            style={{
              position: 'absolute',
              left: PLAN_RECT.x,
              top: PLAN_RECT.y,
              width: PLAN_RECT.width,
              height: PLAN_RECT.height,
              boxSizing: 'border-box',
              borderRadius: radii.card,
              border: `1px solid ${colors.border}`,
              background: colors.surface,
              boxShadow: shadows.card,
              ...v.outgoing,
              opacity: planCard * Number(v.outgoing.opacity ?? 1),
            }}
          >
            <PlanGraph
              width={PLAN_RECT.width - 2}
              height={PLAN_RECT.height - 2}
              startLabel={PLAN_START}
              agents={PLAN_AGENTS}
              resultLabel={PLAN_RESULT}
              state={planState}
            />
          </div>
        )}

        <Veil {...veil} from={PLAN_RECT} to={RESULT_RECT} />

        {/* Result card */}
        {!v.incomingPending && (
          <div style={{position: 'absolute', left: RESULT_RECT.x, top: RESULT_RECT.y, ...v.incoming}}>
            <ResultCard
              width={RESULT_RECT.width}
              height={RESULT_RECT.height}
              title={RESULT.title}
              summary={RESULT.summary}
              findings={RESULT.findings}
              primary={RESULT.primary}
              secondary={RESULT.secondary}
              header={header}
              rows={rows}
              buttons={buttons}
            />
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
