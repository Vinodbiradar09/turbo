import Link from "next/link";

const roles = [
  {
    title: "Full-Stack Engineer",
    team: "Engineering",
    type: "Remote",
    desc: "Help us build the infrastructure that connects neighbourhoods at scale. We work with Next.js, Node.js, Redis, and PostgreSQL.",
  },
  {
    title: "Product Designer",
    team: "Design",
    type: "Remote",
    desc: "Shape the visual language of local connection. We care deeply about calm design, typography, and motion.",
  },
  {
    title: "Community Lead",
    team: "Growth",
    type: "Remote",
    desc: "Grow Circl city by city, neighbourhood by neighbourhood. Part strategist, part storyteller.",
  },
];

export default function CareersPage() {
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

      <div className="relative pt-40 pb-24 px-14 overflow-hidden">
        <div className="absolute top-0 right-0 w-125 h-125 bg-linear-to-bl from-warm to-transparent opacity-60 pointer-events-none" />
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2.5 text-[11px] tracking-[0.18em] uppercase text-clay mb-6 before:content-[''] before:block before:w-6 before:h-px before:bg-clay">
            Careers
          </div>
          <h1 className="font-cormorant text-[clamp(52px,6vw,80px)] font-light text-moss leading-[1.05] mb-8">
            Build something that
            <br />
            <em className="not-italic text-clay">actually matters</em>
          </h1>
          <p className="font-dm text-[16px] text-sage leading-[1.85] max-w-130">
            We're a small team building the local social layer the world is
            missing. If you care about human connection, privacy, and craft —
            we'd love to meet you.
          </p>
        </div>
      </div>

      <div className="bg-warm px-14 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-cormorant text-[36px] font-light text-moss mb-12">
            How we work
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Fully remote",
                desc: "Work from wherever. We operate async-first across time zones.",
              },
              {
                title: "Small & focused",
                desc: "We're intentionally small. Every person has real impact.",
              },
              {
                title: "Mission-driven",
                desc: "We're not optimising for engagement metrics. We're fixing loneliness.",
              },
            ].map((v) => (
              <div key={v.title}>
                <h3 className="font-cormorant text-[22px] text-moss mb-3">
                  {v.title}
                </h3>
                <p className="font-dm text-[14px] text-sage leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-14 py-24 max-w-4xl mx-auto">
        <h2 className="font-cormorant text-[36px] font-light text-moss mb-12">
          Open roles
        </h2>
        <div className="space-y-0.5">
          {roles.map((role) => (
            <div
              key={role.title}
              className="group bg-warm hover:bg-moss transition-all duration-300 p-8 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-dm text-[11px] tracking-[0.12em] uppercase text-clay group-hover:text-blush transition-colors">
                      {role.team}
                    </span>
                    <span className="font-dm text-[11px] text-sand group-hover:text-white/40 transition-colors">
                      · {role.type}
                    </span>
                  </div>
                  <h3 className="font-cormorant text-[24px] font-semibold text-moss group-hover:text-cream transition-colors mb-3">
                    {role.title}
                  </h3>
                  <p className="font-dm text-[14px] text-sage group-hover:text-cream/60 transition-colors leading-relaxed">
                    {role.desc}
                  </p>
                </div>
                <div className="shrink-0 w-10 h-10 rounded-full border border-sand/40 group-hover:border-white/20 flex items-center justify-center mt-1 transition-colors">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-4 h-4 text-moss group-hover:text-cream transition-colors"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-moss rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(106,143,113,0.3)_0%,transparent_70%)]" />
          <div className="relative z-10">
            <p className="font-cormorant text-[26px] font-light text-cream mb-3">
              Don't see your role?
            </p>
            <p className="font-dm text-[14px] text-white/60 mb-6">
              We always want to hear from exceptional people.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-cream text-moss font-dm text-[14px] px-8 py-3.5 rounded-full hover:-translate-y-0.5 transition-all duration-300"
            >
              Get in touch →
            </Link>
          </div>
        </div>
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
