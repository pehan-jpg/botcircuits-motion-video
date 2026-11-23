import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Card} from '../../components/Card';
import {CHANNEL_ROW, ChannelRow} from '../../components/ChannelRow';
import {ConnectionLine, Point, curvePath, fanCurve} from '../../components/ConnectionLine';
import {ContextBar} from '../../components/ContextBar';
import {InstagramMock} from '../../components/InstagramMock';
import {Exchange, typedEnd} from '../../components/MockShared';
import {Orb} from '../../components/Orb';
import {PublishButton} from '../../components/PublishButton';
import {StatusPill} from '../../components/StatusPill';
import {Rect, Veil} from '../../components/Veil';
import {VoiceMock} from '../../components/VoiceMock';
import {WhatsAppMock} from '../../components/WhatsAppMock';
import {HEIGHT, WIDTH} from '../../config';
import {mix, progress} from '../../motion';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {AGENT_NAME, CHANNELS, CUSTOMER, MOCK_ROWS, STORY, liveText} from './content';
import {PUBLISH_TIMELINE as T} from './timeline';

/* ------------------------------------------------------------------ */
/* Layout: part 1                                                      */
/* ------------------------------------------------------------------ */

const AGENT = {width: 400, pad: 32, orb: 64, orbGap: 20, buttonGap: 24, button: 44};
const AGENT_HEIGHT = AGENT.pad * 2 + AGENT.orb + AGENT.buttonGap + AGENT.button;
const ROW = {width: 520, height: CHANNEL_ROW.height, gap: 10};
const LINE_SPACE = 180;

const part1Width = AGENT.width + LINE_SPACE + ROW.width;
const AGENT_X = (WIDTH - part1Width) / 2;
const AGENT_Y = (HEIGHT - AGENT_HEIGHT) / 2;
const ROWS_X = AGENT_X + AGENT.width + LINE_SPACE;
const rowsHeight = CHANNELS.length * ROW.height + (CHANNELS.length - 1) * ROW.gap; // 646
const ROWS_Y = (HEIGHT - rowsHeight) / 2;

const rowRect = (i: number): Rect => ({
  x: ROWS_X,
  y: ROWS_Y + i * (ROW.height + ROW.gap),
  width: ROW.width,
  height: ROW.height,
  radius: CHANNEL_ROW.radius,
});

const AGENT_EDGE: Point = {x: AGENT_X + AGENT.width, y: AGENT_Y + AGENT_HEIGHT / 2};
const LIVE_CHANNELS = CHANNELS.map((c, i) => ({...c, i})).filter((c) => c.live);
const ROW_CURVES = LIVE_CHANNELS.map(({i}) =>
  fanCurve(AGENT_EDGE, {x: ROWS_X, y: rowRect(i).y + ROW.height / 2}),
);

const PART1_BOUNDS: Rect = {x: AGENT_X, y: ROWS_Y, width: part1Width, height: rowsHeight, radius: 20};

/* ------------------------------------------------------------------ */
/* Layout: part 2                                                      */
/* ------------------------------------------------------------------ */

const MOCK = {width: 440, height: 640, gap: 60, top: 90};
const mocksWidth = MOCK.width * 3 + MOCK.gap * 2;
const MOCK_X = (WIDTH - mocksWidth) / 2;
const mockRect = (k: number): Rect => ({
  x: MOCK_X + k * (MOCK.width + MOCK.gap),
  y: MOCK.top,
  width: MOCK.width,
  height: MOCK.height,
  radius: CHANNEL_ROW.cardRadius,
});
const PART2_BOUNDS: Rect = {x: MOCK_X, y: MOCK.top, width: mocksWidth, height: MOCK.height, radius: 20};

const BAR = {width: 760, height: 52, centreY: 40};
const BAR_X = (WIDTH - BAR.width) / 2;
const BAR_Y = BAR.centreY - BAR.height / 2;

