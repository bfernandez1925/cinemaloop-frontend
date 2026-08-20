import { expect, test } from "@playwright/test";

// Comparación visual (CIN-15) contra el frame "01 · Landing / Login" del
// handoff, en los dos breakpoints reales (mobile 390px / desktop 1280px).
// Los gradientes de fondo tienen una animación de deriva sutil
// (@keyframes cl-drift) — se desactivan las animaciones para que la
// captura sea determinista (ver `animations: "disabled"`).
test.describe("pantalla Landing / Login", () => {
  test("mobile 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 820 });
    await page.goto("/");
    await page.waitForFunction(() => document.fonts.status === "loaded");

    await expect(page).toHaveScreenshot("landing-mobile.png", { animations: "disabled" });
  });

  test("desktop 1280px", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.waitForFunction(() => document.fonts.status === "loaded");

    await expect(page).toHaveScreenshot("landing-desktop.png", { animations: "disabled" });
  });
});
