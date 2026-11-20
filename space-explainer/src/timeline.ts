import { VIDEO } from "./theme";

export type SceneId =
  | "S01"
  | "S02"
  | "S03"
  | "S04"
  | "S05"
  | "S06"
  | "S07"
  | "S08"
  | "S09"
  | "S10"
  | "S11";

export type SceneDef = {
  id: SceneId;
  number: number;
  name: string;
  start: number; // seconds, in the final 2:02 cut
  end: number; // seconds
  /** Built scenes play in SpaceVideo, back to back. Unbuilt scenes are absent. */
  built: boolean;
};

export const SCENES: SceneDef[] = [
  { id: "S01", number: 1, name: "Problem", start: 0, end: 15, built: true },
  { id: "S02", number: 2, name: "Intro", start: 15, end: 20, built: true },
  { id: "S03", number: 3, name: "Chat", start: 20, end: 32, built: true },
  { id: "S04", number: 4, name: "Scene 4", start: 32, end: 46, built: false },
  { id: "S05", number: 5, name: "Scene 5", start: 46, end: 56, built: false },
  { id: "S06", number: 6, name: "Scene 6", start: 56, end: 71, built: false },
  { id: "S07", number: 7, name: "Scene 7", start: 71, end: 80, built: false },
  { id: "S08", number: 8, name: "Scene 8", start: 80, end: 96, built: false },
  { id: "S09", number: 9, name: "Scene 9", start: 96, end: 108, built: false },
  {
    id: "S10",
    number: 10,
    name: "Scene 10",
    start: 108,
    end: 114,
    built: false,
  },
  {
    id: "S11",
    number: 11,
    name: "Scene 11",
    start: 114,
    end: 122,
    built: false,
  },
];

export const TOTAL_SECONDS = 122;

export const sceneById = (id: SceneId) => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return s;
};

export const f = (seconds: number) => Math.round(seconds * VIDEO.fps);
export const sceneFrames = (id: SceneId) => {
  const s = sceneById(id);
  return f(s.end) - f(s.start);
};

export const BUILT_SCENES = SCENES.filter((s) => s.built);
export const BUILT_FRAMES = BUILT_SCENES.reduce(
  (a, s) => a + sceneFrames(s.id),
  0,
);

/**
 * Named events in absolute seconds (video time). Scene code reads these
 * through `local(event, sceneId)` so timing lives in one place.
 */
export const EVENTS = {
  // Scene 1, Problem
  headline_work_moves: 0.1,
  claim_lands: 0.35,
  hop_sheet: 1.3,
  hop_chat: 2.1,
  hop_pdf: 2.9,
  chip_who_has_it: 3.0,
  chip_who_approved: 3.6,
  chip_which_version: 4.2,
  card_to_orb: 5.0,
  headline_who_checks: 6.0,
  stamp_sent: 7.0,
  stamp_paid: 7.6,
  empty_slot: 8.2,
  strays_fade: 10.0,
  line_no_record: 10.4,
  line_no_one: 11.7,
  orb_to_centre: 13.2,
  // Scene 2, Intro
  colour_returns: 15.0,
  space_orb_forms: 15.0,
  card_in: 15.6,
  introducing: 15.75,
  title_typed: 15.95,
  tagline: 16.0,
  // Scene 3, Chat
  s3_morph: 20.0,
  s3_intro_out: 20.3,
  s3_hero: 21.2,
  s3_textbeat: 21.3,
  s3_chips: 21.4,
  s3_focus: 22.0,
  s3_type: 22.1,
  s3_send: 25.0,
  pill_reading: 25.3,
  pill_policy: 25.9,
  pill_evidence: 26.5,
  answer: 27.3,
  cite_click: 30.25,
  source_open: 30.35,
} as const;

export type EventName = keyof typeof EVENTS;

/** Event time in seconds, relative to a scene's start. */
export const local = (event: EventName, scene: SceneId) =>
  EVENTS[event] - sceneById(scene).start;
/** Event time in frames, relative to a scene's start. */
export const localF = (event: EventName, scene: SceneId) =>
  f(local(event, scene));

/** Plate mapping for the whole video. */
export const PLATES = {
  "01": "backgrounds/01-dawn-meadow.jpg",
  "02": "backgrounds/02-morning-field.jpg",
  "03": "backgrounds/03-day-hills.jpg",
  "04": "backgrounds/04-dusk-horizon.jpg",
} as const;
export type PlateKey = keyof typeof PLATES;
