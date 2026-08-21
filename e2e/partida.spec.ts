import { expect, test, type Page } from "@playwright/test";
import { signUp } from "./helpers/signUp";

const ACTOR_NODE = {
  tipo: "actor",
  entidad_tmdb_id: 7,
  nombre: "Willem Dafoe",
  imagen: null,
  pais_origen: "Estados Unidos",
  anio_nacimiento: 1955,
};

const MOVIE_NODE = {
  tipo: "pelicula",
  entidad_tmdb_id: 100,
  nombre: "The Lighthouse",
  imagen: null,
};

// Congela Date.now() antes de que corra ningún script de la página, para
// que el anillo de temporizador (CIN-40) muestre siempre el mismo estado
// (círculo completo) en la captura — si no, el tiempo real transcurrido
// entre el goto() y el screenshot haría el test intermitente.
async function freezeClockAndInjectGame(
  page: Page,
  nodoActual: typeof ACTOR_NODE | typeof MOVIE_NODE,
) {
  // Se congela al instante real actual (no una fecha arbitraria): el
  // objetivo es solo que no avance entre el goto() y el screenshot, sin
  // arriesgarse a confundir la validez de los tokens de Firebase Auth
  // con un salto de reloj grande.
  const fixedNow = Date.now();
  await page.addInitScript(
    ({ now, session }) => {
      Date.now = () => now;
      window.sessionStorage.setItem(
        "cinemaloop:activeGame",
        JSON.stringify({ gameId: "e2e-fixture-game", nodoActual: session }),
      );
    },
    { now: fixedNow, session: nodoActual },
  );
}

