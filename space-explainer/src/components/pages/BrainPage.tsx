import React from "react";
import { Img, staticFile } from "remotion";
import { CloudUpload, Globe, Link2, Share2 } from "lucide-react";
import { CHAT_CPS, FONT, UIN } from "../../theme";
import { PLACEHOLDERS as P } from "../../placeholders";
import { Sidebar, TopBar, UI } from "../chat/Sidebar";
import { PdfIcon } from "../PdfIcon";
import { Typewriter } from "../Typewriter";
import { PageHeader, READ, SourceChip, Tabs, text } from "./common";

/**
 * Brain page (light theme), from reference/ui/05-brain.png: Files, Connect
 * data (source tiles, a URL field and the sources being added), and the
 * Claims knowledge base with its Sources and Graph views. Native px layout,
 * exported for the camera and the cursor.
 */
export const BRAIN = {
  x: 485,
  w: 1184,
  tabsY: 212,
  /** Tab label centres (native px), for the cursor. */
  tabX: { kb: 544, files: 706, connect: 884 },
  // Files view
  fileRow0: 290,
  rowH: 66,
  // Connect data view
  tile: { x: 485, y: 280, w: 182, h: 112, gap: 14, cols: 3 },
  url: { x: 485, y: 540, w: 574, h: 50 },
  added: { x: 1090, y: 280, w: 579, rowY0: 352, rowH: 62 },
  // Knowledge base view
  kb: { x: 485, y: 270, w: 1184, h: 560 },
  useBtn: { x: 1474, y: 290, w: 170, h: 40 },
  innerTabs: { y: 352, sourcesX: 513, graphX: 610 },
};
export type Kind = "drive" | "sheets" | "web" | "slack" | "file" | "gmail";
export const TILES: { kind: Kind; label: string }[] = [
  { kind: "drive", label: "Google Drive" },
  { kind: "sheets", label: "Google Sheets" },
  { kind: "gmail", label: "Gmail" },
  { kind: "slack", label: "Slack" },
  { kind: "web", label: "Website" },
  { kind: "file", label: "File upload" },
];
export const tileCentre = (kind: Kind) => {
  const i = TILES.findIndex((t) => t.kind === kind);
  const T = BRAIN.tile;
  return { x: T.x + (i % T.cols) * (T.w + T.gap) + T.w / 2, y: T.y + Math.floor(i / T.cols) * (T.h + T.gap) + T.h / 2 };
};

export type BrainView = "files" | "connect" | "kb";
export type BrainState = {
  view: BrainView;
  /** Files view: S1 row highlight (the chip from Scene 4 lands here). */
  s1Highlight: number;
  /** Connect data: tile pressed (0 to 1) per tile index. */
  tilePressed: number[];
  /** Per source: row appear, progress 0 to 1 (ready at 1). */
  sources: { appear: number; progress: number }[];
  urlFocus: number;
  urlTypeStart: number;
  /** Knowledge base: inner tab 0 sources, 1 graph; graph build 0 to 1. */
  inner: 0 | 1;
  graph: number;
  usePressed: number;
};

const LOGO: Partial<Record<Kind, string>> = { drive: "logos/google-drive.svg", sheets: "logos/google-sheets.svg", gmail: "logos/gmail.svg", slack: "logos/slack.svg" };

/** Source type icon: official logos, or original neutral icons for Website, Files and uploads. */
export const SourceIcon: React.FC<{ kind: Kind; size?: number }> = ({ kind, size = 22 }) => {
  const logo = LOGO[kind];
  if (logo) return <Img data-guard="brand" src={staticFile(logo)} style={{ width: size, height: size, objectFit: "contain" }} />;
  if (kind === "web") return <Globe size={size * 0.9} color={UI.secondary} strokeWidth={1.7} />;
  return <PdfIcon size={size * 1.15} />;
};

const Tile: React.FC<{ kind: Kind; label: string; i: number; pressed: number; added: boolean }> = ({ kind, label, i, pressed, added }) => {
  const T = BRAIN.tile;
  return (
    <div
      style={{
        position: "absolute",
        left: T.x + (i % T.cols) * (T.w + T.gap),
        top: T.y + Math.floor(i / T.cols) * (T.h + T.gap),
        width: T.w,
        height: T.h,
        boxSizing: "border-box",
        borderRadius: 14,
        border: `1.5px solid ${added ? "rgba(124,98,240,0.55)" : UI.line}`,
        background: added ? "#FAF9FF" : "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        transform: `scale(${1 - 0.04 * pressed})`,
        fontFamily: FONT.sans,
        fontSize: UIN.button,
        fontWeight: 600,
        color: UI.text,
      }}
    >
      {kind === "file" ? <CloudUpload size={28} color={UI.secondary} strokeWidth={1.7} /> : <SourceIcon kind={kind} size={30} />}
      {label}
    </div>
  );
};

