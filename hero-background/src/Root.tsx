import { Composition } from "remotion";
import { HeroBackground } from "./HeroBackground";
import { VIDEO } from "./config";
import { HeroOverlay } from "./overlay/HeroOverlay";
import { COMP, toFrames } from "./overlay/config";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={COMP.id}
        component={HeroOverlay}
        durationInFrames={toFrames(COMP.durationSec, COMP.fps)}
        fps={COMP.fps}
        width={COMP.width}
        height={COMP.height}
        defaultProps={{ showOverlay: COMP.showOverlay, fps: COMP.fps }}
        // The output frame rate is an input prop; duration follows it (1228 frames at 60 fps, 614 at 30).
        calculateMetadata={({ props }) => ({ fps: props.fps, durationInFrames: toFrames(COMP.durationSec, props.fps) })}
      />
      <Composition
        id={VIDEO.id}
        component={HeroBackground}
        durationInFrames={VIDEO.durationInFrames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
    </>
  );
};
