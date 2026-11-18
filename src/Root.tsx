import { Composition } from "remotion";
import { END_MARK, FPS, HEIGHT, LOOP, PAGE_BG, WIDTH } from "./constants";
import { ConciergeTitleCard, ConciergeTitleCardProps } from "./ConciergeTitleCard";
import { durationFor } from "./ConciergeTitleCard/timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ConciergeTitleCard"
        component={ConciergeTitleCard}
        durationInFrames={durationFor(END_MARK)}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ loop: LOOP, endMark: END_MARK, guards: true, pageBg: PAGE_BG } satisfies ConciergeTitleCardProps}
        // 10.0s, or 10.8s when the symbol end mark is on.
        calculateMetadata={({ props }) => ({ durationInFrames: durationFor(props.endMark) })}
      />
    </>
  );
};
