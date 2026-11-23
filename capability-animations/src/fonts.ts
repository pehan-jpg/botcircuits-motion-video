import {loadFont} from '@remotion/fonts';
import {continueRender, delayRender, staticFile} from 'remotion';

/**
 * Loads Inter from /public/fonts (bundled locally, no network fetch).
 * Regular 400, Medium 500 and SemiBold 600 are the only weights used.
 */
const weights = ['400', '500', '600'] as const;

let loaded = false;

export const ensureInter = (): void => {
  if (loaded) return;
  loaded = true;
  const handle = delayRender('Loading Inter');
  Promise.all(
    weights.map((weight) =>
      loadFont({
        family: 'Inter',
        url: staticFile(`fonts/Inter-${weight}.woff2`),
        weight,
        format: 'woff2',
      }),
    ),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error('Failed to load Inter', err);
      continueRender(handle);
    });
};
