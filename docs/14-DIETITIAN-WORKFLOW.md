# 14 — How She Actually Works
## Extracted from four real plans and the live intake form

**Sources:** `3 days plan.pdf` · `veg period diet plan.pdf` · `thyroid and fatty liver plan.pdf` · `surinder ji 15 days planner from 20 aug.pdf` · the OZMO Slimming Studio Body Assessment Form (59 questions)

This supersedes my assumptions in §11. The plan builder specified there was built around calorie and macro targets with six fixed meal slots. **That is not how she works.** This document records what the real plans show, and what the software has to become as a result.

---

## 1. The five findings that change the build

### 1.1 There are no calories and no macros. Anywhere.
Across four complete plans there is not a single kcal figure, protein target or macro split. She works in **household quantities with clinical precision** — `1 katori`, `40gm jowar+wheat mix`, `5 peeled almonds`, `2 small spoon`, `½ avocado`, `200gm curd`, `120gm chicken breast`.

**Implication:** macros become an optional, advisory panel the dietitian can switch on. They are not the spine of the builder and they must never be required to publish a plan. A builder that demands a calorie target before it lets her save would be abandoned on day one.

### 1.2 Slots are invented per client, not chosen from a list
Actual slot labels found:

> `Wakeup` · `Meal 1 at home` · `Office snack by 10/11 am` · `Breakfast at 10 am` · `10 mins before lunch` · `12pm/1 pm` · `Lunch` · `After 1 hr` · `2 pm` · `4pm` · `Before 30 mins of workout` · `During and post workout` · `Post yoga` · `Evening` · `Dinner` · `30 mins after dinner` · `Before bed` · `Sunday brunch 12pm` · `Sunday 4 pm`

Three different timing idioms are in use at once: **clock** (`4pm`), **relative to an event** (`30 mins after dinner`), and **contextual** (`Office snack`, `Post yoga`).

**Implication:** slot labels are free text with an optional time hint. The `MealSlot` enum in the current schema cannot hold this and has to go.

### 1.3 A plan is not only food
Items found that are not meals:

| Type | Examples from her plans |
|---|---|
| **Pranayama / breathing** | Anulom vilom 11 times · Anulom vilom 20 min with 20 min pran mudra · bharamri 2 times · 5 times bharamri · deep breathing and long exhale ×10 |
| **Asana / posture** | Vajrasana · Surya Namaskar · Bhujangasana · Ardha Matsyendrasana · Pawanmuktasana |
| **Movement** | Walk 30 mins · barefoot walk on ground · walk 20 mins after meals · strength training 4×/week |
| **Prescribed exercise** | 3 sets of 12 reps: calf raises, push-ups, wall chair, bench dips, kettlebell swings, stretching |
| **Ritual / manner of eating** | Drink warm water **in deep squat position** · chew ½ inch raw ginger slice · close your eyes and feel your body parts and observe breathing |
| **Supplements** | Omega 3 · curcumin · ashwagandha · triphala · magnesium glycinate · liver detox · thyronorm · protein scoop · electrolytes · Vitamin D shot · isabgol · churan |
| **Household prep** | `Multigrain: ragi 100gm + jowar 100gm + 1kg khapli wheat` — a flour blend the family makes once |
| **Sourcing** | "get from healthy earth" — a named vendor |

**Implication:** every plan row needs a **type**. Food, supplement, exercise, breathwork, lifestyle, hydration, prep, note. The PDF renders them differently and the client portal will tick them off differently.

### 1.4 Alternatives are formal, and she labels them
Two patterns, both explicit:

- **Inline** — `Besan chilla / Moong dal dosa`, `1 guava/1pear`, `broccoli + carrot / mushroom + beans`
- **Numbered option groups** — literally headed `any 1 from given option` followed by 1–4 complete meals

The thyroid plan's office snack has four full alternatives; the lunch has four. This is the single most-used device in her plans and it is what makes them survivable in a real kitchen.

**Implication:** the builder needs first-class **option groups** — a labelled set where the client picks one — not just a hidden "alternatives" drawer.

### 1.5 Three different day structures
| Plan | Structure |
|---|---|
| Period plan | **One day**, repeated for the phase |
| 3-day plan | **Columns** — Mon / Tues / Wednes — with some rows (`Wakeup`, `10 mins before lunch`, `Evening`, `Before bed`) shared across all three |
| Thyroid & fatty liver | **One day** with **conditional overrides**: `Sunday brunch`, `Sunday 4 pm`, `On leg day` |
| Surinder ji | **Numbered sequence** — `Day 1` of a 15-day planner, dated from 20 Aug |

**Implication:** the plan needs a `dayMode` — `SINGLE`, `WEEK` or `SEQUENCE` — plus rows that can be marked *applies to every day*, plus per-day conditional overrides.

---

## 2. The anatomy of one of her plans

