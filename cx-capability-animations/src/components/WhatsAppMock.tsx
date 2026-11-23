import React from 'react';
import {colors} from '../tokens';
import {ChatBubble, Meta} from './ChatBubble';
import {DoubleTick, MockProps, TimeLabel, useExchange} from './MockShared';
import {Orb} from './Orb';

/** WhatsApp style chat mockup (generic, no brand colours or logo). */
export const WhatsAppMock: React.FC<MockProps & {stamp: string}> = ({
  exchange: e,
  timeLabel,
  timeLabelOpacity,
  width,
  height,
  stamp,
}) => {
  const s = useExchange(e);
  return (
    <div style={{width, height, background: '#f6f6f1', padding: 20, boxSizing: 'border-box'}}>
      <TimeLabel label={timeLabel} opacity={timeLabelOpacity} pill />
      <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 22}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
          <ChatBubble text={e.customer} startFrame={e.customerStart} cps={e.cps} background={colors.charcoal} color="#ffffff" radius={12} />
          <Meta align="right" opacity={s.customerMeta}>
            {stamp}
            <DoubleTick />
          </Meta>
        </div>
        <div style={{display: 'flex', alignItems: 'flex-end', gap: 8, opacity: s.avatar > 0 ? 1 : 0}}>
          <div style={{opacity: s.avatar, marginBottom: 20}}>
            <Orb size={28} />
          </div>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <ChatBubble
              text={e.agent}
              startFrame={e.agentStart}
              cps={e.cps}
              background={colors.surface}
              color={colors.text}
              border={`1px solid ${colors.border}`}
              radius={12}
            />
            <Meta opacity={s.agentMeta}>{stamp}</Meta>
          </div>
        </div>
      </div>
    </div>
  );
};

