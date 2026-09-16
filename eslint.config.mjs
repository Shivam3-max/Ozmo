import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "@next/next/no-page-custom-font": "off",
    },
  },
  globalIgnores([".next/**", "lib/generated/**", "prisma/sqlite-migrations-archive/**"]),
]);
