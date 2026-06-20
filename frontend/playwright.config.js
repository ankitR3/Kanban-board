// playwright.config.js
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/tests/e2e",      // fixed: actual location of E2E tests
  timeout: 30 * 1000,
  use: {
    headless: true,                 // run headless for speed / CI
    baseURL: "http://localhost:3000",
    viewport: { width: 1300, height: 720 },
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  webServer: {
    command: "npm run dev",         // use dev server (no build step needed)
    port: 3000,
    reuseExistingServer: true,      // reuse already-running dev server
    timeout: 30 * 1000,
  },
});
