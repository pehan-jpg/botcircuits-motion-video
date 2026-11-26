import React from "react";
import { AbsoluteFill, Easing, Img, getStaticFiles, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AgentCard, CardConfigProvider, type CardMotion } from "../components/AgentCard";
import { easeOut } from "../components/AgentCard/timing";
import { healthcareStates } from "../data/healthcare";
import { HEALTHCARE as H, HEALTHCARE_DURATION, healthcareCardConfig } from "./config";

export type HealthcareHeroProps = {
  /** false renders the card layer alone on a transparent background. */
  showBackground: boolean;
};

const mod = (n: number, m: number) => ((n % m) + m) % m;

type Placed = { index: number; local: number; motion: CardMotion; z: number; peeking: boolean };

/**
 * Where every card is at frame `f`. Card i starts entering `enterFrames`
 * before its scene boundary, and time wraps around the loop, so the last
 * 12 frames are exactly the Scene 4 → Scene 1 transition seen at frame 0.
 */
const placeCards = (f: number): Placed[] => {
  const out: Placed[] = [];
  for (let i = 0; i < H.scenes; i++) {
    const t = mod(f - (i * H.sceneFrames - H.enterFrames), HEALTHCARE_DURATION);
    const ease = (x: number) => easeOut(Math.min(Math.max(x, 0), 1));
    if (t < H.enterFrames) {
      const p = ease(t / H.enterFrames);
      out.push({
        index: i,
        local: t,
        z: 2,
        peeking: false,
        motion: {
          opacity: p,
          translateY: (1 - p) * H.enterFrom.translateY,
          scale: interpolate(p, [0, 1], [H.enterFrom.scale, 1]),
          blur: (1 - p) * H.enterFrom.blur,
        },
      });
    } else if (t < H.sceneFrames) {
      out.push({ index: i, local: t, z: 2, peeking: false, motion: { opacity: 1, translateY: 0, scale: 1, blur: 0 } });
    } else if (t < H.sceneFrames + H.enterFrames + H.peekFadeFrames) {
      // Next card is arriving: step back to the peek position, then fade out.
      const q = ease((t - H.sceneFrames) / H.enterFrames);
      const fade = interpolate(t - H.sceneFrames - H.enterFrames, [0, H.peekFadeFrames], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.cubic),
      });
      out.push({
        index: i,
        local: t,
        z: 1,
        peeking: true,
        motion: {
          opacity: interpolate(q, [0, 1], [1, H.peek.opacity]) * fade,
          translateY: q * H.peek.translateY,
          scale: interpolate(q, [0, 1], [1, H.peek.scale]),
          blur: 0,
          // Contents clear first, so only the glass edge peeks behind the new card.
          contentOpacity: interpolate(t - H.sceneFrames, [0, H.enterFrames * 0.45], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        },
      });
    }
  }
  return out.sort((a, b) => a.z - b.z);
};

const Background: React.FC<{ frame: number }> = ({ frame }) => {
  // Cosine ease-in-out: 1.00 at frame 0, 1.04 at the midpoint, back to 1.00 at the loop point.
  const scale = 1 + ((H.bgScaleMax - 1) * (1 - Math.cos((2 * Math.PI * frame) / HEALTHCARE_DURATION))) / 2;
  const hasImage = getStaticFiles().some((f) => f.name === H.bgFile);
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: "50% 50%" }}>
      {hasImage ? (
        <Img src={staticFile(H.bgFile)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        // Placeholder until public/hero-healthcare.jpg is added.
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 30% 40%, #3a4a4f 0%, #1d2629 55%, #0f1416 100%)",
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export const HealthcareHero: React.FC<HealthcareHeroProps> = ({ showBackground }) => {
  const frame = useCurrentFrame();
  const cards = placeCards(frame);
  return (
    <AbsoluteFill style={{ backgroundColor: showBackground ? "#000" : "transparent" }}>
      {showBackground && <Background frame={frame} />}
      <CardConfigProvider config={healthcareCardConfig}>
        {cards.map((c) => (
          <div key={c.index} style={{ position: "absolute", left: H.cardLeft, top: H.cardTop, zIndex: c.z }}>
            <AgentCard
              state={healthcareStates[c.index]}
              frame={c.local}
              durationInFrames={H.sceneFrames}
              motion={c.motion}
              showStack={!c.peeking}
            />
          </div>
        ))}
      </CardConfigProvider>
    </AbsoluteFill>
  );
};
