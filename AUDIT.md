> **Superseded.** This is the audit written on 10 September 2026, kept for the
> record. Several statements below no longer describe the code — for example
> rate limiting is now database-backed, email notifications exist, and there are
> far more than two unit tests. For the current status, verification results and
> known limitations, see [`PRODUCTION-READINESS.md`](PRODUCTION-READINESS.md).

# Ozmo application audit

Audit date: 10 September 2026

## What Ozmo is and why it exists

Ozmo is a clinic website plus a private nutrition-practice web application. It
was built to turn a diet clinic's disconnected public website, lead follow-up,
health intake, appointment diary, client files, diet-plan authoring and client
tracking into one workflow.

It has three surfaces:

1. A public website for programmes, condition information, enquiries,
   assessments and consultation booking.
2. A staff practice area for leads, assessments, appointments, client records,
   food libraries, diet plans, messages and privacy requests.
3. A client portal for plans, meal/water logging, measurements, progress,
   appointments, messages, data export and deletion requests.

This is a server-rendered Next.js application, not a static brochure site. It
must run as a Node.js web application and requires MySQL. Because it processes
health and identity data, production operation requires stricter access,
backup, logging and legal controls than a typical marketing site.

## Deployment architecture

- Runtime: Next.js 16 on Node.js 22.
- Database: Hostinger MySQL through Prisma 6.
- Authentication: signed, HTTP-only, secure production cookies; eight-hour
  staff sessions; database revalidation and session revocation.
- Hosting: Hostinger Business Node.js web-app deployment from a private GitHub
  repository.
- Schema changes: committed MySQL migrations applied by `prisma migrate deploy`
  before each production build.
- Availability check: `/api/health` verifies that the application can query the
  database.
- Recovery: Hostinger managed backups, pre-release on-demand backups, encrypted
  off-site copies and quarterly restore tests.

Exact setup and rollback steps are in `DEPLOY-HOSTINGER.md`.

## Findings resolved

### Critical and high priority

- Replaced the SQLite-only database adapter and migrations with a production
  MySQL Prisma configuration and a clean MySQL baseline migration.
- Removed health and identity details from notification logging. Until a real
  notification provider is configured, the application does not pretend that
  email or WhatsApp was sent.
- Replaced hard-coded clinic identifiers with the signed-in user's clinic and
  scoped staff reads and writes through that clinic.
- Restricted health records by role. Front-desk users can work with scheduling
  and contact details but cannot read assessment, plan or clinical-note data.
- Added database-backed session revocation and revalidation so disabled,
  deleted, role-changed or moved users lose access immediately.
- Added strict validation for assessment payload keys, shapes, lengths and
  total size.
- Stopped storing assessment answers in browser local storage.
- Added safe redirect validation to prevent login `next` parameters from
  redirecting users to external sites.

### Data integrity and workflow

- Added database uniqueness for appointment slots and meal-log slots, with
  conflict handling and upserts to prevent duplicate records under concurrent
  requests.
- Replaced race-prone sequential client codes with collision-resistant readable
  codes.
- Wrapped lead conversion and diet-plan publishing/replacement in database
  transactions.
- Enforced that foods added to plans belong to the signed-in clinic.
- Replaced fake booking availability with live database availability, fixed
  Asia/Kolkata slot conversion and limited booking to supported clinic hours
  and dates.
- Made deletion requests durable, deduplicated and auditable. Clients see their
  active request status; super administrators can review and close requests in
  `/admin/data-requests` with a required resolution note.

### Platform and security

- Added HSTS, Content Security Policy, anti-framing, MIME-sniffing, referrer,
  permissions and cross-origin opener headers.
- Added bounded in-memory rate-limit storage with cleanup.
- Added audit records for sensitive list/detail views, exports and privacy
  request actions.
- Added a pinned Prisma client/tooling pair and removed the native SQLite
  dependency.
- Added CI with MySQL, migration, lint, type-check, unit-test and production
  build stages.
- Added production and first-bootstrap scripts, a Node version declaration and
  a Hostinger-compatible port 3000 start command, and a complete Hostinger
  deployment/backup/rollback runbook.
- Added a Hostinger deployment environment gate that fails before migration or
  build when required secrets, MySQL pool limits or the canonical HTTPS site URL
  are missing or unsafe.
- Corrected privacy wording that previously promised controls or protections
  the application did not implement. Development builds show an internal
  legal-review reminder, while production no longer displays a public draft
  banner.
- Replaced launch-facing placeholder copy for contact details, clinic imagery,
  dietitian profile and client stories with production-safe wording.

## Verification result

- Prisma schema validation: passed.
- ESLint with zero warnings: passed.
- TypeScript type-check: passed.
- Unit tests: 2 passed.
- Next.js production build: passed, including all admin, portal and API routes.
- Dependency audit: zero known vulnerabilities at the final successful audit.
- Git whitespace/error check: passed; only Windows line-ending notices remain.

## Launch actions that require the owner or Hostinger account

These are operational inputs, not unresolved code defects:

1. Create the production MySQL database/user and enter its connection string in
   hPanel. The baseline migration has been validated and built but cannot be
   applied to a database whose credentials are not yet available.
2. Configure the private GitHub deployment, Node.js 22, domain, environment
   variables and strong bootstrap credentials from `DEPLOY-HOSTINGER.md`.
3. Enable Hostinger MFA and managed backups, make a first on-demand backup, and
   schedule the monthly copy and quarterly restore test.
4. Confirm clinic identity/contact details and have the privacy, retention,
   terms, refund and medical-disclaimer text reviewed for the clinic's
   jurisdiction before collecting real patient data.
5. Configure a transactional email/SMS/WhatsApp provider if automatic staff or
   client notifications are required. The current safe behaviour records work
   in the app and tells users the clinic will confirm manually.
6. Run an acceptance test with non-production accounts covering staff roles,
   booking, assessment, lead conversion, plan publishing, portal tracking,
   export, deletion request and restore.

Offline caching/PWA support was deliberately not added to authenticated health
pages. Caching medical or identity data on shared devices needs an explicit
encrypted-offline-data design and retention policy; it should not be enabled as
a generic deployment optimisation.
