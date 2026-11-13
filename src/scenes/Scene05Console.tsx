import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, alpha, kf, kfIO, popIn, tween} from '../theme';
import {sec} from '../timeline';
import {BACKDROPS} from '../handoff';
import {BUILD7, CHAT, CHAT_VIEW, CONSOLE_CARD, PILL_S5} from '../v7';
import {Backdrop} from '../components/Backdrop';
import {FallbackPeriwinkle} from '../components/ProceduralSky';
import {camAt, CamKeys, toScreen} from '../components/Stage';
import {CameraRig, dissolve} from '../components/CameraRig';
import {Cursor} from '../components/Cursor';
import {Orb} from '../components/Orb';
import {PetalSpinner} from '../components/PetalSpinner';
import {ConsoleCard, ConsolePill, CONSOLE_INPUT, wrapInput} from '../ui/ConsoleCard';
import {ChatCard, CONVO} from '../ui/ChatCard';
import {UI} from '../ui/tokens';
import {envelope, SceneLayerProps} from './kit';

export const PROMPT = "Build a support agent for our bank. It helps customers who lose their card, checks who they are, blocks the card, and hands over to a person when it can't.";
const TYPE_AT = 1.25;
const PER_CHAR = 0.95;
const CARD_LEFT = CONSOLE_CARD.cx - CONSOLE_CARD.width / 2;
const CARD_TOP = CONSOLE_CARD.cy - CONSOLE_CARD.height / 2;
const INPUT_CY = CARD_TOP + CONSOLE_INPUT.y + CONSOLE_INPUT.height / 2;
const lines = () => wrapInput(PROMPT).length;

const S5_CAM: CamKeys = {
  t: [0, 0.6, 1.15, 2.6, 3.5, 3.9, 4.5],
  x: [960, 960, 960, 960, 960, 960, 960],
  y: [540, 540, INPUT_CY, INPUT_CY + 24, INPUT_CY + 48, INPUT_CY + 48, 540],
  s: [1, 1, 1.65, 1.65, 1.65, 1.65, 1],
};

/**
 * SCENE 5 (7 s) Console prompt, then the untrained agent. Periwinkle sky.
 */
