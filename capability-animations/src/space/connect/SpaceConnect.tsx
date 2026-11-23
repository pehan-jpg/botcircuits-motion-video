import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Card} from '../../components/Card';
import {Chip} from '../../components/Chip';
import {ConnectionLine, Point, fanCurve} from '../../components/ConnectionLine';
import {TickIcon} from '../../components/Icons';
import {Orb} from '../../components/Orb';
import {StatusPill} from '../../components/StatusPill';
import {Rect, Veil, veilState} from '../../components/Veil';
import {HEIGHT, WIDTH} from '../../config';
import {mix, progress} from '../../motion';
import {colors, fontFamily, fontWeights} from '../../tokens';
import {AccessChip} from '../components/AccessChip';
import {AuditChip} from '../components/AuditChip';
import {FlowDot} from '../components/FlowDot';
import {IntegrationTile, TILE} from '../components/IntegrationTile';
import {MaskPill} from '../components/MaskPill';
import {MaskedValue} from '../components/MaskedValue';
import {MCP_TILE_HEIGHT, McpTile} from '../components/McpTile';
import {ModelCard} from '../components/ModelCard';
import {RecordCard} from '../components/RecordCard';
import {
  ACCESS,
  AUDIT,
  FIELDS,
  MASK_LABEL,
  MCP,
  MODEL_TITLE,
  RECORD_TITLE,
  SPACE_NAME,
  SUMMARY,
  TILES,
  connectionsText,
} from './content';
import {SPACE_CONNECT_TIMELINE as T} from './timeline';

/* ------------------------------------------------------------------ */
/* Part 1 layout                                                       */
/* ------------------------------------------------------------------ */

const SPACE = {x: 200, width: 420, pad: 32, orb: 64};
const SPACE_H = SPACE.pad * 2 + SPACE.orb;
const SPACE_Y = HEIGHT / 2 - SPACE_H / 2;
const TILES_X = 860;
const TILE_GAP = 14;
const tileHeights = [...TILES.map(() => TILE.height), MCP_TILE_HEIGHT];
const tilesTotal = tileHeights.reduce((a, b) => a + b, 0) + TILE_GAP * (tileHeights.length - 1);
const TILES_Y = (HEIGHT - tilesTotal) / 2;
const tileY = (i: number) => TILES_Y + tileHeights.slice(0, i).reduce((a, b) => a + b + TILE_GAP, 0);
const SPACE_EDGE: Point = {x: SPACE.x + SPACE.width, y: SPACE_Y + SPACE_H / 2};
const TILE_LINES = tileHeights.map((h, i) => fanCurve(SPACE_EDGE, {x: TILES_X, y: tileY(i) + (i === TILES.length ? TILE.height / 2 : h / 2)}));
const PART1_BOUNDS: Rect = {x: SPACE.x, y: TILES_Y, width: TILES_X + TILE.width - SPACE.x, height: tilesTotal, radius: 20};

/* ------------------------------------------------------------------ */
/* Part 2 layout                                                       */
/* ------------------------------------------------------------------ */

