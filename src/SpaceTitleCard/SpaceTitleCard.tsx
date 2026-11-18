import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { getStaticFiles } from "@remotion/studio";
import { BRAND_LIME, EASE, INK } from "../constants";
import { mix, pop, progress } from "../anim";
import { BrandSymbol, LOGO_FILE } from "../components/BrandAssets";
import { LogoGuard, ReadabilityGuard } from "../components/Guards";
import { Orb } from "../components/Orb";
import { SafeAreaGuard } from "../components/SafeAreaGuard";
import { TypeBlock } from "../components/Typewriter";
import { FONT_FAMILY, MONO_FAMILY } from "../fonts";
import {
  APPROVE_BTN, BRAIN, COL_W, DELIVERY, INVOICE, LEAD, LINES, PAD, POLICY, REJECT_BTN, REQUEST, REVIEW, REVIEW_LINE,
  STAGE, TABLE, TABLE_COLS, TABLE_ROW, TEAM_LABEL, dataPath, validateLayout,
} from "./layout";
import {
  AMBER_ACCENT, CLAMP, Card, CardTitle, Chip, Cursor, INK70, LOGOS, Line, Logo, LogoId, MINT, MINT_SOFT, MicIcon,
  MintCheck, PauseGlyph, Pulse, SendIcon, Skeleton, StackIcon, StatusBadge, StatusChip, TEXT, within,
} from "./parts";
import { BASE_DURATION, CHAT_CPS, REQUEST_LINES, ROWS, T, TABLE_CPS } from "./timeline";
import { typewriterDuration } from "../components/Typewriter";

export type SpaceTitleCardProps = {
  loop: boolean;
  guards: boolean;
  /** END_MARK: "symbol" adds a 0.8s collapse into the BotCircuits symbol (clip becomes 10.8s). */
  endMark: "none" | "symbol";
  /** PAGE_BG */
  pageBg: string;
  /** Files present in public/ (the render script passes them); falls back to Studio detection. */
  availableFiles?: string[] | null;
  /** Placeholders the report lists; LogoGuard fails on any placeholder not listed here. */
  reportedPlaceholders?: string[];
};

const studioFiles = (): string[] => {
  try {
    return getStaticFiles().map((f) => f.name);
  } catch {
    return [];
  }
};

const fr = (s: number) => Math.round(s * 60);

/* --------- stage mist: mint and sky blobs, drifting at most 3 percent, never zooming --------- */
const Mist: React.FC<{ frame: number; loop: boolean }> = ({ frame, loop }) => {
  const d = loop ? 3 * Math.sin((Math.PI * frame) / BASE_DURATION) : Math.min(3, (frame / BASE_DURATION) * 3);
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: STAGE.radius,
        backgroundColor: "#F5F9FA",
        backgroundImage: [
          `radial-gradient(45% 60% at ${16 + d}% ${20 + d * 0.6}%, rgba(190,238,216,0.75) 0%, rgba(190,238,216,0) 100%)`,
          `radial-gradient(50% 65% at ${86 - d}% ${82 - d * 0.6}%, rgba(196,224,255,0.8) 0%, rgba(196,224,255,0) 100%)`,
          `radial-gradient(40% 50% at ${60 - d * 0.5}% ${12 + d}%, rgba(214,240,255,0.55) 0%, rgba(214,240,255,0) 100%)`,
        ].join(", "),
      }}
    />
  );
};

