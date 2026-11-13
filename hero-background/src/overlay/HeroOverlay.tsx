import { AbsoluteFill, Freeze, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COMP, toFrames, validateTimeline } from "./config";
import { timeOf } from "./motion";
import { TEXT_CLASS } from "./ui";
import { CardSecurity } from "./scenes/CardSecurity";
import { InsuranceClaim } from "./scenes/InsuranceClaim";
import { OrderDelivery } from "./scenes/OrderDelivery";
import { TravelUpdate } from "./scenes/TravelUpdate";
import { Flare, LimeBand, VideoWrapper, transitionState } from "./transitions";

// Fail fast if a scene drifts within the minimum gap of a cut or the loop point.
validateTimeline();

export type HeroOverlayProps = {
  /** false renders the clean version: base video and transitions only, no cards or glass. */
  showOverlay: boolean;
  /** Output frame rate (60 by default; 30 for the comparison copy). */
  fps: number;
  /** Verification only: hide all overlay text so the glass behind it can be sampled. */
  hideText?: boolean;
  /** Verification only: hold the base video on this time (s), to test that cards are still. */
  freezeBaseAt?: number | null;
};

export const HeroOverlay: React.FC<HeroOverlayProps> = ({ showOverlay, hideText = false, freezeBaseAt = null }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = transitionState(timeOf(frame, fps));
  const video = <OffthreadVideo src={staticFile(COMP.sources[COMP.baseVideo])} muted style={{ width: "100%", height: "100%" }} />;

  return (
    <AbsoluteFill style={{ backgroundColor: COMP.backdrop, overflow: "hidden" }}>
      <VideoWrapper state={t}>
        {/* Base video as selected in config: no scaling, trim or filters in Remotion, muted. */}
        {freezeBaseAt === null ? video : <Freeze frame={toFrames(freezeBaseAt, fps)}>{video}</Freeze>}
      </VideoWrapper>
      <Flare opacity={t.flareOpacity} />
      <LimeBand band={t.band} />

      {hideText ? <style>{`.${TEXT_CLASS} { color: transparent !important; text-shadow: none !important; }`}</style> : null}
      {showOverlay ? (
        <>
          <TravelUpdate />
          <CardSecurity />
          <OrderDelivery />
          <InsuranceClaim />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
