export type Line = string;

/**
 * A clinical profile — what a plan for this concern actually contains.
 * Formats (single day / week rotation / multi-day sequence) are generated from
 * it, so the content stays in one place and the structure varies.
 */
export type Profile = {
  key: string;
  label: string;
  category: string;
  conditions: string[];
  dietPreference?: string;
  focus: string;

  wakeup: Line[];
  breakfasts: Line[];
  midMorning: Line[];
  lunches: Line[];
  evenings: Line[];
  dinners: Line[];
  bedtime: Line[];

  supplements?: Line[];
  practices?: Line[];
  guidelines: Line[];
  notes?: Line[];
};
