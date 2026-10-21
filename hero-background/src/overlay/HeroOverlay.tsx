import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { COMP, validateTimeline } from "./config";
import { BoardingPass } from "./scenes/BoardingPass";
import { BookingProgress } from "./scenes/BookingProgress";
import { ConciergeHandoff } from "./scenes/ConciergeHandoff";
import { FlightUpdate } from "./scenes/FlightUpdate";
import { Flare, LimeBand, VideoWrapper, transitionState } from "./transitions";

// Fail fast if a scene drifts within the minimum gap of a cut or the loop point.
validateTimeline();

export const HeroOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const t = transitionState(frame);

  return (
    <AbsoluteFill style={{ backgroundColor: COMP.backdrop, overflow: "hidden" }}>
      <VideoWrapper state={t}>
        {/* The merged base video, untouched: no grade, no trim, muted. */}
        <OffthreadVideo src={staticFile(COMP.src)} muted style={{ width: "100%", height: "100%" }} />
      </VideoWrapper>
      <Flare opacity={t.flareOpacity} />
      <LimeBand band={t.band} />

      <FlightUpdate />
      <BookingProgress />
      <BoardingPass />
      <ConciergeHandoff />
    </AbsoluteFill>
  );
};
