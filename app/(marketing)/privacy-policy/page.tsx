import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Clause, Draft } from "@/components/Legal";
import { RETENTION } from "@/lib/retention";
import { RETAINED_AFTER_ERASURE } from "@/lib/services/erasure";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Ozmo Diet Clinic collects, uses, stores and protects your personal and health data.",
  alternates: { canonical: "/privacy-policy" },
};

const strong = "text-[var(--ink)]";
const months = (n: number) => `${n} months`;

// Describes the app as built. Periods come from lib/retention.ts so the policy
// and the clean-up job can't drift apart. Wording still needs legal review (see <Draft />).
export default function Page() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="We hold health information. That carries real obligations, and we take them seriously."
    >
      <Draft />
      <Clause heading="What we collect">
        <p><strong className={strong}>Contact details</strong> — your name, phone number, email and city, from the assessment, booking and contact forms or from the clinic when you join.</p>
        <p><strong className={strong}>Health information</strong> — your assessment answers, measurements, health conditions, allergies and food preferences, food and water logs, diet plans, consultation notes, progress reports, messages with your dietitian, and any lab reports or documents you or the clinic upload.</p>
        <p><strong className={strong}>Programme and appointments</strong> — the programme you joined, its dates and the amount paid, and your appointment history. Payment is taken at the clinic; we don&rsquo;t collect or store card details.</p>
        <p><strong className={strong}>Security records</strong> — sign-in attempts (with the network address they came from) and a log of who opened or changed records. These record what happened, never the contents of your health record.</p>
      </Clause>
      <Clause heading="Why we collect it">
        <p>
          To deliver your programme: to build your plan, track your progress, prepare your reports and let your dietitian
          give you continuous care — and to keep your account secure. We also keep records where the law requires it.
        </p>
      </Clause>
      <Clause heading="Consent">
        <p>
          We ask for your consent to be contacted about your enquiry or programme before you submit the assessment,
          booking or contact form. Marketing messages are a separate, optional choice in the assessment, and you can
          withdraw it at any time. Publishing your story would always need a separate written consent.
        </p>
      </Clause>
      <Clause heading="Emails we send">
        <p>
          We email you links and practical details: your portal invitation or password reset, appointment details and
          video-call links, booking confirmations, your Health Snapshot link and a note when a progress report is ready.
        </p>
        <p>
          <strong className={strong}>Emails never contain health details.</strong> To read anything about your health
          you sign in. A copy of each email is kept so the clinic can see it was delivered: the text is erased after{" "}
          {RETENTION.notificationBodyDays} days (immediately for emails containing a sign-in link) and the delivery record
          after {months(RETENTION.notificationRecordMonths)}.
        </p>
      </Clause>
      <Clause heading="Who can see your data">
        <p>Only clinic staff, and only what their role needs:</p>
        <ul className="grid list-disc gap-1.5 pl-5">
          <li>Your dietitian and the clinic administrator — your full record.</li>
          <li>Clinical assistants — your health record, to record measurements and reply to messages, but not to change your plan.</li>
          <li>Front desk — your name, contact details and appointments. Not your health information or documents.</li>
        </ul>
        <p>
          The site runs on a hosting provider and sends email through the clinic&rsquo;s mail provider, who process data only
          to provide those services to us.{" "}
          <strong className={strong}>We do not sell your data. We do not share it with advertisers, data brokers or insurers.</strong>
        </p>
      </Clause>
      <Clause heading="Your rights">
        <p>
          You can see your data in your dashboard and download a copy of everything we hold from{" "}
          <strong className={strong}>Profile → Your data</strong>. Ask your dietitian, or use the{" "}
          <Link href="/contact" className="underline">contact page</Link>, to correct anything.
        </p>
        <p>
          You can ask for your data to be deleted from the same page. The clinic reviews the request, then erases your
          contact details and health information — plans, logs, measurements, reports, documents and messages. Some
          records are kept without your personal details:
        </p>
        <ul className="grid list-disc gap-1.5 pl-5">
          {RETAINED_AFTER_ERASURE.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p>Deleted data can remain in encrypted backups until those backups expire.</p>
      </Clause>
      <Clause heading="How long we keep it">
        <ul className="grid list-disc gap-1.5 pl-5">
          <li>Your client record — for as long as you&rsquo;re a client, and afterwards until you ask us to delete it or the law requires us to keep it.</li>
          <li>Assessments and bookings that didn&rsquo;t lead to a programme — {months(RETENTION.unconvertedLeadMonths)} after the last contact.</li>
          <li>Website enquiries — {months(RETENTION.handledEnquiryMonths)} after they were answered.</li>
          <li>Email text — {RETENTION.notificationBodyDays} days; email delivery records — {months(RETENTION.notificationRecordMonths)}.</li>
          <li>Sign-in protection counters — {RETENTION.throttleDays} days.</li>
        </ul>
      </Clause>
      <Clause heading="Security">
        <p>
          Connections use HTTPS. Passwords are stored as one-way hashes, and uploaded documents are encrypted before
          they&rsquo;re stored. Sessions end after 8 hours; you can sign out of every device at once from your profile, and
          repeated wrong passwords lock an account temporarily. Access is restricted by staff role, record access and
          administrative changes are logged, and health details are kept out of application logs.
        </p>
      </Clause>
      <Clause heading="Cookies">
        <p>
          We use only essential cookies: one keeps you signed in to your dashboard, and one keeps clinic staff signed in to
          the practice area. There are no analytics, advertising or third-party tracking cookies.
        </p>
      </Clause>
      <Clause heading="Children">
        <p>
          Self-service accounts are intended for adults. An account for anyone under 18 will only be created after the
          clinic has verified consent from a parent or guardian.
        </p>
      </Clause>
      <Clause heading="Contact and grievances">
        <p>
          Use the <Link href="/contact" className="underline">contact page</Link> for privacy, export, correction or deletion
          requests. The clinic will verify who is asking before sharing or changing health records, and will confirm the
          grievance contact and response timeline in writing.
        </p>
      </Clause>
    </LegalPage>
  );
}
