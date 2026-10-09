import React from "react";
import { COLORS, TEXT } from "../theme";

// Editor card geometry, in world coordinates (the camera transforms the whole world).
export const CARD = { x: 160, y: 50, w: 640, h: 702 };

const SUB_X = 64;
const SUB_W = 552;

// Positions relative to the card, used to lay out the tree and to aim the cursor / camera.
export const POS = {
  title: { x: 24, y: 72, w: 592, h: 32 },
  stepX: 24,
  stepW: 592,
  stepH: 32,
  stepY: [120, 316, 534],
  c11: { x: SUB_X, y: 162, w: SUB_W, h: 92 },
  c12: { x: SUB_X, y: 264, w: SUB_W, h: 36 },
  c21: { x: SUB_X, y: 358, w: SUB_W, h: 86 },
  c22: { x: SUB_X, y: 454, w: SUB_W, h: 64 },
  c31: { x: SUB_X, y: 576, w: SUB_W, h: 36 },
  c32: { x: SUB_X, y: 622, w: SUB_W, h: 56 },
  action: { x: 50, y: 50, w: 236, h: 26 },
  toggle: { x: 306, y: 56, w: 26, h: 14 },
  railX: 40,
  // Rows inside card 2.1 (card-local y) and the "+ Add action" pill slots.
  c21Rows: [10, 35, 59],
  fieldX: 70, // where typed fields start inside a sub-card
  addPill: { w: 92, h: 20 },
};
export const ifCard = POS.c11;
export const stepCenter = (i: number) => POS.stepY[i] + POS.stepH / 2;
export const CONTENT_BOTTOM = POS.c32.y + POS.c32.h + 24;

// ── Typed content: plain text plus {variable} tokens that turn into green pills ──
export type Tok = { text: string } | { chip: string };
export const tokLen = (t: Tok) => ("chip" in t ? t.chip.length + 2 : t.text.length);
export const toksLen = (toks: Tok[]) => toks.reduce((a, t) => a + tokLen(t), 0);

export const FIELDS = {
  cond11: [{ text: "Order Age > 30 Days" }],
  cond21: [{ chip: "return_reason" }, { text: ' == "Customer Dislike"' }],
  set21: [{ chip: "restocking_fee" }, { text: " = $15.00" }],
  calc21: [{ chip: "net_refund" }, { text: " = " }, { chip: "order_total" }, { text: " − " }, { chip: "restocking_fee" }],
  api31: [{ text: "Generate_EasyPost_Label(" }, { chip: "order_id" }, { text: ")" }],
  send32: [
    { text: "Your return label has been created: " },
    { chip: "shipping_label_url" },
    { text: ". Your estimated refund of " },
    { chip: "net_refund" },
    { text: " will process upon receipt." },
  ],
} satisfies Record<string, Tok[]>;
export type FieldKey = keyof typeof FIELDS;

const VARIABLES = ["order_age", "order_id", "order_total", "return_reason", "restocking_fee", "net_refund", "shipping_label_url"];

export const ACTION_TYPES = [
  { kind: "SET", desc: "Set a variable" },
  { kind: "CALC", desc: "Calculate a value" },
  { kind: "CALL_API", desc: "Call an external API" },
  { kind: "SEND", desc: "Send a message" },
  { kind: "HANDOFF", desc: "Hand off to a human" },
] as const;

export type CardKey = "h1" | "c11" | "c12" | "h2" | "c21" | "c22" | "h3" | "c31" | "c32";

export type EditorState = {
  rows: number[]; // staggered entry: top bar, procedure name
  titleText: string;
  titleFocus: boolean;
  cards: Record<CardKey, number>; // spring progress per step header / sub-card
  // Interactive configuration (scene 5)
  typed: Record<FieldKey, number>; // characters typed per field
  focus: FieldKey | null;
  set21Row: number;
  calc21Row: number;
  c21H: number;
  pill21: { p: number; slot: number }; // slot = which c21 row the pill sits in
  pill3: { p: number; slot: number }; // slot 0 = c31 position, 1 = c32 position
  menu: { p: number; at: "c21" | "c3"; hover: number };
  addStep: { p: number; slot: number }; // "+ Add a step…" row at step slot 0, 1 or 2
  returnsChip: number;
  // Step 1.1 configuration (scene 6)
  actionOpen: number;
  actionHover: number;
  actionSelected: boolean;
  toggle: number;
  glow: number;
  badge: number;
  // Live traversal (scene 7)
  stepActive: [number, number, number];
  stepDone: [number, number, number];
  passChip: number;
  skipStep1Branches: number;
  c21Active: number;
  calcPill: number;
  c31Active: number;
  labelPill: number;
  c32Active: number;
  caretOn: boolean;
  saved: boolean;
};

