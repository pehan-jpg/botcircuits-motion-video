import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { COMP, validateTimeline } from "./config";
import { AiConcierge } from "./scenes/AiConcierge";
import { BoardingPass } from "./scenes/BoardingPass";
import { BookingProgress } from "./scenes/BookingProgress";
import { FlightUpdate } from "./scenes/FlightUpdate";
import { Flare, LimeBand, VideoWrapper, transitionState } from "./transitions";

// Fail fast if a scene drifts within the minimum gap of a cut or the loop point.
validateTimeline();

export type HeroOverlayProps = {
  /** false renders the clean version: base video and transitions only, no cards or glass. */
  showOverlay: boolean;
};

export const HeroOverlay: React.FC<HeroOverlayProps> = ({ showOverlay }) => {
  const frame = useCurrentFrame();
  const t = transitionState(frame);

  return (
    <AbsoluteFill style={{ backgroundColor: COMP.backdrop, overflow: "hidden" }}>
      <VideoWrapper state={t}>
        {/* Base video as selected in config: no scaling, trim or filters in Remotion, muted. */}
        <OffthreadVideo src={staticFile(COMP.sources[COMP.baseVideo])} muted style={{ width: "100%", height: "100%" }} />
      </VideoWrapper>
      <Flare opacity={t.flareOpacity} />
      <LimeBand band={t.band} />

      {showOverlay ? (
        <>
          <FlightUpdate />
          <BookingProgress />
          <BoardingPass />
          <AiConcierge />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
