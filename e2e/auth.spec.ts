import { expect, test } from "@playwright/test";
import { signUp } from "./helpers/signUp";

// Criterios de aceptación de CIN-15 que involucran el Auth Emulator (ver
// playwright.config.ts): bloqueo de pantallas de juego sin sesión, y
// registro real de extremo a extremo. El manejo de errores de Firebase
// Auth en el formulario se cubre a nivel de componente en
// test/unit/AuthModal.test.tsx (credenciales inválidas, email en uso...),
// sin necesidad de repetirlo aquí contra el emulador.
test.describe("autenticación", () => {
  test("no es posible navegar a /modos sin sesión: redirige a la landing", async ({ page }) => {
    await page.goto("/modos");

    await page.waitForURL("/");
    await expect(page.getByRole("heading", { name: "CinemaLoop" })).toBeVisible();
  });

  test("registrarse con email/contraseña lleva a la pantalla de selección de modo", async ({
    page,
  }) => {
    await signUp(page, {
      username: "Jugador E2E",
      email: `e2e-signup-${Date.now()}@cinemaloop.test`,
      password: "password123",
    });

    await expect(page.getByRole("heading", { name: "Elige tu modo" })).toBeVisible();
  });
});
