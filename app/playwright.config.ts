import fs from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Chromium préinstallé (environnements Claude Code / conteneurs) : on l'utilise
// s'il existe ; sinon résolution standard (CI : `npx playwright install chromium`).
const PREINSTALLED_CHROMIUM = "/opt/pw-browsers/chromium";
const executablePath = fs.existsSync(PREINSTALLED_CHROMIUM) ? PREINSTALLED_CHROMIUM : undefined;

/**
 * Tests E2E (Lot 6, D26 plan de tests) : ils s'exécutent contre le build de
 * production (`next start`) — mêmes conditions que Vercel, flags par défaut
 * (pub OFF, UGC OFF, TMDB non configuré ⇒ replis démo, comme en CI).
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3900",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: executablePath ? { executablePath } : undefined,
      },
    },
  ],
  webServer: {
    command: "npm run start -- --port 3900",
    url: "http://localhost:3900",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
