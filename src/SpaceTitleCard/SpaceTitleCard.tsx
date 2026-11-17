import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { getStaticFiles } from "@remotion/studio";
import { EASE, INK } from "../constants";
import { FONT_FAMILY } from "../fonts";
import { pop, progress } from "../anim";
import { BrandSymbol, LOGO_FILE } from "../components/BrandAssets";
import { SafeAreaGuard } from "../components/SafeAreaGuard";
import { CANVAS, LogoKey, logoFile, validateGeometry } from "./geometry";
import { CLAMP, SceneContents, SceneTable } from "./Scene";
import { DURATION, T } from "./timeline";

export type EndMark = "none" | "symbol";

export type SpaceTitleCardProps = {
  loop: boolean;
  guards: boolean;
  /** "symbol": in the last 0.8s the canvas collapses into the BotCircuits symbol and holds 0.6s. */
  endMark: EndMark;
  /** At most three 18px column labels. Off by default. */
  showLabels: boolean;
  /** Files present in public/, as found by the render script. Falls back to Studio detection. */
  availableFiles?: string[] | null;
};

const LOGO_KEYS: LogoKey[] = ["gmail", "slack", "salesforce", "zendesk", "google-drive", "google-sheets"];

const studioFiles = (): string[] => {
  try {
    return getStaticFiles().map((f) => f.name);
  } catch {
    return [];
  }
};

/* backdrop: white base, cool mint to sky pastel, drifts at most 3 percent */
const Backdrop: React.FC<{ frame: number; loop: boolean }> = ({ frame, loop }) => {
  const d = loop ? 3 * Math.sin((Math.PI * frame) / DURATION) : (frame / DURATION) * 3;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#FFFFFF",
        backgroundImage: [
          `radial-gradient(60% 70% at ${18 + d}% ${22 + d * 0.5}%, rgba(196,240,222,0.85) 0%, rgba(196,240,222,0) 70%)`,
          `radial-gradient(65% 75% at ${84 - d}% ${80 - d * 0.5}%, rgba(198,226,255,0.9) 0%, rgba(198,226,255,0) 70%)`,
          `linear-gradient(${135 + d}deg, rgba(232,250,243,0.6) 0%, rgba(255,255,255,0.4) 50%, rgba(232,243,255,0.6) 100%)`,
        ].join(", "),
      }}
    />
  );
};

const LABELS = [
  { text: "Triggers", x: 130 },
  { text: "Process", x: 590 },
  { text: "Systems", x: 1075 },
];

export const SpaceTitleCard: React.FC<SpaceTitleCardProps> = ({ loop, guards, endMark, showLabels, availableFiles }) => {
  const frame = useCurrentFrame();
  const files = availableFiles ?? studioFiles();
  const logos = Object.fromEntries(LOGO_KEYS.map((k) => [k, files.includes(logoFile(k))])) as Record<LogoKey, boolean>;
  const symbolOk = files.includes(LOGO_FILE);
  const staticErrors = useMemo(() => validateGeometry(), []);

  // Canvas pop in (0.97 -> 1, fade). In loop mode the empty canvas is already there on frame 0.
  const canvasP = progress(frame, T.canvasIn[0], T.canvasIn[1]);
  const canvasScale = loop ? 1 : interpolate(canvasP, [0, 1], [0.97, 1]);
  const canvasOpacity = loop ? 1 : canvasP;

  // Loop: the contents fade in the last 0.4s, leaving the empty canvas.
  const contentsOpacity =
    loop && endMark === "none" ? interpolate(frame, [T.loopOut[0], T.loopOut[1] - 2], [1, 0], { ...CLAMP, easing: EASE }) : 1;

  // End mark: the canvas collapses into the symbol at the centre, then holds.
  const markOn = endMark === "symbol";
  const collapse = markOn ? progress(frame, T.endMarkCollapse[0], T.endMarkCollapse[1]) : 0;
  const symbolP = pop(frame, T.endMarkSymbol[0], T.endMarkSymbol[1] - T.endMarkSymbol[0]);

  const dotGrid = "radial-gradient(circle, rgba(13,18,36,0.075) 1.2px, rgba(13,18,36,0) 1.6px)";

  return (
    <AbsoluteFill style={{ fontFamily: FONT_FAMILY }}>
      <Backdrop frame={frame} loop={loop} />
      <SafeAreaGuard enabled={guards} noOverlap staticErrors={staticErrors}>
        {collapse < 1 ? (
          <div
            data-guard="canvas"
            data-guard-container=""
            style={{
              position: "absolute",
              left: CANVAS.left,
              top: CANVAS.top,
              width: CANVAS.w,
              height: CANVAS.h,
              borderRadius: CANVAS.radius,
              backgroundColor: "#FFFFFF",
              backgroundImage: dotGrid,
              backgroundSize: "24px 24px",
              backgroundPosition: "12px 12px",
              border: "1px solid rgba(13,18,36,0.08)",
              boxShadow: "0 30px 80px rgba(13,40,60,0.12), 0 6px 18px rgba(13,18,36,0.06)",
              boxSizing: "border-box",
              transform: `scale(${canvasScale * (1 - 0.94 * collapse)})`,
              opacity: canvasOpacity * (1 - interpolate(collapse, [0.4, 1], [0, 1], CLAMP)),
            }}
          >
            <div style={{ position: "absolute", inset: 0, opacity: contentsOpacity }}>
              {showLabels
                ? LABELS.map((l) => (
                    <div
                      key={l.text}
                      style={{
                        position: "absolute",
                        left: l.x - 80,
                        width: 160,
                        top: 14,
                        textAlign: "center",
                        fontSize: 18,
                        fontWeight: 600,
                        lineHeight: 1.4,
                        color: INK,
                        opacity: 0.7 * progress(frame, T.canvasIn[1], T.canvasIn[1] + 18),
                      }}
                    >
                      {l.text}
                    </div>
                  ))
                : null}
              <SceneTable frame={frame} />
              <SceneContents frame={frame} logos={logos} />
            </div>
            {contentsOpacity < 1 ? (
              // Loop return: the empty table fades back in so the last frame matches frame 0.
              <div style={{ position: "absolute", inset: 0, opacity: 1 - contentsOpacity }}>
                <SceneTable frame={0} empty />
              </div>
            ) : null}
          </div>
        ) : null}

        {markOn && frame >= T.endMarkSymbol[0] ? (
          <div
            data-guard="symbol"
            style={{
              position: "absolute",
              left: 960 - 60,
              top: 540 - 60,
              width: 120,
              height: 120,
              transform: `scale(${symbolP.scale})`,
              opacity: symbolP.opacity,
            }}
          >
            <BrandSymbol size={120} available={symbolOk} />
          </div>
        ) : null}
      </SafeAreaGuard>
    </AbsoluteFill>
  );
};
