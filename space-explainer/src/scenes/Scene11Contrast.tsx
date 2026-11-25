import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Check, FileText, Timer } from "lucide-react";
import { EASE, FONT, PRODUCT_THEME_LIGHT as T } from "../theme";
import { PLACEHOLDERS as P } from "../placeholders";
import { GuardLayer } from "../components/GuardLayer";
import { FEATURE_TITLE } from "../components/FeatureTitle";
import type { TextBeatSpec } from "../lib/guards";
import { Scene10EndFrame, S10_TILE_SCREEN } from "./Scene10Pages";
import { ramp, useScene } from "./shared/stage";

/**
 * Scene 11, "Same claim, minutes not hours": the clicked "Time to prepare" tile
 * opens to a white frame with two panels. Before (muted): five tools, fourteen
 * tabs and a clock that keeps running. With Space: one review pack, prepared in
 * about two minutes. Illustrative, placeholder data. No amber here.
 */
const S = "S11" as const;
const C = P.contrast;
export const S11 = { expand: [0.0, 1.0], line: 0.85, panels: [1.0, 1.5], ticks: [1.9, 2.4, 2.9, 3.4], rightClock: [1.4, 3.6], rightDone: 3.65, ready: 3.95, leftClock: [1.4, 6.8], out: [6.8, 7.95] };
const LINE_Y = 170;
const PANEL = { y: 280, w: 780, h: 600, left: 120, right: 1020 };

const lineIn = (text: string) => (text.split(" ").length - 1) * FEATURE_TITLE.stagger + FEATURE_TITLE.wordIn;
export const SCENE11_TEXT: TextBeatSpec[] = [
  { id: "line", text: C.line, readyAt: S11.line + lineIn(C.line), leaveAt: S11.out[0], fontPx: 64 },
  { id: "pack", text: `${C.pack} ${C.packItems.join(" ")}`, readyAt: S11.ticks[3] + 0.3, leaveAt: S11.out[0], fontPx: 28, exception: "Brief: 8s scene; items are read as they tick in turn" },
  { id: "ready", text: C.ready, readyAt: S11.ready + 0.3, leaveAt: S11.out[0], fontPx: 28 },
];

const fmtLeft = (min: number) => {
  const m = Math.round(min);
  if (m <= 0) return "0:00";
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} min`;
};
const fmtRight = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.round(sec) % 60).padStart(2, "0")}`;

const Chip: React.FC<{ label: string; tone?: "plain" | "lilac" }> = ({ label, tone = "plain" }) => (
  <div data-guard="text" data-guard-min="24" data-guard-label={`Chip ${label}`} style={{ display: "inline-flex", alignItems: "center", height: 48, padding: "0 18px", borderRadius: 12, background: tone === "lilac" ? T.lilacBg : "#FFFFFF", border: `1px solid ${tone === "lilac" ? T.lilacBg : T.border}`, fontFamily: FONT.sans, fontSize: 24, fontWeight: 600, color: tone === "lilac" ? T.lilacText : T.ink, whiteSpace: "nowrap" }}>
    {label}
  </div>
);

const Stopwatch: React.FC<{ label: string; done?: boolean; guard: string }> = ({ label, done, guard }) => (
  <div data-guard="text" data-guard-label={guard} style={{ display: "inline-flex", alignItems: "center", gap: 12, height: 64, padding: "0 22px", borderRadius: 16, background: done ? T.greenBg : "#F4F5F9", fontFamily: FONT.sans, fontSize: 32, fontWeight: 700, color: done ? T.greenText : T.ink, whiteSpace: "nowrap" }}>
    {done ? <Check size={28} color={T.greenText} strokeWidth={3} /> : <Timer size={28} color={T.secondary} />}
    {label}
  </div>
);

const GHOSTS: { logo: string; title: string }[] = [
  { logo: "logos/gmail.svg", title: "Inbox" },
  { logo: "logos/google-drive.svg", title: "Drive" },
  { logo: "logos/google-sheets.svg", title: "Excess and limits" },
  { logo: "logos/slack.svg", title: "#claims" },
];

