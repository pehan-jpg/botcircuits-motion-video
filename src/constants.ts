import { Easing } from "remotion";

// Brand and shared motion constants. Shared by every title card in this project.
export const INK = "#0D1224";
// PLACEHOLDER lime: replace with the official BotCircuits lime when confirmed.
export const BRAND_LIME = "#96C93D";

export const EASE = Easing.bezier(0.22, 1, 0.36, 1);
export const FPS = 60;
export const sec = (n: number): number => Math.round(n * FPS);
export const HEADLINE_CPS = 20;

export const WIDTH = 1920;
export const HEIGHT = 1080;
export const SAFE = 96;
// Centre 60 percent of the frame.
export const CENTRE_BOX = {
  left: WIDTH * 0.2,
  right: WIDTH * 0.8,
  top: HEIGHT * 0.2,
  bottom: HEIGHT * 0.8,
};

// Rule: no pop may overshoot by more than 4 percent.
export const MAX_OVERSHOOT = 1.04;