export const EMPTY_EDITOR: EditorState = {
  rows: [1, 1],
  titleText: "",
  titleFocus: false,
  cards: { h1: 0, c11: 0, c12: 0, h2: 0, c21: 0, c22: 0, h3: 0, c31: 0, c32: 0 },
  typed: { cond11: 0, cond21: 0, set21: 0, calc21: 0, api31: 0, send32: 0 },
  focus: null,
  set21Row: 0,
  calc21Row: 0,
  c21H: 40,
  pill21: { p: 0, slot: 1 },
  pill3: { p: 0, slot: 0 },
  menu: { p: 0, at: "c21", hover: -1 },
  addStep: { p: 0, slot: 0 },
  returnsChip: 0,
  actionOpen: 0,
  actionHover: -1,
  actionSelected: false,
  toggle: 0,
  glow: 0,
  badge: 0,
  stepActive: [0, 0, 0],
  stepDone: [0, 0, 0],
  passChip: 0,
  skipStep1Branches: 0,
  c21Active: 0,
  calcPill: 0,
  c31Active: 0,
  labelPill: 0,
  c32Active: 0,
  caretOn: false,
  saved: false,
};

// Muted accent: Pigmented Lime at 25% fill with a subtle 1px border.
const LIME_FILL = (a: number) => `rgba(210,248,0,${0.25 * a})`;
const LIME_EDGE = (a: number) => `rgba(170,200,0,${0.75 * a})`;
const GUIDE = "#E5E7EB";

const BADGE = {
  RUN: [COLORS.runBg, COLORS.runFg],
  IF: [COLORS.ifBg, COLORS.ifFg],
  "ELSE IF": [COLORS.ifBg, COLORS.ifFg],
  SEND: [COLORS.sendBg, COLORS.sendFg],
  HANDOFF: [COLORS.sendBg, COLORS.sendFg],
  SET: ["#E0E7FF", "#4338CA"],
  CALC: ["#E0E7FF", "#4338CA"],
  CALL_API: ["#CCFBF1", "#0F766E"],
} as const;

const Badge: React.FC<{ kind: keyof typeof BADGE; style?: React.CSSProperties }> = ({ kind, style }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      height: 16,
      padding: "0 6px",
      borderRadius: 4,
      background: BADGE[kind][0],
      color: BADGE[kind][1],
      fontSize: 8.5,
      fontWeight: 500,
      letterSpacing: "0.04em",
      flexShrink: 0,
      ...style,
    }}
  >
    {kind}
  </span>
);

// Variable pill, e.g. {net_refund}
const V: React.FC<{ children: string }> = ({ children }) => (
  <span
    style={{
      display: "inline-block",
      background: COLORS.varBg,
      color: COLORS.varFg,
      borderRadius: 4,
      padding: "0 5px",
      fontWeight: 500,
      lineHeight: 1.5,
    }}
  >
    {`{${children}}`}
  </span>
);

const Caret: React.FC<{ on: boolean }> = ({ on }) => (
  <span
    style={{
      display: "inline-block",
      width: 1,
      height: "1.05em",
      marginLeft: 1,
      verticalAlign: "-0.15em",
      background: COLORS.ink,
      opacity: on ? 1 : 0,
    }}
  />
);

