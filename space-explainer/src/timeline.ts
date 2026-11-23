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
  { id: "S04", number: 4, name: "Agents", start: 32, end: 46, built: true },
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
  orb_dissolve: 15.0,
  intro_typed: 16.0,
  // Scene 3, Chat
  s3_morph: 20.0,
  s3_intro_out: 20.2,
  s3_frame_rise: 20.2,
  s3_hero: 20.5,
  s3_textbeat: 20.9,
  s3_chips: 20.7,
  s3_focus: 21.6,
  s3_type: 21.8,
  s3_send: 24.5,
  pill_reading: 24.8,
  pill_policy: 25.4,
  pill_evidence: 26.0,
  answer: 26.8,
  cite_click: 29.45,
  source_open: 29.5,
  // Scene 4, Agents and Control Room
  s4_card_close: 32.0,
  s4_textbeat: 32.6,
  s4_click_agents: 32.95,
  s4_agents_page: 33.0,
  s4_zoom_cards: 33.2,
  s4_new_nora: 33.6,
  s4_new_theo: 34.15,
  s4_new_owen: 34.7,
  s4_zoom_out_cards: 36.1,
  s4_click_control: 36.8,
  s4_control_page: 36.85,
  s4_claim_to_iris: 37.5,
  s4_iris_message: 37.8,
  s4_pop_nora: 38.2,
  s4_pop_theo: 38.8,
  s4_pop_owen: 39.4,
  s4_zoom_desks: 39.8,
  s4_path_nora: 40.0,
  s4_path_theo: 40.8,
  s4_path_owen: 41.6,
  s4_zoom_out_room: 44.0,
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
