import React from 'react';
import {mix} from '../../motion';
import {colors, fontFamily, fontWeights, radii, shadows} from '../../tokens';
import {Chip} from '../../components/Chip';
import {TickIcon} from '../../components/Icons';

/** Grey source reference chip, 28px high. */
export const SourceChip: React.FC<{label: string}> = ({label}) => (
  <Chip label={label} fontSize={13} height={28} paddingX={10} />
);

/** One verified finding: charcoal tick, text, and its source on the right. */
export const FindingRow: React.FC<{text: string; source: string}> = ({text, source}) => (
  <div
    style={{
      height: 56,
      boxSizing: 'border-box',
      borderBottom: `1px solid ${colors.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      fontFamily,
    }}
  >
    <TickIcon size={18} strokeWidth={1.75} color={colors.charcoal} draw={1} />
    <div style={{flex: 1, fontSize: 16, fontWeight: fontWeights.regular, color: colors.text, whiteSpace: 'nowrap'}}>{text}</div>
    <SourceChip label={source} />
  </div>
);

const rise = (v: number): React.CSSProperties => ({opacity: v, transform: `translateY(${mix(12, 0, v)}px)`});

/**
 * Outcome card: title and summary chip, findings with sources, and two
 * actions. `header`, `rows[k]` and `buttons` (0..1) reveal each part.
 */
export const ResultCard: React.FC<{
  width: number;
  height: number;
  title: string;
  summary: string;
  findings: {text: string; source: string}[];
  primary: string;
  secondary: string;
  header: number;
  rows: number[];
  buttons: number;
}> = ({width, height, title, summary, findings, primary, secondary, header, rows, buttons}) => {
  const button: React.CSSProperties = {
    height: 44,
    borderRadius: 12,
    padding: '0 24px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    fontSize: 16,
    fontWeight: fontWeights.medium,
    whiteSpace: 'nowrap',
  };
  return (
    <div
      style={{
        width,
        height,
        boxSizing: 'border-box',
        padding: 32,
        borderRadius: radii.card,
        border: `1px solid ${colors.border}`,
        background: colors.surface,
        boxShadow: shadows.card,
        display: 'flex',
        flexDirection: 'column',
        fontFamily,
      }}
    >
      <div style={{...rise(header), height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{fontSize: 20, fontWeight: fontWeights.semibold, letterSpacing: '-0.01em', color: colors.text}}>{title}</div>
        <Chip label={summary} fontSize={14} height={28} paddingX={12} />
      </div>
      <div style={{marginTop: 12}}>
        {findings.map((f, i) => (
          <div key={f.text} style={rise(rows[i] ?? 0)}>
            <FindingRow text={f.text} source={f.source} />
          </div>
        ))}
      </div>
      <div style={{...rise(buttons), marginTop: 'auto', display: 'flex', gap: 12}}>
        <div style={{...button, background: colors.charcoal, color: '#ffffff'}}>{primary}</div>
        <div style={{...button, border: `1px solid ${colors.border}`, color: colors.charcoal}}>{secondary}</div>
      </div>
    </div>
  );
};
