import React from 'react';
import {Orb} from '../../components/Orb';
import {LabelledCard} from './RecordCard';
import {MaskChip} from './MaskedValue';

/** What the model receives: masked chips only, rows revealed one by one. */
export const ModelCard: React.FC<{
  width: number;
  height: number;
  title: string;
  rows: {label: string; masked: string; appear: number}[];
}> = ({width, height, title, rows}) => (
  <LabelledCard
    width={width}
    height={height}
    header={
      <>
        <Orb size={24} />
        {title}
      </>
    }
    rows={rows.map((r) => ({label: r.label, appear: r.appear, value: <div style={{height: 32}}><MaskChip label={r.masked} /></div>}))}
  />
);
