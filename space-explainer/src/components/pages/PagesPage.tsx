import React from "react";
import { LayoutGrid, Sparkles, WandSparkles } from "lucide-react";
import { CHAT_CPS, FONT, UIN } from "../../theme";
import { PLACEHOLDERS as P } from "../../placeholders";
import { Sidebar, TopBar, UI } from "../chat/Sidebar";
import { Typewriter } from "../Typewriter";
import { HumanGlyph } from "../HumanGlyph";
import { PageHeader, READ, Segmented, SearchBox, text, WhiteButton } from "./common";

/** Layout from reference/ui/07-pages.png (native px). */
export const PAGES = { build: { x: 471, y: 180, w: 1184, h: 186 }, prompt: { x: 493, y: 237, w: 1141, h: 56 }, button: { x: 1509, y: 310, w: 125, h: 36 }, out: { x: 471, y: 400, w: 1184, h: 440 } };

export type PagesState = { typeStart: number; typing: boolean; pressed: number; build: number; rows: number; bars: number };

export const PagesPage: React.FC<{ s: PagesState }> = ({ s }) => {
  const data = P.pages.rows;
  const max = Math.max(...data.map((r) => r.count));
  return (
    <div style={{ position: "absolute", inset: 0, background: UI.bg }}>
      <Sidebar active="pages" />
      <TopBar page="Pages" />
      <PageHeader x={471} title="Pages" desc="Describe a page once. The copilot builds it, and from then on it opens straight away with live data." descWidth={900} />
      <div style={{ position: "absolute", left: PAGES.build.x, top: PAGES.build.y, width: PAGES.build.w, height: PAGES.build.h, boxSizing: "border-box", borderRadius: 16, background: "linear-gradient(110deg, #2C3445 0%, #2D2F3C 60%, #3A2C36 100%)", border: "1px solid #3d4150" }}>
        <div style={{ position: "absolute", left: 22, top: 20, display: "flex", alignItems: "center", gap: 10, fontFamily: FONT.sans, fontSize: UIN.button + 1, fontWeight: 700, color: UI.text }}>
          <WandSparkles size={18} color="#A89BFF" />
          Build a page
        </div>
      </div>
      <div data-guard="uitext" data-guard-read="1" data-guard-label="Pages prompt" style={{ position: "absolute", left: PAGES.prompt.x, top: PAGES.prompt.y, width: PAGES.prompt.w, height: PAGES.prompt.h, boxSizing: "border-box", padding: "14px 14px", borderRadius: 10, background: "#1c1d22", border: `1px solid ${s.typing ? "#8a8a8a" : "#3a3d48"}` }}>
        {s.typing ? (
          <Typewriter lines={[P.pages.prompt]} cps={CHAT_CPS} startFrame={s.typeStart} seed="pages-prompt" caretColor={UI.text} style={{ fontFamily: FONT.sans, fontSize: READ + 1, color: UI.text }} />
        ) : (
          <span style={{ fontFamily: FONT.sans, fontSize: UIN.helper, color: "#9a9aa4" }}>Open orders by status, with a filter and a chart of this month's totals</span>
        )}
      </div>
      <div style={{ position: "absolute", left: PAGES.button.x, top: PAGES.button.y, width: PAGES.button.w, height: PAGES.button.h, borderRadius: 10, background: s.typing ? "#ECECEC" : "#7d7d86", transform: `scale(${1 - 0.04 * s.pressed})`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: FONT.sans, fontSize: UIN.button, color: "#111" }}>
        <Sparkles size={15} color="#111" />
        Build page
      </div>
      <div style={{ ...text, left: 471, top: 400, fontSize: UIN.button + 1, fontWeight: 700, opacity: 1 - s.build }}>Your pages</div>
      <div style={{ opacity: 1 - s.build }}>
        <Segmented x={471} y={436} items={["All", "Personal", "Group", "Organization"]} />
        <WhiteButton x={1655} y={440} label="New page" right />
        <SearchBox x={471} y={502} w={384} placeholder="Search pages…" />
        <div style={{ position: "absolute", left: 471, top: 558, width: 1184, height: 300, borderRadius: 14, border: "1px dashed #3d3d3d", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div style={{ width: 62, height: 62, borderRadius: 14, border: `1px solid ${UI.chipBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LayoutGrid size={26} color="#e6e6e6" />
          </div>
          <div style={{ fontFamily: FONT.sans, fontSize: UIN.button, fontWeight: 700, color: UI.text }}>No pages yet</div>
        </div>
      </div>
      {/* The page that gets built */}
      {s.build > 0 ? (
        <div data-guard="uitext" data-guard-read="1" data-guard-label="Built page" style={{ position: "absolute", left: PAGES.out.x, top: PAGES.out.y, width: PAGES.out.w, height: PAGES.out.h, boxSizing: "border-box", borderRadius: 16, background: "#262626", border: "1px solid #3a3a3a", padding: "20px 24px", opacity: s.build, transform: `translateY(${(1 - s.build) * 16}px)`, fontFamily: FONT.sans }}>
          <div style={{ fontSize: READ + 2, fontWeight: 700, color: UI.text }}>{P.pages.title}</div>
          <div style={{ display: "flex", gap: 40, marginTop: 18 }}>
            <div style={{ width: 560 }}>
              <div style={{ display: "grid", gridTemplateColumns: "180px 90px 1fr", padding: "8px 0", borderBottom: "1px solid #3a3a3a", fontSize: UIN.helper, color: "#a8a8a8" }}>
                <span>Status</span>
                <span>Count</span>
                <span>Approved by</span>
              </div>
              {data.map((r, i) => (
                <div key={r.status} style={{ display: "grid", gridTemplateColumns: "180px 90px 1fr", alignItems: "center", height: 46, borderBottom: "1px solid #2f2f2f", fontSize: READ, color: UI.text, opacity: Math.min(1, Math.max(0, s.rows * data.length - i)) }}>
                  <span>{r.status}</span>
                  <span style={{ fontFamily: FONT.mono }}>{r.count}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#d8d8d8" }}>
                    {r.approvedBy ? <HumanGlyph size={18} style={{ width: 28, height: 28 }} /> : null}
                    {r.approvedBy || "Not yet decided"}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, height: 260, display: "flex", alignItems: "flex-end", gap: 30, padding: "0 10px", borderLeft: "1px solid #3a3a3a", borderBottom: "1px solid #3a3a3a" }}>
              {data.map((r) => (
                <div key={r.status} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: UIN.helper, fontFamily: FONT.mono, color: "#d8d8d8" }}>{r.count}</span>
                  <div style={{ width: "100%", height: (190 * r.count * s.bars) / max, borderRadius: "6px 6px 0 0", background: "linear-gradient(180deg, #A89BFF, #5B3FD6)" }} />
                  <span style={{ fontSize: UIN.helper, color: "#a8a8a8", whiteSpace: "nowrap", marginBottom: -28 }}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
