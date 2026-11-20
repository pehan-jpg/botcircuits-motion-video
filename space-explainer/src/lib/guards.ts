import {
  MAX_IDLE_SECONDS,
  MIN_CONTRAST,
  MIN_LOGO_PX,
  MIN_TEXT_PX,
  SAFE,
  VIDEO,
  readHoldSeconds,
} from "../theme";

export type Rect = { x: number; y: number; w: number; h: number };
export type GuardIssue = { guard: string; message: string };

/** SafeAreaGuard: nothing within 96px of the edge except backgrounds. */
export const checkSafeArea = (r: Rect, label: string): GuardIssue[] => {
  const tol = 0.5;
  const out =
    r.x < SAFE - tol ||
    r.y < SAFE - tol ||
    r.x + r.w > VIDEO.width - SAFE + tol ||
    r.y + r.h > VIDEO.height - SAFE + tol;
  return out
    ? [
        {
          guard: "SafeAreaGuard",
          message: `${label} at ${JSON.stringify(roundRect(r))} enters the ${SAFE}px margin`,
        },
      ]
    : [];
};

const roundRect = (r: Rect) => ({
  x: Math.round(r.x),
  y: Math.round(r.y),
  w: Math.round(r.w),
  h: Math.round(r.h),
});

export type TextBeatSpec = {
  id: string;
  text: string;
  /** Seconds when the text is fully readable (typing ended or blur in finished). */
  readyAt: number;
  /** Seconds when the text starts to leave. */
  leaveAt: number;
  fontPx: number;
};

/** ReadabilityGuard timing and size: at least 28px, held 1.2s plus 0.25s per word after typing ends. */
export const checkReadability = (b: TextBeatSpec): GuardIssue[] => {
  const issues: GuardIssue[] = [];
  const need = readHoldSeconds(b.text);
  const held = b.leaveAt - b.readyAt;
  if (held + 1e-6 < need)
    issues.push({
      guard: "ReadabilityGuard",
      message: `"${b.text}" held ${held.toFixed(2)}s, needs ${need.toFixed(2)}s`,
    });
  if (b.fontPx < MIN_TEXT_PX)
    issues.push({
      guard: "ReadabilityGuard",
      message: `"${b.text}" is ${b.fontPx}px, minimum ${MIN_TEXT_PX}px`,
    });
  return issues;
};

/** WCAG relative luminance from sRGB 0..255. */
export const relLuminance = (r: number, g: number, b: number) => {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export const contrastRatio = (l1: number, l2: number) =>
  (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
export const checkContrast = (
  textLum: number,
  bgLum: number,
  label: string,
): GuardIssue[] => {
  const ratio = contrastRatio(textLum, bgLum);
  return ratio < MIN_CONTRAST
    ? [
        {
          guard: "ReadabilityGuard",
          message: `${label} contrast ${ratio.toFixed(2)}:1 is below ${MIN_CONTRAST}:1`,
        },
      ]
    : [];
};

/** assertGaps: no stretch over 0.4s without motion. Intervals are [start, end] seconds of motion. */
export const assertGaps = (
  intervals: [number, number][],
  duration: number,
  label: string,
): GuardIssue[] => {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const issues: GuardIssue[] = [];
  let cursor = 0;
  for (const [s, e] of sorted) {
    if (s - cursor > MAX_IDLE_SECONDS)
      issues.push({
        guard: "assertGaps",
        message: `${label}: no motion from ${cursor.toFixed(2)}s to ${s.toFixed(2)}s`,
      });
    cursor = Math.max(cursor, e);
  }
  if (duration - cursor > MAX_IDLE_SECONDS)
    issues.push({
      guard: "assertGaps",
      message: `${label}: no motion from ${cursor.toFixed(2)}s to ${duration.toFixed(2)}s`,
    });
  return issues;
};

/** LogoGuard: logos on white, at least 28px high. */
export const checkLogo = (heightPx: number, onWhite: boolean): GuardIssue[] => {
  const issues: GuardIssue[] = [];
  if (heightPx < MIN_LOGO_PX)
    issues.push({
      guard: "LogoGuard",
      message: `logo is ${heightPx}px high, minimum ${MIN_LOGO_PX}px`,
    });
  if (!onWhite)
    issues.push({
      guard: "LogoGuard",
      message: "logo is not on a white backing",
    });
  return issues;
};
