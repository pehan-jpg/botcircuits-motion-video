import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {alpha} from '../theme';
import {BACKDROPS} from '../handoff';
import {BuildKey} from '../v7';
import {IDENTITY} from '../components/Stage';
import {Backdrop} from '../components/Backdrop';
import {CreamSky, FallbackPeach, FallbackPeriwinkle, LilacSky} from '../components/ProceduralSky';
import {TextBeat} from '../ui/TextBeat';
import {SceneLayerProps} from './kit';

/** Backdrops shared by a scene and the TextBeat before it. */
export const WhiteWash: React.FC = () => (
  <AbsoluteFill
    style={{
      background: [
        `radial-gradient(circle at 0% 0%, ${alpha('#E9E3FF', 0.7)} 0%, ${alpha('#E9E3FF', 0)} 32%)`,
        `radial-gradient(circle at 100% 0%, ${alpha('#EFE6FF', 0.6)} 0%, ${alpha('#EFE6FF', 0)} 30%)`,
        `radial-gradient(circle at 0% 100%, ${alpha('#EFE6FF', 0.6)} 0%, ${alpha('#EFE6FF', 0)} 30%)`,
        `radial-gradient(circle at 100% 100%, ${alpha('#E9E3FF', 0.7)} 0%, ${alpha('#E9E3FF', 0)} 32%)`,
        '#FFFFFF',
      ].join(', '),
    }}
  />
);
export const CallWash: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 18% 22%, ${alpha('#D9D0FF', 0.9)} 0%, ${alpha('#D9D0FF', 0)} 45%), radial-gradient(circle at 85% 80%, ${alpha('#FFD3B5', 0.85)} 0%, ${alpha('#FFD3B5', 0)} 45%), #FBF8FF`}} />
);
export const TeamWash: React.FC = () => (
  <AbsoluteFill style={{background: `radial-gradient(circle at 15% 15%, ${alpha('#E6E0FF', 0.8)} 0%, ${alpha('#E6E0FF', 0)} 40%), radial-gradient(circle at 90% 90%, ${alpha('#EAF8EF', 0.9)} 0%, ${alpha('#EAF8EF', 0)} 45%), #FAFAFC`}} />
);

const BeatBackdrop: React.FC<{k: BuildKey}> = ({k}) => {
  const f = useCurrentFrame();
  switch (k) {
    case 'b1':
      return <Backdrop src={BACKDROPS.sky5a} t={0} span={8} cam={IDENTITY} scrim="light" fallback={<FallbackPeriwinkle t={0} cam={IDENTITY} />} />;
    case 'b2':
      return <LilacSky t={0} cam={IDENTITY} />;
    case 'b3':
      return <Backdrop src={BACKDROPS.peach6} t={0} span={9} cam={IDENTITY} scrim="light" fallback={<FallbackPeach t={0} cam={IDENTITY} />} />;
    case 'b4':
      return <CreamSky t={0} cam={IDENTITY} frame={f} />;
    case 'b5':
      return <WhiteWash />;
    case 'b6':
      return <CallWash />;
    default:
      return <TeamWash />;
  }
};

export const makeBeat = (k: BuildKey): React.FC<SceneLayerProps> => {
  const C: React.FC<SceneLayerProps> = ({layer = 'all'}) => (layer === 'shell' ? null : <TextBeat beatKey={k} layer={layer} backdrop={<BeatBackdrop k={k} />} />);
  C.displayName = `TextBeat_${k}`;
  return C;
};
