import React from 'react';
import {AbsoluteFill, Freeze, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_SANS, kf, kfIO, tween} from '../theme';
import {SCENE_DURATIONS} from '../timeline';
import {PILL} from '../layout';
import {BUILD7, PILL_S5} from '../v7';
import {Scene03} from './Scene03';
import {CircleReveal} from '../components/CircleReveal';
import {CreamSky} from '../components/ProceduralSky';
import {LogoMark, MARK_ASPECT, LOCKUP_RATIO, Wordmark, WORDMARK_ASPECT} from '../components/Logo';
import {ConsolePill} from '../ui/ConsoleCard';
import {UI_FAMILY, UI_FONT} from '../ui/tokens';
import {measureText} from '../components/measure';
import {IDENTITY} from '../components/Stage';
import {SceneLayerProps} from './kit';

// Title: "Introducing" / "Concierge by [lockup]". The lockup sits inline at
// the height of the 110px line, to the right of "by".
const L1 = {text: 'Introducing', size: 56, y: 400};
const L2 = {size: 110, y: 560};
const L2_FONT = `600 ${L2.size}px "${UI_FAMILY}"`;
const MARK_H = 100;
const MARK_W = MARK_H * MARK_ASPECT;
const GAP = MARK_H * LOCKUP_RATIO.gap;
const WORD_H = MARK_H * LOCKUP_RATIO.wordHeight;
const WORD_W = WORD_H * WORDMARK_ASPECT;
const LOCK_W = MARK_W + GAP + WORD_W;
const BY_GAP = 34;
const CONCIERGE = 'Concierge';

/**
 * Dots that flow in and merge (metaball "goo") into the symbol's ring.
 * Shared with scene 13 (the loop ring becomes the symbol).
 */
export const Metaballs: React.FC<{p: number; opacity: number; cx: number; cy: number; size: number; from?: 'scatter' | 'ring'; ringR?: number; ringOffset?: {x: number; y: number}; id?: string}> = ({p, opacity, cx, cy, size, from = 'scatter', ringR = 150, ringOffset = {x: 0, y: 0}, id = 'goo'}) => {
  const k0 = size / 130;
  const dots = Array.from({length: 13}).map((_, i) => {
    const a = (i / 12) * Math.PI * 2 + 0.3;
    const target = i === 12 ? {x: 0, y: 0} : {x: Math.cos(a) * size * 0.36, y: Math.sin(a) * size * 0.36};
    const ang = from === 'ring' ? a : random(`mb-a-${i}`) * Math.PI * 2;
    const dist = from === 'ring' ? (i === 12 ? 0 : ringR) : (240 + random(`mb-d-${i}`) * 220) * k0;
    const start = from === 'ring' ? {x: Math.cos(ang) * dist + ringOffset.x, y: Math.sin(ang) * dist + ringOffset.y} : {x: Math.cos(ang) * dist, y: Math.sin(ang) * dist};
    const k = Math.min(1, Math.max(0, p * 1.25 - random(`mb-s-${i}`) * 0.25));
    const e = 1 - Math.pow(1 - k, 3);
    const swirl = (1 - e) * (from === 'ring' ? 0.4 : 0.8);
    const x = start.x + (target.x - start.x) * e;
    const y = start.y + (target.y - start.y) * e;
    return {x: x * Math.cos(swirl) - y * Math.sin(swirl), y: x * Math.sin(swirl) + y * Math.cos(swirl), r: (i === 12 ? 12 : from === 'ring' ? 5 + 6 * e : 11 + 3 * (1 - e)) * k0 * (i === 12 && from === 'ring' ? e : 1)};
  });
  const box = 1400;
  return (
    <svg width={box} height={box} viewBox={`${-box / 2} ${-box / 2} ${box} ${box}`} style={{position: 'absolute', left: cx - box / 2, top: cy - box / 2, opacity}}>
      <defs>
        <filter id={id}>
          <feGaussianBlur stdDeviation={9 * k0} />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
        </filter>
      </defs>
      <g filter={`url(#${id})`} fill={COLORS.inkNavy}>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} />
        ))}
      </g>
    </svg>
  );
};

