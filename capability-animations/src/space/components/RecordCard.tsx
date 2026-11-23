import React from 'react';
import {mix} from '../../motion';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {Card} from '../../components/Card';

export const RECORD = {header: 64, row: 84, pad: 24} as const;

/**
 * Card with a header and labelled value rows. `rows[k].appear` (0..1)
 * reveals a row; rows keep their reserved space while hidden.
 */
export const LabelledCard: React.FC<{
  width: number;
  height: number;
  header: React.ReactNode;
  rows: {label: string; value: React.ReactNode; appear?: number}[];
}> = ({width, height, header, rows}) => (
  <Card width={width} height={height}>
    <div
      style={{
        height: RECORD.header,
        boxSizing: 'border-box',
        padding: `0 ${RECORD.pad}px`,
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily,
        fontSize: 18,
        fontWeight: fontWeights.semibold,
        color: colors.text,
      }}
    >
      {header}
    </div>
    {rows.map((r, i) => {
      const a = r.appear ?? 1;
      return (
        <div
          key={r.label}
          style={{
            height: RECORD.row,
            boxSizing: 'border-box',
            padding: `0 ${RECORD.pad}px`,
            borderBottom: i < rows.length - 1 ? `1px solid ${colors.border}` : undefined,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 4,
            fontFamily,
          }}
        >
          <div style={{display: 'flex', flexDirection: 'column', gap: 4, opacity: a, transform: `translateY(${mix(12, 0, a)}px)`}}>
            <span style={{fontSize: 13, lineHeight: '18px', color: colors.textSecondary}}>{r.label}</span>
            {r.value}
          </div>
        </div>
      );
    })}
  </Card>
);

/** The source record, with each value able to mask itself. */
export const RecordCard: React.FC<{width: number; height: number; title: string; rows: {label: string; value: React.ReactNode}[]}> = ({
  width,
  height,
  title,
  rows,
}) => <LabelledCard width={width} height={height} header={title} rows={rows} />;
