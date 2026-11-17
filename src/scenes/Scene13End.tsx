import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_MONO, alpha, kfIO, tween} from '../theme';
import {BUILD7, LOOP_RING} from '../v7';
import {TAGLINE, URL} from '../constants';
import {Orb} from '../components/Orb';
import {LogoMark, MARK_ASPECT, LOCKUP_RATIO, Wordmark, WORDMARK_ASPECT} from '../components/Logo';
import {measureText} from '../components/measure';
import {UI, UI_FAMILY, UI_FONT} from '../ui/tokens';
import {Metaballs} from './Scene04Intro';
import {envelope, SceneLayerProps} from './kit';

// end line: two centred lines at 80px (one line would be wider than the safe area)
const FS = 80;
const LINE_FONT = `600 ${FS}px "${UI_FAMILY}"`;
const BREAK = TAGLINE.indexOf('. ', TAGLINE.indexOf('. ') + 1) >= 0 ? TAGLINE.indexOf('. ', TAGLINE.indexOf('. ') + 1) + 1 : -1;
const LINES = BREAK > 0 ? [TAGLINE.slice(0, BREAK), TAGLINE.slice(BREAK + 1)] : [TAGLINE];
const UNDERLINE = 'everywhere';
// the line types over about 4.3 s, then the lockup holds for at least 1.2 s
const TYPE_AT = 0.5;
const PER_WORD = 0.42;

// final lockup (symbol + wordmark), centred
const MARK_H = 130;
const MARK_W = MARK_H * MARK_ASPECT;
const GAP = MARK_H * LOCKUP_RATIO.gap;
const WORD_H = MARK_H * LOCKUP_RATIO.wordHeight;
const WORD_W = WORD_H * WORDMARK_ASPECT;
const LOCK_W = MARK_W + GAP + WORD_W;
const MARK_C = {x: 960 - LOCK_W / 2 + MARK_W / 2, y: 540};

/**
 * SCENE 13 (5 s) End card on white. The loop ring expands as the orb
 * dissolves, the end line types in (first word grey, the rest darkening as
 * they type) with a lime underline under "a person"; then the ring flows into
 * the BotCircuits symbol and the wordmark resolves. Holds 1.2 s.
 */
