import type { Metadata } from "next";
import { Section } from "@/components/ui";
import PageHero from "@/components/PageHero";
import BookingForm from "@/components/BookingForm";

export const metadata: Metadata = {
  title: "Book a Consultation",
  description:
    "Book a consultation with an Ozmo dietitian, in the clinic or online. Choose a time that suits you.",
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", href: "/" }, { label: "Book" }]}
        badge="In clinic or online"
        title={<>Book your <span className="hl">consultation</span></>}
        lead="A proper conversation about your health, your food and what's realistic for you — not a form-filling exercise."
        chips={["45–60 minutes", "Bring your reports", "Plan follows shortly after"]}
        note="Haven't done the free assessment yet? It makes the consultation considerably more useful."
      />
      <Section backdrop="grid">
        <BookingForm />
      </Section>
    </>
  );
}
