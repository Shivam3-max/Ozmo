import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { asArray, asStrings } from "@/lib/json";
import { getProgram } from "@/lib/programs";
import Snapshot, { type SnapshotCard } from "@/components/Snapshot";

// Tokenised and personal — never index it.
export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function SnapshotPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const assessment = await prisma.assessment.findUnique({
    where: { token },
    include: { lead: true },
  });
  if (!assessment) notFound();

  if (assessment.expiresAt && assessment.expiresAt.getTime() < Date.now()) {
    return (
      <div className="mx-auto max-w-[620px] px-6 py-24">
        <h1 className="text-[clamp(30px,4.4vw,42px)]">This snapshot has expired</h1>
        <p className="mt-5 text-[17px] leading-relaxed text-[var(--ink-2)]">
          Snapshots are kept for 30 days. Take the assessment again and we&rsquo;ll prepare a fresh
          one — it only takes four minutes.
        </p>
        <a
          href="/assessment"
          className="mt-8 inline-flex min-h-[54px] items-center rounded-full bg-[var(--ink)] px-7 text-[16px] font-semibold text-white"
        >
          Take the assessment
        </a>
      </div>
    );
  }

  const program = assessment.recommendedProgram ? getProgram(assessment.recommendedProgram) : undefined;

  return (
    <Snapshot
      data={{
        name: assessment.lead?.name ?? "there",
        weightKg: assessment.weightKg,
        bmi: assessment.bmi,
        goal: assessment.goal,
        activity: assessment.activityLevel,
        cards: asArray<SnapshotCard>(assessment.snapshotCards),
        focus: asStrings(assessment.snapshotFocus),
        program: program ? { slug: program.slug, name: program.name } : null,
        caution: assessment.requiresMedicalCaution,
        preparedAt: assessment.completedAt,
      }}
    />
  );
}
