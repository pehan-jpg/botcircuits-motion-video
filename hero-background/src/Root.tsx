import { Composition } from "remotion";
import { HeroBackground } from "./HeroBackground";
import { VIDEO } from "./config";
import { HeroOverlay } from "./overlay/HeroOverlay";
import { COMP } from "./overlay/config";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={COMP.id}
        component={HeroOverlay}
        durationInFrames={COMP.durationInFrames}
        fps={COMP.fps}
        width={COMP.width}
        height={COMP.height}
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
