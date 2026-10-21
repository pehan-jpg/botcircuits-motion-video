import { AbsoluteFill, Easing, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ClipConfig, TIMING, cssFilter } from "../config";

type Props = {
  readonly clip: ClipConfig;
  /** Source start in seconds; defaults to the clip's configured start. */
  readonly startSec?: number;
  /** Disable the push-in (used by the loop tail so it matches frame 0). */
  readonly staticScale?: boolean;
};

export const ClipScene: React.FC<Props> = ({ clip, startSec = clip.startSec, staticScale = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        backgroundColor: "#1e140c",
      }}
    >
      <AbsoluteFill
        style={{
          transformOrigin: clip.pushOrigin,
          scale: staticScale
            ? TIMING.pushIn.from
            : interpolate(frame, [0, TIMING.sceneFrames], [TIMING.pushIn.from, TIMING.pushIn.to], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.linear,
              }),
        }}
      >
        <OffthreadVideo
          src={staticFile(clip.src)}
          trimBefore={Math.round(startSec * fps)}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: clip.objectPosition,
            filter: cssFilter(clip.correction),
            scale: clip.mirror ? "-1 1" : undefined,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