export const Scene13End: React.FC<SceneLayerProps> = ({layer = 'all'}) => {
  const f = useCurrentFrame();
  const show = (k: 'bg' | 'shell' | 'fg') => layer === 'all' || layer === k;
  const {fps} = useVideoConfig();
  const s = f / fps;
  const env = envelope(f, BUILD7.dur.s13, true, false, BUILD7.ov.s13);
  const expand = kfIO(f, [0.3, 1.0], [0, 1]);
  const orbOut = tween(f, 0.3, 0.8);
  const lineOut = tween(f, 4.6, 4.9);
  // the ring expands and fades as the line types, then returns to flow into the symbol
  const back = kfIO(f, [4.6, 4.85], [0, 1]);
  const toDots = kfIO(f, [4.8, 5.15], [0, 1]);
  const ringR = LOOP_RING.r + 310 * expand * (1 - back);
  const ringOp = (1 - expand) * (1 - back) + back * (1 - tween(f, 4.8, 4.95));
  const markIn = tween(f, 5.05, 5.25);
  const wordIn = tween(f, 5.1, 5.3);

  // words with their typing time
  let wi = 0;
  const lineEls = LINES.map((ln) => ln.split(' ').map((w) => ({w, i: wi++})));
  const total = wi;
  // the underline draws as soon as its word has typed
  const ulWord = TAGLINE.split(' ').findIndex((w) => w.startsWith(UNDERLINE.split(' ')[0]));
  const underlineAt = TYPE_AT + (ulWord + 1) * PER_WORD + 0.15;
  // the first word starts grey and darkens as the rest types; the final state is all ink
  const firstDark = tween(f, TYPE_AT + PER_WORD, TYPE_AT + total * PER_WORD + 0.3);
  const ulDraw = kfIO(f, [underlineAt, underlineAt + 0.3], [0, 1]);
  // underline geometry on the line that contains it
  const ulLine = LINES.findIndex((l) => l.includes(UNDERLINE));
  const ulText = LINES[ulLine] ?? '';
  const ulStart = measureText(ulText.slice(0, ulText.indexOf(UNDERLINE)), LINE_FONT, FS * 0.55);
  const ulW = measureText(UNDERLINE, LINE_FONT, FS * 0.55);
  const ulLineW = measureText(ulText, LINE_FONT, FS * 0.55);
  const LH = Math.round(FS * 1.35);
  const top = 540 - (LINES.length * LH) / 2;

  return (
    <AbsoluteFill>
      {show('bg') ? (
        <AbsoluteFill style={{opacity: env.inP, background: COLORS.white}} />
      ) : null}
      {show('fg') ? (
        <>
          {/* the loop ring (from scene 12), expanding softly, then flowing into the symbol */}
          {ringOp > 0.01 ? (
            <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
              <circle cx={LOOP_RING.cx} cy={LOOP_RING.cy} r={ringR} fill="none" stroke={alpha(UI.ink, 0.7)} strokeWidth={2.5} opacity={ringOp} />
            </svg>
          ) : null}
          {orbOut < 1 ? <Orb cx={LOOP_RING.cx} cy={LOOP_RING.cy} size={LOOP_RING.orb} frame={f} opacity={1 - orbOut} blur={10 * orbOut} /> : null}

          {/* end line, typed Loom style */}
          {lineOut < 1 ? (
            <div style={{position: 'absolute', left: 0, right: 0, top, height: LINES.length * LH, opacity: 1 - lineOut, filter: lineOut > 0.01 ? `blur(${14 * lineOut}px)` : undefined}}>
              {lineEls.map((ws, li) => (
                <div key={li} style={{height: LH, display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: UI_FONT, fontSize: FS, fontWeight: 600, letterSpacing: '-0.02em', whiteSpace: 'pre'}}>
                  <span data-safe={`end line ${li + 1}`} style={{display: 'inline-block', lineHeight: `${LH}px`, padding: `${Math.round(FS * 0.3)}px 0`}}>
                  {ws.map(({w, i}, j) => {
                    const at = TYPE_AT + i * PER_WORD;
                    const vis = s >= at ? 1 : 0;
                    const dark = i === 0 ? 0 : tween(f, at, at + 0.35);
                    return (
                      <span key={j} style={{opacity: vis, color: `color-mix(in srgb, #0D1224 ${Math.round(100 * (i === 0 ? firstDark : dark))}%, #9CA3AF)`}}>
                        {w}
                        {j < ws.length - 1 ? ' ' : ''}
                      </span>
                    );
                  })}
                  </span>
                </div>
              ))}
              {ulLine >= 0 ? (
                <div style={{position: 'absolute', left: 960 - ulLineW / 2 + ulStart, top: ulLine * LH + LH / 2 + FS * 0.66, width: ulW * ulDraw, height: 6, borderRadius: 3, background: '#8FD03C'}} />
              ) : null}
            </div>
          ) : null}

          {/* ring -> dots -> BotCircuits symbol, then the wordmark */}
          {toDots > 0 && markIn < 1 ? (
            <Metaballs p={toDots} opacity={Math.min(1, toDots * 4) * (1 - markIn)} cx={MARK_C.x} cy={MARK_C.y} size={MARK_H} from="ring" ringR={ringR} ringOffset={{x: LOOP_RING.cx - MARK_C.x, y: LOOP_RING.cy - MARK_C.y}} id="goo13" />
          ) : null}
          {markIn > 0 ? (
            <div data-safe="end symbol" style={{position: 'absolute', left: MARK_C.x - MARK_W / 2, top: MARK_C.y - MARK_H / 2, opacity: markIn, filter: markIn < 0.99 ? `blur(${8 * (1 - markIn)}px)` : undefined}}>
              <LogoMark height={MARK_H} />
            </div>
          ) : null}
          {wordIn > 0 ? (
            <div data-safe="end wordmark" style={{position: 'absolute', left: MARK_C.x + MARK_W / 2 + GAP, top: 540 - WORD_H / 2, opacity: wordIn, filter: wordIn < 0.99 ? `blur(${12 * (1 - wordIn)}px)` : undefined, transform: `translateX(${16 * (1 - wordIn)}px)`}}>
              <Wordmark height={WORD_H} />
            </div>
          ) : null}
          {URL ? (
            <div data-safe="end url" style={{position: 'absolute', left: 0, right: 0, top: 540 + MARK_H / 2 + 40, textAlign: 'center', fontFamily: FONT_MONO, fontSize: 28, color: UI.text2, opacity: tween(f, 5.3, 5.5)}}>
              {URL.slice(0, Math.max(0, Math.floor((s - 5.3) / 0.03)))}
            </div>
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
