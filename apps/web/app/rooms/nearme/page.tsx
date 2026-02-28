import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@repo/auth";
import { redirect } from "next/navigation";
import { roomsNearMe } from "./actions";
import RoomCard from "./RoomCard";
import RoomSkeleton from "./RoomSkeleton";
import LocationGate from "./LocationGate";
import RefreshRooms from "./RefreshRooms";
import { NearbyRoom } from "./types";

interface PageProps {
  searchParams: Promise<{
    lat?: string;
    lng?: string;
    error?: string;
  }>;
}

export default async function NearMePage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/login");
  const cookieHeader = (await headers()).get("cookie") ?? "";

  const params = await searchParams;
  const lat = params.lat ? parseFloat(params.lat) : null;
  const lng = params.lng ? parseFloat(params.lng) : null;
  const error = params.error;
  const hasCoords = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);

  return (
    <div className="min-h-screen bg-cream relative">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-warm via-sand/30 to-transparent rounded-bl-full opacity-60 pointer-events-none -z-0" />
      <div className="fixed bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-warm/80 to-transparent rounded-tr-full opacity-40 pointer-events-none -z-0" />

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-6 pb-24 min-h-screen">
        {error === "denied" && <LocationError type="denied" />}
        {error === "no_geo" && <LocationError type="no_geo" />}

        {!error && !hasCoords && <WaitingForLocation />}

        {!error && hasCoords && (
          <Suspense
            fallback={
              <>
                <PageHeader lat={lat!} lng={lng!} />
                <RoomSkeleton />
              </>
            }
          >
            <RoomsWithHeader
              lat={Number(lat)}
              lng={Number(lng)}
              cookieHeader={cookieHeader}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}

async function RoomsWithHeader({
  lat,
  lng,
  cookieHeader,
}: {
  lat: number;
  lng: number;
  cookieHeader: string;
}) {
  const { rooms } = await roomsNearMe(lat, lng, cookieHeader);

  return (
    <>
      <PageHeader lat={lat} lng={lng} roomCount={rooms.length} />
      <RoomsList rooms={rooms} />
    </>
  );
}

function RoomsList({ rooms }: { rooms: NearbyRoom[] }) {
  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-warm flex items-center justify-center mb-5 shadow-inner">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            className="w-7 h-7 text-sand"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <p className="font-cormorant text-[22px] text-moss mb-2">
          Quiet around here
        </p>
        <p className="font-dm text-[14px] text-sage/70 max-w-[260px] leading-relaxed">
          No active rooms within your radius right now. Try refreshing or come
          back soon.
        </p>
      </div>
    );
  }

  const veryClose = rooms.filter((r) => r.distance_km < 0.5);
  const nearby = rooms.filter(
    (r) => r.distance_km >= 0.5 && r.distance_km <= 2,
  );
  const further = rooms.filter((r) => r.distance_km > 2);

  let idx = 0;
  return (
    <div className="flex flex-col gap-8">
      {veryClose.length > 0 && (
        <RoomGroup
          label="Right beside you"
          rooms={veryClose}
          startIndex={idx}
        />
      )}
      {nearby.length > 0 && (
        <RoomGroup
          label="Nearby"
          rooms={nearby}
          startIndex={(idx += veryClose.length)}
        />
      )}
      {further.length > 0 && (
        <RoomGroup
          label="A little further"
          rooms={further}
          startIndex={(idx += nearby.length)}
        />
      )}
    </div>
  );
}

function RoomGroup({
  label,
  rooms,
  startIndex,
}: {
  label: string;
  rooms: NearbyRoom[];
  startIndex: number;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3 px-1">
        <span className="text-[11px] font-dm tracking-[0.14em] uppercase text-sand">
          {label}
        </span>
        <div className="flex-1 h-px bg-sand/30" />
        <span className="text-[11px] font-dm text-sand/60">{rooms.length}</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {rooms.map((room, i) => (
          <RoomCard key={room.id} room={room} index={startIndex + i} />
        ))}
      </div>
    </div>
  );
}

function PageHeader({
  roomCount,
  lat,
  lng,
}: {
  roomCount?: number;
  lat?: number;
  lng?: number;
}) {
  return (
    <div className="flex items-center justify-between mb-6 px-1">
      <div>
        <h1 className="font-cormorant text-[28px] font-semibold text-ink leading-tight">
          Nearby Rooms
        </h1>
        {lat && lng && (
          <p className="font-dm text-[12px] text-sand mt-0.5 tracking-wide">
            Within your 5 km radius
            {roomCount !== undefined &&
              ` · ${roomCount} room${roomCount !== 1 ? "s" : ""}`}
          </p>
        )}
      </div>
      <RefreshRooms />
    </div>
  );
}

function LocationError({ type }: { type: "denied" | "no_geo" }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-clay/10 flex items-center justify-center mb-6">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          className="w-9 h-9 text-clay"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
      </div>
      <h2 className="font-cormorant text-[26px] font-light text-moss mb-3">
        {type === "denied" ? "Location access denied" : "Location unavailable"}
      </h2>
      <p className="font-dm text-[14px] text-sage/80 max-w-[280px] leading-relaxed mb-8">
        {type === "denied"
          ? "Circl needs your location to find rooms near you. Please allow access in your browser settings."
          : "Your browser doesn't support location services. Try a different browser."}
      </p>
      <RefreshRooms />
    </div>
  );
}

function WaitingForLocation() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-sand animate-ping opacity-30" />
        <div
          className="absolute inset-3 rounded-full border border-sand animate-ping opacity-20"
          style={{ animationDelay: "0.5s" }}
        />
        <div className="w-12 h-12 rounded-full bg-moss flex items-center justify-center shadow-[0_0_0_8px_rgba(46,59,47,0.08)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#F7F3EE"
            strokeWidth="1.8"
            className="w-5 h-5"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
          </svg>
        </div>
      </div>
      <p className="font-cormorant text-[22px] text-moss mb-2">
        Finding your radius…
      </p>
      <p className="font-dm text-[13px] text-sage/70">
        Allow location access to discover nearby rooms
      </p>
      <LocationGate />
    </div>
  );
}

export const metadata = {
  title: "Rooms Near You · Circl",
  description: "Discover conversations happening within your 5 km radius.",
};
