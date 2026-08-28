import type { Metadata } from "next";
import { Section, SectionHeader, Card } from "@/components/ui";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Ozmo Diet Clinic",
  description: "Visit, call or message Ozmo Diet Clinic. Book a consultation in the clinic or online.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        badge="We reply within a working day"
        live
        title={<>Get in <span className="hl">touch</span></>}
        lead="Book a consultation, ask a question, or just find out whether we're the right fit."
        primary={{ href: "/book", label: "Book a consultation" }}
        secondary={{ href: "/assessment", label: "Take the free assessment" }}
      />

      <Section backdrop="grid">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { t: "Visit the clinic", b: "Clinic address and opening hours are being finalised for publication. Message us and we'll send you directions.", a: "" },
            { t: "Call or WhatsApp", b: "The fastest way to reach us for anything time-sensitive. Contact number publishing shortly.", a: "" },
            { t: "Email", b: "For programme enquiries, reports and billing. Address publishing shortly.", a: "" },
          ].map((c) => (
            <Card key={c.t} hover>
              <h2 className="text-[21px]">{c.t}</h2>
              <p className="mt-3 text-[15.5px] leading-relaxed text-[var(--ink-2)]">{c.b}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="tint">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeader
              eyebrow="Message us"
              title="Send us a message"
              lead="Tell us what you're dealing with and we'll come back to you properly — not with a sales script."
            />
            <div className="mt-9 rounded-2xl border border-[var(--alert)]/25 bg-[var(--alert)]/6 px-6 py-5">
              <p className="text-[14.5px] leading-relaxed text-[var(--ink-2)]">
                Please don&rsquo;t send medical emergencies through this form. For anything urgent or
                medical, contact your doctor or the nearest hospital.
              </p>
            </div>
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
