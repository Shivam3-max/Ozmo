# 03 — Sitemap & Route Map

Three layers, one codebase, three separate route groups with separate layouts and separate auth boundaries.

```
(marketing)   → public, SEO-indexed, no auth
(portal)      → role: CLIENT, auth required, noindex
(admin)       → role: SUPER_ADMIN | DIETITIAN | ASSISTANT | FRONT_DESK, auth required, noindex
```

---

## LAYER A — Public website  `(marketing)`

| # | Route | Page | Priority | Notes |
|---|---|---|---|---|
| 1 | `/` | Home | **P1** | Full copy in §04 |
| 2 | `/about` | About Ozmo | P1 | Clinic story, philosophy, method |
| 3 | `/about/dietitian` | Meet Your Dietitian | P1 | `[CONFIRM]` credentials |
| 4 | `/how-it-works` | How It Works | **P1** | The 6-step journey |
| 5 | `/programs` | Programmes hub | **P1** | Comparison table |
| 6 | `/programs/weight-transformation` | Weight Transformation | P1 | |
| 7 | `/programs/metabolic-health` | Metabolic Health (diabetes/cholesterol/BP) | P1 | |
| 8 | `/programs/hormonal-balance` | Hormonal Balance (PCOS/thyroid) | P1 | |
| 9 | `/programs/fitness-nutrition` | Fitness & Performance | P2 | |
| 10 | `/programs/gut-health` | Gut & Digestive Health | P2 | |
| 11 | `/programs/lifestyle-wellness` | Healthy Lifestyle | P2 | Entry-level / maintenance |
| 12 | `/conditions` | Conditions hub | P1 | Index of all concern pages |
| 13 | `/conditions/weight-loss` | Weight Loss | **P1** | Highest search volume |
| 14 | `/conditions/weight-gain` | Weight Gain | P2 | |
| 15 | `/conditions/diabetes` | Diabetes & Blood Sugar | **P1** | |
| 16 | `/conditions/pcos` | PCOS / PCOD | **P1** | |
| 17 | `/conditions/thyroid` | Thyroid | **P1** | |
| 18 | `/conditions/cholesterol` | Cholesterol & Heart Health | P2 | |
| 19 | `/conditions/digestive-health` | Digestive Health | P2 | |
| 20 | `/conditions/sports-nutrition` | Sports Nutrition | P2 | |
| 21 | `/conditions/pregnancy-nutrition` | Pregnancy & Post-Natal | P3 | Extra care with claims |
| 22 | `/conditions/child-nutrition` | Kids' Nutrition | P3 | |
| 23 | `/assessment` | Health Assessment (7 steps) | **P1** | The hook. §09 |
| 24 | `/assessment/snapshot/[token]` | Ozmo Health Snapshot result | **P1** | Tokenised, noindex |
| 25 | `/book` | Book a Consultation | **P1** | Calendar + payment |
| 26 | `/book/confirmed/[id]` | Booking confirmation | P1 | noindex |
| 27 | `/stories` | Success Stories index | P2 | Consent-gated |
| 28 | `/stories/[slug]` | Individual story | P2 | |
| 29 | `/blog` | Knowledge Centre index | P2 | |
| 30 | `/blog/category/[slug]` | Category archive | P2 | 8 categories |
| 31 | `/blog/[slug]` | Article | P2 | |
| 32 | `/recipes` | Recipes index | P3 | Filterable |
| 33 | `/recipes/[slug]` | Recipe | P3 | Recipe schema |
| 34 | `/faq` | FAQs | P2 | FAQPage schema |
| 35 | `/contact` | Contact & Location | P1 | LocalBusiness schema |
| 36 | `/pricing` | Pricing | P2 | Or fold into `/programs` — see §06 |
| 37 | `/privacy-policy` | Privacy Policy | **P1** | DPDP-compliant. Legally required |
| 38 | `/terms` | Terms of Service | **P1** | Legally required |
| 39 | `/medical-disclaimer` | Medical Disclaimer | **P1** | Legally required |
| 40 | `/refund-policy` | Refund & Cancellation | **P1** | Razorpay requires it |

