import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {TransitionSeries} from '@remotion/transitions';
import {COLORS} from './theme';
import {PROBLEM_SEQUENCE_DURATION, SCENE_DURATIONS} from './timeline';
import {BUILD_DURATIONS} from './handoff';
import {ProblemOverlays, dissolve} from './ProblemSequence';
import {Scene01} from './scenes/Scene01';
import {Scene02} from './scenes/Scene02';
import {Scene03} from './scenes/Scene03';
import {Scene04} from './build/Scene04';
import {Scene05} from './build/Scene05';
import {Scene06} from './build/Scene06';
import {Scene07} from './build/Scene07';
import {Scene08} from './build/Scene08';

/** Nominal scene lengths in seconds (scenes 1-8 = 47 s). */
export const SCENE_SECONDS = [4, 5, 7, 5, 8, 6, 6, 6] as const;
export const FULL_VIDEO_DURATION =
  PROBLEM_SEQUENCE_DURATION +
  BUILD_DURATIONS.scene04 +
  BUILD_DURATIONS.scene05 +
  BUILD_DURATIONS.scene06 +
  BUILD_DURATIONS.scene07 +
  BUILD_DURATIONS.scene08;

/**
 * Main composition. One TransitionSeries holds every scene:
 *  - scenes 1-3 backgrounds cross-dissolve (0.4 s, padded so they keep 4/5/7 s);
 *  - scenes 3 -> 8 hand over with in-scene morphs (no TransitionSeries overlap),
 *    each scene starting from the exact last frame of the previous one.
 * The scenes 1-3 thread/HUD layer sits above for the first 16 s.
 */
export const FullVideo: React.FC = () => {
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
        <TransitionSeries.Sequence durationInFrames={BUILD_DURATIONS.scene04} premountFor={fps}>
          <Scene04 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence durationInFrames={BUILD_DURATIONS.scene05} premountFor={fps}>
          <Scene05 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence durationInFrames={BUILD_DURATIONS.scene06} premountFor={fps}>
          <Scene06 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence durationInFrames={BUILD_DURATIONS.scene07} premountFor={fps}>
          <Scene07 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence durationInFrames={BUILD_DURATIONS.scene08} premountFor={fps}>
          <Scene08 />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Sequence durationInFrames={PROBLEM_SEQUENCE_DURATION} premountFor={fps}>
        <ProblemOverlays />
      </Sequence>
    </AbsoluteFill>
  );
};
