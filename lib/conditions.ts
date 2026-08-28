export type Condition = {
  slug: string;
  name: string;
  group: string;
  cardBlurb: string;
  h1: string;
  sub: string;
  metaTitle: string;
  metaDescription: string;
  isThisYou: string[];
  isThisYouNote?: string;
  why: { heading: string; paras: string[] };
  helps: { heading: string; intro?: string; points: { title: string; body: string }[] };
  ozmo: { title: string; body: string }[];
  foodsHelp?: string[];
  foodsLimit?: string[];
  foodsNote?: string;
  sampleDay?: { time: string; meal: string }[];
  journey?: { label: string; body: string }[];
  myths: { myth: string; truth: string }[];
  faqs: { q: string; a: string }[];
  doctorFirst?: string;
  programSlug: string;
  programLabel: string;
  related: { label: string; href: string }[];
  highCaution?: boolean;
};

export const conditions: Condition[] = [
  {
    slug: "weight-loss",
    name: "Weight Loss",
    group: "Weight & Body",
    cardBlurb: "Lose fat steadily, without starving",
    h1: "Weight loss, without the part where you quit in week three",
    sub: "You don't need another list of banned foods. You need a plan that fits your kitchen and someone who notices when it stops working.",
    metaTitle: "Weight Loss Diet Plan — Personalised Nutrition | Ozmo Diet Clinic",
    metaDescription:
      "A weight loss plan built around Indian food and your actual routine — with tracking, fortnightly follow-ups and a dietitian who adjusts it when it stops working.",
    isThisYou: [
      "You've lost weight before and put it all back",
      "You eat “reasonably healthy” and the weight still isn't moving",
      "You're stuck at the same number no matter what you try",
      "Diet plans you've been given required food you don't like or can't cook",
      "You lose motivation somewhere around week three",
      "You've been told to “just eat less and move more” and it hasn't worked",
    ],
    isThisYouNote:
      "If you recognised three or more of these, the problem is almost certainly the approach, not you.",
    why: {
      heading: "Why weight loss usually fails",
      paras: [
        "It's rarely willpower. In practice it comes down to a handful of predictable things.",
        "**The plan didn't fit the kitchen.** If your plan needs separate cooking and your household cooks one meal, the plan loses.",
        "**It was too aggressive to sustain.** Very low calorie plans work brilliantly for eleven days and then collapse — usually taking some muscle with them, which makes the next attempt harder.",
        "**Nothing accounted for real life.** Weddings, travel, festivals, office food, night shifts. A plan that only works on a perfect Tuesday isn't a plan.",
        "**There was no feedback loop.** You couldn't see whether it was working until the scale moved, and by the time it didn't, you'd already given up.",
        "**Nobody adjusted it.** Bodies adapt. Plateaus are normal. A plan that never changes will stop working — that's physiology, not failure.",
      ],
    },
    helps: {
      heading: "How nutrition actually helps",
      intro:
        "Sustainable fat loss comes from a moderate, consistent energy deficit — with enough protein to protect muscle, enough fibre to keep you full, and a structure you can hold for months rather than weeks. The levers that do most of the work in Indian diets, in rough order of impact:",
      points: [
        { title: "Portion of the staple", body: "Rice and roti quantity, not elimination." },
        { title: "Protein at every meal", body: "Most Indian vegetarian diets are meaningfully short here." },
        { title: "Meal timing", body: "Especially the gap between lunch and dinner, and how late dinner is." },
        { title: "The invisible calories", body: "Oil, sugar in tea, evening snacking, weekend eating out." },
        { title: "Fibre and volume", body: "Salad and vegetables before the carbohydrate portion." },
        { title: "Daily movement", body: "Walking, not necessarily the gym." },
      ],
    },
    ozmo: [
      {
        title: "We start from your current diet",
        body: "Your first plan will look familiar — corrected, not replaced. Changes you barely notice are changes you'll still be making in month three.",
      },
      {
        title: "We set a rate your body can hold",
        body: "Steady and unglamorous beats fast and rebounding.",
      },
      {
        title: "We track more than weight",
        body: "Waist, hip, energy, adherence. Weight lies for weeks at a time; measurements don't.",
      },
      {
        title: "We adjust every fortnight",
        body: "When the plan stops working, we change the plan. That's the whole job.",
      },
    ],
    foodsHelp: [
      "Dal, rajma, chana and legumes",
      "Curd and paneer",
      "Eggs, chicken, fish",
      "Green leafy vegetables",
      "Seasonal fruit (whole, not juiced)",
      "Whole grains — jowar, bajra, oats, brown rice",
      "Nuts and seeds in measured portions",
      "Plenty of water",
    ],
    foodsLimit: [
      "Sugary drinks and packaged juice",
      "Deep-fried snacks",
      "Refined flour (maida) items",
      "Sweets outside occasions",
      "Excess oil and ghee",
      "Very late heavy dinners",
      "“Healthy” packaged food that is mostly sugar",
    ],
    foodsNote:
      "Limiting is not banning. A plan with zero enjoyable food in it has a shelf life of about two weeks.",
    sampleDay: [
      { time: "7:00 AM", meal: "Warm water · 5 soaked almonds" },
      { time: "8:30 AM", meal: "Vegetable poha or 2 besan chilla or oats with milk and fruit" },
      { time: "11:00 AM", meal: "Seasonal fruit or buttermilk" },
      { time: "1:30 PM", meal: "Salad first · 2 roti · dal · sabzi · curd" },
      { time: "5:00 PM", meal: "Roasted chana or sprouts or tea with 2 biscuits" },
      { time: "8:00 PM", meal: "1 roti or small rice portion · paneer/chicken/dal · sabzi · salad" },
    ],
    journey: [
      {
        label: "Weeks 1–2",
        body: "Getting used to timing and portions. Early movement on the scale, some of it water. Logging becomes a habit.",
      },
      {
        label: "Weeks 3–6",
        body: "The real work. Steady loss. This is where most people historically quit — and where fortnightly follow-ups make the difference.",
      },
      {
        label: "Weeks 7–12",
        body: "Adjustments as your body adapts. A plateau somewhere here is normal and expected. Clothes usually change before the scale does.",
      },
      {
        label: "Month 4 onwards",
        body: "Consolidation. Learning to hold the result through social meals, travel and festivals.",
      },
    ],
    myths: [
      { myth: "Carbs make you fat.", truth: "Excess calories do. Rice and roti in the right quantity are in almost every plan we write." },
      { myth: "Eating after 7pm makes you gain weight.", truth: "The clock isn't magic. Late heavy dinners are the problem — and they're usually a symptom of skipping meals earlier." },
      { myth: "You must do cardio to lose weight.", truth: "Nutrition drives fat loss. Movement supports it, helps hold it, and does a great deal for your health — but you won't out-run a poor diet." },
      { myth: "Detox drinks and green tea burn fat.", truth: "They don't. Anything sold on that promise is selling you something." },
      { myth: "Skipping meals speeds it up.", truth: "It usually leads to a larger, less controlled meal later. Consistency beats restriction." },
    ],
    faqs: [
      { q: "How much weight can I lose in a month?", a: "It depends on your starting weight, health, medication and consistency — and anyone quoting a number before meeting you is guessing. We'll give you a realistic range after your consultation." },
      { q: "Do I have to stop eating rice?", a: "No. We adjust the portion and what it's eaten with." },
      { q: "Will I need to cook separately from my family?", a: "No. That's usually the fastest route to failure, so we build around the household meal." },
      { q: "Do I need a gym membership?", a: "No. Walking is enough to start. If you train already, we build around it." },
      { q: "What if I have thyroid or PCOS?", a: "Then a standard weight-loss plan probably won't work well, and you'd be better served by our Hormonal Balance programme." },
      { q: "What if I hit a plateau?", a: "Expected. That's what the fortnightly reviews are for." },
      { q: "Is this safe if I'm on medication?", a: "Tell us exactly what you take. We build around it and never advise changing it." },
    ],
    doctorFirst:
      "Unexplained weight loss you didn't intend · symptoms of an eating disorder · sudden or unexplained weight gain · pregnancy. In these cases, see your doctor first — we'll say the same thing.",
    programSlug: "weight-transformation",
    programLabel: "Weight Transformation Programme",
    related: [
      { label: "PCOS / PCOD", href: "/conditions/pcos" },
      { label: "Thyroid", href: "/conditions/thyroid" },
      { label: "Diabetes", href: "/conditions/diabetes" },
    ],
  },
  {
    slug: "diabetes",
    name: "Diabetes & Blood Sugar",
    group: "Metabolic",
    cardBlurb: "Eat well while managing your numbers",
    h1: "Eating well while managing your blood sugar",
    sub: "Not a list of everything you can't have. A plan built around your reports, your medication and the food your family actually cooks.",
    metaTitle: "Diabetes Diet Plan — Nutrition Support for Blood Sugar | Ozmo Diet Clinic",
    metaDescription:
      "Nutrition guidance for type 2 diabetes and pre-diabetes, built around your reports, your medication and Indian home food. Dietitian-led, with regular follow-ups.",
    isThisYou: [
      "You've been told your fasting sugar or HbA1c needs attention",
      "You have pre-diabetes and want to act before it progresses",
      "You're managing type 2 diabetes and your diet advice was a photocopied list",
      "You've been told “no rice, no sugar, no potato” and no one told you what to actually eat",
      "Your readings swing and you can't see the pattern",
      "Family history and you want to get ahead of it",
    ],
    why: {
      heading: "Why blood sugar becomes difficult to manage",
      paras: [
        "In simple terms, type 2 diabetes involves the body becoming less responsive to insulin, and insulin production not keeping up with demand. Blood glucose then stays higher than it should.",
        "What you eat affects this directly — but so does when you eat, what you eat it with, how much you move, how well you sleep, and your medication. Which is why a food list alone rarely works.",
      ],
    },
    helps: {
      heading: "How nutrition helps",
      intro:
        "Nutrition is a recognised, central part of managing type 2 diabetes, and it works through mechanisms that are well understood.",
      points: [
        { title: "Carbohydrate quantity and quality", body: "Not elimination — distribution. Spreading carbohydrate across the day rather than loading it into one or two meals tends to produce steadier readings." },
        { title: "Pairing", body: "Carbohydrate eaten with protein, fat and fibre is absorbed more gradually. A roti with dal and salad behaves differently from a roti alone." },
        { title: "Meal timing and spacing", body: "Long gaps followed by large meals are one of the most common causes of erratic readings." },
        { title: "Fibre", body: "Whole grains, legumes, vegetables and whole fruit." },
        { title: "Weight and waist", body: "Where relevant, even modest reductions can improve how the body handles glucose." },
        { title: "Movement after meals", body: "A ten-minute walk after lunch and dinner is one of the highest-value, lowest-effort habits available." },
      ],
    },
    ozmo: [
      { title: "We read your reports first", body: "HbA1c, fasting and post-prandial readings, lipid profile, kidney function if available. The plan starts from your numbers." },
      { title: "We build around your medication", body: "Timing food relative to medication matters, and we go through it with you." },
      { title: "We give you meals, not bans", body: "A plan with actual food in it. Rice appears in most of our diabetic plans — in a measured portion, paired properly, at the right time." },
      { title: "We watch the pattern", body: "You log meals and readings; we look for what's driving the spikes. Usually it's two or three specific habits, and they're fixable." },
    ],
    foodsHelp: [
      "Whole grains — jowar, bajra, ragi, oats, brown rice in measured portions",
      "Dal, chana, rajma, sprouts",
      "Green leafy and non-starchy vegetables",
      "Curd and paneer",
      "Eggs, fish, chicken",
      "Nuts and seeds, measured",
      "Whole fruit — guava, apple, papaya, pear, berries",
      "Methi, karela and bitter vegetables as part of a balanced plate",
    ],
    foodsLimit: [
      "Sugary drinks, packaged juice, sweetened lassi",
      "Sweets and mithai",
      "Maida — white bread, biscuits, bakery items",
      "Deep-fried snacks",
      "Very large single portions of rice or potato",
      "Fruit juice even when fresh",
      "Alcohol — discuss with your doctor",
    ],
    sampleDay: [
      { time: "7:00 AM", meal: "Warm water · 5 soaked almonds" },
      { time: "8:30 AM", meal: "Vegetable oats or moong dal chilla with curd or 2 multigrain roti with sabzi" },
      { time: "11:00 AM", meal: "Guava, apple or pear, or buttermilk" },
      { time: "1:30 PM", meal: "Salad first · 2 multigrain roti · dal · green sabzi · curd" },
      { time: "5:00 PM", meal: "Roasted chana or sprouts chaat · green tea" },
      { time: "8:00 PM", meal: "1–2 roti or measured rice · paneer/chicken/dal · sabzi · salad" },
      { time: "Habits", meal: "Dinner by 8:30 PM · 10-minute walk after lunch and dinner · consistent meal timing" },
    ],
    myths: [
      { myth: "Diabetics can't eat rice.", truth: "Portion, pairing and timing matter far more than elimination. Most of our plans include rice." },
      { myth: "Sugar-free means safe.", truth: "Many sugar-free products are refined flour and fat. Read what's actually in it." },
      { myth: "Fruit is bad for diabetics.", truth: "Whole fruit in sensible portions is generally fine and useful. Fruit juice is a different thing entirely." },
      { myth: "Karela juice or methi water will fix it.", truth: "They can be part of a good diet. They are not a treatment, and they will not replace your medication." },
      { myth: "If my sugar is normal now, I can stop.", truth: "Normal readings usually mean the current approach is working — which is an argument for continuing it, not stopping." },
    ],
    faqs: [
      { q: "Can diet reverse diabetes?", a: "We won't claim that. Nutrition and lifestyle are a central part of management, and many people see improvement in their numbers. Any conclusion about your condition, and any change to medication, is your doctor's decision." },
      { q: "Do I need to stop sugar completely?", a: "Added sugar gets managed carefully. The plan is built to be sustainable, not absolute." },
      { q: "Will you adjust my medication?", a: "Never. That's your doctor's job, and we'll say so every time it comes up." },
      { q: "How often should I test?", a: "Follow your doctor's advice. Whatever readings you take, log them — they make your plan sharper." },
      { q: "What about fasting — Karva Chauth, Navratri, Ramadan?", a: "Plannable, and worth discussing with your doctor too. Tell us in advance and we'll build for it." },
      { q: "I'm pre-diabetic. Is this worth doing?", a: "This is the best possible time to act, and the point at which nutrition has the most leverage." },
      { q: "Can I still eat out?", a: "Yes. We'll go through how to order." },
    ],
    doctorFirst:
      "Very high or very low readings · symptoms like excessive thirst, frequent urination, blurred vision, unexplained weight loss · any change in medication · type 1 diabetes management · signs of complications. Nutrition support sits alongside medical care, never instead of it.",
    programSlug: "metabolic-health",
    programLabel: "Metabolic Health Programme",
    related: [
      { label: "Cholesterol & Heart Health", href: "/conditions/cholesterol" },
      { label: "Weight Loss", href: "/conditions/weight-loss" },
      { label: "PCOS / PCOD", href: "/conditions/pcos" },
    ],
  },
  {
    slug: "pcos",
    name: "PCOS / PCOD",
    group: "Hormonal",
    cardBlurb: "Nutrition that works with your hormones",
    h1: "PCOS: when “just lose weight” isn't useful advice",
    sub: "If standard diet plans haven't worked for you, that isn't a discipline problem. PCOS changes what the body does with food — so the plan has to change too.",
    metaTitle: "PCOS & PCOD Diet Plan — Nutrition Support | Ozmo Diet Clinic",
    metaDescription:
      "Nutrition guidance for PCOS and PCOD built around insulin sensitivity, symptoms and Indian food — with symptom tracking and regular dietitian follow-ups.",
    isThisYou: [
      "Diagnosed with PCOS or PCOD, and told to lose weight with no further guidance",
      "Irregular or missing periods",
      "Weight that climbs easily and comes off slowly",
      "Constant cravings, especially for sugar and carbohydrate",
      "Fatigue, low energy, poor sleep",
      "Acne, hair thinning, or unwanted hair growth",
      "You're doing what worked for your friends and it isn't working for you",
    ],
    why: {
      heading: "Why PCOS makes this harder",
      paras: [
        "PCOS is a hormonal condition, and for a large proportion of people who have it, insulin resistance is part of the picture — the body produces more insulin to do the same job.",
        "Higher circulating insulin makes fat storage easier, fat loss harder, and cravings stronger, and it interacts with the hormonal cycle in ways that affect symptoms.",
        "Which means the standard advice — eat less, move more — is working against a stacked deck. Not impossible. Just different.",
      ],
    },
    helps: {
      heading: "How nutrition helps",
      intro:
        "Nutrition and lifestyle are a well-recognised part of managing PCOS. The approach that tends to matter most:",
      points: [
        { title: "Carbohydrate quality and pairing", body: "Not low-carb — better carb. Whole grains, legumes, and always paired with protein and fibre." },
        { title: "Steady meal timing", body: "Long gaps drive the crash-and-crave cycle that makes PCOS eating so hard to control." },
        { title: "Protein at every meal", body: "Helps satiety, helps cravings, helps preserve muscle during fat loss." },
        { title: "Enough fibre", body: "Supports fullness, digestion, and steadier energy." },
        { title: "Movement, especially resistance work", body: "Muscle improves how the body handles glucose." },
        { title: "Sleep and stress", body: "Both directly affect the hormonal picture. Ignoring them makes the food work harder than it should." },
        { title: "Specific nutrients", body: "Vitamin D, B12, iron and others are commonly low. Worth testing, and worth addressing." },
      ],
    },
    ozmo: [
      { title: "We take the condition seriously", body: "No “just eat less.” The plan is built for a body that handles carbohydrate differently." },
      { title: "We work on insulin sensitivity first", body: "Carb quality, pairing, distribution and timing — before we touch calories aggressively." },
      { title: "We track symptoms, not just weight", body: "Energy, cravings, sleep, cycle regularity, skin and hair. These often improve before the scale does, and seeing that keeps people going." },
      { title: "We plan for the long term", body: "PCOS is managed across years. The plan has to be one you can live inside indefinitely." },
    ],
    foodsHelp: [
      "Dal, chana, rajma, sprouts",
      "Paneer, curd, eggs, chicken, fish",
      "Whole grains — jowar, bajra, ragi, oats",
      "Green leafy vegetables",
      "Flax, chia, pumpkin seeds",
      "Nuts in measured portions",
      "Berries, guava, apple, pear",
      "Cinnamon and methi as part of normal cooking",
    ],
    foodsLimit: [
      "Sugary drinks and desserts",
      "Maida — bread, biscuits, bakery, instant noodles",
      "Deep-fried snacks",
      "Large portions of refined carbohydrate alone",
      "Packaged “diet” foods high in sugar",
      "Excessive caffeine if sleep is affected",
    ],
    foodsNote:
      "On the internet's favourite PCOS bans: blanket gluten-free and dairy-free are not necessary for most people with PCOS. If there's a specific reason in your case, we'll discuss it. We don't remove entire food groups on trend.",
    sampleDay: [
      { time: "7:00 AM", meal: "Warm water · 5 soaked almonds and 2 walnuts" },
      { time: "8:30 AM", meal: "Moong dal chilla with curd, or vegetable oats, or 2 eggs with multigrain toast" },
      { time: "11:00 AM", meal: "Guava or apple · a few pumpkin seeds" },
      { time: "1:30 PM", meal: "Salad first · 2 jowar/multigrain roti · dal · green sabzi · curd" },
      { time: "5:00 PM", meal: "Roasted chana or sprouts chaat or buttermilk · green tea" },
      { time: "8:00 PM", meal: "1–2 roti or measured brown rice · paneer/chicken/dal · sabzi · salad" },
      { time: "Habits", meal: "Consistent timing · 30 min walking · resistance training 2–3×/week · sleep before 11 PM" },
    ],
    myths: [
      { myth: "You can't lose weight with PCOS.", truth: "Slower, usually. Not impossible. The method has to be right." },
      { myth: "Everyone with PCOS must go gluten-free and dairy-free.", truth: "Not supported for most people. Unnecessary elimination makes eating harder and adherence worse." },
      { myth: "PCOS can be cured with diet.", truth: "PCOS is managed, not cured. Symptoms often respond well — which is worth a great deal, and is a different claim." },
      { myth: "You need to eat very low carb.", truth: "Quality and pairing generally matter more than severe restriction, and severe restriction is rarely sustainable." },
      { myth: "Losing weight will fix everything.", truth: "It often helps significantly. It isn't the whole picture, and lean people have PCOS too." },
    ],
    faqs: [
      { q: "Will my periods become regular?", a: "Many people find cycle regularity improves alongside nutrition and lifestyle changes. We can't promise it, and it's something to track with your gynaecologist." },
      { q: "Do I need to be overweight to have PCOS?", a: "No. Lean PCOS is real, and the nutrition approach still centres on insulin sensitivity and symptom management." },
      { q: "Should I take inositol or supplements?", a: "Discuss with your doctor. Where a supplement makes sense we'll explain the reasoning — and we don't sell any, so there's no incentive to over-recommend." },
      { q: "Can this help with fertility?", a: "Nutrition and lifestyle are frequently part of a broader fertility plan, but that plan belongs with your treating doctor. We work alongside them." },
      { q: "How long until I notice something?", a: "Energy and cravings often shift first, sometimes within weeks. Weight and cycle changes usually take longer." },
      { q: "Is PCOS the same as PCOD?", a: "The terms are used interchangeably in everyday conversation in India. Your doctor's diagnosis is what matters; the nutrition approach is broadly similar." },
    ],
    doctorFirst:
      "Diagnosis · fertility planning · any medication decisions · severe or worsening symptoms. We provide nutrition support alongside that care.",
    programSlug: "hormonal-balance",
    programLabel: "Hormonal Balance Programme",
    related: [
      { label: "Thyroid", href: "/conditions/thyroid" },
      { label: "Weight Loss", href: "/conditions/weight-loss" },
      { label: "Diabetes", href: "/conditions/diabetes" },
    ],
  },
  {
    slug: "thyroid",
    name: "Thyroid",
    group: "Hormonal",
    cardBlurb: "Energy, weight and food, rebalanced",
    h1: "Thyroid, weight, and what food can actually do",
    sub: "No food fixes a thyroid condition. What nutrition can do is support your energy, your weight and how you feel day to day — and that's worth doing properly.",
    metaTitle: "Thyroid Diet Plan — Nutrition Support | Ozmo Diet Clinic",
    metaDescription:
      "Nutrition guidance for hypothyroidism and hyperthyroidism — meal timing around medication, nutrient adequacy, and realistic weight management. Dietitian-led.",
    isThisYou: [
      "Diagnosed hypothyroidism or hyperthyroidism, on medication",
      "Weight gain that started around the time of diagnosis",
      "Constant fatigue no matter how much you sleep",
      "Hair fall, dry skin, feeling cold, low mood",
      "Your reports are “normal” now, but you still don't feel right",
      "You've been told to avoid cabbage, soya and half the vegetable market",
    ],
    why: {
      heading: "What's actually happening",
      paras: [
        "The thyroid produces hormones that regulate metabolism. In hypothyroidism, there's not enough — metabolism slows, energy drops, weight becomes easier to gain and harder to lose. In hyperthyroidism, the reverse.",
        "Medication addresses the hormone level. It doesn't automatically fix the weight, the energy or the eating patterns that built up while you felt exhausted — and that's the space nutrition works in.",
      ],
    },
    helps: {
      heading: "How nutrition helps",
      intro:
        "Let's be honest first: no food, spice, juice or supplement treats a thyroid condition. Your medication does that. Anything claiming otherwise is not being straight with you. What nutrition genuinely does:",
      points: [
        { title: "Timing around medication", body: "Thyroid medication is generally taken on an empty stomach, and certain foods and supplements — notably calcium and iron — interfere with absorption if taken too close to it. Getting this right matters, and many people don't know it." },
        { title: "Nutrient adequacy", body: "Iodine, selenium, zinc, iron, vitamin D and B12 all matter to thyroid function and to how you feel. Deficiencies are common and worth testing." },
        { title: "Realistic weight management", body: "A slower metabolism means a smaller margin for error and a slower rate of loss. Achievable — with consistency and correct expectations." },
        { title: "Energy and satiety", body: "Protein, fibre and steady meal timing help with the fatigue and the appetite swings." },
        { title: "Gut and digestion", body: "Constipation is a common companion of hypothyroidism, and it's very treatable with fibre, fluid and movement." },
      ],
    },
    ozmo: [
      { title: "We set expectations honestly", body: "Weight loss with a thyroid condition is usually slower. We'd rather tell you that at the start than have you conclude you've failed at week six." },
      { title: "We fix the medication-food timing", body: "Simple, frequently wrong, and immediately worth correcting." },
      { title: "We look for nutrient gaps", body: "Share your reports and we'll build accordingly, flagging anything worth asking your doctor about." },
      { title: "We build a plan you can hold for years", body: "Thyroid conditions are usually lifelong. Short-term plans miss the point." },
    ],
    foodsHelp: [
      "Iodised salt in normal cooking",
      "Fish and seafood",
      "Eggs, curd, paneer",
      "Dal and legumes",
      "Nuts and seeds — especially brazil nuts and pumpkin seeds",
      "Whole grains",
      "Plenty of vegetables and fibre",
      "Adequate protein at every meal",
    ],
    foodsLimit: [
      "Highly processed and fried foods",
      "Excess sugar",
      "Very large quantities of raw cruciferous vegetables",
      "Alcohol in excess",
      "Calcium and iron supplements taken close to thyroid medication",
    ],
    sampleDay: [
      { time: "6:30 AM", meal: "Thyroid medication on an empty stomach · water only" },
      { time: "7:30 AM", meal: "(at least 60 min after medication) Tea or coffee if you have it" },
      { time: "8:30 AM", meal: "2 besan chilla or vegetable oats or 2 eggs with multigrain toast" },
      { time: "11:00 AM", meal: "Fruit · a few pumpkin seeds" },
      { time: "1:30 PM", meal: "Salad · 2 roti · dal · sabzi · curd" },
      { time: "5:00 PM", meal: "Roasted chana or sprouts · green tea" },
      { time: "8:00 PM", meal: "1–2 roti or measured rice · paneer/fish/chicken/dal · sabzi · salad" },
      { time: "Note", meal: "Keep calcium or iron supplements at least 4 hours away from thyroid medication" },
    ],
    myths: [
      { myth: "You must avoid cabbage, cauliflower, broccoli and soya entirely.", truth: "The most over-stated advice in this area. In normal, cooked quantities these are fine for most people. Extremely large raw amounts are a different conversation — and almost nobody eats that way." },
      { myth: "Thyroid means you can never lose weight.", truth: "Slower, yes. Never, no." },
      { myth: "Coriander water or specific juices cure thyroid.", truth: "They don't. Please keep taking your medication." },
      { myth: "If TSH is normal, diet doesn't matter.", truth: "Normal TSH is the medication working. Your energy, weight and nutrient status are still worth attention." },
      { myth: "Gluten-free is essential for everyone with thyroid issues.", truth: "Relevant for people who also have coeliac disease. Not a blanket rule." },
    ],
    faqs: [
      { q: "Will I lose weight if my thyroid is controlled?", a: "Usually yes, with a consistent plan — often more slowly than someone without the condition." },
      { q: "How long should I wait after medication before eating?", a: "Commonly 30–60 minutes, but follow your doctor's instruction — it varies with the medication." },
      { q: "Can I drink tea or coffee in the morning?", a: "Not immediately after your medication. Leave a gap." },
      { q: "Should I take iodine supplements?", a: "Not without your doctor's advice. Too much iodine can be as much of a problem as too little." },
      { q: "Do I need to test anything before starting?", a: "A recent thyroid panel helps a great deal, plus vitamin D, B12 and iron if you have them." },
      { q: "Hyperthyroidism — is the approach different?", a: "Yes, meaningfully. The focus shifts to adequate energy intake, nutrient repletion and often weight maintenance rather than loss." },
    ],
    doctorFirst:
      "Diagnosis and medication · symptoms that worsen · pregnancy with a thyroid condition · nodules or swelling. Nutrition support runs alongside your endocrinologist's or physician's care.",
    programSlug: "hormonal-balance",
    programLabel: "Hormonal Balance Programme",
    related: [
      { label: "PCOS / PCOD", href: "/conditions/pcos" },
      { label: "Weight Loss", href: "/conditions/weight-loss" },
      { label: "Digestive Health", href: "/conditions/digestive-health" },
    ],
  },
  {
    slug: "cholesterol",
    name: "Cholesterol & Heart Health",
    group: "Metabolic",
    cardBlurb: "Heart-friendly eating that isn't boring",
    h1: "Heart-healthy eating that isn't boring food",
    sub: "High cholesterol usually responds well to specific, targeted changes — most of which are about how you cook, not giving up everything you enjoy.",
    metaTitle: "High Cholesterol Diet Plan — Heart-Healthy Nutrition | Ozmo Diet Clinic",
    metaDescription:
      "Nutrition guidance for high cholesterol and heart health, built around Indian food. Practical changes to fats, fibre and cooking — not a bland diet.",
    isThisYou: [
      "Recent lipid profile flagged high LDL or triglycerides, or low HDL",
      "Your doctor said “watch your diet” and left it there",
      "Family history of heart disease or high cholesterol",
      "You've been told to stop eating ghee, oil and eggs entirely",
      "You're on statins and want your diet working with them",
    ],
    why: {
      heading: "What the numbers mean, in plain language",
      paras: [
        "Your lipid profile typically reports total cholesterol, LDL, HDL and triglycerides. Broadly: LDL contributes to plaque build-up in arteries; HDL helps clear cholesterol; triglycerides are blood fats that rise with excess calories, refined carbohydrate, sugar and alcohol.",
        "What your numbers mean for you specifically is a conversation for your doctor. What we do is build the eating pattern around them.",
      ],
    },
    helps: {
      heading: "How nutrition helps",
      points: [
        { title: "Fat quality over fat quantity", body: "Replacing saturated and trans fats with unsaturated fats is one of the better-established levers. That means cooking oil choices, less deep-frying, fewer bakery and packaged items — not zero fat." },
        { title: "Soluble fibre", body: "Oats, barley, legumes, apples, flaxseed. Genuinely useful and easy to add." },
        { title: "Triglycerides respond to sugar and refined carbohydrate", body: "Often more than to dietary fat. This surprises people." },
        { title: "Trans fats out", body: "Vanaspati, repeatedly reheated frying oil, many commercial bakery items. One of the few near-absolute recommendations we make." },
        { title: "Weight and waist, where relevant", body: "Even modest reductions often show up in the lipid panel." },
        { title: "Movement", body: "Regular activity tends to help HDL and triglycerides." },
      ],
    },
    ozmo: [
      { title: "We start with the kitchen, not the plate", body: "Which oil, how much per person per month, how often things are deep-fried, whether frying oil is reused. These changes affect the whole household and cost nothing." },
      { title: "We add before we remove", body: "Soluble fibre, nuts, and better fats go in first. Easier to sustain, and it works." },
      { title: "We separate the LDL problem from the triglyceride problem", body: "They respond to different things, and treating them the same is why generic advice underperforms." },
      { title: "We keep it edible", body: "A heart-healthy Indian diet is not boiled vegetables. Your food should still taste like food." },
    ],
    foodsHelp: [
      "Oats, barley, whole grains",
      "Dal, rajma, chana",
      "Almonds, walnuts, flax and chia",
      "Mustard, groundnut, rice bran or olive oil in measured quantities",
      "Fatty fish",
      "Plenty of vegetables and fruit",
      "Garlic, methi and turmeric in normal cooking",
      "Curd and low-fat milk",
    ],
    foodsLimit: [
      "Deep-fried snacks",
      "Vanaspati and repeatedly reheated oil",
      "Bakery items, biscuits, packaged namkeen",
      "Red and processed meat",
      "Full-fat dairy in excess",
      "Sweets and sugary drinks — especially for triglycerides",
      "Alcohol — especially for triglycerides",
    ],
    myths: [
      { myth: "Eggs cause high cholesterol.", truth: "For most people, dietary cholesterol from eggs has a modest effect on blood cholesterol. What matters more is what the eggs are cooked in and what they're eaten with." },
      { myth: "Ghee is either poison or a superfood.", truth: "Neither. Quantity is the whole argument." },
      { myth: "Only overweight people get high cholesterol.", truth: "Not true. Lean people can have a poor lipid profile — genetics matter." },
      { myth: "If I'm on a statin, diet doesn't matter.", truth: "Diet and medication work together, and your doctor will be looking at both." },
      { myth: "Coconut oil is heart-healthy.", truth: "The evidence is much weaker than the marketing." },
    ],
    faqs: [
      { q: "Can diet alone fix high cholesterol?", a: "Sometimes it improves the numbers significantly; sometimes medication is needed too. That's your doctor's call, and we work alongside it." },
      { q: "How soon will my next report change?", a: "Lipid profiles typically get retested after around three months — follow your doctor's timing." },
      { q: "Do I have to give up ghee entirely?", a: "No. We'll set a sensible household quantity." },
      { q: "Which cooking oil should I use?", a: "Depends on your cooking and the rest of your diet. We'll go through it specifically." },
      { q: "What about triglycerides specifically?", a: "Sugar, refined carbohydrate and alcohol usually matter most here." },
    ],
    programSlug: "metabolic-health",
    programLabel: "Metabolic Health Programme",
    related: [
      { label: "Diabetes & Blood Sugar", href: "/conditions/diabetes" },
      { label: "Weight Loss", href: "/conditions/weight-loss" },
    ],
  },
  {
    slug: "digestive-health",
    name: "Digestive Health",
    group: "Digestive",
    cardBlurb: "Bloating, acidity, irregularity — addressed",
    h1: "Bloating, acidity, irregularity — let's find the actual pattern",
    sub: "Most digestive complaints have a pattern. It just stays invisible until someone writes it down properly.",
    metaTitle: "Diet for Bloating, Acidity & Digestive Health | Ozmo Diet Clinic",
    metaDescription:
      "Structured nutrition support for bloating, acidity, constipation and IBS-type symptoms — with food and symptom tracking to find your actual triggers.",
    isThisYou: [
      "Bloated after most meals, sometimes for hours",
      "Acidity or heartburn several times a week",
      "Constipation, or wildly unpredictable bowel habits",
      "You've eliminated foods one by one and you're still uncomfortable",
      "You've been told “it's stress” and left with nothing actionable",
      "You've been diagnosed with IBS and want structured food guidance",
    ],
    why: {
      heading: "Why this is hard to self-diagnose",
      paras: [
        "Symptoms often appear hours after the trigger. Multiple foods are eaten together. Stress, sleep, meal timing, hydration and eating speed all contribute.",
        "So the pattern is genuinely difficult to see from memory — which is why elimination-by-guesswork usually ends with fewer foods and the same symptoms.",
      ],
    },
    helps: {
      heading: "How nutrition helps",
      points: [
        { title: "Systematic logging first", body: "Food, timing, symptoms, severity — for two to three weeks. The dashboard makes it a few taps a day. Patterns emerge that memory never would have found." },
        { title: "Fix the fundamentals before eliminating anything", body: "Fibre type and amount, water, meal timing, portion size, eating speed, the gap before lying down. A meaningful share of cases resolve here, without removing a single food." },
        { title: "Targeted, temporary elimination — only if needed", body: "Specific, time-boxed, and systematically reintroduced. Permanent open-ended elimination is how people end up eating twelve foods." },
        { title: "Rebuild variety", body: "More tolerated foods is the goal. A narrow diet isn't a healthy gut." },
      ],
    },
    ozmo: [
      { title: "We ask you to log properly for two to three weeks", body: "It's the highest-value thing you can do, and it's the thing nobody has asked you to do systematically before." },
      { title: "We look at habits, not just food", body: "How fast you eat, how late you eat, how long you sit after dinner, water timing, tea and coffee patterns." },
      { title: "We keep eliminations narrow and temporary", body: "With a reintroduction plan written down before we start." },
      { title: "We refer when we should", body: "Some symptoms need investigation, not a diet plan. We'll say so directly." },
    ],
    foodsHelp: [
      "Adequate soluble fibre — oats, psyllium, soaked chia",
      "Curd and fermented foods where tolerated",
      "Well-cooked vegetables",
      "Bananas, papaya, cooked apple",
      "Jeera, saunf, ajwain in cooking",
      "Plenty of water",
      "Smaller, more regular meals",
    ],
    foodsLimit: [
      "Very spicy or heavily fried food",
      "Large late dinners",
      "Excess tea, coffee, carbonated drinks",
      "Alcohol",
      "Very large raw salads — hard to digest for some people",
      "Dairy, for some — worth testing properly, not assuming",
      "Artificial sweeteners, especially sugar alcohols",
    ],
    myths: [
      { myth: "Curd is bad at night.", truth: "For most people it's perfectly fine. If it doesn't suit you specifically, that's individual — not a rule." },
      { myth: "Everyone should eat more raw salad.", truth: "Raw fibre is hard work for some digestive systems. Cooked vegetables are sometimes the better answer." },
      { myth: "Food intolerance blood tests will tell me my triggers.", truth: "Most commercially marketed intolerance panels aren't reliable. Systematic elimination and reintroduction tells you far more." },
      { myth: "Bloating means I need a detox.", truth: "No. It usually means a fixable pattern in what, when or how you're eating." },
    ],
    faqs: [
      { q: "How long before I feel better?", a: "Some people notice change within two weeks; some take longer. We'll be honest about what we're seeing." },
      { q: "Do I have to give up dairy or wheat forever?", a: "Almost certainly not. Tolerance is usually about quantity and context." },
      { q: "Can you diagnose IBS?", a: "No. We provide nutrition support alongside your doctor's diagnosis and care." },
      { q: "Is a low-FODMAP diet right for me?", a: "Sometimes — and it's a structured, time-limited protocol with a reintroduction phase, not a permanent diet. We'd only run it if it's genuinely indicated." },
    ],
    doctorFirst:
      "See a doctor before starting any diet approach if you have blood in your stool, unexplained weight loss, persistent vomiting, difficulty swallowing, severe or worsening pain, symptoms that began suddenly after age 50, or fever alongside digestive symptoms. These need investigation, not a diet plan, and we'll tell you so.",
    programSlug: "gut-health",
    programLabel: "Gut & Digestive Health Programme",
    related: [
      { label: "Weight Loss", href: "/conditions/weight-loss" },
      { label: "Thyroid", href: "/conditions/thyroid" },
    ],
  },
  {
    slug: "weight-gain",
    name: "Weight Gain",
    group: "Weight & Body",
    cardBlurb: "Gain healthy weight, the right way",
    h1: "Gaining weight is harder than people think",
    sub: "And “just eat more” is as useless as “just eat less.” Here's the structured version.",
    metaTitle: "Healthy Weight Gain Diet Plan | Ozmo Diet Clinic",
    metaDescription:
      "A structured weight gain plan built on real food, not junk. Personalised, tracked, and adjusted — with a dietitian who checks you're gaining the right kind of weight.",
    isThisYou: [
      "You've always been underweight and nothing you try changes it",
      "You lost weight after an illness and can't get it back",
      "You've been told to eat more and you genuinely can't — you're full",
      "You've been gaining, but it's all going to your stomach",
      "People keep telling you how lucky you are, and you're tired of hearing it",
    ],
    why: {
      heading: "Why it's difficult",
      paras: [
        "Appetite is the usual limiting factor, not effort. A small stomach capacity, a naturally fast metabolism, a physically demanding job, irregular meal timing, or an underlying condition (thyroid, digestive, or something undiagnosed) can all be involved.",
        "Which is why the answer isn't “eat more” — it's eat more often, more calorie-dense, more digestible, at times when you can actually eat.",
      ],
    },
    helps: {
      heading: "How nutrition helps",
      points: [
        { title: "Calorie density over volume", body: "Nuts, seeds, nut butters, ghee in measured quantity, full-fat dairy, dried fruit, paneer. More calories in less stomach space." },
        { title: "Frequency", body: "Five or six smaller intakes rather than three large ones you can't finish." },
        { title: "Protein and resistance training together", body: "Otherwise you gain fat, not muscle — and that's not what you asked for." },
        { title: "Liquid calories", body: "Smoothies, milkshakes, lassi. Easier to consume when appetite is the constraint." },
        { title: "Don't drink water right before meals", body: "A small change that meaningfully increases what you can eat." },
        { title: "Rule out a cause first", body: "If weight loss is recent or unexplained, that needs a doctor before it needs a dietitian." },
      ],
    },
    ozmo: [
      { title: "We check nothing is being missed", body: "Recent or unexplained weight loss gets referred, not planned around." },
      { title: "We work with your appetite, not against it", body: "Frequency, density and liquid calories, timed to when you can actually eat." },
      { title: "We aim for lean gain", body: "Roughly 0.25–0.5 kg a week, with resistance training alongside, so it isn't all fat." },
      { title: "We track composition, not just the scale", body: "Measurements tell us what kind of weight you're putting on." },
    ],
    foodsHelp: [
      "Whole milk, paneer, curd",
      "Nuts, seeds, nut butters",
      "Dried fruit — dates, figs, raisins",
      "Ghee and healthy oils in measured amounts",
      "Bananas, mangoes, avocado",
      "Rice, roti, potato, sweet potato",
      "Dal, rajma, chana",
      "Eggs, chicken, fish",
      "Homemade shakes and lassi",
    ],
    myths: [
      { myth: "Just eat junk food.", truth: "It'll add weight — mostly fat, along with a poor lipid profile. Not the goal." },
      { myth: "Protein powder alone will do it.", truth: "Without an overall calorie surplus and resistance training, it won't." },
      { myth: "Being thin means you're healthy.", truth: "Not necessarily. Body composition and nutrient status matter more than the number." },
    ],
    faqs: [
      { q: "How fast can I gain?", a: "Roughly 0.25–0.5 kg a week is a sensible target for gaining lean mass. Faster is usually mostly fat." },
      { q: "Do I need to go to the gym?", a: "For gaining muscle rather than just weight, yes — resistance training matters." },
      { q: "I get full very quickly. What then?", a: "That's the actual problem to solve. Frequency, calorie density and liquid calories are the levers." },
      { q: "Should I get tested first?", a: "If the weight loss was recent or unexplained, see your doctor first. We'll say the same." },
    ],
    programSlug: "fitness-nutrition",
    programLabel: "Fitness & Performance Programme",
    related: [
      { label: "Sports Nutrition", href: "/conditions/sports-nutrition" },
      { label: "Digestive Health", href: "/conditions/digestive-health" },
    ],
  },
  {
    slug: "sports-nutrition",
    name: "Sports Nutrition",
    group: "Performance",
    cardBlurb: "Perform, recover, repeat",
    h1: "Training is 30%. This is the other 70%.",
    sub: "Macro targets are easy to write and hard to eat. We translate them into food you'll actually cook.",
    metaTitle: "Sports & Fitness Nutrition — Muscle, Fat Loss, Performance | Ozmo Diet Clinic",
    metaDescription:
      "Nutrition built around your training: macro targets in real Indian food, vegetarian protein solved, and plans for muscle gain, fat loss or recomposition.",
    isThisYou: [
      "You train consistently and results have stalled",
      "You want to build muscle but you're not sure you're eating enough",
      "You want to lose fat without losing the strength you've built",
      "You're vegetarian and struggling to hit protein",
      "You've read a hundred conflicting things and want one clear answer",
    ],
    why: {
      heading: "How nutrition drives results",
      paras: [
        "**Energy balance sets the direction.** Surplus builds, deficit reduces. Everything else is refinement — important refinement, but refinement.",
        "**Protein preserves and builds.** Distributed across the day, not loaded into one shake.",
        "**Carbohydrate fuels the session.** Cutting carbs while training hard is how people end up weak, flat and injured.",
        "**Timing helps at the margins.** Pre and post-training nutrition matters, but far less than total daily intake. Don't let anyone sell you otherwise.",
        "**Recovery is where adaptation happens.** Sleep, hydration and rest-day eating are part of the programme, not gaps in it.",
      ],
    },
    helps: {
      heading: "Vegetarian protein, solved",
      intro:
        "The genuinely difficult problem, done properly — with real quantities, in real meals, not a table of grams you'll never use.",
      points: [
        { title: "Dal and legumes", body: "And how to combine them across the day for a complete amino acid profile." },
        { title: "Paneer, curd, milk", body: "The most practical high-protein staples in an Indian kitchen." },
        { title: "Soya chunks and tofu", body: "Highest protein density available to vegetarians, and badly under-used." },
        { title: "Sprouts, besan, peanuts", body: "Useful additions that fit into meals you already eat." },
        { title: "Supplementation", body: "Where whey or a plant blend genuinely makes practical sense — and where it doesn't." },
      ],
    },
    ozmo: [
      { title: "Targets set to your training, not a template", body: "Your protein, carbohydrate and fat numbers come from your bodyweight, your training load and your goal." },
      { title: "Translated into meals", body: "In katoris and rotis, not in abstract grams." },
      { title: "Built around your coach's programme", body: "If you already train with someone, the nutrition supports their plan rather than competing with it." },
      { title: "Tracked on strength, not just the scale", body: "Recomposition doesn't always show on the scale. Performance markers tell the truer story." },
    ],
    myths: [
      { myth: "You need protein within 30 minutes or the session is wasted.", truth: "The anabolic window is far wider than the supplement industry implies. Total daily protein matters more." },
      { myth: "Vegetarians can't build serious muscle.", truth: "They can. It takes more planning." },
      { myth: "Fasted cardio burns more fat.", truth: "Overall energy balance drives fat loss. Do whichever you'll do consistently." },
      { myth: "You must bulk then cut.", truth: "Not necessarily. Recomposition is realistic for many people, especially earlier in training." },
    ],
    faqs: [
      { q: "How much protein do I actually need?", a: "Depends on your bodyweight, training and goal. We'll set a specific number after your consultation rather than quoting a generic figure." },
      { q: "Do I need supplements?", a: "Sometimes helpful for convenience, rarely essential. We don't sell them." },
      { q: "Can you work with my trainer?", a: "Happily. We'll build the nutrition around their programme." },
      { q: "How long to see a change?", a: "Strength usually before size. Meaningful visual change typically takes months, not weeks." },
    ],
    programSlug: "fitness-nutrition",
    programLabel: "Fitness & Performance Programme",
    related: [
      { label: "Weight Gain", href: "/conditions/weight-gain" },
      { label: "Weight Loss", href: "/conditions/weight-loss" },
    ],
  },
  {
    slug: "pregnancy-nutrition",
    name: "Pregnancy & Post-Natal",
    group: "Life Stages",
    cardBlurb: "Nourishment for two, guided carefully",
    h1: "Nutrition through pregnancy and after",
    sub: "Provided alongside your doctor's care — never instead of it.",
    metaTitle: "Pregnancy & Post-Natal Nutrition Guidance | Ozmo Diet Clinic",
    metaDescription:
      "Nutrition support during pregnancy and after delivery, provided alongside your doctor's care — for adequate nutrition, manageable symptoms and healthy recovery.",
    highCaution: true,
    isThisYou: [
      "You're pregnant and want to eat well without guessing",
      "Nausea or food aversions are making eating difficult",
      "You've been diagnosed with gestational diabetes by your doctor",
      "You've recently delivered and want support with recovery and energy",
      "You're breastfeeding and unsure what you actually need",
    ],
    why: {
      heading: "How we can help",
      paras: [
        "**Adequate nutrition, trimester by trimester** — energy, protein, iron, calcium, folate and other needs change as pregnancy progresses. We build around what your doctor has advised and what you can actually keep down.",
        "**Managing common difficulties** — nausea, food aversions, heartburn, constipation. Practical, food-based approaches that work with a difficult appetite.",
        "**Gestational diabetes support** — where diagnosed and managed by your doctor, we build the eating pattern around their guidance and your readings.",
        "**Healthy weight change** — appropriate ranges vary by individual and are set by your doctor. We help you eat toward the range they've given you.",
        "**Post-natal recovery and lactation** — nutrient repletion, energy, hydration, and eating realistically with a newborn in the house.",
        "**Food safety** — what to avoid and why, in a practical Indian-kitchen context.",
      ],
    },
    helps: {
      heading: "What we will not do",
      points: [
        { title: "Advise on medication or supplement doses", body: "Not without your doctor's confirmation. Ever." },
        { title: "Recommend weight loss during pregnancy", body: "Pregnancy is not the time for it, and we won't provide one." },
        { title: "Contradict your obstetrician", body: "If our guidance differs from theirs, follow theirs and tell us." },
        { title: "Manage any pregnancy complication", body: "That is medical care, and it belongs with your doctor." },
      ],
    },
    ozmo: [
      { title: "Your doctor leads", body: "We build the food around their guidance, and we ask for it explicitly before we start." },
      { title: "We work with the appetite you actually have", body: "A perfect plan you can't keep down is worthless. Practical beats optimal here." },
      { title: "We plan for after, too", body: "Recovery and lactation nutrition is where good guidance makes a real difference and where most people get none." },
    ],
    myths: [],
    faqs: [
      { q: "Can I do a weight loss programme while pregnant?", a: "No. Pregnancy is not the time for weight loss, and we won't provide one." },
      { q: "Can you help with gestational diabetes?", a: "We provide nutrition support alongside your doctor's management. We don't manage the condition." },
      { q: "Is it safe to change my diet during pregnancy?", a: "Improving nutrition quality is generally positive, but any significant change should be discussed with your doctor first — and we'll ask you to." },
      { q: "Can you help after delivery?", a: "Yes — recovery, energy and lactation nutrition is an area where good guidance makes a real difference." },
    ],
    doctorFirst:
      "Pregnancy nutrition must be led by your obstetrician. Ozmo provides dietary guidance that supports their advice. We do not diagnose, treat or manage any pregnancy-related condition, and we will always defer to your doctor. If your doctor's advice differs from ours, follow your doctor.",
    programSlug: "lifestyle-wellness",
    programLabel: "Healthy Lifestyle Programme",
    related: [
      { label: "Diabetes & Blood Sugar", href: "/conditions/diabetes" },
      { label: "Thyroid", href: "/conditions/thyroid" },
    ],
  },
  {
    slug: "child-nutrition",
    name: "Kids' Nutrition",
    group: "Life Stages",
    cardBlurb: "Building good habits early",
    h1: "Building good habits before they need fixing",
    sub: "Most adult eating problems started in childhood. This is the easier end to work on.",
    metaTitle: "Kids' Nutrition — Healthy Eating Habits for Children | Ozmo Diet Clinic",
    metaDescription:
      "Nutrition guidance for children — fussy eating, healthy weight, growth and building habits that last. Family-focused, practical, and free of food-shaming.",
    highCaution: true,
    isThisYou: [
      "Your child eats almost nothing, or the same three things",
      "Concerns about your child's weight — either direction",
      "Constant battles at the dinner table",
      "School lunchboxes that come home untouched",
      "Your child prefers packaged snacks to real meals",
      "Growth or energy concerns raised by your paediatrician",
    ],
    why: {
      heading: "Our approach",
      paras: [
        "**Never shame a child about food or weight.** This is an absolute rule. It causes long-term harm and it doesn't even work in the short term.",
        "**Work with the family, not just the child.** Children eat what's in the house and copy what they see. The plan is for the household.",
        "**Fussy eating is normal and workable.** Repeated non-pressured exposure, structure and patience — not force, bribery or negotiation at the table.",
        "**Practical lunchbox and snack solutions.** The specific, unglamorous problem most parents actually need solved.",
        "**Growth over weight.** Children are growing. The measure is appropriate growth, and it belongs with your paediatrician.",
      ],
    },
    helps: {
      heading: "What that looks like in practice",
      points: [
        { title: "Structure, not restriction", body: "Regular meal and snack times, with the child deciding how much from what's offered." },
        { title: "The household pantry", body: "What's in the house decides most of it. We start there rather than with the child." },
        { title: "Lunchbox rotation", body: "A workable set of options that survive four hours in a bag and actually get eaten." },
        { title: "Alongside your paediatrician", body: "Any growth or medical concern is theirs to lead; we build the food around it." },
      ],
    },
    ozmo: [
      { title: "We never put a child on a diet", body: "We build healthy family eating patterns. Restrictive dieting is not appropriate for children." },
      { title: "We coach the parent as much as the child", body: "Most of the leverage is in how food is offered, not what is offered." },
      { title: "We keep it free of pressure", body: "No clean-plate rules, no dessert bargaining, no food used as reward or punishment." },
    ],
    myths: [
      { myth: "A fussy eater will grow out of it on their own.", truth: "Often yes — but structure and non-pressured exposure make it much faster and much less stressful for everyone." },
      { myth: "Growing children need lots of milk above all.", truth: "Excess milk can displace iron-rich food and is a common, easily fixed cause of low iron." },
      { myth: "A chubby child will slim down naturally.", truth: "Sometimes. It's still worth building good habits early — without ever making the child feel it's about their body." },
    ],
    faqs: [
      { q: "Will you put my child on a diet?", a: "No. We build healthy family eating patterns. Restrictive dieting is not appropriate for children." },
      { q: "What age do you work with?", a: "Please ask us — we'll be straight about whether we're the right fit for your child's age and situation." },
      { q: "Do I need my paediatrician's involvement?", a: "For any growth or medical concern, yes — and we'll ask for their guidance." },
      { q: "Will my child have to eat separately?", a: "No. The point is a family that eats well together." },
    ],
    doctorFirst:
      "Any growth concern, suspected deficiency, or medical condition should be led by your paediatrician. We provide nutrition support alongside their care, and we require a parent or guardian's consent for any child's account.",
    programSlug: "lifestyle-wellness",
    programLabel: "Healthy Lifestyle Programme",
    related: [
      { label: "Healthy Lifestyle", href: "/programs/lifestyle-wellness" },
      { label: "Digestive Health", href: "/conditions/digestive-health" },
    ],
  },
];

export const getCondition = (slug: string) => conditions.find((c) => c.slug === slug);

export const conditionGroups = [
  "Weight & Body",
  "Metabolic",
  "Hormonal",
  "Digestive",
  "Performance",
  "Life Stages",
] as const;