// Comparación visual (CIN-41) contra los dos frames de handoff — "03a"
// (actor → película) y "03b" (película → actor) — en los dos
// breakpoints reales. Requiere sesión (RequireAuth): se registra un
// usuario de fixture y se inyecta el estado de partida directamente en
// sessionStorage (ver src/lib/game/session.ts) para no depender de un
// startGame real contra Firestore/TMDb, fuera del alcance de este test.
test.describe("pantalla de partida", () => {
  test("03a actor → película, mobile 390px", async ({ page }) => {
    await signUp(page, {
      username: "Fixture 03a",
      email: `e2e-partida-03a-mobile-${Date.now()}@cinemaloop.test`,
      password: "fixture-password",
    });
    await page.setViewportSize({ width: 390, height: 820 });
    await freezeClockAndInjectGame(page, ACTOR_NODE);
    await page.goto("/partida");
    await page.getByText("Willem Dafoe").waitFor();
    await page.waitForFunction(() => document.fonts.status === "loaded");

    await expect(page).toHaveScreenshot("partida-03a-mobile.png", { animations: "disabled" });
  });

  test("03a actor → película, desktop 1280px", async ({ page }) => {
    await signUp(page, {
      username: "Fixture 03a",
      email: `e2e-partida-03a-desktop-${Date.now()}@cinemaloop.test`,
      password: "fixture-password",
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await freezeClockAndInjectGame(page, ACTOR_NODE);
    await page.goto("/partida");
    await page.getByText("Willem Dafoe").waitFor();
    await page.waitForFunction(() => document.fonts.status === "loaded");

    await expect(page).toHaveScreenshot("partida-03a-desktop.png", { animations: "disabled" });
  });

  test("03b película → actor, mobile 390px", async ({ page }) => {
    await signUp(page, {
      username: "Fixture 03b",
      email: `e2e-partida-03b-mobile-${Date.now()}@cinemaloop.test`,
      password: "fixture-password",
    });
    await page.setViewportSize({ width: 390, height: 820 });
    await freezeClockAndInjectGame(page, MOVIE_NODE);
    await page.goto("/partida");
    await page.getByText("The Lighthouse").waitFor();
    await page.waitForFunction(() => document.fonts.status === "loaded");

    await expect(page).toHaveScreenshot("partida-03b-mobile.png", { animations: "disabled" });
  });

  test("03b película → actor, desktop 1280px", async ({ page }) => {
    await signUp(page, {
      username: "Fixture 03b",
      email: `e2e-partida-03b-desktop-${Date.now()}@cinemaloop.test`,
      password: "fixture-password",
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await freezeClockAndInjectGame(page, MOVIE_NODE);
    await page.goto("/partida");
    await page.getByText("The Lighthouse").waitFor();
    await page.waitForFunction(() => document.fonts.status === "loaded");

    await expect(page).toHaveScreenshot("partida-03b-desktop.png", { animations: "disabled" });
  });

  test("sin sesión activa (sessionStorage vacío), redirige a /modos", async ({ page }) => {
    await signUp(page, {
      username: "Sin partida",
      email: `e2e-partida-sin-sesion-${Date.now()}@cinemaloop.test`,
      password: "fixture-password",
    });

    await page.goto("/partida");

    await page.waitForURL("/modos");
  });

  // CIN-37: en un navegador real con Web Speech API (Chromium la expone,
  // aunque no en todos los navegadores — spec-voice-input.md), el botón
  // de micrófono se muestra habilitado, no como "próximamente".
  test("con soporte de Web Speech API, el botón de micrófono está habilitado", async ({ page }) => {
    await signUp(page, {
      username: "Fixture voz",
      email: `e2e-partida-voz-${Date.now()}@cinemaloop.test`,
      password: "fixture-password",
    });
    await freezeClockAndInjectGame(page, ACTOR_NODE);
    await page.goto("/partida");
    await page.getByText("Willem Dafoe").waitFor();

    await expect(page.getByRole("button", { name: "Responder por voz" })).toBeEnabled();
  });
});

// Comparación visual (CIN-43) contra el frame "04 · Fin de partida" del
// handoff. submitAnswer/finishGame se interceptan a nivel de red (el
// build de e2e no conecta el emulador de Functions, solo el de Auth —
// ver playwright.config.ts) en vez de mockear el módulo, para ejercitar
// el mismo camino real de PartidaContent que usa un usuario de verdad.
async function reachGameOver(page: Page) {
  await page.route("**/submitAnswer", (route) =>
    route.fulfill({ json: { result: { correcto: false, puntuacion_total: 480 } } }),
  );
  await page.route("**/finishGame", (route) =>
    route.fulfill({
      json: {
        result: {
          puntuacion_total: 480,
          nodos_alcanzados: 1,
          tiempo_total: 12,
          tiempo_medio_respuesta: 8.4,
        },
      },
    }),
  );
  await page.goto("/partida");
  await page.getByPlaceholder("Nombre de la película…").fill("Película que no existe");
  await page.getByPlaceholder("Nombre de la película…").press("Enter");
  await page.getByText("Partida terminada").waitFor();
}

test.describe("pantalla fin de partida", () => {
  test("04 fin de partida, mobile 390px", async ({ page }) => {
    await signUp(page, {
      username: "Fixture 04",
      email: `e2e-partida-04-mobile-${Date.now()}@cinemaloop.test`,
      password: "fixture-password",
    });
    await page.setViewportSize({ width: 390, height: 820 });
    await freezeClockAndInjectGame(page, ACTOR_NODE);
    await reachGameOver(page);
    await page.waitForFunction(() => document.fonts.status === "loaded");

    await expect(page).toHaveScreenshot("partida-04-mobile.png", { animations: "disabled" });
  });

  test("04 fin de partida, desktop 1280px", async ({ page }) => {
    await signUp(page, {
      username: "Fixture 04",
      email: `e2e-partida-04-desktop-${Date.now()}@cinemaloop.test`,
      password: "fixture-password",
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await freezeClockAndInjectGame(page, ACTOR_NODE);
    await reachGameOver(page);
    await page.waitForFunction(() => document.fonts.status === "loaded");

    await expect(page).toHaveScreenshot("partida-04-desktop.png", { animations: "disabled" });
  });

  test('"Enviar al ranking" envía la partida y deja solo "Volver a jugar"', async ({ page }) => {
    await signUp(page, {
      username: "Fixture ranking",
      email: `e2e-partida-04-ranking-${Date.now()}@cinemaloop.test`,
      password: "fixture-password",
    });
    await freezeClockAndInjectGame(page, ACTOR_NODE);
    await reachGameOver(page);
    await page.route("**/submitToLeaderboard", (route) =>
      route.fulfill({ json: { result: { ok: true } } }),
    );

    await page.getByRole("button", { name: "Enviar al ranking" }).click();

    await expect(page.getByRole("link", { name: "Volver a jugar" })).toBeVisible();
  });

  test('"Descartar" pide confirmación antes de borrar la partida', async ({ page }) => {
    await signUp(page, {
      username: "Fixture descartar",
      email: `e2e-partida-04-descartar-${Date.now()}@cinemaloop.test`,
      password: "fixture-password",
    });
    await freezeClockAndInjectGame(page, ACTOR_NODE);
    await reachGameOver(page);
    let discardCalled = false;
    await page.route("**/discardGame", (route) => {
      discardCalled = true;
      return route.fulfill({ json: { result: { ok: true } } });
    });

    await page.getByRole("button", { name: "Descartar" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(discardCalled).toBe(false);

    await page.getByRole("dialog").getByRole("button", { name: "Descartar" }).click();

    await expect(page.getByRole("link", { name: "Volver a jugar" })).toBeVisible();
    expect(discardCalled).toBe(true);
  });
});
