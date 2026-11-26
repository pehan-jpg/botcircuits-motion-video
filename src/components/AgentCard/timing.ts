import React, { createContext, useContext } from "react";
import { Easing, interpolate } from "remotion";
import { theme } from "./theme";

/**
 * Card timings. All values are in 60fps frame units (1 unit = 1/60 s);
 * AgentCard converts the composition's frame into these units, so the
 * same values give the same motion at 30fps or 60fps.
 */
export const defaultTiming = {
  inDuration: 36,
  outDuration: 30,
  headerStagger: 5,
  contentStart: 26,
  contentStagger: 11,
  itemDuration: 22,
};
export type Timing = typeof defaultTiming;

/** Per-composition overrides for the shared card. */
export type CardConfig = {
  timing?: Partial<Timing>;
  fontFamily?: string;
  /** Colour of the small agent role label next to the AGENT tag. */
  roleColor?: string;
};

const CardConfigContext = createContext<CardConfig>({});

export const CardConfigProvider: React.FC<{ config: CardConfig; children: React.ReactNode }> = ({ config, children }) =>
  React.createElement(CardConfigContext.Provider, { value: config }, children);

export const useCardConfig = () => useContext(CardConfigContext);

export const useTiming = (): Timing => ({ ...defaultTiming, ...useCardConfig().timing });

export const useCardStyle = () => {
  const c = useCardConfig();
  return {
    fontFamily: c.fontFamily ?? theme.fontFamily,
    roleColor: c.roleColor ?? theme.textMuted,
  };
};

export const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
export const easeIn = Easing.bezier(0.55, 0, 0.75, 0.2);

/** 0→1 progress of an element that starts at `start` and lasts `duration`. */
export const progress = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });
