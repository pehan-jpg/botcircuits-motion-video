import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_MONO, FONT_SANS, alpha, kfIO, popIn, tween} from '../theme';
import {AGENT, BUILD7, CENTER_CARD, DANIEL_ROW, WA_HEADER_GLYPH} from '../v7';
import {Orb} from '../components/Orb';
import {GWaveform} from '../components/Glyphs';
import {CheckStroke} from '../components/Chip';
import {UI, UI_FONT} from '../ui/tokens';
import {LineToCircle} from '../components/Morph';
import {beatUnderline} from '../ui/TextBeat';
import {envelope, SceneLayerProps} from './kit';

const C = CENTER_CARD;
const ORB0 = {x: C.width / 2, y: 330}; // card local
const ORB1 = {x: C.width / 2 - 110, y: 330};
const N_POS = {x: C.width / 2 + 120, y: 330};
const PER_WORD = 0.07;
type Line = {who: 'D' | 'agent' | 'N'; text: string; at: number};
const LINES: Line[] = [
  {who: 'D', text: "I don't recognise a charge on my statement.", at: 0.8},
  {who: 'agent', text: "I can help with that. This needs a teammate to review it, so I'm bringing one in now.", at: 1.8},
  {who: 'N', text: "Hi Daniel, I've got the details and I'll take it from here.", at: 3.95},
];
const lineEnd = (l: Line) => l.at + l.text.split(' ').length * PER_WORD;
const HANDOFF = 3.05;
const COLLAPSE: [number, number] = [4.9, 5.5];

/** Who is speaking at time s (drives the waveform ring). */
const speaker = (s: number): 'D' | 'agent' | 'N' | null => {
  for (const l of LINES) if (s >= l.at && s <= lineEnd(l) + 0.25) return l.who;
  return null;
};

/** Ring of 48 thin bars around a centre, amplitude from seeded noise of the frame. */
const BarRing: React.FC<{cx: number; cy: number; r: number; frame: number; level: number; color: string; split?: number; seed: string; opacity?: number}> = ({cx, cy, r, frame, level, color, split = 0, seed, opacity = 1}) => {
  const bars = Array.from({length: 48}).map((_, i) => {
    const a = (i / 48) * Math.PI * 2 - Math.PI / 2;
    const q = Math.floor(frame / 3);
    const n0 = random(`${seed}-${i}-${q}`);
    const n1 = random(`${seed}-${i}-${q + 1}`);
    const t = (frame % 3) / 3;
    const n = n0 + (n1 - n0) * t;
    const env = 0.55 + 0.45 * Math.sin(frame / 7 + i * 0.6);
    const len = 8 + level * (10 + 34 * n * env);
    // split: the two halves of the ring move apart (left and right)
    const dx = Math.cos(a) >= 0 ? split * 40 : -split * 40;
    return {a, len, dx, op: 1 - split * (Math.abs(Math.sin(a)) > 0.92 ? 1 : 0.3)};
  });
  return (
    <svg width={2 * (r + 80)} height={2 * (r + 80)} style={{position: 'absolute', left: cx - r - 80, top: cy - r - 80, overflow: 'visible', opacity}}>
      {bars.map((b, i) => (
        <line
          key={i}
          x1={r + 80 + b.dx + Math.cos(b.a) * r}
          y1={r + 80 + Math.sin(b.a) * r}
          x2={r + 80 + b.dx + Math.cos(b.a) * (r + b.len)}
          y2={r + 80 + Math.sin(b.a) * (r + b.len)}
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          opacity={b.op}
        />
      ))}
    </svg>
  );
};

const InkAvatar: React.FC<{size: number; letter: string}> = ({size, letter}) => (
  <div style={{width: size, height: size, borderRadius: size / 2, background: UI.ink, color: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_SANS, fontWeight: 600, fontSize: size * 0.42, flexShrink: 0}}>{letter}</div>
);

