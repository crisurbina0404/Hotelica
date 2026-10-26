import { defineConfig } from "vitest/config";

// Aquí solo corren las pruebas unitarias de src. Las E2E (tests/*.spec.ts)
// son de Playwright y se corren con `npm run test:e2e`
export default defineConfig({
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    passWithNoTests: true,
  },
});
