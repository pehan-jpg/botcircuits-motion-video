import React from "react";
import {
  Activity,
  Bot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Expand,
  History,
  Layers,
  LayoutGrid,
  ListChecks,
  MessageSquare,
  Plus,
  Radio,
  RotateCcw,
  RotateCw,
  Search,
  Shapes,
  ArrowUp,
  Zap,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { FONT } from "../../theme";
import { PLACEHOLDERS as P } from "../../placeholders";
import { UI } from "../chat/ChatScreen";
import { Office, type OfficeState } from "./Office";

/** Screenshot 02-control-room-office.png is drawn at this offset inside the native screen. */
export const CR_OFFSET = { x: 242, y: 52 };

const t: React.CSSProperties = {
  fontFamily: FONT.sans,
  color: UI.text,
  position: "absolute",
  whiteSpace: "nowrap",
};

const Counter: React.FC<{
  x: number;
  w: number;
  icon: React.ReactNode;
  label: string;
  value: number;
}> = ({ x, w, icon, label, value }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: 90,
      width: w,
      height: 28,
      borderRadius: 7,
      border: `1px solid ${UI.line}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      fontFamily: FONT.sans,
      fontSize: 13.5,
      color: "#cfcfcf",
    }}
  >
    {icon}
    {label} <span style={{ fontWeight: 700, color: UI.text }}>{value}</span>
  </div>
);

export type ControlRoomState = {
  office: OfficeState;
  agents: number;
  activeTasks: number;
  /** 0 to 1: the Iris message in the chat panel. */
  irisMessage: number;
};

/** Control Room, Agents tab: rebuilt from reference/ui/02-control-room-office.png. */
export const ControlRoomPage: React.FC<{ s: ControlRoomState }> = ({ s }) => (
  <div
    style={{
      position: "absolute",
      left: 230,
      top: 0,
      width: 1645,
      height: 895,
      background: UI.bg,
      overflow: "hidden",
    }}
  >
    {/* Breadcrumb bar, as in 03-control-room-dashboard.png */}
    <div style={{ ...t, left: 31, top: 13, fontSize: 15, color: UI.muted }}>
      Workspace
    </div>
    <ChevronRight
      size={14}
      color={UI.muted}
      style={{ position: "absolute", left: 119, top: 17 }}
    />
    <div style={{ ...t, left: 145, top: 13, fontSize: 15, fontWeight: 500 }}>
      Control Room
    </div>
    <div
      style={{
        position: "absolute",
        left: CR_OFFSET.x - 230,
        top: CR_OFFSET.y,
        width: 1633,
        height: 836,
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "absolute",
          left: 12,
          top: 22,
          width: 38,
          height: 38,
          borderRadius: 19,
          border: `1px solid ${UI.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Layers size={18} color="#e6e6e6" />
      </div>
      <div
        style={{
          ...t,
          left: 63,
          top: 18,
          fontSize: 25,
          fontWeight: 600,
          letterSpacing: "-0.01em",
        }}
      >
        Control Room
      </div>
      <div style={{ ...t, left: 63, top: 50, fontSize: 13, color: "#bdbdbd" }}>
        A live view of your workspace
      </div>
      <div
        style={{
          position: "absolute",
          left: 1412,
          top: 22,
          width: 230,
          height: 40,
          borderRadius: 10,
          border: `1px solid ${UI.line}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 1418,
          top: 27,
          width: 100,
          height: 30,
          borderRadius: 8,
          background: "#2c2c2c",
        }}
      />
      <MessageSquare
        size={14}
        color="#e6e6e6"
        style={{ position: "absolute", left: 1429, top: 35 }}
      />
      <div
        style={{ ...t, left: 1450, top: 33, fontSize: 13.5, fontWeight: 600 }}
      >
        Hide chat
      </div>
      <Expand
        size={14}
        color="#cfcfcf"
        style={{ position: "absolute", left: 1536, top: 35 }}
      />
      <div
        style={{ ...t, left: 1557, top: 33, fontSize: 13.5, color: "#cfcfcf" }}
      >
        Fullscreen
      </div>

      {/* Tabs: Dashboard, Agents (selected), Records */}
      <div
        style={{
          position: "absolute",
          left: 11,
          top: 84,
          width: 311,
          height: 40,
          borderRadius: 11,
          border: `1px solid ${UI.line}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 131,
          top: 89,
          width: 87,
          height: 30,
          borderRadius: 8,
          background: "#2c2c2c",
        }}
      />
      <LayoutGrid
        size={14}
        color="#cfcfcf"
        style={{ position: "absolute", left: 29, top: 97 }}
      />
      <div
        style={{ ...t, left: 51, top: 95, fontSize: 13.5, color: "#cfcfcf" }}
      >
        Dashboard
      </div>
      <Bot
        size={14}
        color="#ffffff"
        style={{ position: "absolute", left: 144, top: 97 }}
      />
      <div
        style={{ ...t, left: 166, top: 95, fontSize: 13.5, fontWeight: 700 }}
      >
        Agents
      </div>
      <ListChecks
        size={14}
        color="#cfcfcf"
        style={{ position: "absolute", left: 235, top: 97 }}
      />
      <div
        style={{ ...t, left: 258, top: 95, fontSize: 13.5, color: "#cfcfcf" }}
      >
        Records
      </div>

      <Counter
        x={785}
        w={92}
        icon={<Bot size={13} color="#cfcfcf" />}
        label="Agents"
        value={s.agents}
      />
      <Counter
        x={885}
        w={112}
        icon={<Shapes size={13} color="#cfcfcf" />}
        label="Resources"
        value={P.controlRoom.resources}
      />
      <Counter
        x={1005}
        w={119}
        icon={<Activity size={13} color="#cfcfcf" />}
        label="Active tasks"
        value={s.activeTasks}
      />
      <Radio
        size={13}
        color="#3DBE5A"
        style={{ position: "absolute", left: 1590, top: 98 }}
      />
      <div
        style={{ ...t, left: 1607, top: 96, fontSize: 12, color: "#3DBE5A" }}
      >
        Live
      </div>

      {/* Canvas panel */}
      <div
        style={{
          position: "absolute",
          left: 11,
          top: 141,
          width: 1250,
          height: 694,
          borderRadius: 14,
          border: `1px solid ${UI.line}`,
          background: "#1f1f1f",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 1,
            top: 60,
            width: 1248,
            height: 621,
            background: "#EAE6DD",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", left: -12, top: -201 }}>
            <Office s={s.office} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 12,
              top: 567,
              width: 266,
              height: 42,
              borderRadius: 9,
              background: "#FFFFFF",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "0 14px",
              boxSizing: "border-box",
              fontFamily: FONT.sans,
              fontSize: 13,
              color: "#333",
              whiteSpace: "nowrap",
            }}
          >
            <RotateCcw size={15} color="#333" />
            <RotateCw size={15} color="#333" />
            <ZoomOut size={15} color="#333" />
            <ZoomIn size={15} color="#333" />
            <span>100%</span>
            <span>Reset view</span>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 13,
            top: 14,
            width: 320,
            height: 32,
            borderRadius: 7,
            background: "#2a2a2a",
          }}
        />
        <Search
          size={14}
          color="#bdbdbd"
          style={{ position: "absolute", left: 24, top: 23 }}
        />
        <div
          style={{ ...t, left: 46, top: 21, fontSize: 13, color: "#bdbdbd" }}
        >
          Find an agent or resource…
        </div>
        <div
          style={{
            position: "absolute",
            left: 1115,
            top: 11,
            width: 121,
            height: 38,
            borderRadius: 8,
            border: `1px solid ${UI.line}`,
          }}
        />
        <ChevronLeft
          size={14}
          color="#8a8a8a"
          style={{ position: "absolute", left: 1127, top: 23 }}
        />
        <div
          style={{ ...t, left: 1151, top: 20, fontSize: 13, fontWeight: 600 }}
        >
          Floor 1 / 2
        </div>
        <ChevronRight
          size={14}
          color="#e6e6e6"
          style={{ position: "absolute", left: 1212, top: 23 }}
        />
      </div>

      {/* Chat panel */}
      <div
        style={{
          position: "absolute",
          left: 1273,
          top: 141,
          width: 380,
          height: 694,
          borderRadius: 14,
          border: `1px solid ${UI.line}`,
          background: "#1f1f1f",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 13,
            top: 15,
            width: 28,
            height: 28,
            borderRadius: 7,
            background: "#3E4A1E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MessageSquare size={14} color="#DDEBB0" />
        </div>
        <div style={{ ...t, left: 49, top: 19, fontSize: 16, fontWeight: 700 }}>
          Chat
        </div>
        <div
          style={{
            position: "absolute",
            left: 315,
            top: 13,
            width: 32,
            height: 32,
            borderRadius: 7,
            background: "#f2f2f2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus size={16} color="#111" />
        </div>
        <div
          style={{
            position: "absolute",
            left: 13,
            top: 57,
            width: 334,
            height: 34,
            borderRadius: 8,
            border: `1px solid ${UI.line}`,
          }}
        />
        <History
          size={13}
          color="#bdbdbd"
          style={{ position: "absolute", left: 25, top: 68 }}
        />
        <div
          style={{ ...t, left: 46, top: 66, fontSize: 13, color: "#cfcfcf" }}
        >
          New conversation
        </div>
        <ChevronDown
          size={13}
          color="#bdbdbd"
          style={{ position: "absolute", left: 325, top: 68 }}
        />
        {s.irisMessage > 0 ? (
          <div
            style={{
              position: "absolute",
              left: 13,
              top: 300,
              width: 334,
              opacity: s.irisMessage,
              transform: `translateY(${(1 - s.irisMessage) * 14}px)`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  background: "#4a4a4a",
                  color: "#eee",
                  fontFamily: FONT.sans,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                I
              </div>
              <div
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 14,
                  fontWeight: 700,
                  color: UI.text,
                }}
              >
                Iris
              </div>
            </div>
            <div
              data-guard="uitext"
              data-guard-label="Iris message"
              style={{
                fontFamily: FONT.sans,
                fontSize: 20,
                lineHeight: 1.35,
                color: UI.text,
                background: "#2a2a2a",
                borderRadius: 12,
                padding: "10px 14px",
              }}
            >
              {P.controlRoom.irisMessage}
            </div>
          </div>
        ) : null}
        <div
          style={{
            position: "absolute",
            left: 13,
            top: 561,
            width: 334,
            height: 120,
            borderRadius: 12,
            border: `1px solid ${UI.line}`,
          }}
        />
        <div
          style={{ ...t, left: 28, top: 581, fontSize: 15, color: "#a8a8a8" }}
        >
          Message or @mention an agent…
        </div>
        <Plus
          size={16}
          color="#cfcfcf"
          style={{ position: "absolute", left: 34, top: 645 }}
        />
        <Zap
          size={14}
          color="#e6e6e6"
          style={{ position: "absolute", left: 73, top: 646 }}
        />
        <div
          style={{ ...t, left: 93, top: 643, fontSize: 13.5, fontWeight: 500 }}
        >
          Auto
        </div>
        <div
          style={{
            position: "absolute",
            left: 304,
            top: 637,
            width: 30,
            height: 30,
            borderRadius: 15,
            background: "#2c2c2c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ArrowUp size={15} color="#777" />
        </div>
      </div>
    </div>
  </div>
);
