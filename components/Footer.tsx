import Link from "next/link";
import Logo from "./Logo";
import { programs } from "@/lib/programs";
import { conditions } from "@/lib/conditions";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0F2E3D] text-white">
      <div className="grid-layer grid-layer-dark" aria-hidden />
      <div className="relative mx-auto w-full max-w-[1240px] px-6 py-20">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Logo variant="onDark" size={26} showTagline />
            <p className="mt-5 max-w-[26ch] text-[14px] leading-relaxed text-white/60">
              Personalised nutrition and lifestyle programmes, with a dietitian who stays with you.
            </p>
          </div>

          <div>
            <p className="eyebrow mb-4 text-white/45">Programmes</p>
            <ul className="grid gap-2">
              {programs.map((p) => (
                <li key={p.slug}>
                  <Link href={`/programs/${p.slug}`} className="text-[14.5px] text-white/80 hover:text-[var(--accent)]">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4 text-white/45">Conditions</p>
            <ul className="grid gap-2">
              {conditions.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link href={`/conditions/${c.slug}`} className="text-[14.5px] text-white/80 hover:text-[var(--accent)]">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/conditions" className="text-[14.5px] text-[var(--accent)]">
                  See all concerns →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4 text-white/45">Ozmo</p>
            <ul className="grid gap-2">
              <li><Link href="/about" className="text-[14.5px] text-white/80 hover:text-[var(--accent)]">About Ozmo</Link></li>
              <li><Link href="/about/dietitian" className="text-[14.5px] text-white/80 hover:text-[var(--accent)]">Your Dietitian</Link></li>
              <li><Link href="/how-it-works" className="text-[14.5px] text-white/80 hover:text-[var(--accent)]">How It Works</Link></li>
              <li><Link href="/stories" className="text-[14.5px] text-white/80 hover:text-[var(--accent)]">Success Stories</Link></li>
              <li><Link href="/faq" className="text-[14.5px] text-white/80 hover:text-[var(--accent)]">FAQs</Link></li>
              <li><Link href="/contact" className="text-[14.5px] text-white/80 hover:text-[var(--accent)]">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4 text-white/45">Get started</p>
            <ul className="grid gap-2">
              <li><Link href="/assessment" className="text-[14.5px] text-white/80 hover:text-[var(--accent)]">Health Assessment</Link></li>
              <li><Link href="/book" className="text-[14.5px] text-white/80 hover:text-[var(--accent)]">Book a Consultation</Link></li>
              <li><Link href="/login" className="text-[14.5px] text-white/80 hover:text-[var(--accent)]">Client log in</Link></li>
            </ul>
            <Link
              href="/assessment"
              className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-3.5 text-[14.5px] font-semibold text-[#0F2E3D] transition-transform duration-200 hover:-translate-y-0.5"
            >
              Start free assessment
            </Link>
          </div>
        </div>

        <div className="mt-14 border-t border-white/12 pt-6">
          <p className="mb-4 max-w-[80ch] text-[13px] leading-relaxed text-white/50">
            Ozmo Diet Clinic provides nutrition and lifestyle guidance. We do not diagnose, treat or
            cure medical conditions, and we do not replace your doctor. Results vary from person to
            person.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-white/50">
            <span>© {new Date().getFullYear()} Ozmo Diet Clinic</span>
            <Link href="/privacy-policy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/medical-disclaimer" className="hover:text-white">Medical Disclaimer</Link>
            <Link href="/refund-policy" className="hover:text-white">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
