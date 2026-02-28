"use client";

import { useReveal } from "@/hooks/useReveal";
import Link from "next/link";

export default function CTA() {
  const { ref, visible } = useReveal();

  return (
    <section
      id="join"
      className="bg-moss px-14 py-35 text-center relative overflow-hidden"
    >
      <div className="absolute -top-50 left-1/2 -translate-x-1/2 w-200 h-200 bg-[radial-gradient(ellipse,rgba(106,143,113,0.3)_0%,transparent_65%)] rounded-full" />

      <div
        ref={ref}
        className={`relative z-10 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <h2 className="font-cormorant text-[clamp(40px,5vw,68px)] font-light leading-[1.1] text-cream max-w-175 mx-auto mb-5">
          Your <em className="not-italic text-blush">radius</em> is waiting
        </h2>
        <p className="text-sand text-[17px] leading-[1.7] max-w-120 mx-auto mb-13">
          Be among the first to discover a quieter, more human kind of social.
          Circl is launching soon — claim your place in the neighbourhood.
        </p>
        <div className="flex items-center justify-center gap-6">
          <Link
            href="/login"
            className="bg-cream text-moss px-11 py-4.25 rounded-full font-dm text-[15px] font-medium no-underline shadow-[0_8px_32px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-0.75 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)]"
          >
            Get Started
          </Link>
          <Link
            href="#features"
            className="text-sand border border-white/20 px-10 py-4 rounded-full text-[15px] no-underline transition-all duration-300 hover:border-blush hover:text-cream"
          >
            Learn more
          </Link>
        </div>
      </div>
    </section>
  );
}
