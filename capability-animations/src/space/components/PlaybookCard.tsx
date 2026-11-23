import React from 'react';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {Card} from '../../components/Card';

export const PLAYBOOK = {header: 80, row: 84, padX: 28} as const;

/**
 * Playbook frame: title and status chip in an 80px header, then the step
 * rows (passed as children, positioned by the caller) and an optional
 * highlight layer drawn under the rows.
 */
export const PlaybookCard: React.FC<{
  width: number;
  height: number;
  title: string;
  status: React.ReactNode;
  highlight?: React.ReactNode;
  children: React.ReactNode;
}> = ({width, height, title, status, highlight, children}) => (
  <Card width={width} height={height}>
    <div
      style={{
        height: PLAYBOOK.header,
        boxSizing: 'border-box',
        padding: `0 ${PLAYBOOK.padX}px`,
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily,
      }}
    >
      <span style={{fontSize: 22, fontWeight: fontWeights.semibold, letterSpacing: '-0.01em', color: colors.text}}>{title}</span>
      {status}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: PLAYBOOK.header, bottom: 0}}>
      {highlight}
      {children}
    </div>
  </Card>
);
