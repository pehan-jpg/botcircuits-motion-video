import React from "react";
import {
  ArrowUp,
  CalendarClock as Calendar,
  CircleCheck,
  Sparkles,
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
import { Img, staticFile } from "remotion";
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
  /** Turn 2 (an action): the thread scrolls up by this many native px. */
  scroll?: number;
  t2Focus?: number;
  t2TypeStart?: number;
  t2Sent?: number;
  t2Bubble?: number;
  t2Pill?: number;
  t2Card?: number;
  t2Rows?: [number, number];
  /** Suggested action chip under the card: appear, and pressed. */
  t2Chip?: number;
  t2ChipPressed?: number;
  /** Seconds added to orb clocks, for continuity across scenes. */
  clock: number;
};

/** Turn 2 layout, native px (before the scroll). */
export const TURN2 = { bubbleTop: 470, statusY: 590, card: { x: 300, y: 590, w: 860 }, chipY: 838, chipX: 300 };
/** Turn 2 typing speed: a fast, practised typist. */
export const T2_CPS = 60;

export const ChatScreen: React.FC<{ s: ChatState }> = ({ s }) => {
  const grow = 46 * s.focus * (1 - s.sent);
  const t2grow = 40 * (s.t2Focus ?? 0) * (1 - (s.t2Sent ?? 0));
  const inputTop = 446 + (812 - 446) * s.sent - t2grow;
  const inputH = 63 + grow + t2grow;
  const rowY = inputTop + inputH - 31.5;
  const heroO = s.heroIn * (1 - s.heroOut);
  const heroY = (1 - s.heroIn) * BLUR_IN.rise;
  const heroBlur = BLUR_IN.blur * (1 - s.heroIn) + 12 * s.heroOut;
  const chipsO = s.chipsIn * (1 - s.chipsOut);
  const typedO = 1 - Math.min(1, s.sent * 3);
  const placeholderO = Math.max(1 - s.focus * 2, Math.min(1, Math.max(0, s.sent * 2 - 1)));
  const t2f = (s.t2Focus ?? 0) * (1 - (s.t2Sent ?? 0));
  const lime = Math.max(s.focus * (1 - s.sent), t2f);
  // Focus ring: violet at 35 percent around a violet tinted border.
  const border = lime > 0 ? `rgba(124,98,240,${0.25 + 0.5 * lime})` : UI.line;
  const scroll = s.scroll ?? 0;

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
        <div style={{ ...ui, left: 229, width: 1680, top: 380, textAlign: "center", fontSize: UIN.helper, color: "#5B6478" }}>
          Find answers, turn ideas into action, and make room for your best work.
        </div>
      </div>

      {/* Input with footer row */}
      <div style={{ opacity: s.heroIn, transform: `translateY(${heroY}px)` }}>
        <div style={{ position: "absolute", left: 685, top: inputTop, width: 768, height: inputH + 50, border: `1px solid ${UI.line}`, borderRadius: 14, opacity: 1 - s.sent }} />
        <div style={{ ...ui, left: 702, top: inputTop + inputH + 13, fontSize: UIN.helper, color: "#5B6478", opacity: 1 - s.sent }}>
          Your agents work across your tools.
        </div>
        <div style={{ opacity: 1 - s.sent }}>
          <div style={{ ...ui, left: 1170, top: inputTop + inputH + 13, fontSize: UIN.helper, color: "#5B6478" }}>Connect your apps</div>
          {["#5B8DEF", "#3D7BF2", "#2F6FD6", "#6B7280"].map((c, i) => (
            <div
              key={i}
              style={{ position: "absolute", left: 1338 + i * 24, top: inputTop + inputH + 13, width: 23, height: 23, borderRadius: 12, background: "#FFFFFF", border: `1px solid ${UI.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}
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
            boxShadow: lime > 0 ? `0 0 0 ${4 * lime}px rgba(124,98,240,${0.35 * lime})` : undefined,
          }}
        />
        <Plus size={18} color="#5B6478" style={{ position: "absolute", left: 707, top: rowY - 9 }} />
        <div style={{ ...ui, left: 740, top: inputTop + 20, fontSize: UIN.helper, color: "#5B6478", opacity: placeholderO * (1 - Math.min(1, t2f * 3)) }}>
          Ask anything, or @ to mention an agent, a colleague or a resource
        </div>
        <Zap size={16} color="#0D1224" style={{ position: "absolute", left: 1306, top: rowY - 8 }} />
        <div style={{ ...ui, left: 1327, top: rowY - 11, fontSize: UIN.button, fontWeight: 500 }}>Auto</div>
        <ChevronDown size={14} color="#0D1224" style={{ position: "absolute", left: 1372, top: rowY - 7 }} />
        <div
          style={{
            position: "absolute",
            left: 1406,
            top: rowY - 15,
            width: 30,
            height: 30,
            borderRadius: 15,
            background: s.focus > 0.5 && s.sent === 0 ? "#0D1224" : "#E7E9F2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 1 - s.statusOrb,
            transform: `scale(${1 - 0.4 * s.statusOrb})`,
          }}
        >
          <ArrowUp size={16} color={s.focus > 0.5 && s.sent === 0 ? "#FFFFFF" : "#5B6478"} />
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

      {/* Turn 2 typing in the bottom input */}
      {t2f > 0 ? (
        <div data-guard="uitext" data-guard-read="1" data-guard-label="Chat prompt 2" style={{ position: "absolute", left: 740, top: inputTop + 12, width: 660, opacity: Math.min(1, t2f * 2) }}>
          <Typewriter lines={[...P.chat2.promptLines]} cps={T2_CPS} startFrame={s.t2TypeStart ?? 0} seed="s3-prompt2" caretColor={UI.text} style={{ fontFamily: FONT.sans, fontSize: UIN.userBubble, lineHeight: 1.3, color: UI.text }} />
        </div>
      ) : null}

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
                  color: "#0D1224",
                  whiteSpace: "nowrap",
                }}
              >
                <c.icon size={15} color="#5B6478" strokeWidth={1.6} />
                {c.label}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div style={{ position: "absolute", left: 0, top: 0, width: CHAT_NATIVE.w, height: 790, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: -scroll, width: CHAT_NATIVE.w, height: 1600 }}>
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
              background: "#FFFFFF",
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
                    background: active > 0 ? "#EDE9FF" : "#F4F5F9",
                    border: `1.5px solid ${active > 0 ? `rgba(124,98,240,${0.4 + 0.6 * active})` : UI.line}`,
                    color: active > 0 ? UI.lilacText : UI.text,
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
          <div style={{ fontSize: UIN.sourceBody, lineHeight: 1.5, color: "#5B6478" }}>
            <span
              style={{
                background: `rgba(124,98,240,${0.26 * Math.min(1, s.cardOpen * 1.5)})`,
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

      {/* Turn 2: the user's request, a status pill, then the action card and a suggested next step */}
      {(s.t2Bubble ?? 0) > 0 ? (
        <div
          data-guard="uitext"
          data-guard-read="1"
          data-guard-label="User message 2"
          style={{ position: "absolute", right: THREAD.bubbleRight, top: TURN2.bubbleTop, background: UI.bubble, borderRadius: 22, padding: "14px 22px", fontFamily: FONT.sans, fontSize: UIN.userBubble, lineHeight: 1.35, color: UI.text, whiteSpace: "pre", opacity: s.t2Bubble, transform: `translateY(${(1 - (s.t2Bubble ?? 0)) * 20}px)` }}
        >
          {P.chat2.promptLines.join("\n")}
        </div>
      ) : null}
      {(s.t2Pill ?? 0) > 0.001 ? (
        <div data-guard="uitext" data-guard-label="Status: setting up" style={{ position: "absolute", left: TURN2.card.x, top: TURN2.statusY, display: "flex", alignItems: "center", gap: 12, padding: "9px 22px 9px 12px", borderRadius: 999, background: "#FFFFFF", border: `1px solid ${UI.chipBorder}`, fontFamily: FONT.sans, fontWeight: 500, fontSize: UIN.answer, color: UI.text, opacity: s.t2Pill }}>
          <SpaceOrb timeOffset={s.clock} size={22} />
          {P.chat2.status}
        </div>
      ) : null}
      {(s.t2Card ?? 0) > 0 ? (
        <div
          data-guard="uitext"
          data-guard-read="1"
          data-guard-label="Action card"
          data-fit-box="action card"
          style={{ position: "absolute", left: TURN2.card.x, top: TURN2.card.y, width: TURN2.card.w, boxSizing: "border-box", padding: "16px 22px 10px", borderRadius: 16, background: "#FFFFFF", border: `1px solid ${UI.chipBorder}`, boxShadow: "0 12px 32px rgba(20,24,60,0.08)", fontFamily: FONT.sans, color: UI.text, opacity: s.t2Card, transform: `translateY(${(1 - (s.t2Card ?? 0)) * 14}px)` }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: UIN.answer, fontWeight: 700, marginBottom: 6 }}>
            <SpaceOrb timeOffset={s.clock} size={22} />
            {P.chat2.cardTitle}
          </div>
          {P.chat2.rows.map((r, i) => {
            const tick = s.t2Rows?.[i] ?? 0;
            return (
              <div key={r.kind} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: `1px solid ${UI.line}`, opacity: 0.35 + 0.65 * tick }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${UI.line}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {i === 0 ? <Calendar size={16} color={UI.secondary} /> : <Img data-guard="brand" src={staticFile("logos/slack.svg")} style={{ width: 18, height: 18 }} />}
                </div>
                <div data-fit-text style={{ fontSize: UIN.answer * 0.92, lineHeight: 1.35, whiteSpace: "nowrap" }}>
                  <span style={{ fontWeight: 700 }}>{r.kind}:</span> {r.text}
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14, fontSize: UIN.helper, color: UI.lilacText, fontWeight: 600 }}>
                  <span>View</span>
                  <span>Undo</span>
                  <CircleCheck size={20} color="#FFFFFF" fill={UI.green} style={{ opacity: tick, transform: `scale(${0.6 + 0.4 * tick})` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      {(s.t2Chip ?? 0) > 0 ? (
        <div
          data-guard="uitext"
          data-guard-label="Suggested action"
          style={{ position: "absolute", left: TURN2.chipX, top: TURN2.chipY, display: "flex", alignItems: "center", gap: 10, height: 42, padding: "0 18px", borderRadius: 21, background: (s.t2ChipPressed ?? 0) > 0.5 ? UI.lilacBg : "#FFFFFF", border: `1.5px solid ${UI.accent}`, fontFamily: FONT.sans, fontSize: UIN.button, fontWeight: 600, color: UI.lilacText, whiteSpace: "nowrap", opacity: s.t2Chip, transform: `translateY(${(1 - (s.t2Chip ?? 0)) * 10}px) scale(${1 - 0.04 * (s.t2ChipPressed ?? 0)})` }}
        >
          <Sparkles size={16} color={UI.lilacText} />
          {P.chat2.chip}
        </div>
      ) : null}
      </div>
      </div>
    </div>
  );
};