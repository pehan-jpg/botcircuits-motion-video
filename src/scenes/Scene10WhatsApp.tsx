import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_MONO, alpha, kf, kfIO, tween} from '../theme';
import {AGENT, BUILD7, CENTER_CARD, WA_HEADER_GLYPH, WHATSAPP_FINAL} from '../v7';
import {Orb} from '../components/Orb';
import {GWaveform} from '../components/Glyphs';
import {ChannelLogo} from '../ui/ChannelLogo';
import {ChatThread, Msg} from '../ui/ChatThread';
import {UI, UI_FONT} from '../ui/tokens';
import {CHATS} from '../pacing';
import {envelope, SceneLayerProps} from './kit';

// replay (already seen) then the new reply, timed by src/pacing.ts
const MSGS: Msg[] = CHATS.s10.msgs;
const BLOCKED = CHATS.s10.msgs[3].typedEnd; // the "Card blocked" chip
const SHRINK: [number, number] = [0.5, 1.1];
const OUT: [number, number] = [99, 100]; // the scene now dissolves into TextBeat 6 // content blurs out, glyph morphs to the Voice waveform

/** The large mono clock + thin timeline line of scenes 1 to 3, frozen at 9:02 AM (light variant). */
export const FrozenClock: React.FC<{opacity: number; pulse: number}> = ({opacity, pulse}) => (
  <>
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity}}>
      <line x1={120} x2={1800} y1={1006} y2={1006} stroke="rgba(13,18,36,0.12)" strokeWidth={2} />
      <line x1={120} x2={120 + 1680 * 0.02} y1={1006} y2={1006} stroke="rgba(13,18,36,0.55)" strokeWidth={2} />
      <line x1={120 + 1680 * 0.02} x2={120 + 1680 * 0.02} y1={994} y2={1018} stroke="#8A9190" strokeWidth={2} />
    </svg>
    <div style={{position: 'absolute', left: 120 + 1680 * 0.02 - 9, top: 1006 - 9, width: 18, height: 18, borderRadius: 9, background: UI.ink, boxShadow: `0 0 0 6px ${alpha('#3CC37A', 0.12 + 0.3 * pulse)}`, opacity}} />
    <div
      data-safe="clock"
      style={{
        position: 'absolute',
        right: 120,
        top: 812,
        height: 140,
        lineHeight: '140px',
        fontFamily: FONT_MONO,
        fontSize: 128,
        fontWeight: 400,
        letterSpacing: '-0.02em',
        color: UI.ink,
        whiteSpace: 'nowrap',
        opacity,
        textShadow: pulse > 0.01 ? `0 0 ${36 * pulse}px rgba(60,195,122,${0.55 * pulse})` : undefined,
      }}
    >
      9:02 AM
    </div>
  </>
);

/**
 * SCENE 10 (5 s) Live on WhatsApp. The green frame and logo from scene 9 shrink
 * into the header glyph of a clean chat card on a pale wash; Maya asks again
 * and is helped at 9:02 AM (the clock from scenes 1 to 3 never advances).
 */
