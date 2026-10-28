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
  paleLime: "#EEF7CF",
  paleMint: "#DCEFE6",
  tint: "#8FB300",
  panel: "#F3F4F6",
};

// Messaging UI tokens, matched to the iOS reference screens.
export const WA = {
  green: "#21C063",
  bubbleOut: "#D9FDD3",
  wallpaper: "#EFEAE2",
  doodle: "#E3DACD",
  bar: "#F6F6F6",
  hairline: "#DADADC",
  separator: "#E4E4E7",
  tick: "#53BDEB",
  tickGrey: "#8696A0",
  time: "#667781",
  listGrey: "#8A8A8E",
  replyBlue: "#027EB5",
  pressed: "#E5E5EA",
  bezel: "#1D2125",
};

export const R = { bubble: 18, card: 22, phone: 84 };

// One easing family for the whole video.
export const EASE_IN = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_CAMERA = Easing.bezier(0.65, 0, 0.35, 1);

export const PHONE = {
  width: 800,
  height: 1290,
  top: 150,
  border: 14,
  statusBar: 92,
  headerHeight: 104, // navigation bar below the status bar
  inputHeight: 104,
  homeArea: 40, // space for the home indicator
};

// Inner screen size.
export const SCREEN = {
  width: PHONE.width - PHONE.border * 2,
  height: PHONE.height - PHONE.border * 2,
};

export const CAPTION_TOP = 1530;
