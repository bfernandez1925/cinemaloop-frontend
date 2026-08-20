import { expect, test, type Page } from "@playwright/test";
import { signUp } from "./helpers/signUp";

// Comparación visual (CIN-50) contra el frame "06 · Mis partidas" del
// handoff, más la redirección desde "/" para un usuario ya autenticado.
// getUserProfile/getUserGames se interceptan a nivel de red (mismo
// motivo que en partida.spec.ts: el build de e2e no conecta el
// emulador de Functions, solo el de Auth).
async function mockHistorialCalls(page: Page) {
  await page.route("**/getUserProfile", (route) =>
    route.fulfill({
      json: {
        result: {
          nombre_usuario: "Jugador E2E",
          mejor_puntuacion: 4860,
          cadena_mas_larga: 14,
          partidas_jugadas: 27,
        },
      },
    }),
  );
  await page.route("**/getUserGames", (route) =>
    route.fulfill({
      json: {
        result: {
          pagina: 0,
          partidas: [
            {
              gameId: "1",
              fecha: "2026-08-18T00:00:00.000Z",
              modo: "clasico",
              puntuacion_total: 2860,
              nodos_alcanzados: 9,
              estado: "Ranking",
            },
            {
              gameId: "2",
              fecha: "2026-08-12T00:00:00.000Z",
              modo: "clasico",
              puntuacion_total: 1910,
              nodos_alcanzados: 7,
              estado: "Guardada",
            },
          ],
        },
      },
    }),
  );
}

test.describe("home para usuarios autenticados", () => {
  test("un usuario con sesión activa que visita / no ve el login: se redirige a /inicio", async ({
    page,
  }) => {
    await signUp(page, {
      username: "Fixture inicio",
      email: `e2e-inicio-redirect-${Date.now()}@cinemaloop.test`,
      password: "fixture-password",
    });
    await mockHistorialCalls(page);

    await page.goto("/");

    await page.waitForURL("/inicio");
    await expect(page.getByRole("heading", { name: "Mis partidas" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Iniciar sesión" })).not.toBeVisible();
  });

  test("06 Mis partidas, mobile 390px", async ({ page }) => {
    await signUp(page, {
      username: "Fixture 06",
      email: `e2e-inicio-06-mobile-${Date.now()}@cinemaloop.test`,
      password: "fixture-password",
    });
    await page.setViewportSize({ width: 390, height: 900 });
    await mockHistorialCalls(page);
    await page.goto("/inicio");
    await page.getByText("2860 pts").waitFor();
    await page.waitForFunction(() => document.fonts.status === "loaded");

    await expect(page).toHaveScreenshot("inicio-06-mobile.png", {
      animations: "disabled",
      fullPage: true,
    });
  });

  test("06 Mis partidas, desktop 1280px", async ({ page }) => {
    await signUp(page, {
      username: "Fixture 06",
      email: `e2e-inicio-06-desktop-${Date.now()}@cinemaloop.test`,
      password: "fixture-password",
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await mockHistorialCalls(page);
    await page.goto("/inicio");
    await page.getByText("2860 pts").waitFor();
    await page.waitForFunction(() => document.fonts.status === "loaded");

    await expect(page).toHaveScreenshot("inicio-06-desktop.png", {
      animations: "disabled",
      fullPage: true,
    });
  });

  test('"Jugar partida nueva" lleva a /modos', async ({ page }) => {
    await signUp(page, {
      username: "Fixture CTA",
      email: `e2e-inicio-cta-${Date.now()}@cinemaloop.test`,
      password: "fixture-password",
    });
    await mockHistorialCalls(page);
    await page.goto("/inicio");

    await page.getByRole("link", { name: "Jugar partida nueva" }).click();

    await page.waitForURL("/modos");
  });
});
