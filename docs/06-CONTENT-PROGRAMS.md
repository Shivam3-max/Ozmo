# 06 — Programmes: Full Copy & Pricing Architecture

---

## The programme model

Six programmes. One structure. The structure never changes — only the clinical focus does.

**Every programme includes:**
Initial consultation · Personalised diet plan · Meal alternatives & swaps · Activity guidance · Private Ozmo dashboard · Daily meal & water logging · Weight & measurement tracking · Ozmo Score · Scheduled follow-ups · Plan revisions · Direct messaging with your dietitian · Monthly progress report · Secure report storage

**What varies by programme:**
Clinical focus · consultation depth · follow-up frequency · which markers we track · plan complexity · duration options

> **Design principle:** don't sell tiers of *access* (bronze/silver/gold). Sell duration and focus. A client on the cheapest programme should still get the dietitian's full attention — the difference is how long, not how much.

---

## Pricing architecture

`[CONFIRM — Aman sets every number. Bands below are structural recommendations for a Tier-1/Tier-2 Indian city, based on how the market is priced.]`

### The ladder

| Product | Purpose | Suggested band |
|---|---|---|
| **Health Assessment** | Free lead magnet. Never charge for this | ₹0 |
| **Consultation (one-off)** | Entry point, designed to convert | ₹800 – ₹1,500 |
| **1-month programme** | Trial / gut health / fitness blocks | ₹3,000 – ₹5,000 |
| **3-month programme** | **The core product.** Where results actually happen | ₹9,000 – ₹15,000 |
| **6-month programme** | Best value, best outcomes, best retention | ₹16,000 – ₹26,000 |
| **Maintenance (monthly)** | Post-programme. The retention engine | ₹1,200 – ₹2,500/mo |

### Three pricing rules

1. **Make 3 months the obvious default.** Show 1-month priced so it looks poor value, 3-month as "Most chosen," 6-month with a real discount. Classic anchoring — and here it's also clinically honest, because 1 month genuinely doesn't produce lasting change.
2. **Consultation fee is credited toward a programme if they upgrade within 7 days.** Removes all risk from the first step, and the deadline drives the close.
3. **Never discount the programme. Extend the duration instead.** Discounting trains clients to wait for offers and devalues the dietitian's time. "Two extra weeks free" costs less and reads as more.

### Display rules
- Show prices inclusive of GST, with "incl. GST" stated
- Show 3-month monthly-equivalent alongside the total (`₹12,000 · that's ₹4,000/month`)
- EMI availability if Razorpay supports it `[CONFIRM]`
- Never show a struck-through fake "original price"

---

# `/programs` — Programmes Hub

**Meta title:** `Nutrition Programmes — Ozmo Diet Clinic`
**Meta description:** `Personalised nutrition programmes for weight, metabolic health, PCOS and thyroid, fitness, gut health and everyday wellness. Consultation, plan, tracking and follow-ups included.`

## Hero
**Eyebrow:** `PROGRAMMES`
**H1:** Programmes built around real goals
**Sub:** Every programme includes a full consultation, a plan built for your kitchen, your own dashboard, and scheduled follow-ups. What changes is the focus.
**CTA:** `Not sure which one? Take the free assessment →`

## Section — Choose by goal
Six programme cards. Each: name · one-line purpose · "Best for" line · duration options · price from · three headline inclusions · `Explore →`

## Section — Compare programmes
*Comparison table. Sticky first column on mobile with horizontal scroll inside its own container.*

