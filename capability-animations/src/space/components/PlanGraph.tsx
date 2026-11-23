import React from 'react';
import {mix} from '../../motion';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {ConnectionLine, Point, fanCurve} from '../../components/ConnectionLine';
import {TickIcon} from '../../components/Icons';
import {Orb} from '../../components/Orb';
import {Spinner} from '../../components/Spinner';

export const PLAN = {
  start: {width: 150, height: 44},
  agent: {width: 220, height: 64, gap: 16, radius: 14},
  result: {width: 170, height: 44},
  sidePad: 40,
} as const;

/** One assembled agent: mini orb, label, and a spinner that becomes a tick. */
export const AgentNode: React.FC<{label: string; done: number; tick: number}> = ({label, done, tick}) => (
  <div
    style={{
      width: PLAN.agent.width,
      height: PLAN.agent.height,
      boxSizing: 'border-box',
      borderRadius: PLAN.agent.radius,
      border: `1px solid ${colors.border}`,
      background: colors.surface,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '0 16px',
      fontFamily,
    }}
  >
    <Orb size={24} />
    <div style={{flex: 1, fontSize: 15, fontWeight: fontWeights.medium, color: colors.text, whiteSpace: 'nowrap'}}>{label}</div>
    <div style={{position: 'relative', width: 20, height: 20}}>
      {done < 1 && (
        <div style={{position: 'absolute', inset: 0, opacity: 1 - done}}>
          <Spinner size={20} />
        </div>
      )}
      {done > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: done, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <TickIcon size={18} strokeWidth={1.75} color={colors.charcoal} draw={tick} />
        </div>
      )}
    </div>
  </div>
);

export type PlanGraphState = {
  start: number;
  /** Draw progress of the lines from the start node to each agent. */
  inLines: number[];
  /** Appearance of each agent node. */
  agents: number[];
  /** Spinner to tick crossfade and tick draw for each agent. */
  done: number[];
  ticks: number[];
  /** Draw progress of the lines from each agent to the result node. */
  outLines: number[];
  result: number;
};

/**
 * Start node, a column of agents, and a result node, linked by curved
 * lines. Positions are fixed and centred in the given box.
 */
export const PlanGraph: React.FC<{
  width: number;
  height: number;
  startLabel: string;
  agents: string[];
  resultLabel: string;
  state: PlanGraphState;
}> = ({width, height, startLabel, agents, resultLabel, state}) => {
  const cy = height / 2;
  const colH = agents.length * PLAN.agent.height + (agents.length - 1) * PLAN.agent.gap;
  const colTop = cy - colH / 2;
  const colX = (width - PLAN.agent.width) / 2;
  const agentY = (i: number) => colTop + i * (PLAN.agent.height + PLAN.agent.gap);
  const startRight: Point = {x: PLAN.sidePad + PLAN.start.width, y: cy};
  const resultX = width - PLAN.sidePad - PLAN.result.width;
  const pill = (w: number, h: number, bg: string, color: string, label: string, opacity: number, x: number) => (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: cy - h / 2,
        width: w,
        height: h,
        borderRadius: h / 2,
        background: bg,
        color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily,
        fontSize: 15,
        fontWeight: fontWeights.medium,
        opacity,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  );
  return (
    <div style={{position: 'relative', width, height}}>
      <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
        {agents.map((_, i) => (
          <ConnectionLine key={`in${i}`} curve={fanCurve(startRight, {x: colX, y: agentY(i) + PLAN.agent.height / 2})} draw={state.inLines[i]} />
        ))}
        {agents.map((_, i) => (
          <ConnectionLine
            key={`out${i}`}
            curve={fanCurve({x: colX + PLAN.agent.width, y: agentY(i) + PLAN.agent.height / 2}, {x: resultX, y: cy})}
            draw={state.outLines[i]}
          />
        ))}
      </svg>
      {pill(PLAN.start.width, PLAN.start.height, colors.greyPill, colors.text, startLabel, state.start, PLAN.sidePad)}
      {agents.map((label, i) =>
        state.agents[i] > 0 ? (
          <div
            key={label}
            style={{
              position: 'absolute',
              left: colX,
              top: agentY(i),
              opacity: state.agents[i],
              transform: `translateY(${mix(12, 0, state.agents[i])}px)`,
            }}
          >
            <AgentNode label={label} done={state.done[i]} tick={state.ticks[i]} />
          </div>
        ) : null,
      )}
      {pill(PLAN.result.width, PLAN.result.height, colors.charcoal, '#ffffff', resultLabel, state.result, resultX)}
    </div>
  );
};
