import React from 'react';
import {COLORS, FONT_SANS, alpha, ease, tween} from '../theme';
import {sec} from '../timeline';
import {GBolt, GDocument, GSpark, GWrench} from './Glyphs';

export type PlateKind = 'instructions' | 'skills' | 'tools' | 'memory';
export const PLATE = {width: 640, height: 400, radius: 36};
export const PLATE_INFO: Record<PlateKind, {label: string; edge: string}> = {
  instructions: {label: 'Instructions', edge: '#4F7CFF'},
  skills: {label: 'Skills', edge: '#8B5CF6'},
  tools: {label: 'Tools', edge: '#FB923C'},
  memory: {label: 'Memory', edge: '#EC4899'},
};

/**
 * Frosted glass plate (scene 5B). `land` is the scene time (s) the plate
 * lands; its edge lights up and its contents animate from then.
 */
export const GlassPlate: React.FC<{kind: PlateKind; frame: number; land: number}> = ({kind, frame, land}) => {
  const {label, edge} = PLATE_INFO[kind];
  const lit = tween(frame, land, land + 0.3);
  const t = (a: number, b: number) => tween(frame, land + a, land + b);
  const Icon = kind === 'instructions' ? GDocument : kind === 'skills' ? GBolt : kind === 'tools' ? GWrench : GSpark;
  let body: React.ReactNode = null;
  if (kind === 'instructions') {
    body = [0.85, 0.7, 0.5].map((w, i) => {
      const p = t(0.1 + i * 0.18, 0.3 + i * 0.18);
      return (
        <div key={i} style={{position: 'relative', height: 22, marginBottom: 22}}>
          <div style={{width: `${w * 100}%`, height: 22, borderRadius: 11, background: alpha(COLORS.white, 0.75), transformOrigin: '0 50%', transform: `scaleX(${p})`}} />
          {p > 0 && p < 1 ? (
            <div style={{position: 'absolute', left: `${w * 100 * p}%`, top: -6, width: 4, height: 34, borderRadius: 2, background: COLORS.white}} />
          ) : null}
        </div>
      );
    });
  } else if (kind === 'skills') {
    body = (
      <div style={{display: 'flex', gap: 20}}>
        {[150, 120, 170].map((w, i) => {
          const p = t(0.1 + i * 0.15, 0.3 + i * 0.15);
          return (
            <div key={i} style={{position: 'relative', width: w, height: 56, borderRadius: 28, border: `2px solid ${alpha(COLORS.white, 0.6)}`, overflow: 'hidden'}}>
              <div style={{position: 'absolute', inset: 0, background: alpha(edge, 0.85), transformOrigin: '0 50%', transform: `scaleX(${p})`}} />
            </div>
          );
        })}
      </div>
    );
  } else if (kind === 'tools') {
    body = (
      <div style={{display: 'flex', gap: 34}}>
        {[0, 1, 2].map((i) => {
          const p = t(0.1 + i * 0.15, 0.3 + i * 0.15);
          return (
            <div key={i} style={{position: 'relative', width: 104, height: 56, borderRadius: 28, background: alpha(COLORS.white, 0.85)}}>
              <div style={{position: 'absolute', inset: 0, borderRadius: 28, background: edge, opacity: p}} />
              <div
                style={{
                  position: 'absolute',
                  left: 6,
                  top: 6,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: COLORS.white,
                  boxShadow: '0 2px 6px rgba(13,18,36,0.3)',
                  transform: `translateX(${48 * p}px)`,
                }}
              />
            </div>
          );
        })}
      </div>
    );
  } else {
    body = (
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(9, 22px)', gap: 20}}>
        {Array.from({length: 27}).map((_, i) => {
          const p = ease(frame, [sec(land + 0.1 + i * 0.022), sec(land + 0.22 + i * 0.022)], [0, 1]);
          return <div key={i} style={{width: 22, height: 22, borderRadius: 11, background: p > 0 ? edge : alpha(COLORS.white, 0.35), opacity: 0.35 + 0.65 * p, transform: `scale(${0.8 + 0.2 * p})`}} />;
        })}
      </div>
    );
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: -PLATE.width / 2,
        top: -PLATE.height / 2,
        width: PLATE.width,
        height: PLATE.height,
        borderRadius: PLATE.radius,
        background: alpha(COLORS.white, 0.12),
        border: `1px solid ${alpha(COLORS.white, 0.35)}`,
        boxShadow: `0 0 0 ${2 * lit}px ${alpha(edge, 0.9 * lit)}, 0 0 ${50 * lit}px ${alpha(edge, 0.7 * lit)}, inset 0 0 40px ${alpha(edge, 0.25 * lit)}`,
        backdropFilter: 'blur(14px)',
        padding: 44,
        boxSizing: 'border-box',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 20, marginBottom: 44}}>
        <div style={{width: 72, height: 72, borderRadius: 20, background: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Icon size={44} color={edge} stroke={2.2} />
        </div>
        <span style={{fontFamily: FONT_SANS, fontWeight: 600, fontSize: 40, color: COLORS.white}}>{label}</span>
      </div>
      {body}
    </div>
  );
};
