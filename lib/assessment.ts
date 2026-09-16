export type QType = "text" | "number" | "single" | "multi" | "textarea" | "height" | "weight" | "mealday";

export type Question = {
  id: string;
  step: number;
  type: QType;
  label: string;
  helper?: string;
  placeholder?: string;
  options?: string[];
  optional?: boolean;
  exclusive?: string;          // multi-select option that clears the rest
  showIf?: (a: Answers) => boolean;
  min?: number;
  max?: number;
};

export type Answers = Record<string, string | string[] | Record<string, string>>;

export const steps = [
  { n: 1, title: "The basics", intro: "First, the essentials." },
  { n: 2, title: "Your goal", intro: "Now, what you're here for." },
  { n: 3, title: "Health background", intro: "This helps us understand your body. Tick whatever applies — and it's fine if nothing does." },
  { n: 4, title: "Your lifestyle", intro: "How your days actually run. Be honest — this is the part that decides whether a plan survives." },
  { n: 5, title: "How you eat now", intro: "No judgement here — we need the real picture, not the ideal one." },
  { n: 6, title: "Medical information", intro: "Only what's relevant to your food. You can skip anything you'd rather discuss in person." },
  { n: 7, title: "The real question", intro: "Last one. This is the one that matters most." },
];

export const goalOptions = [
  "Lose weight",
  "Manage a health condition",
  "Gain weight",
  "Build fitness or muscle",
  "Improve digestion",
  "Feel better overall",
  "Not sure yet",
];

export const conditionOptions = [
  "Diabetes or high blood sugar",
  "Pre-diabetes",
  "PCOS / PCOD",
  "Thyroid (hypo or hyper)",
  "High cholesterol",
  "High blood pressure",
  "Fatty liver",
  "Digestive issues (bloating, acidity, IBS)",
  "Anaemia or low iron",
  "Vitamin D or B12 deficiency",
  "Joint pain or arthritis",
  "Heart condition",
  "Kidney condition",
  "Currently pregnant",
  "Recently gave birth",
  "None of these",
];

/** Conditions that require the medical-caution branch on the Snapshot. */
export const cautionConditions = ["Heart condition", "Kidney condition", "Currently pregnant"];