export const Scene11Contrast: React.FC = () => {
  const { t, F, clock } = useScene(S);
  // The tile grows to the full frame in white.
  const g = EASE(ramp(t, S11.expand[0], S11.expand[1]));
  const T0 = S10_TILE_SCREEN;
  const rect = { x: T0.x * (1 - g), y: T0.y * (1 - g), w: T0.w + (1920 - T0.w) * g, h: T0.h + (1080 - T0.h) * g };
  const tileText = 1 - EASE(ramp(t, 0.0, 0.45));
  const panels = EASE(ramp(t, S11.panels[0], S11.panels[1]));
  const out = EASE(ramp(t, S11.out[0], S11.out[1]));
  const leftMin = 164 * ramp(t, S11.leftClock[0], S11.leftClock[1]);
  const rightSec = 124 * ramp(t, S11.rightClock[0], S11.rightClock[1]);
  const rightDone = t >= S11.rightDone;
  const ready = EASE(ramp(t, S11.ready, S11.ready + 0.3));
  // The right card grows to fill the frame in white at the end.
  const R = { x: PANEL.right, y: PANEL.y, w: PANEL.w, h: PANEL.h };
  const rOut = { x: R.x * (1 - out), y: R.y * (1 - out), w: R.w + (1920 - R.w) * out, h: R.h + (1080 - R.h) * out };
  const words = C.line.split(" ");
  // The tile fades in over the clicked tile (so the cursor and the first frame match Scene 10), then tints
  // to a soft grey under the panels so the With Space card visibly grows to white at the end.
  const tileIn = EASE(ramp(t, 0, 0.3));
  const tint = panels * (1 - out);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * tint);
  const tileBg = `rgba(${mix(255, 242)},${mix(255, 243)},${mix(255, 247)},${tileIn})`;
  // A slow push in keeps the frame alive while the stopwatches run.
  const drift = 1 + 0.03 * ramp(t, S11.panels[0], S11.out[1]);
  return (
    <AbsoluteFill style={{ width: 1920, height: 1080, background: "#FFFFFF" }}>
      {g < 1 ? (
        <AbsoluteFill data-guard-bg="Scene 10 end frame">
          <Scene10EndFrame F={F} clock={clock} />
        </AbsoluteFill>
      ) : null}
      {/* The clicked tile, growing into the white frame */}
      <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h, background: tileBg, borderRadius: 14 * (1 - g), boxShadow: g < 1 ? `0 20px 60px rgba(20,24,60,${0.18 * (1 - g) * tileIn})` : undefined, overflow: "hidden" }}>
        {tileText > 0 ? (
          <div style={{ position: "absolute", left: 20 * (T0.w / 281), top: 16 * (T0.w / 281), opacity: tileText * tileIn, fontFamily: FONT.sans, transform: `scale(${T0.w / 281})`, transformOrigin: "0 0" }}>
            <div style={{ fontSize: 15.2, color: T.secondary }}>{P.pages.kpis[1].label}</div>
            <div style={{ fontSize: 23.5, fontWeight: 700, color: T.ink, marginTop: 8 }}>{P.pages.kpis[1].value}</div>
          </div>
        ) : null}
      </div>

      <div style={{ position: "absolute", inset: 0, transform: `scale(${drift})`, transformOrigin: "50% 50%" }}>
      {/* Top line */}
      {t >= S11.line ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: LINE_Y, display: "flex", justifyContent: "center", transform: "translateY(-50%)", opacity: 1 - out }}>
          <div data-guard="text" data-guard-label="Contrast line" style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 64, letterSpacing: FEATURE_TITLE.tracking, color: T.ink, whiteSpace: "nowrap" }}>
            {words.map((w, i) => {
              const p = EASE(ramp(t - S11.line, i * FEATURE_TITLE.stagger, i * FEATURE_TITLE.stagger + FEATURE_TITLE.wordIn));
              return (
                <React.Fragment key={i}>
                  <span style={{ display: "inline-block", opacity: p, filter: p < 1 ? `blur(${12 * (1 - p)}px)` : undefined, transform: `translateY(${14 * (1 - p)}px)` }}>{w}</span>
                  {i < words.length - 1 ? " " : null}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Before: muted */}
      {panels > 0 ? (
        <div style={{ position: "absolute", left: PANEL.left, top: PANEL.y, width: PANEL.w, height: PANEL.h, boxSizing: "border-box", borderRadius: 24, background: "#F7F8FB", border: `1px solid ${T.border}`, opacity: 0.6 * panels * (1 - out), filter: "grayscale(1)", transform: `translateY(${(1 - panels) * 20}px)` }}>
          <div style={{ position: "absolute", left: 32, top: 26, fontFamily: FONT.sans, fontSize: 28, fontWeight: 700, color: T.ink }}>{C.before}</div>
          {GHOSTS.map((w, i) => (
            <div key={w.logo} style={{ position: "absolute", left: 40 + i * 56, top: 96 + i * 46, width: 330, height: 190, borderRadius: 14, background: "#FFFFFF", border: `1px solid ${T.border}`, boxShadow: "0 10px 24px rgba(20,24,60,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, height: 42, padding: "0 14px", borderBottom: `1px solid ${T.border}`, fontFamily: FONT.sans, fontSize: 20, fontWeight: 700, color: T.ink }}>
                <Img src={staticFile(w.logo)} style={{ width: 24, height: 24, objectFit: "contain" }} />
                {w.title}
              </div>
              {[0, 1, 2].map((l) => (
                <div key={l} style={{ margin: "16px 16px 0", width: 230 - l * 40, height: 10, borderRadius: 5, background: "#E3E6EE" }} />
              ))}
            </div>
          ))}
          <div style={{ position: "absolute", left: 32, bottom: 30, display: "flex", gap: 12, alignItems: "center" }}>
            {C.beforeChips.map((c) => (
              <Chip key={c} label={c} />
            ))}
          </div>
          <div style={{ position: "absolute", right: 32, bottom: 22 }}>
            <Stopwatch label={fmtLeft(leftMin)} guard="Before stopwatch" />
          </div>
        </div>
      ) : null}

      {/* With Space: full colour; at the end this card grows to the white frame */}
      {panels > 0 ? (
        <div style={{ position: "absolute", left: rOut.x, top: rOut.y + (1 - panels) * 20, width: rOut.w, height: rOut.h, boxSizing: "border-box", borderRadius: 24 * (1 - out), background: "#FFFFFF", border: out < 1 ? `1px solid ${T.border}` : undefined, boxShadow: `0 24px 60px rgba(20,24,60,${0.1 * (1 - out)})`, opacity: panels }}>
          <div style={{ opacity: 1 - EASE(ramp(t, S11.out[0], S11.out[0] + 0.3)) }}>
            <div style={{ position: "absolute", left: 32, top: 26, display: "flex", alignItems: "center", gap: 12, fontFamily: FONT.sans, fontSize: 28, fontWeight: 700, color: T.ink }}>{C.after}</div>
            <div data-guard="text" data-guard-label="Review pack" data-fit-box="review pack" style={{ position: "absolute", left: 32, top: 92, width: 716, boxSizing: "border-box", borderRadius: 16, border: `1px solid ${T.border}`, padding: "18px 22px", fontFamily: FONT.sans }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 28, fontWeight: 700, color: T.ink }}>
                <FileText size={24} color={T.violet} />
                <span data-fit-text>{C.pack}, {P.claimId.startsWith("CL") ? `Claim ${P.claimId}` : P.claimId}</span>
              </div>
              {C.packItems.map((it, i) => {
                const k = EASE(ramp(t, S11.ticks[i], S11.ticks[i] + 0.25));
                return (
                  <div key={it} style={{ display: "flex", alignItems: "center", gap: 12, height: 52, borderTop: `1px solid ${T.border}`, marginTop: i === 0 ? 14 : 0, fontSize: 28, color: T.ink, opacity: 0.35 + 0.65 * k }}>
                    <span style={{ width: 30, height: 30, borderRadius: 15, background: k > 0.5 ? T.greenBg : "#F4F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {k > 0.05 ? <Check size={18} color={T.greenText} strokeWidth={3} style={{ opacity: k }} /> : null}
                    </span>
                    <span data-fit-text>{it}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ position: "absolute", left: 32, bottom: 30, display: "flex", gap: 12, alignItems: "center" }}>
              {C.afterChips.map((c) => (
                <Chip key={c} label={c} />
              ))}
              {ready > 0 ? (
                <div style={{ opacity: ready, transform: `scale(${0.94 + 0.06 * ready})` }}>
                  <Chip label={C.ready} tone="lilac" />
                </div>
              ) : null}
            </div>
            <div style={{ position: "absolute", right: 32, top: 18 }}>
              <Stopwatch label={rightDone ? C.afterTime : fmtRight(rightSec)} done={rightDone} guard="With Space stopwatch" />
            </div>
          </div>
        </div>
      ) : null}

      {/* Footnote */}
      {panels > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 936, textAlign: "center", fontFamily: FONT.sans, fontSize: 20, color: "#8A91A5", opacity: panels * (1 - out) }}>{C.footnote}</div>
      ) : null}

      </div>
      <GuardLayer scene={S} />
    </AbsoluteFill>
  );
};
