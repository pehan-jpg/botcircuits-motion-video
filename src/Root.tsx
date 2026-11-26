import React from "react";
import { Composition } from "remotion";
import { AgentFlowHero, flowDuration } from "./components/AgentCard";
import { travelFlow } from "./data/travel";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="TravelHero"
      component={AgentFlowHero}
      durationInFrames={flowDuration(travelFlow)}
      fps={60}
      width={1920}
      height={1080}
      defaultProps={{ flow: travelFlow, background: "transparent" }}
    />
  </>
);
