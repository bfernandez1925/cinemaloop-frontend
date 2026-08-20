import { FirebaseError } from "firebase/app";
import { describe, expect, it } from "vitest";
import { getAuthErrorMessage } from "@/lib/auth/authErrors";

describe("getAuthErrorMessage", () => {
  it.each([
    ["auth/invalid-credential", "Email o contraseña incorrectos."],
    ["auth/email-already-in-use", "Ya existe una cuenta con ese email."],
    ["auth/weak-password", "La contraseña debe tener al menos 6 caracteres."],
  ])("mapea %s a un mensaje en español", (code, expected) => {
    expect(getAuthErrorMessage(new FirebaseError(code, "mensaje interno de Firebase"))).toBe(
      expected,
    );
  });

  it("devuelve un mensaje genérico para un código de Firebase no mapeado", () => {
    expect(getAuthErrorMessage(new FirebaseError("auth/algo-nuevo", "x"))).toBe(
      "Ha ocurrido un error. Inténtalo de nuevo.",
    );
  });

  it("devuelve un mensaje genérico si el error no es de Firebase", () => {
    expect(getAuthErrorMessage(new Error("boom"))).toBe(
      "Ha ocurrido un error. Inténtalo de nuevo.",
    );
  });
});