**System routes:** `/sitemap.xml` · `/robots.txt` · `/opensearch.xml` · `404` · `500` · `/login` · `/forgot-password` · `/reset-password/[token]`

---

## LAYER B — Client portal  `(portal)` — all under `/portal`, role CLIENT

| # | Route | Screen | Phase |
|---|---|---|---|
| 41 | `/portal` | Dashboard — today at a glance | **V1** |
| 42 | `/portal/plan` | My Diet Plan (week view) | **V1** |
| 43 | `/portal/plan/day/[date]` | Single day detail | **V1** |
| 44 | `/portal/log` | Food & water log | **V1** |
| 45 | `/portal/measurements` | Weight & body measurements | **V1** |
| 46 | `/portal/progress` | Progress — charts, Ozmo Score, streaks | **V1** |
| 47 | `/portal/workout` | My Fitness Plan | V2 |
| 48 | `/portal/workout/[id]` | Single workout / exercise detail | V2 |
| 49 | `/portal/reports` | Report Centre (all documents) | **V1** |
| 50 | `/portal/reports/[id]` | Report viewer | V1 |
| 51 | `/portal/lab-reports` | Lab report upload & history | V2 |
| 52 | `/portal/appointments` | Upcoming & past consultations | **V1** |
| 53 | `/portal/messages` | Chat with your dietitian | **V1** |
| 54 | `/portal/notifications` | Notification centre | V2 |
| 55 | `/portal/programme` | My programme — what's included, days left | V1 |
| 56 | `/portal/payments` | Invoices & payment history | V2 |
| 57 | `/portal/profile` | Profile, goals, preferences | **V1** |
| 58 | `/portal/settings` | Account, notifications, privacy, data export | V1 |
| 59 | `/portal/onboarding` | First-run setup wizard | **V1** |

---

## LAYER C — Admin / practice management  `(admin)` — all under `/admin`

| # | Route | Module | Role access | Phase |
|---|---|---|---|---|
| 60 | `/admin` | Overview dashboard | All staff | **V1** |
| 61 | `/admin/clients` | Client list | All staff | **V1** |
| 62 | `/admin/clients/[id]` | Client profile (tabbed, 12 tabs) | All staff | **V1** |
| 63 | `/admin/clients/new` | Add client manually | All staff | V1 |
| 64 | `/admin/leads` | Lead CRM + pipeline board | All staff | **V1** |
| 65 | `/admin/leads/[id]` | Lead detail | All staff | V1 |
| 66 | `/admin/assessments` | Submitted assessments queue | Dietitian+ | **V1** |
| 67 | `/admin/assessments/[id]` | Assessment review | Dietitian+ | V1 |
| 68 | `/admin/appointments` | Calendar (day/week/month) | All staff | **V1** |
| 69 | `/admin/appointments/[id]` | Appointment + consultation notes | Dietitian+ | V1 |
| 70 | `/admin/plans` | All diet plans | Dietitian+ | **V1** |
| 71 | `/admin/plans/builder/[clientId]` | **Diet Plan Builder** | Dietitian+ | **V1** |
| 72 | `/admin/plans/templates` | Plan template library | Dietitian+ | **V1** |
| 73 | `/admin/plans/templates/[id]` | Template editor | Dietitian+ | V1 |
| 74 | `/admin/workouts` | Workout plans | Dietitian+ | V2 |
| 75 | `/admin/workouts/builder/[clientId]` | Workout builder | Dietitian+ | V2 |
| 76 | `/admin/workouts/exercises` | Exercise library | Dietitian+ | V2 |
| 77 | `/admin/foods` | Food database | Dietitian+ | **V1** |
| 78 | `/admin/foods/[id]` | Food item editor | Dietitian+ | V1 |
| 79 | `/admin/foods/recipes` | Composite recipe/dish builder | Dietitian+ | V2 |
| 80 | `/admin/reports` | Report generator + history | Dietitian+ | V1 |
| 81 | `/admin/reports/build/[clientId]` | Progress report composer | Dietitian+ | V1 |
| 82 | `/admin/lab-reports` | Lab report inbox | Dietitian+ | V2 |
| 83 | `/admin/messages` | Unified message inbox | Dietitian+ | **V1** |
| 84 | `/admin/programs` | Programme catalogue & pricing | Super Admin | V1 |
| 85 | `/admin/payments` | Payments, invoices, dues | Super Admin, Front Desk | V2 |
| 86 | `/admin/analytics` | Ozmo Insights | Super Admin | V2 |
| 87 | `/admin/content/blog` | Blog CMS | Super Admin | V2 |
| 88 | `/admin/content/recipes` | Recipe CMS | Super Admin | V3 |
| 89 | `/admin/content/stories` | Success stories + consent tracking | Super Admin | V2 |
| 90 | `/admin/content/faq` | FAQ manager | Super Admin | V3 |
| 91 | `/admin/staff` | Staff & roles | Super Admin | V2 |
| 92 | `/admin/settings` | Clinic settings, branding, hours | Super Admin | V1 |
| 93 | `/admin/settings/notifications` | Reminder & automation rules | Super Admin | V2 |
| 94 | `/admin/audit-log` | Audit trail | Super Admin | V2 |

