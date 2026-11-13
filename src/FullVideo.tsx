import React from 'react';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {TransitionSeries} from '@remotion/transitions';
import {COLORS} from './theme';
import {PROBLEM_SEQUENCE_DURATION, SCENE_DURATIONS} from './timeline';
import {BUILD7_FRAMES, BUILD_KEYS, BuildKey} from './v7';
import {makeBeat} from './scenes/Beats';
import {SceneLayerProps} from './scenes/kit';
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
import {Scene10WhatsApp} from './scenes/Scene10WhatsApp';
import {Scene11Voice} from './scenes/Scene11Voice';
import {Scene12Loop} from './scenes/Scene12Loop';
import {Scene13End} from './scenes/Scene13End';
import {SafeAreaGuard} from './components/SafeAreaGuard';

/** Scenes 1-13 with seven TextBeats: 16 s problem sequence + the build stage. */
export const FULL_VIDEO_DURATION = PROBLEM_SEQUENCE_DURATION + BUILD7_FRAMES.total;

const SCENES: Partial<Record<BuildKey, React.FC<SceneLayerProps>>> = {
  s4: Scene04Intro,
  s5: Scene05Console,
  s6: Scene06Procedures,
  s7: Scene07Knowledge,
  s8: Scene08Simulator,
  s9: Scene09Publish,
  s10: Scene10WhatsApp,
  s11: Scene11Voice,
  s12: Scene12Loop,
  s13: Scene13End,
};
const BUILD = BUILD_KEYS.map((key) => ({key, C: SCENES[key] ?? makeBeat(key)}));

/**
 * Main composition.
 *  - Scenes 1-3: backgrounds in a TransitionSeries (0.4 s cross-dissolves) with
 *    the persistent thread/HUD layer on top (unchanged).
 *  - Scenes 4-9: each scene is a Sequence; consecutive scenes overlap by 0.5 s
 *    and blur-dissolve while shared elements (pill, chat card, app shell,
 *    cursor, Publish button) are handed over without a cut.
 */
export const FullVideo: React.FC<{qa?: boolean}> = ({qa = false}) => {
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
            name={`${key[0] === 'b' ? 'Beat' : 'Scene'} ${key.slice(1)} ${layer}`}
            from={PROBLEM_SEQUENCE_DURATION + BUILD7_FRAMES.start[key]}
            durationInFrames={BUILD7_FRAMES.dur[key]}
            premountFor={fps}
          >
            <C layer={layer} />
          </Sequence>
        )),
      )}
      <SafeAreaGuard enabled={qa} />
    </AbsoluteFill>
  );
};
