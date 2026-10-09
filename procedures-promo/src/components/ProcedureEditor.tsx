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
  addPill: { x: SUB_X, y: 162, w: 128, h: 24 },
  c11: { x: SUB_X, y: 162, w: SUB_W, h: 92 },
  c12: { x: SUB_X, y: 264, w: SUB_W, h: 36 },
  c21: { x: SUB_X, y: 358, w: SUB_W, h: 86 },
  c22: { x: SUB_X, y: 454, w: SUB_W, h: 64 },
  c31: { x: SUB_X, y: 576, w: SUB_W, h: 36 },
  c32: { x: SUB_X, y: 622, w: SUB_W, h: 56 },
  action: { x: 50, y: 50, w: 236, h: 26 },
  toggle: { x: 306, y: 56, w: 26, h: 14 },
  railX: 40,
};
export const ifCard = POS.c11;
export const stepCenter = (i: number) => POS.stepY[i] + POS.stepH / 2;
export const CONTENT_BOTTOM = POS.c32.y + POS.c32.h + 24;

export type CardKey = "h1" | "c11" | "c12" | "h2" | "c21" | "c22" | "h3" | "c31" | "c32";

export type EditorState = {
  rows: number[]; // staggered entry: top bar, procedure name
  titleText: string;
  titleFocus: boolean;
  cards: Record<CardKey, number>; // spring progress per step header / sub-card
  addPill: number;
  // Step 1.1 configuration (scene 6)
  condFocus: number;
  actionOpen: number;
  actionHover: number;
  actionSelected: boolean;
  toggle: number;
  glow: number;
  badge: number;
  // Live traversal (scene 7)
  trailY: number; // head of the execution path along the rail (card-relative y); 0 = off
  stepActive: [number, number, number];
  stepDone: [number, number, number];
  passChip: number; // step 1 "{order_age} = 12 days · Passed"
  skipStep1Branches: number; // dims 1.1 / 1.2 when neither applies
  c21Active: number;
  calcPill: number;
  c31Active: number;
  labelPill: number;
  c32Active: number;
  caretOn: boolean;
  saved: boolean;
};

const ZERO_CARDS: Record<CardKey, number> = { h1: 0, c11: 0, c12: 0, h2: 0, c21: 0, c22: 0, h3: 0, c31: 0, c32: 0 };