export const Scene10WhatsApp: React.FC<SceneLayerProps> = ({layer = 'all'}) => {
  const f = useCurrentFrame();
  const show = (k: 'bg' | 'shell' | 'fg') => layer === 'all' || layer === k;
  useVideoConfig();
  const dur = BUILD7.dur.s10;
  const env = envelope(f, dur, true, true, BUILD7.ov.s10);
  const k = kfIO(f, SHRINK, [0, 1]);
  const green = 1 - tween(f, 0.55, 1.05);
  const cardIn = tween(f, 0.6, 1.05);
  const out = tween(f, OUT[0], OUT[1]);
  const wave = tween(f, OUT[0] + 0.05, OUT[1]);
  const L = WHATSAPP_FINAL.logo;
  const g = {x: L.centerX + (WA_HEADER_GLYPH.cx - L.centerX) * k, y: L.centerY + (WA_HEADER_GLYPH.cy - L.centerY) * k, size: L.size + (WA_HEADER_GLYPH.size - L.size) * k};
  const white = 1 - tween(f, 0.75, 1.0);
  const pulse = kf(f, [BLOCKED, BLOCKED + 0.2, BLOCKED + 0.8], [0, 1, 0]);
  const owns = env.ownsShared;

  return (
    <AbsoluteFill>
      {show('bg') ? (
        <AbsoluteFill>
          {/* pale wash: #EAF8EF at the edges, white centre */}
          <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 70% at 50% 50%, #FFFFFF 0%, #FFFFFF 35%, #EAF8EF 100%)`}} />
        </AbsoluteFill>
      ) : null}

      {show('fg') ? (
        <>
          {/* the WhatsApp green from scene 9, fading to the wash */}
          {green > 0 ? <AbsoluteFill style={{background: WHATSAPP_FINAL.background, opacity: green}} /> : null}

          {owns ? (
            <>
              {/* the chat card grows around the header glyph */}
              <div style={{position: 'absolute', left: 0, top: 0, opacity: cardIn * (1 - 0 * out), filter: cardIn < 0.99 ? `blur(${10 * (1 - cardIn)}px)` : undefined, transform: `perspective(2400px) rotateX(${3 * (1 - cardIn)}deg) scale(${0.97 + 0.03 * cardIn})`, transformOrigin: `${WA_HEADER_GLYPH.cx}px ${WA_HEADER_GLYPH.cy}px`}}>
                <div style={{position: 'absolute', left: 0, top: 0, opacity: 1}}>
                  <ChatThread
                    frame={f}
                    msgs={MSGS}
                    orbColor={1}
                    x={CENTER_CARD.x}
                    y={CENTER_CARD.y}
                    hideStatus
                    header={
                      <>
                        <div style={{position: 'absolute', left: 96, top: 28}}>
                          <div style={{position: 'relative', width: 40, height: 40}}>
                            <Orb cx={20} cy={20} size={40} frame={f} shadow={false} />
                          </div>
                        </div>
                        <div style={{position: 'absolute', left: 150, top: 18, fontFamily: UI_FONT, fontSize: 26, fontWeight: 600, color: UI.ink, whiteSpace: 'nowrap'}}>{AGENT}</div>
                        <div style={{position: 'absolute', left: 150, top: 52, display: 'flex', alignItems: 'center', gap: 8, fontSize: 22, color: UI.text2}}>
                          <span style={{width: 10, height: 10, borderRadius: 5, background: '#3CC37A'}} />
                          Online
                        </div>
                      </>
                    }
                  />
                </div>
                {/* message area blurs out before the call card takes over */}
                {out > 0 ? <div style={{position: 'absolute', left: CENTER_CARD.x + 2, top: CENTER_CARD.y + 98, width: CENTER_CARD.width - 4, height: CENTER_CARD.height - 100, borderRadius: '0 0 30px 30px', background: alpha(COLORS.white, out), backdropFilter: `blur(${8 * out}px)`}} /> : null}
              </div>

              {/* the logo: white on green -> brand glyph in the header -> Voice waveform */}
              <ChannelLogo logo="whatsapp" cx={g.x} cy={g.y} size={g.size} opacity={(1 - white) * (1 - wave)} shadow={0} />
              {white > 0 ? <ChannelLogo logo="whatsapp" cx={g.x} cy={g.y} size={g.size} color={L.color} opacity={white} shadow={0} /> : null}
              {wave > 0 ? (
                <div style={{position: 'absolute', left: g.x - g.size / 2, top: g.y - g.size / 2, opacity: wave, transform: `scale(${0.7 + 0.3 * wave})`}}>
                  <GWaveform size={g.size} color={UI.ink} stroke={2.2} />
                </div>
              ) : null}

              <FrozenClock opacity={tween(f, 1.0, 1.4) * (1 - out)} pulse={pulse} />
            </>
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
