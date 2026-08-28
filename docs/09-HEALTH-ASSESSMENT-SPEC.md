# 09 — The Health Assessment & Ozmo Health Snapshot

The single highest-value asset on the public site. It is the lead magnet, the qualification tool, the pre-consultation intake form and the first taste of the product — all in one flow.

---

## Design principles

1. **One question per screen.** Never a wall of fields. Completion rate lives or dies here.
2. **Progress always visible.** "Step 3 of 7 · about 2 minutes left."
3. **No login until the end.** Ask for contact details on the final screen, after they've invested effort. Asking first kills 40%+ of starts.
4. **Save as you go.** Every answer persists to `localStorage` and, once we have an email, to the server. Someone should be able to close the tab and come back.
5. **Never look medical.** No clinical language, no scary framing. This is a conversation.
6. **Every question must earn its place.** If Aman wouldn't use the answer, cut it. There are 31 questions here; each one either shapes the Snapshot or shapes the consultation.
7. **Escape hatches.** "Prefer not to say" and "I don't know" on anything sensitive. Forcing an answer produces a lie.

---

## Flow architecture

```
/assessment
  ├─ Intro screen (with the "start now" pre-filled entry from the homepage)
  ├─ Step 1  Basics              5 questions
  ├─ Step 2  Your goal           3 questions
  ├─ Step 3  Health background   4 questions
  ├─ Step 4  Your lifestyle      7 questions
  ├─ Step 5  How you eat now     6 questions
  ├─ Step 6  Medical information 4 questions
  ├─ Step 7  The real question   2 questions
  ├─ Contact capture             3 fields + consent
  └─ /assessment/snapshot/[token]   ← the payoff
```

**Estimated completion: 4–5 minutes.** Target completion rate: >55% of people who start Step 1.

---

## Intro screen

**H1:** Let's find out where you actually stand
**Body:** A few questions about your body, your routine and how you eat. At the end you'll get your Ozmo Health Snapshot — a personalised summary with your key numbers and a clear first step.
**Three reassurance points (icons + label):**
`About 4 minutes` · `No payment, no obligation` · `Your answers are private`
**CTA:** `Start →`
**Small print:** Your answers are used to prepare your Snapshot and, if you choose to book, to make your consultation more useful. Read our `Privacy Policy`. This is not a medical assessment and doesn't diagnose anything.

---

## STEP 1 — The basics

**Section intro:** First, the essentials.

**Q1.1 — What should we call you?**
Type: text · Required · Placeholder: "First name"
*Used to personalise every subsequent screen — "Nice to meet you, Shivam."*

**Q1.2 — How old are you?**
Type: number, 13–100 · Required
*If <18: branch to a parental-consent notice and route to `/conditions/child-nutrition` + contact form instead of continuing.*

**Q1.3 — Gender**
Options: `Female` · `Male` · `Other` · `Prefer not to say`
*Drives BMR estimation and whether PCOS/pregnancy questions appear.*

**Q1.4 — Your height**
Type: number with unit toggle `cm` / `ft-in` · Required · Default cm

**Q1.5 — Your current weight**
Type: number, unit toggle `kg` / `lbs` · Required · Default kg
Helper: "Roughly is fine — we'll measure properly at your consultation."

---

## STEP 2 — Your goal

**Section intro:** Now, what you're here for.

**Q2.1 — What would you like to work on first?** *(single select, large cards)*
`Lose weight` · `Manage a health condition` · `Gain weight` · `Build fitness or muscle` · `Improve digestion` · `Feel better overall` · `Not sure yet`
*This is the primary routing variable. Pre-filled if they arrived from the homepage inline question.*

**Q2.2 — Do you have a target weight in mind?** *(shown only if goal = lose/gain weight)*
Type: number + unit · Optional · `I'm not sure` option
Helper: "No pressure — it's fine not to have a number."