export const EMPTY_EDITOR: EditorState = {
  rows: [1, 1],
  titleText: "",
  titleFocus: false,
  cards: ZERO_CARDS,
  addPill: 0,
  condFocus: 0,
  actionOpen: 0,
  actionHover: -1,
  actionSelected: false,
  toggle: 0,
  glow: 0,
  badge: 0,
  trailY: 0,
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

// Variable chip, e.g. {net_refund}
const V: React.FC<{ children: string }> = ({ children }) => (
  <span
    style={{
      display: "inline-block",
      background: COLORS.varBg,
      color: COLORS.varFg,
      borderRadius: 4,
      padding: "1px 5px",
      fontWeight: 500,
      lineHeight: 1.35,
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

// Lime status pill that pops onto a card edge during the live run.
const StatusPill: React.FC<{ p: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ p, children, style }) => (
  <div
    style={{
      position: "absolute",
      right: 12,
      top: -9,
      height: 18,
      padding: "0 8px",
      borderRadius: 9,
      background: COLORS.lime,
      color: COLORS.ink,
      display: "flex",
      alignItems: "center",
      gap: 4,
      fontSize: 9,
      fontWeight: 500,
      whiteSpace: "nowrap",
      boxShadow: `0 0 ${12 * Math.min(1, p)}px rgba(210,248,0,0.6)`,
      opacity: Math.min(1, p * 1.4),
      scale: String(p),
      zIndex: 4,
      ...style,
    }}
  >
    {children}
  </div>
);

// Children of a card fade up one after another as the card's spring progresses.
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
  p: number;
  active?: number;
  dim?: number;
  border?: string;
  shadow?: string;
  z?: number;
  children: React.ReactNode;
}> = ({ pos, p, active = 0, dim = 0, border, shadow, z = 1, children }) => (
  <div
    style={{
      position: "absolute",
      left: pos.x,
      top: pos.y,
      width: pos.w,
      height: pos.h,
      boxSizing: "border-box",
      borderRadius: 10,
      border: border ?? (active > 0 ? `1.5px solid rgba(210,248,0,${active})` : `1px solid ${COLORS.border}`),
      background: active > 0 ? `rgba(210,248,0,${0.08 * active})` : COLORS.surface,
      boxShadow: shadow ?? (active > 0 ? `0 0 ${14 * active}px rgba(210,248,0,${0.5 * active})` : "0 1px 2px rgba(17,24,39,0.04)"),
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
      border: active > 0 ? `1.5px solid rgba(210,248,0,${active})` : `1px solid ${COLORS.border}`,
      background: active > 0 ? `rgba(210,248,0,${0.1 * active})` : COLORS.surface,
      boxShadow: active > 0 ? `0 0 ${14 * active}px rgba(210,248,0,${0.5 * active})` : undefined,
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
    <span
      style={{
        position: "absolute",
        left: POS.railX - POS.stepX - 9,
        width: 18,
        height: 18,
        borderRadius: 9,
        boxSizing: "border-box",
        border: `1px solid ${active > 0.5 || done > 0.5 ? COLORS.ink : COLORS.border}`,
        background: active > 0.5 || done > 0.5 ? COLORS.lime : COLORS.surface,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 9,
        color: active > 0.5 || done > 0.5 ? COLORS.ink : COLORS.grey,
      }}
    >
      {done > 0.5 ? <Check size={10} /> : n}
    </span>
    <span style={{ position: "absolute", left: 36 }}>
      <span style={{ color: COLORS.greyLight, fontWeight: 400 }}>{n}.</span> {TEXT.steps[n - 1]}
    </span>
    {extra}
    <Badge kind="RUN" style={{ position: "absolute", right: 10 }} />
  </div>
);

const ACTIONS = ["Send message", "Run instruction", TEXT.action, "End conversation"];
const label: React.CSSProperties = { fontSize: 9.5, color: COLORS.greyLight, width: 22 };
const row: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, fontSize: 10.5, color: COLORS.ink, whiteSpace: "nowrap" };

export const ProcedureEditor: React.FC<{ s: EditorState; style?: React.CSSProperties }> = ({ s, style }) => {
  const c = s.cards;
  const lit11 = s.glow;
  const s1c = stepCenter(0);
  // Rail grows down to the most recently revealed step.
  const railEnd = c.h3 > 0 ? stepCenter(2) : c.h2 > 0 ? stepCenter(1) : s1c;
  const railP = c.h3 > 0 ? c.h3 : c.h2 > 0 ? c.h2 : 1;
  const prevEnd = c.h3 > 0 ? stepCenter(1) : c.h2 > 0 ? s1c : s1c;
  const railLen = prevEnd - s1c + (railEnd - prevEnd) * Math.min(1, railP);
  const connector = (y: number, p: number, lit = 0) => (
    <div
      key={y}
      style={{
        position: "absolute",
        left: POS.railX,
        top: y,
        width: (SUB_X - POS.railX) * Math.min(1, p),
        height: lit > 0 ? 2 : 1,
        marginTop: lit > 0 ? -0.5 : 0,
        background: lit > 0 ? COLORS.lime : COLORS.border,
        boxShadow: lit > 0 ? "0 0 6px rgba(210,248,0,0.9)" : undefined,
      }}
    />
  );
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

      {/* Rail, connectors and the live execution trail */}
      {c.h1 > 0 ? (
        <div style={{ position: "absolute", left: POS.railX, top: s1c, width: 1, height: railLen, background: COLORS.border }} />
      ) : null}
      {connector(POS.c11.y + 18, c.c11)}
      {connector(POS.c12.y + 18, c.c12)}
      {connector(POS.c21.y + 18, c.c21, s.c21Active)}
      {connector(POS.c22.y + 18, c.c22)}
      {connector(POS.c31.y + 18, c.c31, s.c31Active)}
      {connector(POS.c32.y + 18, c.c32, s.c32Active)}
      {s.trailY > 0 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: POS.railX - 0.5,
              top: s1c,
              width: 2,
              height: s.trailY - s1c,
              background: COLORS.lime,
              boxShadow: "0 0 6px rgba(210,248,0,0.9)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: POS.railX - 4.5,
              top: s.trailY - 4.5,
              width: 9,
              height: 9,
              borderRadius: 5,
              background: COLORS.lime,
              boxShadow: "0 0 10px 4px rgba(210,248,0,0.75)",
              zIndex: 3,
            }}
          />
        </>
      ) : null}

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
            <span style={{ fontSize: 9.5 }}>
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
                background: COLORS.lime,
                fontWeight: 500,
              }}
            >
              <Check size={8} /> Passed
            </span>
          </span>
        }
      />

      {/* + Add branch rule */}
      <div
        style={{
          position: "absolute",
          left: POS.addPill.x,
          top: POS.addPill.y,
          width: POS.addPill.w,
          height: POS.addPill.h,
          boxSizing: "border-box",
          borderRadius: 12,
          border: `1px dashed #D1D5DB`,
          background: COLORS.surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          fontSize: 10.5,
          color: COLORS.grey,
          opacity: s.addPill,
          scale: String(0.9 + 0.1 * s.addPill),
        }}
      >
        <span style={{ fontSize: 13, lineHeight: 1 }}>+</span> Add branch rule
      </div>

      {/* 1.1 IF Order Age > 30 Days → HANDOFF + Strict Boundary Rule */}
      <SubCard
        pos={POS.c11}
        p={c.c11}
        dim={s.skipStep1Branches}
        z={5}
        border={s.glow > 0 ? `1.5px solid rgba(210,248,0,${s.glow})` : undefined}
        shadow={lit11 > 0 ? `0 0 ${16 * lit11}px rgba(210,248,0,${0.55 * lit11})` : undefined}
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
              border: `1px solid ${COLORS.border}`,
              boxShadow: s.condFocus > 0 ? `0 0 0 ${2 * s.condFocus}px rgba(17,24,39,${0.12 * s.condFocus})` : undefined,
              padding: "0 9px",
              display: "flex",
              alignItems: "center",
              fontSize: 11,
              color: COLORS.ink,
            }}
          >
            {TEXT.condition}
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
        {/* ● Active Policy */}
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
        {/* Action dropdown */}
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

      {/* 2.1 IF {return_reason} == "Customer Dislike" */}
      <SubCard pos={POS.c21} p={c.c21} active={s.c21Active}>
        <StatusPill p={s.calcPill}>
          <V>net_refund</V> $120.00 − $15.00 = $105.00
        </StatusPill>
        <Item p={c.c21} i={0} style={{ left: 12, top: 10, ...row }}>
          <Badge kind="IF" />
          <V>return_reason</V>
          <span>== &quot;Customer Dislike&quot;</span>
        </Item>
        <Item p={c.c21} i={1} style={{ left: 12, top: 36, ...row }}>
          <span style={label}>2.1</span>
          <Badge kind="SET" />
          <V>restocking_fee</V>
          <span>= $15.00</span>
        </Item>
        <Item p={c.c21} i={2} style={{ left: 41, top: 60, ...row }}>
          <Badge kind="CALC" />
          <V>net_refund</V>
          <span>=</span>
          <V>order_total</V>
          <span>−</span>
          <V>restocking_fee</V>
        </Item>
      </SubCard>

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
      <SubCard pos={POS.c31} p={c.c31} active={s.c31Active}>
        <StatusPill p={s.labelPill}>
          <Check size={8} /> Label Generated
        </StatusPill>
        <Item p={c.c31} i={0} style={{ left: 12, top: 10, ...row }}>
          <span style={label}>3.1</span>
          <Badge kind="CALL_API" />
          <span>
            Generate_EasyPost_Label(<V>order_id</V>)
          </span>
          <span style={{ color: COLORS.greyLight }}>→</span>
          <span style={{ color: COLORS.grey }}>returns</span>
          <V>shipping_label_url</V>
        </Item>
      </SubCard>

      {/* 3.2 SEND */}
      <SubCard pos={POS.c32} p={c.c32} active={s.c32Active}>
        <Item p={c.c32} i={0} style={{ left: 12, top: 10 }}>
          <span style={label}>3.2</span>
        </Item>
        <Item p={c.c32} i={0} style={{ left: 41, top: 9 }}>
          <Badge kind="SEND" />
        </Item>
        <Item p={c.c32} i={1} style={{ left: 88, top: 9, width: 440 }}>
          <div style={{ fontSize: 10.5, lineHeight: 1.6, color: COLORS.ink }}>
            &ldquo;Your return label has been created: <V>shipping_label_url</V>. Your estimated refund of{" "}
            <V>net_refund</V> will process upon receipt.&rdquo;
          </div>
        </Item>
      </SubCard>
    </div>
  );
};
