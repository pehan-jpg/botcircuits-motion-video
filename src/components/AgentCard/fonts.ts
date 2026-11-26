import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/host-grotesk/400.css";
import "@fontsource/host-grotesk/500.css";
import "@fontsource/host-grotesk/600.css";
import "@fontsource/host-grotesk/700.css";

import { continueRender, delayRender } from "remotion";

export const FONT_INTER = "Inter, system-ui, sans-serif";
export const FONT_HOST_GROTESK = "'Host Grotesk', system-ui, sans-serif";

let loaded = false;
export const loadFont = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const handle = delayRender("Loading card fonts");
  const loads = ["400", "500", "600", "700"].flatMap((w) => [
    document.fonts.load(`${w} 20px Inter`),
    document.fonts.load(`${w} 20px "Host Grotesk"`),
  ]);
  Promise.all(loads)
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
};
