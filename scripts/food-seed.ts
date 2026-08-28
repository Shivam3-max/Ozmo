/**
 * Starter Indian food database.
 *
 * Values are indicative, drawn from common composition tables and rounded to
 * realistic household portions (katori, roti, piece). They are seeded with
 * isVerified: false on purpose — the dietitian must confirm each item before a
 * plan built on it reaches a client. Section 11 of the docs targets 400–600
 * items for V1; this is the working core.
 */
export type SeedFood = {
  name: string;
  alt?: string[];
  category: string;
  unit: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  gi?: "low" | "medium" | "high";
  tags?: string[];
  veg?: boolean;
  vegan?: boolean;
  allergens?: string[];
};

export const FOODS: SeedFood[] = [
  // ── grains & breads ───────────────────────────────────────────────────
  { name: "Chapati (wheat)", alt: ["roti", "phulka"], category: "Grains", unit: "roti", grams: 35, kcal: 104, protein: 3.1, carbs: 20, fat: 1.2, fibre: 2.6, gi: "medium", tags: ["staple"], vegan: true },
  { name: "Multigrain roti", alt: ["missi roti"], category: "Grains", unit: "roti", grams: 38, kcal: 112, protein: 4, carbs: 19.5, fat: 2, fibre: 3.6, gi: "low", tags: ["diabetes-friendly", "high-fibre"], vegan: true },
  { name: "Jowar roti", alt: ["sorghum bhakri"], category: "Grains", unit: "roti", grams: 40, kcal: 110, protein: 3.2, carbs: 22, fat: 1, fibre: 3.2, gi: "low", tags: ["diabetes-friendly", "gluten-free"], vegan: true },
  { name: "Bajra roti", alt: ["pearl millet roti"], category: "Grains", unit: "roti", grams: 40, kcal: 119, protein: 3.6, carbs: 21, fat: 2, fibre: 3.4, gi: "low", tags: ["diabetes-friendly"], vegan: true },
  { name: "Ragi roti", alt: ["finger millet roti"], category: "Grains", unit: "roti", grams: 40, kcal: 105, protein: 2.9, carbs: 22, fat: 0.6, fibre: 3.6, gi: "low", tags: ["diabetes-friendly", "calcium"], vegan: true },
  { name: "White rice, cooked", alt: ["chawal", "steamed rice"], category: "Grains", unit: "katori", grams: 150, kcal: 195, protein: 4, carbs: 43, fat: 0.4, fibre: 0.6, gi: "high", tags: ["staple"], vegan: true },
  { name: "Brown rice, cooked", category: "Grains", unit: "katori", grams: 150, kcal: 185, protein: 4.3, carbs: 38, fat: 1.4, fibre: 2.7, gi: "medium", tags: ["high-fibre"], vegan: true },
  { name: "Dalia, cooked", alt: ["broken wheat", "lapsi"], category: "Grains", unit: "katori", grams: 150, kcal: 150, protein: 5, carbs: 31, fat: 0.8, fibre: 4.2, gi: "low", tags: ["diabetes-friendly", "high-fibre"], vegan: true },
  { name: "Oats, cooked in water", category: "Grains", unit: "katori", grams: 160, kcal: 130, protein: 4.6, carbs: 22, fat: 2.6, fibre: 3.4, gi: "low", tags: ["diabetes-friendly", "cholesterol"], vegan: true },
  { name: "Poha, cooked", alt: ["flattened rice", "chivda"], category: "Grains", unit: "katori", grams: 140, kcal: 180, protein: 3.4, carbs: 34, fat: 3.5, fibre: 1.6, gi: "medium", vegan: true },
  { name: "Upma, cooked", alt: ["rava upma"], category: "Grains", unit: "katori", grams: 150, kcal: 200, protein: 4.6, carbs: 32, fat: 6, fibre: 2, gi: "medium", vegan: true },
  { name: "Idli", category: "Grains", unit: "piece", grams: 45, kcal: 58, protein: 1.9, carbs: 12, fat: 0.2, fibre: 0.5, gi: "medium", vegan: true },
  { name: "Plain dosa", category: "Grains", unit: "piece", grams: 80, kcal: 133, protein: 3, carbs: 22, fat: 3.6, fibre: 1, gi: "medium", vegan: true },
  { name: "Whole wheat bread", category: "Grains", unit: "slice", grams: 28, kcal: 72, protein: 2.7, carbs: 13, fat: 1, fibre: 1.9, gi: "medium", vegan: true, allergens: ["gluten"] },

  // ── pulses & legumes ──────────────────────────────────────────────────
  { name: "Moong dal, cooked", alt: ["green gram dal"], category: "Pulses", unit: "katori", grams: 150, kcal: 145, protein: 9.5, carbs: 22, fat: 1.5, fibre: 6.2, gi: "low", tags: ["high-protein", "diabetes-friendly"], vegan: true },
  { name: "Toor dal, cooked", alt: ["arhar dal", "pigeon pea"], category: "Pulses", unit: "katori", grams: 150, kcal: 155, protein: 9, carbs: 24, fat: 1.8, fibre: 5.6, gi: "low", tags: ["high-protein"], vegan: true },
  { name: "Masoor dal, cooked", alt: ["red lentil"], category: "Pulses", unit: "katori", grams: 150, kcal: 150, protein: 9.8, carbs: 23, fat: 1.2, fibre: 5.8, gi: "low", tags: ["high-protein"], vegan: true },
  { name: "Chana dal, cooked", alt: ["split bengal gram"], category: "Pulses", unit: "katori", grams: 150, kcal: 175, protein: 9.2, carbs: 27, fat: 2.6, fibre: 7.2, gi: "low", tags: ["high-protein", "high-fibre"], vegan: true },
  { name: "Rajma, cooked", alt: ["kidney beans"], category: "Pulses", unit: "katori", grams: 150, kcal: 175, protein: 10.5, carbs: 28, fat: 1.2, fibre: 9, gi: "low", tags: ["high-protein", "high-fibre"], vegan: true },
  { name: "Kabuli chana, cooked", alt: ["chickpeas", "chole"], category: "Pulses", unit: "katori", grams: 150, kcal: 190, protein: 10, carbs: 30, fat: 3, fibre: 8.4, gi: "low", tags: ["high-protein", "high-fibre"], vegan: true },
  { name: "Kala chana, boiled", alt: ["black chana"], category: "Pulses", unit: "katori", grams: 120, kcal: 165, protein: 9.6, carbs: 26, fat: 2.4, fibre: 8.8, gi: "low", tags: ["high-protein"], vegan: true },
  { name: "Mixed sprouts", alt: ["ankurit dal"], category: "Pulses", unit: "katori", grams: 100, kcal: 96, protein: 8, carbs: 14, fat: 0.6, fibre: 4.4, gi: "low", tags: ["high-protein", "high-fibre"], vegan: true },
  { name: "Soya chunks, cooked", alt: ["nutrela", "TVP"], category: "Pulses", unit: "katori", grams: 100, kcal: 145, protein: 22, carbs: 12, fat: 1, fibre: 6, gi: "low", tags: ["high-protein", "muscle-gain"], vegan: true, allergens: ["soy"] },
  { name: "Besan chilla", alt: ["gram flour pancake"], category: "Pulses", unit: "piece", grams: 60, kcal: 118, protein: 6, carbs: 14, fat: 4, fibre: 2.8, gi: "low", tags: ["high-protein"], vegan: true },

  // ── dairy & eggs ──────────────────────────────────────────────────────
  { name: "Curd, plain", alt: ["dahi", "yoghurt"], category: "Dairy", unit: "katori", grams: 100, kcal: 60, protein: 3.1, carbs: 4.7, fat: 3.3, fibre: 0, gi: "low", tags: ["probiotic"], allergens: ["dairy"] },
  { name: "Low-fat curd", alt: ["toned dahi"], category: "Dairy", unit: "katori", grams: 100, kcal: 42, protein: 3.5, carbs: 4.8, fat: 1.2, fibre: 0, gi: "low", allergens: ["dairy"] },
  { name: "Greek yoghurt, plain", category: "Dairy", unit: "katori", grams: 100, kcal: 59, protein: 10, carbs: 3.6, fat: 0.4, fibre: 0, tags: ["high-protein"], allergens: ["dairy"] },
  { name: "Paneer", alt: ["cottage cheese"], category: "Dairy", unit: "katori", grams: 60, kcal: 160, protein: 11, carbs: 2.4, fat: 12, fibre: 0, tags: ["high-protein"], allergens: ["dairy"] },
  { name: "Low-fat paneer", category: "Dairy", unit: "katori", grams: 60, kcal: 96, protein: 12.5, carbs: 2.5, fat: 4, fibre: 0, tags: ["high-protein"], allergens: ["dairy"] },
  { name: "Toned milk", alt: ["doodh"], category: "Dairy", unit: "glass", grams: 200, kcal: 116, protein: 6.4, carbs: 9.6, fat: 6, fibre: 0, allergens: ["dairy"] },
  { name: "Skimmed milk", category: "Dairy", unit: "glass", grams: 200, kcal: 70, protein: 6.8, carbs: 10, fat: 0.4, fibre: 0, allergens: ["dairy"] },
  { name: "Buttermilk, salted", alt: ["chaas", "chhach"], category: "Dairy", unit: "glass", grams: 200, kcal: 40, protein: 2.4, carbs: 4.6, fat: 1.2, fibre: 0, allergens: ["dairy"] },
  { name: "Whole egg, boiled", alt: ["anda"], category: "Eggs", unit: "piece", grams: 50, kcal: 78, protein: 6.3, carbs: 0.6, fat: 5.3, fibre: 0, tags: ["high-protein"], veg: false, allergens: ["egg"] },
  { name: "Egg white, boiled", category: "Eggs", unit: "piece", grams: 33, kcal: 17, protein: 3.6, carbs: 0.2, fat: 0.1, fibre: 0, tags: ["high-protein"], veg: false, allergens: ["egg"] },

  // ── meat & fish ───────────────────────────────────────────────────────
  { name: "Chicken breast, grilled", category: "Meat", unit: "piece", grams: 100, kcal: 165, protein: 31, carbs: 0, fat: 3.6, fibre: 0, tags: ["high-protein", "muscle-gain"], veg: false },
  { name: "Chicken curry (home style)", category: "Meat", unit: "katori", grams: 150, kcal: 220, protein: 20, carbs: 5, fat: 13, fibre: 1, veg: false },
  { name: "Rohu fish, curry", category: "Fish", unit: "piece", grams: 100, kcal: 145, protein: 17, carbs: 2, fat: 7, fibre: 0.4, veg: false, allergens: ["fish"] },
  { name: "Grilled fish (any lean)", category: "Fish", unit: "piece", grams: 100, kcal: 128, protein: 22, carbs: 0, fat: 4, fibre: 0, tags: ["high-protein", "cholesterol"], veg: false, allergens: ["fish"] },

  // ── vegetables ────────────────────────────────────────────────────────
  { name: "Mixed vegetable sabzi", category: "Vegetables", unit: "katori", grams: 120, kcal: 95, protein: 2.6, carbs: 10, fat: 5, fibre: 3.6, gi: "low", vegan: true },
  { name: "Bhindi sabzi", alt: ["okra", "ladies finger"], category: "Vegetables", unit: "katori", grams: 120, kcal: 90, protein: 2.2, carbs: 8, fat: 5.5, fibre: 3.8, gi: "low", vegan: true },
  { name: "Palak sabzi", alt: ["spinach"], category: "Vegetables", unit: "katori", grams: 120, kcal: 78, protein: 3.4, carbs: 5, fat: 5, fibre: 3, gi: "low", tags: ["iron"], vegan: true },
  { name: "Lauki sabzi", alt: ["bottle gourd", "ghiya"], category: "Vegetables", unit: "katori", grams: 120, kcal: 62, protein: 1.2, carbs: 5, fat: 4, fibre: 1.8, gi: "low", tags: ["diabetes-friendly", "low-calorie"], vegan: true },
  { name: "Karela sabzi", alt: ["bitter gourd"], category: "Vegetables", unit: "katori", grams: 100, kcal: 72, protein: 1.6, carbs: 5, fat: 5, fibre: 2.6, gi: "low", tags: ["diabetes-friendly"], vegan: true },
  { name: "Methi sabzi", alt: ["fenugreek leaves"], category: "Vegetables", unit: "katori", grams: 100, kcal: 80, protein: 3.6, carbs: 6, fat: 5, fibre: 3.4, gi: "low", tags: ["diabetes-friendly", "iron"], vegan: true },
  { name: "Cauliflower sabzi", alt: ["gobhi"], category: "Vegetables", unit: "katori", grams: 120, kcal: 85, protein: 2.4, carbs: 6, fat: 5.5, fibre: 2.8, gi: "low", vegan: true },
  { name: "Aloo sabzi", alt: ["potato"], category: "Vegetables", unit: "katori", grams: 120, kcal: 165, protein: 2.6, carbs: 24, fat: 6, fibre: 2.2, gi: "high", vegan: true },
  { name: "Green salad", alt: ["kachumber"], category: "Vegetables", unit: "bowl", grams: 100, kcal: 28, protein: 1.2, carbs: 5, fat: 0.2, fibre: 2, gi: "low", tags: ["low-calorie", "high-fibre"], vegan: true },
  { name: "Cucumber", alt: ["kheera"], category: "Vegetables", unit: "piece", grams: 100, kcal: 16, protein: 0.7, carbs: 3.6, fat: 0.1, fibre: 0.5, gi: "low", tags: ["low-calorie"], vegan: true },
  { name: "Tomato", category: "Vegetables", unit: "piece", grams: 80, kcal: 15, protein: 0.7, carbs: 3.1, fat: 0.2, fibre: 1, gi: "low", vegan: true },
  { name: "Sambar", category: "Vegetables", unit: "katori", grams: 150, kcal: 110, protein: 5, carbs: 15, fat: 3, fibre: 4, gi: "low", vegan: true },

  // ── fruit ─────────────────────────────────────────────────────────────
  { name: "Apple", alt: ["seb"], category: "Fruit", unit: "piece", grams: 150, kcal: 78, protein: 0.4, carbs: 21, fat: 0.3, fibre: 3.6, gi: "low", tags: ["diabetes-friendly"], vegan: true },
  { name: "Guava", alt: ["amrood"], category: "Fruit", unit: "piece", grams: 120, kcal: 82, protein: 3.1, carbs: 17, fat: 1, fibre: 6.4, gi: "low", tags: ["diabetes-friendly", "high-fibre"], vegan: true },
  { name: "Papaya, cubed", category: "Fruit", unit: "katori", grams: 140, kcal: 60, protein: 0.7, carbs: 15, fat: 0.4, fibre: 2.5, gi: "medium", tags: ["digestion"], vegan: true },
  { name: "Banana", alt: ["kela"], category: "Fruit", unit: "piece", grams: 100, kcal: 89, protein: 1.1, carbs: 23, fat: 0.3, fibre: 2.6, gi: "medium", tags: ["weight-gain"], vegan: true },
  { name: "Orange", alt: ["santra"], category: "Fruit", unit: "piece", grams: 130, kcal: 61, protein: 1.2, carbs: 15, fat: 0.2, fibre: 3.1, gi: "low", vegan: true },
  { name: "Pear", alt: ["nashpati"], category: "Fruit", unit: "piece", grams: 150, kcal: 86, protein: 0.5, carbs: 23, fat: 0.2, fibre: 4.6, gi: "low", tags: ["diabetes-friendly"], vegan: true },
  { name: "Watermelon, cubed", alt: ["tarbooz"], category: "Fruit", unit: "katori", grams: 150, kcal: 45, protein: 0.9, carbs: 11, fat: 0.2, fibre: 0.6, gi: "high", vegan: true },
  { name: "Pomegranate", alt: ["anaar"], category: "Fruit", unit: "katori", grams: 100, kcal: 83, protein: 1.7, carbs: 19, fat: 1.2, fibre: 4, gi: "low", vegan: true },

  // ── nuts, seeds & fats ────────────────────────────────────────────────
  { name: "Almonds", alt: ["badam"], category: "Nuts & Seeds", unit: "piece", grams: 1.2, kcal: 7, protein: 0.26, carbs: 0.26, fat: 0.6, fibre: 0.15, gi: "low", tags: ["healthy-fat"], vegan: true, allergens: ["nuts"] },
  { name: "Walnuts", alt: ["akhrot"], category: "Nuts & Seeds", unit: "piece", grams: 3, kcal: 20, protein: 0.45, carbs: 0.4, fat: 2, fibre: 0.2, gi: "low", tags: ["healthy-fat", "cholesterol"], vegan: true, allergens: ["nuts"] },
  { name: "Peanuts, roasted", alt: ["moongphali"], category: "Nuts & Seeds", unit: "katori", grams: 30, kcal: 170, protein: 7.7, carbs: 4.8, fat: 14, fibre: 2.5, gi: "low", tags: ["high-protein"], vegan: true, allergens: ["peanuts"] },
  { name: "Flaxseed, ground", alt: ["alsi"], category: "Nuts & Seeds", unit: "tbsp", grams: 10, kcal: 53, protein: 1.8, carbs: 2.9, fat: 4.2, fibre: 2.7, gi: "low", tags: ["cholesterol", "PCOS"], vegan: true },
  { name: "Chia seeds", category: "Nuts & Seeds", unit: "tbsp", grams: 12, kcal: 58, protein: 2, carbs: 5, fat: 3.7, fibre: 4.1, gi: "low", tags: ["high-fibre"], vegan: true },
  { name: "Pumpkin seeds", category: "Nuts & Seeds", unit: "tbsp", grams: 10, kcal: 56, protein: 3, carbs: 1.1, fat: 4.9, fibre: 0.6, gi: "low", tags: ["zinc", "PCOS"], vegan: true },
  { name: "Ghee", category: "Fats", unit: "tsp", grams: 5, kcal: 45, protein: 0, carbs: 0, fat: 5, fibre: 0, allergens: ["dairy"] },
  { name: "Mustard oil", alt: ["sarson ka tel"], category: "Fats", unit: "tsp", grams: 5, kcal: 45, protein: 0, carbs: 0, fat: 5, fibre: 0, vegan: true },
  { name: "Olive oil", category: "Fats", unit: "tsp", grams: 5, kcal: 44, protein: 0, carbs: 0, fat: 5, fibre: 0, tags: ["cholesterol"], vegan: true },

  // ── snacks & drinks ───────────────────────────────────────────────────
  { name: "Roasted chana", alt: ["bhuna chana"], category: "Snacks", unit: "katori", grams: 30, kcal: 110, protein: 6, carbs: 17, fat: 1.7, fibre: 5, gi: "low", tags: ["high-protein", "high-fibre"], vegan: true },
  { name: "Roasted makhana", alt: ["fox nuts"], category: "Snacks", unit: "katori", grams: 25, kcal: 88, protein: 2.4, carbs: 19, fat: 0.2, fibre: 3.6, gi: "low", tags: ["low-calorie"], vegan: true },
  { name: "Sprouts chaat", category: "Snacks", unit: "katori", grams: 120, kcal: 120, protein: 8.4, carbs: 18, fat: 1.2, fibre: 5.2, gi: "low", tags: ["high-protein"], vegan: true },
  { name: "Marie biscuit", category: "Snacks", unit: "piece", grams: 5, kcal: 22, protein: 0.4, carbs: 4, fat: 0.6, fibre: 0.1, gi: "high", allergens: ["gluten"] },
  { name: "Green tea", category: "Drinks", unit: "cup", grams: 200, kcal: 2, protein: 0, carbs: 0.4, fat: 0, fibre: 0, vegan: true },
  { name: "Tea with toned milk, no sugar", alt: ["chai"], category: "Drinks", unit: "cup", grams: 150, kcal: 45, protein: 2, carbs: 3.4, fat: 2.6, fibre: 0, allergens: ["dairy"] },
  { name: "Coconut water", alt: ["nariyal pani"], category: "Drinks", unit: "glass", grams: 200, kcal: 38, protein: 1.4, carbs: 8.8, fat: 0.4, fibre: 2.2, gi: "low", vegan: true },
  { name: "Lemon water, no sugar", alt: ["nimbu pani"], category: "Drinks", unit: "glass", grams: 200, kcal: 8, protein: 0.1, carbs: 2.4, fat: 0, fibre: 0.2, vegan: true },
];
