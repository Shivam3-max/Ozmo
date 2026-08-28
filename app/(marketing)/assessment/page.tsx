import type { Metadata } from "next";
import { Suspense } from "react";
import AssessmentFlow from "@/components/AssessmentFlow";

export const metadata: Metadata = {
  title: "Free Health Assessment",
  description:
    "Answer a few questions about your body, goals, health and routine — and get an instant, personalised Ozmo Health Snapshot. Free, about four minutes, no obligation.",
  robots: { index: true, follow: true },
};

export default function AssessmentPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[720px] px-6 py-24">Loading…</div>}>
      <AssessmentFlow />
    </Suspense>
  );
}
