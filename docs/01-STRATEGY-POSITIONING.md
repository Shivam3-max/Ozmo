# 01 — Strategy & Positioning

---

## 1. The problem we're actually solving

A dietitian's business has one structural flaw: **the value is delivered in the first week, but the money is earned over three months.**

The client pays for a plan. They get a PDF. Week one they're excited. Week two the PDF is buried in WhatsApp under 400 messages. Week three they've stopped. Week four they don't renew — and they tell people "diets don't work," which is the worst possible marketing.

Meanwhile the dietitian is:
- Rewriting the same diabetic-vegetarian plan for the 60th time
- Answering "can I eat mango?" at 11pm
- Searching WhatsApp for someone's lab report from six weeks ago
- Guessing at how well a client is actually following the plan
- Having no data at review time except the number on the scale

**Both sides lose the same thing: continuity.**

So the product is not "a nicer diet chart." The product is **continuity, manufactured.**

---

## 2. The positioning

### What Ozmo is NOT
- Not a "dietitian website"
- Not a diet-chart PDF generator
- Not a calorie-counting app
- Not a marketplace of dietitians
- Not a medical service

### What Ozmo IS

> **Ozmo is a personal health programme, run by a real dietitian, delivered through software that keeps you on it.**

Three words hold the whole thing up:

| Pillar | What it means | How the product proves it |
|---|---|---|
| **Personal** | Your plan is built for your body, your kitchen, your schedule | Assessment → human consultation → custom plan, not a template served to you |
| **Accountable** | Someone is watching, and so are you | Daily logging, adherence %, streaks, Ozmo Score, dietitian sees everything |
| **Continuous** | The relationship doesn't end when the PDF arrives | Follow-ups, plan revisions, chat, monthly reports, progress you can see |

### The line we lead with

> **"Most people don't fail the diet. They fail the follow-up."**
> **Ozmo is built around the follow-up.**

That is the whole brand in one idea, and — critically — it is a claim the *product* backs up rather than the copy.

---

## 3. Naming architecture

**Public brand:** OZMO (by Ozmo Diet Clinic)

**Internal / platform name:** **Ozmo Health OS**

Module names (used in admin, in the pitch, and eventually as upsell tiers):

| Module | Function | Where it's visible |
|---|---|---|
| **Ozmo Care** | The client experience — dashboard, plan, logging | Client-facing (soft branding) |
| **Ozmo Plans** | Diet + workout plan builder | Admin only |
| **Ozmo Track** | Measurements, adherence, progress | Both |
| **Ozmo Connect** | Messaging, appointments, reminders | Both |
| **Ozmo Insights** | Analytics, reports, cohort data | Admin only |
| **Ozmo AI** | Assistive layer, phase 2 | Both (constrained) |

⚠️ **Do not put module names on the marketing site.** Clients don't buy modules, they buy outcomes. Module naming is for the admin UI and the investor/expansion story.

**Signature proprietary asset:** the **Ozmo Score** (see Section 10). Own it, trademark it eventually, put it on every report. It's the thing competitors can't copy because it encodes Aman's methodology.

---

## 4. Market read

The category is visibly moving from "diet chart software" to "practice operating system." Nutrinexa positions itself as a Nutrition OS; MealStack bundles planning, client portal, progress, messaging and billing. So the *shape* of the product is validated — meaning we don't have to prove the concept, we have to differentiate the execution.

**Where we do NOT compete:** breadth of features, food-database size, price. We'd lose all three to a funded SaaS.

**Where we win:**

1. **This is a clinic product, not a SaaS product.** Those platforms are horizontal tools sold to thousands of dietitians. Ozmo is one clinic's methodology, encoded. Every default, every template, every question in the assessment is Aman's. A generic tool can't be opinionated; we can.
2. **The client experience is the product, not an afterthought.** Most practice-management tools treat the client portal as a document drop. We're building the client side first and making it the reason people renew.
3. **Indian-first, and specific.** Roti counts, not grams of "bread." Poha, upma, khichdi, dal-chawal, thali logic, fasting days, festival eating, jain/satvik options, family cooking (the plan has to survive one kitchen cooking for four people). This is where imported tools fall apart.
4. **The moat compounds.** Every client month generates outcome data. After a year Ozmo can say "our average PCOS client loses X in Y" with real numbers. Nobody else in the local market will have that.

