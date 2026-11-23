import React from 'react';
import {Composition} from 'remotion';
import {Build} from './compositions/build/Build';
import {Integrate} from './compositions/integrate/Integrate';
import {DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH} from './config';
import {ensureInter} from './fonts';

ensureInter();

/**
 * Six looping capability animations share this root, config and tokens.
 * Build and Integrate exist so far; add the others as sibling folders under
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
  </>
);
