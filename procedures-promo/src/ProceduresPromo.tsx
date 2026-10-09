import React from "react";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { useVideoConfig } from "remotion";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2CoreRule } from "./scenes/Scene2CoreRule";
import { Scene3Introducing } from "./scenes/Scene3Introducing";
import { Scene5CreateProcedure } from "./scenes/Scene5CreateProcedure";
import { Scene7Simulator } from "./scenes/Scene7Simulator";
import { Scene8Outro } from "./scenes/Scene8Outro";

export const ProceduresPromo: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence name="1 · Intro Hook" durationInFrames={181} premountFor={fps}>
        <Scene1Hook />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence name="2 · Core Rule" durationInFrames={100} premountFor={fps}>
        <Scene2CoreRule />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence name="3 · Introducing" durationInFrames={125} premountFor={fps}>
        <Scene3Introducing />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence name="5 · Create Procedure" durationInFrames={1138} premountFor={fps}>
        <Scene5CreateProcedure />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence name="7 · Simulator" durationInFrames={802} premountFor={fps}>
        <Scene7Simulator />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 24 })} />
      <TransitionSeries.Sequence name="8 · Outro" durationInFrames={300} premountFor={fps}>
        <Scene8Outro />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
