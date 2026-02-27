"use client";

import { useReveal } from "@/hooks/useReveal";

const steps = [
  {
    num: "01",
    title: "Open Circl",
    desc: "Launch the app and Circl gently wakes up your local world. No lengthy setup — just your radius, ready.",
  },
  {
    num: "02",
    title: "See your rooms",
    desc: "Browse rooms created by people within 5 km. Filter by mood, topic, or time of day. Every room feels like a corner café.",
  },
  {
    num: "03",
    title: "Join & chat",
    desc: "Slip into a room, say something real. Conversations are warm, spatial, and free from the pressure of social media.",
  },
  {
    num: "04",
    title: "Create your own",
    desc: "Start a room for anything — a lost cat alert, a sunrise hike, a neighbourhood debate. Your community will find you.",
  },
];

export default function HowItWorks() {
  const { ref, visible } = useReveal();

  return (
    <section id="how" className="bg-warm px-14 py-30">
      <div
        ref={ref}
        className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="inline-flex items-center gap-2.5 text-[11px] tracking-[0.18em] uppercase text-clay mb-5 before:content-[''] before:block before:w-6 before:h-px before:bg-clay">
          How Circl works
        </div>
        <h2 className="font-cormorant text-[clamp(40px,5vw,68px)] font-light leading-[1.1] text-moss max-w-150">
          Simple by <em className="not-italic text-clay">design</em>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mt-20">
        {steps.map((step, i) => (
          <StepCard key={i} step={step} index={i} />
        ))}
      </div>
    </section>
  );
}

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const { ref, visible } = useReveal();

  return (
    <div
      ref={ref}
      className={`relative transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${index * 0.12}s` }}
    >
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute top-7 -right-6 w-12 h-px bg-sand" />
      )}
      <div className="font-cormorant text-[80px] font-light text-sand leading-none mb-5">
        {step.num}
      </div>
      <div className="font-cormorant text-[22px] text-moss mb-3">
        {step.title}
      </div>
      <div className="text-[14px] leading-[1.7] text-sage">{step.desc}</div>
    </div>
  );
}
