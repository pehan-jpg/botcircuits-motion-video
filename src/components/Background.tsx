import React from "react";
import { AbsoluteFill } from "remotion";
import { useTimeline } from "../anim";
import { ATMOSPHERE } from "../content";
import { C, EASE_CAMERA } from "../theme";

// Flat white. A pale lime to mint atmosphere appears only at the moments
// listed in ATMOSPHERE, fades in and clears within about a second.
export const Background: React.FC = () => {
  const { p, t } = useTimeline();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {ATMOSPHERE.map((a) => {
        const level =
          p(a.at, a.peak - a.at, EASE_CAMERA) *
          (1 - p(a.peak + 0.15, a.end - a.peak - 0.15, EASE_CAMERA));
        if (level <= 0) return null;
        // Slow drift so the colour feels alive while it is visible.
        const dx = Math.sin(t * 1.3) * 30;
        const dy = Math.cos(t * 1.1) * 24;
        return (
          <AbsoluteFill
            key={a.at}
            style={{
              opacity: level,
              backgroundImage: [
                `radial-gradient(300px 380px at ${a.cx - 170 + dx}px ${a.cy - 160 + dy}px, ${C.paleLime} 0%, rgba(238,247,207,0) 100%)`,
                `radial-gradient(320px 400px at ${a.cx + 180 - dx}px ${a.cy + 170 - dy}px, ${C.paleMint} 0%, rgba(220,239,230,0) 100%)`,
                `radial-gradient(420px 560px at ${a.cx}px ${a.cy}px, rgba(238,247,207,0.9) 0%, rgba(220,239,230,0.6) 55%, rgba(255,255,255,0) 100%)`,
              ].join(","),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
