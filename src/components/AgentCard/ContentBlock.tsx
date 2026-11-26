import React from "react";
import { interpolate } from "remotion";
import { theme } from "./theme";
import { CheckIcon, FileIcon, InfoIcon } from "./icons";
import { progress, timing } from "./timing";
import type { ContentBlock as Block } from "./types";

const itemStart = (i: number) => timing.contentStart + i * timing.contentStagger;

/** Fade + rise used for text lines. */
const rise = (p: number, dist = 12): React.CSSProperties => ({
  opacity: p,
  transform: `translateY(${(1 - p) * dist}px)`,
});

const Message: React.FC<{ block: Extract<Block, { type: "message" }>; frame: number }> = ({ block, frame }) => {
  const p = progress(frame, itemStart(0), timing.itemDuration + 6);
  return (
    <div style={{ display: "flex", ...rise(p, 16) }}>
      <div
        style={{
          background: theme.chipBg,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: "20px 20px 20px 6px",
          padding: "20px 26px",
          fontSize: theme.size.body,
          fontWeight: 500,
          lineHeight: 1.4,
          color: theme.text,
          transformOrigin: "left bottom",
          transform: `scale(${interpolate(p, [0, 1], [0.96, 1])})`,
        }}
      >
        {block.text}
      </div>
    </div>
  );
};

const Checklist: React.FC<{ block: Extract<Block, { type: "checklist" }>; frame: number }> = ({ block, frame }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
    {block.items.map((item, i) => {
      const p = progress(frame, itemStart(i), timing.itemDuration);
      const tick = progress(frame, itemStart(i) + 4, timing.itemDuration - 4);
      return (
        <div
          key={item}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            opacity: p,
            transform: `translateX(${(1 - p) * -14}px)`,
          }}
        >
          <div style={{ transform: `scale(${interpolate(tick, [0, 1], [0.4, 1])})`, display: "flex" }}>
            <CheckIcon size={28} color={theme.lime} />
          </div>
          <span style={{ fontSize: theme.size.body, color: theme.text, fontWeight: 500 }}>{item}</span>
        </div>
      );
    })}
  </div>
);

const Files: React.FC<{ block: Extract<Block, { type: "files" }>; frame: number }> = ({ block, frame }) => (
  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
    {block.files.map((file, i) => {
      const p = progress(frame, itemStart(i), timing.itemDuration + 4);
      return (
        <div
          key={file}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 22px 14px 18px",
            borderRadius: 14,
            background: theme.chipBg,
            border: `1px solid ${theme.cardBorder}`,
            opacity: p,
            transform: `translateX(${(1 - p) * 28}px)`,
          }}
        >
          <FileIcon size={24} color={theme.lime} />
          <span style={{ fontSize: theme.size.chip, color: theme.text, fontWeight: 500 }}>{file}</span>
        </div>
      );
    })}
  </div>
);

const Callout: React.FC<{ block: Extract<Block, { type: "callout" }>; frame: number }> = ({ block, frame }) => {
  const panel = progress(frame, itemStart(0), timing.itemDuration);
  const head = progress(frame, itemStart(0) + 6, timing.itemDuration);
  const body = progress(frame, itemStart(1) + 6, timing.itemDuration);
  return (
    <div
      style={{
        display: "flex",
        gap: 18,
        padding: "24px 26px",
        borderRadius: 18,
        background: theme.insetBg,
        border: `1px solid ${theme.insetBorder}`,
        ...rise(panel, 10),
      }}
    >
      <div style={{ paddingTop: 1, ...rise(head, 6) }}>
        <InfoIcon size={26} color={theme.lime} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: theme.size.calloutHeading, fontWeight: 600, color: theme.text, ...rise(head, 8) }}>
          {block.heading}
        </div>
        <div style={{ fontSize: theme.size.calloutBody, lineHeight: 1.5, color: theme.textMuted, ...rise(body, 8) }}>
          {block.body}
        </div>
      </div>
    </div>
  );
};

export const ContentBlock: React.FC<{ block: Block; frame: number }> = ({ block, frame }) => {
  switch (block.type) {
    case "message":
      return <Message block={block} frame={frame} />;
    case "checklist":
      return <Checklist block={block} frame={frame} />;
    case "files":
      return <Files block={block} frame={frame} />;
    case "callout":
      return <Callout block={block} frame={frame} />;
  }
};
