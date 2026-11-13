// ---------------------------------------------------------------------------
// v7 Build stage timeline (scenes 4-9). Scenes overlap by 0.5 s; each scene's
// start is relative to the start of scene 4 (absolute 16 s in FullVideo).
// ---------------------------------------------------------------------------
import {sec} from './timeline';
import {Camera} from './camera';

export const OVERLAP = 0.5;
const DUR = {s4: 6.0, s5: 7.0, s6: 10.5, s7: 9.5, s8: 8.0, s9: 7.0, s10: 5.0, s11: 6.5, s12: 7.0, s13: 5.0};
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
export const BUILD7_TOTAL = start.s13 + DUR.s13; // 67 s
export const BUILD7_FRAMES = {
  start: Object.fromEntries(Object.entries(start).map(([k, v]) => [k, sec(v)])) as Record<keyof typeof DUR, number>,
  dur: Object.fromEntries(Object.entries(DUR).map(([k, v]) => [k, sec(v)])) as Record<keyof typeof DUR, number>,
  total: sec(BUILD7_TOTAL),
};

// ---------------------------------------------------------------------------
// Stage world (scenes 5-8). Chat card on the left, app window on the right,
// far enough apart that each view shows ONE card fully, with the other card
// fully out of frame (no clipped cards). Both views are unzoomed (1.0).
// ---------------------------------------------------------------------------
export const SAFE = 96; // px safe margin on every side
export const CHAT = {x: 0, y: 110, width: 640, height: 860, radius: 32};
export const SHELL = {x: 1340, y: 100, width: 1500, height: 880, sidebar: 300, header: 88};
export const CONTENT = {x: SHELL.x + SHELL.sidebar, y: SHELL.y + SHELL.header, width: SHELL.width - SHELL.sidebar, height: SHELL.height - SHELL.header};
/** Camera that frames the chat card. */
export const CHAT_VIEW: Camera = {x: CHAT.x + CHAT.width / 2, y: 540, scale: 1, rotation: 0};
/** Camera that frames the whole app window (78% of frame width). */
export const CONFIG_VIEW: Camera = {x: SHELL.x + SHELL.width / 2, y: 540, scale: 1, rotation: 0};
export const AGENT = 'Card Services Agent';

/** Console card (scene 5) and its pill, shared from scene 4 (screen px). */
export const CONSOLE_CARD = {cx: 960, cy: 540, width: 1280, height: 760};
export const PILL_S5 = {cx: 960 - 1280 / 2 + 60 + 40, cy: 540 - 760 / 2 + 136 + 20, width: 80, height: 40};

/** S8 -> S9: the dark Publish button (screen px). */
export const PUBLISH_BTN = {cx: 1110, cy: 700, width: 340, height: 96};

// ---------------------------------------------------------------------------
// HAND-OFF TO SCENE 10: the WhatsApp card at the last frame of scene 9.
// ---------------------------------------------------------------------------
/** Last frame of scene 9: the WhatsApp logo alone, centred, on WhatsApp green. */
export const WHATSAPP_FINAL = {
  background: '#25D366',
  logo: {centerX: 960, centerY: 540, size: 200, color: '#FFFFFF'},
} as const;

/** S7 -> S8: where the cursor is (screen px) at the start of scene 8, travelling toward "Simulator". */
export const CURSOR_S7_END = {x: 760, y: 820};

/** S10/S11: centred phone-style chat and call cards (screen px). */
export const CENTER_CARD = {x: 540, y: 540 - 430, width: 640, height: 860}; // left of the 9:02 AM clock
/** S10: where the WhatsApp header glyph sits (screen px, centre) and its size. */
export const WA_HEADER_GLYPH = {cx: CENTER_CARD.x + 52, cy: CENTER_CARD.y + 48, size: 44};
/** S11 -> S12: the call card collapses into Daniel's conversation row (screen px, at CONFIG_VIEW). */
export const DANIEL_ROW = {x: 510 + 32, y: 188 + 28 + 1 * 108, width: 400, height: 96};
/** S12 -> S13: the loop ring at the frame centre (screen px). */
export const LOOP_RING = {cx: 960, cy: 540, r: 150, orb: 120};
