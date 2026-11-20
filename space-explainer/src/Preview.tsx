import React from "react";
import { Series } from "remotion";
import {
  Scene01Problem,
  Scene02Intro,
  Scene03,
  Scene04,
  Scene05,
  Scene06,
  Scene07,
  Scene08,
  Scene09,
  Scene10,
  Scene11,
} from "./scenes";

/**
 * All scenes in order. Scenes morph into each other: each scene's first frame
 * matches the previous scene's last frame, so there are no cuts.
 * Durations at 60 fps: 15s, 5s, 12s, 14s, 10s, 15s, 9s, 16s, 12s, 6s, 8s.
 */
export const Preview: React.FC = () => (
  <Series>
    <Series.Sequence name="1 Problem" durationInFrames={900} premountFor={60}>
      <Scene01Problem />
    </Series.Sequence>
    <Series.Sequence name="2 Intro" durationInFrames={300} premountFor={60}>
      <Scene02Intro />
    </Series.Sequence>
    <Series.Sequence name="3" durationInFrames={720} premountFor={60}>
      <Scene03 />
    </Series.Sequence>
    <Series.Sequence name="4" durationInFrames={840} premountFor={60}>
      <Scene04 />
    </Series.Sequence>
    <Series.Sequence name="5" durationInFrames={600} premountFor={60}>
      <Scene05 />
    </Series.Sequence>
    <Series.Sequence name="6" durationInFrames={900} premountFor={60}>
      <Scene06 />
    </Series.Sequence>
    <Series.Sequence name="7" durationInFrames={540} premountFor={60}>
      <Scene07 />
    </Series.Sequence>
    <Series.Sequence name="8" durationInFrames={960} premountFor={60}>
      <Scene08 />
    </Series.Sequence>
    <Series.Sequence name="9" durationInFrames={720} premountFor={60}>
      <Scene09 />
    </Series.Sequence>
    <Series.Sequence name="10" durationInFrames={360} premountFor={60}>
      <Scene10 />
    </Series.Sequence>
    <Series.Sequence name="11" durationInFrames={480} premountFor={60}>
      <Scene11 />
    </Series.Sequence>
  </Series>
);
