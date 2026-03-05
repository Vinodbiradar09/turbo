import { z } from "zod";
import geohash from "ngeohash";

const createRoomSchema = z.object({
  name: z.string().min(1, "Name is required"),
  img: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  roomVibe: z
    .enum([
      "MUSIC",
      "ART",
      "FOOD",
      "SPORTS",
      "TECH",
      "GAMING",
      "BOOKS",
      "FILM",
      "NATURE",
      "OTHER",
    ])
    .optional(),
});

const joinRoomSchema = z.object({
  roomId: z.string(),
});

const leaveRoomSchema = z.object({
  roomId: z.string(),
});

const makeAdminSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
});

const degradeAdminSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
});

const deleteRoomSchema = z.object({
  roomId: z.string(),
});

const removeMemberSchema = z.object({
  roomId: z.string(),
  userId: z.string(),
});

const removeMembersSchema = z.object({
  userIds: z.array(z.string()),
});

const deleteMessagesSchema = z.object({
  messageIds: z.array(z.string()),
});

const editMessageSchema = z.object({
  content: z.string(),
});

const blacklistRoomSchema = z.object({
  reason: z.string(),
});

const reportUser = z.object({
  reason: z.string(),
});

// will setup the geoHash here
export const GEO_PRECISION = 5;
export const RADIUS_KM = 5;
export const EARTH_RADIUS_KM = 6371;

export function getUserCells(lat: number, lng: number): string[] {
  const center = geohash.encode(lat, lng, GEO_PRECISION);
  const neighbours = geohash.neighbors(center);
  return [center, ...Object.values(neighbours)];
}

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getRoomCells(lat: number, lng: number): string[] {
  // A room belongs to its own cell + neighbors
  // so it gets indexed in all cells that might query it
  const center = geohash.encode(lat, lng, GEO_PRECISION);
  const neighbors = geohash.neighbors(center);
  return [center, ...Object.values(neighbors)];
}

export {
  createRoomSchema,
  joinRoomSchema,
  leaveRoomSchema,
  makeAdminSchema,
  deleteRoomSchema,
  degradeAdminSchema,
  removeMemberSchema,
  deleteMessagesSchema,
  editMessageSchema,
  removeMembersSchema,
  blacklistRoomSchema,
  reportUser,
};
