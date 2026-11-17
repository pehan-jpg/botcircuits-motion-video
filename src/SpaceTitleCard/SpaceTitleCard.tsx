import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, interpolate, useCurrentFrame } from "remotion";
import { getStaticFiles } from "@remotion/studio";
import { measureText } from "@remotion/layout-utils";
import { EASE, HEADLINE_CPS, INK } from "../constants";
import { FONT_FAMILY, waitForFonts } from "../fonts";
import { mix, progress } from "../anim";
import { BrandSymbol, BrandWordmark, LOGO_FILE, WORDMARK_ASPECT, WORDMARK_FILE } from "../components/BrandAssets";
import { LimeUnderline } from "../components/LimeUnderline";
import { SafeAreaGuard } from "../components/SafeAreaGuard";
import { Typewriter } from "../components/Typewriter";
import { CLAMP, ProcessLayer, TableCard } from "./Process";
import { DURATION, MERGE_POINT, T, TITLE, TITLE_TEXT, UNDERLINE_WORD, WORDMARK_IN } from "./timeline";

export type SpaceTitleCardProps = {
  loop: boolean;
  guards: boolean;
  /** Overrides public/ detection (the render script passes what is on disk). */
  logoAvailable?: boolean | null;
  wordmarkAvailable?: boolean | null;
};

const hasStatic = (name: string): boolean => {
  try {
    return getStaticFiles().some((f) => f.name === name);
  } catch {
    return false;
  }
};

