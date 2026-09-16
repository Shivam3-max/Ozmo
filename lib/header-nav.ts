import type { HeaderNav } from "@/components/Header";
import { programs } from "@/lib/programs";
import { conditions } from "@/lib/conditions";

/** Menu data for the site header, trimmed on the server to the fields the menus show. */
export const headerNav: HeaderNav = {
  programs: programs.map(({ slug, name, oneLiner }) => ({ slug, name, oneLiner })),
  conditions: conditions.map(({ slug, name, cardBlurb }) => ({ slug, name, cardBlurb })),
};