const Check: React.FC<{ color?: string; size?: number }> = ({ color = COLORS.ink, size = 9 }) => (
  <svg width={size} height={size} viewBox="0 0 10 10">
    <path d="M2 5.2 L4.2 7.3 L8 3" stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Renders `n` typed characters of a token list. A {variable} becomes a pill once its closing brace is typed;
// while it is being typed, an autocomplete list of matching variables is shown under the field.
const TypedTokens: React.FC<{ toks: Tok[]; n: number; focus: boolean; caretOn: boolean; placeholder: string }> = ({
  toks,
  n,
  focus,
  caretOn,
  placeholder,
}) => {
  let left = n;
  let partialChip: string | null = null;
  const out: React.ReactNode[] = [];
  toks.forEach((t, i) => {
    if (left <= 0) return;
    const len = tokLen(t);
    if ("chip" in t) {
      if (left >= len) out.push(<V key={i}>{t.chip}</V>);
      else {
        const raw = `{${t.chip}}`.slice(0, left);
        out.push(<span key={i}>{raw}</span>);
        partialChip = raw.slice(1);
      }
    } else {
      out.push(<span key={i} style={{ whiteSpace: "pre-wrap" }}>{t.text.slice(0, left)}</span>);
    }
    left -= len;
  });
  const prefix = partialChip as string | null;
  const matches = prefix === null ? [] : VARIABLES.filter((v) => v.startsWith(prefix)).slice(0, 4);
  return (
    <>
      {n === 0 && !focus ? <span style={{ color: COLORS.greyLight }}>{placeholder}</span> : out}
      {focus ? <Caret on={caretOn} /> : null}
      {focus && matches.length > 0 ? (
        <span
          style={{
            position: "absolute",
            left: 0,
            top: "100%",
            marginTop: 4,
            padding: 4,
            width: 170,
            boxSizing: "border-box",
            borderRadius: 8,
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 12px 28px -8px rgba(17,24,39,0.18)",
            display: "flex",
            flexDirection: "column",
            zIndex: 20,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: 8, color: COLORS.greyLight, padding: "2px 6px 4px", letterSpacing: "0.04em" }}>VARIABLES</span>
          {matches.map((m, i) => (
            <span
              key={m}
              style={{
                padding: "3px 6px",
                borderRadius: 5,
                background: i === 0 ? "#F3F4F6" : "transparent",
                fontSize: 10,
              }}
            >
              <V>{m}</V>
            </span>
          ))}
        </span>
      ) : null}
    </>
  );
};

// Inline input box that hosts typed tokens.
const Field: React.FC<{
  s: EditorState;
  k: FieldKey;
  placeholder: string;
  width?: number;
  multiline?: boolean;
}> = ({ s, k, placeholder, width, multiline }) => {
  const focus = s.focus === k;
  return (
    <span
      style={{
        position: "relative",
        display: multiline ? "block" : "inline-flex",
        alignItems: "center",
        gap: 0,
        minHeight: 20,
        width,
        minWidth: 120,
        boxSizing: "border-box",
        padding: multiline ? "3px 7px" : "0 7px",
        borderRadius: 5,
        border: `1px solid ${focus ? COLORS.ink : COLORS.border}`,
        background: COLORS.surface,
        fontSize: 10.5,
        lineHeight: multiline ? 1.65 : 1,
        color: COLORS.ink,
        whiteSpace: multiline ? "normal" : "nowrap",
      }}
    >
      <TypedTokens toks={FIELDS[k]} n={s.typed[k]} focus={focus} caretOn={s.caretOn} placeholder={placeholder} />
    </span>
  );
};

// Soft lime status pill that pops onto a card edge during the live run.
const StatusPill: React.FC<{ p: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ p, children, style }) => (
  <div
    style={{
      position: "absolute",
      right: 12,
      top: -9,
      height: 18,
      padding: "0 8px",
      borderRadius: 9,
      boxSizing: "border-box",
      background: "#F4FDCC",
      border: `1px solid ${LIME_EDGE(1)}`,
      color: COLORS.ink,
      display: "flex",
      alignItems: "center",
      gap: 4,
      fontSize: 9,
      fontWeight: 500,
      whiteSpace: "nowrap",
      opacity: Math.min(1, p * 1.4),
      scale: String(p),
      zIndex: 4,
      ...style,
    }}
  >
    {children}
  </div>
);

const stag = (p: number, i: number) => Math.max(0, Math.min(1, (p - i * 0.14) / 0.55));
const Item: React.FC<{ p: number; i: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  p,
  i,
  style,
  children,
}) => (
  <div style={{ position: "absolute", opacity: stag(p, i), translate: `0px ${(1 - stag(p, i)) * 6}px`, ...style }}>
    {children}
  </div>
);