---

## 5. Business model

### Revenue lines, in order of priority

**A. Programme fees (core, 85% of revenue)**
Packaged 1 / 3 / 6-month programmes. See Section 06 for the full ladder. The platform's job is to move people up the ladder and reduce churn at renewal.

**B. Consultation fees**
Entry point. Deliberately priced to be an easy yes, designed to convert to a programme.

**C. Renewal / maintenance tier (the underrated one)**
After a client hits their goal, most dietitians lose them. A low-cost "maintenance" tier — plan refresh + monthly check-in + portal access — turns a 3-month client into a 2-year one. **This is where the platform pays for itself.** Build the renewal prompt into the admin from day one.

**D. Later, optional:** corporate wellness packages, group programmes, recipe/e-book products, licensing Ozmo Health OS to other clinics (this is the real long game — see below).

### The long game

If Ozmo Health OS works for one clinic, it works for fifty. The build is multi-tenant-ready in Section 12 (a `Clinic` table exists from day one even though there's only one row). That decision costs almost nothing now and is worth a great deal later. **Don't skip it.**

---

## 6. The customer journey we're engineering

```
DISCOVER      Google search / Instagram / referral
                        ↓
ENGAGE        Free Health Assessment  ← the hook
                        ↓
QUALIFY       Ozmo Health Snapshot (personalised, instant, non-medical)
                        ↓
CONVERT       Book consultation  → paid
                        ↓
ONBOARD       Account auto-created, portal unlocked
                        ↓
DELIVER       Custom plan appears in the portal, not in WhatsApp
                        ↓
SUSTAIN       Daily logging · streaks · Ozmo Score · chat · reminders
                        ↓
PROVE         Monthly progress report, branded, sent + stored
                        ↓
RENEW         Renewal prompt with their own results as the argument
                        ↓
ADVOCATE      Story request + referral code
```

Every one of those ten steps has a screen, a piece of copy, and an admin trigger specified in this report. **That's the actual deliverable.**

### The two conversion moments that matter most

**Moment 1 — Assessment → Consultation.** The Snapshot must feel like it was written about *them*. Section 09 specifies dynamic copy that references their actual answers. Generic output kills this.

**Moment 2 — Month 3 → Renewal.** The client sees their own weight chart, their own streak, their own Ozmo Score trend. That's the sales pitch, and it writes itself. Section 11 specifies the automatic renewal flag at T-14 days.

---

## 7. The competitive message (for Instagram / ads / sales)

Not: *"Get a personalised diet plan."*
Everyone says it. It converts nothing.

Instead, pick a wedge per audience:

| Audience | The wedge |
|---|---|
| Weight-loss searcher | "You've done the diet before. You've never done the follow-up." |
| Diabetes / thyroid / PCOS | "Nutrition guidance built around your reports and your kitchen — reviewed by a dietitian, not an app." |
| Lapsed dieter | "Your last diet plan is still sitting in your WhatsApp, unopened. Let's try it differently." |
| Fitness client | "Training is 30%. We handle the other 70%." |
| Referral / word-of-mouth | "Your own dashboard, your own dietitian, your own numbers." |

---

## 8. Success metrics (build these into Ozmo Insights)

The metrics that actually tell us if the product works:

| Metric | Why it matters | Target to aim at |
|---|---|---|
| Assessment completion rate | Is the hook working? | >55% of starters finish |
| Assessment → consultation booking | The commercial hinge | >20% |
| Consultation → programme conversion | Aman's close rate | >50% |
| **7-day portal activation** | Did they log anything in week 1? | >80% |
| **30-day retention (still logging)** | The single best churn predictor | >60% |
| Average adherence % | Product working as designed | >70% |
| **Renewal rate at programme end** | The business | >35% |
| Reports delivered on time | Operational discipline | 100% |

If 30-day logging retention is under 40%, the gamification and reminder design has failed and we fix that before adding any new feature.
