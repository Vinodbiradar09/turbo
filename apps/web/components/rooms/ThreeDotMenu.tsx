"use client";

import { useState, useRef, useEffect } from "react";
import { Member, NearbyRoom } from "../../app/rooms/nearme/types";
import { types } from "node:util";

interface Props {
  room: NearbyRoom;
  currentUserId: string;
  members: Member[];
  loadingMembers: boolean;
  onLeave: () => void;
  onDelete: () => void;
  onFetchMembers: () => void;
}

type View = "main" | "members" | "report-room" | "report-user";

const REPORT_REASONS = [
  "Harassment or bullying",
  "Sexual content",
  "Hate speech or discrimination",
  "Spam or misleading",
  "Violence or threats",
  "Illegal activity",
  "Other",
];

export default function ThreeDotMenu({
  room,
  currentUserId,
  members,
  loadingMembers,
  onLeave,
  onDelete,
  onFetchMembers,
}: Props) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("main");
  const [selectedReason, setSelectedReason] = useState("");
  const [reportingUser, setReportingUser] = useState<{
    userId: string;
    name: string;
  } | null>(null);
  const [submittedFor, setSubmittedFor] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isCreator = room.creatorId === currentUserId;
  const currentMember = members.find((m) => m.userId === currentUserId);
  const isAdmin = isCreator || currentMember?.role === "ADMIN";

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        closeMenu();
    };
    const t = setTimeout(
      () => document.addEventListener("mousedown", handler),
      50,
    );
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handler);
    };
  }, [open]);

  const openMenu = () => {
    setOpen(true);
    setView("main");
    setSelectedReason("");
    onFetchMembers();
  };

  const closeMenu = () => {
    setOpen(false);
    setView("main");
    setSelectedReason("");
    setReportingUser(null);
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/rooms/${room.id}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitReport = async (type: "room" | "user") => {
    console.log("type is", type);
    if (!selectedReason || submitting) return;
    const key =
      type === "room" ? `room-${room.id}` : `user-${reportingUser?.userId}`;
    if (submittedFor.has(key)) return;
    setSubmitting(true);
    try {
      const url =
        type === "room"
          ? `/api/v1/rooms/${room.id}/report`
          : `/api/v1/users/${reportingUser?.userId}/report`;
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: selectedReason,
          ...(type === "user" ? { roomId: room.id } : {}),
        }),
      });
      setSubmittedFor((prev) => new Set([...prev, key]));
    } catch (e) {
      console.error("Report failed", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={open ? closeMenu : openMenu}
        className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4 text-white/70"
        >
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-72 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.14),0_4px_16px_rgba(0,0,0,0.06)] border border-[#E8DDD0]/60 overflow-hidden z-[100]">
          {/* MAIN */}
          {view === "main" && (
            <>
              <div className="px-5 py-4 border-b border-[#E8DDD0]/60 bg-[#F5F0E8]/60">
                <p className="font-dm text-[13px] font-medium text-[#2E3B2F] truncate">
                  {room.name}
                </p>
                <p className="font-dm text-[11px] text-[#8a9a8b] mt-0.5">
                  {room.memberCount} members
                </p>
              </div>
              <div className="py-1.5">
                {/* Copy link */}
                <Row
                  icon={
                    copied ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-4 h-4 text-[#2E3B2F]"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        className="w-4 h-4"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )
                  }
                  label={copied ? "Link copied!" : "Copy room link"}
                  onClick={handleCopyLink}
                />
                <Row
                  icon={<UsersIcon />}
                  label="Members"
                  onClick={() => setView("members")}
                  chevron
                />
                <Divider />
                <Row
                  icon={<LeaveIcon />}
                  label="Exit room"
                  onClick={() => {
                    onLeave();
                    closeMenu();
                  }}
                />
                <Row
                  icon={<FlagIcon />}
                  label="Report room"
                  onClick={() => {
                    setView("report-room");
                    setSelectedReason("");
                  }}
                  chevron
                />
                <Row
                  icon={<PersonFlagIcon />}
                  label="Report a member"
                  onClick={() => setView("members")}
                  chevron
                />
                {isCreator && (
                  <>
                    <Divider label="Admin" />
                    <Row
                      icon={<TrashIcon />}
                      label="Delete room"
                      onClick={() => {
                        onDelete();
                        closeMenu();
                      }}
                    />
                  </>
                )}
              </div>
            </>
          )}

          {/* MEMBERS */}
          {view === "members" && (
            <>
              <MenuHeader
                title="Members"
                onBack={() => setView("main")}
                onClose={closeMenu}
              />
              <div className="max-h-72 overflow-y-auto py-1.5">
                {loadingMembers ? (
                  <div className="flex justify-center py-8">
                    <div className="w-5 h-5 rounded-full border-2 border-[#D4C5B0] border-t-[#2E3B2F] animate-spin" />
                  </div>
                ) : members.length === 0 ? (
                  <p className="text-center font-dm text-[12px] text-[#8a9a8b] py-8">
                    No members found
                  </p>
                ) : (
                  members.map((member) => (
                    <MemberItem
                      key={member.userId}
                      member={member}
                      isSelf={member.userId === currentUserId}
                      isAdmin={isAdmin}
                      isCreator={isCreator}
                      roomId={room.id}
                      onReport={() => {
                        setReportingUser({
                          userId: member.userId,
                          name: member.name,
                        });
                        setSelectedReason("");
                        setView("report-user");
                      }}
                      onClose={closeMenu}
                    />
                  ))
                )}
              </div>
            </>
          )}

          {/* REPORT ROOM */}
          {view === "report-room" && (
            <>
              <MenuHeader
                title="Report room"
                onBack={() => setView("main")}
                onClose={closeMenu}
              />
              <ReportForm
                targetLabel={`"${room.name}"`}
                alreadyReported={submittedFor.has(`room-${room.id}`)}
                submitting={submitting}
                selectedReason={selectedReason}
                onSelect={setSelectedReason}
                onSubmit={() => submitReport("room")}
              />
            </>
          )}

          {/* REPORT USER */}
          {view === "report-user" && reportingUser && (
            <>
              <MenuHeader
                title="Report member"
                onBack={() => setView("members")}
                onClose={closeMenu}
              />
              <ReportForm
                targetLabel={reportingUser.name}
                alreadyReported={submittedFor.has(
                  `user-${reportingUser.userId}`,
                )}
                submitting={submitting}
                selectedReason={selectedReason}
                onSelect={setSelectedReason}
                onSubmit={() => submitReport("user")}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuHeader({
  title,
  onBack,
  onClose,
}: {
  title: string;
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#E8DDD0]/60">
      <button
        onClick={onBack}
        className="text-[#C4B8A8] hover:text-[#2E3B2F] transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-4 h-4"
        >
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>
      <p className="font-dm text-[13px] font-medium text-[#2E3B2F] flex-1">
        {title}
      </p>
      <button
        onClick={onClose}
        className="text-[#C4B8A8] hover:text-[#2E3B2F] transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-4 h-4"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function Row({
  icon,
  label,
  onClick,
  chevron,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  chevron?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-5 py-3 font-dm text-[13px] text-[#3d4d3e] hover:bg-[#F5F0E8]/60 transition-colors"
    >
      <span className="text-[#8a9a8b] flex-shrink-0">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {chevron && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="w-3.5 h-3.5 text-[#C4B8A8]"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </button>
  );
}

function Divider({ label }: { label?: string }) {
  return label ? (
    <div className="px-5 pt-3 pb-1">
      <p className="font-dm text-[10px] tracking-[0.12em] uppercase text-[#C4B8A8]">
        {label}
      </p>
    </div>
  ) : (
    <div className="mx-5 my-1.5 h-px bg-[#E8DDD0]/60" />
  );
}

function MemberItem({
  member,
  isSelf,
  isAdmin,
  isCreator,
  roomId,
  onReport,
  onClose,
}: {
  member: Member;
  isSelf: boolean;
  isAdmin: boolean;
  isCreator: boolean;
  roomId: string;
  onReport: () => void;
  onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const memberIsAdmin = member.role === "ADMIN";

  return (
    <div className="px-5 py-2.5">
      <div
        className={`flex items-center gap-3 ${!isSelf ? "cursor-pointer" : ""}`}
        onClick={() => !isSelf && setExpanded((s) => !s)}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E8DDD0] to-[#D4C5B0]/60 flex items-center justify-center flex-shrink-0">
          <span className="font-dm text-[10px] font-semibold text-[#2E3B2F]/50">
            {member.name[0]?.toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-dm text-[13px] text-[#2E3B2F] truncate">
            {member.name}
            {isSelf && (
              <span className="text-[#C4B8A8] font-normal text-[11px]">
                {" "}
                · you
              </span>
            )}
          </p>
          <p className="font-dm text-[10px] text-[#8a9a8b] capitalize">
            {member.role.toLowerCase()}
          </p>
        </div>
        {memberIsAdmin && (
          <span className="font-dm text-[9px] tracking-[0.1em] uppercase bg-[#2E3B2F]/8 text-[#2E3B2F] px-2 py-0.5 rounded-full">
            Admin
          </span>
        )}
        {!isSelf && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`w-3.5 h-3.5 text-[#C4B8A8] transition-transform ${expanded ? "rotate-90" : ""}`}
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        )}
      </div>
      {expanded && !isSelf && (
        <div className="flex flex-wrap gap-1.5 mt-2.5 ml-11">
          <Chip label="Report" onClick={onReport} />
          {isAdmin && (
            <Chip
              label="Remove"
              onClick={async () => {
                await fetch(`/api/v1/rooms/${roomId}/members`, {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userIds: [member.userId] }),
                });
                onClose();
              }}
            />
          )}
          {isCreator && !memberIsAdmin && (
            <Chip
              label="Make admin"
              onClick={async () => {
                await fetch(
                  `/api/v1/rooms/${roomId}/members/${member.userId}/promote`,
                  { method: "PATCH" },
                );
                onClose();
              }}
              variant="positive"
            />
          )}
          {isCreator && memberIsAdmin && (
            <Chip
              label="Revoke admin"
              onClick={async () => {
                await fetch(
                  `/api/v1/rooms/${roomId}/admins/${member.userId}/degrade`,
                  { method: "PATCH" },
                );
                onClose();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  onClick,
  variant = "neutral",
}: {
  label: string;
  onClick: () => void;
  variant?: "neutral" | "positive";
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full font-dm text-[11px] border transition-all duration-200
        ${
          variant === "positive"
            ? "border-[#2E3B2F]/20 text-[#2E3B2F] hover:bg-[#2E3B2F] hover:text-white hover:border-[#2E3B2F]"
            : "border-[#D4C5B0]/60 text-[#6b7d6c] hover:bg-[#F5F0E8] hover:text-[#2E3B2F]"
        }`}
    >
      {label}
    </button>
  );
}

function ReportForm({
  targetLabel,
  alreadyReported,
  submitting,
  selectedReason,
  onSelect,
  onSubmit,
}: {
  targetLabel: string;
  alreadyReported: boolean;
  submitting: boolean;
  selectedReason: string;
  onSelect: (r: string) => void;
  onSubmit: () => void;
}) {
  if (alreadyReported) {
    return (
      <div className="px-5 py-10 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-[#2E3B2F]/8 flex items-center justify-center mb-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-5 h-5 text-[#2E3B2F]"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <p className="font-cormorant text-[20px] text-[#2E3B2F] mb-2">
          Report submitted
        </p>
        <p className="font-dm text-[12px] text-[#8a9a8b] leading-relaxed max-w-[200px]">
          Our team will review and take action within 24 hours.
        </p>
      </div>
    );
  }
  return (
    <div className="px-5 py-4">
      <p className="font-dm text-[12px] text-[#8a9a8b] mb-3">
        Why are you reporting{" "}
        <span className="text-[#2E3B2F]">{targetLabel}</span>?
      </p>
      <div className="space-y-1.5 mb-4">
        {REPORT_REASONS.map((reason) => (
          <button
            key={reason}
            onClick={() => onSelect(reason)}
            className={`w-full text-left px-4 py-2.5 rounded-xl font-dm text-[13px] border transition-all duration-150
              ${
                selectedReason === reason
                  ? "bg-[#2E3B2F]/6 border-[#2E3B2F]/15 text-[#2E3B2F]"
                  : "border-[#E8DDD0]/80 text-[#3d4d3e] hover:bg-[#F5F0E8]/60 hover:border-[#D4C5B0]"
              }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-colors
                ${selectedReason === reason ? "border-[#2E3B2F] bg-[#2E3B2F]" : "border-[#C4B8A8]"}`}
              />
              {reason}
            </div>
          </button>
        ))}
      </div>
      <button
        onClick={onSubmit}
        disabled={!selectedReason || submitting}
        className="w-full py-3 bg-[#2E3B2F] text-white font-dm text-[13px] rounded-xl disabled:opacity-40 hover:bg-[#2E3B2F]/90 transition-colors"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Submitting…
          </span>
        ) : (
          "Submit report"
        )}
      </button>
      <p className="font-dm text-[10px] text-[#C4B8A8] text-center mt-2">
        Reports are anonymous
      </p>
    </div>
  );
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="w-4 h-4"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function LeaveIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="w-4 h-4"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
function FlagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="w-4 h-4"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />
    </svg>
  );
}
function PersonFlagIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="w-4 h-4"
    >
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 0 1 4-4h3" />
      <path d="M16 11l5-5-5-5v3h-3v4h3z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="w-4 h-4"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
