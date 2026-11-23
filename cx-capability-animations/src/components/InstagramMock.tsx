import React from 'react';
import {progress} from '../motion';
import {colors, fontFamily} from '../tokens';
import {ChatBubble} from './ChatBubble';
import {Initials} from './ContextBar';
import {MockProps, TimeLabel, useExchange} from './MockShared';
import {Orb} from './Orb';

/** Instagram style direct message mockup (generic, no brand colours or logo). */
export const InstagramMock: React.FC<MockProps & {customerInitials: string}> = ({
  exchange: e,
  timeLabel,
  timeLabelOpacity,
  width,
  height,
  customerInitials,
}) => {
  const s = useExchange(e);
  const customerIn = progress(s.frame, e.customerStart, e.customerStart + 0.15 * s.fps);
  return (
    <div style={{position: 'relative', width, height, background: colors.surface, padding: 20, boxSizing: 'border-box'}}>
      <TimeLabel label={timeLabel} opacity={timeLabelOpacity} />
      <div style={{display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24}}>
        <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 8}}>
          <ChatBubble text={e.customer} startFrame={e.customerStart} cps={e.cps} background={colors.charcoal} color="#ffffff" radius={22} />
          <div style={{opacity: customerIn}}>
            <Initials initials={customerInitials} size={28} background={colors.greyPill} />
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 8}}>
          <div style={{opacity: s.avatar}}>
            <Orb size={28} />
          </div>
          <ChatBubble text={e.agent} startFrame={e.agentStart} cps={e.cps} background={colors.greyPill} color={colors.text} radius={22} />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 20,
          height: 44,
          borderRadius: 22,
          border: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 18,
          fontFamily,
          fontSize: 15,
          color: colors.textSecondary,
        }}
      >
        Message
      </div>
    </div>
  );
};

