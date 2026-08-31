/**
 * Her own vocabulary, lifted from four real plans.
 *
 * These are quick-insert rows for the plan builder — the supplements, breathing
 * practices, movement cues and standing preparations she writes again and
 * again. Far more useful to her than another thousand generic foods.
 */
import type { SeedFood } from "./food-seed.ts";

type LibItem = SeedFood & { defaultType: string; isPrep?: boolean };

const zero = { grams: 0, kcal: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 };

export const PRACTICE_LIBRARY: LibItem[] = [
  // ── supplements she prescribes ──────────────────────────────────────────
  { name: "Omega 3 capsule", category: "Supplement", unit: "cap", defaultType: "SUPPLEMENT", ...zero },
  { name: "Curcumin capsule", category: "Supplement", unit: "cap", defaultType: "SUPPLEMENT", ...zero },
  { name: "Ashwagandha", category: "Supplement", unit: "mg", defaultType: "SUPPLEMENT", ...zero },
  { name: "Triphala", alt: ["triphala churna"], category: "Supplement", unit: "tsp", defaultType: "SUPPLEMENT", ...zero },
  { name: "Magnesium glycinate", category: "Supplement", unit: "cap", defaultType: "SUPPLEMENT", ...zero },
  { name: "Isabgol", alt: ["psyllium husk", "isbagol"], category: "Supplement", unit: "tsp", defaultType: "SUPPLEMENT", ...zero },
  { name: "Churan", category: "Supplement", unit: "tsp", defaultType: "SUPPLEMENT", ...zero },
  { name: "Liver detox", category: "Supplement", unit: "dose", defaultType: "SUPPLEMENT", ...zero },
  { name: "Whey / plant protein scoop", alt: ["protein scoop"], category: "Supplement", unit: "scoop", grams: 30, kcal: 120, protein: 24, carbs: 2, fat: 1.5, fibre: 0, defaultType: "SUPPLEMENT" },
  { name: "Electrolytes", category: "Supplement", unit: "packet", defaultType: "SUPPLEMENT", ...zero },
  { name: "Vitamin D shot", category: "Supplement", unit: "shot", defaultType: "SUPPLEMENT", ...zero },
  { name: "Apple cider vinegar", alt: ["ACV"], category: "Supplement", unit: "tsp", defaultType: "SUPPLEMENT", ...zero },
  { name: "Monk fruit sweetener", category: "Supplement", unit: "pinch", defaultType: "SUPPLEMENT", ...zero },

  // ── breathwork ──────────────────────────────────────────────────────────
  { name: "Anulom vilom", category: "Practice", unit: "min", defaultType: "BREATHWORK", ...zero },
  { name: "Bhramari", alt: ["bharamri"], category: "Practice", unit: "times", defaultType: "BREATHWORK", ...zero },
  { name: "Pran mudra", category: "Practice", unit: "min", defaultType: "BREATHWORK", ...zero },
  { name: "Deep breathing with long exhale", category: "Practice", unit: "times", defaultType: "BREATHWORK", ...zero },
  { name: "Pranayama & self-healing meditation", category: "Practice", unit: "min", defaultType: "BREATHWORK", ...zero },

  // ── asana & movement ────────────────────────────────────────────────────
  { name: "Surya Namaskar", category: "Practice", unit: "rounds", defaultType: "EXERCISE", ...zero },
  { name: "Bhujangasana", category: "Practice", unit: "min", defaultType: "EXERCISE", ...zero },
  { name: "Ardha Matsyendrasana", category: "Practice", unit: "min", defaultType: "EXERCISE", ...zero },
  { name: "Pawanmuktasana", category: "Practice", unit: "min", defaultType: "EXERCISE", ...zero },
  { name: "Vajrasana", alt: ["vajar aasan"], category: "Practice", unit: "min", defaultType: "EXERCISE", ...zero },
  { name: "Walk", category: "Practice", unit: "min", defaultType: "EXERCISE", ...zero },
  { name: "Strength training", category: "Practice", unit: "sets", defaultType: "EXERCISE", ...zero },
  { name: "Stretching", category: "Practice", unit: "min", defaultType: "EXERCISE", ...zero },

  // ── lifestyle cues ──────────────────────────────────────────────────────
  { name: "Barefoot walk on ground", category: "Lifestyle", unit: "min", defaultType: "LIFESTYLE", ...zero },
  { name: "Drink in deep squat position", category: "Lifestyle", unit: "glass", defaultType: "LIFESTYLE", ...zero },
  { name: "Chew raw ginger slice", category: "Lifestyle", unit: "inch", defaultType: "LIFESTYLE", ...zero },
  { name: "Body scan — eyes closed, observe breathing", category: "Lifestyle", unit: "min", defaultType: "LIFESTYLE", ...zero },
  { name: "Sleep before 10:30 pm", category: "Lifestyle", unit: "", defaultType: "LIFESTYLE", ...zero },

  // ── standing preparations she has the household make ────────────────────
  { name: "Dhaniya pudhina chutney", category: "Prep", unit: "tsp", grams: 15, kcal: 12, protein: 0.5, carbs: 1.6, fat: 0.4, fibre: 0.8, defaultType: "PREP", isPrep: true },
  { name: "Saunth imli chutney", category: "Prep", unit: "tsp", grams: 15, kcal: 28, protein: 0.2, carbs: 6.6, fat: 0.1, fibre: 0.4, defaultType: "PREP", isPrep: true },
  { name: "Multigrain atta blend (ragi 100g + jowar 100g + 1kg khapli wheat)", category: "Prep", unit: "batch", grams: 1200, kcal: 0, protein: 0, carbs: 0, fat: 0, fibre: 0, defaultType: "PREP", isPrep: true },
  { name: "Homemade white butter", category: "Prep", unit: "tsp", grams: 5, kcal: 36, protein: 0, carbs: 0, fat: 4, fibre: 0, defaultType: "PREP", isPrep: true },
  { name: "Homemade paneer", category: "Prep", unit: "gm", grams: 100, kcal: 265, protein: 18, carbs: 4, fat: 20, fibre: 0, defaultType: "PREP", isPrep: true },
  { name: "Fermented beetroot", category: "Prep", unit: "katori", grams: 60, kcal: 26, protein: 1, carbs: 5.5, fat: 0.1, fibre: 1.6, defaultType: "PREP", isPrep: true },
  { name: "Methre wala paani (overnight soaked fenugreek water)", category: "Prep", unit: "glass", grams: 200, kcal: 8, protein: 0.5, carbs: 1.2, fat: 0.1, fibre: 0.6, defaultType: "PREP", isPrep: true },
  { name: "Lemonade", category: "Prep", unit: "glass", grams: 250, kcal: 12, protein: 0.1, carbs: 3, fat: 0, fibre: 0.2, defaultType: "PREP", isPrep: true },
  { name: "Beetroot + carrot + amla juice", category: "Prep", unit: "glass", grams: 250, kcal: 78, protein: 1.8, carbs: 17, fat: 0.3, fibre: 3.4, defaultType: "PREP", isPrep: true },
  { name: "Herbal tea (ginger + tulsi + cinnamon)", category: "Prep", unit: "cup", grams: 200, kcal: 4, protein: 0, carbs: 1, fat: 0, fibre: 0, defaultType: "PREP", isPrep: true },
  { name: "Saunf tea", category: "Prep", unit: "cup", grams: 200, kcal: 4, protein: 0, carbs: 1, fat: 0, fibre: 0.2, defaultType: "PREP", isPrep: true },
  { name: "Turmeric milk", alt: ["haldi doodh"], category: "Prep", unit: "cup", grams: 200, kcal: 120, protein: 6.4, carbs: 10, fat: 6, fibre: 0, defaultType: "PREP", isPrep: true },
  { name: "Pudhina adrak raita", category: "Prep", unit: "katori", grams: 100, kcal: 62, protein: 3.2, carbs: 5, fat: 3.3, fibre: 0.3, defaultType: "PREP", isPrep: true },
];
