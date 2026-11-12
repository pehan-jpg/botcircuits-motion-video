import React from 'react';
import {COLORS, FONT_MONO, FONT_SANS, FONT_SANS_FAMILY, ease} from '../theme';
import {AVATAR, BUBBLE, BUBBLE_X, META_GAP, META_H, ROW_X} from '../layout';
import {measureText} from './measure';
import {f30} from '../timeline';

export type Speaker = 'customer' | 'agent';

// ---------------------------------------------------------------------------
// Avatar: circle with initials only.
// ---------------------------------------------------------------------------
export const Avatar: React.FC<{
  initials: string;
  speaker: Speaker;
  size?: number;
  dim?: number; // 0 = full, 1 = dimmed
  style?: React.CSSProperties;
}> = ({initials, speaker, size = AVATAR, dim = 0, style}) => {
  const customer = speaker === 'customer';
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: customer ? COLORS.mist : COLORS.charcoal2,
        border: customer ? 'none' : '1px solid rgba(255,255,255,0.18)',
        boxSizing: 'border-box',
        color: customer ? COLORS.ink : COLORS.white,
        fontFamily: FONT_SANS,
        fontWeight: 600,
        fontSize: size * 0.38,
        letterSpacing: initials.length > 1 ? '0.02em' : 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 1 - dim * 0.65,
        ...style,
      }}
    >
      {initials}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Bubble: one component covers typing indicator -> message.
// The background is three pieces (left cap, stretched middle, right cap) so the
// width can grow using transforms only and the corner radii never distort.
// ---------------------------------------------------------------------------
export const bubbleTextFont = `400 ${BUBBLE.fontSize}px "${FONT_SANS_FAMILY}"`;

export const bubbleWidth = (text: string): number =>
  Math.ceil(measureText(text, bubbleTextFont, BUBBLE.fontSize * 0.5)) + BUBBLE.padX * 2 + 2;

export type BubbleProps = {
  speaker: Speaker;
  text: string;
  /** Frame relative to the bubble's own clock (0 = row starts entering). */
  frame: number;
  /** Row entrance (opacity + translate) start/duration. */
  enterAt?: number;
  enterDur?: number;
  /** When the typing indicator morphs into the bubble. Omit = no typing phase. */
  morphAt?: number;
  morphDur?: number;
  /** When words start appearing and the stagger between them. */
  wordsAt: number;
  wordStagger?: number;
  /** Pop-in instead of rise (follow-ups): scale 0.96 -> 1 over 8 frames. */
  pop?: boolean;
  avatar?: {initials: string; dim?: number; opacity?: number};
  /** World position of the row (avatar left edge / bubble top). */
  x?: number;
  y: number;
  /** Extra transform appended after the entrance transform (e.g. compress). */
  extraTransform?: string;
  /** transform-origin of the row (defaults to the bubble's left-centre). */
  origin?: string;
  opacity?: number;
};

