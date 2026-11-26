import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

import { continueRender, delayRender } from "remotion";

let loaded = false;
export const loadFont = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const handle = delayRender("Loading Inter");
  Promise.all(
    ["400", "500", "600", "700"].map((w) =>
      document.fonts.load(`${w} 20px Inter`),
    ),
  )
    .then(() => continueRender(handle))
    .catch(() => continueRender(handle));
};