export const SpaceTitleCard: React.FC<SpaceTitleCardProps> = ({
  loop,
  guards,
  endMark,
  pageBg,
  availableFiles,
  reportedPlaceholders = [],
}) => {
  const frame = useCurrentFrame();
  const files = availableFiles ?? studioFiles();
  const has = (id: LogoId) => files.includes(LOGOS[id].file);
  const layoutErrors = useMemo(() => validateLayout(), []);

  // ---- global states ----
  const stageP = progress(frame, T.stageIn[0], T.stageIn[1]);
  const stageScale = loop ? 1 : mix(0.98, 1, stageP);
  const stageOpacity = loop ? 1 : stageP;
  const contents = loop ? interpolate(frame, [T.loopOut[0], T.loopOut[1] - 2], [1, 0], { ...CLAMP, easing: EASE }) : 1;
  const collapse = endMark === "symbol" ? progress(frame, T.endCollapse[0], T.endCollapse[1]) : 0;
  const filled = (r: readonly [number, number]) => progress(frame, r[0], r[1]) * contents;
  const skel = (f: number) => 1 - f;
  const skip = loop; // in loop mode the empty skeleton cards are already in place on frame 0

  const calm = progress(frame, T.calmIn[0], T.calmIn[1]) * (1 - progress(frame, T.approved[0], T.approved[1]));
  const wake = within(frame, T.wake) ? ((frame - T.wake[0]) / (T.wake[1] - T.wake[0]) * 2) % 1 : 0;
  const leadHalo = within(frame, T.leadPulse) ? (frame - T.leadPulse[0]) / (T.leadPulse[1] - T.leadPulse[0]) : wake;
  const orbStyle: React.CSSProperties = { filter: calm > 0 ? `grayscale(${0.75 * calm}) opacity(${1 - 0.3 * calm})` : undefined };

  // ---- request ----
  const field = filled(T.fieldIn);
  const send = progress(frame, T.sendHighlight[0], T.sendHighlight[1]);

  // ---- table rows ----
  const rowTimes = ROWS.map((row, k) => {
    const vStart = T.rowStart[k];
    const aStart = vStart + fr(typewriterDuration(row.vendor, TABLE_CPS)) + 2;
    const chipAt = aStart + fr(typewriterDuration(row.amount, TABLE_CPS)) + 3;
    return { vStart, aStart, chipAt };
  });

  // ---- lift (shared element: row 2 -> review line) ----
  const liftP = progress(frame, T.lift[0], T.lift[1]);
  const rowBox = { x: TABLE.x + PAD, y: TABLE.y + TABLE_ROW.top + TABLE_ROW.pitch, w: TABLE.w - 2 * PAD, h: TABLE_ROW.h };
  const ghost = {
    x: mix(rowBox.x, REVIEW_LINE.x, liftP),
    y: mix(rowBox.y, REVIEW_LINE.y, liftP),
    lift: Math.sin(Math.PI * liftP),
  };
  const ghostOn = within(frame, [T.lift[0], T.lift[1] + 8]) && contents > 0;
  const ghostOpacity = interpolate(frame, [T.lift[0], T.lift[0] + 4, T.lift[1] - 2, T.lift[1] + 8], [0, 1, 1, 0], CLAMP);
  const reviewLine = progress(frame, T.lift[1] - 4, T.lift[1] + 8) * contents;
  const reviewFill = filled(T.reviewFill);
  const approved = filled(T.approved);

  // ---- cursor ----
  const start = { x: 1440, y: 760 };
  const target = { x: APPROVE_BTN.x + 86, y: APPROVE_BTN.y + 30 };
  const mv = progress(frame, T.cursorMove[0], T.cursorMove[1]);
  const cursorOpacity = progress(frame, T.cursorIn[0], T.cursorIn[1]) * (1 - progress(frame, T.cursorOut[0], T.cursorOut[1]));
  const pressed = within(frame, T.click) ? Math.sin(Math.PI * ((frame - T.click[0]) / (T.click[1] - T.click[0]))) : 0;
  const clickFrame = T.click[0] + Math.round((T.click[1] - T.click[0]) / 2);

  // ---- delivery ----
  const delivery = filled(T.delivery);
  const deliveryCheck = pop(frame, T.deliveryCheck[0], T.deliveryCheck[1] - T.deliveryCheck[0]);

  const placeholders = (Object.keys(LOGOS) as LogoId[]).filter((id) => !has(id)).map((id) => LOGOS[id].file);

  return (
    <AbsoluteFill style={{ backgroundColor: pageBg, fontFamily: FONT_FAMILY }}>
      <SafeAreaGuard enabled={guards} noOverlap staticErrors={layoutErrors}>
        <ReadabilityGuard enabled={guards} clickFrame={clickFrame} clickTarget="btn-approve">
          <LogoGuard enabled={guards} availableFiles={files} reportedPlaceholders={[...reportedPlaceholders, ...(guards ? [] : placeholders)]}>
            {collapse < 1 ? (
              <div
                data-guard="stage"
                data-guard-container=""
                style={{
                  position: "absolute",
                  left: STAGE.left,
                  top: STAGE.top,
                  width: STAGE.w,
                  height: STAGE.h,
                  borderRadius: STAGE.radius,
                  boxShadow: "0 24px 60px rgba(13,18,36,0.08)",
                  transform: `scale(${stageScale * (1 - 0.95 * collapse)})`,
                  opacity: stageOpacity * (1 - interpolate(collapse, [0.4, 1], [0, 1], CLAMP)),
                }}
              >
                <Mist frame={frame} loop={loop} />

                {/* connecting lines, under the cards */}
                <svg width={STAGE.w} height={STAGE.h} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden>
                  <g opacity={contents}>
                    <Line poly={LINES.req} draw={progress(frame, T.reqLine[0], T.reqLine[1])} />
                    <Line poly={LINES.inv} draw={progress(frame, T.agentLines[0], T.agentLines[1])} />
                    <Line poly={LINES.pol} draw={progress(frame, T.agentLines[0], T.agentLines[1])} />
                    <Line poly={LINES.brain} draw={progress(frame, T.brainLine[0], T.brainLine[1])} />
                  </g>
                </svg>

                {/* ---------- Request ---------- */}
                <Card guard="card-request" box={REQUEST} frame={frame} popRange={T.cardIn(0)} skipPop={skip}>
                  <CardTitle>Request</CardTitle>
                  <Skeleton top={70} widths={[300, 220]} opacity={skel(field)} />
                  <div
                    style={{
                      position: "absolute",
                      left: PAD,
                      top: 56,
                      width: REQUEST.w - 2 * PAD,
                      height: 80,
                      borderRadius: 18,
                      border: "1px solid rgba(13,18,36,0.12)",
                      background: "#FFFFFF",
                      boxSizing: "border-box",
                      opacity: field,
                    }}
                  >
                    <div style={{ position: "absolute", left: 10, top: 25 }}>
                      <Orb size={28} style={orbStyle} />
                    </div>
                    <div style={{ position: "absolute", left: 48, top: 11, opacity: contents }}>
                      <TypeBlock
                        id="request"
                        lines={REQUEST_LINES}
                        startFrame={T.typeRequest}
                        cps={CHAT_CPS}
                        width={284}
                        fontFamily={FONT_FAMILY}
                        fontSize={20}
                        fontWeight={500}
                        lineHeight={1.45}
                      />
                    </div>
                    <div style={{ position: "absolute", left: 338, top: 28 }}>
                      <MicIcon size={22} />
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        left: 362,
                        top: 23,
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        background: send > 0 ? `rgba(13,18,36,${0.12 + 0.88 * send})` : "rgba(13,18,36,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transform: `scale(${1 + 0.04 * Math.sin(Math.PI * send)})`,
                      }}
                    >
                      <SendIcon size={20} color={send > 0.5 ? "#FFFFFF" : INK} />
                    </div>
                  </div>
                </Card>

                {/* ---------- Company Brain ---------- */}
                <Card guard="card-brain" box={BRAIN} frame={frame} popRange={T.cardIn(1)} skipPop={skip}>
                  <CardTitle>Company Brain</CardTitle>
                  <Skeleton top={74} widths={[260, 340, 300, 340, 200, 280]} opacity={skel(filled(T.brainFill))} gap={34} />
                  <div style={{ opacity: filled(T.brainFill) }}>
                    <div style={{ position: "absolute", left: PAD, top: 58 }}>
                      <Chip guard="chip-drive" logo={<Logo id="drive" available={has("drive")} />} label="Invoice policy.pdf" labelStyle={TEXT.body} height={50} />
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        left: PAD,
                        top: 124,
                        width: BRAIN.w - 2 * PAD,
                        height: 184,
                        borderRadius: 14,
                        border: "1px solid rgba(13,18,36,0.1)",
                        background: "#FFFFFF",
                        boxSizing: "border-box",
                      }}
                    >
                      {[300, 250].map((w, i) => (
                        <div key={i} aria-hidden style={{ position: "absolute", left: 18, top: 22 + i * 26, width: w, height: 10, borderRadius: 5, background: "#E6E9EE" }} />
                      ))}
                      <div style={{ position: "absolute", left: 12, top: 74, width: 340, height: 36 }}>
                        <div
                          aria-hidden
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 3,
                            height: 30,
                            width: 312,
                            borderRadius: 6,
                            background: BRAND_LIME,
                            opacity: 0.42,
                            transformOrigin: "left center",
                            transform: `scaleX(${progress(frame, T.highlight[0], T.highlight[1])})`,
                          }}
                        />
                        <div style={{ ...TEXT.body, position: "absolute", left: 6, top: 4, whiteSpace: "nowrap" }}>Over 10,000 needs approval.</div>
                      </div>
                      {[320, 280, 180].map((w, i) => (
                        <div key={i} aria-hidden style={{ position: "absolute", left: 18, top: 124 + i * 22, width: w, height: 10, borderRadius: 5, background: "#E6E9EE" }} />
                      ))}
                    </div>
                  </div>
                </Card>

                {/* ---------- agent team ---------- */}
                <div style={{ ...TEXT.label, position: "absolute", left: TEAM_LABEL.x, top: TEAM_LABEL.y - 2, opacity: progress(frame, T.leadPulse[0] - 12, T.leadPulse[0] + 6) * contents }}>
                  Agent team
                </div>
                <Card guard="lead-pill" box={LEAD} frame={frame} popRange={T.cardIn(2)} skipPop={skip} radius={48}>
                  <div style={{ position: "absolute", left: 12, top: 12, transform: `scale(${1 + 0.03 * Math.sin(Math.PI * (within(frame, T.leadPulse) ? leadHalo : 0))})` }}>
                    <Orb size={72} haloPulse={contents * leadHalo} style={orbStyle} />
                  </div>
                  <div style={{ ...TEXT.title, position: "absolute", left: 100, top: 31 }}>Space</div>
                  <div style={{ position: "absolute", right: 26, top: 37 }}>
                    <PauseGlyph opacity={calm} />
                  </div>
                </Card>

                {[
                  { key: "invoice", box: INVOICE, title: "Invoice Agent", fill: T.fillInvoice, i: 3 },
                  { key: "policy", box: POLICY, title: "Policy Agent", fill: T.fillPolicy, i: 4 },
                ].map((a) => {
                  const f = filled(a.fill);
                  return (
                    <Card key={a.key} guard={`card-${a.key}`} box={a.box} frame={frame} popRange={T.cardIn(a.i)} skipPop={skip}>
                      <Skeleton top={30} widths={[220, 300, 260]} opacity={skel(f)} gap={36} />
                      <div style={{ opacity: f }}>
                        <div style={{ position: "absolute", left: PAD, top: 18 }}>
                          <Orb size={44} haloPulse={wake} style={orbStyle} />
                        </div>
                        <div style={{ ...TEXT.title, position: "absolute", left: 78, top: 24 }}>{a.title}</div>
                      </div>
                      <div style={{ position: "absolute", left: PAD, top: 96, display: "flex", gap: 10, opacity: contents }}>
                        {a.key === "invoice" ? (
                          <>
                            <Chip
                              guard="chip-gmail"
                              logo={<Logo id="gmail" available={has("gmail")} />}
                              label="Read inbox"
                              opacity={filled(T.gmailChip)}
                              transform={`translateY(${8 * (1 - filled(T.gmailChip))}px)`}
                              badge={<StatusBadge frame={frame} spin={T.gmailSpin} show={T.gmailSpin[0]} />}
                            />
                            <Chip
                              guard="chip-sheets"
                              logo={<Logo id="sheets" available={has("sheets")} />}
                              label="Read sheet"
                              opacity={filled(T.sheetsChip)}
                              transform={`translateY(${8 * (1 - filled(T.sheetsChip))}px)`}
                              badge={<StatusBadge frame={frame} spin={T.sheetsSpin} show={T.sheetsSpin[0]} />}
                            />
                          </>
                        ) : (
                          <>
                            <Chip
                              guard="chip-policy"
                              logo={<StackIcon size={24} />}
                              label="Search policy"
                              opacity={filled(T.policyChip)}
                              transform={`translateY(${8 * (1 - filled(T.policyChip))}px)`}
                              badge={<StatusBadge frame={frame} spin={T.policySpin} show={T.policySpin[0]} />}
                            />
                            <Chip
                              guard="chip-cite"
                              label="p. 4"
                              labelStyle={TEXT.mono}
                              opacity={filled(T.cite)}
                              transform={`translateY(${-10 * (1 - filled(T.cite))}px)`}
                            />
                          </>
                        )}
                      </div>
                    </Card>
                  );
                })}

                {/* ---------- Table ---------- */}
                <Card guard="card-table" box={TABLE} frame={frame} popRange={T.cardIn(5)} skipPop={skip}>
                  <CardTitle>Invoices</CardTitle>
                  <Skeleton top={74} widths={[300, 240, 320, 260, 200]} opacity={skel(filled(T.tableFill))} gap={40} />
                  <div style={{ opacity: filled(T.tableFill) }}>
                    {[
                      ["Vendor", TABLE_COLS.vendor],
                      ["Amount", TABLE_COLS.amount],
                      ["Status", TABLE_COLS.status],
                    ].map(([t, x]) => (
                      <div key={t as string} style={{ ...TEXT.label, position: "absolute", left: x as number, top: 62 }}>
                        {t}
                      </div>
                    ))}
                    <div aria-hidden style={{ position: "absolute", left: PAD, right: PAD, top: 96, height: 1, background: "rgba(13,18,36,0.1)" }} />
                  </div>
                  {ROWS.map((row, k) => {
                    const t = rowTimes[k];
                    const top = TABLE_ROW.top + k * TABLE_ROW.pitch;
                    const chip = pop(frame, t.chipAt, 12);
                    const flagged = k === 1 ? progress(frame, T.lift[0], T.lift[0] + 10) : 0;
                    const flip = k === 1 ? progress(frame, T.statusFlip[0], T.statusFlip[1]) : 0;
                    return (
                      <div key={row.vendor} style={{ position: "absolute", left: 0, top, width: TABLE.w, height: TABLE_ROW.h, opacity: contents }}>
                        <div
                          aria-hidden
                          style={{
                            position: "absolute",
                            left: PAD - 8,
                            right: PAD - 8,
                            top: 0,
                            bottom: 0,
                            borderRadius: 10,
                            background: `rgba(253,243,220,${0.6 * flagged * (1 - flip)})`,
                          }}
                        />
                        <TypeBlock
                          id={`row${k}-vendor`}
                          lines={[row.vendor]}
                          startFrame={t.vStart}
                          cps={TABLE_CPS}
                          width={COL_W.vendor}
                          fontFamily={FONT_FAMILY}
                          fontSize={20}
                          fontWeight={500}
                          style={{ position: "absolute", left: TABLE_COLS.vendor, top: 8 }}
                        />
                        <TypeBlock
                          id={`row${k}-amount`}
                          lines={[row.amount]}
                          startFrame={t.aStart}
                          cps={TABLE_CPS}
                          width={COL_W.amount}
                          fontFamily={MONO_FAMILY}
                          fontSize={18}
                          fontWeight={500}
                          lineHeight={1.6}
                          style={{ position: "absolute", left: TABLE_COLS.amount, top: 9 }}
                        />
                        <div style={{ position: "absolute", left: TABLE_COLS.status, top: 8, width: COL_W.status, height: 32, overflow: "visible" }}>
                          <div style={{ position: "absolute", left: 0, top: 0, opacity: chip.opacity * (1 - flip), transform: `translateY(${-10 * flip}px) scale(${frame >= t.chipAt ? chip.scale : 0})` }}>
                            <StatusChip kind={row.status} />
                          </div>
                          {flip > 0 ? (
                            <div style={{ position: "absolute", left: 0, top: 0, opacity: flip, transform: `translateY(${10 * (1 - flip)}px)` }}>
                              <StatusChip kind="approved" />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </Card>

                {/* ---------- delivery chip ---------- */}
                {delivery > 0 ? (
                  <div
                    style={{
                      position: "absolute",
                      left: DELIVERY.x,
                      top: DELIVERY.y,
                      width: DELIVERY.w,
                      height: DELIVERY.h,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 12,
                      opacity: delivery,
                      transform: `translateY(${-8 * (1 - delivery)}px) scale(${0.96 + 0.04 * delivery})`,
                    }}
                  >
                    <Chip guard="chip-slack" logo={<Logo id="slack" available={has("slack")} />} label="Sent to Finance" labelStyle={TEXT.title} height={56} />
                    <div style={{ transform: `scale(${frame >= T.deliveryCheck[0] ? deliveryCheck.scale : 0})`, opacity: deliveryCheck.opacity }}>
                      <MintCheck size={30} draw={progress(frame, T.deliveryCheck[0], T.deliveryCheck[1])} />
                    </div>
                  </div>
                ) : null}

                {/* ---------- Review ---------- */}
                <Card
                  guard="card-review"
                  box={REVIEW}
                  frame={frame}
                  popRange={T.cardIn(6)}
                  skipPop={skip}
                  background={approved > 0 ? `rgba(228,247,238,${approved})` : "#FFFFFF"}
                >
                  <CardTitle style={{ opacity: 1 - reviewFill }}>Review</CardTitle>
                  <CardTitle style={{ opacity: reviewFill * (1 - approved) }}>Needs your approval</CardTitle>
                  <div style={{ position: "absolute", left: PAD, top: 14, display: "flex", alignItems: "center", gap: 12, opacity: approved }}>
                    <MintCheck size={34} draw={approved} />
                    <span style={{ ...TEXT.title }}>Approved</span>
                  </div>
                  <Skeleton top={80} widths={[300, 220, 260]} opacity={skel(Math.max(reviewFill, reviewLine))} gap={36} />
                  <div style={{ ...TEXT.body, position: "absolute", left: PAD, top: 82, whiteSpace: "nowrap", opacity: reviewLine }}>
                    Northwind, 18,900, over limit
                  </div>
                  <div style={{ opacity: reviewFill * (1 - approved) }}>
                    <div
                      data-guard="btn-approve"
                      style={{
                        ...TEXT.title,
                        color: "#FFFFFF",
                        position: "absolute",
                        left: APPROVE_BTN.x - REVIEW.x,
                        top: APPROVE_BTN.y - REVIEW.y,
                        width: APPROVE_BTN.w,
                        height: APPROVE_BTN.h,
                        borderRadius: 16,
                        background: INK,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transform: `scale(${1 - 0.03 * pressed})`,
                      }}
                    >
                      Approve
                    </div>
                    <div
                      data-guard="btn-reject"
                      style={{
                        ...TEXT.title,
                        position: "absolute",
                        left: REJECT_BTN.x - REVIEW.x,
                        top: REJECT_BTN.y - REVIEW.y,
                        width: REJECT_BTN.w,
                        height: REJECT_BTN.h,
                        borderRadius: 16,
                        background: "#FFFFFF",
                        border: `2px solid ${INK}`,
                        boxSizing: "border-box",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      Reject
                    </div>
                  </div>
                </Card>

                {/* ---------- lifted row (shared element) ---------- */}
                {ghostOn ? (
                  <div
                    style={{
                      position: "absolute",
                      left: ghost.x,
                      top: ghost.y,
                      width: REVIEW_LINE.w,
                      height: REVIEW_LINE.h,
                      borderRadius: 12,
                      background: "#FFFFFF",
                      border: `1px solid ${AMBER_ACCENT}`,
                      boxSizing: "border-box",
                      boxShadow: `0 ${6 + 14 * ghost.lift}px ${16 + 20 * ghost.lift}px rgba(13,18,36,${0.08 + 0.08 * ghost.lift})`,
                      transform: `scale(${1 + 0.03 * ghost.lift})`,
                      opacity: ghostOpacity,
                    }}
                  >
                    <div style={{ ...TEXT.body, position: "absolute", left: TABLE_COLS.vendor - PAD + 10, top: 7, whiteSpace: "nowrap" }}>Northwind</div>
                    <div style={{ ...TEXT.mono, position: "absolute", left: TABLE_COLS.amount - PAD + 10, top: 9 }}>18,900</div>
                    <div style={{ position: "absolute", left: TABLE_COLS.status - PAD + 10, top: 6 }}>
                      <StatusChip kind="over" />
                    </div>
                  </div>
                ) : null}

                {/* ---------- pulses, above the cards ---------- */}
                <svg width={STAGE.w} height={STAGE.h} style={{ position: "absolute", inset: 0, overflow: "visible" }} aria-hidden>
                  <defs>
                    <radialGradient id="pulseGlow">
                      <stop offset="0%" stopColor={BRAND_LIME} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={BRAND_LIME} stopOpacity={0} />
                    </radialGradient>
                  </defs>
                  <g opacity={contents}>
                    <Pulse frame={frame} poly={LINES.req} range={T.reqPulse} />
                    <Pulse frame={frame} poly={LINES.inv} range={T.agentPulse} />
                    <Pulse frame={frame} poly={LINES.pol} range={T.agentPulse} />
                    <Pulse frame={frame} poly={LINES.brain} range={T.brainPulseOut} />
                    <Pulse frame={frame} poly={[...LINES.brain].reverse()} range={T.brainPulseBack} />
                    {ROWS.map((row, k) => (
                      <Pulse key={k} frame={frame} poly={dataPath(row.from, k)} range={T.dataPulse[k]} tail={0.4} />
                    ))}
                    <Pulse frame={frame} poly={LINES.req} range={T.ambient[0]} intensity={0.35} />
                    <Pulse frame={frame} poly={LINES.pol} range={T.ambient[1]} intensity={0.35} />
                    <Pulse frame={frame} poly={LINES.brain} range={T.ambient[2]} intensity={0.35} />
                  </g>
                </svg>

                {/* ---------- cursor ---------- */}
                <Cursor x={mix(start.x, target.x, mv)} y={mix(start.y, target.y, mv)} opacity={cursorOpacity * contents} pressed={pressed} />
              </div>
            ) : null}

            {endMark === "symbol" && frame >= T.endSymbol[0] ? (
              <div
                data-guard="symbol"
                style={{
                  position: "absolute",
                  left: 900,
                  top: 480,
                  width: 120,
                  height: 120,
                  transform: `scale(${pop(frame, T.endSymbol[0], T.endSymbol[1] - T.endSymbol[0]).scale})`,
                  opacity: pop(frame, T.endSymbol[0], T.endSymbol[1] - T.endSymbol[0]).opacity,
                }}
              >
                <BrandSymbol size={120} available={files.includes(LOGO_FILE)} />
              </div>
            ) : null}
          </LogoGuard>
        </ReadabilityGuard>
      </SafeAreaGuard>
    </AbsoluteFill>
  );
};

export { INK70, MINT, MINT_SOFT };
