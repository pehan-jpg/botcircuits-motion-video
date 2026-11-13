import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, alpha, kf, kfIO, popIn, tween} from '../theme';
import {sec} from '../timeline';
import {BACKDROPS} from '../handoff';
import {BUILD7, CHAT, CHAT_VIEW, CONSOLE_CARD, PILL_S5} from '../v7';
import {Backdrop} from '../components/Backdrop';
import {FallbackPeriwinkle} from '../components/ProceduralSky';
import {camAt, CamKeys, toScreen} from '../components/Stage';
import {CameraRig, dissolve, isPanning} from '../components/CameraRig';
import {Cursor} from '../components/Cursor';
import {Orb} from '../components/Orb';
import {PetalSpinner} from '../components/PetalSpinner';
import {ConsoleCard, ConsolePill, CONSOLE_INPUT, inputHeight} from '../ui/ConsoleCard';
import {ChatThread, CONVO} from '../ui/ChatThread';
import {UI} from '../ui/tokens';
import {envelope, SceneLayerProps} from './kit';

export const PROMPT = "Build an agent for card services. It checks who the customer is, blocks lost cards, and hands over to a person when it can't.";
const TYPE_AT = 1.2;
const PER_CHAR = 1.1;
const CARD_LEFT = CONSOLE_CARD.cx - CONSOLE_CARD.width / 2;
const CARD_TOP = CONSOLE_CARD.cy - CONSOLE_CARD.height / 2;