export const Bubble: React.FC<BubbleProps> = ({
  speaker,
  text,
  frame,
  enterAt = 0,
  enterDur = f30(8),
  morphAt,
  morphDur = f30(10),
  wordsAt,
  wordStagger = f30(2),
  pop = false,
  avatar,
  x = ROW_X,
  y,
  extraTransform = '',
  origin,
  opacity = 1,
}) => {
  const customer = speaker === 'customer';
  const fullW = bubbleWidth(text);
  const H = BUBBLE.height;
  const R = BUBBLE.radius;

  const enter = ease(frame, [enterAt, enterAt + (pop ? f30(6) : enterDur)], [0, 1]);
  const morph = morphAt === undefined ? 1 : ease(frame, [morphAt, morphAt + morphDur], [0, 1]);
  const w = BUBBLE.typingWidth + (fullW - BUBBLE.typingWidth) * morph;

  const popScale = pop ? ease(frame, [enterAt, enterAt + f30(8)], [0.96, 1]) : 1;
  const rise = pop ? ease(frame, [enterAt, enterAt + f30(8)], [-18, 0]) : (1 - enter) * 24;

  const bg = customer ? COLORS.charcoal : COLORS.charcoal2;
  const border = customer ? 'none' : '1px solid rgba(255,255,255,0.14)';

  // Typing dots, pulsing in sequence, fading out as the bubble widens.
  const dotsOpacity = morphAt === undefined ? 0 : 1 - ease(frame, [morphAt, morphAt + f30(6)], [0, 1]);
  const words = text.split(' ');
  const bubbleLeft = BUBBLE_X - ROW_X;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        height: H,
        width: bubbleLeft + fullW,
        opacity: enter * opacity,
        transform: `translateY(${rise}px) ${extraTransform}`,
        transformOrigin: origin ?? `${bubbleLeft}px ${H / 2}px`,
      }}
    >
      {avatar ? (
        <Avatar
          initials={avatar.initials}
          speaker={speaker}
          dim={avatar.dim ?? 0}
          style={{
            position: 'absolute',
            left: 0,
            top: H - AVATAR,
            opacity: (1 - (avatar.dim ?? 0) * 0.65) * (avatar.opacity ?? 1),
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: bubbleLeft,
          top: 0,
          width: fullW,
          height: H,
          transform: `scale(${popScale})`,
          transformOrigin: '0% 100%',
        }}
      >
        {/* background: shadow carrier (fades in with full width) */}
        <div style={{position: 'absolute', inset: 0}}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: R,
              height: H,
              background: bg,
              border,
              borderRight: 'none',
              boxSizing: 'border-box',
              borderRadius: `${R}px 0 0 ${BUBBLE.tailRadius}px`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 100, // 100px base so sub-pixel rounding never inflates the scale
              height: H,
              background: bg,
              borderTop: border,
              borderBottom: border,
              boxSizing: 'border-box',
              transformOrigin: '0 0',
              transform: `translateX(${R - 1}px) scaleX(${Math.max(0, w - 2 * R + 2) / 100})`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: R,
              height: H,
              background: bg,
              border,
              borderLeft: 'none',
              boxSizing: 'border-box',
              borderRadius: `0 ${R}px ${R}px 0`,
              transform: `translateX(${w - R}px)`,
            }}
          />
        </div>

        {/* typing dots */}
        {morphAt !== undefined ? (
          <div style={{position: 'absolute', left: 40, top: H / 2 - 8, opacity: dotsOpacity}}>
            {[0, 1, 2].map((i) => {
              const cycle = f30(14);
              const t = (((frame - enterAt - i * f30(4)) % cycle) + cycle) % cycle;
              const pulse = 0.5 - 0.5 * Math.cos((t / cycle) * Math.PI * 2);
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: i * 28,
                    top: 0,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    background: COLORS.mist,
                    opacity: 0.3 + 0.7 * pulse,
                    transform: `translateY(${-4 * pulse}px)`,
                  }}
                />
              );
            })}
          </div>
        ) : null}

        {/* words */}
        <div
          style={{
            position: 'absolute',
            left: BUBBLE.padX,
            top: 0,
            height: H,
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'pre',
            fontFamily: FONT_SANS,
            fontSize: BUBBLE.fontSize,
            fontWeight: 400,
            lineHeight: 1,
            color: COLORS.white,
          }}
        >
          {words.map((word, i) => {
            const start = wordsAt + i * wordStagger;
            const p = ease(frame, [start, start + f30(6)], [0, 1]);
            return (
              <span
                key={i}
                style={{display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 10}px)`}}
              >
                {word}
                {i < words.length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Check mark(s), drawn as strokes (pathLength=1 so dashoffset is 0..1).
// ---------------------------------------------------------------------------
export const Checks: React.FC<{first: number; second: number; color?: string}> = ({
  first,
  second,
  color = COLORS.muted,
}) => (
  <svg width={40} height={24} viewBox="0 0 40 24" style={{overflow: 'visible'}}>
    <path
      d="M3 12.5 L9.5 19 L22 5"
      fill="none"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - first}
      opacity={first > 0 ? 1 : 0}
    />
    <path
      d="M15 16.5 L17.5 19 L30 5"
      fill="none"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - second}
      opacity={second > 0 ? 1 : 0}
    />
  </svg>
);

// ---------------------------------------------------------------------------
// Meta row under a bubble: monospace time + status with self-drawing checks.
// ---------------------------------------------------------------------------
const META_FONT = `500 26px "${FONT_SANS_FAMILY}"`;

export const BubbleMeta: React.FC<{
  y: number; // bubble top (meta is placed below it)
  time: string;
  timeIn: number;
  statusIn: number;
  /** 0 = "Delivered", 1 = "Seen" */
  seen: number;
  check1: number;
  check2: number;
  opacity?: number;
  showStatus?: boolean;
}> = ({y, time, timeIn, statusIn, seen, check1, check2, opacity = 1, showStatus = true}) => (
  <div
    style={{
      position: 'absolute',
      left: BUBBLE_X + 6,
      top: y + BUBBLE.height + META_GAP,
      height: META_H,
      display: 'flex',
      alignItems: 'center',
      gap: 18,
      opacity,
      color: COLORS.muted,
    }}
  >
    <span
      style={{
        fontFamily: FONT_MONO,
        fontSize: 26,
        letterSpacing: '0.01em',
        opacity: timeIn,
        transform: `translateY(${(1 - timeIn) * 8}px)`,
        display: 'inline-block',
      }}
    >
      {time}
    </span>
    {showStatus ? (
      <>
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: 3,
            background: COLORS.muted,
            opacity: statusIn * 0.7,
            display: 'inline-block',
          }}
        />
        <span
          style={{
            position: 'relative',
            display: 'inline-block',
            width: 220,
            height: META_H,
            fontFamily: FONT_SANS,
            fontSize: 26,
            fontWeight: 500,
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: 0,
              top: 5,
              opacity: statusIn * (1 - seen),
              transform: `translateY(${(1 - statusIn) * 8 - seen * 16}px)`,
            }}
          >
            Delivered
          </span>
          <span
            style={{
              position: 'absolute',
              left: 0,
              top: 5,
              opacity: statusIn * seen,
              transform: `translateY(${(1 - seen) * 16}px)`,
            }}
          >
            Seen
          </span>
          <span
            style={{
              position: 'absolute',
              left: 0,
              top: 8,
              transform: `translateX(${
                measureText('Delivered', META_FONT, 14) * (1 - seen) + measureText('Seen', META_FONT, 14) * seen + 12
              }px)`,
            }}
          >
            <Checks first={check1} second={check2} />
          </span>
        </span>
      </>
    ) : null}
  </div>
);
