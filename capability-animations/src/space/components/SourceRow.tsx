import React from 'react';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {ChannelIconBox, ChannelKind} from '../../components/ChannelGlyph';
import {TickIcon} from '../../components/Icons';
import {Spinner} from '../../components/Spinner';

export const SOURCE_ROW = {height: 76, padX: 20} as const;

/**
 * One knowledge source: grey glyph tile, name, detail and a status icon
 * (spinner to charcoal tick). `active` (0..1) adds a 1.5px charcoal outline;
 * `dashed` draws a dashed outline inset 10px and hides the status icon.
 */
export const SourceRow: React.FC<{
  width: number;
  kind: ChannelKind;
  name: string;
  detail?: string;
  spinner?: number;
  done?: number;
  tick?: number;
  active?: number;
  dashed?: boolean;
}> = ({width, kind, name, detail, spinner = 0, done = 0, tick = 0, active = 0, dashed = false}) => (
  <div
    style={{
      position: 'relative',
      width,
      height: SOURCE_ROW.height,
      boxSizing: 'border-box',
      borderBottom: dashed ? undefined : `1px solid ${colors.border}`,
      fontFamily,
    }}
  >
    {dashed && (
      <div style={{position: 'absolute', inset: 10, borderRadius: 12, border: `1.5px dashed ${colors.line}`}} />
    )}
    {active > 0 && (
      <div style={{position: 'absolute', inset: '6px 10px', borderRadius: 12, border: `1.5px solid ${colors.charcoal}`, opacity: active}} />
    )}
    <div style={{position: 'absolute', inset: `0 ${SOURCE_ROW.padX}px`, display: 'flex', alignItems: 'center', gap: 14}}>
      <ChannelIconBox kind={kind} size={44} />
      <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2}}>
        <div style={{fontSize: 16, fontWeight: fontWeights.semibold, lineHeight: '20px', color: colors.text, whiteSpace: 'nowrap'}}>{name}</div>
        {detail && <div style={{fontSize: 14, lineHeight: '18px', color: colors.textSecondary, whiteSpace: 'nowrap'}}>{detail}</div>}
      </div>
      {!dashed && (
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
      )}
    </div>
  </div>
);
