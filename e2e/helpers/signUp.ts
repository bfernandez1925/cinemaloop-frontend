import type { Page } from "@playwright/test";

/**
 * Registra un usuario nuevo contra el Auth Emulator vía la propia UI
 * (ver playwright.config.ts) y espera a que la app redirija a /modos.
 * Cada llamada necesita un email único: el emulador comparte estado
 * durante toda la ejecución de `npm run test:e2e`.
 */
export async function signUp(
  page: Page,
  { username, email, password }: { username: string; email: string; password: string },
) {
  await page.goto("/");
  // Desde CIN-51 la landing tiene el botón "Crear cuenta" tanto en el
  // hero como en la banda de CTA final — el primero basta para abrir el modal.
  await page.getByRole("button", { name: "Crear cuenta" }).first().click();

  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nombre de usuario").fill(username);
  await dialog.getByLabel("Email").fill(email);
  await dialog.getByLabel("Contraseña").fill(password);
  await dialog.getByRole("button", { name: "Crear cuenta" }).click();

  await page.waitForURL("/modos");
}
