"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.9,
    delay,
    ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  },
});

const userDots = [
  {
    label: "A",
    tag: "Art talk nearby",
    color: "#6B8F71",
    top: "12%",
    left: "55%",
    anim: "float",
  },
  {
    label: "M",
    tag: "Coffee run?",
    color: "#A07855",
    top: "60%",
    left: "15%",
    anim: "float-delay-1",
  },
  {
    label: "J",
    tag: "2.1 km away",
    color: "#4A6350",
    top: "70%",
    left: "65%",
    anim: "float-delay-2",
  },
  {
    label: "R",
    tag: "Music room",
    color: "#8B6E52",
    top: "20%",
    left: "18%",
    anim: "float-delay-3",
  },
];

export default function Hero() {
  return (
    <section className="min-h-screen grid grid-cols-1 md:grid-cols-2 items-center px-14 pt-30 pb-20 relative overflow-hidden">
      <div className="absolute -right-25 top-1/2 -translate-y-1/2 w-180 h-180 bg-gradient-radial from-warm via-sand to-transparent animate-morph z-0 opacity-80" />

      <div className="relative z-10">
        <motion.div
          {...fadeUp(0.2)}
          className="inline-flex items-center gap-2.5 text-[11px] tracking-[0.18em] uppercase text-clay mb-9 before:content-[''] before:block before:w-8 before:h-px before:bg-clay"
        >
          Your world within reach
        </motion.div>

        <motion.div {...fadeUp(0.25)} className="mb-8">
          <div className="inline-flex items-center gap-2 bg-clay/10 border border-clay/25 rounded-full py-1.5 pr-3.5 pl-2 text-[12px] text-clay tracking-[0.04em]">
            <div className="w-5 h-5 bg-clay rounded-full flex items-center justify-center animate-pulse_clay">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                className="w-2.5 h-2.5"
              >
                <circle cx="12" cy="12" r="5" />
              </svg>
            </div>
            5 km radius · Real people · Real moments
          </div>
        </motion.div>

        <motion.h1
          {...fadeUp(0.35)}
          className="font-cormorant text-[clamp(60px,7vw,96px)] font-light leading-[1.05] text-moss mb-8"
        >
          Meet the
          <br />
          <em className="not-italic text-clay">world just</em>
          <br />
          around you
        </motion.h1>
        <motion.p
          {...fadeUp(0.5)}
          className="text-[17px] leading-[1.75] text-sage max-w-110 mb-13"
        >
          Circl connects you with the people living, breathing, and existing
          within your 5 km radius. Join local rooms, spark conversations, and
          discover a community that&apos;s always been right beside you.
        </motion.p>

        <motion.div {...fadeUp(0.65)} className="flex items-center gap-7">
          <Link
            href="/login"
            className="bg-moss text-cream px-10 py-4.25 rounded-full font-dm text-[15px] font-normal tracking-[0.04em] no-underline shadow-[0_8px_32px_rgba(46,59,47,0.22)] transition-all duration-300 hover:-translate-y-0.75 hover:shadow-[0_16px_48px_rgba(46,59,47,0.3)] hover:bg-sage"
          >
            Get Started
          </Link>
          <Link
            href="#how"
            className="text-sage text-[14px] tracking-[0.05em] flex items-center gap-2 no-underline transition-all duration-300 hover:text-moss hover:gap-3.5 group"
          >
            See how it works
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-4.5 h-4.5 transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.7 }}
        className="hidden md:flex justify-center items-center relative z-10"
      >
        <div className="relative w-100 h-100">
          <div className="absolute inset-0 rounded-full border border-sand animate-ripple" />
          <div className="absolute inset-[15%] rounded-full border border-sand animate-ripple-delay-1" />
          <div className="absolute inset-[30%] rounded-full border border-sand animate-ripple-delay-2" />

          {userDots.map((dot, i) => (
            <div
              key={i}
              className={`absolute flex flex-col items-center gap-1.5 animate-${dot.anim}`}
              style={{ top: dot.top, left: dot.left }}
            >
              <div
                className="w-11 h-11 rounded-full border-[2.5px] border-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] flex items-center justify-center font-cormorant text-[18px] text-white font-semibold"
                style={{ background: dot.color }}
              >
                {dot.label}
              </div>
              <div className="bg-white rounded-full px-2.5 py-1 text-[11px] text-sage shadow-[0_2px_12px_rgba(0,0,0,0.08)] whitespace-nowrap">
                {dot.tag}
              </div>
            </div>
          ))}

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-moss rounded-full flex items-center justify-center shadow-[0_0_0_12px_rgba(46,59,47,0.08),0_0_0_24px_rgba(46,59,47,0.04)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F7F3EE"
              strokeWidth="1.8"
              className="w-7 h-7"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
          </div>
        </div>
      </motion.div>

      <div className="hidden md:flex absolute bottom-12 left-14 items-center gap-3 text-[11px] tracking-[0.12em] uppercase text-sand opacity-0 animate-fadeIn-slow">
        <div className="w-px h-12 bg-linear-to-b from-sand to-transparent animate-scrollLine" />
        Explore
      </div>
    </section>
  );
}
