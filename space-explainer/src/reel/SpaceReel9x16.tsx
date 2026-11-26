import React from "react";
import { AbsoluteFill, interpolate, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/fonts";
import { reelCropAt } from "./camera";
import { CAPTION_MAX_W, CAPTION_PX, REEL_CHUNKS } from "./captions";

/**
 * 9:16 reel of the finished 16:9 video. The source is the silent high
 * resolution render (out/space_video_4k_silent.mp4, linked into public/reel);
 * a panel 1080px wide, centred at y 790, shows a crop of it that follows the
 * reel camera. Captions sit below the panel. Nothing here touches the 16:9 film.
 */
export const REEL = { w: 1080, h: 1920, panelCentreY: 790, captionTop: 1390 };
/** Pixel scale of the source render (rendered with --scale=1.5: 2880x1620). */
export const SOURCE_SCALE = 1.5;
/**
 * The source is served from out/ by a local file server during renders
 * (python3 -m http.server 8765 --directory out), so the large file is never copied into the bundle.
 */
export const REEL_SOURCE_URL = "http://localhost:8765/space_video_4k_silent.mp4";
/** Fades: 4 frames of the 30fps reel (8 composition frames at 60fps). */
const FADE_FRAMES = 8;

const INTER = "Inter";
loadFont({ family: INTER, url: staticFile("fonts/inter-latin-600-normal.woff2"), weight: "600" });

/** `src` (a URL) and `sourceScale` let the stills check preview against the 1080p render. */
export const SpaceReel9x16: React.FC<{ src?: string; sourceScale?: number }> = ({ src, sourceScale = SOURCE_SCALE }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const c = reelCropAt(t);
  const panelH = REEL.w * c.aspect;
  const k = REEL.w / (c.w * sourceScale);
  const chunk = REEL_CHUNKS.find((x) => t >= x.from && t < x.to);
  const fade = chunk
    ? Math.min(
        interpolate(frame, [chunk.from * fps, chunk.from * fps + FADE_FRAMES], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        interpolate(frame, [chunk.to * fps - FADE_FRAMES, chunk.to * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      )
    : 0;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #15132B 0%, #221E4A 100%)" }}>
      <div
        data-reel-panel
        style={{ position: "absolute", left: 0, top: REEL.panelCentreY - panelH / 2, width: REEL.w, height: panelH, overflow: "hidden", borderRadius: 0 }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `scale(${k}) translate(${-c.x0 * sourceScale}px, ${-c.y0 * sourceScale}px)` }}>
          <OffthreadVideo src={src ?? REEL_SOURCE_URL} muted style={{ width: 1920 * sourceScale, height: 1080 * sourceScale, display: "block" }} />
        </div>
      </div>
      {chunk ? (
        <div
          data-reel-caption
          style={{
            position: "absolute",
            left: (REEL.w - CAPTION_MAX_W) / 2,
            top: REEL.captionTop,
            width: CAPTION_MAX_W,
            textAlign: "center",
            fontFamily: `${INTER}, sans-serif`,
            fontWeight: 600,
            fontSize: CAPTION_PX,
            lineHeight: 1.2,
            color: "#FFFFFF",
            textShadow: "0 2px 14px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.35)",
            opacity: fade,
          }}
        >
          {chunk.text}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
