import { expect, test, type Page } from "@playwright/test";
import { signUp } from "./helpers/signUp";

// Comparación visual (CIN-45) contra el frame "05 · Ranking global" del
// handoff. getLeaderboard se intercepta a nivel de red, replicando
// exactamente el ejemplo de datos del propio script del handoff
// (mismos nombres/puntuaciones/cadenas/tiempos) para que la captura sea
// comparable 1:1 contra la referencia visual.
const NAMES = [
  "Marta R.",
  "Diego S.",
  "Laura M.",
  "Tú",
  "Iván C.",
  "Nuria P.",
  "Carlos G.",
  "Sofía L.",
];
const SCORES = [4820, 4510, 4390, 4260, 4105, 3980, 3820, 3705];
const CHAINS = [15, 14, 13, 13, 12, 11, 11, 10];
const TIMES = [3.1, 3.4, 3.6, 3.7, 3.9, 4.0, 4.2, 4.3];

async function mockLeaderboard(page: Page, ownUserId: string | null) {
  const entradas = NAMES.map((nombre, i) => ({
    posicion: i + 1,
    userId: nombre === "Tú" && ownUserId ? ownUserId : `u${i}`,
    nombre_usuario: nombre,
    puntuacion: SCORES[i],
    nodos_alcanzados: CHAINS[i],
    tiempo_medio_respuesta: TIMES[i],
    tiempo_total: TIMES[i] * CHAINS[i],
    fecha: "2026-08-18T00:00:00.000Z",
  }));
  const propia = ownUserId ? (entradas.find((e) => e.userId === ownUserId) ?? null) : null;

  await page.route("**/getLeaderboard", (route) =>
    route.fulfill({ json: { result: { pagina: 0, entradas, propia } } }),
  );
}

test.describe("pantalla Ranking global", () => {
  test("05 Ranking, mobile 390px", async ({ page }) => {
    await signUp(page, {
      username: "Fixture 05",
      email: `e2e-ranking-05-mobile-${Date.now()}@cinemaloop.test`,
      password: "fixture-password",
    });
    await page.setViewportSize({ width: 390, height: 900 });
    await mockLeaderboard(page, "e2e-own-user");
    await page.goto("/ranking");
    // Cada fila se renderiza dos veces (variante mobile + desktop,
    // ocultas por CSS según el breakpoint) — "attached" basta para
    // saber que los datos ya cargaron, sin importar cuál es visible.
    await page.getByText("Marta R.").first().waitFor({ state: "attached" });
    await page.waitForFunction(() => document.fonts.status === "loaded");

    await expect(page).toHaveScreenshot("ranking-05-mobile.png", {
      animations: "disabled",
      fullPage: true,
    });
  });

  test("05 Ranking, desktop 1280px", async ({ page }) => {
    await signUp(page, {
      username: "Fixture 05",
      email: `e2e-ranking-05-desktop-${Date.now()}@cinemaloop.test`,
      password: "fixture-password",
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await mockLeaderboard(page, "e2e-own-user");
    await page.goto("/ranking");
    // Cada fila se renderiza dos veces (variante mobile + desktop,
    // ocultas por CSS según el breakpoint) — "attached" basta para
    // saber que los datos ya cargaron, sin importar cuál es visible.
    await page.getByText("Marta R.").first().waitFor({ state: "attached" });
    await page.waitForFunction(() => document.fonts.status === "loaded");

    await expect(page).toHaveScreenshot("ranking-05-desktop.png", {
      animations: "disabled",
      fullPage: true,
    });
  });

  test("si el usuario no está en la página visible, muestra el bloque fijo de su posición", async ({
    page,
  }) => {
    await signUp(page, {
      username: "Fixture sin posicion",
      email: `e2e-ranking-sinpos-${Date.now()}@cinemaloop.test`,
      password: "fixture-password",
    });
    await page.setViewportSize({ width: 390, height: 900 });
    // ownUserId null: "Tú" en los datos de ejemplo no coincide con
    // ningún userId real, así que "propia" queda fuera de la página.
    await mockLeaderboard(page, null);
    await page.route("**/getLeaderboard", (route) =>
      route.fulfill({
        json: {
          result: {
            pagina: 0,
            entradas: NAMES.map((nombre, i) => ({
              posicion: i + 1,
              userId: `u${i}`,
              nombre_usuario: nombre,
              puntuacion: SCORES[i],
              nodos_alcanzados: CHAINS[i],
              tiempo_medio_respuesta: TIMES[i],
              tiempo_total: TIMES[i] * CHAINS[i],
              fecha: "2026-08-18T00:00:00.000Z",
            })),
            propia: {
              posicion: 87,
              userId: "e2e-own-user-not-in-page",
              nombre_usuario: "Yo",
              puntuacion: 900,
              nodos_alcanzados: 4,
              tiempo_medio_respuesta: 6.2,
              tiempo_total: 24.8,
              fecha: "2026-08-18T00:00:00.000Z",
            },
          },
        },
      }),
    );

    await page.goto("/ranking");

    await expect(page.getByText("Tu posición")).toBeVisible();
    await expect(page.getByText("Yo").first()).toBeVisible();
  });

  test("el botón de volver lleva a /inicio", async ({ page }) => {
    await signUp(page, {
      username: "Fixture volver",
      email: `e2e-ranking-volver-${Date.now()}@cinemaloop.test`,
      password: "fixture-password",
    });
    await mockLeaderboard(page, null);
    await page.goto("/ranking");
    // Cada fila se renderiza dos veces (variante mobile + desktop,
    // ocultas por CSS según el breakpoint) — "attached" basta para
    // saber que los datos ya cargaron, sin importar cuál es visible.
    await page.getByText("Marta R.").first().waitFor({ state: "attached" });

    await page.getByRole("link", { name: "Volver" }).click();

    await page.waitForURL("/inicio");
  });
});
