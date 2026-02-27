"use client";

import { useReveal } from "@/hooks/useReveal";

const testimonials = [
  {
    text: '"I met my current best friend in a Circl room about vintage bookshops. She lives literally three streets away. We\'d never spoken before."',
    name: "Sana K.",
    loc: "Bengaluru, India",
    initial: "S",
    color: "#6B8F71",
  },
  {
    text: "\"There's something beautiful about knowing the people you're talking to are right here. It makes every conversation feel warmer.\"",
    name: "Daniel M.",
    loc: "Nairobi, Kenya",
    initial: "D",
    color: "#A07855",
  },
  {
    text: '"I moved to a new city and Circl made it feel like home within a week. I found my running group, my coffee spot, and my people."',
    name: "Léa V.",
    loc: "Lyon, France",
    initial: "L",
    color: "#4A6350",
  },
];

export default function Testimonials() {
  const { ref, visible } = useReveal();

  return (
    <section id="stories" className="px-14 py-30 relative overflow-hidden">
      <div className="absolute top-15 right-20 font-cormorant text-[320px] text-warm leading-none pointer-events-none select-none">
        &ldquo;
      </div>

      <div
        ref={ref}
        className={`relative z-10 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="inline-flex items-center gap-2.5 text-[11px] tracking-[0.18em] uppercase text-clay mb-5 before:content-[''] before:block before:w-6 before:h-px before:bg-clay">
          Real stories
        </div>
        <h2 className="font-cormorant text-[clamp(40px,5vw,68px)] font-light leading-[1.1] text-moss mb-20 max-w-150">
          Words from the <em className="not-italic text-clay">neighbourhood</em>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
        {testimonials.map((t, i) => (
          <TestimonialCard key={i} t={t} index={i} />
        ))}
      </div>
    </section>
  );
}

function TestimonialCard({
  t,
  index,
}: {
  t: (typeof testimonials)[0];
  index: number;
}) {
  const { ref, visible } = useReveal();

  return (
    <div
      ref={ref}
      className={`bg-warm px-11 py-11 rounded-lg border-t-2 border-sand transition-all duration-700 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(46,59,47,0.1)]
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${index * 0.12}s` }}
    >
      <p className="font-cormorant text-[20px] italic leading-[1.6] text-moss mb-7">
        {t.text}
      </p>
      <div className="flex items-center gap-3.5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-cormorant text-[16px] text-white font-semibold"
          style={{ background: t.color }}
        >
          {t.initial}
        </div>
        <div className="text-[13px]">
          <div className="text-moss font-medium mb-0.5">{t.name}</div>
          <div className="text-sand text-[12px]">{t.loc}</div>
        </div>
      </div>
    </div>
  );
}
