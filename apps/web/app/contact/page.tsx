"use client";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-cream">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-14 py-6 bg-cream/80 backdrop-blur-md border-b border-sand/20">
        <Link
          href="/"
          className="font-cormorant text-[26px] font-semibold text-moss tracking-[0.04em]"
        >
          Circl
          <span className="inline-block w-2 h-2 bg-clay rounded-full ml-0.5 align-middle mb-1" />
        </Link>
        <Link
          href="/"
          className="font-dm text-[13px] text-sage hover:text-moss transition-colors"
        >
          ← Back
        </Link>
      </nav>

      <div className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-20 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2.5 text-[11px] tracking-[0.18em] uppercase text-clay mb-6 before:content-[''] before:block before:w-6 before:h-px before:bg-clay">
              Get in touch
            </div>
            <h1 className="font-cormorant text-[clamp(44px,5vw,68px)] font-light text-moss leading-[1.08] mb-8">
              We'd love to
              <br />
              <em className="not-italic text-clay">hear from you</em>
            </h1>
            <p className="font-dm text-[15px] text-sage leading-[1.8] mb-10">
              Whether it's a question about privacy, a bug report, a partnership
              idea, or just a hello — we read every message and reply within 48
              hours.
            </p>
            <div className="space-y-5">
              {[
                { label: "General", value: "hello@circl.app" },
                { label: "Privacy", value: "privacy@circl.app" },
                { label: "Press", value: "press@circl.app" },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-4">
                  <span className="font-dm text-[11px] tracking-[0.12em] uppercase text-sand w-16">
                    {c.label}
                  </span>
                  <span className="font-cormorant text-[18px] text-moss">
                    {c.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-warm border border-sand/40 rounded-3xl p-10 shadow-[0_8px_40px_rgba(46,59,47,0.08)]">
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="font-dm text-[12px] tracking-widest uppercase text-sand mb-2 block">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full bg-white/80 border border-sand/50 rounded-xl px-4 py-3.5 font-dm text-[14px] text-ink placeholder:text-sand/60 focus:outline-none focus:border-moss/40 focus:ring-2 focus:ring-moss/10 transition-all"
                />
              </div>
              <div>
                <label className="font-dm text-[12px] tracking-widest uppercase text-sand mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full bg-white/80 border border-sand/50 rounded-xl px-4 py-3.5 font-dm text-[14px] text-ink placeholder:text-sand/60 focus:outline-none focus:border-moss/40 focus:ring-2 focus:ring-moss/10 transition-all"
                />
              </div>
              <div>
                <label className="font-dm text-[12px] tracking-widest uppercase text-sand mb-2 block">
                  Subject
                </label>
                <select className="w-full bg-white/80 border border-sand/50 rounded-xl px-4 py-3.5 font-dm text-[14px] text-ink focus:outline-none focus:border-moss/40 focus:ring-2 focus:ring-moss/10 transition-all appearance-none">
                  <option>General question</option>
                  <option>Privacy concern</option>
                  <option>Bug report</option>
                  <option>Partnership</option>
                  <option>Press enquiry</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="font-dm text-[12px] tracking-widest uppercase text-sand mb-2 block">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Tell us what's on your mind…"
                  className="w-full bg-white/80 border border-sand/50 rounded-xl px-4 py-3.5 font-dm text-[14px] text-ink placeholder:text-sand/60 focus:outline-none focus:border-moss/40 focus:ring-2 focus:ring-moss/10 transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-moss text-cream font-dm text-[15px] py-4 rounded-2xl hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(46,59,47,0.25)] transition-all duration-300"
              >
                Send message
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-sand/30 px-14 py-8 flex items-center justify-between mt-20">
        <Link
          href="/"
          className="font-cormorant text-[20px] font-semibold text-moss"
        >
          Circl
          <span className="inline-block w-1.5 h-1.5 bg-clay rounded-full ml-0.5 align-middle mb-0.5" />
        </Link>
        <p className="font-dm text-[12px] text-sand">© 2026 Circl.</p>
      </div>
    </div>
  );
}