const Counter: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div style={{ padding: "4px 12px", borderRadius: 8, border: `1px solid ${UI.chipBorder}`, fontFamily: FONT.sans, fontSize: UIN.helper, color: UI.secondary, whiteSpace: "nowrap" }}>
    {label} <span style={{ fontWeight: 700, color: UI.text }}>{value}</span>
  </div>
);

/** Graph view: nodes link up around the claim. Positions relative to the graph box. */
const NODES: { id: string; x: number; y: number }[] = [
  { id: "Claim", x: 560, y: 190 },
  { id: "Policy", x: 300, y: 90 },
  { id: "Insured", x: 820, y: 90 },
  { id: "Excess", x: 250, y: 300 },
  { id: "FAQ", x: 870, y: 300 },
  { id: "Escalations", x: 560, y: 365 },
];
const LINKS: [string, string][] = [
  ["Claim", "Policy"],
  ["Claim", "Insured"],
  ["Policy", "Excess"],
  ["Claim", "FAQ"],
  ["Claim", "Escalations"],
  ["Insured", "FAQ"],
];
const GraphView: React.FC<{ p: number }> = ({ p }) => {
  const at = (id: string) => NODES.find((n) => n.id === id)!;
  return (
    <div data-guard="uitext" data-guard-read="1" data-guard-label="Brain graph" style={{ position: "absolute", left: 28, top: 120, width: 1128, height: 420 }}>
      <svg width={1128} height={420} style={{ position: "absolute", left: 0, top: 0 }}>
        {LINKS.map(([a, b], i) => {
          const A = at(a);
          const B = at(b);
          const k = Math.min(1, Math.max(0, p * 1.6 - 0.25 - i * 0.08));
          return <line key={`${a}-${b}`} x1={A.x} y1={A.y} x2={A.x + (B.x - A.x) * k} y2={A.y + (B.y - A.y) * k} stroke="#B9AEF5" strokeWidth={2.5} strokeLinecap="round" opacity={k > 0 ? 1 : 0} />;
        })}
      </svg>
      {NODES.map((n, i) => {
        const o = Math.min(1, Math.max(0, p * 2.2 - i * 0.12));
        const centre = n.id === "Claim";
        return (
          <div
            key={n.id}
            style={{
              position: "absolute",
              left: n.x,
              top: n.y,
              transform: `translate(-50%, -50%) scale(${0.8 + 0.2 * o})`,
              opacity: o,
              padding: "10px 18px",
              borderRadius: 999,
              background: centre ? UI.lilacBg : "#FFFFFF",
              border: `1.5px solid ${centre ? UI.accent : UI.line}`,
              boxShadow: "0 6px 16px rgba(20,24,60,0.08)",
              fontFamily: FONT.sans,
              fontSize: READ + 1,
              fontWeight: 600,
              color: centre ? UI.lilacText : UI.text,
              whiteSpace: "nowrap",
            }}
          >
            {n.id}
          </div>
        );
      })}
    </div>
  );
};

