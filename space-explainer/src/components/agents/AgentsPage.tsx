import React from "react";
import { Plus } from "lucide-react";
import { FONT, UIN, type OrbPaletteKey } from "../../theme";
import { SpaceOrb } from "../SpaceOrb";
import { Sidebar, TopBar, UI } from "../chat/Sidebar";

/**
 * Agents page, rebuilt from reference/ui/04-agents.png at native size.
 * Card text is 16.5px native (15.2px on screen at 1x), read at a 1.35x zoom.
 */
export const CARD_TEXT = 16.5;
export const AGENT_GRID = { cols: [479, 878, 1277], rows: [266, 402], w: 386, h: 122 };
export const slotRect = (i: number) => ({ x: AGENT_GRID.cols[i % 3], y: AGENT_GRID.rows[Math.floor(i / 3)], w: AGENT_GRID.w, h: AGENT_GRID.h });
export const NEW_AGENT_BUTTON = { x: 1537, y: 90, w: 140, h: 38 };

const text: React.CSSProperties = { fontFamily: FONT.sans, color: UI.text, position: "absolute", whiteSpace: "nowrap" };

export type CardData = {
  name: string;
  handle: string;
  role: string;
  palette: OrbPaletteKey;
  line?: string;
  badges?: { label: string; tone: "grey" | "olive" }[];
};

const Badge: React.FC<{ label: string; tone: "grey" | "olive" }> = ({ label, tone }) => (
  <div
    style={{
      fontFamily: FONT.sans,
      fontSize: UIN.helper,
      fontWeight: tone === "olive" ? 700 : 500,
      padding: "1px 11px",
      borderRadius: 999,
      background: tone === "olive" ? UI.lilacBg : "#FFFFFF",
      border: `1px solid ${tone === "olive" ? UI.lilacBg : UI.line}`,
      color: tone === "olive" ? UI.lilacText : UI.secondary,
    }}
  >
    {label}
  </div>
);

export const AgentCard: React.FC<{ d: CardData; slot: number; appear: number; clock: number }> = ({ d, slot, appear, clock }) => {
  const r = slotRect(slot);
  return (
    <div
      data-guard="uitext"
      data-guard-read="1"
      data-guard-label={`Agent card ${d.name}`}
      style={{
        position: "absolute",
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        boxSizing: "border-box",
        borderRadius: 16,
        background: "#FFFFFF",
        border: "1px solid #E7E9F2",
        opacity: appear,
        filter: appear < 1 ? `blur(${(1 - appear) * 10}px)` : undefined,
        transform: `scale(${0.96 + 0.04 * appear})`,
        fontFamily: FONT.sans,
      }}
    >
      <SpaceOrb size={38} palette={d.palette} timeOffset={clock} style={{ position: "absolute", left: 17, top: 17 }} />
      <div style={{ ...text, left: 70, top: 14, fontSize: CARD_TEXT }}>
        <span style={{ fontWeight: 700 }}>{d.name}</span> <span style={{ color: UI.muted }}>{d.handle}</span>
      </div>
      <div style={{ ...text, left: 70, top: 39, fontSize: CARD_TEXT, color: "#5B6478" }}>{d.role}</div>
      {d.line ? <div style={{ ...text, left: 70, top: 64, fontSize: CARD_TEXT, color: "#5B6478" }}>{d.line}</div> : null}
      {d.badges ? (
        <div style={{ position: "absolute", left: 70, top: d.line ? 91 : 68, display: "flex", gap: 8 }}>
          {d.badges.map((b) => (
            <Badge key={b.label} {...b} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const NewAgentTile: React.FC<{ slot: number; opacity: number; pressed?: number }> = ({ slot, opacity, pressed = 0 }) => {
  const r = slotRect(slot);
  return (
    <div
      style={{
        position: "absolute",
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        boxSizing: "border-box",
        borderRadius: 16,
        border: "1.5px dashed #474747",
        background: `rgba(13,18,36,${0.04 * pressed})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        fontFamily: FONT.sans,
        fontSize: UIN.button,
        color: "#5B6478",
        opacity,
      }}
    >
      <Plus size={17} color="#5B6478" />
      New agent
    </div>
  );
};

export type AgentsPageState = {
  cards: { d: CardData; slot: number; appear: number }[];
  tileSlot: number;
  tileOpacity: number;
  tilePressed: number;
  clock: number;
};

export const AgentsPage: React.FC<{ s: AgentsPageState }> = ({ s }) => {
  const helpTop = AGENT_GRID.rows[Math.floor(s.tileSlot / 3)] + AGENT_GRID.h + 28;
  return (
    <div style={{ position: "absolute", inset: 0, background: UI.bg }}>
      <Sidebar active="agents" />
      <TopBar page="Agents" />
      <div style={{ ...text, left: 479, top: 86, fontSize: UIN.pageTitle, fontWeight: 600, letterSpacing: "-0.01em" }}>Agents</div>
      <div style={{ ...text, whiteSpace: "normal", left: 479, top: 128, width: 760, fontSize: UIN.helper, lineHeight: "24px", color: "#5B6478" }}>
        Named agents that work on tasks in the background. Give them tasks from the chat with @name, now, later or on a schedule; you get a
        notification when they finish or need you.
      </div>
      <div
        style={{
          position: "absolute",
          left: NEW_AGENT_BUTTON.x,
          top: NEW_AGENT_BUTTON.y,
          width: NEW_AGENT_BUTTON.w,
          height: NEW_AGENT_BUTTON.h,
          borderRadius: 10,
          background: UI.primaryBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontFamily: FONT.sans,
          fontSize: UIN.button,
          color: UI.primaryText,
        }}
      >
        <Plus size={16} color={UI.primaryText} />
        New agent
      </div>
      {[
        { l: "My agents", x: 479, on: true },
        { l: "Team agents", x: 574 },
        { l: "Links", x: 686 },
        { l: "Activity", x: 744 },
      ].map((tab) => (
        <div key={tab.l} style={{ ...text, left: tab.x, top: 208, fontSize: UIN.tabs, fontWeight: tab.on ? 700 : 400, color: tab.on ? UI.text : "#5B6478" }}>
          {tab.l}
        </div>
      ))}
      <div style={{ position: "absolute", left: 479, top: 239, width: 78, height: 2, background: UI.text }} />
      <div style={{ position: "absolute", left: 479, top: 241, width: 1184, height: 1, background: "#E7E9F2" }} />
      {s.cards.map((c) => (c.appear > 0 ? <AgentCard key={c.d.name} d={c.d} slot={c.slot} appear={c.appear} clock={s.clock} /> : null))}
      <NewAgentTile slot={s.tileSlot} opacity={s.tileOpacity} pressed={s.tilePressed} />
      <div style={{ ...text, left: 479, top: helpTop, fontSize: UIN.helper, color: "#5B6478" }}>
        Create an agent for a job you hand off often, then give it tasks from the chat.
      </div>
    </div>
  );
};
