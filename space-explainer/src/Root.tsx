import React from "react";
import { Composition, Folder } from "remotion";
import { Preview } from "./Preview";
import { NightGradeTest } from "./NightGradeTest";
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

const W = 1920;
const H = 1080;
const FPS = 60;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Preview"
      component={Preview}
      durationInFrames={7320}
      fps={FPS}
      width={W}
      height={H}
    />
    <Folder name="Scenes">
      <Composition
        id="Scene01"
        component={Scene01Problem}
        durationInFrames={900}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene02"
        component={Scene02Intro}
        durationInFrames={300}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene03"
        component={Scene03}
        durationInFrames={720}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene04"
        component={Scene04}
        durationInFrames={840}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene05"
        component={Scene05}
        durationInFrames={600}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene06"
        component={Scene06}
        durationInFrames={900}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene07"
        component={Scene07}
        durationInFrames={540}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene08"
        component={Scene08}
        durationInFrames={960}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene09"
        component={Scene09}
        durationInFrames={720}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene10"
        component={Scene10}
        durationInFrames={360}
        fps={FPS}
        width={W}
        height={H}
      />
      <Composition
        id="Scene11"
        component={Scene11}
        durationInFrames={480}
        fps={FPS}
        width={W}
        height={H}
      />
    </Folder>
    <Folder name="Tests">
      <Composition
        id="NightGradeTest"
        component={NightGradeTest}
        durationInFrames={600}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={{ grade: 0.5, showZones: true }}
      />
    </Folder>
  </>
);