/**
 * SCENE 4 (6 s) "Introducing / Concierge by BotCircuits", cream/lilac/peach.
 * The pill from scene 3 opens a cream circle; "Introducing" resolves, then
 * "Concierge" rises letter by letter with one gradient sweep, "by" resolves,
 * dots merge into the symbol and the wordmark resolves beside it. The text
 * blurs out and drifts up while the symbol morphs into the Console pill.
 */
export const Scene04Intro: React.FC<SceneLayerProps> = ({layer = 'all'}) => {
  const f = useCurrentFrame();
  const show = (k: 'bg' | 'shell' | 'fg') => layer === 'all' || layer === k;
  const {fps} = useVideoConfig();
  const s = f / fps;
  const dur = BUILD7.dur.s4;

  const pulse = kf(f, [0, 0.15, 0.3], [1, 1.05, 1]);
  const reveal = tween(f, 0.12, 0.6);
  const pillOut = tween(f, 0.3, 0.7);
  const intro = tween(f, 0.2, 0.8);
  const by = tween(f, 1.9, 2.4);
  const sweep = kfIO(f, [1.3, 1.9], [0, 1]);
  const flow = kfIO(f, [2.4, 3.25], [0, 1]);
  const blobs = kf(f, [2.4, 2.55, 3.1, 3.35], [0, 1, 1, 0]);
  const markIn = tween(f, 3.05, 3.35);
  const wordIn = tween(f, 3.4, 3.9);
  const textOut = tween(f, 4.8, 5.3);
  const markOut = tween(f, 4.95, 5.3);
  const consoleIn = tween(f, 5.0, 5.3);
  const rise = kfIO(f, [5.2, 5.5], [0, 1]);

  // layout from measured text widths
  const w2 = measureText(`${CONCIERGE} by`, L2_FONT, L2.size * 0.55);
  const wC = measureText(CONCIERGE, L2_FONT, L2.size * 0.55);
  const wSp = measureText(`${CONCIERGE} `, L2_FONT, L2.size * 0.55) - wC;
  const total = w2 + BY_GAP + LOCK_W;
  const left = 960 - total / 2;
  const markC = {x: left + w2 + BY_GAP + MARK_W / 2, y: L2.y};
  const wordX = left + w2 + BY_GAP + MARK_W + GAP;
  const letters = CONCIERGE.split('');
  // cumulative x of each letter (prefix widths)
  const prefix = letters.map((_, i) => measureText(CONCIERGE.slice(0, i), L2_FONT, L2.size * 0.55));

  const big = {w: 120, h: 60};
  const pw = big.w + (PILL_S5.width - big.w) * rise;
  const ph = big.h + (PILL_S5.height - big.h) * rise;
  const px = markC.x + (PILL_S5.cx - markC.x) * rise;
  const py = markC.y + (PILL_S5.cy - markC.y) * rise;
  const outStyle = (p: number): React.CSSProperties => ({opacity: 1 - p, filter: p > 0.01 ? `blur(${14 * p}px)` : undefined, transform: `translateY(${-30 * p}px)`});
  const GRAD = 'linear-gradient(90deg, #0B3B2C 0%, #14684A 45%, #23A06B 100%)';

  return (
    <AbsoluteFill>
      {show('bg') ? (
        <>
          <Freeze frame={SCENE_DURATIONS.scene03 - 1}>
            <Scene03 layer="background" />
          </Freeze>
          <CircleReveal cx={PILL.centerX} cy={PILL.centerY} progress={reveal}>
            <CreamSky t={s} cam={IDENTITY} frame={f} />
          </CircleReveal>
        </>
      ) : null}
      {show('fg') ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: PILL.x,
              top: PILL.y,
              width: PILL.width,
              height: PILL.height,
              borderRadius: PILL.borderRadius,
              background: COLORS.charcoal2,
              border: '1px solid rgba(255,255,255,0.16)',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT_SANS,
              fontSize: PILL.fontSize,
              fontWeight: 500,
              color: COLORS.mist,
              whiteSpace: 'nowrap',
              opacity: 1 - pillOut,
              filter: pillOut > 0.01 ? `blur(${14 * pillOut}px)` : undefined,
              transform: `scale(${pulse * (1 - 0.1 * pillOut)})`,
            }}
          >
            {PILL.text}
          </div>

          {/* title block */}
          <div data-safe="title block" style={{position: 'absolute', left: left - 4, top: L1.y - 40, width: total + 8, height: L2.y + L2.size / 2 + 10 - (L1.y - 40), pointerEvents: 'none'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: L1.y - L1.size / 2, height: L1.size, display: 'flex', justifyContent: 'center', ...outStyle(textOut)}}>
            <div style={{fontFamily: UI_FONT, fontSize: L1.size, fontWeight: 500, lineHeight: 1, color: '#6B7280', opacity: intro, filter: intro < 0.99 ? `blur(${12 * (1 - intro)}px)` : undefined, transform: `translateY(${24 * (1 - intro)}px)`, whiteSpace: 'nowrap'}}>{L1.text}</div>
          </div>
          <div style={{position: 'absolute', left, top: L2.y - L2.size / 2, height: L2.size, fontFamily: UI_FONT, fontSize: L2.size, fontWeight: 600, lineHeight: 1, whiteSpace: 'pre', ...outStyle(textOut)}}>
            {letters.map((ch, i) => {
              const p = tween(f, 0.8 + i * 0.04, 0.8 + i * 0.04 + 0.35);
              // one soft highlight band crossing the word
              const band = -0.3 + 1.6 * sweep;
              return (
                <span
                  key={i}
                  style={{
                    position: 'absolute',
                    left: prefix[i],
                    top: 0,
                    display: 'inline-block',
                    opacity: p,
                    filter: p < 0.99 ? `blur(${10 * (1 - p)}px)` : undefined,
                    transform: `translateY(${30 * (1 - p)}px)`,
                    backgroundImage: `linear-gradient(100deg, rgba(255,255,255,0) ${(band - 0.12) * 100}%, rgba(190,255,220,0.85) ${band * 100}%, rgba(255,255,255,0) ${(band + 0.12) * 100}%), ${GRAD}`,
                    backgroundSize: `${wC}px ${L2.size}px`,
                    backgroundPosition: `${-prefix[i]}px 0`,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    WebkitTextFillColor: 'transparent',
                    paddingBottom: 6,
                  }}
                >
                  {ch}
                </span>
              );
            })}
            <span style={{position: 'absolute', left: wC + wSp, top: 0, color: '#0D1224', opacity: by, filter: by < 0.99 ? `blur(${10 * (1 - by)}px)` : undefined, transform: `translateY(${16 * (1 - by)}px)`}}>by</span>
          </div>

          {blobs > 0 ? <Metaballs p={flow} opacity={blobs} cx={markC.x} cy={markC.y} size={MARK_H} /> : null}

          {/* symbol */}
          {markIn > 0 && markOut < 1 ? (
            <div
              data-safe="logo symbol"
              style={{
                position: 'absolute',
                left: markC.x - MARK_W / 2,
                top: markC.y - MARK_H / 2,
                opacity: markIn * (1 - markOut),
                filter: `blur(${8 * (1 - markIn) + 10 * markOut}px)`,
                transform: `scale(${kf(f, [3.9, 4.8], [1, 1.02]) * (1 - 0.5 * markOut)})`,
              }}
            >
              <LogoMark height={MARK_H} />
            </div>
          ) : null}
          {/* wordmark resolves in from the right (blur + 16px slide) */}
          {wordIn > 0 && textOut < 1 ? (
            <div
              data-safe="wordmark"
              style={{
                position: 'absolute',
                left: wordX,
                top: markC.y - WORD_H / 2,
                opacity: wordIn * (1 - textOut),
                filter: `blur(${12 * (1 - wordIn) + 14 * textOut}px)`,
                transform: `translate(${16 * (1 - wordIn)}px, ${-30 * textOut}px)`,
              }}
            >
              <Wordmark height={WORD_H} />
            </div>
          ) : null}
          {/* the Console pill (shared with scene 5 from its first frame) */}
          {consoleIn > 0 && s < dur - 0.5 ? (
            <div
              style={{
                position: 'absolute',
                left: px - pw / 2,
                top: py - ph / 2,
                opacity: consoleIn,
                filter: consoleIn < 0.99 ? `blur(${12 * (1 - consoleIn)}px)` : undefined,
                transform: `scale(${0.6 + 0.4 * consoleIn})`,
              }}
            >
              <ConsolePill width={pw} height={ph} />
            </div>
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
