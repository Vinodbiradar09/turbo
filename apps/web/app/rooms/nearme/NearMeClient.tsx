"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NearbyRoom, Message, CurrentUser } from "./types";
import { joinRoom, leaveRoom, roomsNearMe } from "./actions";
import { useRoomChat } from "@/hooks/rooms/useRoomChat";
import RoomListPanel from "@/components/rooms/RoomListPanel";
import ChatPanel from "@/components/rooms/ChatPanel";
import EmptyChat from "@/components/rooms/EmptyChat";
import CreateRoomModal from "@/components/rooms/CreateRoomModal";

interface Props {
  initialRooms: NearbyRoom[];
  currentUser: CurrentUser;
  cookieHeader: string;
  lat: number;
  lng: number;
}

interface RoomSession {
  joined: boolean;
  wsJoined: boolean;
  messages: Message[];
  unread: number;
}

export default function NearMeClient({
  initialRooms,
  currentUser,
  cookieHeader,
  lat,
  lng,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [rooms, setRooms] = useState<NearbyRoom[]>(initialRooms);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const roomSessions = useRef<Map<string, RoomSession>>(new Map());
  const [sessionVersion, setSessionVersion] = useState(0);
  const bumpVersion = useCallback(() => setSessionVersion((v) => v + 1), []);

  const getSession = useCallback((roomId: string): RoomSession => {
    if (!roomSessions.current.has(roomId)) {
      roomSessions.current.set(roomId, {
        joined: false,
        wsJoined: false,
        messages: [],
        unread: 0,
      });
    }
    return roomSessions.current.get(roomId)!;
  }, []);

  const handleWsMessage = useCallback(
    (msg: Message) => {
      const session = getSession(msg.roomId);
      session.messages = [...session.messages, msg];
      if (msg.roomId !== activeRoomId) session.unread += 1;
      roomSessions.current.set(msg.roomId, session);
      bumpVersion();
    },
    [activeRoomId, getSession, bumpVersion],
  );

  const {
    connected,
    error: wsError,
    sendMessage,
    wsJoin,
    wsLeave,
  } = useRoomChat({
    onMessage: handleWsMessage,
  });

  useEffect(() => {
    for (const room of initialRooms) {
      if (room.isMember) {
        const session = getSession(room.id);
        session.joined = true;
        session.wsJoined = false;
        roomSessions.current.set(room.id, session);
      }
    }
    bumpVersion();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const roomParam = searchParams.get("room");
    if (roomParam) {
      const room = rooms.find((r) => r.id === roomParam);
      if (room) handleJoin(room, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJoin = useCallback(
    async (room: NearbyRoom, skipHttpJoin = false) => {
      if (joiningId) return;
      const session = getSession(room.id);

      if (activeRoomId === room.id) {
        setMobileView("chat");
        return;
      }

      setJoiningId(room.id);
      try {
        if (!session.joined && !skipHttpJoin) {
          const res = await joinRoom(room.id, cookieHeader);
          if (res && res.success === false && !res.alreadyMember) {
            console.error("Join failed:", res.message);
          }
        }

        session.joined = true;
        if (!session.wsJoined) {
          wsJoin(room.id);
          session.wsJoined = true;
        }
        session.unread = 0;
        roomSessions.current.set(room.id, session);
        setActiveRoomId(room.id);
        setMobileView("chat");
        bumpVersion();

        if (searchParams.get("room")) {
          router.replace(`/rooms/nearme?lat=${lat}&lng=${lng}`, {
            scroll: false,
          });
        }
      } catch (err) {
        console.error("Failed to join room", err);
      } finally {
        setJoiningId(null);
      }
    },
    [
      joiningId,
      activeRoomId,
      cookieHeader,
      wsJoin,
      getSession,
      bumpVersion,
      lat,
      lng,
      router,
      searchParams,
    ],
  );

  const handleLeaveRoom = useCallback(
    async (roomId: string) => {
      wsLeave(roomId);
      try {
        await leaveRoom(roomId, cookieHeader);
      } catch (e) {
        console.error(e);
      }
      roomSessions.current.delete(roomId);
      if (activeRoomId === roomId) {
        setActiveRoomId(null);
        setMobileView("list");
      }
      bumpVersion();
    },
    [activeRoomId, wsLeave, cookieHeader, bumpVersion],
  );

  const handleDeleteRoom = useCallback(
    async (roomId: string) => {
      wsLeave(roomId);
      roomSessions.current.delete(roomId);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      setActiveRoomId(null);
      setMobileView("list");
      bumpVersion();
    },
    [wsLeave, bumpVersion],
  );

  const handleSendMessage = useCallback(
    (content: string, type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO") => {
      if (!activeRoomId || !connected) return;
      const session = getSession(activeRoomId);

      const optimistic: Message = {
        id: `opt-${Date.now()}`,
        roomId: activeRoomId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderImage: null,
        content,
        type,
        createdAt: Date.now(),
        pending: true,
      };

      session.messages = [...session.messages, optimistic];
      roomSessions.current.set(activeRoomId, session);
      bumpVersion();

      const sent = sendMessage(content, type, activeRoomId);
      setTimeout(() => {
        const s = getSession(activeRoomId);
        s.messages = s.messages.map((m) =>
          m.id === optimistic.id ? { ...m, pending: false, failed: !sent } : m,
        );
        roomSessions.current.set(activeRoomId, s);
        bumpVersion();
      }, 300);
    },
    [
      activeRoomId,
      connected,
      currentUser,
      sendMessage,
      getSession,
      bumpVersion,
    ],
  );

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);

    const fetchRooms = async (newLat: number, newLng: number) => {
      try {
        const result = await roomsNearMe(newLat, newLng, cookieHeader);
        const enriched = (result?.rooms ?? []).map((r) => ({
          ...r,
          isMember: roomSessions.current.get(r.id)?.joined ?? false,
        }));
        setRooms(enriched ?? []);
        // Update URL cosmetically (no navigation, no remount)
        router.replace(`/rooms/nearme?lat=${newLat}&lng=${newLng}`, {
          scroll: false,
        });
      } catch (e) {
        console.error("Refresh rooms failed:", e);
      } finally {
        setRefreshing(false);
      }
    };

    if (!navigator.geolocation) {
      await fetchRooms(lat, lng);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        try {
          sessionStorage.setItem(
            "circl_coords",
            JSON.stringify({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          );
        } catch {}
        fetchRooms(pos.coords.latitude, pos.coords.longitude);
      },
      async () => {
        // GPS failed — still refresh rooms with current coords
        await fetchRooms(lat, lng);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  }, [refreshing, lat, lng, cookieHeader, router]);

  const handleRoomCreated = useCallback(
    (room: NearbyRoom) => {
      setShowCreate(false);
      setRooms((prev) => [room, ...prev]);
      const session = getSession(room.id);
      session.joined = true;
      roomSessions.current.set(room.id, session);
      handleJoin(room, true);
    },
    [getSession, handleJoin],
  );

  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null;
  const activeSession = activeRoomId ? getSession(activeRoomId) : null;

  const unreadMap: Record<string, number> = {};
  for (const [id, s] of roomSessions.current.entries()) {
    if (s.unread > 0) unreadMap[id] = s.unread;
  }

  const joinedRoomIds = new Set(
    [...roomSessions.current.entries()]
      .filter(([, s]) => s.joined)
      .map(([id]) => id),
  );

  return (
    <div className="h-full flex overflow-hidden bg-[#F5F0E8]">
      <div
        className={`relative shrink-0 border-r border-[#D4C5B0]/40 w-full md:w-85 lg:w-95 ${mobileView === "chat" ? "hidden md:flex" : "flex"} flex-col`}
      >
        <RoomListPanel
          rooms={rooms}
          activeRoomId={activeRoomId}
          joiningId={joiningId}
          refreshing={refreshing}
          joinedRoomIds={joinedRoomIds}
          unreadMap={unreadMap}
          onJoin={handleJoin}
          onRefresh={handleRefresh}
          onCreateRoom={() => setShowCreate(true)}
          onBack={() => router.push("/rooms")}
        />
      </div>

      <div
        className={`flex-1 flex flex-col min-w-0 ${mobileView === "list" ? "hidden md:flex" : "flex"}`}
      >
        {activeRoom && activeSession ? (
          <ChatPanel
            room={activeRoom}
            currentUser={currentUser}
            cookieHeader={cookieHeader}
            onSendMessage={handleSendMessage}
            wsMessages={activeSession.messages}
            connected={connected}
            onLeaveRoom={() => handleLeaveRoom(activeRoom.id)}
            onDeleteRoom={() => handleDeleteRoom(activeRoom.id)}
            onMobileBack={() => setMobileView("list")}
          />
        ) : (
          <EmptyChat />
        )}
      </div>

      {wsError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1a1f1b] text-white font-dm text-[12px] px-5 py-3 rounded-full shadow-xl flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#e06b4a] animate-pulse" />
          {wsError}
        </div>
      )}

      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreated={handleRoomCreated}
          cookieHeader={cookieHeader}
          userLat={lat}
          userLng={lng}
        />
      )}
    </div>
  );
}
