import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useTimeline, mix } from "../anim";
import { CLOSING } from "../content";
import { C, EASE_CAMERA } from "../theme";

const blob = (
  x: number,
  y: number,
  r: number,
  color: string,
  alpha: number,
) => {
  const hex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `radial-gradient(${r}px ${r}px at ${x}px ${y}px, ${color}${hex} 0%, ${color}00 100%)`;
};

const GRAIN_TILES = [0, 512, 1024].flatMap((x) =>
  [0, 512, 1024, 1536].map((y) => [x, y] as const),
);

// Flowing mesh gradient kept in the corners, with a static grain overlay.
export const Background: React.FC = () => {
  const { t, p } = useTimeline();
  const intro = p(0, 0.9);
  const grow = p(CLOSING.phoneOutAt, 1.2, EASE_CAMERA);

  const w = (speed: number, phase: number, amp: number) =>
    Math.sin(t * speed + phase) * amp;

  // Top right cluster.
  const trScale = mix(0.75, 1, intro) * mix(1, 1.85, grow);
  const tr = [
    blob(
      1010 + w(0.55, 0, 40),
      90 + w(0.42, 1.3, 36),
      560 * trScale,
      C.lime,
      0.55,
    ),
    blob(
      820 + w(0.37, 2.1, 50),
      -40 + w(0.5, 0.4, 30),
      460 * trScale,
      C.chartreuse,
      0.7,
    ),
    blob(
      1120 + w(0.46, 3.7, 30),
      330 + w(0.33, 2.6, 44),
      420 * trScale,
      C.chartreuse,
      0.55,
    ),
    blob(
      900 + w(0.6, 4.2, 36),
      150 + w(0.52, 5.1, 30),
      220 * trScale,
      "#FFFFFF",
      0.85,
    ),
  ];

  // Bottom left cluster, small during the chat so captions keep full contrast.
  const blScale = mix(0.55, 1, intro) * mix(1, 2.3, grow);
  const bl = [
    blob(
      -20 + w(0.41, 0.8, 30),
      1960 + w(0.47, 2.2, 26),
      420 * blScale,
      C.lime,
      0.42,
    ),
    blob(
      170 + w(0.35, 3.1, 36),
      2020 + w(0.5, 1.1, 20),
      380 * blScale,
      C.chartreuse,
      0.6,
    ),
    blob(
      60 + w(0.52, 5.4, 26),
      1840 + w(0.39, 4.4, 30),
      200 * blScale,
      "#FFFFFF",
      0.7,
    ),
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill
        style={{
          opacity: intro,
          backgroundImage: [
            ...tr.slice().reverse(),
            ...bl.slice().reverse(),
          ].join(","),
        }}
      />
      <AbsoluteFill style={{ mixBlendMode: "soft-light", opacity: 0.22 }}>
        {/* Tiled with <Img> so rendering waits for the texture to load. */}
        {GRAIN_TILES.map(([x, y]) => (
          <Img
            key={`${x}-${y}`}
            src={staticFile("grain.png")}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 512,
              height: 512,
            }}
          />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
