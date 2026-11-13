import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {TransitionSeries} from '@remotion/transitions';
import {COLORS} from './theme';
import {PROBLEM_SEQUENCE_DURATION, SCENE_DURATIONS} from './timeline';
import {BUILD7_FRAMES} from './v7';
import {ProblemOverlays, dissolve} from './ProblemSequence';
import {Scene01} from './scenes/Scene01';
import {Scene02} from './scenes/Scene02';
import {Scene03} from './scenes/Scene03';
import {Scene04Intro} from './scenes/Scene04Intro';
import {Scene05Console} from './scenes/Scene05Console';
import {Scene06Procedures} from './scenes/Scene06Procedures';
import {Scene07Knowledge} from './scenes/Scene07Knowledge';
import {Scene08Simulator} from './scenes/Scene08Simulator';
import {Scene09Publish} from './scenes/Scene09Publish';

/** Scenes 1-9: 16 s problem sequence + 39.5 s build stage = 55.5 s. */
export const FULL_VIDEO_DURATION = PROBLEM_SEQUENCE_DURATION + BUILD7_FRAMES.total;

const BUILD = [
  {key: 's4', C: Scene04Intro},
  {key: 's5', C: Scene05Console},
  {key: 's6', C: Scene06Procedures},
  {key: 's7', C: Scene07Knowledge},
  {key: 's8', C: Scene08Simulator},
  {key: 's9', C: Scene09Publish},
] as const;

/**
 * Main composition.
 *  - Scenes 1-3: backgrounds in a TransitionSeries (0.4 s cross-dissolves) with
 *    the persistent thread/HUD layer on top (unchanged).
 *  - Scenes 4-9: each scene is a Sequence; consecutive scenes overlap by 0.5 s
 *    and blur-dissolve while shared elements (pill, chat card, app shell,
 *    cursor, Publish button) are handed over without a cut.
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
      </TransitionSeries>
      <Sequence durationInFrames={PROBLEM_SEQUENCE_DURATION} premountFor={fps}>
        <ProblemOverlays />
      </Sequence>
      {/* three stacked passes so outgoing content dissolves above the
          persistent shell/chat of the incoming scene */}
      {(['bg', 'shell', 'fg'] as const).map((layer) =>
        BUILD.map(({key, C}) => (
          <Sequence
            key={`${layer}-${key}`}
            name={`Scene ${key.slice(1)} ${layer}`}
            from={PROBLEM_SEQUENCE_DURATION + BUILD7_FRAMES.start[key]}
            durationInFrames={BUILD7_FRAMES.dur[key]}
            premountFor={fps}
          >
            <C layer={layer} />
          </Sequence>
        )),
      )}
    </AbsoluteFill>
  );
};
