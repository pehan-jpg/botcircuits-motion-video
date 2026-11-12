/**
 * Each scene renders two independent layers so the persistent chat thread can
 * sit between them: the background (under the thread) and the HUD (over it).
 * Both layers are sequenced with identical TransitionSeries timing.
 */
export type SceneLayer = 'background' | 'hud';
export type SceneProps = {layer: SceneLayer};
