// ---------------------------------------------------------------------------
// World-space layout of the (oversized) chat window. All values in px of the
// un-scaled world; the camera (src/camera.ts) maps world -> screen.
// ---------------------------------------------------------------------------
import {WIDTH, HEIGHT} from './timeline';

export const WINDOW = {x: 0, y: 0, width: 2200, height: 2600, radius: 44};
export const HEADER_H = 150;

export const AVATAR = 88; // thread avatar diameter
export const ROW_X = 60; // avatar left edge inside the window
export const BUBBLE_X = ROW_X + AVATAR + 24; // 172, bubble left edge

export const BUBBLE = {
  height: 118,
  radius: 34,
  tailRadius: 10, // bottom-left corner on the speaker side
  padX: 40,
  fontSize: 44,
  typingWidth: 150,
};

export const META_GAP = 16; // bubble bottom -> meta row
export const META_H = 40;

/** Maya's first message (row A) and the agent reply (row B). */
export const ROW_A_Y = HEADER_H + 64; // 214
export const ROW_B_Y = ROW_A_Y + BUBBLE.height + META_GAP + META_H + 56; // 444

/** The empty gap below the agent reply that widens during the silence. */
export const GAP_START = ROW_B_Y + BUBBLE.height + META_GAP + META_H; // 618
export const GAP_BASE = 90;
export const GAP_MAX = 400;

/** Follow-up rows (scene 3). */
export const ROW_STEP = BUBBLE.height + META_GAP + META_H + 40; // 214
export const FOLLOW_UP_Y = [0, 1, 2].map((i) => GAP_START + GAP_MAX + i * ROW_STEP); // 1018, 1232, 1446

/** Presence line + composer sit under the last row and slide down. */
export const PRESENCE_OFFSET = 20;
export const COMPOSER_OFFSET = 90;
export const COMPOSER = {x: ROW_X, width: 1700, height: 120};

/** World point the follow-up bubbles compress toward (= camera focus at the end). */
export const STACK_CENTER = {
  x: 480,
  y: FOLLOW_UP_Y[1] + BUBBLE.height / 2, // 1291
};

// ---------------------------------------------------------------------------
// HAND-OFF TO SCENE 4
// Final pill, in SCREEN space (1920x1080), exactly centred. Static for the
// last 10 frames (470-480). Scene 4 should start from these numbers.
// ---------------------------------------------------------------------------
export const PILL_WIDTH = 760;
export const PILL_HEIGHT = 104;
export const PILL = {
  x: (WIDTH - PILL_WIDTH) / 2, // 580
  y: (HEIGHT - PILL_HEIGHT) / 2, // 488
  width: PILL_WIDTH, // 760
  height: PILL_HEIGHT, // 104
  borderRadius: PILL_HEIGHT / 2, // 52
  centerX: WIDTH / 2, // 960
  centerY: HEIGHT / 2, // 540
  fontSize: 36,
  text: 'Maya · 3 messages · no reply',
} as const;