const SubCard: React.FC<{
  pos: { x: number; y: number; w: number; h: number };
  h?: number;
  p: number;
  active?: number;
  dim?: number;
  border?: string;
  shadow?: string;
  z?: number;
  children: React.ReactNode;
}> = ({ pos, h, p, active = 0, dim = 0, border, shadow, z = 1, children }) => (
  <div
    style={{
      position: "absolute",
      left: pos.x,
      top: pos.y,
      width: pos.w,
      height: h ?? pos.h,
      boxSizing: "border-box",
      borderRadius: 10,
      border: border ?? (active > 0 ? `1px solid ${LIME_EDGE(active)}` : `1px solid ${COLORS.border}`),
      background: active > 0 ? LIME_FILL(active) : COLORS.surface,
      boxShadow: shadow ?? "0 1px 2px rgba(17,24,39,0.04)",
      opacity: Math.min(1, p * 1.5) * (1 - 0.55 * dim),
      translate: `0px ${(1 - Math.min(1, p)) * 12}px`,
      zIndex: z,
    }}
  >
    {children}
  </div>
);

const StepRow: React.FC<{ n: number; p: number; active: number; done: number; extra?: React.ReactNode }> = ({
  n,
  p,
  active,
  done,
  extra,
}) => (
  <div
    style={{
      position: "absolute",
      left: POS.stepX,
      top: POS.stepY[n - 1],
      width: POS.stepW,
      height: POS.stepH,
      boxSizing: "border-box",
      borderRadius: 8,
      border: active > 0 ? `1px solid ${LIME_EDGE(active)}` : `1px solid ${COLORS.border}`,
      background: active > 0 ? LIME_FILL(active) : COLORS.surface,
      opacity: Math.min(1, p * 1.4),
      translate: `0px ${(1 - Math.min(1, p)) * 12}px`,
      display: "flex",
      alignItems: "center",
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: "-0.005em",
      zIndex: 2,
    }}
  >
    {/* Tree node: lights up in soft lime only while active */}
    <span
      style={{
        position: "absolute",
        left: POS.railX - POS.stepX - 9,
        width: 18,
        height: 18,
        borderRadius: 9,
        boxSizing: "border-box",
        border: `1px solid ${active > 0.5 ? LIME_EDGE(1) : done > 0.5 ? COLORS.greyLight : COLORS.border}`,
        background: active > 0.5 ? COLORS.lime : COLORS.surface,
        boxShadow: active > 0.5 ? `0 0 0 3px ${LIME_FILL(1)}` : undefined,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 9,
        color: active > 0.5 || done > 0.5 ? COLORS.ink : COLORS.grey,
      }}
    >
      {done > 0.5 && active < 0.5 ? <Check size={10} color={COLORS.grey} /> : n}
    </span>
    <span style={{ position: "absolute", left: 36 }}>
      <span style={{ color: COLORS.greyLight, fontWeight: 400 }}>{n}.</span> {TEXT.steps[n - 1]}
    </span>
    {extra}
    <Badge kind="RUN" style={{ position: "absolute", right: 10 }} />
  </div>
);

const AddPill: React.FC<{ p: number; x: number; y: number }> = ({ p, x, y }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: POS.addPill.w,
      height: POS.addPill.h,
      boxSizing: "border-box",
      borderRadius: 10,
      border: "1px dashed #D1D5DB",
      background: COLORS.surface,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      fontSize: 9.5,
      color: COLORS.grey,
      opacity: p,
      scale: String(0.9 + 0.1 * p),
      zIndex: 3,
    }}
  >
    <span style={{ fontSize: 12, lineHeight: 1 }}>+</span> Add action
  </div>
);

