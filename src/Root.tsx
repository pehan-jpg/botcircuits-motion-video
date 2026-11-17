import { Composition } from "remotion";
import { DURATION, END_MARK, FPS, HEIGHT, LOOP, WIDTH } from "./constants";
import { ConciergeTitleCard, ConciergeTitleCardProps } from "./ConciergeTitleCard";

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
        defaultProps={{ loop: LOOP, endMark: END_MARK, guards: true } satisfies ConciergeTitleCardProps}
      />
    </>
  );
};
