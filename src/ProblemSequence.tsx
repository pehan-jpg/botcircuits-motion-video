import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {COLORS, EASE} from './theme';
import {BEATS, SCENE_DURATIONS, TRANSITION_FRAMES, f30} from './timeline';
import {Scene01} from './scenes/Scene01';
import {Scene02} from './scenes/Scene02';
import {Scene03} from './scenes/Scene03';
import {ThreadStage} from './scenes/ThreadStage';
import {SceneLayer} from './scenes/types';

// 0.4 s cross dissolve between the problem-scene backgrounds.
export const dissolve = () => ({
  presentation: fade(),
  timing: linearTiming({durationInFrames: TRANSITION_FRAMES, easing: EASE}),
});

/** Scenes 1-3 HUD layer (TransitionSeries, same timing as the backgrounds). */
const HudTrack: React.FC = () => {
  const {fps} = useVideoConfig();
  const t1 = dissolve();
  const t2 = dissolve();
  const layer: SceneLayer = 'hud';
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
 * Everything of scenes 1-3 that sits above the backgrounds: the persistent
 * thread (one instance for all three scenes), the HUD track and the dip.
 */
export const ProblemOverlays: React.FC = () => {
  const frame = useCurrentFrame();
  // Last 12 storyboard frames of scene 1: brightness drops ~6%, recovers into scene 2.
  const dim = interpolate(frame, [BEATS.dimStart, f30(120), f30(132)], [0, 0.06, 0], {
    easing: EASE,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill>
      <ThreadStage />
      <HudTrack />
      <AbsoluteFill style={{background: '#000', opacity: dim, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

/** Scenes 1-3 only (16 s). FullVideo is the main composition. */
export const ProblemSequence: React.FC = () => {
  const {fps} = useVideoConfig();
  const t1 = dissolve();
  const t2 = dissolve();
  return (
    <AbsoluteFill style={{background: COLORS.ink}}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scene01} premountFor={fps}>
          <Scene01 layer="background" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={t1.presentation} timing={t1.timing} />
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scene02} premountFor={fps}>
          <Scene02 layer="background" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={t2.presentation} timing={t2.timing} />
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.scene03} premountFor={fps}>
          <Scene03 layer="background" />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <ProblemOverlays />
    </AbsoluteFill>
  );
};