const ActionMenu: React.FC<{ p: number; hover: number; x: number; y: number }> = ({ p, hover, x, y }) =>
  p > 0 ? (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 176,
        boxSizing: "border-box",
        padding: 4,
        borderRadius: 8,
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 12px 28px -8px rgba(17,24,39,0.18)",
        opacity: p,
        translate: `0px ${(1 - p) * -6}px`,
        zIndex: 30,
      }}
    >
      {ACTION_TYPES.map((a, i) => {
        const ip = Math.min(1, Math.max(0, p * 4 - i * 0.5));
        return (
          <div
            key={a.kind}
            style={{
              height: 22,
              borderRadius: 5,
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "0 6px",
              fontSize: 9.5,
              color: COLORS.grey,
              background: hover === i ? "#F3F4F6" : "transparent",
              opacity: ip,
              translate: `0px ${(1 - ip) * 5}px`,
            }}
          >
            <Badge kind={a.kind} style={{ width: 54, justifyContent: "center", padding: 0 }} />
            {a.desc}
          </div>
        );
      })}
    </div>
  ) : null;

const ACTIONS = ["Send message", "Run instruction", TEXT.action, "End conversation"];
const label: React.CSSProperties = { fontSize: 9.5, color: COLORS.greyLight, width: 22 };
const row: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, fontSize: 10.5, color: COLORS.ink, whiteSpace: "nowrap" };

// Positions of the "+ Add action" pill, card-relative, exported for aiming the cursor.
export const pill21Pos = (slot: number) => ({ x: POS.c21.x + 41, y: POS.c21.y + POS.c21Rows[slot] });
export const pill3Pos = (slot: number) => ({ x: POS.c31.x, y: (slot === 0 ? POS.c31.y : POS.c32.y) + 8 });
export const MENU_OFFSET = POS.addPill.h + 4;
export const menuItemCenter = (pill: { x: number; y: number }, i: number) => ({
  x: pill.x + 80,
  y: pill.y + MENU_OFFSET + 4 + i * 22 + 11,
});

