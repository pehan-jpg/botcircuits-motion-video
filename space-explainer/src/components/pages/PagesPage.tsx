import React from "react";
import { LayoutGrid, Sparkles, WandSparkles } from "lucide-react";
import { CHAT_CPS, FONT, UIN } from "../../theme";
import { PLACEHOLDERS as P } from "../../placeholders";
import { Sidebar, TopBar, UI } from "../chat/Sidebar";
import { Typewriter } from "../Typewriter";
import { HumanGlyph } from "../HumanGlyph";
import { PageHeader, READ, Segmented, SearchBox, text, WhiteButton } from "./common";

/** Layout from reference/ui/07-pages.png (native px). */
export const PAGES = { build: { x: 471, y: 180, w: 1184, h: 186 }, prompt: { x: 493, y: 237, w: 1141, h: 56 }, button: { x: 1509, y: 310, w: 125, h: 36 }, out: { x: 471, y: 400, w: 1184, h: 470 } };
/** Dashboard KPI tiles (native px). */
export const KPI = { x: 471, y: 400, w: 281, h: 112, gap: 20 };
export const kpiRect = (i: number) => ({ x: KPI.x + i * (KPI.w + KPI.gap), y: KPI.y, w: KPI.w, h: KPI.h });

export type PagesState = {
  /** Which prompt is in the box: 0 the status page, 1 the dashboard. */
  prompt: 0 | 1;
  typeStart: number;
  typing: boolean;
  pressed: number;
  /** Status page: build 0 to 1, rows and bars. */
  build: number;
  rows: number;
  bars: number;
  /** Claim row under Approved: grows and pushes the rows below down. */
  claimRow: number;
  /** Dashboard: page swap, tiles one by one, the line chart and the flags table. */
  dash: number;
  tiles: number[];
  line: number;
  flags: number;
  tilePressed: number;
};

