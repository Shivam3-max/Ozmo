# 12 — Data Model, Stack & Security

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16 (App Router)** | Server components for the marketing pages (fast, SEO), route handlers for the API. One codebase, three route groups |
| Language | **TypeScript**, strict | Health data with loose typing is asking for trouble |
| Database | **PostgreSQL** | Relational, JSONB where useful, mature encryption story. Not MySQL — JSONB and RLS matter here |
| ORM | **Prisma** | Matches how I build everything else; migrations are clean |
| Auth | **Auth.js (NextAuth) with credentials + OTP** | Email/password for staff, phone OTP for clients — Indian clients will overwhelmingly prefer phone |
| File storage | **S3-compatible (Cloudflare R2 or AWS S3)**, private buckets, signed URLs | Lab reports must never be publicly addressable |
| Payments | **Razorpay** | Standard for India, handles UPI/cards/netbanking. **We never touch card data** |
| Email | **Resend** or AWS SES | Transactional |
| WhatsApp | **WhatsApp Business API** via an official BSP `[CONFIRM: provider]` | Notification only, no health data in payloads |
| Push | Web Push API | Free, no app store |
| PDF | **React-PDF** or Puppeteer | Plans, reports, invoices |
| Charts | **Recharts** | Enough for what we need, small bundle |
| Styling | **Tailwind** + CSS variables from §02 | |
| Hosting | **Vercel** (app) + managed Postgres `[CONFIRM: Neon / Supabase / RDS]` | |
| Monitoring | Sentry, with **PII scrubbing on** | An error report containing a client's health data is a breach |
| Dev port | **3680** | Follows the convention across my other builds |

**Data residency:** `[CONFIRM]` — strongly prefer an India region (ap-south-1) for the database and file storage. Under DPDP it's the defensible position, and it's better for latency anyway.

---

## 2. Data model

Written as Prisma-flavoured pseudo-schema. Enums abbreviated.

### Tenancy & identity
```prisma
model Clinic {                    // one row today; multi-tenant-ready
  id, name, legalName, gstin, address, city, phone, email,
  logoUrl, brandColor, timezone (default "Asia/Kolkata"),
  workingHours Json, settings Json, createdAt
}

model User {
  id, clinicId, role UserRole,     // SUPER_ADMIN | DIETITIAN | ASSISTANT | FRONT_DESK | CLIENT
  name, email @unique, phone @unique, passwordHash?, emailVerified?, phoneVerified?,
  avatarUrl?, isActive, lastLoginAt, createdAt, updatedAt, deletedAt?
  client Client?  dietitianProfile DietitianProfile?
}

model DietitianProfile {
  id, userId @unique, qualifications String[], registrationNumber?,
  yearsExperience, specialisms String[], bio, consultationDuration, isAcceptingClients
}
```

### Leads & assessment
```prisma
model Lead {
  id, clinicId, name, email?, phone, city?,
  source LeadSource, stage LeadStage, score Int,
  goal?, conditions String[], readiness Int,
  requiresMedicalCaution Boolean @default(false),
  lostReason?, assignedToId?, nextActionAt?, convertedClientId?,
  consentMarketing Boolean @default(false), consentAt?,
  createdAt, updatedAt
  assessment Assessment?  activities LeadActivity[]
}

model Assessment {
  id, leadId?, clientId?, token @unique,      // tokenised snapshot URL
  responses Json,                              // full answer payload, versioned by schemaVersion
  schemaVersion Int,
  // denormalised for querying — worth the duplication
  age, gender, heightCm, weightKg, bmi Decimal, goal, activityLevel,
  conditions String[], foodPreference, readiness Int,
  snapshotCards Json,                          // computed cards, stored so the URL stays stable
  recommendedProgramId?,
  completedAt, expiresAt, createdAt
}

model LeadActivity { id, leadId, type, note, staffId, createdAt }
```

