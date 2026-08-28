import type { Metadata } from "next";
import { LegalPage, Clause, Draft } from "@/components/Legal";

export const metadata: Metadata = {
  title: "Medical Disclaimer",
  description: "Ozmo provides nutrition and lifestyle guidance. It is not medical care and does not replace your doctor.",
  alternates: { canonical: "/medical-disclaimer" },
};

export default function Page() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Medical Disclaimer"
      intro="Please read this carefully. It describes exactly what Ozmo does and does not do."
    >
      <Draft />
      <Clause heading="Ozmo provides nutrition and lifestyle guidance. It is not medical care.">
        <p>
          The information, plans, assessments and content provided by Ozmo Diet Clinic are for
          general nutrition and lifestyle guidance only. They are not medical advice, diagnosis or
          treatment.
        </p>
      </Clause>
      <Clause heading="Ozmo does not replace your doctor.">
        <p>
          Always seek the advice of your physician or another qualified health provider with any
          questions about a medical condition. Never disregard professional medical advice, or delay
          seeking it, because of something provided by Ozmo.
        </p>
      </Clause>
      <Clause heading="Never change your medication based on our guidance.">
        <p>
          Our dietitians do not prescribe, adjust or discontinue medication. Any change to your
          medication is a decision for your treating doctor.
        </p>
      </Clause>
      <Clause heading="Results vary.">
        <p>
          Nutrition outcomes depend on individual factors including age, sex, medical history,
          medication, genetics, adherence and lifestyle. Nothing on this site is a guarantee of any
          particular result. Any journeys or numbers shown reflect individual experiences.
        </p>
      </Clause>
      <Clause heading="Our assessment is not a diagnostic tool.">
        <p>
          The Ozmo Health Assessment and the Ozmo Health Snapshot are educational, self-reported
          summaries. They do not diagnose any condition and should not be treated as a clinical
          evaluation.
        </p>
      </Clause>
      <Clause heading="In an emergency, do not use this website.">
        <p>
          If you are experiencing a medical emergency, contact your doctor or the nearest hospital
          immediately.
        </p>
      </Clause>
      <Clause heading="Conditions requiring medical supervision.">
        <p>
          Some conditions — including but not limited to eating disorders, advanced kidney or liver
          disease, uncontrolled diabetes, and certain conditions during pregnancy — require medically
          supervised nutrition care. Where we believe this applies, we will tell you and refer you
          appropriately.
        </p>
      </Clause>
    </LegalPage>
  );
}
