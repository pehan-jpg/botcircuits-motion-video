import React from "react";
import {
  ArrowUp,
  CalendarClock,
  ChartColumn,
  ChevronDown,
  Database,
  Globe,
  LayoutGrid,
  Plus,
  Telescope,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { BLUR_IN, CHAT_CPS, FONT, REPLAY_CPS, UIN } from "../../theme";
import { PLACEHOLDERS as P } from "../../placeholders";
import { Typewriter } from "../Typewriter";
import { SpaceOrb } from "../SpaceOrb";
import { ProductMark, Sidebar, TopBar, UI } from "./Sidebar";

export { UI, ProductMark };

/** Native size of the reference screenshots. Screens are authored at this size and scaled into the product frame. */
export const CHAT_NATIVE = { w: 1875, h: 895 };

const CHIPS = [
  [
    { icon: Database, label: "Company brain" },
    { icon: Telescope, label: "Deep research" },
    { icon: ChartColumn, label: "Visualize data" },
    { icon: Workflow, label: "Run playbook" },
  ],
  [
    { icon: LayoutGrid, label: "Build dashboards" },
    { icon: CalendarClock, label: "Schedule a task" },
    { icon: Users, label: "Ask your agents" },
    { icon: Globe, label: "Browse the web" },
  ],
];

const ui: React.CSSProperties = { fontFamily: FONT.sans, color: UI.text, position: "absolute", whiteSpace: "nowrap" };

/** Layout of the thread, native px. Exported so the camera can frame it. */
export const THREAD = {
  bubbleRight: 75,
  bubbleTop: 70,
  answer: { x: 300, y: 236, w: 900 },
  card: { x: 920, y: 214, w: 540 },
  inputCentre: { x: 1069, y: 478 },
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
  /** Seconds added to orb clocks, for continuity across scenes. */
  clock: number;
};

export const ChatScreen: React.FC<{ s: ChatState }> = ({ s }) => {
  const grow = 46 * s.focus * (1 - s.sent);
  const inputTop = 446 + (812 - 446) * s.sent;
  const inputH = 63 + grow;
  const rowY = inputTop + inputH - 31.5;
  const heroO = s.heroIn * (1 - s.heroOut);
  const heroY = (1 - s.heroIn) * BLUR_IN.rise;
  const heroBlur = BLUR_IN.blur * (1 - s.heroIn) + 12 * s.heroOut;
  const chipsO = s.chipsIn * (1 - s.chipsOut);
  const typedO = 1 - Math.min(1, s.sent * 3);
  const placeholderO = Math.max(1 - s.focus * 2, Math.min(1, Math.max(0, s.sent * 2 - 1)));
  const lime = s.focus * (1 - s.sent);
  const border = `rgba(${181 * lime + 61 * (1 - lime)}, ${210 * lime + 61 * (1 - lime)}, ${62 * lime + 61 * (1 - lime)}, 1)`;

  return (
    <div style={{ width: CHAT_NATIVE.w, height: CHAT_NATIVE.h, position: "relative", overflow: "hidden", background: UI.bg }}>
      <div style={{ opacity: s.chromeIn }}>
        <Sidebar active={null} />
        <TopBar page="Chat" />
      </div>

      {/* Hero */}
      <ProductMark size={56} style={{ position: "absolute", left: 1041, top: 254, opacity: s.markOpacity * (1 - s.heroOut) }} />
      <div style={{ opacity: heroO, filter: heroBlur > 0.05 ? `blur(${heroBlur}px)` : undefined, transform: `translateY(${heroY}px)` }}>
        <div style={{ ...ui, left: 229, width: 1680, top: 334, textAlign: "center", fontSize: UIN.pageTitle, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Describe the work. Get your agent team.
        </div>
        <div style={{ ...ui, left: 229, width: 1680, top: 380, textAlign: "center", fontSize: UIN.helper, color: "#c9c9c9" }}>
          Find answers, turn ideas into action, and make room for your best work.
        </div>
      </div>

      {/* Input with footer row */}
      <div style={{ opacity: s.heroIn, transform: `translateY(${heroY}px)` }}>
        <div style={{ position: "absolute", left: 685, top: inputTop, width: 768, height: inputH + 50, border: `1px solid ${UI.line}`, borderRadius: 14, opacity: 1 - s.sent }} />
        <div style={{ ...ui, left: 702, top: inputTop + inputH + 13, fontSize: UIN.helper, color: "#bdbdbd", opacity: 1 - s.sent }}>
          Your agents work across your tools.
        </div>
        <div style={{ opacity: 1 - s.sent }}>
          <div style={{ ...ui, left: 1170, top: inputTop + inputH + 13, fontSize: UIN.helper, color: "#bdbdbd" }}>Connect your apps</div>
          {["#5B8DEF", "#3D7BF2", "#2F6FD6", "#6B7280"].map((c, i) => (
            <div
              key={i}
              style={{ position: "absolute", left: 1338 + i * 24, top: inputTop + inputH + 13, width: 23, height: 23, borderRadius: 12, background: "#1d1d1d", border: `1px solid ${UI.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <div style={{ width: 11, height: 11, borderRadius: 3, background: c }} />
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
            boxShadow: lime > 0 ? `0 0 0 ${3 * lime}px rgba(181,210,62,${0.12 * lime})` : undefined,
          }}
        />
        <Plus size={18} color="#cfcfcf" style={{ position: "absolute", left: 707, top: rowY - 9 }} />
        <div style={{ ...ui, left: 740, top: inputTop + 20, fontSize: UIN.helper, color: "#a8a8a8", opacity: placeholderO }}>
          Ask anything, or @ to mention an agent, a colleague or a resource
        </div>
        <Zap size={16} color="#e6e6e6" style={{ position: "absolute", left: 1306, top: rowY - 8 }} />
        <div style={{ ...ui, left: 1327, top: rowY - 11, fontSize: UIN.button, fontWeight: 500 }}>Auto</div>
        <ChevronDown size={14} color="#e6e6e6" style={{ position: "absolute", left: 1372, top: rowY - 7 }} />
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
          <ArrowUp size={16} color={s.focus > 0.5 && s.sent === 0 ? "#111" : "#8a8a8a"} />
        </div>
        {/* The send button turns into a small status orb */}
        {s.statusOrb > 0 ? (
          <div style={{ position: "absolute", left: 1421, top: rowY, width: 0, height: 0, opacity: s.statusOrb, transform: `scale(${0.5 + 0.5 * s.statusOrb})` }}>
            <SpaceOrb timeOffset={s.clock} size={22} style={{ position: "absolute", left: -11, top: -11 }} />
          </div>
        ) : null}
        {/* Typed prompt */}
        {s.focus > 0 ? (
          <div data-guard="uitext" data-guard-read="1" data-guard-label="Chat prompt" style={{ position: "absolute", left: 740, top: inputTop + 13, opacity: typedO }}>
            <Typewriter
              lines={[...P.chatPromptLines]}
              cps={CHAT_CPS}
              startFrame={s.typeStart}
              seed="s3-prompt"
              caretColor={UI.text}
              style={{ fontFamily: FONT.sans, fontSize: UIN.chatInput, lineHeight: 1.3, color: UI.text }}
            />
          </div>
        ) : null}
      </div>

      {/* Tool chips */}
      <div style={{ opacity: chipsO, transform: `translateY(${grow + (1 - s.chipsIn) * 12}px)` }}>
        {CHIPS.map((row, ri) => (
          <div key={ri} style={{ position: "absolute", left: 229, width: 1680, top: 584 + ri * 48, display: "flex", justifyContent: "center", gap: 9 }}>
            {row.map((c) => (
              <div
                key={c.label}
                style={{
                  height: 40,
                  padding: "0 16px",
                  borderRadius: 20,
                  border: `1px solid ${UI.chipBorder}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: FONT.sans,
                  fontSize: UIN.button,
                  color: "#e6e6e6",
                  whiteSpace: "nowrap",
                }}
              >
                <c.icon size={15} color="#cfcfcf" strokeWidth={1.6} />
                {c.label}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Thread: user message */}
      {s.bubbleIn > 0 ? (
        <div
          data-guard="uitext"
          data-guard-read="1"
          data-guard-label="User message"
          style={{
            position: "absolute",
            right: THREAD.bubbleRight,
            top: THREAD.bubbleTop,
            background: UI.bubble,
            borderRadius: 22,
            padding: "14px 22px",
            fontFamily: FONT.sans,
            fontSize: UIN.userBubble,
            lineHeight: 1.35,
            color: UI.text,
            whiteSpace: "pre",
            opacity: s.bubbleIn,
            transform: `translateY(${(1 - s.bubbleIn) * 20}px)`,
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
            data-guard="uitext"
            data-guard-label={`Status: ${p.label}`}
            style={{
              position: "absolute",
              left: THREAD.answer.x,
              top: THREAD.answer.y + p.y,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "9px 22px 9px 12px",
              borderRadius: 999,
              background: "#2a2a2a",
              border: `1px solid ${UI.chipBorder}`,
              fontFamily: FONT.sans,
              fontWeight: 500,
              fontSize: UIN.answer,
              color: UI.text,
              opacity: p.opacity,
              filter: p.blur > 0.05 ? `blur(${p.blur}px)` : undefined,
            }}
          >
            <SpaceOrb timeOffset={s.clock} size={22} />
            {p.label}
          </div>
        ) : null,
      )}

      {/* Answer, with source tags as chips */}
      {s.answerOpacity > 0 ? (
        <div data-guard="uitext" data-guard-read="1" data-guard-label="Answer" style={{ position: "absolute", left: THREAD.answer.x, top: THREAD.answer.y, opacity: s.answerOpacity }}>
          <Typewriter
            lines={[...P.answerLines]}
            cps={REPLAY_CPS}
            startFrame={s.answerStart}
            seed="s3-answer"
            caretColor={UI.text}
            style={{ fontFamily: FONT.sans, fontSize: UIN.answer, lineHeight: 1.55, color: UI.text }}
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
                    fontSize: UIN.citation,
                    lineHeight: 1.35,
                    padding: "0 7px",
                    margin: "0 3px",
                    borderRadius: 7,
                    background: `rgba(${52 + 129 * active}, ${55 + 155 * active}, ${61 + 1 * active}, ${1 - 0.7 * active})`,
                    border: `1.5px solid ${active > 0 ? `rgba(181,210,62,${0.4 + 0.6 * active})` : "#4b4f57"}`,
                    color: "#dfe6ff",
                    verticalAlign: "0.1em",
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
          data-guard="uitext"
          data-guard-read="1"
          data-guard-label="Source card"
          style={{
            position: "absolute",
            left: THREAD.card.x,
            top: THREAD.card.y,
            width: THREAD.card.w,
            boxSizing: "border-box",
            padding: "20px 24px 22px",
            borderRadius: 18,
            background: UI.card,
            border: `1px solid ${UI.chipBorder}`,
            boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
            fontFamily: FONT.sans,
            color: UI.text,
            opacity: s.cardOpen,
            filter: s.cardOpen < 1 ? `blur(${(1 - s.cardOpen) * 14}px)` : undefined,
            transform: `translateX(${(1 - s.cardOpen) * -24}px) scale(${0.96 + 0.04 * s.cardOpen})`,
            transformOrigin: "0% 20%",
          }}
        >
          <div style={{ fontSize: UIN.sourceTitle, fontWeight: 700, lineHeight: 1.3 }}>{P.sourceCardTitle}</div>
          <div style={{ height: 1, background: UI.chipBorder, margin: "14px 0" }} />
          <div style={{ fontSize: UIN.sourceBody, lineHeight: 1.5, color: "#d9d9d9" }}>
            <span
              style={{
                background: `rgba(181,210,62,${0.26 * Math.min(1, s.cardOpen * 1.5)})`,
                color: UI.text,
                borderRadius: 5,
                boxDecorationBreak: "clone",
                WebkitBoxDecorationBreak: "clone",
                padding: "0 3px",
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
