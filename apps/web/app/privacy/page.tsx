import Link from "next/link";

const sections = [
  {
    id: "identity",
    title: "Your identity is hidden by default",
    content:
      'When you join Circl, you are given a randomly generated unique name — something like "Sisile-Arvel Crynyd". This name has no connection to your real name, email, or any personal information. Your email address is never visible to other users, ever. Other members in a room only see your generated name and nothing else. You can regenerate your name at any time from your profile settings.',
  },
  {
    id: "location",
    title: "Your exact location is never shared",
    content:
      "Circl uses your approximate location to determine which rooms are within your 5 km radius. We only store a generalised cell reference — never your exact GPS coordinates. Other users are never told where you are precisely. Location data is used solely for room discovery and is never sold or shared with any third party.",
  },
  {
    id: "chats",
    title: "Chats are not stored on our servers",
    content:
      "Messages sent inside a Circl room exist only for the duration of that room. When a room expires or is deleted, all messages are permanently purged from our systems. We do not log, archive, or analyse the content of your conversations. There is no message history and no way to retrieve a deleted conversation — by design.",
  },
  {
    id: "rooms",
    title: "Room deletion clears everything",
    content:
      "When a room is deleted — by the creator, by expiry, or by moderation action — all associated data is removed: member lists, messages, room metadata, and any cached content. This is irreversible. We do not keep soft-deleted copies or backups of room content.",
  },
  {
    id: "reporting",
    title: "Report users and rooms — action will be taken",
    content:
      "If you encounter a user or room that violates our community guidelines — harassment, hate speech, spam, or harmful content — you can report them directly from within the app. Every report is reviewed by our moderation team. Verified violations result in immediate action: room removal, user suspension, or permanent ban. Your report is anonymous.",
  },
  {
    id: "data",
    title: "What data we do keep",
    content:
      "To operate Circl, we store: your account email (for authentication only), your generated display name, your profile image if provided via OAuth, and basic session tokens. We do not sell any of this data. We do not run advertising. We do not build behavioural profiles.",
  },
  {
    id: "sharing",
    title: "We will never share your identity",
    content:
      "Your personal information is never shared with other users, advertisers, data brokers, or any third party, except where required by law. Circl's business model is built on community, not surveillance.",
  },
];

export default function PrivacyPage() {
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
      <div className="relative pt-32 pb-20 px-14 overflow-hidden bg-moss">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(106,143,113,0.3)_0%,transparent_60%)]" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2.5 text-[11px] tracking-[0.18em] uppercase text-blush mb-6 before:content-[''] before:block before:w-6 before:h-px before:bg-blush">
            Privacy Policy
          </div>
          <h1 className="font-cormorant text-[clamp(44px,6vw,80px)] font-light text-cream leading-[1.05] mb-6">
            Your privacy is our{" "}
            <em className="not-italic text-blush">promise</em>
          </h1>
          <p className="font-dm text-[16px] text-white/60 leading-relaxed max-w-130">
            Circl is built on trust. Here is everything we do — and don't do —
            with your information. No legalese. Just the truth.
          </p>
          <p className="font-dm text-[12px] text-white/30 mt-6 tracking-wide">
            Last updated: February 2026
          </p>
        </div>
      </div>
      <div className="bg-warm border-b border-sand/30 px-14 py-6">
        <div className="flex flex-wrap gap-3 max-w-4xl">
          {[
            "🔒 Identity hidden by default",
            "📍 Location never shared precisely",
            "💬 Chats not stored on server",
            "🗑️ Room deletion wipes everything",
            "🚨 Reports acted on immediately",
            "🚫 Your data never sold",
          ].map((pill) => (
            <span
              key={pill}
              className="font-dm text-[13px] text-sage bg-white/70 border border-sand/40 px-4 py-2 rounded-full"
            >
              {pill}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-14 py-20">
        <div className="space-y-0">
          {sections.map((section, i) => (
            <div
              key={section.id}
              className={`py-12 ${i < sections.length - 1 ? "border-b border-sand/30" : ""}`}
            >
              <h2 className="font-cormorant text-[26px] font-semibold text-moss mb-4 leading-tight">
                {section.title}
              </h2>
              <p className="font-dm text-[15px] text-sage leading-[1.8]">
                {section.content}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-16 bg-moss rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(106,143,113,0.3)_0%,transparent_70%)]" />
          <div className="relative z-10">
            <h3 className="font-cormorant text-[28px] font-light text-cream mb-3">
              Questions about your privacy?
            </h3>
            <p className="font-dm text-[14px] text-white/60 mb-6">
              Reach out and we'll respond within 48 hours.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-cream text-moss font-dm text-[14px] px-8 py-3.5 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
            >
              Contact us →
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
