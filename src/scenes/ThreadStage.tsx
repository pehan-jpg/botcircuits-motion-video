import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COLORS, FONT_SANS, ease} from '../theme';
import {BEATS} from '../timeline';
import {cameraTransform, getCamera} from '../camera';
import {
  BUBBLE,
  BUBBLE_X,
  COMPOSER_OFFSET,
  FOLLOW_UP_Y,
  GAP_BASE,
  GAP_MAX,
  GAP_START,
  PILL,
  ROW_A_Y,
  ROW_B_Y,
  ROW_STEP,
  STACK_CENTER,
} from '../layout';
import {ChatWindow} from '../components/ChatWindow';
import {Bubble, BubbleMeta, bubbleWidth} from '../components/Bubble';

export const MAYA_FIRST = 'Hi, I lost my credit card. Can you block it?';
export const AGENT_REPLY = 'Hi, let me check this for you.';
export const FOLLOW_UPS = [
  {text: 'Hello?', time: '10:05 AM'},
  {text: 'Is anyone there? This is urgent.', time: '10:40 AM'},
  {text: 'I need this card blocked now.', time: '11:20 AM'},
] as const;

/**
 * The persistent conversation layer. Rendered ONCE for the whole problem
 * sequence (outside the TransitionSeries), so the window, Maya's first bubble
 * and every other element are the same React instances in scenes 1, 2 and 3.
 * All timing is in absolute frames (see BEATS in src/timeline.ts).
 */
export const ThreadStage: React.FC = () => {
  const f = useCurrentFrame();
  const cam = getCamera(f);

  // ---- window & chrome ------------------------------------------------------
  const enter = ease(f, [BEATS.windowIn, BEATS.windowIn + 14], [0, 1]);
  const ui = 1 - ease(f, [BEATS.compress, BEATS.compress + 20], [0, 1]);
  const agentPresence = ease(f, [120, 132], [0, 1]);
  const away = ease(f, [BEATS.away, BEATS.away + 16], [0, 1]);
  const agentDim = ease(f, [270, 290], [0, 1]);

  // ---- the silence: gap widens, rows push the composer down ------------------
  const gap = ease(f, [BEATS.silence, 270], [GAP_BASE, GAP_MAX]);
  const revealed = BEATS.followUps.reduce((acc, t) => acc + ease(f, [t, t + 10], [0, 1]), 0);
  const composerY = GAP_START + gap + revealed * ROW_STEP + COMPOSER_OFFSET;
  const presenceLine = ease(f, [176, 190], [0, 1]);

  // ---- compression into the pill (scene 3, local 160-200) ---------------------
  const squeeze = ease(f, [BEATS.compress, BEATS.compress + 32], [0, 1]);
  const bubblesOut = ease(f, [BEATS.compress + 16, BEATS.compress + 32], [0, 1]);
  const pillIn = ease(f, [BEATS.compress + 18, BEATS.compress + 34], [0, 1]);
  const pillScale = ease(f, [BEATS.compress + 18, BEATS.compress + 38], [1.08, 1]);

  return (
    <AbsoluteFill>
      {/* world, seen through the camera */}
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 1,
            height: 1,
            transformOrigin: '0 0',
            transform: cameraTransform(cam),
          }}
        >
          <ChatWindow
            enter={enter}
            chromeOpacity={ui}
            agentPresence={agentPresence}
            away={away}
            composerY={composerY}
            presenceLine={presenceLine}
            agentDim={agentDim}
          >
            {/* Maya's first message: one instance, scenes 1-3 */}
            <Bubble
              speaker="customer"
              text={MAYA_FIRST}
              frame={f}
              enterAt={BEATS.mayaTyping}
              enterDur={6}
              morphAt={BEATS.mayaMorph}
              wordsAt={BEATS.mayaWords}
              wordStagger={2}
              avatar={{initials: 'M'}}
              y={ROW_A_Y}
              opacity={ui}
            />
            <BubbleMeta
              y={ROW_A_Y}
              time="9:02 AM"
              timeIn={ease(f, [BEATS.mayaTime, BEATS.mayaTime + 8], [0, 1])}
              statusIn={ease(f, [BEATS.mayaDelivered, BEATS.mayaDelivered + 6], [0, 1])}
              seen={ease(f, [BEATS.seen, BEATS.seen + 8], [0, 1])}
              check1={ease(f, [BEATS.mayaCheck, BEATS.mayaCheck + 10], [0, 1])}
              check2={ease(f, [BEATS.seen + 6, BEATS.seen + 16], [0, 1])}
              opacity={ui}
            />

            {/* the single agent reply */}
            <Bubble
              speaker="agent"
              text={AGENT_REPLY}
              frame={f}
              enterAt={BEATS.agentTyping}
              enterDur={6}
              morphAt={BEATS.agentMorph}
              wordsAt={BEATS.agentWords}
              wordStagger={2}
              avatar={{initials: 'SA', dim: agentDim}}
              y={ROW_B_Y}
              opacity={ui}
            />
            <BubbleMeta
              y={ROW_B_Y}
              time="9:03 AM"
              timeIn={ease(f, [150, 158], [0, 1])}
              statusIn={0}
              seen={0}
              check1={0}
              check2={0}
              showStatus={false}
              opacity={ui}
            />

            {/* follow-ups: pop in, then compress toward the stack centre */}
            {FOLLOW_UPS.map((m, i) => {
              const t = BEATS.followUps[i];
              const y = FOLLOW_UP_Y[i];
              const w = bubbleWidth(m.text);
              const cx = BUBBLE_X + w / 2;
              const cy = y + BUBBLE.height / 2;
              const dx = (STACK_CENTER.x - cx) * squeeze;
              const dy = (STACK_CENTER.y - cy) * squeeze;
              const sc = 1 - 0.45 * squeeze;
              return (
                <React.Fragment key={m.text}>
                  <Bubble
                    speaker="customer"
                    text={m.text}
                    frame={f}
                    enterAt={t}
                    pop
                    wordsAt={t}
                    wordStagger={0}
                    avatar={{initials: 'M', opacity: ui}}
                    y={y}
                    origin={`${BUBBLE_X - 60 + w / 2}px ${BUBBLE.height / 2}px`}
                    extraTransform={`translate(${dx}px, ${dy}px) scale(${sc})`}
                    opacity={1 - bubblesOut}
                  />
                  <BubbleMeta
                    y={y}
                    time={m.time}
                    timeIn={ease(f, [t + 8, t + 14], [0, 1])}
                    statusIn={ease(f, [t + 12, t + 18], [0, 1])}
                    seen={1}
                    check1={ease(f, [t + 14, t + 24], [0, 1])}
                    check2={ease(f, [t + 18, t + 28], [0, 1])}
                    opacity={ui}
                  />
                </React.Fragment>
              );
            })}
          </ChatWindow>
        </div>
      </AbsoluteFill>

      {/* hand-off pill (screen space, exact coordinates exported in layout.ts) */}
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
          opacity: pillIn,
          transform: `scale(${pillScale})`,
        }}
      >
        {PILL.text}
      </div>
    </AbsoluteFill>
  );
};
