import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT_MONO, alpha, kfIO, tween} from '../theme';
import {BUILD7, LOOP_RING} from '../v7';
import {URL} from '../constants';
import {S13_OUT, TAGLINE_LINES, TAGLINE_TYPING} from '../pacing';
import {CHAR_FADE, typedChars} from '../ui/typewriter';
import {Orb} from '../components/Orb';
import {LogoMark, MARK_ASPECT, LOCKUP_RATIO, Wordmark, WORDMARK_ASPECT} from '../components/Logo';
import {measureText} from '../components/measure';
import {UI, UI_FAMILY, UI_FONT} from '../ui/tokens';
import {Metaballs} from './Scene04Intro';
import {envelope, SceneLayerProps} from './kit';

// end line: two centred lines at 80px (one line would be wider than the safe area)
const FS = 80;
const LINE_FONT = `600 ${FS}px "${UI_FAMILY}"`;
const LINES = TAGLINE_LINES;
const UNDERLINE = 'everywhere';
const LH = Math.round(FS * 1.35); // the extra line height from scene 4: descenders never clipped
const PAD = Math.round(FS * 0.3);
/** Final, pre-measured layout: each line in its own fixed-width box, left aligned, centred as when complete. */
export const taglineBoxes = () => {
  const top = 540 - (LINES.length * LH) / 2;
  return LINES.map((l, i) => {
    const w = measureText(l, LINE_FONT, FS * 0.55);
    return {text: l, x: 960 - w / 2, y: top + i * LH, w, h: LH};
  });
};

// final lockup (symbol + wordmark), centred
const MARK_H = 130;
const MARK_W = MARK_H * MARK_ASPECT;
const GAP = MARK_H * LOCKUP_RATIO.gap;
const WORD_H = MARK_H * LOCKUP_RATIO.wordHeight;
const WORD_W = WORD_H * WORDMARK_ASPECT;
const LOCK_W = MARK_W + GAP + WORD_W;
const MARK_C = {x: 960 - LOCK_W / 2 + MARK_W / 2, y: 540};

/**
 * SCENE 13 End card on white. The loop ring expands as the orb dissolves,
 * the end line types with the chat typewriter (src/ui/typewriter.ts) in
 * fixed line boxes, the lime underline draws under "everywhere"; then the
 * ring flows into the BotCircuits symbol and the wordmark resolves. Holds 1.2 s.
 */
export const Scene13End: React.FC<SceneLayerProps> = ({layer = 'all'}) => {
  const f = useCurrentFrame();
  const show = (k: 'bg' | 'shell' | 'fg') => layer === 'all' || layer === k;
  const {fps} = useVideoConfig();
  const s = f / fps;
  const env = envelope(f, BUILD7.dur.s13, true, false, BUILD7.ov.s13);
  const expand = kfIO(f, [0.3, 1.0], [0, 1]);
  const orbOut = tween(f, 0.3, 0.8);
  const D = S13_OUT - 4.6; // everything after the tagline keeps its v16 rhythm, shifted to the new out time
  const lineOut = tween(f, 4.6 + D, 4.9 + D);
  // the ring expands and fades as the line types, then returns to flow into the symbol
  const back = kfIO(f, [4.6 + D, 4.85 + D], [0, 1]);
  const toDots = kfIO(f, [4.8 + D, 5.15 + D], [0, 1]);
  const ringR = LOOP_RING.r + 310 * expand * (1 - back);
  const ringOp = (1 - expand) * (1 - back) + back * (1 - tween(f, 4.8 + D, 4.95 + D));
  const markIn = tween(f, 5.05 + D, 5.25 + D);
  const wordIn = tween(f, 5.1 + D, 5.3 + D);

  // the typewriter (shared with the chat): characters fade in over 70 ms in final ink
  const T = TAGLINE_TYPING;
  const boxes = taglineBoxes();
  const lineStart = [0, LINES[0].length + 1];
  const chars = typedChars(T.times, s);
  // caret: ink at 70%, blinking at 1.1 Hz; jumps to the start of line 2 at the break; fades 0.3 s after the end
  const curLine = LINES.length > 1 && chars >= lineStart[1] ? 1 : 0; // the break character moves the caret down
  const inLine = curLine === 0 ? Math.min(chars, LINES[0].length) : Math.max(0, chars - lineStart[1]);
  const caretX = boxes[curLine].x + measureText(LINES[curLine].slice(0, inLine), LINE_FONT, FS * 0.55) + 3;
  const caretOp = s < T.start ? 0 : 0.7 * (Math.floor((s - T.start) * 2.2) % 2 === 0 ? 1 : 0.15) * (1 - tween(f, T.end, T.end + 0.3));
  // the underline draws once the full stop after "everywhere" has finished typing
  const dotIdx = LINES[0].indexOf(UNDERLINE) + UNDERLINE.length;
  const underlineAt = T.times[dotIdx] + CHAR_FADE;
  const ulDraw = 1 - Math.pow(1 - Math.min(1, Math.max(0, (s - underlineAt) / 0.4)), 3);
  const ulStart = measureText(LINES[0].slice(0, LINES[0].indexOf(UNDERLINE)), LINE_FONT, FS * 0.55);
  const ulW = measureText(UNDERLINE, LINE_FONT, FS * 0.55);

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

          {/* end line: typewriter, each line in a fixed box (untyped characters invisible but in place) */}
          {lineOut < 1 ? (
            <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity: 1 - lineOut, filter: lineOut > 0.01 ? `blur(${14 * lineOut}px)` : undefined}}>
              {boxes.map((b, li) => (
                <div key={li} data-safe={`end line ${li + 1}`} style={{position: 'absolute', left: b.x, top: b.y - PAD, width: b.w, height: b.h + 2 * PAD, paddingTop: PAD, boxSizing: 'border-box', fontFamily: UI_FONT, fontSize: FS, fontWeight: 600, lineHeight: `${LH}px`, color: '#0D1224', whiteSpace: 'pre', textAlign: 'left'}}>
                  {b.text.split('').map((ch, j) => {
                    const t = T.times[lineStart[li] + j];
                    return (
                      <span key={j} style={{opacity: s < t ? 0 : Math.min(1, (s - t) / CHAR_FADE)}}>
                        {ch}
                      </span>
                    );
                  })}
                </div>
              ))}
              {caretOp > 0.001 ? <div style={{position: 'absolute', left: caretX, top: boxes[curLine].y + LH / 2 - FS * 0.48, width: 3, height: FS * 0.98, borderRadius: 1.5, background: '#0D1224', opacity: caretOp}} /> : null}
              {ulDraw > 0 ? <div style={{position: 'absolute', left: boxes[0].x + ulStart, top: boxes[0].y + LH / 2 + FS * 0.66, width: ulW * ulDraw, height: 6, borderRadius: 3, background: '#8FD03C'}} /> : null}
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
            <div data-safe="end url" style={{position: 'absolute', left: 0, right: 0, top: 540 + MARK_H / 2 + 40, textAlign: 'center', fontFamily: FONT_MONO, fontSize: 28, color: UI.text2, opacity: tween(f, 5.3 + D, 5.5 + D)}}>
              {URL.slice(0, Math.max(0, Math.floor((s - 5.3 - D) / 0.03)))}
            </div>
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
