import React from "react";
import { mix, useTimeline } from "../anim";
import { CHATS, CHATS_TAB_BADGE, LIST } from "../content";
import { C, PHONE, SCREEN, WA } from "../theme";
import {
  AgentAvatar,
  CameraIcon,
  DoubleTick,
  PlusIcon,
  TabIcon,
} from "../components/Icons";
import { Pointer } from "../components/Pointer";

// Layout of the list, shared with the avatar that flies into the chat.
const TOP_ROW = 84;
const TITLE = 98;
const ROW = 124;
const AVATAR = 104;
const SIDE = 30;
export const ROWS_TOP = PHONE.statusBar + TOP_ROW + TITLE;
export const rowAvatar = (index: number) => ({
  x: SIDE,
  y: ROWS_TOP + index * ROW + (ROW - AVATAR) / 2,
  size: AVATAR,
});

const TAB_BAR = PHONE.inputHeight + PHONE.homeArea;
const TABS = [
  { name: "updates", label: "Updates" },
  { name: "calls", label: "Calls" },
  { name: "communities", label: "Communities" },
  { name: "chats", label: "Chats" },
  { name: "settings", label: "Settings" },
] as const;

const Badge: React.FC<{ value: number; size?: number }> = ({
  value,
  size = 40,
}) => (
  <div
    style={{
      minWidth: size,
      height: size,
      padding: "0 10px",
      borderRadius: size / 2,
      backgroundColor: WA.green,
      color: C.bg,
      fontSize: size * 0.55,
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {value}
  </div>
);

const Avatar: React.FC<{ index: number; hidden: boolean }> = ({
  index,
  hidden,
}) => {
  const row = CHATS[index];
  return (
    <div
      style={{
        width: AVATAR,
        height: AVATAR,
        flexShrink: 0,
        opacity: hidden ? 0 : 1,
      }}
    >
      {row.agent ? (
        <AgentAvatar size={AVATAR} />
      ) : (
        <div
          style={{
            width: AVATAR,
            height: AVATAR,
            borderRadius: AVATAR / 2,
            backgroundColor: row.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            fontWeight: 600,
            color: "#3B4A54",
            letterSpacing: 0.5,
          }}
        >
          {row.initials}
        </div>
      )}
    </div>
  );
};

export const ChatsList: React.FC = () => {
  const { p, t } = useTimeline();
  const pressed = p(LIST.tapAt, 0.08);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: C.bg,
        paddingTop: PHONE.statusBar,
      }}
    >
      {/* Top actions */}
      <div
        style={{
          height: TOP_ROW,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `0 ${SIDE}px`,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            border: `3px solid ${WA.green}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: WA.green,
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <CameraIcon size={52} color={WA.green} />
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: WA.green,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PlusIcon color={C.bg} size={40} />
          </div>
        </div>
      </div>
      <div
        style={{
          height: TITLE,
          padding: `4px ${SIDE}px 0`,
          fontSize: 68,
          fontWeight: 700,
          letterSpacing: -1.6,
        }}
      >
        Chats
      </div>
      {/* Rows, revealed top to bottom */}
      {CHATS.map((row, i) => {
        const e = p(LIST.rowsAt + i * LIST.rowStagger, LIST.rowDuration);
        const isAgent = i === LIST.agentRow;
        return (
          <div
            key={row.name}
            style={{
              position: "relative",
              height: ROW,
              display: "flex",
              alignItems: "center",
              gap: 24,
              paddingLeft: SIDE,
              backgroundColor: isAgent
                ? `rgba(229, 229, 234, ${pressed})`
                : undefined,
              opacity: e,
              translate: `0px ${mix(18, 0, e)}px`,
            }}
          >
            <Avatar index={i} hidden={isAgent && t >= LIST.pushAt} />
            <div
              style={{
                flex: 1,
                alignSelf: "stretch",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 4,
                paddingRight: SIDE,
                borderBottom: `1px solid ${WA.separator}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div
                  style={{ fontSize: 31, fontWeight: 600, letterSpacing: -0.4 }}
                >
                  {row.name}
                </div>
                <div
                  style={{
                    fontSize: 23,
                    color: row.unread ? WA.green : WA.listGrey,
                  }}
                >
                  {row.time}
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
              >
                <div
                  style={{
                    flex: 1,
                    fontSize: 26,
                    lineHeight: 1.28,
                    color: WA.listGrey,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {row.fromMe ? (
                    <span style={{ marginRight: 6, verticalAlign: "-1px" }}>
                      <DoubleTick />
                    </span>
                  ) : null}
                  {row.preview}
                </div>
                {row.unread ? <Badge value={row.unread} /> : null}
              </div>
            </div>
          </div>
        );
      })}
      {/* Tab bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: TAB_BAR,
          backgroundColor: WA.bar,
          borderTop: `1px solid ${WA.hairline}`,
          display: "flex",
          justifyContent: "space-around",
          paddingTop: 12,
        }}
      >
        {TABS.map((tab) => {
          const active = tab.name === "chats";
          const color = active ? WA.green : C.ink;
          return (
            <div
              key={tab.name}
              style={{
                position: "relative",
                width: 140,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                color: active ? WA.green : WA.listGrey,
                fontSize: 20,
                fontWeight: 500,
              }}
            >
              <TabIcon name={tab.name} color={color} filled={active} />
              {tab.label}
              {active ? (
                <div
                  style={{
                    position: "absolute",
                    top: -4,
                    left: 82,
                    border: `3px solid ${WA.bar}`,
                    borderRadius: 24,
                  }}
                >
                  <Badge value={CHATS_TAB_BADGE} size={34} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <Pointer
        target={{
          x: SCREEN.width * 0.55,
          y: ROWS_TOP + LIST.agentRow * ROW + ROW * 0.5,
        }}
        inAt={LIST.pointer.in}
        arriveAt={LIST.pointer.arrive}
        outAt={LIST.pointer.out}
        tapAt={LIST.tapAt}
      />
    </div>
  );
};
