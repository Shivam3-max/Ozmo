# 11 — Admin: Module-by-Module Spec

**The design brief:** this is Aman's cockpit, and he'll live in it for hours a day. Dense, fast, keyboard-driven, zero decoration. Every screen answers "what needs me right now?" and every routine action is ≤3 clicks.

**The test for every feature:** *does this save the dietitian time, or does it just look impressive in a demo?* Cut anything that fails.

---

## `/admin` — Overview

### Top row — today
| Tile | Detail |
|---|---|
| **Today's consultations** | Count + a list with times, names, type. Click → appointment |
| **Plans due** | Clients whose plan needs writing or revising. **The most important number on this screen** |
| **Unread messages** | Count + oldest waiting time. Amber past 12h, alert past 24h |
| **New leads** | Since yesterday, with high-priority count |

### Second row — the practice
`Active clients` · `Programmes ending in 14 days` (the renewal pipeline) · `Follow-ups due this week` · `Revenue this month` `[if payments on]`

### Needs attention — the core working list
The screen's real purpose. A ranked list, not a dashboard ornament:

| Priority | Trigger | Action |
|---|---|---|
| 🔴 | No log in 7+ days | `Send a message` |
| 🔴 | Adherence <50% for 2 weeks | `Review plan` |
| 🔴 | Message unanswered >24h | `Reply` |
| 🟡 | No weigh-in in 14 days | `Nudge` |
| 🟡 | Weight moving the wrong way 3 weeks running | `Review` |
| 🟡 | Follow-up overdue | `Book` |
| 🟡 | Programme ends in 14 days | `Start renewal conversation` |
| 🟡 | Lab report uploaded, unreviewed | `Review` |
| 🔵 | New assessment, high readiness | `Call today` |
| 🔵 | Plan revision requested | `Open builder` |

Each row: client name, trigger, days elapsed, one-click action. **Dismissible with a snooze** (`Remind me in 3 days`) — otherwise the list becomes noise and gets ignored.

### Today's schedule
Timeline of the day's appointments with join links and quick access to each client's file.

### Quick actions
`+ New client` · `+ Book appointment` · `+ Write plan` · `Search (⌘K)`

---

## `/admin/clients` — Client list

**Table columns:** Name · Programme · Day (34/90) · Current weight · Change (± since start, coloured by direction) · Adherence % · Ozmo Score · Last active · Next follow-up · Status pill.

**Status logic:** `Excellent` (adherence ≥85%) · `On track` (70–84) · `Needs attention` (50–69) · `At risk` (<50 or no activity 7d) · `Paused` · `Completed`

**Filters:** programme · status · dietitian · start month · condition tag · programme ending soon · has unread message
**Sort:** any column. Default = needs attention first.
**Search:** name, phone, email, client ID
**Bulk:** message selected · export CSV · assign dietitian · tag

**Row hover** reveals: `Open` · `Plan` · `Message` · `Book`

---

## `/admin/clients/[id]` — Client profile

The most-used screen in the admin. Twelve tabs, persistent header.

**Header (always visible):**
```
[Photo] PRIYA SHARMA · 34F · Ludhiana                    [Message] [Book] [Edit plan] [⋮]
Weight Transformation · Day 34/90 · Next follow-up 12 Sep
82.0 → 78.4 kg (−3.6)  ·  Adherence 82%  ·  Ozmo Score 78  ·  Last active 2h ago
```

### Tab 1 — Overview
At-a-glance: current metrics, weight sparkline, adherence for the last 14 days, recent activity feed, active plan summary, pinned dietitian notes, and an alert strip for anything flagged.

