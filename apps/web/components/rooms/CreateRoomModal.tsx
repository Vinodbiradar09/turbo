"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface Props {
  onClose: () => void;
  onCreated: (room: any) => void;
  cookieHeader: string;
  userLat?: number;
  userLng?: number;
}

const TOPICS = [
  "Music",
  "Art",
  "Food",
  "Sports",
  "Tech",
  "Gaming",
  "Books",
  "Film",
  "Nature",
  "Other",
];

export default function CreateRoomModal({
  onClose,
  onCreated,
  cookieHeader,
  userLat,
  userLng,
}: Props) {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [maxMembers, setMaxMembers] = useState(50);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Room name is required");
      return;
    }
    setError(null);
    setCreating(true);

    try {
      // Get location if not passed
      let lat = userLat;
      let lng = userLng;
      if (!lat || !lng) {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 }),
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }

      let imgUrl: string | null = null;

      // Upload image to Cloudinary only if user picked one
      if (imgFile) {
        const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
        const UPLOAD_PRESET =
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "circl_unsigned";
        const formData = new FormData();
        formData.append("file", imgFile);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("folder", "circl/rooms");

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData },
        );
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          imgUrl = data.secure_url;
        }
      }

      // Create room
      const res = await fetch("/api/v1/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          ...(imgUrl ? { img: imgUrl } : {}),
          ...(topic ? { roomVibe: topic.toUpperCase() } : {}),
          maxMembers,
          lat,
          lng,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to create room");
      }

      const data = await res.json();
      onCreated(data.room ?? data);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#F5F0E8] rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.2)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-[#2E3B2F] px-6 pt-6 pb-5 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 right-6 w-28 h-28 rounded-full border border-white/40" />
            <div className="absolute -bottom-6 -left-4 w-24 h-24 rounded-full border border-white/20" />
          </div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <h2 className="font-cormorant text-[28px] font-light text-white leading-tight">
                Create a room
              </h2>
              <p className="font-dm text-[12px] text-white/40 mt-1">
                Your location is used automatically
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Image upload */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-16 h-16 rounded-2xl bg-white border-2 border-dashed border-[#D4C5B0] hover:border-[#2E3B2F]/30 flex items-center justify-center cursor-pointer overflow-hidden transition-colors group"
            >
              {imgPreview ? (
                <Image
                  src={imgPreview}
                  alt="Room"
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-6 h-6 text-[#C4B8A8] group-hover:text-[#2E3B2F] transition-colors"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-dm text-[13px] text-[#2E3B2F] font-medium">
                Room photo
              </p>
              <p className="font-dm text-[11px] text-[#8a9a8b] mt-0.5">
                Optional · tap to upload
              </p>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImgChange}
          />

          {/* Name */}
          <div>
            <label className="font-dm text-[11px] tracking-[0.1em] uppercase text-[#8a9a8b] mb-1.5 block">
              Room name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What's this room about?"
              maxLength={60}
              className="w-full bg-white border border-[#D4C5B0]/60 rounded-xl px-4 py-3 font-dm text-[14px] text-[#2E3B2F] placeholder:text-[#C4B8A8] focus:outline-none focus:border-[#2E3B2F]/40 focus:ring-2 focus:ring-[#2E3B2F]/6 transition-all"
            />
          </div>

          {/* Topic */}
          <div>
            <label className="font-dm text-[11px] tracking-[0.1em] uppercase text-[#8a9a8b] mb-1.5 block">
              Topic
            </label>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(topic === t ? "" : t)}
                  className={`px-3 py-1.5 rounded-full font-dm text-[12px] border transition-all duration-200
                    ${
                      topic === t
                        ? "bg-[#2E3B2F] text-white border-[#2E3B2F]"
                        : "bg-white text-[#6b7d6c] border-[#D4C5B0]/60 hover:border-[#2E3B2F]/30 hover:text-[#2E3B2F]"
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Max members */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-dm text-[11px] tracking-[0.1em] uppercase text-[#8a9a8b]">
                Max members
              </label>
              <span className="font-dm text-[14px] font-semibold text-[#2E3B2F]">
                {maxMembers}
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={200}
              value={maxMembers}
              onChange={(e) => setMaxMembers(Number(e.target.value))}
              className="w-full accent-[#2E3B2F]"
            />
            <div className="flex justify-between mt-1">
              <span className="font-dm text-[10px] text-[#C4B8A8]">2</span>
              <span className="font-dm text-[10px] text-[#C4B8A8]">200</span>
            </div>
          </div>

          {error && (
            <p className="font-dm text-[13px] text-[#C4785A] flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4 flex-shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              {error}
            </p>
          )}

          <button
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            className="w-full bg-[#2E3B2F] text-white font-dm text-[15px] py-4 rounded-2xl hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(46,59,47,0.3)] transition-all duration-300 disabled:opacity-50 disabled:transform-none"
          >
            {creating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Creating…
              </span>
            ) : (
              "Create room"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
