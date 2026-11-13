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
import {IDENTITY} from '../components/Stage';
import {SceneLayerProps} from './kit';

// Full lockup: symbol (130px tall) + "BotCircuits" wordmark, centred.
const MARK_H = 130;
const MARK_W = MARK_H * MARK_ASPECT;
const GAP = MARK_H * LOCKUP_RATIO.gap;
const WORD_H = MARK_H * LOCKUP_RATIO.wordHeight;
const WORD_W = WORD_H * WORDMARK_ASPECT;
const LOCK_W = MARK_W + GAP + WORD_W;
const LEFT = 960 - LOCK_W / 2;
const MARK_C = {x: LEFT + MARK_W / 2, y: 540};
const WORD_X = LEFT + MARK_W + GAP;

/** 12 dots that flow in and merge (metaball "goo") into the symbol's ring. */
const Metaballs: React.FC<{frame: number; p: number; opacity: number}> = ({frame, p, opacity}) => {
  const dots = Array.from({length: 13}).map((_, i) => {
    const a = (i / 12) * Math.PI * 2 + 0.3;
    const target = i === 12 ? {x: 0, y: 0} : {x: Math.cos(a) * MARK_H * 0.36, y: Math.sin(a) * MARK_H * 0.36};
    const ang = random(`mb-a-${i}`) * Math.PI * 2;
    const dist = 240 + random(`mb-d-${i}`) * 220;
    const from = {x: Math.cos(ang) * dist, y: Math.sin(ang) * dist};
    const k = Math.min(1, Math.max(0, p * 1.25 - random(`mb-s-${i}`) * 0.25));
    const e = 1 - Math.pow(1 - k, 3);
    const swirl = (1 - e) * 0.8;
    const x = from.x + (target.x - from.x) * e;
    const y = from.y + (target.y - from.y) * e;
    return {x: x * Math.cos(swirl) - y * Math.sin(swirl), y: x * Math.sin(swirl) + y * Math.cos(swirl), r: i === 12 ? 12 : 11 + 3 * (1 - e)};
  });
  return (
    <svg width={900} height={900} viewBox="-450 -450 900 900" style={{position: 'absolute', left: MARK_C.x - 450, top: MARK_C.y - 450, opacity}}>
      <defs>
        <filter id="goo">
          <feGaussianBlur stdDeviation={9} />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
        </filter>
      </defs>
      <g filter="url(#goo)" fill={COLORS.inkNavy}>
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} />
        ))}
      </g>
      <text x={0} y={0} opacity={0}>{frame}</text>
    </svg>
  );
};

/**
 * SCENE 4 (4.5 s) intro, cream/lilac/peach. The pill from scene 3 pulses and a
 * cream circle opens; dots flow and merge into the symbol, the wordmark
 * resolves in from the right, hold on the full lockup, then the wordmark blurs
 * out and the symbol morphs into the dark Console pill.
 */
export const Scene04Intro: React.FC<SceneLayerProps> = ({layer = 'all'}) => {
  const f = useCurrentFrame();
  const show = (k: 'bg' | 'shell' | 'fg') => layer === 'all' || layer === k;
  const {fps} = useVideoConfig();
  const s = f / fps;
  const dur = BUILD7.dur.s4;

  const pulse = kf(f, [0, 0.15, 0.3], [1, 1.05, 1]);
  const reveal = tween(f, 0.12, 0.6);
  const pillOut = tween(f, 0.45, 0.9);
  const flow = kfIO(f, [0.5, 1.35], [0, 1]);
  const blobs = kf(f, [0.5, 0.65, 1.2, 1.45], [0, 1, 1, 0]);
  const markIn = tween(f, 1.15, 1.45);
  const wordIn = tween(f, 1.45, 1.95);
  const wordOut = tween(f, 3.15, 3.5);
  const markOut = tween(f, 3.3, 3.65);
  const consoleIn = tween(f, 3.35, 3.7);
  const rise = kfIO(f, [3.65, 4.0], [0, 1]);
  const big = {w: 140, h: 70};
  const pw = big.w + (PILL_S5.width - big.w) * rise;
  const ph = big.h + (PILL_S5.height - big.h) * rise;
  const px = MARK_C.x + (PILL_S5.cx - MARK_C.x) * rise;
  const py = MARK_C.y + (PILL_S5.cy - MARK_C.y) * rise;

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

          {blobs > 0 ? <Metaballs frame={f} p={flow} opacity={blobs} /> : null}

          {/* symbol */}
          {markIn > 0 && markOut < 1 ? (
            <div
              data-safe="logo symbol"
              style={{
                position: 'absolute',
                left: MARK_C.x - MARK_W / 2,
                top: MARK_C.y - MARK_H / 2,
                opacity: markIn * (1 - markOut),
                filter: `blur(${8 * (1 - markIn) + 10 * markOut}px)`,
                transform: `scale(${kf(f, [1.95, 3.15], [1, 1.02]) * (1 - 0.6 * markOut)})`,
              }}
            >
              <LogoMark height={MARK_H} />
            </div>
          ) : null}
          {/* wordmark resolves in from the right (blur + 16px slide) */}
          {wordIn > 0 && wordOut < 1 ? (
            <div
              data-safe="wordmark"
              style={{
                position: 'absolute',
                left: WORD_X,
                top: 540 - WORD_H / 2,
                opacity: wordIn * (1 - wordOut),
                filter: `blur(${12 * (1 - wordIn) + 12 * wordOut}px)`,
                transform: `translateX(${16 * (1 - wordIn) - 16 * wordOut}px)`,
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
