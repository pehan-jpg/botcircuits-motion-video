import React from "react";
import { Composition } from "remotion";
import { AgentFlowHero, flowDuration } from "./components/AgentCard";
import { travelFlow } from "./data/travel";
import { HealthcareHero } from "./healthcare/HealthcareHero";
import { HEALTHCARE, HEALTHCARE_DURATION } from "./healthcare/config";

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
    <Composition
      id="HealthcareHero"
      component={HealthcareHero}
      durationInFrames={HEALTHCARE_DURATION}
      fps={HEALTHCARE.fps}
      width={HEALTHCARE.width}
      height={HEALTHCARE.height}
      defaultProps={{ showBackground: true }}
    />
    <Composition
      id="HealthcareHeroCard"
      component={HealthcareHero}
      durationInFrames={HEALTHCARE_DURATION}
      fps={HEALTHCARE.fps}
      width={HEALTHCARE.width}
      height={HEALTHCARE.height}
      defaultProps={{ showBackground: false }}
    />
  </>
);
