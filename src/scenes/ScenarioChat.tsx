import React from "react";
import { useTimeline } from "../anim";
import { SCENARIO_TIMING, SCENARIOS } from "../content";
import { Highlight } from "../components/Highlight";
import {
  Bubble,
  QuickReply,
  Chip,
  FileCard,
  Meta,
} from "../components/WhatsAppChat";

type Scenario = (typeof SCENARIOS)[number];

// One short exchange for scene 5. Times are relative to scenario.start.
export const ScenarioChat: React.FC<{ scenario: Scenario }> = ({
  scenario,
}) => {
  const { p } = useTimeline();
  const at = (s: number) => scenario.start + s;
  const T = SCENARIO_TIMING;
  const extra = p(at(T.extraAt), 0.35);
  const { outgoing, reply } = scenario;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: "28px 26px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Space for the scenario chip, which lives above the screens. */}
      <div style={{ height: 56, flexShrink: 0 }} />
      {outgoing.kind === "file" ? (
        <Bubble side="out" at={at(T.outgoingAt)} padding="14px 14px 10px 14px">
          <FileCard name={outgoing.text} meta={outgoing.meta} type="PDF" />
          <div style={{ paddingRight: 8 }}>
            <Meta
              time={outgoing.time}
              ticks={{
                deliveredAt: at(T.outgoingAt + 0.12),
                readAt: at(T.replyAt - 0.1),
              }}
            />
          </div>
        </Bubble>
      ) : (
        <Bubble side="out" at={at(T.outgoingAt)}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
            <span style={{ fontWeight: 400 }}>{outgoing.text}</span>
            <Meta
              time={outgoing.time}
              ticks={{
                deliveredAt: at(T.outgoingAt + 0.12),
                readAt: at(T.replyAt - 0.1),
              }}
            />
          </div>
        </Bubble>
      )}
      <Bubble
        side="in"
        at={at(T.replyAt)}
        width={600}
        footer={
          "button" in reply ? (
            <div
              style={{
                opacity: extra,
                translate: `0px ${(1 - extra) * 16}px`,
              }}
            >
              <QuickReply label={reply.button} tapAt={at(reply.tapAt)} />
            </div>
          ) : null
        }
      >
        <div style={{ fontWeight: 400 }}>
          {"highlight" in reply ? (
            <>
              {reply.text.split(reply.highlight)[0]}
              <Highlight at={at(T.extraAt)}>{reply.highlight}</Highlight>
              {reply.text.split(reply.highlight)[1]}
            </>
          ) : (
            reply.text
          )}
        </div>
        {"chip" in reply ? (
          <div
            style={{
              marginTop: 14,
              opacity: extra,
              translate: `0px ${(1 - extra) * 10}px`,
            }}
          >
            <Chip size={22}>{reply.chip}</Chip>
          </div>
        ) : null}
        <Meta time={reply.time} />
      </Bubble>
    </div>
  );
};
