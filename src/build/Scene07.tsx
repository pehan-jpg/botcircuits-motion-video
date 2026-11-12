import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, alpha, bob, kf, kfIO, popIn, tween} from '../theme';
import {sec} from '../timeline';
import {COMET, MARQUEE, ORB_CENTER, marqueeShift, marqueeSlot} from '../handoff';
import {camAt, CamKeys, World} from '../components/Stage';
import {Cursor} from '../components/Cursor';
import {Orb} from '../components/Orb';
import {LogoTile} from '../components/LogoTile';
import {LogoName} from '../components/logos';
import {Cubic, Pt, StrokeLine, cubicPoint} from '../components/StrokeLine';
import {Camera} from '../camera';
import {CometSky, CometTrail, cometOrb} from './comet';

/** SCENE 7 (6 s) "Connect your systems". No text on screen. */
export const SYSTEMS: LogoName[] = ['salesforce', 'zendesk', 'hubspot', 'stripe', 'notion', 'google-drive', 'shopify', 'jira'];
const ROWS: LogoName[][] = [
  ['hubspot', 'jira', 'shopify', 'google-drive', 'zendesk', 'notion', 'salesforce', 'hubspot', 'jira', 'shopify', 'stripe', 'google-drive', 'zendesk', 'notion', 'salesforce', 'hubspot', 'jira', 'shopify', 'stripe'],
  ['notion', 'stripe', 'hubspot', 'salesforce', 'jira', 'shopify', 'google-drive', 'zendesk', 'hubspot', 'salesforce', 'jira', 'notion', 'shopify', 'stripe', 'google-drive', 'zendesk', 'hubspot', 'jira', 'salesforce'],
];
/** The scene-6 nodes that arrive in the marquee (sharp at frame 0). */
const SEEDED = new Set(['0-6', '1-7', '0-10', '1-11']);

export const S7_CAM: CamKeys = {
  t: [0, 1.0, 4.0, 5.2, 5.5],
  x: [960, 960, 960, 960, 960],
  y: [540, 540, 540, 530, 540],
  s: [1, 0.97, 0.97, 1.08, 1],
  r: {t: [0, 4.0, 4.6, 5.2], v: [0, 0, 1.5, 0]},
};
const RING_R = 380;
const TAPS = [1.2, 1.75, 2.3];
const LAUNCH = [...TAPS.map((t) => t + 0.05), 2.7, 2.9, 3.1, 3.3, 3.5];
const FLIGHT = [0.6, 0.6, 0.6, 0.45, 0.45, 0.45, 0.45, 0.45];

const fromScreen = (c: Camera, p: Pt): Pt => ({x: c.x + (p.x - 960) / c.scale, y: c.y + (p.y - 540) / c.scale});
const slotX = (row: number, slot: number, t: number) => {
  const span = MARQUEE.slots * MARQUEE.step;
  const raw = slot * MARQUEE.step + marqueeShift(row, t);
  return ((raw % span) + span) % span;
};
const slotPos = (row: number, slot: number, t: number) => {
  // wrap-around position, then the shared rotation
  const shift = slotX(row, slot, t) - slot * MARQUEE.step;
  return marqueeSlot(row, slot, shift);
};
/** A visible marquee slot holding `name` at time t (nearest the frame centre). */
const launchSlot = (name: LogoName, t: number) => {
  let best = {row: 0, slot: 0, d: Infinity};
  ROWS.forEach((r, ri) =>
    r.forEach((n, si) => {
      if (n !== name) return;
      const p = slotPos(ri, si, t);
      const d = Math.abs(p.x - 960) + (p.x < 160 || p.x > 1760 ? 5000 : 0);
      if (d < best.d) best = {row: ri, slot: si, d};
    }),
  );
  return best;
};

export const tileDock = (i: number): Pt => {
  const a = ((-90 + i * 45) * Math.PI) / 180;
  return {x: 960 + RING_R * Math.cos(a), y: 540 + RING_R * Math.sin(a)};
};

