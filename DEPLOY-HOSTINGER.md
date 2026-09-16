# Ozmo on Hostinger Business

Ozmo runs as a server-side Next.js application with Hostinger MySQL. Health
records must never be stored in the deployment filesystem or committed to Git.

## 1. Create the database

In hPanel, create a new MySQL database and a dedicated database user. Grant that
user access only to the Ozmo database. Do not enable Remote MySQL unless a
specific, temporary administrative connection requires it.

Note the database name, user and password shown in **Databases → Management**.
They go in as separate environment variables in step 4 — no connection string to
assemble, and no characters to escape:

| Variable | Value |
| --- | --- |
| `DB_NAME` | database name (e.g. `u123456789_ozmo`) |
| `DB_USER` | database user |
| `DB_PASSWORD` | database password |
| `DB_HOST` | `localhost` (optional; this is the default) |
| `DB_PORT` | `3306` (optional; this is the default) |

The app adds the shared-hosting pool limits itself (`DB_CONNECTION_LIMIT`,
default 5, and `DB_POOL_TIMEOUT`, default 10 seconds). Set `DATABASE_URL`
instead only if you specifically need a full connection string; it then takes
precedence over the fields above.

## 2. Deploy the Node.js application

1. In **Websites**, choose **Add website → Deploy Web App** and connect the
   private GitHub repository.
2. Select **Next.js** and **Node.js 22**.
3. Use `npm ci` as the install command, `npm run build` as the build command
   (hPanel offers no other), and `npm run start` as the start command. The
   production start script listens on port 3000, as required by Hostinger's
   web-app runtime.

   `npm run build` first runs `scripts/prepare-deploy.mjs`, which checks the
   environment, applies database migrations and — while the `SEED_*` passwords
   are set — creates the first two staff accounts. Any failure stops the build,
   so a broken configuration never replaces a working deployment.
4. Add `DB_NAME`, `DB_USER` and `DB_PASSWORD` from step 1, a randomly generated
   `AUTH_SECRET` of at least 32 bytes, and
   `NEXT_PUBLIC_SITE_URL=https://ozmodietclinic.com` in hPanel. The site URL
   must be the final HTTPS domain with no trailing slash; it is used for metadata,
   sitemap and robots output. Never upload a production `.env` file or place
   secrets in GitHub variables visible to logs.
   Leave `TRUSTED_PROXY_COUNT` unset (it defaults to `1`); step 8 checks it is
   right for Hostinger's proxy.
5. Email and documents. Create a mailbox (for example `hello@`) in hPanel →
   Emails and add `SMTP_HOST=smtp.hostinger.com`, `SMTP_PORT=465`, `SMTP_USER`,
   `SMTP_PASSWORD` and `EMAIL_FROM`; set `CLINIC_NOTIFY_EMAIL` to the inbox that
   should hear about new bookings. Generate `DOCUMENT_ENCRYPTION_KEY` with
   `openssl rand -base64 32` and keep a copy in the clinic password manager —
   losing or changing it makes uploaded documents unreadable. Emails never
   contain health details. After deploying, send a portal invite to a test
   client and check it arrives and shows as sent in **Practice → Notifications**.
6. Data retention. In hPanel → Advanced → Cron Jobs, schedule
   `npm run retention:run` weekly from the application directory. Run
   `npm run retention:preview` first to see what it would remove. The periods in
   `lib/retention.ts` are defaults the clinic's legal adviser must confirm;
   client health records are only removed on a deletion request.
7. For the first deployment only, add distinct strong `SEED_ADMIN_PASSWORD` and
   `SEED_DIETITIAN_PASSWORD` values. The build creates both staff accounts. Sign
   in as each, then delete those two variables and deploy again — later builds
   skip that step and say so. Production seed passwords are never printed to the
   build log.
8. Run the smoke test from any computer with Node.js and this repository:
   `npm run smoke -- https://ozmodietclinic.com`. It is read-only and checks
   health, HTTPS, security headers, robots and sitemap, sign-in redirects and
   cross-site write protection. Before the first launch, also run it once with
   `--check-proxy`: it proves the rate limiter sees real visitor addresses behind
   Hostinger's proxy (it makes 21 failed sign-ins for a made-up account). If that
   check fails, `TRUSTED_PROXY_COUNT` is wrong — fix it before accepting clients.