export const ProcedureEditor: React.FC<{ s: EditorState; style?: React.CSSProperties }> = ({ s, style }) => {
  const c = s.cards;
  const s1c = stepCenter(0);
  const s2c = stepCenter(1);
  const s3c = stepCenter(2);
  const connector = (y: number, p: number) => (
    <div
      key={y}
      style={{
        position: "absolute",
        left: POS.railX,
        top: y - 0.75,
        width: (SUB_X - POS.railX) * Math.min(1, p),
        height: 1.5,
        background: GUIDE,
      }}
    />
  );
  const p21 = pill21Pos(s.pill21.slot);
  const p3 = pill3Pos(s.pill3.slot);
  return (
    <div
      style={{
        position: "absolute",
        left: CARD.x,
        top: CARD.y,
        width: CARD.w,
        height: CARD.h,
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 12px 32px -12px rgba(17,24,39,0.10)",
        ...style,
      }}
    >
      {/* Top bar */}
      <div
        style={{
          opacity: s.rows[0],
          translate: `0px ${(1 - s.rows[0]) * 10}px`,
          height: 44,
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          fontSize: 11,
          color: COLORS.grey,
          gap: 6,
        }}
      >
        <span>Procedures</span>
        <span style={{ color: COLORS.greyLight }}>/</span>
        <span style={{ color: COLORS.ink, fontWeight: 500 }}>{s.titleText || "New procedure"}</span>
        <span style={{ flex: 1 }} />
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            height: 20,
            padding: "0 8px",
            borderRadius: 10,
            border: `1px solid ${COLORS.border}`,
            fontSize: 9.5,
            color: COLORS.grey,
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: 3, background: s.saved ? COLORS.lime : "#D1D5DB" }} />
          {s.saved ? "Live" : "Draft"}
        </span>
      </div>

      {/* Procedure name */}
      <div style={{ opacity: s.rows[1], position: "absolute", left: POS.title.x, top: 54, fontSize: 9.5, color: COLORS.grey }}>
        Procedure name
      </div>
      <div
        style={{
          opacity: s.rows[1],
          translate: `0px ${(1 - s.rows[1]) * 10}px`,
          position: "absolute",
          left: POS.title.x,
          top: POS.title.y,
          width: POS.title.w,
          height: POS.title.h,
          boxSizing: "border-box",
          border: s.titleFocus ? `1px solid ${COLORS.ink}` : `1px solid ${COLORS.border}`,
          borderRadius: 8,
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          fontSize: 15,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          color: s.titleText ? COLORS.ink : COLORS.greyLight,
        }}
      >
        {s.titleText || (s.titleFocus ? "" : "Untitled procedure")}
        {s.titleFocus ? <Caret on={s.caretOn} /> : null}
      </div>

      {/* Neutral 1.5px guide line and connectors */}
      <div
        style={{
          position: "absolute",
          left: POS.railX - 0.75,
          top: s1c,
          width: 1.5,
          height: (s2c - s1c) * Math.min(1, c.h2) + (s3c - s2c) * Math.min(1, c.h3),
          background: GUIDE,
          opacity: c.h1,
        }}
      />
      {connector(POS.c11.y + 18, c.c11)}
      {connector(POS.c12.y + 18, c.c12)}
      {connector(POS.c21.y + 18, c.c21)}
      {connector(POS.c22.y + 18, c.c22)}
      {connector(POS.c31.y + 18, Math.max(c.c31, s.pill3.p))}
      {connector(POS.c32.y + 18, c.c32)}

      {/* ── Step 1 ─────────────────────────────── */}
      <StepRow
        n={1}
        p={c.h1}
        active={s.stepActive[0]}
        done={s.stepDone[0]}
        extra={
          <span
            style={{
              position: "absolute",
              right: 52,
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 9.5,
              fontWeight: 400,
              opacity: s.passChip,
              translate: `${(1 - s.passChip) * 8}px 0px`,
            }}
          >
            <span>
              <V>order_age</V> = 12 days
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                height: 16,
                padding: "0 6px",
                borderRadius: 8,
                boxSizing: "border-box",
                background: "#F4FDCC",
                border: `1px solid ${LIME_EDGE(1)}`,
                fontWeight: 500,
              }}
            >
              <Check size={8} /> Passed
            </span>
          </span>
        }
      />

      {/* 1.1 IF Order Age > 30 Days → HANDOFF + Strict Boundary Rule */}
      <SubCard
        pos={POS.c11}
        p={c.c11}
        dim={s.skipStep1Branches}
        z={5}
        border={s.glow > 0 ? `1px solid ${LIME_EDGE(s.glow)}` : undefined}
      >
        <Item p={c.c11} i={0} style={{ left: 12, top: 17 }}>
          <Badge kind="IF" />
        </Item>
        <Item p={c.c11} i={1} style={{ left: 50, top: 12 }}>
          <div
            style={{
              width: 250,
              height: 26,
              boxSizing: "border-box",
              borderRadius: 6,
              border: `1px solid ${s.focus === "cond11" ? COLORS.ink : COLORS.border}`,
              padding: "0 9px",
              display: "flex",
              alignItems: "center",
              fontSize: 11,
              color: COLORS.ink,
            }}
          >
            <TypedTokens toks={FIELDS.cond11} n={s.typed.cond11} focus={s.focus === "cond11"} caretOn={s.caretOn} placeholder="Add a condition…" />
          </div>
        </Item>
        <Item p={c.c11} i={1} style={{ right: 12, top: 17 }}>
          <span style={{ fontSize: 8.5, color: COLORS.grey, background: "#F3F4F6", borderRadius: 4, padding: "2px 6px" }}>
            Natural language
          </span>
        </Item>
        <Item p={c.c11} i={2} style={{ left: 14, top: 57 }}>
          <span style={{ fontSize: 9.5, color: COLORS.greyLight }}>1.1</span>
        </Item>
        <Item p={c.c11} i={2} style={{ left: POS.action.x, top: POS.action.y }}>
          <div
            style={{
              width: POS.action.w,
              height: POS.action.h,
              boxSizing: "border-box",
              borderRadius: 6,
              border: s.actionOpen > 0.5 ? `1px solid ${COLORS.ink}` : `1px solid ${COLORS.border}`,
              padding: "0 9px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: s.actionSelected ? COLORS.ink : COLORS.greyLight,
            }}
          >
            {s.actionSelected ? <Badge kind="HANDOFF" style={{ height: 14, fontSize: 7.5 }} /> : null}
            <span style={{ flex: 1 }}>{s.actionSelected ? TEXT.action : "Select action"}</span>
            <svg width={8} height={8} viewBox="0 0 8 8">
              <path d="M1.5 3 L4 5.5 L6.5 3" stroke={COLORS.grey} strokeWidth={1} fill="none" />
            </svg>
          </div>
        </Item>
        <Item p={c.c11} i={3} style={{ left: POS.toggle.x, top: POS.toggle.y }}>
          <div
            style={{
              position: "relative",
              width: POS.toggle.w,
              height: POS.toggle.h,
              borderRadius: 7,
              background: s.toggle > 0.5 ? COLORS.lime : "#E5E7EB",
              boxShadow: s.toggle > 0.5 ? "inset 0 0 0 1px rgba(17,24,39,0.06)" : undefined,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 2,
                left: 2 + 12 * s.toggle,
                width: 10,
                height: 10,
                borderRadius: 5,
                background: s.toggle > 0.5 ? COLORS.ink : COLORS.surface,
                boxShadow: "0 1px 2px rgba(17,24,39,0.2)",
              }}
            />
          </div>
        </Item>
        <Item p={c.c11} i={3} style={{ left: POS.toggle.x + 34, top: 56 }}>
          <span style={{ fontSize: 10.5, color: COLORS.ink }}>Strict Boundary Rule</span>
        </Item>
        <div
          style={{
            position: "absolute",
            right: 12,
            top: -9,
            height: 18,
            padding: "0 8px",
            borderRadius: 9,
            background: COLORS.ink,
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 9,
            fontWeight: 500,
            opacity: Math.min(1, s.badge * 1.4),
            scale: String(s.badge),
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: 3, background: COLORS.lime }} />
          Active Policy
        </div>
        {s.actionOpen > 0 ? (
          <div
            style={{
              position: "absolute",
              left: POS.action.x,
              top: POS.action.y + POS.action.h + 4,
              width: POS.action.w,
              boxSizing: "border-box",
              padding: 4,
              borderRadius: 8,
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 12px 28px -8px rgba(17,24,39,0.18)",
              opacity: s.actionOpen,
              translate: `0px ${(1 - s.actionOpen) * -6}px`,
              zIndex: 10,
            }}
          >
            {ACTIONS.map((a, i) => {
              const p = Math.min(1, Math.max(0, s.actionOpen * 4 - i * 0.6));
              return (
                <div
                  key={a}
                  style={{
                    height: 24,
                    borderRadius: 5,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 8px",
                    fontSize: 10.5,
                    color: COLORS.ink,
                    background: s.actionHover === i ? "#F3F4F6" : "transparent",
                    opacity: p,
                    translate: `0px ${(1 - p) * 6}px`,
                  }}
                >
                  {a}
                </div>
              );
            })}
          </div>
        ) : null}
      </SubCard>

      {/* 1.2 ELSE IF Item Marked Final Sale → SEND */}
      <SubCard pos={POS.c12} p={c.c12} dim={s.skipStep1Branches}>
        <Item p={c.c12} i={0} style={{ left: 12, top: 10, ...row }}>
          <Badge kind="ELSE IF" />
          <span>{TEXT.elseCondition}</span>
          <span style={{ color: COLORS.greyLight }}>→</span>
          <span style={label}>1.2</span>
          <Badge kind="SEND" />
          <span style={{ color: COLORS.grey }}>Explain final-sale policy</span>
        </Item>
      </SubCard>

      {/* ── Step 2 ─────────────────────────────── */}
      <StepRow n={2} p={c.h2} active={s.stepActive[1]} done={s.stepDone[1]} />

      {/* 2.1 — configured interactively in scene 5 */}
      <SubCard pos={POS.c21} h={s.c21H} p={c.c21} active={s.c21Active} z={s.focus === "cond21" || s.menu.at === "c21" ? 8 : 1}>
        <StatusPill p={s.calcPill}>
          <V>net_refund</V> $120.00 − $15.00 = $105.00
        </StatusPill>
        <div style={{ position: "absolute", left: 12, top: POS.c21Rows[0], ...row }}>
          <span style={{ width: 22 + 7 + 16, display: "inline-flex" }}>
            <Badge kind="IF" />
          </span>
          <Field s={s} k="cond21" placeholder="Add a condition…" />
        </div>
        <div style={{ position: "absolute", left: 12, top: POS.c21Rows[1], opacity: s.set21Row, translate: `0px ${(1 - s.set21Row) * 6}px`, ...row }}>
          <span style={label}>2.1</span>
          <Badge kind="SET" />
          <Field s={s} k="set21" placeholder="variable = value" />
        </div>
        <div style={{ position: "absolute", left: 41, top: POS.c21Rows[2], opacity: s.calc21Row, translate: `0px ${(1 - s.calc21Row) * 6}px`, ...row }}>
          <Badge kind="CALC" />
          <Field s={s} k="calc21" placeholder="formula" />
        </div>
      </SubCard>
      <AddPill p={s.pill21.p} x={p21.x} y={p21.y} />
      {s.menu.at === "c21" ? <ActionMenu p={s.menu.p} hover={s.menu.hover} x={p21.x} y={p21.y + MENU_OFFSET} /> : null}

      {/* 2.2 ELSE IF {return_reason} == "Defective Item" */}
      <SubCard pos={POS.c22} p={c.c22} dim={s.c21Active > 0 ? 0.6 * s.c21Active : 0}>
        <Item p={c.c22} i={0} style={{ left: 12, top: 10, ...row }}>
          <Badge kind="ELSE IF" />
          <V>return_reason</V>
          <span>== &quot;Defective Item&quot;</span>
        </Item>
        <Item p={c.c22} i={1} style={{ left: 12, top: 36, ...row }}>
          <span style={label}>2.2</span>
          <Badge kind="SET" />
          <V>restocking_fee</V>
          <span>= $0.00</span>
          <span style={{ color: COLORS.greyLight }}>·</span>
          <span style={{ color: COLORS.grey }}>Waive return fee</span>
        </Item>
      </SubCard>

      {/* ── Step 3 ─────────────────────────────── */}
      <StepRow n={3} p={c.h3} active={s.stepActive[2]} done={s.stepDone[2]} />

      {/* 3.1 CALL_API */}
      <SubCard pos={POS.c31} p={c.c31} active={s.c31Active} z={s.focus === "api31" ? 8 : 1}>
        <StatusPill p={s.labelPill}>
          <Check size={8} /> Label Generated
        </StatusPill>
        <div style={{ position: "absolute", left: 12, top: 8, ...row }}>
          <span style={label}>3.1</span>
          <Badge kind="CALL_API" />
          <Field s={s} k="api31" placeholder="function(args)" />
          <span style={{ display: "flex", alignItems: "center", gap: 6, opacity: s.returnsChip, translate: `${(1 - s.returnsChip) * 6}px 0px` }}>
            <span style={{ color: COLORS.greyLight }}>→</span>
            <span style={{ color: COLORS.grey }}>returns</span>
            <V>shipping_label_url</V>
          </span>
        </div>
      </SubCard>

      {/* 3.2 SEND */}
      <SubCard pos={POS.c32} p={c.c32} active={s.c32Active} z={s.focus === "send32" ? 8 : 1}>
        <span style={{ position: "absolute", left: 12, top: 12, ...label }}>3.2</span>
        <span style={{ position: "absolute", left: 41, top: 10 }}>
          <Badge kind="SEND" />
        </span>
        <div style={{ position: "absolute", left: 88, top: 7 }}>
          <Field s={s} k="send32" placeholder="Message…" width={440} multiline />
        </div>
      </SubCard>

      {/* "+ Add a step…" placeholder row */}
      <div
        style={{
          position: "absolute",
          left: POS.stepX,
          top: POS.stepY[s.addStep.slot],
          width: POS.stepW,
          height: POS.stepH,
          boxSizing: "border-box",
          borderRadius: 8,
          border: "1px dashed #D1D5DB",
          display: "flex",
          alignItems: "center",
          gap: 6,
          paddingLeft: 14,
          fontSize: 11,
          color: COLORS.grey,
          opacity: s.addStep.p,
          translate: `0px ${(1 - s.addStep.p) * 6}px`,
          zIndex: 3,
        }}
      >
        <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> Add a step…
      </div>
      <AddPill p={s.pill3.p} x={p3.x} y={p3.y} />
      {s.menu.at === "c3" ? <ActionMenu p={s.menu.p} hover={s.menu.hover} x={p3.x} y={p3.y + MENU_OFFSET} /> : null}
    </div>
  );
};
