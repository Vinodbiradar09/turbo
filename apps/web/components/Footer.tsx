import Link from "next/link";

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how" },
  { label: "Rooms", href: "/rooms/nearme" },
  { label: "Privacy", href: "/privacy" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <>
      <footer className="bg-ink grid grid-cols-1 md:grid-cols-[1fr_auto] gap-20 items-start px-14 py-18 pb-12">
        <div>
          <div className="font-cormorant text-[28px] font-semibold text-cream tracking-[0.04em] mb-4 block">
            Circl
            <span className="inline-block w-2 h-2 bg-clay rounded-full ml-0.5 align-middle mb-1" />
          </div>
          <p className="text-[14px] text-white/30 leading-[1.6] max-w-70">
            Bringing people together within 5 km. A quieter, more present way to
            connect.
          </p>
        </div>

        <div className="flex gap-12">
          <div>
            <h4 className="text-[11px] tracking-[0.12em] uppercase text-white/30 mb-5">
              Product
            </h4>
            {productLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="block text-white/60 no-underline text-[14px] mb-2.5 transition-colors hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>
          <div>
            <h4 className="text-[11px] tracking-[0.12em] uppercase text-white/30 mb-5">
              Company
            </h4>
            {companyLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="block text-white/60 no-underline text-[14px] mb-2.5 transition-colors hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      <div className="bg-ink border-t border-white/6 px-14 py-6 flex flex-col md:flex-row items-center justify-between gap-2">
        <p className="text-[12px] text-white/25">
          © 2026 Circl. Made with care, for people near you.
        </p>
        <p className="text-[12px] text-white/25">
          Built for communities everywhere.
        </p>
      </div>
    </>
  );
}
