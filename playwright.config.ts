import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "html",
  // Tolerancia explícita de diferencia de píxeles para toHaveScreenshot
  // (CIN-48) — sin esto, Playwright exige coincidencia exacta salvo por
  // un umbral de color por píxel (sin margen para el ratio de píxeles
  // distintos). 0.5% absorbe variación de antialiasing de fuentes entre
  // ejecuciones (p. ej. macOS local vs. el runner Linux de CI) sin dejar
  // pasar una regresión visual real.
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.005,
    },
  },
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      // build:e2e (a diferencia de build) conecta el SDK de Firebase Auth
      // contra el emulador en vez del proyecto real cinemaloop-platform.
      command: `npm run build:e2e && npx serve out -p ${PORT}`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "npx firebase emulators:start --only auth --project cinemaloop-platform",
      port: 9099,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
