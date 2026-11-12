import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_SANS, FONT_SANS_FAMILY, alpha, kf, press, tween} from '../theme';
import {sec} from '../timeline';
import {AGENT_CHIP, AGENT_CHIP_S7, AGENT_NAME, AGENT_NODE, BUILD_DURATIONS, CAM_S8_END, PROMPT_SLIM} from '../handoff';
import {PromptBar} from '../components/PromptBar';
import {camAt, CamKeys, IDENTITY, World} from '../components/Stage';
import {AgentChip, agentChipHome} from '../components/Agent';
import {AgentAvatar} from '../components/Logo';
import {CheckStroke} from '../components/Chip';
import {Cursor} from '../components/Cursor';
import {StrokeLine} from '../components/StrokeLine';
import {measureText} from '../components/measure';
import {
  IconBolt,
  IconCameraSquare,
  IconChatPhone,
  IconHash,
  IconPhone,
  IconPlane,
  IconWave,
  IconWebChat,
} from '../components/Icons';
import {Dissolve, Scene07Bg, Scene08Bg} from './backgrounds';

/** SCENE 8 (6 s) "Publish everywhere". */
const END = 5.98; // last frame of the scene, in seconds
export const S8_CAM: CamKeys = {
  t: [0, 3.2, 5.6, END],
  x: [960, 960, 960, CAM_S8_END.x],
  y: [540, 540, 525, CAM_S8_END.y],
  s: [1, 1, 1.04, CAM_S8_END.scale],
};

// Channel tiles (generic glyphs; real icons will be swapped in later)
const CHANNELS = [
  {name: 'Web Chat', Icon: IconWebChat},
  {name: 'WhatsApp', Icon: IconChatPhone},
  {name: 'Messenger', Icon: IconBolt},
  {name: 'Instagram', Icon: IconCameraSquare},
  {name: 'Voice', Icon: IconWave},
  {name: 'Mobile App', Icon: IconPhone},
  {name: 'Slack', Icon: IconHash},
  {name: 'Telegram', Icon: IconPlane},
];
const NODE = {cx: 960, cy: 410, width: 540, height: 400};
const NAME_Y = 456;
const BUTTON = {cx: 960, cy: 548, width: 300, height: 84};
const ARC = {cx: 960, cy: 410, rx: 770, ry: 430};
const TILE = 128;
const CLICK = 2.7;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const tilePos = (i: number) => {
  const th = ((180 - (i * 180) / (CHANNELS.length - 1)) * Math.PI) / 180;
  return {x: ARC.cx + ARC.rx * Math.cos(th), y: ARC.cy + ARC.ry * Math.sin(th)};
};

