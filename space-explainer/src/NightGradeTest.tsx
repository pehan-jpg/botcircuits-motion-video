import React from "react";
import { AbsoluteFill } from "remotion";
import { PlateBackground } from "./backgrounds/PlateBackground";
import { DEFAULT_TEXT_ZONES } from "./backgrounds/NightGrade";
import { AgentOrb } from "./components/AgentOrb";
import { FONT } from "./theme";

/** Test bench for NightGrade (Scene 7). Text zones are outlined so stars can be checked against them. */
export const NightGradeTest: React.FC<{
  grade: number;
  showZones: boolean;
}> = ({ grade, showZones }) => (
  <AbsoluteFill>
    <PlateBackground plate="04" night={grade} duration={600} />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <AgentOrb size={150} lead nightGlow={grade > 0.3} />
    </AbsoluteFill>
    {showZones
      ? DEFAULT_TEXT_ZONES.map((z, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: z.x,
              top: z.y,
              width: z.w,
              height: z.h,
              outline: "2px dashed rgba(255,160,200,0.8)",
            }}
          />
        ))
      : null}
    <div
      style={{
        position: "absolute",
        left: 120,
        bottom: 120,
        fontFamily: FONT.mono,
        fontSize: 32,
        color: "#fff",
        background: "rgba(0,0,0,0.4)",
        padding: "8px 16px",
        borderRadius: 10,
      }}
    >
      NightGrade {grade.toFixed(2)}
    </div>
  </AbsoluteFill>
);
