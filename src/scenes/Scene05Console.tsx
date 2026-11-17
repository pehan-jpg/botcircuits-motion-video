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
import {ConsoleCard, ConsolePill, CONSOLE_INPUT, inputHeight, liftDuration} from '../ui/ConsoleCard';
import {ChatThread, CONVO} from '../ui/ChatThread';
import {UI} from '../ui/tokens';
import {RectMorph} from '../components/Morph';
import {beatUnderline} from '../ui/TextBeat';
import {envelope, SceneLayerProps} from './kit';

export const PROMPT = "Build an agent for card services. It checks who the customer is, blocks lost cards, and hands over to a person when it can't.";
const TYPE_AT = 0.7;
const PER_CHAR = 0.85;
const SEND = 2.6;
const LIFT = 2.7;
const LIFT_END = LIFT + liftDuration(PROMPT); // ~4.47
const COLLAPSE: [number, number] = [LIFT_END - 0.02, LIFT_END + 0.25];
const TRAVEL: [number, number] = [COLLAPSE[1] - 0.02, COLLAPSE[1] + 0.2];
const ORB_AT = TRAVEL[1] - 0.04;
const CARD_LEFT = CONSOLE_CARD.cx - CONSOLE_CARD.width / 2;
const CARD_TOP = CONSOLE_CARD.cy - CONSOLE_CARD.height / 2;

// wide camera, at most a gentle 1.08 drift toward the input (card stays inside the margins)
const CAM: CamKeys = {t: [0, 0.8, 2.6, 3.8], x: [960, 960, 960, 960], y: [540, 540, 548, 540], s: [1, 1, 1.08, 1]};

/**
 * SCENE 5 (7 s) Console prompt, then the untrained agent. Periwinkle sky.
 */
