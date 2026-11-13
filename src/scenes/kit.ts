import {tween} from '../theme';
import {OVERLAP} from '../v7';

/**
 * Scene envelope: blur-dissolve in over the head overlap, out over the tail.
 * `ov` = this scene's overlap lengths with its neighbours (BUILD7.ov[key]).
 */
export const envelope = (frame: number, dur: number, head = true, tail = true, ov: {in: number; out: number} = {in: OVERLAP, out: OVERLAP}) => {
  const s = frame / 60;
  return {
    inP: head ? tween(frame, 0, ov.in) : 1,
    outP: tail ? tween(frame, dur - ov.out, dur) : 0,
    /** Shared elements are drawn by the incoming scene during the overlap. */
    ownsShared: !tail || s < dur - ov.out,
  };
};

export type SceneLayerProps = {layer?: 'all' | 'bg' | 'shell' | 'fg'};
