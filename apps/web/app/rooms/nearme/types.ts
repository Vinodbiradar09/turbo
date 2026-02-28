export interface NearbyRoom {
  id: string;
  name: string;
  description?: string;
  img?: string;
  memberCount: number;
  maxMembers: number;
  topic?: string;
  distance_km: number;
  lat: number;
  lng: number;
  expiresAt?: string;
  createdAt?: string;
  isLive?: boolean;
  isDeleted?: boolean;
  isBlacklisted?: boolean;
}

export interface RoomsResponse {
  success: boolean;
  message: string;
  rooms: NearbyRoom[];
}