export const Scene05Console: React.FC<SceneLayerProps> = ({layer = 'all'}) => {
  const f = useCurrentFrame();
  const show = (k: 'bg' | 'shell' | 'fg') => layer === 'all' || layer === k;
  const {fps} = useVideoConfig();
  const s = f / fps;
  const dur = BUILD7.dur.s5;
  const env = envelope(f, dur, true, true, BUILD7.ov.s5);
  const cam = camAt(f, CAM);

  const tilt = kfIO(f, [0, 0.6], [3, 0]);
  // TextBeat 1's underline stretches into the input (lime border + glow); the card tilts in around it
  const morph = kfIO(f, [0, 0.5], [0, 1]);
  const cardIn = tween(f, 0.15, 0.6);
  const focus = 1;
  const cardGone = tween(f, COLLAPSE[0] + 0.1, TRAVEL[1] + 0.15);
  const merge = kfIO(f, [COLLAPSE[0] + 0.05, TRAVEL[1]], [0, 1]);
  const collapse = kfIO(f, COLLAPSE, [0, 1]);
  const travel = kfIO(f, TRAVEL, [0, 1]);
  const H = inputHeight(f, PROMPT, sec(TYPE_AT), PER_CHAR);
  const sendWorld = {x: CARD_LEFT + CONSOLE_INPUT.x + CONSOLE_INPUT.width - 18 - CONSOLE_INPUT.send / 2, y: CARD_TOP + CONSOLE_INPUT.y + H - (CONSOLE_INPUT.lineHeight + CONSOLE_INPUT.padY * 2) / 2};
  const centre = {x: 960, y: 540};
  const orbGrow = popIn(f, ORB_AT, 0.4, 1.04);
  // the orb flies into the chat footer's mini orb (agent status line)
  const toFooter = kfIO(f, [4.75, 5.1], [0, 1]);
  const footer = toScreen(CHAT_VIEW, {x: CHAT.x + 28 + 14, y: CHAT.y + 718 + 17});
  const orbSize = 180 + (28 - 180) * toFooter;
  const orbPos = {x: centre.x + (footer.x - centre.x) * toFooter, y: centre.y + (footer.y - centre.y) * toFooter - Math.sin(toFooter * Math.PI) * 120};
  const chatIn = kfIO(f, [4.4, 4.8], [0, 1]);
  // the empty input field (world): collapses into a dark dot, which travels to the centre
  const I = CONSOLE_INPUT;
  const fieldC = {x: CARD_LEFT + I.x + I.width / 2, y: CARD_TOP + I.y + H / 2};
  const DOT = 44;
  const fw = I.width + (DOT - I.width) * collapse;
  const fh = H + (DOT - H) * collapse;
  const dotC = {x: fieldC.x + (centre.x - fieldC.x) * travel, y: fieldC.y + (centre.y - fieldC.y) * travel - Math.sin(travel * Math.PI) * 40};
  const showField = s >= COLLAPSE[0] && s < ORB_AT + 0.12;

  const click = toScreen(camAt(sec(0.6), CAM), {x: CARD_LEFT + CONSOLE_INPUT.x + 300, y: CARD_TOP + CONSOLE_INPUT.y + 45});
  const sendScreen = toScreen(camAt(sec(SEND), CAM), sendWorld);

  return (
    <AbsoluteFill>
      {show('bg') ? (
        <AbsoluteFill style={{opacity: env.inP, filter: env.inP < 0.99 ? `blur(${14 * (1 - env.inP)}px)` : undefined}}>
          <Backdrop src={BACKDROPS.sky5a} t={s} span={8} cam={cam} scrim="light" fallback={<FallbackPeriwinkle t={s} cam={cam} />} />
          <AbsoluteFill style={{background: `radial-gradient(ellipse 45% 40% at 50% 52%, ${alpha(UI.glow.prompt, 0.55)} 0%, ${alpha(UI.glow.prompt, 0)} 70%)`, opacity: 1 - cardGone}} />
        </AbsoluteFill>
      ) : null}

      {show('fg') && s < 0.62 ? (
        <RectMorph
          from={beatUnderline('b1')}
          to={{x: CARD_LEFT + CONSOLE_INPUT.x, y: CARD_TOP + CONSOLE_INPUT.y, w: CONSOLE_INPUT.width, h: CONSOLE_INPUT.lineHeight + CONSOLE_INPUT.padY * 2}}
          t={morph}
          r0={3}
          r1={24}
          fill0="#8FD03C"
          fill1="#FFFFFF"
          border="#8FD03C"
          glow={`0 0 0 6px rgba(143,208,60,calc(0.16 * {t})), 0 0 28px rgba(143,208,60,0.3)`}
          opacity={1 - tween(f, 0.5, 0.62)}
        />
      ) : null}
      {show('fg') ? (
        <>
          {cardGone < 1 ? (
            <CameraRig cam={cam} panning={isPanning((fr) => camAt(fr, CAM), f) && false}>
              <div style={{position: 'absolute', left: 0, top: 0, ...dissolve(cardIn, cardGone), transformOrigin: '960px 540px', transform: `perspective(2400px) rotateX(${tilt}deg)`}}>
                <ConsoleCard frame={f} text={PROMPT} typeStart={sec(TYPE_AT)} perChar={PER_CHAR} focus={focus} sendPress={kf(f, [SEND, SEND + 0.07, SEND + 0.22], [0, 1, 0])} liftAt={LIFT} hideInput={s >= COLLAPSE[0]} />
              </div>
            </CameraRig>
          ) : null}
          {showField ? (
            <CameraRig cam={cam}>
              <div
                style={{
                  position: 'absolute',
                  left: dotC.x - fw / 2,
                  top: dotC.y - fh / 2,
                  width: fw,
                  height: fh,
                  borderRadius: Math.min(fh / 2, 24 + (DOT / 2 - 24) * collapse),
                  background: `color-mix(in srgb, ${UI.ink} ${Math.round(100 * tween(f, COLLAPSE[0] + 0.1, COLLAPSE[1]))}%, ${COLORS.white})`,
                  border: `2px solid ${alpha(UI.consoleLime, 1 - collapse)}`,
                  boxShadow: `0 0 0 ${6 * (1 - collapse)}px ${alpha(UI.consoleLime, 0.16 * (1 - collapse))}`,
                  boxSizing: 'border-box',
                  opacity: 1 - tween(f, ORB_AT, ORB_AT + 0.1),
                }}
              />
            </CameraRig>
          ) : null}
          {merge < 1 ? (
            <CameraRig cam={cam}>
              <div style={{position: 'absolute', opacity: cardIn, left: PILL_S5.cx + (centre.x - PILL_S5.cx) * merge - PILL_S5.width / 2, top: PILL_S5.cy + (centre.y - PILL_S5.cy) * merge - PILL_S5.height / 2, transform: `scale(${1 - 0.6 * merge})`}}>
                <ConsolePill />
              </div>
            </CameraRig>
          ) : null}
          {merge > 0.6 && s < ORB_AT + 0.4 ? (
            <div style={{position: 'absolute', left: 960 - 40, top: 540 - 40, width: 80, height: 80, borderRadius: 40, background: `radial-gradient(circle, ${COLORS.white} 0%, ${COLORS.white} 25%, ${alpha('#CFF5DE', 0.8)} 45%, rgba(255,255,255,0) 72%)`, opacity: kf(f, [ORB_AT - 0.12, ORB_AT, ORB_AT + 0.2], [0, 1, 0])}} />
          ) : null}
          {s >= ORB_AT ? (
            <>
              <PetalSpinner cx={orbPos.x} cy={orbPos.y} radius={150} ringRadius={94} frame={f} opacity={kf(f, [ORB_AT, ORB_AT + 0.15, 4.8, 4.9], [0, 1, 1, 0])} converge={tween(f, 4.7, 4.9)} />
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
            {t: 0.2, x: 1660, y: 1040},
            {t: 0.55, x: click.x, y: click.y},
            {t: 0.7, x: click.x, y: click.y},
            {t: 1.3, x: 1600, y: 930},
            {t: 2.1, x: 1620, y: 920},
            {t: SEND - 0.05, x: sendScreen.x + 6, y: sendScreen.y + 6},
            {t: SEND + 0.15, x: sendScreen.x + 6, y: sendScreen.y + 6},
            {t: SEND + 0.75, x: 1700, y: 1180},
          ]}
          clicks={[0.6, SEND]}
          hand={[[SEND - 0.3, SEND + 0.2]]}
          rippleColor={COLORS.inkNavy}
          opacity={tween(f, 0.2, 0.4) * (1 - tween(f, SEND + 0.3, SEND + 0.6))}
        />
      ) : null}
    </AbsoluteFill>
  );
};
