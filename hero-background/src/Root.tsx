import { Composition } from "remotion";
import { HeroBackground } from "./HeroBackground";
import { VIDEO } from "./config";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id={VIDEO.id}
      component={HeroBackground}
      durationInFrames={VIDEO.durationInFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  );
};
