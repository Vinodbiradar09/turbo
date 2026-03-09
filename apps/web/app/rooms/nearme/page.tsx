import { headers } from "next/headers";
import { auth } from "@repo/auth";
import { redirect } from "next/navigation";
import { roomsNearMe } from "./actions";
import NearMeClient from "./NearMeClient";
import LocationGate from "./LocationGate";
import { CurrentUser } from "./types";
import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@repo/db";

interface PageProps {
  searchParams: Promise<{
    lat?: string;
    lng?: string;
    room?: string;
    error?: string;
  }>;
}

export default async function NearMePage({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const cookieHeader = (await headers()).get("cookie") ?? "";
  const params = await searchParams;
  console.log("params", params);
  const lat = params.lat ? parseFloat(params.lat) : null;
  const lng = params.lng ? parseFloat(params.lng) : null;
  const hasCoords = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);

  const currentUser: CurrentUser = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: null,
  };

  if (!hasCoords) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F5F0E8] px-6">
        <div className="absolute top-6 left-6">
          <Link
            href="/rooms"
            className="flex items-center gap-2 font-dm text-[13px] text-[#6b7d6c] hover:text-[#2E3B2F] transition-colors"
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
            Back
          </Link>
        </div>
        <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border border-[#2E3B2F]/10 animate-ping"
            style={{ animationDuration: "2s" }}
          />
          <div
            className="absolute inset-5 rounded-full border border-[#2E3B2F]/8 animate-ping"
            style={{ animationDuration: "2s", animationDelay: "0.6s" }}
          />
          <div className="w-14 h-14 rounded-full bg-[#2E3B2F] flex items-center justify-center shadow-[0_8px_32px_rgba(46,59,47,0.3)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              className="w-6 h-6"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
          </div>
        </div>
        {params.error === "denied" ? (
          <>
            <p className="font-cormorant text-[24px] text-[#2E3B2F] mb-2">
              Location access denied
            </p>
            <p className="font-dm text-[13px] text-[#6b7d6c] max-w-70 text-center leading-relaxed">
              Circl needs your location to find rooms nearby. Please allow
              access in your browser settings and try again.
            </p>
          </>
        ) : (
          <>
            <p className="font-cormorant text-[24px] text-[#2E3B2F] mb-2">
              Finding your radius…
            </p>
            <p className="font-dm text-[13px] text-[#6b7d6c] mb-8 text-center">
              Allow location access to discover nearby rooms
            </p>
          </>
        )}
        <LocationGate />
      </div>
    );
  }

  const { rooms } = await roomsNearMe(lat!, lng!, cookieHeader);
  const memberShips = await prisma.roomMember.findMany({
    where: {
      userId: session.user.id,
      roomId: { in: rooms.map((r) => r.id) },
    },
    select: {
      roomId: true,
    },
  });
  const memberRoomIds = new Set(memberShips.map((m) => m.roomId));
  const enrichedRooms = rooms.map((r) => ({
    ...r,
    isMember: memberRoomIds.has(r.id),
  }));
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F5F0E8]">
      <NearMeClient
        initialRooms={enrichedRooms}
        currentUser={currentUser}
        cookieHeader={cookieHeader}
        lat={lat!}
        lng={lng!}
      />
    </div>
  );
}

export const metadata: Metadata = {
  title: "Nearby Rooms · Circl",
};
