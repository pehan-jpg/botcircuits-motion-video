import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";

// Inter (SIL Open Font License), variable latin subset bundled locally so
// renders work offline and are identical on every machine.
loadFont({
  family: "Inter",
  url: staticFile("fonts/Inter-latin.woff2"),
  weight: "100 900",
});

export const FONT = "Inter, sans-serif";

export const C = {
  bg: "#FFFFFF",
  ink: "#1D2125",
  muted: "#6B7280",
  line: "#E6E8EB",
  lime: "#B4F000",
  limeSoft: "#EAF9B8",
  chartreuse: "#E2FF7A",
  wallpaper: "#F4F1EA",
  panel: "#F3F4F6",
  frame: "#ECEEF0",
  read: "#3B82F6",
};

export const R = { bubble: 30, card: 22, phone: 84 };

// One easing family for the whole video.
export const EASE_IN = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_CAMERA = Easing.bezier(0.65, 0, 0.35, 1);

export const PHONE = {
  width: 800,
  height: 1290,
  top: 150,
  border: 14,
  headerHeight: 150,
  inputHeight: 124,
};

export const CAPTION_TOP = 1530;
