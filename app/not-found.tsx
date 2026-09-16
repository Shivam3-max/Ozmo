import Link from "next/link";
import Header from "@/components/Header";
import { headerNav } from "@/lib/header-nav";
import Footer from "@/components/Footer";
import { Button, Section, Arrow } from "@/components/ui";

export const metadata = { title: "Page not found" };

/**
 * Any URL outside the site's sections (e.g. /something-mistyped) lands here,
 * with the normal header and footer instead of the bare framework page.
 * Next.js adds noindex to every 404 response.
 */
export default function RootNotFound() {
  return (
    <>
      <Header nav={headerNav} />
      <main id="main">
        <Section backdrop="both">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--accent-text)]">404</p>
          <h1 className="mt-5 text-[clamp(40px,6.4vw,72px)] leading-[0.99]">That page isn&rsquo;t here</h1>
          <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-[var(--ink-2)]">
            It may have moved, or the link might be wrong. Here&rsquo;s where most people are heading.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="/assessment">Take the free assessment <Arrow /></Button>
            <Button href="/programs" variant="outline">See programmes</Button>
            <Button href="/contact" variant="outline">Contact us</Button>
          </div>
          <p className="mt-10 text-[15px] text-[var(--ink-2)]">
            Clients: <Link href="/login" className="underline">log in to your dashboard</Link>.
          </p>
        </Section>
      </main>
      <Footer />
    </>
  );
}
