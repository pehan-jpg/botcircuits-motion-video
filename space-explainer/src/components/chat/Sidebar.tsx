import React from "react";
import { Img, staticFile } from "remotion";
import { Bot, Brain, Ellipsis, LayoutDashboard, LayoutGrid, PanelLeft, Search, SquarePen, Workflow } from "lucide-react";
import { FONT, UIN } from "../../theme";
import { PLACEHOLDERS as P } from "../../placeholders";

export const UI = {
  bg: "#212121",
  side: "#1b1b1b",
  line: "#2f2f2f",
  text: "#ececec",
  muted: "#a3a3a3",
  chipBorder: "#3d3d3d",
  inputBg: "#252525",
  lime: "#B5D23E",
  bubble: "#303030",
  card: "#2a2a2a",
};

export const SIDEBAR_W = 229;
export type NavKey = "control" | "agents" | "brain" | "playbook" | "pages" | "explore" | null;

const NAV: { key: Exclude<NavKey, null>; icon: typeof Bot; label: string }[] = [
  { key: "control", icon: LayoutDashboard, label: "Control Room" },
  { key: "agents", icon: Bot, label: "Agents" },
  { key: "brain", icon: Brain, label: "Brain" },
  { key: "playbook", icon: Workflow, label: "Playbook" },
  { key: "pages", icon: LayoutGrid, label: "Pages" },
  { key: "explore", icon: Ellipsis, label: "Explore" },
];
/** Vertical centre of a sidebar item, native px. */
export const navY = (key: Exclude<NavKey, null>) => 158 + NAV.findIndex((n) => n.key === key) * 38;

/** Product mark: the logo's own symbol cropped from logo.png, white on near black as in the product. */
export const ProductMark: React.FC<{ size: number; tile?: boolean; style?: React.CSSProperties }> = ({ size, tile = true, style }) => {
  const icon = tile ? size * 0.62 : size;
  const inner = (
    <div style={{ width: icon * (350 / 390), height: icon, overflow: "hidden", filter: "invert(1)" }}>
      <Img src={staticFile("logo.png")} style={{ height: icon, width: icon * (1898 / 390), display: "block" }} />
    </div>
  );
  if (!tile) return <div style={style}>{inner}</div>;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.25,
        background: "#0B0B0B",
        border: "1px solid #333",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {inner}
    </div>
  );
};

const t: React.CSSProperties = { fontFamily: FONT.sans, color: UI.text, position: "absolute", whiteSpace: "nowrap" };

/** The product sidebar, rebuilt from the reference screenshots. Used by every product page. */
export const Sidebar: React.FC<{ active: NavKey; activeOpacity?: number }> = ({ active, activeOpacity = 1 }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: SIDEBAR_W, height: 895, background: UI.side, borderRight: `1px solid ${UI.line}` }}>
    <ProductMark size={26} tile={false} style={{ position: "absolute", left: 12, top: 13 }} />
    <div style={{ ...t, left: 49, top: 14, fontSize: UIN.sidebar, fontWeight: 600 }}>{P.workspace}</div>
    <PanelLeft size={17} color={UI.muted} style={{ position: "absolute", left: 192, top: 17 }} />
    <div style={{ position: "absolute", left: 0, top: 57, width: 219, height: 36, border: `1px solid ${UI.line}`, borderRadius: 8 }} />
    <Search size={15} color={UI.muted} style={{ position: "absolute", left: 10, top: 68 }} />
    <div style={{ ...t, left: 34, top: 65, fontSize: UIN.sidebar, color: UI.muted }}>Search chats</div>
    <div style={{ ...t, left: 178, top: 65, fontSize: UIN.helper, color: UI.muted }}>⌘K</div>
    <div style={{ position: "absolute", left: 0, top: 102, width: 220, height: 36, background: "#FFFFFF", borderRadius: 8 }} />
    <SquarePen size={15} color="#111" style={{ position: "absolute", left: 62, top: 112 }} />
    <div style={{ ...t, left: 85, top: 109, fontSize: UIN.button, fontWeight: 500, color: "#111" }}>New chat</div>
    {NAV.map((n) => {
      const y = navY(n.key);
      const on = n.key === active;
      return (
        <React.Fragment key={n.key}>
          {on ? (
            <div style={{ position: "absolute", left: 0, top: y - 18, width: 222, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.09)", opacity: activeOpacity }} />
          ) : null}
          <n.icon size={17} color="#d0d0d0" strokeWidth={1.6} style={{ position: "absolute", left: 9, top: y - 9 }} />
          <div style={{ ...t, left: 37, top: y - 11, fontSize: UIN.sidebar, fontWeight: on ? 600 : 400 }}>{n.label}</div>
        </React.Fragment>
      );
    })}
    <div style={{ ...t, left: 9, top: 382, fontSize: UIN.helper, color: UI.muted }}>Recents</div>
    {P.recents.map((r, i) => (
      <div key={r} style={{ ...t, left: 7, top: 414 + i * 32, fontSize: UIN.sidebar, fontWeight: 600 }}>
        {r}
      </div>
    ))}
    <div style={{ position: "absolute", left: 0, top: 832, width: SIDEBAR_W, borderTop: `1px solid ${UI.line}` }} />
    <div style={{ position: "absolute", left: 5, top: 848, width: 34, height: 34, borderRadius: 7, background: "#FFFFFF", color: "#111", fontFamily: FONT.sans, fontSize: UIN.sidebar, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {P.user.initial}
    </div>
    <div style={{ ...t, left: 47, top: 843, fontSize: UIN.sidebar, fontWeight: 600 }}>{P.user.name}</div>
    <div style={{ ...t, left: 47, top: 864, fontSize: UIN.helper, color: UI.muted }}>{P.user.role}</div>
  </div>
);

/** Breadcrumb bar at the top of the main area. */
export const TopBar: React.FC<{ page: string; actions?: boolean }> = ({ page, actions = true }) => (
  <>
    <div style={{ ...t, left: 261, top: 12, fontSize: UIN.sidebar, color: UI.muted }}>Workspace</div>
    <div style={{ ...t, left: 352, top: 11, fontSize: UIN.sidebar, color: UI.muted }}>›</div>
    <div style={{ ...t, left: 375, top: 12, fontSize: UIN.sidebar, fontWeight: 500 }}>{page}</div>
    {actions ? <div style={{ ...t, left: 1790, top: 12, fontSize: UIN.sidebar }}>Docs</div> : null}
  </>
);
