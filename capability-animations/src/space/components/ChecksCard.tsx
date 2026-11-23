import React from 'react';
import {interpolateColors} from 'remotion';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {Card} from '../../components/Card';
import {TickIcon} from '../../components/Icons';
import {Spinner} from '../../components/Spinner';

/** One check: spinner that becomes a charcoal tick, and its text. */
export const CheckRow: React.FC<{text: string; spinner: number; done: number; tick: number}> = ({text, spinner, done, tick}) => (
  <div style={{height: 56, display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px', fontFamily}}>
    <div style={{position: 'relative', width: 20, height: 20, flexShrink: 0}}>
      {spinner > 0 && done < 1 && (
        <div style={{position: 'absolute', inset: 0, opacity: spinner * (1 - done)}}>
          <Spinner size={20} />
        </div>
      )}
      {done > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: done, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <TickIcon size={18} strokeWidth={1.75} color={colors.charcoal} draw={tick} />
        </div>
      )}
    </div>
    <span style={{fontSize: 16, color: colors.text}}>{text}</span>
  </div>
);

/**
 * Checks frame: header with a Run test button (`press` 0..1 lightens it),
 * check rows as children, and a 48px slot for a result chip.
 */
export const ChecksCard: React.FC<{
  width: number;
  height: number;
  title: string;
  button: string;
  press: number;
  result?: React.ReactNode;
  children: React.ReactNode;
}> = ({width, height, title, button, press, result, children}) => (
  <Card width={width} height={height}>
    <div
      style={{
        height: 64,
        boxSizing: 'border-box',
        padding: '0 24px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily,
      }}
    >
      <span style={{fontSize: 18, fontWeight: fontWeights.semibold, color: colors.text}}>{title}</span>
      <div
        style={{
          height: 36,
          padding: '0 16px',
          borderRadius: 10,
          background: interpolateColors(press, [0, 1], [colors.charcoal, '#333333']),
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          fontSize: 14,
          fontWeight: fontWeights.medium,
        }}
      >
        {button}
      </div>
    </div>
    <div style={{paddingTop: 4}}>{children}</div>
    <div style={{height: 48, padding: '4px 24px 0', display: 'flex', alignItems: 'center'}}>{result}</div>
  </Card>
);