export const Scene05Console: React.FC<SceneLayerProps> = ({layer = 'all'}) => {
  const f = useCurrentFrame();
  const show = (k: 'bg' | 'shell' | 'fg') => layer === 'all' || layer === k;
  const {fps} = useVideoConfig();
  const s = f / fps;
  const dur = BUILD7.dur.s5;
  const env = envelope(f, dur);
  const cam = camAt(f, S5_CAM);

  const tilt = kfIO(f, [0, 0.6], [3, 0]);
  const cardIn = tween(f, 0, 0.5);
  const focus = tween(f, 1.05, 1.25);
  const SEND = 3.85;
  const cardGone = tween(f, 4.6, 5.1);
  // send button + pill merge into a dot, the dot becomes the orb
  const merge = kfIO(f, [4.25, 4.6], [0, 1]);
  const sendWorld = {x: CARD_LEFT + CONSOLE_INPUT.x + CONSOLE_INPUT.width - 22 - CONSOLE_INPUT.send / 2, y: CARD_TOP + CONSOLE_INPUT.y + CONSOLE_INPUT.height + (lines() - 1) * CONSOLE_INPUT.lineHeight - 28 - CONSOLE_INPUT.send / 2};
  const centre = {x: 960, y: 540};
  const orbGrow = popIn(f, 4.55, 0.4, 1.04);
  // orb flies up to become the chat card's avatar badge
  const toBadge = kfIO(f, [5.1, 5.6], [0, 1]);
  const badge = toScreen(CHAT_VIEW, {x: CHAT.x + CHAT.width / 2, y: CHAT.y + 74});
  const orbSize = 200 + (92 * CHAT_VIEW.scale - 200) * toBadge;
  const orbPos = {x: centre.x + (badge.x - centre.x) * toBadge, y: centre.y + (badge.y - centre.y) * toBadge};
  const chatIn = kfIO(f, [5.0, 5.55], [0, 1]);

  // cursor (screen)
  const click = toScreen(camAt(sec(1.05), S5_CAM), {x: CARD_LEFT + CONSOLE_INPUT.x + 260, y: INPUT_CY + 6});
  const sendScreen = toScreen(camAt(sec(SEND), S5_CAM), sendWorld);

  return (
    <AbsoluteFill>
      {show('bg') ? (
      <AbsoluteFill style={{opacity: env.inP, filter: env.inP < 0.99 ? `blur(${14 * (1 - env.inP)}px)` : undefined}}>
          <Backdrop src={BACKDROPS.sky5a} t={s} span={8} cam={cam} scrim="light" fallback={<FallbackPeriwinkle t={s} cam={cam} />} />
          {/* prompting glow (periwinkle) behind the card */}
          <AbsoluteFill style={{background: `radial-gradient(ellipse 45% 40% at 50% 52%, ${alpha(UI.glow.prompt, 0.55)} 0%, ${alpha(UI.glow.prompt, 0)} 70%)`, opacity: 1 - cardGone}} />
        </AbsoluteFill>
      ) : null}

      {show('fg') ? (
        <>
      {/* Console card (world == screen at identity camera) */}
      {cardGone < 1 ? (
        <CameraRig cam={cam}>
          <div style={{position: 'absolute', left: 0, top: 0, ...dissolve(cardIn, cardGone), transformOrigin: '960px 540px', transform: `perspective(2400px) rotateX(${tilt}deg)`}}>
            <ConsoleCard
              frame={f}
              text={PROMPT}
              typeStart={sec(TYPE_AT)}
              perChar={PER_CHAR}
              focus={focus}
              sendPress={kf(f, [SEND, SEND + 0.07, SEND + 0.22], [0, 1, 0])}
              suggestionsOut={s > 3.9 ? 1 : 0}
              liftAt={4.0}
              sendOpacity={1 - merge}
            />
          </div>
          {/* flying send button (merge) */}
          {merge > 0 && merge < 1 ? (
            <div
              style={{
                position: 'absolute',
                left: sendWorld.x + (centre.x - sendWorld.x) * merge - 32,
                top: sendWorld.y + (centre.y - sendWorld.y) * merge - 32,
                width: 64,
                height: 64,
                borderRadius: 32,
                background: UI.ink,
                transform: `scale(${1 - 0.7 * merge})`,
              }}
            />
          ) : null}
        </CameraRig>
      ) : null}

      {/* the Console pill: shared from scene 4, then merges into the dot */}
      {merge < 1 ? (
        <CameraRig cam={cam}>
          <div
            style={{
              position: 'absolute',
              left: PILL_S5.cx + (centre.x - PILL_S5.cx) * merge - PILL_S5.width / 2,
              top: PILL_S5.cy + (centre.y - PILL_S5.cy) * merge - PILL_S5.height / 2,
              transform: `scale(${1 - 0.6 * merge})`,
            }}
          >
            <ConsolePill />
          </div>
        </CameraRig>
      ) : null}

      {/* the glowing dot -> the untrained (grey) orb with a petal spinner */}
      {merge > 0.6 && s < 5.65 ? (
        <div
          style={{
            position: 'absolute',
            left: 960 - 40,
            top: 540 - 40,
            width: 80,
            height: 80,
            borderRadius: 40,
            background: `radial-gradient(circle, ${COLORS.white} 0%, ${COLORS.white} 25%, ${alpha(COLORS.periwinkle, 0.7)} 45%, rgba(255,255,255,0) 72%)`,
            opacity: kf(f, [4.4, 4.55, 4.75], [0, 1, 0]),
          }}
        />
      ) : null}
      {s >= 4.55 ? (
        <>
          <PetalSpinner cx={orbPos.x} cy={orbPos.y} radius={170} ringRadius={104} frame={f} opacity={kf(f, [4.55, 4.7, 5.05, 5.15], [0, 1, 1, 0])} converge={tween(f, 4.95, 5.15)} />
          {s < dur - 0.5 && toBadge < 1 ? <Orb cx={orbPos.x} cy={orbPos.y} size={orbSize} scale={orbGrow} color={0} frame={f} /> : null}
        </>
      ) : null}

        </>
      ) : null}
      {/* the chat card slides in (untrained "before" state) */}
      {show('shell') && chatIn > 0 && env.ownsShared ? (
        <CameraRig cam={CHAT_VIEW}>
          <div style={{position: 'absolute', left: 0, top: 0, opacity: chatIn, transform: `translateX(${(1 - chatIn) * 220}px)`, filter: chatIn < 0.99 ? `blur(${10 * (1 - chatIn)}px)` : undefined}}>
            <ChatCard frame={f} msgs={CONVO.s5} orbColor={0} badgeOpacity={toBadge >= 1 ? 1 : 0} />
          </div>
        </CameraRig>
      ) : null}

      {show('fg') ? (
      <Cursor
        frame={f}
        keys={[
          {t: 0.45, x: 1700, y: 1060},
          {t: 1.0, x: click.x, y: click.y},
          {t: 1.15, x: click.x, y: click.y},
          {t: 1.8, x: 1560, y: 930},
          {t: 3.3, x: 1600, y: 900},
          {t: 3.8, x: sendScreen.x + 6, y: sendScreen.y + 6},
          {t: 4.0, x: sendScreen.x + 6, y: sendScreen.y + 6},
          {t: 4.6, x: 1700, y: 1180},
        ]}
        clicks={[1.05, SEND]}
        hand={[[3.6, 4.05]]}
        rippleColor={COLORS.inkNavy}
        opacity={tween(f, 0.45, 0.65) * (1 - tween(f, 4.3, 4.6))}
      />
      ) : null}
    </AbsoluteFill>
  );
};

