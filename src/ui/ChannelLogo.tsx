import React from 'react';
import {siInstagram, siMessenger, siTelegram, siWhatsapp} from 'simple-icons';
import {siSlack} from 'simple-icons13';
import {alpha} from '../theme';
import {GPhone, GWaveform, GWebChat} from '../components/Glyphs';
import {fileExists} from '../components/Backdrop';
import {Img, staticFile} from 'remotion';

export type Channel = 'whatsapp' | 'messenger' | 'instagram' | 'telegram' | 'slack' | 'webchat' | 'voice' | 'mobile';
export const CHANNEL_GLOW: Record<Channel, string> = {
  whatsapp: '#25D366', messenger: '#A033FF', instagram: '#E1306C', telegram: '#26A5E4', slack: '#E01E5A', webchat: '#7FB2FF', voice: '#FFB27A', mobile: '#C4B5FD',
};
const BRAND: Partial<Record<Channel, {path: string; hex: string; grad?: string[]}>> = {
  whatsapp: {path: siWhatsapp.path, hex: '#25D366'},
  messenger: {path: siMessenger.path, hex: '#0866FF', grad: ['#0099FF', '#A033FF', '#FF5280', '#FF7061']},
  instagram: {path: siInstagram.path, hex: '#E1306C', grad: ['#FEDA75', '#FA7E1E', '#D62976', '#962FBF', '#4F5BD5']},
  telegram: {path: siTelegram.path, hex: '#26A5E4'},
  slack: {path: siSlack.path, hex: `#${siSlack.hex}`},
};
/** Which source a channel logo uses (for the report). */
export const channelSource = (c: Channel) => (fileExists(`logos/${c}.svg`) ? 'file' : BRAND[c] ? 'simple-icons' : 'drawn');

/**
 * A standalone channel logo on white (no container): brand glyph in full
 * colour, or an ink line glyph, with a soft drop shadow. Optional brand
 * glow behind it and a red badge.
 */
export const ChannelLogo: React.FC<{logo: Channel; cx: number; cy: number; size?: number; glow?: number; color?: string; opacity?: number; scale?: number; blur?: number; badge?: React.ReactNode; shadow?: number}> = ({
  logo,
  cx,
  cy,
  size = 200,
  glow = 0,
  color,
  opacity = 1,
  scale = 1,
  blur = 0,
  badge,
  shadow = 1,
}) => {
  const b = BRAND[logo];
  const id = `cl-${logo}`;
  let glyph: React.ReactNode;
  if (fileExists(`logos/${logo}.svg`) && !color) glyph = <Img src={staticFile(`logos/${logo}.svg`)} style={{width: size, height: size, objectFit: 'contain'}} />;
  else if (b)
    glyph = (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block', overflow: 'visible'}}>
        {b.grad && !color ? (
          <defs>
            <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
              {b.grad.map((c, i) => (
                <stop key={c} offset={i / (b.grad!.length - 1)} stopColor={c} />
              ))}
            </linearGradient>
          </defs>
        ) : null}
        <path d={b.path} fill={color ?? (b.grad ? `url(#${id})` : b.hex)} />
      </svg>
    );
  else {
    const G = logo === 'webchat' ? GWebChat : logo === 'voice' ? GWaveform : GPhone;
    glyph = <G size={size} color={color ?? '#0D1224'} stroke={1.6} />;
  }
  return (
    <div data-safe={`logo ${logo}`} style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, opacity, transform: `scale(${scale})`, filter: blur > 0.05 ? `blur(${blur}px)` : undefined}}>
      {glow > 0 ? (
        <div style={{position: 'absolute', left: -size * 0.75, top: -size * 0.75, width: size * 2.5, height: size * 2.5, borderRadius: '50%', background: `radial-gradient(circle, ${alpha(CHANNEL_GLOW[logo], 0.55 * glow)} 0%, ${alpha(CHANNEL_GLOW[logo], 0)} 62%)`}} />
      ) : null}
      <div style={{position: 'relative', filter: shadow > 0.01 ? `drop-shadow(0 10px 30px rgba(13,18,36,${0.12 * shadow}))` : undefined}}>{glyph}</div>
      {badge}
    </div>
  );
};