/* ---------- backdrop: white base, cool mint to sky pastel, drifts at most 3 percent ---------- */
const Backdrop: React.FC<{ frame: number; loop: boolean }> = ({ frame, loop }) => {
  // percent, 0 -> 3 (in loop mode it drifts out and back so the seam is invisible)
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

type TitleMetrics = { textWidth: number; boxWidth: number; boxHeight: number };

const useTitleMetrics = (): TitleMetrics | null => {
  const [m, setM] = useState<TitleMetrics | null>(null);
  const [handle] = useState(() => delayRender("Measuring title"));
  useEffect(() => {
    waitForFonts()
      .then(() => {
        const { width } = measureText({
          text: TITLE_TEXT,
          fontFamily: FONT_FAMILY,
          fontSize: TITLE.fontSize,
          fontWeight: String(TITLE.fontWeight),
          letterSpacing: "normal",
          validateFontIsLoaded: true,
        });
        setM({
          textWidth: width,
          boxWidth: Math.ceil(width) + 8, // room for the caret
          boxHeight: TITLE.fontSize * TITLE.lineHeight,
        });
        continueRender(handle);
      })
      .catch((e) => {
        throw e;
      });
  }, [handle]);
  return m;
};

export const SpaceTitleCard: React.FC<SpaceTitleCardProps> = ({ loop, guards, logoAvailable, wordmarkAvailable }) => {
  const frame = useCurrentFrame();
  const metrics = useTitleMetrics();
  const logoOk = logoAvailable ?? hasStatic(LOGO_FILE);
  const wordOk = wordmarkAvailable ?? hasStatic(WORDMARK_FILE);

  // Merge: the whole process scene converges into the merge point (shared element, ease out).
  const m = progress(frame, T.merge[0], T.merge[1]);
  const sceneScale = 1 - 0.9 * m;
  const sceneOpacity = interpolate(frame, [mix(T.merge[0], T.merge[1], 0.45), T.merge[1]], [1, 0], CLAMP);
  const sceneOrigin = `${MERGE_POINT.x}px ${MERGE_POINT.y}px`;

  // Lockup geometry, centred as a block.
  const wordW = TITLE.wordmarkHeight * WORDMARK_ASPECT;
  const boxW = metrics?.boxWidth ?? 0;
  const total = TITLE.symbolSize + TITLE.gapSymbol + boxW + TITLE.gapWordmark + wordW;
  const left = 960 - total / 2;
  const symbolSlot = { x: left + TITLE.symbolSize / 2, y: TITLE.centreY };
  const textLeft = left + TITLE.symbolSize + TITLE.gapSymbol;
  const wordLeft = textLeft + boxW + TITLE.gapWordmark;

  // Symbol emerges at the merge point, then moves to its slot in the lockup.
  const sIn = progress(frame, T.symbolIn[0], T.symbolIn[1]);
  const sMove = progress(frame, T.symbolMove[0], T.symbolMove[1]);
  const symX = mix(MERGE_POINT.x, symbolSlot.x, sMove);
  const symY = mix(MERGE_POINT.y, symbolSlot.y, sMove);
  const symScale = mix(mix(0.5, 1.3, sIn), 1, sMove);

  const wIn = progress(frame, WORDMARK_IN[0], WORDMARK_IN[1]);

  const loopOut = loop ? interpolate(frame, [T.loopOut[0], T.loopOut[1] - 6], [1, 0], { ...CLAMP, easing: EASE }) : 1;
  const loopCardIn = loop ? interpolate(frame, [T.loopOut[0] + 6, T.loopOut[1] - 1], [0, 1], { ...CLAMP, easing: EASE }) : 0;

  const titleBox = metrics ? { width: metrics.boxWidth, height: metrics.boxHeight } : null;

  return (
    <AbsoluteFill style={{ fontFamily: FONT_FAMILY }}>
      <Backdrop frame={frame} loop={loop} />
      <SafeAreaGuard enabled={guards && metrics !== null} titleStartFrame={T.titleStart} titleBox={titleBox}>
        {frame < T.merge[1] ? (
          <AbsoluteFill style={{ transform: `scale(${sceneScale})`, transformOrigin: sceneOrigin, opacity: sceneOpacity }}>
            <TableCard frame={frame} mode="story" skipPop={loop} />
            <ProcessLayer frame={frame} />
          </AbsoluteFill>
        ) : null}

        {frame >= T.symbolIn[0] && sIn > 0 ? (
          <div
            data-guard="symbol"
            style={{
              position: "absolute",
              left: symX - TITLE.symbolSize / 2,
              top: symY - TITLE.symbolSize / 2,
              width: TITLE.symbolSize,
              height: TITLE.symbolSize,
              transform: `scale(${symScale})`,
              opacity: Math.min(1, sIn * 1.6) * loopOut,
            }}
          >
            <BrandSymbol size={TITLE.symbolSize} available={logoOk} />
          </div>
        ) : null}

        {metrics && frame >= T.titleStart ? (
          <>
            <div
              style={{
                position: "absolute",
                left: textLeft,
                top: TITLE.centreY - metrics.boxHeight / 2,
                opacity: loopOut,
              }}
            >
              <Typewriter
                text={TITLE_TEXT}
                startFrame={T.titleStart}
                cps={HEADLINE_CPS}
                fontFamily={FONT_FAMILY}
                fontSize={TITLE.fontSize}
                fontWeight={TITLE.fontWeight}
                lineHeight={TITLE.lineHeight}
                boxWidth={metrics.boxWidth}
                color={INK}
                decorate={{
                  from: 0,
                  to: UNDERLINE_WORD.length,
                  render: () => (
                    <LimeUnderline
                      startFrame={T.underline}
                      style={{ position: "absolute", left: 2, right: 2, top: "100%", marginTop: 2 }}
                    />
                  ),
                }}
              />
            </div>
            <div
              data-guard="wordmark"
              style={{
                position: "absolute",
                left: wordLeft,
                top: TITLE.centreY - TITLE.wordmarkHeight / 2 + 4,
                opacity: wIn * loopOut,
                transform: `translate(${(1 - wIn) * -14}px, ${(1 - wIn) * 16}px)`,
              }}
            >
              <BrandWordmark height={TITLE.wordmarkHeight} available={wordOk} />
            </div>
          </>
        ) : null}

        {loop && loopCardIn > 0 ? (
          <div style={{ opacity: loopCardIn, position: "absolute", inset: 0 }}>
            <TableCard frame={DURATION} mode="empty" skipPop />
          </div>
        ) : null}
      </SafeAreaGuard>
    </AbsoluteFill>
  );
};
