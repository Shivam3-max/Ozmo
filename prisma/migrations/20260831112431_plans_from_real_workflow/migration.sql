/*
  Warnings:

  - You are about to drop the `PlanMeal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `notes` on the `DietPlan` table. All the data in the column will be lost.
  - You are about to drop the column `slot` on the `FoodLog` table. All the data in the column will be lost.
  - You are about to drop the column `dayOfWeek` on the `PlanDay` table. All the data in the column will be lost.
  - You are about to drop the column `calories` on the `PlanItem` table. All the data in the column will be lost.
  - You are about to drop the column `carbs` on the `PlanItem` table. All the data in the column will be lost.
  - You are about to drop the column `customName` on the `PlanItem` table. All the data in the column will be lost.
  - You are about to drop the column `fat` on the `PlanItem` table. All the data in the column will be lost.
  - You are about to drop the column `fibre` on the `PlanItem` table. All the data in the column will be lost.
  - You are about to drop the column `isAlternative` on the `PlanItem` table. All the data in the column will be lost.
  - You are about to drop the column `planMealId` on the `PlanItem` table. All the data in the column will be lost.
  - You are about to drop the column `protein` on the `PlanItem` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `PlanItem` table. All the data in the column will be lost.
  - You are about to drop the column `whyThisWorks` on the `PlanItem` table. All the data in the column will be lost.
  - You are about to drop the column `calorieBand` on the `PlanTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `foodPreference` on the `PlanTemplate` table. All the data in the column will be lost.
  - Added the required column `title` to the `DietPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slotLabel` to the `FoodLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `index` to the `PlanDay` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `PlanDay` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planSlotId` to the `PlanItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `PlanItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PlanMeal_planDayId_slot_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PlanMeal";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PlanSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planDayId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "timeHint" TEXT,
    "condition" TEXT,
    "optionNote" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PlanSlot_planDayId_fkey" FOREIGN KEY ("planDayId") REFERENCES "PlanDay" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlanSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT,
    "items" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PlanSection_planId_fkey" FOREIGN KEY ("planId") REFERENCES "DietPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DietPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "enrollmentId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "dayMode" TEXT NOT NULL DEFAULT 'SINGLE',
    "dayCount" INTEGER NOT NULL DEFAULT 1,
    "startDate" DATETIME,
    "dietPreference" TEXT,
    "conditionsNote" TEXT,
    "showTargets" BOOLEAN NOT NULL DEFAULT false,
    "targetCalories" INTEGER,
    "targetProtein" INTEGER,
    "targetCarbs" INTEGER,
    "targetFat" INTEGER,
    "createdById" TEXT NOT NULL,
    "publishedAt" DATETIME,
    "archivedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DietPlan_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DietPlan_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DietPlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DietPlan" ("archivedAt", "clientId", "createdAt", "createdById", "enrollmentId", "id", "publishedAt", "status", "targetCalories", "targetCarbs", "targetFat", "targetProtein", "updatedAt", "version") SELECT "archivedAt", "clientId", "createdAt", "createdById", "enrollmentId", "id", "publishedAt", "status", "targetCalories", "targetCarbs", "targetFat", "targetProtein", "updatedAt", "version" FROM "DietPlan";
DROP TABLE "DietPlan";
ALTER TABLE "new_DietPlan" RENAME TO "DietPlan";
CREATE INDEX "DietPlan_clientId_status_idx" ON "DietPlan"("clientId", "status");
CREATE TABLE "new_Food" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicId" TEXT,
    "name" TEXT NOT NULL,
    "alternateNames" JSONB,
    "category" TEXT NOT NULL,
    "servingUnit" TEXT NOT NULL DEFAULT 'katori',
    "servingGrams" REAL NOT NULL DEFAULT 100,
    "calories" REAL NOT NULL DEFAULT 0,
    "protein" REAL NOT NULL DEFAULT 0,
    "carbs" REAL NOT NULL DEFAULT 0,
    "fat" REAL NOT NULL DEFAULT 0,
    "fibre" REAL NOT NULL DEFAULT 0,
    "glycemicTag" TEXT,
    "conditionTags" JSONB,
    "isVeg" BOOLEAN NOT NULL DEFAULT true,
    "isVegan" BOOLEAN NOT NULL DEFAULT false,
    "isJain" BOOLEAN NOT NULL DEFAULT false,
    "allergens" JSONB,
    "defaultType" TEXT NOT NULL DEFAULT 'FOOD',
    "isPrep" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Food_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Food" ("allergens", "alternateNames", "calories", "carbs", "category", "clinicId", "conditionTags", "createdAt", "fat", "fibre", "glycemicTag", "id", "isJain", "isVeg", "isVegan", "isVerified", "name", "protein", "servingGrams", "servingUnit") SELECT "allergens", "alternateNames", "calories", "carbs", "category", "clinicId", "conditionTags", "createdAt", "fat", "fibre", "glycemicTag", "id", "isJain", "isVeg", "isVegan", "isVerified", "name", "protein", "servingGrams", "servingUnit" FROM "Food";
DROP TABLE "Food";
ALTER TABLE "new_Food" RENAME TO "Food";
CREATE INDEX "Food_category_idx" ON "Food"("category");
CREATE INDEX "Food_name_idx" ON "Food"("name");
CREATE TABLE "new_FoodLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "slotLabel" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'FROM_PLAN',
    "customText" TEXT,
    "quantity" REAL,
    "unit" TEXT,
    "loggedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FoodLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FoodLog" ("clientId", "customText", "date", "id", "loggedAt", "quantity", "source", "unit") SELECT "clientId", "customText", "date", "id", "loggedAt", "quantity", "source", "unit" FROM "FoodLog";
DROP TABLE "FoodLog";
ALTER TABLE "new_FoodLog" RENAME TO "FoodLog";
CREATE INDEX "FoodLog_clientId_date_idx" ON "FoodLog"("clientId", "date");
CREATE TABLE "new_PlanDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    CONSTRAINT "PlanDay_planId_fkey" FOREIGN KEY ("planId") REFERENCES "DietPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlanDay" ("id", "planId") SELECT "id", "planId" FROM "PlanDay";
DROP TABLE "PlanDay";
ALTER TABLE "new_PlanDay" RENAME TO "PlanDay";
CREATE UNIQUE INDEX "PlanDay_planId_index_key" ON "PlanDay"("planId", "index");
CREATE TABLE "new_PlanItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planSlotId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'FOOD',
    "text" TEXT NOT NULL,
    "quantity" TEXT,
    "prepNote" TEXT,
    "optionGroup" INTEGER,
    "foodId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PlanItem_planSlotId_fkey" FOREIGN KEY ("planSlotId") REFERENCES "PlanSlot" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlanItem_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PlanItem" ("foodId", "id", "order", "quantity") SELECT "foodId", "id", "order", "quantity" FROM "PlanItem";
DROP TABLE "PlanItem";
ALTER TABLE "new_PlanItem" RENAME TO "PlanItem";
CREATE INDEX "PlanItem_planSlotId_order_idx" ON "PlanItem"("planSlotId", "order");
CREATE TABLE "new_PlanTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tags" JSONB,
    "dietPreference" TEXT,
    "conditions" JSONB,
    "structure" JSONB,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlanTemplate_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlanTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_PlanTemplate" ("clinicId", "conditions", "createdAt", "createdById", "description", "id", "name", "structure", "tags", "timesUsed") SELECT "clinicId", "conditions", "createdAt", "createdById", "description", "id", "name", "structure", "tags", "timesUsed" FROM "PlanTemplate";
DROP TABLE "PlanTemplate";
ALTER TABLE "new_PlanTemplate" RENAME TO "PlanTemplate";
CREATE INDEX "PlanTemplate_clinicId_idx" ON "PlanTemplate"("clinicId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PlanSlot_planDayId_order_idx" ON "PlanSlot"("planDayId", "order");

-- CreateIndex
CREATE INDEX "PlanSection_planId_order_idx" ON "PlanSection"("planId", "order");
