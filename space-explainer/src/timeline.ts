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
  | "S11"
  | "S12";

/**
 * Scene list. Only durations are authored: start and end are computed, so a
 * scene that grows pushes every later scene along automatically.
 */
const SCENE_LIST: { id: SceneId; name: string; duration: number; built: boolean }[] = [
  { id: "S01", name: "Problem", duration: 19, built: true },
  { id: "S02", name: "Intro", duration: 5, built: true },
  { id: "S03", name: "Chat", duration: 18, built: true },
  { id: "S04", name: "Agents and Control Room", duration: 40, built: true },
  { id: "S05", name: "Company Brain", duration: 14, built: true },
  { id: "S06", name: "Playbook", duration: 19, built: true },
  { id: "S07", name: "Run and wait", duration: 11, built: true },
  { id: "S08", name: "Morning review", duration: 17, built: true },
  { id: "S09", name: "Records", duration: 9, built: true },
  { id: "S10", name: "Pages and dashboards", duration: 12, built: true },
  { id: "S11", name: "Same claim, minutes not hours", duration: 8, built: true },
  { id: "S12", name: "End card", duration: 7, built: true },
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
  // Scene 1 keeps its beats in Scene01Problem.tsx (S1).
  // Scene 2, Intro
  colour_returns: at("S02", 0),
  orb_dissolve: at("S02", 0),
  intro_typed: at("S02", 1.0),
  // Scene 3, Chat: FeatureTitle, turn 1 (cited answer), turn 2 (an action), then the action chip
  s3_intro_out: at("S03", 0.2),
  s3_title: at("S03", 0.3),
  s3_hero: at("S03", 3.2),
  s3_chips: at("S03", 3.4),
  s3_focus: at("S03", 3.9),
  s3_type: at("S03", 4.05),
  s3_send: at("S03", 6.6),
  pill_reading: at("S03", 6.75),
  pill_policy: at("S03", 7.2),
  pill_evidence: at("S03", 7.65),
  answer: at("S03", 8.1),
  cite_click: at("S03", 10.95),
  source_open: at("S03", 11.0),
  source_close: at("S03", 12.4),
  t2_focus: at("S03", 12.3),
  t2_type: at("S03", 12.45),
  t2_send: at("S03", 14.55),
  t2_pill: at("S03", 14.7),
  t2_card: at("S03", 15.25),
  t2_row1: at("S03", 15.55),
  t2_row2: at("S03", 15.9),
  t2_chip: at("S03", 16.3),
  t2_click: at("S03", 17.5),
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
