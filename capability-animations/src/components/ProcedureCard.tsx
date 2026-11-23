import React from 'react';
import {colors, fontFamily, fontWeights, radii, shadows} from '../tokens';
import {STEP_ROW} from './StepRow';

/**
 * Card with a title, a right side header element and a list of step rows.
 * Rows are passed in (StepRow elements) so the caller controls timing.
 */
export const ProcedureCard: React.FC<{
  width: number;
  height: number;
  title: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  pad?: number;
}> = ({width, height, title, headerRight, children, pad = 24}) => (
  <div
    style={{
      width,
      height,
      boxSizing: 'border-box',
      padding: pad,
      borderRadius: radii.card,
      border: `1px solid ${colors.border}`,
      background: colors.surface,
      boxShadow: shadows.card,
      fontFamily,
    }}
  >
    <div style={{height: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <div style={{fontSize: 20, fontWeight: fontWeights.semibold, letterSpacing: '-0.01em', color: colors.text}}>{title}</div>
      {headerRight}
    </div>
    <div style={{marginTop: 16, display: 'flex', flexDirection: 'column', gap: STEP_ROW.gap}}>{children}</div>
  </div>
);
