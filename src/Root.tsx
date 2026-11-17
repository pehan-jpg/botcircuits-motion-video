import { Composition } from "remotion";
import { FPS, HEIGHT, WIDTH } from "./constants";
import { ConciergeTitleCard, ConciergeTitleCardProps } from "./ConciergeTitleCard";
import { DURATION } from "./ConciergeTitleCard/timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ConciergeTitleCard"
        component={ConciergeTitleCard}
        durationInFrames={DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ loop: false, guards: true } satisfies ConciergeTitleCardProps}
      />
    </>
  );
};
