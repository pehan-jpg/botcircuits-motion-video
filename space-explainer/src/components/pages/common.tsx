import React from "react";
import { Plus, Search } from "lucide-react";
import { FONT, UIN } from "../../theme";
import { UI } from "../chat/Sidebar";

export const text: React.CSSProperties = { fontFamily: FONT.sans, color: UI.text, position: "absolute", whiteSpace: "nowrap" };
/** Text meant to be read when zoomed: 16.5px native (15.2px at 1x). */
export const READ = 16.5;

export const PageHeader: React.FC<{ x: number; title: string; desc: string; descWidth?: number }> = ({ x, title, desc, descWidth = 700 }) => (
  <>
    <div style={{ ...text, left: x, top: 90, fontSize: UIN.pageTitle, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</div>
    <div style={{ ...text, whiteSpace: "normal", left: x, top: 130, width: descWidth, fontSize: UIN.helper, lineHeight: "24px", color: "#5B6478" }}>{desc}</div>
  </>
);

export const Tabs: React.FC<{ x: number; y: number; tabs: { label: string; badge?: number }[]; active: number }> = ({ x, y, tabs, active }) => (
  <>
    <div style={{ position: "absolute", left: x, top: y, display: "flex", gap: 22 }}>
      {tabs.map((tab, i) => (
        <div key={tab.label} style={{ position: "relative", paddingBottom: 9, borderBottom: `2px solid ${i === active ? UI.text : "transparent"}`, display: "flex", alignItems: "center", gap: 8, fontFamily: FONT.sans, fontSize: UIN.tabs, fontWeight: i === active ? 700 : 400, color: i === active ? UI.text : "#5B6478", whiteSpace: "nowrap" }}>
          {tab.label}
          {tab.badge ? <span style={{ minWidth: 22, height: 22, borderRadius: 11, background: "#E5484D", color: "#fff", fontSize: 15.2, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{tab.badge}</span> : null}
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", left: x, top: y + 31, width: 1184, height: 1, background: "#E7E9F2" }} />
  </>
);

export const Segmented: React.FC<{ x: number; y: number; items: string[] }> = ({ x, y, items }) => (
  <div style={{ position: "absolute", left: x, top: y, display: "flex", gap: 4, padding: 5, borderRadius: 11, border: `1px solid ${UI.line}` }}>
    {items.map((it, i) => (
      <div key={it} style={{ padding: "6px 12px", borderRadius: 8, background: i === 0 ? "#E7E9F2" : "transparent", fontFamily: FONT.sans, fontSize: UIN.tabs, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? UI.text : "#5B6478" }}>
        {it}
      </div>
    ))}
  </div>
);

export const WhiteButton: React.FC<{ x: number; y: number; label: string; right?: boolean; style?: React.CSSProperties }> = ({ x, y, label, right, style }) => (
  <div style={{ position: "absolute", ...(right ? { right: 1875 - x } : { left: x }), top: y, height: 38, padding: "0 16px", borderRadius: 10, background: UI.primaryBg, display: "flex", alignItems: "center", gap: 8, fontFamily: FONT.sans, fontSize: UIN.button, color: UI.primaryText, whiteSpace: "nowrap", ...style }}>
    <Plus size={16} color={UI.primaryText} />
    {label}
  </div>
);

export const SearchBox: React.FC<{ x: number; y: number; w: number; placeholder: string }> = ({ x, y, w, placeholder }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: 38, borderRadius: 10, border: `1px solid ${UI.line}`, display: "flex", alignItems: "center", gap: 10, padding: "0 14px", boxSizing: "border-box", fontFamily: FONT.sans, fontSize: UIN.helper, color: "#5B6478" }}>
    <Search size={15} color="#5B6478" />
    {placeholder}
  </div>
);

/** Small source chip like the chat's [S1]. */
export const SourceChip: React.FC<{ id: string; active?: number }> = ({ id, active = 0 }) => (
  <span style={{ display: "inline-block", fontFamily: FONT.mono, fontWeight: 600, fontSize: UIN.citation, lineHeight: 1.35, padding: "0 7px", borderRadius: 7, background: active > 0.5 ? "#EDE9FF" : "#F4F5F9", border: `1.5px solid ${active > 0 ? "rgba(124,98,240,0.9)" : UI.line}`, color: active > 0.5 ? UI.lilacText : UI.text }}>{id}</span>
);
