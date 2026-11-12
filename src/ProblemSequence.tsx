import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {COLORS, EASE} from './theme';
import {BEATS, SCENE_DURATIONS, TRANSITION_FRAMES} from './timeline';
import {Scene01} from './scenes/Scene01';
import {Scene02} from './scenes/Scene02';
import {Scene03} from './scenes/Scene03';
import {ThreadStage} from './scenes/ThreadStage';
import {SceneLayer} from './scenes/types';

// 12-frame cross dissolve. Swap `presentation`/`timing` here for morph
// transitions later; SCENE_DURATIONS already include the overlap padding.
const dissolve = () => ({
  presentation: fade(),
  timing: linearTiming({durationInFrames: TRANSITION_FRAMES, easing: EASE}),
});

const SceneTrack: React.FC<{layer: SceneLayer}> = ({layer}) => {
  const {fps} = useVideoConfig();
  const t1 = dissolve();
  const t2 = dissolve();
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scene01} premountFor={fps}>
        <Scene01 layer={layer} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={t1.presentation} timing={t1.timing} />
      <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scene02} premountFor={fps}>
        <Scene02 layer={layer} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={t2.presentation} timing={t2.timing} />
      <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scene03} premountFor={fps}>
        <Scene03 layer={layer} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

/**
 * Scenes 1-3, 480 frames.
 *   background track (TransitionSeries, cross-dissolves)
 *   persistent thread (one ChatWindow + Bubbles for the whole sequence)
 *   HUD track (TransitionSeries, same timing)
 */
export const ProblemSequence: React.FC = () => {
  const frame = useCurrentFrame();
  // Last 12 frames of scene 1: brightness drops ~6%, recovers into scene 2.
  const dim = interpolate(frame, [BEATS.dimStart, 120, 132], [0, 0.06, 0], {
    easing: EASE,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{background: COLORS.ink}}>
      <SceneTrack layer="background" />
      <ThreadStage />
      <SceneTrack layer="hud" />
      <AbsoluteFill style={{background: '#000', opacity: dim, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
