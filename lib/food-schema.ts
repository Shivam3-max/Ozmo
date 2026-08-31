import { z } from "zod";

export const ITEM_TYPE_VALUES = [
  "FOOD", "SUPPLEMENT", "EXERCISE", "BREATHWORK", "LIFESTYLE", "HYDRATION", "PREP", "NOTE",
] as const;

const num = (max: number) => z.coerce.number().min(0).max(max);

export const foodSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(160),
  alternateNames: z.array(z.string().trim().max(80)).max(12).default([]),
  category: z.string().trim().min(1, "Category is required").max(60),

  servingUnit: z.string().trim().min(1, "Serving unit is required").max(30),
  servingGrams: num(5000).default(100),

  calories: num(2000).default(0),
  protein: num(200).default(0),
  carbs: num(400).default(0),
  fat: num(200).default(0),
  fibre: num(120).default(0),

  glycemicTag: z.enum(["low", "medium", "high"]).nullish(),
  conditionTags: z.array(z.string().trim().max(60)).max(20).default([]),

  isVeg: z.boolean().default(true),
  isVegan: z.boolean().default(false),
  isJain: z.boolean().default(false),
  allergens: z.array(z.string().trim().max(60)).max(20).default([]),

  defaultType: z.enum(ITEM_TYPE_VALUES).default("FOOD"),
  isPrep: z.boolean().default(false),
  isVerified: z.boolean().default(false),
});

export type FoodInput = z.infer<typeof foodSchema>;

export const CATEGORIES = [
  "Grains", "Pulses", "Dairy", "Eggs", "Meat", "Fish", "Vegetables", "Fruit",
  "Nuts & Seeds", "Fats", "Snacks", "Drinks", "Supplement", "Practice",
  "Lifestyle", "Prep", "Other",
];

export const COMMON_UNITS = [
  "katori", "bowl", "glass", "cup", "piece", "roti", "slice", "tsp", "tbsp",
  "small spoon", "gm", "ml", "handful", "scoop", "cap", "packet", "min",
  "times", "sets", "rounds", "inch", "batch", "dose", "shot", "mg", "pinch",
];

export const CONDITION_TAGS = [
  "diabetes-friendly", "high-protein", "high-fibre", "low-calorie", "cholesterol",
  "PCOS", "muscle-gain", "weight-gain", "iron", "calcium", "zinc", "probiotic",
  "digestion", "healthy-fat", "gluten-free", "staple",
];

export const ALLERGENS = ["dairy", "gluten", "nuts", "peanuts", "soy", "egg", "fish", "shellfish", "sesame"];
