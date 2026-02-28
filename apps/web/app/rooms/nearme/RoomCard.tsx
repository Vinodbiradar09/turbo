import Link from "next/link";
import Image from "next/image";
import { NearbyRoom } from "./types";

const TOPIC_COLORS: Record<string, string> = {
  music: "bg-[#6B8F71]/15 text-[#2E3B2F]",
  art: "bg-clay/15 text-clay",
  food: "bg-blush/20 text-[#7a4f30]",
  sports: "bg-sage/15 text-sage",
  tech: "bg-moss/10 text-moss",
  books: "bg-sand/40 text-ink",
  default: "bg-warm text-sage",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

function formatMembers(count: number) {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

export default function RoomCard({
  room,
  index,
}: {
  room: NearbyRoom;
  index: number;
}) {
  const topicKey = room.topic?.toLowerCase() ?? "default";
  const tagClass = TOPIC_COLORS[topicKey] ?? TOPIC_COLORS.default;
  const isVeryClose = room.distance_km < 0.5;

  return (
    <Link
      href={`/rooms/${room.id}`}
      className="group relative flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-[0_2px_16px_rgba(46,59,47,0.06)] hover:shadow-[0_8px_32px_rgba(46,59,47,0.14)] hover:border-sand/80 hover:-translate-y-0.5 transition-all duration-300 no-underline"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Room image or initials avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-[60px] h-[60px] rounded-[18px] overflow-hidden bg-gradient-to-br from-warm to-sand flex items-center justify-center shadow-[0_2px_8px_rgba(46,59,47,0.12)]">
          {room.img ? (
            <Image
              src={room.img}
              alt={room.name}
              width={60}
              height={60}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="font-cormorant text-[22px] font-semibold text-moss/70">
              {getInitials(room.name)}
            </span>
          )}
        </div>
        {room.isLive && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#4CAF76] border-2 border-white shadow-sm">
            <span className="absolute inset-0 rounded-full bg-[#4CAF76] animate-ping opacity-60" />
          </span>
        )}
        {isVeryClose && !room.isLive && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-clay border-2 border-white shadow-sm" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-cormorant text-[17px] font-semibold text-ink leading-tight truncate group-hover:text-moss transition-colors duration-200">
            {room.name}
          </h3>
          <span className="flex-shrink-0 text-[11px] font-dm text-sand tracking-wide">
            {formatDistance(room.distance_km)}
          </span>
        </div>

        {room.description && (
          <p className="text-[13px] font-dm text-sage/80 leading-snug line-clamp-1 mb-2">
            {room.description}
          </p>
        )}

        <div className="flex items-center gap-2">
          {room.topic && (
            <span
              className={`text-[11px] font-dm px-2.5 py-0.5 rounded-full tracking-wide ${tagClass}`}
            >
              {room.topic}
            </span>
          )}
          <div className="flex items-center gap-1 text-[12px] font-dm text-sand ml-auto">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="w-3.5 h-3.5"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>{formatMembers(room.memberCount)}</span>
          </div>
        </div>
      </div>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-4 h-4 text-sand/60 flex-shrink-0 -translate-x-1 group-hover:translate-x-0 group-hover:text-moss/40 transition-all duration-300"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}
