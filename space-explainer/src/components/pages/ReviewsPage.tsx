import React from "react";
import { Img, staticFile } from "remotion";
import { ArrowLeft, Check, Flag } from "lucide-react";
import { CHAT_CPS, COLOR, FONT, UIN, type OrbPaletteKey } from "../../theme";
import { PLACEHOLDERS as P } from "../../placeholders";
import { Sidebar, TopBar, UI } from "../chat/Sidebar";
import { SpaceOrb } from "../SpaceOrb";
import { HumanGlyph } from "../HumanGlyph";
import { Typewriter } from "../Typewriter";
import { PageHeader, READ, Tabs, text } from "./common";

/** Layout (native px) for camera and cursor targets. */
export const REVIEWS = {
  item: { x: 485, y: 262, w: 1184, h: 84 },
  findingsY: 300,
  cardW: 380,
  cardGap: 22,
  reviewerY: 520,
  note: { x: 485, y: 570, w: 1184, h: 70 },
  approve: { x: 1500, y: 660, w: 169, h: 42 },
  decline: { x: 1350, y: 660, w: 136, h: 42 },
  strip: { x: 485, y: 730, w: 1184, h: 120 },
};
export const cardX = (i: number) => REVIEWS.item.x + i * (REVIEWS.cardW + REVIEWS.cardGap);

export type ReviewsState = {
  itemAppear: number;
  itemPressed: number;
  detail: number;
  findings: number[];
  glyph: number;
  noteStart: number;
  noteFocus: number;
  approvePressed: number;
  approveHalo: number;
  approved: number;
  strip: number;
  stripSteps: number[]; // REVIEW, IF, SEND, NOTIFY lit
  email: number;
  slack: number;
  clock: number;
};

const FINDINGS: { agent: string; role: string; palette: OrbPaletteKey; text: string; flag?: string }[] = [
  { agent: "Nora", role: "Intake", palette: "nora", text: "Claim CL-7305 | James Whitfield | Kitchen water damage | Estimate $1,840" },
  { agent: "Theo", role: "Policy", palette: "theo", text: "Covered under Section 4.2 | Excess $250" },
  { agent: "Owen", role: "Evidence", palette: "owen", text: "3 photos and 1 plumber invoice found", flag: "Invoice date does not match the date of loss" },
];

const StripStep: React.FC<{ badge: string; label: string; lit: number; tone: "amber" | "grey" | "lime" }> = ({ badge, label, lit, tone }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: "#262626", border: `1.5px solid ${lit > 0.5 ? "#3E6B4A" : "#3a3a3a"}`, whiteSpace: "nowrap" }}>
    <span style={{ padding: "1px 8px", borderRadius: 6, background: tone === "amber" ? "#3E3015" : tone === "lime" ? "#30351A" : "#3a3a3a", color: tone === "amber" ? COLOR.amber : tone === "lime" ? "#C9D86A" : "#e6e6e6", fontFamily: FONT.sans, fontSize: UIN.helper, fontWeight: 700 }}>{badge}</span>
    <span style={{ fontFamily: FONT.sans, fontSize: READ, color: UI.text }}>{label}</span>
    <div style={{ width: 20, height: 20, borderRadius: 10, background: "#3C8F52", display: "flex", alignItems: "center", justifyContent: "center", opacity: lit, transform: `scale(${0.6 + 0.4 * lit})` }}>
      <Check size={13} color="#fff" strokeWidth={3} />
    </div>
  </div>
);

