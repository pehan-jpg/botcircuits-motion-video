import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Card} from '../../components/Card';
import {Chip} from '../../components/Chip';
import {ConnectionLine, fanCurve, Point, pointAlong} from '../../components/ConnectionLine';
import {WrenchIcon} from '../../components/Icons';
import {Orb} from '../../components/Orb';
import {Pulse} from '../../components/Pulse';
import {SYSTEM_TILE, SystemTile} from '../../components/SystemTile';
import {HEIGHT, WIDTH} from '../../config';
import {mix, progress} from '../../motion';
import {colors, fontFamily, fontWeights, tagColours} from '../../tokens';
import {ACTIONS, AGENT_NAME, SYSTEMS, counterText} from './content';
import {INTEGRATE_TIMELINE as T} from './timeline';

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

const AGENT = {width: 420, pad: 32, orb: 64, orbGap: 20};
const AGENT_HEIGHT = AGENT.pad * 2 + AGENT.orb;
const LINE_SPACE = 220;
const TILE_GAP = 20;
const CHIP = {gap: 24, height: 32};

const totalWidth = AGENT.width + LINE_SPACE + SYSTEM_TILE.width;
const AGENT_X = (WIDTH - totalWidth) / 2;
const AGENT_Y = (HEIGHT - AGENT_HEIGHT) / 2;
const TILES_X = AGENT_X + AGENT.width + LINE_SPACE;
const tilesHeight = SYSTEMS.length * SYSTEM_TILE.height + (SYSTEMS.length - 1) * TILE_GAP;
const TILES_Y = (HEIGHT - tilesHeight) / 2;
const tileY = (i: number) => TILES_Y + i * (SYSTEM_TILE.height + TILE_GAP);

/** Lines start on the card's right edge midpoint and end on each tile's left edge midpoint. */
const LINE_FROM: Point = {x: AGENT_X + AGENT.width, y: AGENT_Y + AGENT_HEIGHT / 2};
const CURVES = SYSTEMS.map((_, i) =>
  fanCurve(LINE_FROM, {x: TILES_X, y: tileY(i) + SYSTEM_TILE.height / 2}),
);

/* ------------------------------------------------------------------ */
/* Frame derived state                                                 */
/* ------------------------------------------------------------------ */

type TileState = {
  enter: number;
  line: number;
  connect: number;
  spinner: number;
  connected: number;
  tick: number;
};

const tileState = (frame: number, fps: number, i: number): TileState => {
  const f = (s: number) => s * fps;
  const C = T.connect;
  const inStart = T.tilesIn.start + i * T.tilesIn.stagger;
  const c0 = C.start + i * C.stagger;
  const spinStart = c0 + C.line;
  const doneStart = spinStart + C.spinner;
  const doneEnd = doneStart + C.connected;
  // Connect pill hands over to the spinner over a short crossfade.
  const toSpinner = progress(frame, f(spinStart), f(spinStart + 0.08));
  const toConnected = progress(frame, f(doneStart), f(doneEnd));
  return {
    enter: progress(frame, f(inStart), f(inStart + T.tilesIn.duration)),
    line: progress(frame, f(c0), f(spinStart)),
    connect: 1 - toSpinner,
    spinner: toSpinner * (1 - toConnected),
    connected: toConnected,
    tick: progress(frame, f(doneStart + 0.05), f(doneEnd + 0.15)),
  };
};

