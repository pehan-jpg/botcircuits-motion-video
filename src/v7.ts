// ---------------------------------------------------------------------------
// v7 Build stage timeline (scenes 4-9). Scenes overlap by 0.5 s; each scene's
// start is relative to the start of scene 4 (absolute 16 s in FullVideo).
// ---------------------------------------------------------------------------
import {sec} from './timeline';
import {Camera} from './camera';

export const OVERLAP = 0.5;
const DUR = {s4: 3.5, s5: 7.0, s6: 10.5, s7: 8.0, s8: 6.0, s9: 7.0};
const start = (() => {
  const o: Record<string, number> = {};
  let t = 0;
  (Object.keys(DUR) as (keyof typeof DUR)[]).forEach((k, i) => {
    o[k] = i === 0 ? 0 : t - OVERLAP;
    t = o[k] + DUR[k];
  });
  return o as Record<keyof typeof DUR, number>;
})();
export const BUILD7 = {dur: DUR, start};
export const BUILD7_TOTAL = start.s9 + DUR.s9; // 39.5 s
export const BUILD7_FRAMES = {
  start: Object.fromEntries(Object.entries(start).map(([k, v]) => [k, sec(v)])) as Record<keyof typeof DUR, number>,
  dur: Object.fromEntries(Object.entries(DUR).map(([k, v]) => [k, sec(v)])) as Record<keyof typeof DUR, number>,
  total: sec(BUILD7_TOTAL),
};

// ---------------------------------------------------------------------------
// Stage world (scenes 5-8): chat card on the left, app shell on the right.
// ---------------------------------------------------------------------------
export const CHAT = {x: 0, y: 140, width: 480, height: 800, radius: 28};
export const SHELL = {x: 560, y: 90, width: 1400, height: 900, sidebar: 340, header: 100};
export const CONTENT = {x: SHELL.x + SHELL.sidebar, y: SHELL.y + SHELL.header, width: SHELL.width - SHELL.sidebar, height: SHELL.height - SHELL.header};
/** Camera that frames the chat card (chat active). */
export const CHAT_VIEW: Camera = {x: 240, y: 540, scale: 1.2, rotation: 0};
/** Camera that frames chat + shell, shell active (wide, about 70% width). */
export const CONFIG_VIEW: Camera = {x: 980, y: 540, scale: 0.92, rotation: 0};

/** Console pill (shared S4 -> S5), screen px at the S4/S5 seam. */
export const CONSOLE_CARD = {cx: 960, cy: 540, width: 1300, height: 900};
export const PILL_S5 = {cx: 960 - 1300 / 2 + 70 + 44, cy: 540 - 900 / 2 + 150 + 22, width: 88, height: 44};

/** S8 -> S9: the dark Publish button (screen px). */
export const PUBLISH_BTN = {cx: 960, cy: 690, width: 340, height: 96};

// ---------------------------------------------------------------------------
// HAND-OFF TO SCENE 10: the WhatsApp card at the last frame of scene 9.
// ---------------------------------------------------------------------------
export const WHATSAPP_CARD_FINAL = {
  x: 0,
  y: 0,
  width: 1920,
  height: 1080,
  borderRadius: 0,
  background: '#FFFFFF',
  logo: {centerX: 960, centerY: 300, size: 160},
  badge: {centerX: 1800, centerY: 120, size: 72},
} as const;