**Q2.3 — Why now?** *(single select)*
`A health scare or report` · `An upcoming event` · `I've been meaning to for a while` · `A doctor advised me` · `I want to get ahead of a family history` · `Something else`
*Extremely useful for the consultation and for the lead score. Motivation type predicts adherence better than almost anything else.*

---

## STEP 3 — Health background

**Section intro:** This helps us understand your body. Tick whatever applies — and it's fine if nothing does.

**Q3.1 — Do any of these apply to you?** *(multi-select, with a clear "None of these")*
`Diabetes or high blood sugar` · `Pre-diabetes` · `PCOS / PCOD` · `Thyroid (hypo or hyper)` · `High cholesterol` · `High blood pressure` · `Fatty liver` · `Digestive issues (bloating, acidity, IBS)` · `Anaemia or low iron` · `Vitamin D or B12 deficiency` · `Joint pain or arthritis` · `Heart condition` · `Kidney condition` · `Currently pregnant` · `Recently gave birth` · `None of these` · `Something else` (text)

> **Build note:** selecting `Kidney condition`, `Heart condition`, or `Currently pregnant` sets a `requiresMedicalCaution` flag on the record. The Snapshot then shows a specific "please involve your doctor" message, and the admin queue flags the lead in `--status-watch`.

**Q3.2 — Have you had any blood tests in the last six months?**
`Yes, and I have the reports` · `Yes, but I don't have them handy` · `No` · `Not sure`

**Q3.3 — Which of these do you experience regularly?** *(multi-select — the symptom picture)*
`Low energy or fatigue` · `Trouble sleeping` · `Frequent hunger or cravings` · `Bloating after meals` · `Acidity or heartburn` · `Constipation` · `Hair fall` · `Mood swings or low mood` · `Joint or body pain` · `Frequent headaches` · `Irregular periods` *(if female)* · `None of these`

**Q3.4 — Has anyone in your immediate family had any of these?** *(multi-select)*
`Diabetes` · `Heart disease` · `High blood pressure` · `Obesity` · `Thyroid` · `Cancer` · `None that I know of` · `Prefer not to say`

---

## STEP 4 — Your lifestyle

**Section intro:** How your days actually run. Be honest — this is the part that decides whether a plan survives.

**Q4.1 — How active are you day to day?** *(single select, descriptive not numeric)*
`Mostly sitting — desk job, little walking`
`Lightly active — some walking, occasional exercise`
`Moderately active — regular walking or exercise 3–4 days a week`
`Very active — exercise 5+ days a week, or a physical job`
`Athlete-level — training most days`

**Q4.2 — Do you exercise? What kind?** *(multi-select)*
`Walking` · `Gym / weights` · `Running` · `Yoga` · `Cycling` · `Sports` · `Home workouts` · `Not currently`

**Q4.3 — How many hours do you usually sleep?**
`Less than 5` · `5–6` · `6–7` · `7–8` · `More than 8`

**Q4.4 — How would you describe your sleep quality?**
`I sleep well` · `I sleep okay` · `I wake up often` · `I struggle to fall asleep` · `It's genuinely bad`

**Q4.5 — How much water do you drink in a day?**
`Less than 1 litre` · `1–2 litres` · `2–3 litres` · `More than 3 litres` · `I have no idea`

**Q4.6 — What are your work hours like?**
`Regular day shift` · `Long or unpredictable hours` · `Night shift` · `Rotating shifts` · `I work from home` · `I don't work outside the home` · `Student`

**Q4.7 — How's your stress level been lately?**
`Low` · `Manageable` · `High` · `Very high`
*Included because stress drives eating patterns more than most people admit, and because it changes what plan is realistic.*

---

## STEP 5 — How you eat now

**Section intro:** No judgement here — we need the real picture, not the ideal one.

**Q5.1 — What's your food preference?**
`Vegetarian` · `Vegetarian + eggs` · `Non-vegetarian` · `Vegan` · `Jain` · `Something else`

