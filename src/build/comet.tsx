import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {COLORS, alpha, kfIO, tween} from '../theme';
import {sec} from '../timeline';
import {BACKDROPS, COMET} from '../handoff';
import {Camera} from '../camera';
import {Backdrop} from '../components/Backdrop';
import {DuskSky, LilacSky} from '../components/ProceduralSky';

/**
 * Comet wipe 7 -> 8 (shared by both scenes; `c` = seconds since the comet
 * started, 0 .. COMET.duration). The orb travels centre -> left third with a
 * soft white trail while the dusk sky wipes in from left to right.
 */
export const cometOrb = (c: number) => {
  const fr = Math.round(c * sec(1));
  const k = kfIO(fr, [0, COMET.duration], [0, 1]);
  const arc = Math.sin(k * Math.PI) * -70;
  return {
    x: COMET.from.x + (COMET.to.x - COMET.from.x) * k,
    y: COMET.from.y + (COMET.to.y - COMET.from.y) * k + arc,
    scale: COMET.from.scale + (COMET.to.scale - COMET.from.scale) * k,
    k,
  };
};

export const cometEdge = (c: number) => {
  const fr = Math.round(c * sec(1));
  return kfIO(fr, [0.15, 1.4], [-320, 2240]);
};

/** The dusk sky (image if provided, smooth procedural otherwise). */
export const Dusk: React.FC<{t: number; cam: Camera; frame: number; bloom?: number}> = ({t, cam, frame, bloom = 0}) => (
  <AbsoluteFill>
    <Backdrop
      src={BACKDROPS.dusk8}
      t={t}
      span={8}
      cam={cam}
      scrim="dark"
      pan={[-5, 0]}
      fallback={<DuskSky t={t} cam={{...cam, x: 960, y: 540}} frame={frame} />}
    />
    {bloom > 0 ? (
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 45% at 50% 100%, ${alpha(COLORS.peach, 0.75)} 0%, ${alpha(COLORS.coral, 0.3)} 40%, ${alpha(COLORS.coral, 0)} 75%)`,
          opacity: bloom,
        }}
      />
    ) : null}
  </AbsoluteFill>
);

/** Lilac sky with the dusk wiping in behind the comet. */
export const CometSky: React.FC<{c: number; lilacT: number; duskT: number; cam: Camera; frame: number}> = ({c, lilacT, duskT, cam, frame}) => {
  const edge = cometEdge(c);
  const soft = 260;
  const mask = `linear-gradient(90deg, #000 0px, #000 ${edge - soft / 2}px, transparent ${edge + soft / 2}px)`;
  return (
    <AbsoluteFill>
      {edge < 1920 + soft ? <LilacSky t={lilacT} cam={cam} /> : null}
      {edge > -soft ? (
        <AbsoluteFill style={{WebkitMaskImage: mask, maskImage: mask}}>
          <Dusk t={duskT} cam={cam} frame={frame} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/** Soft white trail behind the travelling orb. */
export const CometTrail: React.FC<{c: number; opacity?: number}> = ({c, opacity = 1}) => {
  const {fps} = useVideoConfig();
  const ghosts = [0.06, 0.12, 0.18, 0.24, 0.3];
  const live = tween(Math.round(c * fps), 0.05, 0.25) * (1 - tween(Math.round(c * fps), 1.2, 1.5));
  return (
    <AbsoluteFill style={{opacity: live * opacity}}>
      {ghosts.map((g, i) => {
        if (c - g < 0) return null;
        const p = cometOrb(c - g);
        const r = 150 - i * 18;
        return (
          <div
            key={g}
            style={{
              position: 'absolute',
              left: p.x - r,
              top: p.y - r,
              width: 2 * r,
              height: 2 * r,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(COLORS.white, 0.55 - i * 0.09)} 0%, ${alpha(COLORS.white, 0)} 68%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
