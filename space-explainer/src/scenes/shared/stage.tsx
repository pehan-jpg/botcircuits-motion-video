import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE } from "../../theme";
import { sceneById, type SceneId } from "../../timeline";
import { Cursor, type CursorKey } from "../../components/Cursor";
import { StatusPill } from "../../components/StatusPill";
import { featureTitleTiming, frameRiseStyle, type TitleVariant } from "../../components/FeatureTitle";
import { camTransform, PRODUCT_RECT, ProductWindow, type Cam } from "../../components/chat/ProductWindow";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ramp = (x: number, a: number, b: number) => interpolate(x, [a, b], [0, 1], clamp);
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Time helpers for a scene: t in seconds from the scene start, absolute clock for orbs and figures. */
export const useScene = (id: SceneId) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const def = sceneById(id);
  return { frame, fps, t: frame / fps, F: (s: number) => Math.round(s * fps), clock: def.start, dur: def.duration, start: def.start };
};

/**
 * Standard UI scene opening: the previous scene's frame sinks and fades
 * (0 to sinkEnd), the FeatureTitle plays from titleStart, and the frame rises
 * again 0.3s before the title has left.
 */
export const opening = (t: number, title: string, titleStart: number, variant: TitleVariant, sinkEnd = 0.45) => {
  const T = featureTitleTiming(title, variant);
  const sink = EASE(ramp(t, 0, sinkEnd));
  const riseStart = titleStart + T.frameRiseStart;
  const rise = EASE(ramp(t, riseStart, riseStart + 0.9));
  const showPrev = t < sinkEnd + 0.001;
  const frameStyle: React.CSSProperties = showPrev
    ? { opacity: 1 - sink, transform: `translateY(${40 * sink}px) scale(${1 - 0.06 * sink})`, transformOrigin: "50% 50%" }
    : frameRiseStyle(rise);
  const visible = showPrev ? sink < 1 : rise > 0;
  return { T, sink, rise, riseStart, riseEnd: riseStart + 0.9, showPrev, frameStyle, visible, titleEnd: titleStart + T.exitEnd };
};

/** Product window under a camera, with an optional cursor in the same space. */
export const ProductStage: React.FC<{
  cam: Cam;
  frameStyle?: React.CSSProperties;
  visible?: boolean;
  cursor?: { keys: CursorKey[]; opacity: number };
  children: React.ReactNode;
  overlay?: React.ReactNode;
}> = ({ cam, frameStyle, visible = true, cursor, children, overlay }) =>
  visible ? (
    <AbsoluteFill style={{ transform: camTransform(cam), transformOrigin: "0 0" }}>
      <div style={{ position: "absolute", left: PRODUCT_RECT.x, top: PRODUCT_RECT.y, width: PRODUCT_RECT.w, height: PRODUCT_RECT.h, ...frameStyle }}>
        <ProductWindow>{children}</ProductWindow>
        {overlay}
      </div>
      {cursor && cursor.opacity > 0 ? <Cursor keys={cursor.keys} opacity={cursor.opacity} /> : null}
    </AbsoluteFill>
  ) : null;

export type Pill = { label: string; at: number; until: number; spin?: boolean; top?: number };

/** Frosted narration pill, bottom centre, one at a time. */
export const Pills: React.FC<{ t: number; pills: Pill[]; top?: number }> = ({ t, pills, top = 912 }) => {
  const p = pills.find((x) => t >= x.at && t < x.until + 0.35);
  if (!p) return null;
  const inP = EASE(ramp(t, p.at, p.at + 0.3));
  const outP = EASE(ramp(t, p.until, p.until + 0.35));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: p.top ?? top, display: "flex", justifyContent: "center" }}>
      <div style={{ opacity: inP * (1 - outP), transform: `translateY(${(1 - inP) * 14}px)` }}>
        <StatusPill label={p.label} spinning={Boolean(p.spin)} />
      </div>
    </div>
  );
};