export const questions: Question[] = [
  // STEP 1
  { id: "name", step: 1, type: "text", label: "What should we call you?", placeholder: "First name" },
  { id: "age", step: 1, type: "number", label: "How old are you?", min: 13, max: 100, placeholder: "Age in years" },
  { id: "gender", step: 1, type: "single", label: "Gender", options: ["Female", "Male", "Other", "Prefer not to say"] },
  { id: "height", step: 1, type: "height", label: "Your height" },
  { id: "weight", step: 1, type: "weight", label: "Your current weight", helper: "Roughly is fine — we'll measure properly at your consultation." },

  // STEP 2
  { id: "goal", step: 2, type: "single", label: "What would you like to work on first?", options: goalOptions },
  {
    id: "targetWeight",
    step: 2,
    type: "number",
    label: "Do you have a target weight in mind?",
    helper: "No pressure — it's fine not to have a number.",
    placeholder: "Target in kg",
    optional: true,
    showIf: (a) => a.goal === "Lose weight" || a.goal === "Gain weight",
  },
  {
    id: "whyNow",
    step: 2,
    type: "single",
    label: "Why now?",
    options: [
      "A health scare or report",
      "An upcoming event",
      "I've been meaning to for a while",
      "A doctor advised me",
      "I want to get ahead of a family history",
      "Something else",
    ],
  },

  // STEP 3
  { id: "conditions", step: 3, type: "multi", label: "Do any of these apply to you?", options: conditionOptions, exclusive: "None of these" },
  {
    id: "bloodTests",
    step: 3,
    type: "single",
    label: "Have you had any blood tests in the last six months?",
    options: ["Yes, and I have the reports", "Yes, but I don't have them handy", "No", "Not sure"],
  },
  {
    id: "symptoms",
    step: 3,
    type: "multi",
    label: "Which of these do you experience regularly?",
    options: [
      "Low energy or fatigue",
      "Trouble sleeping",
      "Frequent hunger or cravings",
      "Bloating after meals",
      "Acidity or heartburn",
      "Constipation",
      "Hair fall",
      "Mood swings or low mood",
      "Joint or body pain",
      "Frequent headaches",
      "Irregular periods",
      "None of these",
    ],
    exclusive: "None of these",
  },
  {
    id: "familyHistory",
    step: 3,
    type: "multi",
    label: "Has anyone in your immediate family had any of these?",
    options: ["Diabetes", "Heart disease", "High blood pressure", "Obesity", "Thyroid", "Cancer", "None that I know of", "Prefer not to say"],
    exclusive: "None that I know of",
  },

  // STEP 4
  {
    id: "activity",
    step: 4,
    type: "single",
    label: "How active are you day to day?",
    options: [
      "Mostly sitting — desk job, little walking",
      "Lightly active — some walking, occasional exercise",
      "Moderately active — regular walking or exercise 3–4 days a week",
      "Very active — exercise 5+ days a week, or a physical job",
      "Athlete-level — training most days",
    ],
  },
  {
    id: "exercise",
    step: 4,
    type: "multi",
    label: "Do you exercise? What kind?",
    options: ["Walking", "Gym / weights", "Running", "Yoga", "Cycling", "Sports", "Home workouts", "Not currently"],
    exclusive: "Not currently",
  },
  { id: "sleepHours", step: 4, type: "single", label: "How many hours do you usually sleep?", options: ["Less than 5", "5–6", "6–7", "7–8", "More than 8"] },
  {
    id: "sleepQuality",
    step: 4,
    type: "single",
    label: "How would you describe your sleep quality?",
    options: ["I sleep well", "I sleep okay", "I wake up often", "I struggle to fall asleep", "It's genuinely bad"],
  },
  { id: "water", step: 4, type: "single", label: "How much water do you drink in a day?", options: ["Less than 1 litre", "1–2 litres", "2–3 litres", "More than 3 litres", "I have no idea"] },
  {
    id: "workHours",
    step: 4,
    type: "single",
    label: "What are your work hours like?",
    options: ["Regular day shift", "Long or unpredictable hours", "Night shift", "Rotating shifts", "I work from home", "I don't work outside the home", "Student"],
  },
  { id: "stress", step: 4, type: "single", label: "How's your stress level been lately?", options: ["Low", "Manageable", "High", "Very high"] },

  // STEP 5
  { id: "foodPreference", step: 5, type: "single", label: "What's your food preference?", options: ["Vegetarian", "Vegetarian + eggs", "Non-vegetarian", "Vegan", "Jain", "Something else"] },
  { id: "allergies", step: 5, type: "textarea", label: "Any allergies or foods you can't eat?", placeholder: "Nuts, lactose, gluten, anything you avoid", optional: true },
  { id: "whoCooks", step: 5, type: "single", label: "Who cooks at home?", options: ["I do", "A family member", "A cook or help", "Mostly ordered or eaten out", "A mix"] },
  { id: "eatsOut", step: 5, type: "single", label: "How often do you eat out or order in?", options: ["Rarely", "Once a week", "2–3 times a week", "4–6 times a week", "Almost daily"] },
  {
    id: "typicalDay",
    step: 5,
    type: "mealday",
    label: "Walk us through a normal day of eating.",
    helper: "Roughly what and roughly when. “Skip” is a valid answer.",
    optional: true,
  },
  {
    id: "habits",
    step: 5,
    type: "multi",
    label: "Which of these sound like you?",
    options: [
      "I skip breakfast",
      "I eat dinner very late",
      "I snack a lot in the evening",
      "I drink 3+ teas or coffees a day",
      "I eat quickly",
      "I eat when I'm stressed",
      "I have a sweet craving after meals",
      "Weekends are completely different from weekdays",
      "I drink alcohol regularly",
      "None of these",
    ],
    exclusive: "None of these",
  },

  // STEP 6
  { id: "medication", step: 6, type: "single", label: "Are you taking any medication?", options: ["Yes", "No", "I'd rather discuss this in person"] },
  {
    id: "medicationDetail",
    step: 6,
    type: "textarea",
    label: "What do you take?",
    helper: "Names are helpful but not essential.",
    optional: true,
    showIf: (a) => a.medication === "Yes",
  },
  { id: "supplements", step: 6, type: "textarea", label: "Any supplements or vitamins?", placeholder: "Leave blank if none", optional: true },
  { id: "surgery", step: 6, type: "single", label: "Any surgery or major illness in the last two years?", options: ["No", "Yes", "Prefer not to say"] },
  {
    id: "dietHistory",
    step: 6,
    type: "single",
    label: "Have you followed a diet plan before?",
    options: ["Yes, with a dietitian", "Yes, from the internet or an app", "Yes, from a gym trainer", "No, this is my first", "Several times"],
  },
  {
    id: "dietOutcome",
    step: 6,
    type: "single",
    label: "What happened?",
    options: [
      "It worked and I kept it",
      "It worked but I put it back on",
      "I couldn't stick to it",
      "It was too restrictive",
      "I got bored",
      "Life got in the way",
      "I didn't see results",
    ],
    showIf: (a) => typeof a.dietHistory === "string" && a.dietHistory.startsWith("Yes") || a.dietHistory === "Several times",
  },

  // STEP 7
  {
    id: "blocker",
    step: 7,
    type: "textarea",
    label: "What do you think is actually getting in your way?",
    helper: "Be honest — nobody's marking this. The more real your answer, the more useful your plan will be.",
    optional: true,
  },
  {
    id: "readiness",
    step: 7,
    type: "single",
    label: "How ready are you to start?",
    options: ["Just exploring for now", "Thinking about it", "Fairly serious", "Ready to start", "I need to start immediately"],
  },
];

