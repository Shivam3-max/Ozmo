/**
 * Her four real plans, encoded as starting templates.
 *
 * Transcribed from the PDFs she sends clients today, keeping her wording,
 * her quantities and her structure. She duplicates one of these onto a client
 * and edits — which is how she already works, just without the retyping.
 */

export type TplItem = {
  type: "FOOD" | "SUPPLEMENT" | "EXERCISE" | "BREATHWORK" | "LIFESTYLE" | "HYDRATION" | "PREP" | "NOTE";
  text: string;
  quantity?: string;
  optionGroup?: number;
};
export type TplSlot = {
  label: string;
  timeHint?: string;
  condition?: string;
  optionNote?: string;
  items: TplItem[];
};
export type TplDay = { index: number; label: string; slots: TplSlot[] };
export type Template = {
  name: string;
  description: string;
  dietPreference?: string;
  conditions: string[];
  tags: string[];
  dayMode: "SINGLE" | "WEEK" | "SEQUENCE";
  dayCount: number;
  days: TplDay[];
  sections: { kind: "GUIDELINES" | "NOTES"; title?: string; items: string[] }[];
};

export const PLAN_TEMPLATES: Template[] = [
  /* ─────────────────────────────────────────────────────────────── */
  {
    name: "Vegetarian — Period / Cycle Support",
    description: "Single-day plan for the menstrual phase. Iron, magnesium and anti-inflammatory focus, with cramp and bloating support.",
    dietPreference: "Vegetarian",
    conditions: ["Menstrual health"],
    tags: ["period", "vegetarian", "anti-inflammatory"],
    dayMode: "SINGLE",
    dayCount: 1,
    days: [
      {
        index: 0,
        label: "Every day",
        slots: [
          {
            label: "Morning",
            items: [
              { type: "HYDRATION", text: "Warm water with lemon & chia seeds", quantity: "1 glass" },
              { type: "FOOD", text: "Soaked almonds + walnuts", quantity: "5–6 almonds + 2 walnuts" },
              { type: "FOOD", text: "Flaxseeds OR soaked sabja seeds", quantity: "1 tsp" },
            ],
          },
          {
            label: "Breakfast",
            items: [
              { type: "PREP", text: "Beetroot + carrot + amla juice", quantity: "1 glass" },
              { type: "FOOD", text: "Besan chilla / Moong dal dosa with coconut chutney" },
            ],
          },
          {
            label: "Mid day",
            items: [
              { type: "FOOD", text: "Dark chocolate + dry sautéed makhana", quantity: "1 cube + handful" },
              { type: "HYDRATION", text: "Coconut water", quantity: "1 cup" },
            ],
          },
          {
            label: "Lunch",
            items: [
              { type: "FOOD", text: "Quinoa + beetroot + any daal + mixed vegetables", quantity: "1 bowl" },
              { type: "FOOD", text: "Homemade curd", quantity: "1 small bowl" },
            ],
          },
          {
            label: "Evening",
            items: [
              { type: "PREP", text: "Herbal tea (ginger + tulsi + cinnamon)", quantity: "1 cup" },
              { type: "FOOD", text: "Pumpkin seeds OR sesame seeds", quantity: "10 seeds / ½ tsp" },
            ],
          },
          {
            label: "Dinner",
            items: [
              { type: "FOOD", text: "Daal soup OR vegetable jowar khichdi" },
              { type: "FOOD", text: "Stir-fried leafy greens (palak / methi / bathua)", quantity: "1 small bowl" },
              { type: "FOOD", text: "Flaxseed powder", quantity: "1 small spoon" },
            ],
          },
          {
            label: "Before bedtime",
            items: [
              { type: "PREP", text: "Warm turmeric milk", quantity: "1 cup" },
              { type: "SUPPLEMENT", text: "Triphala — reduces cramps, aids sleep", quantity: "2 cap" },
            ],
          },
        ],
      },
    ],
    sections: [
      {
        kind: "GUIDELINES",
        title: "Extra detox & period health tips",
        items: [
          "Stay hydrated — 2.5–3 litres of water and coconut water to reduce bloating.",
          "Limit caffeine and salt — avoid excess tea/coffee and processed salty foods to prevent water retention.",
          "Increase fibre — helps digestion and prevents constipation during periods.",
          "Gentle movement — light yoga or walking for circulation and cramp relief.",
        ],
      },
    ],
  },

  /* ─────────────────────────────────────────────────────────────── */
  {
    name: "Vegetarian — 3 Day Rotation",
    description: "Three distinct days with shared morning and evening rituals. Good as a short reset or a trial week.",
    dietPreference: "Vegetarian",
    conditions: [],
    tags: ["3-day", "vegetarian", "rotation"],
    dayMode: "WEEK",
    dayCount: 3,
    days: [
      {
        index: -1,
        label: "Every day",
        slots: [
          {
            label: "Wakeup",
            items: [
              { type: "PREP", text: "Boil ½ tsp daalchini in water", quantity: "1 glass" },
              { type: "LIFESTYLE", text: "Warm water with ½ tsp desi ghee, taken in deep squat position", quantity: "1 glass" },
              { type: "BREATHWORK", text: "Anulom vilom 11 times, bhramari 2 times, then walk" },
              { type: "SUPPLEMENT", text: "Omega 3 with water", quantity: "1 cap" },
            ],
          },
          { label: "10 mins before lunch", items: [{ type: "SUPPLEMENT", text: "ACV in water", quantity: "1 tsp in 1 glass" }] },
          { label: "Evening", items: [{ type: "SUPPLEMENT", text: "Protein with papaya", quantity: "1 scoop + 1 bowl" }] },
          {
            label: "Before bed",
            items: [
              { type: "SUPPLEMENT", text: "Ashwagandha with cow milk", quantity: "350 mg + 1 cup" },
              { type: "BREATHWORK", text: "Bhramari", quantity: "5 times" },
              { type: "LIFESTYLE", text: "Close your eyes, feel your body parts and observe breathing" },
            ],
          },
        ],
      },
      {
        index: 0,
        label: "Monday",
        slots: [
          { label: "Breakfast", items: [{ type: "FOOD", text: "Overnight-soaked moong daal cheela with aloo bhaji and hari chutney" }] },
          { label: "Mid day", items: [{ type: "FOOD", text: "Anaar, 1 overnight-soaked walnut and 4 skinless almonds" }] },
          { label: "Lunch", items: [{ type: "FOOD", text: "Bhindi sabji with chana daal and quinoa", quantity: "1 katori quinoa" }] },
          { label: "Dinner", items: [{ type: "FOOD", text: "Gheeya chana daal with jowar roti, fermented beetroot and sprouted methi" }] },
          { label: "30 mins after dinner", items: [{ type: "SUPPLEMENT", text: "Triphala with warm water", quantity: "1 tsp" }] },
        ],
      },
      {
        index: 1,
        label: "Tuesday",
        slots: [
          { label: "Breakfast", items: [{ type: "FOOD", text: "Homemade paneer stuffed in jowar+wheat roti with white butter and dhaniya pudhina chutney", quantity: "70 gm paneer, 3 tsp butter" }] },
          { label: "Mid day", items: [{ type: "FOOD", text: "Plum and pear + 1 overnight-soaked walnut and 4 skinless almonds" }] },
          { label: "Lunch", items: [{ type: "FOOD", text: "Beans, mushroom, capsicum, aloo mix sabji with jowar roti and dhaniya pudhina chutney", quantity: "2 katori" }] },
        ],
      },
      { index: 2, label: "Wednesday", slots: [] },
    ],
    sections: [],
  },

  /* ─────────────────────────────────────────────────────────────── */
  {
    name: "Thyroid & Fatty Liver — Working Professional",
    description: "Built around an office day, with four interchangeable snack options and four lunch options. Includes workout-day and Sunday variations.",
    conditions: ["Thyroid", "Fatty liver"],
    tags: ["thyroid", "fatty-liver", "office", "options"],
    dayMode: "SINGLE",
    dayCount: 1,
    days: [
      {
        index: 0,
        label: "Every day",
        slots: [
          {
            label: "Wakeup",
            items: [
              { type: "SUPPLEMENT", text: "Thyronorm with water" },
              { type: "BREATHWORK", text: "Deep breathing with long exhale, with movement", quantity: "10 times" },
              { type: "LIFESTYLE", text: "Barefoot walk on ground" },
              { type: "FOOD", text: "Overnight-soaked methre wala paani with soaked anjeer and 5 peeled almonds", quantity: "1 small spoon methi, 1 anjeer" },
            ],
          },
          {
            label: "Meal 1 at home",
            items: [
              { type: "HYDRATION", text: "Fresh coconut water with a pinch of salt", quantity: "1 glass" },
              { type: "FOOD", text: "Soaked brazil nut, walnuts and pumpkin seeds", quantity: "1 brazil nut, 2 walnuts, 5 gm seeds" },
            ],
          },
          {
            label: "Coffee",
            timeHint: "9 / 9:30 am",
            items: [{ type: "FOOD", text: "Black coffee, or coffee with almond milk — monk fruit for sweetness if needed" }],
          },
          {
            label: "Office snack",
            timeHint: "by 10 / 11 am",
            optionNote: "Any 1 from the given options",
            items: [
              { type: "LIFESTYLE", text: "Chew a small ginger slice" },
              { type: "FOOD", optionGroup: 1, text: "Fine grated gheeya + dhaniya pudhina + besan + wheat + ajwain + spices missi roti ×2, with whisked curd (jeera, pudhina, dry ginger powder)", quantity: "1 katori gheeya, 150 gm curd" },
              { type: "FOOD", optionGroup: 1, text: "Kala chana + tomato + kheera + bell pepper chaat with a sourdough sandwich of tofu", quantity: "1 katori chana, 40 gm tofu" },
              { type: "FOOD", optionGroup: 1, text: "½ avocado + tomato + oregano + dhaniya pudhina + blanched spinach spread on a sourdough sub with fat-free paneer", quantity: "40 gm paneer" },
              { type: "FOOD", optionGroup: 1, text: "Soya chura + dhaniya pudhina lasan and spices stuffed roti with homemade butter", quantity: "30 gm soya, 2 small spoon butter" },
              { type: "SUPPLEMENT", text: "Omega 3", quantity: "1 cap" },
              { type: "SUPPLEMENT", text: "Churan", quantity: "½ tsp" },
            ],
          },
          {
            label: "Sunday brunch",
            timeHint: "12 pm",
            condition: "Sunday only",
            items: [{ type: "FOOD", text: "Chitte chole with wheat kulcha and homemade saunth imli chutney", quantity: "2 small spoon chutney" }],
          },
          {
            label: "Midday",
            timeHint: "12 pm / 1 pm",
            items: [
              { type: "SUPPLEMENT", text: "Kadhi patta powder with water", quantity: "1 tsp" },
              { type: "HYDRATION", text: "Fresh coconut water with chia seeds", quantity: "1 tsp chia" },
            ],
          },
          {
            label: "Lunch",
            optionNote: "Any 1 from the given options",
            items: [
              { type: "FOOD", text: "Salad — beetroot + carrot + lemon + pinch black pepper + jeera powder" },
              { type: "FOOD", optionGroup: 1, text: "Any daal (mungi dhuli, chana, mungi-masri mix, rongi, chitte chole, rajma) with multigrain roti, 1 tsp mustard oil for cooking and 1 tsp bilona desi ghee", quantity: "1 katori daal, 1 roti" },
              { type: "FOOD", optionGroup: 1, text: "Brown rice + soya paneer + sautéed zucchini, bell pepper, deseeded tomato — fried soya rice with pudhina adrak raita", quantity: "1 katori rice, 100 gm soya paneer, 100 gm curd" },
              { type: "FOOD", optionGroup: 1, text: "Idli with sambar and coconut chutney", quantity: "2 idli, 2 tsp chutney" },
              { type: "FOOD", optionGroup: 1, text: "Kodo vegetable khichdi with ghee and dahi", quantity: "1 tsp ghee" },
              { type: "SUPPLEMENT", text: "Churan", quantity: "½ tsp" },
            ],
          },
          {
            label: "Sunday afternoon",
            timeHint: "4 pm",
            condition: "Sunday only",
            items: [{ type: "FOOD", text: "Chicken breast, any style you love — less oil, with sautéed vegetables and rice", quantity: "120 gm, 1 small katori rice" }],
          },
          { label: "After 1 hr", items: [{ type: "PREP", text: "Ease tea", quantity: "1 cup" }] },
          { label: "Before 30 mins of workout", items: [{ type: "FOOD", text: "Anaar + guava / amla", quantity: "2 anaar" }] },
          { label: "During and post workout", items: [{ type: "HYDRATION", text: "Water with electrolytes", quantity: "½ litre + ½ packet" }] },
          {
            label: "Dinner",
            items: [
              { type: "FOOD", text: "Chopped mixed vegetable soup (broccoli + carrot / mushroom + beans + zucchini + carrot + gheeya) with ginger and garlic, plus 4 egg whites in any form (omelette / bhurji) with lemon and 1 tsp olive oil" },
            ],
          },
          {
            label: "Dinner — leg day",
            condition: "On leg day",
            items: [
              { type: "FOOD", text: "Multigrain roti wrap with sautéed veggies, 1 tsp dip and chicken keema", quantity: "100 gm keema" },
            ],
          },
          { label: "Before bed", items: [{ type: "SUPPLEMENT", text: "Isabgol with warm water", quantity: "1 tsp in 1 glass" }] },
        ],
      },
    ],
    sections: [
      {
        kind: "NOTES",
        title: "Household preparation",
        items: [
          "Multigrain atta: ragi 100 gm + jowar 100 gm + 1 kg MP / khapli wheat.",
          "Kodo khichdi — get from Healthy Earth.",
        ],
      },
      {
        kind: "GUIDELINES",
        title: "Vitamin D protocol",
        items: [
          "Vitamin D shot for 2 days.",
          "Then once a week for 3 weeks.",
          "Then once a month for 2 months.",
        ],
      },
    ],
  },

  /* ─────────────────────────────────────────────────────────────── */
  {
    name: "Vegetarian — 15 Day Diabetes & Fatty Liver",
    description: "Day 1 of a 15-day planner. Heavy on movement, breathwork and liver support alongside the food.",
    dietPreference: "Vegetarian",
    conditions: ["Diabetes", "Fatty liver"],
    tags: ["diabetes", "fatty-liver", "15-day", "vegetarian"],
    dayMode: "SEQUENCE",
    dayCount: 15,
    days: [
      {
        index: 0,
        label: "Day 1",
        slots: [
          {
            label: "Wakeup",
            items: [
              { type: "PREP", text: "Overnight-soaked methre wala paani", quantity: "1 glass, 1 tsp methi" },
              { type: "BREATHWORK", text: "Breathing exercise" },
              { type: "SUPPLEMENT", text: "Curcumin capsule with water" },
              { type: "FOOD", text: "Soaked and peeled almonds and walnut with saunf tea", quantity: "4 almonds, 1 walnut, 1 cup" },
              { type: "PREP", text: "Lemonade — until 9:30 am" },
              { type: "EXERCISE", text: "Calf raises, push-ups, wall chair, bench dips, kettlebell swings and stretching", quantity: "3 sets of 12 reps" },
            ],
          },
          {
            label: "Breakfast",
            timeHint: "10 am",
            items: [
              { type: "LIFESTYLE", text: "Chew raw ginger slice", quantity: "½ inch" },
              { type: "SUPPLEMENT", text: "Omega 3", quantity: "2 cap" },
              { type: "FOOD", text: "Moong + raw papaya / zucchini + isabgol + garlic ginger, with jowar+wheat mix — use soaked and steamed daal to make missi roti, with curd", quantity: "30 gm moong, 1 tsp isabgol, 40 gm flour, 200 gm curd" },
              { type: "SUPPLEMENT", text: "Liver detox", quantity: "1 dose" },
            ],
          },
          {
            label: "Midday",
            timeHint: "1 pm",
            items: [
              { type: "BREATHWORK", text: "Anulom vilom with pran mudra", quantity: "20 min + 20 min" },
              { type: "HYDRATION", text: "Lukewarm water with lemon, chia seeds and yeast", quantity: "1 glass, 1 tsp each" },
            ],
          },
          {
            label: "Afternoon",
            timeHint: "2 pm",
            items: [{ type: "SUPPLEMENT", text: "Protein with soaked chia seeds and roasted pumpkin seeds", quantity: "1 scoop, 1 tsp chia, 15 gm seeds" }],
          },
          {
            label: "Evening",
            timeHint: "4 pm",
            items: [
              { type: "FOOD", text: "Chickpeas / moong / tofu + ½ avocado + tomato + olive oil + spices + dhaniya pudhina patta", quantity: "1 katori, 100 gm tofu, 1 tsp oil" },
              { type: "EXERCISE", text: "Walk and yoga" },
              { type: "FOOD", text: "Guava / pear with soaked walnuts and flaxseeds", quantity: "1 fruit, 2 walnuts, ½ small spoon" },
            ],
          },
          { label: "Post yoga", items: [{ type: "HYDRATION", text: "Warm water with a pinch of salt and lemon" }] },
          {
            label: "Dinner",
            items: [
              { type: "FOOD", text: "Tofu and bell pepper sabji with dhaniya pudhina chutney", quantity: "200 gm tofu, 5 tsp chutney" },
              { type: "SUPPLEMENT", text: "Omega 3", quantity: "1 cap" },
              { type: "SUPPLEMENT", text: "Liver detox", quantity: "1 dose" },
              { type: "EXERCISE", text: "Vajrasana, then walk", quantity: "30 mins walk" },
              { type: "SUPPLEMENT", text: "Magnesium glycinate", quantity: "1 cap" },
              { type: "SUPPLEMENT", text: "Triphala with warm water" },
            ],
          },
        ],
      },
    ],
    sections: [
      {
        kind: "GUIDELINES",
        title: "Guidelines",
        items: [
          "Walk 20 mins after meals.",
          "Strength training in the morning, 4× a week.",
          "Walk 30–40 min twice a day.",
          "Beneficial for you: Surya Namaskar, Bhujangasana, Ardha Matsyendrasana, Pawanmuktasana, Anulom Vilom, Bhramari.",
          "Sleep before 10:30 pm.",
          "Avoid sugar, fried foods, bakery and more than 3 tsp oil a day.",
          "Pranayama and self-healing meditation before sleep and on waking.",
        ],
      },
      {
        kind: "NOTES",
        title: "Notes",
        items: [
          "Always add a pinch of dry ginger powder, jeera powder and kali mirch.",
          "Always make rice-urad idli / dosa at home, or use Tata mix.",
        ],
      },
    ],
  },
];
