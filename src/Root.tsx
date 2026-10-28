import React from "react";
import { Composition } from "remotion";
import { VIDEO } from "./content";
import { PaymentsUseCase } from "./PaymentsUseCase";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="PaymentsUseCase"
      component={PaymentsUseCase}
      durationInFrames={Math.round(VIDEO.durationSeconds * VIDEO.fps)}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  );
};