export const Scene08: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = f / fps;
  const cam = camAt(f, S8_CAM);
  const prevEnd = BUILD_DURATIONS.scene07 - 1;

  // ---- chip (left) -> agent node (centre) -----------------------------------
  const m = tween(f, 0, 0.8);
  const home = agentChipHome();
  const s7 = AGENT_CHIP_S7.scale;
  const av0 = {x: AGENT_CHIP_S7.cx + (AGENT_CHIP.left + AGENT_CHIP.pad + AGENT_CHIP.avatar / 2 - home.cx) * s7, y: AGENT_CHIP_S7.cy};
  const avSize = lerp(AGENT_CHIP.avatar * s7, AGENT_NODE.avatarSize, m);
  const av = {x: lerp(av0.x, AGENT_NODE.avatarCx, m), y: lerp(av0.y, AGENT_NODE.avatarCy, m)};
  const nameFont = 40;
  const nameW = measureText(AGENT_NAME, `600 ${nameFont}px "${FONT_SANS_FAMILY}"`, nameFont * 0.55);
  const name0 = {x: AGENT_CHIP_S7.cx + (AGENT_CHIP.left + AGENT_CHIP.pad + AGENT_CHIP.avatar + AGENT_CHIP.gap - home.cx) * s7, y: AGENT_CHIP_S7.cy};
  const name = {x: lerp(name0.x, NODE.cx - nameW / 2, m), y: lerp(name0.y, NAME_Y, m)};
  const nameScale = lerp((AGENT_CHIP.fontSize * s7) / nameFont, 1, m);
  const node = tween(f, 0.25, 0.8);

  // ---- publish ----------------------------------------------------------------
  const button = tween(f, 1.3, 1.6);
  const published = tween(f, CLICK + 0.1, CLICK + 0.3);
  const check = tween(f, CLICK + 0.2, CLICK + 0.45);
  const inward = tween(f, 5.6, END) * 0.12;

  return (
    <AbsoluteFill>
      <Dissolve
        from={<Scene07Bg seconds={prevEnd / fps} cam={IDENTITY} />}
        to={<Scene08Bg seconds={seconds} cam={cam} />}
        progress={tween(f, 0, 0.6)}
      />

      <World cam={cam}>
        {/* lines from the agent out to each channel */}
        {CHANNELS.map((c, i) => {
          const t = 0.7 + i * 0.08;
          const p = tilePos(i);
          const q = {x: lerp(p.x, ARC.cx, inward), y: lerp(p.y, ARC.cy, inward)};
          return (
            <StrokeLine
              key={c.name}
              curve={[{x: ARC.cx, y: ARC.cy}, {x: ARC.cx, y: ARC.cy}, q, q]}
              draw={tween(f, t, t + 0.35)}
              color={alpha(COLORS.ink, 0.3)}
              width={2.2}
            />
          );
        })}

        {/* the agent node */}
        <div
          style={{
            position: 'absolute',
            left: NODE.cx - NODE.width / 2,
            top: NODE.cy - NODE.height / 2,
            width: NODE.width,
            height: NODE.height,
            borderRadius: 40,
            background: COLORS.white,
            boxShadow: '0 50px 120px rgba(11,13,12,0.16)',
            opacity: node,
            transform: `scale(${0.92 + 0.08 * node})`,
          }}
        />
        {/* chip body fades as it hands over to the node */}
        {m < 1 ? (
          <AgentChip cx={AGENT_CHIP_S7.cx} cy={AGENT_CHIP_S7.cy} scale={s7} avatar={0} name={0} body={1 - tween(f, 0, 0.35)} />
        ) : null}
        <AgentAvatar
          size={avSize}
          ring={m > 0.5}
          style={{position: 'absolute', left: av.x - avSize / 2, top: av.y - avSize / 2}}
        />
        <div
          style={{
            position: 'absolute',
            left: name.x,
            top: name.y - nameFont * 0.7,
            height: nameFont * 1.4,
            display: 'flex',
            alignItems: 'center',
            fontFamily: FONT_SANS,
            fontWeight: 600,
            fontSize: nameFont,
            color: COLORS.ink,
            whiteSpace: 'nowrap',
            transformOrigin: '0 50%',
            transform: `scale(${nameScale})`,
          }}
        >
          {AGENT_NAME}
        </div>

        {/* Publish button */}
        <div
          style={{
            position: 'absolute',
            left: BUTTON.cx - BUTTON.width / 2,
            top: BUTTON.cy - BUTTON.height / 2,
            width: BUTTON.width,
            height: BUTTON.height,
            opacity: button,
            transform: `translateY(${(1 - button) * 16}px) scale(${press(f, CLICK)})`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: BUTTON.height / 2,
              background: COLORS.ink,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT_SANS,
              fontWeight: 600,
              fontSize: 30,
              color: COLORS.white,
            }}
          >
            <span style={{position: 'absolute', opacity: 1 - published, transform: `translateY(${-published * 14}px)`}}>Publish</span>
            <span style={{position: 'absolute', display: 'flex', alignItems: 'center', gap: 12, opacity: published, transform: `translateY(${(1 - published) * 14}px)`}}>
              <CheckStroke size={30} draw={check} color={COLORS.lime} width={3} />
              Published
            </span>
          </div>
        </div>

        {/* channel tiles */}
        {CHANNELS.map((c, i) => {
          const t = 0.7 + i * 0.08;
          const p = tilePos(i);
          const q = {x: lerp(p.x, ARC.cx, inward), y: lerp(p.y, ARC.cy, inward)};
          const appear = tween(f, t + 0.2, t + 0.55);
          const dir = {x: (p.x - ARC.cx) / ARC.rx, y: (p.y - ARC.cy) / ARC.ry};
          const flash = kf(f, [3.1 + i * 0.08, 3.22 + i * 0.08, 3.55 + i * 0.08], [0, 1, 0]);
          return (
            <div
              key={c.name}
              style={{
                position: 'absolute',
                left: q.x - TILE / 2,
                top: q.y - TILE / 2,
                width: TILE,
                opacity: appear,
                transform: `translate(${-dir.x * 20 * (1 - appear)}px, ${-dir.y * 20 * (1 - appear)}px) scale(${0.9 + 0.1 * appear})`,
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: TILE,
                  height: TILE,
                  borderRadius: 34,
                  background: COLORS.white,
                  boxShadow: '0 22px 50px rgba(11,13,12,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: COLORS.ink,
                  overflow: 'hidden',
                }}
              >
                <div style={{position: 'absolute', inset: 0, background: COLORS.lime, opacity: flash}} />
                <c.Icon size={56} stroke={1.7} style={{position: 'relative'}} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: -60,
                  width: TILE + 120,
                  top: TILE + 14,
                  textAlign: 'center',
                  fontFamily: FONT_SANS,
                  fontWeight: 600,
                  fontSize: 22,
                  color: COLORS.ink,
                  whiteSpace: 'nowrap',
                  opacity: 1 - tween(f, 5.55, 5.85),
                }}
              >
                {c.name}
              </div>
            </div>
          );
        })}

        <Cursor
          frame={f}
          from={{x: 1900, y: 1090}}
          to={{x: BUTTON.cx + 34, y: BUTTON.cy + 8}}
          moveStart={sec(2.0)}
          moveEnd={sec(2.65)}
          clickAt={sec(CLICK)}
          opacity={1 - tween(f, 3.3, 3.6)}
        />
      </World>

      {/* the prompt bar bows out */}
      <PromptBar
        state={{cx: PROMPT_SLIM.cx, cy: PROMPT_SLIM.cy, scale: PROMPT_SLIM.scale, opacity: 1 - tween(f, 0, 0.4), dy: -20 * tween(f, 0, 0.4)}}
        frame={f}
        typingUntil={sec(9)}
      />
    </AbsoluteFill>
  );
};
