import React from 'react';
import {AbsoluteFill, Freeze, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_SANS, kf, kfIO, tween} from '../theme';
import {SCENE_DURATIONS} from '../timeline';
import {PILL} from '../layout';
import {BUILD7, PILL_S5} from '../v7';
import {Scene03} from './Scene03';
import {CircleReveal} from '../components/CircleReveal';
import {CreamSky} from '../components/ProceduralSky';
import {LogoMark} from '../components/Logo';
import {ConsolePill} from '../ui/ConsoleCard';
import {IDENTITY} from '../components/Stage';
import {SceneLayerProps} from './kit';

/**
 * SCENE 4 (3.5 s) intro, procedural cream. Scene 3's pill pulses and a cream
 * circle opens; the BotCircuits mark resolves from blur, holds, then morphs
 * into the dark Console pill, which rises to its place in scene 5's card.
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
  const markIn = tween(f, 0.55, 1.2);
  const markOut = tween(f, 2.2, 2.6);
  const consoleIn = tween(f, 2.3, 2.7);
  const rise = kfIO(f, [2.6, 3.0], [0, 1]);
  const big = {w: 176, h: 88};
  const pw = big.w + (PILL_S5.width - big.w) * rise;
  const ph = big.h + (PILL_S5.height - big.h) * rise;
  const px = 960 + (PILL_S5.cx - 960) * rise;
  const py = 540 + (PILL_S5.cy - 540) * rise;

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
      {/* scene 3's pill (identical at f = 0) blurs away */}
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

      {/* the BotCircuits mark resolves from blur, then shrinks into the pill */}
      {markIn > 0 && markOut < 1 ? (
        <div
          style={{
            position: 'absolute',
            left: 960 - 120,
            top: 540 - 134,
            opacity: markIn * (1 - markOut),
            filter: `blur(${14 * (1 - markIn) + 14 * markOut}px)`,
            transform: `scale(${(0.85 + 0.15 * markIn) * kf(f, [1.2, 2.2], [1, 1.03]) * (1 - 0.7 * markOut)})`,
          }}
        >
          <LogoMark height={268} />
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
            filter: consoleIn < 0.99 ? `blur(${14 * (1 - consoleIn)}px)` : undefined,
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
