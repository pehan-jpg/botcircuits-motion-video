import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_MONO, FONT_SANS, alpha, kf, kfIO, popIn, tween} from '../theme';
import {BUILD7, CENTER_CARD, DANIEL_ROW, WA_HEADER_GLYPH} from '../v7';
import {Orb} from '../components/Orb';
import {GWaveform} from '../components/Glyphs';
import {CheckStroke} from '../components/Chip';
import {Spinner} from '../ui/Panels';
import {UI, UI_FAMILY, UI_FONT} from '../ui/tokens';
import {CALL, Slot, TYPE_CPS} from '../pacing';
import {LineToCircle} from '../components/Morph';
import {beatUnderline} from '../ui/TextBeat';
import {measureText, wrapText} from '../components/measure';
import {CHAR_FADE, charTimes, typedChars} from '../ui/typewriter';
import {envelope, SceneLayerProps} from './kit';

const C = CENTER_CARD;
const ORB0 = {x: C.width / 2, y: 345}; // card local
const ORB_SIZE = 220;
const RING_R = ORB_SIZE / 2 + 18;
const TEXT_W = C.width - 48 - 56;
const ROW_FONT = `400 26px "${UI_FAMILY}"`;
const CHIP_ROW = 54;
const TOOL_SLOT = CALL.slots.findIndex((s) => s.from >= CALL.tool.to - 1e-6 && s.who === 'agent');

/** Who is speaking at time s (drives the waveform ring); null = silence. */
const speaker = (s: number): Slot['who'] | null => CALL.slots.find((sl) => s >= sl.from && s < sl.to)?.who ?? null;

/** Ring of 48 thin bars around a centre, amplitude from seeded noise of the frame. */
const BarRing: React.FC<{cx: number; cy: number; r: number; frame: number; level: number; color: string; seed: string; opacity?: number}> = ({cx, cy, r, frame, level, color, seed, opacity = 1}) => {
  const bars = Array.from({length: 48}).map((_, i) => {
    const a = (i / 48) * Math.PI * 2 - Math.PI / 2;
    const q = Math.floor(frame / 3);
    const n0 = random(`${seed}-${i}-${q}`);
    const n1 = random(`${seed}-${i}-${q + 1}`);
    const t = (frame % 3) / 3;
    const n = n0 + (n1 - n0) * t;
    const env = 0.55 + 0.45 * Math.sin(frame / 7 + i * 0.6);
    return {a, len: 8 + level * (10 + 34 * n * env)};
  });
  return (
    <svg width={2 * (r + 80)} height={2 * (r + 80)} style={{position: 'absolute', left: cx - r - 80, top: cy - r - 80, overflow: 'visible', opacity}}>
      {bars.map((b, i) => (
        <line key={i} x1={r + 80 + Math.cos(b.a) * r} y1={r + 80 + Math.sin(b.a) * r} x2={r + 80 + Math.cos(b.a) * (r + b.len)} y2={r + 80 + Math.sin(b.a) * (r + b.len)} stroke={color} strokeWidth={4} strokeLinecap="round" />
      ))}
    </svg>
  );
};

const InkAvatar: React.FC<{size: number; letter: string}> = ({size, letter}) => (
  <div style={{width: size, height: size, borderRadius: size / 2, background: UI.ink, color: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_SANS, fontWeight: 600, fontSize: size * 0.42, flexShrink: 0}}>{letter}</div>
);

/** Transcript rows: one per voice slot; the agent's booking row also carries the tool chips. */
type Row = Slot & {appear: number; tool: boolean};
const ROWS: Row[] = CALL.slots.map((sl, i) => ({...sl, appear: i === TOOL_SLOT ? CALL.tool.from : sl.from, tool: i === TOOL_SLOT}));
const LH = 36;
const ease3 = (s: number, a: number, b: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, (s - a) / (b - a))), 3);
/** A row's typewriter, fitted so typing ends exactly when its speech slot ends. */
const rowTyping = (r: Row) => {
  const lines = wrapText(r.text, ROW_FONT, TEXT_W, 13);
  const lineStart: number[] = [];
  let acc = 0;
  lines.forEach((l) => {
    lineStart.push(acc);
    acc += l.length + 1;
  });
  const tw = charTimes(r.text, r.from, TYPE_CPS, r.text, r.to - r.from);
  return {lines, lineStart, ...tw};
};
/** Current height of a row: grows one line at a time as the typing reaches each line. */
const rowHeightAt = (r: Row, s: number) => {
  const t = rowTyping(r);
  const grow = t.lines.reduce((h, _, k) => (k === 0 ? h : h + ease3(s, t.times[t.lineStart[k]], t.times[t.lineStart[k]] + 0.18)), 1);
  const after = r.tool ? ease3(s, CALL.slots[TOOL_SLOT].to, CALL.slots[TOOL_SLOT].to + 0.2) : 0;
  return 20 + LH * grow + (r.tool ? CHIP_ROW + CHIP_ROW * after : 0);
};