/** One transcript row: avatar + text typed word by word. */
const TranscriptRow: React.FC<{l: Line; frame: number; s: number}> = ({l, frame, s}) => {
  const words = l.text.split(' ');
  const k = Math.max(1, Math.min(words.length, Math.floor((s - l.at) / PER_WORD) + 1));
  return (
    <div style={{display: 'flex', gap: 16, alignItems: 'flex-start', padding: '10px 0', opacity: popIn(frame, l.at, 0.3, 1.03) > 0 ? Math.min(1, popIn(frame, l.at, 0.3, 1.03)) : 0}}>
      {l.who === 'agent' ? (
        <div style={{position: 'relative', width: 40, height: 40, flexShrink: 0}}>
          <Orb cx={20} cy={20} size={40} frame={frame} shadow={false} />
        </div>
      ) : (
        <InkAvatar size={40} letter={l.who} />
      )}
      <div style={{fontFamily: FONT_SANS, fontSize: 26, lineHeight: '36px', color: UI.ink, width: C.width - 48 - 56}}>
        {words.map((w, i) => (
          <span key={i} style={{opacity: i < k ? 1 : 0}}>
            {w}
            {i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
    </div>
  );
};

/**
 * SCENE 11 (6.5 s) A voice call that needs a person. The orb speaks inside a
 * ring of waveform bars, a teammate (N) joins, and the call card collapses
 * into a conversation row.
 */
export const Scene11Voice: React.FC<SceneLayerProps> = ({layer = 'all'}) => {
  const f = useCurrentFrame();
  const show = (k: 'bg' | 'shell' | 'fg') => layer === 'all' || layer === k;
  const {fps} = useVideoConfig();
  const s = f / fps;
  const dur = BUILD7.dur.s11;
  const env = envelope(f, dur, true, true, BUILD7.ov.s11);
  const sp = speaker(s);
  const split = kfIO(f, [HANDOFF, HANDOFF + 0.35], [0, 1]);
  const move = kfIO(f, [HANDOFF + 0.1, HANDOFF + 0.6], [0, 1]);
  const nIn = popIn(f, HANDOFF + 0.3, 0.35, 1.04);
  const joined = popIn(f, HANDOFF + 0.6, 0.3, 1.04);
  const orbSize = 220 + (120 - 220) * move;
  const orbC = {x: ORB0.x + (ORB1.x - ORB0.x) * move, y: ORB0.y};
  const agentLevel = sp === 'agent' ? 1 : 0.15;
  const nLevel = sp === 'N' ? 1 : 0.15;
  const timer = Math.max(0, Math.floor(s - 0.3));
  const col = kfIO(f, COLLAPSE, [0, 1]);
  const content = 1 - tween(f, COLLAPSE[0], COLLAPSE[0] + 0.3);
  const rowIn = tween(f, COLLAPSE[0] + 0.3, COLLAPSE[1]);
  const rect = {x: C.x + (DANIEL_ROW.x - C.x) * col, y: C.y + (DANIEL_ROW.y - C.y) * col, w: C.width + (DANIEL_ROW.width - C.width) * col, h: C.height + (DANIEL_ROW.height - C.height) * col};
  const owns = env.ownsShared;
  const shown = LINES.filter((l) => s >= l.at);

  return (
    <AbsoluteFill>
      {show('bg') ? (
        <AbsoluteFill style={{opacity: env.inP * (1 - env.outP), filter: env.inP < 0.99 ? `blur(${14 * (1 - env.inP)}px)` : undefined}}>
          {/* soft lilac and peach wash */}
          <AbsoluteFill style={{background: `radial-gradient(circle at 18% 22%, ${alpha('#D9D0FF', 0.9)} 0%, ${alpha('#D9D0FF', 0)} 45%), radial-gradient(circle at 85% 80%, ${alpha('#FFD3B5', 0.85)} 0%, ${alpha('#FFD3B5', 0)} 45%), #FBF8FF`}} />
        </AbsoluteFill>
      ) : null}

      {show('fg') && owns ? (
        <>
          {/* deep green halo for the active call */}
          <div style={{position: 'absolute', left: C.x - 200, top: C.y - 120, width: C.width + 400, height: C.height + 240, borderRadius: '50%', background: `radial-gradient(ellipse, ${alpha('#14684A', 0.22)} 0%, ${alpha('#14684A', 0)} 62%)`, opacity: content}} />
          <div data-safe="call card" style={{position: 'absolute', opacity: tween(f, 0.25, 0.6), filter: f < 40 ? `blur(${10 * (1 - tween(f, 0.25, 0.6))}px)` : undefined, transform: `perspective(2400px) rotateX(${3 * (1 - kfIO(f, [0.25, 0.8], [0, 1]))}deg)`, left: rect.x, top: rect.y, width: rect.w, height: rect.h, borderRadius: 32 - 12 * col, background: COLORS.white, border: `1px solid ${UI.border}`, boxShadow: `0 30px 80px rgba(13,18,36,0.12), 0 0 0 2px ${alpha('#23A06B', 0.25 * content)}`, overflow: 'hidden', fontFamily: UI_FONT}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: C.width, height: C.height, opacity: content}}>
              {/* header: Voice waveform glyph, agent name, call timer */}
              <div style={{position: 'absolute', left: WA_HEADER_GLYPH.cx - C.x - 22, top: WA_HEADER_GLYPH.cy - C.y - 22}}>
                <GWaveform size={44} color={UI.ink} stroke={2.2} />
              </div>
              <div style={{position: 'absolute', left: 96, top: 30, fontSize: 26, fontWeight: 600, color: UI.ink, whiteSpace: 'nowrap'}}>{AGENT}</div>
              <div style={{position: 'absolute', right: 28, top: 30, height: 36, padding: '0 14px', borderRadius: 18, background: '#F1F2F4', display: 'flex', alignItems: 'center', fontFamily: FONT_MONO, fontSize: 22, color: UI.ink}}>
                {`00:${String(timer).padStart(2, '0')}`}
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 96, height: 1, background: UI.border}} />

              {/* the orb with its waveform ring (agent: green bars; customer: grey bars, orb calm) */}
              <BarRing cx={orbC.x} cy={orbC.y} r={orbSize / 2 + 18} frame={f} level={(sp === 'D' ? 0.6 : agentLevel * (1 - split) + 0.15 * split) * tween(f, 0.5, 0.8)} opacity={tween(f, 0.5, 0.65)} color={sp === 'D' ? '#9CA3AF' : '#14684A'} split={split} seed="agent" />
              <Orb cx={orbC.x} cy={orbC.y} size={orbSize} frame={f} glow={sp === 'agent' ? 1 : 0} scale={popIn(f, 0.3, 0.4, 1.04)} />
              {/* the teammate joins */}
              {nIn > 0 ? (
                <>
                  <BarRing cx={N_POS.x} cy={N_POS.y} r={78} frame={f} level={nLevel} color="#14684A" seed="nadia" />
                  <div style={{position: 'absolute', left: N_POS.x - 60, top: N_POS.y - 60, transform: `translateX(${(1 - Math.min(1, nIn)) * 40}px) scale(${nIn})`, opacity: Math.min(1, nIn)}}>
                    <InkAvatar size={120} letter="N" />
                  </div>
                  <div style={{position: 'absolute', left: N_POS.x - 60, width: 120, top: N_POS.y + 112, display: 'flex', justifyContent: 'center', opacity: Math.min(1, joined), transform: `scale(${joined})`}}>
                    <span style={{display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 16px', borderRadius: 20, background: UI.chipMint, color: UI.chipText, fontSize: 22, fontWeight: 600, whiteSpace: 'nowrap'}}>
                      <CheckStroke size={20} draw={tween(f, HANDOFF + 0.7, HANDOFF + 1.0)} color={UI.chipText} width={3} />
                      Joined
                    </span>
                  </div>
                </>
              ) : null}

              {/* live transcript: newest at the bottom, older rows fade up */}
              <div style={{position: 'absolute', left: 24, right: 24, top: 520, height: 316, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(180deg, transparent 0, #000 60px)', maskImage: 'linear-gradient(180deg, transparent 0, #000 60px)'}}>
                <div style={{position: 'absolute', left: 0, right: 0, bottom: 0}}>
                  {shown.map((l) => (
                    <TranscriptRow key={l.at} l={l} frame={f} s={s} />
                  ))}
                </div>
              </div>
            </div>
            {/* the conversation row it becomes */}
            {rowIn > 0 ? (
              <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 16, paddingLeft: 20, opacity: rowIn, whiteSpace: 'nowrap'}}>
                <InkAvatar size={48} letter="D" />
                <span style={{fontSize: 24, fontWeight: 600, color: UI.ink}}>Daniel</span>
              </div>
            ) : null}
          </div>
          {/* TextBeat 6's underline curves into the ring around the orb, then splits into the 48 bars */}
          {s < 0.75 ? (
            <LineToCircle line={beatUnderline('b6')} cx={C.x + ORB0.x} cy={C.y + ORB0.y} r={220 / 2 + 18} t={kfIO(f, [0, 0.45], [0, 1])} gaps={tween(f, 0.4, 0.6)} stroke={`color-mix(in srgb, #14684A ${Math.round(100 * tween(f, 0.2, 0.5))}%, #8FD03C)`} width={6 - 2 * tween(f, 0.3, 0.6)} opacity={1 - tween(f, 0.6, 0.75)} />
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
