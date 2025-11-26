import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 1. Extend Next.js Core & TypeScript Defaults
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),

  // 2. Custom Rules & Plugins
  {
    plugins: {
      "simple-import-sort": await import("eslint-plugin-simple-import-sort"),
      "unused-imports": await import("eslint-plugin-unused-imports"),
    },
    rules: {
      // --- Formatting & Imports ---
      // Auto-sort imports
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      
      // Auto-remove unused imports
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_",
        },
      ],

      // --- Developer Experience ---
      // Allow using console.log/error (often blocked in strict configs, but annoying in dev)
      "no-console": ["warn", { allow: ["warn", "error"] }],
      
      // Allow '_variable' to be unused (Standard TS pattern)
      "@typescript-eslint/no-unused-vars": "off", // Handled by unused-imports plugin above
      
      // Enforce consistent type imports (Optional, but good for perf)
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { "prefer": "type-imports", "fixStyle": "inline-type-imports" }
      ]
    },
  },
];

export default eslintConfig;
