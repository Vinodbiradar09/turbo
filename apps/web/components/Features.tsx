"use client";

import { useReveal } from "@/hooks/useReveal";

const features = [
  {
    title: "Local Rooms",
    desc: "Step into topic-based rooms where everyone inside is within your neighbourhood. From sunrise walks to late-night book clubs — your people are near.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="w-6 h-6"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Instant Proximity",
    desc: "The moment you open Circl, it softly maps the world around you. Your 5 km radius is dynamically yours — move, and your world moves with you.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="w-6 h-6"
      >
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    ),
  },
  {
    title: "Calm & Private",
    desc: "No follower counts, no algorithmic noise. Circl is designed to feel quiet and safe. Your exact location is never shared — only your neighbourhood.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="w-6 h-6"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Meaningful Chat",
    desc: "Every message is grounded in real place. The barista, the dog-walker, the architect next door — Circl gives casual words a sense of belonging.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="w-6 h-6"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: "Live Moments",
    desc: "Flash rooms appear for events, weather, local news — conversations born in the moment for the moment. Authentic and always fresh.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="w-6 h-6"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    title: "Neighbourhood Soul",
    desc: "Circl helps streets feel like streets again. Discover shared interests with people you pass every day — and finally say hello.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="w-6 h-6"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
];

export default function Features() {
  const { ref, visible } = useReveal();

  return (
    <section id="features" className="px-14 py-30">
      <div
        ref={ref}
        className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="inline-flex items-center gap-2.5 text-[11px] tracking-[0.18em] uppercase text-clay mb-5 before:content-[''] before:block before:w-6 before:h-px before:bg-clay">
          Why Circl
        </div>
        <h2 className="font-cormorant text-[clamp(40px,5vw,68px)] font-light leading-[1.1] text-moss mb-18 max-w-150">
          Closeness is the <em className="not-italic text-clay">new</em>{" "}
          connection
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5">
        {features.map((f, i) => (
          <FeatureCard key={i} feature={f} index={i} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const { ref, visible } = useReveal();

  return (
    <div
      ref={ref}
      className={`bg-warm hover:bg-moss px-11 py-13 relative overflow-hidden transition-all duration-500 cursor-default group
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${(index % 3) * 0.12}s` }}
    >
      <div className="absolute bottom-0 right-0 w-30 h-30 rounded-full bg-moss/5 translate-x-[40%] translate-y-[40%] transition-all duration-500 group-hover:bg-cream/5 group-hover:translate-x-[10%] group-hover:translate-y-[10%] group-hover:scale-[1.4]" />
      <div className="w-13 h-13 bg-moss/8 rounded-2xl flex items-center justify-center mb-7 transition-all duration-500 group-hover:bg-cream/12">
        <div className="text-moss group-hover:text-cream transition-colors duration-500">
          {feature.icon}
        </div>
      </div>

      <div className="font-cormorant text-[26px] font-normal text-moss mb-3.5 transition-colors duration-500 group-hover:text-cream">
        {feature.title}
      </div>
      <div className="text-[14px] leading-[1.7] text-sage transition-colors duration-500 group-hover:text-cream/70">
        {feature.desc}
      </div>
    </div>
  );
}
