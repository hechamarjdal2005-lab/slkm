import tsParser from "@typescript-eslint/parser";

// TypeScript verifies names/types; ESLint checks runtime mistakes and unsafe constructs.
// No formatting or design rules are imposed on the existing application.
export default [
  { ignores: [".next/**", "node_modules/**", "artifacts/**", "stitch-design-export/**"] },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { parser: tsParser, parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } } },
    rules: {
      "constructor-super": "error", "for-direction": "error", "getter-return": "error",
      "no-debugger": "error", "no-dupe-args": "error", "no-dupe-keys": "error",
      "no-duplicate-case": "error", "no-eval": "error", "no-implied-eval": "error",
      "no-new-func": "error", "no-script-url": "error", "no-self-assign": "error",
      "no-unreachable": "error", "no-unsafe-finally": "error", "use-isnan": "error", "valid-typeof": "error",
    },
  },
];
