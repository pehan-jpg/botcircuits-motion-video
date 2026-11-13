import React from 'react';

export type R = {x: number; y: number; w: number; h: number};
const L = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Continuous rectangle morph (position, size, radius, fill, border, glow).
 * Used to carry a TextBeat underline into the next scene's key shape.
 */
export const RectMorph: React.FC<{
  from: R;
  to: R;
  t: number;
  r0?: number;
  r1?: number;
  fill0?: string;
  fill1?: string;
  border?: string; // CSS border at the end (blended in by t)
  glow?: string;
  opacity?: number;
  children?: React.ReactNode;
}> = ({from, to, t, r0 = 3, r1 = 3, fill0 = '#8FD03C', fill1 = '#8FD03C', border, glow, opacity = 1, children}) => (
  <div
    style={{
      position: 'absolute',
      left: L(from.x, to.x, t),
      top: L(from.y, to.y, t),
      width: L(from.w, to.w, t),
      height: L(from.h, to.h, t),
      borderRadius: L(r0, r1, t),
      background: `color-mix(in srgb, ${fill1} ${Math.round(100 * t)}%, ${fill0})`,
      boxShadow: [border && t > 0 ? `inset 0 0 0 ${2 * t}px ${border}` : '', glow && t > 0 ? glow.replace(/\{t\}/g, String(t)) : ''].filter(Boolean).join(', ') || undefined,
      opacity,
    }}
  >
    {children}
  </div>
);

/**
 * A stroke that morphs continuously from a straight horizontal line (the
 * underline) into a circle: each point of the line moves to its point on the
 * circle. `dash` draws it dotted.
 */
export const LineToCircle: React.FC<{
  line: R;
  cx: number;
  cy: number;
  r: number;
  t: number;
  stroke?: string;
  width?: number;
  dash?: string;
  opacity?: number;
  gaps?: number; // 0..1: splits the circle into 48 segments (bars)
}> = ({line, cx, cy, r, t, stroke = '#8FD03C', width = 6, dash, opacity = 1, gaps = 0}) => {
  const N = 96;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const lx = line.x + line.w * u;
    const ly = line.y + line.h / 2;
    const a = -Math.PI / 2 + u * Math.PI * 2;
    const x = L(lx, cx + Math.cos(a) * r, t);
    const y = L(ly, cy + Math.sin(a) * r, t);
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  const seg = (2 * Math.PI * r) / 48;
  const dashArr = gaps > 0 ? `${seg * (1 - 0.85 * gaps)} ${seg * 0.85 * gaps}` : dash;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d={pts.join(' ')} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashArr} opacity={opacity} />
    </svg>
  );
};