| | Weight Transformation | Metabolic Health | Hormonal Balance | Fitness & Performance | Gut Health | Healthy Lifestyle |
|---|---|---|---|---|---|---|
| **Best for** | Fat loss that holds | Blood sugar, cholesterol, BP | PCOS, thyroid | Training, muscle, performance | Bloating, acidity, irregularity | Prevention & maintenance |
| **Duration** | 3 / 6 mo | 3 / 6 mo | 3 / 6 mo | 1 / 3 mo | 1 / 3 mo | 1 / 3 / 6 mo |
| **Consultation** | 60 min | 60 min | 60 min | 45 min | 45 min | 45 min |
| **Follow-ups** | Fortnightly | Fortnightly | Fortnightly | Monthly | Fortnightly | Monthly |
| **Plan revisions** | Unlimited | Unlimited | Unlimited | Monthly | Fortnightly | Monthly |
| **Lab review** | If provided | Yes — central | Yes — central | Optional | Optional | If provided |
| **Body measurements** | Full | Weight + waist | Full | Full + composition | Weight | Weight |
| **Activity plan** | Yes | Light | Yes | Detailed | Light | Light |
| **Messaging** | Included | Included | Included | Included | Included | Included |
| **Monthly report** | Yes | Yes | Yes | Yes | Yes | Yes |
| **From** | `[₹]` | `[₹]` | `[₹]` | `[₹]` | `[₹]` | `[₹]` |

## Section — Still deciding?
**H2:** Not sure which programme fits?
That's normal — and it's exactly what the assessment is for. Answer a few questions and we'll point you to the right starting place. If none of them fit, we'll tell you that too.
`Take the Free Health Assessment →` · `Book a consultation and ask`

## FAQ block
*Programme-specific FAQs: what's included, can I switch, can I pause, what if I don't see results, what happens at the end.*

---

# Programme page template

Every programme page uses this structure. Copy for all six follows.

```
1. Hero — name, purpose, duration, price, dual CTA
2. Who this is for — 4–5 bullet profile
3. Who this is NOT for — 2–3 bullets  ← builds enormous trust, costs almost nothing
4. What we focus on — the clinical approach, 4 blocks
5. What's included — full list
6. How the [X] months run — month-by-month timeline
7. What we track — the specific markers
8. A typical day — sample day, clearly labelled as an example
9. Pricing — duration options
10. FAQs — 5 programme-specific
11. Related conditions — internal links
12. CTA
```

---

# `/programs/weight-transformation`

**Meta title:** `Weight Loss Programme — Ozmo Diet Clinic`
**Meta description:** `A 3 or 6-month weight transformation programme: personalised diet plan, activity guidance, daily tracking and fortnightly follow-ups with your dietitian.`

## Hero
**Eyebrow:** `PROGRAMME`
**H1:** Weight Transformation
**Sub:** Sustainable fat loss, built around the food you already eat — and structured to hold after the programme ends.
`3 or 6 months` · `From [₹]` · `Fortnightly follow-ups`

## Who this is for
- You want to lose fat, not just weight on a scale
- You've lost weight before and put it back on
- You want to keep eating rice, roti and normal home food
- You have limited time to cook separately from your family
- You want to understand *why*, not just be handed rules

## Who this is not for
- Anyone looking to lose a large amount of weight in a few weeks. We won't do it and you shouldn't want it
- Anyone who wants a plan without any tracking or follow-up — that's not what this is
- Anyone with an active eating disorder. That needs medically supervised care, and we'll help you find it

## Our approach
**Start from what you eat, not from a template.** Your first plan looks a lot like your current diet, corrected. That's deliberate — the biggest changes come from portion, timing and combination, and those don't require you to eat food you dislike.

**Protect muscle while losing fat.** Rapid crash loss costs muscle, tanks your metabolism and sets up the rebound. We move at a rate your body can sustain and we watch measurements, not just weight.

**Build the habits that survive month four.** The programme is designed so that by the end, you can run your own eating without a plan in front of you. That's the actual goal.

**Adjust as your body adapts.** Weight loss is not linear and plateaus are expected. Fortnightly reviews exist so a plateau gets addressed in week six, not month three.

## How the 3 months run
**Month 1 — Reset**
Full consultation, baseline measurements, first plan. Focus on meal timing, portion control and consistent logging. Most people see early movement here — some of it water weight, and we'll say so.

**Month 2 — Refine**
The plan tightens around what's working. We introduce more variety, address the specific situations that trip you up (travel, weekends, office food), and add or adjust activity.

**Month 3 — Consolidate**
Focus shifts from losing to *keeping*. We test flexibility deliberately — social meals, eating out, festival food — so you learn to handle them without the plan collapsing. You finish with a maintenance framework.

