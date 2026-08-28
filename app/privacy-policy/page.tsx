import type { Metadata } from "next";
import { LegalPage, Clause, Draft } from "@/components/Legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Ozmo Diet Clinic collects, uses, stores and protects your personal and health data.",
  alternates: { canonical: "/privacy-policy" },
};

export default function Page() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="We hold health information. That carries real obligations, and we take them seriously."
    >
      <Draft />
      <Clause heading="What we collect">
        <p><strong className="text-[var(--ink)]">Account data</strong> — your name, phone number, email and city.</p>
        <p><strong className="text-[var(--ink)]">Health data</strong> — weight and measurements, health conditions, symptoms, medications and supplements, lab reports you upload, food and water logs, and activity.</p>
        <p><strong className="text-[var(--ink)]">Usage data</strong> — basic, privacy-respecting information about how the site is used. No third-party tracking runs on any logged-in page.</p>
        <p><strong className="text-[var(--ink)]">Payment data</strong> — card and payment details are handled entirely by our payment gateway. We never see or store them.</p>
      </Clause>
      <Clause heading="Why we collect it">
        <p>
          To deliver your programme: to build your plan, to track your progress, to prepare your
          reports, and so your dietitian can give you continuous care. We also keep records where the
          law requires it.
        </p>
      </Clause>
      <Clause heading="Consent">
        <p>
          Consent is asked for explicitly and separately for each purpose: delivering your programme
          (required), marketing communications (optional), use of anonymised data in aggregate
          statistics (optional), and publishing your story (a separate written consent, every time).
          You can withdraw any optional consent at any point.
        </p>
      </Clause>
      <Clause heading="Who can see your data">
        <p>
          Your dietitian, and clinic staff whose role requires it. Front-desk staff can see your name,
          contact details, appointments and payment status — not your health data.
        </p>
        <p>
          <strong className="text-[var(--ink)]">We do not sell your data. We do not share it with
          advertisers, data brokers or insurers.</strong>
        </p>
      </Clause>
      <Clause heading="Your rights">
        <p>
          You can access your data, correct it, export it, and ask us to delete it. Export and
          deletion are available directly from your account settings, without having to ask anyone.
          Where we must retain some clinical records for a defined period, we will tell you exactly
          what is retained and for how long.
        </p>
      </Clause>
      <Clause heading="Security">
        <p>
          Data is encrypted in transit and at rest. Access is restricted by role and logged. Files
          such as lab reports are stored privately and served only through short-lived, single-use
          links. Health data never appears in a URL, a notification message or an analytics event.
        </p>
      </Clause>
      <Clause heading="Children">
        <p>
          Accounts for anyone under 18 require verifiable consent from a parent or guardian. We do not
          run behavioural tracking or targeted advertising on any account.
        </p>
      </Clause>
      <Clause heading="Cookies">
        <p>
          Essential cookies only by default. Analytics runs only with your consent, and never on
          logged-in pages.
        </p>
      </Clause>
      <Clause heading="Contact and grievances">
        <p>
          Our grievance officer&rsquo;s name, contact address and response timeline are being
          finalised and will be published here. In the meantime you can reach us through the contact
          page for any data request.
        </p>
      </Clause>
    </LegalPage>
  );
}