export const mealSlots = [
  { id: "earlyMorning", label: "Early morning (anything before breakfast)" },
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "snack", label: "Evening snack" },
  { id: "dinner", label: "Dinner" },
];

/** Sensible bounds for measurements; anything outside is a typo, not a person. */
const NUMBER_RANGES: Record<string, [number, number]> = {
  height: [90, 250],
  weight: [20, 350],
  targetWeight: [20, 350],
};

export const TEXT_MAX = 120;
export const TEXTAREA_MAX = 2000;
export const MEAL_MAX = 500;

/**
 * Why an answer can't be accepted, or null if it can. Shared by the form (to
 * stop at the question) and the API (which never trusts the form).
 */
export function answerProblem(q: Question, value: unknown): string | null {
  if (value === "" || value === null || value === undefined) return null;
  switch (q.type) {
    case "text":
      return typeof value === "string" && value.trim().length <= TEXT_MAX ? null : `Please keep this under ${TEXT_MAX} characters.`;
    case "textarea":
      return typeof value === "string" && value.length <= TEXTAREA_MAX ? null : `Please keep this under ${TEXTAREA_MAX} characters.`;
    case "number":
    case "height":
    case "weight": {
      const n =
        typeof value === "number" ? value
        : typeof value === "string" && /^\d{1,3}(\.\d{1,2})?$/.test(value.trim()) ? Number(value)
        : NaN;
      const [min, max] = NUMBER_RANGES[q.id] ?? [q.min ?? 0, q.max ?? 1000];
      return Number.isFinite(n) && n >= min && n <= max ? null : `Enter a number between ${min} and ${max}.`;
    }
    case "single":
      return typeof value === "string" && (q.options ?? []).includes(value) ? null : "Choose one of the options.";
    case "multi":
      return Array.isArray(value) && value.every((v) => typeof v === "string" && (q.options ?? []).includes(v))
        ? null
        : "Choose from the options.";
    case "mealday":
      return typeof value === "object" && !Array.isArray(value) &&
        Object.entries(value as Record<string, unknown>).every(
          ([k, v]) => mealSlots.some((m) => m.id === k) && typeof v === "string" && v.length <= MEAL_MAX
        )
        ? null
        : `Keep each meal under ${MEAL_MAX} characters.`;
  }
}

