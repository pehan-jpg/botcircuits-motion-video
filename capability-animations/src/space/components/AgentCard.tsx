import React from 'react';
import {mix} from '../../motion';
import {colors, fontFamily, fontWeights, shadows} from '../../tokens';
import {TickIcon} from '../../components/Icons';
import {Orb} from '../../components/Orb';
import {Spinner} from '../../components/Spinner';

export const AGENT_CARD = {width: 220, height: 96, radius: 16} as const;

/**
 * One agent: orb, name, role and a status icon at the top right that goes
 * from nothing, to a spinner, to a charcoal tick. `selected` adds a 1.5px
 * charcoal outline.
 */
export const AgentCard: React.FC<{
  name: string;
  role: string;
  orb: number;
  text: number;
  spinner: number;
  done: number;
  tick: number;
  selected?: number;
}> = ({name, role, orb, text, spinner, done, tick, selected = 0}) => (
  <div
    style={{
      position: 'relative',
      width: AGENT_CARD.width,
      height: AGENT_CARD.height,
      boxSizing: 'border-box',
      borderRadius: AGENT_CARD.radius,
      border: `1px solid ${colors.border}`,
      background: colors.surface,
      boxShadow: shadows.card,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '0 16px',
      fontFamily,
    }}
  >
    {selected > 0 && (
      <div
        style={{
          position: 'absolute',
          inset: -1,
          borderRadius: AGENT_CARD.radius,
          border: `1.5px solid ${colors.charcoal}`,
          opacity: selected,
        }}
      />
    )}
    <div style={{opacity: orb}}>
      <Orb size={32} />
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 2, opacity: text, transform: `translateY(${mix(6, 0, text)}px)`}}>
      <div style={{fontSize: 16, fontWeight: fontWeights.semibold, lineHeight: '20px', color: colors.text, whiteSpace: 'nowrap'}}>{name}</div>
      <div style={{fontSize: 14, fontWeight: fontWeights.regular, lineHeight: '18px', color: colors.textSecondary, whiteSpace: 'nowrap'}}>
        {role}
      </div>
    </div>
    <div style={{position: 'absolute', top: 12, right: 12, width: 20, height: 20}}>
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
  </div>
);
