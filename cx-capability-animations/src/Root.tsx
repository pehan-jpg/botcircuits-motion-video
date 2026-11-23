import React from 'react';
import {Composition} from 'remotion';
import {Build} from './compositions/build/Build';
import {Integrate} from './compositions/integrate/Integrate';
import {Simulate} from './compositions/simulate/Simulate';
import {Publish} from './compositions/publish/Publish';
import {PUBLISH_DURATION_SECONDS} from './compositions/publish/timeline';
import {DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH} from './config';
import {ensureInter} from './fonts';

ensureInter();

/**
 * Six looping capability animations share this root, config and tokens.
 * Build, Integrate, Simulate and Publish exist so far; add the others as sibling folders under
 * src/compositions and register them here.
 */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Build"
      component={Build}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
    <Composition
      id="Integrate"
      component={Integrate}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
    <Composition
      id="Simulate"
      component={Simulate}
      durationInFrames={DURATION_IN_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
    {/* Publish runs 12 seconds; its length is set here only. */}
    <Composition
      id="Publish"
      component={Publish}
      durationInFrames={PUBLISH_DURATION_SECONDS * FPS}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  </>
);
