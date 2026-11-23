import React from "react";
import { Img, staticFile } from "remotion";
import { BookOpen } from "lucide-react";
import { FONT, UIN } from "../../theme";
import { PLACEHOLDERS as P } from "../../placeholders";
import { Sidebar, TopBar, UI } from "../chat/Sidebar";
import { PdfIcon } from "../PdfIcon";
import { PageHeader, READ, Segmented, SearchBox, SourceChip, Tabs, text, WhiteButton } from "./common";

/** Layout (native px), so the camera can frame the file list. */
export const BRAIN = { box: { x: 485, y: 391, w: 1184, h: 360 }, fileRow0: 492, rowH: 74 };

export type BrainState = {
  files: { appear: number; progress: number; ready: boolean }[];
  passages: number;
  drive: number;
  cite: number;
  emptyFade: number;
};

/** Brain page, Knowledge bases tab, rebuilt from reference/ui/05-brain.png; the empty box becomes the claims knowledge base. */
export const BrainPage: React.FC<{ s: BrainState }> = ({ s }) => {
  const b = BRAIN.box;
  const fileCount = s.files.filter((f) => f.appear > 0.5).length;
  return (
    <div style={{ position: "absolute", inset: 0, background: UI.bg }}>
      <Sidebar active="brain" />
      <TopBar page="Brain" />
      <PageHeader x={485} title="Brain" desc="What the copilot knows: knowledge bases, the graph built from your documents, your files, your code, and folders synced from your cloud drives." />
      <Tabs x={485} y={212} tabs={[{ label: "Knowledge bases" }, { label: "Graph" }, { label: "Files" }, { label: "Codebases" }, { label: "Connect data" }]} active={0} />
      <Segmented x={485} y={270} items={["All", "Personal", "Group", "Organization"]} />
      <WhiteButton x={1669} y={274} label="New knowledge base" right />
      <SearchBox x={485} y={335} w={384} placeholder="Search knowledge bases…" />
      <div style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h, borderRadius: 14, border: "1px dashed #3d3d3d", boxSizing: "border-box" }}>
        {/* Empty state, fading out as the first file arrives */}
        <div style={{ position: "absolute", inset: 0, opacity: 1 - s.emptyFade, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <div style={{ width: 62, height: 62, borderRadius: 14, border: `1px solid ${UI.chipBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BookOpen size={26} color="#e6e6e6" />
          </div>
          <div style={{ fontFamily: FONT.sans, fontSize: UIN.button, fontWeight: 700, color: UI.text }}>No knowledge bases yet</div>
          <div style={{ fontFamily: FONT.sans, fontSize: UIN.helper, color: "#bdbdbd" }}>Create a collection of files or folders for tools and playbooks to use.</div>
        </div>
        {/* The claims knowledge base */}
        <div style={{ position: "absolute", inset: 0, opacity: s.emptyFade }}>
          <div style={{ ...text, left: 28, top: 26, fontSize: READ + 2, fontWeight: 700 }}>{P.brain.kbName}</div>
          <div style={{ position: "absolute", left: 28, top: 62, display: "flex", gap: 10 }}>
            {[`Files ${fileCount}`, `Passages ${s.passages}`].map((c) => (
              <div key={c} style={{ padding: "3px 12px", borderRadius: 8, border: `1px solid ${UI.chipBorder}`, fontFamily: FONT.sans, fontSize: UIN.helper, color: "#d8d8d8" }}>
                {c}
              </div>
            ))}
          </div>
          {s.drive > 0 ? (
            <div style={{ position: "absolute", right: 28, top: 24, display: "flex", alignItems: "center", gap: 10, padding: "6px 14px", borderRadius: 10, background: "#2a2a2a", border: `1px solid ${UI.chipBorder}`, opacity: s.drive, transform: `translateY(${(1 - s.drive) * 10}px)`, fontFamily: FONT.sans, fontSize: UIN.helper, color: UI.text, whiteSpace: "nowrap" }}>
              <Img data-guard="brand" src={staticFile("logos/google-drive.svg")} style={{ width: 20, height: 18, objectFit: "contain" }} />
              {P.brain.driveChip}
            </div>
          ) : null}
          {s.files.map((f, i) =>
            f.appear > 0 ? (
              <div
                key={i}
                data-guard="uitext"
                data-guard-read="1"
                data-guard-label={`File ${P.brain.files[i]}`}
                style={{ position: "absolute", left: 28, top: BRAIN.fileRow0 - b.y + i * BRAIN.rowH, width: b.w - 56, height: 60, borderRadius: 12, background: "#262626", border: "1px solid #3a3a3a", display: "flex", alignItems: "center", gap: 16, padding: "0 18px", boxSizing: "border-box", opacity: f.appear, filter: f.appear < 1 ? `blur(${(1 - f.appear) * 8}px)` : undefined, transform: `translateY(${(1 - f.appear) * 14}px)` }}
              >
                <PdfIcon size={30} />
                <div style={{ fontFamily: FONT.sans, fontSize: READ, fontWeight: 600, color: UI.text, width: 380 }}>{P.brain.files[i]}</div>
                <div style={{ width: 300, height: 8, borderRadius: 4, background: "#3a3a3a", overflow: "hidden" }}>
                  <div style={{ width: `${f.progress * 100}%`, height: "100%", background: f.ready ? "#6FBF73" : "#B5D23E" }} />
                </div>
                <div style={{ fontFamily: FONT.sans, fontSize: READ, color: f.ready ? "#8fd694" : "#d8d8d8", width: 90 }}>{f.ready ? "Ready" : "Indexing"}</div>
                <div style={{ marginLeft: "auto", opacity: s.cite }}>
                  <SourceChip id={`S${i + 1}`} />
                </div>
              </div>
            ) : null,
          )}
          {s.cite > 0 ? (
            <div data-guard="uitext" data-guard-read="1" data-guard-label="Answers cite" style={{ ...text, right: 28, top: BRAIN.fileRow0 - b.y + 2 * BRAIN.rowH + 10, fontSize: READ, color: "#d8d8d8", opacity: s.cite }}>
              {P.brain.citeLine}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