const MintChip: React.FC<{label: string; draw: number}> = ({label, draw}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 8, height: 42, padding: '0 16px', borderRadius: 21, background: UI.chipMint, color: UI.chipText, fontSize: 22, fontWeight: 600, whiteSpace: 'nowrap'}}>
    <CheckStroke size={20} draw={draw} color={UI.chipText} width={3} />
    {label}
  </span>
);

const TranscriptRow: React.FC<{r: Row; frame: number; s: number}> = ({r, frame, s}) => {
  const t = rowTyping(r);
  const enter = ease3(s, r.appear, r.appear + 0.4); // eases into the layout (smooth scroll)
  const appear = Math.min(1, Math.max(0, (s - r.appear) / 0.2));
  const toolOk = r.tool ? tween(frame, CALL.tool.done, CALL.tool.done + 0.15) : 0;
  const slotEnd = r.to;
  const after = r.tool ? tween(frame, slotEnd + 0.05, slotEnd + 0.55) : 0; // "Booking updated" draws in during the gap
  const chars = typedChars(t.times, s);
  const curLine = t.lineStart.reduce((k, st, i) => (st <= Math.max(0, chars - 1) ? i : k), 0);
  const caretX = measureText(t.lines[curLine].slice(0, Math.max(0, chars - t.lineStart[curLine])), ROW_FONT, 13) + 2;
  const caret = s >= r.from ? (1 - tween(frame, t.end, t.end + 0.3)) * (Math.floor((s - r.from) * 2.2) % 2 === 0 ? 1 : 0.15) : 0;
  let ci = 0;
  return (
    <div style={{position: 'relative', height: rowHeightAt(r, s) * enter, opacity: appear}}>
      <div style={{position: 'absolute', left: 0, top: 10 + (r.tool ? CHIP_ROW : 0)}}>
        {r.who === 'agent' ? (
          <div style={{position: 'relative', width: 40, height: 40}}>
            <Orb cx={20} cy={20} size={40} frame={frame} shadow={false} />
          </div>
        ) : (
          <InkAvatar size={40} letter="D" />
        )}
      </div>
      <div style={{position: 'absolute', left: 56, top: 10, width: TEXT_W}}>
        {r.tool ? (
          <div style={{position: 'relative', height: CHIP_ROW}}>
            <span style={{position: 'absolute', left: 0, top: 0, display: 'inline-flex', alignItems: 'center', gap: 10, height: 42, padding: '0 16px', borderRadius: 21, background: '#F1F2F4', color: UI.text2, fontSize: 22, fontWeight: 600, whiteSpace: 'nowrap', opacity: 1 - toolOk}}>
              <Spinner size={24} frame={frame} />
              {CALL.tool.busy}
            </span>
            <span style={{position: 'absolute', left: 0, top: 0, opacity: toolOk}}>
              <MintChip label={CALL.tool.ok} draw={tween(frame, CALL.tool.done, CALL.tool.done + 0.3)} />
            </span>
          </div>
        ) : null}
        <div style={{position: 'relative', fontFamily: FONT_SANS, fontSize: 26, lineHeight: `${LH}px`, color: UI.ink, whiteSpace: 'pre'}}>
          {t.lines.map((l, li) => {
            const start = ci;
            ci += l.length + 1;
            return (
              <div key={li} style={{height: LH}}>
                {l.split('').map((ch, j) => {
                  const ct = t.times[start + j];
                  return (
                    <span key={j} style={{opacity: s < ct ? 0 : Math.min(1, (s - ct) / CHAR_FADE)}}>
                      {ch}
                    </span>
                  );
                })}
              </div>
            );
          })}
          {caret > 0 ? <div style={{position: 'absolute', left: caretX, top: curLine * LH + 4, width: 2, height: LH - 8, background: UI.ink, opacity: 0.7 * caret}} /> : null}
        </div>
        {r.tool && after > 0 ? (
          <div style={{marginTop: 12, opacity: after}}>
            <MintChip label={CALL.tool.after} draw={after} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

/**
 * SCENE 11 A hospitality voice call ("Guest Concierge" for "Harbour Hotel").
 * Each voice speaks in its own slot with silent gaps between (src/pacing.ts
 * CALL), so narrator, customer and agent can be recorded separately.
 */
export const Scene11Voice: React.FC<SceneLayerProps> = ({layer = 'all'}) => {
  const f = useCurrentFrame();
  const show = (k: 'bg' | 'shell' | 'fg') => layer === 'all' || layer === k;
  const {fps} = useVideoConfig();
  const s = f / fps;
  const dur = BUILD7.dur.s11;
  const env = envelope(f, dur, true, true, BUILD7.ov.s11);
  const sp = speaker(s);
  const level = sp === 'customer' ? 0.6 : sp === 'agent' ? 1 : 0; // silent gaps: no bars move
  const inGap = sp === null && s > CALL.connected && s < CALL.collapse[0];
  const glow = inGap ? 0.6 : sp === 'agent' ? 1 : 0;
  const timer = Math.max(0, Math.floor(s));
  const COLLAPSE = CALL.collapse;
  const col = kfIO(f, [COLLAPSE[0], COLLAPSE[0] + 0.35], [0, 1]);
  const content = 1 - tween(f, COLLAPSE[0], COLLAPSE[0] + 0.2);
  const rowIn = tween(f, COLLAPSE[0] + 0.15, COLLAPSE[0] + 0.3) * (1 - tween(f, COLLAPSE[1] - 0.15, COLLAPSE[1]));
  const rect = {x: C.x + (DANIEL_ROW.x - C.x) * col, y: C.y + (DANIEL_ROW.y - C.y) * col, w: C.width + (DANIEL_ROW.width - C.width) * col, h: C.height + (DANIEL_ROW.height - C.height) * col};
  const connected = tween(f, CALL.connected - 0.15, CALL.connected);
  const shown = ROWS.filter((r) => s >= r.appear);

  return (
    <AbsoluteFill>
      {show('bg') ? (
        <AbsoluteFill style={{opacity: env.inP, filter: env.inP < 0.99 ? `blur(${14 * (1 - env.inP)}px)` : undefined}}>
          <AbsoluteFill style={{background: `radial-gradient(circle at 18% 22%, ${alpha('#D9D0FF', 0.9)} 0%, ${alpha('#D9D0FF', 0)} 45%), radial-gradient(circle at 85% 80%, ${alpha('#FFD3B5', 0.85)} 0%, ${alpha('#FFD3B5', 0)} 45%), #FBF8FF`}} />
        </AbsoluteFill>
      ) : null}

      {show('fg') ? (
        <>
          <div style={{position: 'absolute', left: C.x - 200, top: C.y - 120, width: C.width + 400, height: C.height + 240, borderRadius: '50%', background: `radial-gradient(ellipse, ${alpha('#14684A', 0.22)} 0%, ${alpha('#14684A', 0)} 62%)`, opacity: content * tween(f, 0.3, 0.8)}} />
          <div data-safe="call card" style={{position: 'absolute', opacity: tween(f, 0.25, 0.6) * (1 - tween(f, COLLAPSE[1] - 0.15, COLLAPSE[1])), filter: f < 40 ? `blur(${10 * (1 - tween(f, 0.25, 0.6))}px)` : undefined, transform: `perspective(2400px) rotateX(${3 * (1 - kfIO(f, [0.25, 0.8], [0, 1]))}deg)`, left: rect.x, top: rect.y, width: rect.w, height: rect.h, borderRadius: 32 - 12 * col, background: COLORS.white, border: `1px solid ${UI.border}`, boxShadow: `0 30px 80px rgba(13,18,36,0.12), 0 0 0 2px ${alpha('#23A06B', 0.25 * content)}`, overflow: 'hidden', fontFamily: UI_FONT}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: C.width, height: C.height, opacity: content}}>
              {/* header: Voice waveform glyph, agent name, business, call timer */}
              <div style={{position: 'absolute', left: WA_HEADER_GLYPH.cx - C.x - 22, top: WA_HEADER_GLYPH.cy - C.y - 22}}>
                <GWaveform size={44} color={UI.ink} stroke={2.2} />
              </div>
              <div style={{position: 'absolute', left: 96, top: 16, fontSize: 26, fontWeight: 600, color: UI.ink, whiteSpace: 'nowrap'}}>{CALL.agentName}</div>
              <div style={{position: 'absolute', left: 96, top: 52, fontSize: 22, color: UI.text2, whiteSpace: 'nowrap'}}>{CALL.business}</div>
              <div style={{position: 'absolute', right: 28, top: 30, height: 36, padding: '0 14px', borderRadius: 18, background: '#F1F2F4', display: 'flex', alignItems: 'center', fontFamily: FONT_MONO, fontSize: 22, color: UI.ink}}>
                {`00:${String(timer).padStart(2, '0')}`}
              </div>
              <div style={{position: 'absolute', left: 0, right: 0, top: 96, height: 1, background: UI.border}} />

              {/* caller chip: "Calling" -> mint "Connected" (why the agent greets Daniel by name) */}
              <div style={{position: 'absolute', left: 0, right: 0, top: 112, display: 'flex', justifyContent: 'center', opacity: tween(f, 0.1, 0.35)}}>
                <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, height: 52, padding: '0 8px 0 8px', borderRadius: 26, background: COLORS.white, border: `1px solid ${UI.border}`, boxShadow: '0 6px 18px rgba(13,18,36,0.06)'}}>
                  <div style={{width: 36, height: 36, borderRadius: 18, background: UI.ink, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={COLORS.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                    </svg>
                  </div>
                  <span style={{fontSize: 22, fontWeight: 600, color: UI.ink}}>{CALL.caller}</span>
                  <span style={{position: 'relative', display: 'inline-flex', height: 36, minWidth: 140}}>
                    <span style={{position: 'absolute', left: 0, top: 0, display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 14px', borderRadius: 18, background: '#F1F2F4', color: UI.text2, fontSize: 20, fontWeight: 600, opacity: 1 - connected, whiteSpace: 'nowrap'}}>
                      <span style={{width: 8, height: 8, borderRadius: 4, background: UI.text2, opacity: 0.4 + 0.6 * Math.abs(Math.sin(s * 5))}} />
                      Calling
                    </span>
                    <span style={{position: 'absolute', left: 0, top: 0, display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 14px', borderRadius: 18, background: UI.chipMint, color: UI.chipText, fontSize: 20, fontWeight: 600, opacity: connected, whiteSpace: 'nowrap'}}>
                      <CheckStroke size={18} draw={connected} color={UI.chipText} width={3} />
                      Connected
                    </span>
                  </span>
                </div>
              </div>

              {/* the orb with its waveform ring (customer: grey bars, orb calm; agent: green bars; gaps: still, soft glow) */}
              <BarRing cx={ORB0.x} cy={ORB0.y} r={RING_R} frame={f} level={level} opacity={tween(f, 0.5, 0.65)} color={sp === 'customer' ? '#9CA3AF' : '#14684A'} seed="agent" />
              <Orb cx={ORB0.x} cy={ORB0.y} size={ORB_SIZE} frame={f} glow={glow} scale={popIn(f, 0.3, 0.4, 1.04)} />

              {/* live transcript: exactly what is spoken; newest at the bottom, older rows fade up */}
              <div style={{position: 'absolute', left: 24, right: 24, top: 520, height: 320, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(180deg, transparent 0, #000 70px)', maskImage: 'linear-gradient(180deg, transparent 0, #000 70px)'}}>
                <div style={{position: 'absolute', left: 0, right: 0, bottom: 0}}>
                  {shown.map((r) => (
                    <TranscriptRow key={r.from} r={r} frame={f} s={s} />
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
            <LineToCircle line={beatUnderline('b6')} cx={C.x + ORB0.x} cy={C.y + ORB0.y} r={RING_R} t={kfIO(f, [0, 0.45], [0, 1])} gaps={tween(f, 0.4, 0.6)} stroke={`color-mix(in srgb, #14684A ${Math.round(100 * tween(f, 0.2, 0.5))}%, #8FD03C)`} width={6 - 2 * tween(f, 0.3, 0.6)} opacity={1 - tween(f, 0.6, 0.75)} />
          ) : null}
          <span style={{display: 'none'}}>{kf(f, [0, 1], [0, 1])}</span>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
