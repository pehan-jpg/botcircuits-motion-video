import React from "react";
import { Activity, Bot, Layers, LayoutGrid, ListChecks, Play, Radio, Shapes } from "lucide-react";
import { COLOR, FONT, REPLAY_CPS, UIN, type OrbPaletteKey } from "../../theme";
import { PLACEHOLDERS as P } from "../../placeholders";
import { Sidebar, TopBar, UI } from "../chat/Sidebar";
import { SpaceOrb } from "../SpaceOrb";
import { HumanGlyph } from "../HumanGlyph";
import { Typewriter } from "../Typewriter";
import { READ, text } from "./common";

/**
 * Control Room, Records tab. No Records screenshot was supplied, so this is
 * composed in the product style: the Control Room header (02-control-room-office.png)
 * with the Records tab selected, and a record with its timeline.
 */
export const RECORDS = { x: 253, y: 200, w: 1250, h: 600, rowY0: 300, rowH: 52, replay: { x: 1351, y: 214, w: 126, h: 38 }, recordsTab: { x: 510, y: 155 } };

type Row = { time: string; text: string; who?: { name: string; palette?: OrbPaletteKey; human?: boolean }; note?: string };
export const ROWS: Row[] = P.records.rows.map((r) => ({
  time: r.time,
  text: r.text,
  note: r.note,
  who: r.agent ? { name: r.agent, palette: r.agent.toLowerCase() as OrbPaletteKey } : r.human ? { name: P.claimsOfficer, human: true } : undefined,
}));

export type RecordsState = {
  appear: number;
  replayPressed: number;
  /** Replay: start frame for each row's retype (Infinity before replay), and highlight 0 to 1. */
  rowType: number[];
  highlight: number[];
  /** 0 to 1: a row's note, agent and dot are shown (all 1 before the replay starts). */
  reveal: number[];
  scrub: number;
  clock: number;
};

const Counter: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({ icon, label, value }) => (
  <div style={{ height: 32, padding: "0 12px", borderRadius: 8, border: `1px solid ${UI.line}`, display: "flex", alignItems: "center", gap: 7, fontFamily: FONT.sans, fontSize: UIN.tabs, color: "#5B6478", whiteSpace: "nowrap" }}>
    {icon}
    {label} <span style={{ fontWeight: 700, color: UI.text }}>{value}</span>
  </div>
);

