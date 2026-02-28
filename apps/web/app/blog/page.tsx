import Link from "next/link";

const posts = [
  {
    tag: "Product",
    date: "Feb 2026",
    title: "Why we built Circl around a 5 km radius",
    desc: "The decision to hard-cap proximity at 5 km was deliberate. Here's the thinking behind it.",
    readTime: "4 min read",
  },
  {
    tag: "Community",
    date: "Feb 2026",
    title: "What happened when 1,000 strangers joined the same neighbourhood",
    desc: "Stories from our beta: unexpected friendships, lost cats found, and a surprise piano concert.",
    readTime: "6 min read",
  },
  {
    tag: "Design",
    date: "Jan 2026",
    title: "Designing for calm: how we removed every addictive pattern",
    desc: "No infinite scroll. No red dots. No follower counts. Building against the grain of the attention economy.",
    readTime: "5 min read",
  },
];

export default function BlogPage() {
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

      <div className="pt-40 pb-16 px-14">
        <div className="inline-flex items-center gap-2.5 text-[11px] tracking-[0.18em] uppercase text-clay mb-6 before:content-[''] before:block before:w-6 before:h-px before:bg-clay">
          Journal
        </div>
        <h1 className="font-cormorant text-[clamp(52px,6vw,80px)] font-light text-moss leading-[1.05]">
          Stories from the{" "}
          <em className="not-italic text-clay">neighbourhood</em>
        </h1>
      </div>

      <div className="px-14 pb-24 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-0.5">
          {posts.map((post, i) => (
            <div
              key={i}
              className="group bg-warm p-10 cursor-pointer hover:bg-moss transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-dm text-[11px] tracking-[0.14em] uppercase text-clay group-hover:text-blush transition-colors">
                  {post.tag}
                </span>
                <span className="font-dm text-[11px] text-sand group-hover:text-white/40 transition-colors">
                  {post.date}
                </span>
              </div>
              <h2 className="font-cormorant text-[22px] font-semibold text-moss group-hover:text-cream transition-colors leading-tight mb-4">
                {post.title}
              </h2>
              <p className="font-dm text-[13px] text-sage group-hover:text-cream/60 transition-colors leading-relaxed mb-8">
                {post.desc}
              </p>
              <div className="flex items-center gap-2 font-dm text-[12px] text-sand group-hover:text-cream/50 transition-colors">
                <span>{post.readTime}</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center py-16 border border-dashed border-sand/50 rounded-3xl">
          <p className="font-cormorant text-[24px] text-moss mb-3">
            More stories coming soon
          </p>
          <p className="font-dm text-[14px] text-sage/70">
            We write slowly and carefully. Quality over quantity.
          </p>
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
