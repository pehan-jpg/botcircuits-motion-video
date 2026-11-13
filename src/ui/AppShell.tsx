import React from 'react';
import {COLORS} from '../theme';
import {UI, UI_FONT} from './tokens';
import {SHELL} from '../v7';

export type NavItem =
  | 'Agent'
  | 'Sub-Agents'
  | 'Procedures'
  | 'Data Sources'
  | 'Simulator'
  | 'Publish'
  | 'Channels'
  | 'Conversations'
  | 'Analytics'
  | 'Trace'
  | 'Agent Tests'
  | 'Schedulers'
  | 'Settings';

const GROUPS: {label: string; items: NavItem[]}[] = [
  {label: 'Build', items: ['Agent', 'Sub-Agents', 'Procedures', 'Data Sources', 'Simulator', 'Publish']},
  {label: 'Connect', items: ['Channels', 'Conversations']},
  {label: 'Observe', items: ['Analytics', 'Trace', 'Agent Tests']},
  {label: 'Configure', items: ['Schedulers', 'Settings']},
];
const ICONS: Record<NavItem, string> = {
  Agent: 'M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM4.5 21c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5',
  'Sub-Agents': 'M8.5 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM2.5 20c0-3.5 2.8-5.5 6-5.5s6 2 6 5.5M16 5a3 3 0 0 1 0 6M18 14.5c2.2.6 3.5 2.4 3.5 5.5',
  Procedures: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  'Data Sources': 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20',
  Simulator: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM10 8.5l5.5 3.5-5.5 3.5z',
  Publish: 'M21 3L3 10.5l7 2.5 2.5 7zM10 13l11-10',
  Channels: 'M12 12h.01M8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7M5.5 18.5a9 9 0 0 1 0-13M18.5 5.5a9 9 0 0 1 0 13',
  Conversations: 'M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5z',
  Analytics: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  Trace: 'M3 12h4l3-8 4 16 3-8h4',
  'Agent Tests': 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM8 12.5l2.8 2.8L16.5 9.5',
  Schedulers: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 7v5l3.5 2',
  Settings: 'M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1',
};

const ROW = 52;
const LABEL = 24;
const GROUP_GAP = 12; // 12 + the 24px label = 36px between the last row of a group and the next group's first row
const TOP = 8;
const FOOTER = 58;
/** y (relative to the sidebar top) of each item's row centre. */
export const navY = (item: NavItem) => {
  let y = TOP;
  for (const [gi, g] of GROUPS.entries()) {
    if (gi > 0) y += GROUP_GAP;
    y += LABEL;
    for (const it of g.items) {
      if (it === item) return y + ROW / 2;
      y += ROW;
    }
  }
  return y;
};
/** World position of a sidebar item (for the cursor). */
export const navPoint = (item: NavItem) => ({x: SHELL.x + 110, y: SHELL.y + navY(item)});

/**
 * App shell frame: sidebar (with a highlight pill that slides between items)
 * and the header bar. Page content is drawn separately by each scene in the
 * CONTENT rect so it can blur-dissolve while the shell stays put.
 */
export const AppShell: React.FC<{from: NavItem; to: NavItem; slide: number; opacity?: number}> = ({from, to, slide, opacity = 1}) => {
  const pillY = navY(from) + (navY(to) - navY(from)) * slide;
  const active = slide < 0.5 ? from : to;
  let y = TOP;
  const rows: React.ReactNode[] = [];
  GROUPS.forEach((g, gi) => {
    if (gi > 0) y += GROUP_GAP;
    rows.push(
      <div key={g.label} style={{position: 'absolute', left: 28, top: y, height: LABEL, display: 'flex', alignItems: 'center', fontSize: 16, fontWeight: 600, letterSpacing: '0.02em', color: UI.text2}}>
        {g.label}
      </div>,
    );
    y += LABEL;
    g.items.forEach((it) => {
      const on = it === active;
      rows.push(
        <div key={it} style={{position: 'absolute', left: 28, top: y, height: ROW, display: 'flex', alignItems: 'center', gap: 14, fontSize: 22, fontWeight: on ? 600 : 500, color: on ? UI.ink : '#374151', whiteSpace: 'nowrap'}}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={on ? UI.ink : '#6B7280'} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <path d={ICONS[it]} />
          </svg>
          {it}
        </div>,
      );
      y += ROW;
    });
  });
  return (
    <div data-safe="app window" style={{position: 'absolute', left: SHELL.x, top: SHELL.y, width: SHELL.width, height: SHELL.height, opacity, fontFamily: UI_FONT}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 24, background: COLORS.white, border: `1px solid ${UI.border}`, boxShadow: UI.shadow, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: SHELL.sidebar, background: UI.sidebar, borderRight: `1px solid ${UI.border}`}}>
          <div style={{position: 'absolute', left: 14, right: 14, top: pillY - ROW / 2, height: ROW, borderRadius: 12, background: COLORS.white, border: `1px solid ${UI.border}`, boxShadow: '0 4px 12px rgba(13,18,36,0.06)'}} />
          {rows}
          {/* workspace footer */}
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: FOOTER, borderTop: `1px solid ${UI.border}`, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 24, fontSize: 22, fontWeight: 600, color: UI.ink, whiteSpace: 'nowrap'}}>
            <div style={{width: 34, height: 34, borderRadius: 17, background: UI.ink, color: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700}}>B</div>
            BotCircuits Team
          </div>
        </div>
        <div style={{position: 'absolute', left: SHELL.sidebar, right: 0, top: 0, height: SHELL.header, borderBottom: `1px solid ${UI.border}`}} />
      </div>
    </div>
  );
};
