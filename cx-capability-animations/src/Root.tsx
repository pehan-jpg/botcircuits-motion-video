import React from 'react';
import {Composition} from 'remotion';
import {Build} from './compositions/build/Build';
import {DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH} from './config';
import {ensureInter} from './fonts';

ensureInter();

/**
 * Six looping capability animations share this root, config and tokens.
 * Only Build exists so far; add the other five as sibling folders under
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
  </>
);
