"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RefreshRooms() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);

    const refresh = (lat: number, lng: number) => {
      sessionStorage.setItem("circl_coords", JSON.stringify({ lat, lng }));
      router.replace(`/rooms/nearme?lat=${lat}&lng=${lng}`);
      setTimeout(() => setLoading(false), 800);
    };

    if (!navigator.geolocation) {
      const cached = sessionStorage.getItem("circl_coords");
      if (cached) {
        const { lat, lng } = JSON.parse(cached);
        refresh(lat, lng);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => refresh(pos.coords.latitude, pos.coords.longitude),
      () => {
        // Use cached if denied
        const cached = sessionStorage.getItem("circl_coords");
        if (cached) {
          const { lat, lng } = JSON.parse(cached);
          refresh(lat, lng);
        } else {
          setLoading(false);
        }
      },
      { timeout: 6000, maximumAge: 60_000 },
    );
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="group relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-moss/10 border border-moss/20 text-moss text-[13px] font-dm tracking-[0.04em] transition-all duration-300 hover:bg-moss hover:text-cream hover:border-moss disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={`w-4 h-4 transition-transform duration-500 ${loading ? "animate-spin" : "group-hover:rotate-180"}`}
      >
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
      </svg>
      {loading ? "Finding rooms…" : "Refresh nearby"}
    </button>
  );
}
