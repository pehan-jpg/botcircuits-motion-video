import React from 'react';
import {Composition, Folder} from 'remotion';
import {FullVideo, FULL_VIDEO_DURATION} from './FullVideo';
import {ProblemSequence} from './ProblemSequence';
import {FPS, HEIGHT, PROBLEM_SEQUENCE_DURATION, WIDTH} from './timeline';
import {BUILD_DURATIONS} from './handoff';
import {Scene04} from './build/Scene04';
import {Scene05} from './build/Scene05';
import {Scene06} from './build/Scene06';
import {Scene07} from './build/Scene07';
import {Scene08} from './build/Scene08';

const common = {fps: FPS, width: WIDTH, height: HEIGHT};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="FullVideo" component={FullVideo} durationInFrames={FULL_VIDEO_DURATION} {...common} />
    <Composition id="ProblemSequence" component={ProblemSequence} durationInFrames={PROBLEM_SEQUENCE_DURATION} {...common} />
    <Folder name="Build-scenes">
      <Composition id="Scene04" component={Scene04} durationInFrames={BUILD_DURATIONS.scene04} {...common} />
      <Composition id="Scene05" component={Scene05} durationInFrames={BUILD_DURATIONS.scene05} {...common} />
      <Composition id="Scene06" component={Scene06} durationInFrames={BUILD_DURATIONS.scene06} {...common} />
      <Composition id="Scene07" component={Scene07} durationInFrames={BUILD_DURATIONS.scene07} {...common} />
      <Composition id="Scene08" component={Scene08} durationInFrames={BUILD_DURATIONS.scene08} {...common} />
    </Folder>
    {/* Scenes 9+ will be added to FullVideo later. */}
  </>
);