// wide camera, at most a gentle 1.08 drift toward the input (card stays inside the margins)
const CAM: CamKeys = {t: [0, 1.0, 3.6, 4.4], x: [960, 960, 960, 960], y: [540, 540, 548, 540], s: [1, 1, 1.08, 1]};

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
  const cam = camAt(f, CAM);

  const tilt = kfIO(f, [0, 0.6], [3, 0]);
  const cardIn = tween(f, 0, 0.5);
  const focus = tween(f, 1.0, 1.2);
  const SEND = 3.75;
  const cardGone = tween(f, 4.55, 5.05);
  const merge = kfIO(f, [4.2, 4.55], [0, 1]);
  const H = inputHeight(f, PROMPT, sec(TYPE_AT), PER_CHAR);
  const sendWorld = {x: CARD_LEFT + CONSOLE_INPUT.x + CONSOLE_INPUT.width - 18 - CONSOLE_INPUT.send / 2, y: CARD_TOP + CONSOLE_INPUT.y + H - (CONSOLE_INPUT.lineHeight + CONSOLE_INPUT.padY * 2) / 2};
  const centre = {x: 960, y: 540};
  const orbGrow = popIn(f, 4.5, 0.4, 1.04);
  // the orb flies into the chat footer's mini orb (agent status line)
  const toFooter = kfIO(f, [5.05, 5.5], [0, 1]);
  const footer = toScreen(CHAT_VIEW, {x: CHAT.x + 28 + 14, y: CHAT.y + 718 + 17});
  const orbSize = 180 + (28 - 180) * toFooter;
  const orbPos = {x: centre.x + (footer.x - centre.x) * toFooter, y: centre.y + (footer.y - centre.y) * toFooter - Math.sin(toFooter * Math.PI) * 120};
  const chatIn = kfIO(f, [4.95, 5.45], [0, 1]);

  const click = toScreen(camAt(sec(1.0), CAM), {x: CARD_LEFT + CONSOLE_INPUT.x + 300, y: CARD_TOP + CONSOLE_INPUT.y + 45});
  const sendScreen = toScreen(camAt(sec(SEND), CAM), sendWorld);

  return (
    <AbsoluteFill>
      {show('bg') ? (
        <AbsoluteFill style={{opacity: env.inP, filter: env.inP < 0.99 ? `blur(${14 * (1 - env.inP)}px)` : undefined}}>
          <Backdrop src={BACKDROPS.sky5a} t={s} span={8} cam={cam} scrim="light" fallback={<FallbackPeriwinkle t={s} cam={cam} />} />
          <AbsoluteFill style={{background: `radial-gradient(ellipse 45% 40% at 50% 52%, ${alpha(UI.glow.prompt, 0.55)} 0%, ${alpha(UI.glow.prompt, 0)} 70%)`, opacity: 1 - cardGone}} />
        </AbsoluteFill>
      ) : null}

      {show('fg') ? (
        <>
          {cardGone < 1 ? (
            <CameraRig cam={cam} panning={isPanning((fr) => camAt(fr, CAM), f) && false}>
              <div style={{position: 'absolute', left: 0, top: 0, ...dissolve(cardIn, cardGone), transformOrigin: '960px 540px', transform: `perspective(2400px) rotateX(${tilt}deg)`}}>
                <ConsoleCard frame={f} text={PROMPT} typeStart={sec(TYPE_AT)} perChar={PER_CHAR} focus={focus} sendPress={kf(f, [SEND, SEND + 0.07, SEND + 0.22], [0, 1, 0])} liftAt={3.95} sendOpacity={1 - merge} />
              </div>
              {merge > 0 && merge < 1 ? (
                <div style={{position: 'absolute', left: sendWorld.x + (centre.x - sendWorld.x) * merge - 28, top: sendWorld.y + (centre.y - sendWorld.y) * merge - 28, width: 56, height: 56, borderRadius: 28, background: UI.ink, transform: `scale(${1 - 0.7 * merge})`}} />
              ) : null}
            </CameraRig>
          ) : null}
          {merge < 1 ? (
            <CameraRig cam={cam}>
              <div style={{position: 'absolute', left: PILL_S5.cx + (centre.x - PILL_S5.cx) * merge - PILL_S5.width / 2, top: PILL_S5.cy + (centre.y - PILL_S5.cy) * merge - PILL_S5.height / 2, transform: `scale(${1 - 0.6 * merge})`}}>
                <ConsolePill />
              </div>
            </CameraRig>
          ) : null}
          {merge > 0.6 && s < 5.0 ? (
            <div style={{position: 'absolute', left: 960 - 40, top: 540 - 40, width: 80, height: 80, borderRadius: 40, background: `radial-gradient(circle, ${COLORS.white} 0%, ${COLORS.white} 25%, ${alpha('#CFF5DE', 0.8)} 45%, rgba(255,255,255,0) 72%)`, opacity: kf(f, [4.35, 4.5, 4.7], [0, 1, 0])}} />
          ) : null}
          {s >= 4.5 ? (
            <>
              <PetalSpinner cx={orbPos.x} cy={orbPos.y} radius={150} ringRadius={94} frame={f} opacity={kf(f, [4.5, 4.65, 4.95, 5.05], [0, 1, 1, 0])} converge={tween(f, 4.85, 5.05)} />
              {toFooter < 1 ? <Orb cx={orbPos.x} cy={orbPos.y} size={orbSize} scale={orbGrow} color={0} frame={f} /> : null}
            </>
          ) : null}
        </>
      ) : null}

      {show('shell') && chatIn > 0 && env.ownsShared ? (
        <CameraRig cam={CHAT_VIEW}>
          <div style={{position: 'absolute', left: 0, top: 0, opacity: chatIn, transform: `translateX(${(1 - chatIn) * 200}px)`, filter: chatIn < 0.99 ? `blur(${10 * (1 - chatIn)}px)` : undefined}}>
            <ChatThread frame={f} msgs={CONVO.s5} orbColor={0} footerOrbOpacity={toFooter >= 1 ? 1 : 0} />
          </div>
        </CameraRig>
      ) : null}

      {show('fg') ? (
        <Cursor
          frame={f}
          keys={[
            {t: 0.4, x: 1660, y: 1040},
            {t: 0.95, x: click.x, y: click.y},
            {t: 1.1, x: click.x, y: click.y},
            {t: 1.7, x: 1600, y: 930},
            {t: 3.2, x: 1620, y: 920},
            {t: 3.7, x: sendScreen.x + 6, y: sendScreen.y + 6},
            {t: 3.9, x: sendScreen.x + 6, y: sendScreen.y + 6},
            {t: 4.5, x: 1700, y: 1180},
          ]}
          clicks={[1.0, SEND]}
          hand={[[3.5, 3.95]]}
          rippleColor={COLORS.inkNavy}
          opacity={tween(f, 0.4, 0.6) * (1 - tween(f, 4.2, 4.5))}
        />
      ) : null}
    </AbsoluteFill>
  );
};
