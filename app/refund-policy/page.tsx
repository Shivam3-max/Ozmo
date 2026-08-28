import type { Metadata } from "next";
import { LegalPage, Clause, Draft } from "@/components/Legal";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "How cancellations, pauses and refunds work for Ozmo consultations and programmes.",
  alternates: { canonical: "/refund-policy" },
};

export default function Page() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Refund & Cancellation"
      intro="Written to be fair to you and workable for a small clinic."
    >
      <Draft />
      <Clause heading="Consultations">
        <p>
          Cancel or reschedule with reasonable notice and there&rsquo;s no charge. Late cancellations
          and no-shows may be charged, because the slot could have gone to someone else.
        </p>
      </Clause>
      <Clause heading="Programmes">
        <p>
          If a programme isn&rsquo;t working for you, tell us early. Unused months can be refunded on
          a pro-rata basis, less the consultation and plan-creation that has already been delivered.
        </p>
      </Clause>
      <Clause heading="What isn't refundable">
        <p>
          Consultations that have taken place and plans that have been delivered. Those are the work
          itself.
        </p>
      </Clause>
      <Clause heading="Pausing">
        <p>
          For genuine reasons — illness, surgery, extended travel — we can pause your programme rather
          than refund it. Talk to us and we&rsquo;ll work it out.
        </p>
      </Clause>
      <Clause heading="How to request one">
        <p>
          Message us through the contact page or your dashboard. Approved refunds go back to the
          original payment method. Exact windows and processing times will be confirmed on legal
          review.
        </p>
      </Clause>
    </LegalPage>
  );
}
