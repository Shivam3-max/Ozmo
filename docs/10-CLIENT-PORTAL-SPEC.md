# 10 — Client Portal: Screen-by-Screen Spec

**The design brief:** the portal must be usable in under 60 seconds a day, half-asleep, on a phone, one-handed. Every extra tap loses clients. Density and speed over decoration.

**Route group:** `/portal/*` · role `CLIENT` · `noindex` · no third-party scripts on any of these pages.

---

## `/portal/onboarding` — First-run wizard

Runs once, on first login. 5 short screens.

**Screen 1 — Welcome**
> **Welcome to Ozmo, [Name].**
> This is your dashboard. Your plan, your progress and your dietitian all live here. Let's set it up — takes about a minute.
`Let's go →`

**Screen 2 — Confirm your details**
Pre-filled from the assessment/consultation. Height, weight, goal weight, date of birth. `These look right? →`

**Screen 3 — Set your meal times**
Six time inputs with sensible defaults: Early morning 7:00 · Breakfast 8:30 · Mid-morning 11:00 · Lunch 13:30 · Evening 17:00 · Dinner 20:00.
> Your reminders and your daily plan follow these times. You can change them any time.

**Screen 4 — Reminders**
Toggles, all default **on**: `Meal reminders` · `Water reminders` · `Weekly weigh-in` · `Appointment reminders` · `Messages from your dietitian`
Channel: `In-app` (always on) · `WhatsApp` · `Email`

**Screen 5 — Add to home screen** *(mobile only)*
> **Put Ozmo on your home screen**
> It'll open like an app — no download needed.
Platform-detected instructions. `Show me how` / `Maybe later`

