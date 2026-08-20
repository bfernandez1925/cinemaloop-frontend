import { expect, test } from "@playwright/test";

// Verifica el criterio de aceptación de CIN-38: las fuentes se cargan
// vía next/font/google (auto-hospedadas, sin <link> a Google Fonts) y no
// producen layout shift perceptible al cargar.
test("carga EB Garamond e Inter Tight sin <link> externo ni layout shift", async ({ page }) => {
  await page.goto("/");

  const googleFontsLink = page.locator('link[href*="fonts.googleapis.com"]');
  await expect(googleFontsLink).toHaveCount(0);

  const fontVariables = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      ebGaramond: style.getPropertyValue("--font-eb-garamond").trim(),
      interTight: style.getPropertyValue("--font-inter-tight").trim(),
    };
  });
  expect(fontVariables.ebGaramond).not.toBe("");
  expect(fontVariables.interTight).not.toBe("");

  await page.waitForFunction(() => document.fonts.status === "loaded");

  const cumulativeLayoutShift = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
          })[]) {
            if (!entry.hadRecentInput) total += entry.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
        // Da tiempo a que se registren shifts tardíos de fuentes/imágenes.
        setTimeout(() => resolve(total), 1000);
      }),
  );
  // Umbral "good" de Core Web Vitals para CLS.
  expect(cumulativeLayoutShift).toBeLessThan(0.1);
});
