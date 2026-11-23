import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {colors} from '../tokens';

/**
 * Voice waveform. Bar heights are a deterministic function of the frame
 * number (layered sines with fixed per bar phases); `amplitude` 0..1 scales
 * them, and at 0 every bar is a flat dot.
 */
export const Waveform: React.FC<{
  amplitude: number;
  bars?: number;
  barWidth?: number;
  gap?: number;
  maxHeight?: number;
  color?: string;
}> = ({amplitude, bars = 28, barWidth = 4, gap = 6, maxHeight = 64, color = colors.charcoal}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const minH = barWidth;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap, height: maxHeight}}>
      {Array.from({length: bars}, (_, i) => {
        // Envelope keeps the middle bars taller than the ends.
        const envelope = 0.45 + 0.55 * Math.sin((Math.PI * (i + 0.5)) / bars);
        const wave =
          0.5 +
          0.3 * Math.sin(t * 9.1 + i * 0.71) +
          0.2 * Math.sin(t * 14.3 + i * 1.93 + 1.2);
        const level = Math.max(0, Math.min(1, wave)) * envelope * amplitude;
        const h = minH + (maxHeight - minH) * level;
        return <div key={i} style={{width: barWidth, height: h, borderRadius: barWidth / 2, background: color}} />;
      })}
    </div>
  );
};
