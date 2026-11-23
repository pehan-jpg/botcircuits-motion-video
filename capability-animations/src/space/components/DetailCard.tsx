import React from 'react';
import {mix} from '../../motion';
import {colors, fontFamily, fontWeights, radii, shadows, tagColours} from '../../tokens';
import {Chip} from '../../components/Chip';
import {Orb} from '../../components/Orb';

export type DetailSection = {label: string; chips: {label: string; tool?: boolean}[]};

const rise = (v: number, d = 8): React.CSSProperties => ({opacity: v, transform: `translateY(${mix(d, 0, v)}px)`});

/**
 * One agent's profile: header, labelled chip sections, and a note.
 * `header`, `items[k]` (labels and chips in reading order) and `note`
 * (0..1) reveal each part.
 */
export const DetailCard: React.FC<{
  width: number;
  height: number;
  name: string;
  role: string;
  sections: DetailSection[];
  note: string;
  header: number;
  items: number[];
  noteIn: number;
}> = ({width, height, name, role, sections, note, header, items, noteIn}) => {
  let k = 0;
  return (
    <div
      style={{
        width,
        height,
        boxSizing: 'border-box',
        padding: 24,
        borderRadius: radii.card,
        border: `1px solid ${colors.border}`,
        background: colors.surface,
        boxShadow: shadows.card,
        display: 'flex',
        flexDirection: 'column',
        fontFamily,
      }}
    >
      <div style={{...rise(header), display: 'flex', alignItems: 'center', gap: 14}}>
        <Orb size={40} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
          <div style={{fontSize: 20, fontWeight: fontWeights.semibold, lineHeight: '24px', letterSpacing: '-0.01em', color: colors.text}}>
            {name}
          </div>
          <div style={{fontSize: 15, lineHeight: '20px', color: colors.textSecondary}}>{role}</div>
        </div>
      </div>
      <div style={{marginTop: 28, display: 'flex', flexDirection: 'column', gap: 20}}>
        {sections.map((s) => {
          const labelIn = items[k++] ?? 0;
          return (
            <div key={s.label}>
              <div style={{...rise(labelIn, 6), fontSize: 13, fontWeight: fontWeights.medium, lineHeight: '18px', color: colors.textSecondary}}>
                {s.label}
              </div>
              <div style={{marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                {s.chips.map((c) => {
                  const v = items[k++] ?? 0;
                  const tone = c.tool ? tagColours.tool : {background: colors.greyPill, text: colors.text};
                  return (
                    <div key={c.label} style={rise(v, 6)}>
                      <Chip label={c.label} fontSize={14} height={32} paddingX={12} radius={12} background={tone.background} color={tone.text} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{...rise(noteIn, 6), marginTop: 'auto', fontSize: 14, lineHeight: '20px', color: colors.textSecondary}}>{note}</div>
    </div>
  );
};

/** Number of reveal items (labels plus chips) in reading order. */
export const detailItemCount = (sections: DetailSection[]) => sections.reduce((n, s) => n + 1 + s.chips.length, 0);