/** Lines from the context bar down to the top centre of each card. */
const BAR_CURVES: [Point, Point, Point, Point][] = [0, 1, 2].map((k) => {
  const card = mockRect(k);
  const end = {x: card.x + card.width / 2, y: MOCK.top};
  if (k === 1) {
    const start = {x: WIDTH / 2, y: BAR_Y + BAR.height};
    return [start, {x: start.x, y: start.y + 8}, {x: end.x, y: end.y - 8}, end];
  }
  // Leave the bar from its rounded end and turn down into the card.
  const left = k === 0;
  const start = {x: left ? BAR_X : BAR_X + BAR.width, y: BAR.centreY};
  const dir = left ? -1 : 1;
  return [start, {x: start.x + dir * 70, y: start.y}, {x: end.x, y: start.y + 12}, end];
});

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Eased keyframes: value at `frame` from [frame, value] pairs. */
const keyframes = (frame: number, keys: [number, number][]): number => {
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, v1] = keys[i];
    const [f0, v0] = keys[i - 1];
    if (frame <= f1) return mix(v0, v1, progress(frame, f0, f1));
  }
  return keys[keys.length - 1][1];
};

const LiveDot: React.FC = () => (
  <div style={{width: 6, height: 6, borderRadius: '50%', background: colors.lime, flexShrink: 0}} />
);