*(6-month version continues: months 4–6 = deeper composition work, habit independence, and a full maintenance handover.)*

## What we track
Weight (weekly) · Waist, hip, chest, arm (fortnightly) · Body fat % `[if available]` · Daily meal adherence · Water intake · Activity/steps · Energy and sleep (self-reported) · Any lab markers you share

## A typical day
> *An example only. Your plan will be built around your routine, your preferences and your health.*

| Time | Meal |
|---|---|
| 7:00 AM | Warm water · soaked almonds |
| 8:30 AM | Vegetable poha *or* 2 besan chilla *or* oats with milk |
| 11:00 AM | Seasonal fruit · buttermilk |
| 1:30 PM | 2 roti · dal · seasonal sabzi · salad · curd |
| 5:00 PM | Roasted chana *or* sprouts *or* tea with 2 marie biscuits |
| 8:00 PM | 1 roti *or* small portion rice · paneer/chicken/dal · sabzi · salad |

## Pricing
3 months `[₹]` · 6 months `[₹]` *(save `[₹]`)* · incl. GST

## FAQs
**How much weight will I lose?** Anyone who answers that before meeting you is guessing. What we'll tell you after your consultation is a realistic range for your body, your health and your starting point — and we'd rather under-promise it.
**Will I have to stop eating rice?** No.
**Do I need a gym?** No. Activity helps, but the programme works with walking. If you already train, we'll build around it.
**What if I stop losing weight?** Plateaus are normal and expected. That's what fortnightly reviews are for.
**What happens after 3 months?** You'll have a maintenance framework. Most people move to a monthly maintenance plan; some don't need to.

## Related
`Weight Loss →` · `Fat Loss & Body Composition →` · `Thyroid →`

---

# `/programs/metabolic-health`

**Meta title:** `Diabetes & Metabolic Health Nutrition Programme — Ozmo Diet Clinic`
**Meta description:** `Nutrition support for blood sugar, cholesterol and blood pressure. Personalised plans built around your reports and medication, with fortnightly dietitian follow-ups.`

## Hero
**H1:** Metabolic Health
**Sub:** Nutrition support for blood sugar, cholesterol and blood pressure — built around your reports, your medication and your kitchen.
`3 or 6 months` · `From [₹]` · `Fortnightly follow-ups`

> **Disclaimer banner, top of page, always visible:**
> Ozmo provides nutrition and lifestyle guidance alongside your medical care. We do not diagnose, treat or cure any condition, and we never advise changing your medication. Please continue to follow your doctor's advice.

## Who this is for
- You've been told your blood sugar, cholesterol or blood pressure needs attention
- You're managing type 2 diabetes or pre-diabetes and want food guidance that fits real life
- You're on medication and want your diet to work with it, not against it
- You've been handed a list of "avoid" foods and no idea what to actually eat

## Who this is not for
- Type 1 diabetes management without your treating doctor's involvement
- Anyone hoping to replace medication with diet. That's a conversation for your doctor, not for us
- Uncontrolled or unstable conditions requiring inpatient or closely supervised medical nutrition therapy

## Our approach
**Work from your reports.** Bring your HbA1c, fasting and post-prandial readings, lipid profile and any recent panels. Your plan is built around what your numbers actually show.

**Fix the pattern, not just the plate.** For blood sugar, *when* and *in what combination* you eat often matters as much as what. Meal spacing, carbohydrate distribution across the day, and pairing carbs with protein and fibre do a great deal of the work.

**Never a list of bans.** Being told "no sugar, no rice, no potato" is why most people quit. We'll build a plan with actual meals in it, structured so the foods you like still have a place.

**Coordinate with your medication.** Timing food around medication matters — and it's something we take seriously and discuss with you.

## How the 3 months run
**Month 1 — Stabilise.** Baseline from your reports. Establish consistent meal timing and balanced carbohydrate distribution. Begin logging.
**Month 2 — Optimise.** Refine based on your readings and how you feel. Address the specific problem points: late dinners, evening cravings, weekend patterns.
**Month 3 — Sustain.** Reassess with fresh reports if your doctor advises them. Build the version of the plan you can run indefinitely.

