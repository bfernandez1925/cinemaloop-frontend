import { expect, test } from "@playwright/test";

// Comparación visual (CIN-39) contra el frame "02 · Selección de modo" del
// handoff, en los dos breakpoints reales (mobile 390px / desktop 1280px).
// La fidelidad de valores (colores, tipografía, radios) se verificó leyendo
// el CSS exacto de CinemaLoop.dc.html; este test fija el resultado como
// snapshot de regresión para detectar cualquier cambio visual futuro no
// intencionado. La comparación automatizada contra el propio handoff
// (spec-design-fidelity.md) es responsabilidad de CIN-48.
test.describe("pantalla Selección de modo", () => {
  test("mobile 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 820 });
    await page.goto("/modos");
    await page.waitForFunction(() => document.fonts.status === "loaded");

    await expect(page).toHaveScreenshot("modos-mobile.png");
  });

  test("desktop 1280px", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/modos");
    await page.waitForFunction(() => document.fonts.status === "loaded");

    await expect(page).toHaveScreenshot("modos-desktop.png");
  });
});
