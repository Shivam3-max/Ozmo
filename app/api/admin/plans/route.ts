import { NextResponse } from "next/server";
import { z } from "zod";
import { authorize } from "@/lib/auth";
import { apiHandler } from "@/lib/api";
import { createPlan } from "@/lib/services/plans";

export const runtime = "nodejs";

const createSchema = z.object({
  clientId: z.string().min(1),
  templateId: z.string().optional(),
  title: z.string().trim().min(1).max(200).optional(),
});

/** Create a plan — blank, or from a template. */
export const POST = apiHandler(async function POST(req: Request) {
  const session = await authorize("plans.edit");
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Missing client." }, { status: 422 });

  const plan = await createPlan(session, parsed.data);
  return NextResponse.json({ ok: true, planId: plan.id }, { status: 201 });
});
