import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const loaded = loadFont("normal", { weights: ["500", "600"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["500"], subsets: ["latin"] });

export const FONT_FAMILY = loaded.fontFamily;
export const MONO_FAMILY = mono.fontFamily;
export const waitForFonts = () => Promise.all([loaded.waitUntilDone(), mono.waitUntilDone()]);
