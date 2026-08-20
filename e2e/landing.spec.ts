import { expect, test } from "@playwright/test";

// Comparación visual del hero (CIN-15) contra el frame "01 · Landing /
// Login" del handoff, en los dos breakpoints reales (mobile 390px /
// desktop 1280px). Los gradientes de fondo tienen una animación de
// deriva sutil (@keyframes cl-drift) — se desactivan las animaciones
// para que la captura sea determinista (ver `animations: "disabled"`).
//
// `fullPage: true` porque desde CIN-51 la landing ya no es solo el hero:
// incluye secciones comerciales inventadas (sin frame de handoff) que
// también quedan cubiertas como snapshot de regresión propio.
test.describe("pantalla Landing / Login", () => {
  test("mobile 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 820 });
    await page.goto("/");
    // Desde CIN-50 la landing bloquea el render hasta que Firebase Auth
    // confirma que no hay sesión (para no mostrar nunca el login a un
    // usuario ya autenticado) — sin esta espera, la captura podría
    // congelar el estado "Cargando…" en vez de la landing real.
    await page.getByRole("button", { name: "Iniciar sesión" }).first().waitFor();
    await page.waitForFunction(() => document.fonts.status === "loaded");

    await expect(page).toHaveScreenshot("landing-mobile.png", {
      animations: "disabled",
      fullPage: true,
    });
  });

  test("desktop 1280px", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    // Desde CIN-50 la landing bloquea el render hasta que Firebase Auth
    // confirma que no hay sesión (para no mostrar nunca el login a un
    // usuario ya autenticado) — sin esta espera, la captura podría
    // congelar el estado "Cargando…" en vez de la landing real.
    await page.getByRole("button", { name: "Iniciar sesión" }).first().waitFor();
    await page.waitForFunction(() => document.fonts.status === "loaded");

    await expect(page).toHaveScreenshot("landing-desktop.png", {
      animations: "disabled",
      fullPage: true,
    });
  });
});
