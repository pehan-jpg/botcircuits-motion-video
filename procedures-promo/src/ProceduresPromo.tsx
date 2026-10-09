import React from "react";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { useVideoConfig } from "remotion";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2CoreRule } from "./scenes/Scene2CoreRule";
import { Scene3Promise } from "./scenes/Scene3Promise";
import { Scene4FeatureName } from "./scenes/Scene4FeatureName";
import { Scene5CreateProcedure } from "./scenes/Scene5CreateProcedure";
import { Scene6BoundaryRules } from "./scenes/Scene6BoundaryRules";
import { Scene7Simulator } from "./scenes/Scene7Simulator";
import { Scene8Outro } from "./scenes/Scene8Outro";

export const ProceduresPromo: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence name="1 · Intro Hook" durationInFrames={96} premountFor={fps}>
        <Scene1Hook />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence name="2 · Core Rule" durationInFrames={96} premountFor={fps}>
        <Scene2CoreRule />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence name="3 · Promise" durationInFrames={144} premountFor={fps}>
        <Scene3Promise />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence name="4 · Feature Name" durationInFrames={120} premountFor={fps}>
        <Scene4FeatureName />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence name="5 · Create Procedure" durationInFrames={360} premountFor={fps}>
        <Scene5CreateProcedure />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence name="6 · Boundary Rules" durationInFrames={300} premountFor={fps}>
        <Scene6BoundaryRules />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence name="7 · Simulator" durationInFrames={390} premountFor={fps}>
        <Scene7Simulator />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 24 })} />
      <TransitionSeries.Sequence name="8 · Outro" durationInFrames={270} premountFor={fps}>
        <Scene8Outro />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
