# 13 — Build Roadmap

---

## The honest framing

The full vision in this report is **three products**: a marketing site, a client application, and a practice-management system. Built at once, it doesn't ship. Built in the order below, something useful is live within weeks and the rest lands on top of real usage.

**The sequencing principle:** build the marketing site first (it earns leads immediately), then the *admin* (Aman gets value before a single client logs in), then the *portal* (the differentiator, built once we know how Aman actually works). Building the client portal first is the intuitive choice and the wrong one — a beautiful portal with no plans in it is worth nothing.

---

## Phase 0 — Foundations · before any feature

- Answer the open questions in `00-README-INDEX.md`. **Especially the name and credentials.**
- One working session with Aman to map his actual current workflow, end to end
- Get one real, anonymised client file — assessment through to plan and follow-up notes. **Everything gets modelled on this**
- Brand confirmation: name, logo, palette sign-off
- Photography: shoot the clinic and the dietitian. Budget a half-day. It changes the entire feel of the site
- Domain, hosting, Postgres, S3 bucket, Razorpay account `[if payments in V1]`
- Legal: engage someone to draft/review the four legal pages
- Seed the food database: 400–600 items with Aman's own portion values
- Build the 10 seed plan templates with Aman

> Phase 0 is not optional overhead. Skipping it produces a beautiful platform that doesn't match how the clinic works, which is the most expensive failure available here.

---

## Phase 1 — Public website · the revenue front door

**Goal: the site earns leads while the rest is built.**

| Deliverable | Detail |
|---|---|
| Design system | Tokens, components, layouts from §02 |
| Homepage | Full copy from §04 |
| Core pages | About, Dietitian, How It Works, Contact, FAQ |
| 6 programme pages | §06 |
| 10 condition pages | §07 |
| 4 legal pages | Lawyer-reviewed |
| **Health Assessment** | Full 7-step flow, §09 |
| **Ozmo Health Snapshot** | Rule engine, PDF, email delivery |
| Booking flow | Calendar + form. Payment optional in V1 |
| Lead capture | Assessments and enquiries into the database |
| A minimal admin | Just enough to *see* leads and assessments — a table and a detail view |
| SEO foundation | Schema, sitemap, GBP, Search Console, GA4 |
| Auth shell | Login, roles, session handling |

**Exit criteria:** a stranger can find the site, complete the assessment, get a Snapshot, book a consultation, and Aman can see all of it in the admin.

**This phase alone justifies the project commercially.** Everything after it improves delivery and retention.

---

## Phase 2 — Admin core · make the clinic run on it

**Goal: Aman stops using Word and WhatsApp for plans.**

| Deliverable | Detail |
|---|---|
| Admin overview | Today, needs-attention list |
| Client management | List + the 12-tab profile |
| Lead CRM | Pipeline, activity, conversion |
| Assessment queue | Review, flag, convert |
| Appointments | Calendar, availability, consultation notes |
| **Diet Plan Builder** | The centrepiece. §11 |
| **Template library** | Seeded with the 10 templates |
| Food database | Admin CRUD over the seeded items |
| Plan PDF export | Branded |
| Messaging | Unified inbox |
| Programme catalogue | Feeds public pricing |
| Client accounts | Created on conversion, credentials issued |

**Exit criteria:** Aman can run a complete client lifecycle — lead → consultation → plan → follow-up — entirely inside Ozmo, and it's genuinely faster than what he does now.

> **The single make-or-break metric for this phase: time to build a plan.** If it's slower than his current method, the platform gets abandoned regardless of how good everything else is. Time it with a stopwatch, with Aman, and iterate until it wins.

---

## Phase 3 — Client portal · the differentiator

**Goal: clients experience the thing that makes Ozmo different.**

| Deliverable | Detail |
|---|---|
| Onboarding wizard | 5 screens |
| Dashboard | Up-next, metrics, quick actions |
| **My Diet Plan** | Interactive, with swaps and alternatives |
| **Food & water logging** | The core daily loop |
| Measurements | Entry + trend charts |
| Progress + **Ozmo Score** | Streaks, badges, milestones |
| Report Centre | All documents |
| Messages | Client side |
| Appointments | View, join, reschedule |
| Profile & settings | Including **data export and delete** |
| Notifications | Push + WhatsApp + email |
| **PWA** | Installable, offline logging |
| Progress report generator | Admin side + portal delivery |

