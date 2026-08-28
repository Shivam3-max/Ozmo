import type { Metadata } from "next";
import { LegalPage, Clause, Draft } from "@/components/Legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms on which Ozmo Diet Clinic provides its nutrition programmes and services.",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of Service">
      <Draft />
      <Clause heading="What the service is">
        <p>
          Ozmo provides personalised nutrition and lifestyle guidance delivered by a qualified
          dietitian, together with a client dashboard for planning and tracking. It is not medical
          care. See our medical disclaimer.
        </p>
      </Clause>
      <Clause heading="Eligibility">
        <p>
          You must be 18 or over to hold an account in your own name. Accounts for minors require a
          parent or guardian&rsquo;s consent and involvement.
        </p>
      </Clause>
      <Clause heading="Your obligations">
        <p>
          You agree to give us accurate information about your health, your medical conditions and
          your medications, and to tell us when any of it changes. A plan built on incomplete
          information may be unsuitable for you.
        </p>
      </Clause>
      <Clause heading="Programme scope">
        <p>
          Each programme sets out its duration, the number of consultations and follow-ups included,
          plan revisions, and reports. Anything beyond that scope is agreed separately.
        </p>
      </Clause>
      <Clause heading="Bookings, rescheduling and no-shows">
        <p>
          Please reschedule with reasonable notice where you can. Our cancellation window and
          no-show policy are set out in the refund and cancellation policy.
        </p>
      </Clause>
      <Clause heading="Fees">
        <p>
          Fees are confirmed before your programme begins and are inclusive of applicable taxes.
        </p>
      </Clause>
      <Clause heading="Intellectual property">
        <p>
          Your plan and the materials we prepare are licensed to you for your own personal use. Please
          don&rsquo;t redistribute or resell them.
        </p>
      </Clause>
      <Clause heading="Termination">
        <p>
          Either of us may end the relationship. If we don&rsquo;t believe we&rsquo;re the right fit
          for your needs, we&rsquo;ll tell you and help you find appropriate care.
        </p>
      </Clause>
      <Clause heading="Governing law">
        <p>
          These terms are governed by Indian law. Jurisdiction details will be completed on legal
          review.
        </p>
      </Clause>
    </LegalPage>
  );
}
