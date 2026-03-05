"use client";
import { useRef, useState, useCallback } from "react";

export function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(async () => {
    if (recording) return; // already recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Pick best supported mimeType (Safari doesn't support audio/webm)
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";

      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorder.current = mr;
      chunks.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      mr.start(100);
      setRecording(true);
      setDuration(0);
      timer.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      console.error("Microphone access denied");
    }
  }, [recording]);

  // Returns the blob when released — caller decides to send or cancel
  const stop = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorder.current) return resolve(null);
      mediaRecorder.current.onstop = () => {
        const type = mediaRecorder.current?.mimeType || "audio/webm";
        const blob = new Blob(chunks.current, { type });
        mediaRecorder.current?.stream.getTracks().forEach((t) => t.stop());
        mediaRecorder.current = null;
        resolve(blob);
      };
      mediaRecorder.current.stop();
      setRecording(false);
      setDuration(0);
      if (timer.current) clearInterval(timer.current);
    });
  }, []);

  const cancel = useCallback(() => {
    if (!mediaRecorder.current) return;
    mediaRecorder.current.stream.getTracks().forEach((t) => t.stop());
    mediaRecorder.current = null;
    chunks.current = [];
    setRecording(false);
    setDuration(0);
    if (timer.current) clearInterval(timer.current);
  }, []);

  const fmt = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return {
    recording,
    duration,
    formattedDuration: fmt(duration),
    start,
    stop,
    cancel,
  };
}
