import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";

// Plus Jakarta Sans (500, 600) for all text; JetBrains Mono only for tiny labels.
// The files are the Google Fonts originals listed by @remotion/google-fonts,
// vendored into public/fonts by scripts/vendor-fonts.mjs so renders work offline.
export const SANS = "Plus Jakarta Sans";
export const MONO = "JetBrains Mono";

const faces = [
  { family: SANS, weight: "500", file: "fonts/PlusJakartaSans-500-latin.woff2" },
  { family: SANS, weight: "600", file: "fonts/PlusJakartaSans-600-latin.woff2" },
  { family: MONO, weight: "500", file: "fonts/JetBrainsMono-500-latin.woff2" },
];

let loading: Promise<unknown> | null = null;
const loadAll = () =>
  (loading ??= Promise.all(
    faces.map((f) =>
      loadFont({ family: f.family, url: staticFile(f.file), weight: f.weight, format: "woff2" }),
    ),
  ));

/** Blocks the render until every face is loaded, so text measurement is exact. */
export const useFontsReady = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("Loading fonts"));
  useEffect(() => {
    loadAll().then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  return ready;
};
