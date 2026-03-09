"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@repo/auth/client";
import CreateRoomModal from "@/components/rooms/CreateRoomModal";

interface Props {
  userName: string;
  userEmail: string;
  cookieHeader: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function getLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({ code: -1, message: "Geolocation not supported" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(err);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) =>
            resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err2) => reject(err2),
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 300_000 },
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  });
}

export default function RoomsDashboard({
  userName,
  userEmail,
  cookieHeader,
}: Props) {
  const router = useRouter();
  const [currentName, setCurrentName] = useState(userName);
  const [generating, setGenerating] = useState(false);
  const [justGenerated, setJustGenerated] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showProfile) return;
    const handler = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setShowProfile(false);
      }
    };
    const t = setTimeout(
      () => document.addEventListener("mousedown", handler),
      50,
    );
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handler);
    };
  }, [showProfile]);

  const handleFindRooms = useCallback(async () => {
    setLocating(true);
    setLocError(null);
    try {
      const { lat, lng } = await getLocation();
      try {
        sessionStorage.setItem("circl_coords", JSON.stringify({ lat, lng }));
      } catch {}
      router.push(`/rooms/nearme?lat=${lat}&lng=${lng}`);
    } catch (err: any) {
      setLocating(false);
      if (err?.code === 1) {
        setLocError(
          "Location access denied. Please enable location in your browser settings and try again.",
        );
      } else {
        try {
          const cached = sessionStorage.getItem("circl_coords");
          if (cached) {
            const { lat, lng } = JSON.parse(cached);
            router.push(`/rooms/nearme?lat=${lat}&lng=${lng}`);
            return;
          }
        } catch {}
        setLocError(
          "Could not determine your location. Please check your connection and try again.",
        );
      }
    }
  }, [router]);

  const handleGenerateName = useCallback(async () => {
    if (generating) return;
    setGenerating(true);
    setJustGenerated(false);
    try {
      const res = await fetch("/api/v1/users/name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        console.error("generateName failed:", res.status, await res.text());
        return;
      }
      const data = await res.json();
      const newName = data?.name ?? data?.user?.name ?? data?.data?.name;
      if (newName) {
        setCurrentName(newName);
        setJustGenerated(true);
        setTimeout(() => setJustGenerated(false), 3000);
      }
    } catch (e) {
      console.error("generateName error:", e);
    } finally {
      setGenerating(false);
    }
  }, [generating]);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await signOut();
      router.push("/login");
    } catch {
      router.push("/login");
    }
  }, [router]);

  const handleRoomCreated = useCallback(
    (room: any) => {
      setShowCreate(false);
      router.push(`/rooms/nearme?room=${room.id}`);
    },
    [router],
  );

  const inits = initials(currentName);

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "#080808", fontFamily: "var(--font-sans)" }}
    >
      {/* Subtle ambient glow — top left only, very dim */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle,rgba(108,99,255,0.06) 0%,transparent 65%)",
        }}
      />

      {/* Nav */}
      <nav
        className="relative z-20 flex items-center justify-between px-10 md:px-16 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="text-white font-semibold tracking-[-0.03em] text-[20px]"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Circl
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#6C63FF] mb-0.5" />
        </div>

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative z-50">
          <button
            onClick={() => setShowProfile((s) => !s)}
            className="flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,255,255,0.16)";
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.07)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,255,255,0.09)";
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.05)";
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0"
              style={{ background: "#6C63FF" }}
            >
              {inits}
            </div>
            <span
              className="text-[13px] font-medium max-w-[120px] truncate"
              style={{
                color: "rgba(255,255,255,0.75)",
                letterSpacing: "-0.01em",
              }}
            >
              {currentName}
            </span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`w-3 h-3 transition-transform duration-200 ${showProfile ? "rotate-180" : ""}`}
              style={{ color: "rgba(255,255,255,0.30)" }}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {showProfile && (
            <div
              className="absolute right-0 top-12 w-72 overflow-hidden"
              style={{
                background: "#0C0C0E",
                border: "1px dashed rgba(255,255,255,0.09)",
                borderRadius: "16px",
                boxShadow:
                  "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)",
              }}
            >
              {/* Profile header */}
              <div
                className="px-5 py-5"
                style={{ borderBottom: "1px dashed rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[14px] font-semibold shrink-0"
                    style={{ background: "#6C63FF" }}
                  >
                    {inits}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className="text-[13px] font-medium truncate"
                        style={{
                          color: "rgba(255,255,255,0.85)",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {currentName}
                      </p>
                      {justGenerated && (
                        <span
                          className="text-[9px] tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-full shrink-0"
                          style={{
                            background: "rgba(108,99,255,0.18)",
                            color: "#9B8EC4",
                            border: "1px solid rgba(108,99,255,0.22)",
                          }}
                        >
                          New
                        </span>
                      )}
                    </div>
                    <p
                      className="text-[11px] truncate"
                      style={{ color: "rgba(255,255,255,0.28)" }}
                    >
                      {userEmail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Generate name */}
              <div
                className="px-5 py-4"
                style={{ borderBottom: "1px dashed rgba(255,255,255,0.07)" }}
              >
                <p
                  className="text-[11px] mb-3 leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.26)" }}
                >
                  Your anonymous identity — others only see this name, never
                  your real info.
                </p>
                <button
                  onClick={handleGenerateName}
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "rgba(108,99,255,0.10)",
                    border: "1px solid rgba(108,99,255,0.20)",
                    color: "#9B8EC4",
                  }}
                  onMouseEnter={(e) => {
                    if (!generating) {
                      (e.currentTarget as HTMLElement).style.background =
                        "#6C63FF";
                      (e.currentTarget as HTMLElement).style.borderColor =
                        "#6C63FF";
                      (e.currentTarget as HTMLElement).style.color = "#ffffff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(108,99,255,0.10)";
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(108,99,255,0.20)";
                    (e.currentTarget as HTMLElement).style.color = "#9B8EC4";
                  }}
                >
                  {generating ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-3.5 h-3.5"
                      >
                        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                        <path d="M21 3v5h-5" />
                      </svg>
                      Generate new name
                    </>
                  )}
                </button>
              </div>

              {/* Actions */}
              <div className="py-1.5">
                <button
                  onClick={() => {
                    setShowProfile(false);
                    router.push("/privacy");
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-[13px] transition-colors text-left"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.78)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.45)")
                  }
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="w-4 h-4 shrink-0"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Privacy policy
                </button>
                <div
                  style={{
                    height: "1px",
                    background: "rgba(255,255,255,0.05)",
                    margin: "2px 20px",
                  }}
                />
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-3 px-5 py-3 text-[13px] transition-colors disabled:opacity-50 text-left"
                  style={{ color: "rgba(255,255,255,0.30)" }}
                  onMouseEnter={(e) => {
                    if (!loggingOut)
                      (e.currentTarget as HTMLElement).style.color =
                        "rgba(255,255,255,0.60)";
                  }}
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.color =
                      "rgba(255,255,255,0.30)")
                  }
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="w-4 h-4 shrink-0"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  {loggingOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-6 text-center">
        {/* Orbit orb */}
        <div className="relative w-32 h-32 mb-12 flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                border: "1px solid rgba(108,99,255,0.12)",
                animationDuration: "3s",
                animationDelay: `${i * 0.9}s`,
                inset: `${i * 12}px`,
              }}
            />
          ))}
          <div
            className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
            style={{
              background: "#6C63FF",
              boxShadow:
                "0 0 0 12px rgba(108,99,255,0.10), 0 0 0 26px rgba(108,99,255,0.05), 0 0 56px rgba(108,99,255,0.30)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              width="28"
              height="28"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
          </div>
        </div>

        <h1
          className="mb-5 leading-[1.05]"
          style={{
            fontSize: "clamp(40px,5vw,64px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            fontFamily: "var(--font-sans)",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.28)" }}>Your radius, </span>
          <span style={{ color: "#ffffff" }}>your</span>
          <br />
          <span style={{ color: "#ffffff" }}>rules.</span>
        </h1>

        <p
          className="text-[15px] leading-[1.8] mb-12 max-w-[400px]"
          style={{ color: "rgba(255,255,255,0.32)", fontWeight: 400 }}
        >
          Anonymous rooms, real conversations. Find people around you or create
          your own space — no follower counts, no algorithmic noise.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
          <button
            onClick={handleFindRooms}
            disabled={locating}
            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-full text-[14px] font-medium transition-all duration-250 hover:-translate-y-px disabled:opacity-60 disabled:transform-none"
            style={{
              background: "#6C63FF",
              color: "#ffffff",
              padding: "13px 32px",
              letterSpacing: "-0.01em",
              boxShadow: "0 0 36px rgba(108,99,255,0.32)",
            }}
          >
            {locating ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Finding rooms…
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="w-4 h-4"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  <path d="M2 12h20" />
                </svg>
                Explore nearby
              </>
            )}
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-full text-[14px] transition-all duration-250 hover:-translate-y-px"
            style={{
              color: "rgba(255,255,255,0.60)",
              border: "1px solid rgba(255,255,255,0.09)",
              padding: "12px 32px",
              letterSpacing: "-0.01em",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,255,255,0.20)";
              (e.currentTarget as HTMLElement).style.color =
                "rgba(255,255,255,0.85)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(255,255,255,0.09)";
              (e.currentTarget as HTMLElement).style.color =
                "rgba(255,255,255,0.60)";
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create a room
          </button>
        </div>

        {locError && (
          <div
            className="mt-6 flex items-start gap-3 px-5 py-4 max-w-sm rounded-xl"
            style={{
              background: "rgba(196,110,142,0.08)",
              border: "1px solid rgba(196,110,142,0.18)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="w-4 h-4 shrink-0 mt-0.5"
              style={{ color: "#C46E8E" }}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <div>
              <p
                className="text-[12px] text-left leading-relaxed"
                style={{ color: "#C46E8E" }}
              >
                {locError}
              </p>
              <button
                onClick={handleFindRooms}
                className="text-[11px] underline mt-1 text-left"
                style={{ color: "#C46E8E" }}
              >
                Try again
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-6 mt-14 flex-wrap justify-center">
          {["Fully anonymous", "Location-based", "No data sold"].map(
            (label) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "rgba(108,99,255,0.40)" }}
                />
                <span
                  className="text-[11px] uppercase tracking-[0.10em]"
                  style={{ color: "rgba(255,255,255,0.22)" }}
                >
                  {label}
                </span>
              </div>
            ),
          )}
        </div>
      </main>

      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreated={handleRoomCreated}
          cookieHeader={cookieHeader}
        />
      )}
    </div>
  );
}