### Clients & programmes
```prisma
model Client {
  id, clinicId, userId @unique, clientCode @unique,   // e.g. OZ-2026-0142
  dob, gender, city?, occupation?, emergencyContact?,
  heightCm, startWeightKg, targetWeightKg?, targetDate?,
  foodPreference, allergies String[], dislikes String[],
  cooksAtHome, eatsOutFrequency,
  mealTimes Json,                                     // {earlyMorning:"07:00", ...}
  primaryDietitianId, status ClientStatus,
  joinedAt, createdAt, updatedAt, deletedAt?
}

model HealthProfile {                                  // versioned, never overwritten
  id, clientId, conditions String[], medications Json[], supplements Json[],
  surgeries Json[], familyHistory String[], symptoms String[],
  previousDietHistory?, notes?, recordedById, version Int, createdAt
}

model Program {                                        // catalogue
  id, clinicId, slug @unique, name, description,
  durationMonths Int[], priceByDuration Json, inclusions Json,
  followUpFrequency, isActive, displayOrder
}

model Enrollment {
  id, clientId, programId, durationMonths,
  startDate, endDate, status EnrollmentStatus,          // ACTIVE|PAUSED|COMPLETED|CANCELLED
  pricePaid Decimal, followUpsIncluded, followUpsUsed,
  reportsIncluded, reportsDelivered,
  pausedFrom?, pausedUntil?, renewedFromId?, createdAt
}
```

### Plans
```prisma
model DietPlan {
  id, clientId, enrollmentId?, version Int, status PlanStatus,  // DRAFT|ACTIVE|ARCHIVED
  targetCalories, targetProtein, targetCarbs, targetFat,
  notes?, createdById, publishedAt?, archivedAt?, createdAt
  days PlanDay[]
}
model PlanDay   { id, planId, dayOfWeek Int, meals PlanMeal[] }
model PlanMeal  { id, planDayId, slot MealSlot, time, notes?, items PlanItem[] }
model PlanItem  {
  id, planMealId, foodId?, customName?, quantity Decimal, unit,
  calories, protein, carbs, fat, fibre,
  isAlternative Boolean, alternativeGroup Int?, whyThisWorks?, displayOrder
}

model PlanTemplate {
  id, clinicId, name, description, tags String[], calorieBand,
  foodPreference, conditions String[], structure Json, timesUsed, createdById
}
```

### Food database
```prisma
model Food {
  id, clinicId?, name, alternateNames String[], category,
  servingUnit, servingGrams Decimal,
  calories, protein, carbs, fat, fibre, micronutrients Json?,
  glycemicTag?, conditionTags String[],
  isVeg, isVegan, isJain, allergens String[],
  source, isVerified, createdById
}
model FoodRecipe { id, name, servings, ingredients Json, computed Json }   // V2
```

### Tracking
```prisma
model FoodLog {
  id, clientId, date, slot MealSlot,
  source LogSource,                        // FROM_PLAN | SWAPPED | OFF_PLAN
  planItemId?, foodId?, customText?, quantity?, unit?,
  calories?, protein?, photoUrl?, loggedAt, createdAt
  @@index([clientId, date])
}
model WaterLog       { id, clientId, date, glasses Int, targetGlasses, updatedAt }
model Measurement    { id, clientId, date, weightKg?, waistCm?, hipCm?, chestCm?, armCm?, bodyFatPct?, note?, recordedById?, createdAt }
model ActivityLog    { id, clientId, date, steps?, activityType?, durationMin?, note? }
model DailyScore     { id, clientId, date, score Int, components Json, adherencePct, @@unique([clientId,date]) }
model Streak         { id, clientId @unique, current Int, longest Int, lastLogDate, gracesUsedThisFortnight Int }
model Badge          { id, clientId, badgeType, earnedAt }
```

