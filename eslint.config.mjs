import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores (including nested .next dirs e.g. billycheck-comingsoon):
    "**/.next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated files — never lint these
    "src/generated/**",
    "**/generated/**",
  ]),
  // Rule overrides
  {
    rules: {
      // French text with apostrophes throughout — escaping every ' is noisy and unhelpful
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;
