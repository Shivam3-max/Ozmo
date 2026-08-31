import "dotenv/config";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../lib/generated/prisma/client.js";
import { programs } from "../lib/programs.ts";
import { FOODS } from "./food-seed.ts";
import { PRACTICE_LIBRARY } from "./practice-library.ts";
import { PLAN_TEMPLATES } from "./plan-templates.ts";
import { generateTemplates } from "./templates/generate.ts";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
});

async function main() {
  const clinic = await prisma.clinic.upsert({
    where: { id: "ozmo" },
    update: {},
    create: {
      id: "ozmo",
      name: "Ozmo Diet Clinic",
      timezone: "Asia/Kolkata",
    },
  });
  console.log("clinic:", clinic.name);

  // --- staff -------------------------------------------------------------
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@ozmodietclinic.com";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  let adminPassword: string | null = null;
  if (!existingAdmin) {
    adminPassword = process.env.SEED_ADMIN_PASSWORD ?? randomBytes(9).toString("base64url");
    await prisma.user.create({
      data: {
        clinicId: clinic.id,
        role: "SUPER_ADMIN",
        name: "Ozmo Admin",
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 12),
      },
    });
  }

  const dietitianEmail = process.env.SEED_DIETITIAN_EMAIL ?? "dietitian@ozmodietclinic.com";
  let dietitianPassword: string | null = null;
  if (!(await prisma.user.findUnique({ where: { email: dietitianEmail } }))) {
    dietitianPassword = process.env.SEED_DIETITIAN_PASSWORD ?? randomBytes(9).toString("base64url");
    await prisma.user.create({
      data: {
        clinicId: clinic.id,
        role: "DIETITIAN",
        name: "Ozmo Dietitian",
        email: dietitianEmail,
        passwordHash: await bcrypt.hash(dietitianPassword, 12),
      },
    });
  }

  // --- programmes, from the same source the website renders ---------------
  for (const [i, p] of programs.entries()) {
    await prisma.program.upsert({
      where: { clinicId_slug: { clinicId: clinic.id, slug: p.slug } },
      update: { name: p.name, description: p.oneLiner, followUps: p.followUps, order: i },
      create: {
        clinicId: clinic.id,
        slug: p.slug,
        name: p.name,
        description: p.oneLiner,
        durations: p.duration.match(/\d+/g)?.map(Number) ?? [],
        followUps: p.followUps,
        inclusions: p.tracks,
        order: i,
      },
    });
  }
  console.log("programmes:", programs.length);

  // --- food database ------------------------------------------------------
  let created = 0;
  for (const f of [...FOODS, ...PRACTICE_LIBRARY]) {
    const existing = await prisma.food.findFirst({ where: { clinicId: clinic.id, name: f.name } });
    if (existing) continue;
    await prisma.food.create({
      data: {
        clinicId: clinic.id,
        name: f.name,
        alternateNames: f.alt ?? [],
        category: f.category,
        servingUnit: f.unit,
        servingGrams: f.grams,
        calories: f.kcal,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        fibre: f.fibre,
        glycemicTag: f.gi ?? null,
        conditionTags: f.tags ?? [],
        isVeg: f.veg !== false,
        isVegan: f.vegan === true,
        allergens: f.allergens ?? [],
        defaultType: ("defaultType" in f ? (f as { defaultType: string }).defaultType : "FOOD") as "FOOD",
        isPrep: "isPrep" in f ? Boolean((f as { isPrep?: boolean }).isPrep) : false,
        // Seed values are indicative only — the dietitian must confirm each one
        // before plans built on them go to a client.
        isVerified: false,
      },
    });
    created += 1;
  }
  console.log("library items added:", created, "of", FOODS.length + PRACTICE_LIBRARY.length);

  // --- her real plans, as reusable templates ------------------------------
  let tpls = 0;
  const allTemplates = [...PLAN_TEMPLATES, ...generateTemplates()];
  for (const t of allTemplates) {
    const existing = await prisma.planTemplate.findFirst({ where: { clinicId: clinic.id, name: t.name } });
    if (existing) continue;
    await prisma.planTemplate.create({
      data: {
        clinicId: clinic.id,
        name: t.name,
        description: t.description,
        dietPreference: t.dietPreference ?? null,
        conditions: t.conditions,
        tags: t.tags,
        // Category is the first tag — the library groups on it.
        structure: { dayMode: t.dayMode, dayCount: t.dayCount, days: t.days, sections: t.sections },
      },
    });
    tpls += 1;
  }
  console.log("plan templates added:", tpls, "of", allTemplates.length);

  if (adminPassword || dietitianPassword) {
    console.log("\n─── staff logins (shown once — store them now) ───");
    if (adminPassword) console.log(`  SUPER_ADMIN  ${adminEmail}  ${adminPassword}`);
    if (dietitianPassword) console.log(`  DIETITIAN    ${dietitianEmail}  ${dietitianPassword}`);
    console.log("  Change these before the site is public.\n");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
