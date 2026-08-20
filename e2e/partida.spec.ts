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
});
