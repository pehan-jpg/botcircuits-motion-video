import React from 'react';
import {Composition, Folder} from 'remotion';
import {FullVideo, FULL_VIDEO_DURATION} from './FullVideo';
import {ProblemSequence} from './ProblemSequence';
import {FPS, HEIGHT, PROBLEM_SEQUENCE_DURATION, WIDTH} from './timeline';
import {BUILD7_FRAMES} from './v7';
import {Scene04Intro} from './scenes/Scene04Intro';
import {Scene05Console} from './scenes/Scene05Console';
import {Scene06Procedures} from './scenes/Scene06Procedures';
import {Scene07Knowledge} from './scenes/Scene07Knowledge';
import {Scene08Simulator} from './scenes/Scene08Simulator';
import {Scene09Publish} from './scenes/Scene09Publish';
import {Scene10WhatsApp} from './scenes/Scene10WhatsApp';
import {Scene11Voice} from './scenes/Scene11Voice';
import {Scene12Loop} from './scenes/Scene12Loop';
import {Scene13End} from './scenes/Scene13End';
import {TypedLine, typedLineDuration} from './components/TypedLine';
import {TAGLINE} from './constants';

const common = {fps: FPS, width: WIDTH, height: HEIGHT};
const SAMPLE_LINE = 'Your tagline types out here.';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="FullVideo" component={FullVideo} durationInFrames={FULL_VIDEO_DURATION} defaultProps={{qa: false}} {...common} />
    <Composition id="ProblemSequence" component={ProblemSequence} durationInFrames={PROBLEM_SEQUENCE_DURATION} {...common} />
    <Folder name="Build-scenes">
      <Composition id="Scene04Intro" component={Scene04Intro} durationInFrames={BUILD7_FRAMES.dur.s4} {...common} />
      <Composition id="Scene05Console" component={Scene05Console} durationInFrames={BUILD7_FRAMES.dur.s5} {...common} />
      <Composition id="Scene06Procedures" component={Scene06Procedures} durationInFrames={BUILD7_FRAMES.dur.s6} {...common} />
      <Composition id="Scene07Knowledge" component={Scene07Knowledge} durationInFrames={BUILD7_FRAMES.dur.s7} {...common} />
      <Composition id="Scene08Simulator" component={Scene08Simulator} durationInFrames={BUILD7_FRAMES.dur.s8} {...common} />
      <Composition id="Scene09Publish" component={Scene09Publish} durationInFrames={BUILD7_FRAMES.dur.s9} {...common} />
      <Composition id="Scene10WhatsApp" component={Scene10WhatsApp} durationInFrames={BUILD7_FRAMES.dur.s10} {...common} />
      <Composition id="Scene11Voice" component={Scene11Voice} durationInFrames={BUILD7_FRAMES.dur.s11} {...common} />
      <Composition id="Scene12Loop" component={Scene12Loop} durationInFrames={BUILD7_FRAMES.dur.s12} {...common} />
      <Composition id="Scene13End" component={Scene13End} durationInFrames={BUILD7_FRAMES.dur.s13} {...common} />
    </Folder>
    <Folder name="Components">
      <Composition id="TypedLineTest" component={TypedLine} durationInFrames={typedLineDuration(SAMPLE_LINE)} defaultProps={{text: SAMPLE_LINE}} {...common} />
      <Composition id="TypedLineTagline" component={TypedLine} durationInFrames={typedLineDuration(TAGLINE)} defaultProps={{text: TAGLINE}} {...common} />
    </Folder>
  </>
);
