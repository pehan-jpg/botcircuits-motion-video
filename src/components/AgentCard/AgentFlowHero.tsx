import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { AgentCard } from "./AgentCard";
import type { AgentFlow } from "./types";

export type AgentFlowHeroProps = {
  flow: AgentFlow;
  /** "transparent" for alpha renders, or any CSS colour for previews. */
  background: string;
};

/**
 * Steps through every state of a flow, one card at a time. Each state
 * fades in from empty and fades out to empty, so the last state hands
 * straight back to the first and the composition loops seamlessly.
 */
export const AgentFlowHero: React.FC<AgentFlowHeroProps> = ({ flow, background }) => {
  const frame = useCurrentFrame();
  const index = Math.min(Math.floor(frame / flow.framesPerState), flow.states.length - 1);
  const local = frame - index * flow.framesPerState;

  return (
    <AbsoluteFill style={{ backgroundColor: background, alignItems: "center", justifyContent: "flex-start", paddingTop: flow.cardTop }}>
      <AgentCard state={flow.states[index]} frame={local} durationInFrames={flow.framesPerState} />
    </AbsoluteFill>
  );
};

export const flowDuration = (flow: AgentFlow) => flow.framesPerState * flow.states.length;