export const ReviewsPage: React.FC<{ s: ReviewsState }> = ({ s }) => {
  const list = 1 - s.detail;
  return (
    <div style={{ position: "absolute", inset: 0, background: UI.bg }}>
      <Sidebar active="explore" />
      <TopBar page="Reviews" bellBadge={s.approved > 0.5 ? 0 : 1} />
      {/* List view (reference/ui/10-reviews.png, with one item waiting) */}
      {list > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: list }}>
          <PageHeader x={485} title="Reviews" desc="Playbook steps and agents' work waiting for a person to approve or decline. Any one reviewer's answer counts." />
          <Tabs x={485} y={204} tabs={[{ label: "Waiting for me", badge: 1 }, { label: "All assigned to me" }, { label: "My requests" }]} active={0} />
          <div
            data-guard="uitext"
            data-guard-label="Review item"
            style={{ position: "absolute", left: REVIEWS.item.x, top: REVIEWS.item.y, width: REVIEWS.item.w, height: REVIEWS.item.h, boxSizing: "border-box", borderRadius: 14, background: s.itemPressed > 0 ? "#2e2e2e" : "#262626", border: "1px solid #3a3a3a", display: "flex", alignItems: "center", gap: 16, padding: "0 22px", opacity: s.itemAppear, transform: `translateY(${(1 - s.itemAppear) * 10}px)` }}
          >
            <span style={{ padding: "2px 9px", borderRadius: 6, background: "#3E3015", color: COLOR.amber, fontFamily: FONT.sans, fontSize: UIN.helper, fontWeight: 700 }}>REVIEW</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontFamily: FONT.sans, fontSize: READ, fontWeight: 600, color: UI.text }}>{P.review.item}</span>
              <span style={{ fontFamily: FONT.sans, fontSize: UIN.helper, color: "#a8a8a8" }}>{P.review.itemSub}</span>
            </div>
            <span style={{ marginLeft: "auto", fontFamily: FONT.sans, fontSize: UIN.helper, color: "#bdbdbd" }}>{P.review.requested}</span>
          </div>
        </div>
      ) : null}
      {/* Detail view */}
      {s.detail > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: s.detail, transform: `translateX(${(1 - s.detail) * 30}px)` }}>
          <div style={{ position: "absolute", left: 485, top: 70, display: "flex", alignItems: "center", gap: 8, fontFamily: FONT.sans, fontSize: UIN.button, color: "#bdbdbd" }}>
            <ArrowLeft size={15} color="#bdbdbd" />
            Reviews
          </div>
          <div style={{ ...text, left: 485, top: 100, fontSize: UIN.pageTitle, fontWeight: 600 }}>{P.review.item}</div>
          <div style={{ ...text, left: 485, top: 140, fontSize: UIN.helper, color: "#a8a8a8" }}>{P.review.itemSub}</div>
          <div style={{ ...text, left: 485, top: 262, fontSize: UIN.button, fontWeight: 700, color: "#d8d8d8" }}>Findings</div>
          {FINDINGS.map((f, i) =>
            s.findings[i] > 0 ? (
              <div
                key={f.agent}
                data-guard="uitext"
                data-guard-read="1"
                data-guard-label={`Finding ${f.role}`}
                style={{ position: "absolute", left: cardX(i), top: REVIEWS.findingsY, width: REVIEWS.cardW, minHeight: 170, boxSizing: "border-box", padding: "16px 18px", borderRadius: 14, background: "#262626", border: "1px solid #3a3a3a", fontFamily: FONT.sans, opacity: s.findings[i], filter: s.findings[i] < 1 ? `blur(${(1 - s.findings[i]) * 8}px)` : undefined, transform: `translateY(${(1 - s.findings[i]) * 12}px)` }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <SpaceOrb size={26} palette={f.palette} timeOffset={s.clock} />
                  <span style={{ fontSize: UIN.button, fontWeight: 700, color: UI.text }}>{f.role}</span>
                  <span style={{ fontSize: UIN.button, color: UI.muted }}>{f.agent}</span>
                </div>
                <div style={{ fontSize: READ, lineHeight: 1.45, color: UI.text }}>{f.text}</div>
                {f.flag ? (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 10, padding: "4px 10px", borderRadius: 8, background: "#34363b", border: "1px solid #4a4d54", fontSize: READ, color: "#e2e4ea", whiteSpace: "nowrap" }}>
                    <Flag size={15} color="#cfd2da" />
                    {f.flag}
                  </div>
                ) : null}
              </div>
            ) : null,
          )}
          {/* Reviewer: the person who decides (amber appears only here) */}
          <div style={{ position: "absolute", left: 485, top: REVIEWS.reviewerY - 12, display: "flex", alignItems: "center", gap: 12, opacity: Math.max(0.4, s.glyph) }}>
            <div style={{ opacity: s.glyph, transform: `scale(${0.8 + 0.2 * s.glyph})` }}>
              <HumanGlyph size={26} style={{ width: 40, height: 40 }} />
            </div>
            <span style={{ fontFamily: FONT.sans, fontSize: READ, fontWeight: 600, color: UI.text }}>{P.claimsOfficer}</span>
            <span style={{ fontFamily: FONT.sans, fontSize: UIN.helper, color: UI.muted }}>Claims Officer, reviewer</span>
          </div>
          <div
            data-guard="uitext"
            data-guard-read="1"
            data-guard-label="Review note"
            style={{ position: "absolute", left: REVIEWS.note.x, top: REVIEWS.note.y, width: REVIEWS.note.w, height: REVIEWS.note.h, boxSizing: "border-box", padding: "12px 16px", borderRadius: 12, background: "#1d1d1d", border: `1.5px solid ${s.noteFocus > 0.5 ? "#8a8a8a" : UI.chipBorder}` }}
          >
            {s.noteFocus > 0 ? (
              <Typewriter lines={[P.review.note]} cps={CHAT_CPS} startFrame={s.noteStart} seed="review-note" caretColor={UI.text} style={{ fontFamily: FONT.sans, fontSize: READ + 1, color: UI.text }} />
            ) : (
              <span style={{ fontFamily: FONT.sans, fontSize: UIN.helper, color: "#8a8a8a" }}>Add a note for the record</span>
            )}
          </div>
          <div style={{ position: "absolute", left: REVIEWS.decline.x, top: REVIEWS.decline.y, width: REVIEWS.decline.w, height: REVIEWS.decline.h, borderRadius: 10, border: `1px solid ${UI.chipBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans, fontSize: UIN.button, color: "#d0d0d0" }}>Decline</div>
          <div
            style={{
              position: "absolute",
              left: REVIEWS.approve.x,
              top: REVIEWS.approve.y,
              width: REVIEWS.approve.w,
              height: REVIEWS.approve.h,
              borderRadius: 10,
              background: s.approved > 0.5 ? "#2F6B42" : "#FFFFFF",
              color: s.approved > 0.5 ? "#E8FBEA" : "#111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: FONT.sans,
              fontSize: UIN.button,
              fontWeight: 700,
              transform: `scale(${1 - 0.04 * s.approvePressed})`,
              boxShadow: s.approveHalo > 0 ? `0 0 0 ${4 + 8 * s.approveHalo}px rgba(242,164,58,${0.35 * (1 - s.approveHalo * 0.4)}), 0 0 30px rgba(255,226,179,${0.5 * s.approveHalo})` : undefined,
            }}
          >
            {s.approved > 0.5 ? <Check size={16} color="#E8FBEA" strokeWidth={3} /> : null}
            {s.approved > 0.5 ? "Approved" : "Approve"}
          </div>
          {/* The playbook continues: REVIEW approved, IF, SEND, NOTIFY */}
          {s.strip > 0 ? (
            <div data-guard="uitext" data-guard-read="1" data-guard-label="Playbook strip" style={{ position: "absolute", left: REVIEWS.strip.x, top: REVIEWS.strip.y, width: REVIEWS.strip.w, opacity: s.strip, transform: `translateY(${(1 - s.strip) * 14}px)` }}>
              <div style={{ fontFamily: FONT.sans, fontSize: UIN.helper, color: "#a8a8a8", marginBottom: 10 }}>{P.playbook.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <StripStep badge="REVIEW" label="Approved by Emily" lit={s.stripSteps[0]} tone="amber" />
                <div style={{ width: 22, height: 2, background: s.stripSteps[1] > 0.5 ? "#8fd694" : "#555" }} />
                <StripStep badge="IF" label="approved" lit={s.stripSteps[1]} tone="grey" />
                <div style={{ width: 22, height: 2, background: s.stripSteps[2] > 0.5 ? "#8fd694" : "#555" }} />
                <StripStep badge="SEND" label="settlement via Gmail" lit={s.stripSteps[2]} tone="lime" />
                <div style={{ width: 22, height: 2, background: s.stripSteps[3] > 0.5 ? "#8fd694" : "#555" }} />
                <StripStep badge="NOTIFY" label="Slack" lit={s.stripSteps[3]} tone="grey" />
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 14 }}>
                {s.email > 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "#f4f4f4", color: "#1d1d1d", opacity: s.email, transform: `translateY(${(1 - s.email) * 10}px)`, fontFamily: FONT.sans, fontSize: READ, whiteSpace: "nowrap" }}>
                    <Img data-guard="brand" src={staticFile("logos/gmail.svg")} style={{ width: 22, height: 17, objectFit: "contain" }} />
                    {P.review.emailSent}
                  </div>
                ) : null}
                {s.slack > 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "#2a2a2a", border: `1px solid ${UI.chipBorder}`, color: UI.text, opacity: s.slack, transform: `translateY(${(1 - s.slack) * 10}px)`, fontFamily: FONT.sans, fontSize: READ, whiteSpace: "nowrap" }}>
                    <Img data-guard="brand" src={staticFile("logos/slack.svg")} style={{ width: 20, height: 20, objectFit: "contain" }} />
                    {P.review.slack}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
