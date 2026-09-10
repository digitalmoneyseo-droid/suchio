import { defineConfig, globalIgnores } from "eslint/config";
import nextTypescript from "eslint-config-next/typescript";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([".next/**", ".vinext/**", ".wrangler/**", "dist/**", "test-results/**", "playwright-report/**", "node_modules/**", "next-env.d.ts", "src/worker-configuration.d.ts"]),
]);
