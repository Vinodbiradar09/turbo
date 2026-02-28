"use client";

import Link from "next/link";

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-100 flex items-center justify-between px-14 py-7 mix-blend-multiply">
      <div className="font-cormorant text-[28px] font-semibold text-moss tracking-[0.04em]">
        Circl
        <span className="inline-block w-2 h-2 bg-clay rounded-full ml-0.5 align-middle mb-1" />
      </div>

      <ul className="hidden md:flex gap-10 list-none">
        <li>
          <Link
            href="#features"
            className="text-sage text-[13px] tracking-[0.08em] uppercase no-underline hover:text-moss transition-colors duration-300"
          >
            Features
          </Link>
        </li>
        <li>
          <Link
            href="#how"
            className="text-sage text-[13px] tracking-[0.08em] uppercase no-underline hover:text-moss transition-colors duration-300"
          >
            How it works
          </Link>
        </li>
        <li>
          <Link
            href="#stories"
            className="text-sage text-[13px] tracking-[0.08em] uppercase no-underline hover:text-moss transition-colors duration-300"
          >
            Stories
          </Link>
        </li>
        <li>
          <Link
            href="/login"
            className="bg-moss text-cream text-[13px] tracking-[0.06em] no-underline px-7 py-2.75 rounded-full transition-all duration-300 hover:bg-sage hover:-translate-y-px"
          >
            Join the Circl
          </Link>
        </li>
      </ul>
    </nav>
  );
}
