import React from 'react';
import {COLORS, alpha, ease, popIn, tween} from '../theme';
import {sec} from '../timeline';
import {UI, UI_FONT} from './tokens';
import {CheckStroke} from '../components/Chip';
import {PetalSpinner} from '../components/PetalSpinner';
import {Logo} from '../components/logos';

/** Small petal spinner (loading). */
export const Spinner: React.FC<{size: number; frame: number; color?: string}> = ({size, frame}) => (
  <div style={{position: 'relative', width: size, height: size}}>
    <div style={{position: 'absolute', left: size / 2, top: size / 2, transform: `scale(${size / 140})`, transformOrigin: '0 0'}}>
      <PetalSpinner cx={0} cy={0} radius={46} ringRadius={46} frame={frame} opacity={1} converge={0} />
    </div>
  </div>
);

/** Rolling counter: each digit column rolls vertically to its value. */
export const FlipCounter: React.FC<{value: number; from?: number; at: number; frame: number; size: number; color?: string; per?: number}> = ({value, from = 0, at, frame, size, color = UI.ink, per = 0.18}) => {
  const steps = value - from;
  let pos = 0;
  for (let i = 0; i < steps; i++) pos += ease(frame, [sec(at + i * per), sec(at + i * per + per * 0.8)], [0, 1]);
  const moving = pos % 1 > 0.02 && pos % 1 < 0.98;
  const h = size * 1.4;
  return (
    <span style={{display: 'inline-block', height: h, overflow: 'hidden', verticalAlign: 'bottom'}}>
      <span style={{display: 'block', transform: `translateY(${-pos * h}px)`, filter: moving ? 'blur(1.2px)' : undefined}}>
        {Array.from({length: steps + 1}).map((_, i) => (
          <span key={i} style={{display: 'block', height: h, lineHeight: `${h}px`, fontSize: size, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums'}}>
            {from + i}
          </span>
        ))}
      </span>
    </span>
  );
};

// ---- scene 7: knowledge --------------------------------------------------------
export type SourceKind = 'pdf' | 'web' | 'notion';
export const SourceIcon: React.FC<{kind: SourceKind; size: number}> = ({kind, size}) => {
  if (kind === 'notion') return <Logo name="notion" size={size * 0.62} />;
  if (kind === 'pdf')
    return (
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none" stroke="#E5484D" strokeWidth={1.9} strokeLinejoin="round">
        <path d="M6 2.8h8l4.5 4.5V20a1.2 1.2 0 0 1-1.2 1.2H6A1.2 1.2 0 0 1 4.8 20V4A1.2 1.2 0 0 1 6 2.8z" />
        <path d="M14 2.8v4.5h4.5M8.5 13h7M8.5 16.5h5" />
      </svg>
    );
  return (
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none" stroke="#2F5BEA" strokeWidth={1.9}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z" />
    </svg>
  );
};

/** One indexed source row: icon, name, status chip (Indexing -> Ready). */
export const SourceRow: React.FC<{kind: SourceKind; name: string; frame: number; readyAt: number; width: number; focus?: number; dim?: number}> = ({kind, name, frame, readyAt, width, focus = 0, dim = 0}) => {
  const ready = tween(frame, readyAt, readyAt + 0.2);
  return (
    <div data-safe="source row" style={{position: 'relative', width, height: 88, fontFamily: UI_FONT, opacity: 1 - dim}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 20,
          background: COLORS.white,
          border: `1px solid ${UI.border}`,
          boxShadow: `0 10px 30px rgba(13,18,36,0.06), 0 0 0 ${3 * focus}px ${alpha('#7EE2B8', 0.9 * focus)}`,
        }}
      />
      <div style={{position: 'absolute', left: 22, top: 14, width: 60, height: 60, borderRadius: 16, background: '#F4F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <SourceIcon kind={kind} size={60} />
      </div>
      <div style={{position: 'absolute', left: 104, top: 0, height: 88, display: 'flex', alignItems: 'center', fontSize: 24, fontWeight: 600, color: UI.ink, whiteSpace: 'nowrap'}}>{name}</div>
      <div style={{position: 'absolute', right: 22, top: 22, height: 44}}>
        <div style={{position: 'absolute', right: 0, top: 0, height: 44, padding: '0 16px', borderRadius: 22, background: '#F1F2F4', color: UI.text2, display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 600, opacity: 1 - ready, whiteSpace: 'nowrap'}}>
          <Spinner size={26} frame={frame} />
          Indexing
        </div>
        <div style={{position: 'absolute', right: 0, top: 0, height: 44, padding: '0 16px', borderRadius: 22, background: UI.chipMint, color: UI.chipText, display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 600, opacity: ready, whiteSpace: 'nowrap'}}>
          <CheckStroke size={24} draw={tween(frame, readyAt + 0.05, readyAt + 0.35)} color={UI.chipText} width={3} />
          Ready
        </div>
      </div>
    </div>
  );
};

// ---- scene 8: test ---------------------------------------------------------------
export const TRACE_STEPS = ['Understood request', 'Asked to verify', 'Could not verify', 'Handed over'];
export const TracePanel: React.FC<{frame: number; ticks: number[]; width: number; height: number}> = ({frame, ticks, width, height}) => {
  const sNow = frame / sec(1);
  const active = ticks.reduce((m, t, i) => (sNow >= t ? i : m), -1);
  // spotlight: while the sequence runs, every step except the active one sits at 45%
  const spot = active < 0 ? 0 : ease(frame, [sec(ticks[0]), sec(ticks[0] + 0.15), sec(ticks[ticks.length - 1] + 0.6), sec(ticks[ticks.length - 1] + 0.9)], [0, 1, 1, 0]);
  return (
    <div data-safe="trace panel" style={{position: 'relative', width, height, fontFamily: UI_FONT}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 22, background: COLORS.white, border: `1px solid ${UI.border}`, boxShadow: UI.shadow}} />
      <div style={{position: 'absolute', left: 32, top: 26, fontSize: 28, fontWeight: 700, color: UI.ink}}>Trace</div>
      <div style={{position: 'absolute', left: 53, top: 120, height: 3 * 84, width: 3, background: UI.border}} />
      {TRACE_STEPS.map((t, i) => {
        const on = popIn(frame, ticks[i], 0.3, 1.04);
        const draw = tween(frame, ticks[i] + 0.08, ticks[i] + 0.35);
        const dim = i === active ? 1 : 1 - 0.55 * spot;
        return (
          <div key={t} style={{position: 'absolute', left: 30, top: 96 + i * 84, height: 52, display: 'flex', alignItems: 'center', gap: 20, whiteSpace: 'nowrap', opacity: dim}}>
            <div style={{width: 48, height: 48, borderRadius: 24, background: on > 0 ? '#3CC37A' : '#F1F2F4', border: on > 0 ? 'none' : `2px solid ${UI.border}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${Math.max(0.85, on)})`}}>
              {on > 0 ? <CheckStroke size={28} draw={draw} color={COLORS.white} width={3} /> : null}
            </div>
            <span style={{fontSize: 24, fontWeight: 600, color: on > 0 ? UI.ink : '#9CA3AF'}}>{t}</span>
          </div>
        );
      })}
    </div>
  );
};

export const RESULTS = ['Verification passed', 'Card blocked', 'Handover on failure'];
export const RESULT_H = 540;
export const TestResultCard: React.FC<{frame: number; at: number; width: number}> = ({frame, at, width}) => (
  <div data-safe="test result" style={{position: 'relative', width, height: RESULT_H, fontFamily: UI_FONT}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 26, background: COLORS.white, border: `1px solid ${UI.border}`, boxShadow: '0 40px 100px rgba(13,18,36,0.3)'}} />
    <div style={{position: 'absolute', left: 40, top: 30, fontSize: 32, fontWeight: 700, color: UI.ink}}>Test result</div>
    {RESULTS.map((r, i) => {
      const t = at + 0.3 + i * 0.2;
      const p = popIn(frame, t, 0.3, 1.03);
      return (
        <div key={r} style={{position: 'absolute', left: 40, right: 40, top: 100 + i * 78, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: Math.min(1, p), transform: `translateY(${(1 - Math.min(1, p)) * 16}px)`}}>
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 12, height: 56, padding: '0 22px', borderRadius: 28, background: '#D8F5E4', color: '#0D1224', fontSize: 24, fontWeight: 600, whiteSpace: 'nowrap'}}>
            <CheckStroke size={26} draw={tween(frame, t + 0.1, t + 0.4)} color="#1E6A45" width={3} />
            {r}
          </span>
          <span style={{display: 'inline-flex', alignItems: 'center', height: 40, padding: '0 18px', borderRadius: 20, background: '#D8F5E4', color: '#14532D', fontSize: 20, fontWeight: 700, whiteSpace: 'nowrap'}}>Success</span>
        </div>
      );
    })}
    <div style={{position: 'absolute', left: 40, bottom: 26, display: 'flex', alignItems: 'baseline', gap: 18, fontSize: 96, fontWeight: 700, color: UI.ink, lineHeight: 1}}>
      <FlipCounter value={3} at={at + 0.9} frame={frame} size={96} />
      <span>/ 3</span>
      <span style={{fontSize: 34, fontWeight: 600, color: UI.text2}}>passed</span>
    </div>
  </div>
);

/** The dark Publish button (shared S8 -> S9). state: 0 idle, spinner, published. */
export const PublishButton: React.FC<{width: number; height: number; frame: number; spin?: number; done?: number; labelOpacity?: number}> = ({width, height, frame, spin = 0, done = 0, labelOpacity = 1}) => (
  <div style={{position: 'relative', width, height, borderRadius: height / 2, background: UI.ink, overflow: 'hidden', fontFamily: UI_FONT}}>
    <div style={{position: 'absolute', inset: 0, background: UI.chipMint, opacity: done}} />
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, color: COLORS.white, fontWeight: 600, fontSize: 36, opacity: labelOpacity * (1 - spin) * (1 - done)}}>
      Publish
      <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={COLORS.white} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h13M13 6l6 6-6 6" />
      </svg>
    </div>
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: spin * (1 - done)}}>
      <Spinner size={56} frame={frame} />
    </div>
    <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, color: UI.chipText, fontWeight: 600, fontSize: 36, opacity: done}}>
      <CheckStroke size={34} draw={done} color={UI.chipText} width={3} />
      Published
    </div>
  </div>
);
