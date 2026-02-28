import Link from "next/link";

export default function AboutPage() {
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

      <div className="pt-40 pb-24 px-14 max-w-4xl">
        <div className="inline-flex items-center gap-2.5 text-[11px] tracking-[0.18em] uppercase text-clay mb-6 before:content-[''] before:block before:w-6 before:h-px before:bg-clay">
          Our story
        </div>
        <h1 className="font-cormorant text-[clamp(52px,7vw,88px)] font-light text-moss leading-[1.04] mb-8">
          We built Circl because
          <br />
          <em className="not-italic text-clay">streets felt empty</em>
        </h1>
        <p className="font-dm text-[17px] text-sage leading-[1.85] max-w-145">
          We live in a world more connected than ever — and somehow lonelier.
          You can talk to someone in Tokyo instantly, but not know the name of
          the person in the flat above you. Circl exists to fix that.
        </p>
      </div>

      <div className="bg-warm">
        <div className="max-w-4xl mx-auto px-14 py-24 space-y-20">
          {[
            {
              label: "The problem",
              heading: "Social media took us away from our streets",
              body: "Global platforms optimise for engagement, not for connection. They reward outrage, performance, and follower counts — none of which exist in real neighbourhoods. We wanted a platform that worked like a good corner café: warm, local, unpretentious, and real.",
            },
            {
              label: "Our answer",
              heading: "A 5 km radius that moves with you",
              body: "Circl is radically local. Every room, every message, every person you meet is within 5 km of where you are right now. Move to a new city? Your world moves with you. The conversations are grounded in shared space — and that changes everything.",
            },
            {
              label: "Our values",
              heading: "Privacy, calm, and no follower counts",
              body: "We deliberately removed the things that make social media toxic. No follower counts. No algorithmic feeds. No ads. No real names. Just people, nearby, talking about things that matter in the moment.",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="grid md:grid-cols-[200px_1fr] gap-12 items-start"
            >
              <div className="font-dm text-[11px] tracking-[0.16em] uppercase text-sand pt-2">
                {s.label}
              </div>
              <div>
                <h2 className="font-cormorant text-[32px] font-light text-moss mb-5">
                  {s.heading}
                </h2>
                <p className="font-dm text-[15px] text-sage leading-[1.8]">
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-moss px-14 py-20">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-1">
          {[
            { n: "50k+", l: "People connected" },
            { n: "12k+", l: "Rooms created daily" },
            { n: "5km", l: "Maximum radius" },
          ].map((s) => (
            <div key={s.l} className="text-center py-8">
              <div className="font-cormorant text-[56px] font-light text-cream leading-none mb-2">
                {s.n}
              </div>
              <div className="font-dm text-[12px] tracking-[0.12em] uppercase text-sand">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-14 py-24 text-center">
        <h2 className="font-cormorant text-[42px] font-light text-moss mb-4">
          Ready to find your radius?
        </h2>
        <p className="font-dm text-[15px] text-sage mb-10">
          Join thousands of people discovering the world around them.
        </p>
        <Link
          href="/login"
          className="inline-block bg-moss text-cream font-dm px-10 py-4 rounded-full hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(46,59,47,0.25)] transition-all duration-300"
        >
          Get started →
        </Link>
      </div>

      <div className="border-t border-sand/30 px-14 py-8 flex items-center justify-between">
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