## What we track
Weight · Waist circumference · Fasting & post-prandial readings *(as recorded by you or your doctor)* · HbA1c at review points · Lipid profile at review points · BP if relevant · Meal adherence · Meal timing consistency · Activity

## A typical day
> *An example only. Yours will differ based on your reports, medication and preferences.*

| Time | Meal |
|---|---|
| 7:00 AM | Warm water · 5 soaked almonds |
| 8:30 AM | Vegetable oats *or* moong dal chilla · curd |
| 11:00 AM | Guava or apple *or* buttermilk |
| 1:30 PM | 2 multigrain roti · dal · green sabzi · large salad · curd |
| 5:00 PM | Roasted chana *or* sprouts chaat · green tea |
| 8:00 PM | 1–2 roti · paneer/chicken/dal · sabzi · salad |
| Notes | Dinner by 8:30 PM. 10-minute walk after lunch and dinner |

## FAQs
**Can diet reverse diabetes?** We won't make that claim. Nutrition and lifestyle changes can meaningfully support how your condition is managed, and your numbers may improve — but any change to medication or any conclusion about your condition is your doctor's call.
**Do I have to give up sugar completely?** Your plan will manage added sugar carefully, but it's built around real, sustainable eating rather than a total ban.
**Will you talk to my doctor?** We'll happily provide your dietitian's summary for you to share with them.
**Do I need to test my sugar daily?** Follow whatever your doctor advises. Whatever readings you have, log them — they make your plan better.
**What about fasting and festivals?** Both are plannable. Tell us in advance and we'll build for them.

## Related
`Diabetes & Blood Sugar →` · `Cholesterol & Heart Health →` · `Weight Loss →`

---

# `/programs/hormonal-balance`

**Meta title:** `PCOS & Thyroid Nutrition Programme — Ozmo Diet Clinic`
**Meta description:** `Focused nutrition support for PCOS, PCOD and thyroid concerns. Personalised plans, symptom and weight tracking, and fortnightly dietitian follow-ups.`

## Hero
**H1:** Hormonal Balance
**Sub:** Focused nutrition for PCOS, PCOD and thyroid concerns — because generic weight-loss advice usually doesn't work here, and that isn't your fault.
`3 or 6 months` · `From [₹]` · `Fortnightly follow-ups`

> Disclaimer banner as above.

## Who this is for
- You've been diagnosed with PCOS/PCOD or a thyroid condition
- You're doing "everything right" and the weight isn't moving
- You're dealing with fatigue, irregular cycles, hair or skin changes, or stubborn weight gain
- You've been told to "just lose weight" without being told how

## Who this is not for
- Fertility treatment nutrition without your treating doctor's involvement — we'll work alongside them, not instead of them
- Anyone seeking a hormonal diagnosis. Diagnosis is your doctor's job; nutrition support is ours

## Our approach
**Take it seriously.** Hormonal conditions genuinely make weight harder to shift. That isn't an excuse and it isn't a life sentence — it means the approach has to be different from a standard weight-loss plan.

**Insulin sensitivity first (PCOS).** For many people with PCOS, how the body handles carbohydrates sits at the centre. Carbohydrate quality, pairing, distribution and meal timing become the levers rather than pure calorie restriction.

**Support, don't sabotage (thyroid).** Nutrient adequacy, meal timing around medication, and consistency matter. We'll be straight with you: no food cures a thyroid condition, and anyone selling you that is selling you something.

**Track symptoms, not just weight.** Energy, cycle regularity, sleep, cravings, skin and hair are part of the picture — sometimes they improve before the scale does, and noticing that keeps people going.

## How the 3 months run
**Month 1 — Understand.** Detailed history, reports, symptom baseline. Plan built for stable energy and balanced carbohydrate intake.
**Month 2 — Adjust.** Refine based on symptom and weight response. Address cravings, energy dips and cycle patterns.
**Month 3 — Establish.** Lock in what's working. Build the long-term version — these are conditions you manage over years, not weeks.

