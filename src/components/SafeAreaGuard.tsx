import React, {useEffect} from 'react';
import {continueRender, delayRender, useCurrentFrame} from 'remotion';
import {SAFE} from '../v7';

/**
 * DEV ONLY. When enabled, after each rendered frame it measures every visible
 * element marked `data-safe` (or `data-safe-pan`) and logs a "SAFE" warning
 * for any whose bounding box leaves the 96px margin. Elements inside a layer
 * marked data-pan="1" (deliberate camera pans) are skipped, as are elements
 * whose effective opacity is below 0.1.
 */
export const SafeAreaGuard: React.FC<{enabled: boolean}> = ({enabled}) => {
  const frame = useCurrentFrame();
  useEffect(() => {
    if (!enabled) return;
    const handle = delayRender(`safe-area ${frame}`);
    requestAnimationFrame(() => {
      const els = Array.from(document.querySelectorAll<HTMLElement>('[data-safe], [data-safe-pan]'));
      for (const el of els) {
        let op = 1;
        let skip = false;
        for (let n: HTMLElement | null = el; n; n = n.parentElement) {
          op *= parseFloat(getComputedStyle(n).opacity || '1');
          if (n.dataset && n.dataset.pan === '1') skip = true;
        }
        if (skip || op < 0.1) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        // fully outside the frame = not on screen (not clipped)
        if (r.right <= 0 || r.left >= 1920 || r.bottom <= 0 || r.top >= 1080) continue;
        const bad = r.left < SAFE - 1 || r.top < SAFE - 1 || r.right > 1920 - SAFE + 1 || r.bottom > 1080 - SAFE + 1;
        if (bad) {
          const label = el.dataset.safe ?? el.dataset.safePan;
          // eslint-disable-next-line no-console
          console.warn(`SAFE frame=${frame} "${label}" box=[${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}]`);
        }
      }
      continueRender(handle);
    });
  }, [enabled, frame]);
  return null;
};
