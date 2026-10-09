import { Composition, Folder } from "remotion";
import { ProceduresPromo } from "./ProceduresPromo";
import { Scene1Hook } from "./scenes/Scene1Hook";
import { Scene2CoreRule } from "./scenes/Scene2CoreRule";
import { Scene3Introducing } from "./scenes/Scene3Introducing";
import { Scene5CreateProcedure } from "./scenes/Scene5CreateProcedure";
import { Scene7Simulator } from "./scenes/Scene7Simulator";
import { Scene7bOrbit } from "./scenes/Scene7bOrbit";
import { Scene8Outro } from "./scenes/Scene8Outro";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ProceduresPromo"
        component={ProceduresPromo}
        durationInFrames={2479}
        fps={60}
        width={1920}
        height={1080}
      />
      <Folder name="Scenes">
        <Composition id="Scene1-Hook" component={Scene1Hook} durationInFrames={181} fps={60} width={1920} height={1080} />
        <Composition id="Scene2-CoreRule" component={Scene2CoreRule} durationInFrames={100} fps={60} width={1920} height={1080} />
        <Composition id="Scene3-Introducing" component={Scene3Introducing} durationInFrames={125} fps={60} width={1920} height={1080} />
        <Composition id="Scene5-CreateProcedure" component={Scene5CreateProcedure} durationInFrames={757} fps={60} width={1920} height={1080} />
        <Composition id="Scene7-Simulator" component={Scene7Simulator} durationInFrames={716} fps={60} width={1920} height={1080} />
        <Composition id="Scene7b-Orbit" component={Scene7bOrbit} durationInFrames={300} fps={60} width={1920} height={1080} />
        <Composition id="Scene8-Outro" component={Scene8Outro} durationInFrames={300} fps={60} width={1920} height={1080} />
      </Folder>
    </>
  );
};
