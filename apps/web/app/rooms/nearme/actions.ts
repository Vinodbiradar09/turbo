import { NearbyRoom, RoomsResponse } from "./types";
export async function roomsNearMe(
  lat: number,
  lng: number,
  cookieHeader: string,
): Promise<{ rooms: NearbyRoom[]; message: string; success: boolean }> {
  const API_URL = process.env.INTERNAL_API_URL;
  const res = await fetch(`${API_URL}/api/v1/rooms?lat=${lat}&lng=${lng}`, {
    method: "GET",
    headers: {
      cookie: cookieHeader,
      "Content-Type": "application/json",
    },
    cache: "no-cache",
  });

  if (!res.ok) {
    console.error("fetchRoomsNearMe failed:", res.status);
    console.log("ff", res);
    return { rooms: [], message: "Failed to fetch rooms", success: false };
  }
  const data: RoomsResponse = await res.json();
  return data;
}
