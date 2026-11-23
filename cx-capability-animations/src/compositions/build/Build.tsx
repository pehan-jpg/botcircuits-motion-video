import React from 'react';
import {AbsoluteFill, interpolateColors, useCurrentFrame, useVideoConfig} from 'remotion';
import {Card} from '../../components/Card';
import {Chip} from '../../components/Chip';
import {ArrowUpIcon, ShieldIcon, TickIcon} from '../../components/Icons';
import {StepRow, STEP_ROW} from '../../components/StepRow';
import {TypedText} from '../../components/TypedText';
import {Orb} from '../../components/Orb';
import {Rect, Veil, veilState} from '../../components/Veil';
import {HEIGHT, WIDTH} from '../../config';
import {mix, progress} from '../../motion';
import {colors, fontFamily, fontWeights, radii, shadows} from '../../tokens';
import {
  AGENT_NAME,
  AGENT_SUBTITLE,
  CONSOLE_LABEL,
  GUARDRAILS_LABEL,
  PROCEDURE,
  PROMPT,
  READY_LABEL,
} from './content';
import {BUILD_TIMELINE as T} from './timeline';

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

// Spec asked for 760 wide, but the prompt at Inter Medium 30px renders about 784px,
// so the pill is widened to fit it without clipping (see README).
const PILL = {width: 900, height: 72, padX: 28, send: 44, sendPad: 14, fontSize: 30};
const PILL_RECT: Rect = {
  x: (WIDTH - PILL.width) / 2,
  y: (HEIGHT - PILL.height) / 2,
  width: PILL.width,
  height: PILL.height,
  radius: PILL.height / 2,
};

const PROC = {
  width: 880,
  pad: 32,
  labelInset: 16,
  /** Rows start below the Console label (16 inset + 26 label + 22 gap). */
  contentTop: 64,
  chipGap: 24,
  chipHeight: 32,
};

const AGENT = {
  width: 560,
  pad: 32,
  avatar: 64,
  avatarGap: 20,
  pillGap: 20,
  pillHeight: 36,
};
const AGENT_HEIGHT = AGENT.pad + AGENT.avatar + AGENT.pillGap + AGENT.pillHeight + AGENT.pad;
const AGENT_RECT: Rect = {
  x: (WIDTH - AGENT.width) / 2,
  y: (HEIGHT - AGENT_HEIGHT) / 2,
  width: AGENT.width,
  height: AGENT_HEIGHT,
  radius: radii.card,
};

/** Procedure card height from row growth progress values (no DOM measurement). */
const procedureHeight = (growth: number[]): number =>
  PROC.contentTop +
  PROC.pad +
  growth.reduce((sum, g, i) => sum + g * (STEP_ROW.height + (i > 0 ? STEP_ROW.gap : 0)), 0);

