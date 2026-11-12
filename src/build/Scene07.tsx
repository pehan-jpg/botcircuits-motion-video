import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_SANS, alpha, kf, tween} from '../theme';
import {sec} from '../timeline';
import {AGENT_CHIP_S7, BUILD_DURATIONS, PAGE_S6_END, PAGE_S7_CARD, PROMPT_SLIM} from '../handoff';
import {PromptBar} from '../components/PromptBar';
import {camAt, CamKeys, IDENTITY, World} from '../components/Stage';
import {typingEnd} from '../components/TypingText';
import {AgentChip, agentChipHome, agentChipWidth} from '../components/Agent';
import {StatusChip} from '../components/Chip';
import {StrokeLine, sCurve} from '../components/StrokeLine';
import {IconBank, IconBook, IconCard, IconDatabase, IconPayments, IconUsers} from '../components/Icons';
import {ProcedurePage} from '../components/procedure/ProcedurePage';
import {Dissolve, Scene06Bg, Scene07Bg} from './backgrounds';
import {pageWrap, procedureAnim} from './Scene06';

/** SCENE 7 (6 s) "Connect your systems". */
export const S7_PROMPT = 'Connect the card system, customer database and knowledge base.';
export const S7_CAM: CamKeys = {
  t: [0, 1.8, 3.4, 4.6, 5.6],
  x: [960, 960, 1100, 1100, 960],
  y: [540, 540, 470, 470, 540],
  s: [1, 1, 1.1, 1.1, 1],
  r: {t: [0, 1.2, 4.8], v: [0, 1.5, 0]},
};

const SYSTEMS = [
  {name: 'Card system', Icon: IconCard},
  {name: 'Customer database', Icon: IconDatabase},
  {name: 'Knowledge base', Icon: IconBook},
  {name: 'Core banking', Icon: IconBank},
  {name: 'CRM', Icon: IconUsers},
  {name: 'Payments', Icon: IconPayments},
];
const ROWS = {x: 1020, width: 760, height: 100, firstCy: 300, step: 124, drift: 34};
const ROW_IN = 1.8;
const FLIP0 = 2.3;
const FLIP_GAP = 0.13;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const Scene07: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = f / fps;
  const cam = camAt(f, S7_CAM);
  const prevEnd = BUILD_DURATIONS.scene06 - 1;

  // procedure page -> card on the left; agent chip -> left column
  const shrink = tween(f, 0, 0.7);
  const home = agentChipHome();
  const chip = {
    cx: lerp(home.cx, AGENT_CHIP_S7.cx, shrink),
    cy: lerp(home.cy, AGENT_CHIP_S7.cy, shrink),
    scale: lerp(1, AGENT_CHIP_S7.scale, shrink),
  };
  const chipRight = AGENT_CHIP_S7.cx + (agentChipWidth() / 2) * AGENT_CHIP_S7.scale;
  const out = 1 - tween(f, 5.4, 5.98);

  const typeStart = sec(0.3);
  const typedUntil = typingEnd(typeStart, S7_PROMPT.length, 1.2);
  const enter = kf(f, [1.65, 1.73, 1.85], [0, 1, 0]);
  const drift = ROWS.drift * Math.max(0, seconds - ROW_IN);

  return (
    <AbsoluteFill>
      <Dissolve
        from={<Scene06Bg seconds={prevEnd / fps} cam={IDENTITY} />}
        to={<Scene07Bg seconds={seconds} cam={cam} />}
        progress={tween(f, 0, 0.5)}
      />

      <World cam={cam}>
        {/* procedure as a card */}
        <div
          style={{
            ...pageWrap(
              lerp(PAGE_S6_END.cx, PAGE_S7_CARD.cx, shrink),
              lerp(PAGE_S6_END.cy, PAGE_S7_CARD.cy, shrink),
              lerp(PAGE_S6_END.scale, PAGE_S7_CARD.scale, shrink),
            ),
            opacity: lerp(PAGE_S6_END.opacity, 1, shrink) * out,
          }}
        >
          <ProcedurePage a={procedureAnim(prevEnd)} />
        </div>

        {/* lines from connected systems to the agent */}
        {SYSTEMS.map((s, i) => {
          const t = FLIP0 + i * FLIP_GAP;
          const cy = ROWS.firstCy + i * ROWS.step - drift;
          return (
            <div key={s.name} style={{opacity: out}}>
              <StrokeLine
                curve={sCurve({x: ROWS.x - 8, y: cy}, {x: chipRight + 6, y: AGENT_CHIP_S7.cy}, 'h', 0.55)}
                draw={tween(f, t + 0.05, t + 0.45)}
                dot={kf(f, [t + 0.45, t + 0.95], [0, 1])}
                dotOpacity={kf(f, [t + 0.45, t + 0.5, t + 0.9, t + 0.98], [0, 1, 1, 0])}
                color={alpha(COLORS.ink, 0.28)}
                dotColor={COLORS.lime}
                width={2}
                dotSize={14}
              />
            </div>
          );
        })}

        {/* system rows, drifting upward */}
        {SYSTEMS.map((s, i) => {
          const t = FLIP0 + i * FLIP_GAP;
          const inP = tween(f, ROW_IN + i * 0.08, ROW_IN + i * 0.08 + 0.35);
          const cy = ROWS.firstCy + i * ROWS.step - drift;
          return (
            <div
              key={s.name}
              style={{
                position: 'absolute',
                left: ROWS.x,
                top: cy - ROWS.height / 2,
                width: ROWS.width,
                height: ROWS.height,
                borderRadius: ROWS.height / 2,
                background: COLORS.white,
                border: `1px solid ${COLORS.line}`,
                boxShadow: '0 18px 44px rgba(11,13,12,0.07)',
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                paddingLeft: 20,
                paddingRight: 24,
                boxSizing: 'border-box',
                opacity: inP * out,
                transform: `translateY(${(1 - inP) * 24}px)`,
              }}
            >
              <div style={{width: 60, height: 60, borderRadius: 30, background: COLORS.tagGrey, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.ink}}>
                <s.Icon size={30} stroke={1.9} />
              </div>
              <div style={{flex: 1, fontFamily: FONT_SANS, fontWeight: 600, fontSize: 28, color: COLORS.ink, whiteSpace: 'nowrap'}}>{s.name}</div>
              <StatusChip pending="Connecting" done="Connected" flip={tween(f, t, t + 0.2)} check={tween(f, t + 0.1, t + 0.35)} frame={f} fontSize={21} />
            </div>
          );
        })}

        <AgentChip cx={chip.cx} cy={chip.cy} scale={chip.scale} glow={kf(f, [2.8, 3.1, 3.7], [0, 1, 0])} />
      </World>

      <PromptBar
        state={{cx: PROMPT_SLIM.cx, cy: PROMPT_SLIM.cy, scale: PROMPT_SLIM.scale, opacity: 1}}
        frame={f}
        text={S7_PROMPT}
        typeStart={typeStart}
        perChar={1.2}
        typingUntil={typedUntil}
        enterPress={enter}
        textOpacity={1 - tween(f, 1.9, 2.1)}
      />
    </AbsoluteFill>
  );
};