const Table: React.FC<{ s: PagesState }> = ({ s }) => {
  const data = P.pages.rows;
  const max = Math.max(...data.map((r) => r.count));
  return (
    <div data-guard="uitext" data-guard-read="1" data-guard-label="Built page" data-fit-box="built page" style={{ position: "absolute", left: PAGES.out.x, top: PAGES.out.y, width: PAGES.out.w, height: PAGES.out.h, boxSizing: "border-box", borderRadius: 16, background: "#FFFFFF", border: `1px solid ${UI.line}`, padding: "20px 24px", opacity: s.build * (1 - s.dash), transform: `translateY(${(1 - s.build) * 16}px)`, fontFamily: FONT.sans }}>
      <div style={{ fontSize: READ + 2, fontWeight: 700, color: UI.text }}>{P.pages.title}</div>
      <div style={{ display: "flex", gap: 40, marginTop: 18 }}>
        <div style={{ width: 560 }}>
          <div style={{ display: "grid", gridTemplateColumns: "180px 90px 1fr", padding: "8px 0", borderBottom: `1px solid ${UI.line}`, fontSize: UIN.helper, color: UI.secondary }}>
            <span data-fit-text>Status</span>
            <span>Count</span>
            <span>Approved by</span>
          </div>
          {data.map((r, i) => (
            <React.Fragment key={r.status}>
              <div style={{ display: "grid", gridTemplateColumns: "180px 90px 1fr", alignItems: "center", height: 46, borderBottom: `1px solid ${UI.line}`, fontSize: READ, color: UI.text, opacity: Math.min(1, Math.max(0, s.rows * data.length - i)) }}>
                <span data-fit-text>{r.status}</span>
                <span>{r.count}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: UI.secondary }}>
                  {r.approvedBy ? <HumanGlyph size={18} style={{ width: 28, height: 28 }} /> : null}
                  {r.approvedBy || "Not yet decided"}
                </span>
              </div>
              {/* The claim row takes its own space: it grows and pushes the rows below down. */}
              {i === 0 && s.claimRow > 0 ? (
                <div style={{ height: 44 * s.claimRow, overflow: "hidden", borderBottom: `1px solid ${UI.line}` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "180px 90px 1fr", alignItems: "center", height: 44, paddingLeft: 18, background: UI.lilacBg, fontSize: 15.2, color: UI.lilacText, fontWeight: 600, opacity: s.claimRow }}>
                    <span>{P.pages.claimRow.id}</span>
                    <span style={{ color: UI.secondary, fontWeight: 400 }}>{P.pages.claimRow.insured.split(" ")[0]}</span>
                    <span style={{ color: UI.text, fontWeight: 400 }}>{P.pages.claimRow.approvedBy}</span>
                  </div>
                </div>
              ) : null}
            </React.Fragment>
          ))}
        </div>
        <div style={{ flex: 1, height: 250, display: "flex", alignItems: "flex-end", gap: 30, padding: "0 10px", borderLeft: `1px solid ${UI.line}`, borderBottom: `1px solid ${UI.line}` }}>
          {data.map((r) => (
            <div key={r.status} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: UIN.helper, color: UI.secondary }}>{r.count}</span>
              <div style={{ width: "100%", height: (180 * r.count * s.bars) / max, borderRadius: "6px 6px 0 0", background: "linear-gradient(180deg, #A89BFF, #5B3FD6)" }} />
              <span style={{ fontSize: UIN.helper, color: UI.secondary, whiteSpace: "nowrap", marginBottom: -28 }}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<{ s: PagesState }> = ({ s }) => {
  const days = P.pages.perDay;
  const max = Math.max(...days.map((d) => d.n));
  const W = 700;
  const H = 230;
  const pts = days.map((d, i) => ({ x: 30 + (i * (W - 60)) / (days.length - 1), y: H - 20 - ((H - 50) * d.n) / max }));
  const path = pts.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
  return (
    <div style={{ opacity: s.dash }}>
      {P.pages.kpis.map((k, i) => {
        const r = kpiRect(i);
        const a = s.tiles[i];
        const pressed = i === 1 ? s.tilePressed : 0;
        return (
          <div
            key={k.label}
            data-guard="uitext"
            data-guard-read="1"
            data-guard-label={`KPI ${k.label}`}
            data-fit-box={`kpi ${i}`}
            style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, boxSizing: "border-box", borderRadius: 14, background: "#FFFFFF", border: `1.5px solid ${pressed > 0.3 ? UI.accent : UI.line}`, boxShadow: pressed > 0 ? `0 0 0 ${4 * pressed}px rgba(124,98,240,0.3)` : "0 4px 12px rgba(20,24,60,0.05)", padding: "16px 20px", fontFamily: FONT.sans, opacity: a, transform: `translateY(${(1 - a) * 14}px) scale(${1 - 0.03 * pressed})` }}
          >
            <div data-fit-text style={{ fontSize: UIN.helper, color: UI.secondary, whiteSpace: "nowrap" }}>{k.label}</div>
            <div data-fit-text style={{ fontSize: 34, fontWeight: 700, color: UI.text, marginTop: 8, whiteSpace: "nowrap" }}>{k.value}</div>
          </div>
        );
      })}
      <div data-guard="uitext" data-guard-read="1" data-guard-label="Claims per day" style={{ position: "absolute", left: 471, top: 532, width: 760, height: 330, boxSizing: "border-box", borderRadius: 14, border: `1px solid ${UI.line}`, padding: "16px 20px", fontFamily: FONT.sans, opacity: Math.min(1, s.line * 2) }}>
        <div style={{ fontSize: READ, fontWeight: 700, color: UI.text }}>Claims per day</div>
        <svg width={W} height={H + 30} style={{ position: "absolute", left: 20, top: 52 }}>
          {[0, 1, 2, 3].map((g) => (
            <line key={g} x1={20} x2={W - 10} y1={30 + g * 60} y2={30 + g * 60} stroke="#EEF0F4" strokeWidth={1} />
          ))}
          <path d={path} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - s.line} fill="none" stroke="#7C62F0" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          {pts.map((p, i) => (i / (pts.length - 1) <= s.line ? <circle key={i} cx={p.x} cy={p.y} r={4.5} fill="#7C62F0" /> : null))}
          {days.map((d, i) => (
            <text key={d.d} x={pts[i].x} y={H + 20} textAnchor="middle" fontFamily={FONT.sans} fontSize={15.2} fill={UI.secondary}>
              {d.d}
            </text>
          ))}
        </svg>
      </div>
      <div data-guard="uitext" data-guard-read="1" data-guard-label="Flags by type" data-fit-box="flags" style={{ position: "absolute", left: 1251, top: 532, width: 404, height: 330, boxSizing: "border-box", borderRadius: 14, border: `1px solid ${UI.line}`, padding: "16px 20px", fontFamily: FONT.sans, opacity: s.flags, transform: `translateY(${(1 - s.flags) * 12}px)` }}>
        <div style={{ fontSize: READ, fontWeight: 700, color: UI.text }}>Flags by type</div>
        {P.pages.flags.map((f) => (
          <div key={f.type} style={{ display: "flex", alignItems: "center", height: 48, borderBottom: `1px solid ${UI.line}`, fontSize: READ, color: UI.text }}>
            <span data-fit-text>{f.type}</span>
            <span style={{ marginLeft: "auto", fontWeight: 700 }}>{f.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PagesPage: React.FC<{ s: PagesState }> = ({ s }) => {
  const promptText = s.prompt === 0 ? P.pages.prompt : P.pages.dashPrompt;
  return (
    <div style={{ position: "absolute", inset: 0, background: UI.bg }}>
      <Sidebar active="pages" />
      <TopBar page="Pages" />
      <PageHeader x={471} title="Pages" desc="Describe a page once. The copilot builds it, and from then on it opens straight away with live data." descWidth={900} />
      <div style={{ position: "absolute", left: PAGES.build.x, top: PAGES.build.y, width: PAGES.build.w, height: PAGES.build.h, boxSizing: "border-box", borderRadius: 16, background: "linear-gradient(110deg, #F1EEFF 0%, #F7F6FF 60%, #FFFFFF 100%)", border: `1px solid ${UI.line}` }}>
        <div style={{ position: "absolute", left: 22, top: 20, display: "flex", alignItems: "center", gap: 10, fontFamily: FONT.sans, fontSize: UIN.button + 1, fontWeight: 700, color: UI.text }}>
          <WandSparkles size={18} color="#7C62F0" />
          Build a page
        </div>
      </div>
      <div data-guard="uitext" data-guard-read="1" data-guard-label="Pages prompt" style={{ position: "absolute", left: PAGES.prompt.x, top: PAGES.prompt.y, width: PAGES.prompt.w, height: PAGES.prompt.h, boxSizing: "border-box", padding: "14px 14px", borderRadius: 10, background: "#FFFFFF", border: `1px solid ${s.typing ? UI.secondary : UI.line}` }}>
        {s.typing ? (
          <Typewriter key={s.prompt} lines={[promptText]} cps={s.prompt === 0 ? CHAT_CPS : 40} startFrame={s.typeStart} seed={`pages-prompt-${s.prompt}`} caretColor={UI.text} style={{ fontFamily: FONT.sans, fontSize: READ + 1, color: UI.text }} />
        ) : (
          <span style={{ fontFamily: FONT.sans, fontSize: UIN.helper, color: UI.secondary }}>Describe the page you want</span>
        )}
      </div>
      <div style={{ position: "absolute", left: PAGES.button.x, top: PAGES.button.y, width: PAGES.button.w, height: PAGES.button.h, borderRadius: 10, background: s.typing ? UI.primaryBg : UI.secondary, transform: `scale(${1 - 0.04 * s.pressed})`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: FONT.sans, fontSize: UIN.button, color: UI.primaryText }}>
        <Sparkles size={15} color={UI.primaryText} />
        Build page
      </div>
      <div style={{ ...text, left: 471, top: 400, fontSize: UIN.button + 1, fontWeight: 700, opacity: 1 - s.build }}>Your pages</div>
      <div style={{ opacity: 1 - s.build }}>
        <Segmented x={471} y={436} items={["All", "Personal", "Group", "Organization"]} />
        <WhiteButton x={1655} y={440} label="New page" right />
        <SearchBox x={471} y={502} w={384} placeholder="Search pages…" />
        <div style={{ position: "absolute", left: 471, top: 558, width: 1184, height: 300, borderRadius: 14, border: `1px dashed ${UI.line}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div style={{ width: 62, height: 62, borderRadius: 14, border: `1px solid ${UI.chipBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LayoutGrid size={26} color={UI.text} />
          </div>
          <div style={{ fontFamily: FONT.sans, fontSize: UIN.button, fontWeight: 700, color: UI.text }}>No pages yet</div>
        </div>
      </div>
      {s.build > 0 && s.dash < 1 ? <Table s={s} /> : null}
      {s.dash > 0 ? <Dashboard s={s} /> : null}
    </div>
  );
};