### Care & communication
```prisma
model Appointment {
  id, clientId?, leadId?, dietitianId, type, mode,          // INITIAL|FOLLOW_UP · IN_CLINIC|VIDEO
  scheduledAt, durationMin, status,                          // SCHEDULED|COMPLETED|CANCELLED|NO_SHOW
  meetingUrl?, cancelledAt?, cancelReason?, createdAt
  note ConsultationNote?
}
model ConsultationNote {
  id, appointmentId @unique, subjective?, measurements Json?, observations?,
  planOfAction?, nextReviewDate?, sharedWithClient Boolean @default(false),
  sharedContent?, createdById, createdAt
}
model MessageThread { id, clientId @unique, dietitianId, lastMessageAt, clientUnread, staffUnread }
model Message       { id, threadId, senderId, body, attachmentUrl?, readAt?, createdAt }

model Document {                                             // report centre
  id, clientId, type DocumentType,                           // DIET_PLAN|PROGRESS_REPORT|CONSULT_NOTE|LAB|INVOICE|OTHER
  title, fileUrl, fileSize, mimeType,
  uploadedById?, uploadedByClient Boolean, viewedAt?, createdAt
}
model LabReport {
  id, clientId, documentId, reportType, testDate, labName?,
  extractedValues Json?, extractionStatus, reviewedById?, reviewedAt?, dietitianNotes?,
  flaggedForReferral Boolean @default(false), createdAt
}
model ProgressReport {
  id, clientId, enrollmentId, periodStart, periodEnd,
  data Json, observations?, nextMonthFocus?, planChanges?,
  status,                                                    // DRAFT|APPROVED|SENT
  approvedById?, approvedAt?, sentAt?, pdfUrl?, createdAt
}
```

### Business & system
```prisma
model Payment      { id, clientId, enrollmentId?, amount, currency, gateway, gatewayOrderId, gatewayPaymentId?, status, method?, invoiceNumber?, invoiceUrl?, paidAt?, createdAt }
model Notification { id, userId, type, title, body, actionUrl?, channels String[], readAt?, sentAt, createdAt }
model NotificationPreference { id, userId, type, inApp, push, whatsapp, email, @@unique([userId,type]) }
model Consent      { id, userId, type, granted Boolean, grantedAt?, revokedAt?, ipAddress?, documentVersion }
model AuditLog     { id, clinicId, actorId?, action, entityType, entityId, changes Json?, ipAddress?, userAgent?, createdAt, @@index([entityType,entityId]) }
model SuccessStory {
  id, clientId?, slug @unique, title, programName, durationMonths,
  startWeight?, endWeight?, quote, story Json, isPublished,
  consentGiven Boolean @default(false), consentDate?, consentScope, consentDocumentUrl?
}
model BlogPost     { id, slug @unique, title, excerpt, content, categoryId, authorId, reviewedById?, reviewedAt?, coverImageUrl?, seoTitle?, seoDescription?, status, publishedAt }
model Recipe       { id, slug @unique, title, categories String[], prepMin, cookMin, servings, ingredients Json, method Json, nutrition Json, whyThisWorks, swaps Json?, imageUrl?, status }
```

### Model-design notes worth flagging
1. **`HealthProfile` is versioned, never updated in place.** Clinical history must be reconstructable. Same for `DietPlan` — archive, never overwrite.
2. **`Assessment.responses` is JSON with a `schemaVersion`.** The questions will change; old responses must stay readable. Denormalised columns alongside for the fields we actually query on.
3. **`Clinic` exists from day one** even with one row. Multi-tenancy retro-fitted is a rewrite; designed-in it's a `where` clause.
4. **`FoodLog` never blocks on the food database.** `customText` always accepted — a client must never be unable to log because we're missing a food.
5. **`Consent` is its own table with versioning.** Under DPDP you need to prove what someone consented to and when, against which version of the policy.
6. **`AuditLog` is append-only.** No update or delete paths in code.
7. **Soft deletes (`deletedAt`) on User and Client** — hard-deleting a client cascades into clinical records that have retention obligations. The real deletion job runs on the retention schedule.

---

## 3. Security

### Authentication
- Clients: **phone + OTP** (primary) or email + password. Indian users will pick OTP nearly every time
- Staff: email + password with **mandatory 2FA** `[recommend TOTP]`
- Sessions: httpOnly, secure, sameSite=lax. 30 days for clients, **8 hours for staff** — a staff session is a key to every client's health record
- Rate limiting on login, OTP and password reset. Progressive lockout
- Password rules: min 12 characters for staff, checked against a breach list

