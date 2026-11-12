import React from 'react';
import {Composition} from 'remotion';
import {ProblemSequence} from './ProblemSequence';
import {FPS, HEIGHT, PROBLEM_SEQUENCE_DURATION, WIDTH} from './timeline';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="ProblemSequence"
      component={ProblemSequence}
      durationInFrames={PROBLEM_SEQUENCE_DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
    {/* Scenes 4+ (BotCircuits solution) will be registered here. */}
  </>
);
