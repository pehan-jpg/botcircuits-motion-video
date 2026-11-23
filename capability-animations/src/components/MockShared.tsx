/** Shared pieces for the channel mockups. */
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {progress} from '../motion';
import {colors, fontFamily, fontWeights} from '../tokens';

/** Frame timing for one customer and agent exchange. */
export type Exchange = {
  customer: string;
  agent: string;
  /** Frame the customer text starts typing. */
  customerStart: number;
  /** Frame the agent avatar starts fading in. */
  agentAvatar: number;
  /** Frame the agent text starts typing. */
  agentStart: number;
  cps: number;
};

export type MockProps = {
  exchange: Exchange;
  /** Small day and time label under the header. */
  timeLabel: string;
  timeLabelOpacity: number;
  width: number;
  height: number;
};

export const typedEnd = (start: number, text: string, cps: number, fps: number) =>
  start + Math.ceil((text.length / cps) * fps);

export const TimeLabel: React.FC<{label: string; opacity: number; pill?: boolean}> = ({label, opacity, pill}) => (
  <div style={{display: 'flex', justifyContent: 'center', opacity}}>
    <div
      style={{
        fontFamily,
        fontSize: 12,
        fontWeight: fontWeights.medium,
        color: colors.textSecondary,
        padding: pill ? '4px 10px' : 0,
        borderRadius: 9999,
        background: pill ? colors.surface : undefined,
        border: pill ? `1px solid ${colors.border}` : undefined,
      }}
    >
      {label}
    </div>
  </div>
);

export const DoubleTick: React.FC = () => (
  <svg width={16} height={10} viewBox="0 0 16 10" fill="none" style={{display: 'block'}}>
    <path d="M1 5.5l2.5 2.5L9 2" stroke={colors.textSecondary} strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.5 8l.5.5L13 2" stroke={colors.textSecondary} strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const useExchange = (e: Exchange) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const customerEnd = typedEnd(e.customerStart, e.customer, e.cps, fps);
  const agentEnd = typedEnd(e.agentStart, e.agent, e.cps, fps);
  return {
    frame,
    fps,
    avatar: progress(frame, e.agentAvatar, e.agentAvatar + 0.15 * fps),
    customerMeta: progress(frame, customerEnd, customerEnd + 0.15 * fps),
    agentMeta: progress(frame, agentEnd, agentEnd + 0.15 * fps),
    customerEnd,
    agentEnd,
  };
};