export const Scene07: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = f / fps;
  const cam = camAt(f, S7_CAM);
  const lastDock = LAUNCH[7] + FLIGHT[7];
  const settle = tween(f, 0, 1.0);
  const leave = tween(f, 2.2, lastDock);
  const pullIn = (i: number) => tween(f, 5.2 + i * 0.025, 5.5 + i * 0.025);
  const c = s - COMET.startS7; // comet clock
  const comet = c > 0 ? cometOrb(c) : null;
  const launched = SYSTEMS.map((n, i) => (s >= LAUNCH[i] ? launchSlot(n, LAUNCH[i]) : null));
  const orbPulse = LAUNCH.reduce((m, l, i) => {
    const d = l + FLIGHT[i];
    return s >= d && s < d + 0.5 ? tween(f, d, d + 0.5) : m;
  }, 0);

  return (
    <AbsoluteFill>
      <CometSky c={Math.max(0, c)} lilacT={s + 0.7} duskT={Math.max(0, c)} cam={cam} frame={f} />

      {/* marquee rows */}
      {leave < 1
        ? ROWS.map((row, ri) =>
            row.map((name, si) => {
              const key = `${ri}-${si}`;
              const seeded = SEEDED.has(key);
              const hidden = launched.some((l) => l && l.row === ri && l.slot === si);
              if (hidden) return null;
              const p = slotPos(ri, si, s);
              const op = seeded ? 1 - 0.6 * settle : 0.4 * tween(f, 0.1, 1.0);
              const blur = 6 * settle + 10 * leave;
              return (
                <div key={key} style={{position: 'absolute', inset: 0, opacity: op * (1 - leave), filter: blur > 0.05 ? `blur(${blur}px)` : 'none'}}>
                  <LogoTile name={name} cx={p.x} cy={p.y} size={MARQUEE.size} rotate={MARQUEE.rotate} />
                </div>
              );
            }),
          )
        : null}

      <World cam={cam}>
        {SYSTEMS.map((name, i) => {
          const L = LAUNCH[i];
          const d = L + FLIGHT[i];
          const ls = launched[i];
          if (!ls) return null;
          const from = fromScreen(camAt(Math.round(L * fps), S7_CAM), slotPos(ls.row, ls.slot, L));
          const dock = tileDock(i);
          const fl = kfIO(f, [L, d], [0, 1]);
          const curve: Cubic = [from, {x: from.x, y: from.y + (540 - from.y) * 0.6}, {x: dock.x + (dock.x - 960) * 0.4, y: dock.y + (dock.y - 540) * 0.4}, dock];
          const p = cubicPoint(curve, fl);
          const k = pullIn(i);
          const idle = s > d ? bob(f, i, 5) * (1 - k) : 0;
          const q = {x: p.x + (960 - p.x) * k, y: p.y + idle + (540 - p.y) * k};
          const line = tween(f, d, d + 0.35) * (1 - k);
          const settleS = kf(f, [d, d + 0.14, d + 0.32], [1, 1.035, 1]);
          return (
            <React.Fragment key={name}>
              <StrokeLine
                curve={[q, q, {x: 960, y: 540}, {x: 960, y: 540}]}
                draw={line}
                dot={s > 4.1 && s < 5.15 ? ((((s - 4.1 - i * 0.07) % 0.7) + 0.7) % 0.7) / 0.7 : undefined}
                dotOpacity={0.9}
                color={alpha(COLORS.inkNavy, 0.45)}
                dotColor={COLORS.white}
                width={2}
                dotSize={12}
              />
              <LogoTile
                name={name}
                cx={q.x}
                cy={q.y}
                size={MARQUEE.size}
                rotate={MARQUEE.rotate * (1 - fl)}
                scale={kf(f, [L, L + 0.15], [0.9, 1]) * settleS * (1 - k)}
                badge={popIn(f, d + 0.05, 0.3, 1.04) * (1 - k)}
                badgeDraw={tween(f, d + 0.15, d + 0.4)}
              />
            </React.Fragment>
          );
        })}
        {!comet ? (
          <Orb cx={ORB_CENTER.cx} cy={ORB_CENTER.cy + bob(f, 0, 6) * tween(f, 0.5, 1.0) * (1 - tween(f, 5.2, 5.5))} scale={ORB_CENTER.scale} pulse={orbPulse} light={1} />
        ) : null}
      </World>

      {comet ? (
        <>
          <CometTrail c={c} />
          <Orb cx={comet.x} cy={comet.y} scale={comet.scale} light={1 - comet.k} glow={comet.k} />
        </>
      ) : null}

      <Cursor
        frame={f}
        keys={[
          {t: 0.6, x: 1960, y: 1000},
          {t: 1.15, x: slotPos(launchSlot(SYSTEMS[0], TAPS[0]).row, launchSlot(SYSTEMS[0], TAPS[0]).slot, TAPS[0]).x, y: slotPos(launchSlot(SYSTEMS[0], TAPS[0]).row, launchSlot(SYSTEMS[0], TAPS[0]).slot, TAPS[0]).y},
          {t: 1.7, x: slotPos(launchSlot(SYSTEMS[1], TAPS[1]).row, launchSlot(SYSTEMS[1], TAPS[1]).slot, TAPS[1]).x, y: slotPos(launchSlot(SYSTEMS[1], TAPS[1]).row, launchSlot(SYSTEMS[1], TAPS[1]).slot, TAPS[1]).y},
          {t: 2.25, x: slotPos(launchSlot(SYSTEMS[2], TAPS[2]).row, launchSlot(SYSTEMS[2], TAPS[2]).slot, TAPS[2]).x, y: slotPos(launchSlot(SYSTEMS[2], TAPS[2]).row, launchSlot(SYSTEMS[2], TAPS[2]).slot, TAPS[2]).y},
          {t: 3.0, x: 1560, y: 1220},
        ]}
        clicks={TAPS}
        hand={[[1.0, 2.5]]}
        rippleColor={COLORS.inkNavy}
        opacity={tween(f, 0.6, 0.8) * (1 - tween(f, 2.7, 3.0))}
      />
    </AbsoluteFill>
  );
};

export const s7End = () => sec(6) - 1;