### Tab 2 — Personal
Contact details, DOB, gender, city, occupation, emergency contact, how they found us, joined date, client ID, communication preferences, consent record (what they've agreed to and when).

### Tab 3 — Health
Conditions (tagged) · medications with dose and timing · supplements · allergies · surgeries and illnesses · family history · symptom checklist from the assessment · **the full original assessment**, viewable in one click. Changes are versioned with a timestamp — never overwritten.

### Tab 4 — Goals
Primary goal · target weight · target date · motivation (from Q2.3) · previous diet history and what went wrong · what the client said is getting in their way *(assessment Q7.1 — surface this prominently; it's the single most useful line in the file)*.

### Tab 5 — Measurements
Full table of every entry. Charts for weight, waist, hip, body fat. Add-on-behalf-of-client entry (for in-clinic measurements). Export.

### Tab 6 — Diet plans
All plan versions, newest first: version, date, created by, status (`draft` / `active` / `archived`), and a diff view showing what changed between versions. Actions: `duplicate`, `revise`, `set active`, `download PDF`, `send to client`.

### Tab 7 — Workouts *(V2)*
Same structure for workout plans.

### Tab 8 — Food log
The compliance picture, and where consultations get their substance.
- **Calendar heatmap**, 12 weeks, adherence-shaded
- **Day drill-down**: planned vs actual, side by side, deviations highlighted
- **Patterns panel** — auto-computed and genuinely useful: `Most-missed meal: evening snack (68% missed)` · `Adherence drops on weekends (61% vs 88% weekdays)` · `12 swaps this month, 9 of them at dinner` · `Water target hit on 4 of last 14 days`
- **Client signals**: meals marked favourite, meals marked disliked
- Free-text deviations listed, so Aman can see what they're actually eating instead

### Tab 9 — Lab reports
Uploaded reports with date, type, thumbnail. Viewer. **Dietitian-side extracted values with reference ranges and trend charts.** Space for the dietitian's own notes per report. A `flag for doctor referral` action that adds it to the client's file and prompts a message.

### Tab 10 — Appointments
Past and upcoming. Each past appointment expands to its consultation note.

### Tab 11 — Messages
The full thread, inline. Reply without leaving the profile.

### Tab 12 — Notes & files
Private clinical notes (never visible to the client, and clearly labelled as such in the UI). Pinned notes surface on the Overview tab. Consultation notes are separate and can be individually marked shareable. File attachments. Full timeline of everything: plan changes, status changes, payments, staff actions.

---

## `/admin/leads` — Lead CRM

**Two views:** pipeline board (default) and table.

**Pipeline stages:** `New` → `Contacted` → `Consultation booked` → `Consulted` → `Converted` → `Lost`
Drag between columns. Each card: name, source, goal, lead score, days in stage, next action.

**Lead sources:** Website assessment · Website contact form · Booking form · Instagram · Google Ads · WhatsApp · Referral · Walk-in · Phone · Other

**Lead detail:** full assessment if they took one, contact history (calls, messages, notes), lead score with its components shown, next-action date with reminder, and `Convert to client` (which creates the account, carries the assessment across, and starts onboarding).

**Lost reasons** (required on move to Lost, and genuinely worth analysing): `Price` · `Went elsewhere` · `Not ready` · `No response` · `Not a fit` · `Distance/location` · `Other`

**Auto-follow-up sequence** — per §09, four touches then stop. Every send respects consent and carries an opt-out.

---

## `/admin/assessments` — Assessment queue

Every completed assessment, newest first. Card: name, age, goal, conditions, readiness score, submitted time, and status (`New` / `Reviewed` / `Contacted` / `Converted`).

**Flags:** 🔴 `Medical caution` · 🟢 `High readiness` · 🔵 `Complex case`

**Detail view** shows the full assessment in a clinical layout — grouped, scannable, with the computed Snapshot alongside. Actions: `Call now` · `WhatsApp` · `Book consultation` · `Mark reviewed` · `Add note` · `Convert to client`.

**Analytics strip:** completion rate, drop-off by step *(tells us exactly which question is losing people — act on it)*, goal distribution, condition distribution, source breakdown.

---

## `/admin/appointments` — Calendar

Day / week / month views. Colour-coded by type: initial consultation, follow-up, online, in-clinic.

**Availability management:** working hours per day, slot duration, buffer between appointments, blocked dates (leave, holidays), recurring unavailability.

**Booking a slot:** client (search existing or create new), type, mode, duration, notes. Auto-sends confirmation.

**Appointment detail:** client summary panel (current metrics, plan, last log activity, open questions from chat) beside the **consultation note editor** — structured fields: subjective notes, measurements taken, observations, plan of action, next review date, what to share with the client. `Save & write plan` goes straight into the Plan Builder with the note attached.

**No-show handling:** mark no-show, apply policy `[CONFIRM]`, trigger a follow-up message.

---

## `/admin/plans/builder/[clientId]` — **The Diet Plan Builder**

The most important screen to get right. If this is slow or awkward, Aman won't use the platform — he'll go back to Word. **Target: a complete plan in under 10 minutes.**

### Layout — three panes
```
┌─────────────┬──────────────────────────────┬──────────────┐
│ CLIENT      │ THE PLAN                     │ FOOD SEARCH  │
│ CONTEXT     │                              │ + TEMPLATES  │
│             │ Mon Tue Wed Thu Fri Sat Sun  │              │
│ Goal        │ ┌──────────────────────────┐ │ [search...]  │
│ Conditions  │ │ EARLY MORNING · 7:00     │ │              │
│ Allergies   │ │ + add food               │ │ Recent       │
│ Preference  │ ├──────────────────────────┤ │ Favourites   │
│ Current wt  │ │ BREAKFAST · 8:30         │ │ By category  │
│ Target      │ │ Poha — 1 bowl      [×]   │ │              │
│             │ │ Curd — 1 katori    [×]   │ │ Templates    │
│ Targets:    │ │ + add · + alternative    │ │ ├ Diabetes-V │
│ 1500 kcal   │ ├──────────────────────────┤ │ ├ PCOS-V     │
│ 85g protein │ │ MID-MORNING · 11:00      │ │ └ Wt Loss-NV │
│             │ └──────────────────────────┘ │              │
│ RUNNING     │                              │              │
│ TOTAL       │ [Save draft] [Publish]       │              │
│ 1480 / 1500 │                              │              │
│ 82g protein │                              │              │
└─────────────┴──────────────────────────────┴──────────────┘
```

### The flow
1. **Start from** — blank · a template · this client's previous plan *(most-used option by far — make it the default when a previous plan exists)*
2. **Set targets** — calories and macros. Auto-suggested from BMR × activity × goal, always editable. Show the calculation so it isn't a black box
3. **Set meal slots** — inherited from the client's meal times, adjustable
4. **Add foods** — search, select, set quantity in Indian units. Nutrition totals update live
5. **Add alternatives** — per item or per slot. `+ alternative` with a one-line "why this works" note. **Alternatives are what make the plan survive real life — the UI must make adding them effortless**
6. **Repeat across days** — `Copy Monday to all` · `Copy to weekdays` · `Copy to Tue–Thu`. **Nobody builds seven distinct days from scratch; this is the single biggest time-saver in the tool**
7. **Add plan notes** — free text shown at the top of the client's plan
8. **Review** — a validation panel that flags: below target calories · protein under target · an allergen present · a food that conflicts with a condition tag · an empty slot · a food the client marked disliked
9. **Publish** — sets version, activates, notifies the client, archives the previous version

### Non-negotiable builder features
- **Allergy and preference guard** — hard block on allergens, warning on preference conflicts (non-veg item for a vegetarian client). This is a safety feature, not a convenience
- **Condition-aware warnings** — soft flags, dietitian can always override with a reason
- **Live nutrition totals** — per meal, per day, against target
- **Keyboard-first** — `/` to search, arrows to navigate, Enter to add, `⌘S` to save. Aman should be able to build a plan without leaving the keyboard
- **Autosave every 10 seconds** with a visible saved indicator
- **Undo/redo**
- **Draft vs published** — never publish half a plan by accident
- **Diff on revision** — show the client what changed since the last version

---

## `/admin/plans/templates` — Template library

Where the efficiency actually comes from.

Templates by condition and preference: `Diabetes — Vegetarian` · `Diabetes — Non-veg` · `PCOS — Vegetarian` · `Weight Loss — Vegetarian` · `Weight Loss — Non-veg` · `Thyroid` · `Muscle Gain — Vegetarian` · `Gut Health` · `1200 kcal base` · `1500 kcal base` · `1800 kcal base`

Each: name, tags, calorie band, description, times used, last edited. `Duplicate` · `Edit` · `Use for a client` · `Archive`.

**Build the seed set with Aman in one working session.** Ten good templates cut plan-writing time by 70% and are the difference between the platform being adopted and abandoned.

---

## `/admin/foods` — Food database

The unglamorous foundation everything else sits on.

**Fields per item:** name · alternate/regional names *(paneer / cottage cheese; curd / dahi / yoghurt — search must find all of them)* · category · standard serving in Indian units (katori, bowl, roti, piece, glass) with gram equivalents · calories · protein · carbs · fat · fibre · notable micronutrients · glycaemic tag (`low` / `medium` / `high`) · condition tags (`diabetes-friendly`, `high-protein`, `low-oil`, `high-fibre`) · veg/non-veg/vegan/jain flags · common allergens.

**Seed data:** `[CONFIRM]` — start from a recognised Indian food composition source (IFCT) plus Aman's own working values. **Target 400–600 items for V1.** That covers the overwhelming majority of real Indian plans; a 10,000-item database with wrong portion sizes is worse than 500 correct ones.

**Composite dishes** *(V2)* — build a dish from ingredients (`rajma chawal` = rajma + rice + oil) so nutrition computes automatically and portions stay realistic.

**Import/export CSV** for bulk editing.

---

## `/admin/reports/build/[clientId]` — Progress report generator

One click, then edit. The monthly deliverable that proves the service.

**Auto-assembled sections:**
1. Client and programme header
2. Period covered
3. **Weight** — start, previous, current, change, chart
4. **Measurements** — table with deltas
5. **Adherence** — overall %, by meal slot, by week, heatmap
6. **Logging consistency** — days logged, water target hit
7. **Activity** — sessions completed `[if tracked]`
8. **Lab markers** — if new reports exist in the period
9. **Ozmo Score** — trend
10. **Milestones achieved**
11. **Dietitian's observations** — *free text, written by Aman. The part that makes it a professional document rather than a printout*
12. **Focus for next month** — free text
13. **Plan changes made**

**Flow:** generate → edit → preview → **approve** → send. Delivered to the portal + email + WhatsApp notification. Branded PDF.

> **Rule:** nothing is auto-sent. Aman approves every report before a client sees it. An automated report with a wrong observation in it destroys more trust than a late one.

---

## `/admin/messages` — Unified inbox

All client threads in one place. Left: conversation list with unread badges, sorted by oldest-unanswered first *(not newest — that's how messages get missed)*. Right: the thread, with the client's context panel alongside.

**Canned replies** for the five most common questions, editable before sending — saves an enormous amount of time without making replies feel robotic.

**Actions from the thread:** open the client file, open the plan builder, book an appointment, add a private note.

**Response-time tracking:** average response time surfaced on the overview. A quiet accountability metric, and a genuine differentiator if it stays low.

---

## `/admin/programs` — Programme catalogue
Programme definitions: name, description, duration options, price per duration, what's included (consultations, follow-ups, revisions, reports), active/inactive, display order on the website. Editing here updates the public pricing pages — one source of truth.

## `/admin/payments` *(V2)*
Transactions, invoices, dues, refunds, Razorpay reconciliation. Revenue by programme, by month. Outstanding payments with a reminder action. GST-compliant invoice generation `[CONFIRM: GSTIN]`.

## `/admin/analytics` — Ozmo Insights *(V2)*
**Practice:** active clients, new vs churned, retention curve, revenue, programme mix, capacity utilisation.
**Clinical:** average weight change by programme, average adherence, completion rate, outcome distribution — *this is the data that eventually makes Ozmo's marketing unanswerable.*
**Funnel:** assessments started/completed, drop-off by step, assessment → booking → conversion rates, source attribution, cost per acquisition if ad spend is entered.
**Engagement:** DAU/WAU, logging frequency, feature usage, notification response rates.

## `/admin/content/*` *(V2–V3)*
Blog CMS (draft/review/publish, SEO fields, author, reviewed-by, scheduling), recipe CMS, FAQ manager, and **success stories with the consent gate** — publish disabled until `consentGiven` is true and `consentScope` covers everything on the page.

## `/admin/staff` *(V2)*
Users, roles, permissions, client assignment, activity log, deactivation.

## `/admin/settings`
Clinic details, branding, working hours, appointment settings, notification templates, integrations (Razorpay, WhatsApp, email), programme defaults, plan-builder defaults, data retention settings.

## `/admin/audit-log` *(V2)*
Every access to and change of client data: who, what, when, from where. **Required for health data.** Immutable, filterable, exportable.

---

## Roles & permissions

| | Super Admin | Dietitian | Assistant | Front Desk |
|---|---|---|---|---|
| View all clients | ✓ | ✓ | assigned only | basic info only |
| Edit health data | ✓ | ✓ | ✗ | ✗ |
| Create/edit plans | ✓ | ✓ | draft only | ✗ |
| Publish plans | ✓ | ✓ | ✗ | ✗ |
| View lab reports | ✓ | ✓ | ✗ | ✗ |
| Message clients | ✓ | ✓ | ✓ | ✓ |
| Manage appointments | ✓ | ✓ | ✓ | ✓ |
| View payments | ✓ | own clients | ✗ | ✓ |
| Manage programmes/pricing | ✓ | ✗ | ✗ | ✗ |
| Manage staff | ✓ | ✗ | ✗ | ✗ |
| View analytics | ✓ | own clients | ✗ | ✗ |
| Manage content | ✓ | ✓ | ✓ | ✗ |
| View audit log | ✓ | ✗ | ✗ | ✗ |
| Export client data | ✓ | ✗ | ✗ | ✗ |

**Front Desk explicitly cannot see health data.** Name, phone, programme, payment status, appointment — that's it. This isn't bureaucracy; it's the correct handling of health information and it's straightforward to build if it's designed in from the start.

---

## The AI layer *(Phase 3 — build only after the core is solid)*

### Admin copilot — genuinely useful, low risk
Natural-language queries over the practice data:
`Which clients haven't logged in 7 days?` · `Show me everyone with adherence below 60%` · `Who's finishing their programme this month?` · `Draft tomorrow's follow-up list` · `Summarise Priya's last month for her report`

Read-only, always returns the underlying list so Aman can verify, never takes an action on its own.

### Client assistant — constrained, useful
Answers **only from the client's own approved plan**:
`What's for dinner?` → reads the plan.
`I don't have paneer` → offers the dietitian-approved alternatives for that slot.
`Can I eat mango?` → *"That's one for [Dietitian] — I've passed it on."* and routes to the message thread.

**Hard constraints:** cannot create or change a plan · cannot answer medical questions · cannot interpret lab values · cannot contradict the dietitian · every uncertain query escalates to a human.

### Lab report extraction — assistive only
OCR + extraction of values into structured fields **for the dietitian to review and confirm**. Never surfaced to the client as interpretation. Never auto-applied to a plan.

> **The principle across all three: AI reduces the dietitian's admin load. It never replaces the dietitian's judgement.** The moment a client can get clinical advice from the AI without Aman in the loop, the product's core promise — and its legal position — is gone.
