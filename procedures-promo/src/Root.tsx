import { Composition, Folder } from "remotion";
import { ProceduresPromo } from "./ProceduresPromo";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2CoreRule } from "./scenes/Scene2CoreRule";
import { Scene3Promise } from "./scenes/Scene3Promise";
import { Scene4FeatureName } from "./scenes/Scene4FeatureName";
import { Scene5CreateProcedure } from "./scenes/Scene5CreateProcedure";
import { Scene6BoundaryRules } from "./scenes/Scene6BoundaryRules";
import { Scene7Simulator } from "./scenes/Scene7Simulator";
import { Scene8Outro } from "./scenes/Scene8Outro";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ProceduresPromo"
        component={ProceduresPromo}
        durationInFrames={3392}
        fps={60}
        width={1920}
        height={1080}
      />
      <Folder name="Scenes">
        <Composition id="Scene1-Hook" component={Scene1Hook} durationInFrames={490} fps={60} width={1920} height={1080} />
        <Composition id="Scene2-CoreRule" component={Scene2CoreRule} durationInFrames={340} fps={60} width={1920} height={1080} />
        <Composition id="Scene3-Promise" component={Scene3Promise} durationInFrames={144} fps={60} width={1920} height={1080} />
        <Composition id="Scene4-FeatureName" component={Scene4FeatureName} durationInFrames={120} fps={60} width={1920} height={1080} />
        <Composition id="Scene5-CreateProcedure" component={Scene5CreateProcedure} durationInFrames={872} fps={60} width={1920} height={1080} />
        <Composition id="Scene6-BoundaryRules" component={Scene6BoundaryRules} durationInFrames={270} fps={60} width={1920} height={1080} />
        <Composition id="Scene7-Simulator" component={Scene7Simulator} durationInFrames={660} fps={60} width={1920} height={1080} />
        <Composition id="Scene8-Outro" component={Scene8Outro} durationInFrames={520} fps={60} width={1920} height={1080} />
      </Folder>
    </>
  );
};
