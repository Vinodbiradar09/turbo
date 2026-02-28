"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function LocationGate() {
  const router = useRouter();
  const asked = useRef(false);

  useEffect(() => {
    if (asked.current) return;
    asked.current = true;

    const cached = sessionStorage.getItem("circl_coords");
    if (cached) {
      const { lat, lng } = JSON.parse(cached);
      router.replace(`/rooms/nearme?lat=${lat}&lng=${lng}`);
      return;
    }

    if (!navigator.geolocation) {
      router.replace("/rooms/nearme?error=no_geo");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        sessionStorage.setItem("circl_coords", JSON.stringify({ lat, lng }));
        router.replace(`/rooms/nearme?lat=${lat}&lng=${lng}`);
      },
      () => {
        router.replace("/rooms/nearme?error=denied");
      },
      { timeout: 8000, maximumAge: 300_000 },
    );
  }, [router]);

  return null;
}
