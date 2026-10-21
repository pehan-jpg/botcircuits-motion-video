import type React from "react";
import { AbsoluteFill } from "remotion";
import { COMP, TRANSITIONS, TRANSITION_FX, THEME } from "./config";
import { bezier } from "./motion";

const ease = bezier(TRANSITION_FX.easing);

export type TransitionState = {
  scale: number;
  translateX: number;
  blurPx: number;
  motionBlurX: number;
  flareOpacity: number;
  /** Lime band: centre x in px and opacity, or null when off. */
  band: { centerX: number; opacity: number } | null;
};

/**
 * Per-frame state of the video wrapper and overlay elements. Every transition is
 * centred on its cut frame; the loop transition (frame === duration) wraps to frame 0.
 */
export const transitionState = (frame: number): TransitionState => {
  const s: TransitionState = { scale: 1, translateX: 0, blurPx: 0, motionBlurX: 0, flareOpacity: 0, band: null };

  for (const t of TRANSITIONS) {
    const half = t.duration / 2;
    let d = frame - t.frame;
    if (t.frame >= COMP.durationInFrames && frame < half) d = frame + COMP.durationInFrames - t.frame;
    if (d < -half || d > half) continue;

    if (t.type === "blurDip") {
      // Eased up over the frames before the cut, peak on the cut frame, eased back down after.
      const k = d < 0 ? ease((d + half) / half) : ease(1 - d / half);
      const fx = TRANSITION_FX.blurDip;
      s.scale *= 1 + (fx.scale - 1) * k;
      s.blurPx += fx.blurPx * k;
      s.flareOpacity = Math.max(s.flareOpacity, fx.flareOpacity * k);
    }

    if (t.type === "whipPan") {
      // One continuous eased pan across the cut: 0 → -dist on the outgoing shot,
      // +dist → 0 on the incoming one, so velocity peaks at the cut.
      const u = ease((d + half) / (2 * half));
      const dist = TRANSITION_FX.whipPan.distancePx;
      const x = d < 0 ? -2 * dist * u : 2 * dist * (1 - u);
      s.translateX += x;
      s.motionBlurX = Math.max(s.motionBlurX, TRANSITION_FX.whipPan.motionBlur * Math.sin(Math.PI * u) ** 2);
      // Cover the edge the pan would expose (never show a bare frame edge).
      s.scale *= 1 + (2 * Math.abs(x) + 8) / COMP.width;
    }

    if (t.type === "limeSweep") {
      const u = ease((d + half) / (2 * half));
      const fx = TRANSITION_FX.limeSweep;
      const bandW = (COMP.width * fx.bandWidthPct) / 100;
      const travel = COMP.width / 2 + bandW / 2 + fx.extraSoftnessPx * 3;
      const bell = Math.sin(Math.PI * u);
      s.band = { centerX: COMP.width / 2 + travel * (2 * u - 1), opacity: fx.edgeOpacity + (fx.peakOpacity - fx.edgeOpacity) * bell };
      s.scale *= 1 + fx.pushIn * bell;
    }
  }
  return s;
};

export const VideoWrapper: React.FC<{ state: TransitionState; children: React.ReactNode }> = ({ state, children }) => {
  const filters = [
    state.blurPx > 0.05 ? `blur(${state.blurPx.toFixed(2)}px)` : null,
    state.motionBlurX > 0.05 ? "url(#whip-motion-blur)" : null,
  ].filter(Boolean);
  return (
    <AbsoluteFill
      style={{
        scale: state.scale === 1 ? undefined : String(state.scale),
        translate: state.translateX === 0 ? undefined : `${state.translateX.toFixed(2)}px 0px`,
        filter: filters.length ? filters.join(" ") : undefined,
      }}
    >
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="whip-motion-blur" x="-5%" y="0%" width="110%" height="100%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation={`${state.motionBlurX.toFixed(2)} 0`} edgeMode="duplicate" />
        </filter>
      </svg>
      {children}
    </AbsoluteFill>
  );
};

/** Warm white radial flare, screen blend, for the blur dips. */
export const Flare: React.FC<{ opacity: number }> = ({ opacity }) =>
  opacity > 0.001 ? (
    <AbsoluteFill
      style={{
        mixBlendMode: "screen",
        opacity,
        background: `radial-gradient(ellipse 70% 80% at 55% 42%, rgba(${TRANSITION_FX.blurDip.flareColor}, 1) 0%, rgba(${TRANSITION_FX.blurDip.flareColor}, 0.6) 35%, rgba(${TRANSITION_FX.blurDip.flareColor}, 0) 75%)`,
      }}
    />
  ) : null;

/** Soft-edged lime band that sweeps left to right across cut 3. */
export const LimeBand: React.FC<{ band: TransitionState["band"] }> = ({ band }) => {
  if (!band) return null;
  const fx = TRANSITION_FX.limeSweep;
  const w = (COMP.width * fx.bandWidthPct) / 100;
  const f = fx.featherPct;
  return (
    <div
      style={{
        position: "absolute",
        top: -80,
        bottom: -80,
        left: 0,
        width: w,
        translate: `${(band.centerX - w / 2).toFixed(2)}px 0px`,
        opacity: band.opacity,
        filter: `blur(${fx.extraSoftnessPx}px)`,
        background: `linear-gradient(90deg, transparent 0%, ${THEME.lime} ${f}%, ${THEME.lime} ${100 - f}%, transparent 100%)`,
      }}
    />
  );
};