/** Card rect, keeping the card plus guardrails chip centred as a stack. */
const procedureRect = (cardHeight: number): Rect => {
  const stack = cardHeight + PROC.chipGap + PROC.chipHeight;
  return {
    x: (WIDTH - PROC.width) / 2,
    y: (HEIGHT - stack) / 2,
    width: PROC.width,
    height: cardHeight,
    radius: radii.card,
  };
};

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export const Build: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);

  const veil1 = {start: f(T.veilToProcedure.start), end: f(T.veilToProcedure.end)};
  const veil2 = {start: f(T.veilToAgent.start), end: f(T.veilToAgent.end)};
  const v1 = veilState(frame, veil1);
  const v2 = veilState(frame, veil2);

  // Row timing and card growth.
  const rowStarts = PROCEDURE.map((_, i) => f(T.rows.start + i * T.rowStagger));
  const growth = rowStarts.map((s) => progress(frame, s, s + f(T.rowEnter)));
  const finalRect = procedureRect(procedureHeight(PROCEDURE.map(() => 1)));
  const startRect = procedureRect(procedureHeight(PROCEDURE.map(() => 0)));
  const procRect = procedureRect(procedureHeight(growth));

  // Global fade to white, landing exactly on the last frame.
  const fadeOut = progress(frame, f(T.fadeOut.start), durationInFrames - 1);

  return (
    <AbsoluteFill style={{background: colors.background, fontFamily}}>
      <AbsoluteFill style={{opacity: 1 - fadeOut}}>
        {/* State 1: prompt pill */}
        {!v1.outgoingDone && <PromptPill style={v1.outgoing} />}

        <Veil {...veil1} from={PILL_RECT} to={startRect} />

        {/* State 2: procedure card and guardrails chip */}
        {!v1.incomingPending && !v2.outgoingDone && (
          <div style={{...v1.incoming, position: 'absolute', inset: 0}}>
            <div style={{...v2.outgoing, position: 'absolute', inset: 0}}>
              <ProcedureCard rect={procRect} rowStarts={rowStarts} />
              <GuardrailsChip cardRect={procRect} />
            </div>
          </div>
        )}

        <Veil {...veil2} from={finalRect} to={AGENT_RECT} />

        {/* State 3: agent card */}
        {!v2.incomingPending && <AgentCard style={v2.incoming} />}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* State 1: prompt pill                                                */
/* ------------------------------------------------------------------ */

const PromptPill: React.FC<{style: React.CSSProperties}> = ({style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);

  const enter = progress(frame, f(T.promptIn.start), f(T.promptIn.end));
  const send = progress(frame, f(T.send.start), f(T.send.end));
  const cps = PROMPT.length / (T.promptTyping.end - T.promptTyping.start);

  return (
    <div
      style={{
        position: 'absolute',
        left: PILL_RECT.x,
        top: PILL_RECT.y,
        width: PILL.width,
        height: PILL.height,
        boxSizing: 'border-box',
        borderRadius: PILL_RECT.radius,
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        boxShadow: shadows.card,
        opacity: enter * (style.opacity === undefined ? 1 : Number(style.opacity)),
        filter: style.filter,
        transform: `translateY(${mix(12, 0, enter)}px)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: PILL.padX,
          right: PILL.sendPad + PILL.send + 8,
          top: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          fontSize: PILL.fontSize,
          fontWeight: fontWeights.medium,
          letterSpacing: '-0.01em',
          color: colors.text,
          lineHeight: 1.3,
        }}
      >
        <TypedText
          text={PROMPT}
          startFrame={f(T.promptTyping.start)}
          cps={cps}
          highlightHold={T.highlightHold}
          caret={{hz: 1, phase: 0.25, width: 2, height: 34}}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          right: PILL.sendPad - 1,
          top: (PILL.height - PILL.send) / 2 - 1,
          width: PILL.send,
          height: PILL.send,
          borderRadius: '50%',
          background: interpolateColors(send, [0, 1], [colors.charcoal, colors.lime]),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ArrowUpIcon
          size={20}
          strokeWidth={2}
          color={interpolateColors(send, [0, 1], ['#ffffff', colors.charcoal])}
        />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* State 2: procedure card                                             */
/* ------------------------------------------------------------------ */

const ProcedureCard: React.FC<{rect: Rect; rowStarts: number[]}> = ({rect, rowStarts}) => {
  return (
    <div style={{position: 'absolute', left: rect.x, top: rect.y}}>
      <Card width={rect.width} height={rect.height}>
        <Chip
          label={CONSOLE_LABEL}
          fontSize={13}
          height={26}
          paddingX={10}
          style={{position: 'absolute', left: PROC.labelInset, top: PROC.labelInset}}
        />
        <div
          style={{
            position: 'absolute',
            left: PROC.pad,
            right: PROC.pad,
            top: PROC.contentTop,
            display: 'flex',
            flexDirection: 'column',
            gap: STEP_ROW.gap,
          }}
        >
          {PROCEDURE.map((step, i) => (
            <StepRow
              key={i}
              number={step.number}
              kind={step.kind}
              text={step.text}
              level={step.level}
              startFrame={rowStarts[i]}
              cps={T.rowCps}
              enter={T.rowEnter}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

const GuardrailsChip: React.FC<{cardRect: Rect}> = ({cardRect}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = progress(frame, Math.round(T.guardrails.start * fps), Math.round(T.guardrails.end * fps));
  if (p <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: cardRect.y + cardRect.height + PROC.chipGap,
        display: 'flex',
        justifyContent: 'center',
        opacity: p,
        transform: `translateY(${mix(6, 0, p)}px)`,
      }}
    >
      <Chip
        label={GUARDRAILS_LABEL}
        icon={<ShieldIcon size={14} />}
        fontSize={14}
        height={PROC.chipHeight}
        paddingX={12}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* State 3: agent card                                                 */
/* ------------------------------------------------------------------ */

const AgentCard: React.FC<{style: React.CSSProperties}> = ({style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);

  const settleStart = (f(T.veilToAgent.start) + f(T.veilToAgent.end)) / 2;
  const settle = progress(frame, settleStart, f(T.agentSettle.end));
  const pillIn = progress(frame, f(T.ready.start), f(T.ready.start) + f(0.25));
  const tick = progress(frame, f(T.ready.start) + f(0.1), f(T.ready.end));

  return (
    <div
      style={{
        position: 'absolute',
        left: AGENT_RECT.x,
        top: AGENT_RECT.y,
        ...style,
        transform: `translateY(${mix(10, 0, settle)}px)`,
      }}
    >
      <Card width={AGENT.width} height={AGENT_HEIGHT} padding={AGENT.pad}>
        <div style={{display: 'flex', alignItems: 'center', gap: AGENT.avatarGap}}>
          <Orb size={AGENT.avatar} />
          <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            <div
              style={{
                fontSize: 24,
                fontWeight: fontWeights.semibold,
                color: colors.text,
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              {AGENT_NAME}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: fontWeights.regular,
                color: colors.textSecondary,
                lineHeight: 1.4,
              }}
            >
              {AGENT_SUBTITLE}
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: AGENT.pillGap,
            marginLeft: AGENT.avatar + AGENT.avatarGap,
            opacity: pillIn,
            transform: `translateY(${mix(6, 0, pillIn)}px)`,
          }}
        >
          <Chip
            label={READY_LABEL}
            icon={<TickIcon size={16} strokeWidth={2} color={colors.charcoal} draw={tick} />}
            fontSize={15}
            height={AGENT.pillHeight}
            paddingX={14}
            gap={8}
            background={colors.lime}
            color={colors.text}
          />
        </div>
      </Card>
    </div>
  );
};
