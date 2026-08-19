import { expect, test } from "@playwright/test";

// Plantilla de test e2e: corre contra un build de producción de la app
// (levantado automáticamente por Playwright, ver playwright.config.ts).
// Los flujos completos de juego llegan con su propia issue (ver
// spec-testing-quality.md: registro/login, partida completa, ranking).
test("la home muestra el título Cinemaloop", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Cinemaloop" })).toBeVisible();
});
