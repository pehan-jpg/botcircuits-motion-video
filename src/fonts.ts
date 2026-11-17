import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";

const loaded = loadFont("normal", {
  weights: ["500", "600"],
  subsets: ["latin"],
});

export const FONT_FAMILY = loaded.fontFamily;
export const waitForFonts = loaded.waitUntilDone;
