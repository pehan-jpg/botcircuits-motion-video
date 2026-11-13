import React from 'react';
import {COLORS, alpha, popIn} from '../theme';
import {Logo, LogoName} from '../components/logos';
import {GPhone, GWaveform, GWebChat} from '../components/Glyphs';
import {Orb} from '../components/Orb';
import {UI_FONT} from './tokens';

export const CARD = {width: 360, height: 640, radius: 40, gap: 40, logoCircle: 180, logo: 130};
export const CHANNEL_GRADIENTS: Record<string, string[]> = {
  whatsapp: ['#1FAF5A', '#128C7E'],
  messenger: ['#0084FF', '#A334FA'],
  instagram: ['#F58529', '#DD2A7B', '#8134AF'],
  telegram: ['#2AABEE', '#229ED9'],
  slack: ['#4A154B', '#4A154B'],
  webchat: ['#3B82F6', '#6366F1'],
  voice: ['#FB923C', '#F43F5E'],
  mobile: ['#8B5CF6', '#6D28D9'],
};
export const BRAND_GLOW: Record<string, string> = {
  whatsapp: '#25D366', messenger: '#5B6CFF', instagram: '#E1306C', telegram: '#2AABEE', slack: '#B05AB2', webchat: '#5B7CF6', voice: '#FB7A50', mobile: '#8B5CF6',
};

/**
 * Tall brand-coloured channel card: logo in a white circle, and a miniature
 * chat below. With `convo`, the chat shows Maya's real messages (28px text);
 * otherwise skeleton bubbles. Positioned by centre.
 */
export const ChannelCard: React.FC<{
  name: LogoName;
  frame: number;
  cx: number;
  cy: number;
  scale?: number;
  glow?: number;
  chatAt?: number;
  convo?: {maya: string; agent: string};
  showChat?: number;
  whiten?: number;
}> = ({name, frame, cx, cy, scale = 1, glow = 0, chatAt, convo, showChat = 1, whiten = 0}) => {
  const g = CHANNEL_GRADIENTS[name];
  const c1 = chatAt === undefined ? 0 : popIn(frame, chatAt, 0.3, 1.04);
  const c2 = chatAt === undefined ? 0 : popIn(frame, chatAt + 0.35, 0.3, 1.04);
  const drawn = name === 'webchat' ? GWebChat : name === 'voice' ? GWaveform : name === 'mobile' ? GPhone : null;
  const bubble = (from: 'maya' | 'agent', text: string | null, p: number) => (
    <div
      style={{
        alignSelf: from === 'maya' ? 'flex-end' : 'flex-start',
        maxWidth: 260,
        padding: text ? '14px 18px' : '22px 24px',
        borderRadius: from === 'maya' ? '24px 24px 6px 24px' : '24px 24px 24px 6px',
        background: from === 'maya' ? alpha(COLORS.white, 0.3) : COLORS.white,
        color: from === 'maya' ? COLORS.white : '#0D1224',
        fontFamily: UI_FONT,
        fontWeight: 500,
        fontSize: 28,
        lineHeight: '36px',
        opacity: Math.min(1, p),
        transform: `scale(${p})`,
        transformOrigin: from === 'maya' ? '100% 100%' : '0 100%',
        width: text ? undefined : from === 'maya' ? 200 : 210,
      }}
    >
      {text ?? (
        <>
          <div style={{width: '90%', height: 14, borderRadius: 7, background: from === 'maya' ? alpha(COLORS.white, 0.8) : alpha('#0D1224', 0.22), marginBottom: 12}} />
          <div style={{width: '60%', height: 14, borderRadius: 7, background: from === 'maya' ? alpha(COLORS.white, 0.8) : alpha('#0D1224', 0.22)}} />
        </>
      )}
    </div>
  );
  return (
    <div style={{position: 'absolute', left: cx - CARD.width / 2, top: cy - CARD.height / 2, width: CARD.width, height: CARD.height, transform: `scale(${scale})`}}>
      {glow > 0 ? (
        <div style={{position: 'absolute', left: -140, top: -140, width: CARD.width + 280, height: CARD.height + 280, borderRadius: 120, background: `radial-gradient(ellipse at 50% 50%, ${alpha(BRAND_GLOW[name], 0.6 * glow)} 0%, ${alpha(BRAND_GLOW[name], 0)} 62%)`}} />
      ) : null}
      <div style={{position: 'absolute', inset: 0, borderRadius: CARD.radius, background: `linear-gradient(160deg, ${g.join(', ')})`, boxShadow: '0 40px 90px rgba(13,18,36,0.35)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, background: COLORS.white, opacity: whiten}} />
        <div
          style={{
            position: 'absolute',
            left: (CARD.width - CARD.logoCircle) / 2,
            top: 60,
            width: CARD.logoCircle,
            height: CARD.logoCircle,
            borderRadius: '50%',
            background: drawn ? alpha(COLORS.white, 0.18) : COLORS.white,
            border: `2px solid ${alpha(COLORS.white, 0.6)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {drawn ? React.createElement(drawn, {size: CARD.logo, color: COLORS.white, stroke: 1.8}) : <Logo name={name} size={CARD.logo} />}
        </div>
        <div style={{position: 'absolute', left: 24, right: 24, top: 290, display: 'flex', flexDirection: 'column', gap: 18, opacity: showChat * (1 - whiten)}}>
          {bubble('maya', convo ? convo.maya : null, c1)}
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 10, opacity: Math.min(1, c2)}}>
            <div style={{position: 'relative', width: 48, height: 48, flexShrink: 0}}>
              <Orb cx={24} cy={24} size={48} frame={frame} shadow={false} />
            </div>
            {bubble('agent', convo ? convo.agent : null, c2)}
          </div>
        </div>
      </div>
    </div>
  );
};
