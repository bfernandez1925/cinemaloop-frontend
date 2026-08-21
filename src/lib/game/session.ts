import type { GameMode, GameNode } from "@/lib/game/types";

// Export estático sin servidor (ADR-0007): no hay forma de pasar el
// gameId/nodo inicial entre /modos y /partida vía props de servidor, así
// que viaja en sessionStorage — efímero a propósito (perder la partida
// al refrescar la pestaña es una simplificación aceptada para el MVP).
export const ACTIVE_GAME_SESSION_KEY = "cinemaloop:activeGame";

// `modo` viaja aquí (no lo devuelve startGame) porque el propio
// frontend ya lo conoce al pedir la partida — decide el comportamiento
// del temporizador en /partida (CIN-62: por turno en Clásico/Infantil,
// de partida completa en Contrarreloj, sin temporizador en Maratón).
export type ActiveGameSession = { gameId: string; modo: GameMode; nodoActual: GameNode };

export function readActiveGameSession(): ActiveGameSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(ACTIVE_GAME_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ActiveGameSession;
  } catch {
    return null;
  }
}

export function clearActiveGameSession(): void {
  window.sessionStorage.removeItem(ACTIVE_GAME_SESSION_KEY);
}
