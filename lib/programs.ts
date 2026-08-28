export type Program = {
  slug: string;
  name: string;
  oneLiner: string;
  bestFor: string;
  duration: string;
  followUps: string;
  consultation: string;
  h1: string;
  sub: string;
  metaTitle: string;
  metaDescription: string;
  disclaimerBanner?: boolean;
  forYou: string[];
  notForYou: string[];
  approach: { title: string; body: string }[];
  months?: { label: string; body: string }[];
  tracks: string[];
  sampleDay?: { time: string; meal: string }[];
  sampleDayNote?: string;
  faqs: { q: string; a: string }[];
  related: { label: string; href: string }[];
};

export const programs: Program[] = [
  {
    slug: "weight-transformation",
    name: "Weight Transformation",
    oneLiner: "Sustainable fat loss, built to hold",
    bestFor: "Fat loss that holds",
    duration: "3 or 6 months",
    followUps: "Fortnightly",
    consultation: "60 min",
    h1: "Weight Transformation",
    sub: "Sustainable fat loss, built around the food you already eat — and structured to hold after the programme ends.",
    metaTitle: "Weight Loss Programme — Ozmo Diet Clinic",
    metaDescription:
      "A 3 or 6-month weight transformation programme: personalised diet plan, activity guidance, daily tracking and fortnightly follow-ups with your dietitian.",
    forYou: [
      "You want to lose fat, not just weight on a scale",
      "You've lost weight before and put it back on",
      "You want to keep eating rice, roti and normal home food",
      "You have limited time to cook separately from your family",
      "You want to understand why, not just be handed rules",
    ],
    notForYou: [
      "Anyone looking to lose a large amount of weight in a few weeks. We won't do it and you shouldn't want it",
      "Anyone who wants a plan without any tracking or follow-up — that's not what this is",
      "Anyone with an active eating disorder. That needs medically supervised care, and we'll help you find it",
    ],
    approach: [
      {
        title: "Start from what you eat, not from a template",
        body: "Your first plan looks a lot like your current diet, corrected. That's deliberate — the biggest changes come from portion, timing and combination, and those don't require you to eat food you dislike.",
      },
      {
        title: "Protect muscle while losing fat",
        body: "Rapid crash loss costs muscle, tanks your metabolism and sets up the rebound. We move at a rate your body can sustain and we watch measurements, not just weight.",
      },
      {
        title: "Build the habits that survive month four",
        body: "The programme is designed so that by the end, you can run your own eating without a plan in front of you. That's the actual goal.",
      },
      {
        title: "Adjust as your body adapts",
        body: "Weight loss is not linear and plateaus are expected. Fortnightly reviews exist so a plateau gets addressed in week six, not month three.",
      },
    ],
    months: [
      {
        label: "Month 1 — Reset",
        body: "Full consultation, baseline measurements, first plan. Focus on meal timing, portion control and consistent logging. Most people see early movement here — some of it water weight, and we'll say so.",
      },
      {
        label: "Month 2 — Refine",
        body: "The plan tightens around what's working. We introduce more variety, address the specific situations that trip you up (travel, weekends, office food), and add or adjust activity.",
      },
      {
        label: "Month 3 — Consolidate",
        body: "Focus shifts from losing to keeping. We test flexibility deliberately — social meals, eating out, festival food — so you learn to handle them without the plan collapsing. You finish with a maintenance framework.",
      },
    ],
    tracks: [
      "Weight (weekly)",
      "Waist, hip, chest, arm (fortnightly)",
      "Body fat %",
      "Daily meal adherence",
      "Water intake",
      "Activity and steps",
      "Energy and sleep",
      "Any lab markers you share",
    ],
    sampleDay: [
      { time: "7:00 AM", meal: "Warm water · soaked almonds" },
      { time: "8:30 AM", meal: "Vegetable poha or 2 besan chilla or oats with milk" },
      { time: "11:00 AM", meal: "Seasonal fruit · buttermilk" },
      { time: "1:30 PM", meal: "2 roti · dal · seasonal sabzi · salad · curd" },
      { time: "5:00 PM", meal: "Roasted chana or sprouts or tea with 2 marie biscuits" },
      { time: "8:00 PM", meal: "1 roti or small portion rice · paneer/chicken/dal · sabzi · salad" },
    ],
    faqs: [
      {
        q: "How much weight will I lose?",
        a: "Anyone who answers that before meeting you is guessing. What we'll tell you after your consultation is a realistic range for your body, your health and your starting point — and we'd rather under-promise it.",
      },
      { q: "Will I have to stop eating rice?", a: "No." },
      {
        q: "Do I need a gym?",
        a: "No. Activity helps, but the programme works with walking. If you already train, we'll build around it.",
      },
      {
        q: "What if I stop losing weight?",
        a: "Plateaus are normal and expected. That's what fortnightly reviews are for.",
      },
      {
        q: "What happens after 3 months?",
        a: "You'll have a maintenance framework. Most people move to a monthly maintenance plan; some don't need to.",
      },
    ],
    related: [
      { label: "Weight Loss", href: "/conditions/weight-loss" },
      { label: "Thyroid", href: "/conditions/thyroid" },
      { label: "PCOS / PCOD", href: "/conditions/pcos" },
    ],
  },
  {
    slug: "metabolic-health",
    name: "Metabolic Health",
    oneLiner: "Nutrition support for blood sugar, cholesterol and blood pressure",
    bestFor: "Blood sugar, cholesterol, BP",
    duration: "3 or 6 months",
    followUps: "Fortnightly",
    consultation: "60 min",
    h1: "Metabolic Health",
    sub: "Nutrition support for blood sugar, cholesterol and blood pressure — built around your reports, your medication and your kitchen.",
    metaTitle: "Diabetes & Metabolic Health Nutrition Programme — Ozmo Diet Clinic",
    metaDescription:
      "Nutrition support for blood sugar, cholesterol and blood pressure. Personalised plans built around your reports and medication, with fortnightly dietitian follow-ups.",
    disclaimerBanner: true,
    forYou: [
      "You've been told your blood sugar, cholesterol or blood pressure needs attention",
      "You're managing type 2 diabetes or pre-diabetes and want food guidance that fits real life",
      "You're on medication and want your diet to work with it, not against it",
      "You've been handed a list of “avoid” foods and no idea what to actually eat",
    ],
    notForYou: [
      "Type 1 diabetes management without your treating doctor's involvement",
      "Anyone hoping to replace medication with diet. That's a conversation for your doctor, not for us",
      "Uncontrolled or unstable conditions requiring closely supervised medical nutrition therapy",
    ],
    approach: [
      {
        title: "Work from your reports",
        body: "Bring your HbA1c, fasting and post-prandial readings, lipid profile and any recent panels. Your plan is built around what your numbers actually show.",
      },
      {
        title: "Fix the pattern, not just the plate",
        body: "For blood sugar, when and in what combination you eat often matters as much as what. Meal spacing, carbohydrate distribution across the day, and pairing carbs with protein and fibre do a great deal of the work.",
      },
      {
        title: "Never a list of bans",
        body: "Being told “no sugar, no rice, no potato” is why most people quit. We'll build a plan with actual meals in it, structured so the foods you like still have a place.",
      },
      {
        title: "Coordinate with your medication",
        body: "Timing food around medication matters — and it's something we take seriously and discuss with you.",
      },
    ],
    months: [
      {
        label: "Month 1 — Stabilise",
        body: "Baseline from your reports. Establish consistent meal timing and balanced carbohydrate distribution. Begin logging.",
      },
      {
        label: "Month 2 — Optimise",
        body: "Refine based on your readings and how you feel. Address the specific problem points: late dinners, evening cravings, weekend patterns.",
      },
      {
        label: "Month 3 — Sustain",
        body: "Reassess with fresh reports if your doctor advises them. Build the version of the plan you can run indefinitely.",
      },
    ],
    tracks: [
      "Weight",
      "Waist circumference",
      "Fasting & post-prandial readings",
      "HbA1c at review points",
      "Lipid profile at review points",
      "Blood pressure if relevant",
      "Meal adherence and timing consistency",
      "Activity",
    ],
    sampleDay: [
      { time: "7:00 AM", meal: "Warm water · 5 soaked almonds" },
      { time: "8:30 AM", meal: "Vegetable oats or moong dal chilla · curd" },
      { time: "11:00 AM", meal: "Guava or apple, or buttermilk" },
      { time: "1:30 PM", meal: "2 multigrain roti · dal · green sabzi · large salad · curd" },
      { time: "5:00 PM", meal: "Roasted chana or sprouts chaat · green tea" },
      { time: "8:00 PM", meal: "1–2 roti · paneer/chicken/dal · sabzi · salad" },
      { time: "Habits", meal: "Dinner by 8:30 PM · 10-minute walk after lunch and dinner" },
    ],
    faqs: [
      {
        q: "Can diet reverse diabetes?",
        a: "We won't make that claim. Nutrition and lifestyle changes can meaningfully support how your condition is managed, and your numbers may improve — but any change to medication or any conclusion about your condition is your doctor's call.",
      },
      {
        q: "Do I have to give up sugar completely?",
        a: "Your plan will manage added sugar carefully, but it's built around real, sustainable eating rather than a total ban.",
      },
      {
        q: "Will you talk to my doctor?",
        a: "We'll happily provide your dietitian's summary for you to share with them.",
      },
      {
        q: "Do I need to test my sugar daily?",
        a: "Follow whatever your doctor advises. Whatever readings you have, log them — they make your plan better.",
      },
      {
        q: "What about fasting and festivals?",
        a: "Both are plannable. Tell us in advance and we'll build for them.",
      },
    ],
    related: [
      { label: "Diabetes & Blood Sugar", href: "/conditions/diabetes" },
      { label: "Cholesterol & Heart Health", href: "/conditions/cholesterol" },
      { label: "Weight Loss", href: "/conditions/weight-loss" },
    ],
  },
  {
    slug: "hormonal-balance",
    name: "Hormonal Balance",
    oneLiner: "Focused nutrition for PCOS and thyroid concerns",
    bestFor: "PCOS, PCOD, thyroid",
    duration: "3 or 6 months",
    followUps: "Fortnightly",
    consultation: "60 min",
    h1: "Hormonal Balance",
    sub: "Focused nutrition for PCOS, PCOD and thyroid concerns — because generic weight-loss advice usually doesn't work here, and that isn't your fault.",
    metaTitle: "PCOS & Thyroid Nutrition Programme — Ozmo Diet Clinic",
    metaDescription:
      "Focused nutrition support for PCOS, PCOD and thyroid concerns. Personalised plans, symptom and weight tracking, and fortnightly dietitian follow-ups.",
    disclaimerBanner: true,
    forYou: [
      "You've been diagnosed with PCOS/PCOD or a thyroid condition",
      "You're doing “everything right” and the weight isn't moving",
      "You're dealing with fatigue, irregular cycles, hair or skin changes, or stubborn weight gain",
      "You've been told to “just lose weight” without being told how",
    ],
    notForYou: [
      "Fertility treatment nutrition without your treating doctor's involvement — we'll work alongside them, not instead of them",
      "Anyone seeking a hormonal diagnosis. Diagnosis is your doctor's job; nutrition support is ours",
    ],
    approach: [
      {
        title: "Take it seriously",
        body: "Hormonal conditions genuinely make weight harder to shift. That isn't an excuse and it isn't a life sentence — it means the approach has to be different from a standard weight-loss plan.",
      },
      {
        title: "Insulin sensitivity first",
        body: "For many people with PCOS, how the body handles carbohydrates sits at the centre. Carbohydrate quality, pairing, distribution and meal timing become the levers rather than pure calorie restriction.",
      },
      {
        title: "Support, don't sabotage",
        body: "For thyroid: nutrient adequacy, meal timing around medication, and consistency matter. We'll be straight with you — no food cures a thyroid condition, and anyone selling you that is selling you something.",
      },
      {
        title: "Track symptoms, not just weight",
        body: "Energy, cycle regularity, sleep, cravings, skin and hair are part of the picture — sometimes they improve before the scale does, and noticing that keeps people going.",
      },
    ],
    months: [
      {
        label: "Month 1 — Understand",
        body: "Detailed history, reports, symptom baseline. Plan built for stable energy and balanced carbohydrate intake.",
      },
      {
        label: "Month 2 — Adjust",
        body: "Refine based on symptom and weight response. Address cravings, energy dips and cycle patterns.",
      },
      {
        label: "Month 3 — Establish",
        body: "Lock in what's working. Build the long-term version — these are conditions you manage over years, not weeks.",
      },
    ],
    tracks: [
      "Weight",
      "Waist and hip",
      "Cycle regularity (if applicable and if you want to)",
      "Energy levels",
      "Sleep quality",
      "Cravings",
      "Skin and hair changes",
      "Thyroid or hormonal panels at review points",
    ],
    faqs: [
      {
        q: "Can nutrition cure PCOS?",
        a: "No, and we won't say otherwise. PCOS is managed, not cured. Nutrition and lifestyle are a well-recognised part of managing it, and many people find their symptoms and weight respond.",
      },
      {
        q: "Do I have to go gluten-free or dairy-free?",
        a: "Not by default. If there's a clear reason in your case, we'll discuss it. Blanket eliminations are popular online and rarely necessary.",
      },
      {
        q: "I have thyroid — will I ever lose weight?",
        a: "Yes, generally — often more slowly, and with more attention to consistency. We'll set realistic expectations after seeing your reports.",
      },
      {
        q: "Do I need to stop eating soya or cruciferous vegetables?",
        a: "In normal quantities, for most people, no. This is one of the most over-stated pieces of advice on the internet. We'll go through it in your consultation.",
      },
      {
        q: "Will you coordinate with my gynaecologist or endocrinologist?",
        a: "We'll give you a clear dietitian's summary you can share with them.",
      },
    ],
    related: [
      { label: "PCOS / PCOD", href: "/conditions/pcos" },
      { label: "Thyroid", href: "/conditions/thyroid" },
      { label: "Weight Loss", href: "/conditions/weight-loss" },
    ],
  },
  {
    slug: "fitness-nutrition",
    name: "Fitness & Performance",
    oneLiner: "Eat to train, recover and build",
    bestFor: "Training, muscle, performance",
    duration: "1 or 3 months",
    followUps: "Monthly",
    consultation: "45 min",
    h1: "Fitness & Performance",
    sub: "You're already doing the hard part. This is the other 70%.",
    metaTitle: "Sports & Fitness Nutrition Programme — Ozmo Diet Clinic",
    metaDescription:
      "Nutrition built around your training — muscle gain, fat loss, recovery and performance. Personalised plans with macro targets and monthly follow-ups.",
    forYou: [
      "You train regularly and your nutrition isn't keeping up",
      "You want to build muscle, lose fat, or recomposition both",
      "You're preparing for an event, a sport or a physique goal",
      "You're tired of conflicting advice from the internet and your gym",
    ],
    notForYou: [
      "Anyone wanting performance-enhancing substances. We don't go there",
      "Extreme cutting for a stage deadline that isn't compatible with your health",
    ],
    approach: [
      {
        title: "Real macro targets, in real food",
        body: "Protein, carbohydrate and fat targets set to your training load and goal — then translated into meals you'll actually eat, in Indian portions, not in grams of chicken breast.",
      },
      {
        title: "Fuel around training",
        body: "What you eat before and after a session, and how you distribute protein across the day, does more than most supplements.",
      },
      {
        title: "Vegetarian protein, solved properly",
        body: "Hitting protein on an Indian vegetarian diet is genuinely difficult and usually done badly. Dal, paneer, curd, soya, sprouts, and where supplementation makes sense — laid out clearly.",
      },
      {
        title: "Recovery counts",
        body: "Sleep, hydration and rest-day nutrition get the same attention as training-day nutrition.",
      },
    ],
    tracks: [
      "Weight",
      "Body measurements",
      "Body fat % / composition",
      "Protein intake",
      "Training adherence",
      "Strength or performance markers",
      "Energy and recovery",
    ],
    faqs: [
      {
        q: "Do I need supplements?",
        a: "Maybe, maybe not. We'll tell you honestly, and we don't sell them, so there's no reason for us to over-recommend.",
      },
      {
        q: "Can I build muscle as a vegetarian?",
        a: "Yes. It needs more planning, which is exactly what this programme does.",
      },
      {
        q: "Do you write the workout plan too?",
        a: "We provide activity and workout guidance. If you already have a coach, we build the nutrition around their programme.",
      },
      {
        q: "How fast can I gain muscle?",
        a: "Slower than the internet claims. We'll set a realistic target after your consultation.",
      },
    ],
    related: [
      { label: "Sports Nutrition", href: "/conditions/sports-nutrition" },
      { label: "Weight Gain", href: "/conditions/weight-gain" },
    ],
  },
  {
    slug: "gut-health",
    name: "Gut & Digestive Health",
    oneLiner: "Settle the bloating, acidity and irregularity",
    bestFor: "Bloating, acidity, irregularity",
    duration: "1 or 3 months",
    followUps: "Fortnightly",
    consultation: "45 min",
    h1: "Gut & Digestive Health",
    sub: "Bloating, acidity, irregularity — usually fixable, rarely by guesswork.",
    metaTitle: "Gut & Digestive Health Nutrition Programme — Ozmo Diet Clinic",
    metaDescription:
      "Nutrition support for bloating, acidity, constipation and irregular digestion. Structured elimination and reintroduction guided by a dietitian.",
    forYou: [
      "Persistent bloating, gas, acidity or heartburn",
      "Constipation or irregular bowel movements",
      "You feel uncomfortable after most meals and can't work out why",
      "You have IBS-type symptoms and want structured food guidance",
    ],
    notForYou: [
      "Undiagnosed digestive symptoms that need medical investigation first — blood in stool, unexplained weight loss, persistent vomiting, severe pain. See a doctor. We'll say so plainly if you describe these",
      "Diagnosed IBD, coeliac disease or similar without your gastroenterologist's involvement",
    ],
    approach: [
      {
        title: "Find the pattern",
        body: "We start with a detailed food and symptom log. Most digestive complaints have a pattern; it's just invisible until it's written down. The dashboard makes this easy.",
      },
      {
        title: "Structured, temporary elimination — only if needed",
        body: "If we do remove something, it's specific, time-limited, and reintroduced systematically. Permanent random elimination is how people end up eating twelve foods and still bloated.",
      },
      {
        title: "Fibre, fluid, and timing",
        body: "The unglamorous fundamentals fix a surprising number of cases before anything else is needed.",
      },
      {
        title: "Rebuild variety",
        body: "The goal is the widest range of foods you can comfortably eat — not the narrowest.",
      },
    ],
    tracks: [
      "Symptom frequency and severity",
      "Meal-symptom correlation",
      "Bowel regularity",
      "Fibre intake",
      "Water intake",
      "Meal timing",
      "Weight",
    ],
    faqs: [
      {
        q: "Do I need a food intolerance test?",
        a: "Most commercially marketed intolerance tests are not reliable. A structured elimination and reintroduction done properly tells you far more.",
      },
      {
        q: "How long until I feel better?",
        a: "Some people notice a difference within a fortnight; others take longer. We'll be honest about what we're seeing.",
      },
      {
        q: "Will I have to give up dairy or wheat forever?",
        a: "Almost certainly not. Even when something is a trigger, tolerance often depends on quantity and context.",
      },
      {
        q: "Is this for IBS?",
        a: "We provide nutrition support for IBS-type symptoms alongside your doctor's care. We don't diagnose IBS.",
      },
    ],
    related: [
      { label: "Digestive Health", href: "/conditions/digestive-health" },
      { label: "Healthy Lifestyle", href: "/programs/lifestyle-wellness" },
    ],
  },
  {
    slug: "lifestyle-wellness",
    name: "Healthy Lifestyle",
    oneLiner: "For maintenance, prevention, and feeling better daily",
    bestFor: "Prevention and maintenance",
    duration: "1, 3 or 6 months",
    followUps: "Monthly",
    consultation: "45 min",
    h1: "Healthy Lifestyle",
    sub: "For people who aren't fixing a problem — they're avoiding one.",
    metaTitle: "Healthy Lifestyle Nutrition Programme — Ozmo Diet Clinic",
    metaDescription:
      "For prevention, maintenance and everyday wellbeing. A simple personalised plan, light tracking and monthly dietitian check-ins.",
    forYou: [
      "Nothing is wrong, and you'd like to keep it that way",
      "You've finished a programme and want to hold onto the result",
      "Family history of diabetes, heart disease or hypertension and you want to get ahead of it",
      "You eat reasonably well but have no structure, and you feel it",
    ],
    notForYou: [
      "Anyone with an active condition that needs focused clinical nutrition — one of the other programmes will serve you better, and we'll say so",
    ],
    approach: [
      {
        title: "Simplify, don't restrict",
        body: "For prevention, a simple structure you'll follow for years beats an optimised plan you'll follow for six weeks.",
      },
      {
        title: "Cover the gaps",
        body: "Most “healthy” diets have two or three specific gaps — protein, fibre, micronutrients, or meal timing. We find yours.",
      },
      {
        title: "Build the defaults",
        body: "Once your default breakfast, default lunch and default late-evening snack are right, the rest mostly takes care of itself.",
      },
      {
        title: "Light-touch accountability",
        body: "Monthly check-ins and simple tracking. Enough to keep it real, not enough to feel like homework.",
      },
    ],
    tracks: ["Weight (monthly)", "Waist", "Meal adherence", "Water", "Activity", "Annual health markers if you share them"],
    faqs: [
      {
        q: "Is this worth it if I'm already healthy?",
        a: "If you have structure and it's working, probably not — and we'd tell you that. It's most useful if you've got family risk factors, no structure, or you're maintaining after a programme.",
      },
      {
        q: "Can I upgrade later?",
        a: "Yes, any time, and we'll credit what you've paid for the current month.",
      },
      {
        q: "How light is “light”?",
        a: "One consultation, a plan, monthly check-ins and a plan refresh. Logging is optional but recommended.",
      },
    ],
    related: [
      { label: "Weight Loss", href: "/conditions/weight-loss" },
      { label: "Diabetes & Blood Sugar", href: "/conditions/diabetes" },
    ],
  },
];

export const getProgram = (slug: string) => programs.find((p) => p.slug === slug);
