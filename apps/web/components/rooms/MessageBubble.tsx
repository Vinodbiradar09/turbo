"use client";

import Image from "next/image";
import { Message } from "@/app/rooms/nearme/types";

interface Props {
  msg: Message;
  isOwn: boolean;
  showSender: boolean;
}

function fmt(ts: number | string) {
  const d = new Date(typeof ts === "number" ? ts : ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function initials(name: string) {
  console.log("nameees", name);
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// Deterministic color per sender
function avatarGradient(name: string): string {
  console.log("nameee", name);
  const gradients = [
    "from-[#4a6f51] to-[#2E3B2F]",
    "from-[#7a5a4a] to-[#5a3a2a]",
    "from-[#4a5a7a] to-[#2a3a5a]",
    "from-[#6a4a7a] to-[#4a2a5a]",
    "from-[#7a6a4a] to-[#5a4a2a]",
    "from-[#4a7a6a] to-[#2a5a4a]",
  ];
  const i =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    gradients.length;
  return gradients[i]!;
}

export default function MessageBubble({ msg, isOwn, showSender }: Props) {
  console.log("what is present in the msg", msg);
  console.log("own", isOwn);
  return (
    <div
      className={`flex items-end gap-2 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
    >
      {!isOwn && (
        <div className="shrink-0 mb-1">
          {showSender ? (
            <div
              className={`w-7 h-7 rounded-full bg-linear-to-br ${avatarGradient(msg.senderName)} flex items-center justify-center`}
            >
              <span className="font-dm text-[9px] font-bold text-white/80">
                {initials(msg.senderName)}
              </span>
            </div>
          ) : (
            <div className="w-7 h-7" />
          )}
        </div>
      )}

      <div
        className={`max-w-[72%] flex flex-col gap-0.5 ${isOwn ? "items-end" : "items-start"}`}
      >
        {!isOwn && showSender && (
          <span className="font-dm text-[11px] text-[#8a9a8b] px-1">
            {msg.senderName}
          </span>
        )}

        <div
          className={`relative rounded-2xl overflow-hidden
          ${
            isOwn
              ? "bg-[#2E3B2F] text-white rounded-br-sm"
              : "bg-white border border-[#E8DDD0] text-[#2E3B2F] rounded-bl-sm shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
          }
          ${msg.pending ? "opacity-60" : ""}
          ${msg.failed ? "opacity-40" : ""}
        `}
        >
          {msg.type === "TEXT" && (
            <p className="px-4 py-2.5 font-dm text-[14px] leading-[1.55] whitespace-pre-wrap break-words">
              {msg.content}
            </p>
          )}

          {msg.type === "IMAGE" && (
            <Image
              src={msg.content}
              alt="Image"
              width={280}
              height={200}
              className="object-cover max-w-[280px] max-h-[220px] w-full block"
              unoptimized
            />
          )}

          {msg.type === "VIDEO" && (
            <video
              src={msg.content}
              controls
              className="max-w-[280px] max-h-[220px] block"
              preload="metadata"
            />
          )}

          {msg.type === "AUDIO" && (
            <div className="px-4 py-3 flex items-center gap-3 min-w-[200px]">
              <button
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                  ${isOwn ? "bg-white/15 hover:bg-white/25" : "bg-[#2E3B2F]/8 hover:bg-[#2E3B2F]/15"}`}
                onClick={(e) => {
                  const btn = e.currentTarget;
                  const audio = btn.nextElementSibling as HTMLAudioElement;
                  if (!audio) return;
                  if (audio.paused) {
                    audio.play();
                    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
                  } else {
                    audio.pause();
                    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
                  }
                  audio.onended = () => {
                    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
                  };
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill={isOwn ? "white" : "#2E3B2F"}
                  className="w-4 h-4 opacity-80"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
              <audio src={msg.content} className="hidden" />

              {/* Waveform */}
              <div className="flex items-center gap-[2px] flex-1">
                {Array.from({ length: 22 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full ${isOwn ? "bg-white/40" : "bg-[#2E3B2F]/25"}`}
                    style={{
                      width: "2px",
                      height: `${5 + Math.abs(Math.sin(i * 0.9)) * 10}px`,
                    }}
                  />
                ))}
              </div>

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className={`w-3.5 h-3.5 flex-shrink-0 ${isOwn ? "text-white/40" : "text-[#8a9a8b]"}`}
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
              </svg>
            </div>
          )}
        </div>

        {/* Timestamp — hover only */}
        <span className="font-dm text-[10px] text-[#C4B8A8] px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {fmt(msg.createdAt)}
          {msg.pending && " · sending"}
          {msg.failed && " · failed"}
        </span>
      </div>
    </div>
  );
}
