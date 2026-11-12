import React from 'react';
import {Img, getStaticFiles, staticFile} from 'remotion';
import {
  siGoogledrive,
  siHubspot,
  siInstagram,
  siJira,
  siMessenger,
  siNotion,
  siShopify,
  siStripe,
  siTelegram,
  siWhatsapp,
  siZendesk,
} from 'simple-icons';
import {COLORS} from '../theme';
import {GCloud, GHash, GPhone, GWaveform, GWebChat} from './Glyphs';

export type LogoName =
  | 'whatsapp'
  | 'messenger'
  | 'instagram'
  | 'telegram'
  | 'slack'
  | 'salesforce'
  | 'zendesk'
  | 'hubspot'
  | 'stripe'
  | 'notion'
  | 'google-drive'
  | 'shopify'
  | 'jira'
  | 'webchat'
  | 'voice'
  | 'mobile';

type Simple = {path: string; hex: string};
const SIMPLE: Partial<Record<LogoName, Simple>> = {
  whatsapp: siWhatsapp,
  messenger: siMessenger,
  instagram: siInstagram,
  telegram: siTelegram,
  zendesk: siZendesk,
  hubspot: siHubspot,
  stripe: siStripe,
  notion: siNotion,
  'google-drive': siGoogledrive,
  shopify: siShopify,
  jira: siJira,
};

/** Brand colours (glow colour in scene 8, and placeholder tint). */
export const BRAND_HEX: Record<LogoName, string> = {
  whatsapp: '#25D366',
  messenger: '#A033FF',
  instagram: '#E1306C',
  telegram: '#26A5E4',
  slack: '#4A154B',
  salesforce: '#00A1E0',
  zendesk: '#03363D',
  hubspot: '#FF7A59',
  stripe: '#635BFF',
  notion: '#000000',
  'google-drive': '#4285F4',
  shopify: '#7AB55C',
  jira: '#0052CC',
  webchat: COLORS.iconBlue,
  voice: COLORS.iconOrange,
  mobile: COLORS.iconViolet,
};

const GRADIENTS: Partial<Record<LogoName, string[]>> = {
  instagram: ['#FEDA75', '#FA7E1E', '#D62976', '#962FBF', '#4F5BD5'],
  messenger: ['#0099FF', '#A033FF', '#FF5280', '#FF7061'],
};

const hasFile = (() => {
  let cache: Set<string> | null = null;
  return (name: string) => {
    if (!cache) {
      try {
        cache = new Set(getStaticFiles().map((f) => f.name));
      } catch {
        cache = new Set();
      }
    }
    return cache.has(name);
  };
})();

/** Which source each logo uses (for reporting). */
export const logoSource = (name: LogoName): 'file' | 'simple-icons' | 'drawn' | 'placeholder' => {
  if (hasFile(`logos/${name}.svg`)) return 'file';
  if (SIMPLE[name]) return 'simple-icons';
  if (name === 'webchat' || name === 'voice' || name === 'mobile') return 'drawn';
  return 'placeholder';
};

/** A full-colour logo, size px square. */
export const Logo: React.FC<{name: LogoName; size: number}> = ({name, size}) => {
  const src = logoSource(name);
  if (src === 'file') return <Img src={staticFile(`logos/${name}.svg`)} style={{width: size, height: size, objectFit: 'contain'}} />;
  if (src === 'simple-icons') {
    const icon = SIMPLE[name]!;
    const grad = GRADIENTS[name];
    const id = `g-${name}`;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{display: 'block'}}>
        {grad ? (
          <defs>
            <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
              {grad.map((c, i) => (
                <stop key={c} offset={i / (grad.length - 1)} stopColor={c} />
              ))}
            </linearGradient>
          </defs>
        ) : null}
        <path d={icon.path} fill={grad ? `url(#${id})` : `#${icon.hex}`} />
      </svg>
    );
  }
  const color = BRAND_HEX[name];
  const g = {size, color, stroke: 2};
  if (name === 'webchat') return <GWebChat {...g} />;
  if (name === 'voice') return <GWaveform {...g} />;
  if (name === 'mobile') return <GPhone {...g} />;
  // placeholder glyphs for logos without an asset (drop official SVGs into /public/logos/)
  if (name === 'slack') return <GHash {...g} stroke={2.6} />;
  return <GCloud {...g} />;
};