**Exit criteria:** a client can be onboarded, follow their plan, log daily, see their progress, message their dietitian, and receive a monthly report — without WhatsApp being involved in the delivery of care.

**Watch this number:** 7-day activation (did they log anything in week one?). If it's under 60%, fix onboarding and reminders before building anything else.

---

## Phase 4 — Depth

Workout module (plans, exercise library, client tracking) · lab report upload and dietitian review · Razorpay end-to-end with invoicing · payments admin · Ozmo Insights analytics · blog CMS + first 12 articles · success stories with the consent gate · staff and roles · notification rule engine · audit log · Google Calendar sync.

---

## Phase 5 — Intelligence

Admin AI copilot (read-only queries) · client AI assistant (constrained to the approved plan) · lab report extraction for dietitian review · recipe CMS · composite dish builder · cohort outcome analytics · corporate/group programmes · **multi-clinic tenancy** if the licensing route opens up.

---

## What ships in V1 — the decision

**In:**
Full public site · assessment + Snapshot · booking · lead CRM · client management · appointments · **plan builder** · templates · food database · messaging · client dashboard, plan, logging, measurements, progress, reports · Ozmo Score · notifications · PWA.

**Deliberately out of V1:**
Workouts · lab report upload · payments · AI · analytics dashboards · blog CMS · recipes · gamification badges beyond streaks · food photo logging · multi-staff roles.

**The reasoning:** V1 must prove one thing — *that a client who logs daily and gets followed up gets better results and renews.* Nothing on the "out" list is needed to prove that, and everything on it is a distraction until it is proven.

---

## Highest-risk items

| Risk | Impact | Mitigation |
|---|---|---|
| **Plan builder is slower than Word** | Fatal — platform abandoned | Prototype it in week one of Phase 2, time it with Aman, iterate before building anything around it |
| **Clients don't log** | The whole differentiator collapses | Obsess over the logging UX: one tap, big target, instant feedback. Track 7-day activation from day one |
| **Food database is wrong for Indian portions** | Every plan is subtly wrong | Aman verifies every one of the seed items. His numbers beat any database |
| **Scope creep** | Nothing ships | This document is the scope. Anything not in it goes to a Phase 5 list, not into the current sprint |
| **Health data incident** | Existential, legal and reputational | §12 security, built in from Phase 1, not retro-fitted |
| **Unverified credentials published** | Real legal exposure for Aman | Nothing goes live under `[CONFIRM]`. Hard rule |
| **Aman doesn't adopt it** | Everything else is irrelevant | Build *his* workflow, not a generic one. Get him using the admin in Phase 2, before clients ever see the portal |

---

## What I need from Aman, in order

1. **A 90-minute workflow session.** How a client goes from enquiry to month three today, in detail.
2. **One real anonymised client file.** Assessment, plan, follow-up notes, the lot.
3. **Answers to the 18 open questions** in `00-README-INDEX.md`.
4. **Verified credentials** — degrees, registration, years. In writing.
5. **Pricing.** Numbers for the ladder in §06.
6. **A half-day photo shoot** — him, the clinic, some food.
7. **Two working sessions** for the food database and the plan templates.
8. **His honest reaction to the plan builder prototype**, before it's finished.

---

## Definition of done for V1

- [ ] Every `[CONFIRM]` resolved or its section removed
- [ ] Legal pages reviewed by a lawyer
- [ ] Assessment completes end-to-end on a real phone, on mobile data
- [ ] Snapshot generates correctly across 10 different answer profiles, including the medical-caution path
- [ ] Aman builds a real plan for a real client in under 10 minutes
- [ ] A client onboards and logs a full week without needing help
- [ ] Lighthouse ≥ 90 across the board on the homepage and condition pages
- [ ] WCAG 2.2 AA verified on the assessment and the portal
- [ ] No health data in any log, URL, analytics event or notification payload — verified by inspection, not assumption
- [ ] Data export and delete work end-to-end
- [ ] Backup restore tested
- [ ] Every public page has correct schema, canonical and meta
- [ ] `noindex` verified on every portal and admin route
