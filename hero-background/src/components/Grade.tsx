import { AbsoluteFill, useCurrentFrame } from "remotion";
import { GRADE, VIDEO } from "../config";

/** Shared look applied above every scene: tint, shadow floor, vignette, safe zone, grain. */
export const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  const { tint, vignette, shadowFloor, grain, safeZone } = GRADE;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ backgroundColor: tint.color, opacity: tint.opacity, mixBlendMode: tint.blend }} />
      <AbsoluteFill style={{ backgroundColor: shadowFloor.color, opacity: shadowFloor.opacity, mixBlendMode: "lighten" }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 75% 75% at 50% 50%, rgba(${vignette.color}, 0) ${vignette.innerRadiusPct}%, rgba(${vignette.color}, ${vignette.edgeOpacity}) 100%)`,
        }}
      />
      {/* Lower-right safe zone: soft gradient anchored in the corner, no hard edges. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${safeZone.widthPct * 1.6}% ${safeZone.heightPct * 1.6}% at 100% 100%, rgba(${safeZone.color}, ${safeZone.opacity}) 0%, rgba(${safeZone.color}, ${safeZone.opacity * 0.85}) 45%, rgba(${safeZone.color}, 0) 100%)`,
        }}
      />
      <AbsoluteFill style={{ opacity: grain.opacity }}>
        <svg width={VIDEO.width} height={VIDEO.height} viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency={grain.baseFrequency} numOctaves={grain.octaves} seed={frame} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
