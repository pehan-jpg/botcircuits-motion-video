import {tween} from '../theme';
import {OVERLAP} from '../v7';

/** Scene envelope: blur-dissolve in over the head overlap, out over the tail. */
export const envelope = (frame: number, dur: number, head = true, tail = true) => {
  const s = frame / 60;
  return {
    inP: head ? tween(frame, 0, OVERLAP) : 1,
    outP: tail ? tween(frame, dur - OVERLAP, dur) : 0,
    /** Shared elements are drawn by the incoming scene during the overlap. */
    ownsShared: !tail || s < dur - OVERLAP,
  };
};

export type SceneLayerProps = {layer?: 'all' | 'bg' | 'shell' | 'fg'};
