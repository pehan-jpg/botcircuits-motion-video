import React from 'react';
import {AbsoluteFill, Freeze, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_SANS, kf, tween} from '../theme';
import {SCENE_DURATIONS, sec} from '../timeline';
import {Scene03} from '../scenes/Scene03';
import {BACKDROPS, CAM_S4_END, LOCKUP, PILL, SKY5A_SPAN, SKY5A_START_S4} from '../handoff';
import {Lockup, LogoMark, LOCKUP_RATIO, MARK_ASPECT, lockupWidth} from '../components/Logo';
import {camAt, CamKeys, toScreen, World} from '../components/Stage';
import {CircleReveal} from '../components/CircleReveal';
import {Backdrop} from '../components/Backdrop';
import {CreamSky, FallbackPeriwinkle} from '../components/ProceduralSky';
import {FieldInput} from '../components/FieldInput';

/** SCENE 4 (5 s) "Introduce BotCircuits". */
export const S4_CAM: CamKeys = {
  t: [0, 0.6, 1.6, 2.8, 3.8, 4.98],
  x: [960, 960, 960, 945, 960, CAM_S4_END.x],
  y: [540, 540, 540, 545, 540, CAM_S4_END.y],
  s: [1.25, 1.25, 1, 1.03, 1, CAM_S4_END.scale],
};

/** Sky 5A backdrop as seen in scenes 4 and 5 (shared clock). */
export const Sky5A: React.FC<{t: number; cam: ReturnType<typeof camAt>}> = ({t, cam}) => (
  <Backdrop
    src={BACKDROPS.sky5a}
    t={t}
    span={SKY5A_SPAN}
    cam={cam}
    scrim="light"
    fallback={<FallbackPeriwinkle t={t} cam={cam} />}
  />
);

export const Scene04: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = f / fps;
  const cam = camAt(f, S4_CAM);

  // 0 - 0.6: the pill pulses, a cream circle reveals from its centre
  const pulse = kf(f, [0, 0.15, 0.3], [1, 1.05, 1]);
  const reveal = tween(f, 0.12, 0.6);
  // 0.6 - 1.6: pill -> oversized lockup, underline draws
  const pillText = 1 - tween(f, 0.6, 0.72);
  const pillOut = tween(f, 0.6, 0.95);
  const markIn = tween(f, 0.7, 1.0);
  const wordIn = tween(f, 0.8, 1.15);
  const underline = tween(f, 1.05, 1.5);
  // 2.8 - 3.8: wordmark slides left and fades, the mark grows into an iris
  const wordOut = tween(f, 2.8, 3.2);
  // the mark's dots swell and merge into one solid, opaque circle (the sky
  // inside it), which then expands to fill the frame with a crisp edge
  const markGrow = kf(f, [2.9, 3.25], [1, 1.35]);
  const markFade = 1 - tween(f, 3.08, 3.25);
  const iris = kf(f, [3.0, 3.25, 3.95], [0, 0.11, 1]);
  // 3.8 - 5.0: the input field rises in the sky, camera pulls back wide
  const fieldIn = tween(f, 3.8, 4.4);

  const markH = LOCKUP.markH;
  const W = lockupWidth(markH);
  const left = LOCKUP.cx - W / 2;
  const top = LOCKUP.cy - markH / 2;
  const markW = markH * MARK_ASPECT;
  const wordLeft = markW + markH * LOCKUP_RATIO.gap;
  const wordH = markH * LOCKUP_RATIO.wordHeight;
  // mark centre travels to the frame centre as it grows
  const toCentre = tween(f, 2.85, 3.5);
  const markWx = left + markW / 2 + (cam.x - (left + markW / 2)) * toCentre;
  const markWy = LOCKUP.cy + (cam.y - LOCKUP.cy) * toCentre;
  const markScreen = toScreen(cam, {x: markWx, y: markWy});

  return (
    <AbsoluteFill>
      <Freeze frame={SCENE_DURATIONS.scene03 - 1}>
        <Scene03 layer="background" />
      </Freeze>
      <CircleReveal cx={PILL.centerX} cy={PILL.centerY} progress={reveal}>
        <CreamSky t={s} cam={cam} frame={f} />
      </CircleReveal>

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

      {/* lockup, seen through the camera (starts zoomed in, pulls back) */}
      <World cam={cam}>
        <div style={{position: 'absolute', left, top, width: W, height: markH}}>
          {/* wordmark + underline */}
          <div style={{position: 'absolute', left: 0, top: 0, opacity: 1 - wordOut, transform: `translateX(${-90 * wordOut}px)`}}>
            <Lockup markHeight={markH} markOpacity={0} wordOpacity={wordIn} wordShift={(1 - wordIn) * 20} />
            <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
              <path
                d={`M ${wordLeft} ${markH / 2 + wordH / 2 + 30} L ${wordLeft + wordH * 3.2} ${markH / 2 + wordH / 2 + 30}`}
                stroke={COLORS.lime}
                strokeWidth={8}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - underline}
                opacity={underline > 0 ? 1 : 0}
              />
            </svg>
          </div>
        </div>
      </World>

      {/* iris: the periwinkle sky opens through the mark */}
      <CircleReveal cx={markScreen.x} cy={markScreen.y} progress={iris}>
        <Sky5A t={s - SKY5A_START_S4} cam={cam} />
        <World cam={cam}>
          <FieldInput frame={f} opacity={fieldIn} rise={(1 - fieldIn) * 60} typingUntil={sec(3.8)} />
        </World>
      </CircleReveal>
      {/* the mark travels to the centre and grows into an iris */}
      <World cam={cam}>
        <div
          style={{
            position: 'absolute',
            left: markWx - markW / 2,
            top: markWy - markH / 2,
            opacity: markIn * markFade,
            transform: `scale(${markGrow})`,
          }}
        >
          <LogoMark height={markH} />
        </div>
      </World>

    </AbsoluteFill>
  );
};
