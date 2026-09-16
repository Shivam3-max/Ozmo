# Ozmo production readiness

Last verified: 14 September 2026, against a clean production build on a database
created from the committed migrations. It supersedes the earlier `AUDIT.md`
findings list (kept for the record), parts of which no longer match the code.

## Status

The application is **ready to deploy** once the owner-side launch steps below are
done. Every issue found in the readiness audit (September 2026) has a fix, and
each fix is locked in by an automated test that runs in CI.

What still needs a person — not code — is listed under
[Before accepting real clients](#before-accepting-real-clients).

## How it is verified

| Layer | Command | Result at last verification |
|---|---|---|
| Lint, types | `npm run lint`, `npm run typecheck` | pass |
| Unit tests | `npm test` | 64 tests |
| Dependency audit | `npm audit` | 0 known vulnerabilities |
| Migrations from empty + drift | `prisma migrate deploy`, `prisma migrate diff --exit-code` | 6 migrations, no drift |
| Production build | `npm run build` | pass |
| Browser end-to-end | `npm run test:e2e` | 34 tests (booking → plan → portal; role matrix; form errors; keyboard menus; layouts at 768 and 1920 px) |
| Regression suite | `npm run test:regression` | 282 checks: every audit finding, hostile input, notifications, documents, reports, erasure, retention, titles, rate limits |
| Post-deploy smoke test | `npm run smoke -- https://DOMAIN` | 26/27 locally (the HTTPS check only passes on the real domain) |
| Restore rehearsal | `npm run restore:check` | 35 tables and all rows restored; encrypted documents decrypt with the right key and not with a wrong one |
| Error alerting | `ERROR_WEBHOOK_URL` | alert delivered with error type and route only — no tokens, emails or passwords |
| Rate limits across restart | — | a filled limit still applied after restarting the server |

CI (`.github/workflows/ci.yml`) runs everything above except the last four rows —
the smoke test, restore rehearsal, error-alert and restart checks — which need a
deployed site, a second database or a deliberately broken instance.

The regression suite and e2e tests write data. Run them only against a
disposable database (`E2E_ALLOW_DB_WRITES=1` is required).

## What the application does to stay safe

- **Access:** one permission table (`lib/policy.ts`) for administrator, dietitian,
  assistant, front desk and client. Front desk never sees health data. Every page
  and API re-checks the database on each request, so disabling someone, changing
  their role or resetting their password takes effect immediately.
- **Sessions:** 8-hour, HTTP-only, SameSite cookies; separate cookies for staff and
  clients. Signing out ends that device only; **Sign out everywhere** ends all.
- **Sign-in protection:** per-account lockout and per-address limits, both stored
  in the database; bcrypt cost 12 with a dummy comparison so response time doesn't
  reveal who has an account.
- **Forms and APIs:** validated server-side with field-level messages; cross-site
  writes refused; request bodies capped (2 MB, 6 MB for uploads); public forms
  rate-limited per address.
- **Health data:** documents encrypted with AES-256-GCM before storage; emails never
  contain health details; health values kept out of logs and error alerts; record
  views, exports, document downloads and erasures audited.
- **Privacy rights:** self-serve export; deletion requests reviewed and executed by
  the administrator with a preview of what is erased and what is kept.
- **Retention:** weekly job (`npm run retention:run`) with periods defined in
  `lib/retention.ts`; the privacy policy reads the same values.
- **Operations:** `/api/health` checks the database; every server error is one JSON
  log line and an optional webhook alert; the deploy build refuses unsafe
  configuration (`npm run validate:env`).

## Before accepting real clients

These need the clinic owner, the hosting account or a legal adviser:

1. **Legal review.** Have the privacy policy, terms, refund policy and medical
   disclaimer reviewed for the jurisdiction, and confirm the retention periods in
   `lib/retention.ts` (the retention page flags them as awaiting review until
   `LEGAL_REVIEW_REQUIRED` is set to `false`). Confirm clinic identity and the
   grievance contact.
2. **Hosting setup.** Follow `DEPLOY-HOSTINGER.md`: database, environment variables
   (including `DOCUMENT_ENCRYPTION_KEY`, SMTP and `ERROR_WEBHOOK_URL`), first seed,
   weekly retention cron job.
3. **Keys and backups.** Store `AUTH_SECRET` and `DOCUMENT_ENCRYPTION_KEY` in the
   clinic password manager, separately from database backups. Enable managed
   backups and run one restore rehearsal on the real backups.
4. **Smoke test on the real domain**, including `--check-proxy` once, to confirm
   HTTPS and that rate limits see real visitor addresses behind Hostinger's proxy.
5. **Accounts.** MFA on Hostinger and GitHub; one named account per staff member;
   remove the seed-password variables after first sign-in.
6. **Acceptance run** with non-production accounts: booking, assessment, lead
   conversion, plan publishing, portal logging, document upload, progress report,
   export, deletion request.

## Known limitations (accepted for launch)

- **Content-Security-Policy allows inline scripts and styles**, which Next.js
  needs without per-request nonces. React escapes all user content and no user
  HTML is rendered, which limits the risk. Moving to nonces would make every page
  dynamically rendered; revisit if the site ever renders third-party or rich
  user content.
- **No multi-factor sign-in for staff.** Mitigated by strong password rules,
  lockout, per-device sessions and the weekly sign-in activity review. Add before
  the staff team grows or before remote access from unmanaged devices.
- **One document encryption key, no rotation.** Changing the key makes existing
  documents unreadable; rotation would need a re-encryption job.
- **Email is the only notification channel.** No SMS or WhatsApp, and no automatic
  appointment or logging reminders — the site copy no longer promises them.
- **Payments are taken at the clinic.** There is no online payment integration.
- **Single instance assumed for the in-memory fallback.** Rate limits normally live
  in the database; only during a database outage do they fall back to per-process
  memory.
- **Timing check needs a quiet machine.** The regression suite skips the
  sign-in timing comparison when the machine is too busy to measure it; the same
  property is covered deterministically by `lib/password.test.ts`.

## Where things are

| Need | Location |
|---|---|
| Deploy, backups, rollback | `DEPLOY-HOSTINGER.md` |
| Environment variables | `.env.example`, checked by `scripts/validate-env.mjs` |
| Permissions | `lib/policy.ts` |
| Retention periods | `lib/retention.ts` |
| Regression suite | `scripts/regression/` |
| Smoke test | `scripts/smoke.mjs` |
| Restore verification | `scripts/restore-check.mjs` |
