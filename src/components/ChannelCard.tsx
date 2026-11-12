import React from 'react';
import {COLORS, alpha, kf, popIn} from '../theme';
import {Logo, LogoName} from './logos';
import {GPhone, GWaveform, GWebChat} from './Glyphs';
import {AgentAvatar} from './Logo';

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
  whatsapp: '#25D366',
  messenger: '#5B6CFF',
  instagram: '#E1306C',
  telegram: '#2AABEE',
  slack: '#B05AB2',
  webchat: '#5B7CF6',
  voice: '#FB7A50',
  mobile: '#8B5CF6',
};

/**
 * Tall channel card: brand gradient, logo in a white circle, and a
 * miniature chat (skeleton customer bubble, then an agent bubble with the
 * white orb avatar). No text. Positioned by centre; `chatAt` is the scene
 * time (s) the mini chat plays.
 */
export const ChannelCard: React.FC<{
  name: LogoName;
  frame: number;
  cx: number;
  cy: number;
  scale?: number;
  glow?: number;
  chatAt?: number;
  logoPop?: number;
  whiten?: number; // 0..1 background turns white
}> = ({name, frame, cx, cy, scale = 1, glow = 0, chatAt, logoPop = 1, whiten = 0}) => {
  const g = CHANNEL_GRADIENTS[name];
  const glowC = BRAND_GLOW[name];
  const c1 = chatAt === undefined ? 0 : popIn(frame, chatAt, 0.3, 1.04);
  const c2 = chatAt === undefined ? 0 : popIn(frame, chatAt + 0.35, 0.3, 1.04);
  const drawn = name === 'webchat' ? GWebChat : name === 'voice' ? GWaveform : name === 'mobile' ? GPhone : null;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - CARD.width / 2,
        top: cy - CARD.height / 2,
        width: CARD.width,
        height: CARD.height,
        transform: `scale(${scale})`,
      }}
    >
      {glow > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: -140,
            top: -140,
            width: CARD.width + 280,
            height: CARD.height + 280,
            borderRadius: 120,
            background: `radial-gradient(ellipse at 50% 50%, ${alpha(glowC, 0.6 * glow)} 0%, ${alpha(glowC, 0)} 62%)`,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: CARD.radius,
          background: `linear-gradient(160deg, ${g.join(', ')})`,
          boxShadow: '0 40px 90px rgba(13,18,36,0.35)',
          overflow: 'hidden',
        }}
      >
        <div style={{position: 'absolute', inset: 0, background: COLORS.white, opacity: whiten}} />
        <div
          style={{
            position: 'absolute',
            left: (CARD.width - CARD.logoCircle) / 2,
            top: 70,
            width: CARD.logoCircle,
            height: CARD.logoCircle,
            borderRadius: '50%',
            background: name === 'webchat' || name === 'voice' || name === 'mobile' ? alpha(COLORS.white, 0.18) : COLORS.white,
            border: `2px solid ${alpha(COLORS.white, 0.6)}`,
            boxShadow: '0 16px 40px rgba(13,18,36,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${logoPop})`,
          }}
        >
          {drawn ? React.createElement(drawn, {size: CARD.logo, color: COLORS.white, stroke: 1.8}) : <Logo name={name} size={CARD.logo} />}
        </div>
        {/* mini chat */}
        <div style={{position: 'absolute', left: 30, right: 30, top: 340, opacity: 1 - whiten}}>
          <div
            style={{
              width: 210,
              height: 86,
              borderRadius: '28px 28px 28px 8px',
              background: alpha(COLORS.white, 0.28),
              padding: '22px 24px',
              boxSizing: 'border-box',
              opacity: c1,
              transform: `translateY(${(1 - Math.min(1, c1)) * 16}px) scale(${c1})`,
              transformOrigin: '0 100%',
            }}
          >
            <div style={{width: '90%', height: 14, borderRadius: 7, background: alpha(COLORS.white, 0.8), marginBottom: 12}} />
            <div style={{width: '60%', height: 14, borderRadius: 7, background: alpha(COLORS.white, 0.8)}} />
          </div>
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 12, justifyContent: 'flex-end', marginTop: 22, opacity: Math.min(1, c2), transform: `scale(${c2})`, transformOrigin: '100% 100%'}}>
            <div style={{width: 190, height: 86, borderRadius: '28px 28px 8px 28px', background: COLORS.white, padding: '22px 24px', boxSizing: 'border-box'}}>
              <div style={{width: '85%', height: 14, borderRadius: 7, background: alpha(COLORS.inkNavy, 0.25), marginBottom: 12}} />
              <div style={{width: '55%', height: 14, borderRadius: 7, background: alpha(COLORS.inkNavy, 0.25)}} />
            </div>
            <AgentAvatar size={56} dark />
          </div>
        </div>
      </div>
    </div>
  );
};

export const cardLift = (frame: number, at: number) => kf(frame, [at, at + 0.32, at + 0.5], [1, -0.035, 0]);
