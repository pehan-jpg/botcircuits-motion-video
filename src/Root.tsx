import React from "react";
import { Composition } from "remotion";
import { FPS, HEIGHT, WIDTH } from "./constants";
import { SpaceTitleCard, SpaceTitleCardProps } from "./SpaceTitleCard/SpaceTitleCard";
import { BASE_DURATION, END_MARK_DURATION } from "./SpaceTitleCard/timeline";

const defaults: SpaceTitleCardProps = {
  loop: false, // LOOP
  guards: true,
  endMark: "none", // END_MARK
  pageBg: "#FFFFFF", // PAGE_BG
  availableFiles: null,
  reportedPlaceholders: [],
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SpaceTitleCard"
      component={SpaceTitleCard}
      durationInFrames={BASE_DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={defaults}
      calculateMetadata={({ props }) => ({
        durationInFrames: props.endMark === "symbol" ? END_MARK_DURATION : BASE_DURATION,
      })}
    />
  );
};
