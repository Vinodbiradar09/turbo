import { RoomRole } from "@repo/db";

export interface NearbyRoom {
  id: string;
  name: string;
  description?: string;
  img?: string | null;
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
  creatorId?: string;
  isMember?: boolean;
}

export interface RoomsResponse {
  success: boolean;
  message: string;
  rooms: NearbyRoom[];
}

export interface Message {
  id?: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderImage?: string | null;
  content: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO";
  createdAt: number | string;
  pending?: boolean;
  failed?: boolean;
}

export interface ApiMessage {
  id: string;
  content: string;
  createdAt: Date | string;
  offset: string;
  type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO";
  sender: {
    name: string;
    id: string;
    image: string | null;
  };
}

export interface MessagesResponse {
  success: boolean;
  messages: ApiMessage[];
}

export interface Member {
  id: string;
  name: string;
  img: string | null;
  userId: string;
  role: RoomRole;
}

export interface MembersResponse {
  success: boolean;
  members: Member[];
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}
