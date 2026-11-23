import React from "react";
import { BookOpen, ChevronRight, Plus } from "lucide-react";
import { FONT } from "../../theme";
import { PLACEHOLDERS as P } from "../../placeholders";
import { UI } from "../chat/ChatScreen";

/**
 * Agents page, rebuilt from reference/ui/04-agents.png at native size
 * (main area from x 230). Card text is 21px native (larger than the
 * screenshot's 15px) so it reads at 28px when the camera zooms in 1.7x.
 */
export const CARD_TEXT = 21;
export const AGENT_GRID = {
  cols: [479, 878, 1277],
  rows: [266, 432],
  w: 386,
  h: 152,
};
export const slotRect = (i: number) => ({
  x: AGENT_GRID.cols[i % 3],
  y: AGENT_GRID.rows[Math.floor(i / 3)],
  w: AGENT_GRID.w,
  h: AGENT_GRID.h,
});

const text: React.CSSProperties = {
  fontFamily: FONT.sans,
  color: UI.text,
  position: "absolute",
  whiteSpace: "nowrap",
};

type CardData = {
  name: string;
  handle: string;
  role: string;
  line?: string;
  badges?: { label: string; tone: "grey" | "olive" }[];
};

export const AgentCard: React.FC<{
  d: CardData;
  slot: number;
  appear: number;
  guard?: boolean;
}> = ({ d, slot, appear, guard = true }) => {
  const r = slotRect(slot);
  return (
    <div
      data-guard={guard ? "text" : undefined}
      data-guard-label={`Agent card ${d.name}`}
      style={{
        position: "absolute",
        left: r.x,
        top: r.y,
        width: r.w,
        height: r.h,
        boxSizing: "border-box",
        borderRadius: 16,
        background: "#262626",
        border: "1px solid #3a3a3a",
        opacity: appear,
        filter: appear < 1 ? `blur(${(1 - appear) * 10}px)` : undefined,
        transform: `scale(${0.97 + 0.03 * appear})`,
        fontFamily: FONT.sans,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 17,
          top: 18,
          width: 40,
          height: 40,
          borderRadius: 20,
          background: "#4a4a4a",
          color: "#e6e6e6",
          fontSize: CARD_TEXT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {d.name[0]}
      </div>
      <div
        style={{
          ...text,
          left: 70,
          top: 16,
          fontSize: CARD_TEXT,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontWeight: 700 }}>{d.name}</span>{" "}
        <span style={{ color: UI.muted }}>{d.handle}</span>
      </div>
      <div
        style={{
          ...text,
          left: 70,
          top: 46,
          fontSize: CARD_TEXT,
          color: "#cfcfcf",
          whiteSpace: "nowrap",
        }}
      >
        {d.role}
      </div>
      {d.line ? (
        <div
          style={{
            ...text,
            left: 70,
            top: 78,
            fontSize: CARD_TEXT,
            color: "#cfcfcf",
            whiteSpace: "nowrap",
          }}
        >
          {d.line}
        </div>
      ) : null}
      {d.badges ? (
        <div
          style={{
            position: "absolute",
            left: 70,
            top: d.line ? 112 : 84,
            display: "flex",
            gap: 8,
          }}
        >
          {d.badges.map((b) => (
            <div
              key={b.label}
              style={{
                fontFamily: FONT.sans,
                fontSize: CARD_TEXT,
                fontWeight: b.tone === "olive" ? 700 : 500,
                padding: "2px 12px",
                borderRadius: 999,
                background: b.tone === "olive" ? "#4B5A1E" : "#333333",
                color: b.tone === "olive" ? "#EEF5D2" : "#bdbdbd",
              }}
            >
              {b.label}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const NewAgentCard: React.FC<{
  slot: number;
  opacity: number;
  pressed?: number;
}> = ({ slot, opacity, pressed = 0 }) => {
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
        border: "1.5px dashed #444",
        background: `rgba(255,255,255,${0.04 * pressed})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        fontFamily: FONT.sans,
        fontSize: CARD_TEXT,
        color: "#cfcfcf",
        opacity,
      }}
    >
      <Plus size={20} color="#cfcfcf" />
      New agent
    </div>
  );
};

export type AgentsPageState = {
  /** 0 to 1 for each of Nora, Theo, Owen. */
  created: number[];
  /** Slot the dashed "New agent" card sits in, and its opacity. */
  newSlot: number;
  newOpacity: number;
  newPressed: number;
};

export const AgentsPage: React.FC<{ s: AgentsPageState }> = ({ s }) => {
  const iris = P.agentsPage.iris;
  const lastSlot = 1 + s.created.filter((c) => c > 0.5).length;
  const helpTop =
    AGENT_GRID.rows[Math.floor(Math.max(lastSlot, s.newSlot) / 3)] +
    AGENT_GRID.h +
    30;
  return (
    <div
      style={{
        position: "absolute",
        left: 230,
        top: 0,
        width: 1645,
        height: 895,
        background: UI.bg,
      }}
    >
      <div style={{ position: "absolute", left: -230, top: 0 }}>
        <div
          style={{ ...text, left: 263, top: 13, fontSize: 15, color: UI.muted }}
        >
          Workspace
        </div>
        <ChevronRight
          size={14}
          color={UI.muted}
          style={{ position: "absolute", left: 351, top: 17 }}
        />
        <div
          style={{ ...text, left: 377, top: 13, fontSize: 15, fontWeight: 500 }}
        >
          Agents
        </div>
        <BookOpen
          size={18}
          color="#d0d0d0"
          style={{ position: "absolute", left: 1769, top: 13 }}
        />
        <div style={{ ...text, left: 1794, top: 12, fontSize: 15 }}>Docs</div>

        <div
          style={{
            ...text,
            left: 479,
            top: 88,
            fontSize: 27,
            fontWeight: 600,
            letterSpacing: "-0.01em",
          }}
        >
          Agents
        </div>
        <div
          style={{
            ...text,
            whiteSpace: "normal",
            left: 479,
            top: 130,
            width: 690,
            fontSize: 15,
            lineHeight: "24px",
            color: "#bdbdbd",
          }}
        >
          Named agents that work on tasks in the background. Give them tasks
          from the chat with @name, now, later or on a schedule; you get a
          notification when they finish or need you.
        </div>
        <div
          style={{
            position: "absolute",
            left: 1537,
            top: 90,
            width: 126,
            height: 36,
            borderRadius: 10,
            background: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: FONT.sans,
            fontSize: 15,
            color: "#111",
          }}
        >
          <Plus size={15} color="#111" />
          New agent
        </div>
        {[
          { l: "My agents", x: 479, on: true },
          { l: "Team agents", x: 568 },
          { l: "Links", x: 673 },
          { l: "Activity", x: 727 },
        ].map((tab) => (
          <div
            key={tab.l}
            style={{
              ...text,
              left: tab.x,
              top: 211,
              fontSize: 15,
              fontWeight: tab.on ? 700 : 400,
              color: tab.on ? UI.text : "#bdbdbd",
            }}
          >
            {tab.l}
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            left: 479,
            top: 239,
            width: 70,
            height: 2,
            background: UI.text,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 479,
            top: 241,
            width: 1184,
            height: 1,
            background: "#3a3a3a",
          }}
        />

        <AgentCard
          slot={0}
          appear={1}
          d={{
            name: iris.name,
            handle: iris.handle,
            role: iris.role,
            badges: [
              { label: iris.state, tone: "grey" },
              { label: iris.badge, tone: "olive" },
            ],
          }}
        />
        {P.agentsPage.team.map((a, i) =>
          s.created[i] > 0 ? (
            <AgentCard
              key={a.name}
              slot={i + 1}
              appear={s.created[i]}
              d={{
                name: a.name,
                handle: a.handle,
                role: a.role,
                line: P.agentAccessLine,
              }}
            />
          ) : null,
        )}
        <NewAgentCard
          slot={s.newSlot}
          opacity={s.newOpacity}
          pressed={s.newPressed}
        />
        <div
          style={{
            ...text,
            left: 479,
            top: helpTop,
            fontSize: 15,
            color: "#bdbdbd",
          }}
        >
          Create an agent for a job you hand off often, then give it tasks from
          the chat.
        </div>
      </div>
    </div>
  );
};
