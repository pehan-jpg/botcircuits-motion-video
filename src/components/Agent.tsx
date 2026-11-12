import React from 'react';
import {COLORS, FONT_SANS, FONT_SANS_FAMILY, alpha} from '../theme';
import {AgentAvatar} from './Logo';
import {StatusChip} from './Chip';
import {Sweep} from './Sweep';
import {measureText} from './measure';
import {
  AGENT_CARD,
  AGENT_CARD_AVATAR,
  AGENT_CARD_CHIP,
  AGENT_CARD_TITLE,
  AGENT_CHIP,
  AGENT_NAME,
} from '../handoff';

export const agentChipWidth = (): number =>
  AGENT_CHIP.pad +
  AGENT_CHIP.avatar +
  AGENT_CHIP.gap +
  measureText(AGENT_NAME, `600 ${AGENT_CHIP.fontSize}px "${FONT_SANS_FAMILY}"`, AGENT_CHIP.fontSize * 0.55) +
  AGENT_CHIP.padRight;

/** Centre of the parked agent chip (scene 6 onward). */
export const agentChipHome = () => ({cx: AGENT_CHIP.left + agentChipWidth() / 2, cy: AGENT_CHIP.cy});

/**
 * Agent chip, positioned by its centre. Parts can be faded separately so the
 * chip can morph from the card (scene 6) and into the node (scene 8).
 */
export const AgentChip: React.FC<{
  cx: number;
  cy: number;
  scale?: number;
  body?: number;
  avatar?: number;
  name?: number;
  glow?: number;
}> = ({cx, cy, scale = 1, body = 1, avatar = 1, name = 1, glow = 0}) => {
  const w = agentChipWidth();
  const h = AGENT_CHIP.height;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - w / 2,
        top: cy - h / 2,
        width: w,
        height: h,
        transform: `scale(${scale})`,
        transformOrigin: '50% 50%',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: h / 2,
          background: COLORS.white,
          border: `1px solid ${COLORS.line}`,
          boxShadow: `0 16px 40px rgba(11,13,12,0.08), 0 0 0 ${glow * 6}px ${alpha(COLORS.lime, 0.35 * glow)}`,
          opacity: body,
        }}
      />
      <AgentAvatar
        size={AGENT_CHIP.avatar}
        style={{position: 'absolute', left: AGENT_CHIP.pad, top: (h - AGENT_CHIP.avatar) / 2, opacity: avatar}}
      />
      <div
        style={{
          position: 'absolute',
          left: AGENT_CHIP.pad + AGENT_CHIP.avatar + AGENT_CHIP.gap,
          top: 0,
          height: h,
          display: 'flex',
          alignItems: 'center',
          fontFamily: FONT_SANS,
          fontWeight: 600,
          fontSize: AGENT_CHIP.fontSize,
          color: COLORS.ink,
          whiteSpace: 'nowrap',
          opacity: name,
        }}
      >
        {AGENT_NAME}
      </div>
    </div>
  );
};

/** Agent card body (scene 5). Avatar / title can be rendered separately. */
export const AgentCardBody: React.FC<{
  frame: number;
  flip: number;
  check: number;
  shine: number;
  chipIn: number;
  children?: React.ReactNode;
}> = ({frame, flip, check, shine, chipIn, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: AGENT_CARD.width, height: AGENT_CARD.height}}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 32,
        background: COLORS.white,
        border: `1px solid ${COLORS.line}`,
        boxShadow: '0 40px 90px rgba(11,13,12,0.10), 0 6px 18px rgba(11,13,12,0.05)',
        overflow: 'hidden',
      }}
    >
      <Sweep progress={shine} width={AGENT_CARD.width} strength={0.38} />
    </div>
    <div
      style={{
        position: 'absolute',
        left: AGENT_CARD_CHIP.left,
        top: AGENT_CARD_CHIP.top,
        opacity: chipIn,
        transform: `translateY(${(1 - chipIn) * 16}px)`,
      }}
    >
      <StatusChip pending="Building" done="Agent ready" flip={flip} check={check} frame={frame} fontSize={24} />
    </div>
    {children}
  </div>
);

export const AgentCardAvatar: React.FC<{pop: number; style?: React.CSSProperties}> = ({pop, style}) => (
  <AgentAvatar
    size={AGENT_CARD_AVATAR.size}
    style={{
      position: 'absolute',
      left: AGENT_CARD_AVATAR.cx - AGENT_CARD_AVATAR.size / 2,
      top: AGENT_CARD_AVATAR.cy - AGENT_CARD_AVATAR.size / 2,
      opacity: pop,
      transform: `scale(${0.9 + 0.1 * pop})`,
      ...style,
    }}
  />
);

export const AgentCardTitle: React.FC<{text: string; style?: React.CSSProperties}> = ({text, style}) => (
  <div
    style={{
      position: 'absolute',
      left: AGENT_CARD_TITLE.left,
      top: AGENT_CARD_TITLE.cy - AGENT_CARD_TITLE.fontSize * 0.7,
      height: AGENT_CARD_TITLE.fontSize * 1.4,
      display: 'flex',
      alignItems: 'center',
      fontFamily: FONT_SANS,
      fontWeight: 600,
      fontSize: AGENT_CARD_TITLE.fontSize,
      color: COLORS.ink,
      whiteSpace: 'pre',
      ...style,
    }}
  >
    {text}
  </div>
);