const Status: React.FC<{live: number}> = ({live}) => (
  <StatusPill
    connect={1 - live}
    spinner={0}
    connected={live}
    tick={0}
    connectLabel="Not live"
    connectedLabel="Live"
    connectedIcon={<LiveDot />}
  />
);

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export const Publish: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const f = (s: number) => s * fps;
  const p = (a: number, b: number) => progress(frame, f(a), f(b));

  /* Part 1 */
  const agentIn = p(T.agentIn.start, T.agentIn.end);
  const rowsIn = CHANNELS.map((_, i) => {
    const s = T.rowsIn.start + i * T.rowsIn.stagger;
    return p(s, s + T.rowsIn.duration);
  });
  const P = T.publish;
  const press = p(P.press, P.press + P.pressDuration);
  const doneStart = P.press + P.pressDuration;
  const published = p(doneStart, doneStart + P.doneDuration);
  const publishTick = p(doneStart + 0.05, doneStart + P.doneDuration + 0.15);

  const liveStart = (k: number) => T.live.start + k * T.live.stagger;
  const lineDraw = LIVE_CHANNELS.map((_, k) => p(liveStart(k), liveStart(k) + T.live.line));
  const livePill = LIVE_CHANNELS.map((_, k) => {
    const s = liveStart(k) + T.live.line;
    return p(s, s + T.live.pill);
  });
  const countSteps = LIVE_CHANNELS.map((_, k) => {
    const s = liveStart(k) + T.live.line;
    return p(s, s + T.live.counterFade);
  });
  const liveOf = (i: number) => {
    const k = LIVE_CHANNELS.findIndex((c) => c.i === i);
    return k < 0 ? 0 : livePill[k];
  };

  /* Transition */
  const X = T.transition;
  const outgoing = p(X.start, X.start + X.outgoing);
  const outStyle: React.CSSProperties = {
    opacity: 1 - outgoing,
    transform: `translateX(${-X.drift * outgoing}px)`,
  };
  const morph = p(X.morph.start, X.morph.start + X.morph.duration);
  const morphEnd = X.morph.start + X.morph.duration;
  const body = p(morphEnd - X.body, morphEnd);

  /* Part 2 */
  const bar = p(T.contextBar.start, T.contextBar.start + T.contextBar.duration);
  const barLines = p(T.contextLines.start, T.contextLines.start + T.contextLines.duration);
  const timeLabels = p(T.timeLabels.start, T.timeLabels.start + T.timeLabels.duration);

  const exchange = (start: number, story: {customer: string; agent: string}): Exchange => {
    const customerStart = Math.round(f(start));
    const customerEnd = typedEnd(customerStart, story.customer, T.cps, fps);
    const agentAvatar = Math.round(customerEnd + f(T.pause));
    const agentStart = Math.round(agentAvatar + f(T.avatar));
    return {...story, customerStart, agentAvatar, agentStart, cps: T.cps};
  };
  const C = T.conversations;
  const exchanges = [
    exchange(C.whatsapp, STORY.whatsapp),
    exchange(C.instagram, STORY.instagram),
    exchange(C.voice, STORY.voice),
  ];

  // Lime pulse on each context line as the agent replies.
  const pulses = exchanges.map((e) => progress(frame, e.agentStart, e.agentStart + f(T.contextPulse)));

  // Voice waveform and timer.
  const V = T.voice;
  const ve = exchanges[2];
  const vCustomerEnd = typedEnd(ve.customerStart, ve.customer, T.cps, fps);
  const amplitude = keyframes(frame, [
    [f(C.voice), 0],
    [f(C.voice + V.fadeIn), V.customerLevel],
    [vCustomerEnd, V.customerLevel],
    [vCustomerEnd + f(V.quiet), V.quietLevel],
    [ve.agentStart, V.quietLevel],
    [ve.agentStart + f(V.agentRise), 1],
    [f(T.waveformOut.start), 1],
    [f(T.waveformOut.start + T.waveformOut.duration), 0],
  ]);
  const voiceWindow = Math.max(0, Math.min(1, (frame - f(C.voice)) / f(T.conversationLength)));
  const seconds = Math.floor(voiceWindow * V.timerSeconds);

  const fadeOut = progress(frame, f(T.fadeOut.start), durationInFrames - 1);

  const mockBodies = [
    <WhatsAppMock
      key="wa"
      exchange={exchanges[0]}
      timeLabel={STORY.whatsapp.time}
      timeLabelOpacity={timeLabels}
      width={MOCK.width}
      height={MOCK.height - CHANNEL_ROW.headerHeight}
      stamp={STORY.whatsapp.stamp}
    />,
    <InstagramMock
      key="ig"
      exchange={exchanges[1]}
      timeLabel={STORY.instagram.time}
      timeLabelOpacity={timeLabels}
      width={MOCK.width}
      height={MOCK.height - CHANNEL_ROW.headerHeight}
      customerInitials={CUSTOMER.initials}
    />,
    <VoiceMock
      key="vo"
      exchange={exchanges[2]}
      timeLabel={STORY.voice.time}
      timeLabelOpacity={timeLabels}
      width={MOCK.width}
      height={MOCK.height - CHANNEL_ROW.headerHeight}
      name={AGENT_NAME}
      seconds={seconds}
      amplitude={amplitude}
    />,
  ];

  return (
    <AbsoluteFill style={{background: colors.background, fontFamily}}>
      <AbsoluteFill style={{opacity: 1 - fadeOut}}>
        {/* Part 1 lines, agent card and the rows that leave */}
        {outgoing < 1 && (
          <AbsoluteFill style={outStyle}>
            <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0}}>
              {ROW_CURVES.map((curve, k) => (
                <ConnectionLine key={k} curve={curve} draw={lineDraw[k]} />
              ))}
            </svg>
            <AgentCard
              frame={frame}
              enter={agentIn}
              press={press}
              published={published}
              tick={publishTick}
              countSteps={countSteps}
            />
            {CHANNELS.map((c, i) =>
              (MOCK_ROWS as readonly number[]).includes(i) ? null : (
                <ChannelRow
                  key={c.name}
                  kind={c.kind}
                  name={c.name}
                  detail={c.detail}
                  dashed={!c.live}
                  status={c.live ? <Status live={liveOf(i)} /> : undefined}
                  from={rowRect(i)}
                  style={{opacity: rowsIn[i], transform: `translateY(${mix(12, 0, rowsIn[i])}px)`}}
                />
              ),
            )}
          </AbsoluteFill>
        )}

        <Veil start={f(X.start)} end={f(X.start + X.veil)} from={PART1_BOUNDS} to={PART2_BOUNDS} peak={X.veilPeak} />

        {/* Context bar lines sit under the cards so they tuck under the top edge. */}
        <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0}}>
          {BAR_CURVES.map((curve, k) => (
            <ConnectionLine key={k} curve={curve} draw={barLines} />
          ))}
          {BAR_CURVES.map((curve, k) => {
            const t = pulses[k];
            if (t <= 0 || t >= 1) return null;
            const seg = 0.45;
            return (
              <path
                key={`pulse${k}`}
                d={curvePath(curve)}
                fill="none"
                stroke={colors.lime}
                strokeWidth={2.5}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={`${seg} 2`}
                strokeDashoffset={mix(seg, -1, t)}
                opacity={Math.sin(Math.PI * t)}
              />
            );
          })}
        </svg>

        {/* The three rows that become the mockup cards */}
        {MOCK_ROWS.map((i, k) => {
          const c = CHANNELS[i];
          return (
            <ChannelRow
              key={c.name}
              kind={c.kind}
              name={c.name}
              status={<Status live={liveOf(i)} />}
              from={rowRect(i)}
              to={mockRect(k)}
              morph={morph}
              body={mockBodies[k]}
              bodyOpacity={body}
              style={{opacity: rowsIn[i], transform: `translateY(${mix(12, 0, rowsIn[i])}px)`}}
            />
          );
        })}

        {bar > 0 && (
          <div
            style={{
              position: 'absolute',
              left: BAR_X,
              top: BAR_Y,
              opacity: bar,
              transform: `translateY(${mix(-T.contextBar.drop, 0, bar)}px)`,
            }}
          >
            <ContextBar
              width={BAR.width}
              height={BAR.height}
              initials={CUSTOMER.initials}
              name={CUSTOMER.name}
              detail={CUSTOMER.booking}
            />
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Agent card                                                          */
/* ------------------------------------------------------------------ */

const AgentCard: React.FC<{
  frame: number;
  enter: number;
  press: number;
  published: number;
  tick: number;
  countSteps: number[];
}> = ({enter, press, published, tick, countSteps}) => {
  const layerOpacity = (n: number) => {
    const inn = n === 0 ? 1 : countSteps[n - 1];
    const out = n < countSteps.length ? countSteps[n] : 0;
    return inn * (1 - out);
  };
  return (
    <div
      style={{
        position: 'absolute',
        left: AGENT_X,
        top: AGENT_Y,
        opacity: enter,
        transform: `translateY(${mix(12, 0, enter)}px)`,
      }}
    >
      <Card width={AGENT.width} height={AGENT_HEIGHT} padding={AGENT.pad}>
        <div style={{display: 'flex', alignItems: 'center', gap: AGENT.orbGap, height: AGENT.orb}}>
          <Orb size={AGENT.orb} />
          <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            <div
              style={{
                fontSize: 24,
                fontWeight: fontWeights.semibold,
                color: colors.text,
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              {AGENT_NAME}
            </div>
            <div
              style={{
                position: 'relative',
                height: 22,
                fontSize: 16,
                fontWeight: fontWeights.regular,
                color: colors.textSecondary,
                lineHeight: 1.4,
                whiteSpace: 'nowrap',
              }}
            >
              {Array.from({length: countSteps.length + 1}, (_, n) => {
                const o = layerOpacity(n);
                return o > 0 ? (
                  <span key={n} style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
                    {liveText(n)}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
        <div style={{marginTop: AGENT.buttonGap}}>
          <PublishButton width={AGENT.width - AGENT.pad * 2} press={press} done={published} tick={tick} />
        </div>
      </Card>
    </div>
  );
};