```
TITLE          15 Days Vegetarian Diabetes & Fatty Liver Plan
               (duration + diet preference + conditions, in that order)

DAY BLOCK      Day 1   |   Monday   |   (or a single unlabelled day)

  SLOT         Wakeup                              ← free text
  SLOT         Breakfast at 10 am                  ← free text + clock

    ITEM       1 glass overnight soaked methre paani      [food]
    ITEM       Curcumin capsule with water                [supplement]
    ITEM       Breathing exercise                         [breathwork]
    ITEM       Exercise: 3 sets of 12 reps — calf raises… [exercise]

    OPTION GROUP  "any 1 from given option"
      1        Grated gheeya + missi roti ×2 with 150gm curd (whisked, jeera, pudhina, dry ginger)
      2        Kala chana chaat + sourdough sandwich with 40gm tofu
      3        ½ avocado spread on sourdough + 40gm fat-free paneer
      4        30gm soya chura stuffed roti with 2 small spoon homemade butter

  OVERRIDE     Sunday brunch 12pm: chitte chole with wheat kulcha
  OVERRIDE     On leg day: multigrain roti wrap with 100gm chicken keema

GUIDELINES     Walk 20 mins after meals · strength training 4×/week ·
               sleep before 10:30 pm · avoid sugar, fried, bakery, >3 tsp oil/day ·
               beneficial asanas: Surya Namaskar, Bhujangasana…

NOTES          1. Always add pinch dry ginger, jeera, kali mirch
               2. Always make rice-urad idli/dosa at home, or use Tata mix
```

**Every plan ends with a Guidelines block, a Notes block, or both.** They carry the rules that apply across the whole plan, and they are where her voice is most present.

---

## 3. Vocabulary she uses (the builder must speak it)

**Units:** katori · glass · cup · bowl · tsp · small spoon · tbsp · gm · ml · piece · slice · handful · scoop · cap/capsule · inch · litre · packet · sets × reps

**Preparation verbs:** overnight soaked · soaked and peeled · soaked and steamed · whisked · fermented · sprouted · blanched · sautéed · dry sautéed · roasted · stuffed · grated · deseeded · boiled

**Standing prep items:** dhaniya-pudhina chutney · saunth-imli chutney · homemade butter · homemade paneer · multigrain atta blend · missi roti · lemonade

**Her recurring supplements:** omega 3 · curcumin · triphala · ashwagandha · magnesium glycinate · isabgol · churan · liver detox · electrolytes · monk fruit (as sweetener) · Vitamin D (as a tapering shot protocol)

> These belong in the seed data as **her** library, not as generic food-database rows. A template list of her own chutneys, blends and supplement protocols is worth more to her than 500 generic foods.

---

## 4. The intake form — 59 questions, and what we're missing

Her live form (**"OZMO Slimming Studio Body Assessment Form"**) collects far more than our 31-question assessment. What we currently do **not** ask and should:

| Area | Missing questions |
|---|---|
| **Menstrual health** | Cycle length · flow (light/moderate/heavy) · pain and cramps · mood swings — *she writes cycle-specific plans, so this is load-bearing* |
| **Digestive detail** | Bloating · gastric · constipation, each asked separately |
| **Vitals** | Resting heart rate · BP systolic · BP diastolic |
| **Mental health** | Stress level and its main source · energy through the day · emotional eating and when · anxiety/depression history · strength of support system |
| **Physical limits** | Injuries · pain and stiffness areas (neck/shoulder/back/knees) · flexibility level — *needed because she prescribes exercise* |
| **Lifestyle detail** | Wake-up time · bedtime · meal timings · screen time · caffeine type · alcohol frequency · smoking · other addictions |
| **Routine** | Typical day written out in four blocks — morning, afternoon, evening, night |
| **Profession** | Sedentary / Active / Travelling / Fieldwork — *distinct from exercise activity level* |
| **Staff fields** | Enquiry remarks · Coach/Dietitian remarks |

**Implication:** the public assessment stays short — it is a lead magnet and 59 questions would kill completion. Her deep intake becomes a **separate, longer client-onboarding form** inside the portal, sent after conversion. The public assessment feeds it, so nothing is asked twice.

---

## 5. What changes in the build

| Area | Was specified | Becomes |
|---|---|---|
| Meal slots | `MealSlot` enum, 6 fixed | Free-text label + optional time hint + order |
| Plan items | Food row with macros | Typed row: food / supplement / exercise / breathwork / lifestyle / hydration / prep / note |
| Alternatives | Hidden drawer | First-class labelled option groups |
| Day structure | 7 fixed days | `SINGLE` · `WEEK` · `SEQUENCE(n)` + all-days rows + conditional overrides |
| Targets | Required calories and macros | Optional advisory panel, off by default |
| Food database | 500+ generic items | Her own library: preps, chutneys, blends, supplement protocols, plus foods |
| Plan output | Generic PDF | A PDF that looks like the documents she already sends |
| Intake | One 31-question assessment | Short public assessment → deep 59-field client onboarding |

---

## 6. Two things to confirm with her

1. **The brand name.** The intake form says **"OZMO Slimming Studio"**; the website says **"Ozmo Diet Clinic"**. Which is the public-facing name, or are they two arms of the same practice? This affects the logo lockup, the site title and every legal page.

2. **Who she is.** The plans are unsigned. The site currently has a placeholder profile and no credentials. Nothing publishes until her name, qualifications and registration are confirmed in writing — and there is still an unresolved mismatch between the name I was originally given and what public sources return.

---

## 7. Compliance note, unchanged and now more relevant

Her plans include supplement protocols (Vitamin D tapering, thyronorm, magnesium glycinate) and prescribed exercise. That is a step beyond food guidance.

The software must therefore:
- Record **who** added each supplement row and when — the audit log already does this
- Keep the medical disclaimer attached to every generated plan PDF
- Never let the AI layer (Phase 5) add, change or schedule a supplement row
- Flag any plan for a client with a `requiresMedicalCaution` condition before it can be published

None of this restricts what she can write. It records it properly.
