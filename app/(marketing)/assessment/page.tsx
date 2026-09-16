import type { Metadata } from "next";
import { Suspense } from "react";
import AssessmentFlow from "@/components/AssessmentFlow";

export const metadata: Metadata = {
  title: "Free Health Assessment",
  description:
    "Answer a few questions about your body, goals, health and routine — and get an instant, personalised Ozmo Health Snapshot. Free, about four minutes, no obligation.",
  alternates: { canonical: "/assessment" },
};

export default function AssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="relative mx-auto w-full max-w-[760px] px-6 py-16 md:py-24">
          <p className="eyebrow">Free health assessment</p>
          <h1 className="mt-6 text-[clamp(38px,5.8vw,64px)] leading-[0.99]">Let&rsquo;s find out where you actually stand</h1>
          <p className="mt-8 text-[clamp(17px,1.7vw,20px)] leading-[1.55] text-[var(--ink-2)]">
            A few questions about your body, your routine and how you eat. At the end you&rsquo;ll get your Ozmo Health
            Snapshot — a personalised summary with your key numbers and a clear first step.
          </p>
        </div>
      }
    >
      <AssessmentFlow />
    </Suspense>
  );
}