## What we track
Weight · Waist & hip · Cycle regularity *(if applicable and if you want to)* · Energy levels · Sleep quality · Cravings · Skin/hair changes · Thyroid or hormonal panels at review points · Meal adherence

## FAQs
**Can nutrition cure PCOS?** No, and we won't say otherwise. PCOS is managed, not cured. Nutrition and lifestyle are a well-recognised part of managing it, and many people find their symptoms and weight respond.
**Do I have to go gluten-free / dairy-free?** Not by default. If there's a clear reason in your case, we'll discuss it. Blanket eliminations are popular online and rarely necessary.
**I have thyroid — will I ever lose weight?** Yes, generally — often more slowly, and with more attention to consistency. We'll set realistic expectations after seeing your reports.
**Do I need to stop eating soya / cruciferous vegetables?** In normal quantities, for most people, no. This is one of the most over-stated pieces of advice on the internet. We'll go through it in your consultation.
**Will you coordinate with my gynaecologist or endocrinologist?** We'll give you a clear dietitian's summary you can share with them.

## Related
`PCOS / PCOD →` · `Thyroid →` · `Weight Loss →`

---

# `/programs/fitness-nutrition`

**Meta title:** `Sports & Fitness Nutrition Programme — Ozmo Diet Clinic`
**Meta description:** `Nutrition built around your training — muscle gain, fat loss, recovery and performance. Personalised plans with macro targets and monthly follow-ups.`

## Hero
**H1:** Fitness & Performance
**Sub:** You're already doing the hard part. This is the other 70%.
`1 or 3 months` · `From [₹]` · `Monthly follow-ups`

## Who this is for
- You train regularly and your nutrition isn't keeping up
- You want to build muscle, lose fat, or recomposition both
- You're preparing for an event, a sport or a physique goal
- You're tired of conflicting advice from the internet and your gym

## Who this is not for
- Anyone wanting performance-enhancing substances. We don't go there
- Extreme cutting for a stage deadline that isn't compatible with your health

## Our approach
**Real macro targets, in real food.** Protein, carbohydrate and fat targets set to your training load and goal — then translated into meals you'll actually eat, in Indian portions, not in grams of chicken breast.

**Fuel around training.** What you eat before and after a session, and how you distribute protein across the day, does more than most supplements.

**Vegetarian protein, solved properly.** Hitting protein on an Indian vegetarian diet is genuinely difficult and usually done badly. Dal, paneer, curd, soya, sprouts, and where supplementation makes sense — laid out clearly.

**Recovery counts.** Sleep, hydration and rest-day nutrition get the same attention as training-day nutrition.

## What we track
Weight · Body measurements · Body fat % / composition `[if available]` · Protein intake · Training adherence · Strength or performance markers · Energy and recovery

## FAQs
**Do I need supplements?** Maybe, maybe not. We'll tell you honestly, and we don't sell them, so there's no reason for us to over-recommend.
**Can I build muscle as a vegetarian?** Yes. It needs more planning, which is exactly what this programme does.
**Do you write the workout plan too?** We provide activity and workout guidance. If you already have a coach, we build the nutrition around their programme.
**Bulking and cutting?** We'll structure whichever phase suits your goal, at a rate that doesn't wreck your health.
**How fast can I gain muscle?** Slower than the internet claims. We'll set a realistic target after your consultation.

## Related
`Sports Nutrition →` · `Muscle Gain →` · `Weight Gain →`

---

# `/programs/gut-health`

**Meta title:** `Gut & Digestive Health Nutrition Programme — Ozmo Diet Clinic`
**Meta description:** `Nutrition support for bloating, acidity, constipation and irregular digestion. Structured elimination and reintroduction guided by a dietitian.`

## Hero
**H1:** Gut & Digestive Health
**Sub:** Bloating, acidity, irregularity — usually fixable, rarely by guesswork.
`1 or 3 months` · `From [₹]` · `Fortnightly follow-ups`