const CARD = {width: 440, height: 380};
const CARD_Y = (HEIGHT - CARD.height) / 2;
const RECORD_X = 100;
const MODEL_X = 1060;
const PILL = {width: 280, height: 64, cx: 800, cy: 500};
const PART2_BOUNDS: Rect = {x: RECORD_X, y: CARD_Y, width: MODEL_X + CARD.width - RECORD_X, height: CARD.height, radius: 20};
const L1 = fanCurve({x: RECORD_X + CARD.width, y: PILL.cy}, {x: PILL.cx - PILL.width / 2, y: PILL.cy});
const THROUGH = fanCurve({x: PILL.cx - PILL.width / 2, y: PILL.cy}, {x: PILL.cx + PILL.width / 2, y: PILL.cy});
const L2 = fanCurve({x: PILL.cx + PILL.width / 2, y: PILL.cy}, {x: MODEL_X, y: PILL.cy});
/** The dot's path: line 1, under the pill, then line 2 (lengths along x). */
const SEGMENTS = [L1, THROUGH, L2];
const SEG_LEN = SEGMENTS.map((c) => Math.abs(c[3].x - c[0].x));
const PATH_LEN = SEG_LEN.reduce((a, b) => a + b, 0);

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export const SpaceConnect: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const f = (s: number) => s * fps;
  const p = (a: number, b: number) => progress(frame, f(a), f(b));
  const rise = (v: number): React.CSSProperties => ({opacity: v, transform: `translateY(${mix(12, 0, v)}px)`});

  /* Part 1 */
  const spaceIn = p(T.spaceIn.start, T.spaceIn.end);
  const nTiles = tileHeights.length;
  const tileIn = tileHeights.map((_, i) => p(T.tilesIn.start + i * T.tilesIn.stagger, T.tilesIn.start + i * T.tilesIn.stagger + T.tilesIn.duration));
  const C = T.connect;
  const cStart = (i: number) => C.start + i * C.stagger;
  const lineDraw = tileHeights.map((_, i) => p(cStart(i), cStart(i) + C.line));
  const status = tileHeights.map((_, i) => {
    const spin = cStart(i) + C.line;
    const done = spin + C.spinner;
    const toSpin = p(spin, spin + 0.08);
    const toDone = p(done, done + C.connected);
    return {connect: 1 - toSpin, spinner: toSpin * (1 - toDone), connected: toDone, tick: p(done + 0.05, done + C.connected + 0.15)};
  });
  const countSteps = tileHeights.map((_, i) => {
    const s = cStart(i) + C.line + C.spinner;
    return p(s, s + C.countFade);
  });
  const countLayer = (n: number) => (n === 0 ? 1 : countSteps[n - 1]) * (n < nTiles ? 1 - countSteps[n] : 1);
  const toolsIn = MCP.tools.map((_, i) => p(T.tools.start + i * T.tools.stagger, T.tools.start + i * T.tools.stagger + T.tools.duration));
  const accessIn = p(T.accessIn.start, T.accessIn.end);

  /* Veil */
  const veil = {start: f(T.veil.start), end: f(T.veil.start + T.veil.duration)};
  const v = veilState(frame, veil);

  /* Part 2 */
  const recordIn = p(T.recordIn.start, T.recordIn.end);
  const pillIn = p(T.maskPillIn.start, T.maskPillIn.end);
  const modelIn = p(T.modelIn.start, T.modelIn.end);
  const line1 = p(T.lines.start, T.lines.start + T.lines.duration);
  const line2 = p(T.lines.start + T.lines.secondDelay, T.lines.start + T.lines.secondDelay + T.lines.duration);
  const M = T.mask;
  const masks = FIELDS.map((_, i) => p(M.start + i * M.stagger, M.start + i * M.stagger + M.fade));
  const dots = FIELDS.map((_, i) => {
    const s = M.start + i * M.stagger;
    const e = s + T.dotTravel;
    return {d: p(s, e), o: p(s, s + T.dotFade) * (1 - p(e - T.dotFade, e))};
  });
  const modelRows = FIELDS.map((_, i) => p(T.modelRows.start + i * T.modelRows.stagger, T.modelRows.start + i * T.modelRows.stagger + T.modelRows.duration));
  const summary = p(T.summary.start, T.summary.end);
  const summaryTick = p(T.summary.start + 0.1, T.summary.end + 0.1);
  const audit = p(T.audit.start, T.audit.end);

  const fadeOut = progress(frame, f(T.fadeOut.start), durationInFrames - 1);

  /** Place a dot at distance fraction `d` along the composite path. */
  const dotAt = (d: number, o: number, key: number) => {
    let dist = d * PATH_LEN;
    for (let s = 0; s < SEGMENTS.length; s++) {
      if (dist <= SEG_LEN[s] || s === SEGMENTS.length - 1) {
        return <FlowDot key={key} curve={SEGMENTS[s]} progress={Math.min(1, dist / SEG_LEN[s])} opacity={o} />;
      }
      dist -= SEG_LEN[s];
    }
    return null;
  };

  return (
    <AbsoluteFill style={{background: colors.background, fontFamily}}>
      <AbsoluteFill style={{opacity: 1 - fadeOut}}>
        {/* Part 1: connections */}
        {!v.outgoingDone && (
          <AbsoluteFill style={v.outgoing}>
            <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0}}>
              {TILE_LINES.map((c, i) => (
                <ConnectionLine key={i} curve={c} draw={lineDraw[i]} />
              ))}
            </svg>
            <div style={{position: 'absolute', left: SPACE.x, top: SPACE_Y, ...rise(spaceIn)}}>
              <Card width={SPACE.width} height={SPACE_H} padding={SPACE.pad}>
                <div style={{display: 'flex', alignItems: 'center', gap: 20, height: SPACE.orb}}>
                  <Orb size={SPACE.orb} />
                  <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
                    <div style={{fontSize: 24, fontWeight: fontWeights.semibold, lineHeight: '29px', letterSpacing: '-0.01em', color: colors.text}}>{SPACE_NAME}</div>
                    <div style={{position: 'relative', height: 22, fontSize: 16, lineHeight: '22px', color: colors.textSecondary, whiteSpace: 'nowrap'}}>
                      {Array.from({length: nTiles + 1}, (_, n) => {
                        const o = countLayer(n);
                        return o > 0 ? (
                          <span key={n} style={{position: 'absolute', left: 0, top: 0, opacity: o}}>
                            {connectionsText(n)}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            {accessIn > 0 && (
              <div style={{position: 'absolute', left: SPACE.x, top: SPACE_Y + SPACE_H + 16, ...rise(accessIn)}}>
                <AccessChip text={ACCESS} width={SPACE.width} />
              </div>
            )}
            {TILES.map((t, i) => (
              <div key={t.name} style={{position: 'absolute', left: TILES_X, top: tileY(i), ...rise(tileIn[i])}}>
                <IntegrationTile kind={t.kind} name={t.name} detail={t.detail} status={<StatusPill {...status[i]} />} />
              </div>
            ))}
            <div style={{position: 'absolute', left: TILES_X, top: tileY(TILES.length), ...rise(tileIn[TILES.length])}}>
              <McpTile name={MCP.name} detail={MCP.detail} status={<StatusPill {...status[TILES.length]} />} tools={MCP.tools} toolsIn={toolsIn} />
            </div>
          </AbsoluteFill>
        )}

        <Veil {...veil} from={PART1_BOUNDS} to={PART2_BOUNDS} peak={T.veil.peak} />

        {/* Part 2: privacy */}
        {!v.incomingPending && (
          <AbsoluteFill style={v.incoming}>
            <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0}}>
              <ConnectionLine curve={L1} draw={line1} />
              <ConnectionLine curve={L2} draw={line2} />
            </svg>
            {dots.map((d, i) => dotAt(d.d, d.o, i))}
            {recordIn > 0 && (
              <div style={{position: 'absolute', left: RECORD_X, top: CARD_Y, ...rise(recordIn)}}>
                <RecordCard
                  width={CARD.width}
                  height={CARD.height}
                  title={RECORD_TITLE}
                  rows={FIELDS.map((fd, i) => ({label: fd.label, value: <MaskedValue value={fd.value} masked={fd.masked} mask={masks[i]} />}))}
                />
              </div>
            )}
            {pillIn > 0 && (
              <div style={{position: 'absolute', left: PILL.cx - PILL.width / 2, top: PILL.cy - PILL.height / 2, ...rise(pillIn)}}>
                <MaskPill label={MASK_LABEL} width={PILL.width} height={PILL.height} />
              </div>
            )}
            {modelIn > 0 && (
              <div style={{position: 'absolute', left: MODEL_X, top: CARD_Y, ...rise(modelIn)}}>
                <ModelCard
                  width={CARD.width}
                  height={CARD.height}
                  title={MODEL_TITLE}
                  rows={FIELDS.map((fd, i) => ({label: fd.label, masked: fd.masked, appear: modelRows[i]}))}
                />
              </div>
            )}
            {summary > 0 && (
              <div style={{position: 'absolute', left: 0, right: 0, top: 580 - 18, display: 'flex', justifyContent: 'center', ...rise(summary)}}>
                <Chip
                  label={SUMMARY}
                  icon={<TickIcon size={14} strokeWidth={1.75} color={colors.charcoal} draw={summaryTick} />}
                  fontSize={14}
                  height={36}
                  paddingX={14}
                  gap={6}
                  background={colors.surface}
                  color={colors.text}
                  style={{border: `1px solid ${colors.border}`, boxSizing: 'border-box'}}
                />
              </div>
            )}
            {audit > 0 && (
              <div style={{position: 'absolute', left: 0, right: 0, top: 840 - 24, display: 'flex', justifyContent: 'center', ...rise(audit)}}>
                <AuditChip text={AUDIT} />
              </div>
            )}
          </AbsoluteFill>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
