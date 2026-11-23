import React from 'react';
import {mix} from '../../motion';

export type RunListItem = {
  key: string;
  /** Reserved height of the slot (its full height once shown). */
  height: number;
  /** 0..1 growth of the slot; slots that grow push later items down. */
  grow?: number;
  /** 0..1 appearance (fade and 12px rise). */
  appear: number;
  node: React.ReactNode;
};

/**
 * Vertical list where every item has a reserved slot from the start.
 * Items before a growing slot never move; items after it ease down with it.
 */
export const RunList: React.FC<{items: RunListItem[]}> = ({items}) => {
  let y = 0;
  return (
    <div style={{position: 'relative'}}>
      {items.map((it) => {
        const top = y;
        y += it.height * (it.grow ?? 1);
        return it.appear > 0 ? (
          <div
            key={it.key}
            style={{position: 'absolute', left: 0, right: 0, top, opacity: it.appear, transform: `translateY(${mix(12, 0, it.appear)}px)`}}
          >
            {it.node}
          </div>
        ) : null;
      })}
    </div>
  );
};
