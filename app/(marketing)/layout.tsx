import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { headerNav } from "@/lib/header-nav";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[var(--ink)] focus:px-4 focus:py-3 focus:text-white"
      >
        Skip to content
      </a>
      <Header nav={headerNav} />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
