import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {tween} from '../theme';
import {UI_FAMILY, UI_FONT} from './tokens';
import {measureText} from '../components/measure';
import {BUILD7, BuildKey} from '../v7';

export const LIME = '#8FD03C';
export const INK = '#0D1224';
export const GREY = '#9CA3AF';

export type Beat = {key: BuildKey; text: string; accent: string};
export const BEATS: Beat[] = [
  {key: 'b1', text: 'Describe the agent.', accent: 'agent'},
  {key: 'b2', text: 'Teach it your process.', accent: 'process'},
  {key: 'b3', text: 'Give it your knowledge.', accent: 'knowledge'},
  {key: 'b4', text: 'Test it before customers do.', accent: 'Test'},
  {key: 'b5', text: 'Go live on every channel.', accent: 'every channel'},
  {key: 'b6', text: 'It answers calls too.', accent: 'calls'},
  {key: 'b7', text: 'Your team stays in the loop.', accent: 'loop'},
];
export const beatOf = (key: BuildKey) => BEATS.find((b) => b.key === key)!;

const FS = 72;
const FONT = `600 ${FS}px "${UI_FAMILY}"`;
const LH = Math.round(FS * 1.35);
const PAD = Math.round(FS * 0.3);
const CY = 540;
const TYPE_END = 0.9;
export const UL = {h: 6, r: 3, drawAt: 0.9, drawEnd: 1.2, outAt: 1.2};
const width = (t: string) => measureText(t, FONT, FS * 0.56);
const cps = (b: Beat) => Math.max(28, b.text.length / 0.85);

/** Screen rect of a beat's lime underline (full width) — the morph carrier handed to the next scene. */
export const beatUnderline = (key: BuildKey) => {
  const b = beatOf(key);
  const W = width(b.text);
  const i = b.text.indexOf(b.accent);
  return {x: 960 - W / 2 + width(b.text.slice(0, i)), y: CY + Math.round(FS * 0.74), w: width(b.accent), h: UL.h};
};
/** Where a beat's caret starts (screen): the left edge of the reserved line. */
export const beatCaretStart = (key: BuildKey) => {
  const W = width(beatOf(key).text);
  return {x: 960 - W / 2, y: CY, w: 4, h: 64};
};

/**
 * One TextBeat: a line typed character by character (about 28 chars/s) with a
 * lime caret on the backdrop of the scene that follows; the first word starts
 * grey and darkens to ink; a lime underline draws under the accent word, then
 * the text blurs out while the next scene picks up the underline.
 */
export const TextBeat: React.FC<{beatKey: BuildKey; backdrop: React.ReactNode; layer?: 'all' | 'bg' | 'shell' | 'fg'}> = ({beatKey, backdrop, layer = 'all'}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = f / fps;
  const b = beatOf(beatKey);
  const ov = BUILD7.ov[beatKey];
  const inP = tween(f, 0, ov.in);
  const out = tween(f, UL.outAt, BUILD7.dur[beatKey]);
  const n = Math.max(0, Math.min(b.text.length, Math.floor(s * cps(b))));
  const W = width(b.text);
  const left = 960 - W / 2;
  const firstEnd = b.text.indexOf(' ');
  const firstDark = n <= firstEnd ? 0 : (n - firstEnd) / (b.text.length - firstEnd);
  const caretX = left + width(b.text.slice(0, n));
  const typing = s < TYPE_END + 0.05;
  const blinkOn = typing && (n < b.text.length || Math.floor((s * 60) / 16) % 2 === 0);
  const ul = beatUnderline(beatKey);
  const draw = tween(f, UL.drawAt, UL.drawEnd);
  const show = (k: 'bg' | 'fg') => layer === 'all' || layer === k;
  return (
    <AbsoluteFill>
      {show('bg') ? <AbsoluteFill style={{opacity: inP, filter: inP < 0.99 ? `blur(${14 * (1 - inP)}px)` : undefined}}>{backdrop}</AbsoluteFill> : null}
      {show('fg') ? (
        <>
          {/* the line: full width reserved, so it stays centred while typing (no clipping, line-height 1.35, 0.3em padding) */}
          <div style={{position: 'absolute', left: 0, right: 0, top: CY - LH / 2 - PAD, display: 'flex', justifyContent: 'center', opacity: 1 - out, filter: out > 0.01 ? `blur(${12 * out}px)` : undefined}}>
            <span data-safe={`beat ${beatKey}`} style={{display: 'inline-block', fontFamily: UI_FONT, fontSize: FS, fontWeight: 600, lineHeight: `${LH}px`, padding: `${PAD}px 0`, letterSpacing: 0, whiteSpace: 'pre', color: INK}}>
              {b.text.split('').map((ch, i) => (
                <span key={i} style={{opacity: i < n ? 1 : 0, color: i < firstEnd ? `color-mix(in srgb, ${INK} ${Math.round(100 * firstDark)}%, ${GREY})` : INK}}>
                  {ch}
                </span>
              ))}
            </span>
          </div>
          {/* lime caret */}
          {typing && s < UL.drawAt + 0.05 ? (
            <div style={{position: 'absolute', left: caretX + (n > 0 ? 4 : 0), top: CY - 32, width: 4, height: 64, borderRadius: 2, background: LIME, opacity: blinkOn ? 1 : 0}} />
          ) : null}
          {/* the lime underline under the accent word (the next scene carries it on from 1.2 s) */}
          {draw > 0 && s < UL.outAt + 1 / 60 ? <div style={{position: 'absolute', left: ul.x, top: ul.y, width: ul.w * draw, height: ul.h, borderRadius: UL.r, background: LIME}} /> : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
