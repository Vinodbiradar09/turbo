"use client";

import { useReveal } from "@/hooks/useReveal";

const stats = [
  { num: "50", sup: "k+", label: "People connected" },
  { num: "5", sup: "km", label: "Your personal radius" },
  { num: "12", sup: "k+", label: "Active rooms daily" },
];

export default function StatsBand() {
  const { ref, visible } = useReveal();

  return (
    <div
      ref={ref}
      className="bg-moss grid grid-cols-1 md:grid-cols-3 gap-px relative overflow-hidden px-14 py-14"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(106,143,113,0.2)_0%,transparent_70%)]" />
      {stats.map((s, i) => (
        <div
          key={i}
          className={`text-center relative py-5 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ transitionDelay: `${i * 0.12}s` }}
        >
          {i < stats.length - 1 && (
            <div className="hidden md:block absolute right-0 top-[20%] bottom-[20%] w-px bg-white/10" />
          )}
          <div className="font-cormorant text-[64px] font-light text-cream leading-none mb-2">
            {s.num}
            <sup className="text-[28px] align-super text-blush">{s.sup}</sup>
          </div>
          <div className="text-[12px] tracking-[0.12em] uppercase text-sand">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
