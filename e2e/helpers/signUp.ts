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
  // El registro llama a updateUsername (Cloud Function, CIN-64) tras
  // crear la cuenta. Solo el Auth Emulator está levantado en e2e (ver
  // playwright.config.ts) — sin este mock, la llamada real a
  // cinemaloop-platform rechazaría el token del emulador y bloquearía
  // la navegación a /modos que depende de que el registro complete.
  await page.route("**/updateUsername", (route) => route.fulfill({ json: { result: null } }));

  await page.goto("/");
  // Desde CIN-51 la landing tiene el botón "Crear cuenta" tanto en el
  // hero como en la banda de CTA final — el primero basta para abrir el modal.
  await page.getByRole("button", { name: "Crear cuenta" }).first().click();

  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nombre de usuario").fill(username);
  await dialog.getByLabel("Email").fill(email);
  // exact: true — "Contraseña" es también substring del aria-label del
  // botón de mostrar/ocultar contraseña (CIN-65), getByLabel por
  // defecto haría match parcial de ambos.
  await dialog.getByLabel("Contraseña", { exact: true }).fill(password);
  await dialog.getByRole("button", { name: "Crear cuenta" }).click();

  await page.waitForURL("/modos");
}