### Authorisation
- Role checks in **middleware**, on **every route handler**, and at the **query layer**. Three layers, because one will eventually be forgotten
- Clients can only ever read/write rows where `clientId = session.clientId`. Enforce it in a repository layer, not ad hoc in each handler
- Assistants scoped to assigned clients only
- **Front Desk queries never select health columns** — enforce with a separate, narrower Prisma select, not with UI hiding

### Data protection
- TLS 1.3 everywhere, HSTS
- Database encryption at rest
- **Application-level encryption on the most sensitive fields** — medications, conditions, lab extracted values. Costs a little query flexibility, worth it
- Files in private buckets, served only via **short-lived signed URLs** (5 minutes). A lab report URL must never work when pasted into a browser an hour later
- No health data in: URLs, query strings, logs, error reports, analytics events, WhatsApp/SMS payloads, or push notification bodies
- Sentry with PII scrubbing enabled and verified — test it deliberately

### Headers & hardening
CSP with no unsafe-inline · `X-Frame-Options: DENY` on portal and admin · `Referrer-Policy: strict-origin-when-cross-origin` · `Permissions-Policy` locking down camera/mic/geo except where needed · `noindex` headers on all authenticated routes · CSRF tokens on all mutations · Zod validation on every input · file upload validation by magic bytes, not extension · virus scan on uploads `[recommended]`

### Operational
- Daily automated backups, 30-day retention, **restore tested quarterly** — an untested backup is not a backup
- Audit logging on every read and write of client health data
- Breach response plan documented before launch, with the DPDP notification timeline in it
- Staff offboarding checklist: deactivate, revoke sessions, audit their recent access

---

## 4. DPDP Act 2023 — what it actually requires of us

| Obligation | How we meet it |
|---|---|
| **Notice & consent** | Granular consent at signup, separate opt-ins for service / marketing / anonymised analytics / story publication. `Consent` table records what, when, which policy version, from which IP |
| **Purpose limitation** | Health data used only for delivering care. **Never for advertising, never for lookalike audiences, never shared with a pixel** |
| **Data minimisation** | Every assessment question justified by use. If Aman won't use it, we don't ask it |
| **Accuracy** | Clients can correct their own profile; clinical fields corrected via the dietitian with an audit trail |
| **Storage limitation** | Retention policy `[CONFIRM: X years post-relationship, aligned to clinical record norms]`, then delete or irreversibly anonymise. Automated job, not a manual promise |
| **Right to access** | Self-serve export in `/portal/settings` — JSON + human-readable PDF |
| **Right to correction** | In-product |
| **Right to erasure** | Self-serve request; honoured within the stated window, with clear disclosure of what's retained for legitimate clinical/legal reasons and for how long |
| **Right to nominate** | Field on the client profile |
| **Grievance redressal** | Named officer, published contact, defined response window `[CONFIRM]` |
| **Security safeguards** | As §3 |
| **Breach notification** | Documented plan, Data Protection Board + affected users, within the prescribed timeline |
| **Children's data** | If under-18 clients are accepted: verifiable parental consent, no behavioural tracking, no targeted advertising — full stop |

> Get a lawyer to review the privacy policy, terms and consent flows before launch. This is the one part of the project where being 90% right is not a pass.

---

## 5. Integrations

| Integration | Use | Notes |
|---|---|---|
| **Razorpay** | Payments, invoices, refunds | Webhooks for status. Never store card data. Signature verification mandatory |
| **WhatsApp Business API** | Notifications, reminders, confirmations | Template messages pre-approved. **Never any health content in a payload** |
| **Email** | Transactional + reports | SPF/DKIM/DMARC configured |
| **Web Push** | In-product reminders | Free, works on Android well; iOS requires the PWA to be installed |
| **Video calls** | Online consultations | `[CONFIRM]` — Google Meet links are the pragmatic V1 choice; a proper embedded solution can come later |
| **Google Calendar** | Two-way appointment sync for staff | V2 |
| **GA4** | Marketing analytics | `(marketing)` routes only. Consent-gated. Never on portal or admin |
| **Search Console** | SEO | |
