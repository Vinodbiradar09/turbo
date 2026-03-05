"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  NearbyRoom,
  Message,
  Member,
  ApiMessage,
  CurrentUser,
} from "@/app/rooms/nearme/types";
import { displayMessages, getRoomMembers } from "@/app/rooms/nearme/actions";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import ThreeDotMenu from "./ThreeDotMenu";
import Image from "next/image";

interface Props {
  room: NearbyRoom;
  currentUser: CurrentUser;
  cookieHeader: string;
  onSendMessage: (
    content: string,
    type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO",
  ) => void;
  wsMessages: Message[];
  connected: boolean;
  onLeaveRoom: () => void;
  onDeleteRoom: () => void;
  onMobileBack: () => void;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function toMessage(m: ApiMessage, roomId: string): Message {
  return {
    id: m.id,
    roomId,
    senderId: m.sender.id,
    senderName: m.sender.name,
    senderImage: null,
    content: m.content,
    type: (m as any).type ?? "TEXT",
    createdAt: new Date(m.createdAt).getTime(),
  };
}

export default function ChatPanel({
  room,
  currentUser,
  cookieHeader,
  onSendMessage,
  wsMessages,
  connected,
  onLeaveRoom,
  onDeleteRoom,
  onMobileBack,
}: Props) {
  const [historyMessages, setHistoryMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevRoomId = useRef<string | null>(null);

  useEffect(() => {
    if (prevRoomId.current === room.id) return;
    prevRoomId.current = room.id;
    setLoadingHistory(true);
    setHistoryMessages([]);

    displayMessages(room.id, cookieHeader)
      .then((res) => {
        if (!res) return;
        const raw: ApiMessage[] =
          (res as any).messages ?? (res as any).data ?? [];
        setHistoryMessages(raw.map((m) => toMessage(m, room.id)));
      })
      .catch(console.error)
      .finally(() => setLoadingHistory(false));
  }, [room.id, cookieHeader]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [historyMessages.length, wsMessages.length]);

  const fetchMembers = useCallback(async () => {
    setLoadingMembers(true);
    try {
      const res = await getRoomMembers(room.id, cookieHeader);
      if (res) setMembers((res as any).members ?? []);
    } finally {
      setLoadingMembers(false);
    }
  }, [room.id, cookieHeader]);

  // Merge history + WS, deduplicate
  const seenIds = new Set<string>();
  const allMessages: Message[] = [];
  for (const m of [...historyMessages, ...wsMessages]) {
    const key = m.id ?? `${m.senderId}-${m.createdAt}`;
    if (seenIds.has(key)) continue;
    seenIds.add(key);
    allMessages.push(m);
  }

  return (
    <div className="flex flex-col h-full bg-[#F5F0E8]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#2E3B2F] border-b border-[#2E3B2F]/80 shadow-sm flex-shrink-0">
        {/* Mobile back */}
        <button
          onClick={onMobileBack}
          className="md:hidden w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            className="w-4 h-4"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>

        {/* Room avatar */}
        <div className="w-9 h-9 rounded-[10px] overflow-hidden bg-white/10 flex items-center justify-center flex-shrink-0">
          {room.img ? (
            <Image
              src={room.img}
              alt={room.name}
              width={36}
              height={36}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="font-cormorant text-[14px] font-semibold text-white/70">
              {initials(room.name)}
            </span>
          )}
        </div>

        {/* Room info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-dm text-[14px] font-medium text-white leading-tight truncate">
            {room.name}
          </h3>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-400" : "bg-white/30"}`}
            />
            <p className="font-dm text-[11px] text-white/50 truncate">
              {connected ? `${room.memberCount} members` : "Reconnecting…"}
              {room.topic && ` · ${room.topic}`}
            </p>
          </div>
        </div>

        <ThreeDotMenu
          room={room}
          currentUserId={currentUser.id}
          members={members}
          loadingMembers={loadingMembers}
          onLeave={onLeaveRoom}
          onDelete={onDeleteRoom}
          onFetchMembers={fetchMembers}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {loadingHistory ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-[#D4C5B0] border-t-[#2E3B2F] animate-spin" />
            <p className="font-dm text-[12px] text-[#8a9a8b]">
              Loading messages…
            </p>
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-[#E8DDD0] flex items-center justify-center mb-4">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                className="w-6 h-6 text-[#C4B8A8]"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="font-cormorant text-[20px] text-[#2E3B2F] mb-1">
              Start the conversation
            </p>
            <p className="font-dm text-[12px] text-[#8a9a8b]">
              Be the first to say something
            </p>
          </div>
        ) : (
          allMessages.map((msg, i) => {
            const prev = allMessages[i - 1];
            const showSender = !prev || prev.senderId !== msg.senderId;
            return (
              <MessageBubble
                key={msg.id ?? `${msg.senderId}-${msg.createdAt}-${i}`}
                msg={msg}
                isOwn={msg.senderId === currentUser.id}
                showSender={showSender}
              />
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0">
        <MessageInput onSend={onSendMessage} disabled={!connected} />
      </div>
    </div>
  );
}