9. Confirm `https://DOMAIN/api/health` returns `{ "status": "ok" }` and verify
   admin, portal, assessment, booking, export and logout flows.

Missing secrets, non-HTTPS public URLs, weak seed passwords, placeholder values
left in from `.env.example` or incomplete database fields stop the deployment
before anything is built.

## 3. Backups and restore testing

Hostinger Business provides managed database/file backups. In hPanel:

1. Confirm automated backups are enabled and include the Ozmo MySQL database.
2. Create an on-demand backup immediately before every schema migration or
   major release.
3. Once per month, download a database backup to an encrypted, access-controlled
   off-site location. Keep at least three monthly restore points.
4. Once per quarter, restore the latest backup into a separate `ozmo_restore_test`
   database and verify it:

   ```bash
   # a command-line dump must skip GTIDs, or the restore fails on MySQL 8+
   mysqldump --single-transaction --set-gtid-purged=OFF --hex-blob --default-character-set=utf8mb4 -u USER -p PROD_DB > backup.sql
   mysql --default-character-set=utf8mb4 -u USER -p ozmo_restore_test < backup.sql
   # these two take full connection strings, so the restore copy can be compared with production
   SOURCE_DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/PROD_DB" RESTORED_DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/ozmo_restore_test" npm run restore:check
   DB_NAME=ozmo_restore_test npm run db:status
   ```

   `restore:check` is read-only; it compares every table's row count and the
   migration history, and checks that document files, client accounts and an
   administrator survived. Uploaded documents in the restore can only be opened
   with the same `DOCUMENT_ENCRYPTION_KEY` — back the key up separately from the
   database, never in the same place.
5. Record the restore date, operator, backup timestamp, outcome and deletion date
   for the temporary restore. Never test restoration against production.

Backups contain health data. Restrict hPanel and off-site storage with MFA,
least-privilege access and account-level encryption. Do not email SQL dumps.

## 4. Production security checklist

- Enforce HTTPS and confirm the HSTS, CSP, frame, MIME and referrer headers.
- Enable MFA for Hostinger and GitHub; use separate named staff accounts.
- Keep the repository private and enable branch protection plus required CI.
- Review Hostinger dependency-vulnerability alerts after every deployment.
- Review **Practice → Sign-in activity** (administrator only) weekly: failed
  sign-ins, lockouts and portal password resets from the last 14 days.
  Application logs must never contain names, phone numbers, assessment answers
  or medical information.
- Set `ERROR_WEBHOOK_URL` to an HTTPS incoming webhook (Slack, Discord or an
  alerting service) so someone is told about server errors. Every error is also
  written to the application log as one JSON line; the reference shown on the
  error page matches its `digest`.
- Manage staff in **Practice → Staff** (administrator only): give every person their own
  account, disable leavers the same day (their sessions end immediately), and issue
  password reset links there. Links are emailed when email is set up, and shown
  once so they can also be shared by hand.
- Review **Practice → Notifications** weekly for emails that failed to send.
- Handle deletion requests from **Practice → Data requests → Review and erase**.
- Rotate `AUTH_SECRET` after suspected exposure; this signs every user out.
- Signing out ends that device only. Anyone who lost a phone or used a shared
  computer can use **Sign out everywhere** (staff: Your account; clients:
  Profile). Changing a password, a role change or disabling an account also ends
  every session.
- Rate limits and signed-out sessions are stored in the database, so they
  survive restarts and redeploys; the weekly retention job clears expired rows.
- Test data export and deletion-request handling before accepting real clients.
- Have the privacy policy, retention schedule and legal pages reviewed locally
  before launch. Development builds show an internal legal-review note; the
  production site does not show a public draft banner.

## 5. Rollback

Application rollback and database rollback are separate. Migrations are
forward-only and additive in this release (new tables and columns only), so the
previous application commit runs against the newer schema. Before a migration,
take an on-demand database backup. If a release fails before migration, redeploy
the previous Git commit. If a migration has applied, do not edit or delete its
row manually: restore the pre-release database backup into a separate database,
verify it, point `DB_NAME` at the verified restore, and redeploy the previous
application commit.
