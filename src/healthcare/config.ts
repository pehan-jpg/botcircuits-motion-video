import { FONT_HOST_GROTESK } from "../components/AgentCard/fonts";
import { theme, type CardConfig } from "../components/AgentCard";

/** All Healthcare hero timing and layout values (frames at 30 fps). */
export const HEALTHCARE = {
  fps: 30,
  width: 1920,
  height: 1080,
  sceneFrames: 120, // 4 s per scene
  scenes: 4,
  /** New card entrance; also the loop overlap (last 12 frames → frame 0). */
  enterFrames: 12,
  /** After the entrance, the previous card fades out from its peek position. */
  peekFadeFrames: 18,
  /** Card enters from: */
  enterFrom: { translateY: 24, scale: 0.96, blur: 6 },
  /** Previous card's peek position. */
  peek: { translateY: -10, scale: 0.94, opacity: 0.5 },
  /** Card top-left in the frame: right of centre, left half kept clear for the headline. */
  cardLeft: 1920 - 80 - theme.cardWidth,
  cardTop: 160, // card centres land at ~36–37% of the frame height
  /** Background push-in: 1.00 → 1.04 → 1.00 over the loop. */
  bgScaleMax: 1.04,
  bgFile: "hero-healthcare.jpg",
} as const;

export const HEALTHCARE_DURATION = HEALTHCARE.sceneFrames * HEALTHCARE.scenes; // 480

export const healthcareCardConfig: CardConfig = {
  fontFamily: FONT_HOST_GROTESK,
  roleColor: theme.lime,
  // 80 ms stagger between content lines (60fps units: 0.08 s × 60).
  timing: { headerStagger: 4.8, contentStagger: 4.8, contentStart: 22 },
};