## Who this is for
- Persistent bloating, gas, acidity or heartburn
- Constipation or irregular bowel movements
- You feel uncomfortable after most meals and can't work out why
- You have IBS-type symptoms and want structured food guidance

## Who this is not for
- Undiagnosed digestive symptoms that need medical investigation first — blood in stool, unexplained weight loss, persistent vomiting, severe pain. See a doctor. We'll say so plainly if you describe these
- Diagnosed IBD, coeliac disease or similar without your gastroenterologist's involvement

## Our approach
**Find the pattern.** We start with a detailed food and symptom log. Most digestive complaints have a pattern; it's just invisible until it's written down. The dashboard makes this easy.
**Structured, temporary elimination — only if needed.** If we do remove something, it's specific, time-limited, and reintroduced systematically. Permanent random elimination is how people end up eating twelve foods and still bloated.
**Fibre, fluid, and timing.** The unglamorous fundamentals fix a surprising number of cases before anything else is needed.
**Rebuild variety.** The goal is the widest range of foods you can comfortably eat — not the narrowest.

## What we track
Symptom frequency & severity · Meal-symptom correlation · Bowel regularity · Fibre intake · Water intake · Meal timing · Weight

## FAQs
**Do I need a food intolerance test?** Most commercially marketed intolerance tests are not reliable. A structured elimination and reintroduction done properly tells you far more.
**How long until I feel better?** Some people notice a difference within a fortnight; others take longer. We'll be honest about what we're seeing.
**Will I have to give up dairy/wheat forever?** Almost certainly not. Even when something is a trigger, tolerance often depends on quantity and context.
**Is this for IBS?** We provide nutrition support for IBS-type symptoms alongside your doctor's care. We don't diagnose IBS.

## Related
`Digestive Health →` · `Weight Loss →` · `Healthy Lifestyle →`

---

# `/programs/lifestyle-wellness`

**Meta title:** `Healthy Lifestyle Nutrition Programme — Ozmo Diet Clinic`
**Meta description:** `For prevention, maintenance and everyday wellbeing. A simple personalised plan, light tracking and monthly dietitian check-ins.`

## Hero
**H1:** Healthy Lifestyle
**Sub:** For people who aren't fixing a problem — they're avoiding one.
`1, 3 or 6 months` · `From [₹]` · `Monthly follow-ups`

## Who this is for
- Nothing is wrong, and you'd like to keep it that way
- You've finished a programme and want to hold onto the result *(this is the maintenance tier)*
- Family history of diabetes, heart disease or hypertension and you want to get ahead of it
- You eat reasonably well but have no structure, and you feel it

## Who this is not for
- Anyone with an active condition that needs focused clinical nutrition — one of the other programmes will serve you better, and we'll say so

## Our approach
**Simplify, don't restrict.** For prevention, a simple structure you'll follow for years beats an optimised plan you'll follow for six weeks.
**Cover the gaps.** Most "healthy" diets have two or three specific gaps — protein, fibre, micronutrients, or meal timing. We find yours.
**Build the defaults.** Once your default breakfast, default lunch and default late-evening snack are right, the rest mostly takes care of itself.
**Light-touch accountability.** Monthly check-ins and simple tracking. Enough to keep it real, not enough to feel like homework.

## What we track
Weight (monthly) · Waist · Meal adherence · Water · Activity · Annual health markers if you share them

## The maintenance use-case
> **Just finished a programme?**
> This is where most people go next. A lighter, cheaper monthly plan with a quarterly plan refresh and a monthly check-in — enough structure to keep what you built, without the full programme intensity.
> `[₹]/month · cancel any time`

## FAQs
**Is this worth it if I'm already healthy?** If you have structure and it's working, probably not — and we'd tell you that. It's most useful if you've got family risk factors, no structure, or you're maintaining after a programme.
**Can I upgrade later?** Yes, any time, and we'll credit what you've paid for the current month.
**How light is "light"?** One consultation, a plan, monthly check-ins and a plan refresh. Logging is optional but recommended.

## Related
`General Wellness →` · `Weight Loss →` · `Diabetes →`