/** Seconds at which tile `i` counts as connected (counter crossfade start). */
const connectedAt = (i: number) =>
  T.connect.start + i * T.connect.stagger + T.connect.line + T.connect.spinner;

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export const Integrate: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const f = (s: number) => s * fps;

  const fadeOut = progress(frame, f(T.fadeOut.start), durationInFrames - 1);
  const tiles = SYSTEMS.map((_, i) => tileState(frame, fps, i));

  // Per action: chip visibility, pulse position and tile result.
  const actions = [T.action1, T.action2].map((A, k) => {
    const chip =
      progress(frame, f(A.chipIn.start), f(A.chipIn.end)) *
      (1 - progress(frame, f(A.chipOut.start), f(A.chipOut.end)));
    const pStart = A.pulse.start;
    const pEnd = A.pulse.start + A.pulse.duration;
    const along = progress(frame, f(pStart), f(pEnd));
    const pulseOpacity =
      progress(frame, f(pStart), f(pStart + T.pulseFade)) *
      (1 - progress(frame, f(pEnd), f(pEnd + T.pulseFade)));
    const resultEnd = A.result.start + A.result.duration;
    const resultMix = progress(frame, f(A.result.start), f(resultEnd));
    const hlStart = resultEnd + T.highlightHold;
    const highlight = resultMix * (1 - progress(frame, f(hlStart), f(hlStart + T.highlightFade)));
    const action = ACTIONS[k];
    return {
      ...action,
      chip,
      pulseAt: pointAlong(CURVES[action.tile], along),
      pulseOpacity,
      resultMix,
      highlight,
    };
  });

  return (
    <AbsoluteFill style={{background: colors.background, fontFamily}}>
      <AbsoluteFill style={{opacity: 1 - fadeOut}}>
        {/* Lines sit under the cards so their ends tuck under the borders. */}
        <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0}}>
          {CURVES.map((curve, i) => (
            <ConnectionLine key={i} curve={curve} draw={tiles[i].line} />
          ))}
        </svg>

        {actions.map((a, k) => (
          <Pulse key={k} at={a.pulseAt} opacity={a.pulseOpacity} />
        ))}

        <AgentCard frame={frame} fps={fps} />

        {actions.map((a, k) => (
          <ActionChip key={k} fn={a.fn} opacity={a.chip} />
        ))}

        {SYSTEMS.map((s, i) => {
          const st = tiles[i];
          const action = actions.find((a) => a.tile === i);
          return (
            <div
              key={s.name}
              style={{
                position: 'absolute',
                left: TILES_X,
                top: tileY(i),
                opacity: st.enter,
                transform: `translateY(${mix(12, 0, st.enter)}px)`,
              }}
            >
              <SystemTile
                icon={s.icon}
                name={s.name}
                detail={s.detail}
                result={action?.result}
                resultMix={action?.resultMix}
                resultHighlight={action?.highlight}
                status={{connect: st.connect, spinner: st.spinner, connected: st.connected, tick: st.tick}}
              />
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Agent card                                                          */
/* ------------------------------------------------------------------ */

const AgentCard: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  const f = (s: number) => s * fps;
  const enter = progress(frame, f(T.agentIn.start), f(T.agentIn.end));

  // Counter: each step crossfades in as its tile connects.
  const steps = SYSTEMS.map((_, i) =>
    progress(frame, f(connectedAt(i)), f(connectedAt(i) + T.connect.counterFade)),
  );
  const layerOpacity = (n: number) => {
    const inn = n === 0 ? 1 : steps[n - 1];
    const out = n < SYSTEMS.length ? steps[n] : 0;
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
              {Array.from({length: SYSTEMS.length + 1}, (_, n) => {
                const o = layerOpacity(n);
                return o > 0 ? (
                  <span key={n} style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
                    {counterText(n)}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Action chip                                                         */
/* ------------------------------------------------------------------ */

const ActionChip: React.FC<{fn: string; opacity: number}> = ({fn, opacity}) => {
  if (opacity <= 0) return null;
  const {background, text} = tagColours.tool;
  return (
    <div
      style={{
        position: 'absolute',
        left: AGENT_X,
        width: AGENT.width,
        top: AGENT_Y - CHIP.gap - CHIP.height,
        display: 'flex',
        justifyContent: 'center',
        opacity,
      }}
    >
      <Chip
        label={
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 8}}>
            <span>Tool</span>
            <span style={{width: 1, height: 14, background: text, opacity: 0.25}} />
            <span>{fn}</span>
          </span>
        }
        icon={<WrenchIcon size={15} />}
        fontSize={15}
        height={CHIP.height}
        paddingX={14}
        gap={8}
        background={background}
        color={text}
      />
    </div>
  );
};