**Q5.2 — Any allergies or foods you can't eat?**
Type: textarea · Optional · Placeholder: "Nuts, lactose, gluten, anything you avoid"

**Q5.3 — Who cooks at home?**
`I do` · `A family member` · `A cook or help` · `Mostly ordered or eaten out` · `A mix`
*Critically important and almost never asked. It determines whether a plan can involve any cooking at all.*

**Q5.4 — How often do you eat out or order in?**
`Rarely` · `Once a week` · `2–3 times a week` · `4–6 times a week` · `Almost daily`

**Q5.5 — Walk us through a normal day of eating.** *(five short text fields, all optional)*
`Early morning (anything before breakfast)` · `Breakfast` · `Lunch` · `Evening snack` · `Dinner`
Helper under each: "Roughly what and roughly when. 'Skip' is a valid answer."

> This single question is the most valuable input in the entire assessment. It arrives at the consultation already answered, saving 10 minutes and producing a far better first plan.

**Q5.6 — Which of these sound like you?** *(multi-select)*
`I skip breakfast` · `I eat dinner very late` · `I snack a lot in the evening` · `I drink 3+ teas or coffees a day` · `I eat quickly` · `I eat when I'm stressed` · `I have a sweet craving after meals` · `Weekends are completely different from weekdays` · `I drink alcohol regularly` · `None of these`

---

## STEP 6 — Medical information

**Section intro:** Only what's relevant to your food. You can skip anything you'd rather discuss in person.

**Q6.1 — Are you taking any medication?**
`Yes` (→ textarea: "What do you take? Names are helpful but not essential") · `No` · `I'd rather discuss this in person`

**Q6.2 — Any supplements or vitamins?**
`Yes` (→ textarea) · `No`

**Q6.3 — Have you had any surgery or major illness in the last two years?**
`Yes` (→ textarea) · `No` · `Prefer not to say`

**Q6.4 — Have you followed a diet plan before?**
`Yes, with a dietitian` · `Yes, from the internet or an app` · `Yes, from a gym trainer` · `No, this is my first` · `Several times`
*(If any "yes"):* **What happened?** *(single select)*
`It worked and I kept it` · `It worked but I put it back on` · `I couldn't stick to it` · `It was too restrictive` · `I got bored` · `Life got in the way` · `I didn't see results`

> Q6.4 is a gift to the consultation. Knowing *how* someone's last attempt failed tells Aman more than any measurement.

---

## STEP 7 — The real question

**Section intro:** Last one. This is the one that matters most.

**Q7.1 — What do you think is actually getting in your way?** *(textarea, generous size)*
Placeholder: "Be honest — nobody's marking this. The more real your answer, the more useful your plan will be."

> Psychologically the strongest moment in the flow. People write things here they'd never say out loud in a first consultation. It builds investment, and it hands Aman the emotional context that turns a good consultation into the right one.

**Q7.2 — How ready are you to start?** *(slider or 5 options)*
`Just exploring for now` · `Thinking about it` · `Fairly serious` · `Ready to start` · `I need to start immediately`

> **This is the lead score.** `Ready` / `Immediately` → high-priority in the admin queue. `Just exploring` → nurture sequence, not a sales call. Treating these identically is how clinics waste time and annoy people.

---

## Contact capture

**H2:** Your Snapshot is ready
**Body:** Where should we send it?

Fields: `Email*` · `Phone (WhatsApp)*` · `City`

**Consent checkboxes:**
- **Required:** `I agree to Ozmo preparing and sending my Health Snapshot, and to being contacted about it. I've read the` [Privacy Policy](/privacy-policy)`.`
- **Optional:** `Send me occasional nutrition tips and updates. (You can unsubscribe any time.)`

**CTA:** `See my Snapshot →`
**Small print:** We don't sell your data. Ever. Your health information is stored securely and only your dietitian and clinic staff can see it.

