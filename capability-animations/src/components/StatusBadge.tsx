import React from 'react';
import {colors} from '../tokens';
import {Chip} from './Chip';
import {TickIcon} from './Icons';

/**
 * Conversation status pill, 28px high, Inter Medium 14px.
 * (Named StatusBadge because StatusPill is the Integrate and Publish
 * connection pill.)
 */
export type BadgeTone = 'live' | 'attention' | 'dark';

const TONES: Record<BadgeTone, {background: string; color: string}> = {
  live: {background: colors.limeTint, color: colors.charcoal},
  attention: {background: colors.amber, color: colors.amberText},
  dark: {background: colors.charcoal, color: '#ffffff'},
};

export const StatusBadge: React.FC<{label: string; tone: BadgeTone; tick?: number}> = ({label, tone, tick}) => {
  const t = TONES[tone];
  const icon =
    tone === 'live' ? (
      <div style={{width: 6, height: 6, borderRadius: '50%', background: colors.lime}} />
    ) : tick !== undefined ? (
      <TickIcon size={14} strokeWidth={1.75} color={t.color} draw={tick} />
    ) : undefined;
  return <Chip label={label} icon={icon} fontSize={14} height={28} paddingX={12} gap={6} background={t.background} color={t.color} />;
};

/**
 * Two badges stacked right aligned, crossfading from `from` to `to` by `mix`.
 */
export const BadgeSwap: React.FC<{
  from: React.ReactNode;
  to: React.ReactNode;
  mix: number;
  opacity?: number;
}> = ({from, to, mix, opacity = 1}) => (
  <div style={{position: 'relative', width: 1, height: 28, flexShrink: 0, opacity}}>
    {mix < 1 && <div style={{position: 'absolute', right: 0, top: 0, opacity: 1 - mix}}>{from}</div>}
    {mix > 0 && <div style={{position: 'absolute', right: 0, top: 0, opacity: mix}}>{to}</div>}
  </div>
);