/* ---------------- Snapshot engine ---------------- */

export type SnapshotCard = { heading: string; body: string };

const has = (a: Answers, key: string, value: string) => {
  const v = a[key];
  return Array.isArray(v) ? v.includes(value) : v === value;
};

export function computeBmi(a: Answers) {
  const h = Number(a.height);
  const w = Number(a.weight);
  if (!h || !w) return null;
  const m = h / 100;
  return Math.round((w / (m * m)) * 10) / 10;
}

/** Asian-Indian cut-offs — more accurate for this population than the WHO defaults. */
export function bmiBand(bmi: number) {
  if (bmi < 18.5) return "Below the healthy range";
  if (bmi < 23) return "In the healthy range";
  if (bmi < 25) return "Slightly above the healthy range for Indian adults";
  if (bmi < 30) return "Above the healthy range";
  return "Well above the healthy range";
}

export function requiresMedicalCaution(a: Answers) {
  const conds = Array.isArray(a.conditions) ? a.conditions : [];
  return conds.some((c) => cautionConditions.includes(c));
}

export function buildCards(a: Answers): SnapshotCard[] {
  const cards: SnapshotCard[] = [];

  // 1 — conditions first
  if (has(a, "conditions", "PCOS / PCOD")) {
    cards.push({
      heading: "PCOS changes the approach",
      body: "Standard weight-loss advice often underperforms with PCOS because insulin sensitivity sits at the centre of the picture. The approach needs to be built differently — which is good news, because it means it isn't a discipline problem.",
    });
  }
  if (has(a, "conditions", "Thyroid (hypo or hyper)")) {
    cards.push({
      heading: "Your thyroid is part of the picture",
      body: "A thyroid condition typically means weight change is slower, and that meal timing around your medication matters. Both are manageable once accounted for.",
    });
  }
  if (
    has(a, "conditions", "Diabetes or high blood sugar") ||
    has(a, "conditions", "Pre-diabetes")
  ) {
    cards.push({
      heading: "Your blood sugar deserves the lead",
      body: "With blood sugar in the picture, carbohydrate quality, pairing and meal timing become the main levers — usually more than restriction.",
    });
  }

  // 2 — previous diet insight
  if (a.dietOutcome === "It worked but I put it back on") {
    cards.push({
      heading: "You already know how to lose it",
      body: "You've done this before — the loss isn't the problem, the maintenance is. That's a different problem with a different solution, and it's the one we're built for.",
    });
  } else if (a.dietOutcome === "I couldn't stick to it" || a.dietOutcome === "It was too restrictive") {
    cards.push({
      heading: "The plan was probably wrong, not you",
      body: "A plan you can't sustain is a design failure. The fix is usually a plan that looks a lot more like what you already eat.",
    });
  }

  // 3 — sleep & stress
  if (a.sleepHours === "Less than 5" || a.sleepHours === "5–6" || a.sleepQuality === "It's genuinely bad") {
    cards.push({
      heading: "Sleep is working against you",
      body: "You're getting under six hours, or sleeping badly. Short sleep is strongly linked to increased hunger and stronger cravings the next day — which makes eating well much harder than it needs to be. This is often one of the fastest things to improve.",
    });
  }
  if (a.stress === "High" || a.stress === "Very high") {
    cards.push({
      heading: "Stress is part of this",
      body: "High stress reliably changes what and when people eat. Ignoring it makes the nutrition work harder than it should — so we'd factor it in rather than pretend it isn't there.",
    });
  }

  // 4 — lifestyle
  if (has(a, "habits", "I skip breakfast") && has(a, "habits", "I snack a lot in the evening")) {
    cards.push({
      heading: "Your day is back-loaded",
      body: "Skipping breakfast and snacking heavily in the evening usually go together — the second one is caused by the first. Rebalancing across the day is often the single highest-impact change.",
    });
  }
  if (has(a, "habits", "I eat dinner very late")) {
    cards.push({
      heading: "Dinner is landing late",
      body: "Late, heavy dinners affect sleep quality and, for some people, blood sugar. Moving dinner earlier is a small change with a disproportionate effect.",
    });
  }
  if (a.water === "Less than 1 litre") {
    cards.push({
      heading: "You're drinking less water than your body needs",
      body: "Under a litre a day is low. Thirst is frequently mistaken for hunger, and low fluid intake also contributes to fatigue and constipation.",
    });
  }
  if (a.activity === "Mostly sitting — desk job, little walking") {
    cards.push({
      heading: "Movement is your easiest win",
      body: "A mostly seated day is common and completely workable. A ten-minute walk after lunch and dinner is one of the highest-return habits available.",
    });
  }
  if (a.eatsOut === "4–6 times a week" || a.eatsOut === "Almost daily") {
    cards.push({
      heading: "Eating out needs planning, not banning",
      body: "Four or more meals out a week is entirely normal now. It needs to be built into the plan rather than treated as cheating.",
    });
  }
  if (has(a, "familyHistory", "Diabetes") || has(a, "familyHistory", "Heart disease")) {
    cards.push({
      heading: "Family history is a reason to act early",
      body: "Family history raises risk; it doesn't decide the outcome. Nutrition and lifestyle are where the leverage is, and earlier is much easier than later.",
    });
  }

  return cards.slice(0, 5);
}