> **Build note:** the Snapshot is computed and displayed *immediately* — no waiting, no "check your email." Email and WhatsApp delivery happens in parallel as a bonus. Making people leave the page to get their reward loses most of them.

---

## THE OZMO HEALTH SNAPSHOT

`/assessment/snapshot/[token]` · noindex · tokenised URL, no login required · valid 30 days · re-sendable from admin

### Layout

**Header**
```
YOUR OZMO HEALTH SNAPSHOT
Prepared for [Name] · [Date]
```

**Disclaimer, immediately below the header — never buried at the bottom:**
> This snapshot is a summary of the answers you gave us. It is not a medical assessment and does not diagnose anything. It's a starting point for a conversation.

---

### Block 1 — Your numbers
Four metric tiles:

| Tile | Value | Sub-line |
|---|---|---|
| Current weight | `82 kg` | — |
| BMI | `27.4` | `Above the healthy range` — banded, worded not colour-coded alone |
| Goal | `Weight management` | From your answers |
| Activity level | `Lightly active` | Based on your routine |

**BMI banding copy** *(never alarming, always caveated):*
- <18.5 → `Below the healthy range`
- 18.5–22.9 → `In the healthy range`
- 23–24.9 → `Slightly above the healthy range for Indian adults`
- 25–29.9 → `Above the healthy range`
- ≥30 → `Well above the healthy range`

**Mandatory footnote under BMI:**
> BMI is a rough screening number, not a verdict. It doesn't distinguish muscle from fat and it doesn't know your body. Your dietitian will measure properly at your consultation.

*Use Asian-Indian BMI cut-offs (healthy 18.5–22.9), and say so — it's more accurate for this population and it demonstrates competence.*

---

### Block 2 — What stands out
*3–5 dynamically generated cards, ranked by weight. This is the section that makes the Snapshot feel personal. Rule-based, never AI-generated free text.*

Each card: an icon, a heading, 2–3 sentences.

**Example rules:**

| Trigger | Card heading | Body |
|---|---|---|
| `sleep < 6 hrs` OR `sleep quality = bad` | **Sleep is working against you** | You're getting under six hours. Short sleep is strongly linked to increased hunger and stronger cravings the next day — which makes eating well much harder than it needs to be. This is often one of the fastest things to improve. |
| `water < 1L` | **You're drinking less water than your body needs** | Under a litre a day is low. Thirst is frequently mistaken for hunger, and low fluid intake also contributes to fatigue and constipation. |
| `skips breakfast` AND `evening snacking` | **Your day is back-loaded** | Skipping breakfast and snacking heavily in the evening usually go together — the second one is caused by the first. Rebalancing across the day is often the single highest-impact change. |
| `late dinner` | **Dinner is landing late** | Late, heavy dinners affect sleep quality and, for some people, blood sugar. Moving dinner earlier is a small change with a disproportionate effect. |
| `hasCondition(PCOS)` | **PCOS changes the approach** | Standard weight-loss advice often underperforms with PCOS because insulin sensitivity sits at the centre of the picture. The approach needs to be built differently — which is good news, because it means it isn't a discipline problem. |
| `hasCondition(thyroid)` | **Your thyroid is part of the picture** | A thyroid condition typically means weight change is slower, and that meal timing around your medication matters. Both are manageable once accounted for. |
| `hasCondition(diabetes/pre-diabetes)` | **Your blood sugar deserves the lead** | With blood sugar in the picture, carbohydrate quality, pairing and meal timing become the main levers — usually more than restriction. |
| `activity = mostly sitting` | **Movement is your easiest win** | A mostly seated day is common and completely workable. A ten-minute walk after lunch and dinner is one of the highest-return habits available. |
| `previousDiet = "worked but put it back on"` | **You already know how to lose it** | You've done this before — the loss isn't the problem, the maintenance is. That's a different problem with a different solution, and it's the one we're built for. |
| `previousDiet = "couldn't stick to it"` | **The plan was probably wrong, not you** | A plan you can't sustain is a design failure. The fix is usually a plan that looks a lot more like what you already eat. |
| `stress = high/very high` | **Stress is part of this** | High stress reliably changes what and when people eat. Ignoring it makes the nutrition work harder than it should — so we'd factor it in rather than pretend it isn't there. |
| `eatsOut ≥ 4/week` | **Eating out needs planning, not banning** | Four or more meals out a week is entirely normal now. It needs to be built into the plan rather than treated as cheating. |
| `familyHistory(diabetes/heart)` | **Family history is a reason to act early** | Family history raises risk; it doesn't decide the outcome. Nutrition and lifestyle are where the leverage is, and earlier is much easier than later. |

