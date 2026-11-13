import React from 'react';
import {AbsoluteFill, Freeze, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_SANS, kf, kfIO, tween} from '../theme';
import {SCENE_DURATIONS} from '../timeline';
import {PILL} from '../layout';
import {BUILD7} from '../v7';
import {Scene03} from './Scene03';
import {CircleReveal} from '../components/CircleReveal';
import {CreamSky} from '../components/ProceduralSky';
import {LogoMark, MARK_ASPECT, LOCKUP_RATIO, Wordmark, WORDMARK_ASPECT} from '../components/Logo';
import {Sparkle} from '../ui/ConsoleCard';
import {beatCaretStart} from '../ui/TextBeat';
import {UI} from '../ui/tokens';
import {Backdrop} from '../components/Backdrop';
import {FallbackPeriwinkle} from '../components/ProceduralSky';
import {BACKDROPS} from '../handoff';
import {UI_FAMILY, UI_FONT} from '../ui/tokens';
import {measureText} from '../components/measure';
import {IDENTITY} from '../components/Stage';
import {SceneLayerProps} from './kit';

// Title: one line "Introducing Concierge by" + the BotCircuits lockup, all ink,
// 84px / 600, the lockup at text height (symbol 80px), 28px gap.
const FS = 84;
const TITLE = 'Introducing Concierge by';
const T_FONT = `600 ${FS}px "${UI_FAMILY}"`;
const T_LH = Math.round(FS * 1.35);
const T_PAD = Math.round(FS * 0.3);
const MARK_H = 80;
const MARK_W = MARK_H * MARK_ASPECT;
const GAP = MARK_H * LOCKUP_RATIO.gap;
const WORD_H = 60; // wordmark cap height matches the 84px text
const WORD_W = WORD_H * WORDMARK_ASPECT;
const LOCK_W = MARK_W + GAP + WORD_W;
const BY_GAP = 28;
const CY = 540;
const BASELINE = CY + 31; // baseline of the 84px line centred on 540
const WORDS = TITLE.split(' ');

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
 * SCENE 4 (6 s) "Introducing Concierge by [BotCircuits]". The pill from scene 3
 * opens a cream circle; the three words resolve one by one, dots merge into the
 * symbol and the wordmark resolves. The text blurs out while the symbol morphs
 * into the dark Console pill, which collapses into the lime caret that starts
 * TextBeat 1; the backdrop dissolves to the periwinkle sky.
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
  const flow = kfIO(f, [1.6, 2.65], [0, 1]);
  const blobs = kf(f, [1.6, 1.75, 2.5, 2.75], [0, 1, 1, 0]);
  const markIn = tween(f, 2.45, 2.75);
  const wordIn = tween(f, 2.7, 3.2);
  const textOut = tween(f, 4.8, 5.2);
  const toPill = kfIO(f, [4.85, 5.2], [0, 1]);
  const toCaret = kfIO(f, [5.2, 5.6], [0, 1]);
  const sky = tween(f, 4.9, 6.0);

  // layout from measured widths (the line is reserved at full width, so it never jumps)
  const tw = measureText(TITLE, T_FONT, FS * 0.56);
  const total = tw + BY_GAP + LOCK_W;
  const left = 960 - total / 2;
  const markC = {x: left + tw + BY_GAP + MARK_W / 2, y: BASELINE - WORD_H / 2};
  const wordX = left + tw + BY_GAP + MARK_W + GAP;
  const prefix = WORDS.map((_, i) => measureText(WORDS.slice(0, i).join(' ') + (i > 0 ? ' ' : ''), T_FONT, FS * 0.56));
  const caret = beatCaretStart('b1');
  // symbol -> dark pill -> lime caret (one continuous rect)
  const pill = {w: 120, h: 60};
  const rw = MARK_H + (pill.w - MARK_H) * toPill + (caret.w - pill.w) * toCaret;
  const rh = MARK_H + (pill.h - MARK_H) * toPill + (caret.h - pill.h) * toCaret;
  const rx = markC.x + (caret.x + caret.w / 2 - markC.x) * toCaret;
  const ry = markC.y + (caret.y - markC.y) * toCaret;

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
          {sky > 0 ? (
            <AbsoluteFill style={{opacity: sky}}>
              <Backdrop src={BACKDROPS.sky5a} t={0} span={8} cam={IDENTITY} scrim="light" fallback={<FallbackPeriwinkle t={0} cam={IDENTITY} />} />
            </AbsoluteFill>
          ) : null}
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

          {/* the title line: words resolve one by one (opacity, blur 10 -> 0, 20px rise), no clipping */}
          <div style={{position: 'absolute', left, top: CY - T_LH / 2 - T_PAD, width: tw, height: T_LH + 2 * T_PAD, opacity: 1 - textOut, filter: textOut > 0.01 ? `blur(${14 * textOut}px)` : undefined}}>
            <div data-safe="title" style={{position: 'absolute', left: 0, top: 0, width: tw, height: T_LH + 2 * T_PAD}} />
            {WORDS.map((w, i) => {
              const p = tween(f, 0.2 + i * 0.4, 0.2 + i * 0.4 + 0.5);
              return (
                <span key={i} style={{position: 'absolute', left: prefix[i], top: T_PAD, fontFamily: UI_FONT, fontSize: FS, fontWeight: 600, lineHeight: `${T_LH}px`, color: '#0D1224', whiteSpace: 'pre', opacity: p, filter: p < 0.99 ? `blur(${10 * (1 - p)}px)` : undefined, transform: `translateY(${20 * (1 - p)}px)`}}>
                  {w}
                </span>
              );
            })}
          </div>

          {blobs > 0 ? <Metaballs p={flow} opacity={blobs} cx={markC.x} cy={markC.y} size={MARK_H} /> : null}

          {/* symbol, then the dark pill, then the lime caret */}
          {markIn > 0 && s < dur - BUILD7.ov.s4.out ? (
            toPill <= 0 ? (
              <div data-safe="logo symbol" style={{position: 'absolute', left: markC.x - MARK_W / 2, top: markC.y - MARK_H / 2, opacity: markIn, filter: markIn < 0.99 ? `blur(${8 * (1 - markIn)}px)` : undefined, transform: `scale(${kf(f, [3.2, 4.8], [1, 1.02])})`}}>
                <LogoMark height={MARK_H} />
              </div>
            ) : (
              <>
                <div style={{position: 'absolute', left: markC.x - MARK_W / 2, top: markC.y - MARK_H / 2, opacity: 1 - toPill, transform: `scale(${1 - 0.3 * toPill})`, filter: `blur(${6 * toPill}px)`}}>
                  <LogoMark height={MARK_H} />
                </div>
                <div style={{position: 'absolute', left: rx - rw / 2, top: ry - rh / 2, width: rw, height: rh, borderRadius: Math.min(rw, rh) / 2, background: `color-mix(in srgb, #8FD03C ${Math.round(100 * toCaret)}%, ${UI.ink})`, opacity: toPill, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  {toCaret < 0.5 ? <div style={{opacity: 1 - 2 * toCaret}}><Sparkle size={rh * 0.72} /></div> : null}
                </div>
              </>
            )
          ) : null}
          {/* wordmark resolves beside it (blur + 16px slide) */}
          {wordIn > 0 && textOut < 1 ? (
            <div data-safe="wordmark" style={{position: 'absolute', left: wordX, top: BASELINE - WORD_H, opacity: wordIn * (1 - textOut), filter: `blur(${12 * (1 - wordIn) + 14 * textOut}px)`, transform: `translateX(${16 * (1 - wordIn)}px)`}}>
              <Wordmark height={WORD_H} />
            </div>
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