**Total: 94 routes** (40 public + 19 portal + 35 admin), of which **38 are V1**.

---

## Navigation structure

### Public header
```
[OZMO logo]   Programmes ▾   Conditions ▾   How It Works   Stories   Knowledge ▾        [Log in]  [Start Assessment →]
```
- **Programmes ▾** — mega panel: 6 programmes with one-line descriptors + "Compare all →"
- **Conditions ▾** — two columns: *Weight & Metabolic* / *Hormonal & Digestive* + "See all concerns →"
- **Knowledge ▾** — Blog · Recipes · FAQs
- Sticky on scroll, ink background after 80px, height 72px → 60px
- Mobile: full-screen drawer, accordion sections, CTA pinned to bottom

### Public footer (4 columns + base bar)
1. **Programmes** — all six
2. **Conditions** — top six + "See all"
3. **Ozmo** — About · Your Dietitian · How It Works · Stories · Contact · Blog
4. **Get started** — Health Assessment · Book Consultation · Client Login · WhatsApp
**Base bar:** © Ozmo Diet Clinic · Privacy · Terms · Medical Disclaimer · Refunds · social icons

### Portal navigation
Desktop: left rail, 240px, icon+label, sections: **Today** (Dashboard, Plan, Log) · **Progress** (Measurements, Progress, Reports) · **Care** (Messages, Appointments, Lab Reports) · **Account** (Programme, Profile, Settings).
Mobile: bottom tab bar, 5 items max — **Today · Plan · Log (+) · Progress · More**. The centre "Log" is a raised pulse-filled circular FAB. This is the most-used action in the product; it gets the best real estate.

### Admin navigation
Left rail, collapsible to 64px icons. Grouped: **Practice** (Overview, Clients, Leads, Appointments, Assessments) · **Care** (Plans, Workouts, Reports, Lab Reports, Messages) · **Library** (Templates, Foods, Exercises) · **Business** (Programmes, Payments, Analytics) · **Manage** (Content, Staff, Settings, Audit).
Top bar: global search (⌘K), "Today: 4 consultations", notifications bell, user menu.

---

## SEO & indexing rules

| Rule | Detail |
|---|---|
| Indexed | Everything under `(marketing)` except `/assessment/snapshot/*` and `/book/confirmed/*` |
| `noindex, nofollow` | All of `/portal/*`, all of `/admin/*`, all tokenised result pages |
| Canonical | Self-canonical on every public page; blog categories canonical to themselves, paginated pages use `rel=prev/next` |
| Schema | `LocalBusiness` + `MedicalBusiness` (home, contact) · `Person` (dietitian) · `Service` (programmes) · `FAQPage` (FAQ + every condition page) · `Article` (blog) · `Recipe` (recipes) · `BreadcrumbList` (all) · `Review`/`AggregateRating` **only if genuinely collected** |
| Sitemap | Auto-generated, excludes noindex routes, split if >5k URLs |
| Internal linking | Every condition page → its programme; every programme → 2 related conditions; every blog post → 1 condition + 1 programme. Rules in §08 |
| URL style | lowercase, hyphenated, no trailing slash, no dates in blog URLs |
