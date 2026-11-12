import React from 'react';
import {AbsoluteFill, Freeze, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_SANS, kf, tween} from '../theme';
import {SCENE_DURATIONS, sec} from '../timeline';
import {Scene03} from '../scenes/Scene03';
import {LOCKUP_BIG, LOCKUP_SMALL, PILL, PROMPT_BIG, PROMPT_S4_END_SCALE} from '../handoff';
import {Lockup, LOCKUP_RATIO, MARK_ASPECT, lockupWidth} from '../components/Logo';
import {PromptBar} from '../components/PromptBar';
import {camAt, CamKeys} from '../components/Stage';
import {Scene04Bg} from './backgrounds';

/**
 * SCENE 4 (5 s) "Introduce BotCircuits".
 * Starts on the exact hand-off pill from scene 3 (PILL in src/layout.ts).
 */
export const S4_CAM: CamKeys = {t: [0, 2.6, 4.98], x: [960, 960, 960], y: [540, 540, 600], s: [1, 1, 1.04]};

/** Lockup transform: oversized centre -> parked top-left (origin top-left). */
export const lockupTransform = (p: number) => {
  const W = lockupWidth(LOCKUP_BIG.markH);
  const bigLeft = LOCKUP_BIG.cx - W / 2;
  const bigTop = LOCKUP_BIG.cy - LOCKUP_BIG.markH / 2;
  const s = 1 + (LOCKUP_SMALL.markH / LOCKUP_BIG.markH - 1) * p;
  return {
    left: bigLeft + (LOCKUP_SMALL.left - bigLeft) * p,
    top: bigTop + (LOCKUP_SMALL.top - bigTop) * p,
    scale: s,
    width: W,
  };
};

export const Scene04: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = f / fps;
  const cam = camAt(f, S4_CAM);

  // 0 - 0.6 s: pill pulses once, a white circle reveals from its centre
  const pulse = kf(f, [0, 0.15, 0.3], [1, 1.05, 1]);
  const reveal = kf(f, [0.12, 0.6], [0, 1]);
  const bgIn = tween(f, 0.5, 0.8);

  // 0.6 - 1.2 s: pill morphs into the oversized lockup
  const pillText = 1 - tween(f, 0.6, 0.72);
  const pillOut = tween(f, 0.6, 0.95);
  const markIn = tween(f, 0.7, 1.0);
  const wordIn = tween(f, 0.8, 1.1);
  const lockScale = kf(f, [0.7, 1.1], [0.94, 1]);
  const underline = tween(f, 0.95, 1.35);
  // hold ~0.9 s, then 2.0 - 2.8 s: park top-left; lime wash rises
  const park = tween(f, 2.0, 2.8);
  const underlineOut = tween(f, 2.0, 2.25);
  const wash = tween(f, 2.0, 3.0);
  // 2.5 - 3.3 s: the Console prompt bar rises from the bottom centre
  const barIn = tween(f, 2.5, 3.1);
  const barRise = kf(f, [2.5, 3.3], [24, 0]);
  const barScale = kf(f, [2.6, 4.98], [1, PROMPT_S4_END_SCALE]);

  const L = lockupTransform(park);
  const markH = LOCKUP_BIG.markH;
  const wordLeft = markH * MARK_ASPECT + markH * LOCKUP_RATIO.gap;
  const wordH = markH * LOCKUP_RATIO.wordHeight;

  return (
    <AbsoluteFill>
      {/* scene 3's final background, frozen, under the reveal */}
      <Freeze frame={SCENE_DURATIONS.scene03 - 1}>
        <Scene03 layer="background" />
      </Freeze>
      {/* circular reveal (transform only) */}
      <div
        style={{
          position: 'absolute',
          left: PILL.centerX - 1150,
          top: PILL.centerY - 1150,
          width: 2300,
          height: 2300,
          borderRadius: '50%',
          background: COLORS.white,
          transform: `scale(${reveal})`,
        }}
      />
      <AbsoluteFill style={{opacity: bgIn}}>
        <Scene04Bg seconds={seconds} cam={cam} wash={wash} />
      </AbsoluteFill>

      {/* the hand-off pill (identical to scene 3's last frame at f = 0) */}
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
          transform: `scale(${pulse * (1 + 0.25 * pillOut)})`,
        }}
      >
        <span style={{opacity: pillText}}>{PILL.text}</span>
      </div>

      {/* BotCircuits lockup */}
      <div
        style={{
          position: 'absolute',
          left: L.left,
          top: L.top,
          width: L.width,
          height: markH,
          transformOrigin: '0 0',
          transform: `scale(${L.scale})`,
        }}
      >
        <div style={{transform: `scale(${lockScale})`, transformOrigin: '50% 50%'}}>
          <Lockup markHeight={markH} markOpacity={markIn} wordOpacity={wordIn} wordShift={(1 - wordIn) * 20} />
        </div>
        <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
          <path
            d={`M ${wordLeft} ${markH / 2 + wordH / 2 + 30} L ${L.width} ${markH / 2 + wordH / 2 + 30}`}
            stroke={COLORS.lime}
            strokeWidth={9}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - underline}
            opacity={underline > 0 ? 1 - underlineOut : 0}
          />
        </svg>
      </div>

      <PromptBar
        state={{cx: PROMPT_BIG.cx, cy: PROMPT_BIG.cy, scale: barScale, opacity: barIn, dy: barRise}}
        frame={f}
        typingUntil={sec(3.6)}
      />
    </AbsoluteFill>
  );
};
