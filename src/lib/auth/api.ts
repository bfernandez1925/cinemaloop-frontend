import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

/**
 * Escritura explícita del nombre de usuario en `users/{uid}` (CIN-64).
 * Se llama justo después de `updateProfile` en el registro: el trigger
 * `onUserCreated` puede correr antes, después o en medio de esas dos
 * llamadas, y `updateProfile` no toca Firestore — esta es la única
 * escritura determinista de `nombre_usuario` independiente de esa carrera.
 */
export function updateUsername(nombreUsuario: string): Promise<void> {
  return httpsCallable<{ nombre_usuario: string }, void>(
    functions,
    "updateUsername",
  )({ nombre_usuario: nombreUsuario }).then(() => undefined);
}
