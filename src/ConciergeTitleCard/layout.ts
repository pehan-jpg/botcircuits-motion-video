import { measureText } from "@remotion/layout-utils";
import { HEIGHT, WIDTH } from "../constants";
import { SANS } from "../fonts";
import {
  CHIP_BUSY,
  CHIP_DONE,
  CUSTOMER_TEXT,
  TITLE_TEXT,
  UNDERLINED_WORD,
} from "./timeline";

const measure = (text: string, fontSize: number, fontWeight: number) =>
  measureText({
    text,
    fontFamily: SANS,
    fontSize,
    fontWeight: String(fontWeight),
    validateFontIsLoaded: true,
  }).width;

export const CX = WIDTH / 2;
export const CY = HEIGHT / 2;

/** Pre-measured layout. Call only after fonts are loaded. */
export const computeLayout = (wordmarkAspect: number) => {
  // Chat card.
  const card = { w: 520, pad: 28, radius: 28 };
  const header = { avatar: 34, lineW: 132, lineH: 12, gap: 14 };
  const divider = { before: 22, after: 24 };

  const bubbleFont = { size: 24, weight: 500, lineHeight: 34 };
  const bubblePadX = 20;
  const bubblePadY = 14;
  const bubbleTextW = Math.ceil(measure(CUSTOMER_TEXT, bubbleFont.size, bubbleFont.weight)) + 2;
  const bubble = {
    w: bubbleTextW + bubblePadX * 2,
    h: bubbleFont.lineHeight + bubblePadY * 2,
    textW: bubbleTextW,
    padX: bubblePadX,
    padY: bubblePadY,
  };
  const customerAvatar = 40;
  const agentAvatar = 44;
  const rowGap = 20;

  const chipFont = { size: 22, weight: 600, lineHeight: 30 };
  const chipLabelW = Math.ceil(
    Math.max(measure(CHIP_BUSY, chipFont.size, chipFont.weight), measure(CHIP_DONE, chipFont.size, chipFont.weight)),
  ) + 2;
  const chipIcon = 26;
  const chip = {
    w: 20 + chipIcon + 12 + chipLabelW + 24,
    h: 56,
    icon: chipIcon,
    labelW: chipLabelW,
  };
  const indicator = { w: 80, h: 46 };

  const threadH = bubble.h + rowGap + Math.max(chip.h, agentAvatar);
  const cardH =
    card.pad + header.avatar + divider.before + 1 + divider.after + threadH + card.pad + 4;

  // Title lockup: symbol, typed text, wordmark, centred as one block.
  const titleFont = { size: 84, weight: 600, lineHeight: 118 };
  const symbol = 80;
  const gapSymbolText = 26;
  const titleW = Math.ceil(measure(TITLE_TEXT, titleFont.size, titleFont.weight)) + 4;
  const underlineW = Math.round(measure(UNDERLINED_WORD, titleFont.size, titleFont.weight));
  const gapTextWordmark = 22;
  const wordmarkH = 64;
  const wordmarkW = Math.round(wordmarkH * wordmarkAspect);
  const lockupW = symbol + gapSymbolText + titleW + gapTextWordmark + wordmarkW;
  const lockupLeft = Math.round(CX - lockupW / 2);

  // Optical offset: centre the cap height (not the line box) on the frame centre.
  const titleOpticalDy = 0;
  const title = {
    left: lockupLeft + symbol + gapSymbolText,
    top: Math.round(CY - titleFont.lineHeight / 2 + titleOpticalDy),
    width: titleW,
    height: titleFont.lineHeight,
  };

  return {
    card: { ...card, h: cardH },
    header,
    divider,
    bubble,
    bubbleFont,
    customerAvatar,
    agentAvatar,
    rowGap,
    chip,
    chipFont,
    indicator,
    titleFont,
    title,
    underline: {
      left: title.left + 2,
      top: title.top + titleFont.lineHeight + 6,
      width: underlineW - 4,
    },
    symbol: { size: symbol, cx: lockupLeft + symbol / 2, cy: CY },
    wordmark: {
      left: title.left + titleW + gapTextWordmark,
      top: Math.round(CY - wordmarkH / 2),
      w: wordmarkW,
      h: wordmarkH,
    },
    lockup: { left: lockupLeft, width: lockupW },
    heroOrb: 112,
  };
};

export type Layout = ReturnType<typeof computeLayout>;
