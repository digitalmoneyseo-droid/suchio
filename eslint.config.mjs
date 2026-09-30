import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig([
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ["**/*.tsx"],
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  globalIgnores([".astro/**", ".next/**", ".vinext/**", ".wrangler/**", "dist/**", "output/**", "test-results/**", "playwright-report/**", "node_modules/**", "next-env.d.ts", "src/worker-configuration.d.ts"]),
]);
