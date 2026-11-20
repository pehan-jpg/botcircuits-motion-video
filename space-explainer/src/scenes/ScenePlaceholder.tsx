import React from "react";
import { AbsoluteFill } from "remotion";
import { COLOR, FONT, SAFE } from "../theme";
import { sceneById, f, type SceneId, type PlateKey } from "../timeline";
import { PlateBackground } from "../backgrounds/PlateBackground";
import { GlassPanel } from "../components/GlassPanel";
import { GuardLayer } from "../components/GuardLayer";

/** Background per scene, from the plate mapping in DESIGN.md. */
const BACKGROUND: Record<
  SceneId,
  { plate?: PlateKey; to?: PlateKey; flat?: string }
> = {
  S01: { flat: COLOR.problemGrey },
  S02: { plate: "01" },
  S03: { plate: "02" },
  S04: { plate: "02" },
  S05: { plate: "03" },
  S06: { plate: "03" }, // assumption: not in the mapping, continues from Scene 5
  S07: { plate: "04", to: "01" }, // NightGrade is built but not used until Scene 7 is built
  S08: { plate: "01", to: "02" },
  S09: { plate: "03" },
  S10: { flat: COLOR.neutralPale },
  S11: { flat: COLOR.white },
};

const mmss = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export const ScenePlaceholder: React.FC<{ scene: SceneId }> = ({ scene }) => {
  const def = sceneById(scene);
  const bg = BACKGROUND[scene];
  const len = def.end - def.start;
  return (
    <AbsoluteFill
      style={{
        width: 1920,
        height: 1080,
        background: bg.flat ?? COLOR.problemGrey,
      }}
    >
      {bg.plate ? (
        <PlateBackground
          plate={bg.plate}
          to={bg.to}
          crossfadeAt={f(len * 0.6)}
        />
      ) : null}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: SAFE,
        }}
      >
        <GlassPanel
          style={{
            padding: "36px 56px",
            textAlign: "center",
            background: "rgba(255,255,255,0.72)",
          }}
        >
          <div
            data-guard="text"
            style={{
              fontFamily: FONT.mono,
              fontSize: 28,
              color: COLOR.ink,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Placeholder
          </div>
          <div
            data-guard="text"
            style={{
              fontFamily: FONT.sans,
              fontWeight: 800,
              fontSize: 72,
              color: COLOR.ink,
              letterSpacing: "-0.02em",
              marginTop: 8,
            }}
          >
            {def.name}
          </div>
          <div
            data-guard="text"
            style={{
              fontFamily: FONT.mono,
              fontSize: 32,
              color: COLOR.ink,
              marginTop: 8,
            }}
          >
            {mmss(def.start)} to {mmss(def.end)}
          </div>
        </GlassPanel>
      </AbsoluteFill>
      <GuardLayer scene={scene} />
    </AbsoluteFill>
  );
};
