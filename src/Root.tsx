import React from "react";
import { Composition } from "remotion";
import { FPS, HEIGHT, WIDTH } from "./constants";
import { SpaceTitleCard, SpaceTitleCardProps } from "./SpaceTitleCard/SpaceTitleCard";
import { DURATION } from "./SpaceTitleCard/timeline";

const defaults: SpaceTitleCardProps = {
  loop: false,
  guards: true,
  logoAvailable: null,
  wordmarkAvailable: null,
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SpaceTitleCard"
      component={SpaceTitleCard}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={defaults}
    />
  );
};
