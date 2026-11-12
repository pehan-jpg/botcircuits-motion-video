import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {kf, tween} from '../theme';
import {sec} from '../timeline';
import {AGENT_CARD, AGENT_NAME, LOCKUP_SMALL, PROMPT_BIG, PROMPT_S4_END_SCALE, PROMPT_SLIM, BUILD_DURATIONS} from '../handoff';
import {Lockup} from '../components/Logo';
import {PromptBar} from '../components/PromptBar';
import {camAt, CamKeys, World} from '../components/Stage';
import {typedCount, typingEnd} from '../components/TypingText';
import {AgentCardAvatar, AgentCardBody, AgentCardTitle} from '../components/Agent';
import {Dissolve, Scene04Bg, Scene05Bg} from './backgrounds';
import {S4_CAM} from './Scene04';

/** SCENE 5 (8 s) "Describe the agent". */
export const S5_PROMPT = 'Build a customer service agent that can handle card related requests.';
export const S5_CAM: CamKeys = {t: [0, 3.6, 6, 7.98], x: [960, 960, 960, 1030], y: [540, 540, 520, 520], s: [1, 1, 1.2, 1.2]};

const TYPE_START = sec(0.3);
const PER_CHAR = 2;

export const ParkedLockup: React.FC<{opacity?: number}> = ({opacity = 1}) => (
  <div style={{position: 'absolute', left: LOCKUP_SMALL.left, top: LOCKUP_SMALL.top, opacity}}>
    <Lockup markHeight={LOCKUP_SMALL.markH} />
  </div>
);

/** Agent card animation state (shared with scene 6's first frame). */
export const agentCardState = (f: number) => ({
  rise: tween(f, 3.4, 4.0),
  avatar: tween(f, 3.7, 4.0),
  titleTyped: typedCount(f, sec(3.9), AGENT_NAME.length, 2, 'agent-name'),
  chipIn: tween(f, 4.2, 4.45),
  flip: tween(f, 5.6, 5.85),
  check: tween(f, 5.75, 6.05),
  shine: tween(f, 5.9, 6.6),
});

export const Scene05: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = f / fps;
  const cam = camAt(f, S5_CAM);
  const prevEnd = BUILD_DURATIONS.scene04 - 1;

  const typedUntil = typingEnd(TYPE_START, S5_PROMPT.length, PER_CHAR);
  const enter = kf(f, [2.85, 2.93, 3.05], [0, 1, 0]);
  const up = tween(f, 3.0, 3.8);
  const c = agentCardState(f);
  const name = AGENT_NAME.slice(0, c.titleTyped);

  return (
    <AbsoluteFill>
      <Dissolve
        from={<Scene04Bg seconds={prevEnd / fps} cam={camAt(prevEnd, S4_CAM)} wash={1} />}
        to={<Scene05Bg seconds={seconds} cam={cam} />}
        progress={tween(f, 0, 0.5)}
      />

      <World cam={cam}>
        <div
          style={{
            position: 'absolute',
            left: AGENT_CARD.left,
            top: AGENT_CARD.top,
            opacity: c.rise,
            transform: `translateY(${(1 - c.rise) * 24}px)`,
          }}
        >
          <AgentCardBody frame={f} flip={c.flip} check={c.check} shine={c.shine} chipIn={c.chipIn}>
            <AgentCardAvatar pop={c.avatar} />
            <AgentCardTitle text={name} />
          </AgentCardBody>
        </div>
      </World>

      <ParkedLockup />
      <PromptBar
        state={{
          cx: PROMPT_BIG.cx,
          cy: PROMPT_BIG.cy + (PROMPT_SLIM.cy - PROMPT_BIG.cy) * up,
          scale: PROMPT_S4_END_SCALE + (PROMPT_SLIM.scale - PROMPT_S4_END_SCALE) * up,
          opacity: 1,
        }}
        frame={f}
        text={S5_PROMPT}
        typeStart={TYPE_START}
        perChar={PER_CHAR}
        typingUntil={typedUntil}
        enterPress={enter}
        textOpacity={1 - tween(f, 3.0, 3.2)}
      />
    </AbsoluteFill>
  );
};