**Card ordering:** medical conditions first → previous-diet insight → sleep/stress → lifestyle. Cap at 5 — more dilutes the impact.

---

### Block 3 — What we'd focus on first
*3 items, generated from the same rule set, phrased as actions.*

**Example:**
> **1. Rebalance your day.** Get a real breakfast in, and the evening snacking usually takes care of itself.
> **2. Fix the sleep.** Six hours isn't enough to support what you're trying to do. We'd start here.
> **3. Add movement you'll actually do.** Not the gym — a ten-minute walk after lunch and dinner.

---

### Block 4 — Recommended programme
*One programme card, matched by rule:*

| Condition | Programme |
|---|---|
| Diabetes / pre-diabetes / cholesterol / BP / fatty liver | **Metabolic Health** |
| PCOS / thyroid | **Hormonal Balance** |
| Digestive issues as primary | **Gut & Digestive Health** |
| Fitness / muscle goal | **Fitness & Performance** |
| Weight loss/gain, no condition | **Weight Transformation** |
| General wellness / "not sure" | **Healthy Lifestyle** |

Card copy: `Based on your answers, we'd suggest starting with [Programme].` + programme summary + `Learn more →`

---

### Block 5 — Your next step (the conversion block)
**H2:** What happens next
**Body:**
This snapshot is built from what you told us. A consultation is where it gets real — your dietitian will go through your reports, your routine and your history properly, and build a plan around it.

`Book Your Consultation →` *(primary)*
`Talk to us on WhatsApp` *(secondary)*

**Small print:** No obligation. If we don't think we're the right fit for you, we'll tell you.

---

### Medical-caution variant
If `requiresMedicalCaution` is set, Block 5 is **replaced** with:
> **Please speak to your doctor first**
> Based on what you've told us, we'd want your doctor involved before starting any nutrition programme. That's not us turning you away — it's us doing this properly. Bring their guidance to your consultation and we'll build around it.
> `Book a consultation →` · `Read our medical disclaimer →`

---

### Actions on the Snapshot page
`Download as PDF` · `Email it to me` · `Send to WhatsApp` · `Retake the assessment`

---

## What happens in the admin

The moment the assessment is submitted:

1. A `Lead` record is created with the full assessment payload
2. It appears in `/admin/assessments` as **New**
3. Lead score computed: readiness (Q7.2) × condition complexity × goal clarity
4. **High-priority** (`Ready to start` / `Immediately`) → surfaced at the top of the queue with a `Call today` flag
5. **Medical caution** → flagged `--status-watch` with the reason shown
6. Automated sequence begins *(only if consent given)*:
   - **T+0** — WhatsApp/email: Snapshot link
   - **T+1 day** — "Any questions about your snapshot?"
   - **T+3 days** — a relevant article, matched to their primary concern
   - **T+7 days** — a single soft consultation offer
   - Then stop. Every message carries an opt-out.
7. If they book → the Lead converts to a Client and the full assessment carries into the client record, pre-filling the consultation form

> **Do not build a 12-message drip.** It's a health service, not a funnel. Four touches, then leave people alone. Aggressive nurture on health data reads as predatory and damages the brand.