export const RecordsPage: React.FC<{ s: RecordsState }> = ({ s }) => (
  <div style={{ position: "absolute", inset: 0, background: UI.bg }}>
    <Sidebar active="control" />
    <TopBar page="Control Room" actions={false} />
    <div style={{ position: "absolute", left: 242, top: 52 }}>
      <div style={{ position: "absolute", left: 12, top: 22, width: 38, height: 38, borderRadius: 19, border: `1px solid ${UI.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Layers size={18} color="#0D1224" />
      </div>
      <div style={{ ...text, left: 63, top: 18, fontSize: UIN.pageTitle, fontWeight: 600 }}>Control Room</div>
      <div style={{ ...text, left: 63, top: 50, fontSize: UIN.helper, color: "#5B6478" }}>A live view of your workspace</div>
      <div style={{ position: "absolute", left: 11, top: 84, display: "flex", gap: 4, padding: 5, borderRadius: 11, border: `1px solid ${UI.line}` }}>
        {[
          { l: "Dashboard", i: <LayoutGrid size={14} color="#5B6478" /> },
          { l: "Agents", i: <Bot size={14} color="#5B6478" /> },
          { l: "Records", i: <ListChecks size={14} color="#0D1224" />, on: true },
        ].map((tab) => (
          <div key={tab.l} style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 12px", borderRadius: 8, background: tab.on ? "#EEF0FA" : "transparent", fontFamily: FONT.sans, fontSize: UIN.tabs, fontWeight: tab.on ? 700 : 400, color: tab.on ? UI.text : "#5B6478", whiteSpace: "nowrap" }}>
            {tab.i}
            {tab.l}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 720, top: 88, display: "flex", gap: 8 }}>
        <Counter icon={<Bot size={14} color="#5B6478" />} label="Agents" value={4} />
        <Counter icon={<Shapes size={14} color="#5B6478" />} label="Resources" value={P.controlRoom.resources} />
        <Counter icon={<Activity size={14} color="#5B6478" />} label="Active tasks" value={0} />
      </div>
      <Radio size={14} color="#3DBE5A" style={{ position: "absolute", left: 1180, top: 97 }} />
      <div style={{ ...text, left: 1199, top: 94, fontSize: UIN.helper, color: "#3DBE5A" }}>Live</div>
    </div>
    {/* The record */}
    <div style={{ position: "absolute", left: RECORDS.x, top: RECORDS.y, width: RECORDS.w, height: RECORDS.h, boxSizing: "border-box", borderRadius: 16, background: "#FFFFFF", border: "1px solid #E7E9F2", opacity: s.appear, transform: `translateY(${(1 - s.appear) * 14}px)` }}>
      <div style={{ ...text, left: 26, top: 18, fontSize: READ + 2, fontWeight: 700 }}>{P.records.title}</div>
      <div style={{ ...text, left: 26, top: 48, fontSize: UIN.helper, color: "#5B6478" }}>{P.records.sub}</div>
      <div style={{ position: "absolute", left: RECORDS.replay.x - RECORDS.x, top: RECORDS.replay.y - RECORDS.y, width: RECORDS.replay.w, height: RECORDS.replay.h, borderRadius: 10, background: s.replayPressed > 0 ? "#5B6478" : "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: FONT.sans, fontSize: UIN.button, fontWeight: 600, color: UI.primaryText }}>
        <Play size={15} color={UI.primaryText} />
        Replay
      </div>
      {/* Scrubber */}
      <div style={{ position: "absolute", left: 26, right: 26, top: 82, height: 4, borderRadius: 2, background: "#E7E9F2" }}>
        <div style={{ width: `${s.scrub * 100}%`, height: "100%", borderRadius: 2, background: "#7C62F0" }} />
        <div style={{ position: "absolute", left: `calc(${s.scrub * 100}% - 7px)`, top: -5, width: 14, height: 14, borderRadius: 7, background: UI.primaryBg }} />
      </div>
      {ROWS.map((r, i) => {
        const y = RECORDS.rowY0 - RECORDS.y + i * RECORDS.rowH;
        const h = s.highlight[i];
        const approved = r.who?.human;
        const rv = s.reveal[i];
        return (
          <div
            key={i}
            data-guard="uitext"
            data-guard-read="1"
            data-guard-label={`Record row ${i + 1}`}
            style={{ position: "absolute", left: 14, right: 14, top: y, height: approved ? 76 : 44, display: "flex", alignItems: approved ? "flex-start" : "center", gap: 16, padding: approved ? "8px 12px" : "0 12px", borderRadius: 10, background: h > 0 ? `rgba(124,98,240,${0.1 * h})` : "transparent", border: `1px solid ${h > 0.5 ? "rgba(124,98,240,0.45)" : approved ? "rgba(242,164,58,0.35)" : "transparent"}`, boxSizing: "border-box", fontFamily: FONT.sans }}
          >
            <span style={{ width: 92, fontSize: UIN.helper, color: "#454C60", fontFamily: FONT.mono, whiteSpace: "nowrap", opacity: 0.35 + 0.65 * rv }}>{r.time}</span>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: h > 0.5 ? "#7C62F0" : "#C5CAD8", marginTop: approved ? 7 : 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {Number.isFinite(s.rowType[i]) ? (
                <Typewriter lines={[r.text]} cps={REPLAY_CPS} startFrame={s.rowType[i]} seed={`rec-${i}`} showCaret={false} style={{ fontSize: READ, color: UI.text, whiteSpace: "nowrap" }} />
              ) : (
                <span style={{ fontSize: READ, color: UI.text, whiteSpace: "nowrap" }}>{r.text}</span>
              )}
              {r.note ? <span style={{ fontSize: UIN.helper, color: "#5B6478", whiteSpace: "nowrap", opacity: rv }}>“{r.note}”</span> : null}
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, opacity: rv }}>
              {r.who?.palette ? <SpaceOrb size={22} palette={r.who.palette} timeOffset={s.clock} /> : null}
              {r.who?.human ? <HumanGlyph size={24} style={{ width: 36, height: 36 }} /> : null}
              {r.who ? <span style={{ fontSize: UIN.helper, color: r.who.human ? COLOR.amberHalo : "#5B6478", whiteSpace: "nowrap" }}>{r.who.name}</span> : null}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
