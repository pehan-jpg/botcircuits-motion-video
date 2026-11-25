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

/**
 * Scene list. Only durations are authored: start and end are computed, so a
 * scene that grows pushes every later scene along automatically.
 */
const SCENE_LIST: { id: SceneId; name: string; duration: number; built: boolean }[] = [
  { id: "S01", name: "Problem", duration: 15, built: true },
  { id: "S02", name: "Intro", duration: 5, built: true },
  { id: "S03", name: "Chat", duration: 18, built: true },
  { id: "S04", name: "Agents and Control Room", duration: 40, built: true },
  { id: "S05", name: "Company Brain", duration: 14, built: true },
  { id: "S06", name: "Playbook", duration: 19, built: true },
  { id: "S07", name: "Evening trigger", duration: 10, built: true },
  { id: "S08", name: "Morning review", duration: 17, built: true },
  { id: "S09", name: "Records and Pages", duration: 16, built: true },
  { id: "S10", name: "Concierge handoff", duration: 6, built: true },
  { id: "S11", name: "End card", duration: 7, built: true },
];

export type SceneDef = {
  id: SceneId;
  number: number;
  name: string;
  start: number; // seconds, computed
  end: number; // seconds, computed
  duration: number;
  /** Built scenes play in SpaceVideo, back to back. Unbuilt scenes are absent. */
  built: boolean;
};

export const SCENES: SceneDef[] = (() => {
  let t = 0;
  return SCENE_LIST.map((s, i) => {
    const def = { ...s, number: i + 1, start: t, end: t + s.duration };
    t += s.duration;
    return def;
  });
})();

export const TOTAL_SECONDS = SCENES[SCENES.length - 1].end;

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
export const BUILT_FRAMES = BUILT_SCENES.reduce((a, s) => a + sceneFrames(s.id), 0);

/** Event at a time relative to its scene's start, stored in absolute seconds. */
const at = (scene: SceneId, t: number) => sceneById(scene).start + t;

/**
 * Named events. Authored relative to their scene, so they move with it.
 * Scene code reads them through `local(event, sceneId)`.
 */
export const EVENTS = {
  // Scene 1, Problem
  headline_work_moves: at("S01", 0.1),
  claim_lands: at("S01", 0.35),
  hop_sheet: at("S01", 1.3),
  hop_chat: at("S01", 2.1),
  hop_pdf: at("S01", 2.9),
  chip_who_has_it: at("S01", 3.0),
  chip_who_approved: at("S01", 3.6),
  chip_which_version: at("S01", 4.2),
  card_to_orb: at("S01", 5.0),
  headline_who_checks: at("S01", 6.0),
  stamp_sent: at("S01", 7.0),
  stamp_paid: at("S01", 7.6),
  empty_slot: at("S01", 8.2),
  strays_fade: at("S01", 10.0),
  line_no_record: at("S01", 10.4),
  line_no_one: at("S01", 11.7),
  orb_to_centre: at("S01", 13.2),
  // Scene 2, Intro
  colour_returns: at("S02", 0),
  orb_dissolve: at("S02", 0),
  intro_typed: at("S02", 1.0),
  // Scene 3, Chat: FeatureTitle, then the earlier beats shifted by 2.5s
  s3_intro_out: at("S03", 0.2),
  s3_title: at("S03", 0.45),
  s3_hero: at("S03", 3.0),
  s3_chips: at("S03", 3.2),
  s3_focus: at("S03", 4.1),
  s3_type: at("S03", 4.3),
  s3_send: at("S03", 7.0),
  pill_reading: at("S03", 7.3),
  pill_policy: at("S03", 7.9),
  pill_evidence: at("S03", 8.5),
  answer: at("S03", 9.3),
  cite_click: at("S03", 11.95),
  source_open: at("S03", 12.0),
} as const;

export type EventName = keyof typeof EVENTS;

/** Event time in seconds, relative to a scene's start. */
export const local = (event: EventName, scene: SceneId) => EVENTS[event] - sceneById(scene).start;
/** Event time in frames, relative to a scene's start. */
export const localF = (event: EventName, scene: SceneId) => f(local(event, scene));

/** Plate mapping for the whole video. */
export const PLATES = {
  "01": "backgrounds/01-dawn-meadow.jpg",
  "02": "backgrounds/02-morning-field.jpg",
  "03": "backgrounds/03-day-hills.jpg",
  "04": "backgrounds/04-dusk-horizon.jpg",
} as const;
export type PlateKey = keyof typeof PLATES;
