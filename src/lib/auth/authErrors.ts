import { FirebaseError } from "firebase/app";

const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Email o contraseña incorrectos.",
  "auth/invalid-email": "El email no tiene un formato válido.",
  "auth/user-disabled": "Esta cuenta ha sido deshabilitada.",
  "auth/email-already-in-use": "Ya existe una cuenta con ese email.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/too-many-requests": "Demasiados intentos. Inténtalo de nuevo en unos minutos.",
  "auth/network-request-failed": "No se pudo conectar. Comprueba tu conexión a internet.",
};

const FALLBACK_MESSAGE = "Ha ocurrido un error. Inténtalo de nuevo.";

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return MESSAGES[error.code] ?? FALLBACK_MESSAGE;
  }
  return FALLBACK_MESSAGE;
}