export function buildFocus(a: Answers): string[] {
  const focus: string[] = [];
  if (has(a, "habits", "I skip breakfast")) {
    focus.push("**Rebalance your day.** Get a real breakfast in, and the evening snacking usually takes care of itself.");
  }
  if (a.sleepHours === "Less than 5" || a.sleepHours === "5–6") {
    focus.push("**Fix the sleep.** Six hours isn't enough to support what you're trying to do. We'd start here.");
  }
  if (a.water === "Less than 1 litre" || a.water === "1–2 litres") {
    focus.push("**Get your water up.** It's the easiest change on this list and it affects hunger, energy and digestion.");
  }
  if (a.activity === "Mostly sitting — desk job, little walking" || a.activity === "Lightly active — some walking, occasional exercise") {
    focus.push("**Add movement you'll actually do.** Not the gym — a ten-minute walk after lunch and dinner.");
  }
  if (has(a, "habits", "I eat dinner very late")) {
    focus.push("**Move dinner earlier.** Even 45 minutes makes a difference to sleep and to how you wake up.");
  }
  if (focus.length < 3) {
    focus.push("**Build a consistent meal structure.** Regular timing does more for appetite control than any single food change.");
  }
  if (focus.length < 3) {
    focus.push("**Get protein into every meal.** It's the most common gap we see, and it fixes a lot of cravings.");
  }
  return focus.slice(0, 3);
}

export function recommendProgram(a: Answers): { slug: string; name: string } {
  const c = Array.isArray(a.conditions) ? a.conditions : [];
  const metabolic = ["Diabetes or high blood sugar", "Pre-diabetes", "High cholesterol", "High blood pressure", "Fatty liver"];
  const hormonal = ["PCOS / PCOD", "Thyroid (hypo or hyper)"];

  if (c.some((x) => hormonal.includes(x))) return { slug: "hormonal-balance", name: "Hormonal Balance" };
  if (c.some((x) => metabolic.includes(x))) return { slug: "metabolic-health", name: "Metabolic Health" };
  if (a.goal === "Improve digestion" || c.includes("Digestive issues (bloating, acidity, IBS)"))
    return { slug: "gut-health", name: "Gut & Digestive Health" };
  if (a.goal === "Build fitness or muscle" || a.goal === "Gain weight")
    return { slug: "fitness-nutrition", name: "Fitness & Performance" };
  if (a.goal === "Lose weight") return { slug: "weight-transformation", name: "Weight Transformation" };
  return { slug: "lifestyle-wellness", name: "Healthy Lifestyle" };
}
