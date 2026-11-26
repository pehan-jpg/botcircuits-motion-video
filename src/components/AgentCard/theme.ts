import { loadFont } from "./fonts";

loadFont();

/**
 * Single source of truth for the card's look. Adjust here to match the
 * banking reference; every composition picks it up.
 */
export const theme = {
  fontFamily: "Inter, system-ui, sans-serif",
  lime: "#c4e639",
  limeSoft: "rgba(196, 230, 57, 0.14)",
  limeBorder: "rgba(196, 230, 57, 0.75)",
  text: "#ffffff",
  textMuted: "rgba(255, 255, 255, 0.58)",
  textDim: "rgba(255, 255, 255, 0.42)",
  cardBg: "rgba(12, 13, 12, 0.88)",
  cardBorder: "rgba(255, 255, 255, 0.10)",
  insetBg: "rgba(0, 0, 0, 0.42)",
  insetBorder: "rgba(255, 255, 255, 0.07)",
  chipBg: "rgba(255, 255, 255, 0.05)",

  cardWidth: 860,
  cardRadius: 28,
  cardPadding: 48,

  size: {
    tag: 15,
    role: 17,
    pill: 14,
    title: 46,
    subtitle: 22,
    body: 22,
    chip: 19,
    calloutHeading: 20,
    calloutBody: 20,
  },
} as const;
