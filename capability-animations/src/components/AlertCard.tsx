import React from 'react';
import {interpolateColors} from 'remotion';
import {mix} from '../motion';
import {colors, fontFamily, fontWeights, radii, shadows} from '../tokens';
import {StatusBadge} from './StatusBadge';

export const ALERT_CARD = {pad: 24, badge: 28, titleLine: 28, bodyLine: 24, suggestion: 56, button: 44} as const;
export const alertCardHeight =
  ALERT_CARD.pad * 2 + ALERT_CARD.badge + 16 + ALERT_CARD.titleLine + 8 + ALERT_CARD.bodyLine + 20 + ALERT_CARD.suggestion + 20 + ALERT_CARD.button;

/**
 * Insight card: attention badge, title, body, suggestion and two buttons.
 * `reveal[k]` (0..1) brings each of the five blocks in top down; `press`
 * (0..1) lightens the primary button.
 */
export const AlertCard: React.FC<{
  width: number;
  badge: string;
  title: string;
  body: string;
  suggestion: string;
  primary: string;
  secondary: string;
  reveal: number[];
  press: number;
}> = ({width, badge, title, body, suggestion, primary, secondary, reveal, press}) => {
  const block = (k: number): React.CSSProperties => ({
    opacity: reveal[k] ?? 0,
    transform: `translateY(${mix(8, 0, reveal[k] ?? 0)}px)`,
  });
  const button: React.CSSProperties = {
    height: ALERT_CARD.button,
    borderRadius: 12,
    padding: '0 22px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: fontWeights.medium,
    whiteSpace: 'nowrap',
  };
  return (
    <div
      style={{
        width,
        height: alertCardHeight,
        boxSizing: 'border-box',
        padding: ALERT_CARD.pad,
        borderRadius: radii.card,
        border: `1px solid ${colors.border}`,
        background: colors.surface,
        boxShadow: shadows.card,
        fontFamily,
      }}
    >
      <div style={{...block(0), display: 'flex'}}>
        <StatusBadge label={badge} tone="attention" />
      </div>
      <div
        style={{
          ...block(1),
          marginTop: 16,
          fontSize: 22,
          fontWeight: fontWeights.semibold,
          lineHeight: `${ALERT_CARD.titleLine}px`,
          letterSpacing: '-0.01em',
          color: colors.text,
        }}
      >
        {title}
      </div>
      <div style={{...block(2), marginTop: 8, fontSize: 16, lineHeight: `${ALERT_CARD.bodyLine}px`, color: colors.textSecondary}}>
        {body}
      </div>
      <div
        style={{
          ...block(3),
          marginTop: 20,
          height: ALERT_CARD.suggestion,
          boxSizing: 'border-box',
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          padding: '0 18px',
          fontSize: 15,
          fontWeight: fontWeights.medium,
          color: colors.text,
        }}
      >
        {suggestion}
      </div>
      <div style={{...block(4), marginTop: 20, display: 'flex', gap: 12}}>
        <div style={{...button, background: interpolateColors(press, [0, 1], [colors.charcoal, '#333333']), color: '#ffffff'}}>
          {primary}
        </div>
        <div style={{...button, border: `1px solid ${colors.border}`, color: colors.charcoal}}>{secondary}</div>
      </div>
    </div>
  );
};
