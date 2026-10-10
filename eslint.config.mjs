import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // The questionnaire/playbook JSON data files are intentionally loosely
  // typed (they're authored as data, not code). Reading them with `any`
  // in the UI/lib layer that renders them is a deliberate tradeoff rather
  // than an oversight.
  {
    files: [
      "src/components/**/*.tsx",
      "src/app/(app)/app/page.tsx",
      "src/lib/profile.ts",
      "src/lib/generation.ts",
      "src/**/*.test.ts",
      "scripts/**/*.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;
