"use client";

import type { PlanDraft } from "@/lib/plan-types";
import { usePlanEditor } from "./plan-builder/usePlanEditor";
import PlanHeader from "./plan-builder/PlanHeader";
import PlanNotices from "./plan-builder/PlanNotices";
import { DaySlots, DayTabs, PlanSections } from "./plan-builder/DayEditor";
import PlanSidebar from "./plan-builder/PlanSidebar";
import type { ClientCtx, LibraryItem } from "./plan-builder/types";

/**
 * The diet plan editor. State and saving live in usePlanEditor; the pieces
 * below only render it and call its actions.
 */
export default function PlanBuilder({
  planId, status, updatedAt, initial, client, library, templates,
}: {
  planId: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  updatedAt: string;
  initial: PlanDraft;
  client: ClientCtx;
  library: LibraryItem[];
  templates: { id: string; name: string }[];
}) {
  const editor = usePlanEditor({ planId, status, updatedAt, initial, client });

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
      <div className="min-w-0">
        <PlanHeader planId={planId} editor={editor} />
        <PlanNotices status={status} editor={editor} />
        <DayTabs editor={editor} />
        <DaySlots editor={editor} />
        <PlanSections editor={editor} />
      </div>
      <PlanSidebar client={client} library={library} templates={templates} editor={editor} />
    </div>
  );
}
