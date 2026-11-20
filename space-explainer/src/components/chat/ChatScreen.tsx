import React from "react";
import { Img, staticFile } from "remotion";
import {
  ArrowUp,
  Bell,
  BookOpen,
  Bot,
  Brain,
  CalendarClock,
  ChartColumn,
  ChevronDown,
  ChevronRight,
  Database,
  Ellipsis,
  Globe,
  LayoutDashboard,
  LayoutGrid,
  PanelLeft,
  Plus,
  Search,
  SquarePen,
  Telescope,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { BLUR_IN, CHAT_CPS, FONT, REPLAY_CPS } from "../../theme";
import { PLACEHOLDERS as P } from "../../placeholders";
import { Typewriter } from "../Typewriter";
import { AgentOrb } from "../AgentOrb";

/** Native size of reference/ui/01-chat.png. The screen is authored at this size and scaled into the product frame. */
export const CHAT_NATIVE = { w: 1875, h: 895 };

/** Colours estimated from the reference screenshot. */
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

/** Story text inside the screen is 35px native so it reads at 28px on screen. */
export const STORY_PX = 35;

/** Product mark: the logo's own symbol, cropped from logo.png, white on near black as in the screenshot. */
export const ProductMark: React.FC<{
  size: number;
  tile?: boolean;
  style?: React.CSSProperties;
}> = ({ size, tile = true, style }) => {
  const icon = tile ? size * 0.62 : size;
  const inner = (
    <div
      style={{
        width: icon * (350 / 390),
        height: icon,
        overflow: "hidden",
        filter: "invert(1)",
      }}
    >
      <Img
        src={staticFile("logo.png")}
        style={{ height: icon, width: icon * (1898 / 390), display: "block" }}
      />
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

const NAV = [
  { icon: LayoutDashboard, label: "Control Room" },
  { icon: Bot, label: "Agents" },
  { icon: Brain, label: "Brain" },
  { icon: Workflow, label: "Playbook" },
  { icon: LayoutGrid, label: "Pages" },
  { icon: Ellipsis, label: "Explore" },
];

const CHIPS = [
  [
    { icon: Database, label: "Company brain", x: 752, w: 159 },
    { icon: Telescope, label: "Deep research", x: 920, w: 154 },
    { icon: ChartColumn, label: "Visualize data", x: 1083, w: 147 },
    { icon: Workflow, label: "Run playbook", x: 1239, w: 146 },
  ],
  [
    { icon: LayoutGrid, label: "Build dashboards", x: 726, w: 173 },
    { icon: CalendarClock, label: "Schedule a task", x: 908, w: 161 },
    { icon: Users, label: "Ask your agents", x: 1078, w: 161 },
    { icon: Globe, label: "Browse the web", x: 1248, w: 163 },
  ],
];

/** Half the SVG box of an 18px AgentOrb (ring, satellite and glow margin), to centre it. */
const ORB18 = 18 + 10 + 18;

const ui: React.CSSProperties = {
  fontFamily: FONT.sans,
  color: UI.text,
  position: "absolute",
};

export type ChatState = {
  chromeIn: number;
  markOpacity: number;
  heroIn: number;
  heroOut: number;
  chipsIn: number;
  chipsOut: number;
  /** 0 to 1: input focuses (lime outline) and grows to hold two lines. */
  focus: number;
  typeStart: number;
  /** 0 to 1: message sent; input collapses and moves to the bottom. */
  sent: number;
  statusOrb: number;
  bubbleIn: number;
  pills: { label: string; opacity: number; blur: number; y: number }[];
  answerStart: number;
  answerOpacity: number;
  citeActive: number;
  cardOpen: number;
};

export const ChatScreen: React.FC<{ s: ChatState }> = ({ s }) => {
  const grow = 107 * s.focus * (1 - s.sent);
  const inputTop = 446 + (820 - 446) * s.sent;
  const inputH = 63 + grow;
  const rowY = inputTop + inputH - 31.5;
  const heroO = s.heroIn * (1 - s.heroOut);
  const heroY = (1 - s.heroIn) * BLUR_IN.rise;
  const heroBlur = BLUR_IN.blur * (1 - s.heroIn) + 12 * s.heroOut;
  const chipsO = s.chipsIn * (1 - s.chipsOut);
  const typedO = 1 - Math.min(1, s.sent * 3);
  const placeholderO = Math.max(
    1 - s.focus * 2,
    Math.min(1, Math.max(0, s.sent * 2 - 1)),
  );
  const lime = s.focus * (1 - s.sent);
  const border = `rgba(${181 * lime + 61 * (1 - lime)}, ${210 * lime + 61 * (1 - lime)}, ${62 * lime + 61 * (1 - lime)}, 1)`;

  return (
    <div
      style={{
        width: CHAT_NATIVE.w,
        height: CHAT_NATIVE.h,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <div style={{ opacity: s.chromeIn }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 229,
            height: CHAT_NATIVE.h,
            background: UI.side,
            borderRight: `1px solid ${UI.line}`,
          }}
        />
        <ProductMark
          size={26}
          tile={false}
          style={{ position: "absolute", left: 12, top: 13 }}
        />
        <div
          style={{ ...ui, left: 49, top: 15, fontSize: 15, fontWeight: 600 }}
        >
          {P.workspace}
        </div>
        <PanelLeft
          size={17}
          color={UI.muted}
          style={{ position: "absolute", left: 188, top: 17 }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 57,
            width: 219,
            height: 36,
            border: `1px solid ${UI.line}`,
            borderRadius: 8,
          }}
        />
        <Search
          size={15}
          color={UI.muted}
          style={{ position: "absolute", left: 10, top: 68 }}
        />
        <div
          style={{ ...ui, left: 34, top: 66, fontSize: 15, color: UI.muted }}
        >
          Search chats
        </div>
        <div
          style={{ ...ui, left: 186, top: 66, fontSize: 13, color: UI.muted }}
        >
          ⌘K
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 102,
            width: 220,
            height: 36,
            background: "#FFFFFF",
            borderRadius: 8,
          }}
        />
        <SquarePen
          size={15}
          color="#111"
          style={{ position: "absolute", left: 66, top: 112 }}
        />
        <div
          style={{
            ...ui,
            left: 89,
            top: 110,
            fontSize: 15,
            fontWeight: 500,
            color: "#111",
          }}
        >
          New chat
        </div>
        {NAV.map((n, i) => (
          <React.Fragment key={n.label}>
            <n.icon
              size={17}
              color="#d0d0d0"
              strokeWidth={1.6}
              style={{ position: "absolute", left: 9, top: 150 + i * 38 }}
            />
            <div style={{ ...ui, left: 37, top: 148 + i * 38, fontSize: 15 }}>
              {n.label}
            </div>
          </React.Fragment>
        ))}
        <div
          style={{ ...ui, left: 9, top: 385, fontSize: 14, color: UI.muted }}
        >
          Recents
        </div>
        {P.recents.map((r, i) => (
          <div
            key={r}
            style={{
              ...ui,
              left: 7,
              top: 419 + i * 32,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {r}
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 832,
            width: 229,
            borderTop: `1px solid ${UI.line}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 5,
            top: 853,
            width: 32,
            height: 32,
            borderRadius: 6,
            background: "#FFFFFF",
            color: "#111",
            fontFamily: FONT.sans,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {P.user.initial}
        </div>
        <div
          style={{ ...ui, left: 47, top: 851, fontSize: 14, fontWeight: 600 }}
        >
          {P.user.name}
        </div>
        <div
          style={{ ...ui, left: 47, top: 871, fontSize: 12, color: UI.muted }}
        >
          {P.user.role}
        </div>

        {/* Top bar */}
        <div
          style={{ ...ui, left: 261, top: 13, fontSize: 15, color: UI.muted }}
        >
          Workspace
        </div>
        <ChevronRight
          size={14}
          color={UI.muted}
          style={{ position: "absolute", left: 349, top: 17 }}
        />
        <div
          style={{ ...ui, left: 375, top: 13, fontSize: 15, fontWeight: 500 }}
        >
          Chat
        </div>
        <SquarePen
          size={18}
          color="#d0d0d0"
          style={{ position: "absolute", left: 1721, top: 13 }}
        />
        <BookOpen
          size={18}
          color="#d0d0d0"
          style={{ position: "absolute", left: 1767, top: 13 }}
        />
        <div style={{ ...ui, left: 1792, top: 12, fontSize: 15 }}>Docs</div>
        <Bell
          size={18}
          color="#d0d0d0"
          style={{ position: "absolute", left: 1851, top: 13 }}
        />
      </div>

      {/* Hero */}
      <ProductMark
        size={56}
        style={{
          position: "absolute",
          left: 1041,
          top: 262,
          opacity: s.markOpacity * (1 - s.heroOut),
        }}
      />
      <div
        style={{
          opacity: heroO,
          filter: heroBlur > 0.05 ? `blur(${heroBlur}px)` : undefined,
          transform: `translateY(${heroY}px)`,
        }}
      >
        <div
          style={{
            ...ui,
            left: 229,
            width: 1646,
            top: 338,
            textAlign: "center",
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Describe the work. Get your agent team.
        </div>
        <div
          style={{
            ...ui,
            left: 229,
            width: 1646,
            top: 392,
            textAlign: "center",
            fontSize: 15,
            color: "#c9c9c9",
          }}
        >
          Find answers, turn ideas into action, and make room for your best
          work.
        </div>
      </div>

      {/* Input with footer row */}
      <div style={{ opacity: s.heroIn, transform: `translateY(${heroY}px)` }}>
        <div
          style={{
            position: "absolute",
            left: 685,
            top: inputTop,
            width: 768,
            height: inputH + 47,
            border: `1px solid ${UI.line}`,
            borderRadius: 14,
            opacity: 1 - s.sent,
          }}
        />
        <div
          style={{
            ...ui,
            left: 702,
            top: inputTop + inputH + 14,
            fontSize: 12.5,
            color: "#bdbdbd",
            opacity: 1 - s.sent,
          }}
        >
          Your agents work across your tools.
        </div>
        <div style={{ opacity: 1 - s.sent }}>
          <div
            style={{
              ...ui,
              left: 1226,
              top: inputTop + inputH + 14,
              fontSize: 12.5,
              color: "#bdbdbd",
            }}
          >
            Connect your apps
          </div>
          {["#5B8DEF", "#3D7BF2", "#2F6FD6", "#6B7280"].map((c, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 1344 + i * 22,
                top: inputTop + inputH + 11,
                width: 22,
                height: 22,
                borderRadius: 11,
                background: "#1d1d1d",
                border: `1px solid ${UI.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 3,
                  background: c,
                }}
              />
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: 685,
            top: inputTop,
            width: 768,
            height: inputH,
            borderRadius: 14,
            background: UI.inputBg,
            border: `1.5px solid ${border}`,
            boxShadow:
              lime > 0
                ? `0 0 0 ${3 * lime}px rgba(181,210,62,${0.12 * lime})`
                : undefined,
          }}
        />
        <Plus
          size={18}
          color="#cfcfcf"
          style={{ position: "absolute", left: 707, top: rowY - 9 }}
        />
        <div
          style={{
            ...ui,
            left: 742,
            top: inputTop + 21,
            fontSize: 15,
            color: "#a8a8a8",
            opacity: placeholderO,
          }}
        >
          Ask anything, or @ to mention an agent, a colleague or a resource
        </div>
        <Zap
          size={16}
          color="#e6e6e6"
          style={{ position: "absolute", left: 1316, top: rowY - 8 }}
        />
        <div
          style={{
            ...ui,
            left: 1337,
            top: rowY - 10,
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          Auto
        </div>
        <ChevronDown
          size={14}
          color="#e6e6e6"
          style={{ position: "absolute", left: 1375, top: rowY - 7 }}
        />
        <div
          style={{
            position: "absolute",
            left: 1406,
            top: rowY - 15,
            width: 30,
            height: 30,
            borderRadius: 15,
            background: s.focus > 0.5 && s.sent === 0 ? "#ececec" : "#333",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 1 - s.statusOrb,
            transform: `scale(${1 - 0.4 * s.statusOrb})`,
          }}
        >
          <ArrowUp
            size={16}
            color={s.focus > 0.5 && s.sent === 0 ? "#111" : "#8a8a8a"}
          />
        </div>
        {/* The send button turns into a small status orb */}
        {s.statusOrb > 0 ? (
          <div
            style={{
              position: "absolute",
              left: 1421,
              top: rowY,
              width: 0,
              height: 0,
              opacity: s.statusOrb,
              transform: `scale(${0.5 + 0.5 * s.statusOrb})`,
            }}
          >
            <AgentOrb
              size={18}
              style={{ position: "absolute", left: -ORB18, top: -ORB18 }}
            />
          </div>
        ) : null}
        {/* Typed prompt */}
        {s.focus > 0 ? (
          <div
            data-guard="text"
            data-guard-label="Chat prompt"
            style={{
              position: "absolute",
              left: 742,
              top: inputTop + 16,
              opacity: typedO,
            }}
          >
            <Typewriter
              lines={[...P.chatPromptLines]}
              cps={CHAT_CPS}
              startFrame={s.typeStart}
              seed="s3-prompt"
              caretColor={UI.text}
              style={{
                fontFamily: FONT.sans,
                fontSize: STORY_PX,
                lineHeight: 1.3,
                color: UI.text,
              }}
            />
          </div>
        ) : null}
      </div>

      {/* Tool chips */}
      <div
        style={{
          opacity: chipsO,
          transform: `translateY(${grow + (1 - s.chipsIn) * 12}px)`,
        }}
      >
        {CHIPS.map((row, ri) =>
          row.map((c) => (
            <div
              key={c.label}
              style={{
                position: "absolute",
                left: c.x,
                top: 581 + ri * 46,
                width: c.w,
                height: 38,
                borderRadius: 19,
                border: `1px solid ${UI.chipBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontFamily: FONT.sans,
                fontSize: 15,
                color: "#e6e6e6",
                boxSizing: "border-box",
              }}
            >
              <c.icon size={15} color="#cfcfcf" strokeWidth={1.6} />
              {c.label}
            </div>
          )),
        )}
      </div>

      {/* Thread: user message */}
      {s.bubbleIn > 0 ? (
        <div
          data-guard="text"
          data-guard-label="User message"
          style={{
            position: "absolute",
            right: 75,
            top: 70,
            background: UI.bubble,
            borderRadius: 26,
            padding: "18px 30px",
            fontFamily: FONT.sans,
            fontSize: STORY_PX,
            lineHeight: 1.3,
            color: UI.text,
            whiteSpace: "pre",
            opacity: s.bubbleIn,
            transform: `translateY(${(1 - s.bubbleIn) * 24}px)`,
          }}
        >
          {P.chatPromptLines.join("\n")}
        </div>
      ) : null}

      {/* Status pills, replacing one another */}
      {s.pills.map((p) =>
        p.opacity > 0.001 ? (
          <div
            key={p.label}
            data-guard="text"
            data-guard-label={`Status: ${p.label}`}
            style={{
              position: "absolute",
              left: 300,
              top: 250 + p.y,
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "12px 30px 12px 18px",
              borderRadius: 999,
              background: "#2a2a2a",
              border: `1px solid ${UI.chipBorder}`,
              fontFamily: FONT.sans,
              fontWeight: 500,
              fontSize: STORY_PX,
              color: UI.text,
              opacity: p.opacity,
              filter: p.blur > 0.05 ? `blur(${p.blur}px)` : undefined,
            }}
          >
            <div style={{ width: 34, height: 34, position: "relative" }}>
              <AgentOrb
                size={18}
                style={{
                  position: "absolute",
                  left: 17 - ORB18,
                  top: 17 - ORB18,
                }}
              />
            </div>
            {p.label}
          </div>
        ) : null,
      )}

      {/* Answer, with source tags as chips */}
      {s.answerOpacity > 0 ? (
        <div
          data-guard="text"
          data-guard-label="Answer"
          style={{
            position: "absolute",
            left: 300,
            top: 248,
            opacity: s.answerOpacity,
          }}
        >
          <Typewriter
            lines={[...P.answerLines]}
            cps={REPLAY_CPS}
            startFrame={s.answerStart}
            seed="s3-answer"
            caretColor={UI.text}
            style={{
              fontFamily: FONT.sans,
              fontSize: STORY_PX,
              lineHeight: 1.42,
              color: UI.text,
            }}
            renderTag={(tag, o) => {
              const id = tag.slice(1, -1);
              const active = id === "S1" ? s.citeActive : 0;
              return (
                <span
                  data-guard="box"
                  data-guard-label={`Source ${id}`}
                  style={{
                    display: "inline-block",
                    opacity: o,
                    fontFamily: FONT.mono,
                    fontWeight: 600,
                    fontSize: STORY_PX,
                    lineHeight: 1.1,
                    padding: "0 12px",
                    margin: "0 2px",
                    borderRadius: 10,
                    background: `rgba(${52 + 129 * active}, ${55 + 155 * active}, ${61 + 1 * active}, ${1 - 0.7 * active})`,
                    border: `1.5px solid ${active > 0 ? `rgba(181,210,62,${0.4 + 0.6 * active})` : "#4b4f57"}`,
                    color: "#dfe6ff",
                    verticalAlign: "0.04em",
                  }}
                >
                  {id}
                </span>
              );
            }}
          />
        </div>
      ) : null}

      {/* Source card */}
      {s.cardOpen > 0 ? (
        <div
          data-guard="text"
          data-guard-label="Source card"
          style={{
            position: "absolute",
            left: 1268,
            top: 226,
            width: 552,
            boxSizing: "border-box",
            padding: "26px 30px 28px",
            borderRadius: 22,
            background: UI.card,
            border: `1px solid ${UI.chipBorder}`,
            boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
            fontFamily: FONT.sans,
            color: UI.text,
            opacity: s.cardOpen,
            filter:
              s.cardOpen < 1 ? `blur(${(1 - s.cardOpen) * 14}px)` : undefined,
            transform: `translateX(${(1 - s.cardOpen) * -24}px) scale(${0.96 + 0.04 * s.cardOpen})`,
            transformOrigin: "0% 20%",
          }}
        >
          <div
            style={{ fontSize: STORY_PX, fontWeight: 700, lineHeight: 1.25 }}
          >
            {P.sourceCardTitle}
          </div>
          <div
            style={{ height: 1, background: UI.chipBorder, margin: "18px 0" }}
          />
          <div
            style={{ fontSize: STORY_PX, lineHeight: 1.32, color: "#d9d9d9" }}
          >
            <span
              style={{
                background: `rgba(181,210,62,${0.26 * Math.min(1, s.cardOpen * 1.5)})`,
                color: UI.text,
                borderRadius: 6,
                boxDecorationBreak: "clone",
                WebkitBoxDecorationBreak: "clone",
                padding: "0 4px",
              }}
            >
              {P.policyText[0]}
            </span>{" "}
            {P.policyText[1]}
          </div>
        </div>
      ) : null}
    </div>
  );
};
