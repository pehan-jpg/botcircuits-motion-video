import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ClipScene } from "./components/ClipScene";
import { Grade } from "./components/Grade";
import { LightFlare } from "./components/LightFlare";
import { CLIPS, TIMING, VIDEO } from "./config";

const dissolve = () =>
  linearTiming({ durationInFrames: TIMING.transitionFrames, easing: Easing.inOut(Easing.ease) });

// Each dissolve starts where the previous scene's last transitionFrames begin.
const transitionStart = (n: number) => n * (TIMING.sceneFrames - TIMING.transitionFrames);

export const HeroBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const loopStart = VIDEO.durationInFrames - TIMING.loopFadeFrames;

  return (
    <AbsoluteFill style={{ backgroundColor: "#1e140c" }}>
      <TransitionSeries name="Scenes">
        <TransitionSeries.Sequence name={CLIPS.airport.name} durationInFrames={TIMING.sceneFrames} premountFor={fps}>
          <ClipScene clip={CLIPS.airport} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={dissolve()} />
        <TransitionSeries.Sequence name={CLIPS.sofa.name} durationInFrames={TIMING.sceneFrames} premountFor={fps}>
          <ClipScene clip={CLIPS.sofa} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={dissolve()} />
        <TransitionSeries.Sequence name={CLIPS.hands.name} durationInFrames={TIMING.sceneFrames} premountFor={fps}>
          <ClipScene clip={CLIPS.hands} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={dissolve()} />
        <TransitionSeries.Sequence name={CLIPS.headset.name} durationInFrames={TIMING.sceneFrames} premountFor={fps}>
          <ClipScene clip={CLIPS.headset} />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Loop tail: the source frames just before Scene A's start, faded in so frame 480 == frame 0. */}
      <Sequence name="Loop tail" from={loopStart} durationInFrames={TIMING.loopFadeFrames} premountFor={fps}>
        <AbsoluteFill
          style={{
            opacity: interpolate(frame, [loopStart, VIDEO.durationInFrames - 1], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.inOut(Easing.ease),
            }),
          }}
        >
          <ClipScene clip={CLIPS.airport} startSec={CLIPS.airport.startSec - TIMING.loopFadeFrames / fps} staticScale />
        </AbsoluteFill>
      </Sequence>

      <Sequence name="Flare A→B" from={transitionStart(1)} durationInFrames={TIMING.transitionFrames} premountFor={fps}>
        <LightFlare />
      </Sequence>
      <Sequence name="Flare B→C" from={transitionStart(2)} durationInFrames={TIMING.transitionFrames} premountFor={fps}>
        <LightFlare />
      </Sequence>
      <Sequence name="Flare C→D" from={transitionStart(3)} durationInFrames={TIMING.transitionFrames} premountFor={fps}>
        <LightFlare />
      </Sequence>

      <Grade />
    </AbsoluteFill>
  );
};