**Finish:** → dashboard with a first-time coach overlay (3 tooltips: today's plan, the log button, your Ozmo Score).

---

## `/portal` — Dashboard

The screen 90% of sessions start and end on. It must answer three questions in under two seconds: *What do I eat next? How am I doing? Is there anything I need to deal with?*

### Layout, top to bottom (mobile order)

**1. Greeting bar**
`Good morning, [Name] 👋` · today's date · a rotating one-line note *(streak status, or "Your plan was updated yesterday", or nothing)*

**2. Attention strip** *(only renders when there's something)*
Dismissible cards, max 2 at a time, priority-ordered:
- `Your dietitian sent you a message` → Messages
- `Your plan has been updated` → Plan
- `Consultation tomorrow at 5:30 PM` → Appointments
- `Time for your weekly weigh-in` → Measurements
- `You haven't logged in 3 days — everything okay?` *(soft, never guilt-inducing)*

**3. Up next** — the hero card
```
UP NEXT · 1:30 PM
Lunch
─────────────────────────
Salad (1 bowl)
2 roti (multigrain)
Dal (1 katori)
Bhindi sabzi (1 katori)
Curd (1 small bowl)

[ Mark as eaten ]   [ Swap ]   [ I ate something else ]
```
*After the last meal of the day, this becomes a day-summary card: "That's your day done. Adherence: 5/6 meals."*

**4. Today's plan strip** — horizontal scroll of all 6 meal slots, each a small pill: time, meal name, and state (`✓ done` pulse / `upcoming` mist / `missed` slate). Tapping opens the detail sheet.

**5. Metric row** — four tiles: `Current weight` (+ delta since start) · `Ozmo Score` (with weekly delta) · `Today's adherence` (x/6) · `Water` (glasses, with a `+1` button right on the tile)

**6. Quick actions** — 4 large buttons: `Log a meal` · `Add water` · `Record weight` · `Message dietitian`

**7. This week** — a 7-column adherence strip (Mon–Sun), each day a small square filled on the sequential scale. Under it: `You've hit 82% this week` + streak: `🔥 12-day streak`

**8. Programme strip** — `Weight Transformation · Day 34 of 90` with a thin progress bar and `Next follow-up: 12 Sep`

### Empty state (day 1, before a plan exists)
> **Your plan is on its way**
> [Dietitian] is building your plan after your consultation. It usually arrives within 24–48 hours, and you'll get a message the moment it's here.
> In the meantime: `Complete your profile` · `Record your starting weight` · `Upload any lab reports`

---

## `/portal/plan` — My Diet Plan

**Not a PDF.** The whole point.

### Week view (default)
Sticky day selector across the top: `Mon 2 · Tue 3 · Wed 4 …` with today highlighted, past days showing a small adherence dot.

Below: the selected day's six meal slots as expandable cards.

```
┌────────────────────────────────────────┐
│ BREAKFAST · 8:30 AM              ✓ done │
│ Vegetable poha — 1 medium bowl          │
│ Curd — 1 small bowl                     │
│ Almonds — 5                             │
│                                         │
│ ~380 kcal · 12g protein     [collapsed] │
│ ▸ Alternatives (3)                      │
│ [ ✓ Ate this ] [ ↻ Swap ] [ 📷 Photo ]  │
└────────────────────────────────────────┘
```

**Meal card actions:**
| Action | Behaviour |
|---|---|
| `✓ Ate this` | One tap. Logs adherence, timestamps it. Card turns pulse-tinted. **This is the single most important interaction in the product** |
| `↻ Swap` | Opens the dietitian-approved alternatives for that slot. Selecting one replaces it for today only and logs the swap |
| `I ate something else` | Free-text or food-search entry. Logged as a deviation, **not** as a failure — visible to the dietitian |
| `📷 Photo` | *(V2)* Photo attached to the log |
| `⭐ Favourite` | Marks a meal they like. Surfaces in admin so the dietitian can use it more |
| `👎 Didn't like this` | Quiet signal, no explanation needed. Shows in admin. **Extremely valuable and almost never collected** |

**Alternatives panel:** each shows name, quantity, and a one-line "why this works" from the dietitian. This is where the plan stops feeling like a rulebook.

### Other views
- **Full week grid** (desktop): 7 columns × 6 slots. Print-friendly
- **Download PDF** — because some people genuinely want the paper. Branded, with the plan, alternatives and dietitian notes
- **Plan notes** — a free-text block from the dietitian, pinned at the top: *"Priya — for this fortnight, focus on getting dinner before 8:30. Everything else stays."*

### Version awareness
`Plan version 3 · updated 2 Sep by [Dietitian]` · `View previous versions` — clients should be able to see the plan has been actively worked on. It's proof of service.

---

## `/portal/log` — Food & water log

For everything eaten outside the plan, and the fastest possible water logging.

**Water — top of screen**
Eight glass icons in a row, tap to fill. Big `+1 glass` button. Target shown: `6 of 8 glasses`. Nothing else. Two seconds, done.

**Food log**
Reverse-chronological list of today's entries: time, meal slot, what, source (`from plan` / `swapped` / `off plan`).

`+ Add an entry` opens a sheet:
1. **Which meal?** — slot picker
2. **What did you eat?** — search over the food database with recent + favourites surfaced first. Free text always allowed as a fallback — **never block a log because the food isn't in the database**
3. **How much?** — Indian units first: `1 katori` `1 bowl` `1 roti` `1 glass` `1 plate` `1 piece`, with grams as an option
4. `Save`

**Design rule:** logging must never feel like data entry for someone else's benefit. Show the client something immediately — adherence updates, the streak ticks, the ring moves.

**Weekly history:** a compact 7-day view showing meals logged vs planned and total water.

---

## `/portal/measurements` — Weight & body

**Record entry** — big primary card:
`Weight` (required) · `Waist` · `Hip` · `Chest` · `Arm` · `Body fat %` · `Date` (defaults today) · optional note.
Only weight is required. Everything else is optional and collapsed under `+ Add measurements`.

**On save** — immediate feedback, and get the tone right:
- Moving toward goal: `78.4 kg — that's 0.6 kg down from last week. Steady progress.`
- Flat: `78.4 kg — same as last week. Weight often plateaus for a week or two while other things are still changing.`
- Moving away: `79.2 kg — up 0.4 kg. One reading doesn't mean much; weight fluctuates with water, salt and cycle. Let's look at the trend.`

> **Never** display a negative or disappointed message. Never use red on a weight increase. This is where clients quit, and the copy here matters more than almost anywhere else in the product.

**Trend chart** — weight over time, 1M/3M/6M/All toggle. Goal line as a dashed pulse rule. Start marker. Optionally a 7-day moving average toggle labelled `Smooth out daily fluctuation` — genuinely useful, since it shows progress the raw line hides.

**Measurements table** — all entries, editable, deletable.

**Summary tiles** — `Starting` · `Current` · `Change` · `To goal`

---

## `/portal/progress` — Progress & Ozmo Score

The retention screen. Everything here exists to make continuing feel worth it.

### The Ozmo Score
A large ring, centred.
```
        ┌──────────┐
        │    78    │
        │ /  100   │
        └──────────┘
     Your Ozmo Score
   ↑ 6 from last week
```

**What it's made of** — always transparent, expandable, never a black box:

| Component | Weight | Measured by |
|---|---|---|
| Meal adherence | 35% | Planned meals marked eaten, 7-day |
| Consistency of logging | 20% | Days with any log, 7-day |
| Hydration | 15% | Water target hit |
| Activity | 15% | Steps or activity logged |
| Weigh-ins | 10% | Weekly weigh-in recorded |
| Engagement | 5% | Opened plan, replied to dietitian |

**Bands:** 85–100 `Excellent` · 70–84 `On track` · 50–69 `Slipping` · <50 `Let's reset`

**Copy under the score, by band:**
- Excellent: `You've been very consistent this week. This is exactly what makes the difference over months.`
- On track: `Solid week. The consistency is there.`
- Slipping: `A quieter week. It happens — the fastest way back is to just log tomorrow's breakfast.`
- Reset: `This week got away from you. That's fine, and it's fixable. Message [Dietitian] if something's not working — the plan can change.`

> **Rule:** the score never scolds. It never goes red. Below 50 it goes `--status-watch` amber, never `--status-alert`. And the client always sees exactly how it's calculated — a score you can't understand is a score you stop trusting.

### Streaks
`🔥 12-day streak · Longest: 21 days`
Milestone badges at 7 / 14 / 30 / 60 / 90 / 180 days.
Badge set: `First Week` 🏆 · `Meal Master` 🥗 (30 days of ≥80% adherence) · `Hydration Hero` 💧 (14 days at water target) · `On the Move` 🚶 (activity, 21 days) · `Consistency` 🔥 (30-day streak) · `Halfway` ⛰️ (50% of programme) · `Finisher` 🎯 (programme completed)

**Streak grace:** miss one day and the streak survives with a `Saved` marker, once per fortnight. Streaks that shatter on the first miss cause abandonment — the goal is retention, not punishment.

### Charts
Weight trend · Adherence by week (bars) · Measurements over time · Ozmo Score history · a 12-week adherence heatmap calendar

### Milestones feed
Auto-generated, chronological, and genuinely motivating:
`2 Sep — Crossed 80 kg for the first time in 2 years` · `28 Aug — 14-day streak` · `20 Aug — Waist down 4 cm` · `1 Aug — Started Weight Transformation`

---

## `/portal/workout` — My Fitness Plan *(V2)*

Weekly schedule of assigned sessions. Each session: name, type badge (Cardio/Strength/Yoga/Mobility/Walking), duration, exercise list.

Exercise detail: name, illustration or short video, sets, reps, duration, rest, and a form note from the dietitian/trainer. `Mark complete` per exercise and per session.

Rest days appear explicitly, labelled `Rest day — this is part of the plan`, because clients treat unlabelled gaps as failure.

`This week: 3 of 4 sessions done`

---

## `/portal/reports` — Report Centre

The "no more searching WhatsApp" screen. A single document list with filters.

Categories: `Diet Plans` · `Workout Plans` · `Consultation Notes` · `Progress Reports` · `Lab Reports` · `Invoices` · `Other`

Row: icon by type · title · date · size · `View` · `Download`.
Unread items carry a pulse dot.

**Monthly progress report** gets a featured card at the top when a new one lands:
> **Your August progress report is ready**
> Weight down 2.9 kg · Adherence 82% · Waist down 3 cm
> `Read the full report →`

---

## `/portal/lab-reports` — Lab Reports *(V2)*

**Upload:** drag-drop or camera. Accepts PDF, JPG, PNG. Max 10MB. Fields: report type (`CBC` / `HbA1c` / `Lipid Profile` / `Thyroid` / `Vitamin D` / `B12` / `Liver` / `Kidney` / `Other`), date of test, lab name (optional), note to dietitian (optional).

**On upload:** `Sent to [Dietitian]. They'll review it before your next consultation.`

**History list** grouped by type, with dates.

**Extracted values** *(V3)* — when AI extraction is added, values appear in the client's view as **plain data with no interpretation**: `HbA1c: 6.8% · 12 Aug 2026`. A trend line if multiple readings exist. And a fixed line beneath:
> These are the values from your report. What they mean for you is a conversation for your doctor and your dietitian.

> ⚠️ **Hard rule:** the client-facing side never labels a value "high," "normal" or "concerning," and never explains what it means. Reference-range interpretation is medical interpretation. The dietitian's admin view can show ranges; the client's view shows numbers.

---

## `/portal/appointments` — Consultations

**Next appointment card:**
```
UPCOMING
Friday, 12 September · 5:30 PM
Follow-up consultation with [Dietitian]
Online video call

[ Join consultation ]   [ Reschedule ]   [ Cancel ]
```
`Join` becomes active 10 minutes before. Reschedule/cancel disabled inside the cancellation window `[CONFIRM: 24h]`, replaced with `Please call the clinic to change this appointment.`

**Prepare for your consultation** *(shown 24h before):*
> Before Friday: record this week's weight, log the last few days, and jot down anything you want to ask.
> `Add a question for [Dietitian] →`

**Past consultations:** date, type, and the consultation note the dietitian chose to share.

**Book a follow-up:** if the programme includes remaining follow-ups, show `3 follow-ups remaining` and let them book from available slots.

---

## `/portal/messages` — Chat with your dietitian

Single-thread messaging with the assigned dietitian.

**Header:** dietitian name, photo, and an honest expectation-setter: `Usually replies within [CONFIRM: 24 hours] on working days`

**Composer:** text, attachment (image/PDF).

**Quick-ask chips** above the composer, because most messages are one of five things:
`Can I eat ___?` · `I'm travelling next week` · `I'm not able to follow ___` · `I have a new report` · `I'd like to change my plan`

**Context sidebar** *(desktop)*: their current weight, adherence and plan version — so the conversation happens with the facts visible.

**Critical banner, always present at the top of the thread:**
> For anything urgent or medical, please contact your doctor. This chat is for nutrition and plan questions and isn't monitored around the clock.

**Empty state:**
> **Ask [Dietitian] anything about your plan.**
> Stuck on something? Can't find an ingredient? Travelling? Just say so — the plan can change.

---

## `/portal/programme` — My Programme

What they bought, what's used, what's left. Reduces "what am I paying for?" friction and is where renewal happens.

Programme name · start and end date · progress bar with day count · what's included (checklist with used/remaining counts: `Follow-ups: 3 of 6 used`, `Plan revisions: unlimited`, `Progress reports: 1 of 3 delivered`).

**At T-14 days from programme end:**
> **Your programme ends on 30 October**
> Here's what's changed since you started: `−6.4 kg · waist −8 cm · average adherence 79%`
> Most people move to a maintenance plan at this point to hold what they've built.
> `See your options →` · `Message [Dietitian] about next steps`

---

## `/portal/payments` — Payments *(V2)*
Invoice list with download. Payment history. Any pending dues with a `Pay now` action. Saved payment method managed entirely by Razorpay — **we never store card data.**

---

## `/portal/profile` — Profile & preferences
Personal details · goal and target weight · food preference and allergies · meal times · health conditions (read-only; changes go through the dietitian) · current medication · emergency contact `[optional]`.

Editing conditions or medication triggers a notification to the dietitian — these are clinically relevant changes, not profile edits.

---

## `/portal/settings` — Account
Change password · notification preferences (per type, per channel) · language `[if bilingual]` · theme (light/dark/system) · **Export my data** (JSON + PDF of everything, generated on request) · **Delete my account** (with a clear explanation of what's kept for clinical-record reasons and for how long, per the retention policy) · logout everywhere.

> Export and delete are DPDP obligations. Building them as real self-serve features from V1 is far cheaper than retro-fitting them under a complaint.

---

## Notifications & reminders

| Trigger | Timing | Copy | Channel |
|---|---|---|---|
| Meal reminder | At each meal time | `Breakfast time — your plan's ready 🍽️` | Push, in-app |
| Water reminder | 12:00, 16:00 | `Water check — you're at 3 of 8 glasses 💧` | Push |
| Weekly weigh-in | Chosen day, 8:00 | `Time for this week's weigh-in ⚖️` | Push, WhatsApp |
| No log 2 days | 19:00 | `Haven't seen you in a couple of days. Everything okay?` | Push |
| No log 5 days | 19:00 | Alerts the **dietitian**, not the client. A human message beats an automated one | Admin alert |
| New plan | Immediate | `Your updated plan is ready 🥗` | Push, WhatsApp, email |
| Dietitian message | Immediate | `[Dietitian] sent you a message` | Push, WhatsApp |
| Appointment | 24h + 1h before | `Consultation tomorrow at 5:30 PM with [Dietitian]` | Push, WhatsApp, email |
| Streak milestone | On unlock | `🔥 14-day streak. That's the hard part done.` | Push, in-app |
| Progress report | On publish | `Your monthly progress report is ready` | Push, email |
| Programme ending | T-14, T-3 | `Your programme ends soon — here's what's changed` | In-app, email |

**Rules:** never more than 4 notifications a day · nothing between 22:00 and 06:00 except appointment reminders · every reminder is individually switchable · **no health data in any WhatsApp or SMS payload** — the message says "your plan is ready," never what's in it.

---

## PWA requirements

Manifest with Ozmo icons, `standalone` display, `--ozmo-ink` theme colour · service worker caching the plan, today's log and static shell · **offline logging that queues and syncs** (people log meals on trains and in basements) · install prompt after the third session, never on the first · push via Web Push API.

---

## Error, empty & loading states

| State | Copy |
|---|---|
| No plan yet | `Your plan is being prepared. You'll get a message the moment it's ready.` |
| No measurements | `Record your first weight to start tracking. It takes five seconds.` |
| No messages | `No messages yet. Ask [Dietitian] anything about your plan.` |
| No reports | `Your reports will appear here as they're created.` |
| Offline | `You're offline. Anything you log will sync when you're back.` |
| Save failed | `Couldn't save that — we've kept it and we'll try again. Nothing's lost.` |
| Session expired | `You've been logged out for security. Log back in to continue.` |
| Programme ended | `Your programme has ended. Your history stays here permanently. Want to continue?` |