export const BrainPage: React.FC<{ s: BrainState }> = ({ s }) => {
  const src = P.brain.sources;
  const nDone = s.sources.filter((x) => x.progress >= 1).length;
  const passages = s.sources.reduce((a, x, i) => a + Math.round(src[i].passages * Math.min(1, Math.max(0, x.progress))), 0);
  const tabIndex = s.view === "kb" ? 0 : s.view === "files" ? 2 : 4;
  const A = BRAIN.added;
  return (
    <div style={{ position: "absolute", inset: 0, background: UI.bg }}>
      <Sidebar active="brain" />
      <TopBar page="Brain" />
      <PageHeader x={BRAIN.x} title="Brain" desc="What the copilot knows: knowledge bases, the graph built from your documents, your files, and sources synced from your tools." descWidth={760} />
      <Tabs x={BRAIN.x} y={BRAIN.tabsY} tabs={[{ label: "Knowledge bases" }, { label: "Graph" }, { label: "Files" }, { label: "Codebases" }, { label: "Connect data" }]} active={tabIndex} />

      {s.view === "files" ? (
        <>
          {P.brain.files.map((f, i) => (
            <div
              key={f}
              data-guard="uitext"
              data-guard-read="1"
              data-guard-label={`File ${f}`}
              style={{
                position: "absolute",
                left: BRAIN.x,
                top: BRAIN.fileRow0 + i * BRAIN.rowH,
                width: BRAIN.w,
                height: 54,
                boxSizing: "border-box",
                borderRadius: 12,
                border: `1.5px solid ${i === 0 && s.s1Highlight > 0 ? `rgba(124,98,240,${0.6 * s.s1Highlight})` : UI.line}`,
                background: i === 0 ? `rgba(237,233,255,${s.s1Highlight})` : "#FFFFFF",
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "0 18px",
                fontFamily: FONT.sans,
              }}
            >
              <PdfIcon size={28} />
              <span style={{ fontSize: READ, fontWeight: 600, color: UI.text, width: 420 }}>{f}</span>
              <span style={{ fontSize: UIN.helper, color: UI.secondary, width: 160 }}>Claims shared drive</span>
              <span style={{ fontSize: UIN.helper, color: UI.greenText }}>Ready</span>
              <span style={{ marginLeft: "auto", opacity: i === 0 && s.s1Highlight <= 0 ? 0 : 1 }} data-guard="box" data-guard-label={`Brain chip S${i + 1}`}>
                <SourceChip id={`S${i + 1}`} active={i === 0 ? s.s1Highlight : 0} />
              </span>
            </div>
          ))}
        </>
      ) : null}

      {s.view === "connect" ? (
        <>
          <div style={{ ...text, left: BRAIN.tile.x, top: 248, fontSize: UIN.helper, color: UI.secondary }}>Add a source. Answers cite what it holds.</div>
          {TILES.map((tl, i) => (
            <Tile key={tl.kind} kind={tl.kind} label={tl.label} i={i} pressed={s.tilePressed[i] ?? 0} added={src.some((x, j) => (x.kind === tl.kind || (tl.kind === "file" && x.kind === "file")) && (s.sources[j]?.appear ?? 0) > 0.5)} />
          ))}
          {/* Website URL field */}
          <div
            data-guard="uitext"
            data-guard-read="1"
            data-guard-label="Website URL"
            style={{ position: "absolute", left: BRAIN.url.x, top: BRAIN.url.y, width: BRAIN.url.w, height: BRAIN.url.h, boxSizing: "border-box", borderRadius: 10, border: `1.5px solid ${s.urlFocus > 0 ? `rgba(124,98,240,${0.3 + 0.4 * s.urlFocus})` : UI.line}`, boxShadow: s.urlFocus > 0 ? `0 0 0 ${4 * s.urlFocus}px rgba(124,98,240,${0.35 * s.urlFocus})` : undefined, display: "flex", alignItems: "center", gap: 10, padding: "0 14px", fontFamily: FONT.sans }}
          >
            <Link2 size={17} color={UI.secondary} />
            {s.urlFocus > 0 ? (
              <Typewriter lines={[P.brain.url]} cps={CHAT_CPS} startFrame={s.urlTypeStart} seed="brain-url" caretColor={UI.text} style={{ fontSize: READ, color: UI.text }} />
            ) : (
              <span style={{ fontSize: UIN.helper, color: UI.placeholder }}>Paste a website address to crawl</span>
            )}
          </div>
          {/* Sources being added */}
          <div style={{ position: "absolute", left: A.x, top: A.y, width: A.w, height: 470, boxSizing: "border-box", borderRadius: 14, border: `1px solid ${UI.line}` }}>
            <div style={{ ...text, left: 20, top: 18, fontSize: READ + 1, fontWeight: 700 }}>{P.brain.kbName}</div>
            <div style={{ position: "absolute", right: 18, top: 14, display: "flex", gap: 8 }}>
              <Counter label="Sources" value={nDone} />
              <Counter label="Passages" value={passages} />
            </div>
          </div>
          {src.map((x, i) => {
            const r = s.sources[i];
            if (!r || r.appear <= 0) return null;
            const ready = r.progress >= 1;
            return (
              <div
                key={x.name}
                data-guard="uitext"
                data-guard-read="1"
                data-guard-label={`Source ${x.name}`}
                style={{ position: "absolute", left: A.x + 14, top: A.rowY0 + i * A.rowH, width: A.w - 28, height: 52, boxSizing: "border-box", borderRadius: 10, background: "#FFFFFF", border: `1px solid ${UI.line}`, display: "flex", alignItems: "center", gap: 12, padding: "0 14px", opacity: r.appear, transform: `translateY(${(1 - r.appear) * 12}px)`, fontFamily: FONT.sans }}
              >
                <div style={{ width: 26, display: "flex", justifyContent: "center" }}>
                  <SourceIcon kind={x.kind} size={22} />
                </div>
                <span style={{ fontSize: READ, fontWeight: 600, color: UI.text, width: 268, overflow: "hidden", textOverflow: "clip", whiteSpace: "nowrap" }}>{x.name}</span>
                <div style={{ width: 90, height: 6, borderRadius: 3, background: UI.line, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(1, r.progress) * 100}%`, height: "100%", background: ready ? UI.green : UI.accent }} />
                </div>
                <span style={{ fontSize: UIN.helper, color: ready ? UI.greenText : UI.secondary, marginLeft: "auto", whiteSpace: "nowrap" }}>{ready ? x.done : x.kind === "web" ? "Crawling" : "Indexing"}</span>
              </div>
            );
          })}
        </>
      ) : null}

      {s.view === "kb" ? (
        <div style={{ position: "absolute", left: BRAIN.kb.x, top: BRAIN.kb.y, width: BRAIN.kb.w, height: BRAIN.kb.h, boxSizing: "border-box", borderRadius: 14, border: `1px solid ${UI.line}` }}>
          <div style={{ ...text, left: 28, top: 22, fontSize: READ + 3, fontWeight: 700 }}>{P.brain.kbName}</div>
          <div style={{ position: "absolute", left: 230, top: 22, display: "flex", gap: 8 }}>
            <Counter label="Sources" value={P.brain.totalSources} />
            <Counter label="Passages" value={P.brain.totalPassages} />
          </div>
          <div
            style={{ position: "absolute", left: BRAIN.useBtn.x - BRAIN.kb.x, top: BRAIN.useBtn.y - BRAIN.kb.y, width: BRAIN.useBtn.w, height: BRAIN.useBtn.h, borderRadius: 10, background: s.usePressed > 0.3 ? "#2A3147" : UI.primaryBg, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: FONT.sans, fontSize: UIN.button, fontWeight: 600, color: UI.primaryText, transform: `scale(${1 - 0.04 * s.usePressed})`, whiteSpace: "nowrap" }}
          >
            <Share2 size={15} color={UI.primaryText} />
            {P.brain.useInPlaybook}
          </div>
          {/* Inner tabs */}
          <div style={{ position: "absolute", left: 28, top: BRAIN.innerTabs.y - BRAIN.kb.y, display: "flex", gap: 22 }}>
            {["Sources", "Graph"].map((l, i) => (
              <div key={l} style={{ paddingBottom: 8, borderBottom: `2px solid ${i === s.inner ? UI.text : "transparent"}`, fontFamily: FONT.sans, fontSize: UIN.tabs, fontWeight: i === s.inner ? 700 : 400, color: i === s.inner ? UI.text : UI.secondary }}>
                {l}
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", left: 28, right: 28, top: BRAIN.innerTabs.y - BRAIN.kb.y + 32, height: 1, background: UI.line }} />
          {s.inner === 0
            ? src.map((x, i) => (
                <div
                  key={x.name}
                  data-guard="uitext"
                  data-guard-read="1"
                  data-guard-label={`KB source ${x.name}`}
                  style={{ position: "absolute", left: 28, top: 126 + i * 66, width: BRAIN.kb.w - 56, height: 54, boxSizing: "border-box", borderRadius: 10, border: `1px solid ${UI.line}`, display: "flex", alignItems: "center", gap: 16, padding: "0 18px", fontFamily: FONT.sans }}
                >
                  <div style={{ width: 28, display: "flex", justifyContent: "center" }}>
                    <SourceIcon kind={x.kind} size={24} />
                  </div>
                  <span style={{ fontSize: READ, fontWeight: 600, color: UI.text, width: 420 }}>{x.name}</span>
                  <span style={{ fontSize: UIN.helper, color: UI.secondary, width: 220 }}>{x.type}</span>
                  <span style={{ fontSize: UIN.helper, color: UI.secondary, width: 140 }}>{x.passages} passages</span>
                  <span style={{ fontSize: UIN.helper, color: UI.greenText, marginLeft: "auto" }}>{x.done}</span>
                </div>
              ))
            : <GraphView p={s.graph} />}
        </div>
      ) : null}
    </div>
  );
};
